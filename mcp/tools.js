/**
 * reimagine-it MCP tool implementations.
 *
 * Deliberately free of any MCP SDK import so the tools can be unit-tested on
 * plain Node. `mcp/server.js` is a thin stdio adapter over this module. The
 * previous single-file server could only run with the optional SDK installed,
 * which is how a call to an undefined `buildDesignResult` shipped unnoticed.
 */

const { extractContent, paletteSystem } = require('../src/extract');
const { generate, TOKENS, TOKEN_DESCRIPTIONS, voiceFor } = require('../src/generate');
const { autoGenerate, qualityScore } = require('../src/auto');
const { sourceFidelity } = require('../src/result');
const { auditHtml, RULES } = require('../src/audit');
const { extractLock, readLock, applyLock } = require('../src/lock');
const { buildVariations, contrastSheet, MAX_VARIATIONS } = require('../src/variations');

const INPUT_LABEL = 'mcp-input.html';

const TOKEN_ENUM = TOKENS.concat('auto');

const TOOLS = [
  {
    name: 'reimagine',
    description:
      'Read HTML and redesign it from its own content. Extracts nouns, colors, dates and ' +
      'numbers from the source, then generates a token-specific standalone page. ' +
      'Source facts stay source facts; only the composition changes.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'The HTML content to reimagine (raw source)' },
        token: {
          type: 'string',
          description: 'Design token (default: webpage). Use "auto" to let the engine choose.',
          enum: TOKEN_ENUM,
          default: 'webpage',
        },
        seed: { type: 'number', description: 'Pin creative variation for reproducibility' },
        brief: { type: 'string', description: 'Creative lens; does not add source facts' },
        voice: { type: 'string', description: 'Force a typographic voice (e.g. grotesque, editorial)' },
        ref: {
          type: 'string',
          description:
            'Brand lock to apply: either a lock JSON string from design_lock, or raw HTML ' +
            'to reverse-lock. Palette and voice come from the lock; structure stays content-derived.',
        },
        audit: {
          type: 'boolean',
          description: 'Also run Design Health on the generated page and include the report',
          default: false,
        },
      },
      required: ['html'],
    },
  },
  {
    name: 'design_auto',
    description:
      'Inspect HTML, choose the strongest design direction, generate and score candidates, ' +
      'and return the winning standalone artifact with the reasoning. The source is never modified.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'The HTML content to redesign' },
        seed: { type: 'number', description: 'Optional reproducibility seed' },
        brief: { type: 'string', description: 'Optional creative lens' },
        ref: { type: 'string', description: 'Optional brand lock (lock JSON or raw HTML)' },
        audit: { type: 'boolean', description: 'Include a Design Health report', default: false },
      },
      required: ['html'],
    },
  },
  {
    name: 'design_variations',
    description:
      'Generate several content-derived directions from one source and a contrast sheet that ' +
      'puts them side by side. Returns ranked directions with quality, fidelity and voice, ' +
      'plus the HTML for every direction and the sheet itself.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'The HTML content to explore' },
        count: {
          type: 'number',
          description: 'How many directions to generate (2-' + MAX_VARIATIONS + ', default 3)',
          default: 3,
        },
        seed: { type: 'number', description: 'Pin the set for reproducibility' },
        brief: { type: 'string', description: 'Optional creative lens' },
        ref: { type: 'string', description: 'Optional brand lock (lock JSON or raw HTML)' },
        includeHtml: {
          type: 'boolean',
          description: 'Include full HTML for every direction (default true)',
          default: true,
        },
      },
      required: ['html'],
    },
  },
  {
    name: 'design_lock',
    description:
      "Capture a shipped page's design surface as reusable machine-readable data: palette by " +
      'role, type stack, typographic voice, motifs, motion and structure. Feed the result back ' +
      'as `ref` to put new content on that brand.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'The HTML whose design surface should be captured' },
        name: { type: 'string', description: 'Name for the lock (default: derived from the title)' },
      },
      required: ['html'],
    },
  },
  {
    name: 'extract_content',
    description:
      'Extract content from HTML: title, palette, nouns, proper nouns, dates, numbers, emails, ' +
      'paragraphs and anchors. Does not generate output — shows exactly what the engine finds.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'The HTML content to extract from (raw source)' },
      },
      required: ['html'],
    },
  },
  {
    name: 'list_tokens',
    description: 'List all available design tokens with descriptions.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'audit_html',
    description:
      'Run Design Health (' + RULES.length + ' deterministic rules) on HTML. Checks typography, ' +
      'palette, motion, content, structure and performance. Returns the verdict ' +
      '(CLEAN/WARNINGS/FAIL) with every finding, its severity and the offending evidence.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'The HTML content to audit (raw source)' },
        path: { type: 'string', description: 'Label to report the audit against' },
        allowFetch: {
          type: 'boolean',
          description: 'Permit external font fetches (default false: offline pages score best)',
          default: false,
        },
      },
      required: ['html'],
    },
  },
  {
    name: 'list_rules',
    description: 'List the Design Health rule registry: code, area, severity and what each rule checks.',
    inputSchema: { type: 'object', properties: {} },
  },
];

/** Accept a lock as JSON text, a parsed object, or raw HTML to reverse-lock. */
function resolveRef(ref) {
  if (!ref) return null;
  if (typeof ref === 'object') return readLock(ref, 'ref');
  const text = String(ref).trim();
  if (!text) return null;
  if (text[0] === '{') return readLock(JSON.parse(text), 'ref');
  return extractLock(text, { name: 'ref', source: 'ref.html' });
}

/**
 * The trust story for a generated artifact: what the engine chose, how well it
 * scored, and how much of the source survived. Mirrors the CLI's design report.
 */
function buildDesignResult(content, options) {
  const output = options.output;
  const fidelity = sourceFidelity(content, output);
  const seed = options.seed;
  const system = paletteSystem(content.palette, seed);
  const result = {
    mode: options.mode || 'manual',
    title: content.title,
    token: options.token,
    seed: seed === undefined ? 'random' : seed,
    voice: options.voice || voiceFor(content.profile, seed, options.brief),
    palette: Object.assign({}, content.palette, system),
    harmony: system.harmony,
    quality: options.quality || qualityScore(output, content, { webFonts: !!options.webFonts }),
    fidelity: fidelity.percentage,
    detected: fidelity.detected,
    preserved: fidelity.preserved,
    anchors: content.anchors,
    bytes: output.length,
    size: (output.length / 1024).toFixed(1) + ' KB',
    artifact: options.artifact || 'response',
    source: options.source || INPUT_LABEL,
  };
  if (options.rationale) result.rationale = options.rationale;
  if (options.candidates) {
    result.reviewed = options.candidates.length;
    result.candidates = options.candidates.map((candidate) => ({
      token: candidate.token,
      // `total` is fit plus quality: the number the engine actually ranks on.
      score: candidate.total,
      fit: candidate.fit,
      quality: candidate.quality,
      seed: candidate.seed,
    }));
  }
  if (options.lock) {
    result.lock = {
      name: options.lock.lock.name,
      signature: options.lock.lock.signature,
      applied: options.lock.applied,
    };
  }
  if (options.audit) result.designHealth = options.audit;
  return result;
}

function applyRef(content, ref) {
  const lock = resolveRef(ref);
  if (!lock) return { content, lock: null, voice: undefined };
  const applied = applyLock(content, lock);
  return {
    content: applied.content,
    lock: { lock, applied: applied.applied },
    voice: applied.voice,
  };
}

function text(value) {
  return { type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) };
}

const HANDLERS = {
  reimagine(args) {
    const raw = extractContent(args.html, INPUT_LABEL);
    const ref = applyRef(raw, args.ref);
    const content = ref.content;
    const token = args.token || 'webpage';
    const voice = args.voice || ref.voice;

    if (token === 'auto') {
      return HANDLERS.design_auto(Object.assign({}, args, { html: args.html }));
    }
    if (TOKENS.indexOf(token) === -1) {
      throw new Error(
        'unknown token "' + token + '". Available: ' + TOKEN_ENUM.join(', ')
      );
    }

    const output = generate({ content, token, seed: args.seed, brief: args.brief, voice });
    const report = buildDesignResult(content, {
      mode: 'manual',
      token,
      seed: args.seed,
      voice,
      brief: args.brief,
      output,
      lock: ref.lock,
      audit: args.audit ? auditHtml(output, { path: token + '.html' }) : null,
    });
    return { content: [text(report), text('\n--- Generated HTML ---\n'), text(output)] };
  },

  design_auto(args) {
    const raw = extractContent(args.html, INPUT_LABEL);
    const ref = applyRef(raw, args.ref);
    const content = ref.content;
    const result = autoGenerate(content, {
      seed: args.seed,
      brief: args.brief,
      voice: args.voice || ref.voice,
    });
    const report = buildDesignResult(content, {
      mode: 'auto',
      token: result.token,
      seed: result.seed,
      voice: result.voice,
      brief: args.brief,
      output: result.output,
      quality: { score: result.design.quality, checks: result.design.checks },
      rationale: result.rationale,
      candidates: result.candidates,
      lock: ref.lock,
      audit: args.audit ? auditHtml(result.output, { path: result.token + '.html' }) : null,
    });
    return { content: [text(report), text('\n--- Generated HTML ---\n'), text(result.output)] };
  },

  design_variations(args) {
    const raw = extractContent(args.html, INPUT_LABEL);
    const ref = applyRef(raw, args.ref);
    const content = ref.content;
    const result = buildVariations(content, {
      count: args.count === undefined ? 3 : Number(args.count),
      seed: args.seed,
      brief: args.brief,
      voice: args.voice || ref.voice,
    });
    const sheet = contrastSheet(result, content, { source: INPUT_LABEL });
    const summary = {
      title: content.title,
      seed: result.seed,
      count: result.count,
      lock: ref.lock ? { name: ref.lock.lock.name, signature: ref.lock.lock.signature } : null,
      variations: result.variations.map((entry) => ({
        rank: entry.rank,
        token: entry.token,
        file: entry.file,
        seed: entry.seed,
        voice: entry.voice,
        fit: entry.fit,
        quality: entry.quality,
        fidelity: entry.fidelity,
        bytes: entry.bytes,
        failedChecks: entry.failed,
      })),
    };
    const blocks = [text(summary)];
    if (args.includeHtml !== false) {
      result.variations.forEach((entry) => {
        blocks.push(text('\n--- ' + entry.file + ' (' + entry.token + ') ---\n'));
        blocks.push(text(entry.output));
      });
      blocks.push(text('\n--- index.html (contrast sheet) ---\n'));
      blocks.push(text(sheet));
    }
    return { content: blocks };
  },

  design_lock(args) {
    const lock = extractLock(args.html, {
      name: args.name,
      source: args.source || INPUT_LABEL,
    });
    return { content: [text(lock)] };
  },

  extract_content(args) {
    return { content: [text(extractContent(args.html, INPUT_LABEL))] };
  },

  list_tokens() {
    const lines = TOKEN_ENUM.map((name) => {
      const description =
        name === 'auto' ? 'Choose, generate, verify, and explain' : TOKEN_DESCRIPTIONS[name];
      return '  ' + name.padEnd(14) + ' ' + description;
    });
    return { content: [text('Available design tokens:\n\n' + lines.join('\n'))] };
  },

  audit_html(args) {
    const report = auditHtml(args.html, {
      path: args.path || INPUT_LABEL,
      allowFetch: !!args.allowFetch,
    });
    return { content: [text(report)] };
  },

  list_rules() {
    return { content: [text({ rules: RULES.length, registry: RULES })] };
  },
};

/**
 * Run one tool. Errors are returned as MCP error results rather than thrown so
 * a bad argument cannot take down the whole server session.
 */
function callTool(name, args) {
  const handler = HANDLERS[name];
  if (!handler) {
    return {
      isError: true,
      content: [text({ error: 'Unknown tool: ' + name, available: Object.keys(HANDLERS) })],
    };
  }
  try {
    return handler(args || {});
  } catch (error) {
    return {
      isError: true,
      content: [text({ error: error.message, tool: name })],
    };
  }
}

module.exports = {
  TOOLS,
  callTool,
  buildDesignResult,
  resolveRef,
};
