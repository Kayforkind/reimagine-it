/**
 * End-to-end tests for the reimagine-it binary.
 * Run: node test/e2e/cli.e2e.test.js
 *
 * These spawn the real CLI against a temp directory and assert on files,
 * stdout and exit codes. Unit tests cover the modules; this covers the
 * contract a user actually touches, including the documented exit codes.
 */

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var childProcess = require('child_process');

var REPO = path.resolve(__dirname, '..', '..');
var CLI = path.join(REPO, 'bin', 'reimagine-it.js');
var RULES = require('../../src/audit').RULES;

var passed = 0;
var failed = 0;
var workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reimagine-e2e-'));

function test(name, fn) {
  try {
    fn();
    console.log('  \u2713 ' + name);
    passed++;
  } catch (e) {
    console.log('  \u2717 ' + name + ' \u2014 ' + e.message);
    failed++;
  }
}

/** Run the CLI. Never throws on a non-zero exit: the code is the assertion. */
function cli(args, options) {
  options = options || {};
  var result = childProcess.spawnSync(process.execPath, [CLI].concat(args), {
    cwd: options.cwd || workDir,
    encoding: 'utf8',
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
    env: Object.assign({}, process.env, { NO_COLOR: '1' }),
  });
  return {
    code: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

var SOURCE = [
  '<!doctype html><html><head><title>Meridian Freight</title></head><body>',
  '<h1>Meridian Freight</h1>',
  '<p>Meridian Freight moves cargo through 41 ports with 99.4% on-time delivery.</p>',
  '<h2>Coverage</h2>',
  '<p>Founded in 2011, Meridian runs 24/7 dispatch. Contact ops@meridian.example.</p>',
  '<h2>Pricing</h2>',
  '<p>Standard from $180 per container. Volume terms on request.</p>',
  '<a href="https://meridian.example/rates">See rates</a>',
  '</body></html>',
].join('\n');

var BRAND = [
  '<!doctype html><html><head><title>Brand Sheet</title>',
  '<style>:root{--background:#07131a;--primary:#19c37d;--secondary:#7d8a99;',
  '--surface:#0f2029;--foreground:#eef4f7}',
  'body{background:#07131a;color:#eef4f7;font-family:"Iowan Old Style",Georgia,serif}',
  'h1{font-size:72px}h2{font-size:34px}p{font-size:18px}</style></head><body>',
  '<h1>Brand Sheet</h1><p>Reference surface.</p></body></html>',
].join('\n');

fs.writeFileSync(path.join(workDir, 'source.html'), SOURCE, 'utf8');
fs.writeFileSync(path.join(workDir, 'brand.html'), BRAND, 'utf8');

// ── informational commands ──────────────────────────────────────────

console.log('\ninformational commands:');

test('--version prints a semver and exits 0', function () {
  var run = cli(['--version']);
  assert.strictEqual(run.code, 0, 'should exit 0');
  assert.ok(/\d+\.\d+\.\d+/.test(run.stdout), 'should print a version: ' + run.stdout.trim());
});

test('--help documents every subcommand', function () {
  var run = cli(['--help']);
  assert.strictEqual(run.code, 0, 'should exit 0');
  ['variations', 'lock', 'audit', '--ref'].forEach(function (needle) {
    assert.ok(run.stdout.indexOf(needle) >= 0, 'help should mention ' + needle);
  });
});

test('--rules lists the whole registry', function () {
  var run = cli(['--rules']);
  assert.strictEqual(run.code, 0, 'should exit 0');
  RULES.forEach(function (rule) {
    assert.ok(run.stdout.indexOf(rule.code) >= 0, 'should list ' + rule.code);
  });
});

test('--list names the design tokens', function () {
  var run = cli(['--list']);
  assert.strictEqual(run.code, 0, 'should exit 0');
  assert.ok(run.stdout.indexOf('webpage') >= 0, 'should list webpage');
  assert.ok(run.stdout.indexOf('editorial') >= 0, 'should list editorial');
});

// ── generate ────────────────────────────────────────────────────────

console.log('\ngenerate:');

test('writes a standalone page that clears its own craft floor', function () {
  var run = cli(['-i', 'source.html', '-t', 'webpage', '-s', '5', '-o', 'out/page.html', '--audit']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  var html = fs.readFileSync(path.join(workDir, 'out', 'page.html'), 'utf8');
  assert.ok(/^<!doctype html/i.test(html.trim()), 'should be a full document');
  assert.ok(html.indexOf('Meridian Freight') >= 0, 'should keep the source title');
  assert.ok(run.stdout.indexOf('CLEAN') >= 0 || run.stdout.indexOf('19/19') >= 0,
    'should report a clean audit: ' + run.stdout);
});

test('same seed produces byte-identical output', function () {
  cli(['-i', 'source.html', '-t', 'landing', '-s', '77', '-o', 'out/a.html', '-q']);
  cli(['-i', 'source.html', '-t', 'landing', '-s', '77', '-o', 'out/b.html', '-q']);
  var a = fs.readFileSync(path.join(workDir, 'out', 'a.html'), 'utf8');
  var b = fs.readFileSync(path.join(workDir, 'out', 'b.html'), 'utf8');
  assert.strictEqual(a, b, 'seeded runs should be reproducible');
});

test('different seeds produce different output', function () {
  cli(['-i', 'source.html', '-t', 'landing', '-s', '1', '-o', 'out/s1.html', '-q']);
  cli(['-i', 'source.html', '-t', 'landing', '-s', '2', '-o', 'out/s2.html', '-q']);
  var a = fs.readFileSync(path.join(workDir, 'out', 's1.html'), 'utf8');
  var b = fs.readFileSync(path.join(workDir, 'out', 's2.html'), 'utf8');
  assert.notStrictEqual(a, b, 'the seed should actually change the design');
});

test('--emit writes the design and quality reports', function () {
  var run = cli(['-i', 'source.html', '-t', 'infographic', '-s', '9', '-o', 'emit/page.html',
    '--emit', '--audit', '-q']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  ['design-token.json', 'quality-report.json', 'design-health.json'].forEach(function (name) {
    var file = path.join(workDir, 'emit', name);
    assert.ok(fs.existsSync(file), 'should write ' + name);
    JSON.parse(fs.readFileSync(file, 'utf8'));
  });
  var health = JSON.parse(fs.readFileSync(path.join(workDir, 'emit', 'design-health.json'), 'utf8'));
  assert.strictEqual(health.rules, RULES.length, 'health report should run every rule');
});

test('--auto chooses a direction and explains it', function () {
  var run = cli(['-i', 'source.html', '--auto', '-s', '42', '-o', 'out/auto.html', '--audit']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  assert.ok(run.stdout.indexOf('Auto:') >= 0, 'should print its rationale');
  assert.ok(run.stdout.indexOf('Reviewed:') >= 0, 'should report candidates reviewed');
  assert.ok(fs.existsSync(path.join(workDir, 'out', 'auto.html')), 'should write the winner');
});

test('stdin to stdout piping works', function () {
  var run = cli(['-i', '-', '-t', 'webpage', '-s', '3', '-o', '-'], { input: SOURCE });
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  assert.ok(/^<!doctype html/i.test(run.stdout.trim()), 'stdout should be the page');
  assert.ok(run.stdout.indexOf('Meridian Freight') >= 0, 'should carry the source title');
});

test('a missing input file fails with a clear message', function () {
  var run = cli(['-i', 'nope.html', '-t', 'webpage', '-o', 'out/x.html']);
  assert.notStrictEqual(run.code, 0, 'should not report success');
  assert.ok(/not found|no such file/i.test(run.stderr + run.stdout), 'should say the file is missing');
});

// ── audit subcommand ────────────────────────────────────────────────

console.log('\naudit subcommand:');

test('exits 0 on a clean page', function () {
  cli(['-i', 'source.html', '-t', 'webpage', '-s', '5', '-o', 'out/clean.html', '-q']);
  var run = cli(['audit', 'out/clean.html']);
  assert.strictEqual(run.code, 0, 'clean page should exit 0: ' + run.stdout);
  assert.ok(run.stdout.indexOf('CLEAN') >= 0, 'should print the verdict');
});

test('exits 2 on a page that breaks the floor', function () {
  var run = cli(['audit', path.join(REPO, 'test', 'fixtures', 'failing-craft-floor.html')]);
  assert.strictEqual(run.code, 2, 'failing page should exit 2, got ' + run.code);
  assert.ok(run.stdout.indexOf('FAIL') >= 0, 'should print the FAIL verdict');
});

test('--json emits a parseable report with every rule', function () {
  var run = cli(['audit', 'out/clean.html', '--json']);
  var report = JSON.parse(run.stdout);
  assert.strictEqual(report.rules, RULES.length, 'should run every rule');
  assert.strictEqual(report.passed + report.findings.length, RULES.length,
    'passed plus findings should account for every rule');
});

test('reads from stdin', function () {
  var run = cli(['audit', '-'], { input: SOURCE });
  assert.ok(run.code === 0 || run.code === 1 || run.code === 2, 'should produce a verdict');
  assert.ok(/DESIGN HEALTH/.test(run.stdout), 'should print the report');
});

test('--verbose lists per-rule results', function () {
  var run = cli(['audit', 'out/clean.html', '--verbose']);
  assert.ok(run.stdout.indexOf('TYPO-01') >= 0, 'should show individual rules');
});

// ── lock subcommand + --ref ─────────────────────────────────────────

console.log('\nlock subcommand:');

test('captures a brand surface to a lock file', function () {
  var run = cli(['lock', '-i', 'brand.html', '--name', 'house', '-o', 'house.lock.json']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  var lock = JSON.parse(fs.readFileSync(path.join(workDir, 'house.lock.json'), 'utf8'));
  assert.strictEqual(lock.name, 'house', 'should honour --name');
  assert.strictEqual(lock.palette.accent.toLowerCase(), '#19c37d',
    'should recover the declared brand accent, got ' + lock.palette.accent);
  assert.strictEqual(lock.palette.ground.toLowerCase(), '#07131a', 'should recover the ground');
  assert.ok(lock.voice, 'should infer a typographic voice');
  assert.ok(lock.signature, 'should carry a signature');
});

test('--ref applies the lock palette to new content', function () {
  var run = cli(['-i', 'source.html', '--ref', 'house.lock.json', '-t', 'webpage', '-s', '4',
    '-o', 'out/locked.html', '--audit']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  assert.ok(run.stdout.indexOf('Lock:') >= 0, 'should report the lock it applied');
  var html = fs.readFileSync(path.join(workDir, 'out', 'locked.html'), 'utf8');
  assert.ok(html.toLowerCase().indexOf('#19c37d') >= 0, 'brand accent should reach the page');
  assert.ok(html.indexOf('Meridian Freight') >= 0, 'new content should survive');
  assert.strictEqual(html.indexOf('Reference surface'), -1, 'brand copy should not leak in');
});

test('--ref accepts a raw HTML page as a reverse-lock', function () {
  var run = cli(['-i', 'source.html', '--ref', 'brand.html', '-t', 'webpage', '-s', '4',
    '-o', 'out/reverse.html', '-q', '--audit']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  var html = fs.readFileSync(path.join(workDir, 'out', 'reverse.html'), 'utf8');
  assert.ok(html.toLowerCase().indexOf('#19c37d') >= 0, 'should adopt the brand accent');
});

test('a malformed lock file is rejected with a clear message', function () {
  fs.writeFileSync(path.join(workDir, 'bad.lock.json'), '{"nope":true}', 'utf8');
  var run = cli(['-i', 'source.html', '--ref', 'bad.lock.json', '-o', 'out/bad.html']);
  assert.notStrictEqual(run.code, 0, 'should not report success');
  assert.ok((run.stderr + run.stdout).length > 0, 'should explain the problem');
});

// ── variations subcommand ───────────────────────────────────────────

console.log('\nvariations subcommand:');

test('writes N directions, a contrast sheet, and a report', function () {
  var run = cli(['variations', '-i', 'source.html', '-n', '4', '-o', 'review', '-s', '42']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  var dir = path.join(workDir, 'review');
  var files = fs.readdirSync(dir).sort();
  var pages = files.filter(function (name) { return /^\d\d-.*\.html$/.test(name); });
  assert.strictEqual(pages.length, 4, 'should write 4 directions, got ' + files.join(', '));
  assert.ok(files.indexOf('index.html') >= 0, 'should write the contrast sheet');
  assert.ok(files.indexOf('variations.json') >= 0, 'should write the report');

  var report = JSON.parse(fs.readFileSync(path.join(dir, 'variations.json'), 'utf8'));
  assert.strictEqual(report.count, 4, 'report should match the count');
  assert.strictEqual(report.variations.length, 4, 'report should list every direction');
  var tokens = report.variations.map(function (entry) { return entry.token; });
  assert.strictEqual(new Set(tokens).size, 4, 'directions should be distinct: ' + tokens.join(', '));
});

test('every direction and the sheet pass the audit', function () {
  var dir = path.join(workDir, 'review');
  fs.readdirSync(dir).filter(function (name) { return name.endsWith('.html'); })
    .forEach(function (name) {
      var run = cli(['audit', path.join('review', name), '--json']);
      var report = JSON.parse(run.stdout);
      assert.strictEqual(report.failures, 0,
        name + ' failed: ' + report.findings.map(function (f) { return f.code; }).join(', '));
    });
});

test('the contrast sheet links every direction it lists', function () {
  var sheet = fs.readFileSync(path.join(workDir, 'review', 'index.html'), 'utf8');
  var report = JSON.parse(fs.readFileSync(path.join(workDir, 'review', 'variations.json'), 'utf8'));
  report.variations.forEach(function (entry) {
    assert.ok(sheet.indexOf(entry.file) >= 0, 'sheet should reference ' + entry.file);
  });
});

test('the same seed reproduces the same set', function () {
  cli(['variations', '-i', 'source.html', '-n', '3', '-o', 'r1', '-s', '13', '-q']);
  cli(['variations', '-i', 'source.html', '-n', '3', '-o', 'r2', '-s', '13', '-q']);
  var one = JSON.parse(fs.readFileSync(path.join(workDir, 'r1', 'variations.json'), 'utf8'));
  var two = JSON.parse(fs.readFileSync(path.join(workDir, 'r2', 'variations.json'), 'utf8'));
  assert.deepStrictEqual(
    one.variations.map(function (e) { return e.token + ':' + e.seed; }),
    two.variations.map(function (e) { return e.token + ':' + e.seed; }),
    'a pinned seed should reproduce the set'
  );
});

test('an out-of-range count is rejected or clamped, never crashed', function () {
  var run = cli(['variations', '-i', 'source.html', '-n', '99', '-o', 'big', '-q']);
  if (run.code === 0) {
    var report = JSON.parse(fs.readFileSync(path.join(workDir, 'big', 'variations.json'), 'utf8'));
    assert.ok(report.count <= 8, 'should clamp to the documented maximum, got ' + report.count);
  } else {
    assert.ok((run.stderr + run.stdout).length > 0, 'should explain the limit');
  }
});

// ── extract command ─────────────────────────────────────────────

test('extract writes the content signals as JSON', function () {
  var run = cli(['extract', '-i', 'source.html', '-o', 'signals.json']);
  assert.strictEqual(run.code, 0, 'should exit 0, got ' + run.code + ': ' + run.stderr);
  var signals = JSON.parse(fs.readFileSync(path.join(workDir, 'signals.json'), 'utf8'));
  assert.strictEqual(signals.title, 'Meridian Freight', 'title should match the source');
  assert.ok(Array.isArray(signals.numbers) && signals.numbers.indexOf('99.4%') >= 0,
    'should extract the percent-qualified number');
  assert.ok(signals.emails.indexOf('ops@meridian.example') >= 0, 'should carry the email');
  assert.ok(signals.palette && signals.palette.accent, 'should derive a palette');
  assert.ok(!signals.paragraphs, 'bulky prose stays behind --full');
});

test('extract --full includes prose; stdout mode works with -o -', function () {
  var run = cli(['extract', '-i', 'source.html', '--full', '-o', '-']);
  assert.strictEqual(run.code, 0, 'should exit 0');
  var signals = JSON.parse(run.stdout);
  assert.ok(Array.isArray(signals.paragraphs) && signals.paragraphs.length > 0, '--full should include paragraphs');
});

test('mcp with a closed stdio exits promptly (never hangs)', function () {
  var run = childProcess.spawnSync(process.execPath, [CLI, 'mcp'], {
    cwd: workDir,
    encoding: 'utf8',
    input: '',
    timeout: 10000,
    env: Object.assign({}, process.env, { NO_COLOR: '1' }),
  });
  // Two honest outcomes: without the SDK installed the bin exits 1 with
  // guidance; with it (CI runs npm install) the server starts, reads EOF on
  // stdio, and shuts down cleanly (exit 0). A hang or crash is the only failure.
  assert.ok(run.status === 1 || run.status === 0, 'should exit 0 (EOF shutdown) or 1 (SDK missing), got ' + run.status);
  if (run.status === 1) {
    assert.ok(run.stderr.indexOf('MCP SDK') >= 0, 'exit 1 must point at the SDK, stderr: ' + run.stderr);
  }
});

// ── cleanup ─────────────────────────────────────────────────────────

try {
  fs.rmSync(workDir, { recursive: true, force: true });
} catch (e) {
  console.log('  (could not remove temp dir ' + workDir + ')');
}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
