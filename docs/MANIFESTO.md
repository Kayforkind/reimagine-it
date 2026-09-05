# Content-Derived Design (CDD)

> *The source file is the brief. Palette, motifs, and motion are derived from concrete nouns, dates, and colors already in the content. Source facts are not invented. Change the source, change the design.*

---

## The problem: AI design slop

Every AI coding agent, left to its own design instincts, produces the same output. Inter for everything. Purple-to-blue gradients. Cards nested in cards. Rounded corners on every button. A faint hover state if you're lucky.

This isn't the model's fault. It was trained on SaaS templates and startup landing pages — the median of the web. When you don't tell it what to do, it reaches for the median.

The existing solutions — frontend-design (Anthropic, 277k installs), Impeccable (50k stars, 23 commands) — enforce *generic* taste. They ban Inter. They ban purple gradients. They ban cards nested in cards. But banning the median doesn't tell you what to replace it with. The result is still generic — just a different generic.

**The real problem:** the design brief is missing. The model doesn't know what the content is *about*, so it picks safe defaults. Fixing this requires giving the model a brief — and the brief is already there. It's the source file.

---

## The principle

> **Content-Derived Design (CDD):** A design methodology where palette, motifs, motion, and structural decisions are derived from the concrete nouns, proper nouns, dates, color words, and anchor phrases in the source content.

A Texas notebook contains "Lone Star flag," "Big Bend," and "Alamo." The flag specifies navy, white, and red. Big Bend specifies gold sunsets over desert. The Alamo specifies stone and mission architecture. The design language writes itself.

A restaurant menu contains "saffron," "open fire," and "smoked aubergine." Saffron specifies warm gold. Open fire specifies flame, smoke, and char. The palette is clay + saffron + herb green. The motif is a smoke tendril. The motion is a flame flicker.

A SaaS observability page contains "traces," "water balloon," and "23ms render." Traces specify thread-like paths. Water balloon specifies tension + pulse. 23ms specifies speed. The palette is dark teal + electric green. The motif is a pulse wave.

**The method works because content is always more specific than taste rules.** "Ban Inter" is generic advice that applies to everything. "This file names the Lone Star flag, so use navy, white, and red" is specific advice that applies to exactly one file. The model already knows how to execute specific advice well. The problem was that nobody gave it any.

---

## The method

### Step 1: Extract anchors
From the source, extract 3–5 concrete anchors: proper nouns (people, places, brands), dates, numbers, color words, verbs of action, physical objects, quoted phrases. These are the raw material.

**Texas notebook anchors:** `Lone Star flag`, `Big Bend`, `Alamo`, `1836`, `Bluebonnet`

### Step 2: Derive palette
Map each anchor to colors found in or implied by it. The Lone Star flag specifies navy + white + red. Big Bend specifies gold (desert sunset). The palette has ≤ 5 colors, all traceable to anchors.

**Palette:** `#1a2138` (navy ground) · `#f4ecd8` (cream text) · `#e8a63f` (sun gold accent) · `#b22234` (star red)

### Step 3: Pick a repeating motif
One geometric mark from the source carried through every section. Not an icon. A single shape repeated across the page.

**Texas motif:** The Lone Star — a five-point star used as a bullet, a section divider, a hover indicator, and a weenie (the SVG mark that breathes).

**Maracuyá motif:** Fruit-slice geometry from a juice-bar menu — used as a section divider, a card background, and a hero mark.

**Horizon motif:** A pulse ring from an observability page — concentric circles growing outward, used as a logo animation, a card decoration, and a hero SVG.

### Step 4: Budget motion
Three moving elements at any moment: one persistent (drift, sway, breathe), one active on state (hover tilt, focus pulse), one narrative (bar rising, path drawing). All compositor-only (`transform` + `opacity`). Timing 100–300ms `ease-out`.

**Texas motion:** Star breathe (persistent) + card lift on hover (active) + counter rise on load (narrative).

### Step 5: Build 3D
At least one element with rotation ≥ 12° + shadow blur ≥ 24px, or `translateZ` ≥ 30px with a real box-shadow. The 3D must read in a still — a PNG should make depth relationships obvious.

### Step 6: Clear the craft floor
Every output passes 19 deterministic checks before shipping: typography, palette, motion, content, structure, and performance. No lorem, no `transition: all`, no `outline: 0` without replacement, `:focus-visible` styled, `::selection` on-palette, `prefers-reduced-motion` respected, compositor-only animation, hero SVG ≥ 400px, no CDN, no external font fetch.

**Run:** `npx reimagine-it audit output.html`

---

## Why this matters

**The design industry is splitting.** On one side: tools that enforce taste (frontend-design, Impeccable). On the other: tools that generate from templates (v0.dev, Bolt.new, Lovable). Both produce output that looks like it came from the same factory.

Content-Derived Design is the third path: neither taste-enforcement nor template-generation. It's extraction — finding the design that's already latent in the content and surfacing it.

A coffee roaster's site that pulls warm browns and burlap textures from the word "roast" is more specific than any taste rule can produce. A night-diving report that pulls deep teals and bioluminescent accents from the word "bioluminescent" is more evocative than any template.

**The source file IS the brief.** The method just reads it.

---

## Proof

Seven HTML sources in [`examples/end-users/`](../examples/end-users/) prove the method travels: gaming, festival, skate, juice bar, streetwear, building, observability. Each bundle is source → Auto HTML → two alternatives, with palettes taken from hex colors already in the file.

Texas / Jules under `gold/` remain skill fixtures for clone-scan, not a second public gallery.

---

## Related work

- **frontend-design** (Anthropic) — enforces generic taste rules; does not read the source
- **Impeccable** (pbakaus) — 23 commands for design quality; 64 anti-pattern detectors; does not derive palette from content
- **theme-factory** — generates theme tokens; palette is chosen, not derived
- **design-extract** — extracts existing design systems from live sites; the inverse of CDD

**reimagine-it** is the only tool that derives design from the source file's own nouns, dates, and colors.

---

## Cite this

If you use Content-Derived Design in your work:

```bibtex
@misc{kayforkind2026cdd,
  title = {Content-Derived Design: A Methodology for Content-Aware Automated Design},
  author = {Kayforkind},
  year = {2026},
  howpublished = {\url{https://github.com/Kayforkind/reimagine-it}},
  note = {reimagine-it v2.6.0. See examples/end-users/ for verified outputs.}
}
```

---

*MIT licensed. Part of the reimagine-it agent skill. [GitHub](https://github.com/Kayforkind/reimagine-it) · [Live demo](https://kayforkind.github.io/reimagine-it/)*