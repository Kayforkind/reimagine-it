# Distribution submission kit

## One-line description

Turn an existing HTML page into a beautiful, usable standalone redesign without losing its meaning.

## Short description

reimagine-it is a dependency-free CLI and Agent Skill for content-derived design. Design Auto reads headings, facts, links, dates, numbers, and colors from an existing HTML source, chooses a fitting visual direction, and produces an inspectable standalone artifact with a fidelity report.

## Why it is different

It starts from source evidence instead of a generic style prompt. The output is offline HTML, deterministic with a seed, and reviewable through the generated decision and fidelity report.

## Links

- Repository: https://github.com/Kayforkind/reimagine-it
- Playground: https://kayforkind.github.io/reimagine-it/#playground
- Benchmark: https://github.com/Kayforkind/reimagine-it/tree/main/benchmark
- Release: https://github.com/Kayforkind/reimagine-it/releases/tag/v2.6.0
- Action: https://github.com/Kayforkind/reimagine-it/blob/main/action.yml

## Launch post

What if a redesign started with the facts already in your file?

`reimagine-it` turns existing HTML into a standalone redesign, preserves source meaning, and reports what survived. Try it in the browser or run:

```bash
npx reimagine-it --auto -i page.html -o redesign.html
```

The new benchmark contains 20 distinct source cases with generated artifacts, reports, and wave evidence. No CDN, Figma file, API key, or server required.
