#!/usr/bin/env node
/**
 * reimagine-it standalone CLI.
 *
 * Reads HTML, extracts source signals, and writes a token-specific redesign.
 * The core engine is dependency-free; `-o -` makes it safe to compose in a
 * Unix pipeline without mixing progress output into the generated HTML.
 */

const fs = require('fs');
const path = require('path');
const { extractContent } = require('../src/extract');
const { generate, TOKENS, TOKEN_DESCRIPTIONS } = require('../src/generate');
const { buildPlan, autoGenerate } = require('../src/auto');
const { sourceFidelity } = require('../src/result');

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const args = parseArgs(process.argv.slice(2));

if (args.error) fail(args.error, 2);
if (args.help) showHelp();
if (args.list) showList();
if (args.version) {
  console.log(`reimagine-it v${require('../package.json').version}`);
  process.exit(0);
}

const requestedToken = args.token || (args.auto ? 'auto' : 'webpage');
const autoMode = args.auto || requestedToken === 'auto';
if (!autoMode && !TOKENS.includes(requestedToken)) {
  fail(`unknown token "${requestedToken}". Use --list to see available tokens.`, 2);
}

const outputToStdout = args.output === '-' || args.stdout;
const candidateCount = args.candidates === undefined ? (autoMode ? 3 : 1) : args.candidates;
let source;
let inputPath;

try {
  if (args.input && args.input !== '-') {
    inputPath = path.resolve(args.input);
    const stat = fs.statSync(inputPath);
    if (!stat.isFile()) fail(`input is not a file: ${inputPath}`, 2);
    if (stat.size > MAX_INPUT_BYTES) fail(`input is larger than 10 MB: ${inputPath}`, 2);
    source = fs.readFileSync(inputPath, 'utf8');
  } else if (args.input === '-' || !process.stdin.isTTY) {
    source = fs.readFileSync(0, 'utf8');
    inputPath = 'stdin.html';
  } else {
    fail('an input file is required. Pass --input <file> or pipe HTML via stdin.', 2);
  }
} catch (error) {
  fail(`could not read input: ${error.message}`, 2);
}

const content = extractContent(source, inputPath);

if (args.json) {
  console.log(JSON.stringify(autoMode ? { content, auto: buildPlan(content) } : content, null, 2));
  process.exit(0);
}

if (args.dry) {
  printDryRun(content, inputPath, autoMode);
  process.exit(0);
}

const seed = args.seed === undefined ? undefined : Number(args.seed);
let token = requestedToken;
let output;
let autoResult;
if (autoMode) {
  autoResult = autoGenerate(content, { seed, brief: args.brief, candidates: candidateCount });
  token = autoResult.token;
  output = autoResult.output;
} else {
  output = generate({ content, token, seed, brief: args.brief });
}

const fidelity = sourceFidelity(content, output);

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
} catch (error) {
  fail(`could not write output: ${error.message}`, 2);
}

if (!args.quiet) {
  console.log(`\n  reimagine-it → ${token} · ${path.basename(inputPath)}`);
  console.log(`  Palette: ${content.palette.ground} · ${content.palette.accent} · ${content.palette.muted}`);
  console.log(`  Anchors: ${content.anchors.slice(0, 3).join(' · ')}`);
  if (autoResult) {
    console.log(`  Auto:    ${autoResult.rationale}`);
    console.log(`  Draw:    ${autoResult.token} · seed ${autoResult.seed} · score ${autoResult.score}`);
    console.log(`  Reviewed: ${autoResult.candidates.length} candidate directions`);
  }
  console.log(`  Output:  ${outputPath}`);
  console.log(`  Size:    ${(output.length / 1024).toFixed(1)} KB`);
  console.log(`  Fidelity: ${fidelity.percentage}% of detected source facts preserved`);
  console.log('\n  REIMAGINED: shipped ✓\n');
}

function printDiff(content, output, token, inputPath, fidelity, autoResult) {
  const p = content.palette;
  const art = (output.match(/glyph-tile/g) || []).length + ' glyphs · ' +
    (output.match(/donut-chart|donut-keys/g) || []).length + ' donut · ' +
    (output.match(/iso-prism/g) || []).length + ' prism';
  const before = Math.round((content.paragraphs.join(' ').length + content.items.join(' ').length) / 4);
  const after = Math.round(output.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length / 4);
  console.log(`\n  Before → After — ${path.basename(inputPath)}`);
  console.log(`  Direction:   ${token}${autoResult ? ` (Auto · seed ${autoResult.seed} · score ${autoResult.score})` : ''}`);
  console.log(`  Palette:     ${p.ground} → ${p.accent} → ${p.muted} (ground → accent → muted)`);
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
  if (auto) {
    const autoPlan = buildPlan(content, { candidates: 3 });
    console.log(`\n  Design Auto recommendation: ${autoPlan.recommendation}`);
    console.log(`  Why: ${autoPlan.rationale}`);
    console.log(`  Candidates: ${autoPlan.candidates.map((candidate) => `${candidate.token} (${candidate.score})`).join(' · ')}`);
    console.log('  Auto never edits the source; it selects a direction for review.');
  }
  console.log('\n  Run with -t <token> to generate. Use --auto to choose automatically.\n');
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
  cat page.html | npx reimagine-it -t webpage -o - > output.html

Options:
  --input, -i <path>      Source HTML file, or - for stdin
  --token, -t <name>      Design token (default: webpage)
  --output, -o <path>     Output file (default: reimagined/<token>.html)
                          Use - for generated HTML on stdout
  --stdout                Write generated HTML to stdout
  --seed, -s <n>          Pin creative variation for reproducibility
  --brief, -b <text>      Creative lens for the redesign
  --auto, -a              Generate up to three verified directions and choose the strongest
  --candidates <n>        Evaluate 1–3 directions in Auto mode (default: 3)
  --dry, -d               Show extracted signals; do not generate
  --diff                  Generate and print a before/after summary (palette, art, fidelity)
  --json                  Output extraction results as JSON
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
  npx reimagine-it -i source.html -t dashboard --dry
  npx reimagine-it -i source.html --auto --diff
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
  console.log('\nUsage: npx reimagine-it -i <file> -t <token>\n       npx reimagine-it -i <file> --auto\n');
  process.exit(0);
}

function fail(message, code) {
  console.error(`Error: ${message}`);
  process.exit(code || 1);
}

function parseArgs(raw) {
  const opts = {};
  const valueFlags = new Set(['-i', '--input', '-t', '--token', '-o', '--output', '-s', '--seed', '-b', '--brief', '--candidates']);
  const aliases = {
    '-i': 'input', '--input': 'input',
    '-t': 'token', '--token': 'token',
    '-o': 'output', '--output': 'output',
    '-s': 'seed', '--seed': 'seed',
    '-b': 'brief', '--brief': 'brief',
    '--candidates': 'candidates',
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
      case '--diff': opts.diff = true; break;
      case '--json': opts.json = true; break;
      case '--stdout': opts.stdout = true; break;
      case '-q': case '--quiet': opts.quiet = true; break;
      case '-l': case '--list': opts.list = true; break;
      case '-a': case '--auto': opts.auto = true; break;
      case '-v': case '--version': opts.version = true; break;
      case '-h': case '--help': opts.help = true; break;
      default: return { error: `unknown option "${arg}". Use --help for usage.` };
    }
  }
  if (opts.seed !== undefined && (!/^-?\d+$/.test(String(opts.seed)) || !Number.isSafeInteger(Number(opts.seed)))) {
    return { error: '--seed must be a safe integer' };
  }
  if (opts.candidates !== undefined && (!/^\d+$/.test(String(opts.candidates)) || Number(opts.candidates) < 1 || Number(opts.candidates) > 3)) {
    return { error: '--candidates must be an integer from 1 to 3' };
  }
  if (opts.candidates !== undefined) opts.candidates = Number(opts.candidates);
  return opts;
}
