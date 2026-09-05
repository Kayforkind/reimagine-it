#!/usr/bin/env node
/**
 * Stills guard — every committed proof image stays real and regenerable.
 *
 * Mode 1 (default, no browser needed):
 *   - every example case (end-users + community) carries source.html,
 *     auto.json, and auto.html
 *   - every committed still has the canonical dimensions
 *   - docs/examples/ copies are byte-identical to examples/ (sync check)
 *
 * Mode 2 (--pixel, needs headless Chrome):
 *   - re-renders each case's auto.html at the canonical sizes and compares
 *     against the committed stills pixel-by-pixel
 *   - the engine is deterministic, but Chrome versions/OSes antialias
 *     slightly differently, so the comparison is perceptual by default:
 *     per-channel tolerance 8, up to 1% of pixels may differ.
 *     Pass --exact to require zero differing pixels.
 *
 * Usage:
 *   node scripts/check-stills.js
 *   CHROME="/usr/bin/google-chrome" node scripts/check-stills.js --pixel
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const PIXEL = args.includes('--pixel');
const EXACT = args.includes('--exact');
const CHANNEL_TOLERANCE = 8;
const MAX_DIFF_FRACTION = 0.01;

const DESKTOP = { w: 1400, h: 1100 };
const PHONE = { w: 480, h: 960 };

function listCases(base) {
  const p = path.join(root, base);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p)
    .filter((d) => !d.startsWith('.') && !['__pycache__', 'TEMPLATE', 'auto-options'].includes(d))
    .filter((d) => fs.statSync(path.join(p, d)).isDirectory())
    .map((d) => path.join(base, d));
}

const CASE_DIRS = listCases('examples/end-users').concat(listCases('examples/community'));

const problems = [];

// ── mode 1: structure ────────────────────────────────────────────────

for (const dir of CASE_DIRS) {
  const abs = path.join(root, dir);
  for (const required of ['source.html', 'auto.json', 'auto.html']) {
    if (!fs.existsSync(path.join(abs, required))) {
      problems.push(`${dir}: missing ${required}`);
    }
  }
}

// Text comparisons normalize line endings — git autocrlf may rewrite one
// checkout but not the other; PNG comparisons stay byte-exact.
function sameText(a, b) {
  return fs.readFileSync(a, 'utf8').replace(/\r\n/g, '\n') === fs.readFileSync(b, 'utf8').replace(/\r\n/g, '\n');
}

function pngSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

for (const dir of CASE_DIRS) {
  const slug = path.basename(dir);
  const isCommunity = dir.includes('community');
  const desktopSrc = isCommunity
    ? path.join(root, dir, 'auto-desktop.png')
    : path.join(root, 'docs/examples/end-users', slug, 'auto-desktop.png');
  const phoneSrc = isCommunity
    ? path.join(root, dir, 'auto-phone.png')
    : path.join(root, 'docs/examples/end-users', slug, 'auto-phone.png');

  if (!fs.existsSync(desktopSrc)) {
    problems.push(`${dir}: no auto-desktop.png still`);
  } else {
    const s = pngSize(desktopSrc);
    if (s.w !== DESKTOP.w || s.h !== DESKTOP.h) {
      problems.push(`${dir}: auto-desktop.png is ${s.w}x${s.h}, expected ${DESKTOP.w}x${DESKTOP.h}`);
    }
  }
  if (!fs.existsSync(phoneSrc)) {
    problems.push(`${dir}: no auto-phone.png still`);
  } else {
    const s = pngSize(phoneSrc);
    if (s.w !== PHONE.w || s.h !== PHONE.h) {
      problems.push(`${dir}: auto-phone.png is ${s.w}x${s.h}, expected ${PHONE.w}x${PHONE.h}`);
    }
  }

  // docs/ mirror must be identical to the source of truth.
  if (!isCommunity) {
    for (const f of ['auto-desktop.png', 'auto-phone.png']) {
      const a = path.join(root, 'docs/examples/end-users', slug, f);
      const b = path.join(root, 'docs/examples', 'end-users', slug, f);
      if (fs.existsSync(a) && fs.existsSync(b) && !fs.readFileSync(a).equals(fs.readFileSync(b))) {
        problems.push(`${dir}: docs/ copy of ${f} drifted from the original`);
      }
    }
  } else {
    for (const f of ['auto-desktop.png', 'auto-phone.png', 'source.html']) {
      const a = path.join(root, dir, f);
      const b = path.join(root, 'docs', dir, f);
      if (!fs.existsSync(a) || !fs.existsSync(b)) continue;
      const same = f.endsWith('.png')
        ? fs.readFileSync(a).equals(fs.readFileSync(b))
        : sameText(a, b);
      if (!same) problems.push(`${dir}: docs/ copy of ${f} drifted from the original`);
    }
  }
}

if (problems.length) {
  console.error('FAIL: stills guard found problems:');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`stills guard OK — ${CASE_DIRS.length} cases, structure, dimensions, and sync verified`);

// ── mode 2: pixel regression ─────────────────────────────────────────

if (!PIXEL) process.exit(0);

const chrome = process.env.CHROME
  || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');

function fileUri(p) {
  let u = p.replace(/\\/g, '/');
  if (!u.startsWith('/')) u = '/' + u;
  return 'file://' + u;
}

function render(htmlPath, w, h, out) {
  execFileSync(chrome, [
    '--headless', '--disable-gpu', '--hide-scrollbars',
    // Freeze motion for deterministic frames: the craft floor requires
    // pages to respect prefers-reduced-motion, so forcing it pins every
    // animation to its base state. Virtual time settles fonts/layout
    // identically on every run.
    '--force-prefers-reduced-motion',
    '--virtual-time-budget=3000',
    `--window-size=${w},${h}`,
    `--screenshot=${out}`,
    fileUri(htmlPath),
  ], { stdio: 'pipe', shell: false });
}

// Minimal PNG decoder: 8-bit, RGB/RGBA, no interlace — enough for Chrome output.
function decodePng(file) {
  const buf = fs.readFileSync(file);
  let off = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2) || interlace !== 0) {
    throw new Error(`${file}: unsupported PNG (depth ${bitDepth}, color ${colorType})`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = x >= channels && prev ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

function compare(a, b) {
  if (a.width !== b.width || a.height !== b.height) return { dims: true };
  const n = a.width * a.height;
  let diffPixels = 0;
  let maxDelta = 0;
  const stride = a.channels;
  for (let i = 0; i < n; i++) {
    for (let ch = 0; ch < 3; ch++) {
      const d = Math.abs(a.data[i * stride + ch] - b.data[i * stride + ch]);
      if (d > maxDelta) maxDelta = d;
      if (d > CHANNEL_TOLERANCE) { diffPixels++; break; }
    }
  }
  return { dims: false, diffPixels, maxDelta, fraction: diffPixels / n };
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stills-pixel-'));
let checked = 0;
const pixelProblems = [];

for (const dir of CASE_DIRS) {
  const slug = path.basename(dir);
  const isCommunity = dir.includes('community');
  const html = path.join(root, dir, 'auto.html');
  const refDesktop = isCommunity
    ? path.join(root, dir, 'auto-desktop.png')
    : path.join(root, 'docs/examples/end-users', slug, 'auto-desktop.png');
  if (!fs.existsSync(html) || !fs.existsSync(refDesktop)) continue;

  const outDesktop = path.join(tmp, slug + '-desktop.png');
  const outPhone = path.join(tmp, slug + '-phone.png');
  try {
    render(html, DESKTOP.w, DESKTOP.h, outDesktop);
    render(html, PHONE.w, PHONE.h, outPhone);
  } catch (e) {
    pixelProblems.push(`${slug}: render failed — ${e.message.split('\n')[0]}`);
    continue;
  }

  const refPhone = isCommunity
    ? path.join(root, dir, 'auto-phone.png')
    : path.join(root, 'docs/examples/end-users', slug, 'auto-phone.png');

  for (const [out, ref, label] of [
    [outDesktop, refDesktop, 'desktop'],
    [outPhone, refPhone, 'phone'],
  ]) {
    if (!fs.existsSync(ref)) { pixelProblems.push(`${slug}: reference ${label} missing`); continue; }
    const A = decodePng(out);
    const B = decodePng(ref);
    const r = compare(A, B);
    checked++;
    if (r.dims) {
      pixelProblems.push(`${slug} ${label}: dimensions differ (${A.width}x${A.height} vs ${B.width}x${B.height})`);
    } else if (EXACT && r.diffPixels > 0) {
      pixelProblems.push(`${slug} ${label}: ${r.diffPixels} pixels differ (exact mode)`);
    } else if (!EXACT && r.fraction > MAX_DIFF_FRACTION) {
      pixelProblems.push(`${slug} ${label}: ${(r.fraction * 100).toFixed(2)}% pixels differ (max channel delta ${r.maxDelta})`);
    }
  }
}

if (pixelProblems.length) {
  console.error('FAIL: pixel regression found drift:');
  for (const p of pixelProblems) console.error('  ' + p);
  process.exit(1);
}
console.log(`pixel regression OK — ${checked} stills re-rendered and match (tolerance ${EXACT ? 0 : CHANNEL_TOLERANCE})`);
