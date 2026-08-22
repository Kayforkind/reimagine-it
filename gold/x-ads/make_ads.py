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


def contain(src: Image.Image, w: int, h: int, bg: tuple[int, int, int]) -> Image.Image:
    """Fit the whole image inside the box. No crop through the artwork."""
    im = src.convert("RGB")
    fitted = ImageOps.contain(im, (w, h), method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (w, h), bg)
    canvas.paste(fitted, ((w - fitted.width) // 2, (h - fitted.height) // 2))
    return canvas


def _fonts(size: int = 20) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", size)
    except OSError:
        return ImageFont.load_default()


def _chip(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fill: tuple[int, int, int], ink: tuple[int, int, int], font: ImageFont.ImageFont) -> None:
    x, y = xy
    pad_x, pad_y = 12, 6
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.rectangle((x, y, x + tw + pad_x * 2, y + th + pad_y * 2), fill=fill)
    draw.text((x + pad_x, y + pad_y - 1), text, fill=ink, font=font)


def fusion_pair_hero(left: Image.Image, right: Image.Image, w: int, h: int) -> Image.Image:
    """Landscape pair: full before letterboxed; after fills its column from the top (title + timeline)."""
    bg = (10, 22, 38)
    canvas = Image.new("RGB", (w, h), bg)
    font = _fonts(18)
    pad, gap, label_h = 20, 12, 34
    col_w = (w - pad * 2 - gap) // 2
    col_h = h - pad * 2 - label_h
    y = pad + label_h
    l = contain(left, col_w, col_h, (245, 240, 236))
    r = ImageOps.fit(right.convert("RGB"), (col_w, col_h), Image.Resampling.LANCZOS, centering=(0.5, 0.06))
    canvas.paste(l, (pad, y))
    canvas.paste(r, (pad + col_w + gap, y))
    draw = ImageDraw.Draw(canvas)
    _chip(draw, (pad, pad), "BEFORE", (245, 240, 236), (106, 58, 58), font)
    _chip(draw, (pad + col_w + gap, pad), "AFTER", (14, 16, 36), (232, 166, 63), font)
    return canvas


def fusion_pair(left: Image.Image, right: Image.Image, w: int, h: int) -> Image.Image:
    """Two complete pages in one frame. Letterboxed, never sliced."""
    bg = (10, 22, 38)
    canvas = Image.new("RGB", (w, h), bg)
    font = _fonts(18)
    pad, gap, label_h = 24, 14, 36
    col_w = (w - pad * 2 - gap) // 2
    col_h = h - pad * 2 - label_h
    y = pad + label_h
    l = contain(left, col_w, col_h, (245, 240, 236))
    r = contain(right, col_w, col_h, (217, 203, 168))
    canvas.paste(l, (pad, y))
    canvas.paste(r, (pad + col_w + gap, y))
    draw = ImageDraw.Draw(canvas)
    _chip(draw, (pad, pad), "BEFORE", (245, 240, 236), (106, 58, 58), font)
    _chip(draw, (pad + col_w + gap, pad), "AFTER", (14, 16, 36), (232, 166, 63), font)
    return canvas


def fusion_stack(left: Image.Image, right: Image.Image, w: int, h: int) -> Image.Image:
    """Full-width before on top, full poster underneath. One vertical story."""
    bg = (10, 22, 38)
    canvas = Image.new("RGB", (w, h), bg)
    font = _fonts(18)
    pad, gap, label_h = 20, 12, 32
    inner_w = w - pad * 2
    top_h = int((h - pad * 2 - gap - label_h * 2) * 0.32)
    bot_h = h - pad * 2 - gap - label_h * 2 - top_h
    y_top = pad + label_h
    y_bot = y_top + top_h + gap + label_h
    canvas.paste(contain(left, inner_w, top_h, (245, 240, 236)), (pad, y_top))
    canvas.paste(contain(right, inner_w, bot_h, (217, 203, 168)), (pad, y_bot))
    draw = ImageDraw.Draw(canvas)
    _chip(draw, (pad, pad), "BEFORE", (245, 240, 236), (106, 58, 58), font)
    _chip(draw, (pad, y_top + top_h + gap), "AFTER", (14, 16, 36), (232, 166, 63), font)
    return canvas


def fusion_inset(left: Image.Image, right: Image.Image, w: int, h: int) -> Image.Image:
    """After fills the frame; before sits as a small card in the corner."""
    canvas = contain(right, w, h, (10, 22, 38))
    font = _fonts(16)
    card_w, card_h = int(w * 0.40), int(h * 0.36)
    card = Image.new("RGB", (card_w, card_h), (14, 16, 36))
    inner = contain(left, card_w - 16, card_h - 16, (245, 240, 236))
    card.paste(inner, (8, 8))
    canvas.paste(card, (28, h - card_h - 28))
    draw = ImageDraw.Draw(canvas)
    _chip(draw, (36, h - card_h - 20), "BEFORE", (245, 240, 236), (106, 58, 58), font)
    _chip(draw, (w - 120, 20), "AFTER", (14, 16, 36), (232, 166, 63), font)
    return canvas


def crop_paper(src: Image.Image, thresh: int = 220) -> Image.Image:
    """Trim screenshot gutter so fusion uses the sheet, not the page margin."""
    rgb = src.convert("RGB")
    lum = rgb.convert("L")
    arr = lum.point(lambda p: 255 if p > thresh else 0)
    box = arr.getbbox()
    if not box:
        return rgb
    pad = 4
    l, t, r, b = box
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(rgb.width, r + pad)
    b = min(rgb.height, b + pad)
    return rgb.crop((l, t, r, b))


def fusion_split(left: Image.Image, right: Image.Image, w: int, h: int) -> Image.Image:
    """One picture: left half before, right half after. No gap, no two cards."""
    L = ImageOps.fit(left.convert("RGB"), (w, h), Image.Resampling.LANCZOS, centering=(0.5, 0.08))
    R = ImageOps.fit(right.convert("RGB"), (w, h), Image.Resampling.LANCZOS, centering=(0.5, 0.08))
    mid = w // 2
    out = Image.new("RGB", (w, h))
    out.paste(L.crop((0, 0, mid, h)), (0, 0))
    out.paste(R.crop((mid, 0, w, h)), (mid, 0))
    draw = ImageDraw.Draw(out)
    try:
        font_b = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
    except OSError:
        font_b = ImageFont.load_default()
    draw.line((mid, 0, mid, h), fill=(232, 166, 63), width=3)
    draw.rectangle((16, 16, 118, 44), fill=(245, 240, 236))
    draw.text((28, 20), "BEFORE", fill=(106, 58, 58), font=font_b)
    draw.rectangle((mid + 16, 16, mid + 108, 44), fill=(14, 16, 36))
    draw.text((mid + 28, 20), "AFTER", fill=(232, 166, 63), font=font_b)
    return out


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
    infographic_sheet = crop_paper(infographic)
    infographic_compare = Image.open(GOLD / "domains" / "infographic" / "compare.png")

    print("landscape 1200x628")
    save_jpg(cover(quartet, 1200, 628), "01-quartet-1200x628.jpg")
    save_jpg(top_cover(after_c, 1200, 628), "02-cinematic-1200x628.jpg")
    save_jpg(side_by_side(before, after_c, 1200, 628), "03-before-after-1200x628.jpg")
    save_jpg(cover(after_a, 1200, 628), "04-dashboard-1200x628.jpg")
    save_jpg(top_cover(infographic, 1200, 628), "05-infographic-1200x628.jpg")
    save_jpg(side_by_side(before, infographic, 1200, 628), "06-infographic-before-after-1200x628.jpg")
    save_jpg(cover(infographic_compare, 1200, 628), "07-infographic-compare-1200x628.jpg")
    save_jpg(fusion_split(before, infographic_sheet, 1200, 628), "08-infographic-fusion-1200x628.jpg")

    print("square 1080x1080 (carousel / 4-up)")
    save_jpg(cover(before, 1080, 1080), "11-before-1080.jpg")
    save_jpg(cover(after_a, 1080, 1080), "12-dashboard-1080.jpg")
    save_jpg(cover(after_b, 1080, 1080), "13-fieldguide-1080.jpg")
    save_jpg(top_cover(after_c, 1080, 1080), "14-cinematic-1080.jpg")
    save_jpg(top_cover(infographic, 1080, 1080), "15-infographic-1080.jpg")
    save_jpg(cover(infographic_compare, 1080, 1080), "16-infographic-compare-1080.jpg")
    save_jpg(fusion_split(before, infographic_sheet, 1080, 1080), "17-infographic-fusion-1080.jpg")
    save_jpg(fusion_split(before, infographic_sheet, 1080, 1350), "18-infographic-fusion-1080x1350.jpg")

    print("fusion v2 — whole pages, no crop-through")
    save_jpg(fusion_pair(before, infographic_sheet, 1080, 1080), "31-fusion-pair-1080.jpg")
    save_jpg(fusion_pair(before, infographic_sheet, 1200, 628), "31-fusion-pair-1200x628.jpg")
    save_jpg(fusion_pair_hero(before, infographic_sheet, 1200, 628), "31-fusion-pair-hero-1200x628.jpg")
    save_jpg(fusion_stack(before, infographic_sheet, 1080, 1350), "32-fusion-stack-1080x1350.jpg")
    save_jpg(fusion_inset(before, infographic_sheet, 1080, 1080), "33-fusion-inset-1080.jpg")

    print("timeline 4-up originals (also fine to attach as-is)")
    # lighter jpeg copies of the four timeline attachments
    save_jpg(before.convert("RGB").resize((1200, 771), Image.Resampling.LANCZOS), "21-before-timeline.jpg")
    save_jpg(top_cover(after_c, 1200, 900), "22-cinematic-timeline.jpg")
    save_jpg(cover(quartet, 1600, 787), "23-quartet-timeline.jpg")

    print("done ->", OUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
