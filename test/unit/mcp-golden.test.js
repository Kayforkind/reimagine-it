/**
 * MCP golden fixtures — canonical responses for every advertised tool.
 * Run: node test/unit/mcp-golden.test.js
 * Regenerate: REIMAGINE_UPDATE_GOLDEN=1 node test/unit/mcp-golden.test.js
 *
 * These guard the host-facing contract: an accidental tool rename, a dropped
 * response field, or a changed argument shape breaks every MCP host
 * integration silently. The golden file is committed; a diff means the tool
 * surface changed and must be a conscious, documented decision.
 *
 * Volatile fields (timestamps, version strings) are redacted on both sides
 * before comparison; everything else must match byte-for-byte after JSON
 * canonicalization.
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var tools = require('../../mcp/tools');

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

var GOLDEN = path.resolve(__dirname, 'fixtures', 'mcp-golden.json');

console.log('\nmcp golden fixtures:');

// ── canonical inputs ────────────────────────────────────────────────

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

var CASES = {
  reimagine: { html: SOURCE, token: 'webpage', seed: 42 },
  design_auto: { html: SOURCE, seed: 42 },
  design_variations: { html: SOURCE, seed: 42, count: 2, includeHtml: true },
  design_lock: { html: BRAND, name: 'golden-lock' },
  extract_content: { html: SOURCE },
  list_tokens: {},
  audit_html: { html: SOURCE, path: 'golden.html' },
  list_rules: {},
};

// ── canonicalization ────────────────────────────────────────────────

var VOLATILE_KEY = /^(version|lockVersion|createdAt|updatedAt)$/i;
var ISO_DATE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g;

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    var out = {};
    Object.keys(value).sort().forEach(function (key) {
      out[key] = VOLATILE_KEY.test(key) ? '<redacted>' : redact(value[key]);
    });
    return out;
  }
  if (typeof value === 'string') {
    return value.replace(ISO_DATE, '<date>');
  }
  return value;
}

function snapshot(name) {
  var result = tools.callTool(name, CASES[name]);
  assert.ok(result && Array.isArray(result.content), name + ' returned no content blocks');
  assert.ok(!result.isError, name + ' errored: ' + (result.content[0] && result.content[0].text));
  return {
    tool: name,
    args: CASES[name],
    contentTypes: result.content.map(function (block) { return block.type; }),
    blocks: result.content.map(function (block) { return redact(block.text); }),
  };
}

// ── the golden contract ─────────────────────────────────────────────

test('every advertised tool has a golden case', function () {
  var names = tools.TOOLS.map(function (tool) { return tool.name; }).sort();
  var caseNames = Object.keys(CASES).sort();
  assert.deepStrictEqual(caseNames, names,
    'golden cases must cover exactly the advertised tool set');
});

var currentDescriptors = tools.TOOLS.map(function (tool) {
  return {
    name: tool.name,
    required: (tool.inputSchema && tool.inputSchema.required) || [],
    properties: Object.keys((tool.inputSchema && tool.inputSchema.properties) || {}).sort(),
  };
});

var fresh = { __descriptors: currentDescriptors };
Object.keys(CASES).forEach(function (name) { fresh[name] = snapshot(name); });

var existing = null;
try { existing = JSON.parse(fs.readFileSync(GOLDEN, 'utf8')); } catch (e) { /* first run */ }

if (!existing || process.env.REIMAGINE_UPDATE_GOLDEN) {
  fs.mkdirSync(path.dirname(GOLDEN), { recursive: true });
  fs.writeFileSync(GOLDEN, JSON.stringify(fresh, null, 2) + '\n');
  existing = fresh; // same-run comparisons now validate the file just written
  if (process.env.REIMAGINE_UPDATE_GOLDEN) {
    console.log('  \u21bb golden file regenerated: ' + GOLDEN);
  } else {
    test('golden file existed before the run', function () {
      throw new Error('golden file missing — commit ' + GOLDEN
        + ' (regenerate with REIMAGINE_UPDATE_GOLDEN=1 node test/unit/mcp-golden.test.js)');
    });
  }
}

test('tool responses match the committed golden fixtures', function () {
  assert.ok(existing, 'golden file must be committed');
  assert.deepStrictEqual(fresh, existing,
    'MCP tool surface drifted from the golden fixtures. If intentional, '
    + 'regenerate with REIMAGINE_UPDATE_GOLDEN=1 and document the change.');
});

test('golden descriptors: names, required args, and schemas stay stable', function () {
  assert.ok(existing, 'golden file must be committed');
  assert.deepStrictEqual(currentDescriptors, existing.__descriptors,
    'tool descriptors drifted — host configurations pin these shapes');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
