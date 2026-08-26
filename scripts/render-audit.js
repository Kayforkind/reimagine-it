#!/usr/bin/env node
/* Headless render audit: for each token, render the generated page in Chrome
   and verify (a) the body has visible text, (b) no horizontal overflow, (c) a
   heading exists. Self-contained: each token's HTML is inlined into a probe via
   an <iframe srcdoc> (same-origin by construction), so no server is needed —
   works locally on Windows and in CI on Ubuntu. */
'use strict';
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'reimagine-it.js');
const SOURCE = path.join(ROOT, 'examples', 'end-users', 'venator', 'source.html');
const TOKENS = ['webpage','landing','dashboard','infographic','cinematic','artistic','photography','svg','3js','simulation','glass','editorial','motion','gradient','showcase'];

const CHROME = [
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('no chrome found'); process.exit(2); }

function srcdocEscape(html) {
  return html.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const PROBE = (inner) => `<!doctype html><html><head><meta charset="utf-8"><script>
window.addEventListener('load', function(){
  var f = document.getElementById('f');
  var report;
  try {
    var d = f.contentDocument;
    var body = d.body;
    var text = body ? body.innerText.replace(/\\s+/g,' ').trim() : '';
    var overflow = d.documentElement.scrollWidth > f.clientWidth + 2;
    var h1 = !!d.querySelector('h1,h2');
    report = 'REPORT text=' + text.length + ' overflow=' + (overflow ? 1 : 0) + ' h1=' + (h1 ? 1 : 0) + ' title=' + JSON.stringify(d.title).slice(0, 40);
  } catch (e) { report = 'REPORT error=' + String(e).slice(0, 80); }
  document.body.textContent = report;
});
<\/script><\/head><body style="margin:0"><iframe id="f" srcdoc="${srcdocEscape(inner)}" style="width:1200px;height:900px;border:0"></iframe><p>REPORT timeout</p></body></html>`;

const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'render-audit-'));
let failures = 0;

for (const token of TOKENS) {
  const htmlPath = path.join(WORK, `${token}.html`);
  execFileSync(process.execPath, [BIN, '--input', SOURCE, '--token', token, '--output', htmlPath, '--seed', '7', '--quiet'], { cwd: ROOT, stdio: 'pipe' });
  const inner = fs.readFileSync(htmlPath, 'utf8');
  const probePath = path.join(WORK, 'probe.html');
  fs.writeFileSync(probePath, PROBE(inner));

  const out = spawnSync(CHROME, ['--headless', '--no-sandbox', '--disable-extensions', '--disable-background-networking',
    '--virtual-time-budget=4000', '--dump-dom', `file:///${probePath.replace(/\\/g, '/')}`], { encoding: 'utf8', timeout: 45000 });
  const ms = (out.stdout || '').match(/REPORT[^<]*/g);
  const report = ms ? ms[ms.length - 1] : (out.status === null ? 'chrome timeout' : 'no report');
  if (/error/i.test(report) || /text=0|overflow=1|h1=0/.test(report)) {
    failures++;
    console.log(`FAIL ${token}: ${report}`);
  } else {
    console.log(`ok   ${token}: ${report}`);
  }
}

fs.rmSync(WORK, { recursive: true, force: true });
console.log(failures ? `${failures} render failure(s)` : `all ${TOKENS.length} tokens render clean`);
process.exit(failures ? 1 : 0);
