# reimagine-it Roadmap

> **Shipped: v2.9.0** — nine committed journeys at 100% source fidelity, a full-fact rendering
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

| Gap | Status after v2.9.0 |
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

---

## Market research (2026-08)

> Folded from MARKET-GAPS.md (researched 2026-08-23; sources: OSS Insight, Agentman,
> SkillsBench, Impeccable v4 changelog, skills.sh catalog analysis, community threads).
> Kept as context for the phases above; the already-shipped findings (SKILL.md split,
> CI proof, description routing) have moved into Phases 0–2.

## 1. The ecosystem: huge, fast, and duplicated

**Key numbers from OSS Insight and Agentman:**

- 250,000+ GitHub stars in 10 weeks on skills repos
- 57,000 AGENTS.md files, 21,000 CLAUDE.md files, 31,000 .claude/skills/ directories
- **1.17 million** skills on Skills.sh alone
- SkillsBench analyzed 47,150 public skills — **average quality score: 6.2/12**
- 36% of skills have prompt injection vulnerabilities
- 26% have security issues making them risky to reuse

**What this means for reimagine-it:** Quality is the differentiator, not quantity. Being one of 1.17 million skills is noise. Being one of the few with a CI pipeline, deterministic quality checker, and a published methodology (Content-Derived Design) is signal. But the signal isn't reaching anyone yet — distribution is the bottleneck.

---

## 2. Design is the most underserved category

**Skills.sh category breakdown (August 2026):**

| Category | Published skills |
|----------|-----------------|
| Development & Engineering | 288,811 |
| Product Management | 86,948 |
| Marketing | 74,510 |
| Data & Analytics | 69,187 |
| Operations | 51,007 |
| Sales | 42,570 |
| **Design** | **25,743** — *smallest major category* |
| Legal | 17,624 |
| Finance & Accounting | 14,932 |
| Healthcare & Life Sciences | 6,354 |

**Design is the 6th-largest category at only 25,743 skills** — despite being the highest-visibility output of AI coding agents. Everyone complains about "AI slop" in design. The market desperately needs design skills. But almost no one is building them compared to developer tools.

**What this means:** reimagine-it is in the right category with almost no competition. The top 4 design skills (frontend-design, Impeccable, theme-factory, brand-guidelines) are all generic taste enforcers. None do content-derived design. The field is open.

---

## 3. SkillsBench: focused beats monolithic by 18.6 points

The first peer-reviewed academic benchmark of agent skills found:

> "2–3 targeted skills delivered +18.6 points, while monolithic 'put everything in one document' skills actually **reduced** performance by 2.9 points."

This is the single most actionable finding. reimagine-it's SKILL.md is 374 lines — a monolith. The agent loads all of it when triggered. SkillsBench says this is measurably worse than having 2–3 focused sub-skills.

**What this means:** reimagine-it should split into:
- `reimagine-it-core` (~80 lines) — the Content-Derived Design method
- `reimagine-it-webpage` (~50 lines) — loads webpage-craft.md when triggered
- `reimagine-it-infographic` (~50 lines) — loads infographic.md when triggered
- `reimagine-it-svg` (~40 lines) — loads svg.md when triggered
- `reimagine-it-3js` (~40 lines) — loads 3js.md when triggered
- `reimagine-it-simulation` (~40 lines) — loads simulation.md when triggered
- `reimagine-it-audit` (~30 lines) — runs the deterministic checker

The SkillsBench data says this split alone is worth ~18% pass-rate improvement.

---

## 4. Impeccable v4 just raised the bar — here's what they shipped

Released August 2026. Three major features:

### Live Mode
Browser-based visual iteration. Click any element in-browser, choose a command (bolder, quieter, typeset, polish, animate), get 1–4 variations per prompt, accept one. Sub-variations available (toggle tilt, toggle border on/off). All without leaving the browser or burning context.

**reimagine-it gap:** No live iteration. The playground shows a result, but you can't tweak it in-browser. Impeccable's Live Mode is what the playground should become.

### Worlds — 177 aesthetic templates
Pre-built design "worlds" with Higgsfield MCP integration to preview your actual content in each world before picking one. You see your hero section in 177 different aesthetics.

**reimagine-it opportunity:** This is the anti-thesis of Content-Derived Design (Worlds picks from pre-built templates, CDD derives from content). But the *UX* is instructive: people want to see alternatives before committing. reimagine-it could show "3 content-derived palettes" generated from different anchor emphases.

### Finish Reviewer — subagent quality gate
A subagent with a fresh context window that reviews the output and checks for AI slop patterns. This is exactly what the audit tool does, but wired into the skill's internal workflow.

**reimagine-it gap:** The audit tool exists but isn't run automatically. The Finish Reviewer pattern — a subagent running audit.py on the output — would make it part of the skill's shipped bar.

### 20,882 ratings, 5 stars on Cyrus
Impeccable has built a real community. reimagine-it has ~5 stars on GitHub.

---

## 5. What's missing in every design skill (including Impeccable)

After reviewing frontend-design, Impeccable, theme-factory, brand-guidelines, design-extract, D3.js, Canvas Design, Excalidraw, Frontend Slides, and 10+ others:

**None of them:**
- Derive palette from source content (only reimagine-it does this)
- Generate a content-specific motif that repeats across the page
- Produce a statistical infographic from prose content
- Ship one offline HTML with no CDN as the default output
- Have a deterministic quality checker (Impeccable has 64 anti-pattern rules but they're detection, not pass/fail with exit codes)
- Have a CI pipeline verifying their gold output

**All of them:**
- Are about enforcing *generic* taste, not content-specific design
- Ban fonts and color patterns but don't suggest content-appropriate replacements
- Work only through an agent — no standalone browser tool or CLI

**reimagine-it's unique position:** Content-Derived Design is the only methodology that says "the source IS the brief." No competitor makes this claim. The question is whether anyone knows about it.

---

## 6. The "Stop Writing Agent Skills Like Longer Prompts" insight

From the top-performing Medium article on agent skills (Aug 2026):

> "A skill file isn't a bigger prompt. It's routing code, hard-earned corrections, and a script for the parts you can't afford to leave to chance."

> "The description is routing code. A skill can hold pages of careful instructions and still do nothing. The agent has to pick it first."

> "Push deterministic work into scripts, not LLM instructions."

**What this means for reimagine-it:**
- The SKILL.md description was already fixed to be a routing rule — good
- But the instructions body (374 lines) still asks the LLM to do things scripts could do: form routing, token parsing, checklist verification
- A refactored SKILL.md would push form routing to a Python script, token parsing to regex, and leave only the creative method (the four notes, the leap, the make-strange move) to the LLM

---

## 7. Growth hacks observed from competitors

**How Impeccable grew:**
- Free product website with live demos (impeccable.style)
- CLI installer that auto-detects agent tools (`npx impeccable install`)
- YouTube tutorials from multiple creators (not just the author)
- Referenced in every "best Claude skills" roundup
- Active Reddit presence (r/ClaudeCode, r/cursor)
- "Impeccable 4" launch with press/blog coverage
- Partnered with Higgsfield for visual MCP previews

**How frontend-design (Anthropic) grew:**
- Bundled with Claude Code as an official skill
- Banked on Anthropic's distribution channel
- Appeared first — first-mover advantage in design skills

**How reimagine-it can grow (not how they grew):**
- The web playground is the single best differentiator — no other design skill has one
- The Content-Derived Design methodology is citable — write a manifesto, get it cited
- The nine HTML journeys in `examples/end-users/` show the method on real sources — no competitor ships that as the public proof
- Community gold submissions would create network effects — each new domain pack multiplies value
- The GitHub Actions CI pipeline (coming) would make it the only design skill with verifiable quality

---

## 8. Actionable new improvements (not yet in ROADMAP.md)

Based on all research:

### A. Split monolithic SKILL.md into focused sub-skills (SkillsBench: +18.6 pts)

The highest-impact improvement. Each form/domain gets its own SKILL.md with focused instructions. The core skill becomes a router. Estimated impact: measurably better agent performance.

### B. Create a "SkillsBench Self-Score" badge

Evaluate reimagine-it against the 12-point SkillsBench criteria and display a self-assessed quality score on the README. This would make reimagine-it the only design skill with a transparent quality score.

### C. Add `/reimagine-it variations N` (Impeccable-style)

Show 2–4 content-derived palette/motif variations from the same source — different anchor emphases yield different designs. Users see alternatives before committing.

### D. Build a "reverse-lock" command

`/reimagine-it reverse-lock https://stripe.com` — extracts Stripe's design system into a lock file, then lets you reimagine YOUR content through Stripe's design language. Bridges content-derived and brand-locked design.

### E. Design Health GitHub Action

A marketplace action that runs audit.py against committed HTML/PRs — the design equivalent of Lighthouse CI or CodeQL. Posits reimagine-it as infrastructure, not just a skill.

### F. Live Preview mode (Impeccable's killer feature)

Extend the playground to support iterative refinement: pick an element, choose bolder/quieter/typeset/polish, see 3 variations, accept one. The playground already has the rendering engine; adding element selection + variation generation closes the biggest UX gap with Impeccable.

### G. Skills.sh optimization

Add `trigger_phrases`, `capabilities`, and `category` metadata to SKILL.md frontmatter for skills.sh search discoverability. Currently, reimagine-it is one of 1.17M skills on skills.sh and invisible.

### H. "Content Extraction" standalone skill for non-designers

A lightweight `/reimagine-it extract` that only does steps 0.85 (anchor list) and 1 (four notes) — returns a palette, motif suggestion, and anchor list without building a full page. Targets marketers, content writers, and docs teams who want to understand their content's design language without getting a full redesign.

### I. YouTube/tutorial content program

Not a code change. But every competitor with traction has multiple YouTube creators making tutorials. Draft a "reimagine-it in 60 seconds" script and offer it to AI coding YouTubers. The playground demo is perfect for this — screen capture the paste→redesign flow.

### J. GitHub bot for design suggestions on PRs

A bot that auto-comments with a content-derived design palette whenever an HTML file is changed in a PR. Shows up in other people's repos. Creates viral visibility.

---

## Priority (aggregated with existing ROADMAP.md)

These 10 items should become **Tier 2.5** in the roadmap — above current Tier 2 but below Tier 3 in ambition. The three highest-leverage:

1. **Split monolithic SKILL.md** — directly backed by SkillsBench data (+18.6 pts)
2. **Skills.sh optimization + trigger_phrases** — zero effort, massive distribution leverage
3. **Design Health GitHub Action** — positions reimagine-it as infrastructure, creates passive visibility