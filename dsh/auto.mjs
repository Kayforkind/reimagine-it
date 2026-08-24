/**
 * Optional DeepSeek Harness bundle adapter for reimagine-it Design Auto.
 *
 * DSH loads this module from an installed bundle. The core npm package remains
 * dependency-free: DSH owns model access, approvals, sandboxing, and sessions;
 * this plugin only exposes the deterministic local design engine as a tool.
 */
import { readFile } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'reimagine-it-auto'
export const inject = ['tools']

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'design_auto',
    description: 'Read an HTML file inside the workspace, choose the best reimagine-it direction, generate verified candidates, and return the strongest standalone artifact. Never modify the source.',
    parameters: {
      path: { type: 'string', required: true, description: 'Workspace-relative source HTML path' },
      seed: { type: 'integer', description: 'Optional reproducibility seed' },
      brief: { type: 'string', description: 'Optional creative lens; does not add source facts' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          token: { type: 'string' },
          seed: { type: 'integer' },
          score: { type: 'number' },
          rationale: { type: 'string' },
          artifact: { type: 'string' },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: JSON.stringify({
          token: value.token,
          seed: value.seed,
          score: value.score,
          rationale: value.rationale,
          artifactBytes: value.artifact.length,
        }, null, 2),
      }],
    },
    async execute(args, exec) {
      const root = resolve(process.cwd())
      const sourcePath = resolve(root, args.path)
      const escaped = isAbsolute(args.path) || relative(root, sourcePath).startsWith('..') || relative(root, sourcePath) === '..'
      if (escaped) throw new Error('source path must be workspace-relative and stay inside the active workspace')

      const source = await readFile(sourcePath, { encoding: 'utf8', signal: exec.signal })
      const extractModule = await import('../src/extract.js')
      const autoModule = await import('../src/auto.js')
      const extractContent = extractModule.extractContent || extractModule.default?.extractContent
      const autoGenerate = autoModule.autoGenerate || autoModule.default?.autoGenerate
      if (typeof extractContent !== 'function' || typeof autoGenerate !== 'function') {
        throw new Error('reimagine-it Auto engine could not be loaded')
      }
      const content = extractContent(source, args.path)
      const result = autoGenerate(content, { seed: args.seed, brief: args.brief })
      return {
        token: result.token,
        seed: result.seed,
        score: result.score,
        rationale: result.rationale,
        artifact: result.output,
      }
    },
  }))
}
