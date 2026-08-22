"""Falsifiable gold review. Exit 1 on the first hard fail."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JULES = ROOT / "gold" / "jules"
TEXAS_SVG = ROOT / "gold" / "forms" / "svg" / "after.svg"
SEE = ROOT / "gold" / "forms" / "see.html"

JULES_AFTERS = (
    JULES / "webpage",
    JULES / "domains" / "artistic",
    JULES / "domains" / "dashboard",
    JULES / "domains" / "photography",
    JULES / "domains" / "cinematic",
    JULES / "domains" / "infographic",
    JULES / "modifiers" / "cinematic-glassmorphism",
    JULES / "modifiers" / "dashboard-bento",
    JULES / "modifiers" / "landing-neon",
    JULES / "forms" / "svg",
    JULES / "forms" / "3js",
    JULES / "forms" / "simulation",
)

TEXAS_CLONE = re.compile(
    r"Alamo|Bluebonnet|Rio Grande|#1a2138|The years run|All three|00 · MASTHEAD|Priestley",
    re.I,
)
CDN = re.compile(r"cdn\.jsdelivr|unpkg\.com|esm\.sh|threejs\.org/build", re.I)
WHITE = re.compile(r'fill="#(?:fff(?:fff)?|ffffff)"', re.I)
GOLD_STAR = re.compile(r'class="star"[^>]*>\s*<path[^>]*fill="#e8a63f"', re.I | re.S)
WEENIE_STAR = re.compile(
    r'id="weenie-flag".*?class="star".*?fill="(#[0-9A-Fa-f]+)"',
    re.S,
)


def fail(msg: str) -> int:
    print(f"FAIL  {msg}", file=sys.stderr)
    return 1


def ok(msg: str) -> None:
    print(f"ok    {msg}")


def weenie_star_fill(text: str, label: str) -> str | None:
    match = WEENIE_STAR.search(text)
    if not match:
        print(f"FAIL  {label}: no id=weenie-flag star fill", file=sys.stderr)
        return None
    return match.group(1).lower()


def main() -> int:
    errors = 0

    if not TEXAS_SVG.is_file():
        return fail(f"missing {TEXAS_SVG.relative_to(ROOT)}")
    svg = TEXAS_SVG.read_text(encoding="utf-8")
    if GOLD_STAR.search(svg):
        errors += fail("texas svg weenie star is gold #e8a63f — that is not the Lone Star flag")
    fill = weenie_star_fill(svg, "texas svg")
    if fill is None:
        errors += 1
    elif fill not in {"#fff", "#ffffff"}:
        errors += fail(f"texas svg weenie star fill is {fill}, need white")
    else:
        ok("texas svg weenie is a white star on the flag")
    if "#002868" not in svg or "#BF0A30" not in svg or "#ffffff" not in svg:
        errors += fail("texas svg weenie missing official cloth colors #002868 / #ffffff / #BF0A30")
    else:
        ok("texas svg weenie uses official flag cloth")

    if not SEE.is_file():
        return fail(f"missing {SEE.relative_to(ROOT)}")
    see = SEE.read_text(encoding="utf-8")
    if GOLD_STAR.search(see):
        errors += fail("see.html breathe star is gold #e8a63f — not the Lone Star flag")
    see_fill = weenie_star_fill(see, "see.html")
    if see_fill is None:
        errors += 1
    elif see_fill not in {"#fff", "#ffffff"}:
        errors += fail(f"see.html weenie star fill is {see_fill}, need white")
    else:
        ok("see.html breathe card is a white star on the flag")

    for folder in JULES_AFTERS:
        html = folder / "after.html"
        png = folder / "after.png"
        if folder.name == "svg":
            svg_path = folder / "after.svg"
            if not svg_path.is_file():
                errors += fail(f"missing {svg_path.relative_to(ROOT)}")
            else:
                ok(f"jules svg {svg_path.relative_to(ROOT)}")
        if not html.is_file():
            errors += fail(f"missing {html.relative_to(ROOT)}")
            continue
        if not png.is_file():
            errors += fail(f"missing {png.relative_to(ROOT)}")
        text = html.read_text(encoding="utf-8")
        hit = TEXAS_CLONE.search(text)
        if hit:
            errors += fail(f"{html.relative_to(ROOT)} clones Texas ({hit.group(0)!r})")
        if CDN.search(text):
            errors += fail(f"{html.relative_to(ROOT)} loads a CDN")
        ok(f"jules {folder.relative_to(JULES)} after.html+png")

    webpage = (JULES / "webpage" / "after.html").read_text(encoding="utf-8")
    if "rotateX(12deg)" not in webpage or "class=\"parlor\"" not in webpage:
        errors += fail("jules webpage is not parlor-as-site (need .parlor and rotateX(12deg))")
    else:
        ok("jules webpage is parlor-as-site")

    sim = (JULES / "forms" / "simulation" / "after.html").read_text(encoding="utf-8")
    if "reimagineSim" not in sim or "On the" not in sim:
        errors += fail("jules simulation missing reimagineSim / On the board")
    else:
        ok("jules simulation API present")

    vendor = JULES / "forms" / "3js" / "vendor" / "three.module.min.js"
    if not vendor.is_file():
        errors += fail("jules 3js missing vendored three.module.min.js")
    else:
        ok("jules 3js vendor present")

    gif = JULES / "best.gif"
    if not gif.is_file() or gif.stat().st_size < 50_000:
        errors += fail("jules best.gif missing or tiny")
    else:
        ok(f"jules best.gif {gif.stat().st_size // 1024}KB")

    review_pack = ROOT / "skills" / "reimagine-it" / "references" / "review.md"
    if not review_pack.is_file():
        errors += fail("missing skills/reimagine-it/references/review.md")
    else:
        ok("review pack present")

    if errors:
        print(f"\n{errors} fail(s)", file=sys.stderr)
        return 1
    print("PASS  gold review")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
