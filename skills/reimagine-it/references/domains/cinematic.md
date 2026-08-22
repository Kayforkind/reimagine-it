# /reimagine-it webpage cinematic (aliases: `3d`, `webgl`)

Load only when the user token is `cinematic`, `3d`, or `webgl`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

## Aesthetic in one sentence

A quiet cinema screen for a small brief: an inline WebGL2 shader is the masthead, floor-scale 3D CSS gives the sections real depth, and one motion move is running at all times so the page reads as *alive* even in a still frame.

## Palette (five, do not exceed)

- `--void` #05070c — screen background
- `--panel` #0f1420 — section panel
- `--ink` #ecf1ff — primary text on void
- `--dim` #7c8aa8 — meta / mono
- `--beam` #7cf3ff — accent, shader tint, hair-thin rules
- `--ember` #ff7a5c — one warm accent for a single moment (name, ampersand, cursor)

## Type

- Display: sans, 96–200px, tight tracking `-0.04em`, line-height `0.86`.
- Section: sans, 28–36px, `-0.02em`.
- Body: sans, 15–17px.
- Meta / labels: monospace, 11px, tracking `0.24em`, uppercase.
- One line of stress may be italic serif (`Iowan Old Style, Palatino, Georgia`) — an ampersand or a single word — never the whole run.

## Motif and layout

- **Hero is a WebGL2 shader panel.** Inline `<canvas>`, ~840×520, full-bleed rounded rect on a `--void` background. Fragment shader raymarches or field-warps something abstract (interference bands, GPU particles, a slow flow field). The masthead type sits *on top* of the canvas with `mix-blend-mode: difference` or a scrim.
- **A single motion beat runs forever.** The shader tints on a slow sine of `--beam`. The masthead cursor pulses. One SVG element in every subsequent section has a `@keyframes` (bar rising, dot pulsing, path drawing, sweep line).
- **Sections have z-depth, not just tilt.** `.stage` uses `perspective: 1200px`. Cards use `rotateX(-4deg) rotateY(-8deg) translateZ(24px)` with a real 24–40px blur drop shadow so they read as **hovering** in stills, not painted flat.
- **Section identity from this source.** Cinema can have a sticky strip, but a shop is Harbor / Board / Now — not `00 · MASTHEAD / 01 · PLACES`. Numbered notebook rails are a Texas-gold leftover, not cinema's default.
- One dense SVG "screen readout" per section: a real chart, a real diagram, or a real path — not a rounded rect placeholder.

## Non-negotiables specific to cinematic

- **Inline WebGL2 canvas somewhere on the page.** Not optional. If WebGL2 is unavailable, degrade to a canvas 2D animated field — but ship the code path.
- **No CDN. No `import` from `https://`.** The shader lives in a `<script type="x-shader/x-fragment">` block; the JS in `<script>`. No `three.min.js` fetch. (Vendored `vendor/three.module.min.js` is allowed if the domain needs true 3D geometry — flag it in the report and keep the folder-portable.)
- **Motion budget.** At least three moving elements at any moment (shader tint, cursor pulse, one SVG animation). Never more than ten — this is cinema, not a Christmas tree.
- **3D that reads in stills.** At least one element with a computed rotation ≥ 12° **and** a shadow with blur ≥ 24px, so a static PNG proves depth without needing playback.
- **Palette contrast checked.** `--ink` on `--void` must clear WCAG AA at body size.
- **No emoji, no stock photo, no paid image API, no autoplay video.**

## Cut list (in addition to the shared cut list)

- A shader hero followed by lorem cards with no motion below it. If the hero animates and the body dies, the leap is a screensaver.
- Rainbow shaders. One tint, one contrast, one moment.
- CSS `filter: hue-rotate()` infinite (nauseating and lazy).
- Backdrop-filter blur on top of the shader (kills the depth).
- A `three.js` scene that boots an orbit control and then does nothing — no idle animation, no interaction proof.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-cinematic/index.html` for a one-shot. In place if the user's site is being redesigned and they explicitly asked for a WebGL hero.

## Verify

- Open the file in a browser: WebGL2 canvas boots, shader is running, no console errors.
- Headless: render at 1400 wide and grab three frames spaced 500ms apart. The composite shows visible change frame-to-frame (that is your motion proof).
- Depth reads in a single still — you can name one card as "in front" without playing the animation.

## Report addition

```
Motif: <shader field name> + one recurring SVG beat
Make-strange: <what the shader shows / how the type meets the shader>
Tone: cinema screen, quiet + alive
Motion beats: <name three: e.g. shader tint / cursor pulse / stat bar rise>
3D reads in still: <card / stage / hero> at <deg> with <blur>px shadow
```
