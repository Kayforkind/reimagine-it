'use strict';
/**
 * CI guard: workflow_dispatch default tags must not fall behind releases.
 *
 * Workflows like publish-action.yml can be triggered manually
 * (workflow_dispatch) and take the release tag to validate as an input
 * default. When a release ships and nobody bumps that default, the next
 * manual run silently validates a stale tag. This guard parses every
 * workflow's dispatch inputs and fails if a `default:` for a tag-typed
 * input names a tag older than the newest release.
 *
 * Deliberately line-based (no YAML dependency): we only need to find
 * `inputs:` blocks under `workflow_dispatch:` and read `description:`,
 * `default:` pairs inside them, which is stable across the shapes this
 * repo uses.
 *
 * Exit 0 when every dispatch default is current (or there is nothing to
 * check); exit 1 with a summary when drift is found, when the parser and
 * the raw text disagree (tripwire), or the repo state is unreadable.
 */
const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');
const PUBLISHED_AT = /published/i;

function listWorkflows() {
  try {
    return fs
      .readdirSync(WORKFLOWS_DIR)
      .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
      .sort();
  } catch {
    return null;
  }
}

/** Resolve the newest release: GH_RELEASE_TAG env override, else git tag list. */
function latestReleaseTag() {
  if (process.env.GH_RELEASE_TAG) return process.env.GH_RELEASE_TAG;
  const { spawnSync } = require('child_process');
  const result = spawnSync('git', ['tag', '--sort=-creatordate'], {
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0 || !result.stdout) return null;
  const tags = result.stdout.split(/\r?\n/).filter(Boolean);
  return tags.length ? tags[0] : null;
}

/** Semver-ish ordering for `vX.Y.Z` tags; unknown shapes compare lexically. */
function compareTags(a, b) {
  const semver = /^v(\d+)\.(\d+)\.(\d+)$/;
  const ma = semver.exec(a);
  const mb = semver.exec(b);
  if (ma && mb) {
    for (let i = 1; i < 4; i++) {
      const d = Number(ma[i]) - Number(mb[i]);
      if (d !== 0) return d;
    }
    return 0;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

/** True when the default value looks like a release tag (v-prefixed semver). */
function looksLikeTag(value) {
  return /^v\d+\.\d+\.\d+$/.test(value);
}

/**
 * Extract dispatch inputs with a tag-like `default:` from one workflow's text.
 * Indent model for block-style workflows: `on:` 0 → `workflow_dispatch:` 2 →
 * `inputs:` 4 → input name 6 → fields 8. List/scalar dispatch triggers
 * (`on: [push, workflow_dispatch]`) can carry no inputs, so they yield none.
 */
function dispatchTagDefaults(text) {
  const lines = text.split(/\r?\n/);
  const found = [];
  let inOn = false;
  let inDispatch = false;
  let inInputs = false;
  let current = null; // { name }

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    const stripped = line.trim();
    if (stripped === '' || stripped.startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;
    const keyMatch = /^([\w-]+):(.*)$/.exec(stripped);

    if (keyMatch && indent === 0) {
      // New top-level key: leave any on:/dispatch block. YAML 1.1 parses a
      // bare `on` key as boolean true, so accept both spellings.
      inOn = keyMatch[1] === 'on' || keyMatch[1] === 'true';
      inDispatch = false;
      inInputs = false;
      current = null;
      continue;
    }
    if (!inOn) continue;

    if (keyMatch && indent === 2) {
      inDispatch = keyMatch[1] === 'workflow_dispatch';
      inInputs = false;
      current = null;
      continue;
    }
    if (!inDispatch) continue;

    if (keyMatch && indent === 4) {
      inInputs = keyMatch[1] === 'inputs';
      current = null;
      continue;
    }
    if (!inInputs) continue;

    if (keyMatch && indent === 6) {
      current = { name: keyMatch[1] };
      continue;
    }
    if (!current) continue;

    const defaultMatch = /^default:\s*"?([^"\s]+)"?\s*$/.exec(stripped);
    if (defaultMatch && indent > 6 && looksLikeTag(defaultMatch[1])) {
      found.push({ name: current.name, default: defaultMatch[1] });
    }
  }
  return found;
}

/**
 * Crude cross-check that a tag-like default exists under some
 * workflow_dispatch inputs block. Used as a tripwire: if this regex sees
 * one but the structured parser found nothing, the parser desynced and
 * the guard must fail loudly instead of passing vacuously.
 */
const CRUDE_TAG_DEFAULT =
  /workflow_dispatch:[\s\S]*?inputs:[\s\S]*?default:\s*"?v\d+\.\d+\.\d+/;

function main() {
  const workflows = listWorkflows();
  if (!workflows) {
    console.error('DISPATCH TAG GUARD FAILED: cannot read ' + WORKFLOWS_DIR);
    process.exit(1);
  }

  const latest = latestReleaseTag();
  if (!latest) {
    // No releases/tags yet: nothing can be behind — pass vacuously.
    console.log('dispatch tags OK (no release tags yet — nothing to compare)');
    return;
  }

  const problems = [];
  let checked = 0;
  let crudeHits = 0;

  for (const name of workflows) {
    const file = path.join(WORKFLOWS_DIR, name);
    const text = fs.readFileSync(file, 'utf8');
    if (CRUDE_TAG_DEFAULT.test(text)) crudeHits++;
    for (const entry of dispatchTagDefaults(text)) {
      checked++;
      const behind = compareTags(entry.default, latest) < 0;
      if (behind) {
        problems.push(
          `  ${name}: input "${entry.name}" defaults to ${entry.default} ` +
            `but the latest release tag is ${latest}`
        );
      }
    }
  }

  // Tripwire: a tag-like dispatch default exists in the raw text but the
  // structured parser saw none — indent model desynced. Fail, don't pass.
  if (checked === 0 && crudeHits > 0) {
    console.error(
      'DISPATCH TAG GUARD FAILED: raw text suggests a tag-like dispatch ' +
        `default in ${crudeHits} workflow(s), but the parser found none — ` +
        'indent model desynced. Refusing to pass vacuously.'
    );
    process.exit(1);
  }

  if (problems.length) {
    console.error('DISPATCH TAG GUARD FAILED — stale workflow_dispatch defaults:');
    for (const problem of problems) console.error(problem);
    console.error(
      'Fix: bump the default in the workflow, or pass an explicit tag on dispatch.'
    );
    process.exit(1);
  }

  console.log(
    `dispatch tags OK (${checked} dispatch default${checked === 1 ? '' : 's'} checked, latest release ${latest})`
  );
}

main();
