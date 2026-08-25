"""Build token showcase images: one wide desktop board + one tall phone board.

Each tile is a proper screenshot at readable size. Three columns.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
NODE = shutil.which("node") or "node"
DESK_OUT = ROOT / "docs" / "tokens-board.png"
PHONE_OUT = ROOT / "docs" / "tokens-phone.png"
SCREEN_OUT = ROOT / "docs" / "tokens"

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

# tile sizes
DW, DH = 740, 580  # desktop tile
PW, PH = 320, 680  # phone tile

CARD = (10, 15, 30)
GOLD = (206, 178, 126)
PAPER = (244, 239, 228)
MUTED = (140, 160, 180)


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


def tile_bg(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int) -> None:
    draw.rounded_rectangle((x, y, x + w, y + h), radius=16, fill=(244, 239, 228, 6), outline=(244, 239, 228, 30), width=1)


def build_board(kind: str) -> None:
    """kind: 'desktop' or 'phone'"""
    if kind == "desktop":
        tw, th, gap, label = DW, DH, 24, 64
        out = DESK_OUT
        shot_w, shot_h = 1480, 1250
    else:
        tw, th, gap, label = PW, PH, 24, 64
        out = PHONE_OUT
        shot_w, shot_h = 480, 960

    cols = 3
    rows = (len(TOKENS) + cols - 1) // cols
    bw = cols * tw + (cols + 1) * gap
    bh = rows * th + (rows + 1) * gap + label
    board = Image.new("RGB", (bw, bh), CARD)
    draw = ImageDraw.Draw(board, "RGBA")

    browser = find_browser()

    with tempfile.TemporaryDirectory(prefix="token-board-") as tmp:
        scratch = Path(tmp)
        SCREEN_OUT.mkdir(parents=True, exist_ok=True)
        for index, (token, blurb) in enumerate(TOKENS):
            html = scratch / f"{token}.html"
            png = SCREEN_OUT / f"{token}-{kind}.png"
            subprocess.run(
                [NODE, "bin/reimagine-it.js", "--input", str(SOURCE), "--token", token,
                 "--output", str(html), "--seed", SEED, "--quiet"],
                cwd=ROOT, check=True, capture_output=True,
            )
            screenshot(browser, html, png, shot_w, shot_h)

            col, row = index % cols, index // cols
            x = gap + col * (tw + gap)
            y = gap + row * (th + gap)
            shot = Image.open(png).convert("RGB")
            shot.thumbnail((tw - 12, th - 12), Image.Resampling.LANCZOS)
            sx = x + (tw - shot.width) // 2
            sy = y + (th - shot.height) // 2
            board.paste(shot, (sx, sy))
            tile_bg(draw, x, y, tw, th)
            draw.text((x + 16, y + th - 52), token, font=font(28, bold=True), fill=PAPER)
            dot = GOLD if index % 2 else MUTED
            draw.ellipse((x + 16, y + th - 32, x + 24, y + th - 24), fill=dot)
            draw.text((x + 34, y + th - 34), blurb, font=font(20), fill=MUTED)
            print(f"  {token} {kind} OK")

    draw.text((gap, bh - 52), f"14 directions · one source · real CLI output · {kind} view", font=font(22, bold=True), fill=GOLD)
    board.save(out, optimize=True)
    print(f"wrote {out} ({bw}x{bh})")


def main() -> int:
    build_board("desktop")
    build_board("phone")
    return 0


if __name__ == "__main__":
    sys.exit(main())