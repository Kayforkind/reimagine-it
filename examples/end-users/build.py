"""Build the end-user example gallery from real CLI output.

Usage from the repository root:
    npm run examples

The builder deliberately keeps browser screenshots in a temporary directory.
Only the source pages, generated HTML/reports, GIFs, and manifest are shipped.
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
WIDTH, HEIGHT = 720, 760
BAR = 72
BACKGROUND = (8, 18, 31)
GOLD = (232, 166, 63)
PAPER = (244, 236, 216)
MUTED = (164, 177, 194)

EXAMPLES: list[dict[str, Any]] = [
    {
        "slug": "orbitline",
        "name": "Orbitline Release Desk",
        "source": "examples/end-users/orbitline/source.html",
        "alternate": "infographic",
        "seed": "11",
        "brief": "quiet operational clarity",
    },
    {
        "slug": "ember-table",
        "name": "Ember & Table",
        "source": "examples/end-users/ember-table/source.html",
        "alternate": "photography",
        "seed": "23",
        "brief": "warm seasonal hospitality",
    },
    {
        "slug": "tide-letter",
        "name": "A Letter to the Night Tide",
        "source": "examples/end-users/tide-letter/source.html",
        "alternate": "artistic",
        "seed": "37",
        "brief": "quiet nocturnal essay",
    },
]


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
    raise SystemExit("No Chrome or Edge found. Set REIMAGINE_BROWSER=<path>." )


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def build_artifacts(example: dict[str, Any]) -> dict[str, Any]:
    folder = HERE / example["slug"]
    source = ROOT / example["source"]
    auto = folder / "auto.html"
    report = folder / "auto.json"
    alternate = folder / "alternate.html"
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
    run([
        NODE, "bin/reimagine-it.js",
        "--input", str(source),
        "--token", example["alternate"],
        "--output", str(alternate),
        "--seed", example["seed"],
        "--quiet",
    ])
    if source.read_bytes() != original:
        raise SystemExit(f"source changed while building {source}")

    details = json.loads(report.read_text(encoding="utf-8"))
    return {
        "name": example["name"],
        "source": example["source"],
        "auto": str(auto.relative_to(ROOT)).replace("\\", "/"),
        "report": str(report.relative_to(ROOT)).replace("\\", "/"),
        "alternate": str(alternate.relative_to(ROOT)).replace("\\", "/"),
        "auto_token": details["token"],
        "alternate_token": example["alternate"],
        "seed": int(example["seed"]),
        "score": details["score"],
        "candidates": details["candidates"],
    }


def screenshot(browser: str, source: Path, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)
    subprocess.run([
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--use-gl=swiftshader",
        "--no-sandbox",
        "--disable-extensions",
        "--disable-sync",
        "--window-size=1400,1100",
        "--virtual-time-budget=1800",
        f"--screenshot={output}",
        source.resolve().as_uri(),
    ], cwd=ROOT, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
    if not output.is_file() or output.stat().st_size < 1024:
        raise SystemExit(f"could not render {source}")


def labelled(image: Image.Image, eyebrow: str, title: str) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    draw.text((22, 12), eyebrow.upper(), fill=GOLD, font=font(15, bold=True))
    draw.text((22, 38), title, fill=PAPER, font=font(13))
    fitted = ImageOps.contain(image.convert("RGB"), (WIDTH - 28, HEIGHT - BAR - 18), Image.Resampling.LANCZOS)
    x = (WIDTH - fitted.width) // 2
    y = BAR + (HEIGHT - BAR - fitted.height) // 2
    canvas.paste(fitted, (x, y))
    return canvas


def write_gif(path: Path, cards: list[tuple[Image.Image, float]]) -> None:
    frames = [image for image, _duration in cards]
    durations = [int(duration * 1000) for _image, duration in cards]
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=False, disposal=2)
    if path.stat().st_size > 5 * 1024 * 1024:
        raise SystemExit(f"GIF is unexpectedly large: {path}")


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
            alternate_png = scratch / f"{example['slug']}-alternate.png"
            screenshot(browser, ROOT / example["source"], before_png)
            screenshot(browser, folder / "auto.html", auto_png)
            screenshot(browser, folder / "alternate.html", alternate_png)

            cards = [
                (labelled(Image.open(before_png), "01 · source", example["name"]), 2.0),
                (labelled(Image.open(auto_png), f"02 · auto → {details['auto_token']}", "strongest verified direction"), 2.2),
                (labelled(Image.open(alternate_png), f"03 · compare → {details['alternate_token']}", "a deliberate second direction"), 2.0),
            ]
            write_gif(folder / "before-after.gif", cards)
            all_cards.extend(cards)
            manifest.append(details)
            print(f"{example['slug']}: auto={details['auto_token']} alternate={details['alternate_token']}")

        write_gif(HERE / "gallery.gif", all_cards)

    (HERE / "manifest.json").write_text(json.dumps({"examples": manifest}, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(manifest)} end-user examples and {len(manifest) + 1} GIFs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
