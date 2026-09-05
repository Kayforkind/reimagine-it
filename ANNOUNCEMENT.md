# v2.8.0 announcement — paste-ready

Short form for the GitHub release notes; long form for X/Reddit/HN follow-ups.
Do not post until `npm view reimagine-it version` returns 2.8.0.

---

## GitHub release (v2.8.0)

**reimagine-it v2.8.0 — 17 directions, and a AAA motion system on every one**

v2.7.0 made the honesty layer a product surface. v2.8.0 makes the output move
like it costs six figures.

**Two new directions — the roster is 17**

- **`lookbook`** — a photoshoot/editorial spread: oversized masthead, numbered
  looks from source anchors, hover-develop plates, anchor marquee. Auto awards
  it on real photoshoot/runway/collection vocabulary (deliberately narrow —
  "flu shots" is a genuine false positive the reproduction guard caught).
- **`particles`** — a living constellation: a seeded canvas field where source
  anchors ride as text particles and facts glow as nodes; pointer-reactive,
  fully frozen under reduced motion.
- Benchmark rerun: **17/17 tokens at 100/100 usability and full fidelity**, and
  roster mean pairwise diversity *improved* 19.9% → **22.7%**.

**Motion system — every token, every page**

- **Kinetic type**: h1 words rise out of clipped masks, staggered (DOM-API only,
  never `innerHTML`, so source text can never re-parse as markup).
- **Magnetic buttons** that lean toward the cursor and spring back, **glow-follow
  cards**, **sheen sweeps**, and a shared easing token system
  (`--ease-out`, `--ease-spring`, `--ease-inout`).
- All transform/opacity (GPU-composited), pointer-aware, and inside the
  reduced-motion kill switch.

**3js — from spinning cube to scene**

Inertia orbit (drag flings, damped velocity settles), depth fog on far faces,
breathing ground shadow, twinkling seeded starfield, and **orbiting fact
billboards** — source anchors ride three rails around the object.

**SVG — the diagram draws itself**

Staggered node pulse and flowing connector dashes join the breathing core.

**Still provable**

All 10 proof artifacts regenerate byte-identically under the reproduction
guard; browser bundles rebuilt; the full suite (gold audit, unit, fuzz, e2e,
guards) is green.

```bash
npx reimagine-it --auto -i page.html -o redesign.html
npx reimagine-it lookbook -i collection.html -o spread.html
npx reimagine-it audit redesign.html
```

---

## Social (X/Bluesky, ~280 chars)

reimagine-it v2.8.0: 17 design directions now (lookbook + particle field), and a AAA motion pack on every token — kinetic type, magnetic buttons, glow-follow cards, inertia-orbit 3D with fact billboards. Still zero invented facts, still one offline HTML file.

---

## Reddit (r/ClaudeCode et al., body under the existing title)

We just cut v2.8.0. Three things worth your time:

1. **Two new directions.** `lookbook` turns any photoshoot/campaign/collection page into an editorial spread with numbered looks; `particles` turns any anchor list into a living, pointer-reactive constellation. Auto earns both from the source's own vocabulary — a clinic bulletin does not get a lookbook because it says "shots."
2. **Every token got a motion upgrade.** Kinetic headline reveals, magnetic buttons, glow-follow cards, sheen sweeps — plus a real scene in the 3D token (inertia orbit, depth fog, starfield, orbiting fact billboards) and self-drawing SVG diagrams. All compositor-friendly, all disabled under reduced motion.
3. **Still the honest engine.** 17/17 tokens benchmark at 100/100 usability and full fidelity with record output diversity (22.7%); every committed proof still regenerates byte-identically in CI.

`npx reimagine-it --auto -i page.html` — no keys, no build, one offline file.
