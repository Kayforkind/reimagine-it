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
| `artistic` | [artistic.md](artistic.md) | Cream paper, editorial italic serif, drifting SVG arcs, subtle CSS 3D tilt on cards |
| `dashboard` | [dashboard.md](dashboard.md) | Dark ops screen, KPI tiles, live SVG chart, status pills, monospace tables, terminal card |
| `photography` | [photography.md](photography.md) | Magazine folio, Didot-scale nameplate, SVG "photographs" per project, dropcap paragraphs |
| `ecommerce` | [ecommerce.md](ecommerce.md) | Product plates, price ladder, one clear CTA per plate, review quotes as pulled type, hero shot with product art |
| `landing` | [landing.md](landing.md) | Single-viewport magnet, one promise, one CTA, one proof strip, no navigation graveyard |
| `portfolio` | [portfolio.md](portfolio.md) | Alias of default webpage-craft with a slightly bigger hero and full-page project studies |

## The base still runs

Every pack **extends** the shared spine — it does not replace it. Grid + baseline + type ceiling + palette cap + one repeating motif + one make-strange move all still apply. A pack tells you which motif and which move to reach for; the spine still tells you the bar.

## SVG, animation, and 3D belong in every pack

Non-negotiable. Every domain pack must land at least:

1. **One inline SVG** doing real work (chart, plate, mini-viz, background motif) — never as a placeholder icon.
2. **One motion move** (CSS animation, keyframes, transition on a state) — pulse, drift, blink, tilt-on-hover, bars rising in.
3. **One 3D affordance** in CSS transforms *or* an inline Three.js scene via pinned import map for hero cases. `perspective` + `rotateY/rotateX` counts. Full Three.js is optional and only where the domain calls for it.

If a variant does not land all three, it did not earn the token.

## Live gold

- `gold/domains/artistic/after.html`
- `gold/domains/dashboard/after.html`
- `gold/domains/photography/after.html`
- `gold/domains/strip.png` (one-image proof that four tokens produce four aesthetics from the same brief)

Re-shoot: `python gold/domains/run.py`.
