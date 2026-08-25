/**
 * Token-specific standalone HTML generators.
 *
 * The engine keeps one promise across every output form: the source is the
 * brief. Visible facts come from the extracted content; visual variation comes
 * from a deterministic draw when a seed is supplied, or a fresh draw otherwise.
 */

var extractApi = typeof module !== 'undefined' && module.exports
  ? require('./extract')
  : (typeof window !== 'undefined' ? window.ReimagineExtract : {});

var tint = extractApi.tint;
var shade = extractApi.shade;
var isLight = extractApi.isLight;
var ensureContrast = extractApi.ensureContrast;

var TOKENS = [
  'webpage', 'landing', 'dashboard', 'infographic', 'cinematic',
  'artistic', 'photography', 'svg', '3js', 'simulation',
  'glass', 'editorial', 'motion', 'gradient',
];

var TOKEN_DESCRIPTIONS = {
  webpage: 'Measured editorial page for reading the source',
  landing: 'Product-style page with source-backed actions and features',
  dashboard: 'Operational view built from source facts and counts',
  infographic: 'Common-scale poster for dates, facts, and comparisons',
  cinematic: 'Scroll-led narrative with chapters from the source',
  artistic: 'Expressive poster with an anchor-derived visual field',
  photography: 'Visual folio of abstract studies, one per source anchor',
  svg: 'Inline living diagram with a labeled anchor network',
  '3js': 'Offline canvas object with pointer and keyboard orbit',
  simulation: 'Playable sequence or date timeline from the source',
  glass: 'Frosted-glass panels with depth, blur, and layered transparency',
  editorial: 'Magazine-grade layout with drop caps, pull quotes, and columns',
  motion: 'Animation-forward page with scroll reveals and parallax depth',
  gradient: 'Bold gradient-driven design with modern color meshes',
};

function list(value) {
  return Array.isArray(value) ? value.filter(function(item) { return item !== null && item !== undefined && String(item).trim(); }).map(String) : [];
}

function color(value, fallback) {
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value.slice(0, 7) : fallback;
}

function normaliseContent(input) {
  input = input || {};
  var palette = input.palette || {};
  return {
    title: String(input.title || 'Untitled'),
    headings: list(input.headings),
    paragraphs: list(input.paragraphs),
    items: list(input.items),
    links: Array.isArray(input.links) ? input.links.filter(function(link) {
      return link && typeof link.href === 'string' && typeof link.label === 'string';
    }).map(function(link) { return { href: link.href, label: link.label }; }) : [],
    emails: list(input.emails),
    dates: list(input.dates),
    numbers: list(input.numbers),
    properNouns: list(input.properNouns),
    nouns: list(input.nouns),
    anchors: list(input.anchors),
    profile: String(input.profile || 'default'),
    density: String(input.density || 'medium'),
    palette: {
      ground: color(palette.ground, '#10131a'),
      accent: color(palette.accent, '#e8a63f'),
      muted: color(palette.muted, '#778094'),
      surface: color(palette.surface, '#1a202b'),
      ink: color(palette.ink, '#f4ecd8'),
    },
  };
}

function generate(opts) {
  opts = opts || {};
  var content = normaliseContent(opts.content);
  var token = TOKENS.indexOf(opts.token) >= 0 ? opts.token : 'webpage';
  var brief = opts.brief ? String(opts.brief) : '';
  var p = content.palette;
  var ground = p.ground;
  var accent = ensureContrast(ground, p.accent, 3);
  var muted = ensureContrast(ground, p.muted, 2.5);
  var surface = p.surface;
  var ink = ensureContrast(ground, p.ink, 4.5);
  var rng = makeRNG(opts.seed !== undefined ? opts.seed : Math.floor(Math.random() * 0x7fffffff));
  var headings = content.headings.filter(function(heading) { return heading !== content.title; });
  var anchors = headings.length ? headings.slice() : (content.anchors.length ? content.anchors.slice() : ['Content', 'Design', 'Source']);
  var paragraphs = content.paragraphs.slice();
  var items = content.items.slice();
  var facts = factsFor(content, anchors);
  var profile = content.profile;
  var label = brief || profileLabel(profile);
  var variation = {
    drift: Math.round(rng() * 24 - 12),
    radius: Math.round(rng() * 10 + 2),
    tilt: Math.round(rng() * 8 - 4),
    offset: Math.round(rng() * 18 + 8),
  };

  var craftFloor = '::selection{background:' + accent + ';color:' + ground + '}' +
    ':focus-visible{outline:2px solid ' + accent + ';outline-offset:4px;border-radius:3px}' +
    '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}html{scroll-behavior:smooth}' +
    '@view-transition{crossfade}' +
    '::view-transition-old(root){animation:vt-old .35s cubic-bezier(.4,0,.2,1) both}' +
    '::view-transition-new(root){animation:vt-new .35s cubic-bezier(.4,0,.2,1) both}' +
    '@keyframes vt-old{to{opacity:0;filter:blur(8px)}}' +
    '@keyframes vt-new{from{opacity:0;filter:blur(8px)}to{opacity:1;filter:none}}' +
    'html{scrollbar-color:var(--a) var(--g);scrollbar-width:thin}' +
    'body::before{content:"";position:fixed;inset:0;z-index:9998;pointer-events:none;opacity:.045;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/></filter><rect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%270.6%27/></svg>")}' +
    'body::after{content:"";position:fixed;left:0;top:0;height:2px;width:100%;background:linear-gradient(90deg,var(--a),var(--m));transform-origin:0 50%;transform:scaleX(0);z-index:9999;pointer-events:none;animation:progline linear both;animation-timeline:scroll(root)}@keyframes progline{to{transform:scaleX(1)}}@supports not (animation-timeline:scroll()){body::after{display:none}}';
  var baseCss = '*{box-sizing:border-box;margin:0;padding:0}' +
    'html{background:var(--g);color:var(--i);-webkit-font-smoothing:antialiased}' +
    'body{min-height:100vh;overflow-x:hidden}' +
    'a{color:var(--a);text-underline-offset:3px}' +
    'button,input,select{font:inherit}' +
    '.source-block,.section,.feature,.plate,.metric{content-visibility:auto;contain-intrinsic-size:0 180px}' +
    '@media(max-width:640px){body{overflow-wrap:anywhere}}';
  var serif = '"Iowan Old Style","Hoefler Text",Palatino,Georgia,Cambria,serif';
  var sans = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var mono = 'ui-monospace,"SF Mono","Cascadia Code",Consolas,Menlo,monospace';
  var svgSans = sans.replace(/"/g, '');

  switch (token) {
    case 'webpage': return webpage();
    case 'landing': return landing();
    case 'dashboard': return dashboard();
    case 'infographic': return infographic();
    case 'cinematic': return cinematic();
    case 'artistic': return artistic();
    case 'photography': return photography();
    case 'svg': return svg();
    case '3js': return threejs();
    case 'simulation': return simulation();
    case 'glass': return glass();
    case 'editorial': return editorial();
    case 'motion': return motion();
    case 'gradient': return gradient();
    default: return webpage();
  }

  function page(title, css, body, script) {
    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="view-transition" content="same-origin">' +
      '<meta name="color-scheme" content="' + (isLight(ground) ? 'light' : 'dark') + '">' +
      '<title>' + esc(title) + '</title><style>' +
      '@property --g{syntax:"<color>";inherits:true;initial-value:#000}' +
      '@property --a{syntax:"<color>";inherits:true;initial-value:#fff}' +
      '@property --radius{syntax:"<length>";inherits:false;initial-value:4px}' +
      '@property --drift{syntax:"<length>";inherits:false;initial-value:0px}' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + ';--drift:' + variation.drift + 'px;--radius:' + variation.radius + 'px}' +
      baseCss + css + craftFloor + '</style></head><body>' + body +
      (script ? '<scr' + 'ipt>' + script + '</scr' + 'ipt>' : '') +
      '</body></html>';
  }

  function paragraphAt(index, anchor) {
    return paragraphs.length ? paragraphs[index % paragraphs.length] : 'Source anchor: ' + anchor + '.';
  }

  function sectionParagraphAt(index, anchor) {
    return paragraphs.length > index + 1 ? paragraphs[index + 1] : paragraphAt(index, anchor);
  }

  function sectionId(value, index) {
    return 'section-' + index + '-' + String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28);
  }

  function usefulLink() {
    for (var i = 0; i < content.links.length; i++) {
      if (/^(?:https?:|mailto:|#)/i.test(content.links[i].href)) return content.links[i];
    }
    return null;
  }

  function linkList() {
    return content.links.slice(0, 5).map(function(link) {
      return '<li><a href="' + esc(link.href) + '">' + esc(link.label) + '</a></li>';
    }).join('');
  }

  function webpage() {
    var light = isLight(ground);
    var border = light ? 'rgba(15,18,24,.14)' : 'rgba(255,255,255,.14)';
    var sections = anchors.map(function(anchor, index) {
      var id = sectionId(anchor, index);
      return '<article class="section" id="' + id + '" style="--n:' + index + '">' +
        '<div class="section-index">' + String(index + 1).padStart(2, '0') + '</div>' +
        '<div><h2>' + esc(anchor) + '</h2><p>' + esc(sectionParagraphAt(index, anchor)) + '</p>' +
        (facts[index] && facts[index].value ? '<p class="fact"><span>' + esc(facts[index].kind) + '</span> ' + esc(facts[index].value) + '</p>' : '') +
        '</div></article>';
    }).join('');
    var contents = anchors.map(function(anchor, index) {
      return '<a href="#' + sectionId(anchor, index) + '">' + esc(anchor) + '</a>';
    }).join('');
    var css = 'html{scroll-behavior:smooth}body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.page{max-width:920px;margin:0 auto;padding:clamp(28px,7vw,92px) 28px 100px}' +
      '.hero{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:44px;align-items:end;padding-bottom:64px;border-bottom:1px solid ' + border + '}' +
      '.eyebrow{display:block;font:10px ' + mono + ';letter-spacing:.18em;text-transform:uppercase;color:var(--m);margin-bottom:18px}' +
      '.hero h1{font:400 clamp(44px,8vw,90px)/.92 ' + serif + ';letter-spacing:-.045em;max-width:9ch;color:var(--a);text-wrap:balance}' +
      '.lede{max-width:54ch;font-size:18px;line-height:1.7;opacity:.78;margin-top:26px}' +
      '.stamp{align-self:start;justify-self:end;border:1px solid ' + border + ';border-radius:var(--radius);padding:16px;font:10px/1.6 ' + mono + ';color:var(--m);transform:translateY(var(--drift)) rotate(' + variation.tilt + 'deg)}' +
      '.stamp strong{display:block;font-size:30px;line-height:1;color:var(--a);margin-bottom:8px}' +
      '.contents{display:flex;gap:12px;flex-wrap:wrap;padding:22px 0 12px;font:11px ' + mono + ';text-transform:uppercase;letter-spacing:.08em}' +
      '.contents a{color:var(--m);text-decoration:none;border-bottom:1px solid transparent;transition:color .2s ease,border-color .2s ease,background .2s ease;padding:2px 8px;border-radius:999px;margin-left:-8px}.contents a:hover{color:var(--a);border-color:transparent;background:color-mix(in srgb,var(--a) 12%,transparent)}' +
      '.section{display:grid;grid-template-columns:70px minmax(0,1fr);gap:24px;padding:46px 0;border-bottom:1px solid ' + border + ';animation:sec-in linear both;animation-timeline:view();animation-range:entry 4% cover 28%}@supports not (animation-timeline:view()){.section{opacity:1;animation:none}}' +
      '.section-index{font:12px ' + mono + ';color:var(--a);padding-top:7px}' +
      '.section h2{font:400 clamp(26px,4vw,42px)/1 ' + serif + ';letter-spacing:-.025em;margin-bottom:16px;transition:color .25s ease}' +
      '.section p{max-width:62ch;font-size:16px;line-height:1.75;opacity:.76}' +
      '.section .fact{font:11px ' + mono + ';color:var(--a);opacity:1;margin-top:18px;text-transform:uppercase;letter-spacing:.08em}' +
      '.section .fact span{color:var(--m);margin-right:8px}' +
      '.source-block{margin-top:48px;padding:24px 0 6px;border-top:1px solid ' + border + '}.source-block ul{display:flex;gap:14px;flex-wrap:wrap;list-style:none;font-size:13px;margin-top:14px}.source-block a{color:var(--m);text-decoration:none;border-bottom:1px solid transparent}.source-block a:hover{color:var(--a);border-color:var(--a)}' +
      '@media(max-width:700px){.hero{grid-template-columns:1fr}.stamp{justify-self:start;transform:none}.section{grid-template-columns:42px 1fr;gap:12px}}' +
    '@keyframes sec-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}' +
    '@supports not (animation-timeline:view()){.section{opacity:1;animation:none}}';
    var linksAside = content.links.length ? '<aside class="source-block"><span class="eyebrow">Notes &amp; links</span><ul>' + content.links.slice(0, 6).map(function(l) { return '<li><a href="' + esc(l.href) + '">' + esc(l.label || l.href) + '</a></li>'; }).join('') + '</ul></aside>' : '';
    return page(content.title, '<main class="page"><header class="hero"><div><span class="eyebrow" style="color:var(--a)">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="lede">' + esc(paragraphAt(0, anchors[0])) + '</p></div><div class="stamp"><strong>' + anchors.length + '</strong><span>sections</span></div></header><nav class="contents" aria-label="On this page">' + contents + '</nav>' + sections + linksAside + '</main>');
  }

  function landing() {
    var light = isLight(ground);
    var border = light ? 'rgba(15,18,24,.12)' : 'rgba(255,255,255,.14)';
    var action = usefulLink();
    var primaryHref = action ? action.href : '#features';
    var primaryText = action ? (action.href.indexOf('mailto:') === 0 ? 'Contact source' : 'Open source ↗') : 'Explore ' + anchors[0];
    var features = anchors.slice(0, 4).map(function(anchor, index) {
      var item = items[index] || paragraphAt(index, anchor);
      return '<article class="feature"><span class="feature-no">0' + (index + 1) + '</span><h2>' + esc(anchor) + '</h2><p>' + esc(item) + '</p></article>';
    }).join('');
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.landing{max-width:1080px;margin:0 auto;padding:24px 28px 90px}' +
      '.topline{display:flex;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid ' + border + ';font:10px ' + mono + ';letter-spacing:.15em;text-transform:uppercase;color:var(--m)}' +
      '.hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:clamp(32px,6vw,72px);align-items:center;padding:clamp(64px,10vw,130px) 0 90px}' +
      '.hero-copy{position:relative;min-width:0;max-width:56ch}' +
      '.hero-art{position:relative;aspect-ratio:1;border-radius:28px;overflow:hidden;border:1px solid ' + border + ';background:radial-gradient(120% 120% at 28% 22%,' + accent + '2e,transparent 58%),radial-gradient(120% 120% at 78% 82%,' + muted + '24,transparent 60%);transform:translateY(var(--drift)) rotate(' + variation.tilt + 'deg);box-shadow:0 30px 80px -30px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.08)}' +
      '.hero-art::after{content:"";position:absolute;inset:0;border-radius:28px;box-shadow:inset 0 0 90px rgba(0,0,0,.35);pointer-events:none}' +
      '.art-orbit{position:absolute;inset:14%;border:1px dashed ' + accent + '66;border-radius:50%;animation:art-spin 26s linear infinite}' +
      '.art-dot{position:absolute;top:50%;left:50%;width:58%;height:58%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 32% 30%,' + tint(accent, .28) + ',transparent 68%),radial-gradient(circle at 68% 72%,' + shade(accent, .18) + ',transparent 70%);filter:blur(2px);animation:art-breathe 5s ease-in-out infinite}' +
      '.art-chip{position:absolute;font:700 9px ' + mono + ';letter-spacing:.12em;text-transform:uppercase;color:var(--a);background:var(--g);border:1px solid ' + border + ';border-radius:999px;padding:7px 12px;backdrop-filter:blur(8px);box-shadow:0 10px 28px -12px rgba(0,0,0,.5)}' +
      '.art-chip.c1{top:14%;left:8%}.art-chip.c2{top:24%;right:6%}.art-chip.c3{bottom:18%;left:12%}.art-chip.c4{bottom:8%;right:20%}' +
      '@keyframes art-spin{to{transform:rotate(360deg)}}@keyframes art-breathe{50%{transform:translate(-50%,-50%) scale(1.08)}}' +
      '.hero h1{max-width:8ch}' +
      '@media(max-width:900px){.hero{grid-template-columns:1fr;gap:28px}.hero-art{display:none}}' +
      '.hero::before{content:"";position:absolute;width:520px;height:360px;left:calc(30% + var(--drift));top:6%;background:radial-gradient(ellipse,' + accent + '22,transparent 68%);pointer-events:none;filter:blur(60px)}' +
      '.hero>*{position:relative}' +
      '.eyebrow{font:10px ' + mono + ';letter-spacing:.2em;text-transform:uppercase;color:var(--a)}' +
      'h1{font:400 clamp(52px,10vw,122px)/.88 ' + serif + ';letter-spacing:-.055em;max-width:10ch;margin-top:20px;text-wrap:balance}' +
      '.lede{max-width:52ch;font-size:19px;line-height:1.65;opacity:.75;margin-top:28px}' +
      '.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}' +
      '.action{display:inline-flex;align-items:center;gap:8px;padding:14px 20px;border-radius:999px;background:var(--a);color:var(--g);font-weight:700;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease}' +
      '.action:hover{transform:translateY(-3px);box-shadow:0 18px 34px -16px ' + accent + '}' +
      '.action.secondary{background:transparent;color:var(--i);box-shadow:inset 0 0 0 1px ' + border + '}' +
      '.feature-grid{container:features / inline-size;display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid ' + border + ';border-bottom:1px solid ' + border + '}' +
      '.feature{padding:28px 20px 34px 0;border-right:1px solid ' + border + ';margin-right:20px;transition:transform .25s ease,box-shadow .25s ease;border-radius:var(--radius);animation:feat-in linear both;animation-timeline:view();animation-range:entry 5% cover 25%}.feature:hover{transform:translateY(-4px);box-shadow:0 14px 28px -12px ' + accent + '40}' +
      '.feature:last-child{border-right:0;margin-right:0}' +
      '.feature-no{font:11px ' + mono + ';color:var(--a)}' +
      '.feature h2{font:400 26px/1 ' + serif + ';letter-spacing:-.02em;margin:40px 0 12px}' +
      '.feature p{font-size:14px;line-height:1.65;opacity:.68}' +
      '.links{margin-top:48px;font-size:13px}.links ul{display:flex;gap:18px;flex-wrap:wrap;list-style:none;margin-top:14px}' +
      '@container features(max-width:800px){.feature-grid{grid-template-columns:repeat(2,1fr)}.feature:nth-child(2){border-right:0;margin-right:0}.feature:nth-child(n+3){border-top:1px solid ' + border + '}}' +
      '@container features(max-width:500px){.feature-grid{grid-template-columns:1fr}.feature{border-right:0!important;margin-right:0!important;border-top:1px solid ' + border + '}.feature:first-child{border-top:0}}' +
      '@media(max-width:800px){.feature-grid{grid-template-columns:repeat(2,1fr)}.feature:nth-child(2){border-right:0;margin-right:0}.feature:nth-child(n+3){border-top:1px solid ' + border + '}}' +
      '@media(max-width:480px){.feature-grid{grid-template-columns:1fr}.feature{border-right:0!important;margin-right:0!important;border-top:1px solid ' + border + '}.feature:first-child{border-top:0}}' +
    '@keyframes feat-in{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}' +
    '@supports not (container-type:inline-size){.feature-grid{container:unset}}' +
    '@supports not (animation-timeline:view()){.feature{animation:feat-in-fb .4s ease both;animation-delay:calc(var(--n,0)*.1s)}}' +
    '@keyframes feat-in-fb{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}' +
    '@supports not (animation-timeline:view()){.feature{animation:feat-in-fallback .4s ease both;animation-delay:calc(var(--n,0)*.1s)}}' +
    '@keyframes feat-in-fallback{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}' +
      '.marquee{overflow:hidden;border-top:1px solid ' + border + ';border-bottom:1px solid ' + border + ';padding:14px 0;margin:0 0 18px}' +
      '.marquee-track{display:flex;gap:40px;width:max-content;animation:marq 22s linear infinite;font:400 13px ' + serif + ';letter-spacing:.05em;color:var(--m)}' +
      '.marquee-track span{display:inline-flex;align-items:center;gap:40px;white-space:nowrap}' +
      '.marquee-track i{color:var(--a);font-style:normal}' +
      '@keyframes marq{to{transform:translateX(-50%)}}' +
      '@media(prefers-reduced-motion:reduce){.marquee-track{animation:none;flex-wrap:wrap}}';
    var links = content.links.length ? '<section class="links"><span class="eyebrow">Continue with the source</span><ul>' + linkList() + '</ul></section>' : '';
    var marqueeInner = anchors.slice(0, 6).map(function(a, i) { return '<span>' + esc(a) + ' <i>' + (i === 0 ? '✦' : '·') + '</i></span>'; }).join('');
    return page(content.title, css, '<main class="landing"><div class="topline"><span>' + esc(label) + '</span><span>' + anchors.length + ' source signals</span></div><header class="hero"><div class="hero-copy"><span class="eyebrow">' + esc(content.profile) + '</span><h1>' + esc(content.title) + '</h1><p class="lede">' + esc(paragraphAt(0, anchors[0])) + '</p><div class="actions"><a class="action" href="' + esc(primaryHref) + '">' + esc(primaryText) + ' →</a><a class="action secondary" href="#features">See the signals</a></div></div><div class="hero-art" aria-hidden="true"><div class="art-dot"></div><div class="art-orbit"></div><span class="art-chip c1">' + esc(anchors[0] || 'start') + '</span><span class="art-chip c2">' + esc(anchors[1 % Math.max(anchors.length, 1)] || 'signal') + '</span><span class="art-chip c3">' + esc(anchors[2 % Math.max(anchors.length, 1)] || 'core') + '</span><span class="art-chip c4">' + esc(anchors[3 % Math.max(anchors.length, 1)] || 'detail') + '</span></div></header><div class="marquee"><div class="marquee-track">' + marqueeInner + '</div></div>' + '<section class="feature-grid" id="features" aria-label="Source features">' + features + '</section>' + links + '</main>');
  }

  function dashboard() {
    var dGround = isLight(ground) ? shade(ground, .78) : ground;
    var dAccent = ensureContrast(dGround, accent, 3);
    var dMuted = ensureContrast(dGround, muted, 2.5);
    var dSurface = tint(dGround, .07);
    var metrics = metricCards(facts, anchors);
    var cards = metrics.map(function(metric, index) {
      return '<article class="metric kpi"><span class="metric-kind">' + esc(metric.kind) + '</span><strong>' + esc(metric.value) + '</strong><h2>' + esc(metric.label) + '</h2><div class="metric-foot">' + esc(metric.detail) + '<svg viewBox="0 0 120 28" aria-hidden="true"><path d="' + sparkPath(metric.label, index) + '"/></svg></div></article>';
    }).join('');
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.console{max-width:1080px;margin:0 auto;padding:clamp(28px,6vw,72px) 28px 90px;position:relative;z-index:1}.console::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(720px 360px at 6% -2%,color-mix(in srgb,var(--a) 24%,transparent),transparent 64%)}' +
      '.console-head{display:flex;justify-content:space-between;align-items:end;gap:24px;border-bottom:1px solid rgba(255,255,255,.12);padding-bottom:24px;margin-bottom:24px}' +
      '.console-head h1{font:500 clamp(28px,5vw,54px)/1 ' + serif + ';letter-spacing:-.035em;color:var(--a)}' +
      '.console-head p{display:inline-flex;align-items:center;gap:9px;font:11px ' + mono + ';color:var(--m);text-align:right;max-width:30ch}.console-head p::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--a);box-shadow:0 0 12px var(--a);animation:live-pulse 2.2s ease-in-out infinite}@keyframes live-pulse{0%,100%{opacity:1}50%{opacity:.25}}' +
      '.metrics{container:metrics / inline-size;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}' +
      '.metric{background:linear-gradient(180deg,rgba(255,255,255,.045),transparent 46%),' + dSurface + ';border:1px solid rgba(255,255,255,.12);border-radius:var(--radius);padding:20px;min-height:190px;display:flex;flex-direction:column;transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease;animation:met-in linear both;animation-timeline:view();animation-range:entry 4% cover 24%}.metric:hover{transform:translateY(-4px);border-color:' + dAccent + ';box-shadow:0 22px 46px -22px ' + dAccent + '}' +
      '.metric-kind{font:10px ' + mono + ';letter-spacing:.14em;text-transform:uppercase;color:var(--a);opacity:.8}' +
      '.metric strong{font:600 clamp(28px,4vw,48px)/1 ' + sans + ';letter-spacing:-.04em;margin-top:28px;color:#f1f5f9}' +
      '.metric h2{font:500 13px ' + sans + ';margin-top:8px;color:#cbd5e1}' +
      '.metric-foot{display:flex;align-items:end;justify-content:space-between;gap:8px;margin-top:auto;padding-top:22px;font:10px ' + mono + ';color:' + dMuted + '}' +
      '.metric svg{width:120px;height:28px;overflow:visible}.metric path{fill:none;stroke:' + dAccent + ';stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:.85;filter:drop-shadow(0 0 5px color-mix(in srgb,var(--a) 55%,transparent))}.metric:hover path{opacity:1}' +
      '.provenance{font:11px ' + mono + ';color:' + dMuted + ';margin-top:18px}' +
      '@keyframes met-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@media(max-width:820px){.metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.console-head{display:block}.console-head p{text-align:left;margin-top:12px}.metrics{grid-template-columns:1fr}}';
    var body = '<main class="console"><header class="console-head"><div><span class="metric-kind">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1></div><p>Metrics drawn from the source page</p></header><section class="metrics" aria-label="Source metrics">' + cards + '</section><p class="provenance">Every number shown appears in the source; labels mirror how the page names them.</p></main>';
    return pageWithPalette(content.title, css, body, dGround, dAccent, dMuted, dSurface, '#e6edf3');
  }

  function pageWithPalette(title, css, body, customGround, customAccent, customMuted, customSurface, customInk) {
    var saved = { ground: ground, accent: accent, muted: muted, surface: surface, ink: ink };
    ground = customGround; accent = customAccent; muted = customMuted; surface = customSurface; ink = customInk;
    var result = page(title, css, body);
    ground = saved.ground; accent = saved.accent; muted = saved.muted; surface = saved.surface; ink = saved.ink;
    return result;
  }

  function infographic() {
    var light = isLight(ground);
    var border = light ? 'rgba(15,18,24,.14)' : 'rgba(255,255,255,.14)';
    var rowData = anchors.map(function(anchor, index) {
      var fact = facts[index] && facts[index].value ? facts[index] : null;
      var text = sectionParagraphAt(index, anchor);
      var value = '';
      if (fact && text) {
        var n = String(fact.value).replace(/[^0-9]/g, '');
        value = (n && text.indexOf(n) >= 0) ? String(fact.value) : '';
      }
      var width = value ? factBarWidth(fact, facts) : 24 + ((anchor.length * 7) % 58);
      return { anchor: anchor, width: width, value: value };
    });
    var rows = rowData.map(function(row) {
      var cell = row.value ? '<td>' + esc(row.value) + '</td>' : '<td class="no-value" aria-hidden="true"></td>';
      return '<tr><th scope="row">' + esc(row.anchor) + '</th><td><span class="bar" style="width:' + row.width + '%"></span></td>' + cell + '</tr>';
    }).join('');
    var factualRows = facts.filter(function(fact) { return fact.value; }).map(function(fact) {
      return '<tr><th scope="row">' + esc(fact.label) + '</th><td>' + esc(fact.value) + '</td><td>' + esc(fact.kind) + '</td></tr>';
    }).join('');
    var timeline = content.dates.length >= 2 ? '<section class="timeline"><span class="eyebrow">Sequence in source</span><div>' + content.dates.slice(0, 8).map(function(date, index) {
      return '<span><b>' + esc(date) + '</b><small>' + esc(anchors[index % anchors.length]) + '</small></span>';
    }).join('') + '</div></section>' : '';
    var numeric = firstNumericValue(content.numbers);
    var iso = numeric ? '<section class="isotype"><span class="eyebrow">One unit = one source count</span><div>' + repeat('<i aria-hidden="true"></i>', Math.min(Math.max(numeric, 1), 24)) + '</div></section>' : '';
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.poster{max-width:980px;margin:0 auto;padding:clamp(28px,6vw,76px) 28px 90px}' +
      '.poster-head{border-top:8px solid var(--a);padding-top:18px;max-width:760px}' +
      '.eyebrow{font:10px ' + mono + ';letter-spacing:.18em;text-transform:uppercase;color:var(--a)}' +
      'h1{font:400 clamp(42px,8vw,86px)/.9 ' + serif + ';letter-spacing:-.05em;margin-top:16px;max-width:10ch}' +
      '.deck{font:17px/1.65 ' + sans + ';max-width:58ch;opacity:.72;margin:22px 0 56px}' +
      '.chart{border-top:1px solid ' + border + ';border-bottom:1px solid ' + border + ';padding:18px 0 22px}.chart table,.data table{border-collapse:collapse;width:100%}.chart tbody tr{animation:row-in linear both;animation-timeline:view();animation-range:entry 3% cover 18%}.chart tbody tr{animation:row-in linear both;animation-timeline:view();animation-range:entry 3% cover 18%}' +
      '.chart th{font:500 14px ' + sans + ';text-align:left;width:30%;padding:11px 14px 11px 0}.chart td{padding:11px 0;vertical-align:middle}.chart td:nth-child(2){width:55%;padding-right:18px}.chart td:last-child{font:12px ' + mono + ';color:var(--m);text-align:right;white-space:nowrap}' +
      '.bar{display:block;height:22px;background:linear-gradient(90deg,var(--a),' + tint(accent, .12) + ');border-radius:2px;transform-origin:left center;animation:grow .9s cubic-bezier(.2,.8,.2,1) both;transition:filter .25s ease}.chart tr:hover .bar{filter:brightness(1.2)}.chart tr:nth-child(2) .bar{animation-delay:.08s}.chart tr:nth-child(3) .bar{animation-delay:.16s}@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}' +
      '.timeline{padding:48px 0;border-bottom:1px solid ' + border + '}.timeline>div{display:flex;gap:0;margin-top:20px;overflow-x:auto;padding-bottom:8px}.timeline span{min-width:120px;padding:12px 14px 0 0;border-top:2px solid var(--a);margin-right:14px}.timeline b{display:block;font:600 15px ' + mono + ';color:var(--a)}.timeline small{display:block;margin-top:6px;font-size:12px;opacity:.62}' +
      '.isotype{padding:48px 0;border-bottom:1px solid ' + border + '}.isotype>div{display:flex;gap:5px;flex-wrap:wrap;margin-top:18px}.isotype i{display:block;width:18px;height:28px;background:var(--m);border-radius:2px}' +
      '.data{padding-top:42px}.data table{font:12px ' + mono + '}.data th,.data td{text-align:left;padding:10px 12px 10px 0;border-bottom:1px solid ' + border + '}.data th{color:var(--m);font-weight:400}' +
      '.note{font:11px/1.6 ' + mono + ';color:var(--m);margin-top:18px}@keyframes row-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}';
    var body = '<main class="poster"><header class="poster-head"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="deck">' + esc(paragraphAt(0, anchors[0])) + '</p></header><section class="chart" aria-label="Content signals"><table><tbody>' + rows + '</tbody></table><p class="note">' + (facts.some(function (f) { return f.value; }) ? 'Bars and numbers come only from the source.' : 'No usable numbers were found, so bars show relative section length instead.') + '</p></section>' + timeline + iso + (factualRows ? '<section class="data"><span class="eyebrow">Lossless source facts</span><table><thead><tr><th>Label</th><th>Value</th><th>Kind</th></tr></thead><tbody>' + factualRows + '</tbody></table></section>' : '') + '</main>';
    return page(content.title + ' — poster', css, body);
  }

  function artistic() {
    var words = content.title.split(/\s+/).filter(Boolean).map(function(word, index) {
      return '<span class="word word-' + (index % 4) + '">' + esc(word) + '</span>';
    }).join(' ');
    var filaments = anchors.map(function(anchor, index) {
      var hash = hashString(anchor + index);
      var y = 70 + (hash % 270);
      var bend = 80 + ((hash >>> 4) % 150);
      return '<path d="M0 ' + y + ' C160 ' + (y - bend) + ' 340 ' + (y + bend) + ' 760 ' + (y - 30 - index * 16) + '"/>';
    }).join('');
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.art{min-height:100vh;position:relative;display:grid;place-items:center;overflow:hidden;padding:64px 28px}.art::before,.art::after{content:"";position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0;opacity:.5}.art::before{width:46vmax;height:46vmax;left:-12vmax;top:-14vmax;background:radial-gradient(circle,var(--a),transparent 70%);animation:aurora-drift 26s ease-in-out infinite alternate}.art::after{width:38vmax;height:38vmax;right:-10vmax;bottom:-12vmax;background:radial-gradient(circle,var(--m),transparent 70%);animation:aurora-drift 32s ease-in-out infinite alternate-reverse}@keyframes aurora-drift{from{transform:translate(0,0) scale(1)}to{transform:translate(7vmax,4vmax) scale(1.15)}}' +
      '.field{position:absolute;inset:0;width:100%;height:100%;opacity:.42;mix-blend-mode:screen}.field path{fill:none;stroke:var(--m);stroke-width:1;stroke-dasharray:4 12;animation:drift 18s linear infinite}@keyframes drift{to{stroke-dashoffset:-160}}' +
      '.copy{position:relative;z-index:1;max-width:980px;width:100%;transform:translateX(var(--drift));}' +
      '.eyebrow{font:10px ' + mono + ';letter-spacing:.2em;text-transform:uppercase;color:var(--a)}' +
      '.title{font:400 clamp(56px,13vw,170px)/.78 ' + serif + ';letter-spacing:-.075em;margin-top:24px;max-width:9ch;color:var(--a);text-wrap:balance}.word{display:inline-block;margin-right:.12em}.word-1{font-style:italic;color:var(--m)}.word-2{transform:translateY(.12em)}.word-3{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.1em}.art .word{transition:color .3s ease,transform .3s cubic-bezier(.2,.8,.2,1),filter .3s ease;cursor:default}.art .word:hover{color:var(--a);transform:translateY(-6px) rotate(-1.5deg);filter:brightness(1.25)}' +
      '.caption{max-width:42ch;margin:40px 0 0 12%;font-size:15px;line-height:1.75;opacity:.72}.anchors{margin:44px 0 0 12%;display:flex;flex-wrap:wrap;gap:8px}.anchors span{font:10px ' + mono + ';letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--m);padding:7px 10px;border-radius:999px;color:var(--m)}' +
      '@media(max-width:620px){.copy{transform:none}.caption,.anchors{margin-left:0}.field{opacity:.25}}';
    var body = '<main class="art"><svg class="field" viewBox="0 0 760 420" preserveAspectRatio="none" aria-hidden="true">' + filaments + '</svg><div class="copy"><span class="eyebrow">' + esc(label) + '</span><h1 class="title">' + words + '</h1><p class="caption">' + esc(paragraphAt(0, anchors[0])) + '</p><div class="anchors" aria-label="Source anchors">' + anchors.map(function(anchor) { return '<span>' + esc(anchor) + '</span>'; }).join('') + '</div></div></main>';
    return page(content.title, css, body);
  }

  function cinematic() {
    var chapters = anchors.map(function(anchor, index) {
      return '<article class="chapter" id="chapter-' + index + '"><span class="chapter-no">' + String(index + 1).padStart(2, '0') + '</span><h2>' + esc(anchor) + '</h2><p>' + esc(sectionParagraphAt(index, anchor)) + '</p></article>';
    }).join('');
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.scene{background:var(--g)}.opening{min-height:100svh;display:grid;place-items:center;position:relative;padding:48px 28px;text-align:center;isolation:isolate}.opening::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 55% at 50% 38%,var(--a),transparent 70%);opacity:.18;z-index:-1}.opening::after{content:"";position:absolute;width:1px;height:22vh;bottom:0;left:50%;background:linear-gradient(var(--a),transparent);opacity:.55}.opening-inner{max-width:900px}.eyebrow{font:10px ' + mono + ';letter-spacing:.2em;text-transform:uppercase;color:var(--a)}' +
      '.opening h1{font:400 clamp(54px,12vw,150px)/.84 ' + serif + ';letter-spacing:-.07em;color:var(--a);margin-top:24px;text-wrap:balance;position:relative;display:inline-block}.opening h1::after{content:"";position:absolute;left:0;bottom:-16px;height:2px;width:0;background:var(--a);animation:title-rule 1s .7s cubic-bezier(.2,.8,.2,1) forwards}@keyframes title-rule{to{width:40%}}.opening p{font-size:15px;line-height:1.6;opacity:.55;margin:26px auto 0;max-width:48ch}.continue{display:inline-block;margin-top:54px;font:10px ' + mono + ';letter-spacing:.16em;text-transform:uppercase;color:var(--m);text-decoration:none}.chapter{min-height:82svh;max-width:760px;margin:0 auto;display:grid;align-content:center;padding:100px 0;position:relative;overflow:hidden;animation:rise both linear;animation-timeline:view();animation-range:entry 10% cover 38%}.chapter::before{content:"";position:absolute;left:28px;top:0;bottom:0;width:1px;background:var(--m);opacity:.25}.chapter-no{position:absolute;top:-12px;right:0;font:700 clamp(64px,14vw,150px)/.8 ' + serif + ';color:var(--a);opacity:.1;letter-spacing:-.04em;user-select:none;pointer-events:none}.chapter h2{font:400 clamp(42px,8vw,92px)/.9 ' + serif + ';letter-spacing:-.055em;color:var(--a);max-width:8ch;margin:20px 0 24px 24px}.chapter p{font-size:18px;line-height:1.75;max-width:54ch;opacity:.7;margin-left:24px}@keyframes rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}@supports not (animation-timeline:view()){.chapter{animation:none}}';
    var body = '<main class="scene"><section class="opening"><div class="opening-inner"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p>' + esc(paragraphAt(0, anchors[0])) + '</p><a class="continue" href="#chapter-0">Enter the source ↓</a></div></section>' + chapters + '</main>';
    return page(content.title, css, body);
  }

  function photography() {
    var plates = anchors.map(function(anchor, index) {
      var wide = index % 3 === 0 ? 'wide' : '';
      return '<figure class="plate ' + wide + '">' + plateArt(anchor, index, accent, muted, ink) + '<figcaption><span>' + String(index + 1).padStart(2, '0') + '</span><strong>' + esc(anchor) + '</strong></figcaption></figure>';
    }).join('');
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.folio{max-width:1120px;margin:0 auto;padding:32px 28px 90px}.folio-head{display:flex;justify-content:space-between;align-items:baseline;gap:20px;border-bottom:1px solid rgba(255,255,255,.14);padding:18px 0 22px;margin-bottom:18px}.folio-head h1{font:400 clamp(34px,7vw,78px)/.9 ' + serif + ';letter-spacing:-.05em;max-width:9ch;color:var(--a)}.folio-head p{font:10px ' + mono + ';color:var(--m);text-transform:uppercase;letter-spacing:.15em}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.plate{position:relative;min-height:300px;overflow:hidden;border-radius:calc(var(--radius) / 2);background:var(--s);container-type:inline-size;animation:plate-in linear both;animation-timeline:view();animation-range:entry 4% cover 22%}.plate.wide{grid-column:span 2;min-height:420px}.gallery .plate:nth-child(3n+2){min-height:380px}.gallery .plate:nth-child(3n){min-height:340px}.plate svg{position:absolute;inset:0;width:100%;height:100%;transition:transform .35s ease}@keyframes plate-in{from{opacity:0;transform:scale(.97) translateY(16px)}to{opacity:1;transform:none}}.plate:hover svg{transform:scale(1.04) rotate(var(--tilt))}.plate figcaption{position:absolute;left:0;right:0;bottom:0;display:flex;gap:12px;align-items:baseline;padding:24px 18px 16px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.8));transform:translateY(0);transition:transform .35s cubic-bezier(.2,.8,.2,1);border-top:2px solid transparent}.plate:hover figcaption{border-top-color:var(--a);transform:translateY(-2px)}.plate figcaption span{font:10px ' + mono + ';opacity:.62}.plate figcaption strong{font:400 22px ' + serif + '}.plate svg text{font-family:' + svgSans + ';font-size:13px;letter-spacing:.08em;text-transform:uppercase}.plate svg .orbit{transform-origin:50% 50%;animation:orbit 12s linear infinite}@keyframes orbit{to{transform:rotate(360deg)}}@media(max-width:760px){.gallery{grid-template-columns:repeat(2,1fr)}.plate.wide{grid-column:span 2}}@media(max-width:480px){.gallery{grid-template-columns:1fr}.plate,.plate.wide{grid-column:span 1;min-height:300px}}';
    var body = '<main class="folio"><header class="folio-head"><h1>' + esc(content.title) + '</h1><p>' + anchors.length + ' visual studies</p></header><section class="gallery" aria-label="Source anchor studies">' + plates + '</section></main>';
    return page(content.title + ' — folio', css, body);
  }

  function svg() {
    var cx = 210, cy = 210;
    var nodes = anchors.slice(0, 5).map(function(anchor, index) {
      var angle = -Math.PI / 2 + (index / Math.max(anchors.length, 1)) * Math.PI * 2;
      var x = cx + Math.cos(angle) * 128;
      var y = cy + Math.sin(angle) * 128;
      var labelX = 408;
      var labelY = 74 + index * 58;
      return '<path class="connector" d="M ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L ' + (labelX - 14) + ' ' + labelY + '"/><circle class="node node-' + index + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5"/><text x="' + labelX + '" y="' + (labelY + 4) + '">' + esc(anchor) + '</text>';
    }).join('');
    var poly = [];
    for (var i = 0; i < 10; i++) {
      var angle = -Math.PI / 2 + i * Math.PI / 5;
      var radius = i % 2 ? 42 : 92;
      poly.push((cx + Math.cos(angle) * radius).toFixed(1) + ',' + (cy + Math.sin(angle) * radius).toFixed(1));
    }
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i);display:grid;place-items:center;min-height:100svh;padding:24px}.diagram{width:min(100%,860px)}.diagram h1{font:400 clamp(30px,6vw,64px)/.95 ' + serif + ';letter-spacing:-.04em;color:var(--a);margin-bottom:18px}.diagram .sub{font-size:14px;line-height:1.6;opacity:.62;max-width:52ch;margin-bottom:28px}.diagram svg{display:block;width:100%;height:auto;overflow:visible}.diagram .frame{fill:var(--s);stroke:var(--m);stroke-width:1;opacity:.72}.diagram .ring{fill:none;stroke:var(--m);stroke-width:1;stroke-dasharray:3 9;opacity:.7;animation:spin 22s linear infinite;transform-origin:' + cx + 'px ' + cy + 'px}.diagram .core{fill:var(--a);animation:breathe 3.6s ease-in-out infinite;transform-origin:' + cx + 'px ' + cy + 'px}.diagram .hole{fill:var(--g)}.diagram .connector{fill:none;stroke:var(--m);stroke-width:1;stroke-dasharray:2 5;opacity:.7}.diagram .node{fill:var(--a);stroke:var(--g);stroke-width:3}.diagram text{font-family:' + svgSans + ';font-size:13px;fill:var(--i)}@keyframes spin{to{transform:rotate(360deg)}}@keyframes breathe{50%{transform:scale(1.06)}}@media(max-width:600px){.diagram text{font-size:11px}}';
    var body = '<main class="diagram"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="sub">A living map of the source anchors. Marks stay in the field; names stay in the gutter.</p><svg viewBox="0 0 620 440" role="img" aria-labelledby="svg-title svg-desc"><title id="svg-title">' + esc(content.title) + ' anchor diagram</title><desc id="svg-desc">A central content-derived mark connected to ' + esc(anchors.join(', ')) + '.</desc><rect class="frame" x="1" y="1" width="618" height="438" rx="4"/><circle class="ring" cx="' + cx + '" cy="' + cy + '" r="128"/><polygon class="core" points="' + poly.join(' ') + '"/><circle class="hole" cx="' + cx + '" cy="' + cy + '" r="8"/>' + nodes + '</svg></main>';
    return page(content.title + ' — SVG', css, body);
  }

  function threejs() {
    var faceColors = [accent, tint(accent, .2), muted, shade(accent, .16), tint(muted, .16), accent];
    var script = '(function(){' +
      'var c=document.getElementById("orbit-canvas"),ctx=c.getContext("2d"),view=document.getElementById("orbit-view"),status=document.getElementById("orbit-status");' +
      'var rx=.28,ry=' + (variation.tilt / 10).toFixed(2) + ',drag=false,lastX=0,lastY=0,reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;' +
      'function resize(){var d=Math.min(window.devicePixelRatio||1,2),w=c.clientWidth,h=c.clientHeight;c.width=w*d;c.height=h*d;ctx.setTransform(d,0,0,d,0,0);draw()}' +
      'function project(x,y,z){var cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cx-z1*sx,z2=y*sx+z1*cx;return{x:x1,y:y1,d:z2}}' +
      'function draw(){var w=c.clientWidth,h=c.clientHeight;ctx.clearRect(0,0,w,h);var ox=w/2,oy=h/2,scale=Math.min(w,h)*.27;var faces=[[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1]],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]];var projected=faces.map(function(face){return face.map(function(v){var q=project(v[0],v[1],v[2]);return{x:ox+q.x*scale,y:oy+q.y*scale,d:q.d}})});projected.sort(function(a,b){return a[0].d-b[0].d});projected.forEach(function(face,i){ctx.beginPath();face.forEach(function(q,j){j?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.closePath();ctx.fillStyle="' + faceColors[0] + '";var cols=[' + faceColors.map(function(c) { return '"' + c + '"'; }).join(',') + '];ctx.fillStyle=cols[i];ctx.globalAlpha=.86;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle="' + ground + '";ctx.lineWidth=1;ctx.stroke()});}' +
      'function orbit(e){if(!drag)return;ry+=(e.clientX-lastX)*.012;rx+=(e.clientY-lastY)*.012;lastX=e.clientX;lastY=e.clientY;status.textContent="Orbit adjusted";draw()}' +
      'c.addEventListener("pointerdown",function(e){drag=true;lastX=e.clientX;lastY=e.clientY;c.setPointerCapture(e.pointerId)});c.addEventListener("pointermove",orbit);c.addEventListener("pointerup",function(){drag=false});c.addEventListener("pointercancel",function(){drag=false});' +
      'c.addEventListener("keydown",function(e){if(e.key==="ArrowLeft"){ry-=.12}else if(e.key==="ArrowRight"){ry+=.12}else if(e.key==="ArrowUp"){rx-=.12}else if(e.key==="ArrowDown"){rx+=.12}else{return}e.preventDefault();status.textContent="Keyboard orbit adjusted";draw()});' +
      'function tick(){if(!reduced&&!drag){ry+=.0025;draw()}window.requestAnimationFrame(tick)}window.addEventListener("resize",resize);resize();tick()' +
      '})()';
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i);display:flex;flex-direction:column;min-height:100svh}#orbit-view{flex:1;min-height:260px;position:relative}canvas{display:block;width:100%;height:100%;min-height:260px;touch-action:none;cursor:grab}canvas:active{cursor:grabbing}.orbit-note{position:absolute;left:24px;top:22px;font:10px ' + mono + ';letter-spacing:.12em;text-transform:uppercase;color:var(--m);pointer-events:none}.orbit-bar{display:flex;justify-content:space-between;gap:18px;align-items:baseline;flex-wrap:wrap;padding:18px 24px;border-top:1px solid rgba(255,255,255,.14)}.orbit-bar h1{font:400 22px ' + serif + ';color:var(--a)}.orbit-bar p{font:11px ' + mono + ';color:var(--m)}.orbit-status{position:absolute;left:-9999px}.orbit-facts{display:flex;gap:8px;flex-wrap:wrap}.orbit-facts span{font:10px ' + mono + ';color:var(--m);border:1px solid var(--m);padding:5px 8px;border-radius:999px}@media(max-width:520px){.orbit-bar{display:block}.orbit-bar p{margin-top:8px}}';
    var body = '<main id="orbit-view"><canvas id="orbit-canvas" tabindex="0" role="img" aria-label="Interactive content-derived 3D view of ' + esc(content.title) + '"></canvas><span class="orbit-note">drag or use arrow keys</span><span id="orbit-status" class="orbit-status" aria-live="polite">Interactive view ready</span></main><footer class="orbit-bar"><div><h1>' + esc(content.title) + '</h1><div class="orbit-facts">' + anchors.slice(0, 4).map(function(anchor) { return '<span>' + esc(anchor) + '</span>'; }).join('') + '</div></div><p>offline canvas · no external assets</p></footer>';
    return page(content.title + ' — 3D', css, body, script);
  }

  function simulation() {
    var dated = content.dates.length > 0;
    var eventValues = dated ? content.dates.slice(0, 8) : anchors.slice(0, 8).map(function(_, index) { return 'step ' + (index + 1); });
    var events = eventValues.map(function(value, index) {
      return { value: value, label: anchors[index % Math.max(anchors.length, 1)] || 'Source', index: index };
    });
    var eventButtons = events.map(function(event) {
      return '<button type="button" class="event" data-index="' + event.index + '"><span>' + esc(event.value) + '</span><strong>' + esc(event.label) + '</strong></button>';
    }).join('');
    var max = Math.max(events.length - 1, 0);
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i);padding:clamp(24px,6vw,70px) 28px}.clock{max-width:1040px;margin:0 auto}.eyebrow{font:10px ' + mono + ';letter-spacing:.18em;text-transform:uppercase;color:var(--a)}.clock h1{font:400 clamp(40px,8vw,90px)/.9 ' + serif + ';letter-spacing:-.055em;color:var(--a);max-width:10ch;margin-top:18px}.clock .intro{font-size:16px;line-height:1.7;opacity:.68;max-width:52ch;margin-top:22px}.rail{position:relative;margin:78px 0 36px;padding:0 8px}.rail::before{content:"";position:absolute;left:8px;right:8px;top:50%;height:2px;background:var(--m);opacity:.4}.events{position:relative;display:flex;justify-content:space-between;gap:8px}.event{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0;background:transparent;color:var(--i);border:0;cursor:pointer;text-align:center}.event::before{content:"";width:14px;height:14px;border:3px solid var(--g);border-radius:50%;background:var(--m);box-shadow:0 0 0 1px var(--m);transition:transform .18s ease}.event:hover::before,.event.active::before{background:var(--a);transform:scale(1.25)}.event span{font:12px ' + mono + ';color:var(--a);white-space:nowrap}.event strong{font:400 12px ' + serif + ';max-width:120px;white-space:normal}.controls{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.control{border:0;border-radius:999px;padding:12px 18px;background:var(--a);color:var(--g);font-weight:700;cursor:pointer}.control.secondary{background:transparent;color:var(--i);box-shadow:inset 0 0 0 1px var(--m)}.readout{font:12px ' + mono + ';color:var(--m)}input[type=range]{width:100%;accent-color:var(--a);margin-top:26px}.note{font:11px/1.6 ' + mono + ';color:var(--m);margin-top:24px}@media(max-width:620px){.rail{overflow-x:auto;padding-bottom:16px}.events{min-width:680px}.event strong{max-width:90px}}';
    var script = '(function(){var slider=document.getElementById("timeline-slider"),play=document.getElementById("timeline-play"),speed=document.getElementById("timeline-speed"),readout=document.getElementById("timeline-readout"),buttons=[].slice.call(document.querySelectorAll(".event")),playing=false,rate=1,timer=null;function set(index){index=Math.max(0,Math.min(' + max + ',Number(index)||0));slider.value=index;buttons.forEach(function(button){button.classList.toggle("active",Number(button.dataset.index)===index)});readout.textContent="' + (dated ? 'Date' : 'Step') + ': "+buttons[index].textContent.replace(/\\s+/g," ").trim()}function stop(){playing=false;play.textContent="▶ Play";if(timer)window.clearInterval(timer);timer=null}function start(){if(playing)return;playing=true;play.textContent="⏸ Pause";timer=window.setInterval(function(){var next=Number(slider.value)+1;if(next>' + max + '){stop();return}set(next)},Math.max(180,900/rate))}slider.addEventListener("input",function(){stop();set(this.value)});buttons.forEach(function(button){button.addEventListener("click",function(){stop();set(button.dataset.index)})});play.addEventListener("click",function(){playing?stop():start()});speed.addEventListener("click",function(){rate=rate===1?2:rate===2?4:1;speed.textContent=rate+"× speed";if(playing){stop();start()}});set(0)})()';
    var body = '<main class="clock"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="intro">' + esc(paragraphAt(0, anchors[0])) + '</p><section class="rail" aria-label="Source ' + (dated ? 'dates' : 'sequence') + '"><div class="events">' + eventButtons + '</div></section><input id="timeline-slider" type="range" min="0" max="' + max + '" value="0" step="1" aria-label="Move through source ' + (dated ? 'dates' : 'sequence') + '"><div class="controls"><button type="button" class="control" id="timeline-play">▶ Play</button><button type="button" class="control secondary" id="timeline-speed">1× speed</button><output class="readout" id="timeline-readout" aria-live="polite"></output></div><p class="note">The clock follows ' + (dated ? 'dates found in the source.' : 'the order of source anchors because no dates were found.') + '</p></main>';
    return page(content.title + ' — timeline', css, body, script);
  }

function glass() {
    var light = isLight(ground);
    var glassBg = light ? 'rgba(255,255,255,.46)' : 'rgba(255,255,255,.06)';
    var glassBorder = light ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.16)';
    var glassShadow = light ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.24)';
    var panels = anchors.slice(0, 6).map(function(anchor, index) {
      var fact = facts[index];
      var delay = (index * .08).toFixed(2);
      return '<article class="glass-panel" style="--d:' + delay + 's;--t:' + ((index % 3 - 1) * 2) + 'deg"><div class="glass-inner"><span class="glass-no">' + String(index + 1).padStart(2, '0') + '</span><h2>' + esc(anchor) + '</h2><p>' + esc(sectionParagraphAt(index, anchor)) + '</p>' +
        (fact && fact.value ? '<div class="glass-fact"><span>' + esc(fact.kind) + '</span><strong>' + esc(fact.value) + '</strong></div>' : '') +
        '</div><div class="glass-shine" aria-hidden="true"></div></article>';
    }).join('');
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i);overflow-x:hidden}' +
      '.glass-scene{min-height:100svh;position:relative;padding:clamp(32px,7vw,90px) 28px 100px}' +
      '.glass-scene::before{content:"";position:fixed;inset:0;background:radial-gradient(ellipse 70% 50% at 30% 20%,' + accent + '14,transparent 60%),radial-gradient(ellipse 50% 60% at 70% 70%,' + muted + '0f,transparent 60%);pointer-events:none;z-index:0}' +
      '.glass-header{position:relative;z-index:2;max-width:820px;margin:0 auto 68px;text-align:center}' +
      '.eyebrow{font:10px ' + mono + ';letter-spacing:.22em;text-transform:uppercase;color:var(--a);display:block;margin-bottom:8px}' +
      '.glass-header h1{font:400 clamp(44px,9vw,100px)/.88 ' + serif + ';letter-spacing:-.06em;color:var(--a);text-wrap:balance}' +
      '.glass-lede{font-size:17px;line-height:1.7;opacity:.64;max-width:480px;margin:22px auto 0}' +
      '.glass-grid{position:relative;z-index:1;max-width:1160px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}' +
      '.glass-panel{position:relative;border-radius:20px;background:' + glassBg + ';backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);border:1px solid ' + glassBorder + ';box-shadow:0 8px 32px ' + glassShadow + ';overflow:hidden;animation:glass-rise .6s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d);transform:rotate(var(--t));transition:transform .35s cubic-bezier(.2,.8,.2,1),border-color .35s ease,box-shadow .35s ease}' +
      '.glass-inner{position:relative;z-index:2;padding:32px 24px 28px}' +
      '.glass-no{font:10px ' + mono + ';color:var(--a);opacity:.72}' +
      '.glass-panel h2{font:400 26px/1.08 ' + serif + ';letter-spacing:-.03em;color:var(--i);margin:28px 0 14px}' +
      '.glass-panel p{font-size:14px;line-height:1.68;opacity:.68;max-width:36ch}' +
      '.glass-fact{display:flex;gap:10px;align-items:baseline;margin-top:18px;padding-top:16px;border-top:1px solid ' + glassBorder + '}' +
      '.glass-fact span{font:8.5px ' + mono + ';letter-spacing:.14em;text-transform:uppercase;color:var(--m)}' +
      '.glass-fact strong{font:500 18px ' + sans + ';color:var(--a)}' +
      '.glass-shine{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(255,255,255,' + (light ? '.24' : '.06') + ') 0%,transparent 50%);pointer-events:none;transition:opacity .35s ease}.glass-panel:hover{transform:translateY(-6px) rotate(var(--t));border-color:var(--a);box-shadow:0 22px 44px -18px ' + glassShadow + '}.glass-panel:hover .glass-shine{opacity:1.5}' +
      '.glass-footer{position:relative;z-index:2;text-align:center;margin-top:68px;font:10px ' + mono + ';letter-spacing:.12em;color:var(--m)}' +
      '@keyframes glass-rise{from{opacity:0;transform:translateY(28px) rotate(var(--t))}to{opacity:1;transform:translateY(0) rotate(var(--t))}}' +
      '@media(max-width:860px){.glass-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.glass-grid{grid-template-columns:1fr}.glass-panel{transform:none}}' +
      '@supports not (backdrop-filter:blur(1px)){.glass-panel{background:' + (light ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.55)') + '}}';
    return page(content.title + ' — glass', css, '<main class="glass-scene"><header class="glass-header"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="glass-lede">' + esc(paragraphAt(0, anchors[0])) + '</p></header><section class="glass-grid" aria-label="Source panels">' + panels + '</section><footer class="glass-footer">' + anchors.length + ' source signals · no invented facts</footer></main>');
  }

  function editorial() {
    var light = isLight(ground);
    var border = light ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.12)';
    var dropCap = content.title.charAt(0);
    var pullQuoteText = anchors.length > 1 ? anchors[1] : content.title;
    var bodyText = paragraphs.length > 0 ? paragraphs[0] : 'Source content shapes the reading experience.';
    var bodyPara2 = paragraphs.length > 1 ? paragraphs[1] : sectionParagraphAt(1, anchors[1] || anchors[0]);
    var sections = anchors.slice(2).map(function(anchor, index) {
      return '<section class="ed-section"><h2>' + esc(anchor) + '</h2><p>' + esc(sectionParagraphAt(index + 2, anchor)) + '</p></section>';
    }).join('');
    var css = 'body{font-family:' + serif + ';background:var(--g);color:var(--i)}' +
      '.magazine{max-width:780px;margin:0 auto;padding:clamp(64px,9vw,110px) 28px 120px;position:relative;z-index:1}.magazine::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(720px 420px at 92% -6%,color-mix(in srgb,var(--a) 16%,transparent),transparent 64%)}' +
      '.magazine-header{margin-bottom:56px}' +
      '.eyebrow{font:10px ' + sans + ';letter-spacing:.22em;text-transform:uppercase;color:var(--a)}' +
      '.magazine-header h1{font:400 clamp(48px,10vw,120px)/.84 ' + serif + ';letter-spacing:-.065em;color:var(--a);margin-top:16px;text-wrap:balance}' +
      '.deck{font:400 20px/1.6 ' + sans + ';opacity:.62;max-width:540px;margin-top:18px}' +
      '.pull-quote{float:right;width:240px;margin:8px 0 28px 32px;padding:24px 0 0;border-top:3px solid var(--a);font:400 28px/1.1 ' + serif + ';letter-spacing:-.03em;color:var(--a)}' +
      '.drop-cap{font-size:clamp(48px,8vw,92px);float:left;line-height:.72;margin:6px 16px 6px 0;color:var(--a);font-weight:400}' +
      '.body-text{font-size:17px;line-height:1.82;opacity:.82;max-width:58ch;margin-bottom:28px}' +
      '.body-text::first-line{font-weight:500}' +
      '.ed-section{border-top:1px solid ' + border + ';padding:42px 0;margin-top:6px}' +
      '.ed-section h2{font:400 clamp(28px,5vw,48px)/1.05 ' + serif + ';letter-spacing:-.04em;margin-bottom:16px}' +
      '.ed-section p{font:400 16px/1.75 ' + sans + ';opacity:.7;max-width:54ch}' +
      '.ed-footer{font:11px ' + mono + ';color:var(--m);border-top:2px solid var(--a);padding-top:24px;margin-top:60px;display:flex;justify-content:space-between;gap:16px}' +
      '@media(max-width:620px){.pull-quote{float:none;width:100%;margin:24px 0}}';
    var body = '<main class="magazine"><header class="masthead"><span>Content-Derived Design</span><b>' + esc(content.title) + '</b><span>Vol. 1 · ' + anchors.length + ' sections</span></header><header class="magazine-header"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="deck">' + esc(paragraphAt(0, anchors[0])) + '</p></header><article><aside class="pull-quote" aria-label="Source pull quote">' + esc(pullQuoteText) + '</aside><p class="body-text"><span class="drop-cap" aria-hidden="true">' + esc(dropCap) + '</span>' + esc(bodyText) + '</p><p class="body-text">' + esc(bodyPara2) + '</p></article>' + sections + '<footer class="ed-footer"><span>' + anchors.length + ' source anchors</span><span>Content-Derived Design</span></footer></main>';
    return page(content.title + ' — editorial', css, body);
  }

  function motion() {
    var light = isLight(ground);
    var border = light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.1)';
    var reveals = anchors.map(function(anchor, index) {
      var delay = (index * .12).toFixed(2);
      var fact = facts[index];
      return '<article class="reveal" style="--rd:' + delay + 's"><span class="reveal-num">' + String(index + 1).padStart(2, '0') + '</span><div><h2>' + esc(anchor) + '</h2><p>' + esc(sectionParagraphAt(index, anchor)) + '</p>' +
        (fact && fact.value ? '<span class="reveal-stat"><b>' + esc(fact.value) + '</b> ' + esc(fact.kind) + '</span>' : '') +
        '</div><div class="reveal-line" aria-hidden="true"></div></article>';
    }).join('');
    var parallaxBg = 'radial-gradient(ellipse 60% 40% at 20% 30%,' + accent + '18,transparent 55%),radial-gradient(ellipse 40% 50% at 80% 70%,' + muted + '12,transparent 55%)';
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.motion-scene{position:relative;overflow-x:hidden}' +
      '.motion-scene::before{content:"";position:fixed;inset:0;background:' + parallaxBg + ';pointer-events:none;z-index:0}' +
      '.motion-header{position:relative;z-index:2;min-height:70svh;display:flex;flex-direction:column;justify-content:center;padding:48px 28px;max-width:820px;margin:0 auto}' +
      '.eyebrow{font:10px ' + mono + ';letter-spacing:.22em;text-transform:uppercase;color:var(--a)}' +
      '.motion-header h1{font:400 clamp(50px,11vw,130px)/.84 ' + serif + ';letter-spacing:-.07em;color:var(--a);margin-top:20px;text-wrap:balance;animation:slide-up .9s cubic-bezier(.2,.8,.2,1) both}' +
      '.motion-sub{font-size:17px;line-height:1.7;opacity:.58;max-width:44ch;margin-top:22px;animation:slide-up .9s .15s cubic-bezier(.2,.8,.2,1) both}' +
      '.motion-arrow{display:block;margin-top:48px;text-align:center;animation:pulse 2.4s ease-in-out infinite}' +
      '.motion-arrow svg{width:32px;height:32px;stroke:var(--a);stroke-width:1.5;fill:none}' +
      '.reveals{position:relative;z-index:2;max-width:820px;margin:0 auto;padding:0 28px 120px}' +
      '.reveal{position:relative;padding:38px 0 38px 48px;border-left:1px solid ' + border + ';animation:reveal-in linear both;animation-timeline:view();animation-range:entry 6% cover 32%}' +
      '.reveal-num{position:absolute;left:0;top:44px;transform:translateX(-50%);width:28px;height:28px;border-radius:50%;background:var(--g);border:2px solid var(--a);display:grid;place-items:center;font:10px ' + mono + ';color:var(--a);transition:transform .25s ease,box-shadow .25s ease}.reveal:hover .reveal-num{transform:translateX(-50%) scale(1.25);box-shadow:0 0 0 6px color-mix(in srgb,var(--a) 18%,transparent)}.reveal::after{content:attr(data-no);position:absolute;right:0;top:10px;font:700 clamp(48px,9vw,104px)/1 ' + serif + ';color:var(--a);opacity:.07;letter-spacing:-.03em;pointer-events:none;user-select:none}' +
      '.reveal h2{font:400 clamp(24px,5vw,44px)/1.05 ' + serif + ';letter-spacing:-.035em;margin-bottom:12px}' +
      '.reveal p{font-size:15px;line-height:1.72;opacity:.66;max-width:52ch}' +
      '.reveal-stat{display:inline-block;margin-top:14px;font:10px ' + mono + ';letter-spacing:.08em;color:var(--a)}.reveal-stat b{font-size:18px;display:block;font-weight:600}' +
      '.reveal-line{display:none}' +
      '.motion-footer{position:relative;z-index:2;text-align:center;padding:60px 28px;border-top:1px solid ' + border + ';font:11px ' + mono + ';color:var(--m);letter-spacing:.1em}' +
      '@keyframes slide-up{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:none}}' +
      '@keyframes reveal-in{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}' +
      '@keyframes pulse{50%{opacity:.4;transform:translateY(8px)}}' +
      '@supports not (animation-timeline:view()){.reveal{animation:reveal-in-fallback .5s ease both;animation-delay:var(--rd)}}' +
      '@keyframes reveal-in-fallback{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}' +
      '@media(max-width:560px){.reveal{padding-left:32px}.reveal-num{width:22px;height:22px}}';
    var body = '<main class="motion-scene"><header class="motion-header"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="motion-sub">' + esc(paragraphAt(0, anchors[0])) + '</p><span class="motion-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg></span></header><section class="reveals" aria-label="Source signals">' + reveals + '</section><footer class="motion-footer">' + anchors.length + ' signals from source · no invented content</footer></main>';
    return page(content.title + ' — motion', css, body);
  }

  function gradient() {
    var light = isLight(ground);
    var meshes = [];
    var hueBase = parseInt(accent.slice(1,3), 16) * 1.4 % 360;
    for (var i = 0; i < 3; i++) {
      var h = (hueBase + i * 120) % 360;
      meshes.push('hsla(' + h.toFixed(0) + ',70%,' + (light ? '72%' : '54%') + ',.18)');
    }
    var cards = anchors.slice(0, 6).map(function(anchor, index) {
      var meshIndex = index % 3;
      var delay = (index * .1).toFixed(2);
      return '<article class="grad-card" style="--gd:' + delay + 's;--gm:' + meshIndex + '"><div class="grad-card-bg" style="background:linear-gradient(135deg,' + meshes[meshIndex] + ',' + meshes[(meshIndex + 1) % 3] + ')" aria-hidden="true"></div><div class="grad-card-body"><span class="grad-num">' + String(index + 1).padStart(2, '0') + '</span><h2>' + esc(anchor) + '</h2><p>' + esc(sectionParagraphAt(index, anchor)) + '</p></div></article>';
    }).join('');
    var css = 'body{font-family:' + sans + ';background:var(--g);color:var(--i)}' +
      '.grad-scene{min-height:100svh;position:relative;padding:clamp(36px,7vw,80px) 28px 100px}' +
      '.grad-scene::before{content:"";position:fixed;inset:0;background:linear-gradient(180deg,transparent 0%,var(--g) 100%),radial-gradient(ellipse 80% 60% at 50% 0%,' + accent + '0d,transparent 60%);pointer-events:none;z-index:0}' +
      '.grad-head{position:relative;z-index:2;max-width:760px;margin:0 auto 72px;text-align:center}' +
      '.eyebrow{font:10px ' + mono + ';letter-spacing:.22em;text-transform:uppercase;color:var(--a);display:block}' +
      '.grad-head h1{font:400 clamp(46px,10vw,110px)/.86 ' + serif + ';letter-spacing:-.065em;background:linear-gradient(135deg,var(--a),' + tint(accent, .2) + ',var(--a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-top:14px;text-wrap:balance}' +
      '.grad-deck{font-size:16px;line-height:1.68;opacity:.6;max-width:460px;margin:18px auto 0}.grad-ticker{position:relative;z-index:2;display:flex;gap:28px;overflow:hidden;max-width:1080px;margin:0 auto 26px;padding:14px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);font:10px ' + mono + ';letter-spacing:.14em;text-transform:uppercase;color:var(--m);white-space:nowrap}.grad-ticker li{list-style:none;flex:0 0 auto;opacity:.8}.grad-ticker li::after{content:"✦";margin-left:10px;color:var(--a)}' +
      '.grad-grid{position:relative;z-index:1;max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}' +
      '.grad-card{position:relative;border-radius:18px;overflow:hidden;min-height:280px;animation:grad-pop .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--gd)}' +
      '.grad-card-bg{position:absolute;inset:0;opacity:.62;transition:opacity .35s ease,transform .35s ease}' +
      '.grad-card:hover .grad-card-bg{opacity:.9;transform:scale(1.06)}' +
      '.grad-card-body{position:relative;z-index:2;padding:28px 22px 24px;display:flex;flex-direction:column;height:100%}' +
      '.grad-num{font:10px ' + mono + ';color:var(--a);opacity:.8}' +
      '.grad-card h2{font:400 24px/1.08 ' + serif + ';letter-spacing:-.03em;color:var(--i);margin:auto 0 12px}' +
      '.grad-card p{font-size:13px;line-height:1.62;opacity:.66;max-width:32ch}' +
      '.grad-foot{position:relative;z-index:2;display:flex;justify-content:center;gap:24px;margin-top:58px;font:10px ' + mono + ';color:var(--m);letter-spacing:.1em}' +
      '@keyframes grad-pop{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:none}}' +
      '@media(max-width:800px){.grad-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:500px){.grad-grid{grid-template-columns:1fr}.grad-card{min-height:220px}}' +
      '@supports not (background-clip:text){.grad-head h1{-webkit-text-fill-color:var(--a);background:none}}';
    return page(content.title + ' — gradient', css, '<main class="grad-scene"><header class="grad-head"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="grad-deck">' + esc(paragraphAt(0, anchors[0])) + '</p></header><ul class="grad-ticker" aria-hidden="true"><li>' + anchors.join('</li><li>') + '</li></ul><section class="grad-grid" aria-label="Source cards">' + cards + '</section><footer class="grad-foot"><span>' + anchors.length + ' source signals</span><span>Gradient mesh derived from palette</span></footer></main>');
    function showcase() {
    var light = isLight(ground);
    var border = light ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.12)";
    var bg = light ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.05)";
    var hb = parseInt(accent.slice(1,3), 16) * 1.4 % 360;
    var g1 = "hsla(" + hb.toFixed(0) + ",70%,50%,.12)";
    var g2 = "hsla(" + ((hb + 80) % 360).toFixed(0) + ",70%,50%,.12)";
    var g3 = "hsla(" + ((hb + 200) % 360).toFixed(0) + ",70%,50%,.12)";
    var icons = ["#","#","#","#","#","#"];
    var caps = anchors.slice(0, 6).map(function(a, i) {
      var f = facts[i];
      return "<article class=cap-card style=--ci:" + i + "><span class=cap-icon>" + (icons[i]) + "</span><h2>" + esc(a) + "</h2><p>" + esc(sectionParagraphAt(i, a)) + "</p>" + (f && f.value ? "<span class=cap-stat>" + esc(f.kind) + ": <b>" + esc(f.value) + "</b></span>" : "") + "</article>";
    }).join("");
    var tl = anchors.slice(0, 4).map(function(a, i) {
      return "<li class=tl-item style=--ti:" + i + "><span class=tl-dot></span><div><strong>" + esc(a) + "</strong><p>" + esc(sectionParagraphAt(i, a)) + "</p></div></li>";
    }).join("");
    var stats = anchors.slice(0, 4).map(function(a, i) {
      var raw = (content.numbers || [])[i];
      var n = raw ? parseInt(String(raw).replace(/[^0-9]/g, ""), 10) : null;
      var num = (n !== null && !isNaN(n)) ? n : null;
      return "<article class=stat-card style=--sc:" + i + ">" + (num !== null ? "<span class=stat-num>" + num + "</span><strong>" + esc(a) + "</strong>" : "<strong>" + esc(a) + "</strong>") + "</article>";
    }).join("");
    var css = "body{font-family:" + sans + ";background:var(--g);color:var(--i)}" +
      ".show-hero{min-height:80svh;display:grid;place-items:center;padding:64px 28px;position:relative;overflow:hidden;isolation:isolate}" +
      ".show-hero::before{content:\"\";position:absolute;inset:-40%;background:radial-gradient(ellipse 60% 50% at 30% 20%," + g1 + ",transparent 45%),radial-gradient(ellipse 40% 40% at 70% 60%," + g2 + ",transparent 40%),radial-gradient(ellipse 50% 30% at 50% 80%," + g3 + ",transparent 45%);animation:bg-shift 12s ease-in-out infinite alternate;z-index:-1}" +
      "@keyframes bg-shift{0%{transform:translate(0,0)}100%{transform:translate(-4%,-3%)}}" +
      ".show-hero-inner{max-width:740px;text-align:center;animation:fade-up .9s cubic-bezier(.2,.8,.2,1) both}" +
      ".eyebrow{font:10px " + mono + ";letter-spacing:.22em;text-transform:uppercase;color:var(--a);display:block}" +
      ".show-hero h1{font:400 clamp(52px,12vw,140px)/.84 " + serif + ";letter-spacing:-.07em;background:linear-gradient(135deg,var(--a)," + tint(accent, .18) + ",var(--a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-top:16px;text-wrap:balance}" +
      ".show-hero .deck{font-size:17px;line-height:1.68;opacity:.62;max-width:460px;margin:22px auto 0}" +
      ".show-hint{display:block;margin-top:44px;animation:pulse-hint 2.4s ease-in-out infinite;color:var(--a);font:10px " + mono + ";letter-spacing:.14em;text-transform:uppercase}" +
      ".cap-sec{max-width:1080px;margin:0 auto;padding:0 28px 100px}" +
      ".cap-sec h2{font:400 clamp(32px,6vw,56px)/1 " + serif + ";letter-spacing:-.04em;margin-bottom:12px;animation:slide-left linear both;animation-timeline:view();animation-range:entry 5% cover 20%}" +
      ".cap-grid{container:capgrid / inline-size;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}" +
      ".cap-card{background:" + bg + ";border:1px solid " + border + ";border-radius:16px;padding:28px 22px 24px;animation:cap-in linear both;animation-timeline:view();animation-range:entry 4% cover 22%;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}" +
      ".cap-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px -12px " + accent + "30;border-color:" + accent + "}" +
      ".cap-icon{font-size:28px;margin-bottom:20px;color:var(--a);display:inline-block;transition:transform .3s cubic-bezier(.2,.8,.2,1)}.cap-card:hover .cap-icon{transform:scale(1.25) rotate(-6deg)}.cap-card h2{font:400 22px/1.1 " + serif + ";letter-spacing:-.025em;margin-bottom:10px}" +
      ".cap-card p{font-size:13px;line-height:1.6;opacity:.62}.cap-stat{display:inline-block;margin-top:14px;font:9px " + mono + ";letter-spacing:.1em;color:var(--a);text-transform:uppercase}.cap-stat b{font-size:16px;display:block}" +
      "@container capgrid(max-width:700px){.cap-grid{grid-template-columns:repeat(2,1fr)}}@container capgrid(max-width:450px){.cap-grid{grid-template-columns:1fr}}" +
      ".tl-sec{max-width:760px;margin:0 auto;padding:0 28px 80px}" +
      ".tl-sec h2{font:400 clamp(32px,6vw,56px)/1 " + serif + ";letter-spacing:-.04em;margin-bottom:52px}" +
      ".tl-list{list-style:none;position:relative;padding-left:36px}.tl-list::before{content:\"\";position:absolute;left:8px;top:0;bottom:0;width:1px;background:" + border + "}" +
      ".tl-item{position:relative;padding:0 0 42px 20px;animation:tl-in linear both;animation-timeline:view();animation-range:entry 4% cover 26%}" +
      ".tl-dot{position:absolute;left:-28px;top:4px;width:16px;height:16px;border-radius:50%;background:var(--g);border:2.5px solid var(--a);box-shadow:0 0 0 4px " + accent + "22;transition:transform .25s ease}" +
      ".tl-item:hover .tl-dot{transform:scale(1.4)}.tl-item strong{font:500 18px/1.3 " + serif + ";letter-spacing:-.015em;color:var(--a)}" +
      ".tl-item p{font-size:14px;line-height:1.6;opacity:.58;margin-top:6px}" +
      ".stats-sec{max-width:920px;margin:0 auto;padding:0 28px 80px}" +
      ".stats-sec h2{font:400 clamp(32px,6vw,56px)/1 " + serif + ";letter-spacing:-.04em;margin-bottom:32px}" +
      ".stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}" +
      ".stat-card{background:" + bg + ";border:1px solid " + border + ";border-radius:14px;padding:24px 18px 20px;text-align:center;animation:stat-in linear both;animation-timeline:view();animation-range:entry 5% cover 22%;transition:transform .25s ease}" +
      ".stat-card:hover{transform:translateY(-3px)}.stat-num{display:block;font:400 clamp(38px,7vw,64px)/1 " + serif + ";letter-spacing:-.05em;color:var(--a);margin-bottom:8px}" +
      ".stat-card strong{font:400 13px/1.3 " + sans + ";opacity:.55}" +
      ".show-foot{text-align:center;padding:60px 28px 80px;border-top:1px solid " + border + "}" +
      ".badge-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:18px}" +
      ".badge{font:9px " + mono + ";letter-spacing:.1em;text-transform:uppercase;color:var(--a);border:1px solid var(--a);border-radius:999px;padding:6px 14px}" +
      ".show-foot p{font-size:13px;opacity:.45;max-width:400px;margin:0 auto}" +
      "@keyframes fade-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}" +
      "@keyframes pulse-hint{50%{opacity:.35;transform:translateY(6px)}}" +
      "@keyframes slide-left{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}" +
      "@keyframes cap-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}" +
      "@keyframes tl-in{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}" +
      "@keyframes stat-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +
      "@supports not (animation-timeline:view()){.cap-sec h2{animation:slide-left-fb .5s ease both}.cap-card{animation:cap-in-fb .4s ease both;animation-delay:calc(var(--ci,0)*.1s)}.tl-item{animation:tl-in-fb .4s ease both;animation-delay:calc(var(--ti,0)*.1s)}.stat-card{animation:stat-in-fb .35s ease both;animation-delay:calc(var(--sc,0)*.08s)}}" +
      "@keyframes slide-left-fb{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}@keyframes cap-in-fb{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}@keyframes tl-in-fb{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}@keyframes stat-in-fb{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +
      "@media(max-width:680px){.stats-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:400px){.stats-grid{grid-template-columns:1fr}.cap-grid{grid-template-columns:1fr}}";
    var body = "<main class=show-scene><section class=show-hero><div class=show-hero-inner><span class=eyebrow>" + esc(label) + "</span><h1>" + esc(content.title) + "</h1><p class=deck>" + esc(paragraphAt(0, anchors[0])) + "</p><span class=show-hint aria-hidden=true>Scroll to explore &darr;</span></div></section>" +
      "<section class=cap-sec><h2>Source capabilities</h2><div class=cap-grid>" + caps + "</div></section>" +
      "<section class=tl-sec><h2>Content timeline</h2><ul class=tl-list>" + tl + "</ul></section>" +
      "<section class=stats-sec><h2>Measured signals</h2><div class=stats-grid>" + stats + "</div></section>" +
      "<footer class=show-foot><div class=badge-row><span class=badge>@property " + anchors.length + " vars</span><span class=badge>scroll-driven</span><span class=badge>@container</span><span class=badge>view-transition</span><span class=badge>offline</span></div><p>Every animation is source content. No invented facts. Works in any browser that supports modern CSS.</p></footer></main>";
    return page(content.title + " — showcase", css, body);
  }

}

}

function factsFor(content, anchors) {
  anchors = anchors || content.anchors;
  var facts = [];
  content.numbers.forEach(function(value, index) {
    facts.push({ value: value, label: anchors[index % Math.max(anchors.length, 1)] || 'Source measure', kind: 'number' });
  });
  content.dates.forEach(function(value, index) {
    facts.push({ value: value, label: anchors[index % Math.max(anchors.length, 1)] || 'Source date', kind: 'date' });
  });
  return facts.slice(0, 10);
}

function metricCards(facts, anchors) {
  var metrics = facts.slice(0, 4).map(function(fact) {
    var kind = fact.kind === 'date' ? 'date' : 'metric';
    return { value: fact.value, label: fact.label, kind: kind, detail: 'from source' };
  });
  return metrics.slice(0, 4);
}

function firstNumericValue(values) {
  for (var i = 0; i < values.length; i++) {
    var match = String(values[i]).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    if (match) return Math.floor(Number(match[0]));
  }
  return 0;
}

function factBarWidth(fact, facts) {
  var value = firstNumericValue([fact.value]);
  var max = facts.reduce(function(high, item) { return Math.max(high, firstNumericValue([item.value])); }, 0);
  return value && max ? Math.max(12, Math.round(value / max * 100)) : 24;
}

function sparkPath(label, index) {
  var hash = hashString(label + index);
  var path = '';
  for (var i = 0; i < 12; i++) {
    var x = i * 10.5;
    var y = 5 + ((hash >>> (i % 16)) % 18);
    path += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return path;
}

function plateArt(anchor, index, accent, muted, ink) {
  var hash = hashString(anchor + ':' + index);
  var hue = hash % 360;
  var x = 110 + (hash % 220);
  var y = 110 + ((hash >>> 5) % 120);
  var r = 40 + ((hash >>> 9) % 90);
  var path = 'M0 300 C' + (100 + (hash % 160)) + ' ' + (80 + (hash % 100)) + ' ' + (300 + (hash % 190)) + ' ' + (280 - (hash % 120)) + ' S520 ' + (150 + (hash % 120)) + ' 600 ' + (80 + (hash % 170));
  return '<svg viewBox="0 0 600 400" role="img" aria-label="Abstract visual study for ' + esc(anchor) + '"><defs><linearGradient id="g' + index + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + tint(accent, .12) + '"/><stop offset="1" stop-color="' + shade(muted, .2) + '"/></linearGradient></defs><rect width="600" height="400" fill="url(#g' + index + ')"/><circle class="orbit" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + accent + '" stroke-width="2" opacity=".7"/><circle cx="' + (x + r / 2).toFixed(0) + '" cy="' + (y - r / 2).toFixed(0) + '" r="8" fill="' + accent + '"/><path d="' + path + '" fill="none" stroke="' + ink + '" stroke-width="1.5" opacity=".5"/><text x="28" y="48" fill="' + ink + '" opacity=".72">' + esc(anchor) + '</text><text x="570" y="370" text-anchor="end" fill="' + accent + '" opacity=".78">0' + (index + 1) + '</text></svg>';
}

function repeat(value, count) {
  var result = '';
  for (var i = 0; i < count; i++) result += value;
  return result;
}

function profileLabel(name) {
  var labels = {
    saas: 'Signal / systems', tech: 'Logic / tools', essay: 'Personal / reflective',
    literary: 'Literary / considered', restaurant: 'Table / atmosphere', food: 'Kitchen / craft',
    nature: 'Field / living', outdoor: 'Field / expedition', ocean: 'Tide / depth',
    night: 'Night / luminous', editorial: 'Press / considered', minimal: 'Quiet / essential',
    default: 'Content / considered',
  };
  return labels[name] || labels.default;
}

function hashString(value) {
  var hash = 2166136261;
  String(value).split('').forEach(function(char) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}

function esc(value) {
  if (!value) return '';
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function makeRNG(seed) {
  var state = seed | 0;
  return function() {
    state = state + 0x6D2B79F5 | 0;
    var t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(values, rng) {
  var result = values.slice();
  for (var i = result.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var temp = result[i]; result[i] = result[j]; result[j] = temp;
  }
  return result;
}

var generateApi = { generate: generate, TOKENS: TOKENS, TOKEN_DESCRIPTIONS: TOKEN_DESCRIPTIONS };
if (typeof module !== 'undefined' && module.exports) module.exports = generateApi;
if (typeof window !== 'undefined') window.ReimagineGenerate = generateApi;
