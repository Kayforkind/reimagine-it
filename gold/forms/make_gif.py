"""Looping GIF of the same HTML as SVG, Three.js, and a simulation.

Sources are gold screenshots already in the repo (run gold/forms/shot.py first).
Writes gold/forms/examples.gif and copies to gold/x-ads/before-after.gif.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
GOLD = HERE.parent
XADS = GOLD / "x-ads"
WORK = HERE / "gif-frames"
OUT = HERE / "examples.gif"
X_OUT = XADS / "before-after.gif"

NAVY = (10, 22, 38)
GOLD_INK = (232, 166, 63)
CREAM = (244, 236, 216)
PAPER = (250, 247, 242)
CREAM_SHEET = (217, 203, 168)
DARK_SHEET = (10, 22, 38)
W, H = 720, 900


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    try:
        return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)
    except OSError:
        return ImageFont.load_default()


def trim_whitespace(im: Image.Image, pad: int = 28) -> Image.Image:
    rgb = im.convert("RGB")
    bg = Image.new("RGB", rgb.size, rgb.getpixel((8, 8)))
    bbox = ImageChops.difference(rgb, bg).getbbox()
    if not bbox:
        return rgb
    l, t, r, b = bbox
    return rgb.crop(
        (max(0, l - pad), max(0, t - pad), min(rgb.width, r + pad), min(rgb.height, b + pad))
    )


def plate(src: Image.Image, paper: tuple[int, int, int]) -> Image.Image:
    canvas = Image.new("RGB", (W, H), NAVY)
    pad_x, cap, pad_b = 28, 52, 28
    box_w, box_h = W - pad_x * 2, H - cap - pad_b
    fitted = ImageOps.contain(src.convert("RGB"), (box_w - 4, box_h - 4), Image.Resampling.LANCZOS)
    sheet = Image.new("RGB", (fitted.width + 4, fitted.height + 4), paper)
    sheet.paste(fitted, (2, 2))
    x = (W - sheet.width) // 2
    y = cap + (box_h - sheet.height) // 2
    canvas.paste(sheet, (x, y))
    return canvas


def caption(im: Image.Image, title: str, sub: str = "") -> Image.Image:
    draw = ImageDraw.Draw(im)
    draw.text((28, 16), title, fill=GOLD_INK, font=font(22, bold=True))
    if sub:
        tw = draw.textbbox((0, 0), title, font=font(22, bold=True))[2]
        draw.text((28 + tw + 14, 20), sub, fill=CREAM, font=font(16))
    return im


def must_open(path: Path) -> Image.Image:
    if not path.is_file():
        raise SystemExit(f"missing {path}")
    return Image.open(path)


def main() -> int:
    WORK.mkdir(parents=True, exist_ok=True)
    before = trim_whitespace(must_open(GOLD / "webpage" / "before.png"))
    infographic = must_open(GOLD / "domains" / "infographic" / "after.png")
    svg = must_open(HERE / "svg" / "after.png")
    three = must_open(HERE / "3js" / "after.png")
    sim = must_open(HERE / "simulation" / "after.png")

    frames = [
        ("00-before.png", caption(plate(before, PAPER), "BEFORE"), 1.7),
        ("01-infographic.png", caption(plate(infographic, CREAM_SHEET), "AFTER", "/reimagine-it infographic"), 2.3),
        ("02-svg.png", caption(plate(svg, CREAM_SHEET), "AFTER", "/reimagine-it svg"), 2.3),
        ("03-3js.png", caption(plate(three, DARK_SHEET), "AFTER", "/reimagine-it 3js"), 2.4),
        ("04-simulation.png", caption(plate(sim, DARK_SHEET), "AFTER", "/reimagine-it simulation"), 2.6),
    ]

    lst = WORK / "concat.txt"
    lines: list[str] = []
    for name, im, dur in frames:
        path = WORK / name
        im.save(path, "PNG")
        lines.append(f"file '{path.as_posix()}'")
        lines.append(f"duration {dur:.2f}")
    lines.append(f"file '{(WORK / frames[-1][0]).as_posix()}'")
    lst.write_text("\n".join(lines) + "\n", encoding="utf-8")

    palette = WORK / "palette.png"
    subprocess.run(
        [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
            "-vf", "fps=8,scale=720:-1:flags=lanczos,palettegen=max_colors=160:stats_mode=full",
            str(palette),
        ],
        check=True,
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
            "-i", str(palette),
            "-lavfi", "fps=8,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3",
            "-loop", "0",
            str(OUT),
        ],
        check=True,
    )
    XADS.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUT, X_OUT)
    kb = OUT.stat().st_size // 1024
    print(f"{OUT.name}  {kb}KB")
    print(f"copied {X_OUT.relative_to(GOLD.parent)}")
    if kb > 5000:
        print("warning: GIF over 5MB; X may compress it hard", flush=True)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
