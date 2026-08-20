# Non-webpage form packs

Load one of these packs when the form router (or a user category token) picks a **non-web** medium:

| Token | Pack | Regeneration tool |
|-------|------|-------------------|
| `pdf` | [pdf.md](pdf.md) | Weasyprint (HTML → PDF, honors CSS) or ReportLab (Python DSL for print-native control) |
| `document` / `docx` / `md` | [document.md](document.md) | python-docx (docx), pandoc (md ↔ everything), or LaTeX for print-quality |
| `slides` / `pptx` / `deck` | [slides.md](slides.md) | python-pptx (pptx), reveal.js (HTML deck), or LaTeX Beamer |
| `universal` | [universal.md](universal.md) | Detects the input format, picks the right tool, falls back to "reimagine into an accompanying HTML overlay" if no in-place regeneration is possible |

## Shared bar for any non-web output

Every non-web output must land the medium's equivalent of the webpage spine:

1. **Cover / hero** — first page / first slide / first spread has a magnet that is not a title-and-bullets card.
2. **One inline diagram or data plate** — real values, real geometry (not a decorative icon).
3. **A repeating motif** — carried across pages / slides so the artifact reads as one object.
4. **A make-strange move** — pick one from the list in [../webpage-craft.md](../webpage-craft.md) that translates to this medium (skyline, section index, reveal-the-geometry, content-type change).
5. **Same words as the source.** Do not invent, add fake stats, or replace real names with lorem.
6. **Motion / interaction** where the medium supports it — reveal.js fragments, LibreOffice smart animations, hyperlinked PDF anchors.
7. **Opens in the native app.** A .docx opens in Word / LibreOffice; a .pptx opens in PowerPoint / LibreOffice / Keynote; a .pdf opens in any viewer.

## No paid APIs

All tools referenced here are free and offline. Do not swap ReportLab for a paid image API. Do not send content to a hosted "make my slides beautiful" service.
