# Show HN Draft — reimagine-it v2.3

**Title:** Show HN: reimagine-it — an AI agent skill that redesigns any file from its own content (now with standalone CLI)

---

Paste a file. Type `/reimagine-it webpage`. Ship a real artifact — not a mood board.

But you don't even need an agent anymore. **v2.3 ships a standalone CLI:**

```bash
npx reimagine-it -i your-page.html -t infographic
npx reimagine-it -i source.html -t dashboard
npx reimagine-it -i menu.html -t webpage --dry     # preview extraction only
npx reimagine-it -i page.html --json               # JSON extraction results
```

Same Content-Derived Design engine, no agent required. Reads your HTML, extracts concrete nouns / dates / colors, derives a palette, and generates token-specific pages (webpage, infographic, dashboard, artistic, cinematic, photography, landing).

---

**What makes this different from every other design skill:**

The palette, motifs, and motion are all derived from the content — nothing is hard-coded. Point at a Texas notebook → navy/cream/sunset shader from the Lone Star flag. Point at a SaaS page → dark teal + pulse-ring SVG from "traces" and "water balloon." Point at a restaurant menu → warm clay + saffron + smoke-drift from the dishes themselves.

No other design tool does this. Anthropic's frontend-design bans Inter/Roboto. Impeccable has 59 taste-enforcement rules. v0.dev / Bolt.new use generic templates. Only reimagine-it reads YOUR content and builds a design language FROM it.

---

**Five sources, one method, zero templates:**

| Source | Genre | Palette from content | Design move |
|--------|-------|---------------------|-------------|
| Texas notebook | History | Navy / cream / red / gold from the flag | Sunset WebGL shader |
| Jules Ice Cream | Food | Parlor DNA: counter, cone, freezer | Not a Texas reskin |
| Pulsewave | SaaS | Dark teal + `#3ae098` from traces | Pulse-ring SVG + KPI grid |
| Two Lights | Personal essay | Slate + cream + `#c23a2a` from towers | Lighthouse beam sweep animation |
| Saffron & Smoke | Restaurant | Warm clay + saffron + `#5c8a3f` | Smoke-drift + flame-flicker |

All regenerator scripts are in the repo — run `python gold/regenerate_all.py` to reproduce every visual on the page. Nothing is rendered by a third-party service.

---

**Works in Claude Code, Cursor, Codex, Copilot, Gemini CLI:**

```
npx skills add Kayforkind/reimagine-it
/reimagine-it webpage
/reimagine-it infographic
/reimagine-it audit            # 18 deterministic quality checks
/reimagine-it svg              # alive-micro by default
/reimagine-it 3js              # offline Three.js room
/reimagine-it simulation       # playable model of your data
/reimagine-it lock <path> as <name>   # capture design DNA for reuse
```

---

**What's new in v2.3 (today):**

- **Standalone CLI** — `npx reimagine-it` works without any agent
- **Focused sub-skills** — `/reimagine-it audit`, `/reimagine-it lock`, `/reimagine-it infographic` as separate, high-performance agent skills (SkillsBench research: monolithic skills hurt accuracy by 2.9 pts, focused sub-skills improve by 18.6 pts)
- **CI pipeline** — GitHub Actions workflow runs 18 audit checks on all gold HTML (zero failures)
- **Design Health GitHub Action** — add `uses: Kayforkind/reimagine-it@v2.3.0` to gate deploys on design quality (Lighthouse but for visual craft floor)
- **Deterministic audit tool** — `scripts/audit.py` with 18 checks (typography, palette, motion, content, structure, performance), CI-ready with `--json`, no LLM, no API key
- **Content-Derived Design manifesto** — the methodology named, explained, and citable (BibTeX in docs/MANIFESTO.md)
- **Package.json** with `npm test`, `npm run audit`, `npm run regenerate`
- **0 craft-floor failures** across all 31 gold HTML files

---

**Live demo:** [kayforkind.github.io/reimagine-it](https://kayforkind.github.io/reimagine-it/)
**Repo:** [github.com/Kayforkind/reimagine-it](https://github.com/Kayforkind/reimagine-it)
**Audit sweep:** `python scripts/audit_all.py` — 31 files, 0 failures

Three hard guarantees on every output: same-format twin, visual verification pass, craft floor (compositor-only motion, `:focus-visible` rings, no `transition: all`, `prefers-reduced-motion` respected).

Built this over the last week. Would love feedback on what domains/modifiers/forms to build next. The roadmap and market-gaps analysis are in the repo.

Thanks for looking —