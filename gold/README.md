# Gold fixtures

Public examples live in [`examples/end-users/`](../examples/end-users/). This tree is the skill's clone-scan and craft-floor fixture set (Texas notebook + Jules Ice Cream), plus the smoke script `reimagine.py`.

| Source | Naive file | How to open |
|--------|------------|-------------|
| **Texas notebook** | [`webpage/before.html`](webpage/before.html) | `python -m http.server` in `gold/forms/` then [see.html](forms/see.html) |
| **Jules Ice Cream** | [`jules/before.html`](jules/before.html) | [jules/webpage/after.html](jules/webpage/after.html) (HTTP for 3js) |

Texas SVG weenie is the **Lone Star flag** (white star, white over red). Jules is a parlor / cone / freezer / flavor board — not a Texas reskin.

Review: `python scripts/review_gold.py`

---

## Reverse-demo smoke

Fail is a vibe list (exit 1). Ship is the same context as one JSON artifact (exit 0).

```text
python gold/reimagine.py          # FAIL
python gold/reimagine.py --ship   # SHIP → gold/shipped.json
```

Open `index.html` for the same two beats without Python.

