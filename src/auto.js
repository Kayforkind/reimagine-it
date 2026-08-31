/**
 * Design Auto — an inspectable, model-agnostic autopilot for reimagine-it.
 *
 * Auto chooses a coherent token from extracted evidence, creates candidates,
 * evaluates generated artifacts, and returns the strongest result. It never
 * edits the source and never calls a model by itself; a host harness can use
 * the structured plan as context for a richer model-led pass.
 */

var generateApi = typeof module !== 'undefined' && module.exports
  ? require('./generate')
  : (typeof window !== 'undefined' ? window.ReimagineGenerate : {});

var resultApi = typeof module !== 'undefined' && module.exports
  ? require('./result')
  : (typeof window !== 'undefined' ? window.ReimagineResult : {});

var DEFAULT_CANDIDATES = ['webpage', 'landing', 'dashboard', 'infographic', 'cinematic', 'artistic', 'photography', 'svg', '3js', 'simulation', 'glass', 'editorial', 'motion', 'gradient', 'showcase'];

// Tokens in the same family share a silhouette. Auto and variations must not
// return three recolors of one family — that is how a gallery of skate,
// juice, and streetwear pages all become the same bar-chart poster.
var TOKEN_FAMILY = {
  webpage: 'reading',
  editorial: 'reading',
  landing: 'product',
  dashboard: 'ops',
  infographic: 'poster-data',
  cinematic: 'narrative',
  motion: 'kinetic',
  artistic: 'expressive',
  gradient: 'mesh',
  photography: 'folio',
  svg: 'diagram',
  '3js': 'object',
  simulation: 'clock',
  glass: 'depth',
  showcase: 'capability',
};

var LANE_BIAS = {
  game: { gradient: 42, landing: 22, artistic: 10, dashboard: 6, infographic: -24, simulation: -12 },
  festival: { cinematic: 42, motion: 16, gradient: 12, infographic: -22 },
  skate: { artistic: 38, gradient: 18, photography: 10, infographic: -22 },
  food: { landing: 40, photography: 14, editorial: 6, infographic: -22 },
  fashion: { photography: 38, showcase: 18, artistic: 12, infographic: -22 },
  architecture: { '3js': 44, svg: 16, editorial: 10, infographic: -22 },
  ops: { dashboard: 44, simulation: 8, infographic: -10 },
  data: { infographic: 36, dashboard: 8 },
  reading: { editorial: 36, cinematic: 14, webpage: 10, infographic: -16 },
};

function normaliseCount(value) {
  value = Number(value);
  return Number.isFinite(value) ? Math.max(1, Math.min(3, Math.floor(value))) : 1;
}

function joinedText(content) {
  return [content.title].concat(content.headings || [], content.paragraphs || [], content.anchors || []).join(' ').toLowerCase();
}

function subjectLane(content) {
  var text = joinedText(content);
  var profile = String(content.profile || 'default');
  var facts = (content.numbers || []).length + (content.dates || []).length;
  if (/game|gaming|arena|battle|shooter|loot|player|tournament|esports|loadout|skin|stake|wager|kill/.test(text)) return 'game';
  if (/festival|set times?|after-hours|\bstages?\b.*tickets?|tickets?.*\bstages?\b/.test(text)) return 'festival';
  if (/skate|skateboard|\bdecks?\b|\briders?\b/.test(text)) return 'skate';
  if (profile === 'restaurant' || profile === 'food' || /juice|menu|catering|\bpours?\b/.test(text)) return 'food';
  if (/streetwear|street wear|\bdrop\b|lookbook|oversized|cargo/.test(text)) return 'fashion';
  if (/architecture|living building|residences?|sky gardens?|leed|cladding/.test(text)) return 'architecture';
  if (profile === 'saas' || profile === 'tech' || /observability|telemetry|uptime|incident|collector/.test(text)) return 'ops';
  if (/compare|timeline|history|statistics|\bdata\b|report|survey/.test(text) && facts >= 2) return 'data';
  if (profile === 'essay' || profile === 'literary' || profile === 'editorial') return 'reading';
  return 'generic';
}

function scoreToken(token, content) {
  var score = 0;
  var text = joinedText(content);
  var facts = (content.numbers || []).length + (content.dates || []).length;
  var links = (content.links || []).length;
  var items = (content.items || []).length;
  var dataPoster = /compare|timeline|history|statistics|\bdata\b|report|survey/.test(text);
  // Bare "signal" matches brand copy like "signal yellow" and used to shove
  // every loud palette into an ops dashboard. Ops language must be operational.
  if (token === 'dashboard') score += (/metric|status|uptime|latency|observability|operations|analytics|performance|deploy|traffic|infrastructure|console|monitor|telemetry/.test(text) ? facts * 5 + 18 : 0);
  // Numbers on a menu or a drop are not a statistical poster. Infographic
  // wins when the source is actually arguing with comparisons or a timeline.
  if (token === 'infographic') {
    score += items + Math.min(facts, 4);
    if (dataPoster) score += 14 + facts * 2;
    if (dataPoster && (facts >= 4 || content.density === 'rich')) score += 18;
  }
  if (token === 'webpage') score += (content.paragraphs || []).length + (content.headings || []).length;
  if (token === 'simulation') score += (content.dates || []).length * 6 + (/process|sequence|steps?|timeline|round|version|flow/.test(text) ? 16 : 0);
  if (token === 'simulation' && (content.dates || []).length < 2) score -= 12;
  if (token === '3js') score += (/space|orbit|planet|map|landscape|architecture|room|journey|explore/.test(text) ? 13 : 0) + (content.anchors || []).length;
  if (token === 'svg') score += (/diagram|system|network|map|relationship|brand|identity/.test(text) ? 13 : 0) + links;
  if (token === 'landing') score += links * 3 + (/product|service|startup|contact|signup|pricing|launch|reserve|book|order|visit/.test(text) ? 15 : 0);
  if (token === 'landing' && (content.profile === 'restaurant' || content.profile === 'food' || content.profile === 'retail')) score += 12;
  if (token === 'photography') score += items * 2 + (/portfolio|gallery|studio|collection|visual|photo|image|lookbook/.test(text) ? 13 : 0);
  if (token === 'cinematic') score += (/story|journey|chapter|film|cinema|night|dream|light/.test(text) ? 15 : 0) + (content.paragraphs || []).length;
  if (token === 'cinematic' && (content.profile === 'essay' || content.profile === 'literary')) score += 10;
  if (token === 'cinematic' && facts >= 2 && dataPoster) score -= 24;
  if (token === 'artistic') score += (/poem|poetry|essay|memory|color|art|creative|voice|emotion/.test(text) ? 13 : 0) + Math.max(0, 8 - facts);
  if (token === 'glass') score += (/glass|frosted|transparent|layer|panel|depth/.test(text) ? 12 : 0) + links * 2;
  if (token === 'editorial') score += (content.paragraphs || []).length * 5 + (/essay|article|magazine|editorial|journal|publish/.test(text) ? 14 : 0);
  if (token === 'editorial' && (content.profile === 'essay' || content.profile === 'literary')) score += 16;
  if (token === 'motion') score += (/animation|scroll|motion|interactive|reveal|parallax/.test(text) ? 11 : 0) + (content.anchors || []).length;
  if (token === 'gradient') score += items * 2 + (/brand|modern|color|vibrant|bold|fresh/.test(text) ? 10 : 0) + (content.headings || []).length;
  if (token === 'showcase') score += (/demo|showcase|motion|catalog|capability|feature|lab/.test(text) ? 12 : 0) + (content.anchors || []).length * 2;
  if (token === 'showcase' && (content.anchors || []).length < 4) score -= 8;
  var bias = LANE_BIAS[subjectLane(content)] || {};
  if (bias[token]) score += bias[token];
  return score;
}

function rankTokens(content, count) {
  count = Math.max(1, Math.min(DEFAULT_CANDIDATES.length, Number(count) || 3));
  var ranked = DEFAULT_CANDIDATES.map(function(token) {
    return { token: token, score: scoreToken(token, content), family: TOKEN_FAMILY[token] || token };
  }).sort(function(a, b) {
    return b.score - a.score || DEFAULT_CANDIDATES.indexOf(a.token) - DEFAULT_CANDIDATES.indexOf(b.token);
  });
  var picked = [];
  var usedFamily = {};
  ranked.forEach(function(entry) {
    if (picked.length >= count) return;
    if (usedFamily[entry.family]) return;
    usedFamily[entry.family] = 1;
    picked.push(entry);
  });
  ranked.forEach(function(entry) {
    if (picked.length >= count) return;
    if (picked.some(function(item) { return item.token === entry.token; })) return;
    picked.push(entry);
  });
  return picked.slice(0, count);
}

function chooseTokens(content, count) {
  return rankTokens(content, normaliseCount(count || 3));
}

function buildPlan(content, options) {
  options = options || {};
  // A model harness can steer the same deterministic pipeline with a plan.
  var plan = options.plan || {};
  var candidates = chooseTokens(content, options.candidates || 3);
  if (plan.token && generateApi.TOKENS && generateApi.TOKENS.indexOf(plan.token) >= 0) {
    // Force the harness-requested direction to the top of the recommendation,
    // even when it did not make the heuristic top-N.
    var forced = candidates.some(function(candidate) { return candidate.token === plan.token; });
    candidates = candidates.map(function(candidate) {
      if (candidate.token === plan.token) candidate = { token: candidate.token, score: candidate.score + 10000 };
      return candidate;
    });
    if (!forced) candidates = [{ token: plan.token, score: 10000 + candidates[0].score }].concat(candidates);
    candidates.sort(function(a, b) { return b.score - a.score; });
  }
  var selected = candidates[0];
  return {
    mode: 'auto',
    title: content.title,
    profile: content.profile,
    density: content.density,
    recommendation: selected.token,
    candidates: candidates,
    voice: plan.voice || null,
    anchors: (content.anchors || []).slice(0, 5),
    facts: { headings: (content.headings || []).length, paragraphs: (content.paragraphs || []).length, items: (content.items || []).length, dates: (content.dates || []).length, numbers: (content.numbers || []).length, links: (content.links || []).length },
    rationale: rationale(selected.token, content),
    next: 'Generate the recommended token, audit it, then show it to the client before applying any source edit.',
    safety: ['source is read-only', 'facts remain source-backed', 'output is standalone HTML', 'candidate must pass audit before selection'],
  };
}

function rationale(token, content) {
  var facts = (content.numbers || []).length + (content.dates || []).length;
  var anchors = (content.anchors || []).length;
  var reasons = {
    webpage: 'The source benefits from a measured reading hierarchy.',
    landing: 'The source has an outward-facing action or product-like structure.',
    dashboard: 'The source contains enough measurable signals for an operational view.',
    infographic: (facts >= 6 || content.density === 'rich' ? 'The source is data-heavy (' + facts + ' measurable facts) and reads best on shared scales. ' : 'The source contains facts or lists that benefit from a shared visual scale. '),
    cinematic: 'The source has narrative language that benefits from paced chapters.',
    artistic: 'The source is sparse or expressive enough for a poster-like composition.',
    photography: 'The source has a collection of items that can become visual studies.',
    svg: 'The source names enough anchors to map into a compact living diagram.',
    '3js': 'The source has spatial or exploratory language suited to an orbitable field.',
    simulation: 'The source has a sequence or dated progression that can be scrubbed.',
    glass: 'The source benefits from layered, depth-aware presentation.',
    editorial: 'The source has enough text for a magazine-grade treatment.',
    motion: 'The source structure supports a scroll-reveal narrative.',
    gradient: 'The source has signals that benefit from bold color meshing.',
    showcase: 'The source has enough anchors for a full CSS motion demonstration.',
  };
  return reasons[token] + ' Evidence: ' + anchors + ' anchors, ' + facts + ' measurable facts.';
}

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function qualityScore(output, content, options) {
  options = options || {};
  var sourceTitle = escapeHtml(content.title);
  var anchors = (content.anchors || []).slice(0, 5);
  var score = 0;
  var checks = [];
  function check(name, passed, points) {
    checks.push({ name: name, passed: passed });
    if (passed) score += points;
  }
  check('standalone HTML', /^<!doctype html>/i.test(output), 18);
  check('title preserved', !sourceTitle || output.indexOf(sourceTitle) >= 0, 18);
  check('source anchors retained', !anchors.length || anchors.some(function(anchor) { return output.indexOf(escapeHtml(anchor)) >= 0; }), 16);
  check('focus-visible', output.indexOf('focus-visible') >= 0, 10);
  check('reduced motion', output.indexOf('prefers-reduced-motion') >= 0, 10);
  check('selection styling', output.indexOf('::selection') >= 0, 8);
  check('no placeholder copy', !/(?:lorem ipsum|placeholder|title goes here|sample text|\bTBD\b)/i.test(output), 10);
  check('no external asset fetch', options.webFonts || !/(?:src|href)=["']https?:\/\/[^"']+\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp)(?:["'\s])/i.test(output), 10);
  // ── design-QA battery (the art-director pass) ────────────────────────────
  var keyframes = (output.match(/@keyframes/g) || []).length;
  var distinctHexes = {};
  (output.match(/#[0-9a-f]{6}\b/gi) || []).forEach(function(hex) { distinctHexes[hex.toLowerCase()] = 1; });
  var fidelity = resultApi && resultApi.sourceFidelity ? resultApi.sourceFidelity(content, output).percentage : 100;
  check('type scale present', /clamp\(/.test(output), 6);
  check('art direction present', /(?:glyph-tile|donut|mini-bars|iso-prism|iso-stack|plate|mesh|data-wash|constellation|dot-grid|cap-card|orbit-canvas|glass-panel|isotype|ranking-row)/.test(output), 8);
  check('motion system present', keyframes >= 3, 6);
  // Cap sits at the system's own ceiling: 3 source-declared brand colors +
  // the accent tint family reach 15; anything above that is an unbounded palette.
  check('palette constrained', Object.keys(distinctHexes).length <= 16, 4);
  check('source fidelity ≥ 60%', fidelity >= 60, 8);
  check('semantic landmarks', /<main/.test(output) && (/<nav|footer|aria-label/.test(output)), 4);
  return { score: score, checks: checks };
}

function randomSeed() {
  return Math.floor(Math.random() * 0x7fffffff);
}

function autoGenerate(content, options) {
  options = options || {};
  var plan = buildPlan(content, { candidates: options.candidates || 3, plan: options.plan });
  var baseSeed = options.seed === undefined ? randomSeed() : Number(options.seed);
  if (!Number.isSafeInteger(baseSeed)) baseSeed = randomSeed();
  var webFonts = !!options.webFonts;
  // Evaluate every candidate, then re-roll the top two with fresh seeds so a
  // weak first draw does not sink a good direction. Deterministic given the base seed.
  var evaluated = plan.candidates.map(function(candidate, index) {
    var draws = index < 2 ? [0, 1, 2] : [0];
    var best = null;
    draws.forEach(function(draw) {
      var seed = (baseSeed + hashString(candidate.token) + (index + 1) * 7919 + draw * 104729) | 0;
      var output = generateApi.generate({ content: content, token: candidate.token, seed: seed, brief: options.brief, voice: plan.voice || undefined, webFonts: webFonts });
      var quality = qualityScore(output, content, { webFonts: webFonts });
      var passed = quality.checks.every(function(check) { return check.passed; });
      var total = candidate.score * 2 + quality.score;
      if (!best || total > best.total) best = { token: candidate.token, seed: seed, fit: candidate.score, quality: quality.score, total: total, checks: quality.checks, output: output, passed: passed };
    });
    return best;
  });
  if (!evaluated.some(function(candidate) { return candidate.passed; })) {
    throw new Error('no Design Auto candidate passed the craft checks');
  }
  evaluated = evaluated.filter(function(candidate) { return candidate.passed; }).sort(function(a, b) {
    return b.total - a.total || b.quality - a.quality || a.token.localeCompare(b.token);
  }).slice(0, plan.candidates.length);
  var selected = evaluated[0];
  var voice = plan.voice || generateApi.voiceFor(content.profile, selected.seed, options.brief);
  return {
    mode: 'auto', token: selected.token, seed: selected.seed, output: selected.output,
    score: selected.total, rationale: plan.rationale, voice: voice,
    design: { quality: selected.quality, checks: selected.checks, voice: voice, palette: content.palette },
    candidates: evaluated.map(function(candidate) {
      return { token: candidate.token, seed: candidate.seed, fit: candidate.fit, quality: candidate.quality, total: candidate.total, checks: candidate.checks };
    }), plan: plan,
  };
}

function hashString(value) {
  var hash = 2166136261;
  String(value || '').split('').forEach(function(char) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}

var autoApi = {
  DEFAULT_CANDIDATES: DEFAULT_CANDIDATES,
  TOKEN_FAMILY: TOKEN_FAMILY,
  subjectLane: subjectLane,
  scoreToken: scoreToken,
  rankTokens: rankTokens,
  chooseTokens: chooseTokens,
  buildPlan: buildPlan,
  qualityScore: qualityScore,
  autoGenerate: autoGenerate,
};
if (typeof module !== 'undefined' && module.exports) module.exports = autoApi;
if (typeof window !== 'undefined') window.ReimagineAuto = autoApi;
