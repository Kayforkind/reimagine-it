# /reimagine-it document (docx / markdown)

> **Not a CLI feature.** `npx reimagine-it` reads and writes HTML only. Markdown can be wrapped as HTML and run through the engine. `.docx` export needs python-docx or pandoc on the host.

Load when the user forces `document`, `docx`, `md`, or when the target is a `.docx` / `.md` file **and they asked to keep that format**.

## Two paths

### Path A — Word document (`.docx`) via python-docx

For clients or workflows that require Word:

1. Read source (docx, txt, md).
2. Apply the reimagined structure: cover page, section headings styled from one theme, pull-quote blocks, at least one figure.
3. Build with `python-docx`:
   - Use style objects, not inline formatting. Every heading is `Heading 1 / 2 / 3` styled from a theme.
   - Define one paragraph style for pull-quotes (border-top + italic + one-color-shifted from body).
   - Insert figures with captions; do not paste raw base64.
   - Set page margins deliberately (`section.top_margin = Cm(2.5)`).
4. Verify: opens cleanly in Word / LibreOffice, styles are used (not overridden inline), table of contents auto-generates.

Install: `pip install python-docx`.

### Path B — Markdown (`.md`) via pandoc or plain-writer

For docs-as-code / GitHub / blog workflows:

1. Restructure the content: strong opening line, one figure early, section index at top for long docs (>2000 words), pull-quote before the middle, a signature move at the end.
2. Prefer front-matter (YAML) for metadata over inline "Author: X, Date: Y".
3. Use fenced code blocks with language tags; tables with alignment; footnotes for asides.
4. If the destination is a static site, propose a matching CSS theme (this is where a webpage --ref lock can inform the doc).

Optional pandoc pass: `pandoc <in.md> -o <out.docx> --reference-doc house.docx` to apply a house style.

## Cover / hero rules for documents

- Long-form docs (>2000 words): a title page (title + subtitle + a one-sentence claim + date + author) before the ToC.
- Short docs (< 500 words): no cover; instead, the first sentence *is* the magnet.
- Every document has a numbered section index at the top. This is do-the-work-of-a-nav.

## Modifier compatibility

- `glassmorphism`, `neon`, `cinematic`: not applicable (documents are read, not displayed as visuals). Ignore silently and use the base document bar.
- `bento`: applies if the doc has front-matter data — render it as a 2-4 column stat block at the top.
- `handdrawn`: applies via marginalia (hand-drawn SVG marks in the sidebar) if the target renderer supports SVG.

## Report addition

```
Form: document
Path: <docx | md | other>
Sections: <count>
Cover: <what the first page / first sentence does>
Motif: <the one thing that repeats>
Style basis: <house style / lock name / clean default>
```

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-<slug>.docx` or `<workspace>/reimagined/<yyyy-mm-dd>-<slug>.md`.
