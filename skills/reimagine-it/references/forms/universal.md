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
| `.svg` | inline SVG craft (see [../../examples.md](../../examples.md)) |
| `.json` `.yaml` `.toml` `.csv` | infographic form — visualize the schema + real values |
| `.py` `.js` `.ts` `.rs` `.go` and other source code | `code` form — the leap is inside the code (API surface, error message, first-run demo), not a graphic |
| `.log` `.txt` (mixed content) | ask if this is prose (`document`), data (`infographic`), or logs (`experiment` form) |
| Unknown | ask one question: "What is this file for?" and route based on the answer |

## Reimagine-in-place vs reimagine-as-companion

Two ways to ship:

- **In-place**: regenerate the file in the same format (docx → new docx, pdf → new pdf). Requires the right toolchain and full permission to overwrite.
- **Companion overlay**: leave the source untouched; write a `<yyyy-mm-dd>-<slug>-reimagined/` folder next to it that contains the redesigned version + a `README.md` describing what changed.

Default to companion overlay. Ask before overwriting a source file.

## Bar (same as all forms)

- One magnet in the first encounter (first page / first sentence / first plot / first command)
- Real content from *this* file; no lorem
- One repeating motif
- One make-strange move
- If the target medium supports motion / interactivity, at least one beat

## Report addition

```
Form: universal → <resolved form>
Source: <path>
Output: <path>
Notes: <what the router picked and why>
```
