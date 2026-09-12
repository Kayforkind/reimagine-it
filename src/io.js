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

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

/**
 * Advisory single-writer lock for auto-mode runs: two agents or CI jobs
 * racing on the same artifact path would each pass the no-clobber checks
 * and still interleave final writes. The lock is a JSON file next to the
 * artifact (`.auto.lock`) created exclusively. A live holder's heartbeat
 * refreshes it, so a crashed run's lock goes stale and is stealable.
 * `force: true` steals a live lock instead of refusing. Returns
 * { path, release() }; throws Error with .code === 'EEXIST' while another
 * live run holds the lock and force was not requested.
 */
function acquireRunLock(artifactPath, options) {
  const opts = options || {};
  const resolved = path.resolve(artifactPath);
  const lockPath = resolved + '.auto.lock';
  const staleMs = opts.staleMs || 30000;
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  for (;;) {
    const info = { pid: process.pid, at: Date.now(), heartbeat: Date.now() };
    try {
      fs.writeFileSync(lockPath, JSON.stringify(info), { flag: 'wx' });
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let existing = null;
      try { existing = JSON.parse(fs.readFileSync(lockPath, 'utf8')); } catch (_) { /* corrupt or gone */ }
      const holderAlive = existing && isPidAlive(existing.pid) && existing.pid !== process.pid;
      const fresh = existing && (Date.now() - existing.heartbeat) < staleMs;
      if (opts.force || !holderAlive || !fresh) {
        // Crashed, corrupt, forced, or our own previous run: steal via exclusive re-create.
        try { fs.unlinkSync(lockPath); } catch (_) { /* racing stealer won */ }
        continue;
      }
      const live = new Error(`another auto run (pid ${existing.pid}) holds ${lockPath}`);
      live.code = 'EEXIST';
      live.path = lockPath;
      throw live;
    }
  }
  const release = function releaseRunLock() {
    if (release.done) return;
    release.done = true;
    if (release.timer) clearInterval(release.timer);
    try { fs.unlinkSync(lockPath); } catch (_) { /* best effort */ }
  };
  process.on('exit', release);
  process.on('SIGINT', function () { process.exit(130); });
  process.on('SIGTERM', function () { process.exit(143); });
  if (opts.heartbeat !== false) {
    release.timer = setInterval(function () {
      try {
        fs.writeFileSync(lockPath, JSON.stringify({ pid: process.pid, at: Date.now(), heartbeat: Date.now() }));
      } catch (_) { /* best effort; release on exit still runs */ }
    }, staleMs / 6);
    release.timer.unref();
  }
  return { path: lockPath, release };
}

module.exports = { sameFileAsInput, assertWritable, writeFileAtomic, acquireRunLock };
