#!/usr/bin/env python3
"""
audit.py — Design Health, the deterministic craft-floor audit.

This is the Python mirror of `src/audit.js`, kept for the Python-based GitHub
Action. `src/audit.js` is the reference implementation; the parity test in
`test/unit/audit-parity.test.js` fails if the two disagree about any file in
the repository, so neither can drift.

Usage:
    python scripts/audit.py gold/webpage/after.html
    python scripts/audit.py gold/webpage/after.html --verbose
    python scripts/audit.py examples/end-users/horizon/auto.html --json
    python scripts/audit.py page.html --allow-fetch   # web fonts are intentional

Exit code: 0 = clean, 1 = warnings, 2 = failures (must block shipping).

No LLM, no API key, no network. The rule set is a registry, so the published
rule count is derived from the code rather than restated in prose.

Three things it resolves that naive HTML linting misses:
  1. CSS custom properties — `font-family:var(--sans)` is resolved back to the
     declared stack before font rules run.
  2. Fluid lengths — `clamp()`, `min()`, and `max()` contribute every px value
     they resolve to, so a fluid type scale is legible to the hierarchy rule.
  3. Real pass counts — every rule reports, so a clean file states how many
     rules it actually cleared.

It remains static analysis. It cannot measure rendered contrast, CLS, or INP.
"""

import json
import math
import os
import re
import sys

# ── Rule registry ──────────────────────────────────────────────────────────
# severity is the worst outcome a rule can produce. PAL-01 can warn or fail
# depending on how far the palette has drifted.

RULES = [
    {"code": "TYPO-01", "category": "Typography", "severity": "warning", "title": "No banned default fonts"},
    {"code": "TYPO-02", "category": "Typography", "severity": "warning", "title": "Type scale has range and steps"},
    {"code": "TYPO-03", "category": "Typography", "severity": "warning", "title": "Prose measure capped at 65ch"},
    {"code": "PAL-01", "category": "Palette", "severity": "failure", "title": "Palette stays constrained"},
    {"code": "PAL-02", "category": "Palette", "severity": "failure", "title": "No transition: all"},
    {"code": "PAL-03", "category": "Palette", "severity": "warning", "title": "::selection is styled"},
    {"code": "MOT-01", "category": "Motion", "severity": "failure", "title": "No outline removal without replacement"},
    {"code": "MOT-02", "category": "Motion", "severity": "failure", "title": "prefers-reduced-motion honored"},
    {"code": "MOT-03", "category": "Motion", "severity": "failure", "title": ":focus-visible present"},
    {"code": "MOT-04", "category": "Motion", "severity": "warning", "title": "Compositor-only animation"},
    {"code": "CONT-01", "category": "Content", "severity": "failure", "title": "No placeholder copy"},
    {"code": "CONT-02", "category": "Content", "severity": "warning", "title": "No vibe adjectives"},
    {"code": "CONT-03", "category": "Content", "severity": "warning", "title": "No emoji farm"},
    {"code": "CONT-04", "category": "Content", "severity": "warning", "title": "No <br><br> spacing"},
    {"code": "STR-01", "category": "Structure", "severity": "failure", "title": "Opens offline — no CDN"},
    {"code": "STR-02", "category": "Structure", "severity": "failure", "title": "No external font fetch"},
    {"code": "STR-03", "category": "Structure", "severity": "warning", "title": "Figure system does real work"},
    {"code": "PERF-01", "category": "Performance", "severity": "warning", "title": "Images declare dimensions"},
    {"code": "PERF-02", "category": "Performance", "severity": "warning", "title": "Long pages hint content-visibility"},
]

RULE_ORDER = [rule["code"] for rule in RULES]

BANNED_FONTS = [
    "inter", "roboto", "arial", "space grotesk", "helvetica",
    "open sans", "lato", "montserrat", "poppins", "raleway",
]

PLACEHOLDER_PHRASES = [
    "lorem ipsum", "dolor sit amet", "title goes here",
    "type something", "sample text", "your text here", "testimonials go here",
]

PLACEHOLDER_TOKENS = ["TBD", "TODO", "Lorem"]

VIBE_WORDS = [
    "wow", "amazing", "incredible", "revolutionary", "game-changing",
    "disruptive", "unprecedented", "best-in-class", "world-class",
    "cutting-edge", "state-of-the-art", "innovative",
]

NAMED_NEUTRALS = {
    "#f5f5f5", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280",
    "#4b5563", "#374151", "#1f2937", "#111827",
}

# Non-compositor properties: animating these forces layout or paint work.
BAD_ANIM_PROPS = {
    "top", "left", "right", "bottom",
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "width", "max-width", "min-width",
    "height", "max-height", "min-height",
    "font", "font-size", "letter-spacing", "line-height", "word-spacing",
    "color", "background", "background-color", "fill", "stroke", "stroke-dashoffset",
}

# The engine's own palette ceiling: three source-declared brand colors plus the
# derived accent/tint family. `src/auto.js` scores anything above 16 distinct
# hexes as an unbounded palette, so Design Health uses the same bar rather than
# a second, conflicting one.
PALETTE_WARN_ABOVE = 16
PALETTE_FAIL_ABOVE = 24

# Type hierarchy is measured as range plus steps rather than fixed size bands,
# because banded thresholds report a false "missing level" for any scale whose
# steps land between the bands. Designed output across every builder clears
# 4 steps and a 3x range; flat documents do not.
TYPE_MIN_STEPS = 4
TYPE_MIN_RATIO = 3

# A figure system is hero-scale by declared size, or a canvas, or enough drawn
# geometry to be a repeated figure rather than decoration. Measured on shape
# elements so a noise texture in a data URI cannot pass the rule.
FIGURE_HERO_PX = 400
FIGURE_MIN_SHAPES = 6

EMOJI_RE = re.compile(r"[\U0001F300-\U0001F9FF\u2600-\u27BF\u2B50\u2728]")
CUSTOM_PROP_RE = re.compile(r"(--[\w-]+)\s*:\s*([^;{}]+)")
COLOR_DECL_RE = re.compile(r"(?:color|background(?:-color)?|fill|stroke)\s*:\s*([^;{}]+)", re.IGNORECASE)
FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;{}]+)", re.IGNORECASE)
FONT_SIZE_RE = re.compile(r"font(?:-size)?\s*:\s*([^;{}]+)", re.IGNORECASE)
LENGTH_RE = re.compile(r"(-?\d+(?:\.\d+)?)\s*(px|rem|em)\b", re.IGNORECASE)
ANIMATED_PROP_RE = re.compile(r"(?:animation|transition)(?:-property)?\s*:\s*([^;{}]+)", re.IGNORECASE)
BR_SPACING_RE = re.compile(r"<br\s*/?>\s*<br\s*/?>", re.IGNORECASE)
CDN_RE = re.compile(
    r"(?:src=|href=)[\"']https?://(?!raw\.githubusercontent\.com/Kayforkind/reimagine-it)"
    r"[^\"']*?\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp|mp3|mp4|webm)[\"'\s]",
    re.IGNORECASE,
)
WEBFONT_RE = re.compile(r"@import\s+url\s*\(|href=[\"']https?://fonts\.googleapis\.com", re.IGNORECASE)
MEASURE_RE = re.compile(r"max-width\s*:\s*(?:6[0-5]|[1-5]\d)ch", re.IGNORECASE)
SHAPE_RE = re.compile(r"<(?:path|rect|circle|ellipse|polygon|polyline|line)\b", re.IGNORECASE)
DATA_URI_RE = re.compile(r"url\(([\"']?)data:[^)]*\1\)", re.IGNORECASE)
VAR_RE = re.compile(r"var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)")
HEX_RE = re.compile(r"#[0-9a-f]{3,8}\b", re.IGNORECASE)
STYLE_BLOCK_RE = re.compile(r"<style[^>]*>(.*?)</style>", re.DOTALL | re.IGNORECASE)
INLINE_STYLE_RE = re.compile(r"style\s*=\s*\"([^\"]*)\"", re.IGNORECASE)
FIGURE_RE = re.compile(r"<(svg|canvas)\b([^>]*)>", re.IGNORECASE)
FIGURE_DIM_RE = re.compile(r"\b(?:width|height)\s*=\s*[\"']?(\d+)", re.IGNORECASE)
VIEWBOX_RE = re.compile(
    r"viewBox\s*=\s*[\"']\s*-?[\d.]+\s+-?[\d.]+\s+([\d.]+)\s+([\d.]+)", re.IGNORECASE
)
SCRIPT_BLOCK_RE = re.compile(r"<script.*?</script>", re.DOTALL | re.IGNORECASE)


# ── Parsing ────────────────────────────────────────────────────────────────

def strip_comments(css):
    return re.sub(r"/\*.*?\*/", " ", css, flags=re.DOTALL)


def strip_data_uris(value):
    """Embedded assets never carry the page's own type, palette, or geometry."""
    return DATA_URI_RE.sub("url(#embedded)", value)


def collect_css(raw):
    blocks = STYLE_BLOCK_RE.findall(raw)
    blocks.extend(INLINE_STYLE_RE.findall(raw))
    return strip_data_uris(strip_comments("\n".join(blocks)))


def custom_properties(css):
    props = {}
    for name, value in CUSTOM_PROP_RE.findall(css):
        # Last declaration wins, which approximates the cascade for the
        # single-file output this tool audits.
        props[name] = value.strip()
    return props


def resolve_vars(text, props):
    """Shallow-iterative var() resolution: six passes resolve every chain the
    generator emits without risking a cyclic definition loop."""
    for _ in range(6):
        changed = [False]

        def replace(match):
            name, fallback = match.group(1), match.group(2)
            if name in props:
                changed[0] = True
                return props[name]
            if fallback is not None:
                changed[0] = True
                return fallback
            return match.group(0)

        text = VAR_RE.sub(replace, text)
        if not changed[0]:
            break
    return text


def lengths_to_px(value):
    out = []
    for size, unit in LENGTH_RE.findall(value):
        number = float(size)
        out.append(number if unit.lower() == "px" else number * 16)
    return out


def normalise_hex(value):
    value = value.lower()
    if len(value) == 4:
        return "#" + value[1] * 2 + value[2] * 2 + value[3] * 2
    if len(value) == 7:
        return value
    return None


def is_neutral_hex(value):
    if value in NAMED_NEUTRALS:
        return True
    # Pure grayscale carries no hue, so it is structure rather than palette.
    return value[1:3] == value[3:5] == value[5:7]


def parse_page(raw, file_path):
    raw = raw or ""
    css = collect_css(raw)
    props = custom_properties(css)
    css_resolved = resolve_vars(css, props)

    text = SCRIPT_BLOCK_RE.sub(" ", raw)
    text = STYLE_BLOCK_RE.sub(" ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    fonts = []
    for value in FONT_FAMILY_RE.findall(css_resolved):
        for family in value.split(","):
            name = family.strip().strip("\"'").strip()
            if name:
                fonts.append(name.lower())

    sizes = []
    for value in FONT_SIZE_RE.findall(css_resolved):
        sizes.extend(lengths_to_px(value))

    colors = set()
    for value in COLOR_DECL_RE.findall(css_resolved):
        for hex_value in HEX_RE.findall(value):
            normalised = normalise_hex(hex_value)
            if normalised:
                colors.add(normalised)

    markup = strip_data_uris(raw)
    figures = []
    for tag, attrs in FIGURE_RE.findall(markup):
        largest = 0.0
        for dim in FIGURE_DIM_RE.findall(attrs):
            largest = max(largest, float(int(dim)))
        viewbox = VIEWBOX_RE.search(attrs)
        if viewbox:
            largest = max(largest, float(viewbox.group(1)), float(viewbox.group(2)))
        figures.append({"tag": tag.lower(), "largest": largest})

    return {
        "path": file_path or "(inline)",
        "raw": raw,
        "markup": markup,
        "text": text,
        "css": css,
        "css_resolved": css_resolved,
        "props": props,
        "fonts": fonts,
        "sizes": sizes,
        "colors": sorted(colors),
        "figures": figures,
        "shapes": len(SHAPE_RE.findall(markup)),
    }


# ── Rules ──────────────────────────────────────────────────────────────────
# Each check returns a dict to raise a finding, or None to pass. At most one
# finding per rule keeps the pass count meaningful.

def check_typo_01(page, options):
    found = sorted({font for font in page["fonts"] if font in BANNED_FONTS})
    if not found:
        return None
    return {
        "message": "Banned font(s) found: " + ", ".join(found) +
                   ". Prefer content-derived or distinctive choices."
    }


def _round(value, places):
    """Round half-up, matching JavaScript's Math.round, so the Python mirror and
    src/audit.js produce byte-identical messages."""
    factor = 10 ** places
    return math.floor(value * factor + 0.5) / factor


def type_scale(page):
    steps = sorted({_round(size, 1) for size in page["sizes"] if size > 0})
    low = steps[0] if steps else 0
    high = steps[-1] if steps else 0
    return {
        "steps": len(steps),
        "min": low,
        "max": high,
        "ratio": (high / low) if low else 0,
    }


def check_typo_02(page, options):
    scale = type_scale(page)
    if not scale["steps"]:
        return {"message": "No font sizes declared — the page has no type scale at all."}
    problems = []
    if scale["steps"] < TYPE_MIN_STEPS:
        problems.append(
            "only %d distinct size(s), expected %d" % (scale["steps"], TYPE_MIN_STEPS)
        )
    if scale["ratio"] < TYPE_MIN_RATIO:
        problems.append(
            "display:meta ratio %sx, expected %sx" % (_num(_round(scale["ratio"], 2)), TYPE_MIN_RATIO)
        )
    if not problems:
        return None
    return {"message": "Flat type scale — " + "; ".join(problems) + "."}


def check_typo_03(page, options):
    if MEASURE_RE.search(page["css_resolved"]):
        return None
    if len(page["text"]) <= 200:
        return None
    return {"message": "No max-width text measure (<=65ch) found on containers."}


def check_pal_01(page, options):
    non_neutral = [value for value in page["colors"] if not is_neutral_hex(value)]
    if len(non_neutral) > PALETTE_FAIL_ABOVE:
        return {
            "severity": "failure",
            "message": "%d non-neutral colors — palette is unconstrained." % len(non_neutral),
        }
    if len(non_neutral) > PALETTE_WARN_ABOVE:
        return {
            "message": "%d distinct non-neutral colors found. "
                       "The derived palette system tops out at %d."
                       % (len(non_neutral), PALETTE_WARN_ABOVE),
        }
    return None


def check_pal_02(page, options):
    pattern = re.compile(r"transition\s*:\s*all\b", re.IGNORECASE)
    if not pattern.search(page["raw"]) and not pattern.search(page["css_resolved"]):
        return None
    return {"message": "Banned: 'transition: all' found. Animate explicit properties."}


def check_pal_03(page, options):
    if re.search(r"::selection", page["css"], re.IGNORECASE):
        return None
    return {"message": "::selection not styled. Should be on-palette."}


def check_mot_01(page, options):
    pattern = re.compile(r"outline\s*:\s*(?:0|none)\b", re.IGNORECASE)
    if not pattern.search(page["css_resolved"]) and not pattern.search(page["raw"]):
        return None
    return {
        "message": "Banned: 'outline: 0' or 'outline: none' without a visible focus replacement."
    }


def check_mot_02(page, options):
    if re.search(r"prefers-reduced-motion", page["css"], re.IGNORECASE):
        return None
    return {"message": "Missing @media (prefers-reduced-motion: reduce) block."}


def check_mot_03(page, options):
    if re.search(r":focus-visible", page["css"], re.IGNORECASE):
        return None
    return {
        "message": "Missing :focus-visible rule. "
                   "Every interactive element needs a visible focus indicator."
    }


def check_mot_04(page, options):
    offenders = set()
    for value in ANIMATED_PROP_RE.findall(page["css_resolved"]):
        for part in value.split(","):
            prop = part.strip().lower()
            if prop in BAD_ANIM_PROPS:
                offenders.add(prop)
    if not offenders:
        return None
    return {
        "message": "Non-compositor properties in animation/transition: " +
                   ", ".join(sorted(offenders)) + ". Use transform/opacity only."
    }


def check_cont_01(page, options):
    lower = page["text"].lower()
    found = [phrase for phrase in PLACEHOLDER_PHRASES if phrase in lower]
    for token in PLACEHOLDER_TOKENS:
        if re.search(r"\b" + re.escape(token) + r"\b", page["text"]):
            found.append(token)
    if not found:
        return None
    return {
        "message": "Placeholder text found: " + ", ".join(found) +
                   ". No lorem/TBD/placeholder allowed."
    }


def check_cont_02(page, options):
    lower = page["text"].lower()
    found = [word for word in VIBE_WORDS if word in lower]
    if len(found) < 2:
        return None
    return {
        "message": "Vibe adjectives: " + ", ".join(found) + ". Let content carry the weight."
    }


def check_cont_03(page, options):
    count = len(set(EMOJI_RE.findall(page["text"])))
    if count <= 3:
        return None
    return {"message": "%d distinct emoji found. Not a content-derived design move." % count}


def check_cont_04(page, options):
    if not BR_SPACING_RE.search(page["raw"]):
        return None
    return {"message": "Found <br><br> spacing. Use margin/padding on containers."}


def check_str_01(page, options):
    matches = CDN_RE.findall(page["raw"])
    if not matches:
        return None
    return {
        "message": "CDN/hotlinked resource(s) found: " + ", ".join(matches[:3]) +
                   ". Output must open offline — no external fetches."
    }


def check_str_02(page, options):
    if options.get("allow_fetch"):
        return None
    if not WEBFONT_RE.search(page["raw"]):
        return None
    return {
        "message": "External font fetch (Google Fonts / @import) — "
                   "must be offline single-file. Use system font stacks, "
                   "or pass --allow-fetch when web fonts are intentional."
    }


def check_str_03(page, options):
    if any(figure["largest"] >= FIGURE_HERO_PX for figure in page["figures"]):
        return None
    if any(figure["tag"] == "canvas" for figure in page["figures"]):
        return None
    if page["shapes"] >= FIGURE_MIN_SHAPES:
        return None
    return {
        "message": "No figure system detected — needs a >=%dpx svg/canvas, a canvas scene, "
                   "or at least %d drawn shapes (found %d). "
                   "Decoration in a data URI does not count."
                   % (FIGURE_HERO_PX, FIGURE_MIN_SHAPES, page["shapes"])
    }


def check_perf_01(page, options):
    for attrs in re.findall(r"<img\s([^>]+?)/?>", page["raw"], re.IGNORECASE):
        if re.search(r"\b(?:width|height)\s*=", attrs, re.IGNORECASE):
            continue
        if re.search(r"aspect-ratio", attrs, re.IGNORECASE):
            continue
        return {
            "message": "<img> missing width/height or aspect-ratio — may cause CLS. "
                       "Found in: <img " + attrs[:60] + "...>"
        }
    return None


def check_perf_02(page, options):
    if re.search(r"content-visibility\s*:\s*auto", page["css_resolved"], re.IGNORECASE):
        return None
    if len(page["text"]) <= 1000:
        return None
    return {
        "message": "Long page — consider content-visibility: auto "
                   "on off-screen sections for render skipping."
    }


CHECKS = {
    "TYPO-01": check_typo_01,
    "TYPO-02": check_typo_02,
    "TYPO-03": check_typo_03,
    "PAL-01": check_pal_01,
    "PAL-02": check_pal_02,
    "PAL-03": check_pal_03,
    "MOT-01": check_mot_01,
    "MOT-02": check_mot_02,
    "MOT-03": check_mot_03,
    "MOT-04": check_mot_04,
    "CONT-01": check_cont_01,
    "CONT-02": check_cont_02,
    "CONT-03": check_cont_03,
    "CONT-04": check_cont_04,
    "STR-01": check_str_01,
    "STR-02": check_str_02,
    "STR-03": check_str_03,
    "PERF-01": check_perf_01,
    "PERF-02": check_perf_02,
}


def _num(value):
    """Match JavaScript number formatting so parity comparisons hold."""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


# ── Runner ─────────────────────────────────────────────────────────────────

def audit_html(html, path=None, allow_fetch=False):
    page = parse_page(html, path)
    options = {"allow_fetch": allow_fetch}
    findings = []
    checks = []

    for rule in RULES:
        result = CHECKS[rule["code"]](page, options)
        if not result:
            checks.append({"code": rule["code"], "category": rule["category"], "status": "pass"})
            continue
        severity = result.get("severity", rule["severity"])
        checks.append({"code": rule["code"], "category": rule["category"], "status": severity})
        findings.append({
            "code": rule["code"],
            "category": rule["category"],
            "severity": severity,
            "message": result["message"],
        })

    findings.sort(key=lambda finding: RULE_ORDER.index(finding["code"]))
    failures = sum(1 for finding in findings if finding["severity"] == "failure")
    warnings = sum(1 for finding in findings if finding["severity"] == "warning")

    return {
        "file": page["path"],
        "rules": len(RULES),
        "passed": len(RULES) - len(findings),
        "warnings": warnings,
        "failures": failures,
        "verdict": "FAIL" if failures else ("WARNINGS" if warnings else "CLEAN"),
        "findings": findings,
        "checks": checks,
    }


def audit(filepath, verbose=False, allow_fetch=False):
    with open(filepath, "r", encoding="utf-8") as handle:
        html = handle.read()
    report = audit_html(html, filepath, allow_fetch=allow_fetch)
    if verbose:
        print(format_report(report, verbose=True))
    return report


def exit_code_for(report):
    if report["failures"] > 0:
        return 2
    if report["warnings"] > 0:
        return 1
    return 0


def format_report(report, verbose=False, color=True):
    def paint(code, value):
        return "\033[%dm%s\033[0m" % (code, value) if color else str(value)

    lines = ["", paint(1, "DESIGN HEALTH — " + report["file"])]
    lines.append("  %s  %s  %s  of %d rules" % (
        paint(92, "%d passed" % report["passed"]),
        paint(93, "%d warnings" % report["warnings"]),
        paint(91, "%d failures" % report["failures"]),
        report["rules"],
    ))

    if verbose:
        categories = []
        for check in report["checks"]:
            if check["category"] not in categories:
                categories.append(check["category"])
        for category in categories:
            lines.append("")
            lines.append("  -- %s --" % category)
            for check in report["checks"]:
                if check["category"] != category:
                    continue
                finding = next(
                    (f for f in report["findings"] if f["code"] == check["code"]), None
                )
                mark = {
                    "pass": paint(92, "ok  "),
                    "warning": paint(93, "warn"),
                    "failure": paint(91, "fail"),
                }[check["status"]]
                lines.append("    %s %s%s" % (
                    mark, check["code"], (": " + finding["message"]) if finding else ""
                ))

    warns = [f for f in report["findings"] if f["severity"] == "warning"]
    fails = [f for f in report["findings"] if f["severity"] == "failure"]

    if not verbose and warns:
        lines.append("")
        lines.append(paint(93, "Warnings:"))
        for finding in warns:
            lines.append("  ~ %s: %s" % (paint(93, finding["code"]), finding["message"]))
    if not verbose and fails:
        lines.append("")
        lines.append(paint(91, "Failures (must fix before shipping):"))
        for finding in fails:
            lines.append("  x %s: %s" % (paint(91, finding["code"]), finding["message"]))

    lines.append("")
    if not report["failures"]:
        detail = ("%d warning(s), no blockers" % report["warnings"]) if report["warnings"] \
            else ("all %d rules passed" % report["rules"])
        lines.append(paint(1, "Verdict: ") + paint(92, report["verdict"]) + " — " + detail)
    else:
        lines.append(paint(1, "Verdict: ") + paint(91, "FAIL") + " — %d blocker(s). "
                     "Fix before reporting shipped." % report["failures"])
    lines.append("")
    return "\n".join(lines)


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print("Usage: python scripts/audit.py <path-to.html> [--verbose] [--json] [--allow-fetch]")
        print("  --verbose      Show per-rule breakdown by category")
        print("  --json         Output JSON (for CI)")
        print("  --allow-fetch  Permit external font fetches (intentional web fonts)")
        print("  --rules        List the rule registry and exit")
        sys.exit(0)

    if "--rules" in args:
        for rule in RULES:
            print("%-9s %-13s %-8s %s" % (
                rule["code"], rule["category"], rule["severity"], rule["title"]
            ))
        print("\n%d rules" % len(RULES))
        sys.exit(0)

    filepath = args[0]
    verbose = "--verbose" in args
    json_out = "--json" in args
    allow_fetch = "--allow-fetch" in args

    if not os.path.isfile(filepath):
        print("File not found: %s" % filepath, file=sys.stderr)
        sys.exit(2)

    report = audit(filepath, verbose=False, allow_fetch=allow_fetch)

    if json_out:
        json.dump(report, sys.stdout, indent=2)
        print()
    else:
        print(format_report(report, verbose=verbose))

    sys.exit(exit_code_for(report))


if __name__ == "__main__":
    main()
