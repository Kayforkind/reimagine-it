# /reimagine-it webpage infographic

Load when the user token is `infographic` (as a **domain** after `webpage`, or as a **visual form**). Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)). Deep sources: [../research/infographic-craft.md](../research/infographic-craft.md).

This is **not** a dashboard. A dashboard is an ops screen you monitor. An infographic is a **poster of an argument** — one question, answered in marks you can read in a still.

## This source, this run — not a template

The gold file (`gold/domains/infographic/after.html`) is **one draw of one Texas notebook**. It is not a skin to restyle. Live runs start from **this** source's nouns, dates, magnitudes, and atmosphere.

Fail the run if a client could mistake the poster for that gold when the source is not that notebook.

Extract DNA before drawing:

| Layer | From this source | Never from |
|-------|------------------|------------|
| **Palette** (≤5) | Named colors, materials, places, times of day, flags, inks, habitats in the text | The gold parchment / navy / star-red / sun-gold set, unless *this* source actually names those |
| **Pattern** | One repeating ground: paper grain, ledger rows, tide-lines, stamp grid, contour ticks, stitch, whatever the nouns imply | A canned texture library |
| **Glyphs** | SVG marks of *this* source's objects | Lucide, gold's mission/ridge/capitol/star/bloom/horns (unless those nouns are here) |
| **Layout** | This source's **object** plus data shape (shop → star; dates-as-the-story → Priestley; 3–8 comparables → grid) | Always-portrait-grid / always-Priestley because gold was |
| **Motion** | One persistent loop that belongs here (a pulse, a sway, a current) | Gold's Lone Star pulse on a source that has no star |

A second run on the **same** source must still be a new draw (fresh sample on the variation axes in SKILL.md §2.4) unless `--seed` / `--variant` pinned it. Same facts, different register / ground / layout / type / pattern.

## Structure first (then marks)

Contemporary infographic engines (e.g. AntV Infographic) treat a poster as **information structure + graphic meaning**, not as a dashboard skin. Steal the *router*, not the template pack, not `@antv/infographic`, not their stock icons.

Sniff **this source** into one primary structure. Secondary structures may support it. Do not pick a structure because a gallery looks slick.

| Source shape | Structure | Graphic meaning |
|---|---|---|
| Unordered peers (flavors, features, places with no rank) | **list** | Equal item cells: source glyph · label · desc · optional value |
| Ordered steps or dated beats | **sequence** | Connected items (spine, stairs, chevrons). Position still honest if years exist |
| Tree / org / nested parts | **hierarchy** | Parent–child. Depth from the source, not a fake org chart |
| Two or more groups to hold apart | **compare** | Parallel columns or small multiples on **identical** scales |
| Magnitudes / counts | **values** | Position or length on a **common** scale, or ISOTYPE copies |
| Named links (A then B, A vs B, A inside B) | **relation** | Nodes + edges only if the source actually relates them |

Item anatomy (every cell): **glyph from a source noun** · **label** · **one-line desc** · **value only if the source wrote a number**. No Lucide. No “Step 1 / Start / In progress” filler.

Still required on top of structure: one question, one hero encoding on a common scale, ISOTYPE for at least one discrete count, written takeaway, lossless table. Structure chooses *how items sit*. It does not replace encodings.

Fail: AntV-style generic process arrows with invented KPIs; cloning `list-row-horizontal-icon-arrow` chrome onto a notebook; using their hand-drawn theme when this source is not hand-drawn.

## Open brief (leftover words)

Unknown words after known tokens are a **creative lens**, not a catalog. There is no theme pack list. Do not wait for a matching `domains/<word>.md`. Do not ask "did you mean cinematic?"

```
/reimagine-it infographic
/reimagine-it infographic <any words the user typed>
/reimagine-it webpage infographic <any words>
```

The leftover phrase might be a habitat, a material, a mood, a print process, a constraint, a joke. Treat it as instruction:

- Reweight **ground, motif, pattern, type, motion** toward that lens.
- Keep **encodings** honest to the source. Do not invent facts the leftover words name unless those facts are already in the source.
- If the lens names something absent from the source, it is **visual language** (rule, rhythm, paper, register) — not new facts.

A modifier token (`neon`, `handdrawn`, …) still loads its pack. Everything that is not a known form / domain / modifier / flag stays in the brief, in the user's order.

## Aesthetic in one sentence

A print-poster of an argument on a sheet whose paper, ink, and repeating mark come from **this** content (and the leftover brief, if any): a kicker that states the question, a hero encoding on a **common scale**, ISOTYPE unit-counts for discrete magnitudes, small multiples for categories, custom glyphs drawn from source nouns, a written takeaway, and a data table of the same numbers.

## Palette (five, do not exceed)

Derive from content. Gold Texas notebook is an *example* of derivation, not a default:

- `--paper` #f4ecd8 (parchment — flag white / prairie)
- `--ink` #1a2138 (navy — flag blue)
- `--rule` #c2b48c
- `--hot` #b22234 (star-red, sparse)
- `--gold` #e8a63f (sunset / star)

Qualitative hues for **categories**. Sequential only if encoding ordered magnitude. No rainbow.

## Type

- Display serif for the question (32–56px) — unless the source or brief wants a different display (mono ledger, grotesque poster, etc.).
- Mono 11px tracking `0.18em` uppercase for axis labels, units, sources.
- Body serif 16–18px for takeaways.
- Big numerals: mono or sans, **tabular** if possible, never decorative script.

## Motif and layout

Lock **structure** from this source first (list / sequence / hierarchy / compare / values / relation — see above). Then pick **one** InfoAlign scenery from **this** source's object and data (research S13). Gold Texas is sequence+compare on portrait-grid because that notebook was dated beats plus two lists. Gold Jules is sequence+star around the cone. Do not default to either.

- A **shop, product, or person** (one weenie, many attributes) → **Star** (center weenie, facts radiate; length or position still honest).
- Dates as the *story* and no stronger object → **Portrait** Priestley (shared year axis).
- 3–8 comparable items, no weenie → **Grid** of small multiples, identical y-scale.
- Hero claim + supporting facts → **PortraitGrid**.
- Only if the source metaphor is a spiral → **Spiral**.

Required anatomy:

1. **Kicker** — the question in one sentence.
2. **Hero encoding** — position or length on a common scale. Timeline, aligned bars, or dot plot. Never a pie.
3. **ISOTYPE strip** — at least one discrete quantity drawn as N copies of a same-size pictogram (Neurath: more copies, not a bigger icon). The unit shape is a source noun.
4. **Custom glyphs** — SVG marks derived from source nouns. No stock icon font.
5. **Takeaway** — one italic sentence that a screen reader and a still both get.
6. **Data table** — the same numbers, visible or `.sr-only`, inside `<figure>`.

## Motion

Compositor-only (`transform`, `opacity`):

- Timeline spine `scaleX` from origin on load (one beat).
- ISOTYPE units fade/stagger in.
- One persistent loop at most — posters do not twitch. The loop's object is a source noun (or the brief's lens applied to one).

`prefers-reduced-motion`: pin every encoding to its **final** state. The graphic remains true.

## 3D

The **poster is flat** (orthographic). Do not `rotateX` / `perspective` the board — that pinches the top and warps the common-scale timeline (lie factor). Depth is a ≥28px paper drop-shadow only. Do not 3D-extrude bars.

## Non-negotiables

- **Every quantity uses position or length, or ISOTYPE counts.** Area/volume encodings fail the pack.
- **No pie, donut, gauge, or 3D chart.**
- **No fabricated numbers.** If the source has no magnitude, do not invent one — encode **count of named items** and **dates**.
- **Hover is extra.** The finding is visible in a PNG.
- **Table twin required.**
- **Craft floor:** `:focus-visible`, `::selection`, reduced-motion decompose.
- **No gold clone.** Palette, pattern, glyphs, and layout come from this source (+ brief).

## Cut list (in addition to the shared cut list)

- Dashboard chrome (status dots, terminals, `ENV PROD`).
- “10 amazing facts” numbered clip-art lists.
- Enlarged pictograms meaning “more”.
- Rainbow choropleth with no midpoint.
- Truncated bar axes.
- Stock Lucide/Font Awesome icons.
- Requiring a tooltip to learn the number.
- Shipping the Texas gold CSS **or composition** on a non-Texas source (inset `.board` frame, `01 /reimagine-it infographic` kicker, Priestley-because-gold).
- Dropping leftover user words because they are not a named domain.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-infographic/index.html`

Gold (Texas notebook example only): `gold/domains/infographic/after.html`

## Verify

- A client can state the question and the finding from one screenshot.
- Timeline/bars share a common scale (inspect SVG coordinates).
- ISOTYPE units are equal size; count matches the caption.
- Data table numbers equal the visual.
- Reduced-motion screenshot still shows the final encoding.
- Palette and glyphs would be wrong on a different source (proof they were derived).

## Report addition

```
DNA: <palette family + repeating pattern + glyph nouns, all from this source>
Brief: <leftover phrase, or none>
Motif: common-scale encoding + ISOTYPE unit count + custom source glyphs
Make-strange: <what this source became as a poster>
Tone: paper, countable, labeled, still-true
Structure: list | sequence | hierarchy | compare | values | relation
Layout: portrait-grid | star | small-multiples | priestley-timeline | landscape | spiral
```
