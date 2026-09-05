#!/usr/bin/env python3
"""Render end-user Auto output (and the Meridian suite) for the Pages site.

Writes desktop/phone PNGs into docs/examples/end-users/<slug>/ and refreshes
the Meridian 3js/svg WebP stills next to the generated HTML.

Usage from the repository root:
    python scripts/render-example-shots.py
    python scripts/render-example-shots.py venator
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CASES = ("venator", "crimson-circuit", "velocita", "maracuya", "flick", "meridian", "horizon", "hearth-grain", "millbrook-budget")


def find_browser() -> str:
    env = os.environ.get("REIMAGINE_BROWSER")
    if env and Path(env).is_file():
        return env
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for candidate in candidates:
        if Path(candidate).is_file():
            return candidate
    raise SystemExit("No Chrome or Edge found. Set REIMAGINE_BROWSER=<path>.")


def screenshot(browser: str, page: Path, output: Path, width: int, height: int) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            browser,
            "--headless",
            "--hide-scrollbars",
            "--no-sandbox",
            "--disable-extensions",
            "--disable-sync",
            "--disable-background-networking",
            f"--window-size={width},{height}",
            "--virtual-time-budget=4000",
            f"--screenshot={output}",
            page.resolve().as_uri(),
        ],
        check=True,
        capture_output=True,
        timeout=90,
    )
    if not output.is_file() or output.stat().st_size < 1024:
        raise SystemExit(f"could not render {page} -> {output}")


def png_to_webp(png: Path, webp: Path) -> None:
    image = Image.open(png).convert("RGB")
    webp.parent.mkdir(parents=True, exist_ok=True)
    image.save(webp, "WEBP", quality=82, method=6)


def render_case(browser: str, slug: str) -> None:
    folder = ROOT / "examples" / "end-users" / slug
    auto = folder / "auto.html"
    if not auto.is_file():
        raise SystemExit(f"missing {auto} — run `npm run examples` first")
    out_dir = ROOT / "docs" / "examples" / "end-users" / slug
    screenshot(browser, auto, out_dir / "auto-desktop.png", 1400, 1100)
    screenshot(browser, auto, out_dir / "auto-phone.png", 480, 960)
    print(f"  {slug}: auto desktop + phone")

    if slug != "meridian":
        return
    suite = (
        ("auto.html", "3js-desktop.webp"),
        ("option-2-editorial.html", "editorial-desktop.webp"),
        ("option-3-svg.html", "svg-desktop.webp"),
    )
    scratch = out_dir / "_suite-scratch.png"
    for html_name, webp_name in suite:
        html = folder / html_name
        if not html.is_file():
            raise SystemExit(f"missing {html}")
        screenshot(browser, html, scratch, 1400, 1100)
        png_to_webp(scratch, folder / webp_name)
        print(f"  meridian: {webp_name}")
    scratch.unlink(missing_ok=True)


def main() -> int:
    requested = sys.argv[1:] or list(CASES)
    unknown = [slug for slug in requested if slug not in CASES]
    if unknown:
        raise SystemExit(f"unknown example slug(s): {', '.join(unknown)}")
    browser = find_browser()
    for slug in requested:
        render_case(browser, slug)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
