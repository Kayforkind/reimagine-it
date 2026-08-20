# /reimagine-it webpage \<domain\> handdrawn *(spec)*

Load only when the user token is `handdrawn` (or `--style handdrawn`). Spec-only for v2.

## Aesthetic in one sentence

Every stroke looks like a person made it once — SVG paths with visible wobble, hand-lettered display type, sketchy borders that never repeat exactly.

## Non-negotiables

- All decorative lines are SVG paths with `stroke-linecap="round"`, `stroke-linejoin="round"`, and a subtle `filter: url(#wobble)` distortion (feTurbulence + feDisplacementMap).
- Display type is a hand-lettered family (system: `"Caveat", "Kalam", "Patrick Hand", cursive`; overridable via `--font`).
- Borders are drawn (`stroke-dasharray`), not CSS.
- Every repeated element (bullets, dividers, marks) has a slightly different rotation or stroke width — no two are exactly identical.
- One color pencil accent (usually red or blue) for stress marks and callouts.

## Cut list

- Comic Sans as the display type.
- CSS `border: 1px dashed`. Draw borders in SVG.
- Cartoon emoji.
- Photorealistic anything on the page (breaks the drawn illusion).
