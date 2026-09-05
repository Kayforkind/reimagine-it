# reimagine-it Roadmap

> **Shipped: v2.8.0** — nine committed journeys at 100% source fidelity, a full-fact rendering
> engine (no silent fact caps in any generator), a CI drift guard that re-derives every proof
> asset, a 6,750-run fidelity stress harness with zero violations, a 17-direction roster
> (new: `lookbook`, `particles`), and a AAA motion pack (kinetic type, magnetic buttons,
> glow-follow cards, inertia-orbit 3D with fact billboards) on every token.
> See [CHANGELOG.md](CHANGELOG.md) for what landed and when.

The competitive analysis that shaped earlier versions lives at the bottom. This top section is
the live plan: what is open, ordered by leverage per hour.

---

## Phase 0 — Housekeeping (this week)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 0.1 | npm provenance (`--provenance` + `id-token: write`) on the release publish | 10 min | **Shipped** |
| 0.2 | Tarball guard — CI fails if `npm pack` drifts from the intentional `files:` list | 30 min | **Shipped** |
| 0.3 | Repo social preview: upload `docs/og.png` in repo Settings → Social preview *(manual, one click)* | 1 min | Open (manual) |
| 0.4 | Finish the v2.4.4 external-listing sweep — cursor.directory recheck, then run the [SUBMISSIONS.md](SUBMISSIONS.md) blitz (6 platforms drafted) | 1 h | Open (outreach) |

## Phase 1 — Quality & trust (weeks 1–2)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 1.1 | Extractor fuzz tests — property-based tests for `src/extract.js` (the no-invented-facts core) against malformed/hostile HTML | 2 h | **Shipped** |
| 1.2 | Still-coverage guard — drift guard verifies dimensions of every committed screenshot (1400×1100 desktop, 480×960 phone), including the community case | 1 h | **Shipped** |
| 1.3 | Visual regression — PNG-diff the nine committed desktop stills in CI; extends the drift guard to the pixel level. Calibrated with a perceptual tolerance (engine is deterministic across platforms; PNG encoders are not) | 1 d | **Shipped** (calibrated; pixel-exact mode behind a flag) |
| 1.4 | Weekly fidelity stress run — scheduled CI job at 250 seeds, artifacting the worst cells | 1 h | **Shipped** |
| 1.5 | Playground hardening — audit the sandboxing of pasted user HTML in the iframe preview | 2 h | **Shipped** (sandboxed iframe: `allow-same-origin` removed, `allow-scripts` only) |

## Phase 2 — Product surface (weeks 3–6)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 2.1 | `extract` CLI verb — `npx reimagine-it extract -i page.html` → JSON of title/anchors/dates/numbers/emails/links/palette/motif. The engine already does this; it is packaging. Opens the marketer/writer/docs-team audience | 2 h | **Shipped** |
| 2.2 | Finish the SKILL.md split (per SkillsBench: focused sub-skills beat monolithic by ~18.6 pts) — `audit/lock/infographic` exist; add `generate`, `variations`, `extract` sub-skills | 1 d | **Shipped** |
| 2.3 | skills.sh metadata — `capabilities`, `keywords`, `category` frontmatter across the suite for catalog discoverability | 1 h | **Shipped** |
| 2.4 | Playground: fetch-from-URL input, source-vs-result tab chips, on-site walkthrough video, jump links from the results section | 1 d | **Shipped** (URL fetch, tab chips, video link) |
| 2.5 | MCP surface — `npx reimagine-it mcp` entry point; the 8-tool server ships today | 1 h | **Shipped** |

## Phase 3 — Distribution & community (month 2)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 3.1 | Roundup submissions + a 60-second cut of the walkthrough for YouTube/reels | 1 d | Open (outreach) |
| 3.2 | Community submission pipeline — `examples/community/TEMPLATE/` + a validation script; the clinic already proves the lane | 4 h | **Shipped** |
| 3.3 | Good-first-issue labels for new domain packs; a "show your gold" Discussions category | 1 h | Open (needs repo settings) |
| 3.4 | Design Health published to the GitHub Actions marketplace (it already runs on this repo) | 1 d | Open |
| 3.5 | PR bot — comments the content-derived palette when a PR touches HTML | 1 d | Open |

## Phase 4 — Moat (quarter)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 4.1 | Content→design dataset on HuggingFace — the nine examples + gold tree already contain `{source, anchors, auto.json, output}` tuples; a builder script makes the JSONL | 1 d | **Shipped** (builder: `scripts/build-dataset.js`; publishing is a manual upload) |
| 4.2 | Browser extension — the engine is already bundle-built for browsers; the extension is a thin wrapper around the playground | 1 wk | **Shipped** (MV3 extension in `extension/`, loads the page, opens the redesigned standalone page) |
| 4.3 | MCP hardening — more tool tests, host-specific docs | 2 d | Open |

---

## If you only do three things

1. **Finish 0.3/0.4** — the social preview and the roundup blitz are the highest leverage per minute; everything else polishes a product nobody has heard of yet.
2. **Run 3.1** — the 60-second cut reuses the committed walkthrough workflow.
3. **Review Phase 4** — the dataset and extension are the two bets that compound.

---

## Competitive landscape (kept for context)

### What exists (design-focused agent skills)

| Skill | Installs/Stars | What it does | Key differentiator |
|-------|----------------|--------------|---------------------|
| **frontend-design** (Anthropic) | 277,000+ installs | Bans Inter/Roboto/Arial, forces aesthetic direction, provides litmus checks | Official Anthropic skill — the default |
| **Impeccable** (pbakaus) | Growing fast | 23 commands (audit, critique, polish, bolder, quieter), 2 modes (brand vs product), 59 deterministic detector rules, CLI installer, browser extension | Polish + ecosystem: website, CLI, docs, extension |
| **reimagine-it** (Kayforkind) | — | Content-derived design — reads source, builds palette/motif/motion from content | **Only skill that derives design from source content** |
| **taste-skill** (leonxlnx) | ~44 ratings, 4.4★ | Audits and upgrades existing websites to premium design standards | Existing-site redesign |
| **designer-skills** (Owl-Listener) | Niche | 63 skills across 8 plugins, research → handoff workflow | Process-heavy, taste-light |
| **frontend-skill** (OpenAI) | Codex-bundled | Parallel to Anthropic's frontend-design for Codex | Codex-specific |

### The moat

> **Content-derived design.** Every other skill enforces *generic* taste (ban Inter, proper
> spacing, no gradients). reimagine-it reads the actual source file and builds palette, motif,
> and motion from *that content*. A bakery cannot come out marine-teal. No other skill does this.

### What they have that reimagine-it didn't (and what happened)

| Gap | Status after v2.8.0 |
|-----|---------------------|
| Product website | **Shipped** — docs site with playground, nine case studies, community proof |
| Deterministic quality checks | **Shipped** — 19-rule Design Health, JS + Python parity-tested |
| Visual test loop | **Shipped** — drift guard, still-coverage guard, calibrated pixel regression, weekly stress |
| Multiple commands | **Shipped** — generate, auto, variations, lock, audit, extract, list, mcp |
| Standalone CLI | **Shipped** — `npx reimagine-it`, zero dependencies, Node ≥ 18 |
| MCP server | **Shipped** — 8 tools, stdio adapter, unit-tested |
| Browser extension | **Shipped** — MV3 in `extension/` |
| Distinct modes | **Shipped** — content-derived (default) + brand-locked (`lock`/`--ref`) |
| Community contributions | Open — the submission pipeline (3.2) is the on-ramp |

### Research-backed principles (August 2026 scan)

- SkillsBench: focused sub-skills outperform monolithic SKILL.md by ~18.6 pts → the split (2.2).
- Design is the 6th-largest skills category (~25K vs 288K dev) → underserved; metadata matters (2.3).
- 36% of audited skills ship prompt-injection or security issues → CI + audit + sandboxing = trust (1.1, 1.5).
- The skill `description` is routing code; push deterministic work into scripts → every claim in
  this repo is backed by a regenerable script or a test.
