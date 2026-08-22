# /reimagine-it webpage artistic

Load only when the user token is `artistic`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

## Aesthetic in one sentence

A painting of **this** source: italic serif at magazine scale, a five-color palette taken from the file's materials, ambient SVG that is this object's geometry (not gold's ellipses), and a 3D fan of plates that are pictures of *these* nouns.

Gold `gold/domains/artistic/after.html` is **one** Texas/personal-site draw (cream, aubergine, coral, sine waves, quiet-week / lantern / rift plates). Live runs derive palette, ambient marks, and plates from **this** source. Fail if a client could mistake the PNG for that gold with the title swapped.

## Palette (five, from this source)

Do not ship the pack example as a default. Derive:

- `--paper` — the source's ground (cream parlor, night ink, press stock…)
- `--ink` — the source's darkest material
- `--accent` — the weenie color (a scoop, a flag red, a brass)
- `--second` — a named material (waffle gold, pistachio, ice-blue)
- `--lift` — a second named hue for the kinetic mark

Example (not a skin): Texas gold used cream / aubergine / coral / ochre / violet because that notebook was parchment and a star-red. A parlor uses cream / chocolate / strawberry / waffle-gold / pistachio.

## Type

- Display: italic serif, 88px–180px, tight tracking `-0.03em`, line-height `0.9`. Family may be Iowan / Palatino / Georgia — the **words** and **colors** are from this source.
- Section: same serif italic, 36px.
- Body: sans, 15–18px.
- Meta: monospace, 11px, tracking `0.24em`, uppercase.
- Kinetic stress: an ampersand **or** one weenie word (Ice, Star, Press) in the accent, italic, slow sway.
- Block-caps second line is the source's category word (`ICE CREAM`, `NOTES`) — not a leftover `RIVERS` / `REPUBLIC` from gold.

## Motif and layout

- Ambient background: three drifting groups whose **paths are this source** (waffle grid, drips, scoop clusters, press rollers, flag rays). Not concentric ellipses + a triple sine wave because gold did.
- One running mark from this source (a scoop, a punch, a star) bobbing on ~4s ease-in-out.
- One "stage" that holds three SVG **paintings** of the three named places / objects here. Each plate is a real composition of *this* file's nouns. Do not reuse gold's `quiet-week` / `lantern` / `rift` geometry.
- Cards or captions may carry year badges that overlap the plate edge.

## Non-negotiables specific to artistic

- **Serif display type must be italic in the masthead.**
- **One kinetic stress mark** (ampersand or weenie word) sways a few degrees.
- **Hero-scale animated SVG in the ambient layer** — this source's geometry tracing or rotating. Not a decorative pixel.
- **A real mid-page beat that animates** — a drip, a sweep, a pulse on a source noun.
- **Real 3D on the plate fan.** Perspective ≥ 1400px, outer plates `rotateY(±14deg)`, middle `translateZ(+30px)`, shadow blur ≥ 40px. A static PNG must read as depth.
- **No emoji.** No stock photography. No paid image API.
- **No gold clone.** Palette, ambient paths, and plate pictures would be wrong on a different source.

## Cut list (in addition to the shared cut list)

- Gradient washing across the whole page.
- Blur / glassmorphism on the ambient layer.
- More than one CTA. There is one contact pill.
- Shipping cream + coral + violet + sine-wave ambient because `gold/domains/artistic` did.
- Comparing the screenshot to that gold and matching its layout.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-artistic/index.html` when the leap is a one-shot seeing-tool. In place if the user already has a personal page and asked for a redesign.

## Verify

- Ambient marks are nouns from **this** source (not gold's ellipses).
- Cards visibly tilt at 1400 wide.
- Three plates are three different pictures of *this* file, not the same shape three times.
- Fail if the PNG is `gold/domains/artistic/after.png` with a new title.

## Report addition

```
DNA: <five colors from this source + ambient geometry nouns>
Motif: <this source's drifting mark> + plate fan
Make-strange: three named things as paintings, not thumbnails
Tone: magazine-scale italic, this object's art
```
