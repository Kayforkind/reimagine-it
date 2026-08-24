# reimagine-it Improvement Roadmap — Good → Great → Legendary

> Based on competitive analysis of Anthropic frontend-design (277k installs), Impeccable (23 commands, 59 detector rules, product website), Superpowers (243k stars), gstack (118k stars), and the broader agent-skills ecosystem.
>
> **Last updated:** v2.3.2 — see [CHANGELOG.md](CHANGELOG.md) for completed items.

---

## Competitive landscape

### What exists (design-focused agent skills)

| Skill | Installs/Stars | What it does | Key differentiator |
|-------|----------------|--------------|---------------------|
| **frontend-design** (Anthropic) | 277,000+ installs | Bans Inter/Roboto/Arial, forces aesthetic direction, provides litmus checks | Official Anthropic skill — the default |
| **Impeccable** (pbakaus) | Growing fast | 23 commands (audit, critique, polish, bolder, quieter), 2 modes (brand vs product), 59 deterministic detector rules, CLI installer, browser extension | Polish + ecosystem: website, CLI, docs, extension |
| **reimagine-it** (Kayforkind) | ~5 stars, ~1 fork | Content-derived design — reads source, builds palette/motif/motion from content | **Only skill that derives design from source content** — unique moat |
| **taste-skill** (leonxlnx) | ~44 ratings, 4.4★ | Audits and upgrades existing websites to premium design standards | Focuses on existing-site redesign |
| **designer-skills** (Owl-Listener) | Niche | 63 skills across 8 plugins, research → handoff workflow | Process-heavy, taste-light |
| **frontend-skill** (OpenAI) | Codex-bundled | Parallel to Anthropic's frontend-design for Codex | Codex-specific |

### What reimagine-it has that none of them do

> **Content-derived design.** Every other skill enforces *generic* design taste (ban Inter, use proper spacing, don't use gradients). reimagine-it reads the actual source file and builds a palette, motif, and motion language from *that content*. A Texas notebook gets navy/red/gold from the Lone Star flag. A restaurant menu gets clay/saffron/smoke from the dish descriptions. No other skill does this.

### What they have that reimagine-it doesn't

| Gap | frontend-design | Impeccable | reimagine-it |
|-----|-----------------|------------|--------------|
| Product website | No (just GitHub) | **Yes** (impeccable.style) | GitHub Pages gallery only |
| CLI installer | Via /plugin | **`npx impeccable install`** | `npx skills add` only |
| Multiple commands | 1 command | **23 commands** | 1 command |
| Deterministic quality checks | No | **59 rules + CLI linter** | Manual verification only |
| Browser extension | No | **Yes** | No |
| Distinct modes | No | **brand vs product** | No |
| Visual test loop | No | **Live mode with Playwright** | No (screenshot scripts exist) |
| Featured in "best skills" roundups | **Yes (all of them)** | **Yes (most)** | No |
| Clear install for all agents | **Yes** | **Yes (12+ agents)** | Partial |
| Community contributions | Few | Growing | None |
| Case study page | No | **Yes (Neo Mirai)** | SHOWCASE.md (Texas-only) |
| Weekly downloads / installs | 277k | Fast-growing | Unknown |

---

## Improvement plan

### Tier 1: Good → Solid (next 2 weeks)

These fix basic product gaps that make the repo look like a weekend project.

#### ✅ 1.1 Product landing page (impeccable.style equivalent) — DONE

`docs/index.html` shipped as a polished product site with hero, 4-step method, case studies, install grid, and embedded playground. Live at [kayforkind.github.io/reimagine-it](https://kayforkind.github.io/reimagine-it/).

#### ✅ 1.2 Proper CLI installer — DONE

`npx reimagine-it` ships as a standalone npm package. Reads HTML, extracts content, generates all 10 tokens. Supports `--seed`, `--json`, `--dry`, `--list`, stdin piping. No agent required.

#### 1.3 Get featured in skills roundups — IN PROGRESS

`SHOW-HN.md` and `SUBMISSIONS.md` drafted for 6 platforms.

#### ✅ 1.4 Metrics badge on README — DONE

CI status badge, version badge, license badge, and 5 platform badges on README.

#### ✅ 1.5 Diverse case studies in SHOWCASE.md — DONE

Three new gold sources (Pulsewave SaaS, Two Lights essay, Saffron & Smoke restaurant) prove the method travels beyond Texas.

#### ✅ 1.6 CI pipeline — DONE

GitHub Actions workflow with 18-check audit, 0 failures, and regression test proving failures are caught.

**Problem:** The repo README is the only entry point. Impeccable has `impeccable.style` — a dedicated product site with documentation, install guide, and case studies.

**Fix:** Ship a polished `docs/` microsite with:
- Static source → signal → artifact illustration with live playground link
- One-command install for every agent tool (Claude Code, Cursor, Codex, Copilot, Gemini, Pi)
- 3 diverse case studies front-loaded (not buried in SHOWCASE.md)
- Embedded playground (already built)
- "How it works" section showing content→palette→motif→motion pipeline
- Link to GitHub Discussions for feedback

#### 1.2 Proper CLI installer

**Problem:** Install is `npx skills add Kayforkind/reimagine-it` — bare bones. Impeccable has `npx impeccable install` that detects your agent tools and installs everywhere at once.

**Fix:** Ship a `npx reimagine-it install` CLI that:
- Detects Claude Code, Cursor, Codex, Copilot, Gemini CLI on your machine
- Installs to all of them in one command
- Shows what was installed and where
- Offers `--global` flag for global install
- Shows `/reimagine-it` usage examples after install

#### 1.3 Get featured in skills roundups

**Problem:** Zero mentions in the roundups that drive 277k installs for frontend-design.

**Fix (outreach):**
- Submit to composio.dev's "Top Design Skills" list
- Submit to Firecrawl's "Best Claude Code Skills" list
- Submit to the "awesome-agent-skills" curated GitHub repo
- Submit to skills.sh marketplace
- Submit to Cursor Directory
- Post on r/ClaudeCode, r/cursor, r/ChatGPTCoding with static before/after proof and a live playground link
- Reach out to YouTubers who review agent skills (the Impeccable video has good traction)

#### 1.4 Metrics badge on README

**Problem:** No social proof. Every top skill shows install counts, stars, or downloads.

**Fix:** Add badges for:
- `npx skills add` install count (if skills.sh provides analytics)
- GitHub stars
- Version number (already there)
- "Featured in" if any roundups pick it up

#### 1.5 Diverse case studies in SHOWCASE.md

**Problem:** SHOWCASE.md is 377 lines of Texas notebook case studies. The 3 new sources (Pulsewave, Two Lights, Saffron) are relegated to a table.

**Fix:** Expand SHOWCASE.md with full case studies for Pulsewave, Two Lights, and Saffron & Smoke — with the same before/after images, palette/motif/motion/3D notes, and design rationale as the Texas studies. The page should prove the method travels.

---

### Tier 2: Solid → Great (next month)

These add capabilities that close the gap with Impeccable and frontend-design.

#### ✅ 2.1 Multiple commands — DONE (focused sub-skills)

Three focused sub-skills shipped: `audit`, `lock`, `infographic`. Each has its own SKILL.md with frontmatter. Monolithic SKILL.md split per SkillsBench research (+18.6 pts accuracy).

#### ✅ 2.2 Deterministic quality checker (like Impeccable's 59 rules) — DONE

`scripts/audit.py` — 18 deterministic checks across typography, palette, motion, content, structure, and performance. `scripts/audit_all.py` runs the full sweep. CI-ready with `--json` output. Exit codes: 0=clean, 1=warnings, 2=failures.

#### ✅ 2.3 Content-derived vs brand-locked modes — DONE (via `--ref` lock system)

`/reimagine-it lock <path> as <name>` captures design DNA. `--ref <name>` reuses it. Cross-medium translation table included.

#### ✅ 3.1 Named methodology: Content-Derived Design (CDD) — DONE

`docs/MANIFESTO.md` defines CDD as the third path between taste-enforcement (frontend-design, Impeccable) and template-generation (v0.dev, Bolt.new). Includes BibTeX citation block.

#### ✅ 3.2 `npx reimagine-it` standalone CLI (no agent required) — DONE

All 10 tokens, seeded variation, stdin support, `--list`, `--json`, `--dry`. 26 unit tests. Published to npm.

#### Original Tier 2 items still open:

**Problem:** One command (`/reimagine-it`). Impeccable has 23. Users want to do specific things without remembering token combinations.

**Fix:** Add sub-commands as shortcuts:
```
/reimagine-it audit     # Analyze existing page, report what's wrong
/reimagine-it critique  # Design review of current output
/reimagine-it polish    # Final pass on a page already designed
/reimagine-it distill   # Strip a page to its essence
/reimagine-it amplify   # Make a quiet design bolder
/reimagine-it quiet     # Make a bold design calmer
/reimagine-it typeset   # Fix only typography
/reimagine-it palette   # Extract/apply palette from content
/reimagine-it lock      # (already exists) Capture design DNA
```

These are already conceptually covered by the five levers (form/domain/modifier/font/lock) — the sub-commands just make them discoverable.

#### 2.2 Deterministic quality checker (like Impeccable's 59 rules)

**Problem:** Visual verification is manual. Impeccable has 59 deterministic rules (no LLM needed) + a CLI that runs them.

**Fix:** Ship `scripts/audit.py` — a deterministic checker that validates:
- **Typography:** No Inter/Roboto/Arial as the only font; 4 type hierarchy levels present; display ≥ 72px; measure ≤ 65ch
- **Palette:** ≤ 5 colors; contrast ≥ 3:1 for focus rings; no `transition: all`
- **Motion:** Compositor-only (`transform`/`opacity`); no `outline: 0` without replacement; `prefers-reduced-motion` respected
- **Structure:** Hero SVG ≥ 400px; 3D reads in still (rotation ≥ 12°); no lorem/placeholder text; no `<br><br>` spacing
- **Content:** Every plate maps to source anchor; no invented stats; no emoji farm

Run as `python scripts/audit.py gold/webpage/after.html` → pass/fail with line-level diagnostics.

#### 2.3 Two distinct modes: content-derived vs brand-locked

**Problem:** Impeccable splits brand vs product. reimagine-it always derives from content. But sometimes you want to redesign *into* an existing brand.

**Fix:** Add a `--brand` mode:
```
/reimagine-it webpage --brand acme-corp   # Redesign using Acme Corp's existing brand palette/rules
/reimagine-it lock acme-site.html as acme-corp   # (already works)
```
The existing content-derived mode stays the default. Brand mode reads the lock file and applies those constraints *on top of* content-derived structure decisions.

#### 2.4 Visual regression test loop (Playwright)

**Problem:** No automated visual testing. The top skills all have a screenshot→compare→iterate loop.

**Fix:** Ship `scripts/verify.py` that:
- Opens the gold `after.html` in headless Chrome
- Takes a full-page screenshot
- Compares against the reference `after.png` (pixel diff)
- Reports pass/fail with a diff image
- Can be run as a pre-commit hook to prevent regressions

#### 2.5 Community contribution pipeline

**Problem:** CONTRIBUTING.md exists but there are zero external contributions.

**Fix:**
- Add a `gold/submissions/` folder with a template (`before.html`, `after.html`, `notes.md`)
- Add a GitHub Action that runs `python scripts/review_gold.py` on PRs
- Add "good first issue" labels for new domain/modifier/form packs
- Create a discussion category for "Show your gold" with a leaderboard
- Add a `/reimagine-it submit` command that packages a gold into PR-ready format

---

### Tier 3: Great → Legendary (next quarter)

These create an actual moat and make reimagine-it the default design skill.

#### 3.1 Named methodology: "Content-Derived Design" (CDD)

**Problem:** No named philosophy. Superpowers has TDD + plan-first. gstack has Think→Plan→Build→Review→Test→Ship→Reflect. reimagine-it has content-derived design but doesn't name it.

**Fix:** Name the methodology and publish it:

> **Content-Derived Design (CDD):** The source file is the brief. Palette, motif, motion, and 3D are derived from concrete nouns, dates, proper nouns, and color words already in the content. Nothing is hard-coded. Change the source, change the design.

Write a manifesto (`docs/MANIFESTO.md`) explaining CDD with:
- The problem (agents ship mood boards, not designs)
- The principle (content narrows the design — a coffee roaster can't be marine-teal)
- The method (extract anchors → derive palette → pick motif → budget motion → build 3D)
- The proof (5 sources, each with different DNA)
- The craft floor (accessibility, compositor-only motion, visual verification)

This becomes the thing people cite. "Use reimagine-it — it does Content-Derived Design."

#### 3.2 `npx reimagine-it` standalone CLI (no agent required)

**Problem:** You must have an AI agent to use reimagine-it. v0.dev, Bolt.new, and Lovable are web apps. Impeccable still requires an agent.

**Fix:** Build a standalone CLI that runs the skill without an agent:
```bash
npx reimagine-it webpage my-page.html     # Outputs redesigned page
npx reimagine-it infographic report.html  # Outputs infographic poster
npx reimagine-it svg index.html           # Outputs living SVG
npx reimagine-it audit my-page.html       # Deterministic quality check
```

This uses the same content-extraction engine from the playground (already built), but with:
- Full palette derivation (not just the simple playground version)
- WebGL shader generation for cinematic mode
- SVG generation for infographics
- Three.js scene generation for 3js mode
- All craft-floor checks baked in

This is the single biggest growth lever. It removes the "must have Claude Code" gate and opens the tool to everyone.

#### 3.3 MCP server for real-time design feedback

**Problem:** No real-time visual feedback. Impeccable has a live mode and browser extension.

**Fix:** Ship an MCP (Model Context Protocol) server that:
- Watches a directory for HTML files
- On change, screenshots the page and returns a diff against the last screenshot
- Reports craft-floor violations in real time
- Can be invoked by any agent (not just Claude Code)
- Ships as `npx reimagine-it mcp`

This makes reimagine-it a *design infrastructure* tool, not just a skill.

#### 3.4 Content→design dataset for fine-tuning

**Problem:** Every model produces AI slop because they're trained on SaaS templates. reimagine-it's gold outputs (38 HTML files, each with content-derived palette/motif/motion) are a unique training corpus.

**Fix:** Package the gold as a fine-tuning dataset:
```
{source_html, source_text, anchors, palette, motif, motion_budget, output_html}
```
Publish on HuggingFace as `kayforkind/content-derived-design`. This becomes:
- A research artifact cited by design-automation papers
- A training set for anyone building design-capable models
- A permanent moat — your gold becomes the canonical dataset for this approach
- A source of inbound interest from ML researchers

#### 3.5 "Gold per domain" partner program

**Problem:** All gold is from Kayforkind's chosen sources. The method can work on anything.

**Fix:** Launch a program where designers submit gold outputs for new domains:
- Healthcare landing page
- Fintech dashboard
- Music festival site
- Government service page
- E-commerce product page
- Developer documentation
- Non-profit donation page

Each submission adds a domain pack to `references/domains/` plus gold HTML. The submitter gets credited in the README and the pack. Over 6 months, this builds a library of 20+ domains, each with proven gold output — making reimagine-it the most comprehensive design vocabulary in the agent ecosystem.

#### 3.6 Browser extension: "Reimagine this page"

**Problem:** Installing an agent skill is too much friction for casual exploration.

**Fix:** Ship a Chrome/Firefox extension that:
- Adds a "Reimagine" button to the toolbar
- When clicked on any page, extracts the page content
- Runs the content-derived design engine (same as playground + standalone CLI)
- Opens the redesigned version in a new tab
- Lets you toggle between forms: webpage, infographic, svg, simulation
- Has a "Copy as HTML" button

This is the ultimate viral growth loop: someone sees a boring page, clicks "Reimagine", gets a stunning redesign, and shares it.

---

## Priority matrix

| # | Improvement | Effort | Impact | Tier |
|---|-------------|--------|--------|------|
| 1.1 | Product landing page | Medium | High | Good→Solid |
| 1.2 | CLI installer (`npx reimagine-it install`) | Medium | High | Good→Solid |
| 1.3 | Get featured in roundups | Low | Very High | Good→Solid |
| 1.4 | Metrics badges | Low | Medium | Good→Solid |
| 1.5 | Diverse case studies in SHOWCASE | Low | Medium | Good→Solid |
| 2.1 | Multiple commands (audit, critique, etc.) | Medium | High | Solid→Great |
| 2.2 | Deterministic quality checker | High | High | Solid→Great |
| 2.3 | Brand mode (content-derived + brand-locked) | Medium | Medium | Solid→Great |
| 2.4 | Visual regression test loop | Medium | Medium | Solid→Great |
| 2.5 | Community contribution pipeline | Medium | Medium | Solid→Great |
| 3.1 | Named methodology (CDD) + manifesto | Low | Very High | Great→Legendary |
| 3.2 | Standalone CLI (no agent required) | Very High | Very High | Great→Legendary |
| 3.3 | MCP server for real-time feedback | High | High | Great→Legendary |
| 3.4 | Content→design fine-tuning dataset | Medium | High | Great→Legendary |
| 3.5 | Gold per domain partner program | Low | High | Great→Legendary |
| 3.6 | Browser extension | High | Very High | Great→Legendary |

---

## What to do today (highest leverage, lowest effort)

1. **Name the methodology**: "Content-Derived Design" — add it to the README tagline and SKILL.md
2. **Get listed**: Submit to composio.dev top design skills, awesome-agent-skills, and skills.sh
3. **Metrics badge**: Add a "277k installs → be the first 100" badge or similar social proof
4. **Expand SHOWCASE.md**: Full case studies for Pulsewave, Two Lights, Saffron
5. **Add `/reimagine-it audit` command**: The single highest-value sub-command — checks any page against the craft floor

---

## The strategic insight

**reimagine-it's moat is real.** No other skill does content-derived design. Anthropic's frontend-design enforces taste (ban Inter). Impeccable enforces quality (59 rules). Neither reads the source. Neither builds palette from content.

The risk is that the moat is invisible because:
- There's no named methodology people can cite
- There's no standalone tool people can try without an agent
- There's no distribution beyond one GitHub repo
- The showcase is overwhelming (13 Texas studies) instead of compelling (3 diverse sources, front-loaded)

**The fix structure:** Visibility → Trial → Trust → Adoption → Contribution.

- **Visibility:** Named methodology, roundup features, product site
- **Trial:** Browser playground, standalone CLI, browser extension  
- **Trust:** Deterministic quality checker, visual test loop, gold dataset
- **Adoption:** CLI installer, multi-agent support, community pipeline
- **Contribution:** Gold per domain program, Partner submissions, open dataset

---

## Tier 2.5: Research-Backed Improvements (based on August 2026 internet research)

### Sources:
- [OSS Insight: Agent Skills Explosion 2026](https://ossinsight.io/blog/agent-skills-explosion-2026) — 250K stars, 57K AGENTS.md, skills are "transitional"
- [Agentman: Agent Skills Ecosystem Report 2026](https://agentman.ai/blog/agent-skills-ecosystem-report-2026) — 1.17M skills on skills.sh, design is smallest major category
- [SkillsBench academic benchmark](https://skillsbench.ai) — focused skills outperform monolithic by 18.6 pts
- [Impeccable v4 changelog](https://www.chaseai.io/blog/impeccable-4-claude-code-design-skill) — Live Mode, Worlds, Finish Reviewer
- [Stop Writing Agent Skills Like Longer Prompts](https://blog.stackademic.com/stop-writing-agent-skills-like-longer-prompts-cca908b50915) — description is routing code, push deterministic work to scripts

### Key competitive findings:

| Finding | Implication |
|---------|-------------|
| Design is 6th category (25K skills vs 288K dev) — underserved | Less competition; higher visibility per skill |
| SkillsBench: monolithic skills hurt performance by 2.9 pts | Split SKILL.md into focused sub-skills |
| No other design skill derives palette from content | Unique moat still valid |
| Impeccable has 177 Worlds, Live Mode, 20K+ ratings | UX gap is the biggest weakness |
| 1.17M skills on skills.sh — discovery is impossible | Metadata optimization is critical |
| Community calls every AI design "slop" | Content-Derived Design is the fix |
| SkillsBench: curated skills raise pass rates 16.2 pts | Quality bar = competitive advantage |
| 36% of skills have prompt injection / 26% security issues | CI + audit pipeline = trust signal |

### New Tier 2.5 items:

| # | Improvement | Effort | Impact | Section |
|---|-------------|--------|--------|---------|
| 17 | Split monolithic SKILL.md (374 lines) into core + 6 focused sub-skills (per SkillsBench data: +18.6 pts) | Medium | **Very High** | Agent perf |
| 18 | Skills.sh metadata optimization — add trigger_phrases, capabilities, category to SKILL.md frontmatter for 1.17M-skill catalog discoverability | Low | High | Distribution |
| 19 | Create SkillsBench Self-Score badge — evaluate against 12-point academic quality criteria, display on README | Low | Medium | Trust |
| 20 | Design Health GitHub Action — marketplace action running audit.py on committed HTML/PRs | Medium | High | Infrastructure |
| 21 | `/reimagine-it variations N` — show 2–4 content-derived palette/motif alternatives before committing | Medium | Medium | UX |
| 22 | `/reimagine-it reverse-lock <url>` — extract any public site's design DNA into a lock file, then reimagine your content through it | Medium | High | Feature |
| 23 | Live Preview mode in playground — click element, choose bolder/quieter/typeset, see 3 variations, accept one (Impeccable parity) | High | High | UX |
| 24 | "Content Extraction" standalone skill — `/reimagine-it extract` returns palette + motif + anchors without building full redesign (for non-designers: marketers, writers, docs teams) | Low | Medium | Audience |
| 25 | YouTube/tutorial content program — "reimagine-it in 60 seconds" screen capture for distribution to AI coding YouTubers | Low | High | Distribution |
| 26 | GitHub bot for design suggestions on PRs — auto-comments content-derived palette when HTML changes | High | Medium | Virality |

### What to do today (from this research):

1. **Add trigger_phrases to SKILL.md** (10 minutes, #18 above) — the highest-leverage metadata change
2. **Create the Design Health GitHub Action** (1 hour, #20 above) — publish to marketplace
3. **Write Content-Derived Design manifesto** as a standalone markdown file (already in ROADMAP Tier 3, item 3.1) — makes CDD citable
