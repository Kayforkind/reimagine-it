/**
 * Unit tests for the MCP tool surface (mcp/tools.js).
 * Run: node test/unit/mcp.test.js
 *
 * These exercise the real handlers with no MCP SDK installed. The tool module
 * is deliberately SDK-free precisely so this file can run everywhere; before
 * the split, a reference to an undefined helper sat in the auto path unnoticed
 * because nothing could import the server without the optional dependency.
 */

var assert = require('assert');
var tools = require('../../mcp/tools');
var RULES = require('../../src/audit').RULES;
var TOKENS = require('../../src/generate').TOKENS;

var passed = 0;
var failed = 0;

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

var SOURCE = [
  '<!doctype html><html><head><title>Northwind Atlas</title></head><body>',
  '<h1>Northwind Atlas</h1>',
  '<p>Northwind Atlas maps freight across 34 regions with 99.9% uptime.</p>',
  '<h2>How it works</h2>',
  '<p>Founded in 2019, the team ships weekly. Reach us at crew@northwind.example.</p>',
  '<h2>Pricing</h2>',
  '<p>Free under 5 seats. Pro from $49/mo.</p>',
  '<a href="https://northwind.example/docs">Read the docs</a>',
  '</body></html>',
].join('');

var BRAND = [
  '<!doctype html><html><head><title>House Style</title>',
  '<style>:root{--ground:#0b1020;--accent:#ff5c39;--muted:#8892a6;--surface:#151b2e;--ink:#f2f4f8}',
  'body{background:#0b1020;color:#f2f4f8;font-family:Georgia,serif}',
  'h1{font-size:64px}h2{font-size:32px}p{font-size:17px}</style></head><body>',
  '<h1>House Style</h1><p>A reference surface for the brand lock.</p></body></html>',
].join('');

/** Every handler returns MCP content blocks; pull the first as parsed JSON. */
function firstJson(result) {
  assert.ok(result && Array.isArray(result.content), 'result should have content blocks');
  assert.ok(!result.isError, 'expected success, got error: ' + result.content[0].text);
  return JSON.parse(result.content[0].text);
}

function htmlBlocks(result) {
  return result.content
    .map(function (block) { return block.text; })
    .filter(function (text) { return /^<!doctype html/i.test(text.trim()); });
}

// ── descriptors ─────────────────────────────────────────────────────

console.log('\nmcp/tools.js descriptors:');

test('every advertised tool has a handler', function () {
  tools.TOOLS.forEach(function (tool) {
    var result = tools.callTool(tool.name, { html: SOURCE });
    assert.ok(result && Array.isArray(result.content), tool.name + ' returned no content');
    assert.ok(
      !result.isError,
      tool.name + ' failed: ' + (result.content[0] && result.content[0].text)
    );
  });
});

test('descriptors declare required inputs and an object schema', function () {
  tools.TOOLS.forEach(function (tool) {
    assert.ok(tool.name, 'tool needs a name');
    assert.ok(tool.description && tool.description.length > 30, tool.name + ' needs a real description');
    assert.strictEqual(tool.inputSchema.type, 'object', tool.name + ' schema should be an object');
  });
});

test('unknown tool reports an error instead of throwing', function () {
  var result = tools.callTool('does_not_exist', {});
  assert.strictEqual(result.isError, true, 'should flag the error');
  var payload = JSON.parse(result.content[0].text);
  assert.ok(/Unknown tool/.test(payload.error), 'should name the problem');
  assert.ok(payload.available.length >= 8, 'should list the available tools');
});

test('bad arguments come back as an error result, not a crash', function () {
  var result = tools.callTool('reimagine', { html: SOURCE, token: 'not-a-token' });
  assert.strictEqual(result.isError, true, 'should flag the error');
  assert.ok(/unknown token/.test(JSON.parse(result.content[0].text).error), 'should explain why');
});

// ── reimagine ───────────────────────────────────────────────────────

console.log('\nreimagine:');

test('generates a standalone page and reports the design decision', function () {
  var result = tools.callTool('reimagine', { html: SOURCE, token: 'webpage', seed: 7 });
  var report = firstJson(result);
  assert.strictEqual(report.token, 'webpage', 'should echo the token');
  assert.strictEqual(report.seed, 7, 'should echo the seed');
  assert.strictEqual(report.title, 'Northwind Atlas', 'should carry the source title');
  assert.ok(report.quality.score > 0, 'should score the artifact');
  assert.ok(report.fidelity >= 60, 'should preserve most source facts, got ' + report.fidelity);
  assert.strictEqual(htmlBlocks(result).length, 1, 'should return exactly one page');
});

test('token "auto" routes through the auto path without crashing', function () {
  // This is the regression: the auto branch called an undefined helper.
  var report = firstJson(tools.callTool('reimagine', { html: SOURCE, token: 'auto', seed: 3 }));
  assert.strictEqual(report.mode, 'auto', 'should report auto mode');
  assert.ok(TOKENS.indexOf(report.token) >= 0, 'should choose a real token, got ' + report.token);
  assert.ok(report.rationale && report.rationale.length > 0, 'should explain the choice');
  assert.ok(report.reviewed >= 1, 'should report how many candidates it reviewed');
});

test('same seed produces the same page', function () {
  var a = htmlBlocks(tools.callTool('reimagine', { html: SOURCE, token: 'landing', seed: 11 }))[0];
  var b = htmlBlocks(tools.callTool('reimagine', { html: SOURCE, token: 'landing', seed: 11 }))[0];
  assert.strictEqual(a, b, 'seeded output should be deterministic');
});

test('audit flag attaches a Design Health report', function () {
  var report = firstJson(tools.callTool('reimagine', {
    html: SOURCE, token: 'webpage', seed: 5, audit: true,
  }));
  assert.ok(report.designHealth, 'should include the health report');
  assert.strictEqual(report.designHealth.rules, RULES.length, 'should run the whole registry');
  assert.strictEqual(report.designHealth.failures, 0, 'generated pages should clear their own floor');
});

// ── design_auto ─────────────────────────────────────────────────────

console.log('\ndesign_auto:');

test('returns a winning artifact with its reasoning', function () {
  var result = tools.callTool('design_auto', { html: SOURCE, seed: 42 });
  var report = firstJson(result);
  assert.strictEqual(report.mode, 'auto', 'should report auto mode');
  assert.ok(report.candidates.length >= 1, 'should list the candidates it weighed');
  assert.ok(report.candidates[0].score > 0, 'candidates should carry scores');
  assert.strictEqual(htmlBlocks(result).length, 1, 'should return the winner only');
});

// ── design_lock + ref ───────────────────────────────────────────────

console.log('\ndesign_lock:');

test('captures palette, voice, and a signature', function () {
  var lock = firstJson(tools.callTool('design_lock', { html: BRAND, name: 'house' }));
  assert.strictEqual(lock.name, 'house', 'should use the given name');
  assert.strictEqual(lock.palette.accent.toLowerCase(), '#ff5c39', 'should recover the accent');
  assert.ok(lock.signature, 'should carry a signature');
  assert.ok(lock.voice, 'should infer a typographic voice');
});

test('a captured lock can be applied back as ref', function () {
  var lock = firstJson(tools.callTool('design_lock', { html: BRAND, name: 'house' }));
  var report = firstJson(tools.callTool('reimagine', {
    html: SOURCE, token: 'webpage', seed: 9, ref: JSON.stringify(lock),
  }));
  assert.ok(report.lock, 'should report the applied lock');
  assert.strictEqual(report.lock.name, 'house', 'should name the lock');
  assert.ok(report.lock.applied.length > 0, 'should apply at least one field');
  assert.strictEqual(
    report.palette.accent.toLowerCase(), '#ff5c39',
    'locked accent should reach the output palette'
  );
});

test('ref also accepts raw HTML as a reverse-lock', function () {
  var report = firstJson(tools.callTool('reimagine', {
    html: SOURCE, token: 'webpage', seed: 9, ref: BRAND,
  }));
  assert.ok(report.lock, 'should reverse-lock from a page');
  assert.strictEqual(report.palette.accent.toLowerCase(), '#ff5c39', 'should adopt the brand accent');
});

test('locked output still keeps the new content, not the brand copy', function () {
  var html = htmlBlocks(tools.callTool('reimagine', {
    html: SOURCE, token: 'webpage', seed: 9, ref: BRAND,
  }))[0];
  assert.ok(html.indexOf('Northwind Atlas') >= 0, 'should keep the source title');
  assert.strictEqual(html.indexOf('A reference surface'), -1, 'should not import brand copy');
});

// ── design_variations ───────────────────────────────────────────────

console.log('\ndesign_variations:');

test('returns ranked directions plus a contrast sheet', function () {
  var result = tools.callTool('design_variations', { html: SOURCE, count: 3, seed: 21 });
  var summary = firstJson(result);
  assert.strictEqual(summary.count, 3, 'should honour the count');
  assert.strictEqual(summary.variations.length, 3, 'should return every direction');
  assert.strictEqual(summary.variations[0].rank, 1, 'should rank from 1');
  assert.ok(
    summary.variations[0].quality >= summary.variations[2].quality,
    'directions should be ordered strongest first'
  );
  var tokens = summary.variations.map(function (entry) { return entry.token; });
  assert.strictEqual(new Set(tokens).size, 3, 'directions should be distinct: ' + tokens.join(', '));
  // three directions + the sheet
  assert.strictEqual(htmlBlocks(result).length, 4, 'should return each page and the sheet');
});

test('includeHtml false returns the summary only', function () {
  var result = tools.callTool('design_variations', {
    html: SOURCE, count: 2, seed: 21, includeHtml: false,
  });
  assert.strictEqual(htmlBlocks(result).length, 0, 'should omit the pages');
  assert.strictEqual(firstJson(result).variations.length, 2, 'should still summarise them');
});

test('every direction and the contrast sheet clear Design Health', function () {
  var result = tools.callTool('design_variations', { html: SOURCE, count: 4, seed: 21 });
  var pages = htmlBlocks(result);
  assert.strictEqual(pages.length, 5, 'four directions plus the sheet');
  pages.forEach(function (html, index) {
    var report = firstJson(tools.callTool('audit_html', { html: html }));
    assert.strictEqual(
      report.failures, 0,
      'page ' + index + ' failed Design Health: ' +
        report.findings.map(function (f) { return f.code; }).join(', ')
    );
  });
});

// ── audit_html + list tools ─────────────────────────────────────────

console.log('\naudit_html:');

test('runs natively with no Python and reports every rule', function () {
  var report = firstJson(tools.callTool('audit_html', { html: SOURCE }));
  assert.strictEqual(report.rules, RULES.length, 'should run the whole registry');
  assert.ok(['CLEAN', 'WARNINGS', 'FAIL'].indexOf(report.verdict) >= 0, 'should give a verdict');
  assert.strictEqual(
    report.passed + report.findings.length, RULES.length,
    'passed plus findings should account for every rule'
  );
});

test('catches a page that breaks the craft floor', function () {
  var bad = '<html><body style="font-family:Comic Sans MS"><p>Lorem ipsum dolor sit amet.</p></body></html>';
  var report = firstJson(tools.callTool('audit_html', { html: bad }));
  assert.ok(report.findings.length > 0, 'should find problems in a bad page');
  assert.notStrictEqual(report.verdict, 'CLEAN', 'a broken page should not read as clean');
});

test('list_tokens covers every token plus auto', function () {
  var text = tools.callTool('list_tokens', {}).content[0].text;
  TOKENS.forEach(function (token) {
    assert.ok(text.indexOf(token) >= 0, 'should list ' + token);
  });
  assert.ok(text.indexOf('auto') >= 0, 'should list auto');
});

test('list_rules returns the registry', function () {
  var payload = firstJson(tools.callTool('list_rules', {}));
  assert.strictEqual(payload.rules, RULES.length, 'count should match the registry');
  assert.strictEqual(payload.registry.length, RULES.length, 'should return every rule');
  payload.registry.forEach(function (rule) {
    assert.ok(rule.code, 'each rule needs a code');
    assert.ok(rule.severity, 'each rule needs a severity');
  });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
