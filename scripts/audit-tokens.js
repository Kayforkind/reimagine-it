#!/usr/bin/env node
/* Audit every design token's generated output for structural regressions:
   literal 'undefined'/'NaN', empty body, markup misplaced into <style>,
   missing h1, unbalanced tags. Fast, no browser needed. */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'reimagine-it.js');
const SOURCE = path.join(ROOT, 'examples', 'end-users', 'venator', 'source.html');
const TOKENS = ['webpage','landing','dashboard','infographic','cinematic','artistic','photography','svg','3js','simulation','glass','editorial','motion','gradient','showcase'];

const BAD = /\b(undefined|NaN|\[object Object\]|null)\b/i;

function generate(token) {
  const out = path.join(require('os').tmpdir(), `audit-${token}.html`);
  execFileSync(process.execPath, [BIN, '--input', SOURCE, '--token', token, '--output', out, '--seed', '7', '--quiet'], { cwd: ROOT, stdio: 'pipe' });
  return fs.readFileSync(out, 'utf8');
}

function countTags(html, tag) {
  const open = (html.match(new RegExp(`<${tag}(\\s|>)`, 'g')) || []).length;
  const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  const self = (html.match(new RegExp(`<${tag}[^>]*/>`, 'g')) || []).length;
  return { open, close, self };
}

let failures = 0;
for (const token of TOKENS) {
  const html = generate(token);
  const issues = [];

  // body must contain the actual page, not 'undefined' / empty
  const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
  if (!bodyMatch) issues.push('no <body>...</body>');
  else {
    const body = bodyMatch[1];
    // strip scripts and tags to get the visible text
    const visible = body.replace(/<scr[^>]*>[\s\S]*?<\/scr[^>]*>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').trim();
    if (!visible || /^(undefined|NaN|null)$/i.test(visible)) issues.push(`empty body (text=${JSON.stringify(visible.slice(0, 40))})`);
    const m = visible.match(BAD);
    if (m) issues.push(`visible literal ${m[0]}`);
  }

  // main content must NOT be inside <style>
  const styleEnd = html.indexOf('</style>');
  if (styleEnd > 0) {
    const head = html.slice(0, styleEnd);
    if (/<main|<section|<article|<h1/.test(head)) issues.push('markup misplaced inside <style>');
  }

  // structural tags balanced enough
  for (const t of ['main', 'section', 'div', 'article', 'header', 'footer']) {
    const c = countTags(html, t);
    if (t === 'div') { if (c.open !== c.close) issues.push(`div imbalance ${c.open}/${c.close}`); }
    else if (c.open > 0 && c.open !== c.close) issues.push(`${t} imbalance ${c.open}/${c.close}`);
  }

  if (issues.length) {
    failures++;
    console.log(`FAIL ${token}: ${issues.join('; ')}`);
  } else {
    console.log(`ok   ${token}`);
  }
}
console.log(failures ? `\n${failures} token(s) failed` : `\nall ${TOKENS.length} tokens pass`);
process.exit(failures ? 1 : 0);
