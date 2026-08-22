# Form gold — same HTML, three other mediums

Source: [`../webpage/before.html`](../webpage/before.html) (the naive Texas notebook).

| Token | Artifact | What it proves |
|-------|----------|----------------|
| `/reimagine-it svg` | [`svg/after.svg`](svg/after.svg) | The notebook as one vector weenie: Lone Star, schematic Texas, Priestley 1836–1995, eight equal acre units. |
| `/reimagine-it 3js` | [`3js/after.html`](3js/after.html) | The three places as meshes. Offline Three.js r185 in `3js/vendor/`. No CDN. |
| `/reimagine-it simulation` | [`simulation/after.html`](simulation/after.html) | A playable year clock. Events light from facts in the file. Rio Grande flows. |

Re-shoot (writes `svg/after.png`, `3js/after.png`, `simulation/after.png`, `strip.png`):

```powershell
python gold/forms/shot.py
```

Looping examples GIF (`examples.gif` — before → infographic → svg → 3js → simulation):

```powershell
python gold/forms/make_gif.py
```
