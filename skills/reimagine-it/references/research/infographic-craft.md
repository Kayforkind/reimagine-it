# Infographic craft — 15 sources, distilled for `/reimagine-it`

Accessed 2026-08-20. Depth: **standard** (15 fetched sources, techniques not blurbs). Load this pack when the form or domain token is `infographic`. The executable contract is [domains/infographic.md](../domains/infographic.md).

## Contradiction to hold, not flatten

**Tufte** (S02) wants maximum data-ink and no decoration. **Lupi** (S07–S08) wants density, custom glyphs, and “embrace complexity.” Both are right for different jobs.

- Encodings follow Tufte / Cleveland–McGill: **position and length**, not area pies, not 3D charts, no truncated axes without a label.
- Voice follows Lupi: **custom marks derived from the source nouns**, context written on the graphic, uncertainty admitted. Density is legal **only if every mark maps to an anchor**.

Cheap marketing infographics (big number + clipart + 3D pie) fail both sides. That is the cut list.

## Encoding floor (always)

Cleveland & McGill 1984 ranking, most → least accurate for quantity (S01, S03):

1. Position along a **common** scale (dot plot, aligned bars, timeline)
2. Position along **non-aligned** identical scales (small multiples)
3. Length / direction / angle
4. Area (bubbles, treemaps) — avoid for comparison
5. Volume / curvature — ban
6. Shading / saturation — pattern detection only, never precise compare

**ISOTYPE rule (S04):** a larger quantity is **more copies of the same-size pictogram**, never a bigger pictogram. Count beats scale.

**Color (S15):** sequential (one hue, light→dark) for ordered magnitude; diverging (two hues through a midpoint) only when the midpoint is meaningful; qualitative hues for categories. Never rainbow for continuous data. Never color-alone for a series (S10–S12).

## Layout router (pick one from the source)

From InfoAlign’s six storytelling layouts (S13) plus the newsroom taxonomy (S16):

| Source shape | Layout | Why |
|---|---|---|
| Dates / sequence | **Portrait** timeline (Priestley / circle-timeline) | Position on a common year axis |
| 2–3 categories to compare | **Grid** of small multiples | Non-aligned identical scales |
| One object, many attributes | **Star** (center weenie + radiating facts) | Gestalt common-region |
| Mix of hero claim + supporting facts | **PortraitGrid** | Single SP on top, grid below |
| Geography in the source | Location schematic + **dot density / pins** | Snow 1854 pattern (S05) — spatial argument, not a basemap flex |
| Flow / campaign / conversion | **Sankey / Minard flow** only if the source has flow | Width = quantity (S05) |

Do not pick spiral unless the source’s own metaphor is a spiral. Do not pick anatomical unless the source is a body/machine.

## Interaction (web)

- The graphic must be **true in a still** (S10: do not require hover to get the point).
- Sticky-figure scrollytelling (S14) is allowed as a stretch, not the floor. Reduced-motion: stack figure above each step.
- SVG marks are DOM nodes (S11–S12). Canvas/WebGL infographics need a **data table** fallback; prefer SVG.
- Floor: `<figure>` + `<figcaption>` + visually-hidden or visible `<table>` of the same numbers (S10, S12). `role="img"` + `<title>`/`<desc>` on decorative SVG.

## The 15 sources

| ID | Source | Type | What we took |
|---|---|---|---|
| **S01** | Cleveland & McGill, *Graphical Perception*, JASA 79(387), 1984. PDF: faculty.washington.edu/aragon/…/cleveland84.pdf | Primary experiment | Encoding rank. Prefer position/length. |
| **S02** | Tufte, *The Visual Display of Quantitative Information*, 1983 (via Textbook of Usability ch. 14, 2026) | Canonical book | Data-ink, lie factor, small multiples, sparklines. Ban chartjunk and 3D effects. |
| **S03** | Bertin, *Semiology of Graphics*, 1967 (via Textbook of Usability) | Canonical book | Visual variables: position, size, shape, value, colour, orientation, texture. Map **one variable per channel**. |
| **S04** | Neurath / Arntz, ISOTYPE (Vienna Method, 1925–); Wikipedia Isotype, accessed 2026-08-20; Neurath *International picture language* 1936 | Primary method | Repeat same-size pictograms. No perspective. Helping language, always with words. |
| **S05** | Minard 1869 Napoleonic flow map; John Snow 1854 Broad Street dots (Textbook of Usability) | Historical gold | Multivariate in one figure (Minard); spatial clustering as argument (Snow). |
| **S06** | Cairo, *The Truthful Art*, 2016 (cited S02 chapter) | Ethics | Form follows the question. Do not dumb complexity into two pictograms. |
| **S07** | Giorgia Lupi, *Data Humanism* manifesto, PrintMag / giorgialupi.com | Primary essay | Past “peak infographics.” Sketch before templates. Sneak context in. Data is imperfect. |
| **S08** | Nightingale (DVS), “The Data We Do Not See,” Lupi interview | Practitioner | Complexity vs data-ink: visualisation should make reality **accessible**, not simpler than it is. |
| **S09** | Financial Times Visual Vocabulary, github.com/Financial-Times/chart-doctor/visual-vocabulary | Newsroom tool | Pick the chart from the **question** (change over time, magnitude, part-to-whole, correlation, spatial, flow) not from a template gallery. |
| **S10** | U.S. Web Design System, Data visualizations, designsystem.digital.gov | Gov a11y | Prefer common chart types. ≤2–3 concepts per graphic. Plain-language takeaway. Hidden data table. No hover-required message. |
| **S11** | Accessibility.build, Accessible Charts (SVG, WCAG 2.2) | Engineering | Chart = picture of data; accessible version **is the data**. Never series-by-colour-alone. Tooltips on focus (1.4.13). |
| **S12** | Accessible-data-interfaces.com + IDV Guide (SVG vs Canvas) | Engineering | SVG gets a11y tree for free. Canvas/WebGL need a DOM proxy. Dual-layer: visual + semantic table. |
| **S13** | InfoAlign, arXiv 2602.22901 (2026) | Layout research | Six storytelling layouts: Grid, Star, Portrait, Landscape, PortraitGrid, Spiral. |
| **S14** | scrollytelling.ai design patterns; Segel & Heer “martini glass”; NYT sticky-viz case (datafield.dev) | Interaction | Sticky figure + stepped text. Message first, format second. Reduced-motion stacks. |
| **S15** | Datawrapper, “When to use sequential and when to use diverging color scales” | Color | Sequential for “highest is the story”; diverging only with a real midpoint **and** a legend. |

Supporting (not counted in the 15): Visme layout taxonomy (statistical / timeline / process / comparison / anatomical) as a content-type alias of S13; Stephen Few dashboards — **do not** turn an infographic into a dashboard (that is the `dashboard` domain).

## Must ship in every infographic draw

1. **One question** the graphic answers, written as a sentence in the kicker.
2. **Encoding from S01** for every quantity (position or length; ISOTYPE counts for discrete units).
3. **Custom glyphs from source nouns** (S04 + S07) — not Lucide/FontAwesome generic icons.
4. **Takeaway in words** next to the figure (S10).
5. **Data table** of the same numbers (visible or `.sr-only`).
6. **Craft floor** (focus-visible, `::selection`, reduced-motion decompose).
7. **Still-readable** — hover is extra, never the payload.

## Must not

- 3D pies, gauges, truncated bars, rainbow choropleths
- Enlarged pictograms for “more”
- Fabricated KPIs
- Clip-art that does not map to an anchor
- Requiring a mouse to learn the finding
- Confusing this domain with `dashboard` (ops screen) or `artistic` (editorial cover)
