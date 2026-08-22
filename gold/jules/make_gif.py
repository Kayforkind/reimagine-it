"""X post GIF — Jules Ice Cream gold, every current after."""
from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
WORK = HERE / "gif-frames"
OUT = HERE / "best.gif"

NAVY = (18, 14, 12)
GOLD_INK = (228, 177, 90)
CREAM = (247, 239, 228)
PAPER = (250, 247, 242)
CREAM_SHEET = (232, 214, 188)
DARK_SHEET = (18, 14, 12)
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


def plate(src: Image.Image, paper: tuple[int, int, int], hero: bool = False) -> Image.Image:
    canvas = Image.new("RGB", (W, H), NAVY)
    pad_x, cap, pad_b = 28, 52, 28
    box_w, box_h = W - pad_x * 2, H - cap - pad_b
    im = src.convert("RGB")
    if hero:
        scale = box_w / im.width
        resized = im.resize((box_w, max(1, int(im.height * scale))), Image.Resampling.LANCZOS)
        crop_h = min(box_h, resized.height)
        fitted = resized.crop((0, 0, box_w, crop_h))
    else:
        fitted = ImageOps.contain(im, (box_w - 4, box_h - 4), Image.Resampling.LANCZOS)
    sheet = Image.new("RGB", (fitted.width + 4, fitted.height + 4), paper)
    sheet.paste(fitted, (2, 2))
    x = (W - sheet.width) // 2
    y = cap + (0 if hero else (box_h - sheet.height) // 2)
    canvas.paste(sheet, (x, y))
    return canvas


def caption(im: Image.Image, title: str, sub: str = "") -> Image.Image:
    draw = ImageDraw.Draw(im)
    title_font = font(20, bold=True)
    draw.text((28, 16), title, fill=GOLD_INK, font=title_font)
    if sub:
        tw = draw.textbbox((0, 0), title, font=title_font)[2]
        draw.text((28 + tw + 12, 20), sub, fill=CREAM, font=font(15))
    return im


def must_open(path: Path) -> Image.Image:
    if not path.is_file():
        raise SystemExit(f"missing {path}")
    return Image.open(path)


def add(frames, name, path, paper, title, sub, dur, *, hero=False, trim=False):
    src = must_open(path)
    if trim:
        src = trim_whitespace(src)
    frames.append((name, caption(plate(src, paper, hero=hero), title, sub), dur))


def main() -> int:
    WORK.mkdir(parents=True, exist_ok=True)
    frames = []
    add(frames, "00-before.png", HERE / "before.png", PAPER, "BEFORE", "Jules Ice Cream", 1.7, trim=True)
    add(frames, "01-webpage.png", HERE / "webpage" / "after.png", CREAM_SHEET, "AFTER", "webpage", 1.6, hero=True)
    add(frames, "02-artistic.png", HERE / "domains" / "artistic" / "after.png", CREAM_SHEET, "AFTER", "webpage artistic", 1.6, hero=True)
    add(frames, "03-dashboard.png", HERE / "domains" / "dashboard" / "after.png", DARK_SHEET, "AFTER", "webpage dashboard", 1.6)
    add(frames, "04-photography.png", HERE / "domains" / "photography" / "after.png", CREAM_SHEET, "AFTER", "webpage photography", 1.6, hero=True)
    add(frames, "05-cinematic.png", HERE / "domains" / "cinematic" / "after.png", DARK_SHEET, "AFTER", "webpage cinematic", 1.8, hero=True)
    add(frames, "06-glass.png", HERE / "modifiers" / "cinematic-glassmorphism" / "after.png", DARK_SHEET, "AFTER", "cinematic glassmorphism", 1.5, hero=True)
    add(frames, "07-bento.png", HERE / "modifiers" / "dashboard-bento" / "after.png", DARK_SHEET, "AFTER", "dashboard bento", 1.5)
    add(frames, "08-neon.png", HERE / "modifiers" / "landing-neon" / "after.png", DARK_SHEET, "AFTER", "landing neon", 1.6, hero=True)
    add(frames, "09-infographic.png", HERE / "domains" / "infographic" / "after.png", CREAM_SHEET, "AFTER", "infographic", 2.0, hero=True)
    add(frames, "10-svg.png", HERE / "forms" / "svg" / "after.png", CREAM_SHEET, "AFTER", "svg", 1.4)
    add(frames, "11-3js.png", HERE / "forms" / "3js" / "after.png", DARK_SHEET, "AFTER", "3js", 1.5)
    add(frames, "12-simulation.png", HERE / "forms" / "simulation" / "after.png", DARK_SHEET, "AFTER", "simulation", 2.4)

    lst = WORK / "concat.txt"
    lines = []
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
    kb = OUT.stat().st_size // 1024
    print(f"{OUT.name}  {kb}KB  {len(frames)} frames")
    if kb > 5000:
        print("warning: GIF over 5MB")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
