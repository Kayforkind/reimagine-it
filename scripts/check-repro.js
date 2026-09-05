#!/usr/bin/env node
/**
 * Reproduction guard — the committed engine artifacts stay regenerable.
 *
 * For every example (end-users + community) it re-runs the exact Auto
 * command build.py would run (same source, seed, brief, candidates) and
 * compares against the committed artifacts:
 *
 *   auto.html  byte-identical (after line-ending normalization)
 *   auto.json  identical after stripping machine-specific paths
 *
 * This is the portable CI check. Pixel regression against screenshots is a
 * separate, same-environment tool (`node scripts/check-stills.js --pixel`)
 * because cross-platform Chrome antialiasing/fonts are not pixel-stable.
 *
 * Usage: node scripts/check-repro.js
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.resolve(__dirname, '..');
const norm = (s) => s.replace(/\r\n/g, '\n');

function exampleConfig() {
  // examples.json owns seed/brief/alternates for the nine journeys. Both
  // build.py and this guard read it — one source of truth, no interpreter
  // required (CI runners have no Pillow, so importing build.py fails there).
  const journeys = JSON.parse(
    fs.readFileSync(path.join(root, 'examples', 'end-users', 'examples.json'), 'utf8')
  );
  // build.py import leaves a __pycache__ next to it; keep it out of git.
  // (The .gitignore entry lives in the repo; this only guards the guard.)

  // Community proof cases keep their own seed, no brief.
  const communityDir = path.join(root, 'examples/community');
  if (fs.existsSync(communityDir)) {
    for (const entry of fs.readdirSync(communityDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'TEMPLATE') continue;
      const dir = 'examples/community/' + entry.name;
      const source = path.join(root, dir, 'source.html');
      const report = path.join(root, dir, 'auto.json');
      if (!fs.existsSync(source) || !fs.existsSync(report)) continue;
      journeys.push({
        slug: entry.name,
        source: dir + '/source.html',
        seed: '1',
        brief: '',
        community: true,
        dir,
      });
    }
  }
  return journeys.map((j) => ({ ...j, dir: j.dir || path.join('examples/end-users', j.slug) }));
}

function stripMachinePaths(report) {
  const clone = JSON.parse(JSON.stringify(report));
  delete clone.source;
  delete clone.artifact;
  return JSON.stringify(clone);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'repro-guard-'));
const problems = [];
let checked = 0;

for (const ex of exampleConfig()) {
  const committedHtml = path.join(root, ex.dir, 'auto.html');
  const committedJson = path.join(root, ex.dir, 'auto.json');
  if (!fs.existsSync(committedHtml) || !fs.existsSync(committedJson)) {
    problems.push(`${ex.slug}: committed artifacts missing`);
    continue;
  }

  const outHtml = path.join(tmp, ex.slug + '.html');
  const outJson = path.join(tmp, ex.slug + '.json');
  const argv = [
    'scripts/auto.js',
    '--input', ex.source,
    '--output', outHtml,
    '--report', outJson,
    '--seed', String(ex.seed),
    '--candidates', '3',
    '--quiet',
  ];
  if (ex.brief) argv.push('--brief', ex.brief);

  try {
    execFileSync(process.execPath, argv, { cwd: root, stdio: 'pipe', shell: false });
  } catch (e) {
    problems.push(`${ex.slug}: auto.js failed — ${String(e.stderr || e.message).split('\n')[0]}`);
    continue;
  }
  checked++;

  const regenHtml = norm(fs.readFileSync(outHtml, 'utf8'));
  const commitHtml = norm(fs.readFileSync(committedHtml, 'utf8'));
  if (regenHtml !== commitHtml) {
    // Locate the first divergence to make the failure actionable.
    let i = 0;
    while (i < Math.min(regenHtml.length, commitHtml.length) && regenHtml[i] === commitHtml[i]) i++;
    problems.push(
      `${ex.slug}: auto.html is stale (first diff at char ${i}: ` +
      `committed "${commitHtml.slice(i, i + 40)}" vs regenerated "${regenHtml.slice(i, i + 40)}")`
    );
  }

  const regenReport = JSON.parse(fs.readFileSync(outJson, 'utf8'));
  const commitReport = JSON.parse(fs.readFileSync(committedJson, 'utf8'));
  if (stripMachinePaths(regenReport) !== stripMachinePaths(commitReport)) {
    problems.push(`${ex.slug}: auto.json is stale (beyond the machine-specific paths)`);
  }
}

if (problems.length) {
  console.error(`FAIL: reproduction guard — ${problems.length} problem(s):`);
  for (const p of problems) console.error('  ' + p);
  console.error('\nRegenerate with: npm run examples (and commit the refreshed artifacts).');
  process.exit(1);
}
console.log(`reproduction guard OK — ${checked} artifacts regenerate byte-identically`);
