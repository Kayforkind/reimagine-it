---
name: reimagine-it
description: >-
  Open a creative mind on the current thing — a webpage, a PDF, a document, a
  deck, a CLI, a protocol, an architecture, a codebase, a piece of prose — and
  ship a leap the user did not know to ask for. Use when they run
  /reimagine-it, say "reimagine it", "reinvent this", "reimagine this page",
  want surprise, adjacent possible, make-strange, or are stuck recognizing
  instead of seeing. Composable modifiers (glassmorphism, bento, neon, ...),
  font overrides, and a lock system that captures a shipped design as a
  reusable reference. Not a brainstorm list. Not /better (quality pass). Not
  a feasibility grill.
license: MIT
metadata:
  author: kazimrmerchant
  version: "2.0"
---

# /reimagine-it

**Banks:** [references/notes.md](references/notes.md) · [references/forms.md](references/forms.md) · [references/webpage-craft.md](references/webpage-craft.md) *(only for the webpage form)* · [references/forms/](references/forms/) *(non-webpage form packs: pdf, document, slides, universal)* · [references/domains/](references/domains/) *(only when the user gave a domain token: `artistic` / `dashboard` / `photography` / `cinematic` (aka `3d`, `webgl`) / `ecommerce` / `landing` / `portfolio`)* · [references/modifiers/](references/modifiers/) *(only when the user gave a modifier: `glassmorphism` / `bento` / `neon` / `brutalism` / `neumorphism` / `handdrawn`)* · [references/locks/](references/locks/) *(loaded on `--ref <name>`)* · [examples.md](examples.md)

`/reimagine-it` is not a graphics mode. It opens a creative mind on **whatever the user points at** and ships a leap that specific thing can hold: a page, a document, a deck, a CLI, a protocol, an experiment, a piece of prose. Visuals are one form among many.

If `local.md` exists beside this file, Read it after this skill (host chairs, org, paths). Public installs have no `local.md`.

Say once: **"Running /reimagine-it."**

## Categories (you choose · agent decides)

Optional tokens. **Combine freely.** You pick tokens; the agent picks questions, form (if unset), mutations, and the stretch.

| Category | You choose | Agent decides |
|----------|------------|---------------|
| *(none)* | Default. No interview. | Infer, lock, form, build. |
| `interview` | Talk before build. | Which questions, recommended answers, when to stop. |
| **Form family** — `code` `cli` `protocol` `demo` `prose` `product` `architecture` `experiment` | Force that form family. | How the notes land in it. |
| **Visual form** — `svg` `3js` `infographic` `canvas` `html` `webpage` | Force a visual form. | Craft inside that medium. |
| **Non-webpage document forms** — `pdf` `document` (docx / markdown) `slides` (pptx / reveal.js) `universal` (any input file) | Force a document/media form. Loads [references/forms/<form>.md](references/forms/). | Which regeneration tool to reach for (ReportLab, Weasyprint, python-docx, python-pptx, LaTeX). |
| **Domain aesthetic** — second word after `webpage`: `artistic` `dashboard` `photography` `cinematic` (`3d`, `webgl`) `ecommerce` `landing` `portfolio` | Force a webpage aesthetic. | Load [references/domains/<domain>.md](references/domains/) and extend the [webpage-craft](references/webpage-craft.md) spine. `cinematic` upgrades the 3D floor to inline WebGL2. |
| **Modifier** — third word or `--style <name>`: `glassmorphism` `bento` `neon` `brutalism` `neumorphism` `handdrawn` | Layer a UI/UX modifier on top of the domain. | Load [references/modifiers/<name>.md](references/modifiers/); modifiers waive matching cut-list entries and add their own non-negotiables. |
| **Font override** — `--font "Family, Fallback, generic"` | Pin the display / body font family. | Build a full font stack; degrade gracefully when the family is not on the reader's box. Never fetch a webfont at run time unless you also pass `--allow-fetch`. |
| **Lock / reuse** — `lock <path> [as <name>]` · `--ref <name>` · `--list-refs` | Capture a shipped output as a reusable reference, or apply one. | Extract palette + type stack + motifs + motion + 3D signatures into [references/locks/<name>.md](references/locks/); on `--ref`, load that pack as if it were a domain. |
| `--notes` | Show the four notes. | Which four. |
| `--plan-only` | No files. | Lock + notes + form + stretch. |
| `--full` | Extra plus-pass after the hero. | One mutation that serves the idea, then ship. |
| `--variants N` | Ask for N distinct outputs from the same brief instead of one. | Pick N distinct make-strange moves; write to `.../var-1/`, `.../var-2/`, ... |
| `<brief>` | Extra intent. | Still sniff context; brief does not replace it. |

Combine freely. Example calls:

```
/reimagine-it webpage cinematic
/reimagine-it webpage artistic glassmorphism --font "Playfair Display, serif"
/reimagine-it pdf document
/reimagine-it lock gold/domains/cinematic/after.html as house-cinema
/reimagine-it webpage --ref house-cinema
/reimagine-it webpage bento --variants 3
```

**Interview is off unless they picked `interview`.** Do not grill unprompted. Do not ask "what style do you want?" — not even in interview.

Every mode **must ship an artifact** (unless `--plan-only`). A list of vibes is not the deliverable.

## Hard contract

1. Read this file. Load [references/notes.md](references/notes.md) and [references/forms.md](references/forms.md).
2. Sniff context. Interview **only** if `interview` was chosen.
3. Name the **adjacent possible**: spare parts already here + one combination they did not request.
4. Pick four notes in private (device · leap · craft · effect). Answer with mutations, not mood words.
5. Route a **hero form**. Build it in the place that form belongs (in-repo capability vs seeing-tool folder).
6. Name **one stretch** they did not know was in bounds. Build it if cheap; otherwise give the exact next command.
7. Kill list in notes.md. No "wow". No prompt-slop. No TED-over-B-roll.
8. Paid gate: code, SVG, HTML, PDF, docx, pptx, local demos are free. Ask before billed image/video/model APIs.
9. No commit/push unless asked.
10. Report `REIMAGINED: shipped | partial | blocked`.

## Procedure

```
REIMAGINED Progress:
- [ ] 0. Mode + categories parsed + context sniffed
- [ ] 0.5. Interview only if that category was chosen
- [ ] 0.75. Adjacent possible named (private)
- [ ] 1. Four notes chosen (private)
- [ ] 2. Hero form routed (unless user forced one)
- [ ] 2.5. Modifiers / font override / --ref loaded if present
- [ ] 3. Hero artifact written (or N variants if --variants)
- [ ] 4. Stretch named (and built if cheap)
- [ ] 4.5. --full plus-pass if requested
- [ ] 5. Verify with evidence
- [ ] 6. Report REIMAGINED: shipped | partial | blocked
```

### 0. Context sniff (do not skip)

In parallel, cheaply:

- Workspace root, `README`, `GOAL.md` if present (read; do not overwrite)
- `git status -sb` if a repo
- Open / recently viewed files if known
- User text after the slash
- Domain files the repo already points at (CONTRIBUTING, protocol docs, failing tests)
- The **target file** if the user pointed at one (`before.html`, `report.pdf`, `deck.pptx`, `notes.docx`, …)

One-sentence lock: **what this is**, **what happens to them**.

If context is empty (blank chat, empty folder) and **no** `interview`: still ship. Invent from the folder name and any README. Do not stall for a brief.

### 0.5 Interview category (skip unless chosen)

Only when they passed `interview`. You choose the category; **the agent decides the questions**.

- After the sniff, ask only what context cannot answer.
- **One question at a time.** Wait. Multiple questions at once is bewildering.
- Each question includes a **recommended answer**. They can take it, replace it, or say `just go` to skip the rest and build.
- Questions come from the note bank (device / leap / craft / effect) — not "what style" or "any preferences?"
- If the codebase can answer, Read/Grep instead of asking.
- Cap **4 questions**, then build. Do not leave the session in interview forever.

### 0.75 Adjacent possible (private)

From the parts already in this repo or thread, name **one** unused combination. That is the leap candidate. Do not dump a mood board.

Pick **one** SCAMPER letter as the mutation (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse). Do not run all seven in chat.

### 1. Four notes (private)

From [references/notes.md](references/notes.md): one Device, one **Leap** (formerly Awe — vastness + accommodation, moral beauty, big ideas, small self), one Craft, one Effect. Mutations name a cut, plate, magnet, withheld title, first-run beat, API shape, or demo — not "cinematic."

Do not dump the bank in chat.

### 2. Form router

Follow [references/forms.md](references/forms.md) unless a category forced the family.

**Webpage / HTML / infographic** → load [references/webpage-craft.md](references/webpage-craft.md) before writing the file. If the user added a **domain** (second word), also load the matching pack in [references/domains/](references/domains/). If they added a **modifier** (third word or `--style`), also load the matching pack in [references/modifiers/](references/modifiers/). If they passed `--ref <name>`, load [references/locks/<name>.md](references/locks/) instead of (or in addition to) a domain — treat locks as domain packs.

**PDF / document / slides / universal** → load the matching form pack in [references/forms/](references/forms/). These packs specify the regeneration tool (ReportLab, Weasyprint, python-docx, python-pptx, LaTeX) and the "reimagine" bar for that medium.

**Any webpage output** — with or without a domain / modifier / lock — must land **hero-scale inline SVG doing real work, three moving elements at any moment, and 3D that reads in a still** (rotation ≥ 12° + shadow blur ≥ 24px, or `translateZ` ≥ 30px + real shadow, or inline WebGL2). If a screenshot cannot prove all three, the redesign did not earn the form.

**Non-webpage output** — the equivalent bar lives in the form pack (e.g. PDF: at least one full-bleed spread with a data-driven diagram; slides: at least one animated shape via reveal.js fragments or LibreOffice smart animations; document: at least one pull-quote block + one figure).

**Form follows the leap:**

- Capability in this codebase → implement **here** (plus a tiny proof: test, CLI, fail-demo).
- Seeing-tool (infographic, weenie, canvas, explainer HTML, one-shot deck/PDF) → `<workspace>/reimagined/<yyyy-mm-dd>-<slug>/`.
- Never hide a product feature inside `reimagined/` as a souvenir.

### 2.5 Modifiers · font · lock (extend the pack)

- **Modifiers** are additive and composable. `glassmorphism` waives the spine's "blur / glassmorphism as the design" cut-list entry and adds its own non-negotiables (real depth behind the glass, layered panels, reduced motion budget). `bento` restructures the section grid into named tiles. Modifiers stack (`artistic glassmorphism` is a real combination); packs must not fight the spine on grid / palette cap / one motif.
- **Font override** (`--font "..."`) replaces the display or body family. Build a full CSS stack with sensible fallbacks (a serif family gets `serif` at the end, a mono family gets `monospace`). Never fetch a webfont; if the user wants one, they must pass `--allow-fetch` and understand it breaks the offline promise.
- **Lock**: on `/reimagine-it lock <path> [as <name>]`, read `<path>` (HTML/CSS/JSON/PDF metadata/etc.) and extract palette + type stack + motifs + motion + 3D signatures + section structure. Write [references/locks/<name>.md](references/locks/) as a full pack. Later `/reimagine-it <target> --ref <name>` loads that pack as if it were a domain, so the same design DNA can be applied to a different target (or a different medium — a `webpage` lock can inform a `slides` pack).

### 3. Build

Include a 5-line `README.md` next to one-shot folders: what it is, how to run/open, which note drove it. In-place code changes: the proof (test or demo command) is the README.

**Hero craft (any form):**

- One magnet in the first encounter (weenie, first-run command, first sentence, first failing-then-green demo, first spread, first slide)
- Real content from *this* context — no lorem, no fake stats, no invented APIs
- Effect before method: they should be able to say what happened, not only how you did it
- Withhold the label until the artifact has done work

**Stretch (required in the report):** one thing they did not know was in bounds. Build when it is one extra file or a small sibling; otherwise give the exact next slash (`/reimagine-it webpage cinematic`, `/reimagine-it slides`, `/reimagine-it lock <path>`, …).

### 4. `--full` plus-pass

After the hero exists: re-read it. Apply **one** plus (criticism that contains a new move). Do not restart. Do not add a second product.

### 4.5 `--variants N` (optional)

If the user asked for N variants, produce N distinct outputs from the same brief. Each variant must land a **different make-strange move** (not the same page with a new color). Write to `<hero>/var-1/`, `<hero>/var-2/`, … and ship a `strip.png` composite so the user can pick.

### 5. Verify

- Path exists. Report it as a markdown link.
- Code/CLI: the command or test actually ran; paste the exit or the proving line.
- Visual: file is well-formed (`viewBox` on SVG; HTML opens; no required CDN if offline was implied; PDF opens in a viewer; docx/pptx opens in the target app).
- Motion / 3D: two stills 500 ms apart show visible pixel change; at least one element has ≥ 12° rotation + ≥ 24 px shadow blur, or inline WebGL2.
- Prose: the piece is a file they can keep, not only chat.
- Protocol: a spec they can implement **or** a spike that runs — not only a metaphor.

### 6. Report

```
REIMAGINED: shipped | partial | blocked
Mode: reimagine-it
About: <one sentence>
Hero: <path + how to run/open>
Domain / modifier / --ref: <if any>
Font stack: <if --font was passed>
Stretch: <what they didn't know was possible>
Notes: <only if --notes>
Verified: <what you actually ran, opened, or checked>
```

Lead the user-facing reply with the artifact and the stretch, not the protocol.

## Must not

- Ship a bullet list instead of an artifact
- Treat `/reimagine-it` as graphics-only
- Interview without the `interview` category
- Ask "what style do you want?"
- Use `wow`, "make it pop", or shock-as-strategy
- Call paid image/video APIs without asking
- Clone Dribbble / Collect UI as the idea
- Fake calligraphy or fake stats
- Scaffold a greenfield app into an unrelated repo without being asked
- Fetch a webfont without `--allow-fetch`
- Save a lock outside `references/locks/` (or the host's configured locks path)
