/**
 * Unit tests for the reimagine-it CLI (extract.js + generate.js).
 * Run: node test/unit/cli.test.js
 * No test framework — uses Node's built-in assert module.
 */

const assert = require('assert');
const { extractContent } = require('../../src/extract');
const { generate } = require('../../src/generate');
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  ✓ ' + name);
    passed++;
  } catch (e) {
    console.log('  ✗ ' + name + ' — ' + e.message);
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
  assert.strictEqual(c.title, 'my-doc', 'should use filename without .html');
});

test('falls back to Untitled for "before" filename', function() {
  var html = '<p>Just text.</p>';
  var c = extractContent(html, 'before.html');
  assert.strictEqual(c.title, 'Untitled', 'before.html should become Untitled');
});

test('extracts hex colors from inline styles', function() {
  var html = '<div style="color: #ff0000; background: #00ff00; border-color: #1a2b3c">text</div>';
  var c = extractContent(html, 'test.html');
  // With 3+ unique hex colors, palette should use source hex values
  assert.ok(c.palette.includes('#ff0000') || c.palette.includes('#00ff00') || c.palette.includes('#1a2b3c'),
    'should find hex colors: ' + c.palette);
});

test('extracts emails', function() {
  var html = '<p>Contact us at hello@example.com or test@site.org</p>';
  var c = extractContent(html, 'test.html');
  assert.strictEqual(c.emails.length, 2, 'should find 2 emails');
  assert.ok(c.emails.includes('hello@example.com'));
});

test('extracts dates (4-digit years)', function() {
  var html = '<p>Founded in 1836 and revived in 2026.</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.dates.includes('1836'), 'should find 1836');
  assert.ok(c.dates.includes('2026'), 'should find 2026');
});

test('extracts proper nouns', function() {
  var html = '<p>Texas is a state. Austin is the capital.</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.properNouns.includes('Texas'), 'should find Texas');
  assert.ok(c.properNouns.includes('Austin'), 'should find Austin');
});

test('derives palette from saas content keywords', function() {
  var html = '<p>Our observability platform traces infrastructure metrics.</p>';
  var c = extractContent(html, 'test.html');
  assert.strictEqual(c.palette[0], '#08141a', 'saas ground should be dark');
});

test('derives palette from food content keywords', function() {
  var html = '<p>Our restaurant menu has the best dish and recipe.</p>';
  var c = extractContent(html, 'test.html');
  assert.strictEqual(c.palette[0], '#f4efe4', 'food ground should be cream');
});

test('empty HTML does not crash', function() {
  var c = extractContent('', 'empty.html');
  assert.ok(c.title, 'should have a title fallback');
  assert.ok(Array.isArray(c.palette), 'should have a palette');
});

test('HTML with no paragraphs returns empty array', function() {
  var c = extractContent('<h1>Title</h1>', 'test.html');
  assert.strictEqual(c.paragraphs.length, 0);
});

test('anchors are derived from top frequency nouns', function() {
  var html = '<p>Texas Texas Texas Austin Austin Live Live Live Live</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(c.anchors.length > 0, 'should produce anchors');
  assert.ok(c.anchors.includes('Live'), 'Live should be top anchor');
});

test('strips script and style tags', function() {
  var html = '<style>.x{color:red}</style><script>alert(1)</script><p>visible text</p>';
  var c = extractContent(html, 'test.html');
  assert.ok(!c.paragraphs.join('').includes('alert'), 'should strip scripts');
  assert.ok(!c.paragraphs.join('').includes('color'), 'should strip styles');
});

// ── generate.js ─────────────────────────────────────────────────────

console.log('\ngenerate.js:');

var sampleContent = {
  title: 'Test Page',
  palette: ['#1a2138', '#d97757', '#e8a63f', '#f4ecd8'],
  nouns: ['Texas', 'Austin', 'Live'],
  properNouns: ['Texas', 'Austin'],
  dates: ['1836'],
  numbers: ['42'],
  paragraphs: ['Some content about Texas and Austin.'],
  emails: [],
  anchors: ['Texas', 'Austin', 'Live']
};

test('webpage token produces valid HTML', function() {
  var out = generate({content: sampleContent, token: 'webpage', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
  assert.ok(out.indexOf('</html>') > 0);
});

test('infographic token produces valid HTML', function() {
  var out = generate({content: sampleContent, token: 'infographic', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
  assert.ok(out.indexOf('.poster') > 0, 'should have .poster CSS');
});

test('dashboard token produces valid HTML', function() {
  var out = generate({content: sampleContent, token: 'dashboard', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
  assert.ok(out.indexOf('.kpi-card') > 0, 'should have .kpi-card CSS');
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
  assert.ok(out.indexOf('timeline') > 0, 'should have timeline');
  assert.ok(out.indexOf('scrub') > 0, 'should have scrubber');
});

test('all tokens include craft-floor CSS', function() {
  var tokens = ['webpage','infographic','dashboard','artistic','cinematic','photography','landing','svg','3js','simulation'];
  tokens.forEach(function(t) {
    var out = generate({content: sampleContent, token: t, seed: 42});
    assert.ok(out.indexOf('prefers-reduced-motion') > 0, t + ': needs prefers-reduced-motion');
    assert.ok(out.indexOf('focus-visible') > 0, t + ': needs focus-visible');
    assert.ok(out.indexOf('::selection') > 0, t + ': needs ::selection');
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
    title: 'Empty', palette: ['#000', '#fff', '#ccc', '#999'],
    nouns: [], properNouns: [], dates: [], numbers: [],
    paragraphs: [], emails: [], anchors: []
  };
  var out = generate({content: emptyContent, token: 'webpage', seed: 1});
  assert.ok(out.indexOf('<!doctype html>') === 0);
});

test('default token falls back to webpage', function() {
  var out = generate({content: sampleContent, token: 'unknown', seed: 42});
  assert.ok(out.indexOf('<!doctype html>') === 0);
});

test('escape function handles special chars', function() {
  var content = {
    title: '<script>alert(1)</script>',
    palette: ['#000', '#fff', '#ccc', '#999'],
    nouns: [], properNouns: [], dates: [], numbers: [],
    paragraphs: ['<b>bold</b> & <i>italic</i>'],
    emails: [], anchors: ['Test']
  };
  var out = generate({content: content, token: 'webpage', seed: 1});
  assert.ok(out.indexOf('<script>alert') === -1 || out.indexOf('&lt;script&gt;') > 0,
    'should escape HTML in title');
});

// ── Summary ─────────────────────────────────────────────────────────

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
