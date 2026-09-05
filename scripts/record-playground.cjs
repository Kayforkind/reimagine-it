/* Capture a 30-60s silent playground walkthrough (issue #9).
 * Flow: paste HTML -> click auto -> Reimagine -> pick a direction -> download.
 * Frames come from CDP Page.startScreencast; ffmpeg assembles an mp4.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://127.0.0.1:4173/#playground';
const OUT_DIR = path.join(__dirname, 'recording');
const FRAME_DIR = path.join(OUT_DIR, 'frames');
const MP4 = path.join(OUT_DIR, 'playground-walkthrough.mp4');

const SAMPLE_HTML = [
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Harbor Line Coffee</title></head><body>',
  '<h1>Harbor Line Coffee</h1>',
  '<p>A roastery on Pier 9. Every bag ships in slate #2F4550 paper with a copper #B87333 stamp and cream #F4EBDD labels.</p>',
  '<h2>On the shelf</h2>',
  '<ul>',
  '<li>Pier Blend · cocoa, toasted almond · 16 dollars</li>',
  '<li>Single Origin Ethiopia · blueberry, jasmine · 19 dollars</li>',
  '<li>Dark Harbor · molasses, smoke · 15 dollars</li>',
  '<li>Decaf Cloud Catcher · caramel, soft · 17 dollars</li>',
  '</ul>',
  '<h2>Hours</h2>',
  '<p>Open 7 AM to 5 PM daily. Cupping Saturdays at 10 AM — 12 seats, first come.</p>',
  '<h2>Wholesale</h2>',
  '<p>Cafes and offices: <a href="mailto:beans@harborline.example">beans@harborline.example</a>. We delivered 4,800 bags last quarter.</p>',
  '</body></html>',
].join('\n');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: false,
    defaultViewport: { width: 1400, height: 1000 },
    args: ['--window-size=1400,1010', '--hide-scrollbars'],
  });
  const page = await browser.newPage();

  const cdp = await page.createCDPSession();
  let frameIndex = 0;
  const writeFrame = (data) => {
    frameIndex += 1;
    fs.writeFileSync(path.join(FRAME_DIR, `f${String(frameIndex).padStart(6, '0')}.jpg`), data);
  };
  let lastAck = 0;
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 72,
    maxWidth: 1400,
    maxHeight: 1000,
    everyNthFrame: 1,
  });
  cdp.on('Page.screencastFrame', async (event) => {
    try {
      const stamp = Date.now();
      if (stamp - lastAck >= 90) { // ~11 fps is plenty for a UI walkthrough
        lastAck = stamp;
        writeFrame(Buffer.from(event.data, 'base64'));
      }
      await cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    } catch { /* keep capturing */ }
  });

  await page.goto(URL, { waitUntil: 'networkidle2' });
  await sleep(3500);

  // 1) paste HTML into the playground textarea
  await page.evaluate((html) => {
    const input = document.querySelector('#playInput');
    input.value = html;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, SAMPLE_HTML);
  await sleep(1200);

  // 2) click auto
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.token-btn')].find((b) => b.dataset.token === 'auto');
    btn.click();
  });
  await sleep(1000);

  // 3) click Reimagine -> Auto draws three directions
  await page.click('#playRun');
  await sleep(8000);

  // 4) pick a direction from the strip
  await page.evaluate(() => {
    const strip = document.querySelector('#designStrip');
    if (strip && !strip.hidden) {
      const btns = [...document.querySelectorAll('#designBtns .design-btn')];
      if (btns.length > 2) btns[1].click();
    }
  });
  await sleep(8000);

  // 5) pick the third direction as well, to show candidates differ
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#designBtns .design-btn')];
    if (btns.length > 2) btns[2].click();
  });
  await sleep(8000);

  // 6) download the artifact (Chrome saves it to the default download dir)
  const client = await page.target().createCDPSession();
  await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: OUT_DIR });
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#designBtns .design-btn')];
    if (btns.length) btns[0].click();
  });
  await sleep(1500);
  await page.click('#playDownload');
  await sleep(3500);

  // 7) close on the result frame with notes visible
  await sleep(6000);
  await cdp.send('Page.stopScreencast');
  await browser.close();

  console.log(`captured ${frameIndex} frames`);
  execFileSync('ffmpeg', [
    '-y', '-framerate', '11', '-i', path.join(FRAME_DIR, 'f%06d.jpg'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-vf', 'scale=1400:1000:flags=lanczos', MP4,
  ], { stdio: 'inherit' });
  const bytes = fs.statSync(MP4).size;
  console.log(`wrote ${MP4} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  if (bytes > 8 * 1024 * 1024) console.warn('WARNING: over the ~8 MB budget from issue #9');
}

main().catch((error) => { console.error(error); process.exit(1); });
