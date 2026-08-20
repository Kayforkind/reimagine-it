# Domain packs (load only when a domain token is used)

Progressive disclosure. Load the pack that matches the user token; skip the rest.

## Syntax

```
/awe-me <form> <domain>
```

`<form>` is one of the form-router families (usually `webpage` here). `<domain>` is one of the tokens below. If the user gave no domain, use the shared spine ([../webpage-craft.md](../webpage-craft.md)) and skip this folder.

## Tokens (one word each)

| Token | Pack | Aesthetic in one line |
|-------|------|-----------------------|
| `artistic` | [artistic.md](artistic.md) | Cream paper, editorial italic serif, drifting SVG arcs, kinetic ampersand, real ±16&deg; 3D card fan |
| `dashboard` | [dashboard.md](dashboard.md) | Dark ops screen, KPI tiles, live SVG chart, status pills, monospace tables, terminal card |
| `photography` | [photography.md](photography.md) | Magazine folio, Didot-scale nameplate, SVG "photographs" per project, dropcap paragraphs |
| `cinematic` (`3d`, `webgl`) | [cinematic.md](cinematic.md) | Cinema screen: inline WebGL2 shader hero, 3D card depth with real drop-shadow, one motion beat always running |
| `ecommerce` | [ecommerce.md](ecommerce.md) | Product plates, price ladder, one clear CTA per plate, review quotes as pulled type, hero shot with product art |
| `landing` | [landing.md](landing.md) | Single-viewport magnet, one promise, one CTA, one proof strip, no navigation graveyard |
| `portfolio` | [portfolio.md](portfolio.md) | Alias of default webpage-craft with a slightly bigger hero and full-page project studies |

## The base still runs

Every pack **extends** the shared spine — it does not replace it. Grid + baseline + type ceiling + palette cap + one repeating motif + one make-strange move all still apply. A pack tells you which motif and which move to reach for; the spine still tells you the bar.

## SVG, animation, and 3D belong in every pack — and must read in a still

The shared spine (`../webpage-craft.md`) is the enforcement floor. Every domain pack must land:

1. **Hero-scale inline SVG** doing real work — ≥ 400px on the longest side, real values / real geometry, not a placeholder icon.
2. **Three moving elements at any moment** — persistent + state + narrative (see spine for the split).
3. **3D that reads in a still** — rotation ≥ 12&deg; **and** shadow blur ≥ 24px on at least one element, or `translateZ` ≥ 30px with a real box-shadow. `cinematic` upgrades this to inline WebGL2.

If a variant does not land all three so a stranger can prove it from one PNG, it did not earn the token.

## Live gold

- `gold/domains/artistic/after.html`
- `gold/domains/dashboard/after.html`
- `gold/domains/photography/after.html`
- `gold/domains/cinematic/after.html`
- `gold/domains/strip.png` — one-image proof that N tokens produce N aesthetics from the same brief
- `gold/domains/motion-strip.png` — three frames per variant (0ms / 500ms / 1000ms) proving motion is real, not a screenshot

Re-shoot: `python gold/domains/run.py` (still strip) &middot; `python gold/domains/motion-run.py` (motion strip).
