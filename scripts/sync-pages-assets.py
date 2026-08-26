#!/usr/bin/env python3
"""Sync visual proof assets required by docs/index.html into docs/.

The docs page renders examples from the `examples/end-users/` tree: each
case's before-after GIF, its desktop/phone screenshots, and its source HTML.
Copy every referenced asset so the publish tree never serves stale visuals.
"""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

# Static proof assets referenced directly by docs/index.html.
ASSETS = (
    "gold/webpage/quartet.png",
    "gold/webpage/compare.png",
    "gold/domains/strip.png",
    "gold/jules/before.png",
    "examples/end-users/gallery.webp",
    "examples/end-users/meridian/3js-desktop.webp",
    "examples/end-users/meridian/svg-desktop.webp",
)

# Per-case assets: every end-user example contributes its static before/after
# WebP, source HTML, and desktop/phone screenshots of the auto output.
CASES = ("venator", "crimson-circuit", "velocita", "maracuya", "flick", "meridian", "horizon")
CASE_FILES = ("before-after.webp", "source.html", "auto-desktop.png", "auto-phone.png")


def copy_if_changed(source: Path, destination: Path) -> bool:
    if not source.is_file():
        return False
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not destination.exists() or source.read_bytes() != destination.read_bytes():
        shutil.copyfile(source, destination)
        print(f"copied {source.relative_to(ROOT)} -> {destination.relative_to(ROOT)}")
        return True
    return False


def main() -> int:
    copied = 0
    for relative in ASSETS:
        if copy_if_changed(ROOT / relative, DOCS / relative):
            copied += 1
    for case in CASES:
        for filename in CASE_FILES:
            relative = Path("examples") / "end-users" / case / filename
            if copy_if_changed(ROOT / relative, DOCS / relative):
                copied += 1
    print(f"verified Pages assets ({copied} updated)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
