# /awe-me webpage portfolio

Load only when the user token is `portfolio`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

Alias-ish of the sober default in `../webpage-craft.md`, but with a bigger hero and each project treated as a full "study" rather than a card.

## Aesthetic in one sentence

A designer/developer portfolio: a wide hero with a strong opinion in one line, one full "study" per project (image + one page of prose + one code or process snippet + outcomes list), and a compact end colophon.

## Palette (five, do not exceed)

Follow the shared spine palette rule. Slight bias toward one warm accent that carries through every study.

## Type

- Hero display: 56–96px, tight tracking.
- Study title: 32–48px.
- Body: 15–17px, measure ≤ 65ch.
- Meta: monospace, 11px.

## Motif and layout

- Hero: name + one-line opinion + one meta strip (`based in · working on · reach me`).
- Per study (one per project, full width):
  - Title, year, medium, outcome one-liner
  - One inline SVG that shows the project's shape (chart, diagram, screenshot-in-SVG, or a real inline mini-viz)
  - Body: 2–3 paragraphs, no lorem
  - Outcome list: 3 bullet items, each with a real number if possible
- End colophon: 3-column footer with Address, This week, Elsewhere (same as photography).

## Non-negotiables specific to portfolio

- **One study per project. Not a card grid.** If you have 6+ projects, sort by outcome and keep the top 3–4 as studies; the rest live in a compact monospace index at the bottom.
- **Every study has an inline SVG doing real work.** Diagram, chart, mini-viz, not a decorative flourish.
- **Outcome list must have at least one measurable number** per study (`4,300 files`, `8k loc`, `page 214`).

## Cut list

- A grid of 12 identical project cards.
- Auto-playing video hero.
- "Awards" strip.
- "Skills" bar chart. Skills belong in the prose of the studies.
- LinkedIn embed.

## Where to write

`<workspace>/awe/<yyyy-mm-dd>-portfolio/index.html` for a one-shot; in place for an existing portfolio.

## Report addition

```
Motif: one full study per project + inline SVG per study
Make-strange: no card grid — every project is a spread
Tone: opinionated, measurable, quiet
```
