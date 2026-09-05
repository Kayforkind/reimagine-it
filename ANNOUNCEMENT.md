# v2.7.0 announcement — paste-ready

Short form for the GitHub release notes; long form for X/Reddit/HN follow-ups.
Do not post until `npm view reimagine-it version` returns 2.7.0.

---

## GitHub release (v2.7.0)

**reimagine-it v2.7.0 — the honesty layer becomes a product surface**

v2.6.0 made the engine render every source fact. v2.7.0 enforces that promise
with CI, exposes it as a command, and opens the community lane.

**New commands**

- **`npx reimagine-it extract`** — the content signals as JSON: anchors, dates,
  numbers, emails, links, palette, source hex colors. `--full` adds prose;
  pipes cleanly (`cat page.html | npx reimagine-it extract -o - | jq .anchors`).
  Every extracted fact exists in the source — now property-tested against
  hostile and malformed input.
- **`npx reimagine-it mcp`** — the 8-tool MCP server over stdio. No separate
  package; verified with a live protocol handshake.

**Skills — the split is complete**

Three focused sub-skills (**generate**, **variations**, **extract**) join
audit/lock/infographic — the SkillsBench-aligned structure (focused skills
beat monolithic by ~18.6 points), each with `trigger_phrases` and
`capabilities` for catalog discovery.

**Trust — proof assets are now CI-enforced**

- **Reproduction guard** — committed artifacts must regenerate byte-identically
  from the committed engine. The repo cannot ship stale proof anymore.
- **Stills guard** — every screenshot at canonical dimensions, in sync with
  its docs/ copy; optional frozen-motion pixel regression.
- **Extractor fuzz tests** — 10 property tests: no invented facts, purity,
  crash-freedom on hostile input.
- **Weekly fidelity stress** — 250 seeds × 15 tokens × 9 sources, scheduled.
- **Tarball guard + npm provenance** — the shipped surface is explicit and
  signed.
- **Sandboxed playground** — pasted HTML runs in an opaque-origin iframe; it
  can no longer touch the parent page.

**Community**

- **Submission lane open**: copy `examples/community/TEMPLATE/`, ship real
  copy, pass the validator (`scripts/validate-submission.js`), get merged with
  the `community-gold` label. The Content Signals bot comments the extracted
  palette on every PR that touches HTML.
- **Dataset builder**: `scripts/build-dataset.js` emits HuggingFace-ready JSONL
  `{source_html, signals, token, seed, fidelity, output_html}` tuples —
  21 engine-verified pairs today, growing with every community proof.

**Also**: the playground fetches URLs (same-origin examples out of the box)
and switches between Result and Source views; `action.yml` is injection-hardened
(community PR #13); the docs site links its own 39-second walkthrough.

```bash
npx reimagine-it --auto -i page.html -o redesign.html
npx reimagine-it extract -i page.html -o signals.json
npx reimagine-it audit redesign.html
```

---

## Social (X/Bluesky, ~280 chars)

v2.7.0 of reimagine-it: `extract` shows you every fact the design engine reads from your HTML (as JSON), `mcp` serves 8 tools over stdio, and CI now proves every committed example regenerates byte-identically. `npx reimagine-it --auto -i page.html`

---

## Reddit (r/ClaudeCode et al., body under the existing title)

We just cut v2.7.0. Three things worth your time:

1. **`npx reimagine-it extract`** — before redesigning anything, see exactly what the engine reads from your page: anchors, dates, numbers, emails, palette (derived + hex colors actually in the source). JSON, pipes to `jq`, and property-tested so it never invents a fact. It's the honesty layer of content-derived design, now a standalone command.
2. **Proof is CI-enforced now.** Every committed example must regenerate byte-identically from the committed engine; every screenshot must exist at canonical dimensions; the fidelity floor runs weekly at 250 seeds across all token × source combinations. If a future change silently drops facts or stale-fies proof, CI fails.
3. **The community lane is open.** Copy `examples/community/TEMPLATE/`, paste your real page, pass the validator, and your redesign ships with the next release — credited. A new bot also comments the content-derived palette on any PR that touches HTML.

Plus: an MCP server (`npx reimagine-it mcp`), three new focused sub-skills completing the SkillsBench-backed split, and a dataset builder that emits `{source, signals, output}` tuples for anyone training design-capable models.

Everything runs offline from a single HTML file. Audit any result: `npx reimagine-it audit redesign.html`.

Repo: https://github.com/Kayforkind/reimagine-it
Playground: https://kayforkind.github.io/reimagine-it/#playground
