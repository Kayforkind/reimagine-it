"""Screenshot gold/forms (real Chrome). Serve over HTTP so ES modules load."""
from __future__ import annotations

import http.server
import sys
import threading
from functools import partial
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
BEFORE = ROOT.parent / "webpage" / "before.png"
JOBS = [
    ("/svg/after.svg", ROOT / "svg" / "after.png", 1400, 900, False, None),
    ("/3js/after.html", ROOT / "3js" / "after.png", 1400, 900, True, None),
    ("/simulation/after.html", ROOT / "simulation" / "after.png", 1400, 900, True, 1944.3),
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


def start_server() -> tuple[http.server.ThreadingHTTPServer, int]:
    handler = partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


def shoot(page, url: str, out: Path, w: int, h: int, wait_ready: bool, year: float | None) -> None:
    page.set_viewport_size({"width": w, "height": h})
    page.goto(url, wait_until="networkidle", timeout=25000)
    if wait_ready:
        page.wait_for_function(
            "() => document.documentElement.dataset.ready === '1'",
            timeout=12000,
        )
        if year is not None:
            page.evaluate(
                """(y) => {
                  const s = window.reimagineSim;
                  if (!s) return;
                  s.pause();
                  s.setYear(y);
                }""",
                year,
            )
        page.wait_for_timeout(1800)
    else:
        page.wait_for_timeout(500)
    page.screenshot(path=str(out), type="png")
    print(f"OK {out.name} {out.stat().st_size:,} bytes")


def compose_strip() -> None:
    tiles = [
        (BEFORE, "before"),
        (ROOT / "svg" / "after.png", "svg"),
        (ROOT / "3js" / "after.png", "3js"),
        (ROOT / "simulation" / "after.png", "simulation"),
    ]
    for path, _ in tiles:
        if not path.is_file():
            print(f"skip strip.png (missing {path.name})", file=sys.stderr)
            return
    h = 280
    gap = 10
    label_h = 28
    paper = (244, 236, 216)
    ink = (26, 33, 56)
    images = []
    for path, _label in tiles:
        im = Image.open(path).convert("RGB")
        ratio = h / im.height
        images.append(im.resize((max(1, int(im.width * ratio)), h), Image.Resampling.LANCZOS))
    width = sum(im.width for im in images) + gap * (len(images) + 1)
    strip = Image.new("RGB", (width, h + label_h + gap * 2), paper)
    draw = ImageDraw.Draw(strip)
    try:
        font = ImageFont.truetype("segoeui.ttf", 14)
    except OSError:
        font = ImageFont.load_default()
    x = gap
    for im, (_path, label) in zip(images, tiles):
        strip.paste(im, (x, gap))
        draw.text((x, gap + h + 6), label, fill=ink, font=font)
        x += im.width + gap
    out = ROOT / "strip.png"
    strip.save(out)
    print(f"OK {out.name} {out.stat().st_size:,} bytes")


def main() -> int:
    httpd, port = start_server()
    origin = f"http://127.0.0.1:{port}"
    errors: list[str] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            channel="chrome",
            args=[
                "--enable-webgl",
                "--enable-webgl2-compute-context",
                "--ignore-gpu-blocklist",
            ],
        )
        ctx = browser.new_context(device_scale_factor=1)
        page = ctx.new_page()
        page.on("pageerror", lambda err: errors.append(f"PAGEERROR {err}"))
        page.on(
            "console",
            lambda msg: print(f"CONSOLE {msg.type} {msg.text}", file=sys.stderr)
            if msg.type == "error"
            else None,
        )
        for path, out, w, h, wait_ready, year in JOBS:
            shoot(page, origin + path, out, w, h, wait_ready, year)
        browser.close()
    httpd.shutdown()
    for line in errors:
        print(line, file=sys.stderr)
    if errors:
        return 1
    compose_strip()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
