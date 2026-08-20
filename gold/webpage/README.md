# /awe-me webpage — before / after

Two files with the same three projects, the same one-line bio, and the same email.

- [`before.html`](before.html) — a plausibly-normal plain user page (no CSS beyond browser default).
- [`after.html`](after.html) — the same content held by a designed page. Dark palette, 8px baseline, four levels of type, one repeating motif (the skyline pattern), a "Now" status table, and a shell-command contact block.

## Re-shoot

```powershell
python gold/webpage/run.py
```

Writes:

- `before.png` — headless screenshot of `before.html`
- `after.png` — headless screenshot of `after.html`
- `compare.html` — the side-by-side page
- `compare.png` — the headline image embedded in the main README

Requires Google Chrome or Microsoft Edge on disk. Override with `AWE_BROWSER=<full path to msedge.exe or chrome.exe>` if the script cannot find one.

## Why this is here

`/awe-me webpage` should ship a **10× redesign, not a repaint.** The design rules that make that reliable live in [`skills/awe-me/references/webpage-craft.md`](../../skills/awe-me/references/webpage-craft.md). This folder is the live gold that file points at.
