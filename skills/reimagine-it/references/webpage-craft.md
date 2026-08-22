# Webpage craft (opinionated, load only for html form)

Load when the form router picks `html` / `infographic` / `webpage`, or when the user forced any of those, **or** when the context is a page (existing `index.html`, personal site, docs page, landing page, dashboard). Not needed for pure SVG weenies or Three.js scenes.

The point of this file: `/reimagine-it webpage` must produce a **10× redesign, not a repaint**. If the "after" only changes fonts and colors, the leap failed. The list below is what a real design leap looks like.

## Tokens layered on this spine

Everything below composes on top of this spine. Grid + baseline + palette cap + one motif still apply.

### Second word: domain token

If the user gave a second word (`/reimagine-it webpage <domain>`), route to the matching pack in [domains/](domains/) **in addition to** this spine.

| Token | Pack |
|-------|------|
| `artistic` | [domains/artistic.md](domains/artistic.md) — cream + italic serif + drifting arcs + real ±16° 3D card fan |
| `dashboard` | [domains/dashboard.md](domains/dashboard.md) — KPI tiles + live SVG chart + status pills + terminal |
| `photography` | [domains/photography.md](domains/photography.md) — magazine folio + SVG plates + dropcaps |
| `cinematic` (`3d`, `webgl`) | [domains/cinematic.md](domains/cinematic.md) — inline WebGL2 shader hero + real depth cards + running SVG beats |
| `ecommerce` | [domains/ecommerce.md](domains/ecommerce.md) — product plates + price ladder + one CTA |
| `landing` | [domains/landing.md](domains/landing.md) — one-viewport magnet + one CTA + one proof strip |
| `portfolio` | [domains/portfolio.md](domains/portfolio.md) — study per project, not a card grid |
| `infographic` (also a visual-form token) | [domains/infographic.md](domains/infographic.md) — paper poster of an argument: common-scale timeline, ISOTYPE unit counts, custom glyphs, data table. Not a dashboard. |

### Third word (or `--style <name>`): modifier

Optional. Layered on top of the domain (or on the spine alone).

| Token | Pack |
|-------|------|
| `glassmorphism` | [modifiers/glassmorphism.md](modifiers/glassmorphism.md) — waives the glassmorphism cut-list entry; adds real-depth + two-tier + light-source-consistent border rules |
| `bento` | [modifiers/bento.md](modifiers/bento.md) — named-cell grid; hero tile 2× wider; one idea per tile |
| `neon` | [modifiers/neon.md](modifiers/neon.md) — one high-chroma accent, glow via double drop-shadow, kinetic type on the accent word |
| `brutalism` `neumorphism` `handdrawn` | [modifiers/](modifiers/) — spec-only for v2 |

### Font override — `--font "family, fallback, generic"`

If the user passed `--font`, replace the display or body family (whichever the pack calls "the display" or "the body"). Build a **complete fallback stack**: a serif family gets `serif` as the last fallback; a sans gets `sans-serif`; a mono gets `monospace`. Never fetch a webfont at runtime unless the user *also* passed `--allow-fetch` (they explicitly accept breaking the offline single-file promise).

If the requested family is not on the reader's box, the fallback must still land the aesthetic (a `Playfair Display` fallback of `Georgia, serif` still reads editorial; a `JetBrains Mono` fallback of `Consolas, monospace` still reads code).

Example: `--font "Playfair Display, Iowan Old Style, Georgia, serif"` becomes the display stack for the artistic pack, replacing the pack's default serif choice.

### Lock reuse — `--ref <name>`

If the user passed `--ref <name>`, load [locks/<name>.md](locks/) *instead of* choosing a domain pack. Locks are extracted design-DNA packs — palette + type stack + motifs + motion + 3D signatures. Follow them exactly; do not "improve" the locked design without being asked.

### Leftover words — open brief

Anything after known form / domain / modifier / flag tokens is a **creative lens** (open vocabulary). Follow it. Do not require `domains/<word>.md`. Do not drop the words. Source facts still come from the source.

### No tokens

Use this spine alone; the aesthetic is a **designed site with presence**. First viewport is a magnet a client can name from the picture. Not a sober form, not a 640px object on an empty wall, not an infographic wearing a header.

## Every output must land SVG + animation + 3D — **and they must read in a still**

Non-negotiable across every domain token and the default. Not floors — real features. If a screenshot cannot prove them, they do not count.

1. **Hero-scale inline SVG doing real work** — a chart, a plate, a mini-viz, a background motif. At least one SVG element on the page ≥ 400px on its longest side, encoding real content (values, positions, path). Placeholder icons do not count.
2. **Motion that reads in a still.** At least three moving elements at any moment:
   - one persistent (drift, sway, breathe — `@keyframes`, ~2–8s cycle)
   - one active on a state (hover tilt, focus pulse — CSS transition)
   - one narrative (bar rising in, path drawing itself via `stroke-dasharray`, sweep line traversing a chart)
   Two stills spaced 500ms apart must show visible change frame-to-frame. Scroll-hijacking parallax is not a motion move.
3. **3D that reads in a still.** Not "perspective is set." At least one element with a computed rotation ≥ 12° **and** a drop shadow blur ≥ 24px, or `translateZ` ≥ 30px with a real box-shadow. A client looking at the PNG must be able to say "that card is in front of that one" without playback. **Exception — `infographic`:** the poster stays orthographic. Do not `rotateX` / `perspective` the board (that pinches the top and warps the common-scale timeline). Depth is a ≥28px paper drop-shadow only; see [domains/infographic.md](domains/infographic.md).
4. **WebGL2 is available and encouraged for the `cinematic` / `3d` token.** Inline `<canvas>` + inline shaders in `<script type="x-shader/x-fragment">`. No CDN. No `import` from `https://`. A vendored `vendor/three.module.min.js` sibling is allowed for full three.js scenes and must be flagged in the report — the folder must still open portable.

If a redesign lands zero of these, it did not earn `/reimagine-it webpage`. If it lands them syntactically but a still doesn't prove them, tighten motion budget / bigger tilt / add a shadow.

Live gold: [gold/webpage/after.html](../../../gold/webpage/after.html) is **one** Texas-notebook default (dark OS). A different source must not copy that OS **or** collapse into a stationery slip. Parlor-as-site proof: [gold/jules/webpage/after.html](../../../gold/jules/webpage/after.html).

## Non-negotiables (a redesign that misses these is a repaint)

1. **Grid + baseline rhythm.** 8px baseline. Spacing on 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 only. Do not eyeball margins.
2. **Type hierarchy of at least 4 levels.** Display (72–160px, tight tracking, tightened line-height) — serif or sans **from this source**. Section (22–32px). Body (15–18px) is the other family. Meta / kicker (10–12px monospace, wide tracking, upper). Serif + sans + meta-mono is allowed. Do not ship display at 42px on a ticket slip.
3. **Content measure ≤ 65ch.** Prose sits in a column, not the whole viewport. The **hero** may break the measure — type and weenie may fill the first viewport.
4. **A palette of ≤ 5 colors derived from this source.** One background, one panel, one ink, one dim, one accent. Contrast checked, not vibed. A warm sixth only for a status color if the page has status.
5. **A single geometric motif carried through the whole page.** One mark from **this** source repeats (a ticket punch, a scoop, a bar, a rotated year). Do not reuse gold’s skyline / numbered index because the last gold used them.
6. **Section identity from the source’s object.** A shop is a parlor, a counter, a menu board you walk into. A notebook may read as numbered notes. Numbered `01 / 02` kickers and a `"00 · MASTHEAD"` rail are **one** option, not the default. Fail if a client could mistake the page for the Texas gold with the title swapped.
7. **First viewport fills the frame.** In a 1400×900 still the magnet occupies ≥70% of the width. Hero SVG ≥ 400px on its longest side, on-stage, not a 160px clip-art icon beside a form. Display type is in that still. Empty wall around a narrow card is a fail.
8. **Real inline data, not decorative shapes — and not an infographic.** If the page has three places or six flavors, they appear as **objects in the room** (scoops on a counter, windows in a wall). Bar charts, Priestley axes, and ISOTYPE strips as the hero belong to the `infographic` token.
9. **One make-strange move that belongs to this source.** Pick **one**, from the object in the file — not from gold:
   - The page *is* the room (a parlor, a counter, a freezer door, a flag field) — **full-bleed**, not a stationery slip floating on a colored wall
   - Content type change (Now as a status table; contact as a ticket *module*)
   - Cross-section of *this* data
   - Reveal-the-geometry of *this* grid
   Do **not** ship `"00 · MASTHEAD / 01 · PLACES"`, a KPI skyline, or **the whole page as a receipt/order-ticket** because a previous gold did. A ticket may sit *on* the counter.
10. **3D that actually reads.** Rotation ≥ 12° on an element that occupies ≥ 20% of the first viewport, with shadow blur ≥ 24px. A 3° tilt on a card does not count.
11. **One artifact you can double-click.** A single `.html` with inline `<style>`, no build, no CDN required, no web font that fetches, no analytics. Opens offline.
12. **Same words, better held.** Do not invent projects, quotes, testimonials, badges, or emoji-glyph "features." The redesign moves the same content into a form that holds it. Data may be **restructured** (a paragraph rendered as a table, a list rendered as chart labels) as long as every heading, label, and body word either exists verbatim in the source **or** is directly implied by it (e.g. "Wed–Sat, 11–5" implies "Sun: closed"). Prefer verbatim.

## Cut list (repaint tells)

Anything on this list means you painted, you did not redesign:

- Gradient on the whole background
- Blur / glassmorphism as the design
- Random emoji as bullets
- Feather / Lucide icon farm with 15 icons
- Placeholder Unsplash people photos
- "Trusted by" logo strip that is not real
- A hero button that says "Get started" with no artifact behind it
- Three columns of "Features" with lorem
- A dark-mode toggle as the biggest interaction on the page
- A parallax hero that fights the read
- Bootstrap default components with no adjustments
- A footer with a fake newsletter form
- The whole page as a receipt, punch-ticket, or order slip on an empty wall
- An infographic (bars, timelines, ISOTYPE) as the default-webpage hero

## Ship checklist for `/reimagine-it webpage`

Before you say `REIMAGINED: shipped`, every one of these must be true.

- [ ] Single `.html`, inline CSS, opens offline, no CDN, no web font
- [ ] Baseline grid respected (8px), spacing scale respected
- [ ] Four levels of type; display ≥ 72px in the first viewport; serif+sans+meta-mono allowed
- [ ] ≤ 5 colors from this source, contrast readable
- [ ] First viewport fills the frame (magnet ≥70% width; hero SVG ≥ 400px)
- [ ] One motif from this source repeats across ≥ 3 places on the page
- [ ] Section identity matches the object (parlor, counter, notes, …) — not a cloned `00 · MASTHEAD` rail and not a whole-page receipt
- [ ] Places and flavors appear as objects in the room, not as an infographic hero
- [ ] One make-strange move landed (name which one in the report)
- [ ] Same words as the before; nothing invented (labels verbatim or directly implied)
- [ ] Motion reads in a still (three moving elements; two frames 500ms apart show change)
- [ ] 3D reads in a still (rotation ≥ 12° on a first-viewport object + shadow blur ≥ 24px)
- [ ] Optional but strong: `python <folder>/run.py` screenshots before + after and writes `compare.png`
- [ ] Optional for `cinematic`: motion strip (three frames spaced 500ms apart, composited)

## Report addition when the hero is a webpage

In the standard REIMAGINED report, add these lines (skip lines that don't apply):

```
Motif: <the one thing that repeats>
Make-strange: <which move you picked>
Domain: <artistic | dashboard | photography | cinematic | ecommerce | landing | portfolio | (none)>
Modifier: <glassmorphism | bento | neon | ... | (none)>
Font stack: <complete CSS stack, if --font was passed>
Lock: <name of --ref used, if any>
```

That line is why a client reading the diff can name what changed without loading the page.
