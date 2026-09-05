---
name: reimagine-it-extract
description: >-
  Emit the content signals reimagine-it reads from an HTML file — title,
  anchors, proper nouns, dates, numbers, emails, links, source hex colors,
  and the derived palette — as JSON without generating a redesign. Use when
  the user says /reimagine-it extract, "what does the engine see in this
  page", "extract the palette", "pull the facts from this page", or wants
  content analysis for research, migration, or design-system work. CLI:
  npx reimagine-it extract -i page.html -o signals.json. Part of the
  reimagine-it Content-Derived Design suite.
license: MIT
metadata:
  author: Kayforkind
  version: "2.6.0"
  parent: reimagine-it
  hosts:
    - claude-code
    - cursor
    - codex
    - copilot
    - gemini-cli
keywords:
  - content-extraction
  - palette-extraction
  - content-analysis
  - design-signals
  - content-derived-design
category: Data
capabilities:
  - content-signal-extraction
  - palette-derivation
  - fact-inventory
trigger_phrases:
  - /reimagine-it extract
  - what does the engine see
  - extract the palette
  - pull the facts from this page
  - analyze this page's content
---

# /reimagine-it extract

**Parent:** [../SKILL.md](../SKILL.md) — the full Content-Derived Design engine. This sub-skill handles only the extraction surface — the honesty layer the whole method stands on.

The redesign is only as honest as its extraction. This verb emits exactly what
the engine reads, as JSON, without generating anything: title, profile,
density, derived palette, anchors, proper nouns, headings, dates, numbers,
emails, links, and source hex colors. Every extracted fact exists in the
source — property-tested against hostile and malformed input.

## Usage

```bash
npx reimagine-it extract -i page.html -o signals.json
cat page.html | npx reimagine-it extract -o -        # stdin → stdout
npx reimagine-it extract -i page.html --full -o signals.json  # + prose
```

Payload shape (default):

```json
{
  "source": "page.html",
  "title": "…",
  "profile": "restaurant | saas | civic | …",
  "density": "sparse | medium | dense",
  "palette": { "ground": "…", "accent": "…", "muted": "…", "surface": "…", "ink": "…" },
  "anchors": ["…"],
  "properNouns": ["…"],
  "headings": ["…"],
  "dates": ["…"],
  "numbers": ["…"],
  "emails": ["…"],
  "links": ["…"],
  "sourceHex": ["#6B3A2A"],
  "counts": { "paragraphs": 4, "listItems": 16 }
}
```

`--full` adds `paragraphs` and `items` (the raw prose arrays).

## Procedure

1. Run it before any redesign when the user asks "what would you even use
   from this page?" — the JSON answers with the engine's actual inputs.
2. To audit honesty: every `dates`, `numbers`, `emails`, and `links` entry
   must be findable in the source. Nothing else is allowed to appear.
3. Use it for migration/research: the payload is a stable, typed summary of
   a page's content — no redesign attached.

## Must not

- Add facts not present in the payload to any downstream summary
- Present the derived `palette` as colors the source *declared* — hex colors
  in `sourceHex` were in the source; the rest is derivation
- Round or "clean up" extracted numbers and dates; they are quotes

Part of [reimagine-it](https://github.com/Kayforkind/reimagine-it) — MIT.
