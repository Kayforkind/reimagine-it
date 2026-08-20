"""CLI after: same verdict, --stdin allowed. Empty stdin still fails."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main(argv: list[str]) -> int:
    args = argv[1:]
    if args == ["--stdin"]:
        data = sys.stdin.read()
        if not data.strip():
            sys.stderr.write("empty stdin\n")
            return 1
        sys.stdout.write(json.dumps({"stdin": True, "bytes": len(data)}) + "\n")
        return 0
    if len(args) == 1 and not args[0].startswith("-"):
        path = Path(args[0])
        if not path.is_file():
            sys.stderr.write(f"not a file: {path}\n")
            return 1
        text = path.read_text(encoding="utf-8")
        sys.stdout.write(json.dumps({"file": str(path), "bytes": len(text)}) + "\n")
        return 0
    sys.stderr.write("usage: after.py FILE | after.py --stdin\n")
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
