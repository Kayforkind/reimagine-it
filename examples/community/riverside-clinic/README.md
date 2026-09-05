# Riverside Community Clinic — a ninth source, not one of the journeys

**Author:** @Kayforkind · **Kind:** proof case (issue #10) — a civic service page
outside all seven journeys.

This bundle is the Issue #10 proof: Auto run on a real-world job that is **not**
one of the seven launch journeys (gaming, festival, skate, juice, streetwear,
building, observability) and not one of the v2.6.0 additions (bakery, city
budget). A walk-in clinic bulletin is civic *service* prose — hours, clinic
dates, fees — the kind of page a real person pastes into the playground.

## The draw

```bash
node scripts/auto.js \
  --input examples/community/riverside-clinic/source.html \
  --output examples/community/riverside-clinic/auto.html \
  --report examples/community/riverside-clinic/auto.json \
  --seed 1
```

| | |
|---|---|
| **Auto token** | `infographic` (score 352, fidelity 100%) |
| **Candidates** | `infographic` 352 · `simulation` 220 · `editorial` 208 |
| **Structure** | `sequence` — the first fold is the source's own clinic-date timeline |
| **Still** | `auto-desktop.png` — 1400×1100, regenerable from this fixture (never hand-drawn) |

## Collision check

The clinic drew `infographic` — the same silhouette as Millbrook's city budget.
That is **not** a journey collision: the seven-journey uniqueness guarantee
(`test/unit/cli.test.js`, "auto picks a distinct token for each committed
end-user source") holds for the seven launch sources, and the budget example is
a deliberate demonstration of the compare/timeline lane. What the clinic *does*
prove is lane discipline inside the silhouette — its first fold is a **timeline
of dated flu clinics**, not a bar chart of fees. The palette (teal, sand, rust,
ink) comes from the hex colors and pushpin nouns written in the source.

## Regenerating the still

The screenshot is produced by the same headless-Chrome pipeline as every other
proof image in this repo:

```bash
"/path/to/chrome" --headless --hide-scrollbars --no-sandbox \
  --window-size=1400,1100 --virtual-time-budget=4000 \
  --screenshot=examples/community/riverside-clinic/auto-desktop.png \
  "file://$(pwd)/examples/community/riverside-clinic/auto.html"
```

Change the source, re-run the two commands, and the still stays honest.
