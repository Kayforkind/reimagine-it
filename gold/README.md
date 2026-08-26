# Gold

For fresh, realistic end-user examples (observability, hospitality, and essay content), start with [`examples/end-users/`](../examples/end-users/) rather than the curated Texas fixtures.

Two naive sources. Same tokens. Different DNA. GitHub.com file view is **source**, not a live page.

| Source | Naive file | Looping GIF | How to open |
|--------|------------|-------------|-------------|
| **Texas notebook** | [`webpage/before.html`](webpage/before.html) | [`forms/examples.gif`](forms/examples.gif) | `python -m http.server` in `gold/forms/` then [see.html](forms/see.html) |
| **Jules Ice Cream** | [`jules/before.html`](jules/before.html) | [`jules/best.gif`](jules/best.gif) | [jules/webpage/after.html](jules/webpage/after.html) (HTTP for 3js) |

Texas SVG weenie is the **Lone Star flag** (white star, white over red). A gold star on parchment is a logo, not that flag. Jules is a parlor / cone / freezer / flavor board.

X copy: [`POST.md`](POST.md). Review: `python scripts/review_gold.py`

---

## Reverse-demo smoke

Fail is a vibe list (exit 1). Ship is the same context as one JSON artifact (exit 0).

```text
python gold/reimagine.py          # FAIL
python gold/reimagine.py --ship   # SHIP → gold/shipped.json
```

Open `index.html` for the same two beats without Python.

