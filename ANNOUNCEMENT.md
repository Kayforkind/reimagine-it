# v2.9.0 announcement — paste-ready

*Paste-ready for X/LinkedIn/dev.to. Cover: `docs/og.png`. Tags: `ai`, `webdev`, `security`, `opensource`.*

---

**reimagine-it v2.9.0 — an engine that proves it, then shows you the proof**

We just cut v2.9.0. Where v2.8.0 made the output move, v2.9.0 makes the repo *auditable at a glance*: everything the CI enforces is now visible on the project page and the live site.

Three things worth your time:

**1. The site now shows the receipts.** The docs site carries the same security badge row as the README (CI Gate, protected main, secret scanning, SLSA provenance, live OpenSSF Scorecard), a new **agents section** (the 8 MCP tools — an agent can generate, self-audit with 19 rules, and explain its design decision), and a **measured-quality section**: 17/17 tokens at 100/100 usability, byte-identical regeneration enforced by CI, fuzzed honesty contract, offline-by-construction. Hero stats and the token marquee now tell the truth: 17 directions, 9 committed journeys.

**2. The Scorecard sweep is done.** Every fixable OpenSSF check is at 10/10 — token permissions, SHA-pinned actions, complete PyPI hash-set pins (106 hashes for Pillow alone, after partial pins broke on a third-platform wheel), CodeQL + Semgrep on every push, a structural workflow lint in the required gate (negative-tested against the exact parse-time outage it prevents), cosign-signed release artifacts, SLSA provenance on npm. Weekly automated trend tracking opens a regression issue if the aggregate ever drops.

**3. Branch protection at maximum.** `enforce_admins` is on: every change — including the owner's — lands through a reviewed PR with the full battery green. For client audits, "who can change this code" now has a one-word answer: *nobody without a green gate and a review*.

Try it: `npx reimagine-it --auto -i page.html -o redesign.html` — or paste HTML into the in-browser playground: https://kayforkind.github.io/reimagine-it/

MIT · offline · deterministic · no API keys.

## Verification checklist (filled at release)

- `npm view reimagine-it version` returns 2.9.0
- `npm view reimagine-it dist.attestations` shows provenance
- Release assets carry cosign signatures (verify with `cosign verify-blob`)
- Docs site version chip reads v2.9.0, identical to README and npm
