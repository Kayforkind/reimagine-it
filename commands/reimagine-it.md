---
description: >-
  Claude Code, Codex, Factory Droid, Cursor, Copilot, Gemini CLI. Redesign
  any file from its own content — webpage, SVG, Three.js, simulation, PDF, slides, infographic. Invent
  a leap they did not know to ask for. Not a mood board. Not Mermaid slop.
argument-hint: "[webpage|infographic|svg|3js|simulation|pdf|slides] [tokens] [open brief]"
---

# /reimagine-it — invent a leap from context

Load and follow [`skills/reimagine-it/SKILL.md`](../skills/reimagine-it/SKILL.md). Also `references/notes.md`, `references/forms.md`, `examples.md`.

Copy this file to `~/.cursor/commands/reimagine-it.md` if you want the slash in Cursor. Claude Code loads it from this plugin's `commands/` folder.

## Invocation

| Command | Behavior |
|---------|----------|
| `/reimagine-it` | Sniff → adjacent possible → four notes → hero artifact + stretch. **No interview.** |
| `/reimagine-it interview` | Optional talk. Agent decides questions (one at a time + recommended answer), then builds |
| `/reimagine-it code` / `cli` / `protocol` / `demo` / `prose` / `product` / `architecture` / `experiment` | Force form family |
| `/reimagine-it svg` / `3js` / `infographic` / `canvas` / `html` / `simulation` | Force visual. `infographic` also loads the infographic domain pack (poster, not dashboard). `simulation` is a playable model of source facts. |
| `/reimagine-it webpage infographic` | Same pack, via the domain token. |
| `/reimagine-it interview cli` | Combine |
| `/reimagine-it --notes` | Include the four notes in the report |
| `/reimagine-it --full` | Plus-pass after the hero |
| `/reimagine-it <brief>` | Context + brief |

User arguments: `$ARGUMENTS`

## Hard contract

1. Read the skill before acting
2. Interview **only** if they chose `interview`
3. Default: infer and build. Reimagining is **not** graphics-only
4. Ship an artifact (unless `--plan-only`)
5. Name a stretch they did not know was possible
6. No wow-factor, no paid APIs without asking, no commit unless asked
7. Report `REIMAGINED: shipped | partial | blocked`

Say once: **"Running /reimagine-it."**
