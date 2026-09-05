#!/usr/bin/env node
/**
 * Guard: the docs site's claims must match reality.
 *
 * The landing page makes concrete, countable claims in its hero and body.
 * Each one is checked against the source of truth in this repo:
 *
 *   - "17 / Design tokens"        ← src/generate.js TOKENS.length
 *   - "9 / Committed journeys"    ← examples/end-users/ case folders
 *   - every token in the marquee  ← TOKENS, no missing, no stale
 *   - every token card            ← TOKENS, in roster order
 *   - all 19 health rules claim   ← scripts/audit.py rule registry
 *
 * Version-number drift is covered by scripts/check-version-sync.py; this
 * file covers the counts. Run: node scripts/check-site-claims.js
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const problems = [];

// --- sources of truth ----------------------------------------------------

const { TOKENS } = require(path.join(root, 'src', 'generate.js'));
const tokenCount = TOKENS.length;

const journeys = fs
  .readdirSync(path.join(root, 'examples', 'end-users'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('__'))
  .map((d) => d.name);
const journeyCount = journeys.length;

// --- the site ------------------------------------------------------------

const site = fs.readFileSync(path.join(root, 'docs', 'index.html'), 'utf8');

// 1. hero stat: tokens
const statTokens = site.match(
  /<span class="val">(\d+)<\/span><span class="lab">Design tokens<\/span>/
);
if (!statTokens) {
  problems.push('docs/index.html: the "Design tokens" hero stat is missing');
} else if (Number(statTokens[1]) !== tokenCount) {
  problems.push(
    `docs/index.html: hero says ${statTokens[1]} design tokens, engine has ${tokenCount} (TOKENS)`
  );
}

// 2. hero stat: journeys
const statJourneys = site.match(
  /<span class="val">(\d+)<\/span><span class="lab">Committed journeys<\/span>/
);
if (!statJourneys) {
  problems.push('docs/index.html: the "Committed journeys" hero stat is missing');
} else if (Number(statJourneys[1]) !== journeyCount) {
  problems.push(
    `docs/index.html: hero says ${statJourneys[1]} journeys, examples/end-users has ${journeyCount} (${journeys.join(', ')})`
  );
}

// 3. marquee lists exactly the real tokens, no stale entries
const marquee = site.match(/var tokens = \[([^\]]*)\]/);
if (!marquee) {
  problems.push('docs/index.html: the token marquee array is missing');
} else {
  const listed = marquee[1]
    .split(',')
    .map((s) => s.trim().replace(/^'|'$/g, ''))
    .filter(Boolean);
  for (const t of listed) {
    if (!TOKENS.includes(t)) problems.push(`marquee lists unknown token "${t}"`);
  }
  for (const t of TOKENS) {
    if (!listed.includes(t)) problems.push(`marquee is missing token "${t}"`);
  }
}

// 4. token gallery cards cover every token in roster order
const cardOrder = [...site.matchAll(/class="token-card[^"]*" data-token="([^"]+)"/g)].map(
  (m) => m[1]
);
if (JSON.stringify(cardOrder) !== JSON.stringify([...TOKENS])) {
  problems.push(
    `token gallery cards (${cardOrder.length}) do not match the roster (${tokenCount}) in order — got: ${cardOrder.join(',')}`
  );
}

// 5. stage-picker buttons cover every token (class token-btn, data-token=...)
const stageBtns = [...site.matchAll(/class="token-btn[^"]*" data-token="([^"]+)"/g)].map(
  (m) => m[1]
);
for (const t of TOKENS) {
  if (!stageBtns.includes(t)) problems.push(`stage picker is missing a button for "${t}"`);
}

// 6. the "Seventeen directions" heading and other written counts
const heading = site.match(/<h2>(\w+) directions\./);
if (heading) {
  const words = {
    Seventeen: 17, sixteen: 16, fifteen: 15,
  };
  if (heading[1] in words && words[heading[1]] !== tokenCount) {
    problems.push(
      `heading says "${heading[1]} directions" but the roster has ${tokenCount}`
    );
  }
}

// 7. the "19 rules" claim matches the Python audit registry (RULES codes)
const auditPy = fs.readFileSync(path.join(root, 'scripts', 'audit.py'), 'utf8');
const ruleCodes = [...auditPy.matchAll(/"code": "([A-Z]{3,4}-\d{2})"/g)].map((m) => m[1]);
const uniqueRules = new Set(ruleCodes);
if (!uniqueRules.size) {
  problems.push('could not parse the RULES registry from scripts/audit.py — is the format changed?');
}
const siteRules = [...site.matchAll(/(\d+)[ -]rule/g)].map((m) => Number(m[1]));
for (const claimed of siteRules) {
  if (uniqueRules.size && claimed !== uniqueRules.size) {
    problems.push(
      `site claims "${claimed} rules", audit registry defines ${uniqueRules.size}`
    );
  }
}

// --- verdict -------------------------------------------------------------

if (problems.length) {
  console.error('SITE CLAIMS GUARD FAILED:');
  for (const p of problems) console.error('  - ' + p);
  console.error(
    `\nFix docs/index.html (or the engine) so the page only claims what is true.`
  );
  process.exit(1);
}
console.log(
  `site claims OK — ${tokenCount} tokens, ${journeyCount} journeys, marquee/gallery/stage in roster order, ${uniqueRules.size} health rules`
);
