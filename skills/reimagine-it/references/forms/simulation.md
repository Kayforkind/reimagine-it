# /reimagine-it simulation

Load when the user forces `simulation`, or the router picks a playable model. Gold: [`gold/forms/simulation/after.html`](../../../../gold/forms/simulation/after.html) — **one draw of one Texas notebook**, not a skin.

This is a **playable model of facts already in this source**, not a dashboard and not a labeled map. Time (or the source's own sequence) actually passes. Each dated or ordered thing gets a **field verb** (a mark that changes) and a **gutter name** (type off the field).

## This source, this run — not a template

Fail the run if a client could mistake the file for the Texas gold when the source is not that notebook.

| Layer | From this source | Never from |
|-------|------------------|------------|
| **Clock** | The source's own sequence: years, days, versions, handshake steps, roast profiles, packet rounds — whatever it times with | Always 1836–1995 |
| **Field** | The object *this* source times on: a board, a freezer case, a press, a handshake — a map **only** if the file is geography | Texas outline, Rio Grande cubic, Alamo/Austin/Big Bend pins, a rounded rectangle with a sine-wave “river” |
| **Palette** | Named colors, materials, flags, habitats in the text | Navy / cream / star-red / gold unless *this* source names those |
| **Marks** | One verb per fact in *this* file | Siege-day counter, eight acre units, Lone Star, bluebonnet, longhorn |
| **Motion** | Play advances *this* clock; short nested intervals stay inspectable | Autoplay of the gold century |

A second run on the **same** source is still a new draw (register, ground, mark language) unless `--seed` / `--variant` pinned it. Same facts, different room.

## Open brief (leftover words)

Unknown words after known tokens are a **creative lens**. Follow them. Reweight ground, motif, pace, type. Do not invent facts the leftover words name unless those facts are already in the source. A modifier token still loads its pack.

```
/reimagine-it simulation
/reimagine-it simulation <any words the user typed>
```

## Why this form exists

| They want | Form |
|-----------|------|
| A statistical poster (still argument) | `infographic` |
| A living mark | `svg` |
| An orbitable room | `3js` |
| Time, flow, a handshake that *runs* | **`simulation`** |

## Clock law (fail if broken)

1. **The domain is this source's sequence.** Min = earliest dated or ordered fact. Max = latest. No invented years, no fake live KPIs, no statistics the file does not contain.
2. **First encounter is the first fact.** Default **paused** on the earliest step. Autoplay that races to the end is a fail — the magnet never happens.
3. **A short interval is inspectable.** If the source nests a short span inside a long one (nineteen days inside a century, a handshake inside a session), run the short span at *its* scale while the long unit holds. Do not spend a blink on it and then show "done" on the last year.
4. **Event-step.** Prev / next snaps to dated or ordered facts. Scrub is the long axis. Play continues from here.
5. **At the end, settle.** Pause on the last fact. Reset returns to the first. Loop only if the brief asks.
6. **`prefers-reduced-motion: reduce`** (or leftover `still`) jumps to the last fact, paused, with every encoding in its final state. The model stays true.

## Layout law (fail if broken)

1. **Type lives in the gutter.** Title, clock readout, event list, nested-span caption — all in a reserved strip. The canvas carries **marks only**.
2. **No label on a mark.** No `fillText` of a place name or a slogan on the field.
3. **Field object from this source.** A shop is a flavor board or a freezer case. A state is a map. If this run already has an SVG schematic for *this* file's object, use it. Do not invent a rounded rectangle and a sine-wave river. Do not reuse another source's map. Do not title the clock `The years run` because gold did.
4. **Pin colors match this source's legend** when one exists.
5. **Chrome off the art.** No `/reimagine-it simulation · from path/to/file` in the header. Source goes in `<title>`.

## Field verbs (each event must have one)

A list row that only turns white is not a model. Pick a mark per dated or ordered fact:

| Kind of fact | Verb on the field |
|--------------|-------------------|
| A place | Pin lights (and stays lit) |
| A weenie / flag / tool | The weenie appears |
| A season / phase the source names | Marks only in that phase |
| A magnitude | N equal units appear (ISOTYPE), unlabeled |
| A beast / object | One silhouette appears |
| A handshake / protocol | The step that is *now* lights; prior steps stay lit |

Hover / click pairing: gutter row ↔ mark. Click a pin or row to jump the clock.

## Play

- Play / pause, reset to first fact, prev event, next event, scrub
- Space toggles play. Arrow keys step events
- While playing inside a nested short span, advance **that** unit, then resume the long unit
- Rate must let a viewer see a mark arrive. After the nested hold, ~8–12 long-units/s is a ceiling, not a floor
- `window.reimagineSim = { setYear, pause }` (or the source's unit) for screenshots. `document.documentElement.dataset.ready = "1"` after the first frame

## Must not

- Invented KPIs, live counters, or battle stats
- Labels on the field
- Autoplay to the last fact as the first frame
- **Clone the Texas gold** (1836–1995 year clock, Alamo siege counter, eight acre units, Lone Star / bluebonnet / longhorn, navy-cream-red-gold, title `The years run`, pins on a schematic map) onto a source that is not that notebook
- CDN, webfonts, or a dashboard skin

## Gold (example only)

The Texas notebook has years, a 19-day siege inside 1836, a river, and 800,000 acres. That gold therefore: paused on 1836, day-scale siege, SVG Texas outline, pin colors gold / navy / star-red, star after 1839, spring bloom after 1901, eight units after 1944, longhorn after 1995. **Copy the method, not the scenery.**

## Proof

File opens. Default still is the first fact in *this* source. Scrub to a late fact: later marks on, earlier marks still on. Two frames during Play differ. Report `partial` if a name sits on the field, if a nested span is uninspectable, or if the file is the Texas gold wearing a new title.
