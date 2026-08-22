# /reimagine-it webpage photography

Load only when the user token is `photography`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

## Aesthetic in one sentence

A folio of **photographs of this source**: still-lifes with light, material, and depth of field, composed in SVG, held by a quiet print grid. Not a cream magazine template with abstract frames labeled PLATE I.

Gold `gold/domains/photography/after.html` is **one** Texas-notebook folio (VOL. 26, Didot, rust dropcaps, tan mountain "photos"). Live runs derive light, materials, and what is *in front of the lens* from **this** source. Fail if a client could mistake the PNG for that gold with the title swapped.

## Palette (five, from this source's light)

Print paper may be cream **or** a darkroom void — pick from the file's time of day. Inks and plate light come from named materials (marble, brass, ice-blue glass, waffle gold, strawberry). Do not default to rust `#a54d34` + brass `#b58a3a` unless those hues are in the source.

## Type

- Nameplate: high-contrast serif, italic first line at 96–220px, then a heavy caps line for the source's second word (`ICE CREAM`, `NOTES`) at ~50% of the display size.
- Section titles: italic serif, 56–96px.
- Body: warm serif, 17px, line-height 1.6.
- Meta: monospace, 10–11px, tracking `0.24em`, uppercase.
- Dropcap: 3em, in a hue from **this** source (strawberry, star-red, brass — not gold's rust by default).

## Motif and layout

- Top rail uses **facts from this file** (founded year, place, one noun). Do **not** invent `VOL. 26 · ISSUE 34 · WEEK OF AUG 19` or gold's `JORDAN-RIVERS.DEV`.
- Masthead: 3fr / 2fr. Left is the nameplate. Right is a kicker + lead from the source.
- Strip below names the real plates (`HARBOR STREET`, `COLD ROOM`, …) not `PLATE I QUIET WEEK`.
- Each plate frame is a **4:5 still-life that reads as a photograph**: directional light, vignette or falloff, materials you can name (marble vein, metal highlight, glass glow, waffle grid). Soft gradients and occlusion — not a flat icon on a tan rectangle.
- Three plates, three different lighting setups (day parlor / night freezer / walk-up sun, or whatever the source times).
- Caption: title + dropcap paragraph from the source + a materials row **only** if those words are in the file (marble / brass / ice-blue).
- Colophon: address-or-email, Now, elsewhere — from the source. No fake pull-quotes.

## Non-negotiables specific to photography

- **Nameplate italic then caps.**
- **Every plate looks like a photograph of this source.** A client says "that's the counter" / "that's the freezer" — not "that's an abstract sun over mountains."
- **Dropcap on every plate paragraph.**
- **A strip of real names**, not a hover-underline nav.
- **A colophon** from the source.
- **No stock library. No paid image API.**
- **No gold clone.** No invented volume/issue. No Texas mountain/sun plate geometry on a shop.

## Cut list (in addition to the shared cut list)

- A hero button that says `Get in touch`. Contact is a mailto in the colophon.
- Card grids that look like Bootstrap defaults.
- Alignment center for body copy.
- Fake pull-quotes attributed to fake sources.
- A dark mode toggle.
- `VOL.` / `ISSUE` / `WEEK OF` chrome that is not in the source.
- Matching `gold/domains/photography/after.png` layout and swapping nouns.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-folio/index.html` when the leap is a folio site. In place if the user already has a personal page and wants a folio treatment.

## Verify

- Each SVG plate has a light direction and a named material from the source.
- Nameplate is italic then caps.
- Dropcap shows in a source hue.
- Fail if the PNG is the Texas folio with ice-cream labels.

## Report addition

```
DNA: <paper + light + three still-life nouns>
Motif: still-life plates + dropcap + strip of real names
Make-strange: the source photographed, not illustrated as clip-art
Tone: print folio, light from this room
```
