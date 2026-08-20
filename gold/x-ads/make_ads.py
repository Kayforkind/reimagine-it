"""Crop gold shots to X Ads / timeline sizes.

Outputs land in this folder. Specs used:
  landscape  1200x628  (1.91:1 website card / single-image ad)
  square     1080x1080 (carousel + 4-up timeline)
  jpeg q=90, sRGB, under 5 MB
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
GOLD = HERE.parent
WEBPAGE = GOLD / "webpage"
OUT = HERE


def cover(src: Image.Image, w: int, h: int) -> Image.Image:
    """Center-crop to exact size (cover)."""
    return ImageOps.fit(src.convert("RGB"), (w, h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.42))


def top_cover(src: Image.Image, w: int, h: int) -> Image.Image:
    """Cover crop biased to the top (hero shots)."""
    return ImageOps.fit(src.convert("RGB"), (w, h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.12))


def save_jpg(im: Image.Image, name: str) -> Path:
    path = OUT / name
    im.save(path, "JPEG", quality=90, optimize=True, progressive=True)
    kb = path.stat().st_size // 1024
    print(f"  {name:40s} {im.size[0]}x{im.size[1]}  {kb}KB")
    return path


def side_by_side(left: Image.Image, right: Image.Image, w: int, h: int) -> Image.Image:
    """Two columns, labeled BEFORE / AFTER, 1200x628."""
    col_w = w // 2
    canvas = Image.new("RGB", (w, h), (10, 22, 38))
    l = ImageOps.fit(left.convert("RGB"), (col_w, h), Image.Resampling.LANCZOS, centering=(0.5, 0.15))
    r = ImageOps.fit(right.convert("RGB"), (w - col_w, h), Image.Resampling.LANCZOS, centering=(0.5, 0.12))
    canvas.paste(l, (0, 0))
    canvas.paste(r, (col_w, 0))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
        font_b = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 18)
    except OSError:
        font = font_b = ImageFont.load_default()
    # small chips
    draw.rectangle((16, 16, 110, 42), fill=(245, 240, 236))
    draw.text((28, 20), "BEFORE", fill=(106, 58, 58), font=font_b)
    draw.rectangle((col_w + 16, 16, col_w + 104, 42), fill=(14, 16, 36))
    draw.text((col_w + 28, 20), "AFTER", fill=(232, 166, 63), font=font_b)
    # hairline
    draw.line((col_w, 0, col_w, h), fill=(232, 166, 63), width=2)
    return canvas


def main() -> int:
    before = Image.open(WEBPAGE / "before.png")
    after_c = Image.open(WEBPAGE / "after-3-full.png")
    after_a = Image.open(WEBPAGE / "after.png")
    after_b = Image.open(WEBPAGE / "after-2.png")
    quartet = Image.open(WEBPAGE / "quartet.png")
    infographic = Image.open(GOLD / "domains" / "infographic" / "after.png")
    infographic_compare = Image.open(GOLD / "domains" / "infographic" / "compare.png")

    print("landscape 1200x628")
    save_jpg(cover(quartet, 1200, 628), "01-quartet-1200x628.jpg")
    save_jpg(top_cover(after_c, 1200, 628), "02-cinematic-1200x628.jpg")
    save_jpg(side_by_side(before, after_c, 1200, 628), "03-before-after-1200x628.jpg")
    save_jpg(cover(after_a, 1200, 628), "04-dashboard-1200x628.jpg")
    save_jpg(top_cover(infographic, 1200, 628), "05-infographic-1200x628.jpg")
    save_jpg(side_by_side(before, infographic, 1200, 628), "06-infographic-before-after-1200x628.jpg")
    save_jpg(cover(infographic_compare, 1200, 628), "07-infographic-compare-1200x628.jpg")

    print("square 1080x1080 (carousel / 4-up)")
    save_jpg(cover(before, 1080, 1080), "11-before-1080.jpg")
    save_jpg(cover(after_a, 1080, 1080), "12-dashboard-1080.jpg")
    save_jpg(cover(after_b, 1080, 1080), "13-fieldguide-1080.jpg")
    save_jpg(top_cover(after_c, 1080, 1080), "14-cinematic-1080.jpg")
    save_jpg(top_cover(infographic, 1080, 1080), "15-infographic-1080.jpg")
    save_jpg(cover(infographic_compare, 1080, 1080), "16-infographic-compare-1080.jpg")

    print("timeline 4-up originals (also fine to attach as-is)")
    # lighter jpeg copies of the four timeline attachments
    save_jpg(before.convert("RGB").resize((1200, 771), Image.Resampling.LANCZOS), "21-before-timeline.jpg")
    save_jpg(top_cover(after_c, 1200, 900), "22-cinematic-timeline.jpg")
    save_jpg(cover(quartet, 1600, 787), "23-quartet-timeline.jpg")

    print("done ->", OUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
