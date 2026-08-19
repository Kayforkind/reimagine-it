# awe-me

An [Agent Skill](https://agentskills.io) that opens a **creative mind** on the current context and ships a leap the user did not know to ask for.

Awe is not a graphics mode. `/awe-me` can invent a feature, CLI, protocol, architecture, demo, product move, experiment, prose, *or* a visual — whichever this workspace can actually hold.

```bash
npx skills add kazimrmerchant/awe-me
```

Global install (Cursor, Claude Code, and other hosts the CLI knows):

```bash
npx skills add kazimrmerchant/awe-me -g
```

Then say **awe me**, **inspire me**, `/awe-me`, or `/inspire-me`.

**First run** (fail, then the same context ships):

```text
python gold/awe.py          # exit 1 — vibe list
python gold/awe.py --ship   # exit 0 — gold/shipped.json
```

Or open `gold/index.html`. That is the door, not a lecture.

## What it does

1. Sniffs the repo and thread (does not stall for a brief).
2. Names the **adjacent possible** — a combination of spare parts already here.
3. Picks four private notes (device · awe · craft · effect) and **one** SCAMPER letter.
4. Routes a **form** from context, unless you forced a category.
5. Ships an **artifact** you can run, open, or keep. Always names a **stretch**.

`/inspire-me` is the same chair with a different default: elevation + a Tuesday handle, not vastness-as-magnet.

Interview is **optional**. You opt in with `interview`. The agent decides the questions (one at a time, with a recommended answer). Default is no interview.

## Categories

You choose the token. The agent decides the rest.

| You type | Meaning |
|----------|---------|
| `/awe-me` | Infer and build |
| `/awe-me interview` | Talk, then build |
| `/awe-me code` `cli` `protocol` `demo` `prose` `product` `architecture` `experiment` | Force a form family |
| `/awe-me svg` `3js` `infographic` `canvas` `html` | Force a visual |
| `/awe-me --notes` | Include the four notes in the report |
| `/awe-me --plan-only` | Lock + notes + form; no files |
| `/awe-me --full` | Plus-pass after the hero (one mutation, no restart) |
| `/awe-me interview cli` | Combine freely |

## Install without the CLI

Copy **one** folder. The skill directory name must stay `awe-me`.

```powershell
git clone https://github.com/kazimrmerchant/awe-me.git
Copy-Item -Recurse .\awe-me\skills\awe-me $env:USERPROFILE\.cursor\skills\
```

Other hosts: copy `skills/awe-me/` into that product’s skills root (`SKILL.md` required). Never install into `~/.cursor/skills-cursor/` (Cursor-managed built-ins).

Optional Cursor slashes: copy `commands/awe-me.md` and `commands/inspire-me.md` into `~/.cursor/commands/`.

## What this is not

- Not a brainstorm list or a mood-word grill
- Not [grill-me](https://github.com/mattpocock/skills) (that is a feasibility interview)
- Not `/better` (quality pass on an existing deliverable)
- Not “make it pop” / wow-factor as a strategy
- Not an image generator unless you explicitly ask your host for that

## Layout

```
skills/awe-me/          # the skill (copy this folder)
gold/                   # reverse-demo: fail list, then --ship
commands/               # optional Cursor slash files
```

Spec: [agentskills.io](https://agentskills.io/specification). Progressive disclosure: description is the trigger; body loads when the task matches; `references/` load on demand.

## Lineage (methods, not a brand)

Make-strange (Shklovsky, 1917). Adjacent possible (Kauffman; Johnson). SCAMPER (Eberle after Osborn). Awe as vastness + accommodation (Keltner & Haidt). Peak–end. Disney plussing. Pixar-shaped notes. Effect-before-method as craft. See [NOTICE](NOTICE).

## License

MIT. See [LICENSE](LICENSE).
