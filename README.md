# reimagine-it

> **The source file is the design brief.** Turn existing HTML into a beautiful, usable page — without losing its meaning.

[![CI](https://img.shields.io/github/actions/workflow/status/Kayforkind/reimagine-it/audit.yml?branch=main&label=CI&logo=github)](https://github.com/Kayforkind/reimagine-it/actions/workflows/audit.yml)
[![Benchmark](https://img.shields.io/github/actions/workflow/status/Kayforkind/reimagine-it/benchmark.yml?branch=main&label=benchmark%20100%2F100)](https://github.com/Kayforkind/reimagine-it/actions/workflows/benchmark.yml)
[![Design Health](https://img.shields.io/github/actions/workflow/status/Kayforkind/design-health-action/audit.yml?branch=main&label=Design%20Health&logo=github)](https://github.com/Kayforkind/design-health-action/actions/workflows/audit.yml)
[![version 2.5.0](https://img.shields.io/badge/version-2.5.0-b22234.svg)](CHANGELOG.md)
[![npm](https://img.shields.io/npm/v/reimagine-it?color=e8a63f&label=npm)](https://www.npmjs.com/package/reimagine-it)
[![MIT](https://img.shields.io/badge/license-MIT-1a2138.svg)](LICENSE)
[![skills.sh](https://skills.sh/b/kayforkind/reimagine-it)](https://skills.sh/kayforkind/reimagine-it)

[![reimagine-it — the source file is the design brief](https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/banner.svg)](https://kayforkind.github.io/reimagine-it/#playground)

<div align="center">

**[Try the live playground](https://kayforkind.github.io/reimagine-it/#playground)** · **[See the results](https://kayforkind.github.io/reimagine-it/#results)** · **[Run it locally](#the-60-second-proof)** · **[Install it](#install)**

</div>

## One command. One inspectable result.

**reimagine-it** redesigns an existing HTML page from the content already inside it. It extracts the real headings, facts, links, names, dates, numbers, and colors, then builds a stronger visual system around them — without replacing the page with invented filler.

```bash
npx reimagine-it --auto -i page.html -o redesign.html
npx reimagine-it variations -i page.html -n 4 -o review/
npx reimagine-it lock -i brand.html -o house.lock.json
npx reimagine-it audit redesign.html
```

**Source in. Beautiful, usable HTML out. The source stays untouched.** The result is one standalone HTML file — offline, no CDN, no Figma, no build step. Four commands share that engine: generate (or `--auto`), `variations`, `lock`, and `audit`.

## See it work

Real sources, real CLI output — seven committed journeys, **seven distinct Auto tokens**. A juice bar, a skate deck, and a streetwear drop do not share a silhouette.

| Source | Auto | Score | Fidelity | Alternates |
|---|---|---|---|---|
| [Venator](examples/end-users/venator/) | `gradient` | 246 | 100% | `landing`, `artistic` |
| [Crimson Circuit](examples/end-users/crimson-circuit/) | `cinematic` | 258 | 100% | `gradient`, `landing` |
| [Velocita](examples/end-users/velocita/) | `artistic` | 240 | 85% | `gradient`, `landing` |
| [Maracuyá](examples/end-users/maracuya/) | `landing` | 246 | 89% | `photography`, `gradient` |
| [Flick Fits](examples/end-users/flick/) | `photography` | 250 | 100% | `showcase`, `landing` |
| [Meridian Tower](examples/end-users/meridian/) | `3js` | 260 | 100% | `editorial`, `svg` |
| [Horizon](examples/end-users/horizon/) | `dashboard` | 330 | 95% | `gradient`, `landing` |

<p align="center">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/examples/end-users/venator/auto-desktop.png" width="280" alt="Venator Auto → signal-yellow gradient arena">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/examples/end-users/crimson-circuit/auto-desktop.png" width="280" alt="Crimson Circuit Auto → magenta cinematic chapters">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/examples/end-users/velocita/auto-desktop.png" width="280" alt="Velocita Auto → flame-orange artistic poster">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/examples/end-users/maracuya/auto-desktop.png" width="280" alt="Maracuyá Auto → coral product landing">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/examples/end-users/flick/auto-desktop.png" width="280" alt="Flick Fits Auto → electric-blue photography folio">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/examples/end-users/meridian/auto-desktop.png" width="280" alt="Meridian Auto → amber 3D object">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/examples/end-users/horizon/auto-desktop.png" width="280" alt="Horizon Auto → navy ops dashboard">
</p>

<p align="center"><sub>Auto desktops from the committed engine. Before/after composites and two alternatives live in each <a href="examples/end-users/">bundle</a>.</sub></p>

**One command, three furnished designs** — point `/reimagine-it` at a building page and it ships an orbitable 3D object, a magazine feature, and a living SVG diagram from the same source: `npx reimagine-it --auto -i meridian.html`. [See the suite →](https://kayforkind.github.io/reimagine-it/#suite)

## The 60-second proof

Start with a real page — not a generic prompt:

```html
<!-- before.html -->
<h1>A Letter to the Night Tide</h1>
<p>Field notes from the coast, written after the last light.</p>
<h2>Three things the water taught us</h2>
<ul>
  <li>Patience · 12 minutes of stillness</li>
  <li>Distance · 4 miles offshore</li>
  <li>Return · notes from 2026</li>
</ul>
```

Generate a direction:

```bash
npx reimagine-it --auto -i before.html -o redesign.html
```

Open `redesign.html`. It is a standalone artifact: no server, CDN, API key, Figma file, or build step is required.

For a reviewable client handoff, keep the decision report too:

```bash
npm run auto -- \
  -i before.html \
  -o review/auto.html \
  --report review/auto.json \
  --seed 42
```

The report records the selected direction, candidate scores, seed, rationale, source anchors, and source-fidelity checks. The input file is never overwritten.

## Fifteen design builders

Every token is a real generator in the engine — each one reads the same extracted content and builds a structurally different composition. Layouts are generated, not pasted from a design kit; source facts are not invented. Every builder also ships with a content-derived art layer: anchor initials become monogram tiles, source numbers become donut and bar charts, and the palette shades isometric 3D prisms — all inline SVG, all offline.

| Builder | Real output (same source) | Best for | Character |
|---|---|---|---|
| `webpage` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/webpage-desktop.png" width="120" alt=""> | Articles and source documents | Measured reading hierarchy |
| `landing` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/landing-desktop.png" width="120" alt=""> | Products and services | Hero and action rhythm |
| `dashboard` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/dashboard-desktop.png" width="120" alt=""> | Metrics and operations | Console, KPIs, and status |
| `infographic` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/infographic-desktop.png" width="120" alt=""> | Facts and comparisons | Shared scales and timelines |
| `cinematic` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/cinematic-desktop.png" width="120" alt=""> | Narrative moments | Depth and paced chapters |
| `artistic` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/artistic-desktop.png" width="120" alt=""> | Posters and expressive pages | Asymmetric type and layered fields |
| `photography` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/photography-desktop.png" width="120" alt=""> | Portfolios and collections | Folio plates and captions |
| `svg` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/svg-desktop.png" width="120" alt=""> | Marks and diagrams | Inline geometric illustration |
| `3js` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/3js-desktop.png" width="120" alt=""> | Spatial stories | Offline orbitable canvas |
| `simulation` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/simulation-desktop.png" width="120" alt=""> | Time and process | Playable timeline and scrubber |
| `glass` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/glass-desktop.png" width="120" alt=""> | Modern panels and cards | Frosted backdrop-filter depth |
| `editorial` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/editorial-desktop.png" width="120" alt=""> | Long-form text and essays | Magazine layout with drop caps |
| `motion` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/motion-desktop.png" width="120" alt=""> | Scroll-driven stories | Animated reveals and parallax |
| `gradient` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/gradient-desktop.png" width="120" alt=""> | Bold brand presentations | Gradient mesh cards and text |
| `showcase` | <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens/showcase-desktop.png" width="120" alt=""> | Capability demonstrations | Motion-forward capability cards, timeline, and stats |

List the registry from the CLI:

```bash
npx reimagine-it --list
```

The committed examples are reproducible references, not promises about an unknown input. Run the command on your own page to see what its content produces.

## Why this exists

Generic design prompts begin with adjectives — *modern*, *premium*, *minimal*, *bold*. That is why unrelated pages often converge on the same cards, gradients, and invented SaaS copy.

Content-Derived Design begins with evidence:

```text
source signals → design decisions → working artifact → human approval
```

A restaurant menu can become a warm typographic folio. An observability page can become a pulse-led console. A personal essay can become a quiet narrative field. The content gives the redesign a reason to look the way it does.

### What is guaranteed

- **Meaning stays anchored.** Titles, headings, dates, numbers, links, emails, and source anchors are extracted and checked in generated output.
- **The artifact is usable.** Generated pages are standalone HTML with inline CSS/SVG/canvas where needed.
- **The choice is inspectable.** Auto ranks up to three directions and reports why it selected one.
- **Variation is controlled.** No seed explores; `--seed 42` reproduces an approved direction.
- **The craft floor is explicit.** `npx reimagine-it audit` runs **19 rules** in Node (no Python required). Python `scripts/audit.py` is a parity-tested CI mirror.
- **Several directions on demand.** `variations` writes ranked pages plus a contrast sheet from the same evidence.
- **Brand surface is reusable.** `lock` captures palette, type, and voice as JSON; `--ref` applies it — including reverse-lock from any HTML page.

## Design Auto

Use Auto when you know the outcome you want but do not want to choose a token first:

```bash
npx reimagine-it --auto -i page.html -o reimagined/auto.html
```

Auto reads the source, scores the directions that fit its evidence, generates candidates, rejects candidates that fail its craft checks, and writes the strongest result. It is deterministic when seeded and model-agnostic: a host agent may add judgment, but the artifact still comes from the source.

Every run now carries a **design decision report**: a typographic voice picked from the source's profile (editorial, grotesque, techno, serif-classic, high-contrast, expressive, mono-forward), a harmonious OKLCH palette (the source accent rotated into two role colors), the art primitives used, and a 136-point design-QA score (type scale, art direction, motion system, palette constraint, source fidelity, landmarks). Auto re-rolls weak first draws for its top directions before shipping, and `--emit` writes `design-token.json` + `quality-report.json` beside the artifact so the "why this design" answer is inspectable.

Use a specific direction when the medium is already clear:

```bash
npx reimagine-it -i page.html -t webpage -o reimagined/article.html
npx reimagine-it -i page.html -t dashboard -o reimagined/ops.html
npx reimagine-it -i page.html -t infographic -o reimagined/poster.html
```

Preview the extracted evidence before generating:

```bash
npx reimagine-it -i page.html --dry
npx reimagine-it -i page.html --json
```

## A client-ready workflow

1. **Start with the real source.** Do not flatten the page into a vague prompt.
2. **Generate two or three defensible directions.** Change the composition and visual register, not just the hex values.
3. **Show the live artifact.** Let the client inspect the page, not only a screenshot.
4. **Approve one direction.** Keep its report beside the artifact.
5. **Pin the decision.** Use a seed for a reproducible page; use the agent skill's lock workflow for a reusable design language.
6. **Run the quality gate.** A page is not done if it clips content, loses focus visibility, or invents facts.

The intended outcome is **fresh when requested, consistent when approved** — not accidental repetition and not random chaos.

## Case studies

- **[Live playground](https://kayforkind.github.io/reimagine-it/#playground)** — paste HTML, select a direction, preview the result, and share the input.
- **[Seven journeys](examples/end-users/)** — crypto battle royale, music festival, skate brand, juice bar, streetwear drop, living building, observability platform. Auto picked seven distinct tokens. Each bundle has source HTML, Auto output, two alternatives, a report, Auto desktop stills, and a before/after WebP.
- **[Case study index](docs/CASE_STUDIES.md)** — commands, fidelity, and how to read a bundle.
- **[Horizon](https://kayforkind.github.io/reimagine-it/#horizon)** — SLO/uptime page → navy dashboard.
- **[Full suite](https://kayforkind.github.io/reimagine-it/#suite)** — one building source → orbitable `3js` object, editorial feature, and living SVG.
- **[Infographic](https://kayforkind.github.io/reimagine-it/#infographic)** · **[Gaming](https://kayforkind.github.io/reimagine-it/#gaming)**

## Install

### CLI (npm)

```bash
npx reimagine-it --auto -i page.html -o redesign.html
```

Or install once:

```bash
npm install -g reimagine-it
reimagine-it --auto -i page.html -o redesign.html
```

Package: [npmjs.com/package/reimagine-it](https://www.npmjs.com/package/reimagine-it) · current release **2.5.0**.

### Agent Skill

```bash
npx skills add Kayforkind/reimagine-it
```

Works with Agent Skills hosts including Cursor, Codex, Claude Code, Copilot, Gemini CLI, Windsurf, and Factory Droid. The skill is the orchestration layer; the dependency-free CLI is the artifact layer.

### Claude Code

```text
/plugin marketplace add Kayforkind/reimagine-it
/plugin install reimagine-it@reimagine-it
```

### Codex and Factory Droid

```bash
codex plugin marketplace add Kayforkind/reimagine-it
codex plugin add reimagine-it@reimagine-it

droid plugin marketplace add https://github.com/Kayforkind/reimagine-it
droid plugin install reimagine-it@reimagine-it --scope user
```

## Design Health in CI

**Design Health now lives in its own repository: [Kayforkind/design-health-action](https://github.com/Kayforkind/design-health-action)** — [![CI](https://img.shields.io/github/actions/workflow/status/Kayforkind/design-health-action/audit.yml?branch=main&label=CI)](https://github.com/Kayforkind/design-health-action/actions/workflows/audit.yml). It is a public composite Action for deterministic HTML quality checks — a separate quality gate from the redesign engine:

```yaml
- uses: Kayforkind/design-health-action@v1
  with:
    path: "**/*.html"
    fail-on-warnings: "false"
```

Design Health reports `CLEAN`, `WARNINGS`, or `FAIL` and checks typography, palette, motion, content, structure, and performance heuristics. It needs no LLM or API key. Pin a release tag in production rather than depending on `main`.

## CLI reference

The core path accepts a file or stdin:

```bash
# File in, file out
npx reimagine-it -i page.html -t webpage -o redesign.html

# HTML through a pipeline; stdout contains only the artifact
cat page.html | npx reimagine-it -t webpage -o - > redesign.html

# Inspect extraction
npx reimagine-it -i page.html --dry
npx reimagine-it -i page.html --json

# Before/after summary without writing a file
npx reimagine-it -i page.html --auto --diff

# Reproduce an approved draw
npx reimagine-it -i page.html -t webpage --seed 42 -o approved.html

# Opt in to Google Fonts for the chosen voice (default output is fully offline)
npx reimagine-it -i page.html -t landing --web-fonts -o redesign.html

# Force a voice or a direction from a harness plan
npx reimagine-it -i page.html --voice expressive -o redesign.html
npx reimagine-it -i page.html --auto --plan '{"token":"landing","voice":"grotesque"}' -o redesign.html

# Also write the design decision report next to the output
npx reimagine-it -i page.html --auto -o reimagined/auto.html --emit

# Several directions + a contrast sheet
npx reimagine-it variations -i page.html -n 4 -o review/ --seed 42

# Capture a brand surface, then put new content on it
npx reimagine-it lock -i house-style.html -o house.lock.json
npx reimagine-it -i my-page.html --ref house.lock.json -t landing -o on-brand.html

# Reverse-lock: steal a surface from any HTML, keep this source's facts
npx reimagine-it -i my-page.html --ref competitor.html --auto -o study.html

# Design Health on a generated page (exit 3 if it fails its own floor)
npx reimagine-it -i page.html --auto --audit -o checked.html
npx reimagine-it audit redesign.html --verbose
```

Use `-o -` when another tool should receive only generated HTML; progress stays on stderr.

## MCP server

Expose the same engine to an MCP-compatible host:

```json
{
  "mcpServers": {
    "reimagine-it": {
      "command": "npx",
      "args": ["-y", "--package", "reimagine-it", "reimagine-it-mcp"]
    }
  }
}
```

Tools:

- `reimagine` — generate a selected direction from raw HTML (`ref` brand-locks the surface)
- `design_auto` — choose, generate, verify, and explain a direction
- `design_variations` — several ranked directions plus a contrast sheet
- `design_lock` — capture a page's surface as reusable JSON
- `extract_content` — inspect source evidence
- `list_tokens` — discover directions
- `audit_html` — run Design Health (19 rules, native, no Python)
- `list_rules` — the Design Health rule registry

## Browser extension and DeepSeek Harness

- The **[browser extension](extension/README.md)** adds local redesign to Chrome, Edge, and Firefox. It does not upload the page or require a server.
- The optional **[DeepSeek Harness adapter](dsh/README.md)** exposes `design_auto` while leaving model access, approvals, sandboxing, and persistence to the host runtime.

## Measured quality

Every direction is benchmarked against the same bar Auto itself applies — standalone HTML, source title and anchors retained, focus-visible, reduced-motion, `::selection`, no placeholder copy, no external asset fetch. All 15 tokens × 4 representative sources score **100/100 usability and full fidelity**, with **19.9% mean pairwise output diversity** between directions on the same source (no two tokens produce the same page).

| Direction | Fidelity (title kept) | Usability (quality /100) | Content art |
|---|---|---|---|
| `landing` | 18/18 | 100/100 | 8.0 |
| `dashboard` | 18/18 | 100/100 | 6.8 |
| `photography` | 18/18 | 100/100 | 6.0 |
| `svg` | 18/18 | 100/100 | 6.0 |
| `artistic` | 18/18 | 100/100 | 6.0 |
| `motion` | 18/18 | 100/100 | 6.0 |
| `webpage` | 18/18 | 100/100 | 5.0 |
| `infographic` | 18/18 | 100/100 | 5.0 |
| `cinematic` | 18/18 | 100/100 | 5.0 |
| `simulation` | 18/18 | 100/100 | 5.0 |
| `glass` | 18/18 | 100/100 | 5.0 |
| `gradient` | 18/18 | 100/100 | 5.0 |
| `showcase` | 18/18 | 100/100 | 5.0 |
| `editorial` | 18/18 | 100/100 | 2.0 |
| `3js` | 18/18 | 100/100 | 2.0 |

Content art counts inline glyph tiles, donut charts, bars, and prisms — `3js` and `editorial` score lower there by design (WebGL scene / text-forward layout). Regenerate the full table anytime: `node scripts/benchmark-tokens.js`. The `--gate` flag makes it exit non-zero if any token drops below 100/100, and CI enforces it weekly (and on engine changes).

## Quality and limits

Run the project checks locally:

```bash
npm test
npm run check:docs
```

Current repository checks include:

- 63 engine unit tests covering extraction, generation, Auto, CLI behavior, color science, and npm pack contents.
- 20 MCP tool tests (no SDK required) plus 25 end-to-end CLI tests for generate, audit, lock, and variations.
- JS/Python Design Health parity across the HTML corpus (19 rules; a drift fails CI).
- 32 curated gold HTML files audited; warnings are advisory and failures block shipping.
- Intentional failing-fixture coverage to ensure the audit exit code catches real craft-floor failures.
- Browser bundle freshness checks for the landing page and extension.
- Token audits in CI: every generated direction is structurally checked and headless-rendered for visible text, overflow, and headings.
- `npm pack` must include `mcp/tools.js` and the engine modules — the published CLI and MCP bin share one package.

The audit is deterministic and heuristic. It is not a claim of full WCAG conformance, visual taste, or universal browser compatibility. Review the generated page before shipping it to a client.

## Contributing

The best contribution is a real source with a defensible transformation:

- add source HTML and a generated artifact;
- explain why the palette, motif, type, and motion come from the source;
- provide a regenerating command or script;
- run `npm test` and inspect the result in a browser.

See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`ROADMAP.md`](ROADMAP.md), and [`CHANGELOG.md`](CHANGELOG.md).

## License

MIT — see [`LICENSE`](LICENSE).
