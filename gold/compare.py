"""Per-pack before/after compare renderer.

Same naive input page (`gold/webpage/before.html`) on the left; each pack's
`after.html` on the right; a per-pack caption below. Texas / Lone-Star frame.

For every pack listed below we write `<pack-dir>/compare.png`. The README embeds
these directly. Rerun any time:

    python gold/compare.py
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BEFORE_HTML = ROOT / "gold" / "webpage" / "before.html"
BEFORE_PNG = ROOT / "gold" / "webpage" / "before.png"


@dataclass(frozen=True)
class Pack:
    slug: str
    label: str
    after_html: Path
    compare_png: Path
    caption: str
    after_w: int = 1400
    after_h: int = 900
    before_h: int = 900  # match after height so both columns look comparable


PACKS: list[Pack] = [
    Pack(
        slug="webpage",
        label="/reimagine-it webpage",
        after_html=ROOT / "gold/webpage/after.html",
        compare_png=ROOT / "gold/webpage/compare.png",
        caption="Grid + baseline + palette cap + one motif. Same three projects. Same email. Real design.",
        after_h=900,
        before_h=900,
    ),
    Pack(
        slug="artistic",
        label="/reimagine-it webpage artistic",
        after_html=ROOT / "gold/domains/artistic/after.html",
        compare_png=ROOT / "gold/domains/artistic/compare.png",
        caption="Editorial cream + italic serif. Kinetic ampersand sways \u00b13\u00b0. Drifting SVG arcs. 3D card fan at real \u00b116\u00b0.",
        after_h=900,
    ),
    Pack(
        slug="dashboard",
        label="/reimagine-it webpage dashboard",
        after_html=ROOT / "gold/domains/dashboard/after.html",
        compare_png=ROOT / "gold/domains/dashboard/compare.png",
        caption="Operator grid. KPI tiles. Live SVG chart with rising bars. Status pills. Blinking-caret terminal.",
        after_h=900,
    ),
    Pack(
        slug="photography",
        label="/reimagine-it webpage photography",
        after_html=ROOT / "gold/domains/photography/after.html",
        compare_png=ROOT / "gold/domains/photography/compare.png",
        caption="Didot-scale italic-then-caps nameplate. Numbered plate strip. SVG photographs. Dropcap paragraphs.",
        after_h=900,
    ),
    Pack(
        slug="cinematic",
        label="/reimagine-it webpage cinematic",
        after_html=ROOT / "gold/domains/cinematic/after.html",
        compare_png=ROOT / "gold/domains/cinematic/compare.png",
        caption="Inline WebGL2 shader hero. Texas-sunset raymarch (navy \u2192 gold \u2192 red). Single file, no CDN.",
        after_h=900,
    ),
    Pack(
        slug="cinematic-glassmorphism",
        label="/reimagine-it webpage cinematic glassmorphism",
        after_html=ROOT / "gold/modifiers/cinematic-glassmorphism/after.html",
        compare_png=ROOT / "gold/modifiers/cinematic-glassmorphism/compare.png",
        caption="Cinematic shader keeps running. Two glass tiers (14 px + 24 px blur) reveal the substrate; never cover a solid color.",
        after_h=900,
    ),
    Pack(
        slug="dashboard-bento",
        label="/reimagine-it webpage dashboard bento",
        after_html=ROOT / "gold/modifiers/dashboard-bento/after.html",
        compare_png=ROOT / "gold/modifiers/dashboard-bento/compare.png",
        caption="Named-cell CSS Grid. Nine tiles, shared chrome. Hero tile 2\u00d72 visibly elevated (translateZ 24 px + 40 px shadow).",
        after_h=1100,
        before_h=1100,
    ),
    Pack(
        slug="landing-neon",
        label="/reimagine-it webpage landing neon",
        after_html=ROOT / "gold/modifiers/landing-neon/after.html",
        compare_png=ROOT / "gold/modifiers/landing-neon/compare.png",
        caption="Dark void ground. One high-chroma sun-gold accent (#e8a63f) does every emotional job \u2014 glow, pulse, kinetic type.",
        after_h=900,
    ),
]


def find_browser() -> str:
    env = os.environ.get("REIMAGINE_BROWSER")
    if env and Path(env).is_file():
        return env
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for c in candidates:
        if Path(c).is_file():
            return c
    which = shutil.which("chrome") or shutil.which("msedge")
    if which:
        return which
    raise SystemExit(
        "No Chrome or Edge found. Set REIMAGINE_BROWSER=<full path>."
    )


def file_url(p: Path) -> str:
    return "file:///" + str(p.resolve()).replace("\\", "/")


def shoot(browser: str, url: str, out: Path, w: int, h: int, ms: int = 2500) -> bool:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.unlink(missing_ok=True)
    args = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={w},{h}",
        f"--virtual-time-budget={ms}",
        f"--screenshot={out}",
        url,
    ]
    try:
        subprocess.run(
            args,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=90,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return False
    return out.is_file() and out.stat().st_size > 1024


COMPARE_TEMPLATE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  :root {{
    --void:#0a1626;
    --panel:#0f2038;
    --line:#233555;
    --ink:#f4ecd8;
    --dim:#8a9bb4;
    --star:#b22234;
    --sun:#e8a63f;
    --paper:#f5f0ec;
    --paper-line:#d9cfc7;
    --paper-ink:#6a3a3a;
  }}
  html, body {{ margin:0; padding:0; background:var(--void); color:var(--ink);
    font-family: ui-sans-serif, system-ui, "Segoe UI", Inter, sans-serif; }}
  body {{ padding: 28px 36px 32px; }}
  .head {{ display:flex; align-items:baseline; gap:16px; margin-bottom:22px; }}
  .head .k {{ font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.24em; color:var(--sun); text-transform:uppercase; }}
  .head h1 {{ margin:0; font-size:22px; font-weight:700; letter-spacing:-.01em; }}
  .head .meta {{ margin-left:auto; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.18em; color:var(--dim); text-transform:uppercase; }}
  .head .star {{ display:inline-block; width:14px; height:14px; fill:var(--star);
    vertical-align:middle; margin-right:8px;
    filter: drop-shadow(0 0 4px rgba(178,34,52,.35)); }}
  .grid {{ display:grid; grid-template-columns: 1fr 68px 1fr; gap:16px; align-items:start; }}
  .col {{ background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; }}
  .col.before {{ background:var(--paper); border-color:var(--paper-line); }}
  .col .lab {{ padding:12px 16px; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.22em; text-transform:uppercase;
    display:flex; justify-content:space-between; }}
  .col.before .lab {{ color:var(--paper-ink); background:#efe8e0; border-bottom:1px solid var(--paper-line); }}
  .col.after  .lab {{ color:var(--sun); background:var(--void); border-bottom:1px solid var(--line); }}
  .col img {{ display:block; width:100%; height:auto; }}
  .arrow {{ align-self:center; text-align:center; color:var(--sun);
    font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.22em; }}
  .arrow .a {{ font-size:32px; line-height:1; margin:6px 0; color:var(--star);
    filter: drop-shadow(0 0 6px rgba(232,166,63,.35)); }}
  .cap {{ margin-top:20px; padding:14px 16px; border:1px solid var(--line);
    border-radius:10px; background:rgba(15,32,56,.55);
    display:flex; gap:16px; align-items:baseline; justify-content:space-between; }}
  .cap p {{ margin:0; font-size:13px; line-height:1.5; color:var(--ink); }}
  .cap em {{ font-style:italic; color:var(--sun); }}
  .cap .tag {{ font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:10px; letter-spacing:.2em; color:var(--dim); text-transform:uppercase;
    white-space:nowrap; }}
</style></head><body>

<div class="head">
  <svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L14.6 9.2 L22 9.5 L16.2 14.1 L18.3 21.4 L12 17.2 L5.7 21.4 L7.8 14.1 L2 9.5 L9.4 9.2 Z"/></svg>
  <span class="k">{label}</span>
  <h1>Same content. One command. USA / Texas redesign.</h1>
  <span class="meta">Lone-Star palette &middot; star motif &middot; sunset shader</span>
</div>

<div class="grid">
  <div class="col before">
    <div class="lab"><span>Before</span><span>plain html</span></div>
    <img src="{before_img}" alt="plain naive html page (before)">
  </div>
  <div class="arrow">
    <div>before</div>
    <div class="a">&rarr;</div>
    <div>after</div>
  </div>
  <div class="col after">
    <div class="lab"><span>After</span><span>{label}</span></div>
    <img src="{after_img}" alt="redesigned page (after)">
  </div>
</div>

<div class="cap">
  <p>{caption}</p>
  <span class="tag">python gold/compare.py</span>
</div>

</body></html>
"""


def render_pack(browser: str, pack: Pack) -> tuple[bool, int]:
    """Render one pack's compare.png. Returns (ok, bytes_written)."""
    after_png = pack.after_html.with_suffix(".compare.after.png")
    ok_after = shoot(
        browser,
        file_url(pack.after_html),
        after_png,
        w=pack.after_w,
        h=pack.after_h,
        ms=2500,
    )
    if not ok_after:
        return False, 0

    tmp_html = pack.after_html.parent / "_compare.html"
    tmp_html.write_text(
        COMPARE_TEMPLATE.format(
            label=pack.label,
            before_img=_relative(pack.after_html.parent, BEFORE_PNG),
            after_img=after_png.name,
            caption=pack.caption,
        ),
        encoding="utf-8",
    )

    # Compare frame dims: two columns + arrow + padding + caption row.
    frame_w = 1680
    # scale each column to a target width; height is what the browser fits
    # For simplicity keep the frame tall enough that both images fit at full height,
    # then let hide-scrollbars trim outside content. Rendered at 1x device pixel.
    col_h = pack.after_h + 160  # image height + labels + caption row
    frame_h = max(col_h, 900) + 40
    ok = shoot(browser, file_url(tmp_html), pack.compare_png, w=frame_w, h=frame_h, ms=1500)

    # cleanup intermediates so they don't clutter the tree
    try:
        after_png.unlink(missing_ok=True)
        tmp_html.unlink(missing_ok=True)
    except OSError:
        pass

    size = pack.compare_png.stat().st_size if pack.compare_png.exists() else 0
    return ok, size


def _relative(from_dir: Path, target: Path) -> str:
    try:
        rel = os.path.relpath(target, from_dir).replace("\\", "/")
    except ValueError:
        rel = target.as_uri()
    return rel


def main() -> int:
    if not BEFORE_HTML.exists():
        print(f"missing before: {BEFORE_HTML}", file=sys.stderr)
        return 2

    browser = find_browser()
    print(f"browser: {browser}")

    # shoot the shared before once
    ok = shoot(browser, file_url(BEFORE_HTML), BEFORE_PNG, w=1400, h=900, ms=1500)
    status = "OK  " if ok else "FAIL"
    size = BEFORE_PNG.stat().st_size if BEFORE_PNG.exists() else 0
    print(f"  {status}  shared before -> {BEFORE_PNG.relative_to(ROOT)}  ({size:,} bytes)")

    if not ok:
        return 1

    failed: list[str] = []
    for pack in PACKS:
        if not pack.after_html.exists():
            print(f"  SKIP  {pack.slug:26s} (missing {pack.after_html.relative_to(ROOT)})")
            failed.append(pack.slug)
            continue
        ok, size = render_pack(browser, pack)
        status = "OK  " if ok else "FAIL"
        print(f"  {status}  {pack.slug:26s} -> {pack.compare_png.relative_to(ROOT)}  ({size:,} bytes)")
        if not ok:
            failed.append(pack.slug)

    if failed:
        print(f"\n{len(failed)} pack(s) failed: {', '.join(failed)}", file=sys.stderr)
        return 1
    print(f"\nAll {len(PACKS)} compares rendered.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
