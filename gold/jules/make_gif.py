"""Jules gold GIF: naive before, then the tall infographic. No per-asset catalog."""
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
TOUR_STEPS = 10


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


def contain_frame(src: Image.Image, label: str) -> Image.Image:
    canvas = Image.new("RGB", (W, H), NAVY)
    fitted = ImageOps.contain(src.convert("RGB"), (W - 48, H - 72), Image.Resampling.LANCZOS)
    x = (W - fitted.width) // 2
    y = 52 + (H - 72 - fitted.height) // 2
    canvas.paste(fitted, (x, y))
    draw = ImageDraw.Draw(canvas)
    draw.text((28, 16), label, fill=GOLD_INK, font=font(20, bold=True))
    draw.text((28 + 96, 20), "Jules Ice Cream", fill=CREAM, font=font(15))
    return canvas


def tour_tall(src: Image.Image, steps: int) -> list[Image.Image]:
    im = src.convert("RGB")
    scale = W / im.width
    tall = im.resize((W, max(1, int(im.height * scale))), Image.Resampling.LANCZOS)
    if tall.height <= H:
        canvas = Image.new("RGB", (W, H), NAVY)
        canvas.paste(tall, (0, (H - tall.height) // 2))
        return [canvas]
    max_y = tall.height - H
    n = max(2, steps)
    out: list[Image.Image] = []
    for i in range(n):
        y = round(max_y * i / (n - 1))
        out.append(tall.crop((0, y, W, y + H)))
    return out


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
    before = trim_whitespace(Image.open(HERE / "before.png"))
    poster = Image.open(HERE / "domains" / "infographic" / "after.png")
    frames: list[tuple[str, Image.Image, float]] = [
        ("00-before.png", contain_frame(before, "BEFORE"), 2.2),
    ]
    tour = tour_tall(poster, TOUR_STEPS)
    for i, im in enumerate(tour):
        hold = 1.8 if i == len(tour) - 1 else (0.7 if i == 0 else 0.28)
        frames.append((f"01-info-{i:02d}.png", im, hold))
    write_gif(frames)
    kb = OUT.stat().st_size // 1024
    print(f"{OUT.name}  {kb}KB  {len(frames)} frames (before + infographic tour)")
    return 1 if kb > 5000 else 0


if __name__ == "__main__":
    raise SystemExit(main())
