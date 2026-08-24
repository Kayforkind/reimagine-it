#!/usr/bin/env node
/**
 * Design Auto command runner.
 *
 * Source is read-only. The runner writes one selected artifact and a small,
 * machine-readable decision report so an agent or CI job can review the draw.
 */

const fs = require('fs');
const path = require('path');
const { extractContent } = require('../src/extract');
const { autoGenerate } = require('../src/auto');

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const args = parseArgs(process.argv.slice(2));

if (args.error) fail(args.error, 2);
if (args.help) {
  console.log(`Usage: npm run auto -- [options]

Options:
  --input, -i <path>      Source HTML file, or - for stdin
  --output, -o <path>     Selected artifact (default: reimagined/auto.html)
  --report, -r <path>     Decision report (default: next to the artifact)
  --seed, -s <n>          Pin the creative draw with a safe integer
  --brief, -b <text>      Creative lens; it does not add source facts
  --candidates <n>        Evaluate 1–3 directions (default: 3)
  --quiet, -q             Do not print the result summary
  --help, -h              Show this help
`);
  process.exit(0);
}

let source;
let inputLabel = args.input || 'stdin.html';
try {
  if (args.input && args.input !== '-') {
    const inputPath = path.resolve(args.input);
    const stat = fs.statSync(inputPath);
    if (!stat.isFile()) fail(`input is not a file: ${inputPath}`, 2);
    if (stat.size > MAX_INPUT_BYTES) fail(`input is larger than 10 MB: ${inputPath}`, 2);
    source = fs.readFileSync(inputPath, 'utf8');
    inputLabel = args.input;
  } else {
    source = fs.readFileSync(0, 'utf8');
  }
} catch (error) {
  fail(`could not read input: ${error.message}`, 2);
}

const content = extractContent(source, inputLabel);
const result = autoGenerate(content, {
  seed: args.seed,
  brief: args.brief,
  candidates: args.candidates,
});

const artifactIsStdout = args.output === '-';
const outputPath = artifactIsStdout ? null : path.resolve(args.output || path.join('reimagined', 'auto.html'));
const reportPath = path.resolve(args.report || (outputPath ? outputPath.replace(/\.html?$/i, '.json') : 'reimagined/auto.json'));

if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.output, 'utf8');
} else {
  process.stdout.write(result.output);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  mode: result.mode,
  token: result.token,
  seed: result.seed,
  score: result.score,
  rationale: result.rationale,
  candidates: result.candidates,
  anchors: result.plan.anchors,
  facts: result.plan.facts,
  source: inputLabel,
  artifact: outputPath || 'stdout',
}, null, 2) + '\n', 'utf8');

if (!args.quiet) {
  process.stderr.write(JSON.stringify({
    artifact: outputPath || 'stdout',
    report: reportPath,
    token: result.token,
    seed: result.seed,
    score: result.score,
  }, null, 2) + '\n');
}

function parseArgs(raw) {
  const options = { candidates: undefined };
  const valueFlags = new Set(['-i', '--input', '-o', '--output', '-r', '--report', '-s', '--seed', '-b', '--brief', '--candidates']);
  const aliases = {
    '-i': 'input', '--input': 'input',
    '-o': 'output', '--output': 'output',
    '-r': 'report', '--report': 'report',
    '-s': 'seed', '--seed': 'seed',
    '-b': 'brief', '--brief': 'brief',
    '--candidates': 'candidates',
  };
  for (let index = 0; index < raw.length; index += 1) {
    const arg = raw[index];
    if (valueFlags.has(arg)) {
      const value = raw[index + 1];
      if (value === undefined || (value.startsWith('-') && arg !== '--brief' && arg !== '-s' && arg !== '--seed' && value !== '-')) {
        return { error: `${arg} expects a value` };
      }
      options[aliases[arg]] = value;
      index += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--quiet' || arg === '-q') options.quiet = true;
    else return { error: `unknown option "${arg}". Use --help for usage.` };
  }

  if (options.seed !== undefined) {
    if (!/^-?\d+$/.test(String(options.seed)) || !Number.isSafeInteger(Number(options.seed))) {
      return { error: '--seed must be a safe integer' };
    }
    options.seed = Number(options.seed);
  }
  if (options.candidates !== undefined) {
    if (!/^\d+$/.test(String(options.candidates)) || Number(options.candidates) < 1 || Number(options.candidates) > 3) {
      return { error: '--candidates must be an integer from 1 to 3' };
    }
    options.candidates = Number(options.candidates);
  }
  return options;
}

function fail(message, code) {
  console.error(`Error: ${message}`);
  process.exit(code || 1);
}
