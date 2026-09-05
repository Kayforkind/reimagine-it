# Submission — Your Project

Copy this folder, rename it to your project's slug (lowercase, hyphens), and
fill in every field below. Then run the validator and open a PR.

## Required fields

- **Author:** your GitHub handle
- **License of the source copy:** who owns this text, and that you may
  submit it (your own page, your employer's page with permission, or a
  public page you are redesigning as a study)
- **Kind:** proof case (a job outside the seven journeys) or domain gold
  (a redesign you believe is the best-in-lane output)

## The bar

1. `source.html` is real copy — no lorem, no invented stats.
2. `npx reimagine-it --auto -i source.html --report auto.json` succeeds and
   reports fidelity ≥ 80% (the repo floor; your submission need not use a
   specific token — the engine picks).
3. `node ../../scripts/validate-submission.js examples/community/<your-slug>`
   passes.
4. The redesign opens offline (no CDN links, no external fonts by default).

## What happens next

A maintainer re-runs Auto on your source, checks the fidelity report, and
merges into `examples/community/`. Your handle is credited in the folder
README and in the next release's changelog.
