# reimagine-it — the source file is the design brief

**One command turns an existing HTML page into a beautiful, usable redesign — without inventing filler.**

Every redesign tool you've used does the same thing: you describe what you *want*, and it invents a new page from scratch. reimagine-it does the opposite. It reads the page you already have, extracts the real headings, facts, links, names, dates, numbers, and even the hex colors already in your markup, and rebuilds a stronger visual system *around* that content.

```bash
npx reimagine-it --auto -i page.html -o redesign.html
```

## Why this is different

- **The source is the brief.** The palette comes from hex colors already in your HTML. The motif comes from your concrete nouns. The motion from your dates and numbers. Nothing is hallucinated — 100% source-backed.
- **One standalone HTML file out.** No CDN, no Figma, no build step, no dependency. The result works offline and in a browser extension.
- **15 design directions + Auto.** Webpage, landing, dashboard, infographic, cinematic, artistic, photography, SVG, 3js, simulation, glass, editorial, motion, gradient, showcase. Auto evaluates up to three, scores them against 8 craft checks, and picks the strongest.
- **It audits itself.** Every direction is measured for fidelity (facts preserved), usability (standalone, focus-visible, reduced-motion, no placeholder copy), and diversity (no two tokens produce the same page).

## Measured, not claimed

All 15 directions × 4 representative sources score **100/100 usability and full fidelity**, with **18.4% mean pairwise output diversity**. The benchmark is reproducible: `node scripts/benchmark-tokens.js`.

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
