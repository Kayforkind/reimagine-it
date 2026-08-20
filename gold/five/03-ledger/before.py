"""Ledger before: dump the log."""

from __future__ import annotations

import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data.jsonl"


def main() -> int:
    sys.stdout.write(DATA.read_text(encoding="utf-8"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
