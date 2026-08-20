"""Screenshot before.html and after.html for the default webpage pack.

Windows only for now (uses headless Chrome or Edge). Run:

    python gold/webpage/run.py

Writes: before.png, after.png. The Texas-themed side-by-side compare.png
is produced by gold/compare.py (single source of truth for every pack).
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


def find_browser() -> str:
    env = os.environ.get("REIMAGINE_BROWSER")
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
        "No Edge or Chrome found. Set REIMAGINE_BROWSER=<full path to msedge.exe or chrome.exe>."
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


def main() -> int:
    for src in (BEFORE_HTML, AFTER_HTML):
        if not src.is_file():
            raise SystemExit(f"missing: {src}")
    browser = find_browser()
    shot(browser, file_url(BEFORE_HTML), BEFORE_PNG, 1400, 460)
    shot(browser, file_url(AFTER_HTML), AFTER_PNG, 1400, 1520)
    sizes = {p.name: p.stat().st_size for p in (BEFORE_PNG, AFTER_PNG)}
    print(
        f"wrote before.png={sizes['before.png']} "
        f"after.png={sizes['after.png']}"
    )
    print("compare.png is now built by: python gold/compare.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
