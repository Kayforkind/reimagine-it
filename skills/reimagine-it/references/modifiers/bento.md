# /reimagine-it webpage \<domain\> bento

Load only when the user token is `bento` (or `--style bento`). Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)) and any active domain pack.

## Aesthetic in one sentence

One page reads as a **bento box**: a named-cell grid with a 2x hero tile, tiles of unequal size but shared rhythm, one idea per tile, no scrolling section chain. The whole page fits (or nearly fits) one viewport at 1440x900.

## Cut-list waivers (from the spine)

- **"A dark-mode toggle as the biggest interaction on the page"** — waived if the hero tile *is* a live toggle showing side-by-side values. Then it's a demo, not a decoration.
- **"Three columns of Features with lorem"** — replaced. Bento is not three equal columns; tiles must be unequal.

## New non-negotiables

1. **CSS Grid with `grid-template-areas`.** Named cells, not `nth-child`. The grid must be nameable in prose (e.g. `"hero hero stat" "brand chart chart" "log log log"`).
2. **Six to nine tiles.** Fewer is a card grid; more is a dashboard. The hero tile spans 2x2 (or 2 wide + 2 tall).
3. **One idea per tile.** Each tile has a single title, a single mini-viz or single sentence, and a single meta line. No sub-tabs.
4. **Consistent tile chrome.** Same corner radius, same border, same padding scale across all tiles. Difference in *content*, not in the frame.
5. **Hero tile has the make-strange move.** The other tiles are quiet.
6. **Height budget.** Design at ~1440x900 desktop. Mobile stacks vertically with the hero at top; do not re-flow bento on mobile.

## Palette contribution

Inherits the domain palette. Add one **tile hover** color (`--tile-lift`) — a subtle tint used only for the 1px border on hover / focus. Palette ceiling stays at 5 (+1 for status).

## Motion contribution

- **Persistent (required):** one tile has a live element (chart sweep, live clock, ticker, animated stat bar rise).
- **Active (required):** every tile has a hover transition — `translateY(-2px)` + border color change + shadow lift. 200ms cubic-bezier.
- **Narrative (allowed):** initial page load staggers tiles in with `transition-delay` of 40ms per grid position.

## 3D contribution

Depth via elevation, not tilt. Base tiles flat with 1px border + very small (8-12px) shadow. Hero tile at higher elevation (`translateZ(20px)` if the grid parent has `perspective`, or a larger shadow with ≥ 24px blur if not). Reads in a still: the hero tile visibly sits above the others.

## Cut list (in addition to the shared cut list)

- Equal-sized tiles (that's a card grid, not bento).
- More than one make-strange move (spread across tiles — every tile trying to be the hero).
- Icon-only tiles (weak signal; every tile needs a title + a datum).
- A tile named "Get started" with no artifact behind it.
- Tiles that overflow to a second viewport for standard desktop widths.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-<domain>-bento/index.html` for a one-shot. In place when the user is redesigning an existing dashboard, "about" page, or profile.

## Verify

- Grid renders at 1440x900 without vertical scroll on desktop.
- Tile chrome (radius, border, padding) is identical across tiles (`getComputedStyle` on any two tiles).
- Hero tile visibly sits above others in a still.
- Every tile has a title, a viz or sentence, and a meta line.

## Report addition

```
Modifier: bento
Grid: <the grid-template-areas string>
Tiles: <count>
Hero tile: <name of the tile that carries the make-strange move>
```
