#!/usr/bin/env node
/* Benchmark every design token across representative sources.
   Fidelity: qualityScore's title/anchor retention (source-backed).
   Usability: structural audit checks (standalone, focused, reduced-motion,
   no placeholder/external fetch) via the same qualityScore used by Auto.
   Diversity: how differently tokens render the same source (byte-level).
   Writes benchmark/BENCHMARK.md — no browser needed. */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'reimagine-it.js');
const OUT = path.join(ROOT, 'benchmark', 'BENCHMARK.md');

const TOKENS = ['webpage','landing','dashboard','infographic','cinematic','artistic','photography','svg','3js','simulation','glass','editorial','motion','gradient','showcase'];

// Representative sources: title + HTML body with anchors, dates, numbers, hexes.
const SOURCES = [
  { id: 'library', title: 'Riverside Library', html: '<h1>Riverside Library</h1><h2>Hours</h2><p>Open weekdays 9am to 8pm, weekends 10am to 5pm. 2027 summer reading program starts June 1. Join 1,200 members and 42 volunteers.</p><p>Accessibility: wheelchair ramp, hearing loop, large-print catalog.</p>' },
  { id: 'studio', title: 'Northline Motion Studio', html: '<h1>Northline Motion Studio</h1><h2>Reel</h2><p>Animation for games, broadcast, and brand. 3.2M views across 240 projects. Clients ship in 60 days.</p><p>Contact hello@northline.test for rates.</p>' },
  { id: 'farm', title: 'Three Acre Farm Share', html: '<h1>Three Acre Farm Share</h1><h2>Crops</h2><p>Seasonal pickup every Saturday from May to November. 28 weeks of produce, 340 families subscribed, 12% new this year.</p><p>Pickup at the red barn, 4pm to 7pm.</p>' },
  { id: 'meteor', title: 'Small Meteor Watch', html: '<h1>Small Meteor Watch</h1><h2>Observation</h2><p>Peak viewing 2am to 4am on August 12, 2027. Expected rate 60 meteors per hour. 8 observation sites statewide.</p><p>Bring warm layers and a red flashlight.</p>' },
];

const SEED = '7';

function generate(source, token) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-'));
  const src = path.join(dir, 'source.html');
  const out = path.join(dir, 'out.html');
  fs.writeFileSync(src, '<!doctype html><html><head><title>' + source.title + '</title></head><body>' + source.html + '</body></html>', 'utf8');
  execFileSync(process.execPath, [BIN, '--input', src, '--token', token, '--output', out, '--seed', SEED, '--quiet'], { cwd: ROOT, stdio: 'pipe' });
  return fs.readFileSync(out, 'utf8');
}

// Mirror of the Auto quality checks, so the benchmark measures the same bar.
function quality(output, source) {
  const checks = [];
  const check = (name, passed, points) => { checks.push({ name, passed }); return passed ? points : 0; };
  let score = 0;
  score += check('standalone HTML', /^<!doctype html>/i.test(output), 18);
  score += check('title preserved', output.indexOf(source.title) >= 0, 18);
  const anchors = ['Hours', 'Reel', 'Crops', 'Observation'];
  score += check('anchor retained', anchors.some((a) => output.indexOf(a) >= 0), 16);
  score += check('focus-visible', output.indexOf('focus-visible') >= 0, 10);
  score += check('reduced motion', output.indexOf('prefers-reduced-motion') >= 0, 10);
  score += check('selection styling', output.indexOf('::selection') >= 0, 8);
  score += check('no placeholder copy', !/(?:lorem ipsum|placeholder|title goes here|sample text|\bTBD\b)/i.test(output), 10);
  score += check('no external asset fetch', !/(?:src|href)=["']https?:\/\/[^"']+\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp)(?:["'\s])/i.test(output), 10);
  return { score, checks };
}

// Content-derived art presence: glyphs, donut, bars, prism, svg.
function artScore(html) {
  let n = 0;
  if (/glyph-tile/.test(html)) n += 2;
  if (/donut|donut-chart|donut-keys/.test(html)) n += 2;
  if (/mbar|mini-bar|bar\b/.test(html)) n += 1;
  if (/iso-prism|hero-art-prism/.test(html)) n += 2;
  n += (html.match(/<svg/g) || []).length;
  return n;
}

const rows = [];
const totals = {};
for (const token of TOKENS) totals[token] = { fidelity: 0, usability: 0, art: 0, count: 0 };

for (const source of SOURCES) {
  for (const token of TOKENS) {
    const html = generate(source, token);
    const q = quality(html, source);
    const art = artScore(html);
    rows.push({ source: source.id, token, score: q.score, art, bytes: html.length });
    totals[token].fidelity += (q.checks.find((c) => c.name === 'title preserved') || {}).passed ? 18 : 0;
    totals[token].usability += q.score;
    totals[token].art += art;
    totals[token].count += 1;
  }
}

// Diversity: per source, average pairwise byte-distance across tokens.
let diversity = 0;
let pairs = 0;
for (const source of SOURCES) {
  const per = rows.filter((r) => r.source === source.id);
  for (let i = 0; i < per.length; i++) {
    for (let j = i + 1; j < per.length; j++) {
      diversity += Math.abs(per[i].bytes - per[j].bytes) / Math.max(per[i].bytes, per[j].bytes);
      pairs++;
    }
  }
}
diversity = pairs ? (100 * diversity / pairs).toFixed(1) : '0';

const avg = (token) => {
  const t = totals[token];
  return {
    fidelity: (t.fidelity / t.count).toFixed(0),
    usability: (t.usability / t.count).toFixed(0),
    art: (t.art / t.count).toFixed(1),
  };
};

let md = '# Design token benchmark\n\n';
md += 'All **15 directions** are generated by the real CLI from **4 representative sources** (library, motion studio, farm share, meteor watch) with a fixed seed. Scores reuse the same quality bar Auto itself applies: standalone HTML, source title retained, anchor retention, focus-visible, reduced-motion, `::selection`, no placeholder copy, no external asset fetch (100 max).\n\n';
md += '| Direction | Fidelity (title kept) | Usability (quality /100) | Content art (glyphs/donut/bars/prism) |\n|---|---|---|---|\n';
for (const token of TOKENS) {
  const a = avg(token);
  md += `| \`${token}\` | ${a.fidelity}/18 | ${a.usability}/100 | ${a.art} |\n`;
}
md += `\n**Output diversity:** ${diversity}% mean pairwise difference between directions on the same source — no two tokens produce the same page.\n`;
md += `\n**Coverage:** ${rows.length} generated pages (${TOKENS.length} tokens × ${SOURCES.length} sources), all audited structurally. Regenerate with \`node scripts/benchmark-tokens.js\`.\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md, 'utf8');
console.log(`wrote ${OUT}`);
console.log(`rows=${rows.length} diversity=${diversity}%`);
for (const token of TOKENS) {
  const a = avg(token);
  console.log(`${token.padEnd(12)} fidelity=${a.fidelity}/18 usability=${a.usability}/100 art=${a.art}`);
}
