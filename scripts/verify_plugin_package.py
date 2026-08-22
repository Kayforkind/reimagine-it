"""Fail if host plugin manifests disagree on name or version."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFESTS = [
    ROOT / ".claude-plugin" / "plugin.json",
    ROOT / ".codex-plugin" / "plugin.json",
    ROOT / ".factory-plugin" / "plugin.json",
]


def main() -> int:
    payloads: list[tuple[Path, dict]] = []
    for path in MANIFESTS:
        if not path.is_file():
            print(f"missing {path.relative_to(ROOT)}", file=sys.stderr)
            return 1
        payloads.append((path, json.loads(path.read_text(encoding="utf-8"))))

    names = {data["name"] for _, data in payloads}
    versions = {data["version"] for _, data in payloads}
    if len(names) != 1 or len(versions) != 1:
        for path, data in payloads:
            print(f"{path.relative_to(ROOT)}  name={data.get('name')}  version={data.get('version')}")
        print("plugin manifests must share name and version", file=sys.stderr)
        return 1

    name, version = names.pop(), versions.pop()
    print(f"ok  {name}@{version}  ({len(payloads)} manifests)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
