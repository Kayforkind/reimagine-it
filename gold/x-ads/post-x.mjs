/**
 * Compose + post the v2.3 infographic 4-up on X via owned Chrome (CDP 9222).
 * Own tab only. Never newContext. Never cursor-ide-browser.
 *
 * Run:
 *   node gold/x-ads/post-x.mjs
 */
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CDP = "http://127.0.0.1:9222";
const OUT = "C:/Users/kazim/.cursor/browser-hub/out";
const IMAGES = [
  join(__dirname, "11-before-1080.jpg"),
  join(__dirname, "15-infographic-1080.jpg"),
  join(__dirname, "12-dashboard-1080.jpg"),
  join(__dirname, "14-cinematic-1080.jpg"),
];
const COPY = `Same HTML. One extra word: infographic.

/reimagine-it now ships a statistical poster — common-scale timeline, ISOTYPE counts, lossless table. Not a dashboard.

https://github.com/kazimrmerchant/reimagine-it`;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.connectOverCDP(CDP);
  const context = browser.contexts()[0];
  if (!context) throw new Error("no default context");
  const page = await context.newPage();
  const shot = async (name) => {
    const p = join(OUT, `x-infographic-${name}.png`);
    await page.screenshot({ path: p, fullPage: false });
    console.log("shot", p);
    return p;
  };

  try {
    await page.goto("https://x.com/compose/post", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2500);
    await shot("01-compose");

    const signedOut =
      (await page.locator('a[href="/login"], a[href="/i/flow/login"]').count()) > 0 &&
      (await page.locator('[data-testid="tweetTextarea_0"]').count()) === 0;
    if (signedOut) {
      await shot("signed-out");
      throw new Error("SIGNED_OUT");
    }

    const box = page.locator('[data-testid="tweetTextarea_0"]').first();
    await box.waitFor({ state: "visible", timeout: 20000 });
    await box.click();
    await page.keyboard.insertText(COPY);
    await page.waitForTimeout(400);

    const fileInput = page.locator('input[type="file"][accept*="image"]').first();
    await fileInput.setInputFiles(IMAGES);
    // wait until 4 attachments render
    await page.locator('[data-testid="attachments"] img, [data-testid="tweetPhoto"]').first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(2500);
    await shot("02-with-images");

    const postBtn = page.locator('[data-testid="tweetButton"]').first();
    await postBtn.waitFor({ state: "visible", timeout: 15000 });
    const disabled = await postBtn.getAttribute("aria-disabled");
    if (disabled === "true") {
      await shot("03-button-disabled");
      throw new Error("POST_BUTTON_DISABLED");
    }
    await postBtn.click();
    await page.waitForTimeout(4000);
    await shot("04-after-click");

    // Prefer the permalink if X navigates to the status.
    let url = page.url();
    if (!/\/status\/\d+/.test(url)) {
      const permalink = page.locator('a[href*="/status/"]').first();
      if (await permalink.count()) {
        url = await permalink.getAttribute("href");
      }
    }
    writeFileSync(join(OUT, "x-infographic-post-url.txt"), String(url || "") + "\n", "utf8");
    console.log("url", url);
  } finally {
    await page.close();
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
