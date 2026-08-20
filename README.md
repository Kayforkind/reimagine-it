# reimagine-it

[![license MIT](https://img.shields.io/badge/license-MIT-1a2138.svg)](LICENSE) [![agentskills.io spec](https://img.shields.io/badge/agentskills.io-spec-e8a63f.svg)](https://agentskills.io/specification) [![version 2.0](https://img.shields.io/badge/version-2.0-b22234.svg)](skills/reimagine-it/SKILL.md) [![sponsor](https://img.shields.io/badge/sponsor-%E2%98%85-b22234.svg)](https://github.com/sponsors/kazimrmerchant)

> **One agent skill. Any file. A content-aware leap.**
>
> `/reimagine-it` reads what your source *is about* and derives the palette, motifs, motion, and 3D from the content itself. Feed it a Texas notebook and the design comes out in navy / cream / red / gold with a lone-star lockup and a sunset shader. Feed it a marine-biology paper and it would come out in teal / bone / kelp / phytoplankton pink with a caustics shader and current lines. **Same command, different source, different visual DNA.**
>
> The gallery below is the same naive HTML page ([`gold/webpage/before.html`](gold/webpage/before.html) ? a plain Texas notebook: three places, three signals, one flag) redesigned eight different ways by the same command with one different token each. Every shot renders locally from a real `.html` file in this repo. No CDN, no paid API, no third-party service.

![one raw Texas notebook, eight content-aware redesigns: default, artistic, dashboard, photography, cinematic, cinematic+glassmorphism, dashboard+bento, landing+neon](gold/gallery.png?v=texas-4)

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

<p align="center"><em>If <code>/reimagine-it</code> gives you an output you'd have paid a designer for, star the repo (top-right) and consider sponsoring &mdash; sponsors fund the next domains, form packs, and locks.</em></p>

---

## The source page (before)

Every "after" in the gallery starts from this exact naive HTML ? one heading, two lists, an email, a note. **The design language you see on the right side of every comparison was chosen because the content mentions Texas, the Lone Star flag, Alamo, Rio Grande, and Bluebonnet.**

```html
<h1>A Texas notebook</h1>
<p>A few notes on Texas &mdash; the state, the flag, and the people.</p>

<h2>Places</h2>
<ul>
  <li><h3>Alamo, San Antonio (1836)</h3><p>A small stone mission at the center of the Texas Republic&hellip;</p></li>
  <li><h3>Big Bend, west Texas (1944)</h3><p>Eight hundred thousand acres along the Rio Grande&hellip;</p></li>
  <li><h3>Austin, on the Colorado (1839)</h3><p>Live music, live oaks, live legislature&hellip;</p></li>
</ul>

<h2>Signals</h2>
<ul>
  <li><h3>Lone Star flag (1839)</h3></li>
  <li><h3>Bluebonnet (1901)</h3></li>
  <li><h3>Longhorn (1995)</h3></li>
</ul>
```

Change the source and the whole design changes. `/reimagine-it` on a coffee roaster's site pulls warm browns and burlap textures; on a night-diving report it pulls deep teals and bioluminescent accents; on a printing press's page it pulls hand-set caps and paper grain. The gallery below is one point on that surface.

---

## Same command, run twice &mdash; the creative engine is open

Run `/reimagine-it webpage` on the same source twice and you get **two visibly different draws** &mdash; not the same page reprinted. The engine samples a fresh combination each run along six axes: **ground / palette weighting**, **hero move**, **plate style**, **motion budget**, **type accent**, **3D signature**. The content narrows the sub-space (a Texas notebook can't legitimately return a marine-caustics shader), but *inside* that sub-space the engine draws fresh every time.

![twins triptych: same Texas notebook source, two runs of /reimagine-it webpage, two visibly different draws -- draw A is a navy dashboard with a KPI skyline chart; draw B is a parchment field-guide with a hand-drawn Texas map and numbered letterpress plates](gold/webpage/twins.png?v=texas-4)

- **Draw A** &mdash; navy ground &middot; KPI skyline chart of the three places &middot; dashboard tiles &middot; counter-rise motion &middot; sans + mono &middot; lifted-card 3D. See [`gold/webpage/after.html`](gold/webpage/after.html).
- **Draw B** &mdash; parchment ground &middot; hand-drawn Texas map with pin markers + compass rose &middot; numbered letterpress plates with red drop caps &middot; bluebonnet-drift + compass-needle wobble &middot; italic serif &middot; inset-shadow deboss. See [`gold/webpage/after-2.html`](gold/webpage/after-2.html).

Both are correct outputs of the exact same command on the exact same source. They share the content-derived palette family (navy / cream / red / gold) and the lone-star motif &mdash; both derived from the source &mdash; but they pick different *anchors* for that palette and different creative moves.

**Reproducibility when you need it.** `--seed <n>` pins the sample so a specific draw is byte-equivalent across runs. `--variant a` / `--variant b` are named seeds &mdash; `a` reproduces Draw A, `b` reproduces Draw B, and the pack ships extra letters as they land. Everything else runs fresh by default.

```
/reimagine-it webpage                  # fresh sample every time
/reimagine-it webpage --variant a      # reproduce Draw A (navy dashboard)
/reimagine-it webpage --variant b      # reproduce Draw B (parchment field-guide)
/reimagine-it webpage --seed 42        # pin an arbitrary sample
```

Regenerate the triptych locally: `python gold/compare.py` (writes `gold/webpage/twins.png` alongside every per-pack compare).

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
| **Form** | `webpage` \| `pdf` \| `slides` \| `document` \| `code` \| `cli` \| `protocol` \| ... | Force the medium. |
| **Domain** | `webpage artistic` \| `dashboard` \| `photography` \| `cinematic` \| `landing` \| `portfolio` | Force the aesthetic. See [`references/domains/`](skills/reimagine-it/references/domains/). |
| **Modifier** | `webpage cinematic glassmorphism` \| `bento` \| `neon` \| `brutalism` \| `neumorphism` \| `handdrawn` | Layer a UI/UX style on any domain. See [`references/modifiers/`](skills/reimagine-it/references/modifiers/). |
| **Font** | `--font "Playfair Display, Iowan Old Style, Georgia, serif"` | Pin display / body family. Full stack. No webfont fetch unless `--allow-fetch`. |
| **Lock** | `lock <path> as <name>` then `--ref <name>` | Capture design DNA (palette, type, motifs, motion, 3D) and reuse it &mdash; even across media. |

Compose freely: `/reimagine-it webpage artistic glassmorphism --font "Playfair Display, serif" --ref house-cinema`.

---

## Before &rarr; after, one command at a time

Every section below has the **same naive Texas-notebook HTML on the left** &mdash; [`gold/webpage/before.html`](gold/webpage/before.html). **The `/reimagine-it` output is on the right.** The only thing that changed between rows is the token you pass. Regenerate the whole set: `python gold/compare.py`.

### Default spine &mdash; `/reimagine-it webpage`

**Before:** the raw HTML in the browser default. Times New Roman, no hierarchy, no motion, no motif.
**After:** the same content, redesigned &mdash; 12-column grid, palette derived from the content (navy for the flag, cream for parchment, red and gold for the star), KPI-style tiles for Places / Signals / Contact, a lone-star lockup in the masthead because the source names the flag. Nothing added that isn't already in the source page. See [`gold/webpage/after.html`](gold/webpage/after.html).

![default spine before/after: raw Texas notebook on the left, redesigned page on the right](gold/webpage/compare.png?v=texas-4)

### `artistic` &mdash; `/reimagine-it webpage artistic`

**Before:** same raw Texas notebook.
**After:** editorial cream + italic serif at hero scale. `Texas & the Lone Star REPUBLIC` set in a swaying ampersand that pitches &plusmn;3&deg; on a slow cycle. Drifting SVG arcs behind the type read as sunset rays over the prairie. Cards for Alamo / Big Bend / Austin fan out at real &plusmn;16&deg; with a 40 px drop-shadow &mdash; the 3D reads in a still. See [`gold/domains/artistic/after.html`](gold/domains/artistic/after.html).

![artistic pack before/after: raw HTML on the left, italic-serif editorial redesign of the Texas notebook on the right](gold/domains/artistic/compare.png?v=texas-4)

### `dashboard` &mdash; `/reimagine-it webpage dashboard`

**Before:** same raw Texas notebook.
**After:** operator grid on navy. Sun-gold KPI tiles across the top read counted from the source (`3 places`, `3 signals`, `190 years`, `800K acres`). Live SVG traffic chart with a rising-bar animation. Status pills for `alamo` / `big bend` / `austin`. Blinking-caret terminal card sends `notes@texasnote.example`. Same three items, same content &mdash; read as a real ops surface. See [`gold/domains/dashboard/after.html`](gold/domains/dashboard/after.html).

![dashboard pack before/after: raw HTML on the left, ops-surface dashboard for the Texas notebook on the right](gold/domains/dashboard/compare.png?v=texas-4)

### `photography` &mdash; `/reimagine-it webpage photography`

**Before:** same raw Texas notebook.
**After:** a magazine folio. Didot-scale italic-then-caps nameplate reads `Texas / NOTES`. Numbered plate strip: `Plate I &middot; 1839 &middot; Austin`, `Plate II &middot; 1944 &middot; Big Bend`, `Plate III &middot; 1836 &middot; Alamo`. Three real SVG "photographs" (drawn on the page, not stock). Dropcap paragraphs. Deliberately quiet motion &mdash; a folio doesn't twitch. See [`gold/domains/photography/after.html`](gold/domains/photography/after.html).

![photography pack before/after: raw HTML on the left, Didot magazine folio of the Texas notebook on the right](gold/domains/photography/compare.png?v=texas-4)

### `cinematic` &mdash; `/reimagine-it webpage cinematic`

**Before:** same raw Texas notebook.
**After:** an inline `<canvas>` + inline fragment shader (`<script type="x-shader/x-fragment">`) drawing a **Texas-sunset raymarched interference field** (navy &rarr; sun gold &rarr; star red). Chosen because the source page names the Lone Star and the Colorado River &mdash; a marine-biology source would render a caustics-and-current shader instead. No CDN, no `import` from `https://`, no vendor folder. Masthead sits on top with `mix-blend-mode: difference` so type reads over any color the field draws. Cards for Austin / Big Bend / Alamo fan in real 3D. See [`gold/domains/cinematic/after.html`](gold/domains/cinematic/after.html).

![cinematic pack before/after: raw HTML on the left, WebGL2 Texas-sunset shader hero on the right](gold/domains/cinematic/compare.png?v=texas-4)

### `cinematic` + `glassmorphism` &mdash; `/reimagine-it webpage cinematic glassmorphism`

**Before:** same raw Texas notebook.
**After:** the same sunset shader keeps running. Glassmorphism layers a **front tier** (14 px blur) over the masthead and a **deep tier** (24 px blur) over a data tile. Light-source-consistent borders (bright top-left inset, dark bottom-right inset), colored `box-shadow`s. Blur **reveals** the running sunset; it never covers a solid color. See [`gold/modifiers/cinematic-glassmorphism/after.html`](gold/modifiers/cinematic-glassmorphism/after.html).

![cinematic + glassmorphism before/after: raw HTML on the left, two glass tiers over a running Texas sunset on the right](gold/modifiers/cinematic-glassmorphism/compare.png?v=texas-4)

### `dashboard` + `bento` &mdash; `/reimagine-it webpage dashboard bento`

**Before:** same raw Texas notebook.
**After:** a named-cell CSS Grid with `grid-template-areas: "brand brand hours state" "hero hero chart chart" "hero hero latency logs" "stack stack incidents incidents"`. Nine tiles, unequal but shared chrome, each holding one bit of the source (places / signals / hours / chart / logs). Hero tile visibly elevated (`translateZ(24px)` + 40 px shadow). See [`gold/modifiers/dashboard-bento/after.html`](gold/modifiers/dashboard-bento/after.html).

![dashboard + bento before/after: raw HTML on the left, nine-tile bento of the Texas notebook with elevated 2x2 hero on the right](gold/modifiers/dashboard-bento/compare.png?v=texas-4)

### `landing` + `neon` &mdash; `/reimagine-it webpage landing neon`

**Before:** same raw Texas notebook.
**After:** a dark void ground with a single radial-gradient vignette. **One** high-chroma accent (`#e8a63f` &mdash; sun gold) doing every emotional job: the italic *note* word (kinetic &mdash; pulses letter-spacing on a 4 s cycle), the orbital SVG with a lone star at the center that draws itself on load, the CTA border, the blinking cursor. Glow via double `drop-shadow`. Gold picked because the source names the Lone Star. See [`gold/modifiers/landing-neon/after.html`](gold/modifiers/landing-neon/after.html).

![landing + neon before/after: raw HTML on the left, one glowing sun-gold star in a dark void on the right](gold/modifiers/landing-neon/compare.png?v=texas-4)

---

## Motion is real (three frames per pack)

Screenshots freeze animation, so every claim about motion proves itself in a strip. Three frames per pack, spaced ~1.6 s apart in virtual time &mdash; if the pixels change, the motion budget landed:

![motion strip: four packs, three frames each](gold/domains/motion-strip.png?v=texas-4)

- **cinematic** &mdash; WebGL2 raymarch field evolves visibly frame to frame.
- **artistic** &mdash; italic ampersand sways &plusmn;3&deg;.
- **dashboard** &mdash; chart bars rise into place between frames.
- **photography** &mdash; deliberately still.

---

## Not just webpages &mdash; PDF &middot; document &middot; slides &middot; anything

Point at any file. Force any output:

| Token | Pack | Regenerator |
|-------|------|-------------|
| `pdf` | [forms/pdf.md](skills/reimagine-it/references/forms/pdf.md) | Weasyprint (HTML &rarr; PDF) or ReportLab (print-native Python) |
| `document` / `docx` / `md` | [forms/document.md](skills/reimagine-it/references/forms/document.md) | python-docx, pandoc, or LaTeX |
| `slides` / `pptx` / `deck` | [forms/slides.md](skills/reimagine-it/references/forms/slides.md) | python-pptx or reveal.js |
| `universal` | [forms/universal.md](skills/reimagine-it/references/forms/universal.md) | Detects file type, dispatches, or writes a companion overlay |

Every non-web pack keeps the same bar: cover magnet, one data-driven plate, one repeating motif, one make-strange move, real content from *your* file, **palette and motifs derived from what your file is about**. All regenerators are free, offline, locally installable.

---

## Lock &mdash; capture a shipped design, reuse it anywhere

Once a design lands, save its DNA:

```
/reimagine-it lock gold/domains/cinematic/after.html as house-cinema
```

The skill extracts palette + type stack + motifs + motion + 3D + section structure into a markdown pack under [`references/locks/`](skills/reimagine-it/references/locks/). Example: [`house-cinema.md`](skills/reimagine-it/references/locks/house-cinema.md).

Apply a lock to a new target &mdash; **same medium or a different one**:

```
/reimagine-it webpage --ref house-cinema
/reimagine-it slides  --ref house-cinema
/reimagine-it pdf     --ref house-cinema
```

Locks include a **cross-medium translation table** so a webpage lock informs a slides deck or a PDF (a `rotateY(9deg) translateZ(-8px)` card becomes a pptx panel with paired shadows; a WebGL shader hero becomes a snapshot PNG cover). Locks are portable text &mdash; share via gist, commit, or copy-paste.

---

## Everything on this page is tested

Every visual is a real file in this repo, generated locally by a script you can rerun:

| Regenerates | Command |
|-------------|---------|
| Master gallery (`gold/gallery.png`) + per-pack heroes | `python gold/gallery.py` |
| Per-pack before/after compares + twins triptych (`gold/webpage/twins.png`) | `python gold/compare.py` |
| Default before + after screenshots (`gold/webpage/*.png`) | `python gold/webpage/run.py` |
| Motion strip (`gold/domains/motion-strip.png`) | `python gold/domains/motion-run.py` |
| Skill smoke fixture (`gold/reimagine.py`) | `python gold/reimagine.py --ship` |
| Apply Lone-Star visual sweep (palette + star + sunset shader) | `python gold/theme_texas.py` |
| Apply Texas-notebook content across all after pages | `python gold/content_texasify.py` |

If a regenerator fails on your machine, that's a bug &mdash; please open an issue. Nothing on this page is rendered by a third-party service or fetched from a CDN.

---

## If this helps you

If `/reimagine-it` gives you an output you'd have paid a designer for, three ways to help me keep shipping the next domains, form packs, and locks:

- **Star the repo.** It's the single fastest signal that this project should keep growing. Use the star button at the top of the page.
- **[Sponsor on GitHub &rarr;](https://github.com/sponsors/kazimrmerchant)** Any tier keeps the studio's lights on. Sponsors get priority on custom domain packs and roadmap input.
- **Contribute a domain or a lock.** Open a PR under [`skills/reimagine-it/references/domains/`](skills/reimagine-it/references/domains/) or [`references/locks/`](skills/reimagine-it/references/locks/). Real content beats a spec.

Say hi on [GitHub](https://github.com/kazimrmerchant).

---

MIT licensed &mdash; see [LICENSE](LICENSE). Skill spec: [agentskills.io](https://agentskills.io/specification).
