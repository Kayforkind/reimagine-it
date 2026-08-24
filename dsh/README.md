# Design Auto on DeepSeek Harness

`reimagine-it` stays the portable design engine. This directory is an optional
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) bundle
adapter, not a fork or a replacement runtime.

DeepSeek Harness is currently a developer preview whose model, tools, skills,
sessions, sandboxes, storage, loops, scheduling, and UI are swappable plugins.
That makes it a good host for Design Auto: the harness owns model access,
context, approvals, persistence, Code Mode, and traceability; reimagine-it owns
content-derived design decisions and standalone HTML generation.

## Install into a DSH profile

```bash
dsh plugin --profile web add reimagine-it
dsh web
```

Restart the profile after installing or updating the bundle. The package
manifest declares `dsh.bundle.patch`, which mounts the `design_auto` tool from
`dsh/auto.mjs` through the public `ctx.tools.register(defineTool(...))` API.

## What `design_auto` does

The model can call the tool with a workspace-relative HTML path:

```text
design_auto({
  "path": "src/page.html",
  "brief": "quiet, tactile, client-ready",
  "seed": 42
})
```

The tool:

1. reads the source inside the active workspace;
2. extracts headings, paragraphs, list items, links, dates, numbers, colors,
   and anchors;
3. ranks up to three coherent output directions;
4. generates each candidate with the shared engine;
5. scores craft-floor signals and returns the strongest HTML artifact with its
   token, seed, rationale, and candidate scores.

`auto` never overwrites the source. The DSH agent can review the returned
artifact, use its normal filesystem tool to save it under `reimagined/`, and
ask for approval before any project edit. DSH's sandbox, approval policy,
append-only session log, and optional Code Mode remain the authority for those
operations.

## The hands-free contract

A user can say:

```text
Reimagine this page. Auto.
```

or use `/reimagine-it auto`. The skill treats `Auto` as an instruction to
manage the normal loop—inspect context, choose the form, generate candidates,
verify, and return the strongest safe artifact—rather than asking the user for
another token. It asks only when a destructive edit, paid API, unavailable
input, or other user-owned decision is genuinely required.

## Why this boundary

Do not vendor the DeepSeek Harness into this repository. It is a rapidly
changing runtime and already provides the hard harness problems: model
adapters, tool presentation, session replay, context management, subagents,
sandboxing, and lifecycle cleanup. A small DSH bundle keeps the core CLI
zero-config, works with other agent hosts, and lets DSH users benefit from
its stronger model-facing execution modes without coupling release schedules.

The adapter itself does not make a model request. That is intentional: the
calling harness can use any configured model, native tools, Code Mode, or
subagents, while the design engine remains deterministic and testable.
