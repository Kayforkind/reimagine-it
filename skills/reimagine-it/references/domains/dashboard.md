# /reimagine-it webpage dashboard

Load only when the user token is `dashboard`. Extends the shared spine ([../webpage-craft.md](../webpage-craft.md)).

## Aesthetic in one sentence

An operator dashboard: dark background with a faint grid, monospace-forward, a topbar with a live status dot, a row of KPI tiles, a live inline SVG chart with a subtle rise animation, a status table with pill badges, and a terminal card with a blinking cursor.

## Palette (five, do not exceed)

- `--bg` #06080b (very dark)
- `--panel` #10151d
- `--stroke` #232d3d
- `--ink` #dbe4f0
- `--dim` #6a7688
- `--accent` #7ee0c0 (primary status color, chart line, live dot)
- Status secondaries (use sparingly): `--warm` #f0b060, `--violet` #a48dff, `--hot` #e07c6a — one per status kind, not decoration.

## Type

- Sans for the hero (`ui-sans-serif`), 28–40px, tracking `-0.01em`.
- Monospace everywhere else (`ui-monospace`), 10–14px, tracking `0.16em`–`0.24em`, uppercase labels.
- KPI values: monospace 28px, weight 700.

## Motif and layout

- Faint 32px grid on the body background using two linear-gradients — read as an ops screen.
- Topbar row: brand (`domain/status`) with a live green dot (CSS animated box-shadow pulse), search hint with `ctrl-K`, environment (`ENV PROD · V0.14.3`), initials avatar.
- Hero: left is a short editorial one-liner + kicker; right is a `repeat(4, 1fr)` grid of KPI tiles. Each tile has a colored progress bar at the bottom mapped to its own accent.
- Main card: legend row + inline SVG chart with:
  - Horizontal grid lines and axis labels in monospace
  - A group of `<rect>` bars with a `@keyframes` `scaleY` from 0 to 1, staggered by 100ms
  - An area path with a linearGradient fade to the bottom
  - Endpoint dots
- Below the chart, a monospace row table with three rows (one per project) and a right-aligned status column.
- Right column: "Now, this week" card with pill status badges (SHIP / WIP / READ / MAKE), then a terminal card with `$ whoami`, `> jordan rivers…`, `$ echo "hi" | mail …` and a blinking caret.

## Non-negotiables specific to dashboard

- **Faint grid background is required.** No solid panels floating without a grid — this is the operator tell.
- **At least one CSS animation** (`livepulse` on the topbar dot **or** the `rise` on the bars — both preferred).
- **Real numbers only.** Every KPI must map to something in the content you were given (projects count, lines shipped, reading page, chapter progress). Do not fabricate MRR or ARR unless the source has revenue.
- **One monospace table.** Not multiple. One row per row of data.
- **Terminal card at the bottom of the right column.** Includes at least one `$` prompt and a blinking caret.

## Cut list (in addition to the shared cut list)

- Colorful pie charts. Pie charts are decoration; use bars, area, or a scatter.
- Dashboards without a chart. If there is no chart, this is not a dashboard.
- Card shadows on a dark background. Use a 1px `--stroke` border instead.
- Sparkline farms. One or two charts, not eight.
- Notifications badges on empty icons.
- `Trusted by` logo strips.

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-dashboard/index.html` for a one-shot. In place if there is already a `/status` page or an existing dashboard the user is redesigning.

## Verify

- Grid pattern is visible in a headless screenshot (compare against `gold/domains/dashboard/after.png`).
- Bars animate — capture at t < 1.2s and t > 1.2s to see the rise.
- Live status dot pulses (screenshot at a different frame shows the outer glow at a larger radius).
- Table has real data, not lorem.

## Report addition

```
Motif: 32px operator grid + one live status dot + one animated area chart
Make-strange: a personal page rendered as a service /status screen
Tone: monospace, dense, calm, provable
```
