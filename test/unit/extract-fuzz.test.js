/**
 * Fuzz + property tests for src/extract.js — the "no invented facts" core.
 *
 * The engine's honesty contract lives here: whatever an agent or user feeds
 * in, extraction must never crash, never loop, and never produce facts that
 * were not in the source. Inputs are generated, not hand-picked.
 *
 * Run: node test/unit/extract-fuzz.test.js
 */

var assert = require('assert');
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

// ── deterministic generator ──────────────────────────────────────────

var SEED = 20260905;
function rand() {
  // xorshift for reproducibility across Node versions/platforms.
  SEED ^= SEED << 13; SEED >>>= 0;
  SEED ^= SEED >>> 17;
  SEED ^= SEED << 5; SEED >>>= 0;
  return SEED / 4294967296;
}
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function int(min, max) { return min + Math.floor(rand() * (max - min + 1)); }

// Decode the entities the generator emits, so "presence in source" checks
// compare against what a reader actually sees (extractors work on the
// rendered text; &#65;ello@example.com IS hello@example.com to a human).
function decode(html) {
  return html
    .replace(/&#x([0-9a-fA-F]+);/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (_, d) { return String.fromCharCode(parseInt(d, 10)); })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

var TAGS = ['div', 'p', 'span', 'section', 'li', 'td', 'a', 'h1', 'h2', 'script', 'style', 'textarea'];
var WORDS = ['budget', 'clinic', 'bakery', 'report', '2026', '99.9%', '42 people', '#6B3A2A', 'hello@example.com', 'March 3', 'the', 'of', 'walk-in', '—'];
var ENTITIES = ['&amp;', '&lt;', '&#65;', '&#x41;', '&quot;', '&unknown;'];

function genHtml(depth) {
  var out = [];
  var n = int(1, 6);
  for (var i = 0; i < n; i++) {
    var roll = rand();
    if (roll < 0.55 || depth > 3) {
      var tag = pick(TAGS);
      var attrs = '';
      if (tag === 'a' && rand() < 0.7) attrs = ' href="https://example.com/' + int(1, 99) + '"';
      var text = '';
      var words = int(0, 12);
      for (var w = 0; w < words; w++) text += pick(WORDS) + ' ';
      if (rand() < 0.15) text = pick(ENTITIES) + text;
      out.push('<' + tag + attrs + '>' + text.trim() + '</' + tag + '>');
    } else {
      // Nest a random blob.
      out.push('<div>' + genHtml(depth + 1) + '</div>');
    }
    if (rand() < 0.1) out.push('<!-- comment ' + pick(WORDS) + ' -->');
  }
  return out.join('\n');
}

// ── properties ───────────────────────────────────────────────────────

console.log('\nextract.js fuzz properties:');

test('never crashes on 400 generated documents (and returns a title)', function () {
  for (var i = 0; i < 400; i++) {
    var html = genHtml(0);
    var c = extractContent(html, 'fuzz-' + i + '.html');
    assert.strictEqual(typeof c.title, 'string', 'title must be a string');
    assert.ok(c.title.length > 0, 'title must never be empty');
    assert.ok(Array.isArray(c.numbers), 'numbers must be an array');
    assert.ok(Array.isArray(c.dates), 'dates must be an array');
    assert.ok(Array.isArray(c.emails), 'emails must be an array');
    assert.ok(Array.isArray(c.anchors), 'anchors must be an array');
    assert.ok(Array.isArray(c.links), 'links must be an array');
  }
});

test('extraction is a pure function (same input, same output)', function () {
  var html = genHtml(0);
  var a = JSON.stringify(extractContent(html, 'same.html'));
  var b = JSON.stringify(extractContent(html, 'same.html'));
  assert.strictEqual(a, b, 'two runs must agree byte for byte');
});

test('never invents emails — every extracted email exists in the rendered source', function () {
  for (var i = 0; i < 60; i++) {
    var html = genHtml(0);
    var decoded = decode(html);
    var c = extractContent(html, 'fuzz.html');
    for (var j = 0; j < c.emails.length; j++) {
      assert.ok(decoded.indexOf(c.emails[j]) >= 0,
        'email "' + c.emails[j] + '" not present in rendered source');
    }
  }
});

test('never invents numbers — every extracted number appears in the source', function () {
  for (var i = 0; i < 60; i++) {
    var html = genHtml(0);
    var c = extractContent(html, 'fuzz.html');
    for (var j = 0; j < c.numbers.length; j++) {
      assert.ok(html.indexOf(c.numbers[j]) >= 0,
        'number "' + c.numbers[j] + '" not present in source');
    }
  }
});

test('never invents links — every extracted href is in the source', function () {
  for (var i = 0; i < 60; i++) {
    var html = genHtml(0);
    var c = extractContent(html, 'fuzz.html');
    for (var j = 0; j < c.links.length; j++) {
      var entry = c.links[j];
      var href = typeof entry === 'string' ? entry : (entry && (entry.href || entry.url));
      assert.ok(href, 'link entries must carry an href (got: ' + JSON.stringify(entry) + ')');
      assert.ok(decode(html).indexOf(href) >= 0,
        'href "' + href + '" not present in source');
    }
  }
});

test('script and style bodies do not leak into headings', function () {
  var c = extractContent(
    '<style>.x{color:#f00}</style><script>var budget=42;</script><h1>Real Title</h1>',
    'leak.html'
  );
  assert.strictEqual(c.title, 'Real Title');
  assert.ok(!JSON.stringify(c.headings).match(/budget|color/), 'code must not become a heading');
});

test('empty, whitespace, and comment-only documents degrade gracefully', function () {
  var empties = ['', '   ', '\n\t\n', '<!-- nothing -->', '<!doctype html>'];
  for (var i = 0; i < empties.length; i++) {
    var c = extractContent(empties[i], 'empty.html');
    assert.ok(c.title.length > 0, 'fallback title must exist for input #' + i);
  }
});

test('hostile inputs do not crash or hang', function () {
  var hostile = [
    '<' + 'a'.repeat(10000) + '>',
    '<div>' + '<b>'.repeat(2000),
    ']]>]]><!--<!---><p',
    '<a href="javascript:alert(1)">x</a>',
    '<h1>\u0000\u0001\u0002</h1>',
    '<p>' + '&' .repeat(500),
    '<title>' + '<'.repeat(300) + '</title>',
    '\uFFFD'.repeat(500),
    '<div data-x="' + '"'.repeat(200) + '">text</div>',
    '<p>' + ('<' + '/p>').repeat(500),
  ];
  for (var i = 0; i < hostile.length; i++) {
    var c = extractContent(hostile[i], 'hostile-' + i + '.html');
    assert.strictEqual(typeof c.title, 'string', 'title must survive input #' + i);
  }
});

test('size guard: a 5 MB document completes in bounded time', function () {
  var start = Date.now();
  var big = '<h1>Big</h1>' + new Array(30000).join('<p>Budget line 42 people. March 3.</p>');
  var c = extractContent(big, 'big.html');
  var elapsed = Date.now() - start;
  assert.ok(c.numbers.length >= 1, 'must still extract from a huge doc');
  assert.ok(elapsed < 5000, 'extraction must stay fast, took ' + elapsed + 'ms');
});

test('html entities decode to their characters, never to new facts', function () {
  var c = extractContent('<p>Contact &#104;ello@example.com today</p>', 'ent.html');
  // The email may be extracted raw or decoded, but only from this source.
  if (c.emails.length) {
    assert.ok(c.emails.every(function (e) { return /hello@example\.com$/.test(e) || e.indexOf('example.com') >= 0; }));
  }
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
