# Reimagine This Page — Browser Extension

A Chrome/Edge/Firefox extension that adds a "Reimagine this page" button to your toolbar. Click it on any website and the extension extracts the page's content (title, colors, dates, numbers, nouns) and generates a redesigned version using the same Content-Derived Design method as the CLI and agent skill.

## Install

### Chrome / Edge (developer mode)

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repo
5. The 🎨 icon appears in your toolbar

### Firefox

1. Open `about:debugging`
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `extension/manifest.json`

## How it works

1. Navigate to any web page
2. Click the extension icon
3. The popup shows what was extracted (title, colors, dates, numbers, nouns)
4. Pick one of the ten design tokens (webpage, landing, dashboard, infographic, cinematic, artistic, photography, svg, 3js, simulation)
5. Click **Reimagine →** — the redesigned page opens in a new tab

Everything runs locally in your browser. No server, API key, page upload, or external asset fetch is required. The extension intentionally uses a lightweight local renderer; the CLI is the highest-fidelity path for batch and production work.

## Tokens

| Token | What you get |
|-------|-------------|
| `webpage` | A real page from the site's nouns, dates, colors |
| `infographic` | A statistical poster of facts on the page |
| `dashboard` | KPI cards with content-derived metrics |
| `artistic` | Full-bleed canvas with mix-blend typography |
| `cinematic` | Full-viewport hero with radial glow |
| `landing` | Hero + feature cards + CTA |
| `svg` | Inline living SVG with a source-anchor network |
| `3js` | Offline canvas object with drag and keyboard orbit |
| `simulation` | Playable sequence of dates/events from the page |
| `photography` | Abstract visual folio, one study per source anchor |

## License

MIT — same as the main project.
