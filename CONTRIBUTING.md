# Contributing to reimagine-it

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

Real content beats a spec. The fastest way to improve `/reimagine-it` is to add a real source, then a real domain/modifier/form/lock if you have time.

## First contribution (about 20 minutes)

You do not need a domain pack. Open one of the [good first issues](https://github.com/Kayforkind/reimagine-it/labels/good%20first%20issue), or send a PR with any of:

1. **A new `source.html`** for a job the seven journeys do not cover (bakery, clinic, city budget, album notes). Put it under `examples/end-users/<slug>/source.html` and run `npx reimagine-it --auto -i source.html -o auto.html --report auto.json --seed 1`. Attach the Auto token Auto picked.
2. **A docs fix** — a stale token name, a broken still, a score that no longer matches `auto.json`.
3. **A screenshot** of Auto on *your* page (desktop PNG, 1400×1100 is enough).

Use the **Example source** or **Docs or screenshot** issue forms. Pack PRs (table below) are welcome after that.

## What we accept

| Kind | Goes under | You must ship |
|------|------------|---------------|
| **Domain pack** | [`skills/reimagine-it/references/domains/`](skills/reimagine-it/references/domains/) | A `<name>.md` pack (palette / typography / motifs / motion / 3D / structure) **plus** a working `gold/domains/<name>/after.html` that redesigns the shared source ([`gold/webpage/before.html`](gold/webpage/before.html)) using the pack. |
| **Modifier pack** | [`skills/reimagine-it/references/modifiers/`](skills/reimagine-it/references/modifiers/) | A `<name>.md` pack (what the modifier layers on top: blur / grid / glow / etc.) **plus** at least one `gold/modifiers/<domain>-<name>/after.html` stacked on an existing domain. |
| **Form pack** | [`skills/reimagine-it/references/forms/`](skills/reimagine-it/references/forms/) | A `<name>.md` pack (regenerator, cross-medium translation table) **plus** a working example under `gold/forms/<name>/` when the form supports it. |
| **Lock** | [`skills/reimagine-it/references/locks/`](skills/reimagine-it/references/locks/) | A `<name>.md` lock (palette + type + motifs + motion + 3D + cross-medium table) captured from a shipped page. |

## Non-negotiables

1. **Content narrows the design** — palette / motifs / motion must be justifiable from the source. The gold reference source names Texas, the Lone Star, and Big Bend; your pack must show its work for whatever content you pick.
2. **No CDN, no paid API, no third-party service** — every visual must render offline from a single `.html` (or the pack's stated form) so anyone can rerun it locally.
3. **Motion must prove itself in a still or a strip** — either it reads in a frozen screenshot (e.g. real 3D rotation), or ship a strip in `gold/domains/motion-strip.png`.
4. **No AI-generated stock imagery** — SVG / real screenshots / hand-set type only. Real content only.
5. **Ship a regenerator** — if you add images to the repo, add the script that produces them, and wire it into the "Everything on this page is tested" table in [README.md](README.md).
6. **License** — you agree to release your contribution under this repo's MIT license.

## PR checklist

- [ ] New pack file lives under the right `references/<kind>/` directory
- [ ] Working `gold/<kind>/<name>/after.html` (or form equivalent) is included
- [ ] The `after.*` file renders offline (no CDN, no `import from 'https://'`)
- [ ] A regenerator script exists and is wired into the README table
- [ ] Palette / motifs / motion decisions cite the source content
- [ ] No proprietary fonts fetched (either system stacks or `--allow-fetch` documented)
- [ ] No AI-generated stock images

## How to develop locally

```bash
git clone https://github.com/Kayforkind/reimagine-it.git
cd reimagine-it

# Test everything (gold audit + smoke + unit tests):
npm test

# Run just the CLI unit tests:
npm run test:unit

# Audit gold output quality (32 files, 0 failures expected):
npm run audit

# Regenerate everything:
python gold/shots.py          # per-pack full-page after.png
python gold/gallery.py        # master gallery + tile heroes
python gold/compare.py        # twins triptych + per-pack wide compares
python gold/domains/motion-run.py   # motion strip
```

Chrome or Edge must be on the `PATH`, or set `REIMAGINE_BROWSER=<full path to chrome.exe>`.

### CLI development

The standalone CLI lives in `bin/reimagine-it.js` with core logic in `src/extract.js` and `src/generate.js`. Test any token:

```bash
node bin/reimagine-it.js -i gold/webpage/before.html -t svg --dry   # preview extraction
node bin/reimagine-it.js -i gold/webpage/before.html -t 3js -o /tmp/test.html
node bin/reimagine-it.js --list                                     # list all tokens
```

## Questions

Open an issue with the tag `question`. For bigger design proposals (a whole new form family, e.g. `/reimagine-it video`), open an issue first so we can align before you ship.

Thanks for making the skill sharper.
