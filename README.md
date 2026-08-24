# reimagine-it

[![license MIT](https://img.shields.io/badge/license-MIT-1a2138.svg)](LICENSE) [![skills.sh](https://skills.sh/b/kayforkind/reimagine-it)](https://skills.sh/kayforkind/reimagine-it) [![Claude Code](https://img.shields.io/badge/Claude_Code-plugin-d97757.svg)](https://code.claude.com/docs/en/plugins) [![Cursor](https://img.shields.io/badge/Cursor-skill-1a2138.svg)](https://cursor.com) [![Codex](https://img.shields.io/badge/Codex-skill-6e6e6e.svg)](https://github.com/openai/codex) [![agentskills.io spec](https://img.shields.io/badge/agentskills.io-spec-e8a63f.svg)](https://agentskills.io/specification) [![version 2.3](https://img.shields.io/badge/version-2.3-b22234.svg)](skills/reimagine-it/SKILL.md) [![sponsor](https://img.shields.io/badge/sponsor-%E2%98%85-b22234.svg)](https://github.com/sponsors/Kayforkind)

**This is an agent skill — an AI reads your file and redesigns it from its own content. Not a mood board. A real artifact.**

Same naive HTML. Completely different pages — webpage, infographic poster, living SVG, Three.js room, playable simulation. One file. Offline. No Figma, no CDN.

![same naive Texas HTML, then full-page afters: webpage tokens, infographic, SVG, Three.js, simulation](gold/forms/examples.gif?v=pages-1)

Browse without installing: **[live gallery](https://kayforkind.github.io/reimagine-it/)** · **[full case studies](docs/SHOWCASE.md)** · [`gold/README.md`](gold/)

---

## One command

**Claude Code**

```text
/plugin marketplace add Kayforkind/reimagine-it
/plugin install reimagine-it@reimagine-it
```

**Cursor, Codex, Copilot, Gemini CLI**

```bash
npx skills add Kayforkind/reimagine-it
```

Then in your AI agent: `/reimagine-it` · `/reimagine-it infographic` · `/reimagine-it svg` · `/reimagine-it 3js` · `/reimagine-it simulation`

| Token | What you get |
|-------|----------------|
| `webpage` | A real page from this file's nouns, dates, colors |
| `infographic` | A paper poster of facts already in the file — not a fake dashboard |
| `svg` | A living mark (the motion is on the drawing) |
| `3js` | A room you can orbit |
| `simulation` | A playable model of those facts |

Full host matrix (Droid, Pi, `gh skill`, Gemini CLI path): [all hosts](#install).

---

## How it works

The skill reads your file, extracts concrete nouns / dates / colors / proper nouns, and builds a design language from them. Palette, motifs, motion, and 3D are all derived from **your** content.

- Point at a **Texas notebook** → navy / cream / red / gold palette, Lone Star motif, sunset shader\
  → [see the result](gold/webpage/after-3.html)
- Point at a **coffee roaster's site** → warm browns, burlap textures, roast-level charts
- Point at a **night-diving report** → deep teals, bioluminescent accents, depth-profile SVG
- Point at a **printing press page** → hand-set caps, paper grain, ink-bleed motifs

**Same command, three runs = three different reader registers.** The engine samples along seven axes (reader register, palette weighting, hero move, plate style, motion budget, type accent, 3D signature). The content narrows the space — a Texas notebook can't return a marine-caustics shader — but inside that space, every draw is fresh. Pin with `--seed` or `--variant` when you need reproducibility.

![quartet: same Texas notebook source, three different reader registers](gold/webpage/quartet.png?v=texas-v22)

---

## Five sources, one skill

The gallery is not a one-trick demo. It's proof the method travels:

| Source | Content | Key design decision |
|--------|---------|---------------------|
| [Texas notebook](gold/webpage/before.html) | 3 places, 3 signals, Lone Star flag | Navy / red / gold from the flag; sunset shader from Big Bend |
| [Jules Ice Cream](gold/jules/before.html) | 6 flavors, hours, counter | Parlor DNA — counter, cone, freezer — not a Texas reskin |
| [Pulsewave API](gold/pulsewave/before.html) | SaaS startup, observability | Svelte-wave green / dark teal; trace-path SVG; pulse motif |
| [Two Lights](gold/twolights/before.html) | Essay on a lighthouse trip | Salt / fog / beam palette; lighthouse beam SVG; tide pattern |
| [Saffron & Smoke](gold/saffron/before.html) | Restaurant menu, 6 dishes | Warm clay / saffron / smoke palette; hand-drawn plate divider |

[Full case studies with before/after comparison and design notes →](docs/SHOWCASE.md)

---

## Install

One chair: `skills/reimagine-it/`. Hosts with a plugin marketplace get a native wrapper in this repo. Hosts that only speak Agent Skills install the same folder.

**Claude Code**

```text
/plugin marketplace add Kayforkind/reimagine-it
/plugin install reimagine-it@reimagine-it
```

Then enable updates once: `/plugin` → **Marketplaces** → **reimagine-it** → **Enable auto-update**. Claude Code leaves third-party auto-update off by default. Run `/reload-plugins` when prompted.

**Codex**

```bash
codex plugin marketplace add Kayforkind/reimagine-it
codex plugin add reimagine-it@reimagine-it
```

Codex refreshes Git marketplaces at startup. To fetch immediately: `codex plugin marketplace upgrade reimagine-it`, then start a new session.

**Factory Droid**

```bash
droid plugin marketplace add https://github.com/Kayforkind/reimagine-it
droid plugin install reimagine-it@reimagine-it --scope user
```

Droid tracks Git plugins by commit. After a merge: `droid plugin marketplace update reimagine-it`, then `droid plugin update reimagine-it@reimagine-it --scope user`.

**Cursor, Copilot, Gemini CLI, Windsurf, and other Agent Skills hosts**

They load `SKILL.md`. Cursor also has a native plugin wrapper in `.cursor-plugin/` (Marketplace / cursor.directory). Until those listings go live, install the skill:

```bash
npx skills add Kayforkind/reimagine-it             # one project
npx skills add Kayforkind/reimagine-it -g           # global
gh skill install Kayforkind/reimagine-it reimagine-it --agent cursor
gemini skills install https://github.com/Kayforkind/reimagine-it.git --path skills/reimagine-it
```

**Pi**

```bash
pi install https://github.com/Kayforkind/reimagine-it
```

Then `/reload` in an open Pi session.

Then say `/reimagine-it` in the host. Also matches: "reimagine it", "redesign this page", "make an infographic".

---

## The five levers

| Lever | Syntax | Effect |
|-------|--------|--------|
| **Form** | `webpage` \| `svg` \| `3js` \| `simulation` \| `pdf` \| `slides` \| `document` \| `mobi` \| `epub` \| `code` \| `cli` \| `protocol` \| ... | Force the medium. `svg` and `3js` are **alive by default** (2–4 fact-tied micro-loops). Leftover `still` / `no-motion` / `print` freezes them. |
| **Domain** | `webpage artistic` \| `dashboard` \| `photography` \| `cinematic` \| `landing` \| `portfolio` \| `infographic` | Force the aesthetic. `infographic` is a statistical poster (common-scale encodings + ISOTYPE + data table), not an ops dashboard. See [`references/domains/`](skills/reimagine-it/references/domains/). |
| **Modifier** | `webpage cinematic glassmorphism` \| `bento` \| `neon` \| `brutalism` \| `neumorphism` \| `handdrawn` | Layer a UI/UX style on any domain. See [`references/modifiers/`](skills/reimagine-it/references/modifiers/). |
| **Font** | `--font "Playfair Display, Iowan Old Style, Georgia, serif"` | Pin display / body family. Full stack. No webfont fetch unless `--allow-fetch`. |
| **Lock** | `lock <path> as <name>` then `--ref <name>` | Capture design DNA (palette, type, motifs, motion, 3D) and reuse it — even across media. |

Compose freely: `/reimagine-it webpage artistic glassmorphism --font "Playfair Display, serif" --ref house-cinema`.

---

## Three hard guarantees (v2.2)

Three things that were sometimes missing before are now part of the shipped bar. If any fails, the command reports `partial`, not `shipped`.

- **Same-format twin by default.** If you point at a distributable file (`.pdf`, `.docx`, `.pptx`, `.mobi`, `.azw3`, `.epub`, `.md`), the default output is **two artifacts**: a companion HTML reading room *and* a same-format twin in the source's native format. The HTML alone is not enough — you picked that format because you want to hand it around in that format. If the same-format toolchain is missing on the current machine (e.g. no Calibre for `.mobi`), the report names the missing tool and the exact next command that would produce the twin; it does not silently drop the twin.
- **Visual verification pass on every render.** Before reporting `shipped`, the skill renders the hero into an image and manually scans it for: blank plates, placeholder labels (`blank` / `TBD` / `lorem` / `Title goes here`), clipped or overlapping text (e.g. `POST OFFICE` rendered as `POST O CE` because a foreground shape covers the label), broken SVGs, off-palette accents, fabricated content, dead motion (identical frame hashes), and — new in v2.2 — **every plate maps to a source anchor** (no unmapped plates painted). Any failure fails the render and forces a fix or a `partial` report — **empty slots are deleted, never painted with a placeholder**.
- **Craft floor on every webpage output (new in v2.2).** Every rendered page must clear the craft floor before shipping: `:focus-visible` ring with contrast ≥ 3:1, `::selection` on-palette, motion timing 100–300 ms `ease-out` for micro-interactions, animations only on `transform` and `opacity` (compositor-only), `prefers-reduced-motion` respected by *decomposing* (turn off scroll-triggered motion, cap kinetic type at the lit state, disable WebGL loops — not by suppressing focus rings), no `transition: all`, no `outline: 0` without an explicit replacement, scroll-driven animations offloaded via `animation-timeline: view()` when supported, and Core Web Vitals sane (no CLS from motion, INP under 200 ms). See [`references/craft-floor.md`](skills/reimagine-it/references/craft-floor.md).

All three are enforced by [`skills/reimagine-it/SKILL.md`](skills/reimagine-it/SKILL.md) § 2.6 / § 5.b / § 5.c and by [`references/forms/universal.md`](skills/reimagine-it/references/forms/universal.md). The research that raised the bar (150+ sources: award-winning studios, editorial newsrooms, motion masters, WebGL creative devs, type foundries, scrollytelling, print-to-web bridges, sonic branding, modern web-platform features) lives at [`references/research/web-craft-2025.md`](skills/reimagine-it/references/research/web-craft-2025.md).

---

## Not just webpages — PDF · document · slides · anything

Point at any file. Force any output:

| Token | Pack | Regenerator |
|-------|------|-------------|
| `pdf` | [forms/pdf.md](skills/reimagine-it/references/forms/pdf.md) | Weasyprint (HTML → PDF) or ReportLab (print-native Python) |
| `document` / `docx` / `md` | [forms/document.md](skills/reimagine-it/references/forms/document.md) | python-docx, pandoc, or LaTeX |
| `slides` / `pptx` / `deck` | [forms/slides.md](skills/reimagine-it/references/forms/slides.md) | python-pptx or reveal.js |
| `universal` | [forms/universal.md](skills/reimagine-it/references/forms/universal.md) | Detects file type, dispatches, or writes a companion overlay |

Every non-web pack keeps the same bar: cover magnet, one data-driven plate, one repeating motif, one make-strange move, real content from *your* file, **palette and motifs derived from what your file is about**. All regenerators are free, offline, locally installable.

---

## Lock — capture a shipped design, reuse it anywhere

Once a design lands, save its DNA:

```
/reimagine-it lock gold/domains/cinematic/after.html as house-cinema
```

The skill extracts palette + type stack + motifs + motion + 3D + section structure into a markdown pack under [`references/locks/`](skills/reimagine-it/references/locks/). Example: [`house-cinema.md`](skills/reimagine-it/references/locks/house-cinema.md).

Apply a lock to a new target — **same medium or a different one**:

```
/reimagine-it webpage --ref house-cinema
/reimagine-it slides  --ref house-cinema
/reimagine-it pdf     --ref house-cinema
```

Locks include a **cross-medium translation table** so a webpage lock informs a slides deck or a PDF (a `rotateY(9deg) translateZ(-8px)` card becomes a pptx panel with paired shadows; a WebGL shader hero becomes a snapshot PNG cover). Locks are portable text — share via gist, commit, or copy-paste.

---

## Everything on this page is tested

Every visual is a real file in this repo, generated locally by a script you can rerun:

| Regenerates | Command |
|-------------|---------|
| Per-pack full-page `after.png` shots used by every case study | `python gold/shots.py` |
| Infographic poster (full page, real Chrome) → `gold/domains/infographic/after.png` | `python gold/_shot_full.py gold/domains/infographic/after.html gold/domains/infographic/after.png` |
| Form gold: SVG + Three.js + simulation + loop close-ups (real Chrome) | `python gold/forms/shot.py` |
| Form examples GIF (`gold/forms/examples.gif`) | `python gold/forms/make_gif.py` |
| Jules second-source gold (real Chrome) + GIF | `python gold/jules/shot.py` then `python gold/jules/make_gif.py` |
| Gold review (flag cloth, Jules clone scan, after.png pairs) | `python scripts/review_gold.py` |
| Draw C full-page shot (v2.2, WebGL2, real Chrome) → `gold/webpage/after-3-full.png` | `python gold/_shot_full.py gold/webpage/after-3.html gold/webpage/after-3-full.png` |
| Master gallery (`gold/gallery.png`) + per-pack tile heroes | `python gold/gallery.py` |
| Quartet (`gold/webpage/quartet.png`) + twins triptych (`twins.png`) + per-pack wide before/after compares | `python gold/compare.py` |
| Default before + after screenshots (`gold/webpage/*.png`) | `python gold/webpage/run.py` |
| Motion strip (`gold/domains/motion-strip.png`) | `python gold/domains/motion-run.py` |
| Skill smoke fixture (`gold/reimagine.py`) | `python gold/reimagine.py --ship` |
| Pulsewave gold | `python gold/pulsewave/shot.py` |
| Two Lights gold | `python gold/twolights/shot.py` |
| Saffron & Smoke gold | `python gold/saffron/shot.py` |

If a regenerator fails on your machine, that's a bug — please open an issue. Nothing on this page is rendered by a third-party service or fetched from a CDN.

---

## If this helps you

If `/reimagine-it` gives you an output you'd have paid a designer for, three ways to help me keep shipping the next domains, form packs, and locks:

- **Star the repo.** It's the single fastest signal that this project should keep growing. Use the star button at the top of the page.
- **[Sponsor on GitHub →](https://github.com/sponsors/Kayforkind)** Any tier keeps the studio's lights on. Sponsors get priority on custom domain packs and roadmap input.
- **Contribute a domain or a lock.** Open a PR under [`skills/reimagine-it/references/domains/`](skills/reimagine-it/references/domains/) or [`references/locks/`](skills/reimagine-it/references/locks/). Real content beats a spec.

Say hi on [GitHub](https://github.com/Kayforkind).

---

MIT licensed — see [LICENSE](LICENSE). Skill spec: [agentskills.io](https://agentskills.io/specification).