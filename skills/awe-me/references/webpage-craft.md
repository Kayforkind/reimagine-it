# Webpage craft (opinionated, load only for html form)

Load when the form router picks `html` / `infographic` / `webpage`, or when the user forced any of those, **or** when the context is a page (existing `index.html`, personal site, docs page, landing page, dashboard). Not needed for pure SVG weenies or Three.js scenes.

The point of this file: `/awe-me webpage` must produce a **10× redesign, not a repaint**. If the "after" only changes fonts and colors, the leap failed. The list below is what a real design leap looks like.

## Second word: domain token

If the user gave a second word (`/awe-me webpage <domain>` or `/awe-me <domain>`), route to the matching pack in [domains/](domains/) **in addition to** this spine. Domain packs extend this file — they never replace it.

| Token | Pack |
|-------|------|
| `artistic` | [domains/artistic.md](domains/artistic.md) — cream + italic serif + drifting arcs + real ±16° 3D card fan |
| `dashboard` | [domains/dashboard.md](domains/dashboard.md) — KPI tiles + live SVG chart + status pills + terminal |
| `photography` | [domains/photography.md](domains/photography.md) — magazine folio + SVG plates + dropcaps |
| `cinematic` (`3d`, `webgl`) | [domains/cinematic.md](domains/cinematic.md) — inline WebGL2 shader hero + real depth cards + running SVG beats |
| `ecommerce` | [domains/ecommerce.md](domains/ecommerce.md) — product plates + price ladder + one CTA |
| `landing` | [domains/landing.md](domains/landing.md) — one-viewport magnet + one CTA + one proof strip |
| `portfolio` | [domains/portfolio.md](domains/portfolio.md) — study per project, not a card grid |

No token? Use this spine alone; the aesthetic is a sober designed page.

## Every output must land SVG + animation + 3D — **and they must read in a still**

Non-negotiable across every domain token and the default. Not floors — real features. If a screenshot cannot prove them, they do not count.

1. **Hero-scale inline SVG doing real work** — a chart, a plate, a mini-viz, a background motif. At least one SVG element on the page ≥ 400px on its longest side, encoding real content (values, positions, path). Placeholder icons do not count.
2. **Motion that reads in a still.** At least three moving elements at any moment:
   - one persistent (drift, sway, breathe — `@keyframes`, ~2–8s cycle)
   - one active on a state (hover tilt, focus pulse — CSS transition)
   - one narrative (bar rising in, path drawing itself via `stroke-dasharray`, sweep line traversing a chart)
   Two stills spaced 500ms apart must show visible change frame-to-frame. Scroll-hijacking parallax is not a motion move.
3. **3D that reads in a still.** Not "perspective is set." At least one element with a computed rotation ≥ 12° **and** a drop shadow blur ≥ 24px, or `translateZ` ≥ 30px with a real box-shadow. A stranger looking at the PNG must be able to say "that card is in front of that one" without playback.
4. **WebGL2 is available and encouraged for the `cinematic` / `3d` token.** Inline `<canvas>` + inline shaders in `<script type="x-shader/x-fragment">`. No CDN. No `import` from `https://`. A vendored `vendor/three.module.min.js` sibling is allowed for full three.js scenes and must be flagged in the report — the folder must still open portable.

If a redesign lands zero of these, it did not earn `/awe-me webpage`. If it lands them syntactically but a still doesn't prove them, tighten motion budget / bigger tilt / add a shadow.

Live gold: [gold/webpage/before.html](../../../gold/webpage/before.html) vs [gold/webpage/after.html](../../../gold/webpage/after.html) is the sober default. [gold/domains/](../../../gold/domains/) holds the token variants. `gold/domains/strip.png` is the one-image proof that four tokens produce four aesthetics from the same three-project brief.

## Non-negotiables (a redesign that misses these is a repaint)

1. **Grid + baseline rhythm.** 8px baseline. Spacing on 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 only. Do not eyeball margins.
2. **Type hierarchy of at least 4 levels.** Display (48–96px, tight tracking, tightened line-height), section (22–28px), body (14–18px), meta / kicker (10–12px monospace, wide tracking, upper). Two typefaces max — one sans, one mono.
3. **Content measure ≤ 65ch.** Prose sits in a column, not the whole viewport.
4. **A palette of ≤ 5 colors.** One background, one panel, one ink, one dim, one accent. Contrast checked, not vibed. A warm sixth only for a status color if the page has status.
5. **A single geometric motif carried through the whole page.** A bar, a dot rule, a horizontal line-with-gaps, a rotated year, a numbered index — one thing repeats so the page reads as one object.
6. **Section identity.** Number every section (`01`, `02`, …). Give each section a kicker line, a real title, and a right-aligned meta count. This does the work of a nav without a nav.
7. **Real inline data, not decorative shapes.** If the page has three projects, ship a mini-viz for each project that encodes something real (age, size, status). Decorative circles get cut.
8. **One make-strange move.** The page must do one thing a plain page does not know it is allowed to do. Options — pick one, not five:
   - Cross-section motif that visualizes the whole page before you read it (skyline, timeline, dot cluster)
   - Content type change (a "Now" section rendered as a status table, not paragraphs; a contact block rendered as a shell command)
   - Reveal-the-geometry (make the underlying grid visible as a design element)
   - Numbered section index rail at the top of the page ("00 · MASTHEAD / 01 · WORK …")
   - Rotated meta (year rotated 90° next to a card, monospace)
9. **One artifact you can double-click.** A single `.html` with inline `<style>`, no build, no CDN required, no web font that fetches, no analytics. Opens offline.
10. **Same words, better held.** Do not invent projects, quotes, testimonials, badges, or emoji-glyph "features." The redesign moves the same content into a form that holds it. Data may be **restructured** (a paragraph rendered as a table, a list rendered as chart labels) as long as every heading, label, and body word either exists verbatim in the source **or** is directly implied by it (e.g. "Wed–Sat, 11–5" implies "Sun: closed"). Prefer verbatim.

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

## Ship checklist for `/awe-me webpage`

Before you say `AWE: shipped`, every one of these must be true.

- [ ] Single `.html`, inline CSS, opens offline, no CDN, no web font
- [ ] Baseline grid respected (8px), spacing scale respected
- [ ] Four levels of type, two typefaces max
- [ ] ≤ 5 colors, contrast readable
- [ ] One motif repeats across ≥ 3 places on the page
- [ ] Every section has a number, kicker, title, meta
- [ ] At least one inline SVG encodes real data from the page
- [ ] One make-strange move landed (name which one in the report)
- [ ] Same words as the before; nothing invented (labels verbatim or directly implied)
- [ ] Motion reads in a still (three moving elements; two frames 500ms apart show change)
- [ ] 3D reads in a still (rotation ≥ 12° + shadow blur ≥ 24px on at least one element)
- [ ] Optional but strong: `python <folder>/run.py` screenshots before + after and writes `compare.png`
- [ ] Optional for `cinematic`: motion strip (three frames spaced 500ms apart, composited)

## Report addition when the hero is a webpage

In the standard AWE report, add one line:

```
Motif: <the one thing that repeats>
Make-strange: <which move you picked>
```

That line is why a stranger reading the diff can name what changed without loading the page.
