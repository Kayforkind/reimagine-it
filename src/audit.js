/**
 * Design Health — deterministic craft-floor audit.
 *
 * No LLM, no API key, no network. The rule set is a registry so the published
 * rule count is derived from the code rather than restated in prose.
 *
 * This module is the reference implementation. `scripts/audit.py` mirrors it
 * for the Python-based GitHub Action, and `test/unit/audit-parity.test.js`
 * fails if the two ever disagree on any file in the repository.
 *
 * Three things it resolves that naive HTML linting misses:
 *   1. CSS custom properties — `font-family:var(--sans)` is resolved back to
 *      the declared stack before font rules run.
 *   2. Fluid lengths — `clamp()`, `min()`, and `max()` contribute every px
 *      value they can resolve to, so a fluid type scale is legible to the
 *      hierarchy rule.
 *   3. Real pass counts — every rule reports, so a clean file says how many
 *      rules it actually cleared.
 */

// ── Rule registry ─────────────────────────────────────────────────────────
// severity is the worst outcome a rule can produce. PAL-01 can warn or fail
// depending on how far the palette has drifted.

var RULES = [
  { code: 'TYPO-01', category: 'Typography', severity: 'warning', title: 'No banned default fonts' },
  { code: 'TYPO-02', category: 'Typography', severity: 'warning', title: 'Type scale has range and steps' },
  { code: 'TYPO-03', category: 'Typography', severity: 'warning', title: 'Prose measure capped at 65ch' },
  { code: 'PAL-01', category: 'Palette', severity: 'failure', title: 'Palette stays constrained' },
  { code: 'PAL-02', category: 'Palette', severity: 'failure', title: 'No transition: all' },
  { code: 'PAL-03', category: 'Palette', severity: 'warning', title: '::selection is styled' },
  { code: 'MOT-01', category: 'Motion', severity: 'failure', title: 'No outline removal without replacement' },
  { code: 'MOT-02', category: 'Motion', severity: 'failure', title: 'prefers-reduced-motion honored' },
  { code: 'MOT-03', category: 'Motion', severity: 'failure', title: ':focus-visible present' },
  { code: 'MOT-04', category: 'Motion', severity: 'warning', title: 'Compositor-only animation' },
  { code: 'CONT-01', category: 'Content', severity: 'failure', title: 'No placeholder copy' },
  { code: 'CONT-02', category: 'Content', severity: 'warning', title: 'No vibe adjectives' },
  { code: 'CONT-03', category: 'Content', severity: 'warning', title: 'No emoji farm' },
  { code: 'CONT-04', category: 'Content', severity: 'warning', title: 'No <br><br> spacing' },
  { code: 'STR-01', category: 'Structure', severity: 'failure', title: 'Opens offline — no CDN' },
  { code: 'STR-02', category: 'Structure', severity: 'failure', title: 'No external font fetch' },
  { code: 'STR-03', category: 'Structure', severity: 'warning', title: 'Figure system does real work' },
  { code: 'PERF-01', category: 'Performance', severity: 'warning', title: 'Images declare dimensions' },
  { code: 'PERF-02', category: 'Performance', severity: 'warning', title: 'Long pages hint content-visibility' },
];

var RULE_ORDER = RULES.map(function (rule) { return rule.code; });

var BANNED_FONTS = [
  'inter', 'roboto', 'arial', 'space grotesk', 'helvetica',
  'open sans', 'lato', 'montserrat', 'poppins', 'raleway',
];

var PLACEHOLDER_PHRASES = [
  'lorem ipsum', 'dolor sit amet', 'title goes here',
  'type something', 'sample text', 'your text here', 'testimonials go here',
];

var PLACEHOLDER_TOKENS = ['TBD', 'TODO', 'Lorem'];

var VIBE_WORDS = [
  'wow', 'amazing', 'incredible', 'revolutionary', 'game-changing',
  'disruptive', 'unprecedented', 'best-in-class', 'world-class',
  'cutting-edge', 'state-of-the-art', 'innovative',
];

var NAMED_NEUTRALS = {
  '#f5f5f5': 1, '#e5e7eb': 1, '#d1d5db': 1, '#9ca3af': 1, '#6b7280': 1,
  '#4b5563': 1, '#374151': 1, '#1f2937': 1, '#111827': 1,
};

// Non-compositor properties: animating these forces layout or paint work.
var BAD_ANIM_PROPS = {
  top: 1, left: 1, right: 1, bottom: 1,
  margin: 1, 'margin-top': 1, 'margin-right': 1, 'margin-bottom': 1, 'margin-left': 1,
  padding: 1, 'padding-top': 1, 'padding-right': 1, 'padding-bottom': 1, 'padding-left': 1,
  width: 1, 'max-width': 1, 'min-width': 1,
  height: 1, 'max-height': 1, 'min-height': 1,
  font: 1, 'font-size': 1, 'letter-spacing': 1, 'line-height': 1, 'word-spacing': 1,
  color: 1, background: 1, 'background-color': 1, fill: 1, stroke: 1, 'stroke-dashoffset': 1,
};

// The engine's own palette ceiling: three source-declared brand colors plus
// the derived accent/tint family. `src/auto.js` scores anything above 16
// distinct hexes as an unbounded palette, so Design Health uses the same bar
// rather than a second, conflicting one.
var PALETTE_WARN_ABOVE = 16;
var PALETTE_FAIL_ABOVE = 24;

// Type hierarchy is measured as range plus steps rather than fixed size bands,
// because banded thresholds report a false "missing level" for any scale whose
// steps land between the bands. Designed output across every builder clears
// 4 steps and a 3x range; flat documents do not.
var TYPE_MIN_STEPS = 4;
var TYPE_MIN_RATIO = 3;

// A figure system is hero-scale by declared size, or a canvas, or enough drawn
// geometry to be a repeated figure rather than decoration. Measured on shape
// elements so a noise texture in a data URI cannot pass the rule.
var FIGURE_HERO_PX = 400;
var FIGURE_MIN_SHAPES = 6;

var EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u2600-\u27BF\u2B50\u2728]/gu;
var CUSTOM_PROP_RE = /(--[\w-]+)\s*:\s*([^;{}]+)/g;
var COLOR_DECL_RE = /(?:color|background(?:-color)?|fill|stroke)\s*:\s*([^;{}]+)/gi;
var FONT_FAMILY_RE = /font-family\s*:\s*([^;{}]+)/gi;
var FONT_SIZE_RE = /font(?:-size)?\s*:\s*([^;{}]+)/gi;
var LENGTH_RE = /(-?\d+(?:\.\d+)?)\s*(px|rem|em)\b/gi;
var ANIMATED_PROP_RE = /(?:animation|transition)(?:-property)?\s*:\s*([^;{}]+)/gi;
var BR_SPACING_RE = /<br\s*\/?>\s*<br\s*\/?>/i;
var CDN_RE = /(?:src=|href=)["']https?:\/\/(?!raw\.githubusercontent\.com\/Kayforkind\/reimagine-it)[^"']*?\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp|mp3|mp4|webm)["'\s]/i;
var WEBFONT_RE = /@import\s+url\s*\(|href=["']https?:\/\/fonts\.googleapis\.com/i;
var MEASURE_RE = /max-width\s*:\s*(?:6[0-5]|[1-5]\d)ch/i;
var SHAPE_RE = /<(?:path|rect|circle|ellipse|polygon|polyline|line)\b/gi;
var DATA_URI_RE = /url\((["']?)data:[^)]*\1\)/gi;

// ── Parsing ───────────────────────────────────────────────────────────────

function stripComments(css) {
  return String(css).replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function stripDataUris(value) {
  // Embedded assets never carry the page's own type, palette, or geometry.
  return String(value).replace(DATA_URI_RE, 'url(#embedded)');
}

function collectCss(raw) {
  var blocks = [];
  var styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  var match;
  while ((match = styleRe.exec(raw)) !== null) blocks.push(match[1]);
  var inlineRe = /style\s*=\s*"([^"]*)"/gi;
  while ((match = inlineRe.exec(raw)) !== null) blocks.push(match[1]);
  return stripDataUris(stripComments(blocks.join('\n')));
}

function customProperties(css) {
  var props = {};
  var match;
  CUSTOM_PROP_RE.lastIndex = 0;
  while ((match = CUSTOM_PROP_RE.exec(css)) !== null) {
    // Last declaration wins, which approximates the cascade for the
    // single-file output this tool audits.
    props[match[1]] = match[2].trim();
  }
  return props;
}

// var() resolution is intentionally shallow-iterative: six passes resolve
// every chain the generator emits without risking a cyclic definition loop.
function resolveVars(text, props) {
  var pattern = /var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g;
  for (var pass = 0; pass < 6; pass++) {
    var changed = false;
    var next = text.replace(pattern, function (whole, name, fallback) {
      if (Object.prototype.hasOwnProperty.call(props, name)) {
        changed = true;
        return props[name];
      }
      if (fallback !== undefined) {
        changed = true;
        return fallback;
      }
      return whole;
    });
    if (!changed) break;
    text = next;
  }
  return text;
}

function lengthsToPx(value) {
  var out = [];
  var match;
  LENGTH_RE.lastIndex = 0;
  while ((match = LENGTH_RE.exec(value)) !== null) {
    var size = parseFloat(match[1]);
    var unit = match[2].toLowerCase();
    out.push(unit === 'px' ? size : size * 16);
  }
  return out;
}

function declarationValues(css, pattern) {
  var out = [];
  var match;
  pattern.lastIndex = 0;
  while ((match = pattern.exec(css)) !== null) out.push(match[1]);
  return out;
}

function isNeutralHex(hex) {
  if (NAMED_NEUTRALS[hex]) return true;
  var r = hex.slice(1, 3), g = hex.slice(3, 5), b = hex.slice(5, 7);
  // Pure grayscale carries no hue, so it is structure rather than palette.
  return r === g && g === b;
}

function normaliseHex(hex) {
  hex = hex.toLowerCase();
  if (hex.length === 4) return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  if (hex.length === 7) return hex;
  return null;
}

function parsePage(raw, filePath) {
  raw = String(raw == null ? '' : raw);
  var css = collectCss(raw);
  var props = customProperties(css);
  var cssResolved = resolveVars(css, props);
  var text = raw.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  var fonts = [];
  declarationValues(cssResolved, FONT_FAMILY_RE).forEach(function (value) {
    value.split(',').forEach(function (family) {
      var name = family.trim().replace(/^["']|["']$/g, '').trim();
      if (name) fonts.push(name.toLowerCase());
    });
  });

  var sizes = [];
  declarationValues(cssResolved, FONT_SIZE_RE).forEach(function (value) {
    lengthsToPx(value).forEach(function (size) { sizes.push(size); });
  });

  var colors = {};
  declarationValues(cssResolved, COLOR_DECL_RE).forEach(function (value) {
    (value.match(/#[0-9a-f]{3,8}\b/gi) || []).forEach(function (hex) {
      var normalised = normaliseHex(hex);
      if (normalised) colors[normalised] = 1;
    });
  });

  var markup = stripDataUris(raw);
  var figures = [];
  var figureRe = /<(svg|canvas)\b([^>]*)>/gi;
  var figure;
  while ((figure = figureRe.exec(markup)) !== null) {
    var attrs = figure[2];
    var largest = 0;
    var dimRe = /\b(?:width|height)\s*=\s*["']?(\d+)/gi;
    var dim;
    while ((dim = dimRe.exec(attrs)) !== null) largest = Math.max(largest, parseInt(dim[1], 10));
    var viewBox = /viewBox\s*=\s*["']\s*-?[\d.]+\s+-?[\d.]+\s+([\d.]+)\s+([\d.]+)/i.exec(attrs);
    if (viewBox) largest = Math.max(largest, parseFloat(viewBox[1]), parseFloat(viewBox[2]));
    figures.push({ tag: figure[1].toLowerCase(), largest: largest });
  }

  return {
    path: filePath || '(inline)',
    raw: raw,
    markup: markup,
    text: text,
    css: css,
    cssResolved: cssResolved,
    props: props,
    fonts: fonts,
    sizes: sizes,
    colors: Object.keys(colors),
    figures: figures,
    shapes: (markup.match(SHAPE_RE) || []).length,
  };
}

// ── Rules ─────────────────────────────────────────────────────────────────
// Each check returns a message string to raise a finding, or null to pass.
// At most one finding per rule keeps the pass count meaningful.

function checkTypo01(page) {
  var seen = {};
  page.fonts.forEach(function (font) {
    if (BANNED_FONTS.indexOf(font) >= 0) seen[font] = 1;
  });
  var found = Object.keys(seen).sort();
  if (!found.length) return null;
  return {
    message: 'Banned font(s) found: ' + found.join(', ') +
      '. Prefer content-derived or distinctive choices.',
  };
}

function typeScale(page) {
  var seen = {};
  page.sizes.forEach(function (size) {
    if (size > 0) seen[Math.round(size * 10) / 10] = 1;
  });
  var steps = Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
  var min = steps.length ? steps[0] : 0;
  var max = steps.length ? steps[steps.length - 1] : 0;
  return { steps: steps.length, min: min, max: max, ratio: min ? max / min : 0 };
}

function checkTypo02(page) {
  var scale = typeScale(page);
  if (!scale.steps) {
    return { message: 'No font sizes declared — the page has no type scale at all.' };
  }
  var problems = [];
  if (scale.steps < TYPE_MIN_STEPS) {
    problems.push('only ' + scale.steps + ' distinct size(s), expected ' + TYPE_MIN_STEPS);
  }
  if (scale.ratio < TYPE_MIN_RATIO) {
    problems.push('display:meta ratio ' + (Math.round(scale.ratio * 100) / 100) +
      'x, expected ' + TYPE_MIN_RATIO + 'x');
  }
  if (!problems.length) return null;
  return { message: 'Flat type scale — ' + problems.join('; ') + '.' };
}

function checkTypo03(page) {
  if (MEASURE_RE.test(page.cssResolved)) return null;
  if (page.text.length <= 200) return null;
  return { message: 'No max-width text measure (<=65ch) found on containers.' };
}

function checkPal01(page) {
  var nonNeutral = page.colors.filter(function (hex) { return !isNeutralHex(hex); });
  if (nonNeutral.length > PALETTE_FAIL_ABOVE) {
    return {
      severity: 'failure',
      message: nonNeutral.length + ' non-neutral colors — palette is unconstrained.',
    };
  }
  if (nonNeutral.length > PALETTE_WARN_ABOVE) {
    return {
      message: nonNeutral.length + ' distinct non-neutral colors found. ' +
        'The derived palette system tops out at ' + PALETTE_WARN_ABOVE + '.',
    };
  }
  return null;
}

function checkPal02(page) {
  if (!/transition\s*:\s*all\b/i.test(page.raw) && !/transition\s*:\s*all\b/i.test(page.cssResolved)) return null;
  return { message: "Banned: 'transition: all' found. Animate explicit properties." };
}

function checkPal03(page) {
  if (/::selection/i.test(page.css)) return null;
  return { message: '::selection not styled. Should be on-palette.' };
}

function checkMot01(page) {
  if (!/outline\s*:\s*(?:0|none)\b/i.test(page.cssResolved) && !/outline\s*:\s*(?:0|none)\b/i.test(page.raw)) return null;
  return {
    message: "Banned: 'outline: 0' or 'outline: none' without a visible focus replacement.",
  };
}

function checkMot02(page) {
  if (/prefers-reduced-motion/i.test(page.css)) return null;
  return { message: 'Missing @media (prefers-reduced-motion: reduce) block.' };
}

function checkMot03(page) {
  if (/:focus-visible/i.test(page.css)) return null;
  return {
    message: 'Missing :focus-visible rule. Every interactive element needs a visible focus indicator.',
  };
}

function checkMot04(page) {
  var offenders = {};
  declarationValues(page.cssResolved, ANIMATED_PROP_RE).forEach(function (value) {
    value.split(',').forEach(function (part) {
      var prop = part.trim().toLowerCase();
      if (BAD_ANIM_PROPS[prop]) offenders[prop] = 1;
    });
  });
  var found = Object.keys(offenders).sort();
  if (!found.length) return null;
  return {
    message: 'Non-compositor properties in animation/transition: ' + found.join(', ') +
      '. Use transform/opacity only.',
  };
}

function checkCont01(page) {
  var lower = page.text.toLowerCase();
  var found = [];
  PLACEHOLDER_PHRASES.forEach(function (phrase) {
    if (lower.indexOf(phrase) >= 0) found.push(phrase);
  });
  PLACEHOLDER_TOKENS.forEach(function (token) {
    if (new RegExp('\\b' + token + '\\b').test(page.text)) found.push(token);
  });
  if (!found.length) return null;
  return {
    message: 'Placeholder text found: ' + found.join(', ') + '. No lorem/TBD/placeholder allowed.',
  };
}

function checkCont02(page) {
  var lower = page.text.toLowerCase();
  var found = VIBE_WORDS.filter(function (word) { return lower.indexOf(word) >= 0; });
  if (found.length < 2) return null;
  return {
    message: 'Vibe adjectives: ' + found.join(', ') + '. Let content carry the weight.',
  };
}

function checkCont03(page) {
  var seen = {};
  var matches = page.text.match(EMOJI_RE) || [];
  matches.forEach(function (glyph) { seen[glyph] = 1; });
  var count = Object.keys(seen).length;
  if (count <= 3) return null;
  return { message: count + ' distinct emoji found. Not a content-derived design move.' };
}

function checkCont04(page) {
  if (!BR_SPACING_RE.test(page.raw)) return null;
  return { message: 'Found <br><br> spacing. Use margin/padding on containers.' };
}

function checkStr01(page) {
  var match = page.raw.match(new RegExp(CDN_RE.source, 'gi'));
  if (!match) return null;
  return {
    message: 'CDN/hotlinked resource(s) found: ' + match.slice(0, 3).join(', ') +
      '. Output must open offline — no external fetches.',
  };
}

function checkStr02(page, options) {
  if (options.allowFetch) return null;
  if (!WEBFONT_RE.test(page.raw)) return null;
  return {
    message: 'External font fetch (Google Fonts / @import) — must be offline single-file. ' +
      'Use system font stacks, or pass --allow-fetch when web fonts are intentional.',
  };
}

function checkStr03(page) {
  var hero = page.figures.some(function (figure) { return figure.largest >= FIGURE_HERO_PX; });
  if (hero) return null;
  var canvas = page.figures.some(function (figure) { return figure.tag === 'canvas'; });
  if (canvas) return null;
  if (page.shapes >= FIGURE_MIN_SHAPES) return null;
  return {
    message: 'No figure system detected — needs a >=' + FIGURE_HERO_PX + 'px svg/canvas, ' +
      'a canvas scene, or at least ' + FIGURE_MIN_SHAPES + ' drawn shapes (found ' +
      page.shapes + '). Decoration in a data URI does not count.',
  };
}

function checkPerf01(page) {
  var imgRe = /<img\s([^>]+?)\/?>/gi;
  var match;
  while ((match = imgRe.exec(page.raw)) !== null) {
    var attrs = match[1];
    if (/\b(?:width|height)\s*=/i.test(attrs)) continue;
    if (/aspect-ratio/i.test(attrs)) continue;
    return {
      message: '<img> missing width/height or aspect-ratio — may cause CLS. Found in: <img ' +
        attrs.slice(0, 60) + '...>',
    };
  }
  return null;
}

function checkPerf02(page) {
  if (/content-visibility\s*:\s*auto/i.test(page.cssResolved)) return null;
  if (page.text.length <= 1000) return null;
  return {
    message: 'Long page — consider content-visibility: auto on off-screen sections for render skipping.',
  };
}

var CHECKS = {
  'TYPO-01': checkTypo01,
  'TYPO-02': checkTypo02,
  'TYPO-03': checkTypo03,
  'PAL-01': checkPal01,
  'PAL-02': checkPal02,
  'PAL-03': checkPal03,
  'MOT-01': checkMot01,
  'MOT-02': checkMot02,
  'MOT-03': checkMot03,
  'MOT-04': checkMot04,
  'CONT-01': checkCont01,
  'CONT-02': checkCont02,
  'CONT-03': checkCont03,
  'CONT-04': checkCont04,
  'STR-01': checkStr01,
  'STR-02': checkStr02,
  'STR-03': checkStr03,
  'PERF-01': checkPerf01,
  'PERF-02': checkPerf02,
};

// ── Runner ────────────────────────────────────────────────────────────────

function auditHtml(html, options) {
  options = options || {};
  var page = parsePage(html, options.path);
  var findings = [];
  var checks = [];

  RULES.forEach(function (rule) {
    var result = CHECKS[rule.code](page, options);
    if (!result) {
      checks.push({ code: rule.code, category: rule.category, status: 'pass' });
      return;
    }
    var severity = result.severity || rule.severity;
    checks.push({ code: rule.code, category: rule.category, status: severity });
    findings.push({
      code: rule.code,
      category: rule.category,
      severity: severity,
      message: result.message,
    });
  });

  findings.sort(function (a, b) {
    return RULE_ORDER.indexOf(a.code) - RULE_ORDER.indexOf(b.code);
  });

  var failures = findings.filter(function (f) { return f.severity === 'failure'; }).length;
  var warnings = findings.filter(function (f) { return f.severity === 'warning'; }).length;

  return {
    file: page.path,
    rules: RULES.length,
    passed: RULES.length - findings.length,
    warnings: warnings,
    failures: failures,
    verdict: failures ? 'FAIL' : warnings ? 'WARNINGS' : 'CLEAN',
    findings: findings,
    checks: checks,
  };
}

function exitCodeFor(report) {
  if (report.failures > 0) return 2;
  if (report.warnings > 0) return 1;
  return 0;
}

function formatReport(report, options) {
  options = options || {};
  var useColor = options.color !== false;
  function paint(code, value) { return useColor ? '\u001b[' + code + 'm' + value + '\u001b[0m' : String(value); }
  var lines = [];
  lines.push('');
  lines.push(paint(1, 'DESIGN HEALTH — ' + report.file));
  lines.push('  ' + paint(92, report.passed + ' passed') + '  ' +
    paint(93, report.warnings + ' warnings') + '  ' +
    paint(91, report.failures + ' failures') + '  of ' + report.rules + ' rules');

  if (options.verbose) {
    var categories = [];
    report.checks.forEach(function (check) {
      if (categories.indexOf(check.category) < 0) categories.push(check.category);
    });
    categories.forEach(function (category) {
      lines.push('');
      lines.push('  -- ' + category + ' --');
      report.checks.filter(function (check) { return check.category === category; })
        .forEach(function (check) {
          var finding = report.findings.filter(function (f) { return f.code === check.code; })[0];
          var mark = check.status === 'pass' ? paint(92, 'ok  ') : check.status === 'warning' ? paint(93, 'warn') : paint(91, 'fail');
          lines.push('    ' + mark + ' ' + check.code + (finding ? ': ' + finding.message : ''));
        });
    });
  }

  var warns = report.findings.filter(function (f) { return f.severity === 'warning'; });
  var fails = report.findings.filter(function (f) { return f.severity === 'failure'; });

  if (!options.verbose && warns.length) {
    lines.push('');
    lines.push(paint(93, 'Warnings:'));
    warns.forEach(function (f) { lines.push('  ~ ' + paint(93, f.code) + ': ' + f.message); });
  }
  if (!options.verbose && fails.length) {
    lines.push('');
    lines.push(paint(91, 'Failures (must fix before shipping):'));
    fails.forEach(function (f) { lines.push('  x ' + paint(91, f.code) + ': ' + f.message); });
  }

  lines.push('');
  if (!report.failures) {
    lines.push(paint(1, 'Verdict: ') + paint(92, report.verdict) + ' — ' +
      (report.warnings ? report.warnings + ' warning(s), no blockers' : 'all ' + report.rules + ' rules passed'));
  } else {
    lines.push(paint(1, 'Verdict: ') + paint(91, 'FAIL') + ' — ' + report.failures +
      ' blocker(s). Fix before reporting shipped.');
  }
  lines.push('');
  return lines.join('\n');
}

var auditApi = {
  RULES: RULES,
  auditHtml: auditHtml,
  formatReport: formatReport,
  exitCodeFor: exitCodeFor,
  parsePage: parsePage,
  resolveVars: resolveVars,
};

if (typeof module !== 'undefined' && module.exports) module.exports = auditApi;
if (typeof window !== 'undefined') window.ReimagineAudit = auditApi;
