# /reimagine-it webpage \<domain\> brutalism *(spec)*

Load only when the user token is `brutalism` (or `--style brutalism`). Spec-only for v2 — no gold yet; use the checklist below and ship your own.

## Aesthetic in one sentence

Exposed structure: raw system fonts, visible grid lines, hard 90° corners, high contrast blocks, no decoration that hides how the page is built.

## Non-negotiables

- Zero `border-radius` (or a single, deliberate exception).
- Zero drop shadows. Depth is via z-order + hard block color, not softness.
- Type: monospace or unstyled system serif at large sizes (100px+ display).
- Visible grid lines (1px `--rule`, always the same weight).
- One or two block colors (black, off-white, one warm accent).
- Section IDs and grid coordinates are *shown* in the meta line — the page tells you where you are inside the grid.
- No hover animations that hide the underlying structure.

## Cut list

- Rounded cards, gradient backgrounds, glow, blur.
- Icon farms.
- Fake "hand-drawn" borders.
