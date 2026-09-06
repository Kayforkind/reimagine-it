# reimagine-it v2.13.1 — the last similarity floor falls

*Paste-ready dev.to article. Cover image: `docs/og.png`. Tags: `ai`, `webdev`, `css`, `opensource`.*

---

v2.11.0 fixed every converging token cluster but one. The benchmark's floor
was **webpage + landing at 76% class-set difference** — on the same source,
two of the seventeen directions still shipped pages that were a quarter the
same. The issue said it plainly: they share section-listing DNA because both
are reading pages.

v2.13.1 closes it with composition, not color swaps.

## Landing grows its own hero form

Landing stopped borrowing webpage's closing bands and now ships three
original systems, all derived from your source:

- **The orbit map.** Your anchors become nodes on concentric rings around
  the first letter of your title. Radius comes from a content hash, angle
  from position, and any measurable fact rides the node as an orbit value.
  It is a navigable picture of your page's own structure — not a decorative
  disc.
- **The proof strip.** A marquee of verbatim source facts — every number and
  its label from your file — replacing the shared stats band.
- **The credit wall.** The closing section groups the links, emails, and
  dates the source itself carries. Your contact surface becomes the design.

Measured result: **webpage+landing 76% → 91.7%**. Mean across all 136
token pairs: **96.8%**. The floor of the matrix is now two genuinely
different products.

## Three more real pages, and the hardest kinds yet

The public-source proof lane doubled. Joining the NPS bulletin, NASA's
Artemis II, and the NOAA hurricane outlook:

- **Census Bureau income brief (P60-282)** — nine dollar figures that must
  survive. Auto routes it to `infographic`; fidelity **21/21, 100%**.
- **Federal Register FOIA rule** — pure procedural voice: dates, citations,
  no marketing rhythm. Auto picks `simulation`; **17/17, 100%**, audit
  clean 19/19.
- **Smithsonian's Apollo 11 command module** — descriptive object copy.
  `simulation` again; **21/21, 100%**.

None declare a palette. The engine derived color from language alone. All
three regenerate byte-identically in CI — the reproduction guard now covers
**17 artifacts**.

## The agent path, made findable

The skills.sh-facing skill descriptions listed 12 of the 17 tokens — anyone
searching "editorial" or "glass" could not find the skill. Both descriptions
now carry the full roster, and `docs/LISTINGS.md` ships paste-ready copy for
the directories that take manual submissions. Install stays two doors:

```bash
npx reimagine-it --auto -i page.html -o redesign.html   # the engine
npx skills add Kayforkind/reimagine-it                  # the agent skill
```

## Still the same contract

Seventeen directions × 4 representative sources at 100/100 usability and
full fidelity, 19-rule Design Health audit, fuzzed honesty layer, offline
deterministic single-file output. Every claim in the README and on the docs
site is CI-guarded against drift.

---

Try it: the [live playground](https://kayforkind.github.io/reimagine-it/#playground) ·
npm: `reimagine-it` · GitHub: [Kayforkind/reimagine-it](https://github.com/Kayforkind/reimagine-it)
