#!/usr/bin/env node
/**
 * Design Health parity test.
 *
 * `src/audit.js` ships to npm and powers the CLI and MCP server. `scripts/audit.py`
 * powers the Python GitHub Action. Two implementations of one rule set will drift
 * unless something forbids it, so this test audits every HTML file in the
 * repository with both and fails on the first disagreement.
 *
 * Python is optional: contributors on a Node-only machine get a skip notice
 * instead of a failure, while CI (which installs Python) enforces parity.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { auditHtml, RULES } = require('../../src/audit');

const repoRoot = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'vendor', 'loops', '_preview_b21',
  'x-ads', 'pulsewave', 'twolights', 'saffron', '.tmp-verify',
]);
const SKIP_FILES = new Set(['see.html']);

function walk(dir, found) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    return found;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), found);
    } else if (entry.name.endsWith('.html') && !SKIP_FILES.has(entry.name)) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

function trackedOnly(files) {
  // Locally generated shots are git-ignored; they must not decide the outcome.
  const result = spawnSync('git', ['check-ignore', '--stdin'], {
    cwd: repoRoot,
    input: files.map((file) => path.relative(repoRoot, file).replace(/\\/g, '/')).join('\n'),
    encoding: 'utf8',
  });
  if (result.error) return files;
  const ignored = new Set((result.stdout || '').split(/\r?\n/).filter(Boolean));
  return files.filter((file) => !ignored.has(path.relative(repoRoot, file).replace(/\\/g, '/')));
}

function pythonAvailable() {
  for (const candidate of ['python', 'python3']) {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (!probe.error && probe.status === 0) return candidate;
  }
  return null;
}

let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log('  ok   ' + name);
  } else {
    failed++;
    console.log('  FAIL ' + name + (detail ? '\n       ' + detail : ''));
  }
}

const corpus = trackedOnly(walk(repoRoot, []))
  .map((file) => path.relative(repoRoot, file).replace(/\\/g, '/'))
  .sort();

console.log('\nDesign Health parity — ' + corpus.length + ' HTML files, ' + RULES.length + ' rules\n');

const python = pythonAvailable();
if (!python) {
  console.log('  skip Python not on PATH — parity is enforced in CI.');
  console.log('\n0 passed, 0 failed, 1 skipped\n');
  process.exit(0);
}

const CHUNK = 40;
const pythonReports = {};
for (let index = 0; index < corpus.length; index += CHUNK) {
  const batch = corpus.slice(index, index + CHUNK);
  const run = spawnSync(python, ['scripts/audit_all.py', '--reports'].concat(batch), {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (run.error) {
    console.error('  FAIL could not run scripts/audit_all.py: ' + run.error.message);
    process.exit(1);
  }
  let parsed;
  try {
    parsed = JSON.parse(run.stdout);
  } catch (error) {
    console.error('  FAIL scripts/audit_all.py did not return JSON.');
    console.error((run.stdout || '').slice(0, 400));
    console.error((run.stderr || '').slice(0, 400));
    process.exit(1);
  }
  Object.assign(pythonReports, parsed);
}

check(
  'python audited every file in the corpus',
  Object.keys(pythonReports).length === corpus.length,
  'python reported ' + Object.keys(pythonReports).length + ' of ' + corpus.length
);

const mismatches = [];
for (const file of corpus) {
  const expected = pythonReports[file];
  if (!expected) {
    mismatches.push(file + ': missing from the python report');
    continue;
  }
  const actual = auditHtml(fs.readFileSync(path.join(repoRoot, file), 'utf8'), { path: file });
  const fields = ['rules', 'passed', 'warnings', 'failures', 'verdict'];
  for (const field of fields) {
    if (actual[field] !== expected[field]) {
      mismatches.push(file + ': ' + field + ' js=' + actual[field] + ' py=' + expected[field]);
    }
  }
  const actualCodes = actual.findings.map((f) => f.severity + ':' + f.code).join(',');
  const expectedCodes = expected.findings.map((f) => f.severity + ':' + f.code).join(',');
  if (actualCodes !== expectedCodes) {
    mismatches.push(file + ': findings js=[' + actualCodes + '] py=[' + expectedCodes + ']');
  }
  for (let i = 0; i < Math.min(actual.findings.length, expected.findings.length); i++) {
    if (actual.findings[i].message !== expected.findings[i].message) {
      mismatches.push(
        file + ': ' + actual.findings[i].code + ' message differs\n         js: ' +
        actual.findings[i].message + '\n         py: ' + expected.findings[i].message
      );
    }
  }
}

check(
  'js and python agree on every file',
  mismatches.length === 0,
  mismatches.slice(0, 8).join('\n       ')
);

// A rule set nothing trips is not a quality gate. Prove the corpus exercises
// a meaningful share of the registry.
const exercised = new Set();
for (const file of corpus) {
  const report = auditHtml(fs.readFileSync(path.join(repoRoot, file), 'utf8'), { path: file });
  report.findings.forEach((finding) => exercised.add(finding.code));
}
check(
  'corpus exercises at least 6 distinct rules',
  exercised.size >= 6,
  'exercised: ' + Array.from(exercised).sort().join(', ')
);

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
