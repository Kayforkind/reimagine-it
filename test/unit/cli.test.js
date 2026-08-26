/**
 * Unit tests for the reimagine-it CLI (extract.js + generate.js).
 * Run: node test/unit/cli.test.js
 * No test framework — uses Node's built-in assert module.
 */

var assert = require('assert');
var extractMod = require('../../src/extract');
var extractContent = extractMod.extractContent;
var generate = require('../../src/generate').generate;
var autoMod = require('../../src/auto');
var resultMod = require('../../src/result');
var fs = require('fs');
var childProcess = require('child_process');
var path = require('path');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  \u2713 ' + name);
    passed++;
  } catch (e) {
    console.log('  \u2717 ' + name + ' — ' + e.message);
    failed++;
  }
}

// ── extract.js ──────────────────────────────────────────────────────

console.log('\nextract.js:');

test('extracts title from <h1> when no <title>', function() {
  var html = '<h1>Hello World</h1><p>Body text here.</p>';
  var c = extractContent(html, 'test.html');
  assert.strictEqual(c.title, 'Hello World', 'title should come from <h1>');
});

test('extracts title from <title> over <h1>', function() {
  var html = '<title>Page Title</title><h1>Different Heading</h1>';
  var c = extractContent(html, 'test.html');
  assert.strictEqual(c.title, 'Page Title', '<title> should take priority');
});

test('falls back to filename when no title or h1', function() {
  var html = '<p>Just some text.</p>';
  var c = extractContent(html, 'my-doc.html');
  assert.ok(c.title.length > 0, 'should have a title fallback');
});

test('extracts emails', function() {
  var html = '<p>Contact us at hello@example.com or test@site.org</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.emails.length >= 1, 'should find at least 1 email');
  assert.ok(c.emails.indexOf('hello@example.com') >= 0, 'should find hello@example.com');
});

test('extracts percent-qualified numbers', function() {
  var html = '<h1>Report</h1><p>Uptime hit 99.99% and conversions rose 42% this quarter.</p>';
  var c = extractContent(html, 'report.html');
  assert.ok(c.numbers.indexOf('99.99%') >= 0, 'should extract 99.99%');
  assert.ok(c.numbers.indexOf('42%') >= 0, 'should extract 42%');
});

test('excludes bare digits without units', function() {
  var html = '<h1>Story</h1><p>We met in 2026 and 42 people came. Version 2.1 ships next.</p>';
  var c = extractContent(html, 'story.html');
  assert.ok(c.numbers.indexOf('42 people') >= 0, 'should keep unit-qualified 42 people');
  assert.ok(c.numbers.indexOf('2026') < 0, 'bare year 2026 should be excluded');
});

test('extracts dates (4-digit years)', function() {
  var html = '<p>Founded in 1836 and revived in 2026.</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.dates.indexOf('1836') >= 0, 'should find 1836');
  assert.ok(c.dates.indexOf('2026') >= 0, 'should find 2026');
});

test('extracts proper nouns', function() {
  var html = '<p>Texas is a state. Austin is the capital.</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.properNouns.indexOf('Texas') >= 0, 'should find Texas');
  assert.ok(c.properNouns.indexOf('Austin') >= 0, 'should find Austin');
});

test('derives saas palette from content keywords', function() {
  var html = '<p>Our observability platform traces infrastructure metrics and deploys pipelines.</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.palette.ground, 'should have palette.ground');
  assert.ok(c.palette.accent, 'should have palette.accent');
  assert.ok(c.palette.ink, 'should have palette.ink');
  // saas palette should be dark
  assert.strictEqual(c.palette.ground, '#0a1626', 'saas ground should be dark');
});

test('palette has 5 structured keys', function() {
  var c = extractContent('<p>Some text about design.</p>', 'test.html');
  ['ground', 'accent', 'muted', 'surface', 'ink'].forEach(function(key) {
    assert.ok(c.palette[key], 'palette should have ' + key);
  });
});

test('empty HTML does not crash', function() {
  var c = extractContent('', 'empty.html');
  assert.ok(c.title, 'should have a title fallback');
  assert.ok(c.palette, 'should have a palette');
  assert.ok(c.palette.ground, 'should have palette.ground');
});

test('negative safe integer seeds work through the CLI', function() {
  var result = childProcess.spawnSync(process.execPath, [path.join(__dirname, '../../bin/reimagine-it.js'), '--auto', '--seed', '-1', '-o', '-'], {
    input: '<h1>Ocean Atlas</h1><p>Wave data from 2026.</p>', encoding: 'utf8'
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.indexOf('<!doctype html>') === 0);
});

test('invalid numeric entities do not crash extraction', function() {
  var c = extractContent('<h1>Atlas &#99999999;</h1>', 'entity.html');
  assert.strictEqual(c.title, 'Atlas');
});

test('short and alpha-channel hex values are ignored safely', function() {
  var c = extractContent('<style>:root{--a:#abcd;--b:#11223344}</style><h1>Ocean</h1>', 'colors.html');
  assert.deepStrictEqual(c.sourceHex, ['#aabbcc', '#112233']);
  assert.strictEqual(c.palette.accent.length, 7);
});

test('anchors are derived from content', function() {
  var c = extractContent('<p>Texas Texas Texas Austin Austin Live Live Live Live</p>', 'test.html');
  assert.ok(c.anchors.length > 0, 'should produce anchors');
});

test('strips script and style tags', function() {
  var html = '<style>.x{color:red}</style><script>alert(1)</script><p>visible text</p>';
  var c = extractContent(html, 'test.html');
  // should not contain "alert" in any extracted text
  var allText = (c.paragraphs.join('') + c.title + c.anchors.join('')).toLowerCase();
  assert.ok(allText.indexOf('alert') < 0, 'should strip scripts');
});

test('extracts list items', function() {
  var html = '<ul><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.items.length >= 3, 'should find 3 list items, got ' + c.items.length);
});

test('extracts headings', function() {
  var html = '<h1>Main Title</h1><h2>Section A</h2><h3>Subsection</h3>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.headings.length >= 3, 'should find 3 headings, got ' + c.headings.length);
  assert.ok(c.headings.indexOf('Main Title') >= 0);
});

test('decodes nested title and preserves source links', function() {
  var html = '<title>Night &amp; Tide</title><h1>Night &amp; Tide</h1><p>Read the field notes.</p><a href="https://example.com">Field notes</a>';
  var c = extractContent(html, 'notes.html');
  assert.strictEqual(c.title, 'Night & Tide');
  assert.strictEqual(c.links[0].label, 'Field notes');
  assert.strictEqual(c.links[0].href, 'https://example.com');
});

test('returns source metadata for generation decisions', function() {
  var c = extractContent('<h1>Ocean Atlas</h1><p>Wave data from 2026.</p><p>12 miles offshore.</p>', 'ocean.html');
  assert.strictEqual(c.profile, 'ocean');
  assert.strictEqual(c.hasTimeline, false);
  assert.strictEqual(c.hasMetrics, true);
  assert.ok(['sparse', 'medium', 'rich'].indexOf(c.density) >= 0);
});

// ── generate.js ─────────────────────────────────────────────────────

console.log('\ngenerate.js:');

var sampleContent = {
  title: 'Test Page',
  palette: { ground: '#1a2138', accent: '#e8a63f', muted: '#6366f1', surface: '#24243e', ink: '#f4ecd8' },
  headings: ['Test Page', 'Section One', 'Section Two'],
  paragraphs: ['Some content about Texas and Austin.', 'More content here about design.'],
  items: ['Feature one', 'Feature two', 'Feature three'],
  emails: ['hello@test.com'],
  dates: ['1836', '2026'],
  numbers: ['42 users', '23ms'],
  properNouns: ['Texas', 'Austin'],
  nouns: ['Texas', 'Austin', 'Live'],
  anchors: ['Texas', 'Austin', 'Live'],
  foundColors: [],
  sourceHex: [],
};

test('webpage token produces valid HTML', function() {
  var out = generate({content: sampleContent, token: 'webpage', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
  assert.ok(out.indexOf('</html>') > 0);
});

test('infographic token produces valid HTML', function() {
  var out = generate({content: sampleContent, token: 'infographic', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
  assert.ok(out.indexOf('chart') > 0 || out.indexOf('bar') > 0, 'should have chart/bar elements');
});

test('dashboard token produces valid HTML', function() {
  var out = generate({content: sampleContent, token: 'dashboard', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
  assert.ok(out.indexOf('kpi') > 0 || out.indexOf('metric') > 0, 'should have metric elements');
});

test('svg token produces inline SVG', function() {
  var out = generate({content: sampleContent, token: 'svg', seed: 42});
  assert.ok(out.indexOf('<svg') > 0, 'should contain <svg> element');
  assert.ok(out.indexOf('</svg>') > 0);
});

test('3js token produces canvas with script', function() {
  var out = generate({content: sampleContent, token: '3js', seed: 42});
  assert.ok(out.indexOf('<canvas') > 0, 'should contain <canvas>');
  assert.ok(out.indexOf('getContext') > 0, 'should have canvas drawing code');
});

test('simulation token produces timeline', function() {
  var out = generate({content: sampleContent, token: 'simulation', seed: 42});
  assert.ok(out.indexOf('tl') > 0 || out.indexOf('timeline') > 0 || out.indexOf('track') > 0, 'should have timeline elements');
});

test('all tokens include craft-floor CSS', function() {
  var tokens = ['webpage','infographic','dashboard','artistic','cinematic','photography','landing','svg','3js','simulation'];
  tokens.forEach(function(t) {
    var out = generate({content: sampleContent, token: t, seed: 42});
    assert.ok(out.indexOf('prefers-reduced-motion') > 0, t + ': needs prefers-reduced-motion');
    assert.ok(out.indexOf('focus-visible') > 0, t + ': needs focus-visible');
    assert.ok(out.indexOf('selection') > 0, t + ': needs ::selection');
  });
});

test('same seed produces identical output', function() {
  var a = generate({content: sampleContent, token: 'webpage', seed: 42});
  var b = generate({content: sampleContent, token: 'webpage', seed: 42});
  assert.strictEqual(a, b, 'same seed must produce identical output');
});

test('different seeds produce different output', function() {
  var a = generate({content: sampleContent, token: 'webpage', seed: 1});
  var b = generate({content: sampleContent, token: 'webpage', seed: 999});
  assert.notStrictEqual(a, b, 'different seeds should produce different output');
});

test('empty anchors does not crash', function() {
  var emptyContent = {
    title: 'Empty', palette: {ground:'#000',accent:'#fff',muted:'#888',surface:'#111',ink:'#fff'},
    headings: [], paragraphs: [], items: [], emails: [], dates: [], numbers: [],
    properNouns: [], nouns: [], anchors: [], foundColors: [], sourceHex: [],
  };
  var out = generate({content: emptyContent, token: 'webpage', seed: 1});
  assert.ok(out.indexOf('<!doctype html>') === 0);
});

test('auto ranks data-rich content toward infographic', function() {
  var c = extractContent('<h1>History</h1><p>Compare data from 1836 and 2026.</p><ul><li>12 users</li><li>24 users</li></ul>', 'history.html');
  var plan = autoMod.buildPlan(c);
  assert.strictEqual(plan.recommendation, 'infographic');
  assert.ok(plan.candidates.length <= 3);
});

test('auto generation returns a verified standalone artifact', function() {
  var result = autoMod.autoGenerate(sampleContent, { seed: 42 });
  assert.ok(['webpage', 'landing', 'dashboard', 'infographic', 'cinematic', 'artistic', 'photography', 'svg', '3js', 'simulation'].indexOf(result.token) >= 0);
  assert.ok(result.output.indexOf('<!doctype html>') === 0);
  assert.ok(result.candidates.length >= 1);
  assert.ok(result.candidates[0].quality >= 0);
});

test('source fidelity reports preserved values', function() {
  var content = extractContent('<title>Night &amp; Tide</title><h1>Night &amp; Tide</h1><p>Wave data from 2026.</p><a href="https://example.com">Field notes</a>', 'notes.html');
  var output = generate({content: content, token: 'webpage', seed: 4});
  var fidelity = resultMod.sourceFidelity(content, output);
  assert.strictEqual(fidelity.percentage, 100);
  assert.ok(fidelity.detected > 0);
});

test('auto generation is reproducible when seeded', function() {
  var a = autoMod.autoGenerate(sampleContent, { seed: 17 });
  var b = autoMod.autoGenerate(sampleContent, { seed: 17 });
  assert.strictEqual(a.token, b.token);
  assert.strictEqual(a.seed, b.seed);
  assert.strictEqual(a.output, b.output);
});

test('default token falls back to webpage', function() {
  var out = generate({content: sampleContent, token: 'unknown', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
});

test('all generated tokens remain source-faithful and standalone', function() {
  var tokens = ['webpage','landing','dashboard','infographic','cinematic','artistic','photography','svg','3js','simulation'];
  tokens.forEach(function(token) {
    var out = generate({content: sampleContent, token: token, seed: 7});
    assert.ok(out.indexOf('Test Page') >= 0, token + ': keeps title');
    assert.ok(out.indexOf('https://') < 0, token + ': must be offline');
  });
});

test('CLI stdout mode emits only HTML on stdout', function() {
  var result = childProcess.spawnSync(process.execPath, [path.join(__dirname, '../../bin/reimagine-it.js'), '-t', 'svg', '-o', '-'], {
    input: '<h1>Ocean Atlas</h1><p>Wave notes from 2026.</p>', encoding: 'utf8'
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.indexOf('<!doctype html>') === 0, 'stdout should begin with HTML');
  assert.ok(result.stderr.indexOf('reimagine-it') >= 0, 'progress should stay on stderr');
});

test('CLI auto mode generates an artifact without source mutation', function() {
  var result = childProcess.spawnSync(process.execPath, [path.join(__dirname, '../../bin/reimagine-it.js'), '--auto', '-o', '-'], {
    input: '<h1>Ocean Atlas</h1><p>Wave data from 2026.</p><p>12 miles offshore.</p>', encoding: 'utf8'
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.indexOf('<!doctype html>') === 0);
  assert.ok(result.stderr.indexOf('reimagine-it') >= 0);
});

test('CLI accepts negative safe integer seeds', function() {
  var result = childProcess.spawnSync(process.execPath, [path.join(__dirname, '../../bin/reimagine-it.js'), '--auto', '--seed', '-1', '-o', '-'], {
    input: '<h1>Ocean Atlas</h1><p>Wave data from 2026.</p>', encoding: 'utf8'
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.indexOf('<!doctype html>') === 0);
});

test('CLI --diff prints a before/after summary to stdout', function() {
  var result = childProcess.spawnSync(process.execPath, [path.join(__dirname, '../../bin/reimagine-it.js'), '--auto', '--diff', '--seed', '7'], {
    input: '<h1>Ocean Atlas</h1><p>Wave data from 2026.</p><p>12 miles offshore, 42% growth.</p>', encoding: 'utf8'
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.indexOf('Before → After') >= 0, 'diff header present');
  assert.ok(result.stdout.indexOf('Direction:') >= 0, 'direction line present');
  assert.ok(result.stdout.indexOf('Palette:') >= 0, 'palette line present');
  assert.ok(result.stdout.indexOf('Fidelity:') >= 0, 'fidelity line present');
  assert.ok(result.stdout.indexOf('42%') >= 0, 'percent metric preserved in summary');
  assert.ok(result.stdout.indexOf('<!doctype html>') < 0, 'diff must not emit HTML');
});

test('CLI rejects unknown options instead of silently falling back', function() {
  var result = childProcess.spawnSync(process.execPath, [path.join(__dirname, '../../bin/reimagine-it.js'), '--not-a-real-flag'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.indexOf('unknown option') >= 0);
});

test('escape function handles special chars', function() {
  var content = JSON.parse(JSON.stringify(sampleContent));
  content.title = '<script>alert(1)</script>';
  var out = generate({content: content, token: 'webpage', seed: 1});
  assert.ok(out.indexOf('&lt;script&gt;') > 0 || out.indexOf('<script>alert') === -1,
    'should escape HTML in title');
});

// ── Color science helpers ──────────────────────────────────────────

console.log('\ncolor science:');

test('isLight returns true for white', function() {
  assert.ok(extractMod.isLight('#ffffff'));
});

test('isLight returns false for black', function() {
  assert.ok(!extractMod.isLight('#000000'));
});

test('contrastRatio passes WCAG for black on white', function() {
  var r = extractMod.contrastRatio('#000000', '#ffffff');
  assert.ok(r >= 20, 'black/white contrast should be >= 20, got ' + r);
});

test('tint lightens a color', function() {
  var original = '#1a0000';
  var result = extractMod.tint(original, 0.5);
  assert.ok(result !== original, 'tint should change the color');
});

test('shade darkens a color', function() {
  var original = '#ff0000';
  var result = extractMod.shade(original, 0.5);
  assert.ok(result !== original, 'shade should change the color');
});

// ── Summary ─────────────────────────────────────────────────────────

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
