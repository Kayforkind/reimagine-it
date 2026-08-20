# reimagine-it

[![license MIT](https://img.shields.io/badge/license-MIT-1a2138.svg)](LICENSE) [![agentskills.io spec](https://img.shields.io/badge/agentskills.io-spec-e8a63f.svg)](https://agentskills.io/specification) [![version 2.0](https://img.shields.io/badge/version-2.0-b22234.svg)](skills/reimagine-it/SKILL.md) [![sponsor](https://img.shields.io/badge/sponsor-%E2%98%85-b22234.svg)](https://github.com/sponsors/kazimrmerchant)

> Same brief, radically different output. One agent skill that takes any file — a webpage, PDF, deck, doc, CLI, protocol, prose — and ships a leap the user didn't know to ask for.
>
> The gallery below is built entirely from the same naive HTML page, redesigned eight different ways by the same command with one different token each. Every shot renders locally from a real `.html` file in this repo. No CDN, no paid API, no third-party service.
>
> **Visual system:** a USA / Texas Lone-Star palette (night navy, parchment cream, star red, sun gold) with a small lone-star lockup in every masthead and a Texas-sunset raymarch shader for the cinematic pack. Applied identically to the same naive Jordan Rivers page so the redesigns read as one design system.

![one brief, eight outputs on a USA / Texas Lone-Star palette: default, artistic, dashboard, photography, cinematic, cinematic+glassmorphism, dashboard+bento, landing+neon](gold/gallery.png?v=texas-2)

```
/reimagine-it webpage                                        <- default (top-left)
/reimagine-it webpage artistic
/reimagine-it webpage dashboard
/reimagine-it webpage photography
/reimagine-it webpage cinematic                              <- inline WebGL2 shader
/reimagine-it webpage cinematic glassmorphism                <- modifier stacks on domain
/reimagine-it webpage dashboard bento
/reimagine-it webpage landing   neon
```

<p align="center">
  <a href="https://github.com/sponsors/kazimrmerchant"><img alt="Sponsor this project on GitHub" src="https://img.shields.io/badge/%E2%98%85%20Sponsor%20this%20project-on%20GitHub-b22234?style=for-the-badge&labelColor=1a2138&color=b22234"></a>
  &nbsp;&nbsp;
  <a href="https://github.com/kazimrmerchant/reimagine-it"><img alt="Star the repo" src="https://img.shields.io/badge/%E2%98%85%20Star%20the%20repo-on%20GitHub-1a2138?style=for-the-badge&labelColor=e8a63f&color=1a2138"></a>
</p>

<p align="center"><em>If <code>/reimagine-it</code> gives you an output you'd have paid a designer for, star the repo (top-right) and consider sponsoring — sponsors fund the next domains, form packs, and locks.</em></p>

---

## Install

```bash
npx skills add kazimrmerchant/reimagine-it            # one project
npx skills add kazimrmerchant/reimagine-it -g          # global (Cursor, Claude Code, ...)
```

Then say `/reimagine-it` in your host.

---

## The five levers

| Lever | Syntax | Effect |
|-------|--------|--------|
| **Form** | `webpage` · `pdf` · `slides` · `document` · `code` · `cli` · `protocol` · ... | Force the medium. |
| **Domain** | `webpage artistic` · `dashboard` · `photography` · `cinematic` · `landing` · `portfolio` | Force the aesthetic. See [`references/domains/`](skills/reimagine-it/references/domains/). |
| **Modifier** | `webpage cinematic glassmorphism` · `bento` · `neon` · `brutalism` · `neumorphism` · `handdrawn` | Layer a UI/UX style on any domain. See [`references/modifiers/`](skills/reimagine-it/references/modifiers/). |
| **Font** | `--font "Playfair Display, Iowan Old Style, Georgia, serif"` | Pin display / body family. Full stack. No webfont fetch unless `--allow-fetch`. |
| **Lock** | `lock <path> as <name>` then `--ref <name>` | Capture design DNA (palette, type, motifs, motion, 3D) and reuse it — even across media. |

Compose freely: `/reimagine-it webpage artistic glassmorphism --font "Playfair Display, serif" --ref house-cinema`.

---

## Before → after, one command at a time

Every section below has the **same naive HTML on the left** — [`gold/webpage/before.html`](gold/webpage/before.html), a plain personal page for a developer named Jordan Rivers: a name, three projects (`rift`, `lantern`, `quiet-week`), one email. **The `/reimagine-it` output is on the right.** The only thing that changed between rows is the token you pass. Regenerate the whole set: `python gold/compare.py`.

### Default spine — `/reimagine-it webpage`

**Before:** the raw HTML in the browser default. Times New Roman, no hierarchy, no motion, no motif.
**After:** the same content, redesigned — 12-column grid, USA / Texas Lone-Star palette (navy, cream, red, gold), KPI-style project tiles, one make-strange move at the bottom, honest chrome. Nothing added that isn't already in the source page. See [`gold/webpage/after.html`](gold/webpage/after.html).

![default spine before/after: raw naive HTML on the left, USA/Texas redesigned page on the right](gold/webpage/compare.png?v=texas-2)

### `artistic` — `/reimagine-it webpage artistic`

**Before:** same raw HTML.
**After:** editorial cream + italic serif at hero scale. Kinetic ampersand sways ±3° on a slow cycle. Drifting SVG arcs behind the type. Deep barn-red accent (`#7a1c22`) replaces the usual editorial purple. Cards fan out at real ±16° with a 40 px drop-shadow — the 3D reads in a still. See [`gold/domains/artistic/after.html`](gold/domains/artistic/after.html).

![artistic pack before/after: raw HTML on the left, italic-serif editorial redesign of Jordan Rivers in Texas colors on the right](gold/domains/artistic/compare.png?v=texas-2)

### `dashboard` — `/reimagine-it webpage dashboard`

**Before:** same raw HTML.
**After:** operator grid on navy. Sun-gold KPI tiles across the top. Live SVG traffic chart with a rising-bar animation and a pulsing accent dot. Status pills. Blinking-caret terminal card. Same three projects, same content — read as a real ops surface. See [`gold/domains/dashboard/after.html`](gold/domains/dashboard/after.html).

![dashboard pack before/after: raw HTML on the left, ops-surface dashboard for Jordan's three projects on the right](gold/domains/dashboard/compare.png?v=texas-2)

### `photography` — `/reimagine-it webpage photography`

**Before:** same raw HTML.
**After:** a magazine folio. Didot-scale italic-then-caps nameplate. Numbered plate strip. Three real SVG "photographs" (drawn on the page, not stock). Dropcap paragraphs. Deliberately quiet motion — a folio doesn't twitch. See [`gold/domains/photography/after.html`](gold/domains/photography/after.html).

![photography pack before/after: raw HTML on the left, Didot magazine folio of Jordan Rivers on the right](gold/domains/photography/compare.png?v=texas-2)

### `cinematic` — `/reimagine-it webpage cinematic`

**Before:** same raw HTML.
**After:** an inline `<canvas>` + inline fragment shader (`<script type="x-shader/x-fragment">`) drawing a **Texas-sunset raymarched interference field** (navy → sun gold → star red). No CDN, no `import` from `https://`, no vendor folder. Masthead sits on top with `mix-blend-mode: difference` so type reads over any color the field draws. Cards below fan in real 3D. See [`gold/domains/cinematic/after.html`](gold/domains/cinematic/after.html).

![cinematic pack before/after: raw HTML on the left, WebGL2 Texas-sunset shader hero on the right](gold/domains/cinematic/compare.png?v=texas-2)

### `cinematic` + `glassmorphism` — `/reimagine-it webpage cinematic glassmorphism`

**Before:** same raw HTML.
**After:** the cinematic shader keeps running. Glassmorphism layers a **front tier** (14 px blur) over the masthead and a **deep tier** (24 px blur) over a data tile. Light-source-consistent borders (bright top-left inset, dark bottom-right inset), colored `box-shadow`s. Blur **reveals** the substrate; it never covers a solid color. See [`gold/modifiers/cinematic-glassmorphism/after.html`](gold/modifiers/cinematic-glassmorphism/after.html).

![cinematic + glassmorphism before/after: raw HTML on the left, two glass tiers over a running shader on the right](gold/modifiers/cinematic-glassmorphism/compare.png?v=texas-2)

### `dashboard` + `bento` — `/reimagine-it webpage dashboard bento`

**Before:** same raw HTML.
**After:** a named-cell CSS Grid with `grid-template-areas: "brand brand hours state" "hero hero chart chart" "hero hero latency logs" "stack stack incidents incidents"`. Nine tiles, unequal but shared chrome. Hero tile visibly elevated (`translateZ(24px)` + 40 px shadow). One idea per tile. See [`gold/modifiers/dashboard-bento/after.html`](gold/modifiers/dashboard-bento/after.html).

![dashboard + bento before/after: raw HTML on the left, nine-tile bento with elevated 2x2 hero on the right](gold/modifiers/dashboard-bento/compare.png?v=texas-2)

### `landing` + `neon` — `/reimagine-it webpage landing neon`

**Before:** same raw HTML.
**After:** a dark void ground with a single radial-gradient vignette. **One** high-chroma accent (`#e8a63f` — sun gold) doing every emotional job: the italic *tool* word (kinetic — pulses letter-spacing on a 4 s cycle), the orbital SVG that draws itself on load, the CTA border, the blinking cursor. Glow via double `drop-shadow`. See [`gold/modifiers/landing-neon/after.html`](gold/modifiers/landing-neon/after.html).

![landing + neon before/after: raw HTML on the left, one glowing sun-gold accent in a dark void on the right](gold/modifiers/landing-neon/compare.png?v=texas-2)

---

## Motion is real (three frames per pack)

Screenshots freeze animation, so every claim about motion proves itself in a strip. Three frames per pack, spaced ~1.6 s apart in virtual time — if the pixels change, the motion budget landed:

![motion strip: four packs, three frames each](gold/domains/motion-strip.png?v=texas-2)

- **cinematic** — WebGL2 raymarch field evolves visibly frame to frame.
- **artistic** — italic ampersand sways ±3°.
- **dashboard** — chart bars rise into place between frames.
- **photography** — deliberately still.

---

## Not just webpages — PDF · document · slides · anything

Point at any file. Force any output:

| Token | Pack | Regenerator |
|-------|------|-------------|
| `pdf` | [forms/pdf.md](skills/reimagine-it/references/forms/pdf.md) | Weasyprint (HTML → PDF) or ReportLab (print-native Python) |
| `document` / `docx` / `md` | [forms/document.md](skills/reimagine-it/references/forms/document.md) | python-docx, pandoc, or LaTeX |
| `slides` / `pptx` / `deck` | [forms/slides.md](skills/reimagine-it/references/forms/slides.md) | python-pptx or reveal.js |
| `universal` | [forms/universal.md](skills/reimagine-it/references/forms/universal.md) | Detects file type, dispatches, or writes a companion overlay |

Every non-web pack keeps the same bar: cover magnet, one data-driven plate, one repeating motif, one make-strange move, real content from *your* file. All regenerators are free, offline, locally installable.

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
| Master gallery (`gold/gallery.png`) + per-pack heroes | `python gold/gallery.py` |
| Per-pack before/after compares (`<pack>/compare.png`) | `python gold/compare.py` |
| Default before + after screenshots (`gold/webpage/*.png`) | `python gold/webpage/run.py` |
| Motion strip (`gold/domains/motion-strip.png`) | `python gold/domains/motion-run.py` |
| Skill smoke fixture (`gold/reimagine.py`) | `python gold/reimagine.py --ship` |
| USA / Texas visual system sweep (palette + star + shader) | `python gold/theme_texas.py` |

If a regenerator fails on your machine, that's a bug — please open an issue. Nothing on this page is rendered by a third-party service or fetched from a CDN.

---

## If this helps you

If `/reimagine-it` gives you an output you'd have paid a designer for, three ways to help me keep shipping the next domains, form packs, and locks:

- **Star the repo.** It's the single fastest signal that this project should keep growing. Use the star button at the top of the page.
- **[Sponsor on GitHub →](https://github.com/sponsors/kazimrmerchant)** Any tier keeps the studio's lights on. Sponsors get priority on custom domain packs and roadmap input.
- **Contribute a domain or a lock.** Open a PR under [`skills/reimagine-it/references/domains/`](skills/reimagine-it/references/domains/) or [`references/locks/`](skills/reimagine-it/references/locks/). Real content beats a spec.

Say hi on [GitHub](https://github.com/kazimrmerchant).

---

MIT licensed — see [LICENSE](LICENSE). Skill spec: [agentskills.io](https://agentskills.io/specification).
