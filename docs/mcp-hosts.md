# reimagine-it MCP — host setup

The `reimagine-it-mcp` binary is a stdio MCP server exposing the engine as
eight tools. It is published in the same npm package as the CLI, so any host
that can run `npx` can use it. Node >= 18 required.

## Tools

| Tool | Required args | Notes |
|------|---------------|-------|
| `reimagine` | `html` | One redesigned page. Optional: `token` (or `"auto"`), `seed`, `brief`, `voice`, `ref` (brand lock JSON or raw HTML), `audit`. |
| `design_auto` | `html` | Chooses the strongest direction, returns the artifact plus reasoning. Optional: `seed`, `brief`, `ref`, `audit`. |
| `design_variations` | `html` | Ranked directions plus a contrast sheet. Optional: `count` (2–5), `seed`, `brief`, `ref`, `includeHtml`. |
| `design_lock` | `html` | Captures palette/voice/motifs as reusable lock JSON. Optional: `name`. |
| `extract_content` | `html` | Shows exactly what the engine extracts; generates nothing. |
| `list_tokens` | — | All design tokens with descriptions. |
| `audit_html` | `html` | Design Health report. Optional: `path`, `allowFetch`. |
| `list_rules` | — | The Design Health rule registry. |

Every tool returns MCP content blocks; generation tools return the standalone
HTML as text plus a JSON summary block. Sources are never modified — the
tools are pure functions over the HTML you pass in.

The tool surface is pinned by golden fixtures
(`test/unit/mcp-golden.test.js`): names, required arguments, and response
shapes cannot drift without an explicit, reviewed regeneration.

## Host configurations

All snippets use the same server definition; only the file location and
wrapper format differ per host.

**Claude Desktop** — `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or
`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "reimagine-it": {
      "command": "npx",
      "args": ["-y", "--package", "reimagine-it", "reimagine-it-mcp"]
    }
  }
}
```

**Cursor** — `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "reimagine-it": {
      "command": "npx",
      "args": ["-y", "--package", "reimagine-it", "reimagine-it-mcp"]
    }
  }
}
```

**VS Code** — `.vscode/mcp.json` (workspace) or the `mcp` section of user
settings:

```json
{
  "servers": {
    "reimagine-it": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "--package", "reimagine-it", "reimagine-it-mcp"]
    }
  }
}
```

**Claude Code** — terminal, one line:

```bash
claude mcp add reimagine-it -- npx -y --package reimagine-it reimagine-it-mcp
```

**Windsurf** — `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "reimagine-it": {
      "command": "npx",
      "args": ["-y", "--package", "reimagine-it", "reimagine-it-mcp"]
    }
  }
}
```

**Gemini CLI** — `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "reimagine-it": {
      "command": "npx",
      "args": ["-y", "--package", "reimagine-it", "reimagine-it-mcp"]
    }
  }
}
```

## Troubleshooting

- **Server does not start**: confirm `node --version` is >= 18; run
  `npx -y --package reimagine-it reimagine-it-mcp --help` by hand — the CLI
  shares the package and will print a clear error.
- **First call is slow**: `npx` is resolving and caching the package; pin a
  version (`reimagine-it@2.15.0`) for deterministic startup in CI-like hosts.
- **Tool list is empty after an update**: restart the host; stdio servers are
  spawned once per session.
