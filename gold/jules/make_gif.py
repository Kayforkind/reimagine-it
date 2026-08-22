"""Jules gold GIF: naive before, then every full-page after. No cropped loop cards."""
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
W, H = 720, 900
BAR = 40

PAGES: list[tuple[str, Path, str, str, float]] = [
    ("00-before", HERE / "before.png", "BEFORE", "Jules Ice Cream", 2.0),
    ("01-webpage", HERE / "webpage" / "after.png", "AFTER", "webpage", 1.6),
    ("02-artistic", HERE / "domains" / "artistic" / "after.png", "AFTER", "webpage artistic", 1.6),
    ("03-dashboard", HERE / "domains" / "dashboard" / "after.png", "AFTER", "webpage dashboard", 1.6),
    ("04-photography", HERE / "domains" / "photography" / "after.png", "AFTER", "webpage photography", 1.6),
    ("05-cinematic", HERE / "domains" / "cinematic" / "after.png", "AFTER", "webpage cinematic", 1.6),
    ("06-glass", HERE / "modifiers" / "cinematic-glassmorphism" / "after.png", "AFTER", "cinematic glassmorphism", 1.5),
    ("07-bento", HERE / "modifiers" / "dashboard-bento" / "after.png", "AFTER", "dashboard bento", 1.5),
    ("08-neon", HERE / "modifiers" / "landing-neon" / "after.png", "AFTER", "landing neon", 1.5),
    ("09-infographic", HERE / "domains" / "infographic" / "after.png", "AFTER", "infographic", 1.6),
    ("10-svg", HERE / "forms" / "svg" / "after.png", "AFTER", "svg", 1.5),
    ("11-3js", HERE / "forms" / "3js" / "after.png", "AFTER", "3js", 1.5),
    ("12-simulation", HERE / "forms" / "simulation" / "after.png", "AFTER", "simulation", 1.8),
]


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


def label_bar(title: str, sub: str) -> Image.Image:
    bar = Image.new("RGB", (W, BAR), NAVY)
    draw = ImageDraw.Draw(bar)
    draw.text((16, 10), title, fill=GOLD_INK, font=font(18, bold=True))
    if sub:
        tw = draw.textbbox((0, 0), title, font=font(18, bold=True))[2]
        draw.text((16 + tw + 10, 12), sub, fill=CREAM, font=font(14))
    return bar


def contain_page(src: Image.Image, title: str, sub: str) -> Image.Image:
    canvas = Image.new("RGB", (W, H), NAVY)
    canvas.paste(label_bar(title, sub), (0, 0))
    fitted = ImageOps.contain(src.convert("RGB"), (W, H - BAR), Image.Resampling.LANCZOS)
    x = (W - fitted.width) // 2
    y = BAR + (H - BAR - fitted.height) // 2
    canvas.paste(fitted, (x, y))
    return canvas


def tour_page(src: Image.Image, title: str, sub: str) -> list[tuple[Image.Image, float]]:
    im = src.convert("RGB")
    scale = W / im.width
    tall = im.resize((W, max(1, int(im.height * scale))), Image.Resampling.LANCZOS)
    body_h = H - BAR
    if tall.height <= body_h:
        return [(contain_page(im, title, sub), 1.6)]
    max_y = tall.height - body_h
    steps = 8 if tall.height > 1200 else 5
    out: list[tuple[Image.Image, float]] = []
    for i in range(steps):
        y = round(max_y * i / (steps - 1))
        frame = Image.new("RGB", (W, H), NAVY)
        frame.paste(label_bar(title, sub), (0, 0))
        frame.paste(tall.crop((0, y, W, y + body_h)), (0, BAR))
        hold = 1.4 if i == steps - 1 else (0.55 if i == 0 else 0.26)
        out.append((frame, hold))
    return out


def add_full_page(
    frames: list[tuple[str, Image.Image, float]],
    stem: str,
    path: Path,
    title: str,
    sub: str,
    dur: float,
    *,
    trim: bool = False,
) -> None:
    src = Image.open(path)
    if trim:
        src = trim_whitespace(src)
    src = src.convert("RGB")
    scaled_h = src.height * (W / src.width)
    if scaled_h > H - BAR + 24:
        for i, (im, hold) in enumerate(tour_page(src, title, sub)):
            frames.append((f"{stem}-{i:02d}.png", im, hold))
        return
    frames.append((f"{stem}.png", contain_page(src, title, sub), dur))


def write_gif(frames: list[tuple[str, Image.Image, float]]) -> None:
    WORK.mkdir(parents=True, exist_ok=True)
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


def main() -> int:
    frames: list[tuple[str, Image.Image, float]] = []
    for stem, path, title, sub, dur in PAGES:
        if not path.is_file():
            raise SystemExit(f"missing {path}")
        add_full_page(frames, stem, path, title, sub, dur, trim=(title == "BEFORE"))
    write_gif(frames)
    kb = OUT.stat().st_size // 1024
    print(f"{OUT.name}  {kb}KB  {len(frames)} plates (full pages, no loop cards)")
    return 1 if kb > 5000 else 0


if __name__ == "__main__":
    raise SystemExit(main())
