"""Revert every 'Alamo Ledger Co. / San Antonio bindery' brand string in the
gold pages back to Jordan Rivers content. Keep palette, star motif, and
shader retune from theme_texas.py in place.

The point of the gold pack is a same-content-different-design demo: naive
HTML on the left, radically better redesigned page on the right. The USA /
Texas theme applies to the DESIGN (palette, star, sunset shader) not to a
sample brand.

Idempotent. Safe to re-run.
"""
from __future__ import annotations

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

# Longest / most specific patterns first so shorter ones do not clobber
# fragments that the specific pattern was meant to catch.
REVERT = [
    # ---- <title> tags ------------------------------------------------------
    ("Alamo Ledger Co. &mdash; small presses, San Antonio (cinema + glass)",
     "Jordan Rivers &mdash; small machines, out loud (cinema + glass)"),
    ("Alamo Ledger Co. — small presses, San Antonio (cinema + glass)",
     "Jordan Rivers — small machines, out loud (cinema + glass)"),
    ("Alamo Ledger Co. &mdash; small presses, San Antonio",
     "Jordan Rivers &mdash; small machines, out loud"),
    ("Alamo Ledger Co. — small presses, San Antonio",
     "Jordan Rivers — small machines, out loud"),
    ("Alamo Ledger Co. &mdash; /reimagine-it artistic",
     "Jordan Rivers &mdash; /reimagine-it artistic"),
    ("Alamo Ledger Co. &mdash; /reimagine-it photography",
     "Jordan Rivers &mdash; /reimagine-it photography"),
    ("Alamo Ledger Co. — after /reimagine-it",
     "Jordan Rivers — after /reimagine-it"),
    ("alamoledger.us/status &mdash; /reimagine-it webpage dashboard bento",
     "jordan-rivers.dev/status &mdash; /reimagine-it webpage dashboard bento"),
    ("alamoledger.us/status &mdash; /reimagine-it dashboard",
     "jordan-rivers.dev/status &mdash; /reimagine-it dashboard"),
    ("alamoledger.us &mdash; /reimagine-it webpage landing neon",
     "jordan-rivers.dev &mdash; /reimagine-it webpage landing neon"),

    # ---- H1 hero blocks (order matters) ------------------------------------
    # cinematic-glass "Alamo Ledger Co. & the small presses"
    ("Alamo Ledger Co. <em>&amp;</em> the small presses",
     "Jordan Rivers <em>&amp;</em> the small machines"),
    # cinematic "Alamo Ledger & the small presses"
    ("Alamo Ledger <em>&amp;</em> the small presses",
     "Jordan <em>&amp;</em> the small machines"),
    # artistic split-line title
    ('Alamo Ledger <span class="amp">&amp;</span> the small<br>\n    presses <span class="last">of&nbsp;San Antonio</span>',
     'Jordan <span class="amp">&amp;</span> the small<br>\n    machines <span class="last">Rivers</span>'),
    ('Alamo Ledger <span class="amp">&amp;</span> the small<br>',
     'Jordan <span class="amp">&amp;</span> the small<br>'),
    ('presses <span class="last">of&nbsp;San Antonio</span>',
     'machines <span class="last">Rivers</span>'),
    # photography two-line nameplate
    ('Alamo<br><span class="last">Ledger</span>',
     'Jordan<br><span class="last">Rivers</span>'),

    # ---- Kicker / subtitle strings ----------------------------------------
    ("Small presses &middot; San Antonio &middot; since 2011",
     "Small machines &middot; Austin &middot; since 2019"),
    ("Small presses · San Antonio · since 2011",
     "Small machines · Austin · since 2019"),
    ("Piece 03 &mdash; small presses, San Antonio",
     "Piece 03 &mdash; small machines, out loud"),
    ("Piece 03 — small presses, San Antonio",
     "Piece 03 — small machines, out loud"),

    # ---- Landing-neon body copy (bindery -> Jordan's writing bench) --------
    ("alamoledger.us is a hand bindery in San Antonio: ledgers, ranch journals, and deed boxes since 2011. No online orders.",
     "jordan-rivers.dev is a one-person writing bench in Austin. Three small tools \u2014 rift, lantern, quiet-week. Same desk, one small book at a time."),
    ("jordan-rivers.dev is a hand bindery in San Antonio: ledgers, ranch journals, and deed boxes since 2011. No online orders.",
     "jordan-rivers.dev is a one-person writing bench in Austin. Three small tools \u2014 rift, lantern, quiet-week. Same desk, one small book at a time."),
    # Landing-neon H1: "Ship the ledger, ..." -> "Ship the tool, ..."
    ("Ship the <em>ledger</em>, not the pitch.",
     "Ship the <em>tool</em>, not the pitch."),

    # ---- Dashboard headline (bindery vocabulary -> Jordan's) ---------------
    ("Three small presses. One ranch journal. One deed box in flight.",
     "Three small machines. One paper journal. One book in flight."),
    ("Three small presses. One paper journal. One book in flight.",
     "Three small machines. One paper journal. One book in flight."),
    ("Three small presses.", "Three small machines."),

    # ---- Content phrases catch-alls ---------------------------------------
    ("small presses, San Antonio", "small machines, out loud"),
    ("the small presses", "the small machines"),
    ("small presses", "small machines"),

    # ---- Domain / email / handle -------------------------------------------
    ("hello@alamoledger.example", "jordan@example.dev"),
    ("mailto:hello@alamoledger.example", "mailto:jordan@example.dev"),
    ("mail hello@alamoledger.example", "mail jordan@example.dev"),
    ("hello@alamoledger", "jordan@rivers"),
    ("@alamoledger", "@jordan-rivers"),
    ("alamoledger.us/status", "jordan-rivers.dev/status"),
    ("alamoledger.us / status", "jordan-rivers.dev / status"),
    ("alamoledger.us", "jordan-rivers.dev"),

    # ---- Copyright + operator lines ----------------------------------------
    ("&copy; 2026 Alamo Ledger Co. &middot; folio no. 34",
     "&copy; 2026 jordan rivers &middot; folio no. 34"),
    ("&copy; 2026 Alamo Ledger Co. &middot; /status",
     "&copy; 2026 jordan rivers &middot; /status"),
    ("&copy; 2026 Alamo Ledger Co.", "&copy; 2026 jordan rivers"),
    ("&copy; 2026 alamo ledger co.", "&copy; 2026 jordan rivers"),
    ("operator &middot; alamo ledger co.", "operator &middot; jordan rivers"),

    # ---- Photography byline ------------------------------------------------
    ("Words &amp; pictures for Alamo Ledger Co. &middot; set in Didot &amp; Iowan",
     "Words &amp; pictures by jordan rivers &middot; set in Didot &amp; Iowan"),

    # ---- Canonical brand strings (must be after all longer variants) -------
    ("Alamo Ledger Co.", "Jordan Rivers"),
    ("alamo ledger co.", "jordan rivers"),
    ("Alamo LEDGER", "Jordan RIVERS"),
    ("Alamo Ledger", "Jordan Rivers"),
]


def revert(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    body = original
    for old, new in REVERT:
        body = body.replace(old, new)
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
        marker = "reverted" if revert(tgt) else "no-op   "
        print(f"  {marker} {tgt.relative_to(ROOT)}")
        if marker.startswith("reverted"):
            changed += 1
    print(f"\nUnbranded {changed}/{len(TARGETS)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
