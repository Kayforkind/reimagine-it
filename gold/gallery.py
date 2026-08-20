"""Render every gold page to a PNG and composite a master gallery grid.

Usage:
  python gold/gallery.py

Writes:
  gold/domains/<name>/hero.png             (individual heroes: artistic, dashboard, photography, cinematic)
  gold/modifiers/<name>/hero.png           (individual heroes: cinematic-glassmorphism, dashboard-bento, landing-neon)
  gold/gallery.png                         (master 2x4 grid: default + 4 domains + 3 modifier composites)

Requires Chrome or Edge on PATH. Set REIMAGINE_BROWSER=<path to browser.exe> to override.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def find_browser() -> str:
    env = os.environ.get("REIMAGINE_BROWSER")
    if env and Path(env).exists():
        return env
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ]
    for c in candidates:
        if Path(c).exists():
            return c
    raise SystemExit(
        "No Edge or Chrome found. Set REIMAGINE_BROWSER=<full path to msedge.exe or chrome.exe>."
    )


def shoot(browser: str, src: Path, dst: Path, w: int = 1400, h: int = 900, ms: int = 2200) -> bool:
    src_url = "file:///" + str(src).replace("\\", "/")
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        try:
            dst.unlink()
        except OSError:
            pass
    try:
        subprocess.run(
            [
                browser,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--use-gl=swiftshader",
                "--no-sandbox",
                "--disable-extensions",
                "--disable-sync",
                f"--window-size={w},{h}",
                f"--virtual-time-budget={ms}",
                f"--screenshot={dst}",
                src_url,
            ],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=45,
        )
    except subprocess.TimeoutExpired:
        return False
    return dst.exists() and dst.stat().st_size > 0


def composite(cells: list[tuple[str, Path, str]], out: Path, cols: int = 4, tile_w: int = 700, tile_h: int = 450) -> None:
    """Composite tiles into a grid using an HTML canvas + headless shot."""
    rows = (len(cells) + cols - 1) // cols
    grid_html = out.with_suffix(".html")
    parts = [
        "<!doctype html><html><head><meta charset='utf-8'>",
        "<style>",
        "html,body{margin:0;padding:0;background:#05070c;font-family:ui-sans-serif,system-ui,Segoe UI,sans-serif}",
        f".grid{{display:grid;grid-template-columns:repeat({cols},1fr);gap:16px;padding:24px;max-width:{cols*tile_w+80}px}}",
        ".tile{position:relative;border-radius:8px;overflow:hidden;background:#0f1420;border:1px solid #232d3d}",
        ".tile img{display:block;width:100%;height:auto}",
        ".tile .lab{position:absolute;top:10px;left:12px;font-family:ui-monospace,Consolas,monospace;font-size:10.5px;letter-spacing:.24em;color:#7cf3ff;text-transform:uppercase;background:rgba(5,7,12,.72);padding:6px 10px;border-radius:100px;border:1px solid rgba(124,243,255,.24);z-index:2}",
        ".tile .desc{position:absolute;bottom:10px;left:12px;right:12px;font-family:ui-sans-serif,system-ui,Segoe UI,sans-serif;font-size:11.5px;color:#ecf1ff;background:rgba(5,7,12,.72);padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.08);z-index:2}",
        "</style></head><body><div class='grid'>",
    ]
    for label, img_path, desc in cells:
        rel = img_path.resolve().as_uri()
        parts.append(f"<div class='tile'><span class='lab'>{label}</span><img src='{rel}' loading='eager'><span class='desc'>{desc}</span></div>")
    parts.append("</div></body></html>")
    grid_html.write_text("".join(parts), encoding="utf-8")
    canvas_h = 24 + rows * (tile_h + 16)
    canvas_w = cols * tile_w + 80
    browser = find_browser()
    ok = shoot(browser, grid_html, out, w=canvas_w, h=canvas_h, ms=1200)
    if not ok:
        print(f"WARN: gallery composite failed at {out}", file=sys.stderr)


def main() -> int:
    browser = find_browser()
    print(f"browser: {browser}")

    targets: list[tuple[str, Path, Path, str, tuple[int, int]]] = [
        (
            "default",
            ROOT / "gold/webpage/after.html",
            ROOT / "gold/webpage/hero.png",
            "sober designed page &mdash; default spine, no domain",
            (1400, 900),
        ),
        (
            "artistic",
            ROOT / "gold/domains/artistic/after.html",
            ROOT / "gold/domains/artistic/hero.png",
            "artistic &mdash; cream, italic serif, drifting arcs, 3D card fan",
            (1400, 900),
        ),
        (
            "dashboard",
            ROOT / "gold/domains/dashboard/after.html",
            ROOT / "gold/domains/dashboard/hero.png",
            "dashboard &mdash; KPI tiles, live SVG chart, status pills, terminal",
            (1400, 900),
        ),
        (
            "photography",
            ROOT / "gold/domains/photography/after.html",
            ROOT / "gold/domains/photography/hero.png",
            "photography &mdash; magazine folio, SVG plates, dropcaps",
            (1400, 900),
        ),
        (
            "cinematic",
            ROOT / "gold/domains/cinematic/after.html",
            ROOT / "gold/domains/cinematic/hero.png",
            "cinematic &mdash; inline WebGL2 shader hero + 3D card fan",
            (1400, 900),
        ),
        (
            "cinematic + glassmorphism",
            ROOT / "gold/modifiers/cinematic-glassmorphism/after.html",
            ROOT / "gold/modifiers/cinematic-glassmorphism/hero.png",
            "cinematic + glassmorphism &mdash; two blur tiers over shader",
            (1400, 900),
        ),
        (
            "dashboard + bento",
            ROOT / "gold/modifiers/dashboard-bento/after.html",
            ROOT / "gold/modifiers/dashboard-bento/hero.png",
            "dashboard + bento &mdash; named-cell grid, hero tile 2x2",
            (1400, 1100),
        ),
        (
            "landing + neon",
            ROOT / "gold/modifiers/landing-neon/after.html",
            ROOT / "gold/modifiers/landing-neon/hero.png",
            "landing + neon &mdash; dark ground, one glowing accent, kinetic type",
            (1400, 900),
        ),
    ]

    for name, src, dst, _desc, (w, h) in targets:
        if not src.exists():
            print(f"SKIP {name}: source missing at {src}")
            continue
        ok = shoot(browser, src, dst, w=w, h=h, ms=2500)
        status = "OK " if ok else "FAIL"
        size = dst.stat().st_size if dst.exists() else 0
        print(f"  {status}  {name:32s} -> {dst.relative_to(ROOT)}  ({size:,} bytes)")

    cells = [(name, dst, desc) for name, _src, dst, desc, _wh in targets if dst.exists()]
    if cells:
        composite(cells, ROOT / "gold/gallery.png", cols=4, tile_w=700, tile_h=450)
        gp = ROOT / "gold/gallery.png"
        print(f"gallery: {gp.relative_to(ROOT)} ({gp.stat().st_size:,} bytes)" if gp.exists() else "gallery: FAIL")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
