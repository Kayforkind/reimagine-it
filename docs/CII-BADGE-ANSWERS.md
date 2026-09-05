# CII Best Practices badge — paste-ready answers

Project: <https://bestpractices.dev> → "Get a badge" → `Kayforkind/reimagine-it`.
Sign in with GitHub as the owner; every answer below maps to a CI check or a
repo setting that already exists — nothing aspirational. Submit **Passing**
level first; revisit Silver once history accrues.

---

## Basics

| Question | Answer |
|---|---|
| Human-readable name | `reimagine-it` |
| Home page (URL) | `https://kayforkind.github.io/reimagine-it/` |
| Repo (URL) | `https://github.com/Kayforkind/reimagine-it` |
| Where is the repo hosted? | GitHub |
| License | MIT (`LICENSE`) — Scorecard License check: 10/10 |

## Reporting

| Question | Answer |
|---|---|
| Security contact (URL) | `https://github.com/Kayforkind/reimagine-it/security/advisories/new` — private vulnerability reporting is enabled |
| Vulnerability disclosure policy (URL) | `https://github.com/Kayforkind/reimagine-it/blob/main/.github/SECURITY.md` |

## Enhancement / maintenance

| Question | Answer |
|---|---|
| Public VCS? | Yes — GitHub (git), public, readable without an account |
| Latest release date | See the Releases tab; versions are tagged `vX.Y.Z` and cut from main after the full CI battery passes |
| Release notes? | Yes — `CHANGELOG.md` documents every release; GitHub Releases embed the entry |

## Quality

| Question | Answer |
|---|---|
| Test suite? | Yes — `npm test` runs 12 phases: gold audit sweep, engine + MCP unit tests (83 tests), extractor fuzz/property tests, 25 e2e CLI tests, browser-bundle freshness, tarball guard, stills guard, reproduction guard, JS/Python audit parity, smoke demo, audit fuzzer |
| Test suite runs in CI? | Yes — required **CI Gate** (`battery`) + `review` on every PR and main push: `https://github.com/Kayforkind/reimagine-it/actions/workflows/gate.yml` |
| All tests pass? | Yes — gate is green on main; it is a *required* check, so main cannot be pushed without passing |
| Contribution procedure? | Yes — `CONTRIBUTING.md` (PR flow, CODEOWNERS review requirement, stale-review dismissal) |
| Max modification time of a bug report? | GitHub Issues; the project triages weekly (Scorecard "Maintained" tracks commit cadence) |
| Coding standards? | Yes — enforced mechanically: 19-rule Design Health audit on every generated page, audit-parity test (JS vs Python mirror must agree), structural workflow lint, version-sync guard, reproduction guard |
| Build is reproducible? | Yes — `package-lock.json` committed; `npm ci` only; deterministic engine (same input + seed → byte-identical output, enforced by `scripts/check-repro.js` in CI) |

## Security

| Question | Answer |
|---|---|
| New crypto from scratch? | No — the project implements no cryptography |
| Secure design principles? | Yes — documented in `.github/SECURITY.md` (honesty contract: source facts never invented; offline by construction; least-privilege workflows) |
| Hardened versions exist? | Yes — depend on the latest tagged release; the CI Gate + branch protection make main always releasable |
| Subprojects? | No subprojects |
| Secure development knowledge? | Yes — SAST (CodeQL + Semgrep) on every push; dependency alerts + updates via Dependabot; secret scanning with push protection |
| Static analysis (SAST)? | Yes — CodeQL (`sast.yml`) and Semgrep upload SARIF to code scanning on every push and PR, plus a weekly schedule |
| Dynamic analysis? | Partial — the audit fuzzer (`scripts/fuzz_audit.py`) exercises the linter with adversarial generations weekly and in `npm test`; the extractor fuzzer hits the parser with hostile HTML |
| Two-factor / strong auth on repo? | Owner-managed — enable 2FA on the GitHub account (owner action, not automatable) |
| Signed releases? | Yes — release artifacts are cosign keyless-signed (Fulcio/Rekor); npm publishes with SLSA provenance (`npm view reimagine-it dist.attestations`) |
| Common vulnerability reporting? | Yes — GitHub private vulnerability reporting + Dependabot alerts enabled |
| Public cryptographic signatures? | Yes — cosign signatures on release assets, verifiable with `cosign verify-blob` against the Fulcio identity |

## Analysis

| Question | Answer |
|---|---|
| Coverage measurement? | Not tracked as a percentage — the suite is integration-first (byte-identity, parity, e2e) rather than coverage-number driven; answer honestly "no coverage %, comprehensive behavior tests instead" |
| Performance tests? | Partial — the token benchmark (`scripts/benchmark-tokens.js`, required in gate) proves 17/17 tokens at 100/100 usability per run |

## Future

| Question | Answer |
|---|---|
| Continued maintenance for 2+ years? | Yes — active roadmap (`ROADMAP.md`), weekly Dependabot/stress/Scorecard automation, sponsorable |
| 2+ core maintainers? | Currently one human owner + automation; answer honestly. CODEOWNERS + branch protection reduce bus risk on code paths; consider inviting a co-maintainer (the external PR #13 security contributor is a candidate) |

---

### After submitting

1. The badge endpoint will be `https://bestpractices.dev/projects/<ID>/badge`.
2. Add it to the README badge row next to the OpenSSF Scorecard badge, and to
   the docs-site hero badge row (`docs/index.html`, `.hero-badges`).
3. `scripts/check-version-sync.py` does not check badge URLs — no guard change
   needed.
