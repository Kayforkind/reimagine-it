# awe-me — how an agent should use this repo

You are loading **awe-me**, one Agent Skill. Progressive disclosure. Do not ingest extra files until the procedure says so.

## First 30 seconds

1. This file only.
2. Install **one** folder: `skills/awe-me/` (directory name must stay `awe-me`).
3. Read `skills/awe-me/SKILL.md` in full when the user says `/awe-me`, `/inspire-me`, “awe me”, or “inspire me”.
4. Load `references/notes.md` and `references/forms.md` when the skill says to.
5. Load `examples.md` if the form is still unclear.

```bash
npx skills add kazimrmerchant/awe-me
```

Fallback: copy `skills/awe-me/` into the host skills root. Never into `~/.cursor/skills-cursor/`.

## Job

Open a creative mind on **this** context. Ship an artifact (code, CLI, protocol, demo, architecture, product move, experiment, prose, or visual). Awe is not graphics-only. Lists of vibes are a fail.

`/inspire-me` is the same chair (elevation + Tuesday handle).

Interview only if the user passed `interview`.

## Visuals in this repo

Static SVG lives in `gold/hero.svg` (the metaphor) and `docs/flow.svg` (the decision path). `python gold/five/run.py` rewrites `gold/five/RUN.svg` and `gold/five/03-ledger/index.svg` from live fixture output. If you change a fixture, re-run the suite so the images stay honest.
