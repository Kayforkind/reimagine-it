"""Per-pack full-page `after.png` renderer.

Writes one full-page screenshot per pack at a consistent scale so the README
can display them one-image-per-row (before on one line, after on the next),
readable at GitHub's rendering width.

Rerun any time:

    python gold/shots.py

Emits `<pack-dir>/after.png` for every pack in `PACKS` plus the shared
`gold/webpage/before.png` if missing.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BEFORE_HTML = ROOT / "gold" / "webpage" / "before.html"
BEFORE_PNG = ROOT / "gold" / "webpage" / "before.png"


@dataclass(frozen=True)
class Shot:
    slug: str
    label: str
    after_html: Path
    after_png: Path
    w: int = 1400
    h: int = 1600


PACKS: list[Shot] = [
    Shot(
        slug="webpage",
        label="/reimagine-it webpage",
        after_html=ROOT / "gold/webpage/after.html",
        after_png=ROOT / "gold/webpage/after.png",
        h=1600,
    ),
    Shot(
        slug="webpage-b",
        label="/reimagine-it webpage --variant b",
        after_html=ROOT / "gold/webpage/after-2.html",
        after_png=ROOT / "gold/webpage/after-2.png",
        h=1800,
    ),
    Shot(
        slug="artistic",
        label="/reimagine-it webpage artistic",
        after_html=ROOT / "gold/domains/artistic/after.html",
        after_png=ROOT / "gold/domains/artistic/after.png",
        h=1600,
    ),
    Shot(
        slug="dashboard",
        label="/reimagine-it webpage dashboard",
        after_html=ROOT / "gold/domains/dashboard/after.html",
        after_png=ROOT / "gold/domains/dashboard/after.png",
        h=720,
    ),
    Shot(
        slug="photography",
        label="/reimagine-it webpage photography",
        after_html=ROOT / "gold/domains/photography/after.html",
        after_png=ROOT / "gold/domains/photography/after.png",
        h=1600,
    ),
    Shot(
        slug="cinematic",
        label="/reimagine-it webpage cinematic",
        after_html=ROOT / "gold/domains/cinematic/after.html",
        after_png=ROOT / "gold/domains/cinematic/after.png",
        h=1600,
    ),
    Shot(
        slug="cinematic-glass",
        label="/reimagine-it webpage cinematic glassmorphism",
        after_html=ROOT / "gold/modifiers/cinematic-glassmorphism/after.html",
        after_png=ROOT / "gold/modifiers/cinematic-glassmorphism/after.png",
        h=960,
    ),
    Shot(
        slug="dashboard-bento",
        label="/reimagine-it webpage dashboard bento",
        after_html=ROOT / "gold/modifiers/dashboard-bento/after.html",
        after_png=ROOT / "gold/modifiers/dashboard-bento/after.png",
        h=650,
    ),
    Shot(
        slug="landing-neon",
        label="/reimagine-it webpage landing neon",
        after_html=ROOT / "gold/modifiers/landing-neon/after.html",
        after_png=ROOT / "gold/modifiers/landing-neon/after.png",
        h=1100,
    ),
]


def find_browser() -> str:
    env = os.environ.get("REIMAGINE_BROWSER")
    if env and Path(env).is_file():
        return env
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for c in candidates:
        if Path(c).is_file():
            return c
    which = shutil.which("chrome") or shutil.which("msedge")
    if which:
        return which
    raise SystemExit(
        "No Chrome or Edge found. Set REIMAGINE_BROWSER=<full path>."
    )


def file_url(p: Path) -> str:
    return "file:///" + str(p.resolve()).replace("\\", "/")


def shoot(browser: str, url: str, out: Path, w: int, h: int, ms: int = 3500) -> bool:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.unlink(missing_ok=True)
    args = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--use-gl=swiftshader",
        "--no-sandbox",
        "--disable-extensions",
        "--disable-sync",
        f"--window-size={w},{h}",
        f"--virtual-time-budget={ms}",
        f"--screenshot={out}",
        url,
    ]
    try:
        subprocess.run(
            args,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=90,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return False
    return out.is_file() and out.stat().st_size > 1024


def main() -> int:
    browser = find_browser()
    print(f"browser: {browser}\n")

    ok_before = shoot(browser, file_url(BEFORE_HTML), BEFORE_PNG, w=1400, h=900, ms=1500)
    print(f"  {'OK ' if ok_before else 'FAIL'}  shared before  -> {BEFORE_PNG.relative_to(ROOT)}  ({BEFORE_PNG.stat().st_size if BEFORE_PNG.exists() else 0:,} bytes)")

    failed: list[str] = []
    for shot in PACKS:
        if not shot.after_html.exists():
            print(f"  SKIP  {shot.slug:20s} (missing {shot.after_html.relative_to(ROOT)})")
            failed.append(shot.slug)
            continue
        ok = shoot(browser, file_url(shot.after_html), shot.after_png, w=shot.w, h=shot.h)
        size = shot.after_png.stat().st_size if shot.after_png.exists() else 0
        print(f"  {'OK ' if ok else 'FAIL'}  {shot.slug:20s} -> {shot.after_png.relative_to(ROOT)}  ({size:,} bytes)")
        if not ok:
            failed.append(shot.slug)

    if failed:
        print(f"\n{len(failed)} pack(s) failed: {', '.join(failed)}", file=sys.stderr)
        return 1
    print(f"\nAll {len(PACKS)} per-pack after.png shots rendered.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
