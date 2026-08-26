#!/usr/bin/env node
/* Headless render audit: for each token, render the generated page in Chrome
   and verify (a) the body has visible text, (b) no horizontal overflow, (c) a
   heading exists. Uses the local dev server (127.0.0.1:4191) so the probe
   iframe is same-origin. */
'use strict';
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'reimagine-it.js');
const SOURCE = path.join(ROOT, 'examples', 'end-users', 'tide-letter', 'source.html');
const TOKENS = ['webpage','landing','dashboard','infographic','cinematic','artistic','photography','svg','3js','simulation','glass','editorial','motion','gradient'];
const AUDIT_DIR = path.join(ROOT, 'docs', '_audit');
const BASE = 'http://127.0.0.1:4191/docs/_audit/';

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
if (!CHROME) { console.error('no chrome'); process.exit(2); }

fs.mkdirSync(AUDIT_DIR, { recursive: true });
let failures = 0;

for (const token of TOKENS) {
  const htmlPath = path.join(AUDIT_DIR, `${token}.html`);
  execFileSync(process.execPath, [BIN, '--input', SOURCE, '--token', token, '--output', htmlPath, '--seed', '7', '--quiet'], { cwd: ROOT, stdio: 'pipe' });
}
fs.writeFileSync(path.join(AUDIT_DIR, 'probe.html'), `<!doctype html><html><head><meta charset="utf-8"><script>
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
<\/script><\/head><body style="margin:0"><iframe id="f" src="__TOKEN__.html" style="width:1200px;height:900px;border:0"></iframe><p>REPORT timeout</p></body></html>`);

for (const token of TOKENS) {
  const probeSrc = fs.readFileSync(path.join(AUDIT_DIR, 'probe.html'), 'utf8').replace('__TOKEN__', token);
  fs.writeFileSync(path.join(AUDIT_DIR, 'probe.html'), probeSrc);
  const out = spawnSync(CHROME, ['--headless', '--no-sandbox', '--disable-extensions', '--disable-background-networking',
    '--virtual-time-budget=4000', '--dump-dom', BASE + 'probe.html'], { encoding: 'utf8', timeout: 30000 });
  const dom = out.stdout || '';
  const ms = dom.match(/REPORT[^<]*/g);
  const report = ms ? ms[ms.length - 1] : 'no report';
  if (/error/i.test(report)) {
    failures++;
    console.log(`FAIL ${token}: ${report}`);
  } else if (/text=0|overflow=1|h1=0/.test(report)) {
    failures++;
    console.log(`FAIL ${token}: ${report}`);
  } else {
    console.log(`ok   ${token}: ${report}`);
  }
}

fs.rmSync(AUDIT_DIR, { recursive: true, force: true });
console.log(failures ? `${failures} render failure(s)` : 'all 14 tokens render clean');
process.exit(failures ? 1 : 0);
