# Quality-at-scale contract

## Scope

Produce 20 distinct HTML source fixtures and generated Auto results that demonstrate reimagine-it across different user intents. Each unit must be useful as a benchmark case, not a renamed copy.

## Acceptance

Every shipped unit must:

- contain a distinct, realistic source brief;
- generate a standalone HTML artifact with `--auto`;
- preserve the source title and at least one source anchor;
- include a JSON report with the selected token, candidates, and fidelity;
- pass the existing generated-artifact quality checks in `src/auto.js`;
- differ from its siblings in at least three declared axes;
- be reproducible from its recorded seed and command.

## Diversity axes

Each unit varies across at least three of: audience, content genre, information density, interaction intent, visual register, source vocabulary, and factual structure.

## Verification

Each wave is verified with the project test suite, source/artifact/report checks, and duplicate detection across titles, source fingerprints, selected tokens, and declared axis intents. Wave reports record accepted and quarantined units.

## Stop conditions

Stop before the next wave if any of the following occurs:

- more than 20% of sampled units fail acceptance;
- a wave contains duplicate or near-duplicate source briefs;
- reports, artifacts, and sources disagree;
- generated quality checks fail for a repeated reason;
- an output is only a renamed or recolored copy of a sibling.

Failures are quarantined and recorded, never silently deleted.
