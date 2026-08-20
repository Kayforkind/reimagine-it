# Webpage craft (opinionated, load only for html form)

Load when the form router picks `html` / `infographic` / `webpage`, or when the user forced any of those, **or** when the context is a page (existing `index.html`, personal site, docs page, landing page, dashboard). Not needed for pure SVG weenies or Three.js scenes.

The point of this file: `/awe-me webpage` must produce a **10× redesign, not a repaint**. If the "after" only changes fonts and colors, the leap failed. The list below is what a real design leap looks like.

Live gold: [gold/webpage/before.html](../../../gold/webpage/before.html) vs [gold/webpage/after.html](../../../gold/webpage/after.html). Same words, same three projects, same email; one is default HTML, the other is the same content held by a designed page. That is the bar.

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
10. **Same words, better held.** Do not invent projects, quotes, testimonials, testimonials, badges, or emoji-glyph "features." The redesign moves the same content into a form that holds it.

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
- [ ] Same words as the before; nothing invented
- [ ] Optional but strong: `python <folder>/run.py` screenshots before + after and writes `compare.png`

## Report addition when the hero is a webpage

In the standard AWE report, add one line:

```
Motif: <the one thing that repeats>
Make-strange: <which move you picked>
```

That line is why a stranger reading the diff can name what changed without loading the page.
