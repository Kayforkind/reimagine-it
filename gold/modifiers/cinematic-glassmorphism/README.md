# gold/modifiers/cinematic-glassmorphism

Proof that modifiers **compose** on top of a domain pack. Same source brief as `gold/domains/cinematic/`; the modifier layers two glass tiers over the WebGL2 shader hero.

- Domain: `cinematic` — inline WebGL2 shader hero (interference field), 3D card fan, one motion beat always running.
- Modifier: `glassmorphism` — two `backdrop-filter` tiers (front 14 px, deep 24 px), light-source-consistent borders (top-left bright, bottom-right dark), colored `box-shadow` under each panel, internal scrim on the front panel for AA contrast.

Open [`after.html`](after.html) in a browser. No CDN, no vendor folder — one `.html` you can double-click.

Screenshot re-shoot: `python gold/domains/motion-run.py` (the motion-strip harness ignores this folder by default; snapshot with `python -c "..."` or your editor's HTML preview).

Written to prove:

1. **Substrate is real.** Blur reveals a running WebGL2 field, not a solid color.
2. **Two glass tiers.** Deep panel further back, front panel closer, visibly different blur radii.
3. **Light-source-consistent borders.** Bright inset on top-left; dark inset on bottom-right.
4. **Colored box-shadow.** Front panel has a warm-shifted shadow (rgba(0,0,0,.75)); deep panel has a beam-tinted shadow (rgba(124,243,255,.28)).
5. **Reduced motion budget.** Only substrate + cursor pulse + one-time bar rise. Glass itself does not move on hover.
6. **3D still holds.** Cards below the hero keep the cinematic 3D fan; hover peaks translateZ(50px).

Report addition for this file:

```
Modifier: glassmorphism
Substrate: WebGL2 raymarched interference field
Glass tiers: front (14px blur) + deep (24px blur)
Shadow color: rgba(124,243,255,.28) (deep) + rgba(0,0,0,.75) (front)
```
