---
name: reimagine-it-audit
description: >-
  Design Health — runs 19 deterministic quality checks on HTML output.
  Use when the user says /reimagine-it audit, "audit this page", "check design quality",
  or wants to verify craft-floor compliance before shipping. Catches blank plates,
  missing focus rings, non-compositor motion, off-palette accents, dead motion,
  fabricated content. No LLM, no API key. CI-ready with --json and exit codes.
  Part of the reimagine-it Content-Derived Design suite.
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
  - audit
  - quality-check
  - craft-floor
  - design-health
  - html-lint
  - accessibility-check
  - content-derived-design
category: Testing
capabilities:
  - html-audit
  - quality-verification
  - craft-floor-enforcement
trigger_phrases:
  - /reimagine-it audit
  - audit this page
  - check design quality
  - verify craft floor
  - design health check
  - audit my HTML
---

# /reimagine-it audit

**Parent:** [../SKILL.md](../SKILL.md) — the full Content-Derived Design engine. This sub-skill handles only the deterministic quality check.

Runs `npx reimagine-it audit` — 19 checks across 6 categories (`src/audit.js`; Python `scripts/audit.py` is the CI mirror):

| Category | Checks | What it catches |
|----------|--------|-----------------|
| Typography | 3 | Banned default fonts, type-scale range, measure > 65ch |
| Palette | 3 | Palette drift, `transition: all`, un-styled `::selection` |
| Motion | 4 | Outline removal, missing `prefers-reduced-motion`, missing `:focus-visible`, non-compositor animation |
| Content | 4 | Placeholder copy, vibe adjectives, emoji farm, `<br><br>` spacing |
| Structure | 3 | CDN, external font fetch, figure system doing no work |
| Performance | 2 | Images without dimensions, long pages without `content-visibility` |

## Usage

```bash
# Agent
/reimagine-it audit path/to/page.html

# CLI (Node — no Python required)
npx reimagine-it audit gold/webpage/after.html
npx reimagine-it audit gold/webpage/after.html --verbose
npx reimagine-it audit gold/webpage/after.html --json

# CI mirror
python scripts/audit_all.py
```

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | CLEAN — no issues |
| 1 | WARNINGS — advisory only, no blockers |
| 2 | FAIL — must fix before shipping |

## Procedure

1. If the user passed a file path, run `python scripts/audit.py <path>`.
2. If no path, run `python scripts/audit_all.py` to audit all gold files.
3. Report the verdict with a summary table.
4. For each failure, name the specific rule and the fix.
5. If `--verbose`, show per-category breakdown.
6. If `--json`, output machine-readable JSON for CI.

## Must not

- Use an LLM for the check — this is deterministic Python only
- Skip the craft-floor rules (MOT-02, MOT-03 are hard blockers)
- Report "clean" without actually running the script
- Invent checks not in `scripts/audit.py`