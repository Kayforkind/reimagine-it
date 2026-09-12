/**
 * Unit tests for the extension surface (manifest integrity + popup wiring).
 * Run: node test/unit/extension.test.js
 * No test framework — Node's built-in assert module.
 *
 * The popup logic runs in a vm sandbox with a stubbed chrome API and the
 * REAL bundled engine, so a manifest edit, an icon deletion, a bundle API
 * rename, or a popup regression fails here before it ships.
 *
 * Engine contract (verified against src, pinned here):
 *   extractContent(html, label) -> content object
 *   generate({content, token, seed}) -> HTML string
 *   autoGenerate(content, {seed})    -> { output: HTML string, ... }
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

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

var EXT = path.resolve(__dirname, '..', '..', 'extension');
var ROOT = path.resolve(EXT, '..');

console.log('\nextension surface:');

// ── manifest integrity ──────────────────────────────────────────────

var manifest = JSON.parse(fs.readFileSync(path.join(EXT, 'manifest.json'), 'utf8'));

test('manifest is valid MV3 with minimal permissions', function () {
  assert.strictEqual(manifest.manifest_version, 3);
  assert.ok(manifest.name && manifest.version, 'name and version required');
  assert.deepStrictEqual(manifest.permissions.sort(), ['activeTab', 'scripting'],
    'permissions must stay minimal — no tabs/storage/host access');
});

test('every manifest-referenced file exists (popup, icons)', function () {
  assert.ok(fs.existsSync(path.join(EXT, manifest.action.default_popup)), 'popup.html missing');
  [manifest.action.default_icon, manifest.icons].forEach(function (set, i) {
    Object.keys(set).forEach(function (size) {
      assert.ok(fs.existsSync(path.join(EXT, set[size])),
        'icon ' + size + 'px missing (set ' + i + '): ' + set[size]);
    });
  });
});

test('extension version matches package.json (one version everywhere)', function () {
  var pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.strictEqual(manifest.version, pkg.version,
    'extension/manifest.json version must track package.json');
});

// ── bundle cross-check (the real engine, as the browser loads it) ───

var bundleSource = fs.readFileSync(path.join(EXT, 'engine.js'), 'utf8');
var sandboxWindow = {};
vm.createContext(sandboxWindow);
// `window` must exist BEFORE the bundle evaluates — its UMD tail assigns
// the API onto window when it is defined.
vm.runInContext('this.window = this;\n' + bundleSource, sandboxWindow, { filename: 'extension/engine.js' });

test('bundled engine exposes the API the popup consumes', function () {
  var engine = sandboxWindow.window;
  assert.ok(engine.ReimagineExtract, 'ReimagineExtract missing from the bundle');
  assert.ok(engine.ReimagineGenerate, 'ReimagineGenerate missing from the bundle');
  assert.ok(engine.ReimagineAuto, 'ReimagineAuto missing from the bundle');
  assert.strictEqual(typeof engine.ReimagineExtract.extractContent, 'function', 'ReimagineExtract.extractContent');
  assert.strictEqual(typeof engine.ReimagineGenerate.generate, 'function', 'ReimagineGenerate.generate');
  assert.strictEqual(typeof engine.ReimagineAuto.autoGenerate, 'function', 'ReimagineAuto.autoGenerate');
});

test('engine return contract: generate() is a string, autoGenerate() has .output', function () {
  var engine = sandboxWindow.window;
  var probe = engine.ReimagineExtract.extractContent(
    '<h1>Probe</h1><p>Probe page with the number 7 and one anchor.</p>', 'probe.html');
  var html = engine.ReimagineGenerate.generate({ content: probe, token: 'webpage', seed: 1 });
  assert.strictEqual(typeof html, 'string',
    'generate() must return a string — the popup passes it straight into Blob');
  var auto = engine.ReimagineAuto.autoGenerate(probe, { seed: 1 });
  assert.strictEqual(typeof auto.output, 'string',
    'autoGenerate() must return {output: string} — the popup reads .output');
});

test('popup consumes exactly the bundle API names (cross-checked)', function () {
  var popupSource = fs.readFileSync(path.join(EXT, 'popup.js'), 'utf8');
  ['ReimagineExtract', 'ReimagineGenerate', 'ReimagineAuto'].forEach(function (name) {
    assert.ok(popupSource.indexOf(name) !== -1, 'popup never references ' + name);
  });
  assert.ok(/engine\.extract\.extractContent/.test(popupSource), 'extractContent call shape');
  assert.ok(/engine\.generate\.generate/.test(popupSource), 'generate call shape');
  assert.ok(/engine\.auto\.autoGenerate/.test(popupSource), 'autoGenerate call shape');
});

test('popup.html loads engine.js before popup.js (load order)', function () {
  var html = fs.readFileSync(path.join(EXT, 'popup.html'), 'utf8');
  var engineAt = html.indexOf('src="engine.js"');
  var popupAt = html.indexOf('src="popup.js"');
  assert.ok(engineAt !== -1 && popupAt !== -1, 'both scripts referenced');
  assert.ok(engineAt < popupAt, 'engine.js must load before popup.js');
});

// ── popup behavior in a sandbox (stubbed chrome, real engine) ───────

var PAGE = '<!doctype html><html><head><title>Harbor Cafe</title></head><body>'
  + '<h1>Harbor Cafe</h1>'
  + '<p>Harbor Cafe opened in 1998 and serves 12 daily soups at 7 Dock Street.</p>'
  + '<p>Reservations are available by phone for parties of six or more guests.</p>'
  + '<ul><li>Clam chowder</li><li>Sourdough rolls</li></ul>'
  + '<a href="https://harbor.example/menu">Menu</a></body></html>';

function makeSandbox() {
  var createdTabs = [];
  var createdBlobs = [];
  var listeners = {};

  var elementCounter = 0;
  function makeElement(domId) {
    var el = {
      id: domId || 'el' + (++elementCounter),
      className: '',
      textContent: '',
      dataset: {},
      children: [],
      appendChild: function (child) { el.children.push(child); },
      classList: {
        remove: function () { el.active = false; },
        add: function () { el.active = true; },
      },
      addEventListener: function (type, fn) { listeners[el.id + ':' + type] = fn; },
      disabled: false,
    };
    return el;
  }

  var runBtn = makeElement('runBtn');
  runBtn.disabled = false;
  var info = makeElement('extractInfo');

  var documentStub = {
    getElementById: function (id) {
      if (id === 'runBtn') return runBtn;
      if (id === 'extractInfo') return info;
      return makeElement();
    },
    createElement: function () { return makeElement(); },
    querySelectorAll: function () { return []; },
  };

  var chromeStub = {
    runtime: { lastError: null },
    tabs: {
      query: function (opts, cb) { cb([{ id: 42 }]); },
      create: function (props) { createdTabs.push(props.url); },
    },
    scripting: {
      executeScript: function (opts, cb) {
        void opts;
        // Mirrors the injected collector's contract for the fixture page:
        // title, up to 8 paragraphs >20 chars, up to 16 list items, and the
        // truncated document HTML.
        cb([{
          result: {
            title: 'Harbor Cafe',
            paras: ['Harbor Cafe opened in 1998 and serves 12 daily soups at 7 Dock Street.'],
            items: ['Clam chowder', 'Sourdough rolls'],
            sourceHtml: PAGE,
          },
        }]);
      },
    },
  };

  var sandbox = {
    document: documentStub,
    chrome: chromeStub,
    Blob: function Blob(parts, opts) {
      this.parts = parts;
      this.type = opts && opts.type;
      createdBlobs.push(parts);
    },
    URL: { createObjectURL: function () { return 'blob:reimagine-test'; } },
  };
  sandbox.window = sandbox;
  sandbox.__listeners = listeners;
  sandbox.__createdTabs = createdTabs;
  sandbox.__createdBlobs = createdBlobs;
  return sandbox;
}

/** Count elements with className 'val' anywhere below `el` (rows wrap spans). */
function countValElements(el) {
  var n = 0;
  (el.children || []).forEach(function (child) {
    if (child.className === 'val') n++;
    n += countValElements(child);
  });
  return n;
}

test('popup end-to-end: extract renders signals, Run opens one blob tab', function () {
  var sandbox = makeSandbox();
  vm.createContext(sandbox);
  // Load order mirrors the real popup: engine.js first, then popup.js, in
  // one context — otherwise window.Reimagine* never exist.
  vm.runInContext('this.window = this;\n' + fs.readFileSync(path.join(EXT, 'engine.js'), 'utf8'),
    sandbox, { filename: 'extension/engine.js' });
  vm.runInContext(fs.readFileSync(path.join(EXT, 'popup.js'), 'utf8'),
    sandbox, { filename: 'extension/popup.js' });

  var info = sandbox.document.getElementById('extractInfo');
  assert.ok(countValElements(info) >= 4, 'extract signals rendered into #extractInfo');
  assert.strictEqual(sandbox.__createdTabs.length, 0, 'no tab opened before Run');

  var runHandler = sandbox.__listeners['runBtn:click'];
  assert.strictEqual(typeof runHandler, 'function', 'Run button listener registered');
  runHandler();
  assert.strictEqual(sandbox.__createdTabs.length, 1, 'Run opens exactly one tab');
  assert.ok(/^blob:/.test(sandbox.__createdTabs[0]), 'result opens as a blob URL: ' + sandbox.__createdTabs[0]);
  var parts = sandbox.__createdBlobs[0];
  assert.ok(parts && typeof parts[0] === 'string',
    'blob carries a string, not an object (would render as [object Object])');
  assert.ok(parts[0].indexOf('Harbor Cafe') !== -1, 'blob carries the redesigned HTML with source anchors');
});

// ── determinism through the browser path ────────────────────────────

test('bundled engine generates deterministic output (seeded)', function () {
  var engine = sandboxWindow.window;
  var content = engine.ReimagineExtract.extractContent(PAGE, 'harbor.html');
  var a = engine.ReimagineGenerate.generate({ content: content, token: 'webpage', seed: 99 });
  var b = engine.ReimagineGenerate.generate({ content: content, token: 'webpage', seed: 99 });
  assert.strictEqual(typeof a, 'string', 'generate() returns the HTML string');
  assert.strictEqual(a, b, 'same seed must be byte-identical through the bundle');
  assert.ok(a.indexOf('Harbor Cafe') !== -1, 'source anchors survive the browser path');
  var auto = engine.ReimagineAuto.autoGenerate(content, { seed: 99 });
  assert.strictEqual(typeof auto.output, 'string', 'autoGenerate().output is the HTML string');
  assert.ok(auto.output.indexOf('Harbor Cafe') !== -1, 'auto path preserves source anchors');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
