"""Take a full-page screenshot of an HTML file using real Chrome via Playwright.

Uses the installed Chrome so WebGL2 actually renders (Playwright's default
Chromium runs SwiftShader which fails or misrenders WebGL2 shaders).

Usage: python gold/_shot_full.py <html-file> <out.png> [width]
"""
from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: python gold/_shot_full.py <html> <out.png> [width]")
        return 2
    src = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
    if not src.is_file():
        print(f"missing: {src}")
        return 1
    out.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as pw:
        # Real Chrome, not Playwright's bundled Chromium — WebGL2 works here.
        browser = pw.chromium.launch(
            headless=True,
            channel="chrome",
            args=[
                "--enable-webgl",
                "--enable-webgl2-compute-context",
                "--ignore-gpu-blocklist",
            ],
        )
        ctx = browser.new_context(viewport={"width": width, "height": 900}, device_scale_factor=1)
        page = ctx.new_page()
        page.goto(src.as_uri(), wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1500)  # let the shader draw a frame or two
        page.screenshot(path=str(out), full_page=True, type="png")
        browser.close()

    size = out.stat().st_size
    print(f"OK: {out.name} = {size:,} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
