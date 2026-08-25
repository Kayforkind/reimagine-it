"""Build a Dribbble-style visual board of all 14 design tokens from one real source.

Runs the real CLI per token, headless-screenshots each output, then composes a
labeled grid saved to docs/tokens-board.png (used by README + landing page).
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
HERE = ROOT / "examples" / "end-users"
NODE = shutil.which("node") or "node"
OUT = ROOT / "docs" / "tokens-board.png"

TOKENS = [
    ("webpage", "Measured reading"),
    ("landing", "Hero + action"),
    ("dashboard", "Console & KPIs"),
    ("infographic", "Facts on scales"),
    ("cinematic", "Paced chapters"),
    ("artistic", "Layered fields"),
    ("photography", "Folio plates"),
    ("svg", "Geometric marks"),
    ("3js", "Spatial story"),
    ("simulation", "Playable timeline"),
    ("glass", "Frosted depth"),
    ("editorial", "Magazine layout"),
    ("motion", "Scroll reveals"),
    ("gradient", "Bold mesh"),
]

SOURCE = ROOT / "examples" / "end-users" / "tide-letter" / "source.html"
SEED = "7"


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    names = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


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


def screenshot(browser: str, page: Path, output: Path, width: int = 860, height: int = 620) -> None:
    subprocess.run(
        [
            browser,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--window-size={width},{height}",
            "--virtual-time-budget=4000",
            f"--screenshot={output}",
            page.as_uri(),
        ],
        check=True,
        capture_output=True,
    )


def tile(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, radius: int) -> None:
    draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=(244, 239, 228, 8), outline=(244, 239, 228, 40), width=1)


def main() -> int:
    browser = find_browser()
    if not SOURCE.is_file():
        raise SystemExit(f"missing source: {SOURCE}")

    cols, rows = 4, 4
    tw, th, gap, label = 860, 620, 22, 64
    bw = cols * tw + (cols + 1) * gap
    bh = rows * th + (rows + 1) * gap + label
    board = Image.new("RGB", (bw, bh), (10, 15, 30))
    draw = ImageDraw.Draw(board, "RGBA")

    with tempfile.TemporaryDirectory(prefix="token-board-") as tmp:
        scratch = Path(tmp)
        for index, (token, blurb) in enumerate(TOKENS):
            html = scratch / f"{token}.html"
            png = scratch / f"{token}.png"
            subprocess.run(
                [NODE, "bin/reimagine-it.js", "--input", str(SOURCE), "--token", token,
                 "--output", str(html), "--seed", SEED, "--quiet"],
                cwd=ROOT, check=True, capture_output=True,
            )
            screenshot(browser, html, png)

            col, row = index % cols, index // cols
            x = gap + col * (tw + gap)
            y = gap + row * (th + gap)
            shot = Image.open(png).convert("RGB")
            board.paste(shot, (x, y))
            tile(draw, x, y, tw, th, 14)
            draw.text((x + 16, y + th - 52), token, font=font(30, bold=True), fill=(244, 239, 228))
            dot = (206, 178, 126) if index % 2 else (140, 170, 200)
            draw.ellipse((x + 16, y + th - 32, x + 24, y + th - 24), fill=dot)
            draw.text((x + 34, y + th - 34), blurb, font=font(22), fill=(150, 160, 180))

    draw.text((gap, bh - 52), "14 directions · one source · real CLI output", font=font(24, bold=True), fill=(206, 178, 126))
    board.save(OUT, optimize=True)
    print(f"wrote {OUT} ({bw}x{bh})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
