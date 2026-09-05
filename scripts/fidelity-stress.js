#!/usr/bin/env node
/**
 * Stress the 80% source-fidelity floor across every committed source,
 * every token, and many seeds.
 *
 * Usage:
 *   node scripts/fidelity-stress.js             # 50 seeds per cell
 *   node scripts/fidelity-stress.js --seeds 250 # heavier run (CI weekly)
 */
const { extractContent } = require('../src/extract');
const { generate, TOKENS } = require('../src/generate');
const { sourceFidelity } = require('../src/result');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const seedsIdx = args.indexOf('--seeds');
const SEEDS = seedsIdx >= 0 ? Math.max(1, parseInt(args[seedsIdx + 1], 10) || 50) : 50;

const base = path.join(__dirname, '..', 'examples', 'end-users');
const slugs = fs.readdirSync(base)
  .filter((d) => !d.startsWith('.') && d !== 'auto-options')
  .filter((d) => fs.existsSync(path.join(base, d, 'source.html')));
const contents = slugs.map(s => ({
  slug: s,
  content: extractContent(fs.readFileSync(path.join(base, s, 'source.html'), 'utf8'), s + '.html'),
}));

let worst = 100, worstCell = '', violations = 0, runs = 0;
const byToken = {};
for (const { slug, content } of contents) {
  for (const token of TOKENS) {
    let tokenWorst = 100;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const out = generate({ content, token, seed: seed * 7919 });
      const fid = sourceFidelity(content, out).percentage;
      runs++;
      if (fid < tokenWorst) tokenWorst = fid;
      if (fid < worst) { worst = fid; worstCell = slug + '/' + token + ' seed ' + seed * 7919; }
      if (fid < 80) {
        violations++;
        if (violations <= 25) console.log('VIOLATION', slug + '/' + token, 'seed', seed * 7919, fid + '%');
      }
    }
    byToken[token] = Math.min(byToken[token] ?? 100, tokenWorst);
  }
}
console.log('sources:', slugs.length, '| seeds per cell:', SEEDS);
console.log('runs:', runs, '| violations <80%:', violations);
console.log('worst cell:', worstCell, worst + '%');
console.log('per-token worst:', Object.entries(byToken).map(([t, w]) => t + '=' + w + '%').join(' '));
