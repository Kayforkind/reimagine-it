# v2.3.2 release brief

## Release message

**Content-derived redesigns with inspectable proof.** `reimagine-it` turns an existing HTML file into a standalone, usable redesign while preserving source facts and reporting the decision.

## Included

- Design Auto for automatic direction selection
- Source-fidelity reporting across CLI, Auto, MCP, and browser bundles
- Offline standalone HTML output
- Reproducible 20-source benchmark with wave evidence
- Design Health composite Action for deterministic HTML quality checks

## Design Health Action

Design Health is the CI companion: it audits HTML for typography, palette, motion, content, structure, and performance heuristics without an LLM or API key.

```yaml
- uses: Kayforkind/reimagine-it@v2.3.2
  with:
    path: "**/*.html"
    fail-on-warnings: "false"
```

## Release checklist

- [ ] Create GitHub release for tag `v2.3.2`
- [ ] Confirm the release is not a prerelease
- [ ] Confirm the publish workflow is green
- [ ] Confirm npm publication if `NPM_TOKEN` is configured
- [ ] Verify the Action install example resolves to `v2.3.2`
- [ ] Announce the benchmark and live playground
