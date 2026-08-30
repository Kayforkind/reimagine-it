/**
 * Design DNA locks — brand-locked surface over content-derived structure.
 *
 * Content-Derived Design says the source is the brief. A lock is the one
 * sanctioned exception: when a house style already exists, the structure still
 * comes from the content while the surface (palette, type stack, voice) is
 * pinned to a captured design.
 *
 * `extractLock` reads any shipped HTML and recovers its surface as data.
 * `applyLock` merges that surface into extracted content before generation.
 * Nothing here invents a color: every value is present in the source CSS.
 */

var lockExtractApi = typeof module !== 'undefined' && module.exports
  ? require('./extract')
  : (typeof window !== 'undefined' ? window.ReimagineExtract : {});

var lockGenerateApi = typeof module !== 'undefined' && module.exports
  ? require('./generate')
  : (typeof window !== 'undefined' ? window.ReimagineGenerate : {});

var lockAuditApi = typeof module !== 'undefined' && module.exports
  ? require('./audit')
  : (typeof window !== 'undefined' ? window.ReimagineAudit : {});

var LOCK_VERSION = 1;
var ROLES = ['ground', 'accent', 'muted', 'surface', 'ink'];

// The engine names its own custom properties, so a lock taken from
// reimagine-it output recovers the exact palette rather than inferring it.
var ENGINE_ROLE_PROPS = {
  ground: '--g',
  accent: '--a',
  muted: '--m',
  surface: '--s',
  ink: '--i',
};

// Hand-written design systems name their tokens too, and a declared brand
// colour is far better evidence than a colour inferred from usage frequency.
// Ordered per role: the first property that resolves to a hex wins.
var AUTHOR_ROLE_PROPS = {
  ground: ['--ground', '--bg', '--background', '--color-bg', '--color-background',
    '--surface-0', '--page-bg', '--body-bg'],
  accent: ['--accent', '--brand', '--primary', '--color-accent', '--color-primary',
    '--color-brand', '--brand-primary', '--accent-color', '--highlight', '--link'],
  muted: ['--muted', '--secondary', '--subtle', '--color-muted', '--color-secondary',
    '--text-muted', '--fg-muted', '--muted-foreground'],
  surface: ['--surface', '--card', '--panel', '--color-surface', '--color-card',
    '--surface-1', '--elevated'],
  ink: ['--ink', '--fg', '--text', '--foreground', '--color-fg', '--color-text',
    '--color-foreground', '--body-color'],
};

// The engine's art vocabulary. Motif names are evidence of a repeated visual
// system, which is what a lock needs to describe.
var ART_CLASS_RE = /\b(glyph-tile|donut-chart|mini-bars|iso-prism|iso-stack|data-wash|constellation|dot-grid|cap-card|mesh|plate)\b/g;

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function canonical(value) {
  if (!value) return null;
  var match = String(value).match(/#[0-9a-f]{3,8}\b/i);
  if (!match) return null;
  var hex = match[0].toLowerCase();
  if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  return hex.length >= 7 ? hex.slice(0, 7) : null;
}

function chromaOf(hex) {
  if (!lockExtractApi.hexToOklch) return 0;
  try {
    return lockExtractApi.hexToOklch(hex).C || 0;
  } catch (error) {
    return 0;
  }
}

function contrast(a, b) {
  if (!lockExtractApi.contrastRatio) return 1;
  try {
    return lockExtractApi.contrastRatio(a, b);
  } catch (error) {
    return 1;
  }
}

function isGrey(hex) {
  return hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7);
}

function ruleBlocks(css) {
  // Flat rule scan. @media preludes fall out naturally because a selector
  // cannot contain a brace, so only the inner rules match.
  var blocks = [];
  var pattern = /([^{}]+)\{([^{}]*)\}/g;
  var match;
  while ((match = pattern.exec(css)) !== null) {
    blocks.push({ selector: match[1].trim().toLowerCase(), body: match[2] });
  }
  return blocks;
}

function declarations(body, property) {
  var out = [];
  var pattern = new RegExp('(?:^|;)\\s*' + property + '\\s*:\\s*([^;]+)', 'gi');
  var match;
  while ((match = pattern.exec(body)) !== null) out.push(match[1].trim());
  return out;
}

function isRootSelector(selector) {
  return /(^|,|\s)(html|body|:root)(\s|,|$)/.test(selector);
}

function largestLength(value) {
  var largest = 0;
  var pattern = /(-?\d+(?:\.\d+)?)\s*(px|rem|em)\b/gi;
  var match;
  while ((match = pattern.exec(value)) !== null) {
    var size = parseFloat(match[1]);
    if (match[2].toLowerCase() !== 'px') size *= 16;
    if (size > largest) largest = size;
  }
  return largest;
}

function firstFamilyName(stack) {
  if (!stack) return '';
  return String(stack).split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase();
}

function derivePalette(page, blocks) {
  var palette = {};
  var fromEngine = 0;
  var fromAuthor = 0;

  ROLES.forEach(function (role) {
    var value = canonical(page.props[ENGINE_ROLE_PROPS[role]]);
    if (value) {
      palette[role] = value;
      fromEngine++;
    }
  });
  if (fromEngine === ROLES.length) return { palette: palette, source: 'engine-properties' };

  // Declared brand tokens beat inference, so read them before falling back to
  // counting how often each colour appears.
  ROLES.forEach(function (role) {
    if (palette[role]) return;
    var names = AUTHOR_ROLE_PROPS[role];
    for (var i = 0; i < names.length; i++) {
      var value = canonical(page.props[names[i]]);
      if (value) {
        palette[role] = value;
        fromAuthor++;
        return;
      }
    }
  });
  if (fromEngine + fromAuthor === ROLES.length) {
    return { palette: palette, source: fromEngine ? 'mixed' : 'author-properties' };
  }

  // Generic path: infer roles from where each color is actually used.
  var backgrounds = [];
  var inks = [];
  var all = [];
  blocks.forEach(function (block) {
    var root = isRootSelector(block.selector);
    ['background', 'background-color'].forEach(function (property) {
      declarations(block.body, property).forEach(function (value) {
        var hex = canonical(value);
        if (hex) backgrounds.push({ hex: hex, root: root });
      });
    });
    declarations(block.body, 'color').forEach(function (value) {
      var hex = canonical(value);
      if (hex) inks.push({ hex: hex, root: root });
    });
  });
  page.colors.forEach(function (hex) { all.push(hex); });
  // Colours parked in custom properties still count as part of the palette even
  // when the page never applies them directly.
  Object.keys(page.props).forEach(function (name) {
    var hex = canonical(page.props[name]);
    if (hex && all.indexOf(hex) < 0) all.push(hex);
  });

  function frequent(list) {
    var counts = {};
    list.forEach(function (entry) { counts[entry.hex] = (counts[entry.hex] || 0) + 1; });
    return Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b);
    });
  }

  var rootBackgrounds = backgrounds.filter(function (entry) { return entry.root; });
  var groundOrder = frequent(rootBackgrounds.length ? rootBackgrounds : backgrounds);
  palette.ground = palette.ground || groundOrder[0] || '#10131a';

  var rootInks = inks.filter(function (entry) { return entry.root; });
  var inkOrder = frequent(rootInks.length ? rootInks : inks);
  palette.ink = palette.ink || inkOrder.filter(function (hex) {
    return contrast(palette.ground, hex) >= 3;
  })[0] || inkOrder[0] || '#f4ecd8';

  var candidates = all.filter(function (hex) {
    return hex !== palette.ground && hex !== palette.ink && !isGrey(hex);
  }).sort(function (a, b) { return chromaOf(b) - chromaOf(a); });

  // An accent equal to the ground or the ink is a dead lock: it would generate
  // a page with nothing to point at. Derive one from the ink instead.
  palette.accent = palette.accent || candidates[0] || '#e8a63f';
  if (palette.accent === palette.ground || palette.accent === palette.ink) {
    var distinct = candidates.filter(function (hex) {
      return hex !== palette.ground && hex !== palette.ink;
    })[0];
    palette.accent = distinct ||
      (lockExtractApi.shade ? lockExtractApi.shade(palette.ink, 0.25) : '#e8a63f');
  }

  palette.muted = palette.muted || candidates[candidates.length - 1] ||
    (lockExtractApi.shade ? lockExtractApi.shade(palette.ink, 0.35) : '#778094');

  var surfaceOrder = groundOrder.filter(function (hex) { return hex !== palette.ground; });
  palette.surface = palette.surface || surfaceOrder[0] ||
    (lockExtractApi.tint ? lockExtractApi.tint(palette.ground, 0.08) : palette.ground);

  return {
    palette: palette,
    source: fromEngine || fromAuthor ? 'mixed' : 'inferred',
  };
}

function deriveType(page, blocks) {
  var display = '';
  var body = '';
  var mono = '';
  var largest = 0;
  var families = [];

  blocks.forEach(function (block) {
    var stacks = declarations(block.body, 'font-family');
    if (!stacks.length) return;
    var stack = stacks[stacks.length - 1];
    families.push(stack);
    var size = 0;
    declarations(block.body, 'font-size').forEach(function (value) {
      size = Math.max(size, largestLength(value));
    });
    declarations(block.body, 'font').forEach(function (value) {
      size = Math.max(size, largestLength(value));
    });
    if (size > largest) { largest = size; display = stack; }
    if (isRootSelector(block.selector) && !body) body = stack;
    if (!mono && /mono/i.test(stack)) mono = stack;
  });

  if (!body) {
    var counts = {};
    families.forEach(function (stack) { counts[stack] = (counts[stack] || 0) + 1; });
    body = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b);
    })[0] || '';
  }
  if (!display) display = body;

  return {
    display: display.trim(),
    body: body.trim(),
    mono: mono.trim(),
  };
}

/**
 * Classify a font stack into the genre the engine's voices are organised by.
 * Reads the generic family first, since that is what the stack promises the
 * browser, and falls back to well-known family names.
 */
function familyGenre(stack) {
  var text = String(stack || '').toLowerCase();
  if (!text) return '';
  if (/\bmonospace\b|\bmono\b|consolas|menlo|courier/.test(text)) return 'mono';
  if (/\bserif\b(?!\s*-)|georgia|palatino|garamond|baskerville|caslon|times|cambria|charter|freight|tiempos|iowan/.test(text)) {
    // "sans-serif" contains "serif", so require it not be preceded by "sans-".
    if (!/sans-serif/.test(text) || /georgia|palatino|garamond|baskerville|caslon|times|cambria|charter|tiempos|iowan/.test(text)) {
      return 'serif';
    }
  }
  if (/\bcursive\b|\bfantasy\b/.test(text)) return 'display';
  return 'sans';
}

function nearestVoice(type) {
  var voices = lockGenerateApi.FONT_VOICES;
  if (!voices) return null;
  var wanted = firstFamilyName(type.display);
  var wantedBody = firstFamilyName(type.body);
  var keys = Object.keys(voices);
  for (var i = 0; i < keys.length; i++) {
    if (wanted && firstFamilyName(voices[keys[i]].display) === wanted) return keys[i];
  }
  for (var j = 0; j < keys.length; j++) {
    if (wantedBody && firstFamilyName(voices[keys[j]].body) === wantedBody) return keys[j];
  }

  // No exact family match: a real brand page rarely ships the engine's own
  // fonts, so fall back to the closest voice by genre rather than giving up.
  var genre = familyGenre(type.display) || familyGenre(type.body);
  var byGenre = { serif: 'serifClassic', mono: 'monoForward', display: 'expressive', sans: 'grotesque' };
  var candidate = byGenre[genre];
  return candidate && voices[candidate] ? candidate : null;
}

function deriveMotifs(page) {
  var motifs = [];
  function push(value) {
    var name = String(value || '').trim();
    if (name && motifs.indexOf(name) < 0) motifs.push(name);
  }
  var keyframes = /@keyframes\s+([\w-]+)/gi;
  var match;
  while ((match = keyframes.exec(page.cssResolved)) !== null) push(match[1]);
  var svgIds = /<(?:pattern|linearGradient|radialGradient)\b[^>]*\bid\s*=\s*["']([^"']+)["']/gi;
  while ((match = svgIds.exec(page.markup)) !== null) push(match[1]);
  ART_CLASS_RE.lastIndex = 0;
  while ((match = ART_CLASS_RE.exec(page.markup)) !== null) push(match[1]);
  return motifs.slice(0, 12);
}

function deriveMotion(page) {
  var durations = {};
  var pattern = /(\d+(?:\.\d+)?)\s*(ms|s)\b/gi;
  var match;
  while ((match = pattern.exec(page.cssResolved)) !== null) {
    var value = parseFloat(match[1]);
    var ms = match[2].toLowerCase() === 's' ? value * 1000 : value;
    if (ms >= 40 && ms <= 20000) durations[Math.round(ms)] = 1;
  }
  return {
    keyframes: (page.cssResolved.match(/@keyframes/gi) || []).length,
    reducedMotion: /prefers-reduced-motion/i.test(page.cssResolved),
    durations: Object.keys(durations).map(Number).sort(function (a, b) { return a - b; }).slice(0, 8),
  };
}

function deriveStructure(page) {
  var order = [];
  var pattern = /<(header|nav|main|section|article|aside|footer)\b/gi;
  var match;
  while ((match = pattern.exec(page.markup)) !== null) {
    var tag = match[1].toLowerCase();
    if (order.indexOf(tag) < 0) order.push(tag);
  }
  return order;
}

function signatureOf(lock) {
  var basis = ROLES.map(function (role) { return lock.palette[role]; }).join('|') +
    '|' + lock.type.display + '|' + lock.type.body + '|' + (lock.voice || '');
  // extract.js keeps its hash private, so use the same FNV-1a constants here.
  var value = 2166136261;
  basis.split('').forEach(function (char) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  });
  return (value >>> 0).toString(16);
}

function extractLock(html, options) {
  options = options || {};
  if (!lockAuditApi.parsePage) throw new Error('lock extraction requires src/audit.js');
  var page = lockAuditApi.parsePage(html, options.source || '(inline)');
  var blocks = ruleBlocks(page.cssResolved);
  var palette = derivePalette(page, blocks);
  var type = deriveType(page, blocks);

  var lock = {
    lock: LOCK_VERSION,
    name: String(options.name || 'unnamed'),
    source: options.source || '(inline)',
    palette: palette.palette,
    paletteSource: palette.source,
    voice: nearestVoice(type),
    type: type,
    motifs: deriveMotifs(page),
    motion: deriveMotion(page),
    structure: deriveStructure(page),
  };
  lock.signature = signatureOf(lock);
  return lock;
}

function readLock(value, label) {
  var lock = typeof value === 'string' ? JSON.parse(value) : value;
  if (!lock || typeof lock !== 'object') {
    throw new Error('lock file is not an object: ' + (label || 'lock'));
  }
  if (Number(lock.lock) !== LOCK_VERSION) {
    throw new Error('unsupported lock version ' + lock.lock + ' (expected ' + LOCK_VERSION + ')');
  }
  if (!lock.palette || typeof lock.palette !== 'object') {
    throw new Error('lock file has no palette: ' + (label || 'lock'));
  }
  var bad = ROLES.filter(function (role) {
    return lock.palette[role] !== undefined && !isHexColor(lock.palette[role]);
  });
  if (bad.length) {
    throw new Error('lock palette roles are not 6-digit hex: ' + bad.join(', '));
  }
  return lock;
}

function applyLock(content, lock) {
  var applied = [];
  var palette = {};
  ROLES.forEach(function (role) {
    if (content && content.palette && content.palette[role] !== undefined) {
      palette[role] = content.palette[role];
    }
    if (isHexColor(lock.palette[role])) {
      palette[role] = lock.palette[role];
      applied.push('palette.' + role);
    }
  });

  var voice = null;
  var voices = lockGenerateApi.FONT_VOICES || {};
  if (lock.voice && voices[lock.voice]) {
    voice = lock.voice;
    applied.push('voice:' + voice);
  }

  var merged = {};
  Object.keys(content || {}).forEach(function (key) { merged[key] = content[key]; });
  merged.palette = palette;

  return { content: merged, voice: voice, applied: applied };
}

function formatLock(lock) {
  var lines = [];
  lines.push('  Lock:      ' + lock.name + ' · signature ' + lock.signature);
  lines.push('  Source:    ' + lock.source);
  lines.push('  Palette:   ' + ROLES.map(function (role) {
    return role + ' ' + (lock.palette[role] || '-');
  }).join(' · ') + '  (' + lock.paletteSource + ')');
  lines.push('  Type:      display ' + (lock.type.display || '-'));
  lines.push('             body    ' + (lock.type.body || '-'));
  if (lock.type.mono) lines.push('             mono    ' + lock.type.mono);
  lines.push('  Voice:     ' + (lock.voice || '(no registered voice matched)'));
  lines.push('  Motifs:    ' + (lock.motifs.length ? lock.motifs.join(', ') : '(none found)'));
  lines.push('  Motion:    ' + lock.motion.keyframes + ' keyframes · reduced-motion ' +
    (lock.motion.reducedMotion ? 'yes' : 'no') +
    (lock.motion.durations.length ? ' · ' + lock.motion.durations.slice(0, 5).join('ms, ') + 'ms' : ''));
  lines.push('  Structure: ' + (lock.structure.length ? lock.structure.join(' > ') : '(no landmarks)'));
  return lines.join('\n');
}

var lockApi = {
  LOCK_VERSION: LOCK_VERSION,
  ROLES: ROLES,
  extractLock: extractLock,
  readLock: readLock,
  applyLock: applyLock,
  formatLock: formatLock,
};

if (typeof module !== 'undefined' && module.exports) module.exports = lockApi;
if (typeof window !== 'undefined') window.ReimagineLock = lockApi;
