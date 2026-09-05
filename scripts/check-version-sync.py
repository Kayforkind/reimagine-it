#!/usr/bin/env python3
"""One version everywhere — README and the docs site can never drift from npm.

Surfaces checked:
  package.json                 .version                 (the truth)
  */plugin.json, marketplace   .version / .pluginVersion
  extension/manifest.json      .version
  skills/*/SKILL.md            frontmatter version:
  README.md                    badge and "current release" mentions
  docs/index.html              the ver-chip (vX.Y.Z) and the footer chip

Run:  python scripts/check-version-sync.py
CI:   docs-drift job in audit.yml fails the protected build on drift.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

problems = []


def read(p):
    return Path(p).read_text(encoding="utf-8")


# ── the truth ────────────────────────────────────────────────────────────
pkg = json.loads(read(ROOT / "package.json"))
version = pkg.get("version", "")
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    problems.append(f"package.json version is not x.y.z: {version!r}")
    sys.exit(1)

# ── plugin / extension manifests ─────────────────────────────────────────
manifests = [
    ROOT / ".claude-plugin" / "plugin.json",
    ROOT / ".codex-plugin" / "plugin.json",
    ROOT / ".factory-plugin" / "plugin.json",
    ROOT / ".cursor-plugin" / "plugin.json",
    ROOT / ".cursor-plugin" / "marketplace.json",
    ROOT / "extension" / "manifest.json",
]
for m in manifests:
    if not m.exists():
        problems.append(f"missing manifest: {m.relative_to(ROOT)}")
        continue
    data = json.loads(read(m))
    found = data.get("version") or data.get("pluginVersion")
    meta = data.get("metadata") or {}
    found = found or meta.get("version")
    for plugin in data.get("plugins", []) or []:
        found = found or plugin.get("version") or plugin.get("pluginVersion")
    if found != version:
        problems.append(f"{m.relative_to(ROOT)}: {found!r} != {version}")
    # Stale token-count copy in manifests (client-facing descriptions).
    blob = json.dumps(data)
    if re.search(r"\b(15|fifteen) (visual )?(design )?(directions|tokens|builders)\b", blob, re.I):
        problems.append(f"{m.relative_to(ROOT)}: description still says 15 directions")

# ── skill frontmatter ────────────────────────────────────────────────────
for skill in sorted((ROOT / "skills" / "reimagine-it").glob("*/SKILL.md")) + [
    ROOT / "skills" / "reimagine-it" / "SKILL.md"
]:
    if not skill.exists():
        continue
    text = read(skill)
    front = re.match(r"^---\n(.*?)\n---", text, re.S)
    if not front:
        problems.append(f"{skill.relative_to(ROOT)}: no frontmatter")
        continue
    m = re.search(r'^\s*version:\s*"?([^"\n]+)"?', front.group(1), re.M)
    if not m:
        problems.append(f"{skill.relative_to(ROOT)}: no version in frontmatter")
    elif m.group(1).strip() != version:
        problems.append(f"{skill.relative_to(ROOT)}: {m.group(1).strip()} != {version}")

# ── README ───────────────────────────────────────────────────────────────
readme = read(ROOT / "README.md")
badge = re.search(r"badge/version-([\d.]+)", readme)
if not badge:
    problems.append("README.md: no version badge found")
elif badge.group(1) != version:
    problems.append(f"README badge: {badge.group(1)} != {version}")
for m in re.finditer(r"current release \*\*([\d.]+)\*\*", readme):
    if m.group(1) != version:
        problems.append(f"README 'current release': {m.group(1)} != {version}")

# ── docs site ────────────────────────────────────────────────────────────
site = read(ROOT / "docs" / "index.html")
chips = re.findall(r"v(\d+\.\d+\.\d+)", site)
if not chips:
    problems.append("docs/index.html: no vX.Y.Z version chip found")
for chip in sorted(set(chips)):
    if chip != version:
        problems.append(f"docs/index.html chip: {chip} != {version}")

# ── live surfaces must state the true token count ───────────────────────
STALE_TOKENS = re.compile(r"\b(15|fifteen) (design )?(directions|tokens|builders)\b", re.I)
for surface in [
    ROOT / "README.md",
    ROOT / "docs" / "index.html",
    ROOT / "docs" / "llms.txt",
    ROOT / "AGENTS.md",
]:
    if surface.exists() and STALE_TOKENS.search(read(surface)):
        problems.append(f"{surface.relative_to(ROOT)}: still claims 15 directions (truth: package roster)")

if problems:
    print(f"FAIL: version drift against package.json {version}:")
    for p in problems:
        print("  -", p)
    print("\nFix: bump every surface (sed the release tag) or run the release sweep.")
    sys.exit(1)

print(f"OK — one version everywhere: {version}")
