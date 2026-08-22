"""Screenshot gold/forms (real Chrome). Serve over HTTP so ES modules load."""
from __future__ import annotations

import http.server
import sys
import threading
from functools import partial
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
BEFORE = ROOT.parent / "webpage" / "before.png"
# path, still, pair (or None), w, h, wait_ready, year
JOBS = [
    ("/svg/after.html", ROOT / "svg" / "after.png", ROOT / "svg" / "after-b.png", 1400, 900, False, None),
    ("/3js/after.html", ROOT / "3js" / "after.png", ROOT / "3js" / "after-b.png", 1400, 900, True, None),
    ("/simulation/after.html", ROOT / "simulation" / "after.png", None, 1400, 900, True, 1944.3),
]
LOOPS = [
    ("loop-breathe", "breathe"),
    ("loop-flow", "flow"),
    ("loop-ping", "ping"),
    ("loop-tick", "tick"),
]
LOOPS_DIR = ROOT / "loops"
MOTION_GAP_MS = 700


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


def start_server() -> tuple[http.server.ThreadingHTTPServer, int]:
    handler = partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


def grab(page) -> Image.Image:
    return Image.open(BytesIO(page.screenshot(type="png"))).convert("RGB")


def frames_differ(a: Image.Image, b: Image.Image, min_area: int = 80) -> bool:
    if a.size != b.size:
        return True
    bbox = ImageChops.difference(a, b).getbbox()
    return bbox is not None and (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) > min_area


def shoot(
    page,
    url: str,
    out: Path,
    pair: Path | None,
    w: int,
    h: int,
    wait_ready: bool,
    year: float | None,
) -> None:
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
        page.wait_for_timeout(1200 if pair else 2200)
    else:
        page.wait_for_timeout(400)
    first = grab(page)
    first.save(out)
    print(f"OK {out.name} {out.stat().st_size:,} bytes")
    if pair is None:
        return
    page.wait_for_timeout(MOTION_GAP_MS)
    second = grab(page)
    second.save(pair)
    if not frames_differ(first, second):
        raise RuntimeError(f"alive-micro failed: {out.parent.name} frames {MOTION_GAP_MS}ms apart are identical")
    print(f"OK {pair.name} motion delta vs {out.name}")


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


def compose_motion_strip() -> None:
    tiles = [
        (ROOT / "svg" / "after.png", "svg t0"),
        (ROOT / "svg" / "after-b.png", "svg t1"),
        (ROOT / "3js" / "after.png", "3js t0"),
        (ROOT / "3js" / "after-b.png", "3js t1"),
    ]
    for path, _ in tiles:
        if not path.is_file():
            print(f"skip motion-strip.png (missing {path.name})", file=sys.stderr)
            return
    h = 220
    gap = 8
    label_h = 24
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
        font = ImageFont.truetype("segoeui.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    x = gap
    for im, (_path, label) in zip(images, tiles):
        strip.paste(im, (x, gap))
        draw.text((x, gap + h + 4), label, fill=ink, font=font)
        x += im.width + gap
    out = ROOT / "motion-strip.png"
    strip.save(out)
    print(f"OK {out.name} {out.stat().st_size:,} bytes")


def shoot_loops(page, origin: str) -> None:
    LOOPS_DIR.mkdir(parents=True, exist_ok=True)
    page.set_viewport_size({"width": 1400, "height": 1200})
    page.goto(origin + "/see.html", wait_until="networkidle", timeout=25000)
    page.wait_for_timeout(900)
    first: dict[str, Image.Image] = {}
    for lid, name in LOOPS:
        loc = page.locator(f"#{lid}")
        loc.scroll_into_view_if_needed()
        page.wait_for_timeout(80)
        path = LOOPS_DIR / f"{name}-a.png"
        loc.screenshot(path=str(path), type="png")
        first[name] = Image.open(path).convert("RGB")
        print(f"OK loops/{path.name} {path.stat().st_size:,} bytes")
    page.wait_for_timeout(1400)
    for lid, name in LOOPS:
        loc = page.locator(f"#{lid}")
        loc.scroll_into_view_if_needed()
        path = LOOPS_DIR / f"{name}-b.png"
        loc.screenshot(path=str(path), type="png")
        second = Image.open(path).convert("RGB")
        if not frames_differ(first[name], second, min_area=20):
            raise RuntimeError(
                f"alive-micro failed: loop {name} frames 1400ms apart are identical"
            )
        print(f"OK loops/{path.name} motion delta vs {name}-a.png")
    page.set_viewport_size({"width": 1400, "height": 1800})
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    see = ROOT / "see.png"
    page.screenshot(path=str(see), full_page=True, type="png")
    print(f"OK {see.name} {see.stat().st_size:,} bytes")


def compose_loops_strip() -> None:
    tiles = [(LOOPS_DIR / f"{name}-a.png", name) for _lid, name in LOOPS]
    for path, _ in tiles:
        if not path.is_file():
            print(f"skip loops-strip.png (missing {path.name})", file=sys.stderr)
            return
    h = 220
    gap = 8
    label_h = 24
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
        font = ImageFont.truetype("segoeui.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    x = gap
    for im, (_path, label) in zip(images, tiles):
        strip.paste(im, (x, gap))
        draw.text((x, gap + h + 4), label, fill=ink, font=font)
        x += im.width + gap
    out = ROOT / "loops-strip.png"
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
        for path, out, pair, w, h, wait_ready, year in JOBS:
            shoot(page, origin + path, out, pair, w, h, wait_ready, year)
        shoot_loops(page, origin)
        browser.close()
    httpd.shutdown()
    for line in errors:
        print(line, file=sys.stderr)
    if errors:
        return 1
    compose_strip()
    compose_motion_strip()
    compose_loops_strip()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
