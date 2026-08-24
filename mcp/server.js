#!/usr/bin/env node
/**
 * reimagine-it MCP Server
 *
 * Exposes the Content-Derived Design method as Model Context Protocol tools
 * so any MCP-compatible agent can call reimagine-it without installing the
 * full agent skill.
 *
 * Tools:
 *   reimagine        — extract content + generate a redesigned page
 *   extract_content   — extract nouns, colors, dates, numbers from HTML
 *   list_tokens       — list all available design tokens
 *   audit_html        — run the craft-floor audit on an HTML file
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

// Load MCP SDK — optional dependency (npm install @modelcontextprotocol/sdk)
let Server, StdioServerTransport, CallToolRequestSchema, ListToolsRequestSchema;
try {
  ({ Server } = require('@modelcontextprotocol/sdk/server'));
  ({ StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio'));
  ({ CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types'));
} catch (e) {
  console.error('reimagine-it MCP server requires the MCP SDK.');
  console.error('Install it with: npm install @modelcontextprotocol/sdk');
  console.error('Or use the CLI instead: npx reimagine-it -i file.html -t webpage');
  process.exit(1);
}

const { extractContent } = require('../src/extract');
const { generate, TOKENS, TOKEN_DESCRIPTIONS } = require('../src/generate');
const { buildPlan, autoGenerate } = require('../src/auto');
const { sourceFidelity } = require('../src/result');
const pkg = require('../package.json');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const TOOLS = [
  {
    name: 'reimagine',
    description: 'Read an HTML file and redesign it from its own content. ' +
      'Extracts nouns, colors, dates, numbers from the source and generates ' +
      'a token-specific redesign (webpage, infographic, svg, 3js, simulation, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'The HTML content to reimagine (raw source)',
        },
        token: {
          type: 'string',
          description: 'Design token (default: webpage)',
          enum: TOKENS.concat('auto'),
          default: 'webpage',
        },
        seed: {
          type: 'number',
          description: 'Pin creative variation for reproducibility (optional)',
        },
        brief: {
          type: 'string',
          description: 'Optional creative lens; does not add source facts',
        },
      },
      required: ['html'],
    },
  },
  {
    name: 'design_auto',
    description: 'Automatically inspect HTML, choose the best design direction, generate candidates, and return the strongest verified standalone artifact. The source is never modified.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'The HTML content to redesign' },
        seed: { type: 'number', description: 'Optional reproducibility seed' },
        brief: { type: 'string', description: 'Optional creative lens' },
      },
      required: ['html'],
    },
  },
  {
    name: 'extract_content',
    description: 'Extract content from an HTML file: title, palette, nouns, ' +
      'proper nouns, dates, numbers, emails, paragraphs, anchors. ' +
      'Does not generate output — just shows what the engine finds.',
    inputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'The HTML content to extract from (raw source)',
        },
      },
      required: ['html'],
    },
  },
  {
    name: 'list_tokens',
    description: 'List all available design tokens with descriptions.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'audit_html',
    description: 'Run the craft-floor audit on an HTML file. ' +
      'Checks typography, palette, motion, content, structure, and performance. ' +
      'Returns JSON with verdict (CLEAN/WARNINGS/FAIL), failure count, warning count.',
    inputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'The HTML content to audit (raw source)',
        },
      },
      required: ['html'],
    },
  },
];

async function main() {
  const server = new Server(
    { name: 'reimagine-it', version: pkg.version },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: requestArgs } = request.params;
    const args = requestArgs || {};

    if (name === 'reimagine') {
      const token = args.token || 'webpage';
      const seed = args.seed !== undefined ? args.seed : undefined;
      const content = extractContent(args.html, 'mcp-input.html');
      if (token === 'auto') {
        const result = autoGenerate(content, { seed, brief: args.brief });
        const designResult = buildDesignResult(content, { mode: 'auto', token: result.token, seed: result.seed, score: result.score, rationale: result.rationale, candidates: result.candidates, output: result.output, source: 'mcp-input.html', artifact: 'response' });
        return {
          content: [
            { type: 'text', text: JSON.stringify(designResult, null, 2) },
            { type: 'text', text: '\n--- Generated HTML ---\n' },
            { type: 'text', text: result.output },
          ],
        };
      }
      const output = generate({ content, token, seed, brief: args.brief });
      const fidelity = sourceFidelity(content, output);

      // Also return the extraction summary
      const summary = {
        title: content.title,
        palette: content.palette,
        anchors: content.anchors,
        token: token,
        seed: seed !== undefined ? seed : 'random',
        outputSize: (output.length / 1024).toFixed(1) + ' KB',
        fidelity: fidelity,
      };

      return {
        content: [
          { type: 'text', text: JSON.stringify(summary, null, 2) },
          { type: 'text', text: '\n--- Generated HTML ---\n' },
          { type: 'text', text: output },
        ],
      };
    }

    if (name === 'design_auto') {
      const content = extractContent(args.html, 'mcp-input.html');
      const result = autoGenerate(content, { seed: args.seed, brief: args.brief });
      const designResult = buildDesignResult(content, { mode: 'auto', token: result.token, seed: result.seed, score: result.score, rationale: result.rationale, candidates: result.candidates, output: result.output, source: 'mcp-input.html', artifact: 'response' });
      return {
        content: [
          { type: 'text', text: JSON.stringify(designResult, null, 2) },
          { type: 'text', text: '\n--- Generated HTML ---\n' },
          { type: 'text', text: result.output },
        ],
      };
    }

    if (name === 'extract_content') {
      const content = extractContent(args.html, 'mcp-input.html');
      return {
        content: [
          { type: 'text', text: JSON.stringify(content, null, 2) },
        ],
      };
    }

    if (name === 'list_tokens') {
      const text = TOKENS.concat('auto').map((tokenName) => `  ${tokenName.padEnd(14)} ${tokenName === 'auto' ? 'Choose, generate, verify, and explain' : TOKEN_DESCRIPTIONS[tokenName]}`).join('\n');
      return {
        content: [
          { type: 'text', text: 'Available design tokens:\n\n' + text },
        ],
      };
    }

    if (name === 'audit_html') {
      // Write the HTML to a temp file and run audit.py
      const tmpFile = path.join(os.tmpdir(), 'reimagine-audit-' + Date.now() + '.html');
      fs.writeFileSync(tmpFile, args.html, 'utf-8');

      try {
        const auditScript = path.resolve(__dirname, '..', 'scripts', 'audit.py');
        let result;
        try {
          result = execSync(
            `python "${auditScript}" "${tmpFile}" --json`,
            { encoding: 'utf-8', timeout: 15000, cwd: path.resolve(__dirname, '..') }
          );
        } catch (e) {
          // execSync throws on non-zero exit (warnings=1, failures=2)
          // but stdout still contains the JSON report
          if (e.stdout) result = e.stdout.toString();
          else throw e;
        }
        const report = JSON.parse(result.trim());
        return {
          content: [
            { type: 'text', text: JSON.stringify(report, null, 2) },
          ],
        };
      } catch (e) {
        return {
          content: [
            { type: 'text', text: JSON.stringify({
              verdict: 'ERROR',
              message: e.message,
              stdout: e.stdout ? e.stdout.toString().slice(0, 500) : '',
            }, null, 2) },
          ],
        };
      } finally {
        try { fs.unlinkSync(tmpFile); } catch (e) {}
      }
    }

    return {
      content: [{ type: 'text', text: 'Unknown tool: ' + name }],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});
