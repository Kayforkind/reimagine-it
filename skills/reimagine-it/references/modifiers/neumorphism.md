# /reimagine-it webpage \<domain\> neumorphism *(spec)*

Load only when the user token is `neumorphism` (or `--style neumorphism`). Spec-only for v2.

## Aesthetic in one sentence

Soft-pressed cards on a single-hue field — every element has paired inner-and-outer shadows so it looks embossed *out of* or pressed *into* the surface.

## Non-negotiables

- Single-hue background (`--surface`), everything else is tone-shifted from it.
- Every card uses two shadows: `box-shadow: -6px -6px 12px var(--light), 6px 6px 12px var(--dark)` where `--light` and `--dark` are `--surface` shifted ±10% luminosity.
- No hard borders. Depth is only from shadows.
- Contrast checked: paired shadows must not drop text-on-surface below WCAG AA.
- One accent (usually the primary CTA); the accent is *inset* (pressed-in) when active.

## Cut list

- More than one hue (kills the softness).
- Overuse — every element pressed is exhausting; use for cards and CTAs only.
- Neumorphism on a photo background.
- High-chroma accent color (too strong against the soft surface).
