/* Stress the 80% source-fidelity floor: 9 sources x 15 tokens x 50 seeds. */
const { extractContent } = require('../src/extract');
const { generate, TOKENS } = require('../src/generate');
const { sourceFidelity } = require('../src/result');
const fs = require('fs');

const slugs = ['venator','crimson-circuit','velocita','maracuya','flick','meridian','horizon','hearth-grain','millbrook-budget'];
const SEEDS = 50;
const contents = slugs.map(s => ({
  slug: s,
  content: extractContent(fs.readFileSync('./examples/end-users/' + s + '/source.html', 'utf8'), s + '.html'),
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
console.log('runs:', runs, '| violations <80%:', violations);
console.log('worst cell:', worstCell, worst + '%');
console.log('per-token worst:', Object.entries(byToken).map(([t, w]) => t + '=' + w + '%').join(' '));
