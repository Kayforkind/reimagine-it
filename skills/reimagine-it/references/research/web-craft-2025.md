# The Web Craft Floor, 2025-2026

Research pack synthesized from ~150 sources across award-winning sites, elite studios, editorial newsrooms, motion masters, WebGL creative developers, generative-art practitioners, independent type foundries, information-design pioneers, print-to-web bridges, cinematic product pages, scroll-driven journalism, and the modern web platform.

Use this as the ground truth for what a "great" reimagined page must clear in 2025–2026. Every recommendation here has at least one production reference behind it.

---

## 1. What the top of the market actually ships

**The Awwwards Site of the Year 2025 stack** (from Stefano Bartoletti's Wappalyzer scan of all 30 nominees):

| Layer | Tool | Nominee coverage |
|-------|------|-----------------|
| Framework | Vue / Nuxt | 13 / 30 |
| Framework | Webflow | 6 / 30 |
| Framework | Plain HTML + JS | 4 / 30 |
| Motion | **GSAP** | **21 / 30** |
| Smooth scroll | **Lenis** | **18 / 30** |
| 3D | **Three.js** | **18 / 30** |
| Audio | Howler.js | 7 / 30 |
| Vector motion | LottieFiles | 6 / 30 |

**Consequence for the skill**: the reference stack for a cinematic webpage is **GSAP + Lenis + Three.js**, with Howler.js when sound is on. `--allow-fetch` is still the gate; when it's off we ship the same visual moves inline (View Transitions + scroll-driven animation + inline WebGL2) so the offline promise holds. But the stack the users see elsewhere is that trio — the craft signature is what they expect.

**The 2025 signature sites and what they teach**:

- **OFF+BRAND — Lando Norris (SOTY 2025)**. Kinetic hero synced to sound; deferred module loading; script splitting; WebP; repaint control; animation throttling; scroll-bound performance tuning. Nothing decorative; every motion serves the "speed and precision" narrative of the subject.
- **Cartier — Watches & Wonders 2025**. Six unique 3D "alcoves" as scenes. Hidden gestures reward curiosity. Physical exhibition metaphor (intimate protective spaces) translated to digital via architecture, light, materiality.
- **Active Theory V6**. Multi-user networked cursor trails (colored tubes spawn where other visitors are moving). AI chat navigation ("show me something fun" / "have you done crypto work?"). State-based functional JS. Custom Hydra engine ("Unity meets Photoshop for WebGL"). The deliverable is always a running webpage.
- **Spotify Wrapped (Active Theory, nine years running)**. Not a one-off — a framework that learns from use, adapts to culture, grows with the brand.
- **Bruno Simon portfolio 2025**. Three.js + Rapier physics + Howler audio + WebGPU via TSL. Multiplayer + achievements + day/night cycles + real-time seasons. All optimized to hold framerate on mid-range devices via instancing, matcaps, SDF foliage, palette-baked colors, and light bounce faked via absolute-normal + up-axis dot product.

**The pattern**: the top of the market is no longer "a nice page." It is a **running experience** — networked, sound-aware, physics-aware, scroll-choreographed, motion-throttled, and content-narrated.

---

## 2. The craft floor (Rauno Freiberg / Emil Kowalski / Vercel-Linear school)

Rauno Freiberg's `interfaces` document and Emil Kowalski's design-engineering SKILL (29K+ installs) converge on the same operating principles. These are the **minimum expected of any interface a competent design engineer ships**.

**Manifesto (Rauno)**: *Make it fast. Make it beautiful. Make it consistent. Make it carefully. Make it timeless. Make it soulful.*

**Emil's core belief**: *Taste is trained, not innate. Unseen details compound. Beauty is leverage.*

### 2.1 Interaction non-negotiables

| Rule | Why |
|------|-----|
| Clicking a `<label>` focuses the input | Native HTML behavior; free with `<label for>` |
| Every input wrapped in `<form>` submits on Enter | Native keyboard support |
| Inputs have correct `type` (`email`, `password`, `search`, `tel`, `number`) | Right keyboard on mobile, right validation for free |
| `spellcheck="false"` `autocomplete="off"` where inappropriate | Stops browser suggesting nonsense for usernames, codes, etc. |
| `required` attribute where appropriate | Free HTML validation |
| Input prefix / suffix icons **absolutely positioned inside** the input | Not sitting next to it; the whole surface focuses |
| Toggles take effect immediately, no confirmation | Trust the user |
| Buttons disable **after** submit | No duplicate network requests |
| `user-select: none` inside interactive elements | Prevents accidental text selection on drag |
| Decorative elements (glows, gradients) `pointer-events: none` | They don't hijack clicks |
| Vertical/horizontal item lists have **no dead areas** between elements — grow padding instead | Every pixel between rows is clickable |
| Style `::selection` explicitly | Free brand signal |
| Style `:focus-visible`, not `:focus` | Keyboard focus stays visible; mouse click doesn't paint a noisy ring |
| **Never** remove the visible focus indicator | WCAG 2.4.7 — non-negotiable |
| Show feedback **at the trigger**: inline copy checkmark, not a toast | User's eyes are already there |
| Optimistic updates locally, rollback on server error with feedback | Perceived speed |
| Nested menus: **prediction cone** for pointer path | Menu doesn't close because you moved diagonally |
| Empty states prompt to create with an optional template | Not a blank void |

### 2.2 Motion timing (Emil + Social Animal + Masters-in-Clarity)

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover state change | 100–150 ms | `ease-out` |
| Button press feedback | 100 ms | `ease-out` |
| Toggle / checkbox | 150–200 ms | `ease-in-out` |
| Modal open | 200–250 ms | `ease-out` |
| Modal close | 150–200 ms (exits faster than entrances) | `ease-in` |
| Page element fade-in | 200–300 ms | `ease-out` |
| Toast notification | 300 ms in, 200 ms out | `ease-out` / `ease-in` |
| Micro-state transitions | 150–500 ms with dynamic pacing for complex states | context-sensitive |

**Rules**:
- **`ease-out` is the workhorse.** Starts fast, decelerates — matches how physical objects move.
- **Never `linear`.** Feels mechanical.
- **`transform` and `opacity` only** for motion. Everything else forces layout recalc and kills the compositor path (this includes `font-size`, `letter-spacing`, `line-height`, `word-spacing`, `top`, `left`, `margin`, `width`, `padding`, `color` — swap for `translate`, `scale`, opacity, transform, and pseudo-element cross-fades).
- **`transition: transform 150ms ease-out`** — explicit properties, never `transition: all` (thrashing).
- **Spring physics for anything that should feel weighty** — `stiffness`/`damping`/`mass` instead of duration curves. Sonner (Emil, 13M+ npm weekly) is built on this.

### 2.3 Frequency gates

Every animation is a claim on attention. Ask before shipping one:
1. Does it confirm a state change or system status?
2. Does it reveal information the user needs at that moment?
3. Does it re-orient spatial context (modal, page transition, sheet)?

If none of those, cut it. Emil's rule: *"You Don't Need Animations — you are animating more often than you should."*

---

## 3. Accessibility as craft, not compliance (WCAG 2.2 + Chrome dev)

### 3.1 Reduced motion — decompose, don't suppress

WCAG 2.3.3 (Animation from Interactions) says non-essential motion must be disable-able. **Focus indicators are essential (2.4.7); the transitions around them are not.**

Correct pattern:
```css
.button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  transition: outline-color 150ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .button:focus-visible {
    transition: none;    /* kill the transition, keep the ring */
  }
  * {
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
```

### 3.2 Focus indicator contract

- **`:focus-visible`**, not `:focus`. Keyboard focus shows; a mouse click on a button does not paint a noisy ring.
- **3:1 contrast** for the focus ring against adjacent color (WCAG 2.2 SC 1.4.11).
- **Minimum 2 px perimeter equivalent**.
- **`scroll-padding` / `scroll-margin-top`** so sticky headers don't hide the focused element.
- Fallback for old browsers: `@supports selector(:focus-visible)` block, otherwise repeat under `:focus`.

### 3.3 The wider floor

- Color contrast: WCAG AA (4.5:1 body, 3:1 large text and UI). Test the neubrutalism palette; hot yellow on white loses.
- Semantic HTML first. Structure before style before behavior.
- `<noscript>` fallback for anything JS-only where content is at stake.
- Provide a visual alternative for every audio cue (partial hearing loss).

---

## 4. WebGL, shaders, and the "cinematic" hero move

### 4.1 What shipping shaders means in 2025

Maxime Heckel's Config 2025 talk ("The future of the web is paved with shaders") is the ecosystem's rallying line. The concrete moves:

- **Inline fragment shader as the hero background** (via `<canvas>` + `<script type="x-shader/x-fragment">` in-page, or the `shader-web-background` library for Shadertoy compatibility with multipass and feedback loops).
- **Thick glass / real refraction** via texture2D snapshots from front and back sides of the mesh — the "thick piece of glass" trick.
- **Diffuse lighting per-fragment via normals** — surprisingly intuitive once you accept that a normal is already a direction.
- **Ripples, reveals, and dynamic blur** driven by GSAP animating shader uniforms (Codrops 2025 Adoratorio tutorial).

### 4.2 Fake-it techniques that hold up (Bruno Simon canon)

Not everything needs a physical light or a shadow. Fake them:

- **Matcap textures** — pre-baked shading; the surface color = texture-lookup by view-space normal. No lights, no shaders, one texture.
- **2×2 texture gradients** — a 2×2 pixel PNG sent to the shader; UV interpolation gives you a smooth 4-corner gradient across a fullscreen plane.
- **Light bounce via absolute-normal dot up-axis** — the more a face points down and sits near the ground, the more "bounce color" it gets. Zero lights, near-real feel.
- **SDF texture for foliage** — dynamically shrink leaves in front of the camera by changing an alpha threshold, no geometry change.
- **Instancing** for repeated geometry (trees, benches, particles). One draw call, thousands of instances.
- **Palette-baked color** — a single texture atlas where every model looks up its color via UVs; no vertex colors, easy re-palette across a scene.

### 4.3 GSAP + WebGL orchestration (Simplified Media, Codrops)

Two-layer contract:

- **GSAP handles the DOM** — timelines, easing, scroll triggers, sequencing, page transitions.
- **WebGL handles the GPU** — particles, shaders, 3D scene, post-processing.
- **The uniform pipeline is the glue**: GSAP animates plain JavaScript objects; those values are passed as uniforms to the shader every frame. GSAP owns timing and easing, the GPU owns rendering.

Concrete patterns from Codrops' 2025 catalogue:
- Scroll-revealed WebGL gallery (GSAP ScrollSmoother + Barba.js + Astro).
- Click-and-hold mask reveal via shader.
- Cinematic 3D scroll experiences (camera path + lighting + type synced to ScrollTrigger).
- Layered zoom scroll effect with ScrollSmoother.
- 3D audio visualizer (Three.js + GSAP + Web Audio API).
- Elastic-grid scroll with lag-based layout animation.

### 4.4 The performance floor

- **GPU-tier detection** via a benchmark library; scale particle count, shader complexity, parallax depth, and render resolution by device.
- **`ScrollTrigger.matchMedia`** for breakpoint-specific timelines.
- **Compositor-only properties** for anything that runs while the user scrolls.
- **Never `scrub: 0`** for physical premium — `scrub: 1.1` lets the animation ease *toward* the scroll, not snap to it. That's the whole "premium launch" vs "template" difference.

---

## 5. Modern platform features that replace old JS

The 2025 platform (Chrome 115+, Safari 17.4+ / 18+, Firefox 110+) makes many "always required JavaScript" patterns declarative:

### 5.1 Scroll-Driven Animations

```css
.card {
  opacity: 0;
  translate: 0 2rem;
  animation: fade-up linear both;
  animation-timeline: view();          /* progress = element's visibility in viewport */
  animation-range: entry 10% entry 40%;
}
@keyframes fade-up {
  to { opacity: 1; translate: 0 0; }
}
```

Two timeline primitives:
- **`view()`** — element's position within its scrollport (this element fades in as it enters).
- **`scroll()`** — the container's overall scroll progress (progress bar, nav collapse, hero pin).

Both run **off the main thread** on the compositor, so no jank under load.

Named timelines with `timeline-scope`:
```css
main       { timeline-scope: --tracked; }
.content   { view-timeline: --tracked; }
.indicator { animation-timeline: --tracked; /* driven by .content's position */ }
```

### 5.2 View Transitions API

Same-document morph:
```js
document.startViewTransition(() => updateDOM());
```

Cross-document (MPA) with zero JS:
```css
@view-transition { navigation: auto; }
```

Named morph pair:
```css
.hero    { view-transition-name: hero; }
.detail  { view-transition-name: hero; }  /* on the next page, same name */
```

The browser captures a bitmap of the old state, a bitmap of the new state, and interpolates. `::view-transition-old(name)` / `::view-transition-new(name)` / `::view-transition-group(name)` control the crossfade.

### 5.3 Scroll-driven variable fonts

Weight/width/slant morph tied to scroll — zero JS:

```css
@keyframes condense {
  from { font-variation-settings: "wght" 700, "wdth" 100, "opsz" 12; }
  to   { font-variation-settings: "wght" 300, "wdth" 60,  "opsz" 72; }
}
.hero {
  animation: condense linear both;
  animation-timeline: scroll(root);
  animation-range: 0px 300px;
}
```

Reserve inline space for the widest state (`min-width` or `letter-spacing` buffer) to prevent mid-animation layout shift.

**Feature-detect and fallback**:
```css
@supports (animation-timeline: scroll()) and
          (font-variation-settings: "wght" 400) {
  .hero { animation: condense linear both; animation-timeline: scroll(root); }
}
```

---

## 6. Kinetic typography — a hero-worthy move

Variable fonts (GT Standard 2025: 4 axes, 336 styles; Whyte Variable; Recursive with `CASL`/`MONO` axes) give you fluid interpolation of shape without swapping files.

**Axis map**:
- `wght` — weight (100–900). The pulse / breathing accent.
- `wdth` — width (60–120). Headline condensation on scroll.
- `slnt` / `ital` — slant / italic. Emphasis word morph.
- `opsz` — optical size (auto-adjust detail at scale).
- Custom (`CASL`, `MONO`, `SOFT`, ...) — foundry-specific.

**Rules**:
1. **Reserve space** for the widest state — `letter-spacing` or `min-width` buffer — or your line reflows mid-animation.
2. **Same axes in every keyframe**, same order, or interpolation breaks and the font snaps.
3. **Subset the font** aggressively — variable fonts are 2–3× larger than a single static cut.
4. **`transform: scale()`, not `font-size`** for size changes (compositor).
5. **`overflow-hidden` parent + `translateY` child** for reveal, not `clip-path` (paint cost).
6. **GSAP + SplitType** for character-level control; ships with battle-tested easing library.
7. **Under `prefers-reduced-motion: reduce`**, pin to a balanced static axis state — do not remove the type.

Dinamo's provocation: *"On the web, all the information packed in a variable font can be controlled by anything from the position of your cursor to the weather in the Bahamas, or even the inflation curve of a foreign currency."*

---

## 7. Sound & sonic branding

Sound is now core to the top-tier stack (Howler.js in 7/30 SOTY nominees). But it must be earned.

### 7.1 Library choice
- **Howler.js** — file playback (music, SFX, UI). Sprites pack many UI sounds into one file, zero-latency calls by name. Handles autoplay policy and mobile quirks.
- **Tone.js** — synthesis, sequencing, reactive audio. Musical paradigm (transport, nodes, scheduling). Use with Web Audio API for filters, reverb, spatial panning.
- **Common pattern**: Howler for asset playback + Tone for reactive layer. Only add both if you actually need both.

### 7.2 Earcon hierarchy (four tiers)

| Tier | Role | Examples |
|------|------|----------|
| 1 — Alerts | Critical events, high salience | Error, urgent notification, hazard |
| 2 — Primary actions | Distinctive earcons for core actions | Send, complete, success, transaction |
| 3 — Secondary feedback | Subtle functional sounds | Button tap, toggle, navigation |
| 4 — Ambient | Background presence, no attention demand | Progress indicator, loading, atmosphere |

### 7.3 Non-negotiables
- **Mute + volume controls, always** — obvious icons, keyboard-reachable.
- **No autoplay with sound** — user gesture required to unlock the audio context; unmute is opt-in.
- **Visual alternative** for every audio cue (users with partial hearing loss).
- **Emphasize mid-frequencies**; do not rely solely on high-frequency cues (age-related loss).
- **Consistency**: same sound for the same event across the product.
- **Compress**: MP3 / AAC / Ogg; lazy-load; CDN with caching.
- **Structured data**: `AudioObject` inside `CreativeWork` for discoverability.

### 7.4 When to use it

Sound is *not* decoration. Use it when it:
- Confirms a state change the user cannot see instantly.
- Reinforces a brand's emotional register at a hero moment (once, not per scroll).
- Adds a functional layer (accessibility for cognitive load, ambient mood in a game/exhibit context).

Otherwise, silence is the default.

---

## 8. Information design (Lupi / Fragapane / Bremer / Wu)

The dataviz frontier is not "which chart type" — it is **which visual language will do justice to what the data actually means**.

### 8.1 Giorgia Lupi — Data Humanism (Pentagram partner)

Core principle: *"Connecting numbers to what they stand for: our imperfect, messy human lives."*

- Even sensor data reflects human choices about what to measure and ignore.
- **Sketch first** — physical engagement enhances understanding, exposes assumptions.
- **Custom visual metaphors per dataset** — the visual language is derived from the subject, not imposed.
- **Multi-layered storytelling** — an immediate narrative for the Bart Simpsons + a deep exploratory layer for the Lisa Simpsons.
- Case: *1,374 Days: My Life with Long Covid* (NYT visual op-ed). Textured brushstrokes = one hue per symptom; lines and dots = milestones; scrolling reveals the pileup and the ongoing state.
- Case: **Gates Foundation identity** — logo letters link together; the gate form itself expands, collapses, reorients to frame content across the brand system.
- Case: **Milan Triennale "Inequalities"** — the identity itself is generative treemaps from real datasets (education, climate migration, gender equity, life expectancy). Every colored block is a proportional share of the whole. Identity system = data system.

### 8.2 Federica Fragapane — Visual words

- Organic shapes are **an alphabet, not a chart type**. Trees, branches, hair braids, snakes.
- Case: Iranian women's hair — one strand per death (133 → 532 across the drawing period). Data becomes drawing over time.
- Case: CO2 red snake on fuchsia — image, not symbol; brings out the problem.
- Process: understand client → analyze data + collect visual inspiration in parallel → sketch on paper → RAWGraphs skeleton → Illustrator custom.
- *"They are 'visual' words, as important as alphabetic ones … an act of witnessing."*

### 8.3 Nadieh Bremer / Shirley Wu — Data Sketches

- 24 projects across 12 topics — annual collaboration to force experimentation.
- Sketch pen+iPad → D3.js in Visual Studio → many iterations.
- Beyond templates: **uniqueness is the paradigm**.
- Data extraction and cleaning is **step zero**, always underestimated.

### 8.4 The transferable rules

1. **Sketch by hand before code.** Illustrator, iPad, paper — whichever, but not straight to D3.
2. **Derive the visual language from what the data is about**, not from the chart-picker.
3. **Multi-layer**: instant read + deep exploration in the same piece.
4. **Declare human intervention**: what you selected, what you excluded, what you don't know.
5. **Never neutral**: aesthetics choose, aesthetics witness. Own the choice.

---

## 9. Editorial typography (Klim / Grilli / Dinamo / M/M Paris)

### 9.1 Foundries that lead the market

- **Grilli Type** (Lucerne + NYC) — GT Standard (2025) is the reference variable workhorse: 4 axes (wght, wdth, slnt, opsz), 336 styles, one file. Grilli's genre is *"graphic designers who run a type foundry"* — every typeface ships with its own mini-site as art direction.
- **Dinamo** (Berlin) — value-based licensing; Font Gauntlet + Dark Room are free public tools; Whyte Variable emerged from those.
- **Klim** (Wellington) — *"a thing well made."* Söhne (Franklin Gothic modernization) is in Apple's OS.
- **Pangram Pangram** — Editorial New / Editorial Old — the shorthand for expressive editorial serifs across Typewolf's 2024–25 features.

### 9.2 Editorial serif shortlist for 2025

The market keeps pairing these:

- **Serif with display personality**: Editorial New, Canela, Noe Display, Tiempos, Freight Text, Reckless Neue, Ivar, GT Alpina, Fabric Serif, Grenette, Sweet Sans, Baskerville, Signifier, Tobias, DaVinci.
- **Neutral sans for body**: Neue Haas Grotesk, Inter, Neue Montreal, Söhne, Suisse Int'l, Diatype, Switzer, Founders Grotesk, DM Sans, Space Grotesk.
- **Editorial mono**: Diatype Mono, DM Mono, Roboto Mono, FK Grotesk Mono.

**The pairing rule** (Themex Studio, cross-checked with Typewolf): high-character display serif + neutral sans body, or sturdy text serif + restrained grotesk. Contrast is the point.

### 9.3 The M/M (Paris) — Harper's Bazaar Italia 2025 lesson

The Bazaar redesign paired a **custom all-caps display** (Gran Bazaar — colored semicircles inspired by Munari mobiles) with two **existing typefaces used with intent** (LL Schema by Alberto Malossi, AL Sigla by Alex Lescieux). Their design brief: *"A magazine that moves at the speed of thought, not the speed of scroll."*

**Transferable**: one bespoke display voice + two workhorses used deliberately > seventeen fonts pulled from Google Fonts.

### 9.4 Colossal magazine (Firebelly, 2025 STA winner)

Two workhorses only: **Visuelt** (Colophon) + **Fabric Serif** (Monokrom). Subtle adjustments to the wordmark ("play, whimsy, curiosity") preserved recognition while introducing character.

---

## 10. Scrollytelling — narrative on the page (NYT / Bloomberg / Pudding / BBC / NRK / La Verdad)

### 10.1 The proven patterns

- **Sticky pinning of the evidence** (BBC Wagner "Lost Tablet"). The artifact stays fixed on screen; the story unfolds in text beside it. Evidence becomes a character.
- **Dynamic highlighting** — when the narrative references a specific line item in the pinned document, that line lights up in-place.
- **Scroll-triggered reveal/fade** — content appears when the reader is ready; you don't dump the plate at load.
- **Automated audio synced to text** (La Verdad Murcia). Blurred audio container; play or scroll-read.
- **Small-multiples animation** (NYT Olympics) — tiny 3-D swimmers/runners changing stroke mid-race, game-like SFX, tuned for TikTok/Instagram sharing.
- **Illustrated scroll-driven narratives** (NRK "Sickly Sick") — when there are no photos, illustrations do the work; scroll-driven CSS animations run off the main thread.
- **Swipeable next-article** via `scroll-snap` + scroll-driven — one recommended article visible with several optional siblings.

### 10.2 The tooling

- **D3.js** for interactive charts (NYT's low-level standard; years of accumulated idioms and custom components).
- **Custom scrollytelling frameworks** — every top newsroom has one; they encode conventions and accelerate common patterns.
- **`ai2html`** (NYT open source) — Illustrator artwork → responsive HTML/SVG for print-to-web.
- **Scroll Timeline / View Timeline** now replace most `IntersectionObserver` + `requestAnimationFrame` scroll handlers.

### 10.3 The internal discipline (NYT graphics desk)

12-step workflow: pitch → data exploration → sketch (paper) → data cleaning → design → prototype (D3 for interactive, R/Python for static) → **internal critique** (peer + editor) → refine → fact-check with editors, reporters, external experts → publish. Weeks-long apprenticeship in internal conventions and design system before shipping.

---

## 11. Print-to-web bridges (Experimental Jetset / Feixen / Weingart / Troxler)

The best web is often print thinking, one layer deeper.

### 11.1 Experimental Jetset

- Auto-reply is a 1000-word manifesto — the design of the reply itself.
- Trio as a "three-person movement" (De Stijl / Provo lineage) — the studio is the movement.
- Synthesis of late-modernist Total Design + DIY punk — grammar of typography as grammar of politics.
- *"Design is intrinsically linked to the ideology of makeability."*

### 11.2 Studio Feixen (Felix Pfäffli)

- *"Order for clarity, disorder for surprise."* Balance is the practice.
- Print 30 drafts. Pin to the floor. Find the language. **Do not think about it, make it and react.**
- Brush stroke = movement + story. Typeface without letters — you can't read it, you feel it. Font that communicates movement.

### 11.3 Weingart & Troxler (Swiss Punk / Jazz Typography)

- Weingart: hand-cut films, barely-legible type, deliberate halftone overlap for moiré. New Wave born from photofilm era's material affordances. *"Provoke Swiss from within."*
- Troxler: **all information at one typeface size**, no headline hierarchy. Improvise with letterforms like jazz notes. Non-left-to-right reading. *"Can you read it? Hopefully."*
- Weingart's own summary: *"Clean Swiss typography is still needed, but it's now 'subject specific.' It is used when function is of prime importance. We now have far more possibilities to express ourselves than we ever could with Swiss typography."*

### 11.4 The transferable moves

1. **Constrain first, break deliberately.** Grid before drift.
2. **Set all info at one size** to test whether the type composition alone carries the poster.
3. **Overlap layers** (halftones, transparencies, films) for moiré textures no filter can synthesize.
4. **Type without letters** — pure movement — for hero units where the word is redundant.

---

## 12. Cinematic product page (Apple lesson)

Apple's iPhone 17 Pro vs 16 Pro vs Air breakdown (Lab47-46) surfaces the AIDA (Attention → Interest → Desire → Action) skeleton the top of the market uses.

### 12.1 The three interaction stages

| Stage | Interaction | User engagement level |
|-------|-------------|----------------------|
| 1 | **Static displays** — hero image, headline, negative space | Just landed; still deciding |
| 2 | **Guided movement** — scroll-triggered animations, sequences, revelations | Interested; letting the page pace them |
| 3 | **User-driven exploration** — 360° views, horizontal scroll, tabs, drags | Engaged; retention and purchase intent both peak here |

### 12.2 Visual language rules

- **Minimalism + negative space** — the product appears alone, centered, on deep neutral. Undivided focus.
- **Lighting as texture and structure** — controlled highlights across a material surface, reading construction.
- **Motion as quality cue** — deliberate, not busy. Motion signals craft.
- **Color as restraint** — the palette carries the argument before the copy.
- **Hard visual break between AIDA stages** — Apple switches from dark theme to white for the Action stage to signal "now decide."

### 12.3 Message design

- **iPhone 16 Pro** — emotion first, logic second. Peripheral hooks + central-route validation (dual-route persuasion). *You become someone.*
- **iPhone 17 Pro** — capability language first, in a five-model lineup where "Pro" must be unmistakable in 3 seconds. *This tool does this.*

The lesson: **the model choice you're selling determines the message register.** A studio portfolio might sit on the 16 Pro register (identity); a technical tool page on the 17 Pro register (capability).

---

## 13. Neubrutalism (concrete recipe)

The 2020s domestication of anti-design as a **productized grammar**. Not to be confused with early-2000s web brutalism (deliberately raw, sometimes anti-UX). Neubrutalism keeps hierarchy and usability.

### 13.1 The tokens

```css
:root {
  --brut-bg:          #ffffff;
  --brut-ink:         #000000;
  --brut-accent-1:    #ff6b35;   /* 2–4 saturated hues, no gradients */
  --brut-accent-2:    #4d4dff;
  --brut-border:      3px;
  --brut-shadow:      4px 4px 0 0 var(--brut-ink);   /* zero blur */
  --brut-radius:      0;                              /* sometimes 4-8px softens */
}

.card {
  background: var(--brut-bg);
  border: var(--brut-border) solid var(--brut-ink);
  border-radius: var(--brut-radius);
  box-shadow: var(--brut-shadow);
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}
.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 0 var(--brut-ink);
}
```

### 13.2 The rules

- **Palette**: 2–4 saturated colors + neutral base. No gradients, no muted tones.
- **Borders**: uniform 2–4 px, always visible.
- **Shadows**: solid offset, **zero blur** (`Xpx Ypx 0 0 color`). Anti-naturalistic depth.
- **Typography**: oversized sans-serif display + calm operational body copy.
- **Layout**: rigid visible grids, generous padding, deliberate asymmetric offsets — *broken but not random*.
- **Contrast test**: run every pair through WCAG AA. Bright yellow on white will fail.
- **When it fits**: creative portfolios, indie products, campaign micro-sites.
- **When it doesn't**: enterprise B2B, healthcare, dense data. It increases cognitive load.

---

## 14. What v2.2 must change about `/reimagine-it`

Cross-referencing every source: the current v2.1 gold packs are **credible but not distinguished at the very top of the market.** Specifically:

| Gap the market shows | v2.2 response |
|----------------------|---------------|
| Motion is single-loop CSS only; the market runs GSAP-orchestrated shader uniforms | Add **inline-shader × scroll-uniform** to the hero-move axis. When the user has not banned it, the cinematic pack ships an inline WebGL2 shader whose uniforms are advanced by scroll position. |
| Type is static; the market ships variable-font axis morph tied to scroll | Add **scroll-driven variable axis morph** to the motion budget. Reserve inline space so no layout shift. |
| Interaction craft floor missing (`::selection`, `:focus-visible`, prediction cone, disabled-after-submit, prefers-reduced-motion decomposition) | New **Craft Floor** section — every webpage output must clear all Rauno/Emil floor items or drop to `partial`. |
| Sound is entirely absent | Add optional **sound-tier** system: Howler sprite pack + earcon hierarchy + mute/volume, opt-in via `--sound`. |
| The compositor-only rule for motion is implicit | Make it explicit: only `transform`, `opacity`, `filter` for anything that runs. Anything else fails the visual verify. |
| Reduced motion is untreated | New rule 5.b addition — verify at `prefers-reduced-motion: reduce` too; motion decomposes correctly; focus indicators stay. |
| View Transitions / Scroll-driven timelines are unused | New craft entries; treat them as the default MPA transition path when the pack is multi-page. |
| Draw axes need a "reader / experience" register | Add **reader register** axis: `dashboard-live`, `editorial-drift`, `field-guide-quiet`, `cinematic-shader`, `neubrutalist-blunt`, `poster-jazz-improv`. Content narrows the set. |
| Content-only autopilot is undertested when the source is very small (a few nouns) | New rule 0.85: **anchor list** — extract 3–5 concrete nouns/proper nouns from the source (subjects, places, dates, verbs) and pin them to specific plates; every plate must map back to an anchor. |

The result should be a v2.2 that reliably produces work in the register of Instrument / Active Theory / Lupi / Feixen when the token asks for it, and holds the interaction craft floor of Vercel / Linear on every run.

---

## Source register (indicative — full search transcripts and long-form fetches live in the agent-tools scratch cache used during this research pass)

- **Awards & tech scans**: Awwwards SOTY 2025 page; Stefano Bartoletti Wappalyzer scan (LinkedIn); OFF+BRAND Lando Norris breakdown (CODE Barcelona); Cartier Watches & Wonders 2025 (Awwwards SOTD).
- **Studios**: Active Theory (Communication Arts, LBBOnline, richardczhou.com); Instrument (Perfected, Eames Institute, Splice, Iru); Studio Feixen (Type.today, Neshan, On Switzerland, Creative Gaga); Locomotive Lightship (Medium); Pentagram (Gates Foundation, Milan Triennale).
- **Editorial newsrooms**: NYT Graphics Desk workflow (datafield.dev, NYT year-in-graphics); Bloomberg Graphics 2025 in Graphics; The Pudding Pudding Cup 2025; SND47 (Creative Brands Mag); Datawrapper 2025 list-of-lists; BBC "Lost Tablet" (Scrollytell.ing); NRK case study (Chrome Dev blog); La Verdad Murcia (INMA).
- **Craft floor**: Rauno Freiberg (rauno.me, github.com/raunofreiberg/interfaces, Devouring Details); Emil Kowalski (emilkowal.ski, Animations on the Web, emilkowalski/skill SKILL.md, AI Skill Market blog).
- **WebGL / creative code**: Bruno Simon (bruno-simon.com, Three.js Journey, Medium case study, brnd247); Codrops 2025 tutorials + year-in-review; Simplified Media procedural animation; Hon Tran product-launch microsite; shader-web-background (xemantic); Maxime Heckel Config 2025 talk; The Book of Shaders; Shadertoy; Zach Lieberman (Baukunst, Medium Box Light Studies); Casey Reas (reas.com/process); Refik Anadol (Unsupervised MoMA).
- **Type foundries**: Grilli Type (Figma Blog, GT Standard, Creative Boom, Typecache); Dinamo (It's Nice That Dark Room + Font Gauntlet); Klim (Creative Boom); Pangram Pangram (Typewolf Editorial New); Fonts In Use (Colossal, Harper's Bazaar Italia); Typewolf trending list; Themex Studio editorial font guide.
- **Data humanism**: Giorgia Lupi (giorgialupi.com, arxiv Data Humanism Decoded, Fast Company Long COVID, Pentagram Gates + Triennale); Federica Fragapane (Storybench, Medium, Abitare, Domestika); Nadieh Bremer + Shirley Wu (datasketch.es, PolicyViz, Medium).
- **Print-to-web**: Experimental Jetset (Print Magazine, jetset.nl studio culture / graphic design now / design ideology / disrepresentation now, designmanifestos.org); Wolfgang Weingart (Design Observer, Letterform Archive, Neugraphic interview); Niklaus Troxler (Eye on Design, Cooper Hewitt).
- **Cinematic product**: Apple iPhone 17 Pro / 16 Pro / Air (Lab47-46 Parts 1–2 + evaluation; AXIS Magazine exclusive; LNGFRM).
- **Modern platform**: MDN `:focus-visible`, `prefers-reduced-motion`; W3C WCAG 2.2 SC 2.3.3 + 1.4.11; css-animation.com Focus & State Motion; CSS-Tricks scroll-based `view()`; Josh W Comeau Scroll-Driven Animations; Chrome Dev docs scroll-driven animations; css-scroll-driven.com View Transition patterns; fearchitect view-transitions.
- **Kinetic type**: Studiomeyer.io Kinetic Typography 2026; Social Animal (kinetic type + micro-interactions); animationpatterns.art variable font morph; dinglandia.design scroll-driven variable fonts; RMCAD motion graphics fonts.
- **Sound**: supadark tone-vs-howler + interactive audio experiences; sonic branding strategy (Design Project); Readymag sound-on-the-web history; KillerSpots Core Web Vitals audio.
- **Neubrutalism**: neubrutalism.com; NN/G Neobrutalism best practices; Alex Mayhew developer guide; Made Good Designs neubrutalism.
- **Progressive enhancement / perf**: Request Metrics FMP is dead; MDN FMP glossary; Frontend Patterns Progressive Enhancement Mindset.

---

*Compiled 2026-08-20 for `/reimagine-it` skill v2.2 upgrade.*
