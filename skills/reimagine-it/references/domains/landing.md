# /reimagine-it webpage landing

Load only when the user token is `landing`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

Spec pack — no live gold yet. Ship the first landing gold under `gold/domains/landing/after.html` when a stranger asks for it.

## Aesthetic in one sentence

One promise, one CTA, one proof strip, one single-viewport magnet. No mega-menu graveyard, no ten-section "features" scroll, no five-tier pricing table stacked on top.

## Palette (five, do not exceed)

- Whatever the product is; the constraint is five colors, one accent, contrast checked.

## Type

- Display: heavy sans 56–96px, tight tracking, one clear promise.
- Sub-promise: 18–22px, ≤ 60ch, one sentence, no bullets.
- Meta / kicker: monospace, 11px, uppercase.

## Motif and layout

- Single viewport (1440×900) holds the whole magnet — promise, sub-promise, CTA, one proof, and a small "how it works" glyph strip.
- Above the fold: nothing else. No hero image carousel, no dev-tool logos, no cookie banner.
- One inline SVG that IS the demonstration of the product (chart, terminal, mini-widget, whatever the product does). Not decoration.
- One CTA. Not a "primary" and "secondary" that fight.
- Proof strip below the fold: 3 real quotes with real attribution, or one live number ("shipped 4,300 files").

## Non-negotiables specific to landing

- **One promise, spelled in one sentence.** If it takes two sentences, cut.
- **One CTA above the fold.** One below in the proof strip if you want.
- **The hero SVG must do the product's thing.** A chart on a chart tool. A code sample on a code tool. A widget on a widget tool.
- **Zero mega-menu.** Optional linkbar with ≤ 4 items.
- **Zero cookie banner** in the gold. Add later if the real deployment needs it.

## Cut list (in addition to the shared cut list)

- Auto-advancing testimonial carousel.
- "As seen on" logo strip that is not real.
- A five-column pricing table above the fold.
- A launch confetti animation.
- Sticky chat widget in the bottom-right.
- Gradient purple background that says nothing.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-landing/index.html` for a one-shot. In place if the user has an existing landing page.

## Report addition

```
Motif: one-viewport magnet + one inline SVG that IS the product
Make-strange: the hero SVG demonstrates the product doing the thing
Tone: one promise, one CTA, no graveyard
```
