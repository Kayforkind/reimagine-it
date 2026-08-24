# Changelog

All notable changes to reimagine-it.

---

## v2.3.1 (current)

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