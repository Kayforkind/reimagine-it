"""Ledger after: the same JSONL as a skyline HTML. Titles from the file, no lorem."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data.jsonl"
OUT = ROOT / "index.html"
OUT_SVG = ROOT / "index.svg"


def rows() -> list[dict[str, str]]:
    found: list[dict[str, str]] = []
    for line in DATA.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        item = json.loads(line)
        found.append({"kind": str(item["kind"]), "title": str(item["title"])})
    return found


def main() -> int:
    items = rows()
    bars = []
    heights = {"pr": 140, "docs": 80, "arch": 110}
    for item in items:
        h = heights.get(item["kind"], 64)
        bars.append(
            f'<div class="b" style="height:{h}px" title="{item["title"]}">{item["title"]}</div>'
        )
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<style>
  body {{ margin:0; background:#0c0e12; color:#e8edf2; font: 16px/1.4 ui-sans-serif, system-ui, sans-serif; }}
  main {{ min-height:100vh; display:flex; align-items:flex-end; gap:12px; padding:20vh 2rem 12vh; }}
  .b {{ width:72px; background:#7ee0c0; color:#04251c; font-size:11px; padding:8px 4px 4px;
       writing-mode:vertical-rl; transform:rotate(180deg); }}
  h1 {{ position:fixed; top:1.2rem; left:2rem; font-size:0.85rem; letter-spacing:0.12em;
        text-transform:uppercase; color:#8b97a4; opacity:0; animation:in 0.6s ease 1.2s forwards; }}
  @keyframes in {{ to {{ opacity:1; }} }}
</style>
</head>
<body>
<main>
{''.join(bars)}
</main>
<h1>AWE: shipped</h1>
</body>
</html>
"""
    OUT.write_text(html, encoding="utf-8")

    bar_w = 72
    gap = 20
    left = 40
    base_y = 260
    canvas_w = left * 2 + len(items) * bar_w + (len(items) - 1) * gap
    svg_parts: list[str] = [
        f'<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_w} 320" '
        f'role="img" aria-label="Three PRs as a skyline">',
        '<title>Ledger skyline</title>',
        '<rect width="100%" height="100%" fill="#0c0e12"/>',
        (
            '<text x="40" y="34" fill="#8b97a4" font-size="11" letter-spacing="2.4" '
            'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">AWE: shipped</text>'
        ),
    ]
    for i, item in enumerate(items):
        h = heights.get(item["kind"], 64)
        x = left + i * (bar_w + gap)
        y = base_y - h
        svg_parts.append(
            f'<rect x="{x}" y="{y}" width="{bar_w}" height="{h}" fill="#7ee0c0"/>'
        )
        title = item["title"]
        max_font = 11
        min_font = 7
        char_w_at_11 = 6.6
        usable = h - 12
        max_chars_at_11 = max(1, int(usable / char_w_at_11))
        if len(title) <= max_chars_at_11:
            font_size = max_font
        else:
            scaled = int(max_font * usable / (len(title) * char_w_at_11))
            font_size = max(min_font, min(max_font, scaled))
        anchor_x = x + bar_w // 2 + font_size // 3
        anchor_y = base_y - 8
        svg_parts.append(
            f'<text x="{anchor_x}" y="{anchor_y}" fill="#04251c" font-size="{font_size}" '
            f'font-family="ui-monospace, Consolas, Menlo, monospace" '
            f'transform="rotate(-90 {anchor_x} {anchor_y})">{title}</text>'
        )
    svg_parts.append('</svg>\n')
    OUT_SVG.write_text("\n".join(svg_parts), encoding="utf-8")

    sys.stdout.write(f"wrote {OUT.name} rows={len(items)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
