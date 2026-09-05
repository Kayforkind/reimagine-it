/* Capture a ~60s narrated-by-captions teaser for social (ROADMAP 3.1).
 *
 * Same flow as record-playground.cjs (paste → auto → reimagine → pick →
 * download), with step captions burned in by ffmpeg's drawtext at assembly.
 * Output: docs/teaser.mp4 (~60s, silent, captioned, 1280x900) — embeddable
 * on the docs site and uploadable as-is to X/YouTube.
 *
 * Usage: node scripts/record-teaser.cjs   (needs Chrome + ffmpeg; serves the
 * docs site itself on 127.0.0.1:4175)
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 4175;
const URL = `http://127.0.0.1:${PORT}/#playground`;
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(__dirname, 'teaser');
const FRAME_DIR = path.join(OUT_DIR, 'frames');
const MP4 = path.join(ROOT, 'docs', 'teaser.mp4');

// The caption timeline must mirror the holds below: [start, end] in seconds.
const STEPS = [
  [0, 6, 'Paste any HTML — a real page, a memo, a menu'],
  [6, 14, 'Auto reads its facts: names, dates, numbers, colors'],
  [14, 24, 'Three directions, drawn from the content'],
  [24, 34, 'A bakery becomes a photography folio — not a data poster'],
  [34, 44, 'Every direction keeps every fact: fidelity 100%'],
  [44, 52, 'Pick one and download a standalone page'],
  [52, 60, 'npx reimagine-it --auto -i page.html -o out.html'],
];

const SAMPLE_HTML = [
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Hearth & Grain Bakery</title></head><body>',
  '<h1>Hearth &amp; Grain</h1>',
  '<p>A neighborhood bakery on Anchor Street. Crust brown #6B3A2A, butter gold #E8A93C.</p>',
  '<h2>Today\u2019s bake</h2>',
  '<ul>',
  '<li>Country loaf \u00b7 9 dollars \u00b7 baked at 5 AM</li>',
  '<li>Sesame semolina \u00b7 11 dollars</li>',
  '<li>Cardamom knots \u00b7 6 dollars \u00b7 Saturdays only</li>',
  '<li>Rye volkorn \u00b7 10 dollars</li>',
  '</ul>',
  '<h2>Hours</h2>',
  '<p>7 AM to 4 PM, Tuesday through Sunday. The oven rests on Mondays. Wholesale: hello@hearthgrain.example \u2014 2,300 loaves a week.</p>',
  '</body></html>',
].join('\n');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function serve() {
  const server = http.createServer((req, res) => {
    const rel = req.url.split('?')[0] === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, 'docs', rel);
    if (!file.startsWith(path.join(ROOT, 'docs')) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

function drawtextChain() {
  return STEPS.map(([start, end, text], i) => {
    const escaped = text.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\u2019");
    return [
      `drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf'`,
      `text='${escaped}'`,
      `enable='between(t,${Math.floor(start)},${Math.floor(end)})'`,
      `x=(w-text_w)/2`, `y=h-64`,
      `fontsize=30`, `fontcolor=white`,
      `box=1`, `boxcolor=black@0.62`, `boxborderw=18`,
    ].join(':');
  }).join(',');
}

async function main() {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  const server = await serve();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: false,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--window-size=1280,910', '--hide-scrollbars', '--force-prefers-reduced-motion'],
  });
  const page = await browser.newPage();

  const cdp = await page.createCDPSession();
  let frameIndex = 0;
  const started = Date.now();
  let lastAck = 0;
  await cdp.send('Page.startScreencast', {
    format: 'jpeg', quality: 76, maxWidth: 1280, maxHeight: 900, everyNthFrame: 1,
  });
  cdp.on('Page.screencastFrame', async (event) => {
    try {
      const stamp = Date.now();
      if (stamp - lastAck >= 100) {
        lastAck = stamp;
        frameIndex += 1;
        fs.writeFileSync(path.join(FRAME_DIR, `f${String(frameIndex).padStart(6, '0')}.jpg`), Buffer.from(event.data, 'base64'));
      }
      await cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    } catch { /* keep capturing */ }
  });

  await page.goto(URL, { waitUntil: 'networkidle2' });
  await sleep(5000); // [0,6] paste caption over the idle playground

  // 1) paste HTML
  await page.evaluate((html) => {
    const input = document.querySelector('#playInput');
    input.value = html;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, SAMPLE_HTML);
  await sleep(8000); // [6,14] reading facts

  // 2) auto + run
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.token-btn')].find((b) => b.dataset.token === 'auto');
    btn.click();
  });
  await sleep(700);
  await page.click('#playRun');
  await sleep(9000); // [14,24] three directions

  // 3) pick direction 2 (photography folio)
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#designBtns .design-btn')];
    if (btns.length > 2) btns[1].click();
  });
  await sleep(9000); // [24,34] folio

  // 4) pick direction 3 to show they differ
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#designBtns .design-btn')];
    if (btns.length > 2) btns[2].click();
  });
  await sleep(9000); // [34,44] fidelity

  // 5) back to top pick + download
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#designBtns .design-btn')];
    if (btns.length) btns[0].click();
  });
  await sleep(1000);
  await page.click('#playDownload');
  await sleep(6000); // [44,52] download

  await sleep(6000); // [52,60] CLI endcard while page settles
  await cdp.send('Page.stopScreencast');
  await browser.close();
  server.close();

  const seconds = Math.round((Date.now() - started) / 1000);
  console.log(`captured ${frameIndex} frames (~${seconds}s target 60)`);

  // Screencast frames arrive irregularly; encode at frames/60 fps so the
  // video is exactly 60s and the caption timeline stays in sync.
  const fps = (frameIndex / 60).toFixed(3);
  execFileSync('ffmpeg', [
    '-y', '-framerate', fps, '-i', path.join(FRAME_DIR, 'f%06d.jpg'),
    '-vf', `scale=1280:900:flags=lanczos,${drawtextChain()}`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    MP4,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });

  const bytes = fs.statSync(MP4).size;
  console.log(`wrote ${MP4} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((error) => { console.error(error); process.exit(1); });
