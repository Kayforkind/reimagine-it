---
name: reimagine-it-generate
description: >-
  Generate one Content-Derived Design direction from an HTML source, or let
  Auto choose the strongest direction. Use when the user says /reimagine-it
  generate, "redesign this page", "make it a landing page", "turn this into
  an infographic", names a token (webpage, infographic, svg, 3js, simulation,
  artistic, cinematic, dashboard, photography, landing), or wants a
  content-aware redesign instead of a mood board. CLI: npx reimagine-it --auto
  -i page.html -o out.html. Part of the reimagine-it Content-Derived Design suite.
license: MIT
metadata:
  author: Kayforkind
  version: "2.9.0"
  parent: reimagine-it
  hosts:
    - claude-code
    - cursor
    - codex
    - copilot
    - gemini-cli
keywords:
  - redesign
  - landing-page
  - infographic
  - design-generation
  - content-derived-design
  - html
category: Design
capabilities:
  - content-derived-redesign
  - auto-direction-choice
  - seeded-variation
  - brand-locking
trigger_phrases:
  - /reimagine-it
  - redesign this page
  - reimagine it
  - make it a landing page
  - turn this into an infographic
  - generate a design from this HTML
---

# /reimagine-it generate

**Parent:** [../SKILL.md](../SKILL.md) — the full Content-Derived Design engine. This sub-skill handles only generation of a redesigned page.

The source file is the brief. The engine reads headings, facts, names, dates,
numbers, links, emails, and hex colors already in the HTML, derives a palette
and motif from them, and writes a stronger standalone page. Source facts are
not invented; only the composition changes.

## Usage

```bash
# Let Auto choose, generate, verify, and explain (recommended first call)
npx reimagine-it --auto -i page.html -o redesign.html

# Pick a direction
npx reimagine-it -i page.html -t infographic -o poster.html

# Pin a creative variation
npx reimagine-it -i page.html -t landing --seed 42 -o landing.html

# Review three verified directions plus a contrast sheet
npx reimagine-it variations -i page.html -n 3 -o review/

# Keep an existing brand: lock, then reuse
npx reimagine-it lock -i house-style.html -o house.lock.json
npx reimagine-it -i page.html --ref house.lock.json -t landing -o on-brand.html
```

## The 17 tokens

webpage · infographic · svg · 3js · simulation · artistic · cinematic ·
dashboard · photography · landing · editorial · gradient · showcase · motion ·
glass · lookbook (photoshoots/collections) · particles (living networks)

`npx reimagine-it --list` describes each. **Auto** scores every lane against
the content and forbids the same silhouette twice.

## Procedure

1. Run Auto first (`--auto`). Read the printed rationale — it names why the
   direction fits the content.
2. Check the fidelity line: the engine reports the percentage of detected
   source facts preserved. It must be ≥ 80%.
3. Offer `variations` when the user wants choice; offer `--ref` when they
   want an existing brand honored.
4. If the user names a token, run it directly — Auto is a default, not a gate.

## Must not

- Invent facts, statistics, or quotes not in the source
- Override the derived palette with generic colors (ban Inter/Roboto is the
  *only* taste rule; content decides the rest)
- Ship without the fidelity check passing
- Skip verification when the output replaces a real page (run `audit`)

Part of [reimagine-it](https://github.com/Kayforkind/reimagine-it) — MIT.
