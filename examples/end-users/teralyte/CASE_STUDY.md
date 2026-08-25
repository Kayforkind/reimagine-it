# Case study — Teralyte

## The job
plain infrastructure docs → **`dashboard`** (Auto selection, score **156**)

> The source contains enough measurable signals for an operational view. Evidence: 5 anchors, 2 measurable facts.

## Reproduce it

```bash
npm run auto --   -i examples/end-users/teralyte/source.html   -o /tmp/teralyte.html   --report /tmp/teralyte.json   --seed 11
```

Open `/tmp/teralyte.html` and inspect `/tmp/teralyte.json`. The seed is fixed so the output is bit-for-bit reproducible; your own source file is never overwritten.

## Bundle contents

| File | What it is |
|---|---|
| [source.html](source.html) | the plain HTML input |
| [auto.html](auto.html) | Auto-selected output — `dashboard` |
| [before-after.gif](before-after.gif) | proof on desktop and phone |
| [auto.json](auto.json) | full Auto report (rationale, candidates, fidelity) |

## Alternatives

- [option 2-landing](option-2-landing.html)
- [option 3-gradient](option-3-gradient.html)

## Proof

![Before → after for Teralyte](before-after.gif)

## Report highlights

- **Quality checks:** 8/8 passed (standalone HTML, title preserved, anchors retained, focus-visible, reduced motion, selection styling, no placeholder copy, no external fetch).
- **Source fidelity:** 64% — 9 of 14 detected source elements preserved.
- **Why it is here:** dense product facts get a confident, icon-forward identity
