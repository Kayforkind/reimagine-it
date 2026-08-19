"""Reverse demo of /awe-me: a brainstorm fails; the same context ships."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CTX = ROOT / "context.txt"
SHIPPED = ROOT / "shipped.json"

FAIL_LIST = """- make it more cinematic
- wow-factor infographic
- maybe a Three.js thing
- inspiring onboarding vibes
- surprise them somehow
"""


def fail() -> int:
    sys.stderr.write("AWE: blocked — a list of vibes is not an artifact\n")
    sys.stdout.write(FAIL_LIST)
    return 1


def ship() -> int:
    lock = CTX.read_text(encoding="utf-8").strip().splitlines()[0]
    report = {
        "awe": "shipped",
        "mode": "awe-me",
        "about": lock,
        "hero": "gold/awe.py --ship",
        "stretch": "npx skills add kazimrmerchant/skill-slice --skill awe-me",
        "verified": "this command exits 0; gold/awe.py --fail exits 1",
    }
    SHIPPED.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    sys.stdout.write(json.dumps(report, indent=2) + "\n")
    return 0


def main(argv: list[str]) -> int:
    args = argv[1:]
    if args in ([], ["--fail"]):
        return fail()
    if args == ["--ship"]:
        return ship()
    sys.stderr.write("usage: python gold/awe.py [--fail | --ship]\n")
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
