/**
 * Content extraction engine — Content-Derived Design.
 *
 * This module deliberately has no DOM or Node-only dependency so the exact
 * extraction contract can run in the CLI, playground, and browser extension.
 * It extracts content first, then derives a readable palette from those
 * signals. It never invents source facts.
 */

var COLOR_NAMES = {
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

var PROFILE_PALETTES = {
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

var STOP_NOUNS = new Set([
  'this','that','with','from','have','been','were','they','their','about','which','there','would','could',
  'should','other','some','only','also','more','into','over','after','before','between','through','during',
  'above','below','under','your','our','what','when','where','while','since','until','upon','within',
  'without','these','those','them','then','than','here','will','just','like','make','made','take','taken',
  'give','given','come','came','went','goes','gone','said','says','say','see','seen','saw','get','got','put',
  'set','let','may','might','must','shall','need','used','uses','using','want','wants','know','knows','known',
  'think','thinks','thought','feel','feels','felt','look','looks','looked','seem','seems','seemed','find','found',
  'work','works','worked','call','called','each','many','much','very','such','same','both','either','neither',
  'even','still','back','away','down','once','done','well','way','own','too','yet','per','via','from',
]);

var STOP_PROPER = new Set([
  'The','This','That','And','But','For','From','With','When','Where','What','How','Who','Which','There',
  'Their','These','Those','About','After','Before','During','While','Since','Until','Above','Below','Under',
  'Over','Into','Upon','Within','Without','They','Them','Are','Was','Were','Been','Have','Has','Had','Will',
  'Would','Could','Should','May','Might','Can','Did','Does','Not','Yes','Get','Set','Put','Use','See','Try',
  'Open','More','Most','Some','Any','All','New','Old','One','Two','Three','Here','Your','Our','Its','Content',
  'Design','Source','Read','Run','Play','Drag','Timeline','Statistical','Poster','Data','Signal','Item',
]);

function isHex(value) {
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value);
}

function canonicalHex(value) {
  if (!isHex(value)) return null;
  var c = value.toLowerCase();
  if (c.length === 4) return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  if (c.length === 5) return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  if (c.length === 7) return c;
  if (c.length === 9) return c.slice(0, 7);
  return null;
}

function hexToRgb(hex) {
  var c = canonicalHex(hex) || '#000000';
  return {
    r: parseInt(c.slice(1, 3), 16),
    g: parseInt(c.slice(3, 5), 16),
    b: parseInt(c.slice(5, 7), 16),
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(function(value) {
    value = Math.max(0, Math.min(255, Math.round(value)));
    return value.toString(16).padStart(2, '0');
  }).join('');
}

function relativeLuminance(rgb) {
  function channel(value) {
    value /= 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(hex1, hex2) {
  var l1 = relativeLuminance(hexToRgb(hex1));
  var l2 = relativeLuminance(hexToRgb(hex2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function isLight(hex) { return relativeLuminance(hexToRgb(hex)) > 0.42; }

function tint(hex, amount) {
  var c = hexToRgb(hex);
  return rgbToHex(c.r + (255 - c.r) * amount, c.g + (255 - c.g) * amount, c.b + (255 - c.b) * amount);
}

function shade(hex, amount) {
  var c = hexToRgb(hex);
  return rgbToHex(c.r * (1 - amount), c.g * (1 - amount), c.b * (1 - amount));
}

function ensureContrast(ground, color, target) {
  target = target || 4.5;
  ground = canonicalHex(ground) || '#10131a';
  color = canonicalHex(color) || (isLight(ground) ? '#1a1612' : '#f4ecd8');
  if (contrastRatio(ground, color) >= target) return color;

  var lightGround = isLight(ground);
  var adjusted = color;
  for (var i = 0; i < 28; i++) {
    adjusted = lightGround ? shade(adjusted, 0.06) : tint(adjusted, 0.06);
    if (contrastRatio(ground, adjusted) >= target) return adjusted;
  }
  return lightGround ? '#1a1612' : '#f4ecd8';
}

function decodeEntities(value) {
  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, function(_, entity) {
    var lower = entity.toLowerCase();
    if (lower === 'amp') return '&';
    if (lower === 'lt') return '<';
    if (lower === 'gt') return '>';
    if (lower === 'quot') return '"';
    if (lower === 'apos') return "'";
    if (lower === 'nbsp') return ' ';
    var number = lower.indexOf('#x') === 0 ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
    return Number.isFinite(number) && number >= 0 && number <= 0x10ffff ? String.fromCodePoint(number) : '';
  });
}

function cleanFragment(value) {
  return decodeEntities(String(value || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function filenameTitle(filePath) {
  var raw = String(filePath || '').split(/[\\/]/).pop() || '';
  raw = raw.replace(/\.[^.]+$/, '').replace(/^before$/i, '');
  return raw.replace(/[-_]+/g, ' ').trim() || 'Untitled';
}

function uniquePush(list, value) {
  if (value && list.indexOf(value) === -1) list.push(value);
}

function profileName(lowerText) {
  if (/observability|traces?|infrastructure|deploy|kubernetes|pipeline|latency|uptime|metrics?|saas|api|sdk/.test(lowerText)) return 'saas';
  if (/tech|software|code|programming|developer|engineer|framework|library|runtime|compiler|algorithm/.test(lowerText)) return 'tech';
  if (/lighthouse|journal|diary|letter|correspondence|reflection|personal/.test(lowerText)) return 'essay';
  if (/essay|memoir|narrative|prose|literary|chapter|story|told|wrote|author|poem|poetry|verse/.test(lowerText)) return 'literary';
  if (/menu|recipe|dish|restaurant|kitchen|chef|flavor|taste|cuisine|dining|served|saffron|smoke/.test(lowerText)) return 'restaurant';
  if (/food|cook|bake|ingredient|meal|delicious|spice|herb/.test(lowerText)) return 'food';
  if (/forest|tree|mountain|river|trail|hike|camp|wilderness|outdoor|nature|garden/.test(lowerText)) return 'nature';
  if (/ocean|sea|marine|wave|coast|beach|surf|sail|diving|reef|coral/.test(lowerText)) return 'ocean';
  if (/night|dark|midnight|moon|star|shadow|void|dream|nocturnal/.test(lowerText)) return 'night';
  if (/editorial|magazine|article|column|feature|issue|press|news/.test(lowerText)) return 'editorial';
  return 'default';
}

function readablePalette(palette) {
  var ground = canonicalHex(palette.ground) || '#10131a';
  var light = isLight(ground);
  var ink = ensureContrast(ground, palette.ink, 4.5);
  var accent = ensureContrast(ground, palette.accent, 3);
  var muted = ensureContrast(ground, palette.muted, 2.5);
  var surface = canonicalHex(palette.surface) || (light ? shade(ground, 0.05) : tint(ground, 0.08));
  if (contrastRatio(ground, surface) < 1.08) surface = light ? shade(ground, 0.07) : tint(ground, 0.12);
  return { ground: ground, accent: accent, muted: muted, surface: surface, ink: ink };
}

function derivePalette(lowerText, sourceHex, foundColors) {
  var profile = profileName(lowerText);
  var base = PROFILE_PALETTES[profile];

  if (sourceHex.length >= 3) {
    var ground = sourceHex[0];
    var accent = sourceHex[1];
    var muted = sourceHex[2] || base.muted;
    var surface = sourceHex[3] || (isLight(ground) ? shade(ground, 0.05) : tint(ground, 0.12));
    var ink = isLight(ground) ? '#0a0a0a' : '#f4ecd8';
    return readablePalette({ ground: ground, accent: accent, muted: muted, surface: surface, ink: ink });
  }

  if (foundColors.length >= 2) {
    var lightColor = foundColors.find(function(hex) { return isLight(hex); });
    var darkColor = foundColors.find(function(hex) { return !isLight(hex); });
    var ground2 = base.ground;
    var accent2 = isLight(ground2) ? (darkColor || foundColors[0]) : (lightColor || darkColor || foundColors[0]);
    return readablePalette({
      ground: ground2,
      accent: accent2,
      muted: foundColors[2] || base.muted,
      surface: isLight(ground2) ? shade(ground2, 0.05) : tint(ground2, 0.08),
      ink: isLight(ground2) ? '#0a0a0a' : '#f4ecd8',
    });
  }

  return readablePalette(base);
}

function extractContent(html, filePath) {
  html = String(html == null ? '' : html);

  var sourceWithoutNoise = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  var text = cleanFragment(sourceWithoutNoise);
  var lower = text.toLowerCase();

  var titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  var h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  var title = cleanFragment(titleMatch ? titleMatch[1] : h1Match ? h1Match[1] : h2Match ? h2Match[1] : '');
  if (!title) title = filenameTitle(filePath);

  var headings = [];
  var headingRe = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  var headingMatch;
  while ((headingMatch = headingRe.exec(html)) !== null) {
    var heading = cleanFragment(headingMatch[2]);
    if (heading.length > 2) uniquePush(headings, heading);
  }

  var paragraphs = [];
  var paragraphRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  var paragraphMatch;
  while ((paragraphMatch = paragraphRe.exec(sourceWithoutNoise)) !== null) {
    var paragraph = cleanFragment(paragraphMatch[1]);
    if (paragraph.length > 20) uniquePush(paragraphs, paragraph);
  }

  var items = [];
  var itemRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  var itemMatch;
  while ((itemMatch = itemRe.exec(sourceWithoutNoise)) !== null) {
    var item = cleanFragment(itemMatch[1]);
    if (item.length > 2) uniquePush(items, item);
  }

  var links = [];
  var linkRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  var linkMatch;
  while ((linkMatch = linkRe.exec(sourceWithoutNoise)) !== null) {
    var hrefMatch = linkMatch[1].match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    var href = hrefMatch[1].trim();
    if (!/^(?:https?:|mailto:|#|\/)/i.test(href)) continue;
    var label = cleanFragment(linkMatch[2]);
    if (label || href) {
      var duplicate = links.some(function(existing) { return existing.href === href; });
      if (!duplicate) links.push({ label: label || href, href: href });
    }
  }

  var emails = [];
  var emailRe = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  var emailMatch;
  while ((emailMatch = emailRe.exec(text)) !== null) uniquePush(emails, emailMatch[0]);

  var dates = [];
  var dateRe = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:18|19|20)\d{2}\b|\b(?:18|19|20)\d{2}\b/gi;
  var dateMatch;
  while ((dateMatch = dateRe.exec(text)) !== null) uniquePush(dates, dateMatch[0]);

  var numbers = [];
  var numberRe = /\b\d+(?:[,.]\d+)?\s*(?:ms|s|min|hr|hours?|days?|weeks?|months?|years?|seats?|users?|people|persons?|dollars?|usd|eur|gbp|gb|mb|kb|px|em|rem|rpm|acres|miles|km|metres|meters|feet|ft|pounds?|kg|g|oz|%|x|k|m|b)\b/gi;
  var numberMatch;
  while ((numberMatch = numberRe.exec(text)) !== null) uniquePush(numbers, numberMatch[0]);
  var significantRe = /\b\d{2,}(?:\.\d+)?\b/g;
  var significantMatch;
  while ((significantMatch = significantRe.exec(text)) !== null) {
    var significant = significantMatch[0];
    if (!dates.some(function(date) { return date.indexOf(significant) >= 0; })) uniquePush(numbers, significant);
  }

  var properNouns = [];
  var properRe = /\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,}){0,2}\b/g;
  var properMatch;
  while ((properMatch = properRe.exec(text)) !== null) {
    var proper = properMatch[0].trim();
    var parts = proper.split(/\s+/);
    if (parts.some(function(part) { return STOP_PROPER.has(part); })) {
      parts = parts.filter(function(part) { return !STOP_PROPER.has(part); });
      proper = parts.join(' ');
    }
    if (proper.length > 2) uniquePush(properNouns, proper);
  }

  var foundColors = [];
  Object.keys(COLOR_NAMES).forEach(function(name) {
    if (new RegExp('\\b' + name + '\\b', 'i').test(lower)) uniquePush(foundColors, COLOR_NAMES[name]);
  });

  // CSS hex values are useful, but do not let a source page's framework
  // neutrals (white/black/gray) become the new visual ground. Keep a compact,
  // chromatic list for content-derived palette decisions.
  var chromaticColors = foundColors.filter(function(hex) {
    var rgb = hexToRgb(hex);
    var max = Math.max(rgb.r, rgb.g, rgb.b);
    var min = Math.min(rgb.r, rgb.g, rgb.b);
    return max - min >= 28 && max > 35 && min < 245;
  });

  var sourceHex = [];
  var hexRe = /#[0-9a-fA-F]{3,8}\b/g;
  var hexMatch;
  while ((hexMatch = hexRe.exec(html)) !== null) uniquePush(sourceHex, canonicalHex(hexMatch[0]));

  var frequency = {};
  text.split(/\s+/).forEach(function(word) {
    var noun = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (noun.length > 3 && !STOP_NOUNS.has(noun)) frequency[noun] = (frequency[noun] || 0) + 1;
  });
  var nouns = Object.keys(frequency)
    .sort(function(a, b) { return frequency[b] - frequency[a] || a.localeCompare(b); })
    .slice(0, 10)
    .map(function(noun) { return noun.charAt(0).toUpperCase() + noun.slice(1); });

  var anchors = [];
  properNouns.forEach(function(value) { if (anchors.length < 5) uniquePush(anchors, value); });
  nouns.forEach(function(value) { if (anchors.length < 5) uniquePush(anchors, value); });
  if (!anchors.length) anchors = ['Content', 'Design', 'Source'];

  var profile = profileName(lower);
  return {
    title: title,
    headings: headings.slice(0, 12),
    paragraphs: paragraphs.slice(0, 8),
    items: items.slice(0, 16),
    links: links.slice(0, 12),
    emails: emails.slice(0, 5),
    dates: dates.slice(0, 10),
    numbers: numbers.slice(0, 10),
    properNouns: properNouns.slice(0, 10),
    nouns: nouns,
    anchors: anchors.slice(0, 5),
    palette: derivePalette(lower, sourceHex, chromaticColors),
    foundColors: foundColors,
    sourceHex: sourceHex.slice(0, 10),
    sourceText: text.slice(0, 8000),
    profile: profile,
    density: paragraphs.length + items.length > 12 ? 'rich' : paragraphs.length + items.length > 4 ? 'medium' : 'sparse',
    hasTimeline: dates.length >= 2,
    hasMetrics: numbers.length >= 2,
    hasContact: emails.length > 0,
  };
}

var extractApi = {
  extractContent: extractContent,
  hexToRgb: hexToRgb,
  rgbToHex: rgbToHex,
  relativeLuminance: relativeLuminance,
  contrastRatio: contrastRatio,
  isLight: isLight,
  tint: tint,
  shade: shade,
  ensureContrast: ensureContrast,
  PROFILE_PALETTES: PROFILE_PALETTES,
  COLOR_NAMES: COLOR_NAMES,
};

if (typeof module !== 'undefined' && module.exports) module.exports = extractApi;
if (typeof window !== 'undefined') window.ReimagineExtract = extractApi;
