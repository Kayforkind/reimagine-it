---
name: reimagine-it-variations
description: >-
  Generate several distinct design directions from one HTML source plus a
  contrast sheet that shows every direction side by side. Use when the user
  says /reimagine-it variations, "show me options", "give me three takes",
  "which direction works best", or wants to compare design directions before
  choosing one. CLI: npx reimagine-it variations -i page.html -n 4 -o review/.
  Part of the reimagine-it Content-Derived Design suite.
license: MIT
metadata:
  author: Kayforkind
  version: "2.8.0"
  parent: reimagine-it
  hosts:
    - claude-code
    - cursor
    - codex
    - copilot
    - gemini-cli
keywords:
  - design-variations
  - design-exploration
  - contrast-sheet
  - direction-review
  - content-derived-design
category: Design
capabilities:
  - multi-direction-generation
  - contrast-sheet-review
  - seeded-reproduction
trigger_phrases:
  - /reimagine-it variations
  - show me design options
  - give me three takes
  - compare design directions
  - which direction works best
---

# /reimagine-it variations

**Parent:** [../SKILL.md](../SKILL.md) — the full Content-Derived Design engine. This sub-skill handles only multi-direction exploration.

Generates 2–8 distinct directions from one source plus an `index.html`
contrast sheet that lays them out side by side with per-direction quality,
fidelity, and voice. One seed reproduces the whole set.

## Usage

```bash
npx reimagine-it variations -i page.html -n 4 -o review/
npx reimagine-it variations -i page.html -n 4 --seed 42 -o review/   # reproducible
npx reimagine-it variations -i page.html -n 4 --ref house.lock.json  # on-brand
```

Output per run:

| File | What it is |
|------|-----------|
| `variation-1-<token>.html` … | One standalone page per direction |
| `index.html` | Contrast sheet: all directions side by side |
| `variations.json` | Ranked report: token, seed, voice, fit, quality, fidelity |

## Procedure

1. Run with `-n 3` unless the user asked for a different count.
2. Read `variations.json` back to the user: rank, token, quality, fidelity.
3. Name the *structural* difference between the top two — not just the colors.
4. Print the seed and tell the user how to reproduce the set.
5. Once a direction is chosen, generate it standalone with
   `npx reimagine-it -i page.html -t <token> --seed <seed>`.

## Must not

- Present variations as options when fidelity is below 80% for any of them
- Describe two variations as different if they share a silhouette
- Lose the seed — the set is only reviewable if it is reproducible
- Skip the contrast sheet; side-by-side comparison is the point

Part of [reimagine-it](https://github.com/Kayforkind/reimagine-it) — MIT.
