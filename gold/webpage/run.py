"""Screenshot before/after and composite a single compare.png for the README.

Windows only for now (uses headless msedge or Chrome). Run:

    python gold/webpage/run.py

Writes: before.png, after.png, compare.html, compare.png.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BEFORE_HTML = ROOT / "before.html"
AFTER_HTML = ROOT / "after.html"
BEFORE_PNG = ROOT / "before.png"
AFTER_PNG = ROOT / "after.png"
COMPARE_HTML = ROOT / "compare.html"
COMPARE_PNG = ROOT / "compare.png"


def find_browser() -> str:
    env = os.environ.get("AWE_BROWSER")
    if env and Path(env).is_file():
        return env
    candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for c in candidates:
        if Path(c).is_file():
            return c
    which = shutil.which("msedge") or shutil.which("chrome")
    if which:
        return which
    raise SystemExit(
        "No Edge or Chrome found. Set AWE_BROWSER=<full path to msedge.exe or chrome.exe>."
    )


def shot(browser: str, url: str, out: Path, w: int, h: int) -> None:
    out.unlink(missing_ok=True)
    args = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={w},{h}",
        f"--screenshot={out}",
        url,
    ]
    proc = subprocess.run(args, capture_output=True, text=True, timeout=60)
    if not out.is_file():
        raise SystemExit(
            f"screenshot failed for {url}\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
        )


def file_url(p: Path) -> str:
    return "file:///" + str(p).replace("\\", "/")


def write_compare_html() -> None:
    COMPARE_HTML.write_text(
        """<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; background: #0c0e12; color: #e8edf4;
    font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
  body { padding: 32px 40px 40px; }
  .head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px; }
  .head .kicker { font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 11px; letter-spacing: 0.24em; color: #7ee0c0; }
  .head h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
  .head .meta { margin-left: auto; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 11px; letter-spacing: 0.16em; color: #8b97a4; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: 1fr 60px 1fr; gap: 16px; align-items: start; }
  .col { background: #0c0e12; border: 1px solid #2a3340; border-radius: 12px; overflow: hidden; }
  .col.before { background: #ffffff; }
  .col .lab { padding: 12px 16px; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase;
    display: flex; justify-content: space-between; }
  .col.before .lab { color: #6a3a3a; background: #f5f0ec; border-bottom: 1px solid #d9cfc7; }
  .col.after  .lab { color: #7ee0c0; background: #0c0e12; border-bottom: 1px solid #2a3340; }
  .col img { display: block; width: 100%; height: auto; }
  .arrow { align-self: center; text-align: center; color: #7ee0c0; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 11px; letter-spacing: 0.24em; }
  .arrow .a { font-size: 28px; line-height: 1; margin: 6px 0; }
  .foot { margin-top: 20px; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 11px; color: #8b97a4; letter-spacing: 0.16em; text-transform: uppercase;
    display: flex; justify-content: space-between; }
</style></head><body>

<div class="head">
  <span class="kicker">/awe-me webpage</span>
  <h1>The same content, redesigned by one command.</h1>
  <span class="meta">gold/webpage &middot; tested</span>
</div>

<div class="grid">
  <div class="col before">
    <div class="lab"><span>BEFORE</span><span>plain html</span></div>
    <img src="before.png" alt="plain user page">
  </div>
  <div class="arrow">
    <div>/awe-me</div>
    <div class="a">&rarr;</div>
    <div>webpage</div>
  </div>
  <div class="col after">
    <div class="lab"><span>AFTER</span><span>1 command</span></div>
    <img src="after.png" alt="redesigned page">
  </div>
</div>

<div class="foot">
  <span>same words. same three projects. same email.</span>
  <span>python gold/webpage/run.py</span>
</div>

</body></html>
""",
        encoding="utf-8",
    )


def main() -> int:
    for src in (BEFORE_HTML, AFTER_HTML):
        if not src.is_file():
            raise SystemExit(f"missing: {src}")
    browser = find_browser()
    shot(browser, file_url(BEFORE_HTML), BEFORE_PNG, 1400, 460)
    shot(browser, file_url(AFTER_HTML), AFTER_PNG, 1400, 1520)
    write_compare_html()
    shot(browser, file_url(COMPARE_HTML), COMPARE_PNG, 1600, 940)
    sizes = {p.name: p.stat().st_size for p in (BEFORE_PNG, AFTER_PNG, COMPARE_PNG)}
    print(
        f"wrote before.png={sizes['before.png']} "
        f"after.png={sizes['after.png']} "
        f"compare.png={sizes['compare.png']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
