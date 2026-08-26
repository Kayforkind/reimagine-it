# reimagine-it — the source file is the design brief

**One command turns an existing HTML page into a $100k-look redesign — with a typographic voice, a harmonious palette system, generative art, and a self-critiquing engine. Nothing invented.**

Every redesign tool you've used does the same thing: you describe what you *want*, and it invents a new page from scratch. reimagine-it does the opposite. It reads the page you already have, extracts the real headings, facts, links, names, dates, numbers, images, and even the hex colors already in your markup, and rebuilds a stronger visual system *around* that content.

```bash
npx reimagine-it --auto -i page.html -o redesign.html
```

## What the v2.4 engine ships

- **Typographic voices.** The engine reads the source's profile and picks a display/body/mono voice — editorial (Fraunces/Newsreader), modern grotesque, techno (Unbounded/Sora), classic serif, high-contrast, expressive (Syne), or mono-forward — with a fluid type scale and a 4/8 spacing rhythm. `--web-fonts` upgrades the voice with Google Fonts; default output stays fully offline.
- **An OKLCH palette system.** Colors are converted through perceptually-uniform OKLCH; the source accent is rotated into two harmonious role colors with lightness ramps, enforced for contrast, and referenced through CSS variables so every page stays palette-constrained.
- **Generative art direction.** Seeded aurora mesh fields, giant data-wash numbers, halftone dot grids, anchor constellations, and CSS-3D isometric stacks — plus a shared micro-interaction layer (cursor spotlight, tilt cards, count-up stats) on every page.
- **Composition, not templates.** A shared archetype library — stats bands, bento grids, quote bands, CTAs, marquees, footers — lets each of the 15 directions compose a page from source facts instead of hard-coding one layout.
- **A self-critiquing Auto.** Auto draws three directions, scores each against a 136-point design battery (type scale, art direction, motion system, palette constraint, source fidelity, landmarks), re-rolls weak first draws, and ships the strongest — with a `design-token.json` + `quality-report.json` that explain *why*.
- **A harness plan hook.** An agent can steer the same deterministic pipeline with a structured plan: `--plan '{"token":"landing","voice":"grotesque"}'`.
- **15 design directions + Auto.** Webpage, landing, dashboard, infographic, cinematic, artistic, photography, SVG, 3js, simulation, glass, editorial, motion, gradient, showcase.
- **It audits itself.** Every direction is measured for fidelity (facts preserved), usability (standalone, focus-visible, reduced-motion, no placeholder copy), and diversity (no two tokens produce the same page).

## Measured, not claimed

All 15 directions × 4 representative sources score **100/100 usability and full fidelity**, with **15.6% mean pairwise output diversity**. The benchmark is reproducible: `node scripts/benchmark-tokens.js`.

## Try it without installing anything

Paste any HTML into the live playground and watch it redesign in the browser — then share a one-click link that reproduces the exact result:

**[https://kayforkind.github.io/reimagine-it/#playground](https://kayforkind.github.io/reimagine-it/#playground)**

## See the proof

- [Crypto battle-royale → signal-yellow arena](https://kayforkind.github.io/reimagine-it/#gaming)
- [Observability SLO page → navy mission-control dashboard](https://kayforkind.github.io/reimagine-it/#horizon)
- [Data-heavy field report → wide + tall infographic](https://kayforkind.github.io/reimagine-it/#infographic)
- [Living building → editorial feature + orbitable 3D + living SVG](https://kayforkind.github.io/reimagine-it/#suite)

## Install it

- **Agent skill** — drop into Claude Code, Cursor, Codex, Copilot, or Gemini CLI (`skills/reimagine-it/`).
- **npm CLI** — `npm i -g reimagine-it` or `npx reimagine-it`.
- **MCP server** — `reimagine-it-mcp`.
- **GitHub Action** — [design-health-action](https://github.com/Kayforkind/design-health-action) runs deterministic HTML quality checks in CI (typography, palette, motion, content, structure, performance — no LLM, no API key).

## Links

- Repo: [github.com/Kayforkind/reimagine-it](https://github.com/Kayforkind/reimagine-it)
- npm: [npmjs.com/package/reimagine-it](https://www.npmjs.com/package/reimagine-it)
- Skills.sh: [skills.sh/kayforkind/reimagine-it](https://skills.sh/kayforkind/reimagine-it)
- License: MIT

---

*Publish-ready. Copy the body into dev.to, Hacker News ("Show HN"), or Reddit (`r/WebDev`, `r/SideProject`, `r/cursor`). Tailor the first line to each audience.*
