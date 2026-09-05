# v2.6.0 announcement — paste-ready

Short form for the GitHub release notes; long form for X/Reddit/HN follow-ups.
Do not post until `npm view reimagine-it version` returns 2.6.0.

---

## GitHub release (v2.6.0)

**reimagine-it v2.6.0 — nine journeys, and the fidelity floor finally holds everywhere**

Nine committed example journeys now ship with the CLI — and every single one reports **100% source fidelity** in its `auto.json`.

**New journeys (closes the good-first-issue set)**

- **Hearth & Grain, a neighborhood bakery** — a 16-loaf bake gallery that Auto sends to the `photography` folio at seed 1 (score 226). A collection page becomes visual studies, not a data poster.
- **Millbrook, a city budget report** — compare/timeline/survey language that Auto sends to the `infographic` at seed 1 (score 278), with the budget's own timeline as the first fold (`data-structure="sequence"`). Never a default bar chart.

**Engine fix — nothing gets silently dropped**

The `landing`, `dashboard`, `artistic`, `svg`, and `3js` generators capped rendered facts at 4–10, so fact-rich sources lost numbers and dates and the ≥80% fidelity floor failed (worst cell: 67%). Every token now renders every measurable fact; all 135 token × source cells hold the floor. Three previously shipped examples (Maracuyá, Velocita, Horizon) rose from 85–95% to 100%.

**Proof pipeline**

- `gallery.webp` no longer truncates: a hardcoded 2-row height used to drop 36 of 42 cards. The grid now adapts and hard-fails if any card does not fit.
- The Open Graph card scales to the journey count instead of overflowing.
- **New: a 39-second silent playground walkthrough** (`docs/playground-walkthrough.mp4`, 1.1 MB): paste HTML → Auto draws three directions → pick one → download. Regenerator included at `scripts/record-playground.cjs`.
- **New: a ninth-source proof** (`examples/community/riverside-clinic/`) — Auto on a clinic bulletin, a job none of the journeys cover, with its committed 1400×1100 still and collision analysis.

**Housekeeping** — version sweep: `2.4.4` survives only as CHANGELOG history; every manifest, badge, and citation reads 2.6.0.

```bash
npx reimagine-it --auto -i page.html -o redesign.html
```

---

## Social (X/Bluesky, ~280 chars)

v2.6.0 of reimagine-it ships 9 example journeys — juice bar, skate deck, streetwear, bakery, city budget, and more — each with a 100% source-fidelity report. Fixed: generators silently dropped facts on data-heavy pages. `npx reimagine-it --auto -i page.html`

---

## Reddit (r/ClaudeCode et al., body under the existing title)

We just cut v2.6.0. Three things worth your time:

1. **Two new proof journeys.** A bakery bake-gallery Auto redesigns as a photography folio (a collection page — not another poster), and a city budget becomes an infographic whose first fold is the budget's own timeline. Both at seed 1, both with committed `auto.json` reports you can audit.
2. **An honesty fix.** Some generator layouts only showed the first 4 facts of your source and quietly dropped the rest. The repo's own fidelity floor test caught it — worst case was 67% of source numbers surviving. Every layout now renders every fact; all nine examples report 100%.
3. **A 39-second silent video** of the whole playground loop: paste HTML, Auto draws three directions, pick one, download the standalone file. No install, no signup: https://kayforkind.github.io/reimagine-it/#playground

Everything runs offline from a single HTML file. Audit any result yourself: `npx reimagine-it audit redesign.html`.

Repo: https://github.com/Kayforkind/reimagine-it
