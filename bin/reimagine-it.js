#!/usr/bin/env node
/**
 * reimagine-it standalone CLI
 * Content-Derived Design without an agent — reads HTML, extracts content,
 * derives palette/motif, generates a token-specific redesign.
 *
 * Usage:
 *   npx reimagine-it --input before.html --token webpage --output after.html
 *   npx reimagine-it --input source.html --token infographic
 *   npx reimagine-it --help
 */

const fs = require('fs');
const path = require('path');
const { extractContent } = require('../src/extract');
const { generate } = require('../src/generate');

const argv = parseArgs(process.argv.slice(2));

if (argv.help) {
  console.log(`
reimagine-it — Content-Derived Design CLI

Reads an HTML file and redesigns it from its own content.
Palette, motifs, and motion are derived from concrete nouns,
dates, and colors already in your source. Nothing is hard-coded.

Usage:
  npx reimagine-it [options]
  cat file.html | npx reimagine-it -t webpage > output.html

Options:
  --input, -i <path>      Source HTML file (or pipe via stdin)
  --token, -t <name>      Design token (default: webpage)
  --output, -o <path>     Output file (default: reimagined/<token>.html)
  --seed, -s <n>          Pin creative variation for reproducibility
  --brief, -b <text>      Creative lens for the redesign
  --dry, -d               Show what would be extracted, don't generate
  --json                  Output extraction results as JSON
  --list, -l              List all available design tokens
  --version, -v           Show version
  --help, -h              Show this help

Tokens:
  webpage        A real page from this file's nouns, dates, colors
  infographic    A paper poster of facts — not a fake dashboard
  dashboard      KPI cards with content-derived metrics
  artistic       Full-bleed canvas with mix-blend-mode typography
  cinematic      Full-viewport hero with scroll-driven sections
  photography    Folio grid with content-derived plates
  landing        Hero + features + CTA from the source
  svg            Inline living SVG with star/river/anchor motion
  3js            Canvas 3D cube with drag-to-rotate
  simulation     Playable timeline scrubber with year events

Examples:
  npx reimagine-it -i before.html -t infographic
  npx reimagine-it -i menu.html -t webpage -o menu-redesigned.html
  npx reimagine-it -i source.html -t dashboard --dry
  cat page.html | npx reimagine-it -t svg > output.html
  npx reimagine-it --list

Learn more: https://kayforkind.github.io/reimagine-it/
`);
  process.exit(0);
}

if (argv.list) {
  console.log(`Available design tokens:

  webpage        A real page from this file's nouns, dates, colors
  infographic    A paper poster of facts — not a fake dashboard
  dashboard      KPI cards with content-derived metrics
  artistic       Full-bleed canvas with mix-blend-mode typography
  cinematic      Full-viewport hero with scroll-driven sections
  photography    Folio grid with content-derived plates
  landing        Hero + features + CTA from the source
  svg            Inline living SVG with star/river/anchor motion
  3js            Canvas 3D cube with drag-to-rotate
  simulation     Playable timeline scrubber with year events

Usage: npx reimagine-it -i <file> -t <token>
`);
  process.exit(0);
}

if (argv.version) {
  const pkg = require('../package.json');
  console.log(`reimagine-it v${pkg.version}`);
  process.exit(0);
}

const token = argv.token || 'webpage';

let source, inputPath;

if (argv.input) {
  inputPath = path.resolve(argv.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: input file not found: ${inputPath}`);
    process.exit(1);
  }
  source = fs.readFileSync(inputPath, 'utf-8');
} else if (!process.stdin.isTTY) {
  // Read from stdin (piped input)
  source = fs.readFileSync(0, 'utf-8');
  inputPath = 'stdin.html';
} else {
  console.error('Error: --input is required (or pipe HTML via stdin). Use --help for usage.');
  process.exit(1);
}

// Phase 1: Extract
const content = extractContent(source, inputPath);

if (argv.json) {
  console.log(JSON.stringify(content, null, 2));
  process.exit(0);
}

if (argv.dry) {
  console.log(`\n  Content extraction \u2014 ${path.basename(inputPath)}\n`);
  var p = content.palette;
  console.log(`  Title:        ${content.title || '(none)'}`);
  console.log(`  Palette:`);
  console.log(`    ground  ${p.ground}  \u2588\u2588\u2588\u2588`);
  console.log(`    accent  ${p.accent}  \u2588\u2588\u2588\u2588`);
  console.log(`    muted   ${p.muted}  \u2588\u2588\u2588\u2588`);
  console.log(`    surface ${p.surface}  \u2588\u2588\u2588\u2588`);
  console.log(`    ink     ${p.ink}  \u2588\u2588\u2588\u2588`);
  console.log(`  Headings:     ${content.headings.length} found`);
  if (content.headings.length) console.log(`    ${content.headings.slice(0,3).join(' \u00b7 ')}`);
  console.log(`  Paragraphs:   ${content.paragraphs.length}`);
  console.log(`  List items:   ${content.items.length}`);
  console.log(`  Anchors:      ${content.anchors.join(', ')}`);
  console.log(`  Proper nouns: ${content.properNouns.slice(0, 6).join(', ')}${content.properNouns.length > 6 ? '...' : ''}`);
  console.log(`  Dates:        ${content.dates.slice(0, 4).join(', ')}${content.dates.length > 4 ? '...' : ''}`);
  console.log(`  Numbers:      ${content.numbers.slice(0, 4).join(', ')}${content.numbers.length > 4 ? '...' : ''}`);
  console.log(`  Emails:       ${content.emails.join(', ') || '(none)'}`);
  if (content.sourceHex.length) console.log(`  Source hex:   ${content.sourceHex.join(', ')}`);
  console.log(`\n  Run with -t <token> to generate. Use --list to see all tokens.\n`);
  process.exit(0);
}

// Phase 2: Generate
const seed = argv.seed ? parseInt(argv.seed, 10) : undefined;
const brief = argv.brief || undefined;  console.log(`\n  reimagine-it → ${token}  ·  ${path.basename(inputPath)}\n`);
  var p = content.palette;
  console.log(`  Palette: ${p.ground} · ${p.accent} · ${p.muted}`);
  console.log(`  Motif:   ${content.anchors.slice(0, 3).join(', ')}`);

const output = generate({ content, token, seed, brief });

// Phase 3: Write
const outputPath = argv.output
  ? path.resolve(argv.output)
  : path.join(process.cwd(), 'reimagined', `${token}.html`);

const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`  Output:  ${outputPath}`);
console.log(`  Size:    ${(output.length / 1024).toFixed(1)} KB`);
console.log(`\n  REIMAGINED: shipped ✓\n`);

function parseArgs(raw) {
  const opts = {};
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i];
    switch (arg) {
      case '-i': case '--input':
        opts.input = raw[++i]; break;
      case '-t': case '--token':
        opts.token = raw[++i]; break;
      case '-o': case '--output':
        opts.output = raw[++i]; break;
      case '-s': case '--seed':
        opts.seed = raw[++i]; break;
      case '-b': case '--brief':
        opts.brief = raw[++i]; break;
      case '-d': case '--dry':
        opts.dry = true; break;
      case '--json':
        opts.json = true; break;
      case '-v': case '--version':
        opts.version = true; break;
      case '-h': case '--help':
        opts.help = true; break;
      case '-l': case '--list':
        opts.list = true; break;
    }
  }
  return opts;
}