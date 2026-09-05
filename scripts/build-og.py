#!/usr/bin/env python3
"""Compose GitHub/Pages social proof from committed Auto desktops.

Writes:
  docs/og.png   — 1200×630 Open Graph card
  docs/demo.gif — looping Auto-result reel (the uniqueness proof)

Usage from the repository root:
    python scripts/build-og.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
# (slug, label, token, community?) — community proofs load from docs/examples/community/.
CASES = (
    ("venator", "Venator", "gradient", False),
    ("crimson-circuit", "Crimson Circuit", "cinematic", False),
    ("velocita", "Velocita", "artistic", False),
    ("maracuya", "Maracuyá", "landing", False),
    ("flick", "Flick Fits", "photography", False),
    ("meridian", "Meridian", "3js", False),
    ("horizon", "Horizon", "dashboard", False),
    ("hearth-grain", "Hearth & Grain", "photography", False),
    ("millbrook-budget", "Millbrook", "infographic", False),
    ("riverside-clinic", "Clinic", "infographic", True),
    ("maison-vesper", "Maison Vesper", "lookbook", True),
)
VOID = (10, 15, 30)
INK = (244, 239, 228)
GOLD = (232, 166, 63)
DIM = (139, 147, 167)


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    names = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/georgia.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def load_desktop(slug: str, community: bool = False) -> Image.Image:
    lane = "community" if community else "end-users"
    path = DOCS / "examples" / lane / slug / "auto-desktop.png"
    if not path.is_file():
        path = ROOT / "examples" / lane / slug / "auto-desktop.png"
    if not path.is_file():
        raise SystemExit(f"missing {path} — run `npm run examples` first")
    return Image.open(path).convert("RGB")


def crop_top(image: Image.Image, width: int, height: int) -> Image.Image:
    src_w, src_h = image.size
    scale = max(width / src_w, height / src_h)
    resized = image.resize((max(1, int(src_w * scale)), max(1, int(src_h * scale))), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - width) // 2)
    return resized.crop((left, 0, left + width, height))


def build_og() -> Image.Image:
    canvas = Image.new("RGB", (1200, 630), VOID)
    draw = ImageDraw.Draw(canvas)
    count = len(CASES)
    draw.text((48, 36), "reimagine-it · v2.8 · 17 directions", font=font(22, True), fill=GOLD)
    draw.text((48, 72), f"{count} sources. No shared silhouette.", font=font(42, True), fill=INK)
    draw.text((48, 128), "Auto picks a distinct silhouette per page — not one infographic recast.", font=font(20), fill=DIM)

    gap = 10
    margin = 48
    # Tile width adapts to the case count so a ninth journey cannot
    # overflow the card edges.
    tile_w = min(152, (1200 - 2 * margin - (count - 1) * gap) // count)
    tile_h = 400
    total = count * tile_w + (count - 1) * gap
    x0 = (1200 - total) // 2
    y0 = 186
    for index, (slug, name, token, community) in enumerate(CASES):
        tile = crop_top(load_desktop(slug, community), tile_w, tile_h)
        x = x0 + index * (tile_w + gap)
        canvas.paste(tile, (x, y0))
        draw.rectangle((x, y0 + tile_h - 44, x + tile_w, y0 + tile_h), fill=VOID)
        draw.text((x + 8, y0 + tile_h - 40), name, font=font(12, True), fill=INK)
        draw.text((x + 8, y0 + tile_h - 22), token, font=font(13, True), fill=GOLD)
    return canvas


def build_demo_frames() -> list[Image.Image]:
    frames = []
    for slug, name, token, community in CASES:
        frame = Image.new("RGB", (960, 540), VOID)
        draw = ImageDraw.Draw(frame)
        shot = crop_top(load_desktop(slug, community), 960, 480)
        frame.paste(shot, (0, 0))
        draw.rectangle((0, 480, 960, 540), fill=VOID)
        draw.text((24, 492), f"{name}  →  {token}", font=font(22, True), fill=INK)
        draw.text((24, 518), "npx reimagine-it --auto", font=font(14), fill=GOLD)
        frames.append(frame)
    return frames


def main() -> int:
    DOCS.mkdir(parents=True, exist_ok=True)
    og = build_og()
    og_path = DOCS / "og.png"
    og.save(og_path, "PNG", optimize=True)
    print(f"wrote {og_path.relative_to(ROOT)} ({og_path.stat().st_size} bytes)")

    frames = build_demo_frames()
    gif_path = DOCS / "demo.gif"
    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=1400,
        loop=0,
        optimize=True,
    )
    print(f"wrote {gif_path.relative_to(ROOT)} ({gif_path.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
