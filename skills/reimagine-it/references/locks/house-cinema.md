# Lock: house-cinema

Source: `gold/domains/cinematic/after.html` (captured 2026-08-19)  
Extracted by: `/reimagine-it lock` v2.0  
Applies to: `webpage`, `slides` (via cross-medium table), `pdf` (via cross-medium table)

## Palette (5 + 1 accent)

- `--void`   `#05070c` — 68% of pixels; background
- `--panel`  `#0f1420` — 12%; secondary background, card fills
- `--ink`    `#ecf1ff` — text on `--void`
- `--dim`    `#7c8aa8` — meta / monospace labels
- `--beam`   `#7cf3ff` — primary accent, shader tint, hair-thin rules
- `--ember`  `#ff7a5c` — warm single moment (name, ampersand, cursor, hover)

Alpha overlays used:
- `rgba(124,243,255,.14)` for the middle card's colored shadow
- `rgba(255,111,92,.25)` for hover glow

## Type stack

- **Display:** `ui-sans-serif, system-ui, "Segoe UI Variable Display", "Segoe UI", Inter, sans-serif` at 96–200 px, tracking `-0.04em`, line-height `0.86`
- **Stress:** `"Iowan Old Style", Palatino, Georgia, serif` italic — used only for the ampersand and one stress word
- **Body:** same sans as display, 15–17 px
- **Meta:** `ui-monospace, SFMono-Regular, Consolas, "JetBrains Mono", monospace`, 11 px, tracking `0.24em`, upper

## Motifs

1. **Numbered section rail** (`00 · MASTHEAD / 01 · PIECES / 02 · SIGNAL / 03 · NOW / 04 · CONTACT`) in mono `--dim`; sticky at top.
2. **Ember cursor / ember ampersand.** One warm mark carrying the "alive" cue.
3. **Live shader in a rounded rect stage.** WebGL2 fragment shader, raymarched interference field, `--beam` and `--ember` mixed by domain warp.
4. **Coloured card shadow** for the middle (elevated) card only — colored shadow = accent glow. Outer cards use black shadows.

## Motion signatures

- **Persistent:** WebGL shader running continuously; the shader's `t` uniform advances at real time. Cursor blinks (`1.05s steps(2)`), ember cursor pulses.
- **Active:** cards on hover lift to `translateZ(50px)` with a `--beam` alpha 0.22 glow shadow.
- **Narrative:** stat bars `scaleX(0) → scaleX(var(--w))` on load, `1.6s cubic-bezier(.2,.7,.2,1)`. Chart sweep bar `left: -2% → 102%` in `4.5s linear infinite`.

## 3D signatures

- **Stage:** `perspective: 1400px` on the container.
- **Cards fan:** outer `rotateY(±9deg) rotateX(-3deg) translateZ(-8px)` with 40–60 px black shadow. Middle `translateZ(30px)` with 90 px shadow + 60 px colored glow.
- **Hover peak:** any card to `translateZ(50px)`, colored glow doubles.

## Section structure

1. `00 · MASTHEAD` — shader hero with kicker + title (italic ember `&`) + subtitle + cursor
2. `01 · PIECES` — three-card row (title + description + inline SVG plate + foot meta)
3. `01 · PIECES` stats — four monospace KPI tiles with animated bars
4. `02 · SIGNAL` — one 12-week chart with sweep line + pulsing accent dots
5. `03 · NOW` — three-card row (current focus, short-form)
6. `04 · CONTACT` — terminal card (prompt + subject + body with type cursor)
7. Footer — three meta pills

## Voice notes

Sans display carrying the weight; italic serif only where warmth is required (single ampersand, one stress word). Monospace does all the meta / labels / kickers. `--ember` is precious — never used for a whole word except the ampersand and the cursor. `--beam` is the *page* mood; `--ember` is the *moment* mood. Every section has a number, a kicker, a title, and a right-aligned meta count — the "section rail" repeats this pattern.

## Cross-medium translation table

| Element | webpage | slides (pptx) | pdf (ReportLab) |
|---------|---------|---------------|-----------------|
| Background | `--void` full page | Slide master fill `--void` | Full-bleed page bg `--void` |
| Display type | Sans 96–200 px, tracking `-0.04em` | Sans 54 pt title | Serif+sans mix; cover 44 pt sans |
| Ember stress | Italic serif `&` in `--ember` | Slide title with one italic serif accent word in `--ember` | Cover: italic serif word inline |
| Shader hero | WebGL2 canvas 840×520 | PNG snapshot of the shader as slide 1 background; live shader not available | Same — snapshot as cover page bg |
| Card fan (3D) | CSS perspective + rotateY | Three shapes with paired shadows; static perspective | Three panels; use ReportLab layered rects w/ shifted shadows |
| Chart sweep | Animated SVG sweep line | reveal.js fragment / PowerPoint entrance | Static chart with an ember accent at last data point |
| Motion beats | Shader tint / cursor blink / bar rise | Slide-in fragments; ember cursor as animated GIF or slide-master shape | Static; keep sweep-line frozen at 70% |

## Applying this lock

```
/reimagine-it webpage --ref house-cinema
/reimagine-it slides --ref house-cinema
/reimagine-it pdf --ref house-cinema
```

The skill loads this pack as if it were a domain, then follows the cross-medium translation table when the target medium differs from the source.
