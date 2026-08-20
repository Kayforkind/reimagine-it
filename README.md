# reimagine-it

[![license MIT](https://img.shields.io/badge/license-MIT-1e5c4d.svg)](LICENSE) [![agentskills.io spec](https://img.shields.io/badge/agentskills.io-spec-7ee0c0.svg)](https://agentskills.io/specification) [![suite passing](https://img.shields.io/badge/gold%2Ffive-13%20runs%2C%200%20failed-7ee0c0.svg)](gold/five/RESULTS.md) [![version 2.0](https://img.shields.io/badge/version-2.0-7cf3ff.svg)](skills/reimagine-it/SKILL.md)

> Open a creative mind on **any thing** the user points at — a webpage, a PDF, a document, a deck, a CLI, a protocol, an experiment, prose — and ship a leap they did not know to ask for. Same brief, radically different output per token. All shots below rendered locally from real `.html` files in this repo. No third-party service, no CDN, no paid API.

![one brief, eight outputs: default, artistic, dashboard, photography, cinematic, cinematic+glassmorphism, dashboard+bento, landing+neon](gold/gallery.png)

```
/reimagine-it webpage                                        <- default (top-left)
/reimagine-it webpage artistic
/reimagine-it webpage dashboard
/reimagine-it webpage photography
/reimagine-it webpage cinematic                              <- WebGL2 shader hero
/reimagine-it webpage cinematic glassmorphism                <- modifier stacks on domain
/reimagine-it webpage dashboard bento
/reimagine-it webpage landing   neon
```

Re-shoot the gallery: `python gold/gallery.py`.

---

## Install

```bash
npx skills add kazimrmerchant/reimagine-it            # in one project
npx skills add kazimrmerchant/reimagine-it -g          # global (Cursor, Claude Code, ...)
```

Then say `/reimagine-it` (with or without tokens) in your host.

---

## The five levers

| Lever | Syntax | Effect |
|-------|--------|--------|
| **Form** | `/reimagine-it webpage` / `pdf` / `slides` / `document` / `code` / `cli` / `protocol` / ... | Force the medium. |
| **Domain** | `/reimagine-it webpage artistic` (or `dashboard`, `photography`, `cinematic`, `ecommerce`, `landing`, `portfolio`) | Force the aesthetic. Pack in [`references/domains/`](skills/reimagine-it/references/domains/) extends the spine. |
| **Modifier** | `/reimagine-it webpage cinematic glassmorphism` (or `bento`, `neon`, `brutalism`, `neumorphism`, `handdrawn`) | Layer a UI/UX modifier. Composes with any domain. Pack in [`references/modifiers/`](skills/reimagine-it/references/modifiers/). |
| **Font** | `--font "Playfair Display, Iowan Old Style, Georgia, serif"` | Pin the display / body family. Full stack, no webfont fetch unless `--allow-fetch`. |
| **Lock** | `/reimagine-it lock <path> as <name>` + later `--ref <name>` | Capture design DNA (palette, type, motifs, motion, 3D) and reuse it — even across media (webpage → slides). |

Compose freely: `/reimagine-it webpage artistic glassmorphism --font "Playfair Display, serif" --ref house-cinema`.

---

## Domains — same brief, different aesthetic

Every hero below is a real `.html` file in `gold/`. Open one, double-click it, screenshot it — the pixels in this README come out of exactly that.

### Default spine (no domain)

Sober designed page. Grid + baseline + palette cap + one motif + one make-strange move. `/reimagine-it webpage` on a plain page:

![before: plain html - after: designed page](gold/webpage/compare.png)

Source: [`gold/webpage/before.html`](gold/webpage/before.html) vs [`gold/webpage/after.html`](gold/webpage/after.html). Reshoot: `python gold/webpage/run.py`.

### `artistic` — cream, italic serif, drifting arcs, real 3D card fan

![artistic pack full hero](gold/domains/artistic/hero.png)

Kinetic italic ampersand sways ±3°. Hero-scale drifting SVG arcs behind the type. Cards fan at real ±16° with a 40 px drop-shadow — depth reads in a still, not just on hover. [`gold/domains/artistic/after.html`](gold/domains/artistic/after.html).

### `dashboard` — operator grid, KPI tiles, live SVG chart, terminal

![dashboard pack full hero](gold/domains/dashboard/hero.png)

Faint 32 px operator grid on the body. KPI tiles across the top. Live SVG traffic chart with a rising bar animation and pulsing accent dot. Status pills. Blinking-caret terminal card. [`gold/domains/dashboard/after.html`](gold/domains/dashboard/after.html).

### `photography` — magazine folio, SVG plates, dropcaps

![photography pack full hero](gold/domains/photography/hero.png)

Didot-scale italic-then-caps nameplate. Numbered plate strip. Three real SVG "photographs" (not stock). Dropcap paragraphs. Deliberately quiet motion — a folio doesn't twitch. [`gold/domains/photography/after.html`](gold/domains/photography/after.html).

### `cinematic` — inline WebGL2 shader hero, no CDN, single file

![cinematic pack full hero](gold/domains/cinematic/hero.png)

Inline `<canvas>` + inline fragment shader in a `<script type="x-shader/x-fragment">` block. No CDN, no `import` from `https://`, no vendor folder. Masthead sits *on top* of the shader with `mix-blend-mode: difference` so the type reads over any color the field draws. Cards below the hero fan in real 3D (`perspective:1400px`, outer cards `rotateY(±9deg) translateZ(-8px)`, middle card `translateZ(30px)` with a 60 px drop-shadow). [`gold/domains/cinematic/after.html`](gold/domains/cinematic/after.html). Aliases: `3d`, `webgl`.

---

## Modifiers — layer a UI/UX style on any domain

Modifiers **compose** on top of any domain pack. They waive matching cut-list entries (so glassmorphism is finally legal) and add their own non-negotiables (real substrate, two blur tiers, light-source-consistent borders, etc.).

### `cinematic` + `glassmorphism` — two blur tiers over a running shader

![cinematic + glassmorphism: WebGL2 shader visible through two glass tiers](gold/modifiers/cinematic-glassmorphism/hero.png)

The WebGL2 shader from the cinematic pack keeps running. Glassmorphism layers a **front tier** (14 px blur) over the masthead area and a **deep tier** (24 px blur, top-right) over the "Piece 03" tile. Both panels have light-source-consistent borders (bright top-left inset, dark bottom-right inset) and colored `box-shadow`s (beam-tinted under the deep tier, warm under the front). Blur **reveals** the substrate; it never covers a solid color. [`gold/modifiers/cinematic-glassmorphism/after.html`](gold/modifiers/cinematic-glassmorphism/after.html).

### `dashboard` + `bento` — named-cell grid, hero tile 2x2 elevated

![dashboard + bento: nine tiles, hero tile 2x2 elevated](gold/modifiers/dashboard-bento/hero.png)

CSS Grid with `grid-template-areas: "brand brand hours state" "hero hero chart chart" "hero hero latency logs" "stack stack incidents incidents"`. Nine tiles, unequal but shared chrome (same radius, border, padding). Hero tile visibly elevated (`translateZ(24px)` + 40 px shadow). One idea per tile: hours are a value, state is a pill, chart is a chart, latency is a number+bar, logs is a stream, incidents is a list. [`gold/modifiers/dashboard-bento/after.html`](gold/modifiers/dashboard-bento/after.html).

### `landing` + `neon` — one glowing accent doing all the work

![landing + neon: one glowing cyan accent, kinetic italic type, vignette ground](gold/modifiers/landing-neon/hero.png)

Dark void ground with a single radial-gradient vignette. **One** high-chroma accent (`#7cf3ff`) doing every emotional job: the italic *artifact* word (kinetic — pulses letter-spacing on a 4 s cycle), the orbital SVG that draws itself on load, the CTA border, the blinking cursor. Glow via double `drop-shadow(0 0 12px)` + `drop-shadow(0 0 24px)`. Everything else stays quiet so the accent reads as light in a room. [`gold/modifiers/landing-neon/after.html`](gold/modifiers/landing-neon/after.html).

### More modifiers — specs shipped, gold to follow

`brutalism`, `neumorphism`, `handdrawn` ship as spec-only checklists in [`references/modifiers/`](skills/reimagine-it/references/modifiers/) for v2.1.

---

## Motion is real (three frames per pack)

Screenshots freeze animation, so every claim about motion has to prove itself in a strip. Three frames per pack, spaced ~1.6 s apart in virtual time — if the pixels change frame to frame, the motion budget landed:

![motion strip: four packs, three frames each](gold/domains/motion-strip.png)

- **cinematic** — the WebGL2 raymarch field evolves visibly frame to frame (shader tint + interference bands running).
- **artistic** — the italic ampersand sways ±3°; you can see it lean.
- **dashboard** — chart bars rise into place between frames.
- **photography** — deliberately still.

Reshoot the motion strip: `python gold/domains/motion-run.py`.

---

## Every webpage output must land three things — and prove them in a still

Non-negotiable, enforced by the [spine](skills/reimagine-it/references/webpage-craft.md):

1. **Hero-scale inline SVG doing real work** — ≥ 400 px on the longest side, encoding real content (values, geometry, path). Placeholder icons do not count.
2. **Three moving elements at any moment** — one persistent (drift, sway, breathe), one active on state (hover, focus), one narrative (bar rising, path drawing, sweep line). Two stills 500 ms apart must show visible change.
3. **3D that reads in a still** — rotation ≥ 12° **and** shadow blur ≥ 24 px, or `translateZ` ≥ 30 px with a real box-shadow, or inline WebGL2 for `cinematic`.

If a screenshot can't prove all three, the redesign didn't earn `/reimagine-it webpage`.

---

## Not just webpages — PDF · document · slides · anything

Point at any file. Force any output:

| Token | Pack | Regenerator |
|-------|------|-------------|
| `pdf` | [forms/pdf.md](skills/reimagine-it/references/forms/pdf.md) | Weasyprint (HTML → PDF) or ReportLab (print-native Python) |
| `document` / `docx` / `md` | [forms/document.md](skills/reimagine-it/references/forms/document.md) | python-docx, pandoc, or LaTeX |
| `slides` / `pptx` / `deck` | [forms/slides.md](skills/reimagine-it/references/forms/slides.md) | python-pptx or reveal.js (HTML deck) |
| `universal` | [forms/universal.md](skills/reimagine-it/references/forms/universal.md) | Detects file type, dispatches, or writes a companion overlay |

Every non-web form pack keeps the same bar: cover magnet, one data-driven plate, one repeating motif, one make-strange move, real content from *your* file. All regenerators are free, offline, and locally installable.

---

## Lock — capture a shipped design, reuse it anywhere

Once a design lands, save its DNA:

```
/reimagine-it lock gold/domains/cinematic/after.html as house-cinema
```

The skill extracts palette + type stack + motifs + motion signatures + 3D signatures + section structure into a markdown pack under [`references/locks/`](skills/reimagine-it/references/locks/). Example lock: [`house-cinema.md`](skills/reimagine-it/references/locks/house-cinema.md).

Apply a lock to a new target — **same medium or a different one**:

```
/reimagine-it webpage --ref house-cinema
/reimagine-it slides  --ref house-cinema
/reimagine-it pdf     --ref house-cinema
```

Locks include a **cross-medium translation table** so a webpage lock can inform a slides deck or a PDF (a webpage's `rotateY(9deg) translateZ(-8px)` card becomes a pptx panel with paired shadows; a WebGL shader hero becomes a snapshot PNG cover). Locks are portable text — share via gist, commit, or copy-paste.

---

## Tested (5)

Live captures, not stories. Suite exit `0` (`failed=0`). Re-run: `python gold/five/run.py`. Every SVG under every example — the suite badge here, the pipe under §1, the door under §2, the skyline under §3, the layer graph under §4 — is rewritten by that same run from the row it captured.

![suite results, 13 runs 0 failed](gold/five/RUN.svg)

### 1. CLI stdin — `/reimagine-it cli`
Pipe into a file-only CLI (before), then `--stdin` (after). Empty stdin still fails.

![cli stdin: before exit 2, after exit 0, empty stdin still fails](gold/five/01-cli/pipe.svg)

### 2. First-run door — `/reimagine-it demo`
Lecture (before). Same checker red until `door.example` is copied, then green.

![first-run door: locked exit 1, then open exit 0](gold/five/02-door/door.svg)

### 3. Ledger skyline — `/reimagine-it infographic`
Same three JSONL titles: dump (before), then `index.html` contains all three (after).

![three PRs as a skyline](gold/five/03-ledger/index.svg)

### 4. Layer law — `/reimagine-it architecture`
`check.py` red on `pkg_a.internal`, green after `pkg_a.public`.

![layer law: fail on pkg_a.internal, held on pkg_a.public](gold/five/04-layers/layers.svg)

### 5. This repo gold — `/reimagine-it`

```text
$ python gold/reimagine.py --fail   # exit 1 — vibe list
$ python gold/reimagine.py --ship   # exit 0 — gold/shipped.json
```

```json
{
  "reimagined": "shipped",
  "mode": "reimagine-it",
  "about": "A stranger sees a vibe list die, then the same context as one proving command.",
  "hero": "gold/reimagine.py --ship",
  "stretch": "npx skills add kazimrmerchant/skill-slice --skill reimagine-it",
  "verified": "this command exits 0; gold/reimagine.py --fail exits 1"
}
```

---

## Try locally

```powershell
git clone https://github.com/kazimrmerchant/reimagine-it.git
cd reimagine-it
python gold/reimagine.py            # exit 1 - vibe list
python gold/reimagine.py --ship     # exit 0 - gold/shipped.json
./gold/test_reimagine.ps1           # full smoke test
python gold/gallery.py              # reshoot every hero + master gallery
```

Or open [`gold/index.html`](gold/index.html). That is the door, not a lecture.

---

## How the skill decides

![how /reimagine-it decides](docs/flow.svg)

1. Sniffs the repo and thread (does not stall for a brief).
2. Names the **adjacent possible** — a combination of spare parts already here.
3. Picks four private notes (device · leap · craft · effect) and **one** SCAMPER letter.
4. Routes a **form** from context, unless you forced a category.
5. Layers **domain**, **modifier**, **font**, and **--ref** on top if you passed them.
6. Ships an **artifact** you can run, open, or keep. Always names a **stretch**.

Interview is **optional**. You opt in with `interview`. The agent decides the questions (one at a time, with a recommended answer). Default is no interview.

---

## All tokens

| You type | Meaning |
|----------|---------|
| `/reimagine-it` | Infer and build |
| `/reimagine-it interview` | Talk, then build |
| `/reimagine-it code` `cli` `protocol` `demo` `prose` `product` `architecture` `experiment` | Force a form family |
| `/reimagine-it svg` `3js` `infographic` `canvas` `html` `webpage` | Force a visual form |
| `/reimagine-it pdf` `document` `slides` `universal` | Force a non-web form |
| `/reimagine-it webpage <domain>` | Force a webpage aesthetic |
| `/reimagine-it webpage <domain> <modifier>` | Layer a UI/UX modifier |
| `/reimagine-it webpage ... --font "family, fallback, generic"` | Pin the display / body family |
| `/reimagine-it webpage ... --ref <lock-name>` | Apply a saved design DNA |
| `/reimagine-it lock <path> [as <name>]` | Save a shipped output as a reusable lock |
| `/reimagine-it --list-refs` | Print available locks |
| `/reimagine-it forget <name>` | Remove a lock |
| `/reimagine-it --notes` | Include the four notes in the report |
| `/reimagine-it --plan-only` | Lock + notes + form; no files |
| `/reimagine-it --full` | Plus-pass after the hero (one mutation, no restart) |
| `/reimagine-it --variants N` | Produce N distinct outputs from the same brief |
| Any combination | Combine freely: `/reimagine-it webpage cinematic glassmorphism --font "Inter, sans-serif"` |

---

## Install without the CLI

Copy **one** folder. The skill directory name must stay `reimagine-it`.

```powershell
git clone https://github.com/kazimrmerchant/reimagine-it.git
Copy-Item -Recurse .\reimagine-it\skills\reimagine-it $env:USERPROFILE\.cursor\skills\
```

Other hosts: copy `skills/reimagine-it/` into that product's skills root (`SKILL.md` required). Never install into `~/.cursor/skills-cursor/` (Cursor-managed built-ins).

Optional Cursor slash: copy `commands/reimagine-it.md` into `~/.cursor/commands/`.

---

## What this is not

- Not a brainstorm list or a mood-word grill
- Not [grill-me](https://github.com/mattpocock/skills) (that is a feasibility interview)
- Not `/better` (quality pass on an existing deliverable)
- Not "make it pop" / wow-factor as a strategy
- Not an image generator unless you explicitly ask your host for that

---

## What v2 ships (and what's staged for v2.1)

**Ships in v2.0** (this release):

- Rename from earlier `awe-me` project name → `reimagine-it` across every file, path, and command
- Three modifier packs: `glassmorphism`, `bento`, `neon` (full packs with cut-list waivers, motion budgets, 3D + palette contributions)
- Font override via `--font`
- Lock system + `house-cinema` example lock with cross-medium translation table
- Non-web form packs: `pdf`, `document`, `slides`, `universal`
- Tightened spine: SVG + motion + 3D must read in a still
- WebGL2 `cinematic` domain + motion-strip proof
- Master `gold/gallery.py` renderer producing one hero PNG per pack plus a composite

**Staged for v2.1** (specs live in this repo; gold to follow):

- Full gold examples for `pdf` (ReportLab pipeline) and `slides` (python-pptx pipeline)
- Fuller `brutalism` / `neumorphism` / `handdrawn` modifier packs
- `--variants N` implementation (spec is in SKILL.md; gold is the missing piece)
- Automated extractor for `/reimagine-it lock <path>` (currently the lock format is hand-authored)

**Challenge lined up for v2.2:**

- Live preview server (`python gold/serve.py` → hot-reload the redesigned file)
- Palette extraction from a user-supplied logo (feed a hex into any domain pack)
- Lock export as Tailwind config / design tokens JSON / Figma-compatible file
- Team locks in `~/.reimagine-it/locks/` with a share URL

---

## Layout

```
skills/reimagine-it/                              # the skill (copy this folder)
skills/reimagine-it/SKILL.md
skills/reimagine-it/references/webpage-craft.md   # non-negotiable webpage spine
skills/reimagine-it/references/domains/           # per-domain packs
skills/reimagine-it/references/modifiers/         # per-modifier packs (glassmorphism, bento, neon, ...)
skills/reimagine-it/references/forms/             # non-web form packs (pdf, document, slides, universal)
skills/reimagine-it/references/locks/             # saved design-DNA packs (house-cinema, ...)
skills/reimagine-it/references/notes.md           # note bank (device, leap, craft, effect)
skills/reimagine-it/examples.md                   # example prompts + hero paths

gold/gallery.py                                   # master renderer: one hero per pack + composite
gold/gallery.png                                  # 2x4 composite embedded at the top of the README
gold/reimagine.py                                 # reverse demo: --fail exits 1, --ship ships
gold/hero.svg                                     # the metaphor (before/after)
gold/index.html                                   # the door, not a lecture

gold/webpage/                                     # default spine (before/after + compare + hero)
gold/domains/                                     # per-domain golds
gold/domains/strip.png                            # 4-pack still strip
gold/domains/motion-strip.png                     # 4-pack motion strip (3 frames each)
gold/domains/*/hero.png                           # per-domain full hero (rendered by gallery.py)
gold/domains/cinematic/after.html                 # inline WebGL2 shader hero, no CDN
gold/modifiers/                                   # domain + modifier compositions
gold/modifiers/cinematic-glassmorphism/           # WebGL2 + two glass tiers
gold/modifiers/dashboard-bento/                   # named-cell bento grid, hero tile 2x2
gold/modifiers/landing-neon/                      # one accent, kinetic type, vignette
gold/five/                                        # five tested fixtures (python gold/five/run.py)

docs/flow.svg                                     # how /reimagine-it decides
commands/reimagine-it.md                          # optional Cursor slash file
test/pipeline/                                    # fresh-subagent proof: skill-only, no gold peek
AGENTS.md · NOTICE · LICENSE
```

Every visual in this README is a real `.png` or `.svg` in this repo, regenerated locally by `python gold/gallery.py`, `python gold/five/run.py`, `python gold/domains/run.py`, or `python gold/domains/motion-run.py`. Nothing rendered by a third-party service.

Spec: [agentskills.io](https://agentskills.io/specification). Progressive disclosure: description is the trigger; body loads when the task matches; `references/` load on demand.

---

## Lineage (methods, not a brand)

Make-strange (Shklovsky, 1917). Adjacent possible (Kauffman; Johnson). SCAMPER (Eberle after Osborn). Vastness + accommodation (Keltner & Haidt). Peak–end. Disney plussing. Pixar-shaped notes. Effect-before-method as craft. See [NOTICE](NOTICE).

## License

MIT. See [LICENSE](LICENSE).
