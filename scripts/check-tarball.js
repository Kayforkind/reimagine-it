#!/usr/bin/env node
/**
 * Tarball guard: fail if `npm pack` would ship anything outside the
 * intentional files list (or omit anything from it).
 *
 * npm's `files` field is allow-list by default, but README/LICENSE,
 * package.json, and any in-flight misconfiguration (an extra directory,
 * .npmignore resurrection, test fixtures, .env) are easy to miss. This makes
 * the shipped surface explicit and enforced.
 *
 * Usage: node scripts/check-tarball.js
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const allowed = new Set((pkg.files || []).map((f) => f.replace(/\/+$/, '')));
// npm always includes these regardless of `files`.
allowed.add('package.json');
allowed.add('README.md');
allowed.add('LICENSE');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tarball-guard-'));
let tarball;
try {
  const out = execFileSync('npm', ['pack', '--json', '--pack-destination', tmp], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  tarball = JSON.parse(out)[0].filename;
} catch (e) {
  console.error('FAIL: npm pack could not run: ' + e.message);
  process.exit(2);
}

const files = execFileSync('tar', ['-tzf', tarball], {
  cwd: tmp, // relative filename — Windows GNU tar reads `D:` as a remote host
  encoding: 'utf8',
  shell: process.platform === 'win32',
})
  .split(/\r?\n/)
  .filter(Boolean)
  // npm tar entries are `package/<path>`; strip the prefix.
  .map((f) => f.replace(/^package\//, ''))
  .filter((f) => f.length > 0);

const problems = [];
for (const file of files) {
  if (allowed.has(file)) continue;
  // A directory entry in `files` covers everything beneath it.
  const underAllowedDir = [...allowed].some((entry) => file.startsWith(entry + '/'));
  if (underAllowedDir) continue;
  problems.push(file);
}

// Missing entries: any allowed file/directory that produced zero tarball entries.
for (const entry of (pkg.files || [])) {
  const clean = entry.replace(/\/+$/, '');
  const covered = files.some((f) => f === clean || f.startsWith(clean + '/'));
  if (!covered) problems.push('(missing) ' + entry);
}

if (problems.length) {
  console.error('FAIL: tarball does not match the intentional files list:');
  for (const p of problems.sort()) console.error('  ' + p);
  console.error('\nUpdate package.json#files or the source tree — do not ship drift.');
  process.exit(1);
}

console.log(`tarball guard OK — ${files.length} files, all inside the files list`);
