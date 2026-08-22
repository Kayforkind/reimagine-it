"""Screenshot every /reimagine-it webpage variant and composite a single strip.png.

Windows-first (uses headless msedge or Chrome). Run:

    python gold/domains/run.py

Writes per-variant after.png files and a strip.png that shows all four
variants side by side so a client can see the one-command range.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent

VARIANTS: list[dict[str, object]] = [
    {
        "token": "webpage",
        "label": "/reimagine-it webpage",
        "sub": "sober designed page (default)",
        "html": REPO / "gold" / "webpage" / "after.html",
        "png": REPO / "gold" / "webpage" / "after.png",
        "shot_w": 1400,
        "shot_h": 1520,
    },
    {
        "token": "artistic",
        "label": "/reimagine-it artistic",
        "sub": "cream + serif + drifting arcs + 3D tilt",
        "html": ROOT / "artistic" / "after.html",
        "png": ROOT / "artistic" / "after.png",
        "shot_w": 1400,
        "shot_h": 1700,
    },
    {
        "token": "dashboard",
        "label": "/reimagine-it dashboard",
        "sub": "KPI tiles + live chart + status table",
        "html": ROOT / "dashboard" / "after.html",
        "png": ROOT / "dashboard" / "after.png",
        "shot_w": 1440,
        "shot_h": 1000,
    },
    {
        "token": "photography",
        "label": "/reimagine-it photography",
        "sub": "editorial folio + SVG plates + dropcaps",
        "html": ROOT / "photography" / "after.html",
        "png": ROOT / "photography" / "after.png",
        "shot_w": 1400,
        "shot_h": 1600,
    },
    {
        "token": "infographic",
        "label": "/reimagine-it infographic",
        "sub": "paper poster + Priestley timeline + ISOTYPE acres",
        "html": ROOT / "infographic" / "after.html",
        "png": ROOT / "infographic" / "tile.png",
        "shot_w": 1400,
        "shot_h": 1400,
    },
]

STRIP_HTML = ROOT / "strip.html"
STRIP_PNG = ROOT / "strip.png"


def find_browser() -> str:
    env = os.environ.get("REIMAGINE_BROWSER")
    if env and Path(env).is_file():
        return env
    candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for c in candidates:
        if Path(c).is_file():
            return c
    which = shutil.which("msedge") or shutil.which("chrome")
    if which:
        return which
    raise SystemExit(
        "No Edge or Chrome found. Set REIMAGINE_BROWSER=<full path to msedge.exe or chrome.exe>."
    )


def shot(browser: str, url: str, out: Path, w: int, h: int) -> None:
    out.unlink(missing_ok=True)
    args = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={w},{h}",
        f"--screenshot={out}",
        url,
    ]
    proc = subprocess.run(args, capture_output=True, text=True, timeout=90)
    if not out.is_file():
        raise SystemExit(
            f"screenshot failed for {url}\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
        )


def file_url(p: Path) -> str:
    return "file:///" + str(p).replace("\\", "/")


def rel(p: Path) -> str:
    return os.path.relpath(p, ROOT).replace("\\", "/")


def write_strip_html() -> None:
    cells: list[str] = []
    for v in VARIANTS:
        cells.append(
            f"""
            <article class="cell cell-{v['token']}">
              <header class="lab">
                <span class="tok">{v['label']}</span>
                <span class="sub">{v['sub']}</span>
              </header>
              <div class="shot"><img src="{rel(v['png'])}" alt="{v['label']}"></div>
            </article>
            """
        )
    STRIP_HTML.write_text(
        f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body {{ margin: 0; padding: 0; background: #06080b; color: #dbe4f0;
    font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif; }}
  body {{ padding: 32px 40px 40px; }}
  .head {{ display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px; }}
  .head .kicker {{ font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 11px; letter-spacing: 0.28em; color: #7ee0c0; }}
  .head h1 {{ font-size: 22px; font-weight: 700; letter-spacing: -0.01em; margin: 0; }}
  .head .meta {{ margin-left: auto; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 11px; letter-spacing: 0.16em; color: #6a7688; text-transform: uppercase; }}
  .grid {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }}
  .cell {{ background: #10151d; border: 1px solid #232d3d; border-radius: 12px;
    overflow: hidden; display: flex; flex-direction: column; }}
  .cell .lab {{ padding: 12px 18px; border-bottom: 1px solid #232d3d;
    display: flex; justify-content: space-between; align-items: baseline; }}
  .cell .lab .tok {{ font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #7ee0c0; font-weight: 700; }}
  .cell .lab .sub {{ font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size: 10px; letter-spacing: 0.14em; color: #8f9db1; text-transform: uppercase; text-align: right; max-width: 60%; }}
  .cell .shot {{ background: #06080b; height: 480px; overflow: hidden; display: flex; align-items: flex-start; justify-content: center; }}
  .cell .shot img {{ display: block; width: 100%; height: auto; }}
  .foot {{ margin-top: 20px; display: flex; justify-content: space-between;
    font-family: ui-monospace, Consolas, Menlo, monospace; font-size: 11px;
    color: #6a7688; letter-spacing: 0.16em; text-transform: uppercase; }}
  .foot b {{ color: #7ee0c0; font-weight: 700; }}
</style></head><body>

<div class="head">
  <span class="kicker">/reimagine-it &lt;form&gt; &lt;domain&gt;</span>
  <h1>One command, one notebook, five completely different designs.</h1>
  <span class="meta">gold/domains &middot; python gold/domains/run.py</span>
</div>

<div class="grid">
{''.join(cells)}
</div>

<div class="foot">
  <span>same words. same three projects. same one email.</span>
  <span>designed by <b>/reimagine-it</b></span>
</div>

</body></html>
""",
        encoding="utf-8",
    )


def main() -> int:
    for v in VARIANTS:
        if not Path(v["html"]).is_file():
            raise SystemExit(f"missing: {v['html']}")
    browser = find_browser()
    for v in VARIANTS:
        shot(browser, file_url(Path(v["html"])), Path(v["png"]), int(v["shot_w"]), int(v["shot_h"]))
        print(f"shot {rel(Path(v['png']))}={Path(v['png']).stat().st_size}")
    write_strip_html()
    shot(browser, file_url(STRIP_HTML), STRIP_PNG, 2100, 1280)
    print(f"shot {rel(STRIP_PNG)}={STRIP_PNG.stat().st_size}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
