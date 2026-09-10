/**
 * Shared write helpers for reimagine-it.
 *
 * Two guarantees the CLI makes to agents and CI:
 *   1. Outputs are never written to a path the source is read from — the
 *      "source stays untouched" guarantee is enforced here, not just promised
 *      in the skill docs.
 *   2. Writes are atomic: content lands in a sibling temp file and is renamed
 *      into place, so a concurrent reader or a crashed run never observes a
 *      truncated artifact. Existing files are replaced, matching the
 *      deterministic engine's byte-identical regeneration contract; callers
 *      that need a refuse-if-exists policy pass `noClobber`.
 */

const fs = require('fs');
const path = require('path');

/**
 * Refuse when the requested output path is the file the source was read from.
 * Byte equality is not enough: the two paths may be spelled differently but
 * resolve to the same file (relative vs absolute, .. segments, symlinks), so
 * both are resolved and compared case-insensitively on Windows.
 */
function sameFileAsInput(inputPath, outputPath) {
  if (!inputPath || inputPath === 'stdin.html' || !outputPath) return false;
  try {
    const inputStat = fs.statSync(inputPath);
    const outputStat = fs.statSync(outputPath);
    if (inputStat.dev === outputStat.dev && inputStat.ino === outputStat.ino) return true;
    if (fs.realpathSync(inputPath) === fs.realpathSync(outputPath)) return true;
  } catch (error) {
    // Fall through to lexical comparison (e.g. output does not exist yet).
  }
  try {
    const a = path.resolve(inputPath);
    const b = path.resolve(outputPath);
    return process.platform === 'win32'
      ? a.toLowerCase() === b.toLowerCase()
      : a === b;
  } catch (error) {
    return false;
  }
}

/**
 * Refuse, with `.code === 'EEXIST'`, if any target already exists. Callers
 * collect every path a run would touch (artifact, reports, candidates) and
 * pre-flight them so a `--no-clobber` refusal happens before anything is
 * written — no partial output.
 */
function assertWritable(targets, noClobber) {
  if (!noClobber) return;
  for (const target of targets) {
    if (target && fs.existsSync(target)) {
      const error = new Error(`refusing to overwrite existing file: ${target}`);
      error.code = 'EEXIST';
      error.path = target;
      throw error;
    }
  }
}

/**
 * Write `data` to `filePath`, replacing any existing file. If `noClobber` is
 * true, refuse instead of replacing an existing file: throws an Error with
 * `.code === 'EEXIST'` so callers can report a clean, non-destructive refusal.
 * The content is first written to a unique temp file in the destination
 * directory and renamed over the target, so readers never see a partial file
 * and a failed write leaves any previous artifact intact.
 */
function writeFileAtomic(filePath, data, noClobber) {
  const resolved = path.resolve(filePath);
  if (noClobber && fs.existsSync(resolved)) {
    const error = new Error(`refusing to overwrite existing file: ${resolved}`);
    error.code = 'EEXIST';
    error.path = resolved;
    throw error;
  }
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const tempPath = path.join(
    path.dirname(resolved),
    `.${path.basename(resolved)}.${process.pid}.${Date.now()}.tmp`
  );
  try {
    fs.writeFileSync(tempPath, data, 'utf8');
    fs.renameSync(tempPath, resolved);
  } catch (error) {
    try { fs.unlinkSync(tempPath); } catch (_) { /* best effort */ }
    throw error;
  }
}

module.exports = { sameFileAsInput, assertWritable, writeFileAtomic };
