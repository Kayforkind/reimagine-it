---
name: reimagine-it
description: >-
  Content-Derived Design — reads the source file and derives palette, motifs,
  and motion from concrete nouns, dates, and colors already in the content.
  Use when the user says /reimagine-it, "reimagine it", "reinvent this",
  "redesign this page", "make an infographic", wants a content-aware redesign
  or a visual leap instead of a mood board. Tokens: webpage, infographic,
  svg, 3js, simulation, artistic, cinematic, dashboard, photography, landing,
  portfolio, ecommerce, glassmorphism, bento, neon, brutalism, neumorphism,
  handdrawn. Also /reimagine-it audit to run deterministic quality checks.
  Installed via npx skills add Kayforkind/reimagine-it or plugin marketplace.
  Not /better. Not a mood board.
license: MIT
metadata:
  author: Kayforkind
  version: "2.3.1"
  hosts:
    - claude-code
    - cursor
    - codex
    - copilot
    - gemini-cli
    - factory-droid
    - agent-skills
keywords:
  - content-derived-design
  - redesign
  - infographic
  - svg
  - threejs
  - frontend
  - html
  - css
  - palette
  - motion
  - offline
category: Design
capabilities:
  - content-extraction
  - color-palette-generation
  - infographic-creation
  - svg-generation
  - threejs-scene-generation
  - simulation-generation
  - accessibility-audit
  - visual-verification
trigger_phrases:
  - /reimagine-it
  - reimagine it
  - reinvent this
  - redesign this page
  - make an infographic
  - content-aware redesign
  - design from content
  - redesign from source
  - palette from content
  - content-derived design
  - simulation
  - webpage
  - frontend
  - html
  - css
  - palette
  - motion
  - offline
---

# /reimagine-it

**Banks:** [references/notes.md](references/notes.md) · [references/forms.md](references/forms.md) · [references/webpage-craft.md](references/webpage-craft.md) *(only for the webpage form)* · **[references/craft-floor.md](references/craft-floor.md)** *(the interaction contract every webpage output must clear; read every run)* · **[references/review.md](references/review.md)** *(§5.d named-object accuracy + clone scan; load on every verify)* · [references/forms/](references/forms/) *(non-webpage form packs: pdf, document, slides, universal)* · [references/domains/](references/domains/) *(only when the user gave a domain token: `artistic` / `dashboard` / `photography` / `cinematic` (aka `3d`, `webgl`) / `ecommerce` / `landing` / `portfolio` / `infographic`)* · [references/modifiers/](references/modifiers/) *(only when the user gave a modifier: `glassmorphism` / `bento` / `neon` / `brutalism` / `neumorphism` / `handdrawn`)* · [references/locks/](references/locks/) *(loaded on `--ref <name>`)* · **[references/research/web-craft-2025.md](references/research/web-craft-2025.md)** *(deep source pack — Awwwards SOTY stack scan, Rauno/Emil craft floor, Lupi/Fragapane data humanism, Feixen/Weingart/Troxler print grammar, Apple AIDA cinematic, view-transitions, scroll-driven animations, kinetic type, sound, neubrutalism — read once, cite in reports)* · **[references/research/infographic-craft.md](references/research/infographic-craft.md)** *(15-source infographic pack — Cleveland–McGill, Tufte, Bertin, ISOTYPE, Minard/Snow, Cairo, Lupi, FT Visual Vocabulary, USWDS, WCAG charts, InfoAlign layouts — load when the form or domain is `infographic`)* · [examples.md](examples.md)

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
| **Visual form** — `svg` `3js` `infographic` `canvas` `html` `webpage` `simulation` | Force a visual form. | Craft inside that medium. Token `infographic` also loads [references/domains/infographic.md](references/domains/infographic.md) (poster of an argument, not a dashboard). Token `svg` / `3js` ship **alive-micro** by default (2–4 fact-tied loops that beautify; brief `still` freezes). Token `simulation` ships a playable model of facts already in **this** source — default paused on the first fact; nested short spans are inspectable; type in the gutter. None of these are a Texas skin; leftover words are a lens. |
| **Non-webpage document forms** — `pdf` `document` (docx / markdown) `slides` (pptx / reveal.js) `universal` (any input file) | Force a document/media form. Loads [references/forms/<form>.md](references/forms/). | Which regeneration tool to reach for (ReportLab, Weasyprint, python-docx, python-pptx, LaTeX). |
| **Domain aesthetic** — second word after `webpage`: `artistic` `dashboard` `photography` `cinematic` (`3d`, `webgl`) `ecommerce` `landing` `portfolio` `infographic` | Force a webpage aesthetic. | Load [references/domains/<domain>.md](references/domains/) and extend the [webpage-craft](references/webpage-craft.md) spine. `cinematic` upgrades the 3D floor to inline WebGL2. `infographic` is a statistical poster (common-scale encodings + ISOTYPE + data table) — not an ops dashboard. |
| **Modifier** — third word or `--style <name>`: `glassmorphism` `bento` `neon` `brutalism` `neumorphism` `handdrawn` | Layer a UI/UX modifier on top of the domain. | Load [references/modifiers/<name>.md](references/modifiers/); modifiers waive matching cut-list entries and add their own non-negotiables. |
| **Font override** — `--font "Family, Fallback, generic"` | Pin the display / body font family. | Build a full font stack; degrade gracefully when the family is not on the reader's box. Never fetch a webfont at run time unless you also pass `--allow-fetch`. |
| **Sound** — `--sound [tier]` (`ambient` / `feedback` / `full`, default `feedback`) | Turn on sound design for this run. Off by default. | Load Howler.js sprite pack; enforce earcon tier hierarchy (§ craft-floor #7); ship visible mute + volume controls; never autoplay; provide visual alternative for every cue. Downgrades to `partial` if any of those are missing. |
| **Lock / reuse** — `lock <path> [as <name>]` · `--ref <name>` · `--list-refs` | Capture a shipped output as a reusable reference, or apply one. | Extract palette + type stack + motifs + motion + 3D signatures into [references/locks/<name>.md](references/locks/); on `--ref`, load that pack as if it were a domain. |
| `--notes` | Show the four notes. | Which four. |
| `--plan-only` | No files. | Lock + notes + form + stretch. |
| `--full` | Extra plus-pass after the hero. | One mutation that serves the idea, then ship. |
| `--variants N` | Ask for N distinct outputs from the same brief instead of one. | Pick N distinct make-strange moves; write to `.../var-1/`, `.../var-2/`, ... |
| `--seed <n>` | Pin the creative variation sample so two runs produce **the same** draw. Default is fresh every run. | Use the seed to deterministically pick one option per variation axis. |
| `--variant a\|b\|c\|...` | Shorthand for a named seed (`a` = first canonical draw, `b` = second, …). | Reproduce a specific shipped draw; useful for locks (`--variant b --lock`). |
| `<brief>` | Any leftover words after known tokens. Open vocabulary — not a theme catalog. | Treat as a creative lens on register, ground, motif, pattern, type, motion. Still sniff context; brief does not replace source facts. |
| **Audit** — `audit` | Run deterministic quality checks on an HTML file. | Runs `scripts/audit.py` — 18 checks across typography, palette, motion, content, structure, and performance with no LLM and no API key. Zero failures must pass. Supports `--verbose` and `--json`. |

Combine freely. Known form / domain / modifier tokens load packs. **Every other word is kept** and followed. There is no list of allowed leftover words.

```
/reimagine-it webpage cinematic
/reimagine-it webpage infographic
/reimagine-it infographic
/reimagine-it infographic <any leftover words>
/reimagine-it svg
/reimagine-it audit
/reimagine-it 3js
/reimagine-it simulation
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
- [ ] 0. Mode + categories parsed (leftover words kept as brief) + context sniffed
- [ ] 0.5. Interview only if that category was chosen
- [ ] 0.75. Adjacent possible named (private)
- [ ] 0.85. Anchor list — extract 3–5 concrete nouns/proper nouns/dates/verbs from the source; every plate must map back
- [ ] 1. Four notes chosen (private)
- [ ] 2. Hero form routed (unless user forced one)
- [ ] 2.4. Variation sample picked (avoid previous draw; pin if --seed / --variant)
- [ ] 2.5. Modifiers / font override / --ref loaded if present
- [ ] 2.6. Output format(s) resolved (same-format twin default when input == viable output)
- [ ] 2.7. Craft floor loaded (references/craft-floor.md) — every rule enforceable before render
- [ ] 3. Hero artifact written (or N variants if --variants)
- [ ] 4. Stretch named (and built if cheap)
- [ ] 4.5. --full plus-pass if requested
- [ ] 5. Verify with evidence (functional + visual + craft-floor scan)
- [ ] 6. Report REIMAGINED: shipped | partial | blocked
```

### 0. Token parse (open brief — do not drop words)

This skill is a creative engine. The user may type anything after `/reimagine-it`. Do not require a matching pack. Do not autocorrect unknown words into a listed domain. Do not ask "what style do you want?"

1. Split on whitespace. Consume flags and their arguments (`--seed`, `--style`, `--font`, `--ref`, `--variants`, `--sound`, `--notes`, `--plan-only`, `--full`, `--variant`, `--allow-fetch`, `--ask-format`, `--list-refs`). Handle `lock … as …` as its own command.
2. Classify remaining words that **exactly** match a known form, domain (incl. `3d` / `webgl`), or modifier.
3. **Join every leftover word, in order, as the brief.** Empty brief is allowed. Multi-word briefs are the point.
4. A known modifier still loads its pack (`neon`, `handdrawn`, …). Leftover words around it stay in the brief.

The brief is a **lens**, not new content and not a closed theme list. Apply it to ground, motif, pattern, type, and motion. Source facts stay source facts. Log it on the report `Brief:` line (or `none`).

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

### 0.85 Anchor list (private, but every plate must map to one)

From the source, extract **3–5 concrete anchors**: proper nouns (people, places, brands), dates, numbers, verbs of action, physical objects, quoted phrases. These are the units of content the design must serve.

Every plate, tile, section, chart, or hero unit in the output must **map back to at least one anchor**. If it does not, delete it — do not paint a placeholder tile with the word `blank`, `sample`, or an alt-text stand-in (see must-not).

Record the anchor → plate mapping privately (or in the local ledger). Cite it on the report `Anchors:` line so the user sees the design isn't drifting from the source.

Example — Texas notebook source: anchors = {`Jordan Rivers`, `Big Bend`, `1836`, `Post Office`, `west Texas sunset`}. Draw C's shader-hero → sunset; letterpress-card #01 → 1836; map plate → Big Bend; caption → Rivers; kicker → Post Office. Every unit serves an anchor.

### 1. Four notes (private)

From [references/notes.md](references/notes.md): one Device, one **Leap** (vastness + accommodation, moral beauty, big ideas, small self), one Craft, one Effect. Mutations name a cut, plate, magnet, withheld title, first-run beat, API shape, or demo — not "cinematic."

Do not dump the bank in chat.

### 2. Form router

Follow [references/forms.md](references/forms.md) unless a category forced the family.

**Webpage / HTML / infographic** → load [references/webpage-craft.md](references/webpage-craft.md) before writing the file. If the user added a **domain** (second word), also load the matching pack in [references/domains/](references/domains/). Token `infographic` — as a visual form *or* as a domain — always loads [references/domains/infographic.md](references/domains/infographic.md) and [references/research/infographic-craft.md](references/research/infographic-craft.md). Lock **structure** (list / sequence / hierarchy / compare / values / relation) from this source before drawing marks. If they added a **modifier** (third word or `--style`), also load the matching pack in [references/modifiers/](references/modifiers/). Leftover words are the brief (step 0) — follow them; do not require a pack file. If they passed `--ref <name>`, load [references/locks/<name>.md](references/locks/) instead of (or in addition to) a domain — treat locks as domain packs.

**SVG** → load [references/forms/svg.md](references/forms/svg.md). Marks in the field, type in the gutter. No label on a path. **Alive-micro default:** 2–4 loops on marks (weenie-breathe + one fact-loop + hover pairing). Brief `still` / `no-motion` / `print` freezes loops. Leftover words are a lens. **Do not clone the Texas gold weenie onto a different source.**

**3js** → load [references/forms/3js.md](references/forms/3js.md). Reserved HUD strip. Silhouettes from **this** source. Not a primitive demo. **Alive-micro default:** idle life on 2–3 meshes (weenie-turn, flow along a source curve, sun-breath) plus camera ease / wide-drift. Brief `still` pins the camera and freezes meshes. Leftover words are a lens. **Do not clone the Texas gold room onto a different source.**

**simulation** → load [references/forms/simulation.md](references/forms/simulation.md). Playable model of **this** source's sequence (years, days, handshake steps — whatever it times with). Type in the gutter. Marks on the field. Nested short spans are inspectable. Default paused on the first fact. Leftover words are a lens. **Do not clone the Texas 1836–1995 clock onto a different source.**

**PDF / document / slides / universal** → load the matching form pack in [references/forms/](references/forms/). These packs specify the regeneration tool (ReportLab, Weasyprint, python-docx, python-pptx, LaTeX) and the "reimagine" bar for that medium.

**Any webpage output** — with or without a domain / modifier / lock — must land **hero-scale inline SVG doing real work, three moving elements at any moment, and 3D that reads in a still** (rotation ≥ 12° + shadow blur ≥ 24px, or `translateZ` ≥ 30px + real shadow, or inline WebGL2). If a screenshot cannot prove all three, the redesign did not earn the form. **Exception — `infographic`:** the poster stays orthographic (paper drop-shadow only; no `rotateX` on the board).

**Non-webpage output** — the equivalent bar lives in the form pack (e.g. PDF: at least one full-bleed spread with a data-driven diagram; slides: at least one animated shape via reveal.js fragments or LibreOffice smart animations; document: at least one pull-quote block + one figure).

**Form follows the leap:**

- Capability in this codebase → implement **here** (plus a tiny proof: test, CLI, fail-demo).
- Seeing-tool (infographic, weenie, canvas, explainer HTML, one-shot deck/PDF) → `<workspace>/reimagined/<yyyy-mm-dd>-<slug>/`.
- Never hide a product feature inside `reimagined/` as a souvenir.

### 2.4 Creative variation (never repeat)

`/reimagine-it` must not return the same output twice for the same source unless the caller pinned a seed with `--seed <n>` (or picked a named `--variant`). Every fresh run samples a new combination along the axes below so the same brief produces a real range of draws instead of one canned "official" answer:

| Axis | Options (agent picks; content narrows the set) |
|------|-------|
| **Reader register** | The lens the whole page speaks through — governs pacing, voice, and how the other axes combine. `dashboard-live` (Bloomberg / product-page cadence), `editorial-drift` (magazine feature, deliberate pauses), `field-guide-quiet` (Colossal / Feixen still confidence), `cinematic-shader` (Cartier / Lando Norris — full-bleed shader hero, sound-optional), `neubrutalist-blunt` (thick borders, hard shadow, saturated palette, no gradients), `poster-jazz-improv` (Troxler — single type size, non-l-to-r reading, high asymmetry), `data-humanist` (Lupi / Fragapane — the identity IS the data, custom visual alphabet from the source). |
| **Ground / palette weighting** | The content-derived palette usually contains ~4 hues (e.g. Texas notebook → navy · cream · red · gold). Each draw picks a *different anchor hue for the ground*: `deep-night` (navy ground, warm accent), `parchment` (cream ground, red accent), `void` (near-black ground, single-hue accent), `raw-paper` (off-white ground, ink accent), `field-blue` (mid-blue ground, cream accent), `shader-glow` (fullbleed animated gradient/shader as ground, ink on top). |
| **Hero move** | `kpi-skyline`, `illustrated-map`, `kinetic-type-headline`, `inline-shader-hero` (WebGL2 full-bleed with scroll-driven uniforms), `oversized-numeral`, `letterpress-plate`, `photograph-strip`, `weenie-object`, `variable-font-morph-hero` (scroll-driven `wght`/`wdth` axis pulse; letter-spacing buffer reserved), `sticky-evidence-pin` (BBC-Lost-Tablet pattern — artifact stays fixed while narrative scrolls), `oversized-quote-with-drop-cap`, `priestley-timeline` (dates on a common year scale), `isotype-unit-count` (N copies of a same-size pictogram), `portrait-grid-poster` (hero encoding + supporting grid). |
| **Infographic structure** (when form or domain is `infographic`) | Sniff **this** source first (AntV-style router, not their templates): `list` (unordered peers), `sequence` (steps / dated beats), `hierarchy` (tree), `compare` (two+ groups), `values` (magnitudes), `relation` (nodes+edges the source actually names). Then pick InfoAlign scenery: `grid`, `star`, `portrait`, `landscape`, `portrait-grid`, `spiral` (spiral only if the metaphor is a spiral). Gold Texas is sequence+compare on portrait-grid; gold Jules is sequence+star around the cone. Do not default to either. |
| **Plate style** | For a 3-item section: `dashboard-tile`, `editorial-dropcap`, `letterpress-card` (numbered, with stamp), `line-art-token`, `photograph-plate`, `bento-cell`, `index-card-stack`, `custom-data-glyph` (Fragapane-style organic mark derived from a datapoint — leaves, braids, snakes, whatever the content demands), `poster-tile-one-size` (Troxler — every info at one type size, composition alone carries hierarchy). |
| **Motion budget** | `dashboard-live` (counters + pulses), `editorial-drift` (petals / dust / paper), `kinetic-type-sway` (headline sways), `shader-loop` (fullbleed shader), `still-with-one-loop` (one animated element), `no-motion`, `scroll-driven-axis-morph` (variable font `wght`/`wdth` bound to `animation-timeline: scroll(root)`), `sticky-highlight-reveal` (BBC / Pudding — pinned evidence with contextual line lighting), `view-transition-morph` (`@view-transition { navigation: auto; }` for multi-page packs — zero-JS native crossfade). **When the hero form is `svg` or `3js`:** force `alive-micro` (2–4 fact-tied loops + hover pairing) unless the brief says `still` / `no-motion` / `print`. **When the hero form is `simulation`:** the motion *is* the clock (day-scale then years); default paused on the first year; do not sample webpage motion onto it. Do not sample a webpage-only motion (`shader-loop`, `view-transition-morph`) onto a weenie, a Three.js field, or a clock. |
| **Type accent** | `sans+mono`, `serif+italic`, `small-caps`, `mixed-italic`, `display-cut` (oversized cuts), `blackletter+grotesk`, `custom-display+workhorse-sans` (M/M Paris pattern — one bespoke display voice + one neutral sans body — Editorial New + Neue Montreal, or Söhne + Signifier, etc.), `variable-single-family` (one variable font family, three axes doing the hierarchy work — GT Standard / Recursive). |
| **3D signature** | `card-fan` (rotateY ±14°), `letterpress-deboss` (inset shadow), `floating-hero` (translateZ 40px), `depth-strata` (three z-layers), `parallax-scroll`, `no-3D-just-shadow`, `matcap-hero` (Bruno Simon technique — matcap texture on a real Three.js mesh for fake-but-convincing shading with zero light math), `alcove-scenes` (Cartier — a handful of self-contained 3D scenes each keyed to a section, hidden gestures reward exploration). |

Rules:

1. **Never repeat the previous draw's exact combination.** Track it in memory or the local ledger for the session.
2. **Content narrows the set** — do not pick `card-fan` for a printed field guide, do not pick `letterpress-deboss` for a WebGL cinematic. The content decides which sub-space is coherent; variation happens inside it. The leftover brief may reweight that sub-space (ground, pattern, type, motion) without adding facts.
3. **The reader register governs coherence.** Once you pick a register, the other axes must fit its grammar. A `cinematic-shader` register needs `inline-shader-hero` + `shader-loop` motion + `matcap-hero` or `alcove-scenes` 3D; a `poster-jazz-improv` register needs `poster-tile-one-size` plates + `no-3D-just-shadow` + high asymmetry. Do not glue incompatible axes. **`svg` / `3js` forms ignore webpage motion samples** — they use `alive-micro` from the form pack. **`simulation` ignores them too** — it uses the clock in [forms/simulation.md](references/forms/simulation.md).
4. **`--seed <n>` pins the sample deterministically.** Given the same source + same seed, the output must be byte-equivalent so users can reproduce a specific draw for locks or PRs.
5. **`--variant a` / `--variant b` / …** are named seeds. `a` is the first canonical draw, `b` the second, etc. Ship them under `after.html`, `after-2.html`, `after-3.html` when a gold pack demonstrates the variance.
6. **Show the sample** in the report `Draw:` line so the user knows which combination was picked (e.g. `Draw: cinematic-shader · shader-glow · inline-shader-hero · custom-data-glyph · scroll-driven-axis-morph · variable-single-family · matcap-hero`).

Gold demonstration (`gold/webpage/`): Draw A `after.html` (dashboard-live · deep-night), Draw B `after-2.html` (editorial-drift · parchment), Draw C `after-3.html` (cinematic-shader · shader-glow — the raised bar from v2.2 research). `twins.png` proves the range at a glance.

Gold infographic (`gold/domains/infographic/after.html`, v2.3): **one** Texas-notebook draw. Live runs derive palette, pattern, glyphs, **and composition** from **this** source (plus leftover brief). Cloning that gold’s scenery *or* its poster chrome onto a different source is a fail.

Gold Jules (`gold/jules/`): **one** parlor draw. Default webpage is the parlor you walk into (full-bleed counter + cone), not a stationery slip. Artistic is a painting of this shop's materials (not gold's cream/coral sine waves). Photography is still-lifes of marble / freezer / walk-up (not a VOL/ISSUE folio clone). Infographic is a star around the cone. SVG is stacked scoops. 3js camera sits on the counter. Simulation is the flavor board. Proof that a second source must not look like the first.

Gold forms (`gold/forms/`): **one** Texas-notebook draw each. Live `svg` / `3js` / `simulation` runs derive weenie, meshes, clock unit, geography, palette, **and composition** from **this** source. Do not reuse weenie-left / schematic-center / gutter-right / timeline-bottom, `The years run`, or an `All three` place HUD.

### 2.5 Modifiers · font · lock (extend the pack)

- **Modifiers** are additive and composable. `glassmorphism` waives the spine's "blur / glassmorphism as the design" cut-list entry and adds its own non-negotiables (real depth behind the glass, layered panels, reduced motion budget). `bento` restructures the section grid into named tiles. Modifiers stack (`artistic glassmorphism` is a real combination); packs must not fight the spine on grid / palette cap / one motif.
- **Font override** (`--font "..."`) replaces the display or body family. Build a full CSS stack with sensible fallbacks (a serif family gets `serif` at the end, a mono family gets `monospace`). Never fetch a webfont; if the user wants one, they must pass `--allow-fetch` and understand it breaks the offline promise.
- **Lock**: on `/reimagine-it lock <path> [as <name>]`, read `<path>` (HTML/CSS/JSON/PDF metadata/etc.) and extract palette + type stack + motifs + motion + 3D signatures + section structure. Write [references/locks/<name>.md](references/locks/) as a full pack. Later `/reimagine-it <target> --ref <name>` loads that pack as if it were a domain, so the same design DNA can be applied to a different target (or a different medium — a `webpage` lock can inform a `slides` pack).

### 2.6 Output format(s) — same-format twin by default

If the user pointed at a file whose **native format is itself a viable output medium** (`.pdf`, `.docx`, `.pptx`, `.mobi`, `.epub`, `.md`, `.html`), you **must** decide the output format(s) before writing:

1. **If the user forced a form token** (`pdf` / `slides` / `document` / `webpage` / `mobi` / `epub` / …), honor it. Ship in that form. Do not ship extras unless asked.
2. **If they did not force a form**, default to **two artifacts**:
   - a **same-format twin** in the source's native format (source is `.mobi` → ship a new `.mobi`; source is `.pdf` → ship a new `.pdf`; source is `.pptx` → ship a new `.pptx`), *and*
   - a **companion HTML** for on-screen reading + review.
   Both live in `<yyyy-mm-dd>-<slug>-reimagined/` next to the source.
3. **If the same-format twin regenerator is not available** on the current machine (e.g. `mobi` / `kindlegen` toolchain missing, no `docx`-writer, LibreOffice not installed), do **not** silently drop it. Ship the HTML, then in the report explicitly:
   - name the missing tool,
   - name the exact next command that would produce the same-format twin,
   - offer to install/run it.
4. **Never assume HTML is enough** when the input was a distributable ebook / document / deck. The user picked that format for a reason.
5. `--ask-format` flips this into a one-shot question with three options and a default (Enter accepts default). Example: `Ship as: (1) HTML + same-format twin [default]  (2) HTML only  (3) same-format twin only`. Wait for the answer, then build. No follow-up questions.

Log the decision on the report `Formats:` line so the user sees what was shipped and what was skipped.

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

### 5. Verify (functional + visual)

Two passes. Skipping either is a `partial` at best, not a `shipped`.

**5.a Functional pass** — the artifact does the thing:

- Path exists. Report it as a markdown link.
- Code/CLI: the command or test actually ran; paste the exit or the proving line.
- Visual file well-formedness: `viewBox` on SVG; HTML opens; no required CDN if offline was implied; PDF opens in a viewer; docx/pptx opens in the target app; ebook (mobi/epub) opens in Kindle Previewer / Calibre.
- Motion / 3D: two stills 500 ms apart show visible pixel change; at least one element has ≥ 12° rotation + ≥ 24 px shadow blur, or inline WebGL2.
- Prose: the piece is a file they can keep, not only chat.
- Protocol: a spec they can implement **or** a spike that runs — not only a metaphor.

**5.b Visual verification pass** — actually look at the render.

Render the hero into an image (headless Chrome for HTML → PNG at ≥ 1400 px wide; PDF → first-page PNG; docx → export to PDF then PNG; pptx → first-slide PNG; mobi/epub → open in Previewer and screenshot the first two pages). **Read the image tool result** (or open it in the IDE viewer) and manually scan for every one of these failure modes before reporting `shipped`:

- **Blank plates / placeholder labels.** No visible element may literally read `blank`, `placeholder`, `TBD`, `TODO`, `lorem`, `…`, `[…]`, `xxx`, `sample text`, `Title goes here`, `caption`, or an alt-text stand-in. If a slot has no real content from the source, **delete the slot** — do not paint a card with the word "blank" on it.
- **Every plate maps to an anchor.** Cross-check every visible unit against the anchor list from step 0.85. Unmapped tiles are drift — delete them.
- **Clipped / overlapping text.** No label is cut off by another element (e.g. `POST OFFICE` rendered as `POST O CE` because a foreground shape overlaps the text). Fix z-index / padding / `overflow` or move the overlapping element. **SVG / 3js:** no label sits on a mark, mesh, or path; 3js HUD is a reserved strip, never a stack on the canvas.
- **Broken image / broken svg.** No `alt` text is showing where a picture should be. No `<svg>` renders empty.
- **Runaway columns / squashed hero.** Nothing extends past the viewport. Hero is not vertically flattened.
- **Off-palette accent.** Every colored element is on the content-derived palette. No stray CSS-default blue link, no browser-default `<button>` chrome.
- **Wrong content.** All copy on the render actually appears in the source (or is a caption/index the skill added). No fabricated place names, dates, statistics, or people.
- **Motion proof.** If the pack claims motion (svg/3js default is `alive-micro`), capture two frames (~600 ms apart) and compare hashes; identical hashes = motion did not run. Brief `still` is the exception.

**5.c Craft-floor pass** (webpage only) — grep the produced HTML/CSS and confirm the [craft-floor](references/craft-floor.md) contract holds:
**Run the deterministic audit:** `python scripts/audit.py <output-file.html>` (or `/reimagine-it audit` as a standalone command). This runs 18 checks across typography, palette, motion, content, structure, and performance with no LLM and no API key. Zero failures must pass; warnings are advisory. Supports `--verbose` and `--json` for CI.

- **Focus & selection**: at least one `::selection` rule; at least one `:focus-visible` rule; **no** `outline: 0` / `outline: none` without a real replacement.
- **Reduced motion**: a `@media (prefers-reduced-motion: reduce)` block is present and decomposes correctly (transitions off, focus indicators still visible, essential state feedback preserved).
- **Compositor-only motion**: no `@keyframes` or transitions animate `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, `padding`, `font-size`, `letter-spacing`, `line-height`, `word-spacing`, `color`, or `background-color` (last two are OK for `:hover` on a static element only). Everything animated during scroll/interaction uses only `transform`, `opacity`, or `filter`.
- **No `transition: all`.** Explicit properties, always.
- **Kinetic type reserves space**: any variable-font axis morph has a `letter-spacing` buffer or `min-width` reservation on the animated element.
- **Interactive elements have hover + focus states** (not just `:hover`).
- **Sound off by default**: if `--sound` was not passed, there is no `<audio autoplay>`, no Howler `autoplay: true`, and no unmuted `<video>` outside an explicit user gesture.

If any of these fail, patch the CSS in one pass; if the fix crosses into "add a whole subsystem," downgrade to `partial` and name the specific miss.

**5.d Named-object + clone pass** — load [references/review.md](references/review.md). If the source names a public object (the Lone Star flag, a cone, a press), the weenie **is that object** — not a gold-star / cream-stripe remix. A second source must not wear Texas gold DNA or layout chrome. Gold fixtures: `python scripts/review_gold.py`.

Log the verify passes on the report:
- `Visual verify:` with what you scanned for and what you fixed
- `Craft floor:` with the results of the grep (e.g. `::selection ✓, :focus-visible ✓, prefers-reduced-motion ✓, compositor-only ✓, no transition:all ✓, sound off ✓`).

If any failure mode is present and cannot be fixed in one pass, ship `partial` and name the specific bug — never dress a placeholder up as done.

### 6. Report

```
REIMAGINED: shipped | partial | blocked
Mode: reimagine-it
About: <one sentence>
Hero: <path + how to run/open>
Domain / modifier / --ref: <if any>
Brief: <leftover phrase, or none>
Font stack: <if --font was passed>
Anchors: <3–5 nouns/proper nouns/dates from the source that every plate mapped back to>
Draw: <reader-register> · <ground> · <hero-move> · <plate-style> · <motion> · <type-accent> · <3D-signature>
      (svg / 3js: motion is `alive-micro` unless the brief was `still`)
Seed: <n if pinned, else "fresh">
Formats: <shipped list, e.g. "html + mobi twin" | "html only (kindlegen missing — next: <cmd>)">
Sound: <off | ambient | feedback | full — with tier + mute-control + no-autoplay confirmed>
Stretch: <what they didn't know was possible>
Notes: <only if --notes>
Functional verify: <what you actually ran, opened, or checked>
Visual verify: <scan result: no blank plates? no clipped text? every plate maps to an anchor? palette on-source? named weenie is the real object (flag cloth is white star / white over red, not gold-on-parchment)? motion advanced? composition is this source's object, not gold's layout chrome?>
Craft floor: <::selection ✓, :focus-visible ✓, prefers-reduced-motion ✓, compositor-only motion ✓, no transition:all ✓, sound off unless --sound ✓>
```

Lead the user-facing reply with the artifact and the stretch, not the protocol.

## Must not

- Ship a bullet list instead of an artifact
- **Return the same draw twice** for the same source without an explicit `--seed`/`--variant` pin
- **Drop leftover user words** because they are not a named form, domain, or modifier
- **Clone gold DNA or gold composition** onto a source that is not that notebook — not the palette (Texas parchment/navy/star-red), not the scenery (Lone Star, Alamo chapel, 1836–1995 map-clock), and **not the layout chrome** (`00 · MASTHEAD` rail, `/reimagine-it infographic` kicker, weenie-left / map-center / gutter-right / timeline-bottom SVG, `The years run` + `All three` HUD). Method travels. Composition does not.
- **Report `shipped` without the visual verification pass** (5.b) — no exceptions
- **Paint a plate that literally reads `blank`, `placeholder`, `TBD`, `TODO`, `lorem`, `sample`, `caption`, `…`, `[…]`, `Title goes here`, or any alt-text stand-in.** Empty slot → delete the slot. Real content only.
- **Ship a render with clipped or overlapped text** (e.g. a foreground shape covering half a label). Fix z-index / padding / `overflow` before reporting `shipped`.
- **Silently drop the same-format output** when the source's native format is a viable output (e.g. `.mobi` in, HTML-only out with no mention). Ship the twin, or name the missing tool and the exact next command in the report.
- **Ship a webpage output that fails the craft floor (§5.c) on any of: `::selection` styled, `:focus-visible` styled, `prefers-reduced-motion` block present and decomposed correctly, compositor-only motion, no `transition: all`, no `outline: 0` without a real replacement, no autoplay sound unless `--sound` was passed.** Patch in one pass or downgrade to `partial`.
- **Animate `top` / `left` / `right` / `bottom` / `width` / `height` / `margin` / `padding` / `font-size` / `letter-spacing` / `line-height` / `word-spacing` / `color` / `background-color`** for anything that runs during scroll or interaction. Use `transform`, `opacity`, or `filter` only — anything else forces layout recalc every frame and fails visual verify.
- **Use `transition: all`** — explicit properties always. `all` thrashes on any parent change.
- **Ship a page with `outline: 0` / `outline: none` and no visible focus replacement** — WCAG 2.4.7 non-negotiable.
- **Paint a plate that does not map back to an anchor from step 0.85** (i.e. drift into invented content). Every visible unit serves a source anchor or it is deleted.
- Treat `/reimagine-it` as graphics-only
- Interview without the `interview` category
- Ask "what style do you want?"
- Use `wow`, "make it pop", or shock-as-strategy
- Call paid image/video APIs without asking
- Clone Dribbble / Collect UI as the idea
- Fake calligraphy or fake stats
- Fabricate content the source does not contain (invented place names, made-up statistics, phantom people)
- Scaffold a greenfield app into an unrelated repo without being asked
- Fetch a webfont without `--allow-fetch`
- Save a lock outside `references/locks/` (or the host's configured locks path)
