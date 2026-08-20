"""First-run after: fail until the Tuesday handle exists, then the same check goes green."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOOR = ROOT / "door.txt"
EXAMPLE = ROOT / "door.example"


def main() -> int:
    if not DOOR.is_file():
        sys.stderr.write(
            f"broken: copy {EXAMPLE.name} to {DOOR.name} then re-run\n"
        )
        sys.stdout.write("FAIL\n")
        return 1
    text = DOOR.read_text(encoding="utf-8").strip()
    if text != "open":
        sys.stderr.write("broken: door.txt must contain exactly: open\n")
        sys.stdout.write("FAIL\n")
        return 1
    sys.stdout.write("OK\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
