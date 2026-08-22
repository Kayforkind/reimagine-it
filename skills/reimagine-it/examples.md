# Examples

Public **tested results** (live exits, not stories): repo-root [README.md](../../README.md#tested-5). Re-run: `python gold/five/run.py`.

## Live gold (this repo)

`gold/reimagine.py` is example A made runnable on **this** skill: `--fail` exits 1 with a vibe list; `--ship` exits 0 and writes `gold/shipped.json`. Same two beats in `gold/index.html`.

Looping examples from the Texas notebook: [`gold/forms/examples.gif`](../../gold/forms/examples.gif) — before → webpage tokens → infographic → `svg` → `3js` → four alive-micro loops → `simulation`. Live gallery: [`gold/forms/see.html`](../../gold/forms/see.html).

---

## A — Missing capability (`/reimagine-it`)

**Context:** Users paste a workaround into every PR because the CLI cannot read stdin.

**Lock:** A client pipes a diff in and gets a structured verdict without flags.

**Adjacent possible:** Combine existing file parser + unused stdin branch. SCAMPER: **Put to another use**.

**Notes (private):** effect before method · microscopic vastness · weenie (the one command) · reverse demo.

**Hero:** Implement `tool --stdin` in place. Test: fail on empty stdin, then the same fixture goes green.

**Stretch:** `/reimagine-it protocol` — the verdict as a versioned JSON handshake.

**Not:** an HTML poster of the workaround. **Not:** a bullet list of “what if we…”

---

## B — Empty product (`/reimagine-it`)

**Context:** README only, “local-first MCP.”

**Lock:** First-run is a door, not a lecture.

**Notes:** effect before method · reflective Tuesday · reverse demo · weenie.

**Hero:** `reimagined/2026-08-18-first-run-door/` — broken install (red) then the same commands (green). One command is the Tuesday handle.

**Stretch:** That handle copied into the real README (with permission of `--full` or a follow-up).

**Not:** a mood board of “inspiring onboarding.”

---

## C — Ledger / numbers (`/reimagine-it infographic`)

**Context:** `ledger/CONTRIBUTIONS.jsonl` **or** any source that names dates, counts, and magnitudes (gold uses `gold/webpage/before.html`).

**Lock:** A client can state the question and the finding from one still. Encodings are position/length or ISOTYPE *counts* — never area pies.

**Notes:** riddle the object · microscopic vastness · weenie · title last.

**Hero (gold):** `gold/domains/infographic/after.html` — *one* Texas-notebook draw: portrait-grid paper poster, Priestley 1836–1995, eight equal acre-units, custom glyphs from *that* source's nouns, lossless table. **Second gold:** `gold/jules/domains/infographic/after.html` — parlor star around the cone, not that Priestley. A different source must produce different DNA (palette, pattern, glyphs, **composition**). Leftover words after `infographic` are an open brief — a lens, not a theme catalog.

**Hero (ledger):** `reimagined/2026-08-18-ledger-skyline/index.html` — each line is a building; height = kind of work.

**Pack:** [references/domains/infographic.md](references/domains/infographic.md) · research [references/research/infographic-craft.md](references/research/infographic-craft.md)

**Stretch:** `/reimagine-it 3js` walk the skyline, **or** `/reimagine-it code` a query that reprints the skyline as a CLI.

**Not:** a markdown table of the same JSONL. **Not:** a dashboard of KPI tiles. **Not:** enlarged pictograms meaning “more.” **Not:** cloning the Texas gold onto a different source. **Not:** ignoring leftover words because they are not a named domain.

---

## D — Architecture (`/reimagine-it architecture`)

**Context:** Five packages, no law. People invent import workarounds.

**Lock:** One sentence law they can violate on purpose; one slice that obeys it.

**Hero:** A `LAYERS.md` *and* a failing test that imports the wrong way, then the same test green after the slice.

**Stretch:** The law as a single SVG weenie for the README.

**Not:** a 40-box diagram with no spike.

---

## E — SVG from HTML (`/reimagine-it svg`)

**Context:** the naive Texas notebook at `gold/webpage/before.html`.

**Lock:** One vector weenie that **lives**. Type in the gutter — no label on the flag, map, or ISOTYPE row. Timeline ticks that would collide (1836/1839) stay unlabeled on the axis. Alive-micro: star breathe, Rio Grande dash flow, Alamo pin ping, 1839 tick hush; hover a pin and its legend swatch answers (`:has()`).

**Hero (gold):** [`gold/forms/svg/after.svg`](../../gold/forms/svg/after.svg) — Lone Star **flag geometry**, schematic Texas with three unlabeled pins, legend gutter, Priestley 1836–1995, eight equal acre units. Offline. No CDN.

**Stretch:** `/reimagine-it 3js` the same three places as a living room.

**Not:** Mermaid. **Not:** a screenshot of a webpage saved as `.svg`. **Not:** every mark bouncing. **Not:** cloning that Lone Star gold onto a source that is not this notebook.

---

## F — Three.js from HTML (`/reimagine-it 3js`)

**Context:** the same notebook. No existing Vite app.

**Lock:** Alamo chapel facade, capitol with wings, Big Bend as displaced ground + river tube. HUD in a reserved strip. Field fills the frame. First frame not blank. Alive-micro: star turn, gold motes on the Rio Grande, chapel-window sun-breath, slow wide-drift when looking at all three.

**Hero (gold):** [`gold/forms/3js/after.html`](../../gold/forms/3js/after.html) — one HTML file, import map to **vendored** `three@0.185.1` (REVISION 185). Drag to orbit. HUD jumps to each place. Sunset + soft shadows. Idle life on the meshes.

**Do:** pin Three.js in-repo when there is no app to edit. **Do not:** `npm create vite`. **Do not:** CDN `three`.

**Stretch:** `/reimagine-it simulation` run the years.

**Not:** a default cube. **Not:** Dribbble lighting on unrelated geometry. **Not:** CSS labels on the canvas. **Not:** cloning that Texas room onto a source that is not this notebook.

---

## G — Simulation from HTML (`/reimagine-it simulation`)

**Context:** the same notebook, facts that already have years and one magnitude.

**Lock:** A playable clock. Domain is 1836–1995. Default **paused on 1836**. The 19-day siege runs at day scale while the year holds 1836 — then years advance. Type lives in the gutter. The field is the SVG schematic (outline, Rio Grande cubic, pin colors). Each event has a mark: pin, star, spring bloom, eight unlabeled acre units, longhorn.

**Hero (gold):** [`gold/forms/simulation/after.html`](../../gold/forms/simulation/after.html) — Play / Pause / Prev / Next / scrub. Space and arrows. Click a pin or a row to jump. Pack: [`references/forms/simulation.md`](references/forms/simulation.md).

**Do:** settle at 1995 (no auto-loop). Reset returns to 1836. `prefers-reduced-motion` (or `?still=1`) lands on the last year, paused.

**Not:** a dashboard of fake live KPIs. **Not:** invented battle statistics. **Not:** “day 19/19” painted on 1995. **Not:** place names on the canvas. **Not:** a sine-wave river or a toy rectangle Texas. **Not:** cloning that gold clock onto a source that is not this notebook.

---

## H — Existing Three.js app (`/reimagine-it 3js`)

**Context:** Vite app already on Three.js.

**Lock:** The protocol handshake is a room you can orbit.

**Do:** Load the host Three.js skill. Edit the scene in place. First-frame proof.

**Do not:** `npm create vite` beside it.

---

## I — `--plan-only`

**Output:** lock sentence, adjacent possible, four notes, hero form, stretch command.  
**No files.** User runs without `--plan-only` to build.

---

## J — Interview (`/reimagine-it interview`)

**You choose:** talk. **Agent decides:** the questions.

**Q1 (agent):** What should the client experience in one sentence? Recommended: they pipe a diff and get a verdict, not a log.

User takes it or replaces it. Next question only after the reply. Cap 4. Then build as in example A.

**Not:** a preference survey. **Skip rest:** user says `just go`.

---

## K — Modifier (`/reimagine-it webpage cinematic glassmorphism`)

**Context:** the same three-project brief already used in `gold/domains/`.

**Lock:** Cinema-scale hero with a *foreground* glass tile that reveals the shader through it — not blur-as-decoration.

**Notes:** riddle the object · effect before method · reflective Tuesday · title last.

**Hero:** Cinematic pack renders the WebGL2 hero + card fan. Glassmorphism pack adds two frosted panels at different `backdrop-filter` blur radii (14 px / 24 px), each with a light-source-consistent border and a colored box-shadow. The masthead moves *inside* the front glass panel; the shader keeps running behind it. Cut-list waiver: the spine's "glassmorphism as decoration" ban is off; the glass must reveal the shader.

**Stretch:** `--ref` this output as `house-cinema-glass` so the same DNA can be applied to a slides deck for the same story.

**Not:** four glass tiers stacked (fog). **Not:** frosted footer holding only copyright.

---

## L — Font override (`/reimagine-it webpage artistic --font "Playfair Display, Iowan Old Style, Georgia, serif"`)

**Context:** the artistic pack. User has a specific serif they want.

**Lock:** Same artistic aesthetic; Playfair Display as the display family when present, Iowan Old Style on macOS, Georgia everywhere else.

**Hero:** Replace the pack's default display stack with the user's stack. Keep the italic-serif ampersand rule (Playfair has strong italics; if the fallback lands on Georgia, the italic still reads as editorial). No CDN fetch — do not add `@import url(https://fonts.googleapis.com)` unless `--allow-fetch` is passed.

**Stretch:** `--ref house-editorial` if the user likes the result and wants to keep it.

**Not:** fetching Google Fonts silently. **Not:** dropping the fallback stack and hoping.

---

## M — Lock roundtrip

**Round 1:** `/reimagine-it webpage cinematic` → `reimagined/2026-08-20-cinema/index.html`.

**Round 2:** `/reimagine-it lock reimagined/2026-08-20-cinema/index.html as house-cinema`.
Extracts palette + type stack + motifs + motion + 3D signatures → `skills/reimagine-it/references/locks/house-cinema.md`.

**Round 3:** `/reimagine-it webpage --ref house-cinema` on a **new** brief.
The skill loads the lock and produces a different page in the same design language.

**Round 4:** `/reimagine-it slides --ref house-cinema` on the same content.
The lock's cross-medium translation table tells the slides pack how the card fan becomes shifted-shadow shapes and how the shader hero becomes a snapshot PNG cover.

**Not:** editing the lock file to be "better." A lock is a photograph of a specific decision.

---

## N — PDF from a docx (`/reimagine-it pdf`)

**Context:** a client `.docx` with dense paragraphs, no cover, no diagrams.

**Lock:** A print-native PDF that opens like an object — full-bleed cover, one data plate on page 2, an anchor-linked ToC, and section rails visible on every page.

**Hero:** Reimagine as HTML using the artistic pack, then Weasyprint → PDF with `@page { size: A4; margin: 24mm 18mm; } @page:first { margin-top: 40mm; }`. Ship a `reimagine.py` next to the output so the user can rerun with a different lock.

**Stretch:** `--ref house-print` to apply a saved print house style. Or `/reimagine-it slides` on the same content for a live-talk companion deck.

**Not:** exporting the source docx as PDF and calling it done.
