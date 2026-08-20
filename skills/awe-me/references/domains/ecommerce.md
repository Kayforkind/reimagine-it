# /awe-me webpage ecommerce

Load only when the user token is `ecommerce`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

Spec pack — no live gold yet. Ship the first artistic gold under `gold/domains/ecommerce/after.html` when a stranger asks for it.

## Aesthetic in one sentence

A quiet product store: one product per plate, big SVG hero art (never a stock photo), a price ladder, a real short review pulled as type, one clear CTA per plate, and a cart strip that lives at the top and never chases.

## Palette (five, do not exceed)

- `--paper` warm off-white or cool near-black (pick one; do not do both)
- `--ink` opposite of paper
- `--accent` primary CTA color (used for cart button, price rings)
- `--dim` for meta
- `--rule` hairline for the price ladder and cart strip border
- Optional sixth `--sale` only if there is an actual sale to declare

## Type

- Product title: display serif or heavy sans, 48–96px, tight tracking.
- Price: monospace, 24–36px, tabular numerals (`font-variant-numeric: tabular-nums`).
- Body: 15–17px, measure ≤ 55ch.
- Review pull-quote: italic serif at 22–28px, ≤ 20ch measure.

## Motif and layout

- Top cart strip: brand · category count · a monospace `2 items · $148` chip with a live pulse on quantity change. Never overlay a modal on top of content.
- One product per plate: 5–8 plates stacked vertically. Each plate is a two-column: SVG hero art on one side, product story + price + CTA on the other. Alternate sides.
- **SVG hero art per plate.** Compose it. No stock photography, no bland product mockups, no shadowed 3D perspective from Figma. Real inline `<svg>`.
- Price ladder: `Base · With warranty · With install`. A tiny SVG stepped bar shows the three tiers.
- **One clear CTA per plate.** `Add to cart` in the accent color as the only strong button on that plate.
- Review pull-quote per plate: one real short review as italic serif, attributed to a first name + city, never a fake avatar farm.

## Non-negotiables specific to ecommerce

- **Tabular numerals on every price.** Prices align.
- **One CTA per plate.** No secondary "Learn more" button that competes.
- **Cart strip does not scroll-jack.** Sticky top, do not animate on scroll.
- **SVG hero art** for at least the first three plates.
- **No countdown timer.** No `Only 2 left` scarcity theater unless the source data says so.
- **No pop-up newsletter modal.**

## Cut list (in addition to the shared cut list)

- A hero carousel that auto-advances.
- Trust badges that link to `#`.
- Fake review avatars.
- A cart badge that vibrates.
- Confetti on add to cart.
- "As seen in" logo strip.

## Where to write

`<workspace>/awe/<yyyy-mm-dd>-store/index.html` for a one-shot. In place if the user is redesigning an existing product page.

## Report addition

```
Motif: one product per plate + SVG hero art + a price ladder step chart
Make-strange: reviews as italic pulled type instead of star ratings
Tone: quiet retail, no scarcity theater, one CTA per plate
```
