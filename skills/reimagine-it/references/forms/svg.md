# /reimagine-it svg

Load when the user forces `svg`, or the router picks a weenie. Gold: [`gold/forms/svg/after.svg`](../../../../gold/forms/svg/after.svg) — **one draw of one Texas notebook**, not a skin.

This is a **living mark**, not a captioned webpage saved as `.svg`, and not a paper poster (that is `infographic`). Pick this form when the source should **breathe** — micro-motion that beautifies the read.

## This source, this run — not a template

Fail the run if a client could mistake the drawing for the Texas gold when the source is not that notebook.

| Layer | From this source | Never from |
|-------|------------------|------------|
| **Weenie** | The one silhouette *this* file is about (flag, beast, tool, handshake, press, cup) | Lone Star flag geometry |
| **Field** | Places, dates, magnitudes named here | Schematic Texas, Rio Grande, Alamo / Austin / Big Bend pins |
| **Palette** | Named colors, materials, inks, habitats in the text | Navy `#1a2138` / cream `#f4ecd8` / star-red / gold unless *this* source names those |
| **Loops** | 2–4 loops mapped to *this* file's anchors | Star-breathe + river-dash + Alamo ping + 1839 tick |
| **Type** | Legend names from this source | "Alamo · 1836 · 19-day siege" |

A second run on the **same** source is still a new draw (weenie, ground, which loops) unless `--seed` / `--variant` pinned it.

## Open brief (leftover words)

Unknown words after known tokens are a **creative lens**. Follow them. Reweight ground, motif, pattern, type, which loops run. Do not invent facts. Leftover `still` / `no-motion` / `print` freezes loops (layout laws still hold). Hover pairing may stay.

```
/reimagine-it svg
/reimagine-it svg <any words the user typed>
```

## Why this form exists

| They want | Form |
|-----------|------|
| A statistical poster (still argument) | `infographic` |
| A mark that lives in a README / slide / HUD | **`svg`** |
| A room they can orbit | `3js` |
| Time actually passing | `simulation` |

Default is **alive**.

## Layout law (fail if broken)

1. **Type lives in the gutter.** A dedicated legend / title band holds every label. Pins, weenies, rivers, maps, and ISOTYPE units carry **no** sitting text.
2. **No overlap.** No label crosses a path, another label, or a weenie. Two dates too close on a common axis: cluster them, or leave the near tick unlabeled and name it in the legend.
3. **Air.** ≥ 16 px between a mark and the nearest type. ≥ 24 px between stacked labels. The weenie has ≥ 15% empty field around it.
4. **One weenie.** The first glance is one silhouette from *this* source. Supporting marks are quieter.
5. **Chrome off the art.** No `/reimagine-it svg · from path/to/file` painted on the drawing. Source goes in `<title>` / `<desc>`.

## Color

- Palette from **this** source only.
- Prefer the source's actual weenie geometry (a flag if the source is a flag; a press if a press) over clipart.
- **Named public objects keep their real colors.** The Lone Star flag is a white star on blue, white over red — not a gold star on parchment. Accent gold belongs on ticks, pins, and rivers, not on the cloth. See [review.md](../review.md).
- Fills do the talking. Do not outline every shape in the same stroke.

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

**Hover pairing.** Use `:has()` so the field and the gutter answer each other — hover a pin, its legend swatch scales; hover a legend row, its pin scales. `transition: transform 150–180ms ease-out` on the swatch. Do not slide labels onto the field. Class names come from **this** source's nouns, not gold's `row-alamo`.

**Properties.** `transform`, `opacity`, `stroke-dashoffset` only. Never `x`, `y`, `width`, `height`, `font-size`, `fill`, or `color` as the animated property.

**Reduced motion.** `@media (prefers-reduced-motion: reduce)` kills infinite loops. Keep hover/focus scale as **instant** feedback. Do not blank the graphic.

## Must not

- Mermaid, Graphviz, or a PNG renamed `.svg`
- Labels on the map / on the weenie / on the ISOTYPE row
- Invented numbers
- Google Fonts `@import`
- A second weenie fighting the first
- Bounce the `viewBox` or every mark at once
- SMIL that ignores `prefers-reduced-motion`
- More than four infinite loops
- Motion that leaves the first frame empty
- **Clone the Texas gold** (Lone Star flag, schematic Texas, navy-cream-red-gold, eight acre mountains) onto a source that is not that notebook
- **Clone gold composition:** weenie-left / schematic-map-center / legend-gutter-right / Priestley-timeline-bottom. A shop is a cone or a menu, not a state map with scoops glued on.

## Gold (example only)

That notebook is a flag, three places, a river, and a century of dates. The gold therefore: flag weenie, unlabeled pins, 1839 as a quiet tick, eight acre units, those four loops. **Copy the method, not the scenery or the four-band layout.** Hover pairing in gold uses `.row-alamo` / `.pin-alamo` — rename to this source. A second gold (`gold/jules/forms/svg/`) is a stacked cone, not that map.

## Proof

File opens. Weenie reads at ~200 px and is *this* source's object. Screenshot: no overlapping type. Two frames ~600 ms apart differ unless the brief was `still`. Report `partial` if a label sits on a mark, if the pack claims alive and the hashes match, or if the drawing is the Texas gold wearing a new title.
