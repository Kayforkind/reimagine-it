"""Fail if published version strings disagree.

The product claim is one version. Plugin manifests, the npm package, the
browser extension, the skill frontmatter, and the marketplace metadata must
all say the same number or a contributor shipped a conflict.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PLUGIN_JSON = [
    ROOT / ".claude-plugin" / "plugin.json",
    ROOT / ".codex-plugin" / "plugin.json",
    ROOT / ".factory-plugin" / "plugin.json",
    ROOT / ".cursor-plugin" / "plugin.json",
]

FRONTMATTER_VERSION = re.compile(r'^\s*version:\s*"([^"]+)"\s*$', re.M)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def frontmatter_version(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"no YAML frontmatter in {path.relative_to(ROOT)}")
    end = text.find("\n---", 3)
    block = text[: end if end != -1 else 1200]
    match = FRONTMATTER_VERSION.search(block)
    if not match:
        raise ValueError(f"no version frontmatter in {path.relative_to(ROOT)}")
    return match.group(1)


def main() -> int:
    errors: list[str] = []
    package = read_json(ROOT / "package.json")
    expected = package["version"]

    found: list[tuple[str, str]] = [("package.json", expected)]

    for path in PLUGIN_JSON:
        if not path.is_file():
            errors.append(f"missing {path.relative_to(ROOT)}")
            continue
        version = read_json(path)["version"]
        found.append((str(path.relative_to(ROOT)), version))

    marketplace = ROOT / ".cursor-plugin" / "marketplace.json"
    if marketplace.is_file():
        found.append(
            (
                str(marketplace.relative_to(ROOT)),
                read_json(marketplace)["metadata"]["version"],
            )
        )
    else:
        errors.append("missing .cursor-plugin/marketplace.json")

    extension = ROOT / "extension" / "manifest.json"
    if extension.is_file():
        found.append((str(extension.relative_to(ROOT)), read_json(extension)["version"]))
    else:
        errors.append("missing extension/manifest.json")

    skill_files = [
        ROOT / "skills" / "reimagine-it" / "SKILL.md",
        ROOT / "skills" / "reimagine-it" / "audit" / "SKILL.md",
        ROOT / "skills" / "reimagine-it" / "lock" / "SKILL.md",
        ROOT / "skills" / "reimagine-it" / "infographic" / "SKILL.md",
    ]
    for path in skill_files:
        if not path.is_file():
            errors.append(f"missing {path.relative_to(ROOT)}")
            continue
        try:
            found.append((str(path.relative_to(ROOT)), frontmatter_version(path)))
        except ValueError as error:
            errors.append(str(error))

    drifted = [(label, version) for label, version in found if version != expected]
    if drifted:
        errors.append(f"expected version {expected} (package.json)")
        for label, version in drifted:
            errors.append(f"  {label}  version={version}")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1

    print(f"ok  reimagine-it@{expected}  ({len(found)} version pins agree)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
