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

var DEFAULT_CANDIDATES = ['webpage', 'landing', 'dashboard', 'infographic', 'cinematic', 'artistic', 'photography', 'svg', '3js', 'simulation'];

function normaliseCount(value) {
  value = Number(value);
  return Number.isFinite(value) ? Math.max(1, Math.min(3, Math.floor(value))) : 1;
}

function scoreToken(token, content) {
  var score = 0;
  var text = [content.title].concat(content.headings || [], content.paragraphs || [], content.anchors || []).join(' ').toLowerCase();
  var facts = (content.numbers || []).length + (content.dates || []).length;
  var links = (content.links || []).length;
  var items = (content.items || []).length;
  if (token === 'dashboard') score += facts * 5 + (/metric|status|uptime|latency|observability|operations|analytics|performance/.test(text) ? 18 : 0);
  if (token === 'infographic') score += facts * 3 + items * 2 + (/compare|timeline|history|statistics|data|report|survey/.test(text) ? 14 : 0);
  if (token === 'webpage') score += (content.paragraphs || []).length + (content.headings || []).length;
  if (token === 'simulation') score += (content.dates || []).length * 6 + (/process|sequence|steps?|timeline|round|version|flow/.test(text) ? 16 : 0);
  if (token === 'simulation' && (content.dates || []).length < 2) score -= 12;
  if (token === '3js') score += (/space|orbit|planet|map|landscape|architecture|room|journey|explore/.test(text) ? 13 : 0) + (content.anchors || []).length;
  if (token === 'svg') score += (/diagram|system|network|map|relationship|brand|identity|signal/.test(text) ? 13 : 0) + links;
  if (token === 'landing') score += links * 3 + (/product|service|startup|contact|signup|pricing|launch/.test(text) ? 15 : 0);
  if (token === 'photography') score += items * 2 + (/portfolio|gallery|studio|collection|visual|photo|image/.test(text) ? 13 : 0);
  if (token === 'cinematic') score += (/story|journey|chapter|film|cinema|night|dream|light/.test(text) ? 15 : 0) + (content.paragraphs || []).length;
  if (token === 'artistic') score += (/poem|poetry|essay|memory|color|art|creative|voice|emotion/.test(text) ? 13 : 0) + Math.max(0, 8 - facts);
  if (token === 'webpage') score += 5 + (content.paragraphs || []).length * 2 + (content.headings || []).length;
  return score;
}

function chooseTokens(content, count) {
  count = normaliseCount(count || 3);
  return DEFAULT_CANDIDATES.map(function(token) {
    return { token: token, score: scoreToken(token, content) };
  }).sort(function(a, b) {
    return b.score - a.score || DEFAULT_CANDIDATES.indexOf(a.token) - DEFAULT_CANDIDATES.indexOf(b.token);
  }).slice(0, count);
}

function buildPlan(content, options) {
  options = options || {};
  var candidates = chooseTokens(content, options.candidates || 3);
  var selected = candidates[0];
  return {
    mode: 'auto',
    title: content.title,
    profile: content.profile,
    density: content.density,
    recommendation: selected.token,
    candidates: candidates,
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
    infographic: 'The source contains facts or lists that benefit from a shared visual scale.',
    cinematic: 'The source has narrative language that benefits from paced chapters.',
    artistic: 'The source is sparse or expressive enough for a poster-like composition.',
    photography: 'The source has a collection of items that can become visual studies.',
    svg: 'The source names enough anchors to map into a compact living diagram.',
    '3js': 'The source has spatial or exploratory language suited to an orbitable field.',
    simulation: 'The source has a sequence or dated progression that can be scrubbed.',
  };
  return reasons[token] + ' Evidence: ' + anchors + ' anchors, ' + facts + ' measurable facts.';
}

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function qualityScore(output, content) {
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
  check('no external asset fetch', !/(?:src|href)=["']https?:\/\/[^"']+\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp)(?:["'\s])/i.test(output), 10);
  return { score: score, checks: checks };
}

function randomSeed() {
  return Math.floor(Math.random() * 0x7fffffff);
}

function autoGenerate(content, options) {
  options = options || {};
  var plan = buildPlan(content, { candidates: options.candidates || 3 });
  var baseSeed = options.seed === undefined ? randomSeed() : Number(options.seed);
  if (!Number.isSafeInteger(baseSeed)) baseSeed = randomSeed();
  var evaluated = plan.candidates.map(function(candidate, index) {
    var seed = (baseSeed + hashString(candidate.token) + (index + 1) * 7919) | 0;
    var output = generateApi.generate({ content: content, token: candidate.token, seed: seed, brief: options.brief });
    var quality = qualityScore(output, content);
    var passed = quality.checks.every(function(check) { return check.passed; });
    return { token: candidate.token, seed: seed, fit: candidate.score, quality: quality.score, total: candidate.score * 2 + quality.score, checks: quality.checks, output: output, passed: passed };
  });
  if (!evaluated.some(function(candidate) { return candidate.passed; })) {
    throw new Error('no Design Auto candidate passed the craft checks');
  }
  evaluated = evaluated.filter(function(candidate) { return candidate.passed; }).sort(function(a, b) {
    return b.total - a.total || b.quality - a.quality || a.token.localeCompare(b.token);
  }).slice(0, plan.candidates.length);
  var selected = evaluated[0];
  return {
    mode: 'auto', token: selected.token, seed: selected.seed, output: selected.output,
    score: selected.total, rationale: plan.rationale,
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

var autoApi = { DEFAULT_CANDIDATES: DEFAULT_CANDIDATES, scoreToken: scoreToken, chooseTokens: chooseTokens, buildPlan: buildPlan, qualityScore: qualityScore, autoGenerate: autoGenerate };
if (typeof module !== 'undefined' && module.exports) module.exports = autoApi;
if (typeof window !== 'undefined') window.ReimagineAuto = autoApi;
