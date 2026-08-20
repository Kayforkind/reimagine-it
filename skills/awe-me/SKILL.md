---
name: awe-me
description: >-
  Open a creative mind on the current context and invent a leap the user did
  not know to ask for — a feature, protocol, CLI, demo, architecture, product
  move, prose, experiment, or visual. Use when they run /awe-me or /inspire-me,
  say “awe me” or “inspire me”, want surprise, adjacent possible, make-strange,
  or are stuck recognizing instead of seeing. Not a brainstorm list. Not /better
  (quality pass). Not a feasibility grill.
license: MIT
metadata:
  author: kazimrmerchant
  version: "1.1"
---

# /awe-me · /inspire-me

**Banks:** [references/notes.md](references/notes.md) · [references/forms.md](references/forms.md) · [references/webpage-craft.md](references/webpage-craft.md) (only for the webpage form) · [references/domains/](references/domains/) (only when the user gave a domain token: `artistic` / `dashboard` / `photography` / `ecommerce` / `landing` / `portfolio`) · [examples.md](examples.md)

Awe is **not** a graphics mode. “Awe me” means: open a creative mind, then **instantiate** a leap this context can actually hold. Visuals are one form among many.

If `local.md` exists beside this file, Read it after this skill (host chairs, org, paths). Public installs have no `local.md`.

Say once: **“Running /awe-me.”** or **“Running /inspire-me.”**

## Categories (you choose · agent decides)

Optional tokens. Combine freely. You pick the token; the agent picks questions, form (if unset), mutations, and the stretch.

| Category | You choose | Agent decides |
|----------|------------|---------------|
| *(none)* | Default. No interview. | Infer, lock, form, build. |
| `interview` | Talk before build. | Which questions, recommended answers, when to stop. |
| `code` `cli` `protocol` `demo` `prose` `product` `architecture` `experiment` | Force that **form family**. | How the notes land in it. |
| `svg` `3js` `infographic` `canvas` `html` `webpage` | Force a **visual** form. | Craft inside that medium. |
| Second word after `webpage`: `artistic` `dashboard` `photography` `ecommerce` `landing` `portfolio` | Force a **domain aesthetic**. | Load the matching pack in [references/domains/](references/domains/) and extend the [webpage-craft](references/webpage-craft.md) spine. |
| `--notes` | Show the four notes. | Which four. |
| `--plan-only` | No files. | Lock + notes + form + stretch. |
| `--full` | Extra plus-pass after the hero. | One mutation that serves the idea, then ship. |
| `<brief>` | Extra intent. | Still sniff context; brief does not replace it. |

`/awe-me` vs `/inspire-me`: vastness + accommodation vs elevation + a Tuesday handle. Same chair.

**Interview is off unless they picked `interview`.** Do not grill unprompted. Do not ask “what style do you want?” — not even in interview.

Both modes **must ship an artifact** (unless `--plan-only`). A list of vibes is not the deliverable.

## Hard contract

1. Read this file. Load [references/notes.md](references/notes.md) and [references/forms.md](references/forms.md).
2. Sniff context. Interview **only** if `interview` was chosen.
3. Name the **adjacent possible**: spare parts already here + one combination they did not request.
4. Pick four notes in private (device · awe · craft · effect). Answer with mutations, not mood words.
5. Route a **hero form**. Build it in the place that form belongs (in-repo capability vs seeing-tool folder).
6. Name **one stretch** they did not know was in bounds. Build it if cheap; otherwise give the exact next command.
7. Kill list in notes.md. No “wow”. No prompt-slop. No TED-over-B-roll.
8. Paid gate: code, SVG, HTML, local demos are free. Ask before billed image/video/model APIs.
9. No commit/push unless asked.
10. Report `AWE: shipped | partial | blocked` (inspire-me uses the same tag).

## Procedure

```
AWE Progress:
- [ ] 0. Mode + categories parsed + context sniffed
- [ ] 0.5. Interview only if that category was chosen
- [ ] 0.75. Adjacent possible named (private)
- [ ] 1. Four notes chosen (private)
- [ ] 2. Hero form routed (unless user forced one)
- [ ] 3. Hero artifact written
- [ ] 4. Stretch named (and built if cheap)
- [ ] 4.5. --full plus-pass if requested
- [ ] 5. Verify with evidence
- [ ] 6. Report AWE: shipped | partial | blocked
```

### 0. Context sniff (do not skip)

In parallel, cheaply:

- Workspace root, `README`, `GOAL.md` if present (read; do not overwrite)
- `git status -sb` if a repo
- Open / recently viewed files if known
- User text after the slash
- Domain files the repo already points at (CONTRIBUTING, protocol docs, failing tests)

One-sentence lock: **what this is**, **what happens to them**.

If context is empty (blank chat, empty folder) and **no** `interview`: still ship. Invent from the folder name and any README. Do not stall for a brief.

### 0.5 Interview category (skip unless chosen)

Only when they passed `interview`. You choose the category; **the agent decides the questions**.

- After the sniff, ask only what context cannot answer.
- **One question at a time.** Wait. Multiple questions at once is bewildering.
- Each question includes a **recommended answer**. They can take it, replace it, or say `just go` to skip the rest and build.
- Questions come from the note bank (device / awe / craft / effect) — not “what style” or “any preferences?”
- If the codebase can answer, Read/Grep instead of asking.
- Cap **4 questions**, then build. Do not leave the session in interview forever.

### 0.75 Adjacent possible (private)

From the parts already in this repo or thread, name **one** unused combination. That is the leap candidate. Do not dump a mood board.

Pick **one** SCAMPER letter as the mutation (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse). Do not run all seven in chat.

### 1. Four notes

From [references/notes.md](references/notes.md): one Device, one Awe, one Craft, one Effect. Mutations name a cut, plate, magnet, withheld title, first-run beat, API shape, or demo — not “cinematic.”

`/inspire-me`: bias Awe toward **moral beauty / invitation / reflective Tuesday**.  
`/awe-me`: bias Awe toward **vastness + accommodation / small self / epiphany**.

Keltner’s wonders include moral beauty, nature, music, visual design, spirit, big ideas, collective, birth/death. **Visual design is one of eight.** Do not default to pictures.

Do not dump the bank in chat.

### 2. Form router

Follow [references/forms.md](references/forms.md) unless a category forced the family.

If the routed form is a **webpage / html / infographic**, also load [references/webpage-craft.md](references/webpage-craft.md) before writing the file. That file is the non-negotiable checklist that separates a redesign from a repaint. Live gold is `gold/webpage/`.

If the user added a **second word** (`artistic` / `dashboard` / `photography` / `ecommerce` / `landing` / `portfolio`), also load the matching pack in [references/domains/](references/domains/). Domain packs **extend** the spine — they never replace grid + baseline + palette cap + one motif. Live gold: `gold/domains/` (four aesthetics from the same three-project brief; `strip.png` proves the range).

Every webpage output — with or without a domain token — must land **inline SVG doing real work, one motion move, and one 3D affordance** (CSS `perspective` counts; Three.js optional for hero cases). If none of those landed, the redesign did not earn the form.

**Form follows the leap:**

- Capability in this codebase → implement **here** (plus a tiny proof: test, CLI, fail-demo).
- Seeing-tool (infographic, weenie, canvas, explainer HTML) → `<workspace>/awe/<yyyy-mm-dd>-<slug>/` or `inspire/` for `/inspire-me`.
- Never hide a product feature inside `awe/` as a souvenir.

### 3. Build

Include a 5-line `README.md` next to one-shot folders: what it is, how to run/open, which note drove it. In-place code changes: the proof (test or demo command) is the README.

**Hero craft (any form):**

- One magnet in the first encounter (weenie, first-run command, first sentence, first failing-then-green demo)
- Real content from *this* context — no lorem, no fake stats, no invented APIs
- Effect before method: they should be able to say what happened, not only how you did it
- Withhold the label until the artifact has done work, unless `/inspire-me` needs the door labeled

**Stretch (required in the report):** one thing they did not know was in bounds. Build when it is one extra file or a small sibling; otherwise give the exact next slash (`/awe-me 3js`, `/awe-me cli`, …).

### 4. `--full` plus-pass

After the hero exists: re-read it. Apply **one** plus (criticism that contains a new move). Do not restart. Do not add a second product.

### 5. Verify

- Path exists. Report it as a markdown link.
- Code/CLI: the command or test actually ran; paste the exit or the proving line.
- Visual: file is well-formed (`viewBox` on SVG; HTML opens; no required CDN if offline was implied).
- Prose: the piece is a file they can keep, not only chat.
- Protocol: a spec they can implement **or** a spike that runs — not only a metaphor.

### 6. Report

```
AWE: shipped | partial | blocked
Mode: awe-me | inspire-me
About: <one sentence>
Hero: <path + how to run/open>
Stretch: <what they didn't know was possible>
Notes: <only if --notes>
Verified: <what you actually ran, opened, or checked>
```

Lead the user-facing reply with the artifact and the stretch, not the protocol.

## Must not

- Ship a bullet list instead of an artifact
- Treat “awe” as graphics-only
- Interview without the `interview` category
- Ask “what style do you want?”
- Use `wow`, “make it pop”, or shock-as-strategy
- Call paid image/video APIs without asking
- Clone Dribbble / Collect UI as the idea
- Fake calligraphy or fake stats
- Scaffold a greenfield app into an unrelated repo without being asked
