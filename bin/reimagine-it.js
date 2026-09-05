#!/usr/bin/env node
/**
 * reimagine-it standalone CLI.
 *
 * Reads HTML, extracts source signals, and writes a token-specific redesign.
 * The core engine is dependency-free; `-o -` makes it safe to compose in a
 * Unix pipeline without mixing progress output into the generated HTML.
 *
 * Four entry points share one engine:
 *   (default)    generate one direction, or --auto to choose one
 *   variations   generate several directions plus a contrast sheet
 *   lock         capture a shipped design's surface as reusable data
 *   audit        run Design Health against any HTML file
 */

const fs = require('fs');
const path = require('path');
const { extractContent, paletteSystem } = require('../src/extract');
const { generate, TOKENS, TOKEN_DESCRIPTIONS, voiceFor } = require('../src/generate');
const { buildPlan, autoGenerate, qualityScore } = require('../src/auto');
const { sourceFidelity } = require('../src/result');
const { auditHtml, formatReport, exitCodeFor, RULES } = require('../src/audit');
const { extractLock, readLock, applyLock, formatLock, LOCK_VERSION } = require('../src/lock');
const { buildVariations, contrastSheet, MAX_VARIATIONS } = require('../src/variations');

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const COMMANDS = ['audit', 'lock', 'variations', 'extract', 'mcp'];
const args = parseArgs(process.argv.slice(2));

if (args.error) fail(args.error, 2);
if (args.help) showHelp();
if (args.list) showList();
if (args.version) {
  console.log(`reimagine-it v${require('../package.json').version}`);
  process.exit(0);
}
if (args.rules) showRules();

// The MCP server is a long-running stdio process. spawnSync blocks this
// process for the server's lifetime — and guarantees nothing after this
// branch (stdin reads, generation) ever runs in server mode.
if (args.command === 'mcp') {
  const serverPath = path.join(__dirname, '..', 'mcp', 'server.js');
  const handedOff = require('child_process').spawnSync(process.execPath, [serverPath], { stdio: 'inherit' });
  process.exit(handedOff.status === null ? 1 : handedOff.status);
}

if (args.command === 'audit') runAudit();

const requestedToken = args.token || (args.auto ? 'auto' : 'webpage');
const autoMode = args.auto || requestedToken === 'auto';
if (!autoMode && args.command !== 'lock' && args.command !== 'variations' && !TOKENS.includes(requestedToken)) {
  fail(`unknown token "${requestedToken}". Use --list to see available tokens.`, 2);
}

const outputToStdout = args.output === '-' || args.stdout;
const candidateCount = args.candidates === undefined ? (autoMode ? 3 : 1) : args.candidates;
const source = readSource();
const inputPath = source.path;

if (args.command === 'lock') runLock();

const rawContent = extractContent(source.text, inputPath);
const lock = args.ref === undefined ? null : loadLock(args.ref);
const lockApplied = lock ? applyLock(rawContent, lock) : null;
const content = lockApplied ? lockApplied.content : rawContent;
const lockedVoice = lockApplied ? lockApplied.voice : null;

if (args.json) {
  const payload = autoMode ? { content, auto: buildPlan(content) } : content;
  if (lock) payload.lock = { name: lock.name, signature: lock.signature, applied: lockApplied.applied };
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

if (args.dry) {
  printDryRun(content, inputPath, autoMode);
  process.exit(0);
}

if (args.command === 'variations') runVariations();

if (args.command === 'extract') runExtract();

const seed = args.seed === undefined ? undefined : Number(args.seed);
let token = requestedToken;
let output;
let autoResult;
if (autoMode) {
  autoResult = autoGenerate(content, {
    seed,
    brief: args.brief,
    candidates: candidateCount,
    webFonts: args.webFonts,
    plan: args.plan ? JSON.parse(args.plan) : (lockedVoice ? { voice: lockedVoice } : undefined),
  });
  token = autoResult.token;
  output = autoResult.output;
} else {
  output = generate({
    content,
    token,
    seed,
    brief: args.brief,
    webFonts: args.webFonts,
    voice: args.voice || lockedVoice || undefined,
  });
}

const fidelity = sourceFidelity(content, output);

// Design decision report: what the engine chose and why (the trust story).
const designMeta = {
  mode: autoMode ? 'auto' : 'manual',
  title: content.title,
  token,
  seed: autoMode ? autoResult.seed : seed,
  voice: autoMode ? autoResult.voice : (args.voice || lockedVoice || voiceFor(content.profile, seed, args.brief)),
  palette: Object.assign({}, content.palette, paletteSystem(content.palette, autoMode ? autoResult.seed : seed)),
  quality: autoMode
    ? { score: autoResult.design.quality, checks: autoResult.design.checks }
    : qualityScore(output, content, { webFonts: args.webFonts }),
  fidelity: fidelity.percentage,
  harmony: paletteSystem(content.palette, autoMode ? autoResult.seed : seed).harmony,
};
if (lock) {
  designMeta.lock = {
    name: lock.name,
    signature: lock.signature,
    source: lock.source,
    applied: lockApplied.applied,
  };
}

if (args.diff) {
  printDiff(content, output, token, inputPath, fidelity, autoResult);
  process.exit(0);
}

if (outputToStdout) {
  process.stderr.write(`reimagine-it → ${token} · ${path.basename(inputPath)}\n`);
  process.stdout.write(output);
  process.exit(0);
}

const defaultOutputName = autoMode ? 'auto.html' : `${token}.html`;
const outputPath = path.resolve(args.output || path.join('reimagined', defaultOutputName));
try {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, 'utf8');
  if (args.emit) {
    const dir = path.dirname(outputPath);
    fs.writeFileSync(path.join(dir, 'design-token.json'), JSON.stringify(designMeta, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'quality-report.json'), JSON.stringify({ quality: designMeta.quality, fidelity: fidelity.percentage, harmony: designMeta.harmony }, null, 2), 'utf8');
  }
} catch (error) {
  fail(`could not write output: ${error.message}`, 2);
}

let designHealth = null;
if (args.audit) {
  designHealth = auditHtml(output, { path: path.basename(outputPath), allowFetch: !!args.webFonts });
  if (args.emit) {
    fs.writeFileSync(path.join(path.dirname(outputPath), 'design-health.json'), JSON.stringify(designHealth, null, 2), 'utf8');
  }
}

if (!args.quiet) {
  console.log(`\n  reimagine-it → ${token} · ${path.basename(inputPath)}`);
  console.log(`  Palette: ${content.palette.ground} · ${content.palette.accent} · ${content.palette.muted}`);
  console.log(`  Anchors: ${content.anchors.slice(0, 3).join(' · ')}`);
  if (lock) {
    console.log(`  Lock:    ${lock.name} · signature ${lock.signature} · ${lockApplied.applied.length} field(s) applied`);
  }
  if (autoResult) {
    console.log(`  Auto:    ${autoResult.rationale}`);
    console.log(`  Draw:    ${autoResult.token} · seed ${autoResult.seed} · score ${autoResult.score}`);
    console.log(`  Reviewed: ${autoResult.candidates.length} candidate directions`);
  }
  console.log(`  Voice:   ${designMeta.voice} · harmony ${designMeta.harmony}`);
  console.log(`  Quality: ${designMeta.quality.score} · ${designMeta.quality.checks.filter((c) => !c.passed).map((c) => c.name).join(', ') || 'all checks passed'}`);
  if (designHealth) {
    console.log(`  Health:  ${designHealth.verdict} · ${designHealth.passed}/${designHealth.rules} rules${designHealth.findings.length ? ' · ' + designHealth.findings.map((f) => f.code).join(', ') : ''}`);
  }
  console.log(`  Output:  ${outputPath}`);
  console.log(`  Size:    ${(output.length / 1024).toFixed(1)} KB`);
  console.log(`  Fidelity: ${fidelity.percentage}% of detected source facts preserved`);
  console.log('\n  REIMAGINED: shipped ✓\n');
}

// A generated artifact that fails its own craft floor is a defect, so --audit
// reports it with a distinct exit code rather than a silent warning.
if (designHealth && designHealth.failures > 0) process.exit(3);

// ── Subcommands ───────────────────────────────────────────────────────────

function runAudit() {
  const target = args.input || args.positional;
  let html;
  let label;
  if (!target || target === '-') {
    if (process.stdin.isTTY) fail('audit needs a file. Try: reimagine-it audit page.html', 2);
    html = fs.readFileSync(0, 'utf8');
    label = 'stdin.html';
  } else {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      fail(`file not found: ${resolved}`, 2);
    }
    html = fs.readFileSync(resolved, 'utf8');
    label = path.relative(process.cwd(), resolved).replace(/\\/g, '/');
  }
  const report = auditHtml(html, {
    path: label,
    allowFetch: !!args.allowFetch,
  });
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report, { verbose: !!args.verbose, color: process.stdout.isTTY }));
  }
  process.exit(exitCodeFor(report));
}

function runLock() {
  const name = args.name || path.basename(inputPath).replace(/\.[^.]+$/, '');
  let lockData;
  try {
    lockData = extractLock(source.text, { name, source: path.basename(inputPath) });
  } catch (error) {
    fail(`could not capture a lock: ${error.message}`, 1);
  }
  const serialised = JSON.stringify(lockData, null, 2);

  if (args.output === '-' || args.stdout || args.json) {
    process.stdout.write(serialised + '\n');
    process.exit(0);
  }

  const target = path.resolve(args.output || `${name}.lock.json`);
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, serialised + '\n', 'utf8');
  } catch (error) {
    fail(`could not write lock: ${error.message}`, 2);
  }

  if (!args.quiet) {
    console.log(`\n  reimagine-it lock → ${path.basename(inputPath)}\n`);
    console.log(formatLock(lockData));
    console.log(`  Written:   ${target}`);
    console.log(`\n  Reuse it:  npx reimagine-it -i your-page.html --ref ${path.basename(target)} -o locked.html`);
    console.log('\n  LOCKED: captured ✓\n');
  }
  process.exit(0);
}

function runExtract() {
  // The honesty surface: exactly what the engine reads, nothing invented.
  // Bulky prose stays behind --full; facts and structure ship by default.
  const payload = {
    source: path.basename(inputPath),
    title: content.title,
    profile: content.profile,
    density: content.density,
    palette: content.palette,
    anchors: content.anchors,
    properNouns: content.properNouns,
    headings: content.headings,
    dates: content.dates,
    numbers: content.numbers,
    emails: content.emails,
    links: content.links,
    sourceHex: content.sourceHex,
    counts: {
      paragraphs: content.paragraphs.length,
      listItems: content.items.length,
    },
  };
  if (args.full) {
    payload.paragraphs = content.paragraphs;
    payload.items = content.items;
  }
  const serialised = JSON.stringify(payload, null, 2) + '\n';

  if (args.output === '-' || args.stdout) {
    process.stdout.write(serialised);
    process.exit(0);
  }

  const base = path.basename(inputPath).replace(/\.[^.]+$/, '');
  const target = path.resolve(args.output || `${base}.extract.json`);
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, serialised, 'utf8');
  } catch (error) {
    fail(`could not write extraction: ${error.message}`, 2);
  }

  if (!args.quiet && !args.json) {
    const p = content.palette;
    console.log(`\n  reimagine-it extract → ${path.basename(inputPath)}`);
    console.log(`  Title:   ${content.title}`);
    console.log(`  Profile: ${content.profile} · ${content.density}`);
    console.log(`  Palette: ${p.ground} · ${p.accent} · ${p.muted}`);
    console.log(`  Facts:   ${content.dates.length} dates · ${content.numbers.length} numbers · ${content.emails.length} emails · ${content.links.length} links`);
    console.log(`  Anchors: ${content.anchors.slice(0, 5).join(' · ')}${content.anchors.length > 5 ? ' …' : ''}`);
    console.log(`  Written: ${target}`);
    console.log('\n  EXTRACTED: captured ✓\n');
  }
  process.exit(0);
}

function runVariations() {
  const count = args.variations === undefined ? 3 : Number(args.variations);
  const result = buildVariations(content, {
    count,
    seed: args.seed === undefined ? undefined : Number(args.seed),
    brief: args.brief,
    voice: args.voice || lockedVoice || undefined,
    webFonts: args.webFonts,
  });

  const dir = path.resolve(args.output && args.output !== '-' ? args.output : path.join('reimagined', 'variations'));
  try {
    fs.mkdirSync(dir, { recursive: true });
    result.variations.forEach((entry) => {
      fs.writeFileSync(path.join(dir, entry.file), entry.output, 'utf8');
    });
    const sheet = contrastSheet(result, content, {
      source: path.basename(inputPath),
      command: `npx reimagine-it -i ${path.basename(inputPath)} --variations ${result.count} --seed ${result.seed}`,
    });
    fs.writeFileSync(path.join(dir, 'index.html'), sheet, 'utf8');
    fs.writeFileSync(path.join(dir, 'variations.json'), JSON.stringify({
      source: path.basename(inputPath),
      title: content.title,
      seed: result.seed,
      count: result.count,
      lock: lock ? { name: lock.name, signature: lock.signature } : null,
      variations: result.variations.map((entry) => ({
        rank: entry.rank,
        token: entry.token,
        file: entry.file,
        seed: entry.seed,
        voice: entry.voice,
        fit: entry.fit,
        quality: entry.quality,
        fidelity: entry.fidelity,
        bytes: entry.bytes,
        failedChecks: entry.failed,
      })),
    }, null, 2) + '\n', 'utf8');
  } catch (error) {
    fail(`could not write variations: ${error.message}`, 2);
  }

  if (!args.quiet) {
    console.log(`\n  reimagine-it variations → ${result.count} directions · ${path.basename(inputPath)}`);
    console.log(`  Seed:    ${result.seed} (pass --seed ${result.seed} to reproduce this set)`);
    if (lock) console.log(`  Lock:    ${lock.name} · signature ${lock.signature}`);
    console.log('');
    console.log('  rank  direction     quality  fidelity  voice          file');
    result.variations.forEach((entry) => {
      console.log(
        `  ${String(entry.rank).padEnd(5)} ${entry.token.padEnd(13)} ${String(entry.quality).padEnd(8)} ` +
        `${(entry.fidelity + '%').padEnd(9)} ${entry.voice.padEnd(14)} ${entry.file}`
      );
    });
    console.log(`\n  Sheet:   ${path.join(dir, 'index.html')}`);
    console.log(`  Report:  ${path.join(dir, 'variations.json')}`);
    console.log('\n  VARIATIONS: shipped ✓\n');
  }
  process.exit(0);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function readSource() {
  try {
    const requested = args.input || (args.command ? args.positional : undefined);
    if (requested && requested !== '-') {
      const resolved = path.resolve(requested);
      const stat = fs.statSync(resolved);
      if (!stat.isFile()) fail(`input is not a file: ${resolved}`, 2);
      if (stat.size > MAX_INPUT_BYTES) fail(`input is larger than 10 MB: ${resolved}`, 2);
      return { text: fs.readFileSync(resolved, 'utf8'), path: resolved };
    }
    if (requested === '-' || !process.stdin.isTTY) {
      return { text: fs.readFileSync(0, 'utf8'), path: 'stdin.html' };
    }
    fail('an input file is required. Pass --input <file> or pipe HTML via stdin.', 2);
  } catch (error) {
    if (error && error.code === 'ENOENT') fail(`could not read input: ${error.message}`, 2);
    fail(`could not read input: ${error.message}`, 2);
  }
  return { text: '', path: 'stdin.html' };
}

function loadLock(reference) {
  const resolved = path.resolve(reference);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    fail(`--ref file not found: ${resolved}`, 2);
  }
  const body = fs.readFileSync(resolved, 'utf8');
  // A reference can be a saved lock or any shipped HTML page. Reading HTML
  // directly is reverse-lock: capture the surface, then use it immediately.
  if (/\.json$/i.test(resolved) || /^\s*\{/.test(body)) {
    try {
      return readLock(body, resolved);
    } catch (error) {
      fail(`--ref is not a valid lock file (v${LOCK_VERSION}): ${error.message}`, 2);
    }
  }
  try {
    return extractLock(body, {
      name: path.basename(resolved).replace(/\.[^.]+$/, ''),
      source: path.basename(resolved),
    });
  } catch (error) {
    fail(`could not read a design lock from ${resolved}: ${error.message}`, 2);
  }
  return null;
}

function printDiff(content, output, token, inputPath, fidelity, autoResult) {
  const p = content.palette;
  const art = (output.match(/glyph-tile/g) || []).length + ' glyphs · ' +
    (output.match(/donut-chart|donut-keys/g) || []).length + ' donut · ' +
    (output.match(/iso-prism|iso-stack/g) || []).length + ' prism/stack · ' +
    (output.match(/data-wash/g) || []).length + ' data-wash';
  const before = Math.round((content.paragraphs.join(' ').length + content.items.join(' ').length) / 4);
  const after = Math.round(output.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length / 4);
  console.log(`\n  Before → After — ${path.basename(inputPath)}`);
  console.log(`  Direction:   ${token}${autoResult ? ` (Auto · seed ${autoResult.seed} · score ${autoResult.score})` : ''}`);
  console.log(`  Voice:       ${autoResult ? autoResult.voice : voiceFor(content.profile, args.seed, args.brief)}`);
  console.log(`  Palette:     ${p.ground} → ${p.accent} → ${p.muted} (ground → accent → muted)`);
  if (lock) console.log(`  Lock:        ${lock.name} · ${lockApplied.applied.join(', ')}`);
  console.log(`  Anchors:     ${content.anchors.slice(0, 3).join(' · ')}${content.anchors.length > 3 ? ' …' : ''}`);
  console.log(`  Numbers:     ${content.numbers.slice(0, 3).join(' · ') || '(none)'}${content.numbers.length > 3 ? ' …' : ''}`);
  console.log(`  Art:         ${art}`);
  console.log(`  Fidelity:    ${fidelity.percentage}% of ${fidelity.detected} detected source facts preserved`);
  console.log(`  Size:        ${before} words source → ${after} words rendered · ${(output.length / 1024).toFixed(1)} KB HTML`);
  console.log(`  Reduced:     ${output.indexOf('prefers-reduced-motion') >= 0 ? 'yes' : 'no'} · Focus-visible: ${output.indexOf('focus-visible') >= 0 ? 'yes' : 'no'}`);
  console.log('  No source file was modified.\n');
}

function printDryRun(content, inputPath, auto) {
  const p = content.palette;
  console.log(`\n  Content extraction — ${path.basename(inputPath)}\n`);
  console.log(`  Title:        ${content.title || '(none)'}`);
  console.log('  Palette:');
  console.log(`    ground  ${p.ground}  ████`);
  console.log(`    accent  ${p.accent}  ████`);
  console.log(`    muted   ${p.muted}  ████`);
  console.log(`    surface ${p.surface}  ████`);
  console.log(`    ink     ${p.ink}  ████`);
  console.log(`  Profile:      ${content.profile} · ${content.density}`);
  console.log(`  Headings:     ${content.headings.length} found`);
  if (content.headings.length) console.log(`    ${content.headings.slice(0, 3).join(' · ')}`);
  console.log(`  Paragraphs:   ${content.paragraphs.length}`);
  console.log(`  List items:   ${content.items.length}`);
  console.log(`  Links:        ${content.links.length}`);
  console.log(`  Anchors:      ${content.anchors.join(', ')}`);
  console.log(`  Proper nouns: ${content.properNouns.slice(0, 6).join(', ')}${content.properNouns.length > 6 ? '...' : ''}`);
  console.log(`  Dates:        ${content.dates.slice(0, 4).join(', ')}${content.dates.length > 4 ? '...' : ''}`);
  console.log(`  Numbers:      ${content.numbers.slice(0, 4).join(', ')}${content.numbers.length > 4 ? '...' : ''}`);
  console.log(`  Emails:       ${content.emails.join(', ') || '(none)'}`);
  if (content.sourceHex.length) console.log(`  Source hex:   ${content.sourceHex.join(', ')}`);
  if (lock) {
    console.log(`  Lock:         ${lock.name} · signature ${lock.signature}`);
    console.log(`  Locked:       ${lockApplied.applied.join(', ')}`);
  }
  if (auto) {
    const autoPlan = buildPlan(content, { candidates: 3 });
    console.log(`\n  Design Auto recommendation: ${autoPlan.recommendation}`);
    console.log(`  Why: ${autoPlan.rationale}`);
    console.log(`  Candidates: ${autoPlan.candidates.map((candidate) => `${candidate.token} (${candidate.score})`).join(' · ')}`);
    console.log('  Auto never edits the source; it selects a direction for review.');
  }
  console.log('\n  Run with -t <token> to generate. Use --auto to choose automatically.\n');
}

function showRules() {
  console.log('Design Health rules — deterministic, no LLM, no network:\n');
  RULES.forEach((rule) => {
    console.log(`  ${rule.code.padEnd(9)} ${rule.category.padEnd(13)} ${rule.severity.padEnd(8)} ${rule.title}`);
  });
  console.log(`\n${RULES.length} rules. Run: npx reimagine-it audit page.html --verbose\n`);
  process.exit(0);
}

function showHelp() {
  const tokenLines = TOKENS.concat('auto').map((name) => `  ${name.padEnd(14)} ${name === 'auto' ? 'Choose, generate, verify, and explain' : TOKEN_DESCRIPTIONS[name]}`).join('\n');
  console.log(`
reimagine-it — Content-Derived Design CLI

Reads an HTML file and redesigns it from its own content. Source facts stay
source facts; visual variation changes the composition, not the meaning.

Usage:
  npx reimagine-it [options]
  npx reimagine-it --auto -i page.html -o redesign.html
  npx reimagine-it variations -i page.html -n 4 -o review/
  npx reimagine-it lock -i brand.html -o brand.lock.json
  npx reimagine-it audit redesign.html
  npx reimagine-it extract -i page.html -o signals.json
  cat page.html | npx reimagine-it -t webpage -o - > output.html

Commands:
  (default)               Generate one direction from the source content
  variations              Generate several directions plus a contrast sheet
  lock                    Capture a shipped design's surface as reusable data
  audit                   Run Design Health (${RULES.length} rules) on an HTML file
  extract                 Emit the extracted content signals as JSON (no redesign)
  mcp                     Run the MCP server (Model Context Protocol, stdio)

Options:
  --input, -i <path>      Source HTML file, or - for stdin
  --token, -t <name>      Design token (default: webpage)
  --output, -o <path>     Output file, or directory for variations
                          Use - for generated HTML on stdout
  --stdout                Write generated HTML to stdout
  --seed, -s <n>          Pin creative variation for reproducibility
  --brief, -b <text>      Creative lens for the redesign
  --auto, -a              Generate up to three verified directions and choose the strongest
  --candidates <n>        Evaluate 1–3 directions in Auto mode (default: 3)
  --variations, -n <n>    Generate 2–${MAX_VARIATIONS} directions side by side with a contrast sheet
  --ref <path>            Brand-lock the surface to a .lock.json file, or to any
                          HTML page (reverse-lock). Structure stays content-derived.
  --name <text>           Lock name when running the lock command
  --web-fonts             Opt in to Google Fonts for the chosen typographic voice
                          (default output is fully offline)
  --voice <name>          Force a typographic voice: editorial, grotesque, techno,
                          serifClassic, highContrast, expressive, monoForward
  --plan <json>           Model-harness plan override: {"token":"landing","voice":"grotesque"}
  --emit                  Also write design-token.json + quality-report.json next to output
  --audit                 Run Design Health on the generated page (exit 3 on failures)
  --dry, -d               Show extracted signals; do not generate
  --full                  Include paragraphs and list items in extract output
  --diff                  Generate and print a before/after summary (palette, art, fidelity)
  --json                  Machine-readable output for the chosen command
  --verbose               Per-rule breakdown (audit command)
  --allow-fetch           Permit external font fetches when auditing
  --rules                 List the Design Health rule registry
  --list, -l              List all available design tokens
  --quiet, -q             Suppress progress output when writing a file
  --version, -v           Show version
  --help, -h              Show this help

Tokens:
${tokenLines}

Examples:
  npx reimagine-it --auto -i before.html -o redesign.html
  npx reimagine-it -i before.html -t webpage -o redesign.html
  npx reimagine-it -i menu.html -t landing -b "quiet evening service"
  npx reimagine-it variations -i before.html -n 4 -o review/ --seed 42
  npx reimagine-it lock -i house-style.html -o house.lock.json
  npx reimagine-it extract -i article.html -o signals.json
  cat page.html | npx reimagine-it extract -o - | jq .anchors
  npx reimagine-it -i my-page.html --ref house.lock.json -t landing -o on-brand.html
  npx reimagine-it -i my-page.html --ref https-saved-competitor.html --auto -o study.html
  npx reimagine-it audit redesign.html --verbose
  npx reimagine-it -i source.html --auto --audit -o checked.html
  cat page.html | npx reimagine-it -t svg -o - > mark.html
  npx reimagine-it --list

Learn more: https://kayforkind.github.io/reimagine-it/
`);
  process.exit(0);
}

function showList() {
  console.log('Available design directions:\n');
  TOKENS.forEach((name) => console.log(`  ${name.padEnd(14)} ${TOKEN_DESCRIPTIONS[name]}`));
  console.log(`  ${'auto'.padEnd(14)} Choose, generate, verify, and explain`);
  console.log('\nUsage: npx reimagine-it -i <file> -t <token>\n       npx reimagine-it -i <file> --auto\n       npx reimagine-it variations -i <file> -n 4\n');
  process.exit(0);
}

function fail(message, code) {
  console.error(`Error: ${message}`);
  process.exit(code || 1);
}

function parseArgs(raw) {
  const opts = {};
  if (raw.length && COMMANDS.includes(raw[0])) {
    opts.command = raw[0];
    raw = raw.slice(1);
  }
  const valueFlags = new Set(['-i', '--input', '-t', '--token', '-o', '--output', '-s', '--seed', '-b', '--brief', '--candidates', '--voice', '--plan', '--ref', '--name', '-n', '--variations']);
  const aliases = {
    '-i': 'input', '--input': 'input',
    '-t': 'token', '--token': 'token',
    '-o': 'output', '--output': 'output',
    '-s': 'seed', '--seed': 'seed',
    '-b': 'brief', '--brief': 'brief',
    '--candidates': 'candidates',
    '--voice': 'voice', '--plan': 'plan',
    '--ref': 'ref', '--name': 'name',
    '-n': 'variations', '--variations': 'variations',
  };
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i];
    if (valueFlags.has(arg)) {
      const value = raw[++i];
      if (value === undefined || (value.startsWith('-') && arg !== '--brief' && arg !== '-s' && arg !== '--seed' && value !== '-')) {
        return { error: `${arg} expects a value` };
      }
      opts[aliases[arg]] = value;
      continue;
    }
    switch (arg) {
      case '-d': case '--dry': opts.dry = true; break;
      case '--full': opts.full = true; break;
      case '--diff': opts.diff = true; break;
      case '--web-fonts': opts.webFonts = true; break;
      case '--emit': opts.emit = true; break;
      case '--json': opts.json = true; break;
      case '--stdout': opts.stdout = true; break;
      case '--audit': opts.audit = true; break;
      case '--verbose': opts.verbose = true; break;
      case '--allow-fetch': opts.allowFetch = true; break;
      case '--rules': opts.rules = true; break;
      case '-q': case '--quiet': opts.quiet = true; break;
      case '-l': case '--list': opts.list = true; break;
      case '-a': case '--auto': opts.auto = true; break;
      case '-v': case '--version': opts.version = true; break;
      case '-h': case '--help': opts.help = true; break;
      default:
        // A command may take one bare path so `audit page.html` reads naturally.
        // A lone "-" is the conventional stdin marker, not an unknown flag.
        if (opts.command && opts.positional === undefined && (arg === '-' || !arg.startsWith('-'))) {
          opts.positional = arg;
          break;
        }
        return { error: `unknown option "${arg}". Use --help for usage.` };
    }
  }
  if (opts.seed !== undefined && (!/^-?\d+$/.test(String(opts.seed)) || !Number.isSafeInteger(Number(opts.seed)))) {
    return { error: '--seed must be a safe integer' };
  }
  if (opts.candidates !== undefined && (!/^\d+$/.test(String(opts.candidates)) || Number(opts.candidates) < 1 || Number(opts.candidates) > 3)) {
    return { error: '--candidates must be an integer from 1 to 3' };
  }
  if (opts.candidates !== undefined) opts.candidates = Number(opts.candidates);
  if (opts.variations !== undefined) {
    if (!/^\d+$/.test(String(opts.variations)) || Number(opts.variations) < 2 || Number(opts.variations) > MAX_VARIATIONS) {
      return { error: `--variations must be an integer from 2 to ${MAX_VARIATIONS}` };
    }
    opts.variations = Number(opts.variations);
    opts.command = opts.command || 'variations';
  }
  if (opts.command === 'variations' && opts.variations === undefined && opts.positional !== undefined) {
    // `variations 4` reads as a count, not a path.
    if (/^\d+$/.test(opts.positional)) {
      const count = Number(opts.positional);
      if (count < 2 || count > MAX_VARIATIONS) {
        return { error: `--variations must be an integer from 2 to ${MAX_VARIATIONS}` };
      }
      opts.variations = count;
      opts.positional = undefined;
    }
  }
  return opts;
}
