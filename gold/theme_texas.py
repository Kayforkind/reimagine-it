"""Reskin every gold .html to a Texas / Lone Star palette + brand.

- Palette: Lone-Star night navy background, parchment cream text, star red accent,
  sun gold secondary, dim dust-blue for meta. No teal/cyan.
- Brand: Alamo Ledger Co. — San Antonio, TX. Site alamoledger.us.
- Motif: one small SVG 5-point lone star inserted in each masthead as a lockup.

Idempotent. Run again = same result. Safe to re-run any time.

Usage:
  python gold/theme_texas.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TARGETS = [
    ROOT / "gold/webpage/after.html",
    ROOT / "gold/domains/artistic/after.html",
    ROOT / "gold/domains/dashboard/after.html",
    ROOT / "gold/domains/photography/after.html",
    ROOT / "gold/domains/cinematic/after.html",
    ROOT / "gold/modifiers/cinematic-glassmorphism/after.html",
    ROOT / "gold/modifiers/dashboard-bento/after.html",
    ROOT / "gold/modifiers/landing-neon/after.html",
]

# --- Palette map (old hex -> new hex). Kept case-insensitive at apply time. ---
PALETTE = {
    # cool/teal/cyan accents -> warm sun gold or star red
    "#7cf3ff": "#e8a63f",  # cinematic beam cyan -> sun gold
    "#ff7a5c": "#b22234",  # cinematic ember coral -> star red
    "#7ee0c0": "#e8a63f",  # dashboard teal -> sun gold
    "#f0b060": "#e8a63f",  # dashboard warm -> unified sun gold
    "#e07c6a": "#b22234",  # dashboard hot -> star red
    "#a48dff": "#6b8f4e",  # dashboard violet -> prairie sage
    # backgrounds: navy shift
    "#05070c": "#0a1626",  # cinematic void -> lone-star night navy
    "#06080b": "#0a1626",  # dashboard bg -> lone-star night navy
    "#0a0f1a": "#0f2038",  # cinematic panel bg -> deep navy panel
    "#0a0f19": "#0f2038",  # cinematic stage bg -> deep navy panel
    "#0f1420": "#0f2038",  # cinematic panel -> deep navy panel
    "#131a2a": "#122540",  # cinematic panel-2 -> deep navy panel-2
    "#10151d": "#0f2038",  # dashboard panel -> deep navy panel
    "#182131": "#122540",  # dashboard panel-2 -> deep navy panel-2
    "#12181f": "#122540",  # bento hero grad top -> deep navy panel-2
    "#0b0f14": "#0a1626",  # bento hero grad bottom -> lone-star night navy
    "#0a0e13": "#0a1626",  # bento plate bg -> night navy
    "#171b23": "#122540",  # bento incidents grad top -> deep navy panel-2
    "#10141b": "#0a1626",  # bento incidents grad bottom -> night navy
    # rules / grid strokes
    "#1e2436": "#233555",
    "#1e2937": "#233555",
    "#232d3d": "#233555",
    "#3a4a63": "#4a638a",
    # ink / dim
    "#ecf1ff": "#f4ecd8",  # cinematic ink -> parchment cream
    "#dbe4f0": "#f4ecd8",  # dashboard ink -> parchment cream
    "#e8edf4": "#f4ecd8",  # webpage default ink -> parchment cream
    "#7c8aa8": "#8a9bb4",  # cinematic dim -> dust blue
    "#6a7688": "#8a9bb4",  # dashboard dim -> dust blue
    "#8f9db1": "#8a9bb4",  # dashboard muted -> dust blue
    "#8b97a4": "#8a9bb4",  # webpage default dim -> dust blue
    # rgba shadows referencing beam -> gold
    "rgba(124,243,255,": "rgba(232,166,63,",
    "rgba(126, 224, 192, ": "rgba(232,166,63,",
    "rgba(126,224,192,": "rgba(232,166,63,",
    "rgba(30, 41, 55, 0.35)": "rgba(35,53,85,0.4)",
    "rgba(30, 41, 55, 0.35) 1px": "rgba(35,53,85,0.4) 1px",
    "rgba(30, 41, 55, 0.35)": "rgba(35,53,85,0.4)",
    "rgba(255, 111, 92, ": "rgba(178,34,52,",
    "rgba(255,111,92,": "rgba(178,34,52,",
    "rgba(255,122,92,": "rgba(178,34,52,",
    # artistic pack purple/coral -> Texan warm
    "#7a3fb2": "#7a1c22",  # violet -> deep barn red
    "#ff6f5c": "#b22234",  # coral -> star red
    "#e8a94a": "#e8a63f",  # ochre -> sun gold (unify)
    "#f2b8b0": "#e8bfa0",  # blush -> warm sand
    "#2d1a3d": "#1a2138",  # ink purple -> navy
    "#7a6182": "#8a7565",  # dim purple -> warm dust
}

# --- Brand strings. Applied globally, order matters (longest first). ---
BRAND = [
    # cinematic / cinematic-glass H1: "Jordan <em>&amp;</em> the small presses"
    ("Jordan <em>&amp;</em> the small presses",
     "Alamo Ledger <em>&amp;</em> the small presses"),
    ("Jordan Rivers <em>&amp;</em> the small machines",
     "Alamo Ledger Co. <em>&amp;</em> the small presses"),
    ("Jordan Rivers &amp; the small machines",
     "Alamo Ledger Co. &amp; the small presses"),
    ("Jordan Rivers &mdash; small machines, out loud",
     "Alamo Ledger Co. &mdash; small presses, San Antonio"),
    # artistic H1: "Jordan <span class='amp'>&amp;</span> the small<br>\n    machines <span class='last'>Rivers</span>"
    ('Jordan <span class="amp">&amp;</span> the small<br>\n    machines <span class="last">Rivers</span>',
     'Alamo Ledger <span class="amp">&amp;</span> the small<br>\n    presses <span class="last">of&nbsp;San Antonio</span>'),
    ('Jordan <span class="amp">&amp;</span> the small<br>',
     'Alamo Ledger <span class="amp">&amp;</span> the small<br>'),
    ('machines <span class="last">Rivers</span>',
     'presses <span class="last">of&nbsp;San Antonio</span>'),
    # photography H1: "Jordan<br><span class='last'>Rivers</span>"
    ('Jordan<br><span class="last">Rivers</span>',
     'Alamo<br><span class="last">Ledger</span>'),
    # legacy long-form
    ("Jordan &amp; the small machines", "Alamo &amp; the small presses"),
    ("small machines, out loud", "small presses, San Antonio"),
    ("the small machines", "the small presses"),
    ("small machines", "small presses"),
    # domain
    ("jordan-rivers.dev/status", "alamoledger.us/status"),
    ("jordan-rivers.dev / status", "alamoledger.us / status"),
    ("jordan-rivers.dev", "alamoledger.us"),
    ("@jordan-rivers", "@alamoledger"),
    # canonical brand
    ("Jordan Rivers", "Alamo Ledger Co."),
    ("jordan rivers", "alamo ledger co."),
    ("Jordan RIVERS", "Alamo LEDGER"),
    # emails / handles
    ("jordan@rivers.example", "hello@alamoledger.example"),
    ("jordan@rivers", "hello@alamoledger"),
    ("jordan@example.dev", "hello@alamoledger.example"),
    ("mail jordan@example.dev", "mail hello@alamoledger.example"),
    ("mailto:jordan@example.dev", "mailto:hello@alamoledger.example"),
    # landing-neon domain + copy
    ("ledger.dev", "alamoledger.us"),
    ("Ship the <em>artifact</em>, not the pitch.", "Ship the <em>ledger</em>, not the pitch."),
    ("alamoledger.us is a one-person build shop that reimagines legacy systems as command-line demos, then ships the code. No slide decks.",
     "alamoledger.us is a hand bindery in San Antonio: ledgers, ranch journals, and deed boxes since 2011. No online orders."),
    ("hello@ledger.example", "hello@alamoledger.example"),
    ("mailto:hello@ledger.example", "mailto:hello@alamoledger.example"),
    # cinematic kicker + captions
    ("Piece 03 &mdash; small machines, out loud",
     "Piece 03 &mdash; small presses, San Antonio"),
    ("Piece 03 — small machines, out loud", "Piece 03 — small presses, San Antonio"),
    ("Small machines &middot; Bristol &middot; since 2019",
     "Small presses &middot; San Antonio &middot; since 2011"),
    ("Small machines · Bristol · since 2019",
     "Small presses · San Antonio · since 2011"),
    # dashboard / bento content
    ("Three small machines. One paper journal. One book in flight.",
     "Three small presses. One ranch journal. One deed box in flight."),
    ("Three small machines.", "Three small presses."),
    ("operator &middot; alamo ledger co.", "operator &middot; alamo ledger co."),
    # photography byline
    ("Words &amp; pictures by alamo ledger co. &middot; set in Didot &amp; Iowan",
     "Words &amp; pictures for Alamo Ledger Co. &middot; set in Didot &amp; Iowan"),
    # remaining lowercase citation lines
    ("&copy; 2026 alamo ledger co. &middot; folio no. 34",
     "&copy; 2026 alamo ledger co. &middot; folio no. 34"),
    ("&copy; 2026 alamo ledger co. &middot; /status",
     "&copy; 2026 alamo ledger co. &middot; /status"),
    ("&copy; 2026 alamo ledger co.", "&copy; 2026 alamo ledger co."),
]

# --- One lone-star SVG lockup, inserted into each masthead area. ---
STAR_SVG = (
    '<svg class="lone-star" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" '
    'style="display:inline-block;vertical-align:middle;margin:0 8px 2px 0;fill:#b22234;'
    'filter:drop-shadow(0 0 4px rgba(178,34,52,.35))">'
    '<path d="M12 2 L14.6 9.2 L22 9.5 L16.2 14.1 L18.3 21.4 L12 17.2 L5.7 21.4 L7.8 14.1 L2 9.5 L9.4 9.2 Z"/>'
    "</svg>"
)

# Places to inject the star (regex -> replacement builder). Applied at most once per file.
STAR_ANCHORS = [
    # cinematic + cinematic-glass: kicker before the italic ampersand in masthead
    (r'(<div class="kicker">00 · MASTHEAD</div>\s*<h1 class="title">)',
     r"\1" + STAR_SVG),
    # dashboard: masthead brand row
    (r'(<div class="who">)',
     r"\1" + STAR_SVG),
    # bento: brand tile
    (r'(<div class="who"><i class="live"[^>]*></i>)',
     r"\1" + STAR_SVG),
    # neon landing brand
    (r'(<div class="brand"><b>&#9679;</b>)',
     r"\1" + STAR_SVG),
    # artistic masthead — comes right before the italic ampersand
    (r'(<h1[^>]*class="[^"]*mast[^"]*"[^>]*>)',
     r"\1" + STAR_SVG),
    # generic fallback: first <h1> in the file (default page, photography)
    (r"(<h1[^>]*>)", r"\1" + STAR_SVG),
]

# --- Cinematic shader: retune to Texas sunset (navy base -> gold mid -> red highlight) ---
SHADER_COLOR_REPLACEMENTS = [
    # Matches both `.49` and `0.49` decimal notations, and 1., 1.0, or 1.00 for full values.
    (r"vec3\s+beam\s*=\s*vec3\(\s*0?\.49\s*,\s*0?\.95\s*,\s*1\.?0*\s*\)\s*;",
     "vec3 beam  = vec3(0.91, 0.65, 0.25);"),  # sun gold
    (r"vec3\s+ember\s*=\s*vec3\(\s*1\.?0*\s*,\s*0?\.48\s*,\s*0?\.36\s*\)\s*;",
     "vec3 ember = vec3(0.75, 0.14, 0.20);"),  # star red
    # short-form (post-first-run) shape kept idempotent
    (r"vec3\s+beam\s*=\s*vec3\(\.91,\s*\.65,\s*\.25\);",
     "vec3 beam  = vec3(0.91, 0.65, 0.25);"),
    (r"vec3\s+ember\s*=\s*vec3\(\.70,\s*\.13,\s*\.20\);",
     "vec3 ember = vec3(0.75, 0.14, 0.20);"),
    # background nudge
    (r"col\s*\+=\s*vec3\(\s*0?\.03\s*,\s*0?\.05\s*,\s*0?\.08\s*\)\s*;",
     "col += vec3(0.04, 0.06, 0.12);"),
]


def apply_palette(text: str) -> str:
    for old, new in PALETTE.items():
        # case-insensitive for hex codes (they can appear as #FFFFFF or #ffffff)
        if old.startswith("#"):
            text = re.sub(re.escape(old), new, text, flags=re.IGNORECASE)
        else:
            text = text.replace(old, new)
    return text


def apply_brand(text: str) -> str:
    for old, new in BRAND:
        text = text.replace(old, new)
    return text


def apply_star(text: str) -> str:
    """Insert the star once, at the first anchor that matches. Idempotent."""
    if 'class="lone-star"' in text:
        return text  # already themed
    for pattern, repl in STAR_ANCHORS:
        new_text, n = re.subn(pattern, repl, text, count=1, flags=re.IGNORECASE)
        if n > 0:
            return new_text
    return text  # no anchor matched; leave untouched (page has no masthead)


def apply_shader(text: str) -> str:
    for pattern, repl in SHADER_COLOR_REPLACEMENTS:
        text = re.sub(pattern, repl, text)
    return text


def transform(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    body = apply_palette(original)
    body = apply_brand(body)
    body = apply_shader(body)
    body = apply_star(body)
    if body != original:
        path.write_text(body, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for tgt in TARGETS:
        if not tgt.exists():
            print(f"  skip (missing) {tgt.relative_to(ROOT)}")
            continue
        did = transform(tgt)
        marker = "themed  " if did else "no-op   "
        print(f"  {marker} {tgt.relative_to(ROOT)}")
        if did:
            changed += 1
    print(f"\nTexas theme applied to {changed}/{len(TARGETS)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
