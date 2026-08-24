#!/usr/bin/env python3
"""Sync visual proof assets required by docs/index.html into docs/."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ASSETS = (
    "gold/webpage/quartet.png",
    "gold/webpage/compare.png",
    "gold/domains/strip.png",
    "gold/jules/before.png",
    "examples/end-users/gallery.gif",
)

for relative in ASSETS:
    source = ROOT / relative
    destination = DOCS / relative
    if not source.is_file():
        raise SystemExit(f"missing source asset: {relative}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not destination.exists() or source.read_bytes() != destination.read_bytes():
        shutil.copyfile(source, destination)
        print(f"copied {relative} -> {destination.relative_to(ROOT)}")

print(f"verified {len(ASSETS)} Pages assets")
