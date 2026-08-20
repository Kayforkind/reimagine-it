"""First-run before: a lecture. No door."""

from __future__ import annotations

import sys


def main() -> int:
    sys.stdout.write(
        "Welcome to Local MCP.\n"
        "Please read the architecture notes, then the security notes, then ask Slack.\n"
    )
    sys.stderr.write("first-run: no command to copy. exit 1\n")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
