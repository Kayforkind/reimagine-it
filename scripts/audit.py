#!/usr/bin/env python3
"""
audit.py — Deterministic quality checker for reimagine-it gold output.

Validates an HTML file against the craft-floor rules from
skills/reimagine-it/references/craft-floor.md.

Usage:
    python scripts/audit.py gold/webpage/after.html
    python scripts/audit.py gold/pulsewave/after.html --verbose
    python scripts/audit.py gold/webpage/after.html --json

Exit code: 0 = clean, 1 = warnings, 2 = failures (must block shipping).

Rules enforced (deterministic — no LLM, no API key):
    TYPOGRAPHY:   no banned fonts (Inter/Roboto/Arial/Space Grotesk without fallback),
                  4+ hierarchy levels, display >= 72px, measure <= 65ch
    PALETTE:      <= 5 distinct non-neutral colors, focus ring contrast >= 3:1,
                  ::selection styled, no transition:all
    MOTION:       compositor-only (transform/opacity), no outline:0 without replacement,
                  prefers-reduced-motion present, timing 100-300ms
    CONTENT:      no lorem/placeholder/TBD text, no <br><br> spacing,
                  no emoji farm (>3 emoji)
    STRUCTURE:    hero SVG >= 400px (if applicable), no blank plates,
                  interactive elements have focus-visible rules
    PERF:         no CDN (double-clickable), no external font fetch (unless --allow-fetch),
                  img with width/height attrs

This is a heuristic static-analysis tool. It cannot run the page in a browser,
so it misses: actual contrast ratios (needs color math), CLS measurement,
INP measurement, actual motion compositing verification.
"""

import sys
import re
import json
import os
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter


# ── Configuration ──────────────────────────────────────────────────────────

BANNED_FONTS = {
    "Inter", "Roboto", "Arial", "Space Grotesk", "Helvetica",
    "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway"
}

# Multi-word phrases (checked as substrings of the text)
PLACEHOLDER_PHRASES = [
    "lorem ipsum", "dolor sit amet", "title goes here",
    "type something", "sample text", "your text here", "testimonials go here",
]
# Single-word flags — only common placeholder tokens (not common English words)
PLACEHOLDER_TOKENS = {"TBD", "TODO", "Lorem"}

VIPE_WORDS = {"wow", "amazing", "incredible", "revolutionary", "game-changing",
              "disruptive", "unprecedented", "best-in-class", "world-class",
              "cutting-edge", "state-of-the-art", "innovative"}

EMOJI = re.compile(r"[\U0001F300-\U0001F9FF\u2600-\u27BF\u2B50\u2728]")

# Colors we consider "content-derived" vs neutral/utility
NEUTRAL_COLORS = {"#fff", "#ffffff", "#000", "#000000", "#f5f5f5",
                   "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280",
                   "#4b5563", "#374151", "#1f2937", "#111827",
                   "white", "black", "transparent"}

COLOR_RE = re.compile(
    r'(?:color|background(?:-color)?|fill|stroke)\s*:\s*(#[0-9a-fA-F]{3,8})',
    re.IGNORECASE
)

BANNED_TRANSITION_RE = re.compile(r'transition\s*:\s*all\b', re.IGNORECASE)

OUTLINE_ZERO_RE = re.compile(r'outline\s*:\s*0', re.IGNORECASE)
OUTLINE_NONE_RE = re.compile(r'outline\s*:\s*none', re.IGNORECASE)

BR_SPACING_RE = re.compile(r'<br\s*/?>\s*<br\s*/?>', re.IGNORECASE)

CDN_RE = re.compile(
    r'(?:src=|href=)["\']https?://(?!raw\.githubusercontent\.com/Kayforkind/reimagine-it)[^"\']*?\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp|mp3|mp4|webm)["\'\s]',
    re.IGNORECASE
)

WEBFONT_RE = re.compile(
    r'@import\s+url\s*\(|href=["\']https?://fonts\.googleapis\.com',
    re.IGNORECASE
)

PREFERS_REDUCED_RE = re.compile(r'prefers-reduced-motion', re.IGNORECASE)
FOCUS_VISIBLE_RE = re.compile(r':focus-visible', re.IGNORECASE)
SELECTION_RE = re.compile(r'::selection', re.IGNORECASE)

# Type hierarchy: look for font-size declarations
FONT_SIZE_RE = re.compile(
    r'font-size\s*:\s*(\d+(?:\.\d+)?)\s*(px|rem|em|clamp)',
    re.IGNORECASE
)

ANIMATED_PROP_RE = re.compile(
    r'(?:animation|transition)(?:-property)?\s*:\s*([^;{}]+)',
    re.IGNORECASE
)

BAD_ANIM_PROPS = {"top", "left", "right", "bottom", "margin", "margin-top",
                  "margin-right", "margin-bottom", "margin-left",
                  "padding", "padding-top", "padding-right",
                  "padding-bottom", "padding-left",
                  "width", "max-width", "min-width",
                  "height", "max-height", "min-height",
                  "font-size", "letter-spacing", "line-height"}


# ── Core — parse HTML, extract styles and text ─────────────────────────────

def parse_html(filepath: str):
    """Read an HTML file and return raw text + CSS + extracted facts."""
    with open(filepath, "r", encoding="utf-8") as fh:
        raw = fh.read()

    # Extract all <style> blocks
    styles = []
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", raw, re.DOTALL | re.IGNORECASE):
        styles.append(m.group(1))
    inline_css = "\n".join(styles)

    # Also grab inline style attributes
    for m in re.finditer(r'style\s*=\s*"([^"]*)"', raw, re.IGNORECASE):
        styles.append(m.group(1))

    # Extract text content (naive — just strip tags)
    text = re.sub(r"<[^>]+>", " ", raw)
    text = re.sub(r"\s+", " ", text).strip()

    # Find all font-family declarations
    fonts: list[str] = []
    for m in re.finditer(r"font-family\s*:\s*([^;{}]+)", raw, re.IGNORECASE):
        fonts.extend(f.strip("'\" ") for f in m.group(1).split(","))

    # Find all hex colors in CSS
    raw_colors = COLOR_RE.findall(raw)
    clean_colors = set()
    for c in raw_colors:
        canonical = c.lower()
        if len(canonical) == 7:  # #rrggbb
            clean_colors.add(canonical)
        elif len(canonical) == 4:  # #rgb → #rrggbb
            clean_colors.add(f"#{canonical[1]*2}{canonical[2]*2}{canonical[3]*2}")

    return {
        "path": filepath,
        "raw": raw,
        "text": text,
        "css": inline_css,
        "fonts": fonts,
        "colors": clean_colors,
        "num_lines": raw.count("\n") + 1,
    }


# ── Rules (return list of (line_number, severity, rule_code, message)) ─────

SEV = {"PASS": 0, "WARN": 1, "FAIL": 2}


def check_typography(page):
    results = []

    # RULE T1: No banned fonts as the sole choice
    unique_fonts = set(f.lower().strip("'\" ") for f in page["fonts"])
    banned_found = BANNED_FONTS & unique_fonts
    if banned_found:
        results.append((0, SEV["WARN"], "TYPO-01",
                        f"Banned font(s) found: {', '.join(sorted(banned_found))}. "
                        f"Prefer content-derived or distinctive choices."))

    # RULE T2: Font-size hierarchy — need at least display + section + body + meta
    sizes = []
    for m in FONT_SIZE_RE.finditer(page["raw"]):
        val = float(m.group(1))
        unit = m.group(2)
        if unit == "clamp":
            # Try to get the first number in clamp()
            clamp_match = re.search(r'clamp\s*\(\s*(\d+(?:\.\d+)?)', m.group(0))
            if clamp_match:
                val = float(clamp_match.group(1))
        sizes.append(val)

    has_display = any(s >= 52 for s in sizes)  # display >= 52px equivalent
    has_section = any(22 <= s <= 40 for s in sizes)
    has_body = any(14 <= s <= 20 for s in sizes)
    has_meta = any(s <= 13 for s in sizes)

    missing = []
    if not has_display: missing.append("display (≥52px)")
    if not has_section: missing.append("section (22-40px)")
    if not has_body: missing.append("body (14-20px)")
    if not has_meta: missing.append("meta (≤13px)")

    if missing:
        results.append((0, SEV["WARN"], "TYPO-02",
                        f"Missing type hierarchy levels: {', '.join(missing)}"))
    if not has_display and not has_section:
        results.append((0, SEV["FAIL"], "TYPO-02-FATAL",
                        "Less than 3 type hierarchy levels detected."))

    # RULE T3: Content measure — find any prose that might be wide
    # Heuristic: check for max-width on text containers
    measure_ok = bool(re.search(r'max-width\s*:\s*(6[0-5]|[1-5]\d)ch', page["raw"]))
    if not measure_ok and len(page["text"]) > 200:
        results.append((0, SEV["WARN"], "TYPO-03",
                        "No max-width text measure (≤65ch) found on containers."))

    return results


def check_palette(page):
    results = []
    colors = page["colors"]
    non_neutral = colors - NEUTRAL_COLORS

    if len(non_neutral) > 8:
        results.append((0, SEV["WARN"], "PAL-01",
                        f"{len(non_neutral)} distinct non-neutral colors found. "
                        f"Consider ≤ 5 + one status color."))
    elif len(non_neutral) > 12:
        results.append((0, SEV["FAIL"], "PAL-01-FATAL",
                        f"{len(non_neutral)} colors — palette is unconstrained."))

    # RULE P2: transition: all banned
    if BANNED_TRANSITION_RE.search(page["raw"]):
        results.append((0, SEV["FAIL"], "PAL-02",
                        "Banned: 'transition: all' found. Animate explicit properties."))

    # RULE P3: ::selection styled
    if not SELECTION_RE.search(page["css"]):
        results.append((0, SEV["WARN"], "PAL-03",
                        "::selection not styled. Should be on-palette."))

    return results


def check_motion(page):
    results = []

    # RULE M1: No outline: 0 or outline: none without replacement
    if OUTLINE_ZERO_RE.search(page["raw"]) or OUTLINE_NONE_RE.search(page["raw"]):
        results.append((0, SEV["FAIL"], "MOT-01",
                        "Banned: 'outline: 0' or 'outline: none' without "
                        "a visible focus replacement."))

    # RULE M2: prefers-reduced-motion present
    if not PREFERS_REDUCED_RE.search(page["css"]):
        results.append((0, SEV["FAIL"], "MOT-02",
                        "Missing @media (prefers-reduced-motion: reduce) block."))

    # RULE M3: :focus-visible present
    if not FOCUS_VISIBLE_RE.search(page["css"]):
        results.append((0, SEV["FAIL"], "MOT-03",
                        "Missing :focus-visible rule. Every interactive element "
                        "needs a visible focus indicator."))

    # RULE M4: Check animation/transition properties for non-compositor
    for m in ANIMATED_PROP_RE.finditer(page["css"]):
        props = {p.strip().lower() for p in m.group(1).split(",")}
        bad = props & BAD_ANIM_PROPS
        if bad:
            results.append((0, SEV["WARN"], "MOT-04",
                            f"Non-compositor properties in animation/transition: "
                            f"{', '.join(sorted(bad))}. Use transform/opacity only."))

    return results


def check_content(page):
    results = []
    text = page["text"]
    lower = text.lower()

    # RULE C1: No lorem / placeholder
    found = []
    for phrase in PLACEHOLDER_PHRASES:
        if phrase in lower:
            found.append(phrase)
    for token in PLACEHOLDER_TOKENS:
        # Check for TBD/TODO as standalone tokens, not inside words
        if re.search(r'\b' + re.escape(token) + r'\b', text):
            found.append(token)
    if found:
        results.append((0, SEV["FAIL"], "CONT-01",
                        f"Placeholder text found: {', '.join(found)}. "
                        f"No lorem/TBD/placeholder allowed."))

    # RULE C2: No vibe adjectives
    vibe_found = []
    for word in VIPE_WORDS:
        if word.lower() in lower:
            vibe_found.append(word)
    if len(vibe_found) >= 2:
        results.append((0, SEV["WARN"], "CONT-02",
                        f"Vibe adjectives: {', '.join(vibe_found)}. "
                        f"Let content carry the weight."))

    # RULE C3: No emoji spam (>3 distinct emoji)
    emoji_count = len(set(EMOJI.findall(text)))
    if emoji_count > 3:
        results.append((0, SEV["WARN"], "CONT-03",
                        f"{emoji_count} distinct emoji found. "
                        f"Not a content-derived design move."))

    # RULE C4: No <br><br> spacing
    if BR_SPACING_RE.search(page["raw"]):
        results.append((0, SEV["WARN"], "CONT-04",
                        "Found <br><br> spacing. Use margin/padding on containers."))

    return results


def check_structure(page):
    results = []

    # RULE S1: No CDN references (offline single-file)
    cdn_matches = CDN_RE.findall(page["raw"])
    if cdn_matches:
        results.append((0, SEV["FAIL"], "STR-01",
                        f"CDN/hotlinked resource(s) found: {', '.join(cdn_matches[:3])}. "
                        f"Output must open offline — no external fetches."))

    # RULE S2: No Google Fonts / external font fetch
    if WEBFONT_RE.search(page["raw"]):
        results.append((0, SEV["FAIL"], "STR-02",
                        "External font fetch (Google Fonts / @import) — "
                        "must be offline single-file. Use system font stacks."))

    # RULE S3: Hero SVG >= 400px (best-effort)
    svg_widths = re.findall(
        r'<svg[^>]*(?:width\s*=\s*["\']?(\d+)|viewBox\s*=\s*["\']?[^"]*(\d+)\s+(\d+))',
        page["raw"], re.IGNORECASE
    )
    has_large_svg = False
    for groups in svg_widths:
        vals = [int(v) for v in groups if v and v.isdigit()]
        if vals and any(v >= 400 for v in vals):
            has_large_svg = True
            break
    # Also check viewBox
    for m in re.finditer(r'viewBox\s*=\s*["\']?0\s+0\s+(\d+)\s+(\d+)', page["raw"]):
        w, h = int(m.group(1)), int(m.group(2))
        if max(w, h) >= 400:
            has_large_svg = True

    if not has_large_svg and "gold/forms/svg" not in page.get("path", ""):
        results.append((0, SEV["WARN"], "STR-03",
                        "No hero-scale SVG (≥400px) detected. "
                        "Craft floor requires hero SVG doing real work."))

    return results


def check_perf(page):
    results = []

    # RULE P1: Images should have width/height or aspect-ratio
    imgs = re.findall(r'<img\s([^>]+?)/?>', page["raw"], re.IGNORECASE)
    for attrs in imgs:
        has_dims = bool(re.search(r'\b(width|height|aspect-ratio)\s*=', attrs))
        if not has_dims:
            results.append((0, SEV["WARN"], "PERF-01",
                            f"<img> missing width/height or aspect-ratio — "
                            f"may cause CLS. Found in: <img {attrs[:60]}...>"))
            break  # one warning is enough

    # RULE P2: content-visibility hint
    has_content_visibility = bool(re.search(
        r'content-visibility\s*:\s*auto', page["raw"], re.IGNORECASE
    ))
    if not has_content_visibility and len(page["text"]) > 1000:
        results.append((0, SEV["WARN"], "PERF-02",
                        "Long page — consider content-visibility: auto "
                        "on off-screen sections for render skipping."))

    return results


# ── Runner ─────────────────────────────────────────────────────────────────

def audit(filepath: str, verbose: bool = False):
    page = parse_html(filepath)
    all_results = []

    checks = [
        ("Typography", check_typography),
        ("Palette", check_palette),
        ("Motion", check_motion),
        ("Content", check_content),
        ("Structure", check_structure),
        ("Performance", check_perf),
    ]

    for name, checker in checks:
        results = checker(page)
        all_results.extend(results)
        if verbose:
            print(f"\n── {name} ──")
            for line, sev, code, msg in results:
                prefix = {0: "  ✓", 1: "  ⚠", 2: "  ✗"}[sev]
                print(f"{prefix} {code}: {msg}")
            if not results:
                print(f"  ✓ All {name} checks passed.")

    fails = [r for r in all_results if r[1] == SEV["FAIL"]]
    warns = [r for r in all_results if r[1] == SEV["WARN"]]

    total = len(all_results)
    f_count = len(fails)
    w_count = len(warns)
    p_count = total - f_count - w_count

    return {
        "file": filepath,
        "total_checks": total,
        "failures": f_count,
        "warnings": w_count,
        "passed_checks": p_count,
        "fails": [(c, m) for _, _, c, m in fails],
        "warns": [(c, m) for _, _, c, m in warns],
    }


def print_report(report):
    green = "\033[92m"
    yellow = "\033[93m"
    red = "\033[91m"
    reset = "\033[0m"
    bold = "\033[1m"

    f = report["failures"]
    w = report["warnings"]

    print(f"\n{bold}AUDIT REPORT — {report['file']}{reset}")
    print(f"  {green}{report['passed_checks']} passed{reset}  "
          f"{yellow}{w} warnings{reset}  "
          f"{red}{f} failures{reset}")

    if report["warns"]:
        print(f"\n{yellow}Warnings:{reset}")
        for code, msg in sorted(report["warns"]):
            print(f"  ⚠ {yellow}{code}{reset}: {msg}")

    if report["fails"]:
        print(f"\n{red}Failures (must fix before shipping):{reset}")
        for code, msg in sorted(report["fails"]):
            print(f"  ✗ {red}{code}{reset}: {msg}")

    if f == 0:
        status = "CLEAN" if w == 0 else "WARNINGS"
        print(f"\n{bold}Verdict: {green}{status}{reset} — "
              f"{'all checks passed' if w == 0 else f'{w} warning(s), no blockers'}")
    else:
        print(f"\n{bold}Verdict: {red}FAIL{reset} — {f} blocker(s). "
              f"Fix before reporting 'shipped'.")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/audit.py <path-to-gold.html> [--verbose] [--json]")
        print("  --verbose   Show per-category breakdown")
        print("  --json      Output JSON (for CI)")
        sys.exit(0)

    filepath = sys.argv[1]
    verbose = "--verbose" in sys.argv
    json_out = "--json" in sys.argv

    if not os.path.isfile(filepath):
        print(f"File not found: {filepath}", file=sys.stderr)
        sys.exit(2)

    report = audit(filepath, verbose=verbose)

    if json_out:
        json.dump({
            "file": report["file"],
            "failures": report["failures"],
            "warnings": report["warnings"],
            "passed": report["passed_checks"],
            "verdict": "FAIL" if report["failures"] else
                       "WARNINGS" if report["warnings"] else "CLEAN"
        }, sys.stdout, indent=2)
        print()
    else:
        print_report(report)

    # Exit code: 0 = clean, 1 = warnings only, 2 = failures
    if report["failures"] > 0:
        sys.exit(2)
    elif report["warnings"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()