three@0.185.1 (REVISION 185), MIT.

Copied from npm for the offline `/reimagine-it 3js` gold. Do not replace with a CDN import map.

r185 splits the ES build: `three.module.min.js` imports `./three.core.min.js`. Both files must ship together.

The gold scene orbits with pointer + wheel in `after.html` (no `examples/jsm` addons). The min build does not export `Controls`.

See `LICENSE` in this folder (Three.js Authors).
