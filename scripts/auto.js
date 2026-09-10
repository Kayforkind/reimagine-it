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
const { sourceFidelity } = require('../src/result');
const { sameFileAsInput, assertWritable, writeFileAtomic } = require('../src/io');

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
  --candidates <n>        Evaluate 1–3 directions (default: 3); output includes all verified options
  --quiet, -q             Do not print the result summary
  --no-clobber            Refuse (exit 2) instead of replacing an existing output file;
                          the source path is always refused, flag or no flag
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
  candidates: args.candidates === undefined ? 3 : args.candidates,
});

const artifactIsStdout = args.output === '-';
const outputPath = artifactIsStdout ? null : path.resolve(args.output || path.join('reimagined', 'auto.html'));
const reportPath = path.resolve(args.report || (outputPath ? outputPath.replace(/\.html?$/i, '.json') : 'reimagined/auto.json'));
const candidateDir = outputPath ? path.join(path.dirname(outputPath), path.basename(outputPath, path.extname(outputPath)) + '-options') : null;
const fidelity = sourceFidelity(content, result.output);

if (outputPath) {
  const candidateFiles = result.candidates.slice(1).map((candidate, index) =>
    path.join(candidateDir, `${String(index + 2).padStart(2, '0')}-${candidate.token}.html`)
  );
  try {
    if (args.input && args.input !== '-' && sameFileAsInput(path.resolve(args.input), outputPath)) {
      fail(`output would overwrite the source. Choose a different --output path: ${outputPath}`, 2);
    }
    assertWritable([outputPath, ...candidateFiles], args.noClobber);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileAtomic(outputPath, result.output, args.noClobber);
    result.candidates.slice(1).forEach((candidate, index) => {
      fs.mkdirSync(candidateDir, { recursive: true });
      writeFileAtomic(candidateFiles[index], generateCandidate(content, candidate, args.brief), args.noClobber);
    });
  } catch (error) {
    if (error.code === 'EEXIST') fail(`--no-clobber: ${error.message}`, 2);
    throw error;
  }
} else {
  process.stdout.write(result.output);
}

try {
  if (args.input && args.input !== '-' && sameFileAsInput(path.resolve(args.input), reportPath)) {
    fail(`report would overwrite the source. Choose a different --report path: ${reportPath}`, 2);
  }
  assertWritable([reportPath], args.noClobber);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileAtomic(reportPath, JSON.stringify({
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
  fidelity,
}, null, 2) + '\n', args.noClobber);
} catch (error) {
  if (error.code === 'EEXIST') fail(`--no-clobber: ${error.message}`, 2);
  throw error;
}

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
    else if (arg === '--no-clobber') options.noClobber = true;
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

function generateCandidate(content, candidate, brief) {
  const { generate } = require('../src/generate');
  return generate({ content, token: candidate.token, seed: candidate.seed, brief });
}

function fail(message, code) {
  console.error(`Error: ${message}`);
  process.exit(code || 1);
}
