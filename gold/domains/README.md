# /awe-me webpage &lt;domain&gt; — four aesthetics from one brief

Same three-project brief. Four completely different designs, driven by one extra word.

- [`artistic/after.html`](artistic/after.html) — cream + italic serif + drifting SVG arcs + CSS 3D card tilt
- [`dashboard/after.html`](dashboard/after.html) — dark ops screen, KPI tiles, live SVG chart with a rise animation, status pills, terminal card
- [`photography/after.html`](photography/after.html) — editorial folio, Didot masthead, SVG "photographs" per project, dropcaps
- The default (no token) lives at [`../webpage/after.html`](../webpage/after.html) — sober designed page

## Re-shoot

```powershell
python gold/domains/run.py
```

Writes an `after.png` for each variant and composites `strip.png` — the one image embedded in the main README.

Requires Google Chrome or Microsoft Edge on disk. Override with `AWE_BROWSER=<full path>` if the script cannot find one.

## Why this folder exists

`/awe-me` should not have one style. It should have a spine (grid, baseline, palette cap, motif, make-strange move) that every output obeys, and a set of packs that let the user say a second word to shape the aesthetic. The packs live in [`skills/awe-me/references/domains/`](../../skills/awe-me/references/domains/). This folder is the tested live gold that proves the packs land.
