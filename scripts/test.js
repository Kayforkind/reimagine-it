#!/usr/bin/env node
/**
 * Cross-platform test runner.
 *
 * Every required step runs on Node alone: a contributor without Python can
 * still run the whole suite, and `prepublishOnly` cannot fail for want of an
 * interpreter. Python steps are extras that skip themselves when absent, and
 * the parity test is what keeps the Python mirror honest when it is present.
 *
 * Gold warnings are advisory; craft-floor failures still stop the suite.
 */

const { spawnSync } = require('child_process');

const steps = [];
let index = 0;

function run(label, command, args, options) {
  options = options || {};
  index += 1;
  console.log(`\n── ${index}/${TOTAL}  ${label} ${'─'.repeat(Math.max(0, 44 - label.length))}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.error) {
    if (options.optional) {
      console.log(`SKIP: ${command} is not available (${result.error.code || result.error.message})`);
      return 0;
    }
    console.error(`Could not run ${command}: ${result.error.message}`);
    return 127;
  }
  return result.status === null ? 1 : result.status;
}

function hasPython() {
  const probe = spawnSync('python', ['--version'], { stdio: 'ignore', shell: false });
  return !probe.error && probe.status === 0;
}

const PYTHON = hasPython();
const TOTAL = PYTHON ? 10 : 8;

// 1. Gold audit sweep — Node-native.
const audit = run('Gold audit sweep', process.execPath, ['scripts/audit-all.js']);
console.log(`audit exit: ${audit} (0=clean, 1=warnings OK, 2+=failures)`);
if (audit >= 2) {
  console.error('FAIL: gold audit has craft-floor failures');
  process.exit(1);
}

// 2. Unit tests — engine modules.
if (run('Unit tests (engine)', process.execPath, ['test/unit/cli.test.js']) !== 0) {
  console.error('FAIL: engine unit tests failed');
  process.exit(1);
}

// 3. Unit tests — MCP tool surface. Runs without the optional MCP SDK.
if (run('Unit tests (MCP tools)', process.execPath, ['test/unit/mcp.test.js']) !== 0) {
  console.error('FAIL: MCP tool tests failed');
  process.exit(1);
}

if (run('Unit tests (extractor fuzz)', process.execPath, ['test/unit/extract-fuzz.test.js']) !== 0) {
  console.error('FAIL: extractor fuzz properties failed');
  process.exit(1);
}

// 4. End-to-end CLI contract: files, stdout, and documented exit codes.
if (run('End-to-end CLI', process.execPath, ['test/e2e/cli.e2e.test.js']) !== 0) {
  console.error('FAIL: end-to-end CLI tests failed');
  process.exit(1);
}

// 5. Browser bundles must match src/.
if (run('Browser bundle freshness', process.execPath, ['scripts/build-docs-engine.js', '--check']) !== 0) {
  console.error('FAIL: browser bundles are stale — run npm run build:docs');
  process.exit(1);
}

// 6. Tarball guard — npm pack must match the intentional files list.
if (run('Tarball guard', process.execPath, ['scripts/check-tarball.js']) !== 0) {
  console.error('FAIL: the npm tarball drifted from the files list — see scripts/check-tarball.js');
  process.exit(1);
}

// 7. Proof stills: coverage, canonical dimensions, docs/ sync.
if (run('Stills guard', process.execPath, ['scripts/check-stills.js']) !== 0) {
  console.error('FAIL: proof stills are missing, mis-dimensioned, or out of sync');
  process.exit(1);
}

// 8. Reproduction guard: committed engine artifacts regenerate identically.
if (run('Reproduction guard', process.execPath, ['scripts/check-repro.js']) !== 0) {
  console.error('FAIL: committed artifacts are stale — run npm run examples and commit');
  process.exit(1);
}

if (!PYTHON) {
  console.log('\nPython not found — skipping the audit parity test and the gold smoke demo.');
  console.log('The GitHub Action runs the Python mirror, and the parity test guards it there.');
  console.log('\nALL TESTS PASSED');
  process.exit(0);
}

// 9. The Python mirror must agree with src/audit.js file by file.
if (run('Audit parity (js vs python)', process.execPath, ['test/unit/audit-parity.test.js']) !== 0) {
  console.error('FAIL: the Python audit mirror has drifted from src/audit.js');
  process.exit(1);
}

// 10. Narrative demo kept working.
if (run('Gold smoke demo', 'python', ['gold/reimagine.py', '--ship'], { optional: true }) !== 0) {
  console.error('FAIL: smoke demo crashed');
  process.exit(1);
}

console.log('\nALL TESTS PASSED');
