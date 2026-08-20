# /reimagine-it universal — reimagine any file

Load when the user forces `universal`, or when they pointed at a file the router does not recognize.

## Detect and dispatch

1. Inspect the file extension **and** the file's magic bytes.
2. Route:

| Extension / magic | Dispatch to |
|-------------------|-------------|
| `.html` `.htm` | [../webpage-craft.md](../webpage-craft.md) + relevant domain / modifier |
| `.pdf` | [pdf.md](pdf.md) |
| `.docx` `.doc` | [document.md](document.md) → Path A (python-docx) |
| `.md` `.markdown` `.mdx` | [document.md](document.md) → Path B (pandoc / md-native) |
| `.pptx` `.ppt` `.key` | [slides.md](slides.md) |
| `.mobi` `.azw3` `.epub` `.kf8` | [document.md](document.md) → Path C (ebook: extract with `mobi` / `ebooklib`, ship an HTML reading room + a same-format ebook twin) |
| `.svg` | inline SVG craft (see [../../examples.md](../../examples.md)) |
| `.json` `.yaml` `.toml` `.csv` | infographic form — visualize the schema + real values |
| `.py` `.js` `.ts` `.rs` `.go` and other source code | `code` form — the leap is inside the code (API surface, error message, first-run demo), not a graphic |
| `.log` `.txt` (mixed content) | ask if this is prose (`document`), data (`infographic`), or logs (`experiment` form) |
| Unknown | ask one question: "What is this file for?" and route based on the answer |

## Reimagine-in-place vs reimagine-as-companion

Two ways to ship:

- **In-place**: regenerate the file in the same format (docx → new docx, pdf → new pdf, mobi → new mobi). Requires the right toolchain and full permission to overwrite.
- **Companion overlay**: leave the source untouched; write a `<yyyy-mm-dd>-<slug>-reimagined/` folder next to it that contains the redesigned version + a `README.md` describing what changed.

Default to companion overlay. Ask before overwriting a source file.

## Same-format twin default (do not silently drop)

If the source's native format is itself a viable output medium (`.pdf`, `.docx`, `.pptx`, `.mobi`, `.azw3`, `.epub`, `.md`, `.html`), the default shipment is **two artifacts**:

1. a **companion HTML** reading room in `<slug>-reimagined/index.html` — on-screen review, screenshot target, visual verification bed;
2. a **same-format twin** in the source's native format (`.pdf` in → `.pdf` out; `.mobi` in → `.mobi` out; `.pptx` in → `.pptx` out), also inside `<slug>-reimagined/`.

Never ship the HTML alone when the input was a distributable ebook / document / deck. The user picked that format because they want to hand it around in that format.

If the same-format twin toolchain is not present on the current machine, do **not** silently drop it. Ship the HTML, then in the report:

- name the missing tool (e.g. `kindlegen` / `Calibre CLI` for `.mobi`; `LibreOffice --headless` for `.pptx` / `.docx`; `weasyprint` for HTML → PDF);
- name the exact next command that would produce the twin (e.g. `calibre ebook-convert <slug>-reimagined/index.html <slug>-reimagined/<slug>.mobi --no-default-epub-cover`);
- offer to install/run it.

`--ask-format` flips this default into a one-shot question: `Ship as: (1) HTML + same-format twin [default]  (2) HTML only  (3) same-format twin only`.

## Same-format toolchains (quick reference)

| Source | Same-format twin regenerator |
|--------|-------------------------------|
| `.pdf` | `weasyprint <index.html> <out.pdf>` — or headless Chrome `--print-to-pdf` for animated pages |
| `.docx` | `python-docx` for programmatic build; `pandoc index.html -o out.docx` for HTML → docx |
| `.pptx` | `python-pptx` for programmatic build; `libreoffice --headless --convert-to pptx <src>` for HTML/PDF → pptx |
| `.md` | write directly from the parsed AST |
| `.mobi` / `.azw3` | `calibre ebook-convert <index.html> <out.mobi> --no-default-epub-cover` — verify open in Kindle Previewer |
| `.epub` | `pandoc index.html -o out.epub` or `ebooklib` for programmatic build |
| `.html` | write directly; this is the reading room |

## Visual verification (mandatory for every render)

Before reporting `shipped`, render every hero into an image and manually scan the image for:

- **Blank plates / placeholder labels** — no element may literally read `blank`, `placeholder`, `TBD`, `TODO`, `lorem`, `sample text`, `caption`, `Title goes here`, `…`, or `[…]`. If a slot has no real content from the source, **delete the slot**.
- **Clipped / overlapped text** — no label is cut off by a foreground shape (e.g. `POST OFFICE` rendered as `POST O CE` because a slip shape overlays it).
- **Broken images / empty SVGs** — no `alt=` text is showing where a picture should be. No `<svg>` renders as an empty box.
- **Off-palette accents** — every colored element is on the content-derived palette; no stray CSS-default blue link, no browser-default `<button>` chrome.
- **Fabricated content** — every copy string on the render actually appears in the source (or is a caption/index the skill added). No made-up place names, dates, statistics, or people.
- **Motion proof** if the pack claims motion (two frames, different hashes).

If any of these fail and cannot be fixed in one pass, ship `partial` and name the specific bug. Never dress a placeholder up as done.

## Bar (same as all forms)

- One magnet in the first encounter (first page / first sentence / first plot / first command)
- Real content from *this* file; no lorem, no invented facts
- One repeating motif
- One make-strange move
- If the target medium supports motion / interactivity, at least one beat

## Report addition

```
Form: universal → <resolved form>
Source: <path>
Formats: <shipped list, e.g. "html + mobi twin" | "html only (kindlegen missing — next: calibre ebook-convert ...)">
Output: <paths>
Visual verify: <no blank plates? no clipped text? palette on-source? motion advanced?>
Notes: <what the router picked and why>
```
