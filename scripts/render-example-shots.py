#!/usr/bin/env python3
"""Render an end-user example's auto output to desktop + phone PNGs in docs/."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def find_browser() -> str:
    import os
    env = os.environ.get("REIMAGINE_BROWSER")
    if env and Path(env).is_file():
        return env
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for c in candidates:
        if Path(c).is_file():
            return c
    raise SystemExit("No Chrome or Edge found.")


def screenshot(browser: str, page: Path, output: Path, width: int, height: int) -> None:
    subprocess.run(
        [browser, "--headless", "--hide-scrollbars", "--no-sandbox",
         "--disable-extensions", "--disable-sync", "--disable-background-networking",
         f"--window-size={width},{height}", "--virtual-time-budget=4000",
         f"--screenshot={output}", page.as_uri()],
        check=True, capture_output=True,
    )


def main() -> int:
    slug = sys.argv[1] if len(sys.argv) > 1 else "horizon"
    folder = ROOT / "examples" / "end-users" / slug
    auto = folder / "auto.html"
    if not auto.is_file():
        raise SystemExit(f"missing {auto}")
    out_dir = ROOT / "docs" / "examples" / "end-users" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    browser = find_browser()
    screenshot(browser, auto, out_dir / "auto-desktop.png", 1400, 1100)
    screenshot(browser, auto, out_dir / "auto-phone.png", 480, 960)
    print(f"wrote {out_dir / 'auto-desktop.png'} and {out_dir / 'auto-phone.png'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
