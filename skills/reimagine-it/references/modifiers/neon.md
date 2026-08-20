# /reimagine-it webpage \<domain\> neon

Load only when the user token is `neon` (or `--style neon`). Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)) and any active domain pack.

## Aesthetic in one sentence

Dark ground with **one** high-chroma accent doing all the emotional work: a glow that pulses, a stroke that draws itself, a cursor that blinks — everything else stays quiet so the accent reads as light in a room.

## Cut-list waivers (from the spine)

- **"Gradient on the whole background"** — waived if the gradient is a **single radial gradient** with the accent color at the center, fading to black. That's a bloom, not wallpaper.
- **"Rainbow shaders"** (`cinematic` domain rule) — enforced harder. One accent, one contrast.

## New non-negotiables

1. **One accent color.** `--neon` is the whole show. Ink is off-white on near-black. Use `--neon` for the stroke, the glow, the cursor, the hover — nowhere else. Two accents kills the effect.
2. **A visible glow.** Every `--neon` element has a `filter: drop-shadow(0 0 12px var(--neon)) drop-shadow(0 0 24px var(--neon))`. The double drop-shadow trick is the glow (blur+intensity stacked).
3. **A pulse.** The accent's opacity or glow radius oscillates on a 2-4s ease-in-out cycle. Never faster than 1.5s (seizure risk) or slower than 6s (looks dead).
4. **Kinetic type on the accent word.** One word or one symbol in the display type is accent-colored and animates (letter-spacing pulse, sway, or a self-tracing SVG stroke).
5. **Vignette.** A radial gradient in the CSS body from transparent center to `--void` corners. This is what makes the accent read as light in a room.
6. **Contrast enforced.** Off-white on `--void` must clear WCAG AAA at body size. `--neon` on `--void` must clear AA at display size.

## Palette contribution

Constrains to 3–4 colors:

- `--void` #05070c (background)
- `--panel` #0a0f1a (secondary background if needed)
- `--ink` #ecf1ff (all text that is not the accent)
- `--neon` — pick one high-chroma: cyan `#7cf3ff`, magenta `#ff4dd6`, lime `#a8ff3d`, or coral `#ff5c6a`

The domain palette is largely **overridden** by neon. It is that opinionated a modifier.

## Motion contribution

- **Persistent (required):** the accent pulses.
- **Active (required):** hover on any accent element intensifies the glow (larger drop-shadow radii for the transition duration).
- **Narrative (allowed):** one self-tracing SVG stroke on load — `stroke-dasharray` + `stroke-dashoffset` animation.
- **Banned:** rainbow rotation, glitch, scanlines. Pick one texture (usually clean; scanlines only if the domain calls for it).

## 3D contribution

Depth via glow, not translateZ. The accent light *feels* like it is in front because it glows. Panels behind the glow are darker (`--panel`) than the void — deep tones read as recession. If you need a raised element, add a colored shadow (accent color at 15% alpha) beneath it.

## Cut list (in addition to the shared cut list)

- Two neon colors. Kills the effect. Pick one.
- Uniform pulse on every element. One pulses. Others stay quiet.
- Comic sans as "handdrawn neon." No.
- Neon on white background. That is highlighter, not neon.
- Font weight above 700 for the accent word. Too heavy; the glow smears.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-<domain>-neon/index.html` for a one-shot. In place when the user is redesigning a dark-themed landing page or a product page.

## Verify

- Screenshot at 1400 wide: the accent word or symbol is clearly the brightest thing on the page.
- Vignette is visible (corners darker than center).
- Off-white body text clears WCAG AAA on `--void`.
- Only one hex value shows up as a "bright" color across the whole file.

## Report addition

```
Modifier: neon
Accent: <hex + name (e.g. cyan #7cf3ff)>
Pulse: <period in seconds>
Glowing element: <the one thing carrying the light>
```
