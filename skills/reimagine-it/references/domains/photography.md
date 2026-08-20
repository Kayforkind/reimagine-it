# /reimagine-it webpage photography

Load only when the user token is `photography`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

## Aesthetic in one sentence

A quiet magazine folio: cream paper, black hairline rules, a Didot-scale italic-then-caps nameplate, four numbered plates (three works + a colophon), each plate is an SVG "photograph" you actually composed, dropcap paragraphs, and a print-run colophon at the foot.

## Palette (five, do not exceed)

- `--paper` #f4efe6
- `--paper-2` #ebe4d5
- `--ink` #14140f (near-black, warm)
- `--dim` #6b6a5c
- `--gold` #b58a3a (plate numbers, byline stress)
- `--rust` #a54d34 (dropcap letter, punctuation lift)

## Type

- Nameplate: Didot-style serif (`"Didot", "Bodoni Moda", "Palatino", "Georgia", serif`), italic first line at 96–220px, then a heavy sans/serif caps line for the last name at ~50% of the display size.
- Section titles: same Didot serif italic, 56–96px.
- Body: warm serif (`"Iowan Old Style", Palatino, Georgia, serif`), 17px, line-height 1.6.
- Meta strip labels: monospace, 10–11px, tracking `0.24em`, uppercase.
- Byline: monospace, 10px, italic voice ("Words & pictures by …").

## Motif and layout

- Top rail: `VOL. 26 · ISSUE 34 · WEEK OF AUG 19` on the left, `< FOLIO · JORDAN-RIVERS.DEV >` on the right.
- Masthead: 3fr / 2fr grid. Left is the giant italic nameplate. Right is a stamp kicker + lead + byline.
- Numbered strip: four-column strip below the masthead — `PLATE I QUIET WEEK`, `PLATE II LANTERN`, `PLATE III RIFT`, `COLOPHON SAY HELLO`.
- Three plates alternate frame-caption / caption-frame using an `.rev` modifier.
- Each plate frame is an SVG `4:5` composition — a real image, not a placeholder. See the artistic pack for guidance on plate composition rules.
- Each caption starts with an all-caps monospace `PLATE I · 2022` number, then a giant italic serif title, then a dropcap paragraph, then a `Medium / Weight / State` meta row.
- Interlude: centered pull-quote in italic serif with a monospace signature `— Colophon`.
- Colophon: three-column footer with Address, This week, Elsewhere.

## Non-negotiables specific to photography

- **Nameplate must be italic serif in the first line and caps in the second.** This is the folio tell.
- **Every plate is a real SVG composition.** No solid rectangle placeholders. Landscape, radial glow, grid + orb — three different compositions.
- **Dropcap on every plate paragraph** (`::first-letter` at 3em, rust color).
- **A numbered strip.** No horizontal nav bar with hover underlines.
- **A colophon at the foot** naming Address, This week, Elsewhere.
- **No photography from a stock library.** No paid image API. The point is that the page composes its own images.

## Cut list (in addition to the shared cut list)

- A hero button that says `Get in touch`. Contact is a mailto in the colophon.
- Card grids that look like Bootstrap defaults.
- Alignment center for body copy.
- Fake pull-quotes attributed to fake sources.
- A dark mode toggle.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-folio/index.html` when the leap is a folio site or a print-styled index page. In place if the user already has a personal page and wants a folio treatment.

## Verify

- SVG plates render as actual compositions (compare against `gold/domains/photography/after.png`).
- Nameplate is italic then caps.
- Dropcap letter shows in the rust color.
- The numbered strip is one row with four cells and a right border between them, no hover states.

## Report addition

```
Motif: numbered plate strip + SVG "photograph" per plate + dropcap paragraphs
Make-strange: three code projects composed as three plates in a magazine folio
Tone: paper-first, editorial, hairline black on cream
```
