# Changelog

All notable changes to reimagine-it.

---

## v2.3.7 (unreleased)

### Feature — playground presets, horizon journey, richer token upgrades

- **"Try it — no install" playground upgrade** — the in-page playground now lists all 16 directions (auto + 15 tokens, including the previously missing `showcase` button and marquee entry) and adds four one-click sample sources (game, café, observability, travel) so visitors can reimagine a real page instantly.
- **New horizon example journey** — `examples/end-users/horizon/` turns a plain observability/SLO page into a navy mission-control dashboard (auto picks `dashboard`): KPI cards with sparklines, donut chart, and scaled bars, plus `gradient` (kinetic headline) and `landing` alternates. It is the 7th entry in the hero cycler and case grid.
- **Token upgrades from the design audit** — photography plates get monogram glyphs; the svg token gets a data strip (donut/bars) when the source has numbers; glass panels get prism accents; the gradient headline gets kinetic gradient-text reveal. Glyph tiles gained a staggered idle float.
- **Fix — percentage metrics now extract** — `99.99%` and `42%`-style numbers never matched the number regex (a trailing `\b` after the non-word `%` char). Switched to a negative lookahead; regression test added. Data-heavy sources now show their real percentages in charts.

### Feature — content-derived art layer in every builder

- **Shared art layer** — the engine now ships inline content-derived graphics in every token: anchor initials become monogram glyph tiles, source numbers become SVG donut charts and horizontal bars, and the palette shades isometric 3D prisms. All SVG, all offline, all deterministic per seed.
- **Wired across all 15 builders** — landing hero art (glyph tiles + floating prism), dashboard signal panels (donut + bars), infographic mix section, gradient card watermarks, glass panel prisms, artistic field glyphs, cinematic opening constellation, motion floating tiles, editorial data pullout, simulation glyph row, webpage hero prism, and showcase capability cards.
- **`showcase` token activated** — it was a half-wired direction: Auto could recommend it, but the engine never registered it, and its implementation sat as dead code inside `gradient()`. It is now a first-class 15th builder (capability cards, timeline, stat counters) with content glyphs replacing the old `#` placeholder icons, and it appears in the token board, gallery chips, README, and audits.
- **Stale audit references fixed** — `audit-tokens.js`, `render-audit.js`, and `build-token-board.py` pointed at the removed `tide-letter` example and capped at 14 tokens; they now use a current example and audit all 15.

### Fix — token tiles show real examples; watermark overlap removed

- **Every token tile now shows its actual output** — the 14 direction cards in the `#tokens` section were text-only. Each card now embeds a real screenshot of that token's generated page (`tokens/<name>-desktop.png`), with a numbered badge on the image corner, so visitors see what each direction produces before clicking.
- **Ghost-numeral overlap removed** — the old cards used an absolutely-positioned 54px watermark (`::before` numeral) that sat on top of the card text and collided with titles on narrow cards. The number now lives in a small pill badge inside the image thumb, and the card body has its own padding.
- **Tiles are clickable** — clicking a tile scrolls to the gallery above and selects that token's desktop + phone previews (and its animated GIF for 3js/motion).

### Fix — landing headline overlap at phone widths; full-bleed exhibit cards

- **Landing token headline no longer collides** — the landing hero forced `h1{max-width:8ch}` with `line-height:.88`, so two-word titles like "Ember & Table" wrapped into two lines that visually overlapped when the phone screenshot was scaled down. Now `max-width:15ch` with `line-height:.96` and a slightly smaller clamp — titles stay on one line down to phone width, verified by pixel-band analysis of the 480px render.
- **Exhibit cards are full-bleed** — the Dribbble-style cards in `examples/end-users/build.py` reserved only a 396×296 browser window (55% × 41% of the 720×720 card) inside thick chrome. The browser window is now 664×559 (92% × 78%) and phone frames 312×570, with `ImageOps.fit` (crop-to-fill) instead of `contain` (letterbox) so the design fills the frame edge-to-edge — no more tiny preview inside a big block. Caption and footer strips verified non-overlapping.
- **Hero cycler shows the full card** — the transform stage was `aspect-ratio:4/4.6` with `object-fit:cover`, cropping the square GIF's sides. Now `1/1` so the complete card is visible.
- Regenerated all four `before-after.gif`, `gallery.gif`, the token board, and the 3js/motion animated GIFs from the fixed engine.

---

## v2.3.6 (current)

### New — CI token audits, data-heavy Auto detection, animated + live gallery

- **CI token audits** — `scripts/audit-tokens.js` (structural: undefined/NaN/empty body/misplaced markup) and `scripts/render-audit.js` (headless Chrome render: visible text, no horizontal overflow, heading) now run as a `token-audit` job in `.github/workflows/audit.yml` on every push touching the engine. `render-audit.js` is self-contained (srcdoc iframes, no server) so it runs on Ubuntu runners and Windows alike.
- **Data-heavy Auto detection** — the infographic token now gets a strong boost when the source has ≥6 measurable facts or is density-`rich`, and the Auto rationale says so explicitly ("The source is data-heavy (N measurable facts)…"). Verified: the field-report source picks infographic; the tide essay still picks editorial.
- **Animated gallery** — the `3js` and `motion` tokens now show looping capture GIFs (`tokens/3js-anim.gif`, `motion-anim.gif`) in the gallery instead of static shots.
- **Live demo** — a "▶ Live demo" toggle renders the current token's output in the browser via the in-page engine, in a scrollable desktop frame and a scrollable phone frame; flip it off to return to the static previews.

## v2.3.5

### New — token gallery upgrades

- **Auto chip** — the gallery now leads with `auto`, showing the scored best-of-three direction (for the showcase source: editorial, score 182), then all 14 tokens.
- **Before / After toggle** — each preview flips to the untouched source with one click (shared `tokens/before-desktop.png` / `before-phone.png`).
- **Infographic showcase section** — a new data-heavy source (`examples/infographic/source.html`, a field-season report with 14 species, 320 miles, 1,180 hours, 42% jump) rendered at wide desktop width and tall phone width, with the source and command documented.
- **Token audit tooling** — `scripts/audit-tokens.js` (structural: undefined/NaN/empty-body/misplaced-markup) and `scripts/render-audit.js` (headless render: visible text, no horizontal overflow, heading present). All 14 tokens pass both.

### Fix — the `webpage` token again (patch over 2.3.4)

2.3.4 shipped a broken `webpage` generator (empty body), fixed in this release. Token gallery added; examples sharpened. See v2.3.4 notes below for the full list.

## v2.3.4

### Fix — `webpage` token shipped an empty page

The `webpage` generator called `page(title, bodyHTML)` but `page(title, css, body, script)` expects the stylesheet as its second argument. The entire markup landed inside the `<style>` tag and `<body>` was the literal string `undefined`. The missing `css` argument is now passed, so the token emits the full page (`<main class="page">`, hero, contents, and sections) again.

### Fix — noisy hero chips and blurry headless rendering

The landing hero's decorative chips used `backdrop-filter: blur(8px)` with no fallback, which rendered as smudges under software rasterization. Removed the blur (the chips keep their solid card look), and the example builder no longer forces `--use-gl=swiftshader`, so headless screenshots use the real GPU path and come out sharp. Phone screenshots also render at 480px (was 430px) for crisper text.

### New — token showcase gallery (wide + tall)

Every one of the 14 tokens now renders at desktop and phone width. The landing page replaces the cramped single-image grid with an interactive gallery — large desktop preview plus a phone preview, 14 selector chips, and prev/next — and ships the individual `docs/tokens/*-desktop.png` / `*-phone.png` shots plus `tokens-board.png` (desktop grid) and `tokens-phone.png` (phone grid).

### Fix — MCP server import paths

The MCP server required SDK subpaths without the `.js` suffix (`@modelcontextprotocol/sdk/server/stdio`, `@modelcontextprotocol/sdk/types`). Against the SDK's exports map (v1.30.0) those resolve to extension-less paths and fail with MODULE_NOT_FOUND, so `npx reimagine-it-mcp` never started. Both imports now use the canonical `.js` subpaths and the server boots and negotiates correctly.

Also: `reimagine-it@2.3.3` is now live on npm, and `NPM_TOKEN` is configured as a repository secret so every future release auto-publishes through the workflow.

## v2.3.3

### New — the remaining generators close the gap

- **webpage** — contents pills light up on hover; section rhythm unchanged and quiet.
- **infographic** — fixed a real bug: the row-entrance animation referenced a `row-in` keyframe that was never defined, so rows never animated. Keyframe added; rows now rise in.
- **photography** — fixed the same bug class: `plate-in` was referenced but undefined; plates now fade in.
- **motion** — ghost step numerals float behind each reveal; the numbered dot pulses on hover.
- **glass** — panels lift, brighten, and glow on hover; the sheen sweep is reactive.
- **simulation** — the active step now gets a glowing ring; the title draws a rule beneath it.
- **showcase** — capability icons scale and tilt on hover.

### Case-study bundles

- Every end-user example now ships a **CASE_STUDY.md** with the exact command, Auto rationale, score, fidelity %, alternatives, and GIF proof.
- New **docs/CASE_STUDIES.md** index table links all four bundles; linked from the README and the Pages landing page.
- The publish workflow's npm step was verified: it validates green but skips publication until `secrets.NPM_TOKEN` is configured in the repository.

## v2.3.2

### New — Dribbble-grade design engine

- **Premium shared shell for every token.** All nine generators now sit on one polished craft floor: a subtle film-grain overlay, a scroll-progress bar in the accent color, a tinted scrollbar, deduplicated `@property` tokens, and View Transitions — so every page feels finished, not templated.
- **Landing token redesigned.** Dribbble-style hero with an animated art panel — a breathing gradient core, orbiting dashed ring, drifting glow, and floating content chips — plus a scrolling keyword marquee and a crisp headline treatment (the old blur veil that dimmed titles is gone).
- **Dashboard token refined.** Ambient accent glow at the top of the viewport, a pulsing "live" dot in the header, gradient-sheen metric cards that lift with an accent glow on hover, glowing sparklines, and scroll-driven entrance animations (previously referenced but never defined).

### Data honesty — the extractor stops fabricating

- Bare 2+ digit numbers (phone fragments, IDs, hours like `09:00` or `18`) are no longer treated as facts. Only unit-qualified numbers survive — `142 ms`, `27 users`, `$29`, `12 miles` — so output pages never invent metrics.
- Infographic rows no longer show fake `anchor signal` values; a number appears only when it literally occurs in that section's text, otherwise bars honestly show relative section length.
- `showcase` no longer invents numeric captions when the source has none.

### Auto — smarter, non-repetitive token selection

- `webpage` was scored three times in the selection loop and won almost every text-heavy job; it is now scored once.
- `dashboard` requires operational language (uptime, latency, deploy, traffic) instead of winning on generic words like "users".
- Routing now produces structurally distinct outputs for similar-looking jobs: release-ops pages → `dashboard`, menus → `landing`, essays → `editorial`, stories → `cinematic`.

### Housekeeping

- Removed stale tracked `auto-options/` build artifacts no script produces.
- Version bumped to 2.3.3 across package, extension manifest, plugin manifests, skill frontmatter, and README badge/pin.

## v2.3.2

### New

- **MCP server** (`mcp/server.js`): exposes reimagine-it as Model Context Protocol tools — `reimagine`, `extract_content`, `list_tokens`, `audit_html`. Any MCP-compatible agent can call reimagine-it without installing the full skill. Run with `npx reimagine-it-mcp`.
- **Browser extension** (`extension/`): Chrome/Edge/Firefox extension that adds a toolbar button to reimagine any web page. Extracts content in-browser, generates a redesigned page, opens it in a new tab. No server, no API. 8 tokens supported.

## v2.3.1

### Fixes

- **CLI infographic and dashboard generators had no CSS.** Both tokens output class-based HTML (`.poster`, `.chart`, `.bar`, `.dashboard`, `.kpi-card`, etc.) but the `<style>` block only contained `:root` and accessibility rules. Pages rendered completely unstyled. Added full CSS for all classes in both generators.
- **CLI title extraction.** The extractor fell back to the filename (`before`) instead of deriving a title from `<h1>` content. Now reads `<h1>` before falling back.
- **CLI creative variation.** Same source + token without `--seed` produced identical output every run. Added a seeded PRNG (mulberry32) with three creative axes: anchor shuffle, palette rotation, vibe selection. `--seed 42` reproduces; no seed = fresh each run.
- **Palette consistency.** The `artistic`, `cinematic`, and `photography` generators used the un-rotated palette instead of the rotated one, ignoring the creative variation engine. All generators now use the rotated palette.
- **CI: `publish-action.yml` YAML parse failure.** The release-notes heredoc body was written flush-left inside the `run: |` block, terminating the YAML block scalar early. Rewrote both fragile steps as properly-indented `python - <<'PYEOF'` blocks.
- **CI: PyYAML missing on runner.** The validate step imported `yaml` but `setup-python` does not include PyYAML. Added `pip install pyyaml`.
- **CI: audit smoke step killed by `set -e`.** `audit_all.py`'s exit code 1 (warnings-only) aborted the script before the failure threshold check could run. Wrapped with `set +e` and `PIPESTATUS[0]`.
- **CI: audit workflow exit-code masking.** The audit step piped `audit_all.py` through `tee` and read `$?` (tee's exit code), masking real craft-floor failures. Now captures `PIPESTATUS[0]`.
- **CI: deprecated Node 20 actions.** All three workflows bumped to `checkout@v5`, `setup-python@v6`, `setup-node@v6`.
- **`.npmignore`: removed stale `.npmrc` reference** (file does not exist in the repo).

---

## v2.3

**Ship date:** August 2026

### What's new

- **Infographic pack rewritten.** The infographic domain is now a statistical poster of an argument — common-scale encodings, ISOTYPE unit counts, custom glyphs, lossless data table. Explicit guardrail: not a CV, not an AntV template clone. No pies, donuts, gauges, 3D, or fabricated KPIs (Cleveland–McGill / Neurath ISOTYPE floor).
- **Guardrail gold added for Jules.** Second-source infographic poster (6-flavor sequence, star-around-cone, 8 mint tubs) proves the infographic method travels.
- **Motion strip regenerated** to include infographic pack (Lone Star pulse + bluebonnet sway on the paper board).
- **Audit tool:** `scripts/audit.py` — 18 deterministic quality checks across typography, palette, motion, content, structure, and performance. No LLM, no API key. CI-ready with `--json` output and exit codes.
- **Product landing page:** `docs/index.html` rewritten as a polished product site with hero, 4-step method, expanded install grid, and embedded playground.
- **Three new gold sources** proving the method travels beyond Texas: Pulsewave (SaaS), Two Lights (personal essay), Saffron & Smoke (restaurant menu).
- **README rewrite:** from 632-line dissertation to 249-line pitch with 6 inline visuals, above-the-fold install command, and prominent playground link.
- **SKILL.md description** tightened to a routing rule ("Content-Derived Design") instead of a feature list.
- **Submissions drafted** for skills.sh, composio.dev, awesome-agent-skills, Cursor Directory, and Firecrawl.

### Roadmap

See [ROADMAP.md](ROADMAP.md) for the full good→great→legendary plan.

---

## v2.2

**Ship date:** Summer 2026

### What's new

- **Three hard guarantees** now enforced on every render:
  1. **Same-format twin by default.** Point at a distributable file (`.pdf`, `.docx`, `.pptx`, `.mobi`, `.epub`, `.md`) and get two artifacts: companion HTML + same-format twin.
  2. **Visual verification pass.** Hero rendered to image and manually scanned for blank plates, placeholders, clipped text, broken SVGs, off-palette accents, fabricated content, dead motion, and unmapped plates.
  3. **Craft floor on every webpage output.** Focus ring contrast ≥ 3:1, `::selection` on-palette, compositor-only motion, `prefers-reduced-motion` respected by decomposing, no `transition: all`, no `outline: 0` without replacement, scroll-driven animations, Core Web Vitals sane.

- **Creative engine sampling seven axes:** reader register, ground/palette weighting, hero move, plate style, motion budget, type accent, 3D signature. Three visibly different reader registers from the same `/reimagine-it webpage` command.

- **`--seed` and `--variant`** for reproducibility. `--variant a` → Draw A (dashboard-live), `--variant b` → Draw B (field-guide-quiet), `--variant c` → Draw C (cinematic-shader).

- **Draw C (cinematic-shader register):** full-bleed WebGL2 west-Texas sunset shader, kinetic serif wordmark, scroll-driven plate rise, click-to-spin Lone Star. Ships the full v2.2 craft floor.

- **Motion strip** proving every animation claim with three frames per pack spaced ~1.6 s apart.

- **Jules Ice Cream second source:** parlor DNA — counter, cone, freezer — proving the method travels.

- **Lock system:** `/reimagine-it lock <path> as <name>` extracts design DNA into a portable markdown pack. Cross-medium translation table included.

- **150+ source research pack** (`references/research/web-craft-2025.md`): Awwwards SOTY nominee stack, Rauno/Emil craft floor, Lupi/Fragapane data humanism, Feixen/Weingart/Troxler print grammar, Apple AIDA cinematic, view-transitions, scroll-driven animations, kinetic type, sound, neubrutalism.

---

## v2.1

**Ship date:** Spring 2026

- **Domain packs:** artistic, cinematic, dashboard, photography, ecommerce, landing, portfolio.
- **Modifier packs:** glassmorphism, bento, neon. (brutalism, neumorphism, handdrawn — spec-only stubs.)
- **Form packs:** SVG (alive-micro by default), Three.js (offline vendored r185), simulation (playable clock).
- **Webpage craft spine** with non-negotiables: grid + baseline rhythm, 4-level type hierarchy, ≤ 5 colors from source, hero SVG ≥ 400px, 3D that reads in a still, one make-strange move.
- **Kill list** codified: no gradient backgrounds, no emoji farms, no "Trusted by" logo strips, no whole-page receipt templates, no infographic as default-webpage hero.
- **Gallery page:** `docs/index.html` with live tile links to gold HTML files.
- **Regeneration scripts:** `gold/shots.py`, `gold/compare.py`, `gold/gallery.py`, `gold/domains/motion-run.py`.

---

## v2.0

**Ship date:** Early 2026

- **Initial public release.** Core `/reimagine-it` command supporting webpage, infographic, SVG, and simulation forms.
- **Content-derived design method:** extract anchors → derive palette → pick motif → budget motion → build 3D → verify.
- **Texas notebook gold:** default spine + dashboard + artistic + photography domains, each with before.html, after.html, and regenerator.
- **Three.js gold:** offline room with orbit controls, vendored r185.
- **SVG gold:** living weenie with micro-motion (star breathe, river flow, pin ping).
- **Simulation gold:** playable year-clock of the Texas source, paused on 1836.
- **Form router** with progressive disclosure: `references/forms.md`, `references/notes.md`, `references/webpage-craft.md`.
- **Agent Skills spec compliant:** `SKILL.md` with YAML frontmatter, progressive disclosure, hosts list.
- **Plugin wrappers** for Claude Code, Cursor, Codex, Factory Droid.