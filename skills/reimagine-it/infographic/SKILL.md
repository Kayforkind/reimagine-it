---
name: reimagine-it-infographic
description: >-
  Content-derived infographic poster — reads the source file and builds a
  statistical poster from the facts already in it. Not a dashboard, not a CV,
  not an AntV template. Uses common-scale encodings (Cleveland–McGill floor),
  ISOTYPE unit counts (Neurath), custom data glyphs (Lupi/Fragapane),
  and a lossless data table. Palette, glyphs, and composition are derived
  from the source's own content. No pies, donuts, gauges, 3D charts, or
  fabricated KPIs. Part of the reimagine-it Content-Derived Design suite.
license: MIT
metadata:
  author: Kayforkind
  version: "2.9.0"
  parent: reimagine-it
  hosts:
    - claude-code
    - cursor
    - codex
    - copilot
    - gemini-cli
keywords:
  - infographic
  - data-visualization
  - statistical-poster
  - isotype
  - content-derived-design
  - cleveland-mcgill
  - tufte
  - data-humanism
category: Design
capabilities:
  - infographic-creation
  - data-visualization
  - statistical-poster-design
  - isotype-generation
  - custom-glyph-creation
trigger_phrases:
  - /reimagine-it infographic
  - make an infographic
  - create a data poster
  - statistical poster
  - visualize this data
  - info graphic
---

# /reimagine-it infographic

**Parent:** [../SKILL.md](../SKILL.md) — the full Content-Derived Design engine.
**Research pack:** [../references/research/infographic-craft.md](../references/research/infographic-craft.md) — 15-source infographic method (Cleveland–McGill, Tufte, Bertin, ISOTYPE, Minard/Snow, Cairo, Lupi, FT Visual Vocabulary, USWDS, WCAG charts, InfoAlign layouts).
**Domain pack:** [../references/domains/infographic.md](../references/domains/infographic.md) — the infographic domain non-negotiables.

Builds a **statistical poster of facts already in the source** — not an ops dashboard, not a CV, not an AntV template clone.

## Hard non-negotiables

1. **Cleveland–McGill perceptual ranking.** Position along a common scale > length > angle > area > volume > color saturation. Encode the most important comparisons as positions, not pies.
2. **ISOTYPE unit counts** when the data is discrete countable things (Neurath: one pictogram = N units, repeated, not scaled).
3. **Custom glyphs from the source.** Lupi/Fragapane pattern — draw a visual alphabet from the data itself (leaves, braids, snakes, whatever the content demands), not generic bar/pie/donut.
4. **Lossless data table.** Every chart has a companion table; the infographic is a supplement to the data, not a replacement.
5. **No pies, donuts, gauges, or 3D charts.** Pie charts rank last in Cleveland–McGill; donuts are pies with the center punched out (worse); 3D distorts perception.
6. **No fabricated KPIs.** Every number on the poster comes from the source, not extrapolated or invented.

## Structure router

Before drawing, sniff the source and lock a **structure**:

| Structure | When | InfoAlign scenery |
|-----------|------|-------------------|
| `list` | Unordered peers | grid, star |
| `sequence` | Steps / dated beats | portrait, landscape |
| `hierarchy` | Tree / nesting | portrait |
| `compare` | Two+ groups | portrait-grid |
| `values` | Magnitudes | portrait-grid |
| `relation` | Nodes + edges the source names | spiral |

**Do not default to gold Texas (sequence+compare on portrait-grid).** Derive from THIS source.

## Procedure

1. Load [../references/research/infographic-craft.md](../references/research/infographic-craft.md) and [../references/domains/infographic.md](../references/domains/infographic.md).
2. Extract anchors from the source (3–5 concrete nouns, dates, numbers).
3. Route the structure (list/sequence/hierarchy/compare/values/relation).
4. Pick InfoAlign scenery (grid/star/portrait/landscape/portrait-grid/spiral).
5. Derive palette from source content (≤ 5 colors).
6. Build a custom visual alphabet from one datapoint.
7. Encode comparisons using common-scale positions (not pies).
8. Include a lossless data table below the poster.
9. Verify: every number traceable to source, no fabricated KPIs, no AntV template chrome.

## Must not

- Clone gold Texas infographic's scenery or poster chrome onto a different source
- Use a pie chart, donut, gauge, or 3D chart
- Invent statistics the source does not contain
- Use AntV/Looker/Datawrapper templates
- Skip the structure router and default to portrait-grid
- Ship without a lossless data table