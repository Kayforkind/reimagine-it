# /awe-me webpage artistic

Load only when the user token is `artistic`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

## Aesthetic in one sentence

A warm-paper editorial: italic serif display type at magazine scale, a disciplined but colorful five-color palette, drifting SVG arcs behind the masthead, and cards that tilt in CSS 3D just enough to feel handled.

## Palette (five, do not exceed)

- `--paper` cream #fdf5e9
- `--ink` deep aubergine #2d1a3d
- `--coral` #ff6f5c (primary accent, italic ampersand, callouts)
- `--ochre` #e8a94a (art plates, warm secondary)
- `--violet` #7a3fb2 (link, subhead lift)
- `--blush` #f2b8b0 (art shadows, marble dots)

## Type

- Display: italic serif (`"Iowan Old Style", Palatino, Georgia, serif`), 88px–180px, tight tracking `-0.03em`, line-height `0.9`.
- Section: same serif italic, 36px.
- Body: sans (`ui-sans-serif`), 15–18px.
- Meta / labels: monospace, 11px, tracking `0.24em`, uppercase.
- Ampersand and stress words in coral, italic, weight 700.
- Last-name treatment as a heavy sans block-caps line under the italic first line ("RIVERS" under "Jordan & the small machines").

## Motif and layout

- Ambient background: three drifting `<g>` groups of concentric circles / ellipses / a hand-drawn curve, each with a slow `@keyframes` rotate. Absolute-positioned, `z-index: 0`, `pointer-events: none`.
- Marble accent (four dots in coral / ochre / violet / blush) as a running mark, bobbing on a 4s ease-in-out infinite.
- One "stage" that holds three SVG art plates for the three projects. Each plate is a real composition, not decoration:
  - `quiet-week` — landscape with sun and ledger lines
  - `lantern` — blueprint page with a diagonal stroke
  - `rift` — grid-of-squares over a warm ground
- Cards below the stage carry pill "year badges" that overlap the top edge.

## Non-negotiables specific to artistic

- **Serif display type must be italic in the masthead.** No exceptions. This is the tone of the whole page.
- **At least one SVG group with a keyframes animation** in the ambient layer.
- **Perspective + rotateY on cards.** The middle card lifts (`translateY(-10px)`); the outer cards tilt symmetric.
- **No emoji.** No pattern-photography from an image bank. No paid image API.

## Cut list (in addition to the shared cut list)

- Gradient washing across the whole page. A whole-page gradient hides the paper.
- Blur / glassmorphism on the ambient layer.
- Cards floating in space with drop shadows on a gradient bg.
- More than one CTA. There is one contact pill.

## Where to write

`<workspace>/awe/<yyyy-mm-dd>-artistic/index.html` when the leap is a one-shot seeing-tool. In place if the user already has a personal page and asked for a redesign.

## Verify

- Ambient layer renders in a headless screenshot (compare against `gold/domains/artistic/after.png`).
- Cards visibly tilt (CSS 3D perspective) — check by rendering at 1400 wide.
- Three SVG art plates are three different compositions, not the same shape three times.

## Report addition

```
Motif: drifting concentric arcs + a single running marble strip
Make-strange: three project cards as SVG art plates instead of thumbnails
Tone: warm-paper editorial, italic serif at magazine scale
```
