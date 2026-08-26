# Reimagine-It — the 10× Builder Upgrade Plan

> **Status: implemented.** All seven workstreams shipped in v2.4.0 — typographic
> voices, OKLCH palette system, composition bands, generative art primitives,
> content intelligence + plan hook, self-critique design score, playground
> 3-design loop. Verified: 55/55 unit tests, 15-token audit, benchmark 100/100 gate,
> gold audit 0 failures. The remainder of this document is the original plan.

> Goal: one command turns any text or "normal" web page into output that reads like a
> $100,000 agency redesign. Not "better than before" — visibly in a different league:
> distinctive typography, real art direction, layered motion, bespoke color, and a
> self-critiquing engine that refuses to ship a weak design.
>
> This plan is grounded in the current codebase (`src/generate.js`, `src/auto.js`,
> `src/extract.js`, `src/result.js`, `bin/reimagine-it.js`, `docs/index.html`,
> `examples/end-users/build.py`) and in current award-site practice (Awwwards /
> FWA trends, v0/shadcn patterns, Figma 2026 trend reports, NN/g visual-design
> principles). Every workstream names the concrete file to change, the concrete
> mechanism, and the check that proves it works.

---

## 0. Executive summary

**The thesis.** Today the engine is a *page generator*: each of the 15 tokens is one
hard-coded page layout with one accent color, system fonts, and a small library of
abstract ornaments (orbits, dots, prisms, glyph tiles). That is why output can feel
like a beautiful template rather than a bespoke design. The 10× move is to convert it
into a **composition engine** with four layers, each of which can be re-rolled
independently and all of which are chosen *from the content*:

```
source text/html
   │  extract.js   (content intelligence: tone, structure, images, facts)
   ▼
content model
   │  taste engine  (typographic voice + palette system + art direction, all seeded)
   ▼
composition engine  (section archetypes assembled per token, not one hard-coded page)
   │
   ▼
self-critique loop  (design-QA heuristics → regenerate weaker candidates → ship best)
   │
   ▼
single-file HTML + design-token JSON + quality report
```

**Why this is a 10× and not a 1.5×.** The visible levers of "premium" — type, color,
layout rhythm, motion, art — are currently hard-coded per token. Moving each one to a
seeded, content-derived system multiplies the design space (voices × palettes ×
archetypes × primitives × seeds) instead of adding one more token. And the
self-critique loop is the difference between "generates designs" and "generates *good*
designs": it is the closest thing to a human art director reviewing the work before it
ships.

**Constraint that shapes everything.** The engine's own quality gate
(`qualityScore` in `src/auto.js`) currently fails any output that fetches external
assets, and the product promise is a standalone offline HTML file. Web fonts (the
single biggest premium lever) therefore **cannot be loaded by default**. The plan
resolves this with an opt-in `--web-fonts` mode that exempts font stylesheets from the
check, while offline mode keeps a curated system-font stack that is *better paired*
than today. See Workstream 1.

---

## 1. Current-state audit (honest)

**Already strong — keep and build on:**
- Deterministic, seeded generation (`makeRNG`, `shuffle`) → reproducible designs, testable.
- Content-derived everything: palette from source colors, facts→charts, dates→timelines, anchors→nav (the core "content-derived design" identity — the killer feature nobody else has).
- Motion is genuinely ahead of most generators: view-transition API, scroll-driven progress line, `animation-timeline: view()` reveals with `@supports` fallbacks, marquees, `prefers-reduced-motion` kill switch.
- Craft floor: `::selection`, `:focus-visible`, custom scrollbar, grain overlay, `text-wrap: balance`, container queries, contrast enforcement (`ensureContrast`).
- Quality infrastructure that most projects lack: 15-token audit, gold audit, benchmark gate at 100/100, `--diff` summary, deterministic playground seeds.

**The ceilings (why output can still read "2/100"):**
1. **Type is invisible.** System stacks only (`Iowan Old Style`/`Segoe UI`/`Consolas`). No display face, no voice, no pairing logic, no variable-font axes. Typography is 50–80% of perceived design quality — this is the #1 lever and it is untouched.
2. **One accent, no system.** Single `--a` accent plus `--m` muted. No ramps, no secondary/tertiary roles, no semantic tokens, no OKLCH harmonization. NN/g's core finding — *refined, limited palettes* — is not enforced beyond one contrast check.
3. **One archetype per token.** `landing()` is one hero+features page; `webpage()` is one index+articles page. There is no composition: no hero variants, no section library, no layout rhythm scale (paddings are hand-written: 28px, 64px, 92px, 100px).
4. **Art is ornaments, not art direction.** `plateArt`, `isoPrism`, `glyphTiles`, orbits/dots are decorative. There is no generative art library (meshes, particle fields, topography, data-wash), no images from the source, no 3D except the `3js` token, no cursor-reactivity.
5. **No self-critique.** `qualityScore` checks *structure* (standalone, title kept, anchors kept, a11y markers) — not *design quality*. Nothing looks at whitespace ratio, overflow risk, palette harmony, motion coverage, or fidelity of facts used. Auto picks a token but never evaluates the artifact and regenerates.

---

## 2. The seven workstreams

### Workstream 1 — Typography: the $30k lever (biggest visible jump)

**Mechanism.** Add a *type system* with ~8 curated "voices," each a pairing of
display / body / mono faces plus weights and a character mood. Voices are picked
deterministically by content profile + seed; each token declares which voices fit.

Voice bank (all free, Google Fonts, chosen for distinction, not default-ness):
- **Editorial serif**: Fraunces (display, variable optical size) + Newsreader (body)
- **Modern grotesque**: Space Grotesk (display) + Inter (body) — the "startup premium" voice
- **Expressive display**: Unbounded or Syne (techno) — gaming / gradient / showcase
- **Soft serif**: Libre Caslon + Archivo — restaurant / literary / nature
- **Mono-forward**: JetBrains Mono (display, heavy weights) + IBM Plex Sans — dashboard / svg / simulation
- **High-contrast editorial**: Playfair Display + Source Sans 3 — cinematic / editorial
- **Warm humanist**: Fraunces soft + Karla — artistic / photography
- **Techy condensed**: Archivo Expanded / Sora — landing / 3js

**Concrete changes:**
- `src/generate.js`: new `FONT_VOICES` table (name, display, body, mono, weights, mood, profile fit list). Replace the three hard-coded `serif`/`sans`/`mono` strings with voice-derived stacks. Keep system fallbacks inside every stack.
- New type-scale tokens on `:root`: `--text-xs … --text-4xl` as fluid `clamp()` values; letter-spacing rules by size (display tightens with size, body stays normal); `--font-display` / `--font-body` / `--font-mono`.
- **Offline mode (default)**: curated *system* stacks per voice — e.g., the editorial voice prefers `Iowan Old Style, Palatino, Georgia` but now *pairs* it with `ui-sans-serif` body at tuned weights, so even without web fonts the hierarchy reads designed, not default.
- **`--web-fonts` mode (opt-in)**: emit `<link rel="preconnect">` + one Google Fonts stylesheet per voice, `font-display: swap`. When active, `qualityScore` exempts font stylesheets from the "no external asset fetch" check (see Workstream 6). Ship both modes; the README and playground toggle it.
- **Variable-font axes where free**: weight transition on interactive elements (`font-variation-settings`), `opsz` on Fraunces headlines.

**Prove it:** gold audit + token audit still pass offline; a new unit test asserts each
voice resolves to a non-empty stack and that `--web-fonts` output contains `<link` to
fonts.googleapis.com while default output contains none.

---

### Workstream 2 — Color: from one accent to a palette system ($15k)

**Mechanism.** Move color work to OKLCH (perceptually uniform), generate a full ramp
per role, and pick 2–3 harmonized roles instead of one accent.

**Concrete changes:**
- `src/extract.js`: add OKLCH conversion (hex→OKLCH→hex, ~40 lines, no deps). Keep sRGB `tint`/`shade`/`ensureContrast` for legacy, but derive ramps in OKLCH so lightening/darkening stays perceptual.
- New `derivePaletteSystem(profile, sourceHex, foundColors, seed)`:
  - pick the *role count and harmony* by profile (editorial → analogous; gaming → complementary with a loud tertiary; dashboard → restrained triadic),
  - generate `--a` (primary), `--a2` (secondary), `--a3` (tertiary/alert), each with a 50–950 ramp,
  - semantic tokens: `--bg --surface --surface-2 --border --text --text-muted --accent --accent-ink --success --warn --danger --focus-ring`,
  - enforce AA contrast on every text/background pair the engine actually emits (accent-on-ground, accent-ink-on-accent, muted-on-surface, ink-on-surface), reusing `ensureContrast` against the *ramp* (pick a ramp step that passes instead of mutating the color).
- Ambient treatment: mesh/aurora background primitives (see WS4) use the ramp, so color feels systematic rather than single-accent.

**Prove it:** extend `audit-tokens.js` (or the benchmark gate) with a harmony check —
every emitted pair passes WCAG AA — plus a unit test that the ramp is monotonic in
lightness.

---

### Workstream 3 — Composition engine: archetypes, not hard-coded pages ($20k)

This is the structural heart of the 10×.

**Mechanism.** Turn each `*()` token from one hand-written page into a small
*composer* that picks ordered **section archetypes** from a shared library, driven by
content + token + seed.

**Concrete changes:**
- New `src/layout.js` (or a `sections` section in `generate.js`) with ~12 section archetypes, each a function `(content, plan) → HTML+CSS`:
  1. `hero-split` (current landing hero), 2. `hero-centered` (big display type, minimal), 3. `hero-editorial` (asymmetric, index column), 4. `hero-full-art` (canvas/WebGL/art field behind), 5. `stats-band` (count-up numbers), 6. `feature-grid` (4-up, exists), 7. `bento` (mixed-size tiles), 8. `alternating-rows` (image/text pairs), 9. `data-section` (charts: donut/bars/sparklines — lift from `dashboard`/`infographic`), 10. `quote-band`, 11. `timeline` (dates, from `simulation`), 12. `cta-band` + `footer`.
- Each token becomes a **recipe**: `landing → [hero-split|hero-full-art, marquee, feature-grid|bento, stats-band, cta, footer]` with variants chosen by seed/profile. `editorial` composes `[hero-editorial, alternating-rows, quote-band, data-section]`; `showcase` composes `[hero-full-art, bento, timeline, cta]`.
- **Rhythm scale**: `--space-1 … --space-10` on the 4/8 system; all archetypes consume the tokens so paddings/gaps across tokens feel like one system (NN/g: *same or multiple of one unit*). One `container` width scale: narrow (62ch) / medium (920px) / wide (1080px) / full.
- Every archetype ships 3 breakpoints and reduced-motion fallbacks (patterns already exist).

**Prove it:** the 15-token gold audit still passes (recipes must reproduce gold output
or gold is regenerated deliberately), plus a new unit test that every recipe composes
≥3 archetypes and that each archetype emits a grid or flex layout.

---

### Workstream 4 — Art direction engine: from ornaments to generative art ($25k)

**Mechanism.** Replace ad-hoc ornament functions with a seeded **primitive library**
whose output is art-directed (fits the token's voice), and add cheap 3D + motion
layers to every token, not just `3js`.

**Concrete changes:**
- New `src/art.js` with ~12 parameterized primitives, all `(seed, palette, label) → SVG/canvas/CSS`:
  1. `mesh-gradient` (blurred radial blobs, slow drift — hero backsplash),
  2. `particle-field` (canvas, ~200 points, gentle noise wander, mouse repulsion),
  3. `aurora` (layered conic/radial gradients, hue-rotated),
  4. `dot-grid` (noise-displaced halftone),
  5. `topography` (concentric contour lines from seeded field),
  6. `isometric-stack` (CSS 3D layered planes — replaces `isoPrism`),
  7. `data-wash` (giant faded source numbers behind content — the "editorial data" look),
  8. `constellation` (anchors → node network, upgrades `svg` token),
  9. `scan-lines`/barcode (mono-forward tokens),
  10. `duotone-plates` (photography: source-like plates with gradient blends),
  11. `noise-field` (per-pixel SVG turbulence variation of the existing overlay),
  12. `type-marquee` (big rotating/marquee display type — already partially exists).
- **Token→primitive mapping** in the taste engine: infographic → data-wash + isometric bars; cinematic → grain + letterbox bars + aurora; 3js/gradient → WebGL shader (see below); photography → duotone plates; svg → constellation; dashboard → dot-grid + data-wash.
- **WebGL without a library**: one ~60-line raw-WebGL fragment-shader helper (two or three shaders: plasma, ripple, flowing gradient) for `3js`, `gradient`, and `hero-full-art`. Compile-fail-safe: `@supports`/try-catch fallback to the CSS mesh.
- **3D everywhere cheap**: CSS `perspective` scenes — tilt-on-hover cards, floating layered planes with parallax on pointer move, and a `cube`/`stack` hero object for showcase. The existing `3js` token gets lighting, fog, auto-rotate, and pointer orbit (already has orbit; add lighting/fog/material).
- **Micro-interactions** (shared, in the craft floor): magnetic buttons, cursor spotlight (`radial-gradient` following pointer, mix-blend), number count-up for `stats-band`, hover parallax on plates, marquee pause-on-hover. All inside the existing `prefers-reduced-motion` kill switch.
- **Images from the source**: `extract.js` currently ignores `<img>`. Capture `src`/`alt`; tokens that fit (photography, landing, webpage) render source images as plates with object-fit + gradient-blend fallbacks when missing. Keep the "no external fetch" default by *inlining* small images as data URIs and *referencing* local/relative ones.

**Prove it:** token audit asserts each token's output contains ≥1 primitive artifact
and ≥2 motion behaviors; a headless screenshot pass (the renderer already used for
`render-example-shots.py`) is added to the audit workflow as a visual smoke check.

---

### Workstream 5 — Content intelligence: know more about the source ($10k)

**Mechanism.** `extract.js` already finds numbers, dates, colors, links, headings.
Extend the model so compositions make smarter choices.

**Concrete changes:**
- New extraction signals: `images` (src/alt), `readingTime`, `tone` (formal/playful/dark via lexicon), `lang` (for font subsets), `tables` (→ data-section), `listsOfLists` (→ bento/grid), `brandNouns` (top proper nouns → data-wash candidates), `sentiment`.
- **Model-led plan hook (the "Design Auto / DeepSeek Harness" upgrade).** `buildPlan(content, opts)` already accepts options; add `opts.plan` — a structured JSON an agent harness can fill (`{ voice, paletteIntent, layoutIntent, artDirection, seed }`). When present, `scoreToken` blends plan weights with heuristics instead of heuristics alone, and `generate()` honors `opts.plan.voice`. This makes the tool *maximum-use of the model the user is running* (their original vision): heuristic baseline works alone; a model enriches the same pipeline.
- CLI: `--brief "make it feel like a luxury hotel"` maps to plan fields via the voice/palette tables (deterministic, no model needed), so "one command" still works fully offline.

**Prove it:** unit tests for tone detection and image capture; an E2E test that a
harness-supplied `plan` overrides auto's token choice.

---

### Workstream 6 — Self-critique loop: generate, score, regenerate ($15k) — the actual "differentiator"

**Mechanism.** Auto's promise is "best of the best with one command." Today it picks a
token and generates once. Make it *iterate*.

**Concrete changes:**
- Extend `qualityScore` (rename concept to `designScore`) into a two-part battery:
  - *Structural* (current checks, keep): standalone, title, anchors, focus-visible, reduced-motion, selection, no placeholder, no external fetch (with the `--web-fonts` exemption).
  - *Design QA* (new, all computable on the emitted string): title/display overflow risk (title length vs `clamp` cap), palette harmony (emitted pairs pass AA — reuse WS2), whitespace rhythm (gaps come from the `--space-*` scale), art presence (≥1 primitive artifact), motion presence (≥2 behaviors), fidelity (fraction of extracted facts surfaced — `src/result.js` already scores this; wire it in), a11y (skip link + landmarks + `aria-label`s).
- `autoGenerate` becomes: top-3 tokens × 2–3 seeds → generate → `designScore` each → keep the best; if the best is below a configurable floor (e.g., design ≥ 80/100), regenerate the top candidate with adjusted params (different voice/palette harmony/art primitive). Deterministic given the seed; bounded (≤9 generations, ~100ms each).
- Emit a **decision report** alongside the HTML: `--emit artifacts` writes `design-token.json` (voice, palette system, archetype recipe, primitives, scores) and `quality-report.json`. The CLI's `--diff` and the playground show *why this design* — the trust story that separates a generator from a design tool.

**Prove it:** the benchmark gate now scores the *design* battery, not just usability/fidelity; a unit test asserts that a deliberately weak seed still yields an artifact above the floor (i.e., the loop actually regenerates).

---

### Workstream 7 — Packaging, proof, and the playground loop ($5k)

**Mechanism.** The user-visible surface must reflect the new engine, and the "3
designs, keep or recreate" loop (their long-standing request) must be real.

**Concrete changes:**
- **Playground** (`docs/index.html`): run Auto with `candidates: 3` → show three cards (each with its designScore + the plan summary). Buttons: **Keep this** (opens the design) and **Recreate** (re-roll seeds for that token). The share link already encodes source+seed+token — extend it to encode voice/palette overrides.
- **Deliverables**: default single-file HTML stays; `--emit artifacts` adds token JSON + quality report + (CI-only) preview PNG via the existing headless renderer.
- **Examples**: regenerate all end-user examples and static before/after WebP composites through the new engine (`examples/end-users/build.py` already pipelines this); refresh `docs/index.html` showcase copy to name the new layers (typographic voice, palette system, generative art, self-critique).
- **Benchmark**: add a *craft* dimension to `benchmark-tokens.js` (type presence, palette harmony, motion coverage, rhythm consistency) while keeping the 100/100 gate honest.
- **README/docs**: document `--web-fonts`, `--brief`, `--emit`, the design-score report, and the plan doc (this file) in a "How it decides" section.

**Prove it:** full `npm test`, token audit, gold audit, benchmark gate, YAML parse,
and a live preview pass of the playground's three-card loop.

---

## 3. Sequencing (what to build first for maximum visible impact)

1. **WS1 typography + WS2 color system** — together they are ~70% of the perceived leap and both slot into `generate()` with no structural change. Do these as one PR ("type + color system").
2. **WS4 art direction** — the second visible leap; keeps the per-token page structure, so it can land before the composition rewrite.
3. **WS3 composition engine** — the big refactor; land it *after* type/color/art exist so recipes compose tested primitives.
4. **WS6 self-critique** — depends on WS2 (harmony) and WS4 (art presence) checks; lands naturally third.
5. **WS5 content intelligence + WS7 packaging** — continuous; hook the model-plan bridge early so harnesses can use it, polish the playground last.

Rough split of the "100k": WS1 $30k, WS4 $25k, WS3 $20k, WS6 $15k, WS2 $15k, WS5 $10k, WS7 $5k — the ordering above is deliberately not by cost but by *visible impact per day of work*.

---

## 4. Guardrails (non-negotiable)

- **Offline purity by default.** Default output fetches nothing; `--web-fonts` is explicit opt-in and is the only permitted external fetch (exempted in the quality check by flag). The README and playground surface this choice honestly.
- **Determinism.** Every layer stays seed-driven; the same input + seed + plan reproduces byte-identical output (the benchmark and share links depend on it).
- **Quality gates stay green.** 15-token audit, gold audit, benchmark ≥ 100/100, 47+ unit tests, all workflow YAMLs parse. New checks are *additive*.
- **Reduced motion + a11y.** Every new animation ships inside the existing `prefers-reduced-motion` kill switch; new sections keep `:focus-visible`, landmarks, and skip links.
- **No model dependency.** The model-led plan hook is optional enrichment; the heuristic baseline must never regress. "One command" works offline forever.

---

## 5. Sources consulted (2025–2026)

- NN/g, *Why Does a Design Look Good?* — grid alignment, limited refined palettes, consistent spacing units, ≤2 type treatments per headline.
- Figma Resource Library, *Top Web Design Trends for 2026* — typography as storytelling, oversized display type, layered motion, WebGL/scroll-triggered 3D, AR previews.
- Awwwards / FWA site-of-the-day patterns — editorial asymmetry, data-wash typography, scroll storytelling, experimental navigation.
- v0.dev / shadcn design-systems docs and community write-ups — the insight that AI output quality comes from *constrained, pre-baked design systems* (component + token + pattern libraries), not open-ended generation. Reimagine-it's equivalent is the voice/palette/archetype/primitive libraries above.
- Fontpair.co and 2026 variable-font roundups — the specific free type pairings used in WS1.
- terkelg/awesome-creative-coding and related generative-art repos — the primitive catalog for WS4.
- The project's own `scripts/audit_all.py`, `scripts/audit-tokens.js`, `scripts/benchmark-tokens.js`, `gold/` — the verification harness every workstream plugs into.
