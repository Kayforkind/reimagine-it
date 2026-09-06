# Security Policy

**reimagine-it** is a deterministic, offline design engine: it reads the HTML
you give it and writes one standalone HTML file. No network calls, no API keys,
no telemetry, no model requests — and the CI suite enforces the "no external
asset fetch" property on every output.

## Supported versions

| Version | Supported |
|---------|-----------|
| latest release (see the releases tab) | ✅ |
| older tags | ❌ — upgrade via `npm i reimagine-it@latest` |

## Reporting a vulnerability

Please use **GitHub Private Vulnerability Reporting**
(Security → Report a vulnerability) rather than a public issue. You do not need
an account beyond GitHub, and the report stays private until a fix ships.

Include: what you sent to the engine (HTML/flags), what you expected, what
happened, and the `node --version` you used.

## What is in scope

- **The engine's honesty contract** — any way to make `generate`, `auto`,
  `extract`, or `audit` produce a fact that is not in the source, or to crash /
  hang on crafted input.
- **The MCP server** (`mcp/server.js`) — protocol handling, path traversal,
  injection via tool arguments.
- **The published npm package contents** — anything shipped in the tarball that
  is not the engine (the tarball guard fails CI if `npm pack` drifts).
- **The GitHub Actions surfaces** — `action.yml` and the workflows (template
  injection, permission escalation, untrusted-input handling). This class was
  exercised once already: community PR #13 fixed real shell-injection in
  `action.yml`.
- **The playground** — the site's iframes are sandboxed to opaque origins;
  bypasses of that sandbox count.

## What is out of scope

- Bugs in generated HTML that require a malicious *author* attacking their own
  page — the engine copies source content by design; it is not a sanitizer.
  Generated files are meant to be opened like any downloaded HTML file.
- Social-engineering reports ("the README told my agent to..."), missing HTTP
  headers on the static GitHub Pages site, and rate limits.

## Hardening posture (for reviewers and clients)

- `main` is protected: required CI (`review-gold`, `Token Benchmark`, `Audit Gold
  Quality`) + owner review before merge.
- Every third-party Action is pinned to an immutable commit SHA with a version
  comment; Dependabot bumps the pins weekly.
- All workflows default to `contents: read`; only the two release jobs hold
  `contents: write` / `id-token: write`.
- npm releases publish with **SLSA provenance** — verify with
  `npm view reimagine-it dist.attestations`.
- Secret scanning + push protection are enabled on this repository.
