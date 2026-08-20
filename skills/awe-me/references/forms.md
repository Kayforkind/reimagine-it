# Form router

Load from SKILL.md. Default: **you** pick the form from context. The user may force a family with a category token.

## Signal → hero form

| Context signal | Hero form | Stretch |
|----------------|-----------|---------|
| Missing capability, workaround in issues/docs, “we always have to…” | **code** — the feature/API they did not know to ask for | CLI wrapper, property test, or a reverse-demo |
| Commands, flags, agent-unfriendly CLI | **cli** — one proving command with examples in `--help` | Same command as a tiny MCP tool or stdin pipeline |
| Handshake, layers, state machine, “the protocol is the product” | **protocol** — runnable spike *or* a spec a stranger can implement | The handshake as SVG/3js space, or the inverse |
| Empty product, README-only, first-run pain | **demo** — gold fail-demo then the same path green | Door weenie / first-run copy in the real README |
| Architecture, monorepo, “inside the machine” | **architecture** — a new grammar *and* a slice that uses it | 3js room, or delete a layer (Eliminate) |
| Numbers, ledger, scorecard, comparison, research | **infographic** (HTML) or a **working model** | Same data as SVG skyline or a query they can rerun |
| Existing personal page / landing page / dashboard / plain `index.html` — user wants a redesign | **webpage** — same words, same content, held by a designed page. Load [webpage-craft.md](webpage-craft.md). | `python <folder>/run.py` to screenshot before/after into `compare.png` |
| Writing, naming, error messages, manifesto | **prose** — one keepable file that *is* the idea | The same idea as a CLI error or a weenie |
| Product/UX, empty state, dead-end settings | **product** — one interaction they invent workarounds for | Tiny HUD/overlay; do not restyle the whole app |
| Tests failing, flaky race, “can’t prove it” | **experiment** — property, golden, or fail-demo that makes the bug undeniable | Same proof as an animated SVG of the race |
| One name, quote, metaphor, icon-scale idea | **svg** weenie | Animated HTML of the same silhouette |
| Space, layers, systems already in a Three.js app | **3js** — edit in place | HUD token pass — not a Dribbble clone |
| Analytical panel that should sit beside chat | **canvas** (only if Cursor canvas skill exists) | Same claims as a filterable table |
| User forced `code` / `cli` / `protocol` / `demo` / `prose` / `product` / `architecture` / `experiment` / `svg` / `3js` / `infographic` / `canvas` / `html` | That family | The next row down |
| User said `interview` | Not a form. Talk category. | After answers, route as if that row were the lock |
| Empty context | Weenie **or** first-run demo from the folder name | “What this repo could show” as a working stub, not a slide |

## Where to write

| Leap type | Location |
|-----------|----------|
| Capability, CLI, test, protocol spike in *this* repo | **In place.** Do not hide it under `awe/`. |
| One-shot seeing-tool (HTML/SVG/explainer) | `<workspace>/awe/<yyyy-mm-dd>-<slug>/` or `inspire/` |
| Cursor canvas | The host’s canvases directory, only if that skill is installed |
| `--plan-only` | Chat only. No files. |

**One-shot HTML** = single file, inline CSS/JS, double-clickable.  
**Do not scaffold Vite** unless the workspace is already that app or they asked. One-shot 3D = single HTML + pinned import map, or edit the existing Three.js app.

## Bound skills (load only when the form needs them)

These are optional host skills. Skip if not installed. Do not fail the chair because a visual skill is missing — pick another form.

| Need | Typical skill name |
|------|--------------------|
| Existing Three.js app | `threejs-local` or the host’s Three.js chair |
| Canvas file | host `canvas` skill |
| SVG batch quality | `svg-quality-audit` after a *folder* of SVGs, not one weenie |
| Image generation | host image skill — **only if the user asked** |

## Craft bar by family

| Family | Magnet | Proof |
|--------|--------|-------|
| code | One API or function a stranger can call | Test or REPL snippet that ran |
| cli | One command in `--help` with an example | Non-interactive run, exit 0 on the happy path |
| protocol | One handshake they can replay | Spike or fixture, not only a diagram |
| demo | Fail then the same steps green | You actually ran both |
| prose | First sentence does the work | File on disk |
| product | One empty-state or dead-end that now has a door | Screenshot or scripted path if UI |
| architecture | One law they can violate on purpose | A slice that obeys it |
| experiment | One falsifiable claim | Command + output |
| svg/html/3js/canvas | Weenie in the first viewport | File opens; first frame not blank |
