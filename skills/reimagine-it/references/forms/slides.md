# /reimagine-it slides (pptx / reveal.js)

> **Not a CLI feature.** `npx reimagine-it` reads and writes HTML only. Prefer reveal.js (HTML) or, if the user asked for `.pptx` and `python-pptx` is installed, export after the HTML artifact exists.

Load when the user forces `slides`, `pptx`, `deck`, or when the target is a `.pptx` / reveal.js folder **and they asked to keep that format**.

## Two paths

### Path A — PowerPoint (`.pptx`) via python-pptx

For clients / boardroom / executive workflows:

1. Read source: docx, md, or an existing pptx.
2. Build a **theme** first — slide master with palette + type stack + one motif (a bar, a numbered mark, a color-shifted section divider). Do not use a default template.
3. Structure:
   - Title slide (one line of italic-serif accent, one word of ember/color)
   - Section dividers (numbered + kicker)
   - Content slides: **one idea per slide**, mostly image / diagram / pull-quote. No 6-bullet slides.
   - Ending: a Tuesday-handle slide (the one command / decision / next step)
4. Use theme colors (`slide.background.fill.solid()`, `slide.background.fill.fore_color.theme_color = MSO_THEME_COLOR.ACCENT_1`) so consistency comes from the master, not from per-slide overrides.
5. Verify: opens in PowerPoint / LibreOffice / Keynote, slide masters and themes are correctly applied, print preview looks intentional.

Install: `pip install python-pptx`.

### Path B — reveal.js (HTML deck)

For dev-facing talks, conference slides, screen-only demos:

1. Reimagine the content as a series of `<section>` blocks in an `index.html`.
2. Include reveal.js locally (`vendor/reveal.js/`) — no CDN.
3. Use vertical stacks for progressive reveal.
4. Fragments for narrative reveal (`class="fragment"` on any element).
5. Speaker notes (`aside class="notes"`) with the reasoning for each slide.
6. One motion move per slide (fragment reveal, code typing, chart draw).
7. Verify: opens in a browser, `s` opens speaker view, PDF export works (`?print-pdf`).

## Cover / hero rules for slides

- Title slide has a **magnet** (one italic-serif accent word, one number that matters, or one diagram) — not a company logo + "Q3 Review."
- Section dividers are visual (not black-on-white "Section 2: Approach").
- Ending slide is a call to a *specific* action: a command, a URL, a decision.

## Modifier compatibility

- `glassmorphism`: pptx supports translucent shapes. Layer them for glass tiles behind the slide title.
- `bento`: excellent for slides — one slide is a whole bento layout of the deck.
- `neon`: use one high-chroma theme accent; put a glow around callouts via shape outer-glow effect (both pptx and reveal.js support this).
- `cinematic`: use a shader-frame PNG as the title slide background; put the deck's motif over it.
- `--ref house-cinema` or similar: consult the lock's cross-medium translation table for how the design DNA translates from webpage to slides.

## Report addition

```
Form: slides
Path: <pptx | reveal.js>
Slides: <count>
Cover: <what the title slide does>
Motif: <the one thing that repeats>
Ending: <the specific action the last slide asks for>
```

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-<slug>.pptx` or `<workspace>/reimagined/<yyyy-mm-dd>-<slug>/index.html` for reveal.js decks.
