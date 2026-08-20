"""CLI before: file path only. A pipe has nowhere to go."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main(argv: list[str]) -> int:
    if len(argv) < 2 or argv[1].startswith("-"):
        sys.stderr.write("usage: before.py FILE\n")
        return 2
    path = Path(argv[1])
    if not path.is_file():
        sys.stderr.write(f"not a file: {path}\n")
        return 1
    text = path.read_text(encoding="utf-8")
    sys.stdout.write(json.dumps({"file": str(path), "bytes": len(text)}) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
