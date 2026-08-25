# Case study — Orbitline Release Desk

## The job
operational notes → **`dashboard`** (Auto selection, score **166**)

> The source contains enough measurable signals for an operational view. Evidence: 5 anchors, 3 measurable facts.

## Reproduce it

```bash
npm run auto --   -i examples/end-users/orbitline/source.html   -o /tmp/orbitline.html   --report /tmp/orbitline.json   --seed 11
```

Open `/tmp/orbitline.html` and inspect `/tmp/orbitline.json`. The seed is fixed so the output is bit-for-bit reproducible; your own source file is never overwritten.

## Bundle contents

| File | What it is |
|---|---|
| [source.html](source.html) | the plain HTML input |
| [auto.html](auto.html) | Auto-selected output — `dashboard` |
| [before-after.gif](before-after.gif) | proof on desktop and phone |
| [auto.json](auto.json) | full Auto report (rationale, candidates, fidelity) |

## Alternatives

- [option 2-infographic](option-2-infographic.html)
- [option 3-webpage](option-3-webpage.html)

## Proof

![Before → after for Orbitline Release Desk](before-after.gif)

## Report highlights

- **Quality checks:** 8/8 passed (standalone HTML, title preserved, anchors retained, focus-visible, reduced motion, selection styling, no placeholder copy, no external fetch).
- **Source fidelity:** 67% — 10 of 15 detected source elements preserved.
- **Why it is here:** dense status information gets hierarchy and scan paths
