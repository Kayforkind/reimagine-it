# reimagine-it

> The source file is the design brief. Turn existing HTML into a beautiful, usable page without losing its meaning.

[![CI](https://img.shields.io/github/actions/workflow/status/Kayforkind/reimagine-it/audit.yml?branch=main&label=CI)](https://github.com/Kayforkind/reimagine-it/actions/workflows/audit.yml) [![version 2.3.3](https://img.shields.io/badge/version-2.3.3-b22234.svg)](CHANGELOG.md) [![MIT](https://img.shields.io/badge/license-MIT-1a2138.svg)](LICENSE) [![skills.sh](https://skills.sh/b/kayforkind/reimagine-it)](https://skills.sh/kayforkind/reimagine-it)

## One command. One inspectable result.

**reimagine-it** redesigns an existing HTML page from the content already inside it. It extracts the real headings, facts, links, names, dates, numbers, and colors, then builds a stronger visual system around them—without replacing the page with invented filler.

> **Source in. Beautiful, usable HTML out. The source stays untouched.**

<div align="center">

**[Try the live playground](https://kayforkind.github.io/reimagine-it/#playground)** · **[See the proof](https://kayforkind.github.io/reimagine-it/#cases)** · **[Run it locally](#the-60-second-proof)** · **[Install it](#install)**

</div>

[![A source page becomes several content-derived compositions](https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/hero.svg)](https://kayforkind.github.io/reimagine-it/#playground)

## The 60-second proof

Start with a real page—not a generic prompt:

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

## Why this exists

Generic design prompts begin with adjectives—*modern*, *premium*, *minimal*, *bold*. That is why unrelated pages often converge on the same cards, gradients, and invented SaaS copy.

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
- **The craft floor is explicit.** Every token includes reduced-motion, focus-visible, and selection styling.

## Design Auto

Use Auto when you know the outcome you want but do not want to choose a token first:

```bash
npx reimagine-it --auto -i page.html -o reimagined/auto.html
```

Auto reads the source, scores the directions that fit its evidence, generates candidates, rejects candidates that fail its craft checks, and writes the strongest result. It is deterministic when seeded and model-agnostic: a host agent may add judgment, but the artifact still comes from the source.

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

The intended outcome is **fresh when requested, consistent when approved**—not accidental repetition and not random chaos.

## See it work

- **[Live playground](https://kayforkind.github.io/reimagine-it/#playground)** — paste HTML, select a direction, preview the result, and share the input.
- **[Texas notebook case study](gold/webpage/)** — the original content becomes several reader registers.
- **[Pulsewave](gold/pulsewave/)** — observability language becomes a signal-oriented system.
- **[Two Lights](gold/twolights/)** — a personal essay becomes a lighthouse-led narrative.
- **[Saffron & Smoke](gold/saffron/)** — a menu becomes a warm food-specific composition.
- **[End-user examples](examples/end-users/)** — four realistic sources (release console, restaurant menu, personal essay, infrastructure docs) with source HTML, Auto output, alternate options, reports, and GIF proof on desktop and phone.
- **[Case studies](docs/CASE_STUDIES.md)** — four reproducible bundles: source, exact command, Auto output, two alternatives, report, and GIF proof.
- **[Full showcase](docs/SHOWCASE.md)** — source, rationale, artifact, and regeneration notes.
- **[Live playground](https://kayforkind.github.io/reimagine-it/#playground)** — all 14 design tokens now selectable in-browser.

<p align="center">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/examples/end-users/orbitline/before-after.gif" width="260" alt="Release desk: plain source to dashboard">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/examples/end-users/ember-table/before-after.gif" width="260" alt="Restaurant menu to warm landing page">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/examples/end-users/tide-letter/before-after.gif" width="260" alt="Essay to editorial magazine page">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/examples/end-users/teralyte/before-after.gif" width="260" alt="Infra docs to dashboard and gradient deck">
</p>

The committed examples are reproducible references, not promises about an unknown input. Run the command on your own page to see what its content produces.

## Fourteen output directions

| Token | Best for | Character |
|---|---|---|
| `webpage` | Articles and source documents | Measured reading hierarchy |
| `landing` | Products and services | Hero and action rhythm |
| `dashboard` | Metrics and operations | Console, KPIs, and status |
| `infographic` | Facts and comparisons | Shared scales and timelines |
| `cinematic` | Narrative moments | Depth and paced chapters |
| `artistic` | Posters and expressive pages | Asymmetric type and layered fields |
| `photography` | Portfolios and collections | Folio plates and captions |
| `svg` | Marks and diagrams | Inline geometric illustration |
| `3js` | Spatial stories | Offline orbitable canvas |
| `simulation` | Time and process | Playable timeline and scrubber |
| `glass` | Modern panels and cards | Frosted backdrop-filter depth |
| `editorial` | Long-form text and essays | Magazine layout with drop caps |
| `motion` | Scroll-driven stories | Animated reveals and parallax |
| `gradient` | Bold brand presentations | Gradient mesh cards and text |

<p align="center">
  <img src="https://raw.githubusercontent.com/Kayforkind/reimagine-it/main/docs/tokens-board.png" alt="All 14 design tokens applied to the same source — real CLI output" width="720">
</p>

List the registry from the CLI:

```bash
npx reimagine-it --list
```

## Install

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
- uses: Kayforkind/reimagine-it@v2.3.3
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

# Reproduce an approved draw
npx reimagine-it -i page.html -t webpage --seed 42 -o approved.html
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

- `reimagine` — generate a selected direction from raw HTML
- `design_auto` — choose, generate, verify, and explain a direction
- `extract_content` — inspect source evidence
- `list_tokens` — discover directions
- `audit_html` — run the craft-floor audit

## Browser extension and DeepSeek Harness

- The **[browser extension](extension/README.md)** adds local redesign to Chrome, Edge, and Firefox. It does not upload the page or require a server.
- The optional **[DeepSeek Harness adapter](dsh/README.md)** exposes `design_auto` while leaving model access, approvals, sandboxing, and persistence to the host runtime.

## Quality and limits

Run the project checks locally:

```bash
npm test
npm run check:docs
```

Current repository checks include:

- 44 unit tests covering extraction, generation, Auto, CLI behavior, and color science.
- 32 curated gold HTML files audited; warnings are advisory and failures block shipping.
- Intentional failing-fixture coverage to ensure the audit exit code catches real craft-floor failures.
- Browser bundle freshness checks for the landing page and extension.

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
