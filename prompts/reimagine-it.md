---
description: >-
  Redesign existing HTML from its own content — webpage, SVG, Three.js,
  simulation, infographic, and other visual directions. Invent a leap they
  did not know to ask for. Not a mood board. The CLI does not ingest PDF or PPTX.
argument-hint: "[webpage|infographic|svg|3js|simulation|auto] [tokens] [open brief]"
---

# /reimagine-it

Locate the available `reimagine-it` skill using its `SKILL.md` path advertised by this host. Read that `SKILL.md` in full, then follow it. Also load `references/notes.md` and `references/forms.md` relative to the skill directory when the skill says to.

User arguments: `$ARGUMENTS`

If the arguments contain `auto` (case-insensitive), run the automatic design loop: inspect context, infer the best form, create up to three distinct candidates, verify them, and ship the strongest artifact without modifying the source unless the user explicitly requests that edit.

Say once: **"Running /reimagine-it."**

Report `REIMAGINED: shipped | partial | blocked`.
