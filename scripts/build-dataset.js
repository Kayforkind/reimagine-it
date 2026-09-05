#!/usr/bin/env node
/**
 * Content-Derived Design dataset builder.
 *
 * Emits one JSON object per line from the committed, verified examples —
 * the tuples that make CDD teachable:
 *
 *   { source_html, source_text, signals, auto: {token, seed, rationale,
 *     score, fidelity}, output_html }
 *
 * Sources: examples/end-users/ and examples/community/ (nine journeys
 * + community proofs, each with engine-verified auto.json). Gold tree is
 * opt-in via --gold; its outputs are hand-authored, marked gold: true.
 *
 * Output is deterministic: same repo state, same bytes. JSONL is the
 * HuggingFace-native format; publish with
 *   hf upload kayforkind/content-derived-design dataset.jsonl
 *
 * Usage:
 *   node scripts/build-dataset.js -o dataset.jsonl
 *   node scripts/build-dataset.js -o dataset.jsonl --gold
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const outArg = args.indexOf('-o') >= 0 || args.indexOf('--output') >= 0
  ? args[args.indexOf('-o') >= 0 ? args.indexOf('-o') + 1 : args.indexOf('--output') + 1]
  : null;
const INCLUDE_GOLD = args.includes('--gold');

function norm(s) { return s.replace(/\r\n/g, '\n'); }

function listCases(base) {
  const p = path.join(root, base);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p)
    .filter((d) => !d.startsWith('.') && !['__pycache__', 'TEMPLATE', 'auto-options'].includes(d))
    .filter((d) => fs.statSync(path.join(p, d)).isDirectory())
    .map((d) => path.join(base, d));
}

const rows = [];
const problems = [];

for (const dir of listCases('examples/end-users').concat(listCases('examples/community'))) {
  const abs = path.join(root, dir);
  const sourcePath = path.join(abs, 'source.html');
  const reportPath = path.join(abs, 'auto.json');
  const outputPath = path.join(abs, 'auto.html');
  if (!fs.existsSync(sourcePath) || !fs.existsSync(reportPath)) {
    problems.push(`${dir}: missing source.html or auto.json`);
    continue;
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const fidelity = report.fidelity && report.fidelity.percentage;
  if (typeof fidelity !== 'number' || fidelity < 80) {
    problems.push(`${dir}: fidelity ${fidelity} below floor — excluded`);
    continue;
  }
  const sourceHtml = fs.readFileSync(sourcePath, 'utf8');
  const signals = {
    title: report.title || undefined,
    anchors: report.anchors,
    dates: (report.facts && report.facts.dates) || undefined,
    numbers: (report.facts && report.facts.numbers) || undefined,
  };
  rows.push({
    id: dir.replace(/[\\/]/g, '-'),
    gold: false,
    token: report.token,
    seed: report.seed,
    score: report.score,
    fidelity,
    rationale: report.rationale,
    source_html: norm(sourceHtml),
    signals,
    output_html: fs.existsSync(outputPath) ? norm(fs.readFileSync(outputPath, 'utf8')) : undefined,
  });
}

if (INCLUDE_GOLD) {
  const goldDirs = ['gold/webpage', 'gold/forms', 'gold/domains', 'gold/modifiers'];
  for (const base of goldDirs) {
    const p = path.join(root, base);
    if (!fs.existsSync(p)) continue;
    for (const entry of fs.readdirSync(p, { recursive: false })) {
      const abs = path.join(p, entry);
      if (!fs.statSync(abs).isDirectory()) continue;
      const after = ['after.html'].map((f) => path.join(abs, f)).find((f) => fs.existsSync(f));
      const before = path.join(root, 'gold/webpage/before.html');
      if (!after) continue;
      rows.push({
        id: (base + '/' + entry).replace(/[\\/]/g, '-'),
        gold: true,
        token: path.basename(entry).split('-')[0],
        source_html: norm(fs.readFileSync(before, 'utf8')),
        output_html: norm(fs.readFileSync(after, 'utf8')),
      });
    }
  }
}

const jsonl = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
if (outArg) {
  fs.mkdirSync(path.dirname(path.resolve(outArg)), { recursive: true });
  fs.writeFileSync(outArg, jsonl, 'utf8');
  console.log(`dataset: ${rows.length} tuples → ${outArg} (${(jsonl.length / 1024).toFixed(0)} KB)`);
} else {
  process.stdout.write(jsonl);
}

if (problems.length) {
  console.error('excluded:');
  for (const p of problems) console.error('  ' + p);
}
