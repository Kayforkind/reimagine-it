# /reimagine-it webpage infographic

Load when the user token is `infographic` (as a **domain** after `webpage`, or as a **visual form**). Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)). Deep sources: [../research/infographic-craft.md](../research/infographic-craft.md).

This is **not** a dashboard. A dashboard is an ops screen you monitor. An infographic is a **poster of an argument** — one question, answered in marks you can read in a still.

## Aesthetic in one sentence

A vertical print-poster on paper (cream or ink, derived from content): a kicker that states the question, a hero encoding on a **common scale**, ISOTYPE unit-counts for discrete magnitudes, small multiples for categories, custom glyphs drawn from source nouns, a written takeaway, and a data table of the same numbers.

## Palette (five, do not exceed)

Derive from content. For the gold Texas notebook:

- `--paper` #f4ecd8 (parchment — flag white / prairie)
- `--ink` #1a2138 (navy — flag blue)
- `--rule` #c2b48c
- `--hot` #b22234 (star-red, sparse)
- `--gold` #e8a63f (sunset / star)

Qualitative hues for **categories** (places vs signals). Sequential navy→gold **only** if encoding ordered magnitude. No rainbow.

## Type

- Display serif for the question (32–56px).
- Mono 11px tracking `0.18em` uppercase for axis labels, units, sources.
- Body serif 16–18px for takeaways.
- Big numerals: mono or sans, **tabular** if possible, never decorative script.

## Motif and layout

Pick **one** layout from the source (see research S13):

- Dates in the source → **Portrait** Priestley timeline (position on a shared year axis).
- 3–8 comparable items → **Grid** of small multiples, identical y-scale.
- One object, many attributes → **Star** (center weenie + radiating facts).
- Hero claim + supporting facts → **PortraitGrid**.

Required anatomy:

1. **Kicker** — the question in one sentence.
2. **Hero encoding** — position or length on a common scale. Timeline, aligned bars, or dot plot. Never a pie.
3. **ISOTYPE strip** — at least one discrete quantity drawn as N copies of a same-size pictogram (Neurath: more copies, not a bigger icon).
4. **Custom glyphs** — SVG marks derived from source nouns (mission, ridge, capitol, star, flower, horn). No stock icon font.
5. **Takeaway** — one italic sentence that a screen reader and a still both get.
6. **Data table** — the same numbers, visible or `.sr-only`, inside `<figure>`.

## Motion

Compositor-only (`transform`, `opacity`):

- Timeline spine `scaleX` from origin on load (one beat).
- ISOTYPE units fade/stagger in.
- One persistent loop at most (a compass tick, a star pulse) — posters do not twitch.

`prefers-reduced-motion`: pin every encoding to its **final** state. The graphic remains true.

## 3D

A poster sheet: `rotateX(12deg)` **and** a ≥28px paper drop-shadow on the board (spine 3D floor). Do not 3D-extrude bars (lie factor).

## Non-negotiables

- **Every quantity uses position or length, or ISOTYPE counts.** Area/volume encodings fail the pack.
- **No pie, donut, gauge, or 3D chart.**
- **No fabricated numbers.** If the source has no magnitude, do not invent one — encode **count of named items** and **dates**.
- **Hover is extra.** The finding is visible in a PNG.
- **Table twin required.**
- **Craft floor:** `:focus-visible`, `::selection`, reduced-motion decompose.

## Cut list (in addition to the shared cut list)

- Dashboard chrome (status dots, terminals, `ENV PROD`).
- “10 amazing facts” numbered clip-art lists.
- Enlarged pictograms meaning “more”.
- Rainbow choropleth with no midpoint.
- Truncated bar axes.
- Stock Lucide/Font Awesome icons.
- Requiring a tooltip to learn the number.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-infographic/index.html`

Gold: `gold/domains/infographic/after.html`

## Verify

- A stranger can state the question and the finding from one screenshot.
- Timeline/bars share a common scale (inspect SVG coordinates).
- ISOTYPE units are equal size; count matches the caption.
- Data table numbers equal the visual.
- Reduced-motion screenshot still shows the final encoding.

## Report addition

```
Motif: common-scale timeline + ISOTYPE unit count + custom source glyphs
Make-strange: the notebook as a statistical poster, not a page of cards
Tone: paper, countable, labeled, still-true
Layout: portrait-grid | star | small-multiples | priestley-timeline
```
