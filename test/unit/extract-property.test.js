/**
 * Property tests for src/extract.js — the "no invented facts" core,
 * written against fast-check, the property-based testing library the
 * OpenSSF Scorecard Fuzzing check recognizes for JavaScript.
 *
 * The engine's honesty contract lives here: whatever an agent or user
 * feeds in, extraction must never crash, never invent facts, and be
 * deterministic. fast-check generates the inputs (shrinking failures
 * to their minimal counterexample) — this complements the seeded
 * generational fuzzer in extract-fuzz.test.js with fresh corpora per run.
 *
 * Run: node test/unit/extract-property.test.js
 */

var assert = require('assert');
var fc = require('fast-check');
var extractMod = require('../../src/extract');
var extractContent = extractMod.extractContent;

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

// Decode the entities fast-check can emit, so "presence in source" checks
// compare against what a reader actually sees. Single pass, one decode per
// entity: sequential replace chains would double-unescape (&amp;#65; → &#65;
// is correct; re-decoding it would invent a character that was not there).
function decode(html) {
  var named = { amp: '&', lt: '<', gt: '>', quot: '"' };
  return html.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot);/g, function (m, ent) {
    if (ent.charAt(0) === '#') {
      var code = ent.charAt(1) === 'x'
        ? parseInt(ent.slice(2), 16)
        : parseInt(ent.slice(1), 10);
      return String.fromCharCode(code);
    }
    return named[ent];
  });
}

var TAGS = ['div', 'p', 'span', 'section', 'li', 'td', 'a', 'h1', 'h2', 'script', 'style', 'textarea'];
var WORDS = ['budget', 'clinic', 'bakery', 'report', '2026', '99.9%', '42 people', '#6B3A2A', 'hello@example.com', 'March 3', 'the', 'of', 'walk-in', '—'];
var HREFS = ['', '', '', ' href="https://example.com/1"', ' href="https://example.com/2"', ' href="#section"'];

// Structured documents: tags + real token words, occasionally an href.
var htmlDoc = fc.array(
  fc.record({
    tag: fc.constantFrom.apply(fc, TAGS),
    href: fc.constantFrom.apply(fc, HREFS),
    text: fc.array(fc.constantFrom.apply(fc, WORDS), { minLength: 0, maxLength: 12 })
      .map(function (t) { return t.join(' '); }),
  }),
  { minLength: 1, maxLength: 8 }
).map(function (parts) {
  return parts.map(function (p) {
    return '<' + p.tag + p.href + '>' + p.text + '</' + p.tag + '>';
  }).join('\n');
});

// Adversarial blobs: fragments that historically break linters and regex
// rules — unclosed tags, entities, null bytes, script/style bodies.
var HOSTILE_BITS = [
  '<', '>', '</', ']]>', '<!--', '-->', '&', '&amp;', '&lt;', '&gt;', '&quot;',
  '&#65;', '&#x41;', '&unknown;', '"', "'", '\u0000', '\uFFFD', 'javascript:',
  '<script>', '</script>', '<style>', '</style>', '<p', 'a'.repeat(500),
  '<h1>' + '<'.repeat(40), '&' .repeat(30),
];
var hostileDoc = fc.array(
  fc.constantFrom.apply(fc, HOSTILE_BITS),
  { minLength: 1, maxLength: 40 }
).map(function (bits) { return bits.join(''); });

var anyDoc = fc.oneof(htmlDoc, hostileDoc, fc.constant(''));

// ── properties ───────────────────────────────────────────────────────

console.log('\nextract.js fast-check properties:');

test('never crashes on generated documents, and always returns a title', function () {
  fc.assert(fc.property(anyDoc, function (html) {
    var c = extractContent(html, 'prop.html');
    assert.strictEqual(typeof c.title, 'string', 'title must be a string');
    assert.ok(c.title.length > 0, 'title must never be empty');
    assert.ok(Array.isArray(c.numbers), 'numbers must be an array');
    assert.ok(Array.isArray(c.dates), 'dates must be an array');
    assert.ok(Array.isArray(c.emails), 'emails must be an array');
    assert.ok(Array.isArray(c.anchors), 'anchors must be an array');
    assert.ok(Array.isArray(c.links), 'links must be an array');
  }), { numRuns: 300 });
});

test('extraction is a pure function (same input, same output)', function () {
  fc.assert(fc.property(anyDoc, function (html) {
    var a = JSON.stringify(extractContent(html, 'same.html'));
    var b = JSON.stringify(extractContent(html, 'same.html'));
    assert.strictEqual(a, b, 'two runs must agree byte for byte');
  }), { numRuns: 100 });
});

test('never invents emails — every extracted email exists in the rendered source', function () {
  fc.assert(fc.property(htmlDoc, function (html) {
    var decoded = decode(html);
    var c = extractContent(html, 'prop.html');
    for (var j = 0; j < c.emails.length; j++) {
      assert.ok(decoded.indexOf(c.emails[j]) >= 0,
        'email "' + c.emails[j] + '" not present in rendered source');
    }
  }), { numRuns: 200 });
});

test('never invents numbers — every extracted number appears in the source', function () {
  fc.assert(fc.property(htmlDoc, function (html) {
    var c = extractContent(html, 'prop.html');
    for (var j = 0; j < c.numbers.length; j++) {
      assert.ok(html.indexOf(c.numbers[j]) >= 0,
        'number "' + c.numbers[j] + '" not present in source');
    }
  }), { numRuns: 200 });
});

test('never invents links — every extracted href is in the source', function () {
  fc.assert(fc.property(htmlDoc, function (html) {
    var c = extractContent(html, 'prop.html');
    for (var j = 0; j < c.links.length; j++) {
      var entry = c.links[j];
      var href = typeof entry === 'string' ? entry : (entry && (entry.href || entry.url));
      assert.ok(href, 'link entries must carry an href (got: ' + JSON.stringify(entry) + ')');
      assert.ok(decode(html).indexOf(href) >= 0,
        'href "' + href + '" not present in source');
    }
  }), { numRuns: 200 });
});

test('hostile blobs never crash or hang', function () {
  fc.assert(fc.property(hostileDoc, function (html) {
    var c = extractContent(html, 'hostile.html');
    assert.strictEqual(typeof c.title, 'string', 'title must survive hostile input');
  }), { numRuns: 200 });
});

test('script and style bodies do not leak into headings', function () {
  var c = extractContent(
    '<style>.x{color:#f00}</style><script>var budget=42;</script><h1>Real Title</h1>',
    'leak.html'
  );
  assert.strictEqual(c.title, 'Real Title');
  assert.ok(!JSON.stringify(c.headings).match(/budget|color/), 'code must not become a heading');
});

test('empty and whitespace-only documents degrade gracefully', function () {
  fc.assert(fc.property(fc.constantFrom('', '   ', '\n\t\n', '<!-- nothing -->', '<!doctype html>'), function (html) {
    var c = extractContent(html, 'empty.html');
    assert.ok(c.title.length > 0, 'fallback title must exist for: ' + JSON.stringify(html));
  }), { numRuns: 50 });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);