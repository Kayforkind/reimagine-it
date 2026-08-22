# Review (every `/reimagine-it` run)

Load during **§5 Verify**. Gold self-check: `python scripts/review_gold.py` from the repo root.

This is not a mood pass. It is a falsifiable gate. Fail → patch or report `partial`. Do not report `shipped` with a named object wrong.

## 5.d Named-object accuracy

If the source names a **specific public object** (a flag, a seal, a logo, a known product silhouette), the weenie is **that object**, not a palette remix of it.

| Source says | Fail | Pass |
|-------------|------|------|
| Lone Star flag | Gold/cream star, cream fly that vanishes on parchment, navy-as-white | Blue hoist, **white** star, **white** over red (official cloth). Accent gold stays on ticks, pins, river — off the flag. |
| A shop cone / freezer | Texas flag geometry with scoops glued on | The parlor object (cone, counter, case) |
| A named beast / tool / press | Clipart stand-in in gold's navy-cream-red | The silhouette *this* file is about |

**Why this exists:** palette-derived "sun gold" on a white star turns the Lone Star flag into a logo. Clients who know the flag will say *this is not the Texas flag*.

## Clone scan (second source)

If this run's source is **not** the Texas notebook, fail the render if a client could mistake it for gold:

- Palette: parchment `#f4ecd8` / navy `#1a2138` / star-red / sun-gold as the whole page
- Scenery: Alamo, 1836–1995 map-clock, Lone Star cloth, `The years run`, `All three`
- Layout chrome: numbered `00 · MASTHEAD` rail, weenie-left / map-center / gutter-right / timeline-bottom

Jules gold (`gold/jules/`) is the proof file for this scan.

## Visual pass (do these, in order)

1. Render ≥ 1400 px wide. **Read the PNG.**
2. Named weenie matches the source object (table above).
3. No blank / placeholder / clipped type.
4. Every plate maps to an anchor from step 0.85.
5. Motion: two frames ~600 ms apart differ unless brief `still`.
6. Webpage craft floor (§5.c) if the hero is HTML.

## Gold fixtures

Texas form gold: [`gold/forms/svg/after.svg`](../../../gold/forms/svg/after.svg) weenie id `weenie-flag` — white star on `#002868`, white over `#BF0A30`.

Close-up that used to lie: [`gold/forms/see.html`](../../../gold/forms/see.html) `#loop-breathe`. GitHub.com shows that HTML as source; the live page is GitHub Pages. The README strip is `gold/forms/loops-strip.png`.
