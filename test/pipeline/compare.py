"""Composite gold/domains/artistic (hand-authored) vs test/pipeline (fresh subagent).

Both are `/reimagine-it webpage artistic` runs on different briefs.
If they share design DNA (cream + italic serif + drifting SVG + 3D cards + aubergine),
the pack works.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent

GOLD = REPO / "gold" / "domains" / "artistic" / "after.html"
FRESH = ROOT / "after.html"

GOLD_PNG = ROOT / "gold-shot.png"
FRESH_PNG = ROOT / "fresh-shot.png"
COMPARE_HTML = ROOT / "compare.html"
COMPARE_PNG = ROOT / "compare.png"


def find_edge() -> str:
    for c in (
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    ):
        if Path(c).exists():
            return c
    raise SystemExit("no headless browser found")


def shoot(browser: str, src: Path, dst: Path, w: int = 1400, h: int = 1700) -> None:
    src_url = "file:///" + str(src).replace("\\", "/")
    subprocess.run(
        [
            browser,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--window-size={w},{h}",
            f"--screenshot={dst}",
            src_url,
        ],
        check=True,
        capture_output=True,
    )


def main() -> None:
    browser = find_edge()
    print(f"browser: {browser}")

    shoot(browser, GOLD, GOLD_PNG)
    shoot(browser, FRESH, FRESH_PNG)
    print(f"gold-shot:  {GOLD_PNG.stat().st_size:,} bytes")
    print(f"fresh-shot: {FRESH_PNG.stat().st_size:,} bytes")

    html = """<!doctype html>
<html><head><meta charset="utf-8"><title>artistic pipeline test</title>
<style>
  html,body{margin:0;padding:0;background:#0c0e12;color:#e8e6e0;
    font-family:ui-monospace,Consolas,monospace;font-size:13px}
  .wrap{padding:24px}
  h1{margin:0 0 4px;font-family:Georgia,serif;font-style:italic;
    font-size:26px;color:#f0ede7;font-weight:400}
  .sub{color:#8b8579;margin-bottom:20px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .col{background:#fdf5e9;border:1px solid #262b34;border-radius:6px;overflow:hidden}
  .lab{background:#2d1a3f;color:#f0ede7;padding:10px 14px;letter-spacing:.12em;
    text-transform:uppercase;font-size:11px;border-bottom:1px solid #1a0f26}
  .lab b{color:#ff8b6e;font-weight:400;margin-right:8px}
  img{display:block;width:100%;height:auto}
  .note{margin-top:16px;color:#8b8579;line-height:1.5;max-width:1100px}
  .note b{color:#e8e6e0;font-weight:400}
</style></head><body><div class="wrap">
<h1>/reimagine-it webpage artistic - two independent runs</h1>
<div class="sub">Same command. Different briefs. Same design DNA.</div>
<div class="grid">
  <div class="col"><div class="lab"><b>GOLD</b>hand-authored - Jordan Rivers</div>
    <img src="gold-shot.png" alt="gold artistic"></div>
  <div class="col"><div class="lab"><b>FRESH</b>subagent - Marlow Bindery</div>
    <img src="fresh-shot.png" alt="fresh artistic"></div>
</div>
<div class="note">
  Shared DNA: cream paper background, italic serif display type in the masthead,
  block-caps counterpart, ambient drifting SVG background, three cards fanned in 3D perspective,
  aubergine ink on cream, ochre and coral pills. Different specific moves - gold uses
  wobbling column marks; fresh uses a numbered section index rail + real inline-SVG
  service plates for tapes/marbled endpaper/clamshell. The pack ships an aesthetic,
  not a template.
</div></div></body></html>
"""
    COMPARE_HTML.write_text(html, encoding="utf-8")
    shoot(browser, COMPARE_HTML, COMPARE_PNG, w=1440, h=2200)
    print(f"compare.png: {COMPARE_PNG.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
