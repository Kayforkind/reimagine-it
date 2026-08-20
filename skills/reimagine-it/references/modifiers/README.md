# Modifier packs (load only when a modifier token is used)

Modifiers layer **on top of** a domain pack (or the default webpage spine). They do not replace the grid + baseline + palette cap + one motif — they change *how* those show up.

## Syntax

```
/reimagine-it webpage <domain> <modifier>
/reimagine-it webpage <domain> --style <modifier>
/reimagine-it webpage --style glassmorphism
```

Third word (after `<form>` and `<domain>`) is treated as a modifier. `--style <name>` is an explicit equivalent when the third word is ambiguous.

## Tokens

| Token | Pack | Aesthetic in one line |
|-------|------|-----------------------|
| `glassmorphism` | [glassmorphism.md](glassmorphism.md) | Frosted glass over real depth; layered panels with backdrop-filter and light borders. Waives the spine's blur ban. |
| `bento` | [bento.md](bento.md) | Bento-box tile grid; one canvas, named cells, hero tile 2x wider, one tile per idea. |
| `neon` | [neon.md](neon.md) | Dark ground, one high-chroma accent, animated glow pulse, kinetic type. |
| `brutalism` | [brutalism.md](brutalism.md) *(spec-only for v2 — pattern documented, gold not yet shipped)* | Raw system fonts, exposed grid lines, hard corners, high contrast, block color. |
| `neumorphism` | [neumorphism.md](neumorphism.md) *(spec-only for v2)* | Soft-pressed cards with inner + outer shadow duality; single-hue field. |
| `handdrawn` | [handdrawn.md](handdrawn.md) *(spec-only for v2)* | SVG paths with wobble, hand-lettered display, sketchy borders. |

## Modifier composition

Modifiers are **additive**: `/reimagine-it webpage artistic glassmorphism --font "Playfair Display, serif"` runs the artistic pack, then the glassmorphism pack, then applies the font override. Modifiers that contradict each other are refused with an error line in the report (e.g. `minimal` + `maximalist`, `bento` + `landing` since landing forces one-viewport).

Every modifier pack must document:

1. **Cut-list waivers** — which entries in the spine's cut-list this modifier overrides (and why).
2. **New non-negotiables** — what this modifier *must* land to earn the token.
3. **Palette contribution** — either "inherits the domain palette" or "constrains to N colors including these hex."
4. **Motion contribution** — persistent / active / narrative beats the modifier adds or replaces.
5. **3D contribution** — how the modifier reads in a still (depth cue).

## Base still runs

Every modifier extends the shared spine ([../webpage-craft.md](../webpage-craft.md)). Grid + baseline + palette cap + one repeating motif + one make-strange move all still apply. A modifier tells you *how* the motif shows up (glass panel? tile? glow?); the spine still tells you the bar.
