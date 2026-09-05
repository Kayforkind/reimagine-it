# Badge provenance — what every badge on this repo proves

Every badge in the README badge row and on the docs-site hero, the exact
mechanism behind it, and where the proof lives. If a badge were lying, the
linked check is the place it would show.

| Badge | What it proves | The mechanism behind it |
|---|---|---|
| **CI** | Every push and PR runs the full quality suite | `audit.yml` — gold audit sweep, unit tests, extractor fuzz, e2e, guards. Badge = GitHub Actions status API (live, not self-reported). |
| **CI Gate** | The *required* battery passed: full suite + site-claims guard + 17-token 100/100 benchmark | `gate.yml` — listed in branch protection as required context `battery`; `enforce_admins` means not even the owner can bypass it. |
| **main protected + codeowners** | `main` cannot take a direct push: required checks, no force-push, no deletion, strict up-to-date branches, conversation resolution, admins included | Branch protection API (Settings → Branches). `CODEOWNERS` routes review requests on engine/CI/community paths. |
| **actions SHA-pinned + dependabot** | Every `uses:` in every workflow is pinned to an immutable 40-char commit SHA; bumps arrive weekly | Enforced in CI by `scripts/check-workflows.py` inside the gate (a loose tag fails the build); Dependabot opens the bump PRs. |
| **secret scanning + push protection** | GitHub scans for leaked credentials and blocks pushes that contain recognized secret formats | Repo security settings (Settings → Code security). Badge links there; state is GitHub's, not ours. |
| **npm releases — SLSA provenance** | The published npm tarball was built by this repo's release workflow on GitHub-hosted runners | `release-benchmark.yml` publishes with `npm publish --provenance` (requires `id-token: write`). Verify: `npm view reimagine-it dist.attestations`. |
| **OpenSSF Scorecard** | Live third-party supply-chain audit score, refreshed weekly | `scorecard.yml` runs the official OSSF action; results publish to code scanning and `api.securityscorecards.dev`. Regression tracking: `scorecard-report.yml`. |
| **Benchmark 100/100** | Every design direction scores 100/100 usability with full source fidelity | `benchmark.yml` + the same `scripts/benchmark-tokens.js` run inside the required gate; the number is recomputed on every PR, not quoted from a doc. |
| **CodeQL** | Static security analysis of the JavaScript engine on every push + weekly | `sast.yml` uploads SARIF to code scanning. |

## The claims behind the badges (also CI-enforced)

- **"Proof regenerates or CI fails"** — `scripts/check-repro.js`: every committed
  example artifact must regenerate byte-identically from the committed engine.
- **"Honesty is property-tested"** — extractor fuzz/property tests + the weekly
  250-seed fidelity-floor stress harness + `scripts/fuzz_audit.py`.
- **"Offline by construction"** — audit rule `STR-01` (no CDN/external fetch) on
  every generated page, plus `check-tarball.js` proving the published package
  contains exactly the intended files.
- **"Deterministic"** — same input + seed → byte-identical output; the
  reproduction guard proves it for every shipped example.
- **Site stats match reality** — `scripts/check-site-claims.js` in the gate:
  hero counts, marquee, gallery, and stage buttons are checked against the real
  `TOKENS` roster and the `examples/` tree on every PR.

## Badges we deliberately do not display

- **Coverage %** — the suite is integration-first (byte-identity, parity, e2e);
  a line-coverage number would suggest a precision the project does not claim.
- **CII Best Practices** — pending owner registration at bestpractices.dev
  (answers pre-drafted in `docs/CII-BADGE-ANSWERS.md`). It goes in the README
  badge row and the site hero the day it exists.
