#!/usr/bin/env node
/**
 * reimagine-it MCP Server
 *
 * Exposes Content-Derived Design as Model Context Protocol tools so any
 * MCP-compatible agent can call reimagine-it without installing the skill.
 *
 * This file is only the stdio transport adapter. Every tool lives in
 * `mcp/tools.js`, which imports no SDK and is covered by test/unit/mcp.test.js.
 *
 * Tools:
 *   reimagine          — extract content + generate a redesigned page
 *   design_auto        — choose, generate, score, and explain the best direction
 *   design_variations  — several directions plus a contrast sheet
 *   design_lock        — capture a page's design surface as reusable data
 *   extract_content    — nouns, colors, dates, numbers found in the source
 *   list_tokens        — every available design token
 *   audit_html         — Design Health on any HTML (native, no Python)
 *   list_rules         — the Design Health rule registry
 *
 * Usage (Claude Desktop / any MCP host):
 *   npx reimagine-it-mcp
 *
 * Or add to your MCP client config:
 *   {
 *     "mcpServers": {
 *       "reimagine-it": {
 *         "command": "npx",
 *         "args": ["reimagine-it-mcp"]
 *       }
 *     }
 *   }
 */

const { TOOLS, callTool } = require('./tools');
const pkg = require('../package.json');

// The SDK is an optional dependency: the CLI and the tool module work without it.
let Server, StdioServerTransport, CallToolRequestSchema, ListToolsRequestSchema;
try {
  ({ Server } = require('@modelcontextprotocol/sdk/server'));
  ({ StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js'));
  ({ CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js'));
} catch (e) {
  console.error('reimagine-it MCP server requires the MCP SDK.');
  console.error('Install it with: npm install @modelcontextprotocol/sdk');
  console.error('Or use the CLI instead: npx reimagine-it -i file.html -t webpage');
  process.exit(1);
}

async function main() {
  const server = new Server(
    { name: 'reimagine-it', version: pkg.version },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    callTool(request.params.name, request.params.arguments)
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});
