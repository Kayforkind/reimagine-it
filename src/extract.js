/**
 * Content extraction engine — Content-Derived Design.
 *
 * Reads HTML, extracts content signals (nouns, dates, colors, numbers,
 * headings, paragraphs), and derives a design-ready palette with
 * luminance ordering and WCAG-safe contrast pairs.
 *
 * The palette is returned as a structured object:
 *   { ground, ink, accent, muted, surface }
 * where every pair meets WCAG AA contrast (4.5:1 for text, 3:1 for UI).
 */

// ── Color knowledge ────────────────────────────────────────────────

const COLOR_NAMES = {
  red: '#c23a2a', crimson: '#a0141e', scarlet: '#b22234', maroon: '#6b1f1a',
  blue: '#2563eb', navy: '#1a2138', cobalt: '#1c3d6e', indigo: '#312e81', azure: '#0e7ec0',
  green: '#16a34a', forest: '#166534', olive: '#4d7c0f', sage: '#4a7c59', mint: '#6ee7b7',
  teal: '#0d9488', cyan: '#0891b2', turquoise: '#0fb5c4', aquamarine: '#7fffd4',
  yellow: '#eab308', gold: '#e8a63f', amber: '#d97706', honey: '#e8b647',
  orange: '#ea580c', coral: '#f43f5e', rust: '#b45309', copper: '#b87333',
  purple: '#7c3aed', violet: '#8b5cf6', plum: '#6b2c6b', magenta: '#c026d3', lavender: '#a78bfa',
  pink: '#ec4899', rose: '#e11d48', blush: '#fda4af', salmon: '#fa8072',
  brown: '#78350f', chocolate: '#3d2817', coffee: '#4a2c2a', mocha: '#7b5e3c', tan: '#d4a373',
  cream: '#f4ecd8', ivory: '#fffef0', beige: '#e8dcc4', parchment: '#f1e9d2', linen: '#faf0e6',
  white: '#ffffff', snow: '#fafafa',
  black: '#0a0a0a', charcoal: '#1a1a1a', obsidian: '#0d0d0d', onyx: '#161616',
  gray: '#6b7280', grey: '#6b7280', slate: '#334155', stone: '#78716c', ash: '#b2b2b2',
  silver: '#c0c0c0', platinum: '#e5e4e2',
  sand: '#e2c9a0', clay: '#c67a3d', earth: '#6b5d4f', wood: '#96633a',
  navy2: '#0a1626', sky: '#38bdf8', ocean: '#0e7490', sea: '#1e5f74',
};

// Content-profile palette presets — each genre gets a distinctive look.
const PROFILE_PALETTES = {
  saas:       { ground: '#0a1626', accent: '#6ee7b7', muted: '#3b82f6', surface: '#111f38', ink: '#e2e8f0' },
  tech:       { ground: '#0d1117', accent: '#a78bfa', muted: '#38bdf8', surface: '#161b27', ink: '#e6edf3' },
  essay:      { ground: '#f8f5ef', accent: '#a0141e', muted: '#4a3c2a', surface: '#efe9df', ink: '#1a1612' },
  literary:   { ground: '#f1ece1', accent: '#6b1f1a', muted: '#5c4a2a', surface: '#e8e0d0', ink: '#1f1a14' },
  food:       { ground: '#faf6ef', accent: '#b45309', muted: '#4d7c0f', surface: '#f0e8d8', ink: '#1a1612' },
  restaurant: { ground: '#1a1612', accent: '#d97706', muted: '#b45309', surface: '#241e16', ink: '#f4ecd8' },
  nature:     { ground: '#f3f6f0', accent: '#166534', muted: '#4d7c0f', surface: '#e6ede0', ink: '#1a2118' },
  outdoor:    { ground: '#0d1f14', accent: '#4ade80', muted: '#16a34a', surface: '#142819', ink: '#e8f0e4' },
  ocean:      { ground: '#062838', accent: '#38bdf8', muted: '#0891b2', surface: '#0d3a52', ink: '#e0f2fe' },
  night:      { ground: '#0a0a14', accent: '#8b5cf6', muted: '#6366f1', surface: '#12121e', ink: '#e0e0f0' },
  editorial:  { ground: '#fffbf5', accent: '#1a1612', muted: '#b45309', surface: '#f5f0e6', ink: '#1a1612' },
  minimal:    { ground: '#fafafa', accent: '#1a1a1a', muted: '#6b7280', surface: '#f0f0f0', ink: '#1a1a1a' },
  default:    { ground: '#1a1a2e', accent: '#e8a63f', muted: '#6366f1', surface: '#24243e', ink: '#f4ecd8' },
};

// ── Color science helpers ──────────────────────────────────────────

function hexToRgb(hex) {
  var c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(function(v) {
    v = Math.max(0, Math.min(255, Math.round(v)));
    return v.toString(16).padStart(2, '0');
  }).join('');
}

function relativeLuminance(rgb) {
  function channel(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(hex1, hex2) {
  var l1 = relativeLuminance(hexToRgb(hex1));
  var l2 = relativeLuminance(hexToRgb(hex2));
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isLight(hex) { return relativeLuminance(hexToRgb(hex)) > 0.42; }

// Tint (mix with white) or shade (mix with black)
function tint(hex, amount) {
  var c = hexToRgb(hex);
  return rgbToHex(c.r + (255 - c.r) * amount, c.g + (255 - c.g) * amount, c.b + (255 - c.b) * amount);
}
function shade(hex, amount) {
  var c = hexToRgb(hex);
  return rgbToHex(c.r * (1 - amount), c.g * (1 - amount), c.b * (1 - amount));
}

// Ensure accent has sufficient contrast against ground for text
function ensureContrast(ground, accent, target) {
  target = target || 4.5;
  var ratio = contrastRatio(ground, accent);
  if (ratio >= target) return accent;
  // Try darkening or lightening accent
  var groundIsLight = isLight(ground);
  var adjusted = accent;
  for (var i = 0; i < 20; i++) {
    adjusted = groundIsLight ? shade(adjusted, 0.08) : tint(adjusted, 0.08);
    ratio = contrastRatio(ground, adjusted);
    if (ratio >= target) break;
  }
  return adjusted;
}

// ── Main extraction function ────────────────────────────────────────

function extractContent(html, filePath) {
  // Clean text (strip scripts/styles/tags)
  var text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  var lower = text.toLowerCase();

  // ── Title: <title> → <h1> → first heading → filename → Untitled ──
  var titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  var h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  var h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  var titleRaw = titleMatch ? titleMatch[1].trim() : h1Match ? h1Match[1].trim() : h2Match ? h2Match[2] ? h2Match[2].trim() : h2Match[1].trim() : null;
  var title = titleRaw || (filePath ? require('path').basename(filePath, '.html').replace(/^before$/, 'Untitled') : 'Untitled');

  // ── Headings (for editorial structure) ──
  var headings = [];
  var hRe = /<h([1-3])[^>]*>([^<]+)<\/h\1>/gi;
  var hm;
  while ((hm = hRe.exec(html)) !== null) {
    var ht = hm[2].trim();
    if (ht.length > 2 && headings.indexOf(ht) === -1) headings.push(ht);
  }

  // ── Paragraphs ──
  var paragraphs = [];
  var pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  var pm;
  while ((pm = pRe.exec(html)) !== null) {
    var p = pm[1].replace(/<[^>]+>/g, '').trim();
    if (p.length > 20) paragraphs.push(p);
  }

  // ── List items (features, menu items, etc.) ──
  var items = [];
  var liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  var lim;
  while ((lim = liRe.exec(html)) !== null) {
    var li = lim[1].replace(/<[^>]+>/g, '').trim();
    if (li.length > 2 && items.indexOf(li) === -1) items.push(li);
  }

  // ── Emails ──
  var emails = [];
  var emRe = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  var em;
  while ((em = emRe.exec(text)) !== null) { if (emails.indexOf(em[0]) === -1) emails.push(em[0]); }

  // ── Dates (4-digit years, month+date, slash dates) ──
  var dates = [];
  var dateRe = /\b(?:18|19|20)\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:18|19|20)\d{2}\b/gi;
  var dm2;
  while ((dm2 = dateRe.exec(text)) !== null) { if (dates.indexOf(dm2[0]) === -1) dates.push(dm2[0]); }

  // ── Numbers (with units) ──
  var numbers = [];
  var numRe = /\b\d+(?:\.\d+)?\s*(?:ms|s|min|hr|hours?|days?|weeks?|months?|years?|seats?|users?|people|persons?|dollars?|usd|eur|gbp|gb|mb|kb|px|em|rem|rpm|acres|miles|km|metres|meters|feet|ft|pounds?|kg|g|oz|%|x|k|m|b)\b/gi;
  var nm;
  while ((nm = numRe.exec(text)) !== null) {
    if (numbers.indexOf(nm[0]) === -1) numbers.push(nm[0]);
  }
  // Also grab standalone significant numbers
  var sigNumRe = /\b\d{2,}(?:\.\d+)?\b/g;
  var snm;
  while ((snm = sigNumRe.exec(text)) !== null) {
    var n = snm[0];
    if (numbers.indexOf(n) === -1 && !dates.some(function(d) { return d.indexOf(n) >= 0; })) numbers.push(n);
  }

  // ── Proper nouns ──
  var properNouns = [];
  var stopWords = new Set(['The','This','That','And','But','For','From','With','When','Where','What','How','Who','Which','There','Their','These','Those','About','After','Before','During','While','Since','Until','Above','Below','Under','Over','Into','Upon','Within','Without','They','Them','Their','Are','Was','Were','Been','Have','Has','Had','Will','Would','Could','Should','May','Might','Can','Did','Does','Not','Yes','Get','Set','Put','Use','See','Try','Open','More','Most','Some','Any','All','New','Old','One','Two','Three','Here','Your','Our','Its']);
  var words = text.split(/\s+/);
  for (var i = 0; i < words.length; i++) {
    var w = words[i].replace(/[^a-zA-Z]/g, '');
    if (w.length > 2 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase() && !stopWords.has(w)) {
      if (properNouns.indexOf(w) === -1) properNouns.push(w);
    }
  }

  // ── Color words in text ──
  var foundColors = [];
  Object.keys(COLOR_NAMES).forEach(function(name) {
    if (lower.indexOf(name) !== -1) {
      var hex = COLOR_NAMES[name];
      if (foundColors.indexOf(hex) === -1) foundColors.push(hex);
    }
  });

  // ── Hex colors from source HTML ──
  var hexColors = html.match(/#[0-9a-fA-F]{6}\b/g) || [];
  var uniqueHex = [];
  hexColors.forEach(function(h) {
    var lh = h.toLowerCase();
    if (uniqueHex.indexOf(lh) === -1) uniqueHex.push(lh);
  });

  // ── Derive palette ──
  var palette = derivePalette(lower, uniqueHex, foundColors);

  // ── Nouns (frequency-sorted) ──
  var freq = {};
  for (var j = 0; j < words.length; j++) {
    var cw = words[j].replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (cw.length > 3 && !STOP_NOUNS.has(cw)) {
      freq[cw] = (freq[cw] || 0) + 1;
    }
  }
  var topNouns = Object.keys(freq)
    .sort(function(a, b) { return freq[b] - freq[a]; })
    .slice(0, 8)
    .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); });

  // ── Anchors: 3-5 concrete things the design serves ──
  // Prefer proper nouns + top content nouns, deduplicated
  var anchors = [];
  properNouns.slice(0, 5).forEach(function(n) { if (anchors.indexOf(n) === -1 && anchors.length < 5) anchors.push(n); });
  topNouns.forEach(function(n) { if (anchors.indexOf(n) === -1 && anchors.length < 5) anchors.push(n); });
  if (anchors.length < 3) anchors = topNouns.slice(0, 5);
  if (anchors.length === 0) anchors = ['Content', 'Design', 'Source'];

  return {
    title: title,
    headings: headings.slice(0, 10),
    paragraphs: paragraphs.slice(0, 6),
    items: items.slice(0, 12),
    emails: emails.slice(0, 3),
    dates: dates.slice(0, 8),
    numbers: numbers.slice(0, 8),
    properNouns: properNouns.slice(0, 8),
    nouns: topNouns,
    anchors: anchors.slice(0, 5),
    palette: palette,
    foundColors: foundColors,
    sourceHex: uniqueHex.slice(0, 8),
  };
}

var STOP_NOUNS = new Set([
  'this','that','with','from','have','been','were','they','their','about','which','there','would','could',
  'should','other','some','only','also','more','into','over','after','before','between','through','during',
  'above','below','under','your','our','their','what','when','where','while','since','until','upon','within',
  'without','these','those','them','then','than','that','here','will','just','like','make','made','take','taken',
  'give','given','come','came','went','goes','gone','said','says','say','see','seen','saw','get','got','put',
  'set','let','may','might','must','shall','need','used','uses','using','want','wants','know','knows','known',
  'think','thinks','thought','feel','feels','felt','look','looks','looked','seem','seems','seemed','find','found',
  'work','works','worked','call','called','each','many','much','very','such','same','both','either','neither',
  'even','still','back','away','down','upon','once','done','well','way','own','too','yet','per','via','etc',
]);

function derivePalette(lowerText, sourceHex, foundColors) {
  // 1. Detect content profile
  var profile = 'default';
  if (/observability|traces?|infrastructure|deploy|kubernetes|pipeline|latency|uptime|metrics?|saas|api|sdk/.test(lowerText)) profile = 'saas';
  else if (/tech|software|code|programming|developer|engineer|framework|library|runtime|compiler|algorithm/.test(lowerText)) profile = 'tech';
  else if (/essay|memoir|narrative|prose|literary|chapter|story|told|wrote|author|poem|poetry|verse/.test(lowerText)) profile = 'literary';
  else if (/lighthouse|essay|journal|diary|letter|correspondence|reflection|personal/.test(lowerText)) profile = 'essay';
  else if (/menu|recipe|dish|restaurant|kitchen|chef|flavor|taste|cuisine|dining|served|saffron|smoke/.test(lowerText)) profile = 'restaurant';
  else if (/food|cook|bake|ingredient|meal|flavor|delicious|spice|herb/.test(lowerText)) profile = 'food';
  else if (/forest|tree|mountain|river|trail|hike|camp|wilderness|outdoor|nature|garden|garden/.test(lowerText)) profile = 'nature';
  else if (/ocean|sea|marine|wave|coast|beach|surf|sail|diving|reef|coral/.test(lowerText)) profile = 'ocean';
  else if (/night|dark|midnight|moon|star|shadow|void|dream|nocturnal/.test(lowerText)) profile = 'night';
  else if (/editorial|magazine|article|column|feature|issue|press|news/.test(lowerText)) profile = 'editorial';

  var base = PROFILE_PALETTES[profile];

  // 2. Override with source hex colors if 3+ present (they define the brand)
  if (sourceHex.length >= 3) {
    var ground = sourceHex[0];
    var accent = sourceHex[1];
    var muted = sourceHex[2] || base.muted;
    var surface = sourceHex[3] || (isLight(ground) ? tint(ground, 0.05) : shade(ground, 0.15));
    var ink = isLight(ground) ? '#0a0a0a' : '#f4ecd8';
    // Ensure accent has enough contrast against ground for text use
    accent = ensureContrast(ground, accent, 3.0);
    return { ground: ground, accent: accent, muted: muted, surface: surface, ink: ink };
  }

  // 3. Override with found color words if 2+ present
  if (foundColors.length >= 2) {
    var ground2 = isLight(foundColors[0]) ? foundColors[0] : shade(foundColors[0], 0.1);
    var accent2 = foundColors[1];
    var muted2 = foundColors[2] || base.muted;
    var surface2 = isLight(ground2) ? shade(ground2, 0.05) : tint(ground2, 0.08);
    var ink2 = isLight(ground2) ? '#0a0a0a' : '#f4ecd8';
    accent2 = ensureContrast(ground2, accent2, 3.0);
    return { ground: ground2, accent: accent2, muted: muted2, surface: surface2, ink: ink2 };
  }

  // 4. Use the profile preset
  return { ground: base.ground, accent: base.accent, muted: base.muted, surface: base.surface, ink: base.ink };
}

module.exports = {
  extractContent,
  hexToRgb,
  rgbToHex,
  relativeLuminance,
  contrastRatio,
  isLight,
  tint,
  shade,
  ensureContrast,
  PROFILE_PALETTES,
  COLOR_NAMES,
};
