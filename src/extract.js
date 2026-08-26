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
  // Currency amounts are always meaningful ($49, $1,200, $2.1B). Thousand-
  // grouped digits and unit-qualified numbers carry context; bare digits
  // (ids, hours, phone fragments) would surface as fake metrics in output.
  var numberRe = /\$[\d,]+(?:\.\d+)?[kmb]?\b|\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+(?:\.\d+)?\s*(?:\/\s*)?(?:ms|s|min|hr|hours?|days?|weeks?|months?|years?|seats?|users?|people|persons?|dollars?|usd|eur|gbp|gb|mb|kb|px|em|rem|rpm|acres|miles|km|metres|meters|feet|ft|pounds?|kg|g|oz|%|x|k|m|b|mo|staff|customers?|members|donors|graduates|students|teachers|instructors|physicians|doctors|patients|homes|cabins?|apartments?|properties|units|rooms|reviews|stars|sellers|buyers|downloads|cities|states|regions|countries|players|pilots|teams|devices|tokens|calls|games|levels|biomes|seasons|ships|systems|plans|tracks|freelancers|listings|prints|editions|origins|riders|rides|buses|stations|visits|classes|lessons|courses|warranty|trims|patches|fine-tunes?)(?![\w])/gi;
  var numberMatch;
  while ((numberMatch = numberRe.exec(text)) !== null) uniquePush(numbers, numberMatch[0]);

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

  var images = [];
  var imgRe = /<img\b([^>]*)>/gi;
  var imgMatch;
  while ((imgMatch = imgRe.exec(sourceWithoutNoise)) !== null) {
    var srcMatch = imgMatch[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    var altMatch = imgMatch[1].match(/\balt\s*=\s*["']([^"']*)["']/i);
    if (srcMatch) {
      var src = srcMatch[1].trim();
      var inline = /^data:/i.test(src);
      var local = !/^(?:https?:|\/\/)/i.test(src);
      if (inline || local) uniquePush(images, { src: src, alt: cleanFragment(altMatch ? altMatch[1] : '') });
    }
  }

  var tables = 0;
  var tableRe = /<table\b/gi;
  while (tableRe.exec(sourceWithoutNoise) !== null) tables++;

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
    images: images.slice(0, 8),
    hasTable: tables > 0,
    tone: detectTone(lower),
    readingTime: readingTimeOf(text),
    script: detectScript(lower),
    palette: derivePalette(lower, sourceHex, chromaticColors),
    foundColors: foundColors,
    sourceHex: sourceHex.slice(0, 10),
    sourceText: text.slice(0, 8000),
    profile: profile,
    density: paragraphs.length + items.length > 12 ? 'rich' : paragraphs.length + items.length > 4 ? 'medium' : 'sparse',
    hasTimeline: dates.length >= 2,
    hasMetrics: numbers.length >= 1,
    hasContact: emails.length > 0,
  };
}

// ── tone, reading time, script detection ────────────────────────────────

function detectTone(lowerText) {
  var playful = /(?:fun|playful|vibrant|bold|fresh|juicy|wild|epic|awesome|delight|colorful|celebrat)/.test(lowerText);
  var formal = /(?:policy|terms?|compliance|regulatory|official|announcement|procedure|requirements?|guidelines?|pursuant|hereby)/.test(lowerText);
  var dark = /(?:dark|shadow|void|nocturnal|abyss|midnight|haunt|grief|storm|thunder)/.test(lowerText);
  if (playful && !formal) return 'playful';
  if (formal) return 'formal';
  if (dark) return 'dark';
  return 'neutral';
}

function readingTimeOf(text) {
  var words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function detectScript(lowerText) {
  if (/[\u0400-\u04ff]/.test(lowerText)) return 'cyrillic';
  if (/[\u3040-\u30ff]/.test(lowerText)) return 'japanese';
  if (/[\uac00-\ud7af]/.test(lowerText)) return 'korean';
  if (/[\u4e00-\u9fff]/.test(lowerText)) return 'chinese';
  if (/[\u0600-\u06ff]/.test(lowerText)) return 'arabic';
  return 'latin';
}

// ── OKLCH palette system ────────────────────────────────────────────────
// Perceptually uniform color math keeps derived roles harmonious: roles are
// the source accent rotated in hue at a controlled chroma, then re-checked
// for contrast against the ground. All deterministic from the source palette.

function linearize(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function delinearize(c) {
  c = Math.max(0, Math.min(1, c));
  return Math.round((c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);
}

function hexToOklch(hex) {
  var rgb = hexToRgb(hex);
  var r = linearize(rgb.r), g = linearize(rgb.g), b = linearize(rgb.b);
  var l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  var m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  var s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  var l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  var L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  var a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  var b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  return { L: L, C: Math.sqrt(a * a + b_ * b_), H: Math.atan2(b_, a) * 180 / Math.PI };
}

function hexFromOklch(L, C, H) {
  var h = H * Math.PI / 180;
  var a = C * Math.cos(h), b_ = C * Math.sin(h);
  var l_ = L + 0.3963377774 * a + 0.2158037573 * b_;
  var m_ = L - 0.1055613458 * a - 0.0638541728 * b_;
  var s_ = L - 0.0894841775 * a - 1.2914855480 * b_;
  var l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  var r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  var g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  var bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return rgbToHex(delinearize(r), delinearize(g), delinearize(bl));
}

function rotateHue(hex, degrees) {
  var oklch = hexToOklch(hex);
  return hexFromOklch(oklch.L, oklch.C * 0.92, oklch.H + degrees);
}

function ramp(hex, steps) {
  // Internal lightness ramp (light → dark) at controlled chroma. Used for
  // charts and washes; only the handful of emitted hexes reach the page.
  var oklch = hexToOklch(hex);
  var out = [];
  for (var i = 0; i < steps; i++) {
    var t = i / (steps - 1);
    var L = 0.9 - t * 0.62;
    var C = oklch.C * (0.55 + 0.45 * (1 - t));
    out.push(hexFromOklch(Math.max(0.06, Math.min(0.96, L)), Math.max(0.01, C), oklch.H));
  }
  return out;
}

var HARMONY = {
  saas: [24, -16], tech: [24, -16],
  essay: [-10, 22], literary: [-10, 22], editorial: [-10, 22],
  restaurant: [32, -32], food: [32, -32], nature: [32, -32], outdoor: [32, -32], ocean: [32, -32],
  night: [120, 240], artistic: [120, 240],
  minimal: [8, -8],
  default: [26, -14],
};

function paletteSystem(palette, seed) {
  // Extends the readable palette with two harmonious role colors and a
  // lightness ramp, all derived deterministically from the source palette.
  palette = palette || {};
  var ground = canonicalHex(palette.ground) || '#10131a';
  var accent = canonicalHex(palette.accent) || '#e8a63f';
  var profile = String(palette.profile || 'default');
  var offsets = HARMONY[profile] || HARMONY.default;
  var jitter = (hashOf(ground + accent + ':' + (seed === undefined ? 0 : seed)) % 9) - 4;
  var accent2 = ensureContrast(ground, rotateHue(accent, offsets[0] + jitter), 3);
  var accent3 = ensureContrast(ground, rotateHue(accent, offsets[1] - jitter), 3);
  return {
    accent2: accent2,
    accent3: accent3,
    harmony: offsets[0] + jitter + '° / ' + (offsets[1] - jitter) + '°',
    ramps: { accent: ramp(accent, 7), accent2: ramp(accent2, 7), accent3: ramp(accent3, 7) },
    ground: ground,
  };
}

function hashOf(value) {
  var hash = 2166136261;
  String(value || '').split('').forEach(function(char) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
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
  paletteSystem: paletteSystem,
  hexToOklch: hexToOklch,
  hexFromOklch: hexFromOklch,
  rotateHue: rotateHue,
  ramp: ramp,
  detectTone: detectTone,
  PROFILE_PALETTES: PROFILE_PALETTES,
  COLOR_NAMES: COLOR_NAMES,
};

if (typeof module !== 'undefined' && module.exports) module.exports = extractApi;
if (typeof window !== 'undefined') window.ReimagineExtract = extractApi;
