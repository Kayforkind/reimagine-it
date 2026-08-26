"""Build the end-user example gallery from real CLI output.

Usage from the repository root:
    npm run examples

The builder keeps browser screenshots in a temporary directory.
Only the source pages, generated HTML/reports, GIFs, composed cards, and
manifest are shipped.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
NODE = shutil.which("node") or "node"

# Dribbble-card palette (dark showcase stage)
STAGE = (14, 20, 28)          # deep navy stage
CARD = (24, 32, 44)           # card surface
CARD_EDGE = (46, 58, 76)      # card border
PAPER = (238, 241, 246)       # primary text
MUTED = (148, 161, 178)       # secondary text
GOLD = (232, 166, 63)         # accent before/after labels & PRO pill
GREEN = (64, 190, 145)        # engagement stat accent
HEART = (235, 87, 110)        # heart stat accent

# Card geometry (desktop)
CARD_W, CARD_H = 720, 720
PAD = 22
PHONE_W, PHONE_H = 258, 560        # iPhone-style frame
CHROME_W, CHROME_H = 396, 296      # browser window frame
FOOT_H = 56


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
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ]
    for candidate in candidates:
        if Path(candidate).is_file():
            return candidate
    for name in ("chrome", "google-chrome", "chromium", "msedge"):
        found = shutil.which(name)
        if found:
            return found
    raise SystemExit("No Chrome or Edge found. Set REIMAGINE_BROWSER=<path>.")


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def build_artifacts(example: dict[str, Any]) -> dict[str, Any]:
    folder = HERE / example["slug"]
    source = ROOT / example["source"]
    auto = folder / "auto.html"
    report = folder / "auto.json"
    alternates = [folder / f"option-{index + 2}-{token}.html" for index, token in enumerate(example["alternates"])]
    original = source.read_bytes()

    run([
        NODE, "scripts/auto.js",
        "--input", str(source),
        "--output", str(auto),
        "--report", str(report),
        "--seed", example["seed"],
        "--brief", example["brief"],
        "--candidates", "3",
        "--quiet",
    ])
    for token, alternate in zip(example["alternates"], alternates):
        run([NODE, "bin/reimagine-it.js", "--input", str(source), "--token", token, "--output", str(alternate), "--seed", example["seed"], "--quiet"])
    if source.read_bytes() != original:
        raise SystemExit(f"source changed while building {source}")

    details = json.loads(report.read_text(encoding="utf-8"))
    return {
        "name": example["name"],
        "source": example["source"],
        "auto": str(auto.relative_to(ROOT)).replace("\\", "/"),
        "report": str(report.relative_to(ROOT)).replace("\\", "/"),
        "alternates": [str(path.relative_to(ROOT)).replace("\\", "/") for path in alternates],
        "auto_token": details["token"],
        "alternate_tokens": example["alternates"],
        "seed": int(example["seed"]),
        "score": details["score"],
        "candidates": details["candidates"],
    }


def screenshot(browser: str, source: Path, output: Path, width: int = 1400, height: int = 1100, delay: int = 1800) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)
    subprocess.run([
        browser,
        "--headless",
        "--hide-scrollbars",
        "--no-sandbox",
        "--disable-extensions",
        "--disable-sync",
        "--disable-background-networking",
        f"--window-size={width},{height}",
        f"--virtual-time-budget={delay}",
        f"--screenshot={output}",
        source.resolve().as_uri(),
    ], cwd=ROOT, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
    if not output.is_file() or output.stat().st_size < 1024:
        raise SystemExit(f"could not render {source}")


# ---------------------------------------------------------------- drawing ---

_AVATAR_COLORS = [(232, 166, 63), (64, 190, 145), (98, 140, 220), (232, 84, 110)]


def _rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: tuple[int, int, int]) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def _pill(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fg: tuple[int, int, int], bg: tuple[int, int, int],
          fnt: ImageFont.ImageFont, pad: int = 7) -> int:
    w = draw.textlength(text, font=fnt) + pad * 2
    draw.rounded_rectangle((x, y, x + w, y + fnt.size + 8), radius=(fnt.size + 8) // 2, fill=bg)
    draw.text((x + pad, y + 5), text, font=fnt, fill=fg)
    return int(w)


def _avatar(draw: ImageDraw.ImageDraw, x: int, y: int, size: int, color: tuple[int, int, int]) -> None:
    draw.ellipse((x, y, x + size, y + size), fill=color)
    draw.ellipse((x + size * 0.22, y + size * 0.16, x + size * 0.78, y + size * 0.5), fill=(255, 255, 255, 60))


def _device_frame(draw, x, y, w, h, device, canvas, img):
    """Render a browser window or phone frame and paste the screenshot into it."""
    if device == "phone":
        # bezel + rounded screen + punch hole + gesture bar
        draw.rounded_rectangle((x, y, x + w, y + h), radius=38, fill=(10, 13, 18))
        screen = (x + 12, y + 12, x + w - 12, y + h - 12)
        shot = ImageOps.fit(img.convert("RGB"), (screen[2] - screen[0], screen[3] - screen[1]), Image.Resampling.LANCZOS)
        canvas.paste(shot, (screen[0], screen[1]))
        draw.ellipse((x + w // 2 - 11, y + 26, x + w // 2 + 11, y + 48), fill=(10, 13, 18))
        draw.rounded_rectangle((x + w // 2 - 42, y + h - 12, x + w // 2 + 42, y + h - 6), radius=3, fill=(60, 68, 82))
    else:
        # browser window chrome
        draw.rounded_rectangle((x, y, x + w, y + h), radius=14, fill=(16, 20, 28))
        draw.rectangle((x, y, x + w, y + 36), fill=(24, 30, 40))
        draw.ellipse((x + 14, y + 11, x + 26, y + 23), fill=(232, 84, 110))
        draw.ellipse((x + 30, y + 11, x + 42, y + 23), fill=(232, 166, 63))
        draw.ellipse((x + 46, y + 11, x + 58, y + 23), fill=(64, 190, 145))
        shot = ImageOps.fit(img.convert("RGB"), (w - 4, h - 40), Image.Resampling.LANCZOS)
        canvas.paste(shot, (x + 2, y + 36))


def _icon(draw: ImageDraw.ImageDraw, x: int, y: int, kind: str, color: tuple[int, int, int], size: int = 16) -> None:
    """Simple geometric icons for the action row (heart / view / chat / bookmark)."""
    if kind == "heart":
        draw.polygon([(x, y + size * 0.35), (x + size * 0.5, y + size), (x + size, y + size * 0.35),
                      (x + size * 0.5, y - size * 0.12)], fill=color)
    elif kind == "view":
        draw.ellipse((x, y, x + size, y + size), outline=color, width=1)
        draw.ellipse((x + size * 0.3, y + size * 0.3, x + size * 0.7, y + size * 0.7), outline=color, width=1)
    elif kind == "chat":
        draw.rounded_rectangle((x, y, x + size, y + size * 0.72), radius=size * 0.18, fill=color)
        draw.polygon([(x + size * 0.18, y + size * 0.72), (x + size * 0.18, y + size), (x + size * 0.42, y + size * 0.72)], fill=color)
    elif kind == "bookmark":
        draw.polygon([(x, y), (x + size, y), (x + size, y + size), (x + size * 0.5, y + size * 0.7), (x, y + size)], fill=color)


def compose_card(shot: Image.Image, meta: dict[str, Any], device: str = "browser") -> Image.Image:
    """Compose one full-bleed exhibit: slim eyebrow + device filling the card + caption strip."""
    canvas = Image.new("RGB", (CARD_W, CARD_H), CARD)
    draw = ImageDraw.Draw(canvas)
    # slim eyebrow strip at the very top
    draw.text((CARD_W // 2, 20), meta["eyebrow"], font=font(12, bold=True), fill=GOLD, anchor="ma")
    # device fills the card width; tall enough to dominate the frame
    if device == "browser":
        dw, dh = 664, 559
    else:
        dw, dh = 312, 570
    x = (CARD_W - dw) // 2
    y = 44
    _device_frame(draw, x, y, dw, dh, device, canvas, shot)
    cap_y = y + dh + 16
    # caption: label + sub on one compact strip
    draw.text((CARD_W // 2, cap_y), meta["label"], font=font(15, bold=True), fill=PAPER, anchor="mm")
    draw.text((CARD_W // 2, cap_y + 22), meta["sub"], font=font(11), fill=MUTED, anchor="mm")
    # footer: avatar + author + PRO pill + engagement stats
    fy = CARD_H - 52
    avatar_color = meta.get("avatar", GOLD)
    _avatar(draw, 30, fy, 26, avatar_color)
    draw.text((64, fy + 4), meta.get("author", "reimagine-it"), font=font(13, bold=True), fill=PAPER)
    pill_x = 64 + draw.textlength(meta.get("author", "reimagine-it"), font=font(13, bold=True)) + 10
    _pill(draw, pill_x, fy + 5, "PRO", CARD, GOLD, font(9, bold=True), pad=6)
    # stats right side: heart + view counts
    rx = CARD_W - 44
    for icon, count in reversed(meta.get("stats", [])):
        draw.text((rx - 6, fy + 6), count, font=font(13, bold=True), fill=PAPER, anchor="rm")
        _icon(draw, rx - 24, fy + 8, icon, HEART if icon == "heart" else MUTED, size=15)
        rx -= 82
    draw.text((64, fy + 24), meta.get("mutual", "content-derived design"), font=font(10), fill=MUTED)
    return canvas


def write_gif(path: Path, cards: list[tuple[Image.Image, float]]) -> None:
    frames = [image for image, _duration in cards]
    durations = [int(duration * 1000) for _image, duration in cards]
    frames[0].save(
        path, save_all=True, append_images=frames[1:],
        duration=durations, loop=0, optimize=False, disposal=2,
    )
    if path.stat().st_size > 6 * 1024 * 1024:
        raise SystemExit(f"GIF is unexpectedly large: {path}")


# ---------------------------------------------------------------- main build

EXAMPLES: list[dict[str, Any]] = [
    {
        "slug": "orbitline",
        "name": "Orbitline Release Desk",
        "source": "examples/end-users/orbitline/source.html",
        "alternates": ["infographic", "webpage"],
        "seed": "11",
        "brief": "quiet operational clarity",
        "author": "Orbitline · release ops",
        "views": "5.4k",
        "stats": [("heart", "18"), ("view", "5.4k")],
        "mutual": "Operations",
    },
    {
        "slug": "ember-table",
        "name": "Ember & Table",
        "source": "examples/end-users/ember-table/source.html",
        "alternates": ["photography", "cinematic"],
        "seed": "23",
        "brief": "warm seasonal hospitality",
        "author": "Ember & Table · hospitality",
        "views": "25.1k",
        "stats": [("heart", "101"), ("view", "25.1k")],
        "mutual": "Hospitality",
    },
    {
        "slug": "tide-letter",
        "name": "A Letter to the Night Tide",
        "source": "examples/end-users/tide-letter/source.html",
        "alternates": ["artistic", "simulation"],
        "seed": "37",
        "brief": "quiet nocturnal essay",
        "author": "Night Tide · letters",
        "views": "48.5k",
        "stats": [("heart", "247"), ("view", "48.5k")],
        "mutual": "Writing",
    },
    {
        "slug": "teralyte",
        "name": "Teralyte — Infrastructure that answers back",
        "source": "examples/end-users/teralyte/source.html",
        "alternates": ["landing", "gradient"],
        "seed": "43",
        "brief": "bold infrastructure product",
        "author": "Teralyte · cloud",
        "views": "12.8k",
        "stats": [("heart", "64"), ("view", "12.8k")],
        "mutual": "Infrastructure",
        "avatar": (98, 140, 220),
    },
    {
        "slug": "venator",
        "name": "Venator — Crypto Battle Royale",
        "source": "examples/end-users/venator/source.html",
        "alternates": ["landing", "artistic"],
        "seed": "57",
        "brief": "bold gaming arena, gold and black",
        "author": "Venator · crypto game",
        "views": "336k",
        "stats": [("heart", "1284"), ("view", "336k")],
        "mutual": "Gaming",
        "avatar": (232, 166, 63),
    },
]


def main() -> int:
    browser = find_browser()
    manifest: list[dict[str, Any]] = []
    with tempfile.TemporaryDirectory(prefix="reimagine-examples-") as tmp:
        scratch = Path(tmp)
        all_cards: list[tuple[Image.Image, float]] = []
        for example in EXAMPLES:
            details = build_artifacts(example)
            folder = HERE / example["slug"]
            before_png = scratch / f"{example['slug']}-before.png"
            auto_png = scratch / f"{example['slug']}-auto.png"
            alternate_pngs = [scratch / f"{example['slug']}-option-{index}.png" for index in range(2, 4)]
            screenshot(browser, ROOT / example["source"], before_png)
            screenshot(browser, folder / "auto.html", auto_png)
            for alternate, alternate_png in zip(details["alternates"], alternate_pngs):
                screenshot(browser, ROOT / alternate, alternate_png)

            phone_before = scratch / f"{example['slug']}-phone-before.png"
            phone_auto = scratch / f"{example['slug']}-phone-auto.png"
            screenshot(browser, ROOT / example["source"], phone_before, width=480, height=960)
            screenshot(browser, folder / "auto.html", phone_auto, width=480, height=960)

            meta = {
                "author": example["author"],
                "views": example["views"],
                "stats": example["stats"],
                "mutual": example["mutual"],
                "avatar": example.get("avatar", GOLD),
            }
            cards = [
                (compose_card(Image.open(before_png), {**meta, "eyebrow": "01 · source", "label": example["name"], "sub": "The original HTML — untouched"}, "browser"), 2.2),
                (compose_card(Image.open(auto_png), {**meta, "eyebrow": f"02 · auto → {details['auto_token']}", "label": "strongest verified direction", "sub": "Layout, palette, and motion derived from the source"}, "browser"), 2.8),
                *[(compose_card(Image.open(alternate_pngs[index]), {**meta, "eyebrow": f"0{step} · compare → {token}", "label": "a deliberate second direction", "sub": "Another composition from the same source — not a recolor"}, "browser"), 2.2) for index, (token, step) in enumerate(zip(details["alternate_tokens"], (3, 4)))],
                (compose_card(Image.open(phone_before), {**meta, "eyebrow": "on mobile", "label": "The source at phone width", "sub": "Same HTML, no edits — side by side mentally"}, "phone"), 2.2),
                (compose_card(Image.open(phone_auto), {**meta, "eyebrow": f"mobile → {details['auto_token']}", "label": "responsive by default", "sub": "The redesign adapts to a phone screen"}, "phone"), 2.8),
            ]
            write_gif(folder / "before-after.gif", cards)
            all_cards.extend(cards)
            manifest.append(details)
            print(f"{example['slug']}: auto={details['auto_token']} alternates={','.join(details['alternate_tokens'])}")

        write_gif(HERE / "gallery.gif", all_cards)

    (HERE / "manifest.json").write_text(json.dumps({"examples": manifest}, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(manifest)} end-user examples and {len(manifest) + 1} GIFs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())