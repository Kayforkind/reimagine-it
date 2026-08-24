#!/usr/bin/env node
/**
 * Cross-platform test runner.
 *
 * Gold warnings are advisory; craft-floor failures still stop the suite.
 */

const { spawnSync } = require('child_process');

function run(label, command, args) {
  console.log(`\n── ${label} ────────────────────────────────────────────────`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.error) {
    console.error(`Could not run ${command}: ${result.error.message}`);
    return 127;
  }
  return result.status === null ? 1 : result.status;
}

const audit = run('1/4  Gold audit sweep', 'python', ['scripts/audit_all.py']);
console.log(`audit exit: ${audit} (0=clean, 1=warnings OK, 2+=failures)`);
if (audit >= 2) {
  console.error('FAIL: gold audit has craft-floor failures');
  process.exit(1);
}

const smoke = run('2/4  Smoke test (gold/reimagine.py --ship)', 'python', ['gold/reimagine.py', '--ship']);
if (smoke !== 0) {
  console.error('FAIL: smoke test crashed');
  process.exit(1);
}

const unit = run('3/4  Unit tests (test/unit/cli.test.js)', process.execPath, ['test/unit/cli.test.js']);
if (unit !== 0) {
  console.error('FAIL: unit tests failed');
  process.exit(1);
}

const docs = run('4/4  Browser bundle freshness', process.execPath, ['scripts/build-docs-engine.js', '--check']);
if (docs !== 0) {
  console.error('FAIL: browser bundles are stale');
  process.exit(1);
}

console.log('\nALL TESTS PASSED');
