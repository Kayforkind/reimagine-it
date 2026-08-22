# /reimagine-it svg

Load when the user forces `svg`, or the router picks a weenie. Gold: [`gold/forms/svg/after.svg`](../../../gold/forms/svg/after.svg).

This is a **mark**, not a captioned webpage saved as `.svg`.

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

## Motion

CSS on `transform` / `stroke-dashoffset` only. `prefers-reduced-motion: reduce` kills it. Do not animate `x`, `y`, `width`, `font-size`.

## Must not

- Mermaid, Graphviz, or a PNG renamed `.svg`
- Labels on the map / on the weenie / on the ISOTYPE row
- Invented numbers
- Google Fonts `@import`
- A second weenie fighting the first

## Proof

File opens. Weenie reads at ~200 px. Screenshot: no overlapping type. Report `partial` if a label sits on a mark.
