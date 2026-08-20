# /reimagine-it webpage \<domain\> glassmorphism

Load only when the user token is `glassmorphism` (or `--style glassmorphism`). Extends both the shared spine ([../webpage-craft.md](../webpage-craft.md)) and any active domain pack.

## Aesthetic in one sentence

Frosted glass over real depth — panels with `backdrop-filter: blur()` and light borders float above a **content layer that is actually there** (image, shader, animated SVG, gradient with real geometry). Never blur over lorem.

## Cut-list waivers (from the spine)

- **"Blur / glassmorphism as the design"** — waived. Glass surfaces are the point. But the below rules replace it.
- **"Backdrop-filter blur on top of the shader"** (`cinematic` domain rule) — waived when the glass panel is small (< 40% viewport width) and sits *beside* the shader focal point, not covering it.

## New non-negotiables

1. **Real depth behind the glass.** The background layer must be a real thing — image, running WebGL shader, animated SVG field, or a bold multi-stop gradient with visible geometry. Blur must reveal an interesting substrate. Blur over a solid color is banned.
2. **Two glass tiers.** At least two panels at different z-distances (different `backdrop-filter` blur radii — e.g. front card at 12px, deep card at 24px) so depth reads without playback.
3. **Light-source consistent border.** Every glass panel has a 1px inner border tinted toward the light source (top-left = brighter, bottom-right = darker). No same-alpha borders on all sides.
4. **Real box-shadow under each glass panel.** Blur ≥ 24px, colored (usually a shifted accent — a coral card gets a `rgba(255,111,92,.25)` shadow, not black).
5. **Reduced motion budget.** Glass is loud enough. Cap animated elements to two (persistent + narrative). Kinetic type is out.
6. **Contrast checked on the panel.** Text on glass must clear WCAG AA at body size against the *blurred substrate*, not against imagined solid color. If not, add a scrim inside the glass panel (a 10–20% dark or light overlay of the ink color).

## Palette contribution

Inherits the domain palette. Add one **light source** color (`--light`) used only for the top-left border tint on glass. Add one **shadow** color (`--depth`) used only for the bottom-right border tint and shadow. These two never appear in text.

## Motion contribution

- **Persistent (required):** the substrate is doing something (shader running, SVG field drifting, or gradient panning ≥ 12s per cycle).
- **Narrative (allowed):** cards can gently rise on scroll or on load (translateY(20px) → 0, opacity 0 → 1, 400ms cubic-bezier).
- **Banned:** the glass itself moves, tilts, or blurs on hover. Glass is a surface, not an object.

## 3D contribution

Depth via **stack**, not tilt. At least three explicit z-layers:

1. `background` (`z-index:0`) — substrate.
2. `deep-glass` (`z-index:10`, `backdrop-filter: blur(24px)`, higher shadow).
3. `front-glass` (`z-index:20`, `backdrop-filter: blur(10-14px)`, smaller shadow).

The z-stack must be readable in a still: the front card visibly casts a shadow onto the deep card.

## Cut list (in addition to the shared cut list)

- Glass on glass on glass (four+ tiers). It reads as fog.
- Glass panels with lorem inside.
- Frosted footer that just holds copyright. Waste of a strong surface.
- Same blur radius on every panel.
- Rainbow gradient behind glass. Substrate needs one strong idea, not eight.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-<domain>-glass/index.html` for a one-shot. In place when the user is redesigning an existing dark-themed page with obvious background media.

## Verify

- Screenshot at 1400 wide: two distinct blur radii are visible (front panel sharper than deep panel).
- Contrast on glass text passes WCAG AA against the darkest patch of the substrate under the panel.
- No `filter: blur()` on text elements themselves.

## Report addition

```
Modifier: glassmorphism
Substrate: <what is behind the glass — shader / image / animated SVG / geometry gradient>
Glass tiers: <name the two z-layers and their blur radii>
Shadow color: <hex or rgba>
```
