# reimagine-it

[![license MIT](https://img.shields.io/badge/license-MIT-1e5c4d.svg)](LICENSE) [![agentskills.io spec](https://img.shields.io/badge/agentskills.io-spec-7ee0c0.svg)](https://agentskills.io/specification) [![suite passing](https://img.shields.io/badge/gold%2Ffive-13%20runs%2C%200%20failed-7ee0c0.svg)](gold/five/RESULTS.md) [![version 2.0](https://img.shields.io/badge/version-2.0-7cf3ff.svg)](skills/reimagine-it/SKILL.md)

![before a vibe list, after a shipped artifact](gold/hero.svg)

An [Agent Skill](https://agentskills.io) that opens a **creative mind** on the current thing — a webpage, a PDF, a document, a deck, a CLI, a protocol, an experiment, prose — and ships a leap the user did not know to ask for.

Not a graphics mode. Not `/better`. Not a brainstorm list. `/reimagine-it` reimagines whatever the user points at, in whatever medium that thing lives in.

```bash
npx skills add kazimrmerchant/reimagine-it
```

Global install (Cursor, Claude Code, and other hosts the CLI knows):

```bash
npx skills add kazimrmerchant/reimagine-it -g
```

Then say `/reimagine-it` (with or without tokens).

## In one command

Take a plain user page. Run `/reimagine-it webpage`. Same words. Same three projects. Same email. One command later:

![before: plain html - after: designed page](gold/webpage/compare.png)

Both files live in [`gold/webpage/`](gold/webpage/) so you can double-click them. Re-shoot: `python gold/webpage/run.py` (writes `before.png`, `after.png`, and `compare.png` from live headless renders — no third-party service). The design rules the skill follows to hit that bar live in [`skills/reimagine-it/references/webpage-craft.md`](skills/reimagine-it/references/webpage-craft.md) — non-negotiable checklist, not vibes.

## Compose tokens: `<form> <domain> <modifier> --font "..." --ref <lock>`

Everything is composable. Nothing is required. Example calls:

```
/reimagine-it webpage
/reimagine-it webpage cinematic
/reimagine-it webpage artistic glassmorphism
/reimagine-it webpage cinematic --font "Playfair Display, Iowan Old Style, Georgia, serif"
/reimagine-it webpage --ref house-cinema
/reimagine-it pdf
/reimagine-it slides bento
/reimagine-it lock gold/domains/cinematic/after.html as house-cinema
/reimagine-it --list-refs
```

## Domain tokens — completely different aesthetic per token

`/reimagine-it webpage <domain>` picks up a matching pack in [`skills/reimagine-it/references/domains/`](skills/reimagine-it/references/domains/). The pack **extends** the spine (grid, baseline, palette cap, one motif, one make-strange move) with an opinionated aesthetic. Same brief, radically different outputs:

![four aesthetics from one brief](gold/domains/strip.png)

| Token | What you get | Live gold |
|-------|--------------|-----------|
| *(none)* | Sober designed page, disciplined dark palette | [`gold/webpage/after.html`](gold/webpage/after.html) |
| `artistic` | Cream paper, italic serif at magazine scale, kinetic ampersand, drifting SVG arcs, real ±16° 3D card fan with 40px drop-shadow | [`gold/domains/artistic/after.html`](gold/domains/artistic/after.html) |
| `dashboard` | Faint operator grid, KPI tiles, live SVG chart with a rise animation, status pills, terminal card with a blinking caret | [`gold/domains/dashboard/after.html`](gold/domains/dashboard/after.html) |
| `photography` | Editorial folio, Didot-scale italic-then-caps nameplate, numbered plate strip, three real SVG "photographs", dropcap paragraphs | [`gold/domains/photography/after.html`](gold/domains/photography/after.html) |
| **`cinematic`** *(`3d`, `webgl`)* | Inline WebGL2 shader hero, 3D card depth with real drop-shadow, one motion beat always running | [`gold/domains/cinematic/after.html`](gold/domains/cinematic/after.html) |
| `ecommerce` | Product plate per row, SVG hero art per plate, price ladder, one CTA per plate | pack: [`ecommerce.md`](skills/reimagine-it/references/domains/ecommerce.md) |
| `landing` | One-viewport magnet, one promise, one CTA, one proof strip, no navigation graveyard | pack: [`landing.md`](skills/reimagine-it/references/domains/landing.md) |
| `portfolio` | One full study per project, no card grid, inline SVG per study | pack: [`portfolio.md`](skills/reimagine-it/references/domains/portfolio.md) |

Re-shoot the strip: `python gold/domains/run.py`.

### `/reimagine-it webpage cinematic` — real WebGL2, no CDN, single file

![cinematic hero: inline WebGL2 raymarch field with italic ampersand and blend-mode masthead](gold/domains/cinematic/hero.png)

Inline `<canvas>` + inline fragment shader in a `<script type="x-shader/x-fragment">` block. No CDN, no `import` from `https://`, no vendor folder. Opens as one `.html` you can double-click. The masthead sits *on top* of the shader with `mix-blend-mode: difference` so the type reads over any color the field draws. Cards below the hero fan in real 3D (`perspective:1400px`, outer cards `rotateY(±9deg) translateZ(-8px)`, middle card `translateZ(30px)` with a 60px drop-shadow) — depth reads in a still, not just on hover.

### Motion is real (three frames, ~1.6s apart)

Screenshots freeze animation, so every claim about motion has to prove itself in a strip. Three frames per pack — if the pixels change frame to frame, the motion budget landed:

![motion strip: four packs, three frames each](gold/domains/motion-strip.png)

- **cinematic** — the WebGL2 raymarch field evolves visibly frame to frame; that's the shader tint + interference bands actually running.
- **artistic** — the italic ampersand sways ~±3°; you can see it lean between frames.
- **dashboard** — chart bars rise into place between the first and later frames.
- **photography** — deliberately still; a magazine folio doesn't twitch.

Re-shoot the motion strip: `python gold/domains/motion-run.py`.

## Modifier tokens — layer a UI/UX style on any domain

`/reimagine-it webpage <domain> <modifier>` layers a modifier pack from [`skills/reimagine-it/references/modifiers/`](skills/reimagine-it/references/modifiers/) on top of the domain. Modifiers waive the matching cut-list entries (so glassmorphism is finally legal) and add their own non-negotiables.

| Token | Pack | What it adds |
|-------|------|--------------|
| `glassmorphism` | [modifiers/glassmorphism.md](skills/reimagine-it/references/modifiers/glassmorphism.md) | Frosted panels over a **real substrate** (running shader, image, animated SVG). Two-tier blur, light-source-consistent borders, colored box-shadows. |
| `bento` | [modifiers/bento.md](skills/reimagine-it/references/modifiers/bento.md) | Named-cell CSS grid; one page reads as a bento box, hero tile 2x wider, one idea per tile. |
| `neon` | [modifiers/neon.md](skills/reimagine-it/references/modifiers/neon.md) | Dark ground, one high-chroma accent doing all the work, glow via double drop-shadow, kinetic type on the accent word. |
| `brutalism` `neumorphism` `handdrawn` | [modifiers/](skills/reimagine-it/references/modifiers/) | Spec-only for v2 — checklist to ship your own. |

Modifiers **compose**: `/reimagine-it webpage artistic glassmorphism --font "Playfair Display, serif"` runs artistic, then glassmorphism, then applies the font override.

### Live composed gold — `/reimagine-it webpage cinematic glassmorphism`

Proof that modifiers stack on top of domains. The WebGL2 shader from the cinematic pack is still running behind the masthead — the glassmorphism modifier layers a **front tier** (14 px blur) and a **deep tier** (24 px blur, top-right) on top, with light-source-consistent borders (bright top-left inset, dark bottom-right inset) and colored box-shadows. Blur *reveals* the shader; it never covers a solid color.

![cinematic + glassmorphism: WebGL2 shader visible through two glass tiers with light-source borders](gold/modifiers/cinematic-glassmorphism/hero.png)

Single file: [`gold/modifiers/cinematic-glassmorphism/after.html`](gold/modifiers/cinematic-glassmorphism/after.html). No CDN, no vendor folder.

## Font override — `--font "family, fallback, generic"`

Pin the display or body family. The skill builds a full CSS stack with sensible fallbacks:

```
/reimagine-it webpage cinematic --font "IBM Plex Mono, Consolas, monospace"
/reimagine-it webpage artistic  --font "Playfair Display, Iowan Old Style, Georgia, serif"
```

Never fetches a webfont at runtime unless you *also* pass `--allow-fetch` (that breaks the offline single-file promise). If your requested family isn't installed on the reader's box, the fallback still lands the aesthetic (`Playfair Display` → `Georgia` still reads editorial).

## Lock — capture a shipped design, reuse it anywhere

Once you like a design, save its DNA:

```
/reimagine-it lock gold/domains/cinematic/after.html as house-cinema
```

The skill extracts palette + type stack + motifs + motion signatures + 3D signatures + section structure into a markdown pack under [`skills/reimagine-it/references/locks/`](skills/reimagine-it/references/locks/). Example lock lives at [`house-cinema.md`](skills/reimagine-it/references/locks/house-cinema.md).

Then apply it to a new target — same medium **or a different one**:

```
/reimagine-it webpage --ref house-cinema
/reimagine-it slides  --ref house-cinema
/reimagine-it pdf     --ref house-cinema
```

Locks include a **cross-medium translation table** so a webpage lock can inform a slides deck or a PDF (webpage's `rotateY(9deg) translateZ(-8px)` card becomes a pptx panel with paired shadows; a WebGL shader hero becomes a snapshot PNG as slide 1 background).

Locks are portable text — share via gist, commit, or copy-paste into another repo.

## Not just webpages — PDF · document · slides · anything

Point at any file. Force any output:

| Token | Pack | Regenerator |
|-------|------|-------------|
| `pdf` | [forms/pdf.md](skills/reimagine-it/references/forms/pdf.md) | Weasyprint (HTML → PDF) or ReportLab (print-native Python) |
| `document` / `docx` / `md` | [forms/document.md](skills/reimagine-it/references/forms/document.md) | python-docx, pandoc, or LaTeX |
| `slides` / `pptx` / `deck` | [forms/slides.md](skills/reimagine-it/references/forms/slides.md) | python-pptx or reveal.js (HTML deck) |
| `universal` | [forms/universal.md](skills/reimagine-it/references/forms/universal.md) | Detects file, dispatches, or writes a companion overlay |

Every non-web form pack keeps the same bar: cover magnet, one data-driven plate, one repeating motif, one make-strange move, real content from *your* file. All regenerators are free, offline, and locally installable.

## Every webpage output must land three things — and prove them in a still

Non-negotiable, enforced by the [spine](skills/reimagine-it/references/webpage-craft.md):

1. **Hero-scale inline SVG doing real work** — ≥400 px on the longest side, encoding real content (values, geometry, path). Placeholder icons do not count.
2. **Three moving elements at any moment** — one persistent (drift, sway, breathe), one active on state (hover, focus), one narrative (bar rising, path drawing, sweep line). Two stills 500 ms apart must show visible change.
3. **3D that reads in a still** — rotation ≥ 12° **and** shadow blur ≥ 24 px, or `translateZ` ≥ 30 px with a real box-shadow, or inline WebGL2 for `cinematic`.

If a screenshot can't prove all three, the redesign didn't earn `/reimagine-it webpage`.

## Tested (5)

Live captures, not stories. Suite exit `0` (`failed=0`). Re-run: `python gold/five/run.py`. Every SVG under every example — the suite badge here, the pipe under §1, the door under §2, the skyline under §3, the layer graph under §4 — is rewritten by that same run from the row it captured. Example §5 is the hero at the top.

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

Shipped JSON:

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

## Try

```powershell
python gold/reimagine.py          # exit 1 - vibe list
python gold/reimagine.py --ship   # exit 0 - gold/shipped.json
./gold/test_reimagine.ps1         # full smoke test
```

Or open [`gold/index.html`](gold/index.html). That is the door, not a lecture.

## What it does

![how /reimagine-it decides](docs/flow.svg)

1. Sniffs the repo and thread (does not stall for a brief).
2. Names the **adjacent possible** — a combination of spare parts already here.
3. Picks four private notes (device · leap · craft · effect) and **one** SCAMPER letter.
4. Routes a **form** from context, unless you forced a category.
5. Layers **domain**, **modifier**, **font**, and **--ref** on top if you passed them.
6. Ships an **artifact** you can run, open, or keep. Always names a **stretch**.

Interview is **optional**. You opt in with `interview`. The agent decides the questions (one at a time, with a recommended answer). Default is no interview.

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

## Install without the CLI

Copy **one** folder. The skill directory name must stay `reimagine-it`.

```powershell
git clone https://github.com/kazimrmerchant/reimagine-it.git
Copy-Item -Recurse .\reimagine-it\skills\reimagine-it $env:USERPROFILE\.cursor\skills\
```

Other hosts: copy `skills/reimagine-it/` into that product's skills root (`SKILL.md` required). Never install into `~/.cursor/skills-cursor/` (Cursor-managed built-ins).

Optional Cursor slash: copy `commands/reimagine-it.md` into `~/.cursor/commands/`.

## What this is not

- Not a brainstorm list or a mood-word grill
- Not [grill-me](https://github.com/mattpocock/skills) (that is a feasibility interview)
- Not `/better` (quality pass on an existing deliverable)
- Not "make it pop" / wow-factor as a strategy
- Not an image generator unless you explicitly ask your host for that

## What v2 ships (and what's staged for v2.1)

**Ships in v2.0** (this release):
- Rename `awe-me` → `reimagine-it` across every file, path, and command
- Three modifier packs: `glassmorphism`, `bento`, `neon`
- Font override via `--font`
- Lock system + `house-cinema` example lock with cross-medium translation table
- Non-web form packs: `pdf`, `document`, `slides`, `universal`
- Tightened spine: SVG + motion + 3D must read in a still
- WebGL2 `cinematic` domain + motion-strip proof

**Staged for v2.1** (specs live in this repo; gold to follow):
- Full gold example for `webpage cinematic glassmorphism` (composed pack)
- Gold example for a `pdf` reimagining (ReportLab pipeline)
- Gold example for a `slides` reimagining (python-pptx pipeline)
- Fuller `brutalism` / `neumorphism` / `handdrawn` modifier packs
- `--variants N` implementation (spec is in SKILL.md; gold is the missing piece)
- Extractor for `/reimagine-it lock <path>` (currently the lock format is hand-authored; extraction is a one-time script per medium)

**Challenge we're aiming at for v2.2:**
- Live preview server (`python gold/serve.py` → hot-reload the redesigned file)
- Palette extraction from a user-supplied logo (feed a hex into any domain pack)
- Lock export as Tailwind config / design tokens JSON / Figma-compatible file
- Team locks in `~/.reimagine-it/locks/` with a share URL

## Layout

```
skills/reimagine-it/               # the skill (copy this folder)
skills/reimagine-it/SKILL.md
skills/reimagine-it/references/webpage-craft.md      # non-negotiable webpage spine
skills/reimagine-it/references/domains/              # per-domain packs
skills/reimagine-it/references/modifiers/            # per-modifier packs (glassmorphism, bento, neon, ...)
skills/reimagine-it/references/forms/                # non-web form packs (pdf, document, slides, universal)
skills/reimagine-it/references/locks/                # saved design-DNA packs (house-cinema, ...)
skills/reimagine-it/references/notes.md              # note bank (device, leap, craft, effect)
skills/reimagine-it/examples.md                      # example prompts + hero paths

gold/                                # reverse-demo + shipped output
gold/reimagine.py                    # brainstorm fails; --ship ships
gold/hero.svg                        # the metaphor (before/after)
gold/index.html                      # the door, not a lecture
gold/webpage/                        # plain page vs redesigned page
gold/webpage/compare.png             # the side-by-side embedded near the top
gold/domains/                        # per-domain gold pages from one brief
gold/domains/strip.png               # still strip: sober / artistic / dashboard / photography
gold/domains/motion-strip.png        # motion strip: 4 packs, 3 frames each
gold/domains/cinematic/after.html    # inline WebGL2 shader hero, no CDN
gold/domains/cinematic/hero.png      # 1400x900 preview of the cinematic pack
gold/modifiers/                      # domain + modifier compositions
gold/modifiers/cinematic-glassmorphism/  # WebGL2 + two glass tiers, single .html
gold/five/                           # five tested fixtures; python gold/five/run.py
gold/five/RUN.svg                    # suite badge, regenerated from live rows

docs/flow.svg                        # how /reimagine-it decides

commands/reimagine-it.md             # optional Cursor slash file

test/pipeline/                       # fresh-subagent proof: skill-only, no gold peek
AGENTS.md                            # bootstrapping notes for an incoming agent
NOTICE                               # method citations (Shklovsky, Kauffman, Keltner, ...)
```

Every visual in this README is either static SVG in this repo or output that `python gold/five/run.py` (or `python gold/domains/run.py`) rewrites. Nothing rendered by a third-party service.

Spec: [agentskills.io](https://agentskills.io/specification). Progressive disclosure: description is the trigger; body loads when the task matches; `references/` load on demand.

## Lineage (methods, not a brand)

Make-strange (Shklovsky, 1917). Adjacent possible (Kauffman; Johnson). SCAMPER (Eberle after Osborn). Vastness + accommodation (Keltner & Haidt). Peak–end. Disney plussing. Pixar-shaped notes. Effect-before-method as craft. See [NOTICE](NOTICE).

## License

MIT. See [LICENSE](LICENSE).
