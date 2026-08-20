"""Per-pack before/after compare renderer.

Same naive input page (`gold/webpage/before.html` — a plain Texas
notebook) on the left; each pack's `after.html` on the right; a per-pack
caption below. Frame chrome is content-aware: the Lone-Star palette and
star motif in the compare header are what /reimagine-it derived from the
source page, not a fixed theme.

For every pack listed below we write `<pack-dir>/compare.png`. The
README embeds these directly. Rerun any time:

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
        caption="Grid + baseline + palette derived from content (navy / cream / red / gold). KPI tiles from Places + Signals. Star lockup because the source mentions the Lone Star.",
        after_h=900,
        before_h=900,
    ),
    Pack(
        slug="artistic",
        label="/reimagine-it webpage artistic",
        after_html=ROOT / "gold/domains/artistic/after.html",
        compare_png=ROOT / "gold/domains/artistic/compare.png",
        caption="Editorial cream + italic serif. Kinetic ampersand sways \u00b13\u00b0. Drifting SVG arcs. 3D card fan of Alamo / Big Bend / Austin at real \u00b116\u00b0.",
        after_h=900,
    ),
    Pack(
        slug="dashboard",
        label="/reimagine-it webpage dashboard",
        after_html=ROOT / "gold/domains/dashboard/after.html",
        compare_png=ROOT / "gold/domains/dashboard/compare.png",
        caption="Operator grid. KPI tiles read from content: 3 places, 3 signals, 190 years, 800K acres. Status pills. Blinking-caret terminal.",
        after_h=900,
    ),
    Pack(
        slug="photography",
        label="/reimagine-it webpage photography",
        after_html=ROOT / "gold/domains/photography/after.html",
        compare_png=ROOT / "gold/domains/photography/compare.png",
        caption="Didot-scale italic-then-caps nameplate. Numbered plate strip (Austin / Big Bend / Alamo). SVG photographs. Dropcap paragraphs.",
        after_h=900,
    ),
    Pack(
        slug="cinematic",
        label="/reimagine-it webpage cinematic",
        after_html=ROOT / "gold/domains/cinematic/after.html",
        compare_png=ROOT / "gold/domains/cinematic/compare.png",
        caption="Inline WebGL2 shader hero \u2014 Texas-sunset raymarch (navy \u2192 gold \u2192 red) chosen because the source is about Texas. Single file, no CDN.",
        after_h=900,
    ),
    Pack(
        slug="infographic",
        label="/reimagine-it infographic",
        after_html=ROOT / "gold/domains/infographic/after.html",
        compare_png=ROOT / "gold/domains/infographic/compare.png",
        caption="Paper poster, not a dashboard. Priestley 1836\u20131995 timeline on a common year scale. ISOTYPE 8\u00d7100k acres. Custom glyphs. Lossless data table of the six named facts.",
        after_h=1400,
        before_h=1400,
    ),
    Pack(
        slug="cinematic-glassmorphism",
        label="/reimagine-it webpage cinematic glassmorphism",
        after_html=ROOT / "gold/modifiers/cinematic-glassmorphism/after.html",
        compare_png=ROOT / "gold/modifiers/cinematic-glassmorphism/compare.png",
        caption="Same sunset shader still running. Two glass tiers (14 px + 24 px blur) reveal it; the front tier reads \"Piece 03 \u2014 Austin, live music\" through the frost.",
        after_h=900,
    ),
    Pack(
        slug="dashboard-bento",
        label="/reimagine-it webpage dashboard bento",
        after_html=ROOT / "gold/modifiers/dashboard-bento/after.html",
        compare_png=ROOT / "gold/modifiers/dashboard-bento/compare.png",
        caption="Named-cell CSS Grid. Nine tiles \u2014 places / signals / hours / chart / logs \u2014 one idea each. Hero tile 2\u00d72 visibly elevated (translateZ 24 px).",
        after_h=1100,
        before_h=1100,
    ),
    Pack(
        slug="landing-neon",
        label="/reimagine-it webpage landing neon",
        after_html=ROOT / "gold/modifiers/landing-neon/after.html",
        compare_png=ROOT / "gold/modifiers/landing-neon/compare.png",
        caption="Dark void ground. One sun-gold star does every job \u2014 orbit, kinetic \"note\", glow, cursor. Palette picked because the source names the Lone Star.",
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
  <h1>Same content. One command. Content-aware redesign.</h1>
  <span class="meta">palette + motif + motion derived from the source page</span>
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


# ---------------------------------------------------------------------------
# Twins triptych: same source, same command, two runs of /reimagine-it
# ---------------------------------------------------------------------------

TWINS_TEMPLATE = """<!doctype html>
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
    --parchment:#f4ecd8;
    --parchment-line:#c2b48c;
  }}
  html, body {{ margin:0; padding:0; background:var(--void); color:var(--ink);
    font-family: ui-sans-serif, system-ui, "Segoe UI", Inter, sans-serif; }}
  body {{ padding:28px 32px 32px; }}
  .head {{ display:flex; align-items:baseline; gap:16px; margin-bottom:22px; }}
  .head .k {{ font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.24em; color:var(--sun); text-transform:uppercase; }}
  .head h1 {{ margin:0; font-size:22px; font-weight:700; letter-spacing:-.01em; }}
  .head .meta {{ margin-left:auto; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.18em; color:var(--dim); text-transform:uppercase; }}
  .head .star {{ display:inline-block; width:14px; height:14px; fill:var(--star);
    vertical-align:middle; margin-right:8px;
    filter: drop-shadow(0 0 4px rgba(178,34,52,.35)); }}
  .grid {{ display:grid; grid-template-columns: 0.7fr 46px 1fr 46px 1fr; gap:12px; align-items:start; }}
  .col {{ background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; }}
  .col.before {{ background:var(--paper); border-color:var(--paper-line); }}
  .col.draw-b {{ background:var(--parchment); border-color:var(--parchment-line); }}
  .col .lab {{ padding:12px 14px; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:10.5px; letter-spacing:.22em; text-transform:uppercase;
    display:flex; justify-content:space-between; gap:10px; }}
  .col.before .lab {{ color:var(--paper-ink); background:#efe8e0; border-bottom:1px solid var(--paper-line); }}
  .col.draw-a .lab {{ color:var(--sun); background:var(--void); border-bottom:1px solid var(--line); }}
  .col.draw-b .lab {{ color:#b22234; background:#efe4c9; border-bottom:1px solid var(--parchment-line); }}
  .col img {{ display:block; width:100%; height:auto; }}
  .arrow {{ align-self:center; text-align:center; color:var(--sun);
    font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:10.5px; letter-spacing:.22em; }}
  .arrow .a {{ font-size:26px; line-height:1; margin:6px 0; color:var(--star);
    filter: drop-shadow(0 0 6px rgba(232,166,63,.35)); }}
  .arrow .b {{ font-size:10px; color:var(--dim); margin-top:4px; }}
  .caps {{ margin-top:18px; display:grid; grid-template-columns:1fr 1fr; gap:14px; }}
  .cap {{ padding:14px 16px; border:1px solid var(--line);
    border-radius:10px; background:rgba(15,32,56,.55); }}
  .cap.draw-a {{ border-color:rgba(232,166,63,.4); }}
  .cap.draw-b {{ border-color:rgba(178,34,52,.4); background:rgba(178,34,52,.08); }}
  .cap h3 {{ margin:0 0 6px; font-size:13px; font-family: ui-monospace, Consolas, Menlo, monospace;
    letter-spacing:.2em; text-transform:uppercase; }}
  .cap.draw-a h3 {{ color:var(--sun); }}
  .cap.draw-b h3 {{ color:#ff8b95; }}
  .cap p {{ margin:0; font-size:13px; line-height:1.5; color:var(--ink); }}
  .cap b {{ color:var(--sun); font-weight:600; }}
  .cap.draw-b b {{ color:#ff8b95; }}
  .footline {{ margin-top:14px; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:10.5px; letter-spacing:.22em; color:var(--dim); text-transform:uppercase;
    text-align:center; }}
  .footline em {{ color:var(--sun); font-style:normal; }}
</style></head><body>

<div class="head">
  <svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L14.6 9.2 L22 9.5 L16.2 14.1 L18.3 21.4 L12 17.2 L5.7 21.4 L7.8 14.1 L2 9.5 L9.4 9.2 Z"/></svg>
  <span class="k">/reimagine-it webpage &middot; run twice</span>
  <h1>Same source. Same command. Two draws.</h1>
  <span class="meta">variation: palette weighting &middot; hero move &middot; plate style &middot; motion &middot; type accent &middot; 3D signature</span>
</div>

<div class="grid">
  <div class="col before">
    <div class="lab"><span>Source</span><span>plain html</span></div>
    <img src="{before_img}" alt="plain naive html page (source)">
  </div>
  <div class="arrow">
    <div>run 1</div>
    <div class="a">&rarr;</div>
    <div class="b">draw A</div>
  </div>
  <div class="col draw-a">
    <div class="lab"><span>After &middot; Draw A</span><span>navy dashboard</span></div>
    <img src="{after_a_img}" alt="draw A: navy dashboard interpretation">
  </div>
  <div class="arrow">
    <div>run 2</div>
    <div class="a">&rarr;</div>
    <div class="b">draw B</div>
  </div>
  <div class="col draw-b">
    <div class="lab"><span>After &middot; Draw B</span><span>parchment field-guide</span></div>
    <img src="{after_b_img}" alt="draw B: parchment field-guide interpretation">
  </div>
</div>

<div class="caps">
  <div class="cap draw-a">
    <h3>&#9733; Draw A &middot; navy dashboard</h3>
    <p><b>Ground:</b> navy (deep sky). <b>Hero move:</b> KPI skyline chart of the three places. <b>Plates:</b> dashboard tiles. <b>Motion:</b> counter rise + KPI pulse. <b>Type:</b> sans + mono. <b>3D:</b> lifted cards with translateZ + drop shadow. Palette anchor pulled from the Lone-Star night.</p>
  </div>
  <div class="cap draw-b">
    <h3>&#9733; Draw B &middot; parchment field-guide</h3>
    <p><b>Ground:</b> parchment cream. <b>Hero move:</b> hand-drawn Texas map with pin markers + compass rose. <b>Plates:</b> numbered letterpress cards with red drop caps. <b>Motion:</b> bluebonnet drift + compass-needle wobble. <b>Type:</b> italic serif throughout. <b>3D:</b> inset-shadow deboss + card lift. Same palette family, cream-anchored.</p>
  </div>
</div>

<div class="footline">
  same <em>before.html</em> &middot; same command &middot; <em>/reimagine-it</em> sampled a fresh combination the second run &middot; use <em>--seed &lt;n&gt;</em> to lock a draw
</div>

</body></html>
"""


def render_twins(browser: str) -> tuple[bool, int]:
    """Render the webpage twins triptych: before | draw A | draw B."""
    webpage_dir = ROOT / "gold" / "webpage"
    after_a_html = webpage_dir / "after.html"
    after_b_html = webpage_dir / "after-2.html"
    twins_png = webpage_dir / "twins.png"

    if not after_a_html.exists() or not after_b_html.exists():
        print(f"missing after files under {webpage_dir}", file=sys.stderr)
        return False, 0

    after_a_png = webpage_dir / "_twins_after_a.png"
    after_b_png = webpage_dir / "_twins_after_b.png"

    # Match column heights so both drafts land at comparable scale.
    ok_a = shoot(browser, file_url(after_a_html), after_a_png, w=1400, h=1600, ms=2800)
    ok_b = shoot(browser, file_url(after_b_html), after_b_png, w=1400, h=1600, ms=2800)
    if not (ok_a and ok_b):
        return False, 0

    tmp_html = webpage_dir / "_twins.html"
    tmp_html.write_text(
        TWINS_TEMPLATE.format(
            before_img=BEFORE_PNG.name,
            after_a_img=after_a_png.name,
            after_b_img=after_b_png.name,
        ),
        encoding="utf-8",
    )

    # Three columns: 0.7fr + arrow + 1fr + arrow + 1fr. Frame height tuned
    # so the two after shots (rendered at 1400x1600 => aspect 0.875) fit at
    # column width ~700 without trailing black padding.
    frame_w = 2100
    frame_h = 1140
    ok = shoot(browser, file_url(tmp_html), twins_png, w=frame_w, h=frame_h, ms=2000)

    for p in (after_a_png, after_b_png, tmp_html):
        try:
            p.unlink(missing_ok=True)
        except OSError:
            pass

    size = twins_png.stat().st_size if twins_png.exists() else 0
    return ok, size


# ---------------------------------------------------------------------------
# Quartet: source + 3 draws (A dashboard, B field-guide, C cinematic-shader)
# ---------------------------------------------------------------------------

QUARTET_TEMPLATE = """<!doctype html>
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
    --parchment:#f4ecd8;
    --parchment-line:#c2b48c;
    --dusk:#0d1024;
    --horizon:#f68c39;
    --earth-c:#1a0a10;
  }}
  html, body {{ margin:0; padding:0; background:var(--void); color:var(--ink);
    font-family: ui-sans-serif, system-ui, "Segoe UI", Inter, sans-serif; }}
  body {{ padding:26px 30px 30px; }}
  .head {{ display:flex; align-items:baseline; gap:16px; margin-bottom:20px; }}
  .head .k {{ font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.24em; color:var(--sun); text-transform:uppercase; }}
  .head h1 {{ margin:0; font-size:22px; font-weight:700; letter-spacing:-.01em; }}
  .head .meta {{ margin-left:auto; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:11px; letter-spacing:.18em; color:var(--dim); text-transform:uppercase; }}
  .head .star {{ display:inline-block; width:14px; height:14px; fill:var(--star);
    vertical-align:middle; margin-right:8px;
    filter: drop-shadow(0 0 4px rgba(178,34,52,.35)); }}
  .grid {{ display:grid;
    grid-template-columns: 0.55fr 26px 1fr 26px 1fr 26px 1fr;
    gap:10px; align-items:start; }}
  .col {{ background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; }}
  .col.before {{ background:var(--paper); border-color:var(--paper-line); }}
  .col.draw-b {{ background:var(--parchment); border-color:var(--parchment-line); }}
  .col.draw-c {{ background:var(--earth-c); border-color:var(--dusk); }}
  .col .lab {{ padding:11px 13px; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:10.5px; letter-spacing:.22em; text-transform:uppercase;
    display:flex; justify-content:space-between; gap:8px; }}
  .col.before .lab {{ color:var(--paper-ink); background:#efe8e0; border-bottom:1px solid var(--paper-line); }}
  .col.draw-a .lab {{ color:var(--sun); background:var(--void); border-bottom:1px solid var(--line); }}
  .col.draw-b .lab {{ color:#b22234; background:#efe4c9; border-bottom:1px solid var(--parchment-line); }}
  .col.draw-c .lab {{ color:var(--horizon); background:#120810; border-bottom:1px solid var(--dusk); }}
  .col img {{ display:block; width:100%; height:auto; }}
  .arrow {{ align-self:center; text-align:center; color:var(--sun);
    font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:9.5px; letter-spacing:.22em; }}
  .arrow .a {{ font-size:22px; line-height:1; margin:4px 0; color:var(--star);
    filter: drop-shadow(0 0 6px rgba(232,166,63,.35)); }}
  .arrow .b {{ font-size:9.5px; color:var(--dim); margin-top:3px; }}
  .caps {{ margin-top:16px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }}
  .cap {{ padding:12px 14px; border:1px solid var(--line);
    border-radius:10px; background:rgba(15,32,56,.55); }}
  .cap.draw-a {{ border-color:rgba(232,166,63,.4); }}
  .cap.draw-b {{ border-color:rgba(178,34,52,.4); background:rgba(178,34,52,.08); }}
  .cap.draw-c {{ border-color:rgba(246,140,57,.5); background:rgba(246,140,57,.08); }}
  .cap h3 {{ margin:0 0 6px; font-size:12px; font-family: ui-monospace, Consolas, Menlo, monospace;
    letter-spacing:.2em; text-transform:uppercase; }}
  .cap.draw-a h3 {{ color:var(--sun); }}
  .cap.draw-b h3 {{ color:#ff8b95; }}
  .cap.draw-c h3 {{ color:var(--horizon); }}
  .cap p {{ margin:0; font-size:12.5px; line-height:1.5; color:var(--ink); }}
  .cap b {{ color:var(--sun); font-weight:600; }}
  .cap.draw-b b {{ color:#ff8b95; }}
  .cap.draw-c b {{ color:var(--horizon); }}
  .footline {{ margin-top:14px; font-family: ui-monospace, Consolas, Menlo, monospace;
    font-size:10.5px; letter-spacing:.22em; color:var(--dim); text-transform:uppercase;
    text-align:center; }}
  .footline em {{ color:var(--sun); font-style:normal; }}
</style></head><body>

<div class="head">
  <svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L14.6 9.2 L22 9.5 L16.2 14.1 L18.3 21.4 L12 17.2 L5.7 21.4 L7.8 14.1 L2 9.5 L9.4 9.2 Z"/></svg>
  <span class="k">/reimagine-it webpage &middot; run three times</span>
  <h1>Same source. Same command. Three draws.</h1>
  <span class="meta">variation: reader register &middot; palette weighting &middot; hero move &middot; motion &middot; 3D signature</span>
</div>

<div class="grid">
  <div class="col before">
    <div class="lab"><span>Source</span><span>plain html</span></div>
    <img src="{before_img}" alt="plain naive html page (source)">
  </div>
  <div class="arrow">
    <div>run 1</div>
    <div class="a">&rarr;</div>
    <div class="b">draw A</div>
  </div>
  <div class="col draw-a">
    <div class="lab"><span>A</span><span>dashboard-live</span></div>
    <img src="{after_a_img}" alt="draw A: navy dashboard-live interpretation">
  </div>
  <div class="arrow">
    <div>run 2</div>
    <div class="a">&rarr;</div>
    <div class="b">draw B</div>
  </div>
  <div class="col draw-b">
    <div class="lab"><span>B</span><span>field-guide-quiet</span></div>
    <img src="{after_b_img}" alt="draw B: parchment field-guide-quiet interpretation">
  </div>
  <div class="arrow">
    <div>run 3</div>
    <div class="a">&rarr;</div>
    <div class="b">draw C</div>
  </div>
  <div class="col draw-c">
    <div class="lab"><span>C</span><span>cinematic-shader</span></div>
    <img src="{after_c_img}" alt="draw C: cinematic-shader with WebGL2 sunset">
  </div>
</div>

<div class="caps">
  <div class="cap draw-a">
    <h3>&#9733; A &middot; dashboard-live</h3>
    <p><b>Register:</b> live dashboard. <b>Hero:</b> KPI skyline chart of the three places. <b>Plates:</b> tile grid. <b>Motion:</b> counter rise + pulse. <b>Type:</b> sans + mono.</p>
  </div>
  <div class="cap draw-b">
    <h3>&#9733; B &middot; field-guide-quiet</h3>
    <p><b>Register:</b> parchment field-guide. <b>Hero:</b> hand-drawn Texas map with pin markers + compass rose. <b>Plates:</b> numbered letterpress cards, red drop caps. <b>Motion:</b> bluebonnet drift.</p>
  </div>
  <div class="cap draw-c">
    <h3>&#9733; C &middot; cinematic-shader</h3>
    <p><b>Register:</b> cinematic. <b>Hero:</b> full-bleed WebGL2 west-Texas sunset (dusk &rarr; horizon &rarr; ember), star field, ridge silhouette. <b>Plates:</b> bento tiles over the deep ground. <b>Motion:</b> scroll-driven plate rise, kinetic wordmark bloom, click-to-spin Lone Star. <b>Type:</b> serif display + mono trim. <b>Craft floor:</b> reduced-motion decompose, :focus-visible ring, compositor-only motion.</p>
  </div>
</div>

<div class="footline">
  same <em>before.html</em> &middot; same command &middot; <em>/reimagine-it</em> sampled a new <em>reader register</em> each run &middot; use <em>--seed &lt;n&gt;</em> or <em>--variant &lt;register&gt;</em> to lock a draw
</div>

</body></html>
"""


def render_quartet(browser: str) -> tuple[bool, int]:
    """Render the webpage quartet: before | draw A | draw B | draw C."""
    webpage_dir = ROOT / "gold" / "webpage"
    after_a_html = webpage_dir / "after.html"
    after_b_html = webpage_dir / "after-2.html"
    after_c_html = webpage_dir / "after-3.html"
    quartet_png = webpage_dir / "quartet.png"

    for p in (after_a_html, after_b_html, after_c_html):
        if not p.exists():
            print(f"missing: {p}", file=sys.stderr)
            return False, 0

    after_a_png = webpage_dir / "_quartet_a.png"
    after_b_png = webpage_dir / "_quartet_b.png"
    after_c_png = webpage_dir / "_quartet_c.png"

    ok_a = shoot(browser, file_url(after_a_html), after_a_png, w=1400, h=1600, ms=2800)
    ok_b = shoot(browser, file_url(after_b_html), after_b_png, w=1400, h=1600, ms=2800)
    # Draw C needs a longer virtual-time-budget for the WebGL shader to compile + render.
    ok_c = shoot(browser, file_url(after_c_html), after_c_png, w=1400, h=1600, ms=4000)
    if not (ok_a and ok_b and ok_c):
        return False, 0

    tmp_html = webpage_dir / "_quartet.html"
    tmp_html.write_text(
        QUARTET_TEMPLATE.format(
            before_img=BEFORE_PNG.name,
            after_a_img=after_a_png.name,
            after_b_img=after_b_png.name,
            after_c_img=after_c_png.name,
        ),
        encoding="utf-8",
    )

    # Four content columns (0.55fr + 3x 1fr) + 3 arrow rails (26px each) + gaps + padding.
    # Aim for ~700px per after column at 1400x1600 aspect (0.875), so frame_h ~ 1180.
    frame_w = 2400
    frame_h = 1180
    ok = shoot(browser, file_url(tmp_html), quartet_png, w=frame_w, h=frame_h, ms=2000)

    for p in (after_a_png, after_b_png, after_c_png, tmp_html):
        try:
            p.unlink(missing_ok=True)
        except OSError:
            pass

    size = quartet_png.stat().st_size if quartet_png.exists() else 0
    return ok, size


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Render gold before/after compare PNGs.")
    parser.add_argument(
        "--pack",
        metavar="SLUG",
        help="Render only this pack (e.g. infographic). Skips twins/quartet.",
    )
    args = parser.parse_args()

    if not BEFORE_HTML.exists():
        print(f"missing before: {BEFORE_HTML}", file=sys.stderr)
        return 2

    packs = PACKS
    if args.pack:
        packs = [p for p in PACKS if p.slug == args.pack]
        if not packs:
            known = ", ".join(p.slug for p in PACKS)
            print(f"unknown pack {args.pack!r}. known: {known}", file=sys.stderr)
            return 2

    browser = find_browser()
    print(f"browser: {browser}")

    # shoot the shared before once (reuse when targeting a single pack)
    if args.pack and BEFORE_PNG.exists():
        ok = True
        size = BEFORE_PNG.stat().st_size
        print(f"  KEEP  shared before -> {BEFORE_PNG.relative_to(ROOT)}  ({size:,} bytes)")
    else:
        ok = shoot(browser, file_url(BEFORE_HTML), BEFORE_PNG, w=1400, h=900, ms=1500)
        status = "OK  " if ok else "FAIL"
        size = BEFORE_PNG.stat().st_size if BEFORE_PNG.exists() else 0
        print(f"  {status}  shared before -> {BEFORE_PNG.relative_to(ROOT)}  ({size:,} bytes)")

    if not ok:
        return 1

    failed: list[str] = []
    for pack in packs:
        if not pack.after_html.exists():
            print(f"  SKIP  {pack.slug:26s} (missing {pack.after_html.relative_to(ROOT)})")
            failed.append(pack.slug)
            continue
        ok, size = render_pack(browser, pack)
        status = "OK  " if ok else "FAIL"
        print(f"  {status}  {pack.slug:26s} -> {pack.compare_png.relative_to(ROOT)}  ({size:,} bytes)")
        if not ok:
            failed.append(pack.slug)

    if args.pack:
        if failed:
            print(f"\n{len(failed)} pack(s) failed: {', '.join(failed)}", file=sys.stderr)
            return 1
        print(f"\nRendered pack {args.pack!r}.")
        return 0

    # Twins triptych: same source, same command, two runs of /reimagine-it webpage.
    ok, size = render_twins(browser)
    status = "OK  " if ok else "FAIL"
    print(f"  {status}  {'twins (before | draw A | draw B)':32s} -> gold/webpage/twins.png  ({size:,} bytes)")
    if not ok:
        failed.append("twins")

    # Quartet: three draws (adds cinematic-shader draw C). This is the v2.2 headline.
    ok, size = render_quartet(browser)
    status = "OK  " if ok else "FAIL"
    print(f"  {status}  {'quartet (source | A | B | C)':32s} -> gold/webpage/quartet.png  ({size:,} bytes)")
    if not ok:
        failed.append("quartet")

    if failed:
        print(f"\n{len(failed)} pack(s) failed: {', '.join(failed)}", file=sys.stderr)
        return 1
    print(f"\nAll {len(PACKS)} compares + twins triptych + quartet rendered.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
