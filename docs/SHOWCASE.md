# Case studies — one source, one command each

> **This document is the extended gallery.** For the quick start, see the [README](README.md).

Every case below reimagines the **exact same naive HTML** ([`gold/webpage/before.html`](gold/webpage/before.html) — a plain Texas notebook, 40 lines, no CSS, one email) with **one different token**. Cases 1–8 are eight different domains and modifiers on the default `webpage` pack. **Case 09** is the v2.2 raised bar — a third *reader register* of the default pack (`--variant c`, `cinematic-shader`). **Case 10** is the v2.3 infographic pack — the same notebook read as a statistical poster, not a dashboard. **Cases 11–13** keep that HTML and change the *form*: SVG, Three.js, simulation. To match how a designer reads a case study, each case is laid out top-to-bottom:

1. the **before** shot sits on its own line,
2. the **five notes the command picked** (reader register · palette · motif · motion · 3D) sit between the two shots as real descriptive text,
3. the **after** shot sits on its own line.

Every image renders locally from a real `.html` file in this repo. Regenerate the whole set: `python gold/shots.py`.

---

## Texas notebook — 13 designs from one HTML file

The source page is 40 lines of naive HTML:
```html
<h1>A Texas notebook</h1>
<p>A few notes on Texas — the state, the flag, and the people.</p>
<h2>Places</h2>
<ul>
  <li><h3>Alamo, San Antonio (1836)</h3><p>A small stone mission…</p></li>
  <li><h3>Big Bend, west Texas (1944)</h3><p>Eight hundred thousand acres…</p></li>
  <li><h3>Austin, on the Colorado (1839)</h3><p>Live music, live oaks…</p></li>
</ul>
<h2>Signals</h2>
<ul>
  <li><h3>Lone Star flag (1839)</h3></li>
  <li><h3>Bluebonnet (1901)</h3></li>
  <li><h3>Longhorn (1995)</h3></li>
</ul>
```

Change the source and the whole design changes. `/reimagine-it` on a coffee roaster's site pulls warm browns and burlap textures; on a night-diving report it pulls deep teals and bioluminescent accents; on a printing press's page it pulls hand-set caps and paper grain.

---

### Case 01 · Default spine

`/reimagine-it webpage`

*A small notebook OS for a small notebook on Texas.*

**Before.** The raw HTML in the browser default — one heading, two lists, an email, a note. Times New Roman on paper white. No hierarchy, no motion, no motif.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif, ~40 lines of untouched markup](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — deep-night navy ground, cream text, sun-gold accent, star-red reserved for the drop caret and one hover state. Chosen because the source names the **Lone Star flag** (navy / white / red) and **Big Bend** (gold sunset).
- **Motif** — a small red star before the H1; three sun-gold KPI tiles pulling real numbers from the source (`3 places`, `1836 &rarr; 1944`); three place cards with a mini-bar chart, a sparkline, and a rug-plot; a terminal card carrying the source's email.
- **Motion** — counters rise on load, the caret blinks in the terminal card, nothing else moves.
- **3D** — cards lift ~8 px with a soft cast shadow. No rotation, no parallax.

**After.**

![After Draw A: navy dashboard for the Texas notebook — a red lone-star lockup, oversized ivory display type, three sun-gold KPI tiles for the three places, three place cards with charts, a terminal card, and a status table for Now](gold/webpage/after.png)

Open the live file → [`gold/webpage/after.html`](gold/webpage/after.html)

---

### Case 02 · `artistic`

`/reimagine-it webpage artistic`

*The notebook as an editorial cover.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — cream ground with navy display type; the ampersand and one word (`REPUBLIC`) set in star-red; sun-gold reserved for the concentric orbital arcs behind the type.
- **Motif** — `Texas & the Lone Star REPUBLIC` set at hero scale in italic serif; three drifting SVG orbits read as sunset rays over the prairie; a mini pin marks Austin on the orbit.
- **Motion** — the italic ampersand sways ±3° on a 4-second cycle (with `transform-origin` locked so it pivots from its baseline); the orbital arcs drift slowly.
- **3D** — the three place-cards fan out at real ±16° with a 40 px drop-shadow. The 3D reads in a still.

**After.**

![After: italic-serif editorial cover of the Texas notebook — Texas & the Lone Star REPUBLIC in navy and star-red across a warm parchment ground, three drifting orbital arcs behind the type, three place-cards fanning out at plus-minus 16 degrees below](gold/domains/artistic/after.png)

Open the live file → [`gold/domains/artistic/after.html`](gold/domains/artistic/after.html)

---

### Case 03 · `dashboard`

`/reimagine-it webpage dashboard`

*The notebook as an ops surface.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — navy ground with a subtle gold-hatched paper texture; sun-gold and emerald traffic pills for the two places doing work; star-red reserved for the alert dot and the drop caret.
- **Motif** — top ribbon of four sun-gold KPI tiles pulled from the source (`3 projects`, `11k lines`, `p214 reading`, `3/9 book chapter`); a two-color shipping-volume chart with a projection line; three status rows for `alamo` / `big bend` / `austin`; a `Now, this week` table; a terminal card sending the source's email.
- **Motion** — the chart bars rise into place between frames (proven in the motion strip lower on this page); counters count up; the caret blinks in the terminal card.
- **3D** — cards lift ~10 px; KPI tiles sit on their own soft-shadowed row; no rotation, no parallax.

**After.**

![After: ops-surface dashboard for the Texas notebook — top ribbon of four sun-gold KPI tiles for projects and lines and reading and book chapter, a two-color shipping-volume chart for Alamo and Big Bend and Austin, three status rows for the places, a Now-this-week table on the right, and a terminal card sending the source email](gold/domains/dashboard/after.png)

Open the live file → [`gold/domains/dashboard/after.html`](gold/domains/dashboard/after.html)

---

### Case 04 · `photography`

`/reimagine-it webpage photography`

*The notebook as a numbered folio.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — cream ground with warm dust and near-black type; sun-gold caption tags; star-red drop-caps and the small folio star at top-left.
- **Motif** — Didot-scale italic-then-caps nameplate reading `Texas / NOTES`; a four-plate index bar (`Plate I · Austin`, `Plate II · Big Bend`, `Plate III · Alamo`, `Colophon`); three real SVG "photographs" drawn on the page (Austin sunset with a moon disc, Big Bend night sky, Alamo mission silhouette); dropcap paragraphs; per-plate caption strips (`Medium · Weight · State`).
- **Motion** — deliberately quiet. A folio doesn't twitch.
- **3D** — none. The whole thing sits flat like a printed spread.

**After.**

![After: Didot magazine folio of the Texas notebook — Texas slash NOTES nameplate in italic and caps, an index bar for four plates, three real SVG photographs of Austin at sunset and Big Bend at night and the Alamo mission, dropcap paragraphs, and caption strips](gold/domains/photography/after.png)

Open the live file → [`gold/domains/photography/after.html`](gold/domains/photography/after.html)

---

### Case 05 · `cinematic`

`/reimagine-it webpage cinematic`

*The notebook as a shader-lit oversized headline.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — deep-night navy ground; the shader runs **navy → sun-gold → star-red** in a raymarched interference field, chosen because the source names the **Lone Star** and **Big Bend's sunset**. A marine-biology source would render a teal-and-current shader instead.
- **Motif** — an inline `<canvas>` + inline fragment shader (`<script type="x-shader/x-fragment">`) carrying an oversized `Texas & the Lone Star` set in ivory with a red ampersand; three place-cards for Austin / Big Bend / Alamo; four sun-gold KPI stats (`3 missions`, `190 years`, `800K acres`, `1 star`).
- **Motion** — the shader field evolves visibly frame to frame (proven in the motion strip below); the KPI counters rise on load.
- **3D** — the three place-cards sit forward with a mild `translateZ(20px)` and a paired soft/dark shadow. The shader plate has a 24 px inset shadow.

**After.**

![After: WebGL2 Texas-sunset shader hero for the Texas notebook — oversized ivory Texas and the Lone Star with a red ampersand set over a running raymarch field, three place cards for Austin Big Bend Alamo below, and four sun-gold KPI stats along the bottom](gold/domains/cinematic/after.png)

**No CDN, no `import` from `https://`, no vendor folder.** The shader ships in the same `.html` file as everything else.

Open the live file → [`gold/domains/cinematic/after.html`](gold/domains/cinematic/after.html)

---

### Case 06 · `cinematic` + `glassmorphism`

`/reimagine-it webpage cinematic glassmorphism`

*Two glass tiers over the running sunset — glass reveals, glass never covers.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — the same navy / gold / red sunset shader keeps running behind the glass; the glass itself picks up its color from what it's blurring, so the front tier reads red-warm and the deep tier reads gold-warm on the same page.
- **Motif** — a **front tier** (14 px blur) over the masthead carrying `Texas & the Lone Star`; a **deep tier** (24 px blur) over a `Piece 03 — Austin, live music` data tile; three small `SUBSTRATE / GLASS RULES / MOTION BUDGET` reader cards below carrying the rules of the pack itself.
- **Motion** — the substrate runs, the glass itself never tilts or blurs on hover — glass is a surface, not an object. Two beats per section, not five.
- **3D** — light-source-consistent borders (bright top-left inset, dark bottom-right inset) with colored `box-shadow`s. Blur **reveals** the running sunset; it never covers a solid color.

**After.**

![After: two glass tiers over a running Texas sunset shader — front tier over the masthead and a deep tier over an Austin data tile, with three reader cards below explaining substrate glass-rules motion-budget](gold/modifiers/cinematic-glassmorphism/after.png)

Open the live file → [`gold/modifiers/cinematic-glassmorphism/after.html`](gold/modifiers/cinematic-glassmorphism/after.html)

---

### Case 07 · `dashboard` + `bento`

`/reimagine-it webpage dashboard bento`

*Nine tiles, unequal sizes, one elevated hero.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — navy ground with sun-gold accents; emerald and star-red used sparingly for status; the hero tile lifts brighter than its neighbors so the elevation reads before the content does.
- **Motif** — a named-cell CSS Grid with `grid-template-areas: "brand brand hours state" / "hero hero chart chart" / "hero hero latency logs" / "stack stack incidents incidents"`. Nine tiles, unequal but with shared chrome, each holding one bit of the source (places / signals / season / chart / field log / notes).
- **Motion** — the hero visitors chart ticks in; the field-log rows fade in one per second; the `waiting for bluebonnet season` row pulses.
- **3D** — the hero tile is visibly elevated (`translateZ(24px)` + a 40 px shadow). Every other tile sits flat but casts a small shadow so the elevation reads.

**After.**

![After: nine-tile bento of the Texas notebook — top-left hero tile visibly elevated over a sun-gold visitors chart, right column showing dawn-dusk daylight and star-count-since-1839 and a scrolling field log, bottom row with parts and field notes](gold/modifiers/dashboard-bento/after.png)

Open the live file → [`gold/modifiers/dashboard-bento/after.html`](gold/modifiers/dashboard-bento/after.html)

---

### Case 08 · `landing` + `neon`

`/reimagine-it webpage landing neon`

*Void ground, one accent, one word doing every emotional job.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — near-black void ground with a single radial-gradient vignette; **one** high-chroma accent (`#e8a63f` — sun gold) doing every emotional job: the italic word, the orbital, the CTA border, the blinking cursor. Gold picked because the source names the **Lone Star**.
- **Motif** — an oversized ivory headline `Ship the note, not the pitch.` with the italic `note` set in glowing gold; an orbital SVG with a single gold star at its center; one CTA (`SEE THE NOTEBOOK →`); a status pill (`OPEN · ACCEPTING WORK`); four bottom stats (`3 places on file`, `1 flag in the wind`, `1836 republic since`, `1 lone star`).
- **Motion** — the `note` word pulses letter-spacing on a 4-second cycle; the orbital draws itself on load; a small square cursor blinks after the email.
- **3D** — none. All the depth comes from the glow (double `drop-shadow`) and the vignette. Neon reads flat on purpose.

**After.**

![After: one glowing sun-gold star in a dark void — oversized ivory headline Ship the note not the pitch with a glowing gold italic note word, an orbital SVG with a lone star at the center, one CTA see the notebook, and four bottom stats pulled from the source](gold/modifiers/landing-neon/after.png)

Open the live file → [`gold/modifiers/landing-neon/after.html`](gold/modifiers/landing-neon/after.html)

---

### Case 09 · `webpage --variant c` (v2.2 raised bar, `cinematic-shader` register)

`/reimagine-it webpage --variant c`

*The notebook as a cinematic reading room — the sky in the source becomes the sky in the browser.*

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The five notes the command picked** (Draw C runs an extra note — the *reader register* — from v2.2 forward).

- **Reader register** — `cinematic-shader`. Chosen because the source describes **west Texas at low sun** ("Big Bend, the darkest night skies in North America", "Rio Grande sunset", "Lone Star" in the flag). A dashboard register would have been correct too; this run drew the cinematic card.
- **Palette** — **dusk navy → horizon orange → ember → earth rust → cream ink → sun-gold accent**. Every color is a west-Texas-sunset color pulled straight from the source's own imagery.
- **Motif** — a full-bleed **WebGL2 fragment shader** paints the sky: vertical dusk-to-ember bands, a slow horizon glow that drifts, a warm sun disc off-center, a hash-noise star field above the dusk line, and a low three-peak ridge silhouette. The shader ships inline in the same `.html` file (no CDN, no vendor). A CSS gradient fallback in the same content-derived palette runs when WebGL is unavailable. Above the sky sits a **stroke-then-fill kinetic serif TEXAS wordmark** with a soft orange glow, an italic serif subhead with amber highlights on the source's own three anchor words (*state*, *flag*, *people*), and six content-derived plates (Alamo, Big Bend, Austin, Lone Star, Bluebonnet, Longhorn) with hand-drawn SVG motifs.
- **Motion** — the sunset **evolves visibly** (horizon glow drift, twinkling stars, sun-disc micro-drift); the TEXAS wordmark **fill-in** and **glow-in** on load (compositor-only: `opacity` + `transform`); the six plates **rise into view** on scroll via `animation-timeline: view()`; clicking the Lone Star **spins it 360°** as a hidden Cartier-style reward.
- **3D** — the plates lift on hover (`translateY(-4px)`) with a soft-shadow plate treatment, and the plate motifs sit forward on their own `translateZ(20px)` layer inside a `perspective: 800px` parent.

**Craft floor** (v2.2, all shipped in this file).

- `:focus-visible` ��� every link, button, and interactive SVG shows a **2 px sun-gold outline with 3 px offset**, contrast ≥ 3:1 against the ground.
- `::selection` — on-palette gold-on-earth so highlighted text matches the design.
- `prefers-reduced-motion: reduce` — **decomposes** correctly: the WebGL loop stops, kinetic type pins to the lit end-state (still legible), scroll-driven plate rise is disabled, `:focus-visible` still animates in but its transition is instant. Focus indicators are **never** hidden.
- **Compositor-only motion** — every animation touches only `transform` and `opacity`. No `width`, `height`, `top`, `left`, `filter` in transitions. No `transition: all`.
- **Scroll-driven** — the plate reveal uses `animation-timeline: view()` where supported so scroll motion runs off the main thread.
- **Type space reserved** — the kinetic wordmark reserves its final space before it animates, so no layout shift (CLS = 0).

**After.**

![After Draw C: cinematic Texas reader with a full-bleed WebGL2 west-Texas sunset — dusk-navy sky with a twinkling star field, warm orange horizon, sun disc off-center, low mountain silhouette, cream TEXAS wordmark with an orange glow over the horizon, italic serif subhead, and six content-derived plates below for Alamo Big Bend Austin Lone-Star Bluebonnet and Longhorn](gold/webpage/after-3-full.png?v=texas-v22)

**No CDN, no `import` from `https://`, no vendor folder, no external font fetch.** The WebGL2 shader source, the SVG motifs, and every micro-interaction ship in the same `.html` file. One artifact.

Open the live file → [`gold/webpage/after-3.html`](gold/webpage/after-3.html)

---

### Case 10 · `infographic` (v2.3, statistical poster)

`/reimagine-it infographic`

*The notebook as a paper poster of an argument — one question, answered in marks you can read in a still. Not a dashboard.*

> **What gold is not.** A gold poster is a paper poster of an argument — not a dashboard, not a CV, not an AntV template gallery. No pies, donuts, gauges, 3D, or fabricated KPIs (Cleveland–McGill / Neurath ISOTYPE floor). `@antv/infographic` is not imported; AntV is a structure router only (see [`skills/reimagine-it/references/research/infographic-craft.md`](skills/reimagine-it/references/research/infographic-craft.md) S16).

**Two reference golds (method travels, layout chrome does not):**
- Texas — [`gold/domains/infographic/after.html`](gold/domains/infographic/after.html) (Priestley 1836–1995 strip, ISOTYPE 8-acre units)
- Jules — [`gold/jules/domains/infographic/after.html`](gold/jules/domains/infographic/after.html) (6-flavor sequence, star-around-cone, 8 mint tubs)

[Discussions](https://github.com/Kayforkind/reimagine-it/discussions) — show your gold, propose encodings, vote the next domain.

**Before.** Same raw Texas notebook.

![Before: raw HTML of A Texas notebook — Times New Roman, single column, no color, no motif](gold/webpage/before.png)

**The four notes the command picked.**

- **Palette** — parchment ground (`#f4ecd8`) with navy ink, star-red, and sun gold. Same Lone-Star family as every other Texas draw; weighted as *paper*, not night ops.
- **Motif** — **structure first:** a **sequence** of six dated names (Priestley 1836–1995 on a common year scale) plus a **compare** of places vs signals (glyph · label · desc · value). An **ISOTYPE strip** of eight equal cottonwood-and-ridge units for Big Bend's 800,000 acres (Neurath: more copies, never a bigger icon). Custom glyphs from source nouns. A schematic Texas with three pins. A **lossless data table** of the six named facts. Not a dashboard; not an AntV template clone.
- **Motion** — Lone Star pulse, bluebonnet sway, longhorn horn-tip opacity. Compositor-only (`transform` / `opacity`). The encodings are true at frame 0 so a PNG is enough.
- **3D** — the poster is **flat** (no `rotateX`). Depth is a paper drop-shadow only, so the timeline stays a true common scale. Bars are not extruded (lie factor).

**Craft floor** (v2.3, all shipped in this file).

- `:focus-visible` — 2 px star-red outline, 3 px offset, on links.
- `::selection` — gold on navy ink.
- `prefers-reduced-motion: reduce` — decomposes: animations pin to the final state; focus rings stay.
- **Compositor-only motion** — no `transition: all`. No layout properties animated.
- **No fabricated numbers.** Every year and magnitude is in the source. 19-day siege is a label, not a bar on the century axis.

**After.**

![After: cream paper infographic poster of the Texas notebook — kicker What can we count without inventing a number, sequence of six dated names, Priestley timeline 1836 to 1995, eight equal ISOTYPE acre units, compare of places vs signals with source glyphs, schematic Texas pins, and a data table of the six facts](gold/domains/infographic/after.png?v=struct-1)

Open the live file → [`gold/domains/infographic/after.html`](gold/domains/infographic/after.html)

---

### Case 11 · `svg`

`/reimagine-it svg`

*The notebook as one mark you can drop in a README — alive by default (micro-motion, not a paper poster).*

- **Palette** — parchment, navy, star-red, sun gold (from the flag and the land in the source).
- **Motif** — Lone Star **flag** (canton + bars + star), schematic Texas with unlabeled pins, legend gutter, Priestley 1836–1995 (1839 is a gold tick), eight equal acre units.
- **Motion** — alive-micro: star breathe, Rio Grande dash flow, Alamo pin ping, 1839 tick hush. Hover a pin and its legend swatch answers. Brief `still` freezes loops. `prefers-reduced-motion` keeps hover, kills loops.
- **Not** — Mermaid. Not labels sitting on the map. Not a PNG renamed `.svg`. Not every mark bouncing.

![After: SVG weenie of the Texas notebook — Lone Star flag, schematic Texas pins, legend gutter, common-scale timeline](gold/forms/svg/after.png?v=alive-1)

Open the live file → [`gold/forms/svg/after.svg`](gold/forms/svg/after.svg) · loop close-ups → [`gold/forms/see.html`](gold/forms/see.html)

### Case 12 · `3js`

`/reimagine-it 3js`

*The three places as a room you can orbit under a west-Texas sunset. Offline Three.js r185, vendored, no CDN. Alive by default.*

- **Palette** — dusk navy sky, earth ground, cream mission, gold star and river.
- **Motif** — Alamo chapel facade, capitol wings + dome, Big Bend ridge with a gold Rio Grande tube, upright star monument.
- **Motion** — alive-micro: star turn, gold motes on the river, chapel-window sun-breath, slow wide-drift on "All three". Orbit drag and HUD look-ats in the **footer strip**. Brief `still` pins the camera. Reduced motion stops idle life.
- **Not** — a default cube. Not four cones. Not type stacked on the canvas.

![After: Three.js field of the Texas notebook — dusk ground, mission, capitol, ridge, gold star](gold/forms/3js/after.png?v=alive-1)

Open the live file → [`gold/forms/3js/after.html`](gold/forms/3js/after.html) · same gallery → [`gold/forms/see.html`](gold/forms/see.html)

### Case 13 · `simulation`

`/reimagine-it simulation`

*A playable clock of the years already in the file. Not a dashboard. Type in the gutter; marks on the field.*

- **First encounter** — paused on 1836. Play holds the year at 1836 while the siege runs at ~4 days/s, then advances ~10 years/s and settles at 1995 (no loop). Reset returns to 1836.
- **Event-step** — Prev / Next (and arrow keys) snap to 1836, 1839, 1901, 1944, 1995. Click a pin or a list row to jump.
- **Field** — the same SVG schematic: Texas outline, Rio Grande cubic, pin colors (gold Alamo, navy Austin, star-red Big Bend). After 1839 a star; in spring after 1901 a bloom; after 1944 eight unlabeled acre units; after 1995 a longhorn. No names on the canvas.
- **Siege caption** — only while the year is 1836. Not a bar on the century, and not "19/19" at 1995.
- **Not** — invented battle stats, fake KPIs, or a toy rectangle with a sine-wave river.

![After: year-clock simulation of the Texas notebook — schematic field, Rio Grande, event list, scrubber](gold/forms/simulation/after.png?v=sim-2)

Open the live file → [`gold/forms/simulation/after.html`](gold/forms/simulation/after.html)

---

## Motion is real (three frames per pack)

Screenshots freeze animation, so every claim about motion proves itself in a strip. Three frames per pack, spaced ~1.6 s apart in virtual time — if the pixels change, the motion budget landed:

![motion strip: five packs, three frames each](gold/domains/motion-strip.png?v=texas-5)

- **cinematic** — WebGL2 raymarch field evolves visibly frame to frame.
- **artistic** — italic ampersand sways ±3°.
- **dashboard** — chart bars rise into place between frames.
- **photography** — deliberately still.
- **infographic** — Lone Star pulse + bluebonnet sway on the paper board.
