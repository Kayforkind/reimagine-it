# Form gold — same HTML, three other mediums

Source: [`../webpage/before.html`](../webpage/before.html) (the naive Texas notebook).

| Token | Artifact | What it proves |
|-------|----------|----------------|
| `/reimagine-it svg` | [`svg/after.svg`](svg/after.svg) | Living weenie: the actual Lone Star flag (white star, white over red), schematic Texas, Priestley 1836–1995, eight acre units. Star breathe, river flow, pin ping, hover pairing. |
| `/reimagine-it 3js` | [`3js/after.html`](3js/after.html) | Living room of the three places. Star turn, Rio Grande motes, chapel glow, wide-drift. Offline Three.js r185 in `3js/vendor/`. No CDN. |
| `/reimagine-it simulation` | [`simulation/after.html`](simulation/after.html) | Playable clock. Default paused on 1836. Day-scale siege. SVG geography. Type in the gutter. |

Live look: [`see.html`](see.html) — SVG + 3js side by side, four loop close-ups, **Alive / Still** toggle. Serve this folder:

```powershell
python -m http.server 8788 --bind 127.0.0.1
```

Then [http://127.0.0.1:8788/see.html](http://127.0.0.1:8788/see.html). Hover the pins.

Re-shoot (writes form stills + `after-b.png` pairs, `loops/*.png`, `strip.png`, `motion-strip.png`, `loops-strip.png`, `see.png`):

```powershell
python gold/forms/shot.py
```

Legacy Texas montage GIF (`examples.gif` — before, then every full-page after; no cropped loop cards). For fresh end-user journeys, see [`examples/end-users/`](../../examples/end-users/) and its five source-specific GIFs:

```powershell
python gold/forms/make_gif.py
```

```text
examples/end-users/gallery.gif
examples/end-users/venator/before-after.gif
examples/end-users/crimson-circuit/before-after.gif
examples/end-users/velocita/before-after.gif
examples/end-users/maracuya/before-after.gif
examples/end-users/flick/before-after.gif
```
