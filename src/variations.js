/**
 * Variations — several content-derived directions from one source, side by side.
 *
 * Auto picks one direction and explains it. Variations answers the other
 * question a reviewer asks: what else did this content support? Every entry is
 * generated from the same extracted evidence, scored with the same craft
 * checks, and reproducible from the reported seed.
 *
 * The contrast sheet is a review artifact, not a design deliverable. It still
 * holds the craft floor and derives its own palette from the source, so the
 * comparison page does not undercut the pages it is comparing.
 */

var variationsGenerate = typeof module !== 'undefined' && module.exports
  ? require('./generate')
  : (typeof window !== 'undefined' ? window.ReimagineGenerate : {});

var variationsAuto = typeof module !== 'undefined' && module.exports
  ? require('./auto')
  : (typeof window !== 'undefined' ? window.ReimagineAuto : {});

var variationsResult = typeof module !== 'undefined' && module.exports
  ? require('./result')
  : (typeof window !== 'undefined' ? window.ReimagineResult : {});

var MAX_VARIATIONS = 8;

function hashString(value) {
  var hash = 2166136261;
  String(value || '').split('').forEach(function (char) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}

function esc(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function clampCount(value) {
  var count = Number(value);
  if (!isFinite(count)) return 3;
  return Math.max(2, Math.min(MAX_VARIATIONS, Math.floor(count)));
}

function slug(value) {
  return String(value || 'direction').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Rank directions by fit, then generate and score each one.
 * Deterministic for a given base seed.
 */
function buildVariations(content, options) {
  options = options || {};
  var count = clampCount(options.count === undefined ? 3 : options.count);
  var tokens = options.tokens && options.tokens.length
    ? options.tokens.slice(0, MAX_VARIATIONS)
    : rankedTokens(content, count);
  var baseSeed = options.seed === undefined
    ? Math.floor(Math.random() * 0x7fffffff)
    : Number(options.seed);
  if (!Number.isSafeInteger(baseSeed)) baseSeed = Math.floor(Math.random() * 0x7fffffff);

  var fit = {};
  if (variationsAuto.chooseTokens) {
    // chooseTokens caps at three; score directly so every requested direction
    // reports a real fit number rather than a blank.
    (variationsAuto.DEFAULT_CANDIDATES || []).forEach(function (token) {
      fit[token] = variationsAuto.scoreToken(token, content);
    });
  }

  var entries = tokens.map(function (token, index) {
    var seed = (baseSeed + hashString(token) + (index + 1) * 7919) | 0;
    var output = variationsGenerate.generate({
      content: content,
      token: token,
      seed: seed,
      brief: options.brief,
      voice: options.voice,
      webFonts: options.webFonts,
    });
    var quality = variationsAuto.qualityScore(output, content, { webFonts: !!options.webFonts });
    var fidelity = variationsResult.sourceFidelity(content, output);
    return {
      token: token,
      seed: seed,
      fit: fit[token] === undefined ? 0 : fit[token],
      quality: quality.score,
      checks: quality.checks,
      failed: quality.checks.filter(function (check) { return !check.passed; })
        .map(function (check) { return check.name; }),
      fidelity: fidelity.percentage,
      detected: fidelity.detected,
      voice: options.voice || variationsGenerate.voiceFor(content.profile, seed, options.brief),
      description: (variationsGenerate.TOKEN_DESCRIPTIONS || {})[token] || token,
      bytes: output.length,
      file: null,
      output: output,
    };
  });

  entries.sort(function (a, b) {
    return (b.quality - a.quality) || (b.fidelity - a.fidelity) || a.token.localeCompare(b.token);
  });
  entries.forEach(function (entry, index) {
    entry.rank = index + 1;
    entry.file = String(index + 1).padStart(2, '0') + '-' + slug(entry.token) + '.html';
  });

  return { seed: baseSeed, count: entries.length, variations: entries };
}

function rankedTokens(content, count) {
  if (variationsAuto.rankTokens) {
    return variationsAuto.rankTokens(content, count).map(function (entry) { return entry.token; });
  }
  var all = (variationsAuto.DEFAULT_CANDIDATES || []).slice();
  if (!all.length) return ['webpage'];
  return all.map(function (token) {
    return { token: token, score: variationsAuto.scoreToken(token, content) };
  }).sort(function (a, b) {
    return b.score - a.score || all.indexOf(a.token) - all.indexOf(b.token);
  }).slice(0, count).map(function (entry) { return entry.token; });
}

function swatchRow(palette, x, y, width, stroke) {
  var roles = ['ground', 'accent', 'muted', 'surface', 'ink'];
  var step = width / roles.length;
  return roles.map(function (role, index) {
    // A stroke keeps ground and surface legible when they sit on the ground.
    return '<rect x="' + (x + index * step).toFixed(1) + '" y="' + y + '" width="' +
      (step - 3).toFixed(1) + '" height="16" rx="2" fill="' + esc(palette[role] || '#888') +
      '" stroke="' + esc(stroke) + '" stroke-opacity="0.45"></rect>';
  }).join('');
}

// Balanced grids read as a deliberate comparison; a lone orphan card reads as
// a layout bug. Choose a column count that divides the set evenly.
function columnsFor(count) {
  if (count <= 2) return 2;
  if (count === 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * A standalone comparison page. Cards render each direction in a lazy iframe
 * and repeat the numbers as text, so the sheet stays informative even where
 * local iframes are blocked.
 */
function contrastSheet(result, content, options) {
  options = options || {};
  var palette = (content && content.palette) || {};
  var ground = palette.ground || '#10131a';
  var accent = palette.accent || '#e8a63f';
  var muted = palette.muted || '#778094';
  var surface = palette.surface || '#1a202b';
  var ink = palette.ink || '#f4ecd8';
  var title = (content && content.title) || 'Source';
  var sourceLabel = options.source || 'source.html';
  var command = options.command || 'npx reimagine-it -i ' + sourceLabel + ' --variations ' + result.count;
  var columns = columnsFor(result.variations.length);
  // Size the page to the grid instead of forcing one fixed measure on every count.
  var wrapWidth = Math.max(980, Math.min(1440, 320 * columns + 22 * (columns - 1) + 56));

  // Two bars per row: design-QA saturates when every direction clears the bar,
  // so fidelity is what actually separates them.
  var ROW_HEIGHT = 34;
  var BAR_SPAN = 300;
  var figureHeight = 64 + result.variations.length * ROW_HEIGHT;
  var bars = result.variations.map(function (entry, index) {
    var y = 48 + index * ROW_HEIGHT;
    var qualityWidth = Math.max(4, (entry.quality / 136) * BAR_SPAN);
    var fidelityWidth = Math.max(4, (entry.fidelity / 100) * BAR_SPAN);
    return '<text x="0" y="' + (y + 14) + '" font-size="11" fill="' + esc(ink) + '">' +
      esc(entry.token) + '</text>' +
      '<rect x="96" y="' + y + '" width="' + qualityWidth.toFixed(1) + '" height="10" rx="2" fill="' + esc(accent) + '"></rect>' +
      '<text x="' + (104 + qualityWidth).toFixed(1) + '" y="' + (y + 9) + '" font-size="10" fill="' + esc(muted) + '">' +
      entry.quality + '</text>' +
      '<rect x="96" y="' + (y + 14) + '" width="' + fidelityWidth.toFixed(1) + '" height="10" rx="2" fill="' + esc(muted) + '" opacity="0.7"></rect>' +
      '<text x="' + (104 + fidelityWidth).toFixed(1) + '" y="' + (y + 23) + '" font-size="10" fill="' + esc(muted) + '">' +
      entry.fidelity + '%</text>' +
      swatchRow(palette, 470, y + 4, 128, ink);
  }).join('');

  var figure = '<svg class="spread" viewBox="0 0 620 ' + figureHeight + '" width="620" height="' + figureHeight +
    '" role="img" aria-label="Design QA score, source fidelity, and palette for each direction">' +
    '<text x="0" y="16" font-size="11" fill="' + esc(muted) + '" letter-spacing="0.14em">DIRECTION</text>' +
    '<rect x="96" y="7" width="10" height="10" rx="2" fill="' + esc(accent) + '"></rect>' +
    '<text x="112" y="16" font-size="11" fill="' + esc(muted) + '" letter-spacing="0.14em">QA / 136</text>' +
    '<rect x="204" y="7" width="10" height="10" rx="2" fill="' + esc(muted) + '" opacity="0.7"></rect>' +
    '<text x="220" y="16" font-size="11" fill="' + esc(muted) + '" letter-spacing="0.14em">FIDELITY</text>' +
    '<text x="470" y="16" font-size="11" fill="' + esc(muted) + '" letter-spacing="0.14em">PALETTE</text>' +
    '<line x1="0" y1="28" x2="620" y2="28" stroke="' + esc(muted) + '" stroke-opacity="0.3"></line>' +
    bars +
    '</svg>';

  var cards = result.variations.map(function (entry) {
    return '<article class="card">' +
      '<header class="card-head">' +
      '<span class="rank">' + entry.rank + '</span>' +
      '<h2>' + esc(entry.token) + '</h2>' +
      '<span class="score">' + entry.quality + '<small>/136</small></span>' +
      '</header>' +
      '<p class="desc">' + esc(entry.description) + '</p>' +
      '<div class="frame"><iframe src="' + esc(entry.file) + '" loading="lazy" title="' +
      esc(entry.token) + ' direction"></iframe></div>' +
      '<dl class="stats">' +
      '<dt>Fidelity</dt><dd>' + entry.fidelity + '% of ' + entry.detected + ' facts</dd>' +
      '<dt>Voice</dt><dd>' + esc(entry.voice) + '</dd>' +
      '<dt>Fit</dt><dd>' + entry.fit + '</dd>' +
      '<dt>Seed</dt><dd>' + entry.seed + '</dd>' +
      '<dt>Size</dt><dd>' + (entry.bytes / 1024).toFixed(1) + ' KB</dd>' +
      '<dt>Craft</dt><dd>' + (entry.failed.length ? esc(entry.failed.join(', ')) : 'all checks passed') + '</dd>' +
      '</dl>' +
      '<a class="open" href="' + esc(entry.file) + '">Open ' + esc(entry.file) + '</a>' +
      '</article>';
  }).join('');

  var css = '*{box-sizing:border-box;margin:0;padding:0}' +
    ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + ';' +
    '--text-meta:11px;--text-body:16px;--text-head:30px;--text-display:clamp(40px,6vw,72px)}' +
    'html{background:var(--g);color:var(--i);-webkit-font-smoothing:antialiased}' +
    'body{font:var(--text-body)/1.6 ui-sans-serif,system-ui,"Segoe UI Variable Text","Segoe UI",sans-serif;min-height:100vh}' +
    '.wrap{max-width:' + wrapWidth + 'px;margin:0 auto;padding:56px 28px 96px}' +
    'h1{font-size:var(--text-display);line-height:1.02;letter-spacing:-0.02em;font-weight:700}' +
    '.kicker{font-size:var(--text-meta);letter-spacing:0.18em;text-transform:uppercase;color:var(--a);margin-bottom:14px}' +
    '.lede{max-width:62ch;color:var(--m);margin:18px 0 8px}' +
    'code{font:var(--text-meta)/1.5 ui-monospace,Consolas,monospace;background:var(--s);color:var(--i);padding:3px 7px;border-radius:4px}' +
    '.spread{max-width:100%;height:auto;margin:36px 0 8px;overflow:visible}' +
    '.grid{display:grid;gap:22px;grid-template-columns:repeat(' + columns + ',minmax(0,1fr));margin-top:36px}' +
    '.card{background:var(--s);border:1px solid color-mix(in srgb,var(--m) 26%,transparent);border-radius:10px;padding:18px;content-visibility:auto;contain-intrinsic-size:0 520px}' +
    '.card-head{display:flex;align-items:baseline;gap:10px}' +
    '.rank{font:var(--text-meta)/1 ui-monospace,Consolas,monospace;color:var(--g);background:var(--a);border-radius:3px;padding:4px 6px}' +
    'h2{font-size:var(--text-head);letter-spacing:-0.01em;font-weight:650;flex:1}' +
    '.score{font:600 20px/1 ui-monospace,Consolas,monospace;color:var(--a)}' +
    '.score small{font-size:var(--text-meta);color:var(--m)}' +
    '.desc{color:var(--m);font-size:13px;margin:8px 0 14px}' +
    '.frame{aspect-ratio:16/10;border-radius:6px;overflow:hidden;background:var(--g);border:1px solid color-mix(in srgb,var(--m) 20%,transparent)}' +
    '.frame iframe{width:200%;height:200%;border:0;transform:scale(.5);transform-origin:0 0}' +
    '.stats{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:16px 0;font-size:12px}' +
    '.stats dt{color:var(--m);letter-spacing:0.06em;text-transform:uppercase;font-size:var(--text-meta)}' +
    '.stats dd{font-family:ui-monospace,Consolas,monospace}' +
    '.open{display:inline-block;color:var(--a);font-size:13px;text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--a) 45%,transparent);transition:opacity .2s ease}' +
    '.open:hover{opacity:.75}' +
    '::selection{background:var(--a);color:var(--g)}' +
    ':focus-visible{outline:2px solid var(--a);outline-offset:3px;border-radius:3px}' +
    '@media(max-width:1080px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '@media(max-width:720px){.grid{grid-template-columns:1fr}}' +
    '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}}';

  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="dark light">' +
    '<title>' + esc(title) + ' — ' + result.count + ' directions</title>' +
    '<style>' + css + '</style></head><body><main class="wrap">' +
    '<p class="kicker">Content-Derived Design · ' + result.count + ' directions</p>' +
    '<h1>' + esc(title) + '</h1>' +
    '<p class="lede">Every direction below was generated from the same extracted evidence in ' +
    '<code>' + esc(sourceLabel) + '</code>. Scores are the engine&rsquo;s own design-QA battery; ' +
    'fidelity counts detected source facts preserved in the output. Reproduce this set with ' +
    '<code>--seed ' + result.seed + '</code>.</p>' +
    '<p class="lede"><code>' + esc(command) + '</code></p>' +
    figure +
    '<div class="grid">' + cards + '</div>' +
    '</main></body></html>';
}

var variationsApi = {
  MAX_VARIATIONS: MAX_VARIATIONS,
  buildVariations: buildVariations,
  contrastSheet: contrastSheet,
};

if (typeof module !== 'undefined' && module.exports) module.exports = variationsApi;
if (typeof window !== 'undefined') window.ReimagineVariations = variationsApi;
