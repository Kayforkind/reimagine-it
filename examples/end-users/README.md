# End-user examples

These are small, realistic pages you can copy, replace with your own content, and redesign immediately. Each source stays readable before the redesign; each generated artifact is a standalone HTML file that can be opened locally.

![Three end-user journeys: observability desk, seasonal restaurant, reflective essay](gallery.gif)

## Start here

```bash
# From the repository root
npm run examples
```

The builder runs Design Auto with a pinned seed, creates a report, renders an alternate direction, and assembles a before → Auto → alternate GIF for each source. It uses the local CLI only; no API key, CDN, or network asset is required.

| Source | Good first command | Auto usually finds | Alternate worth comparing |
|---|---|---|---|
| [Orbitline Release Desk](orbitline/source.html) | `npm run auto -- -i examples/end-users/orbitline/source.html -o examples/end-users/orbitline/auto.html --report examples/end-users/orbitline/auto.json --seed 11` | dashboard | infographic |
| [Ember &amp; Table](ember-table/source.html) | `npm run auto -- -i examples/end-users/ember-table/source.html -o examples/end-users/ember-table/auto.html --report examples/end-users/ember-table/auto.json --seed 23` | a data-aware direction | photography |
| [A Letter to the Night Tide](tide-letter/source.html) | `npm run auto -- -i examples/end-users/tide-letter/source.html -o examples/end-users/tide-letter/auto.html --report examples/end-users/tide-letter/auto.json --seed 37` | cinematic | artistic |

Open each `auto.html` or `alternate.html` directly in a browser. The generated pages keep the source title, anchors, dates, numbers, and contact links; the `auto.json` file explains the selected direction and the candidates it rejected.

## What the GIFs show

Each GIF is a compact client handoff, not a fake animation:

1. **Source** — the page before any design decision.
2. **Auto** — the strongest verified direction chosen from the source signals.
3. **Alternate** — a deliberate second medium, so a client can compare composition rather than argue about a color swatch.

- [Orbitline GIF](orbitline/before-after.gif) — operational content → selected console → infographic alternative
- [Ember &amp; Table GIF](ember-table/before-after.gif) — warm menu → selected direction → folio alternative
- [Night Tide GIF](tide-letter/before-after.gif) — essay → selected narrative field → expressive alternative
- [Combined gallery GIF](gallery.gif) — all three end-user journeys in one short loop

The images are regenerated, not hand-edited. If you change a source, rerun `npm run examples` and inspect the reports before showing the result to a client.

## Use your own page

```bash
npm run auto -- \
  -i path/to/page.html \
  -o reimagined/auto.html \
  --report reimagined/auto.json \
  --seed 42
```

To ask for a specific comparison, use the same source with a token:

```bash
npx reimagine-it -i path/to/page.html -t photography -o reimagined/folio.html
```

Auto never overwrites the source. Approve a direction, then keep the report and seed with the artifact so another person can reproduce the same review.
