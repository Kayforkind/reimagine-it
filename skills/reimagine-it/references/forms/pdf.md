# /reimagine-it pdf

Load when the user forces `pdf`, or when the target is a `.pdf` and the router picked this form.

## Two paths

### Path A — HTML → PDF via Weasyprint (preferred for design leaps)

1. Read the source (if PDF, extract text with pdfplumber; if markdown / docx, load it directly).
2. Reimagine the content as a webpage using the shared spine + any active domain / modifier / --ref pack.
3. Add print-specific CSS: `@page { size: A4; margin: 24mm 18mm; }`, `@page:first { margin-top: 40mm; }`, `page-break-before: always;` on section starts.
4. Run: `weasyprint <input.html> <output.pdf>` (Python) or `python -m weasyprint <input.html> <output.pdf>`.
5. Verify: open the PDF in a viewer. Check that page breaks land where intended (not mid-plate). Check that colors are consistent (Weasyprint honors modern CSS colors).

Install: `pip install weasyprint`. Note: Weasyprint on Windows needs GTK — see [weasyprint install docs](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html). If GTK is unavailable, fall back to Path B.

### Path B — ReportLab (print-native, no HTML)

For fully print-native output (bleed, spot colors, precise typography, no CSS quirks):

1. Read the source; extract text + structure.
2. Compose the PDF as a Python program using ReportLab's `platypus` (paragraphs, tables, figures) or the low-level `canvas` API for full control.
3. Ship a `reimagine.py` alongside the output PDF so the user can rerun.
4. Verify: open in a viewer + check that fonts are embedded (`pdftk file.pdf dump_data`).

Install: `pip install reportlab`.

## Cover / hero rules

- First page has a full-bleed spread, not a title-and-subtitle-centered slate.
- The cover typography is at a print-appropriate scale (44–72 pt display, tracked tight).
- One diagram, one repeated motif, one pull-quote — do this on the cover so the file *starts* like an object.

## Interactive PDF affordances (optional but strong)

- Anchor-linked table of contents (`<a name="section-1"/>` in the HTML source or ReportLab bookmarks).
- Section index rail as a header on every page.
- Data tables that are actually selectable text (not raster).
- Real fonts embedded (Weasyprint does this by default; ReportLab requires `pdfmetrics.registerFont`).

## Modifier compatibility

- `glassmorphism`: print does not do backdrop-filter. Substitute with layered translucent panels (rgba fills over a real background image).
- `bento`: works well in print; the grid becomes a page-level layout.
- `neon`: use spot colors (Pantone) for the accent; the "glow" becomes an offset color-shifted shadow behind the accent element.
- `cinematic`: capture one shader frame as a raster PNG for the cover; the rest of the deck is quiet.

## Report addition

```
Form: pdf
Path: <input tool: weasyprint | reportlab>
Pages: <count>
Cover: <what the first spread does>
Motif: <the one thing that repeats>
Interactive: <any anchors / bookmarks>
Embedded fonts: <count>
```

## Where to write

`<workspace>/reimagined/<yyyy-mm-dd>-<slug>.pdf` (or a `<slug>/index.pdf` if there are companion files like source HTML, `reimagine.py`, or extracted images).
