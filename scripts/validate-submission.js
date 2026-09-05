#!/usr/bin/env node
/**
 * Community submission validator.
 *
 * Every folder under examples/community/ (except TEMPLATE) must be a real,
 * honest, regenerable proof case:
 *   - source.html exists and contains no placeholder copy
 *   - Auto succeeds on it and reports fidelity >= 80%
 *   - the committed artifacts match a fresh Auto run (reproduction)
 *   - a README credits the author
 *
 * Usage:
 *   node scripts/validate-submission.js                       # all folders
 *   node scripts/validate-submission.js examples/community/x  # one folder
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.resolve(__dirname, '..');
const communityDir = path.join(root, 'examples', 'community');
const PLACEHOLDER = /lorem ipsum|tbd\b|todo:|placeholder|\bxx+\b|example\.org|foo ?bar/i;

const requested = process.argv.slice(2).map((p) => path.resolve(p));
const folders = fs.readdirSync(communityDir)
  .filter((d) => d !== 'TEMPLATE' && !d.startsWith('.'))
  .filter((d) => fs.statSync(path.join(communityDir, d)).isDirectory())
  .map((d) => path.join('examples/community', d))
  .filter((d) => requested.length === 0 || requested.includes(path.join(root, d)));

if (folders.length === 0) {
  console.log('no submissions to validate');
  process.exit(0);
}

const problems = [];
let checked = 0;

for (const dir of folders) {
  const abs = path.join(root, dir);
  const slug = path.basename(dir);
  const fail = (msg) => problems.push(`${dir}: ${msg}`);

  const sourcePath = path.join(abs, 'source.html');
  if (!fs.existsSync(sourcePath)) { fail('missing source.html'); continue; }
  const source = fs.readFileSync(sourcePath, 'utf8');
  if (PLACEHOLDER.test(source)) fail('source.html contains placeholder copy');

  if (!fs.existsSync(path.join(abs, 'README.md'))) fail('missing README.md (author credit)');
  else if (!/author|submitted by|@/i.test(fs.readFileSync(path.join(abs, 'README.md'), 'utf8'))) {
    fail('README should credit the author');
  }

  // Fresh Auto run in a scratch dir; compare against committed artifacts.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'submission-'));
  const outHtml = path.join(tmp, 'auto.html');
  const outJson = path.join(tmp, 'auto.json');
  const norm = (s) => s.replace(/\r\n/g, '\n');
  try {
    execFileSync(process.execPath, [
      'scripts/auto.js',
      '--input', path.join(root, dir, 'source.html'),
      '--output', outHtml,
      '--report', outJson,
      '--seed', '1',
      '--candidates', '3',
      '--quiet',
    ], { cwd: root, stdio: 'pipe' });

    const report = JSON.parse(fs.readFileSync(outJson, 'utf8'));
    const fidelity = report.fidelity && report.fidelity.percentage;
    if (typeof fidelity !== 'number' || fidelity < 80) {
      fail(`fidelity ${fidelity}% is below the 80% floor`);
    }

    const committedHtml = path.join(abs, 'auto.html');
    const committedJson = path.join(abs, 'auto.json');
    if (fs.existsSync(committedHtml)) {
      const strip = (r) => { const c = JSON.parse(JSON.stringify(r)); delete c.source; delete c.artifact; return JSON.stringify(c); };
      if (norm(fs.readFileSync(outHtml, 'utf8')) !== norm(fs.readFileSync(committedHtml, 'utf8'))) {
        fail('committed auto.html does not match a fresh Auto run at seed 1');
      }
      if (strip(JSON.parse(fs.readFileSync(outJson, 'utf8'))) !== strip(JSON.parse(fs.readFileSync(committedJson, 'utf8')))) {
        fail('committed auto.json does not match a fresh Auto run at seed 1');
      }
    } else {
      // First submission: write the artifacts so the PR includes them.
      fs.mkdirSync(abs, { recursive: true });
      fs.copyFileSync(outHtml, committedHtml);
      fs.writeFileSync(committedJson, JSON.stringify(report, null, 2) + '\n');
      console.log(`  ${dir}: generated auto.html/auto.json (new submission)`);
    }
  } catch (e) {
    fail(`Auto failed — ${String(e.stderr || e.message).split('\n')[0]}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  checked++;
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} submission problem(s):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`submissions OK — ${checked} folder(s) validated`);
