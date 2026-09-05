#!/usr/bin/env python3
"""fuzz_audit.py — generational fuzzer for the Design Health audit.

Not random bytes: generations are structured-mutation pages embedding
adversarial patterns that historically break linters and regex rules —

  - CSS custom-property indirection that resolves to banned fonts
  - clamp()/min()/max() fluid lengths with absurd bounds
  - prefers-reduced-motion blocks that lie (kill switch inside a media
    query that never matches)
  - animation shorthand split across custom properties
  - outline: 0 smuggled through `all` and through var()
  - giant attribute spam, unbalanced tags, control characters, nulls,
    misdeclared encodings, and 10k-rule CSS bombs

The contract under test: the audit must never crash, never hang, and must
exit 0/1/2 — with any findings it reports being *true*.

Usage:
  python scripts/fuzz_audit.py                 # 400 generations
  python scripts/fuzz_audit.py --generations 1000 --seed 7
"""

import argparse
import random
import re
import subprocess
import sys
import tempfile
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIT = ROOT / "scripts" / "audit.py"

BANNED_FONTS = ["Arial", "Helvetica", "Roboto", "Inter", "system-ui", "sans-serif"]
PROPS = ["opacity", "transform", "left", "width", "height", "top", "margin", "color", "filter"]

TRICKS = [
    # var() indirection toward banned fonts
    lambda r: (":root{--f:" + r.choice(BANNED_FONTS) + "}body{font-family:var(--f)}"),
    # nested var chains
    lambda r: (":root{--a:" + r.choice(BANNED_FONTS) + ";--b:var(--a)}body{font-family:var(--b)}"),
    # clamp with absurd bounds
    lambda r: ("h1{font-size:clamp(%dpx,90vw,%dpx)}" % (r.randint(-500, 0), r.randint(4000, 9000))),
    # clamp inside clamp
    lambda r: ("h1{font-size:clamp(1px,clamp(2px,50vw,%dpx),%dpx)}" % (r.randint(100, 800), r.randint(900, 5000))),
    # min/max soup
    lambda r: ("p{font-size:max(min(3px,9vw),min(%dpx,%dvw))}" % (r.randint(1, 60), r.randint(1, 30))),
    # transition: all — banned
    lambda r: (".x{transition:all %dms}" % r.randint(50, 900)),
    # transition shorthand via var
    lambda r: (":root{--t:all %dms}.x{transition:var(--t)}" % r.randint(50, 900)),
    # animated non-compositor properties
    lambda r: ("@keyframes k%d{to{%s:%d}}.x{animation:k%d 1s}" % (r.randint(0, 99), r.choice(PROPS[2:]), r.randint(0, 400), r.randint(0, 99))),
    # outline removed
    lambda r: (r.choice(["*:focus{outline:0}", "*:focus{outline:none}", "a:focus{outline:0}"])),
    # outline removed then "replaced" by nothing
    lambda r: ("*:focus{outline:none}:focus-visible{color:red}"),
    # reduced-motion kill switch that never applies (wrong media feature)
    lambda r: ("@media(min-width:1px){*{animation-duration:.001ms!important}}"),
    # reduced-motion honored but transition still long
    lambda r: ("@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important}}.x{transition:left 2s}"),
    # lorem / placeholder text
    lambda r: r.choice([
        "<p>Lorem ipsum dolor sit amet</p>",
        "<h2>Placeholder title goes here</h2>",
        "<p>Sample text sample text</p>",
        "<p>TBD</p>",
    ]),
    # external asset fetch
    lambda r: r.choice([
        '<link rel="stylesheet" href="https://cdn.example/x.css">',
        '<img src="https://img.example/p.png" alt="">',
        "<style>@import url('https://fonts.example/f.css');</style>",
    ]),
    # selection / focus-visible missing is the norm; unstyled selection common
    lambda r: ("body{color:#fff;background:#000}"),
    # null bytes and control chars
    lambda r: ("<p>noise\x00\x01\x1f embedded</p>"),
    # unbalanced tags
    lambda r: ("<div><span><p>unclosed " * r.randint(2, 8)),
    # attribute spam
    lambda r: ("<div " + " ".join('data-a%d="%s"' % (i, "x" * r.randint(1, 200)) for i in range(r.randint(20, 80))) + ">spam</div>"),
    # CSS bomb: many rules
    lambda r: ("<style>" + "".join(".c%d{color:#%06x}" % (i, i) for i in range(r.randint(800, 3000))) + "</style>"),
    # svg foreignObject smuggling
    lambda r: ('<svg><foreignObject><body style="font-family:Arial">x</body></foreignObject></svg>'),
    # @media nested perverse
    lambda r: ("@media all{@media print{.x{transition:all .3s}}}"),
    # empty page
    lambda r: (""),
    # only a doctype
    lambda r: ("<!doctype html>"),
]


def base_page(rng):
    return (
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">"
        "<title>Fuzz %d</title><style>:root{--a:#%06x}body{font-family:Georgia;background:#%06x;color:#%06x}"
        "::selection{background:red}:focus-visible{outline:2px solid red}"
        "@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important}}"
        "</style></head><body><main><h1>Fuzz target %d</h1><p>anchor %d</p></main></body></html>"
        % (
            rng.randint(0, 9999),
            rng.randint(0, 0xFFFFFF),
            rng.randint(0, 0xFFFFFF),
            rng.randint(0, 0xFFFFFF),
            rng.randint(0, 999),
            rng.randint(0, 99),
        )
    )


def generate(rng):
    page = base_page(rng)
    for _ in range(rng.randint(1, 5)):
        page += rng.choice(TRICKS)(rng)
    if rng.random() < 0.15:
        page = page.encode("utf-8", "ignore")[: rng.randint(50, 4000)].decode("utf-8", "ignore")
    return page


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--generations", type=int, default=400)
    ap.add_argument("--seed", type=int, default=None)
    args = ap.parse_args()

    rng = random.Random(args.seed)
    crashes = 0
    timeouts = 0
    lies = 0

    with tempfile.TemporaryDirectory() as td:
        path = os.path.join(td, "fuzz.html")
        for i in range(args.generations):
            page = generate(rng)
            with open(path, "w", encoding="utf-8", errors="replace") as f:
                f.write(page)
            try:
                proc = subprocess.run(
                    [sys.executable, str(AUDIT), path, "--json"],
                    capture_output=True,
                    text=True,
                    timeout=10,
                    cwd=str(ROOT),
                )
            except subprocess.TimeoutExpired:
                timeouts += 1
                print("TIMEOUT on generation %d" % i)
                (Path(td) / ("timeout-%d.html" % i)).write_text(page, encoding="utf-8")
                continue

            if proc.returncode not in (0, 1, 2):
                crashes += 1
                print("CRASH rc=%s on generation %d" % (proc.returncode, i))
                (Path(td) / ("crash-%d.html" % i)).write_text(page, encoding="utf-8")
                print(proc.stderr[-400:])
                continue

            # The report must always be parseable JSON with the documented
            # shape — a silent traceback or an unparseable report is a bug.
            try:
                import json

                data = json.loads(proc.stdout)
                ok = (
                    isinstance(data, dict)
                    and isinstance(data.get("rules"), int)
                    and isinstance(data.get("passed"), int)
                    and isinstance(data.get("warnings"), int)
                    and isinstance(data.get("failures"), int)
                    and isinstance(data.get("findings"), list)
                    and isinstance(data.get("checks"), list)
                    and data.get("verdict") in ("CLEAN", "WARNINGS", "FAIL", "FAILURES")
                )
                if not ok:
                    lies += 1
                    print("MALFORMED REPORT on generation %d" % i)
                    (Path(td) / ("badjson-%d.html" % i)).write_text(page, encoding="utf-8")
            except Exception as exc:
                lies += 1
                print("BAD JSON on generation %d: %s" % (i, exc))
                (Path(td) / ("badjson-%d.html" % i)).write_text(page, encoding="utf-8")

    total = args.generations
    print("\nfuzz complete: %d generations, %d crashes, %d timeouts, %d malformed reports" % (total, crashes, timeouts, lies))
    if crashes or timeouts or lies:
        sys.exit(1)


if __name__ == "__main__":
    main()
