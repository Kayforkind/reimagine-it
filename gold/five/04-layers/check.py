"""Fail if pkg_b imports pkg_a.internal. Pass when it uses pkg_a.public."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORE = ROOT / "pkg_b" / "core.py"


def main() -> int:
    src = CORE.read_text(encoding="utf-8")
    if "pkg_a.internal" in src:
        sys.stderr.write("FAIL: pkg_b/core.py imports pkg_a.internal\n")
        return 1
    if "pkg_a.public" not in src:
        sys.stderr.write("FAIL: pkg_b/core.py does not use pkg_a.public\n")
        return 1
    sys.stdout.write("OK: layer law held\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
