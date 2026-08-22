# /reimagine-it svg

Load when the user forces `svg`, or the router picks a weenie. Gold: [`gold/forms/svg/after.svg`](../../../gold/forms/svg/after.svg).

This is a **living mark**, not a captioned webpage saved as `.svg`, and not a paper poster (that is `infographic`). Pick this form when the source should **breathe** — micro-motion that beautifies the read.

## Why this form exists

| They want | Form |
|-----------|------|
| A statistical poster (still argument) | `infographic` |
| A mark that lives in a README / slide / HUD | **`svg`** |
| A room they can orbit | `3js` |
| Time actually passing | `simulation` |

Default is **alive**. Brief `still` / `no-motion` / `print` freezes loops (layout laws still hold). Hover pairing may stay as instant feedback.

## Layout law (fail if broken)

1. **Type lives in the gutter.** A dedicated legend / title band holds every label. Pins, stars, rivers, maps, and ISOTYPE units carry **no** sitting text.
2. **No overlap.** No label crosses a path, another label, or a weenie. 1836 and 1839 on a century axis are too close for two strings — cluster them, or leave the near tick unlabeled and name it in the legend.
3. **Air.** ≥ 16 px between a mark and the nearest type. ≥ 24 px between stacked labels. The weenie has ≥ 15% empty field around it.
4. **One weenie.** The first glance is one silhouette (flag, beast, tool, handshake). Supporting marks are quieter.
5. **Chrome off the art.** No `/reimagine-it svg · from path/to/file` painted on the drawing. Source goes in `<title>` / `<desc>`.

## Color

- Palette from the source only (the Texas notebook → navy `#1a2138`, cream `#f4ecd8`, star-red `#b22234`, gold `#e8a63f`).
- Prefer **flag geometry** (canton + bars + star) over a circle-with-a-star clipart.
- Fills do the talking. Do not outline every shape in the same navy stroke.

## Alive-micro (default motion budget)

Ship **2–4 infinite loops**, no more. Each loop maps to an **anchor** from step 0.85. First keyframe is the rest pose so a still (README, GIF plate, print) still reads.

Pick from this menu — do not invent a fifth class:

| Loop | CSS (compositor-only) | Maps to |
|------|------------------------|---------|
| **weenie-breathe** | `transform: scale(1 → 1.04)` on the weenie group; `transform-origin` at its center | the magnet |
| **flow** | `stroke-dashoffset` on a path that *is* water, wire, or a handshake in the source | a verb |
| **magnet-ping** | `transform: scale(1 → 1.22)` on **one** pin / tick (the story’s place or date) | a place or year |
| **quiet-tick** | `opacity` pulse on a clustered unlabeled tick (named in the gutter) | a date too close to label |

Entrance stagger (ISOTYPE fade-in) is allowed as a **one-shot** that ends at opacity 1. Do not loop the whole row.

**Hover pairing (the beautify move).** Use `:has()` so the field and the gutter answer each other — hover a pin, its legend swatch scales; hover a legend row, its pin scales. `transition: transform 150–180ms ease-out` on the swatch. Do not slide labels onto the map.

```css
.pin { transform-box: fill-box; transform-origin: center; }
svg:has(.row-alamo:hover) .pin-alamo,
.pin-alamo:hover { animation: none; transform: scale(1.32); }
svg:has(.pin-alamo:hover) .row-alamo .swatch { transform: scale(1.25); }
```

**Properties.** `transform`, `opacity`, `stroke-dashoffset` only. Never `x`, `y`, `width`, `height`, `font-size`, `fill`, or `color` as the animated property (a fill change is a recolor loop — fail).

**Reduced motion.** `@media (prefers-reduced-motion: reduce)` kills infinite loops. Keep hover/focus scale as **instant** feedback (duration 0.001ms or none). Do not blank the graphic.

**Opt out.** Leftover brief `still` / `no-motion` / `print` → no infinite loops. Pairing hover may remain.

## Must not

- Mermaid, Graphviz, or a PNG renamed `.svg`
- Labels on the map / on the weenie / on the ISOTYPE row
- Invented numbers
- Google Fonts `@import`
- A second weenie fighting the first
- Bounce the `viewBox` or every mark at once
- SMIL that ignores `prefers-reduced-motion`
- More than four infinite loops
- Motion that leaves the first frame empty (stagger stuck at opacity 0)

## Proof

File opens. Weenie reads at ~200 px. Screenshot: no overlapping type. Two frames ~600 ms apart differ unless the brief was `still`. Report `partial` if a label sits on a mark, or if the pack claims alive and the hashes match.
