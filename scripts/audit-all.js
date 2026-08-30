#!/usr/bin/env node
/**
 * Audit many HTML files with Design Health — Node-native.
 *
 * Usage:
 *   node scripts/audit-all.js                    # sweep tracked gold HTML
 *   node scripts/audit-all.js --json             # verdict summary as JSON
 *   node scripts/audit-all.js --reports a.html   # full reports as JSON
 *   node scripts/audit-all.js path/to/page.html  # audit explicit paths
 *
 * Exit code 0 = all clean, 1 = warnings only, 2 = at least one failure.
 *
 * This is the sweep the test suite runs. `scripts/audit_all.py` is the mirror
 * the GitHub Action uses; test/unit/audit-parity.test.js proves they agree.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { auditHtml, exitCodeFor } = require('../src/audit');

const REPO = path.resolve(__dirname, '..');

// Kept in step with SKIP_DIRS / SKIP_FILES in scripts/audit_all.py.
const SKIP_DIRS = new Set([
  'vendor', 'loops', '_preview_b21', 'x-ads', 'pulsewave',
  'twolights', 'saffron', 'node_modules',
]);
const SKIP_FILES = new Set(['before.html', 'see.html']);

/** Untracked local screenshots and scratch pages must not fail the suite. */
function gitIgnored(relative) {
  try {
    execFileSync('git', ['check-ignore', '-q', relative], { cwd: REPO, stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function findGoldHtml() {
  const found = [];
  (function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      return;
    }
    entries.forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
        return;
      }
      if (!entry.name.endsWith('.html') || SKIP_FILES.has(entry.name)) return;
      const relative = path.relative(REPO, full).replace(/\\/g, '/');
      if (gitIgnored(relative)) return;
      found.push(relative);
    });
  })(path.join(REPO, 'gold'));
  return found.sort();
}

function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter((arg) => arg.startsWith('--')));
  const explicit = argv.filter((arg) => !arg.startsWith('--'));
  const files = explicit.length ? explicit : findGoldHtml();

  if (!files.length) {
    console.log('No HTML files found.');
    process.exit(0);
  }

  const reports = {};
  let worst = 0;
  const summary = { total: 0, clean: 0, warnings: 0, failures: 0 };

  files.forEach((file) => {
    const resolved = path.resolve(REPO, file);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      console.error('File not found: ' + file);
      process.exit(2);
    }
    const key = path.relative(REPO, resolved).replace(/\\/g, '/');
    const report = auditHtml(fs.readFileSync(resolved, 'utf8'), { path: key });
    reports[key] = report;
    const code = exitCodeFor(report);
    worst = Math.max(worst, code);
    summary.total += 1;
    summary[code === 0 ? 'clean' : code === 1 ? 'warnings' : 'failures'] += 1;
  });

  const keys = Object.keys(reports).sort();

  if (flags.has('--reports')) {
    const ordered = {};
    keys.forEach((key) => { ordered[key] = reports[key]; });
    console.log(JSON.stringify(ordered, null, 2));
  } else if (flags.has('--json')) {
    const verdicts = {};
    keys.forEach((key) => { verdicts[key] = reports[key].verdict; });
    console.log(JSON.stringify({ files: verdicts, summary }, null, 2));
  } else {
    const icons = { CLEAN: 'OK  ', WARNINGS: 'WARN', FAIL: 'FAIL' };
    keys.forEach((key) => {
      const report = reports[key];
      console.log(
        '  ' + (icons[report.verdict] || '?   ') + ' ' + report.verdict.padEnd(9) + ' ' +
        report.passed + '/' + report.rules + ' rules  ' + key
      );
    });
    console.log(
      '\n' + summary.total + ' files: ' + summary.clean + ' clean, ' +
      summary.warnings + ' warnings, ' + summary.failures + ' failures  (' +
      reports[keys[0]].checks.length + ' rules each)'
    );
  }

  process.exit(worst);
}

main();
