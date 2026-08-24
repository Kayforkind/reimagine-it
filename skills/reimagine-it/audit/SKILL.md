---
name: reimagine-it-audit
description: >-
  Design Health — runs 18 deterministic quality checks on HTML output.
  Use when the user says /reimagine-it audit, "audit this page", "check design quality",
  or wants to verify craft-floor compliance before shipping. Catches blank plates,
  missing focus rings, non-compositor motion, off-palette accents, dead motion,
  fabricated content. No LLM, no API key. CI-ready with --json and exit codes.
  Part of the reimagine-it Content-Derived Design suite.
license: MIT
metadata:
  author: Kayforkind
  version: "2.3.0"
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

Runs `scripts/audit.py` — 18 checks across 6 categories:

| Category | Checks | What it catches |
|----------|--------|-----------------|
| Typography | 3 | Missing hierarchy levels, text measure > 65ch |
| Palette | 3 | Off-palette accents, un-styled ::selection, > 5 non-neutral colors |
| Motion | 3 | Missing prefers-reduced-motion, missing :focus-visible, non-compositor animation |
| Content | 3 | Blank plates, placeholder labels, fabricated content |
| Structure | 3 | No hero SVG, missing semantic landmarks, broken images |
| Performance | 3 | No content-visibility, long page, excessive DOM depth |

## Usage

```bash
# Agent
/reimagine-it audit path/to/page.html

# CLI
python scripts/audit.py gold/webpage/after.html
python scripts/audit.py gold/webpage/after.html --verbose
python scripts/audit.py gold/webpage/after.html --json

# CI
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