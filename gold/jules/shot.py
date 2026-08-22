"""Screenshot Jules Ice Cream gold (real Chrome). HTTP so ES modules load."""
from __future__ import annotations

import http.server
import threading
from functools import partial
from io import BytesIO
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent

JOBS = [
    ("/before.html", ROOT / "before.png", 1400, 900, False, None),
    ("/webpage/after.html", ROOT / "webpage" / "after.png", 1400, 900, False, None),
    ("/domains/artistic/after.html", ROOT / "domains" / "artistic" / "after.png", 1400, 1100, False, None),
    ("/domains/dashboard/after.html", ROOT / "domains" / "dashboard" / "after.png", 1440, 1100, False, None),
    ("/domains/photography/after.html", ROOT / "domains" / "photography" / "after.png", 1400, 1600, False, None),
    ("/domains/cinematic/after.html", ROOT / "domains" / "cinematic" / "after.png", 1400, 1100, False, None),
    ("/domains/infographic/after.html", ROOT / "domains" / "infographic" / "after.png", 1400, 1800, False, None),
    ("/modifiers/cinematic-glassmorphism/after.html", ROOT / "modifiers" / "cinematic-glassmorphism" / "after.png", 1400, 1100, False, None),
    ("/modifiers/dashboard-bento/after.html", ROOT / "modifiers" / "dashboard-bento" / "after.png", 1440, 1000, False, None),
    ("/modifiers/landing-neon/after.html", ROOT / "modifiers" / "landing-neon" / "after.png", 1400, 900, False, None),
    ("/forms/svg/after.html", ROOT / "forms" / "svg" / "after.png", 1400, 900, False, None),
    ("/forms/3js/after.html", ROOT / "forms" / "3js" / "after.png", 1400, 900, True, None),
    ("/forms/simulation/after.html", ROOT / "forms" / "simulation" / "after.png", 1400, 900, True, 2014.3),
]


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


def main() -> int:
    httpd, port = start_server()
    origin = f"http://127.0.0.1:{port}"
    errors: list[str] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            channel="chrome",
            args=["--enable-webgl", "--ignore-gpu-blocklist"],
        )
        ctx = browser.new_context(device_scale_factor=1)
        page = ctx.new_page()
        page.on("pageerror", lambda err: errors.append(f"PAGEERROR {err}"))
        for path, out, w, h, wait_ready, year in JOBS:
            out.parent.mkdir(parents=True, exist_ok=True)
            page.set_viewport_size({"width": w, "height": h})
            page.goto(origin + path, wait_until="networkidle", timeout=25000)
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
                page.wait_for_timeout(900)
            grab(page).save(out)
            print(f"OK {out.relative_to(ROOT)} {out.stat().st_size:,} bytes")
        browser.close()
    httpd.shutdown()
    for line in errors:
        print(line)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
