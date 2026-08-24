---
name: reimagine-it-lock
description: >-
  Design DNA capture — extracts palette, type stack, motifs, motion, and 3D
  signatures from a shipped HTML file and saves them as a reusable reference pack.
  Use when the user says /reimagine-it lock, "lock this design", "save design DNA",
  "capture this look", or wants to reuse a shipped design on a different target.
  Locks include a cross-medium translation table for moving between webpage, slides,
  PDF, and infographic. Part of the reimagine-it Content-Derived Design suite.
license: MIT
metadata:
  author: Kayforkind
  version: "2.3.0"
  parent: reimagine-it
  hosts:
    - claude-code
    - cursor
    - codex
    - copilot
    - gemini-cli
keywords:
  - lock
  - design-dna
  - palette-capture
  - design-system
  - reusable-design
  - style-extraction
  - content-derived-design
category: Design
capabilities:
  - palette-extraction
  - type-stack-capture
  - motif-extraction
  - motion-signature-capture
  - design-reuse
trigger_phrases:
  - /reimagine-it lock
  - lock this design
  - save design DNA
  - capture this look
  - reuse this design
  - extract palette
  - lock and reuse
---

# /reimagine-it lock

**Parent:** [../SKILL.md](../SKILL.md) — the full Content-Derived Design engine. This sub-skill handles design DNA capture and reuse.

Captures a shipped design's full identity into a portable markdown pack so it can be reused on any source file:

```
/reimagine-it lock gold/domains/cinematic/after.html as house-cinema
/reimagine-it lock gold/pulsewave/after.html as tech-wave
```

## What gets captured

| Category | What | Example |
|----------|------|---------|
| **Palette** | Ground, accent, support colors with hex values | `#08141a` ground, `#3ae098` accent |
| **Type stack** | Display family, body family, fallbacks | `Iowan Old Style`, `Georgia`, `serif` |
| **Motifs** | Repeating visual patterns | Pulse wave, heartbeat ring |
| **Motion** | Animation budget, keyframe durations | `alive-micro`, 2–4 loops |
| **3D signature** | 3D approach for the medium | `matcap-hero`, `card-fan` |
| **Section structure** | Page anatomy grid | Hero → Cards → Footer |

## Cross-medium translation

Locks include a translation table so a webpage lock can inform a slides deck or a PDF:

```
/reimagine-it webpage --ref house-cinema  # webpage in that style
/reimagine-it slides  --ref house-cinema  # slide deck in that style
/reimagine-it pdf     --ref house-cinema  # PDF in that style
```

## Procedure

1. Read the target file (HTML with inline CSS).
2. Extract palette: scan `:root { }` block and all `var(--*)` usage for hex values.
3. Extract type stack: scan `font-family` declarations; capture display, body, fallbacks.
4. Extract motifs: scan SVG `<pattern>`, `<linearGradient>`, keyframe `@keyframes` names.
5. Extract motion: count `@keyframes` blocks, note durations, check `prefers-reduced-motion`.
6. Extract 3D: scan for `perspective`, `rotateX`, `rotateY`, `translateZ`.
7. Extract section structure: scan semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`).
8. Write the pack to `references/locks/<name>.md`.
9. Report `LOCKED: <name> → references/locks/<name>.md` with a summary of what was captured.

## Must not

- Save outside `references/locks/` (or the host's configured locks path)
- Capture invented colors not actually in the source CSS
- Overwrite an existing lock without asking
- Skip the cross-medium translation table