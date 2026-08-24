/**
 * generate.js — Token-specific page generators.
 *
 * Each generator produces a complete, standalone HTML page with a
 * DISTINCT visual identity. No two tokens share the same layout
 * skeleton, typography scale, or motion vocabulary.
 *
 * Design principles:
 *   1. Editorial typography — display + body + meta scale, not flat
 *   2. Asymmetric layouts — grids are not all auto-fill cards
 *   3. Layered depth — tints/shades/blends, not just opacity
 *   4. Real motion on load — not just hover transitions
 *   5. No "generated" footers — clean, ship-ready output
 */

var { tint, shade, isLight, contrastRatio, ensureContrast } = require('./extract');

function generate(opts) {
  var content = opts.content;
  var token = opts.token || 'webpage';
  var seed = opts.seed;
  var brief = opts.brief;

  var p = content.palette;
  var ground = p.ground;
  var accent = ensureContrast(ground, p.accent, 3.0);
  var muted = p.muted;
  var surface = p.surface;
  var ink = p.ink;

  // Seeded PRNG (mulberry32) — deterministic with --seed, fresh without
  var rng = makeRNG(seed !== undefined ? seed : Math.floor(Math.random() * 0x7fffffff));
  var anchors = shuffle(content.anchors.slice(), rng);
  var paras = shuffle(content.paragraphs.slice(), rng);
  var items = shuffle(content.items.slice(), rng);
  var headings = content.headings.slice();
  var dates = content.dates.slice();
  var numbers = content.numbers.slice();
  var proper = content.properNouns.slice();

  // Shared CSS utilities — each generator adds its own token-specific styles
  var craftFloor = '::selection{background:' + accent + ';color:' + ground + '}' +
    ':focus-visible{outline:2px solid ' + accent + ';outline-offset:3px;border-radius:2px}' +
    '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}';

  // Font stacks
  var serif = '"Iowan Old Style","Hoefler Text",Palatino,Georgia,Cambria,serif';
  var sans = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var mono = 'ui-monospace,"SF Mono","Cascadia Code",Consolas,Menlo,monospace';

  switch (token) {
    case 'webpage': return webpage();
    case 'infographic': return infographic();
    case 'dashboard': return dashboard();
    case 'artistic': return artistic();
    case 'cinematic': return cinematic();
    case 'photography': return photography();
    case 'landing': return landing();
    case 'svg': return svg();
    case '3js': return threejs();
    case 'simulation': return simulation();
    default: return webpage();
  }

  // ══════════════════════════════════════════════════════════════
  // WEBPAGE — editorial magazine layout with asymmetric hero
  // ══════════════════════════════════════════════════════════════
  function webpage() {
    var groundIsLight = isLight(ground);
    var cardBg = groundIsLight ? shade(ground, 0.03) : tint(ground, 0.04);
    var borderCol = groundIsLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)';
    var heroAccent = groundIsLight ? shade(accent, 0.1) : accent;

    var sections = anchors.map(function(a, i) {
      var para = paras[i % paras.length] || content.paragraphs[0] || a + ' — content derived from the source.';
      var num = String(i + 1).padStart(2, '0');
      return '<article class="sec" style="border-top:1px solid ' + borderCol + '">' +
        '<span class="sec-num">' + num + '</span>' +
        '<div class="sec-body"><h2>' + esc(a) + '</h2><p>' + esc(para) + '</p></div>' +
        '</article>';
    }).join('\n');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + '</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html{background:var(--g);color:var(--i);font-family:' + sans + ';-webkit-font-smoothing:antialiased}' +
      'body{max-width:680px;margin:0 auto;padding:0 28px 96px}' +
      // Hero — editorial scale, oversized display
      '.hero{padding:120px 0 64px}' +
      '.kicker{font-family:' + mono + ';font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--m);margin-bottom:20px}' +
      '.hero h1{font-family:' + serif + ';font-weight:400;font-size:clamp(36px,7vw,64px);line-height:1.04;letter-spacing:-.025em;color:var(--a);max-width:14ch}' +
      '.hero .lede{font-size:18px;line-height:1.6;color:var(--i);opacity:.7;margin-top:24px;max-width:52ch}' +
      '.hero .meta{display:flex;gap:20px;flex-wrap:wrap;margin-top:32px;font-family:' + mono + ';font-size:11px;color:var(--m);letter-spacing:.05em}' +
      // Sections — editorial article style, not card grid
      '.sec{display:grid;grid-template-columns:48px 1fr;gap:0;padding:40px 0;content-visibility:auto}' +
      '.sec-num{font-family:' + mono + ';font-size:13px;color:var(--m);padding-top:4px}' +
      '.sec-body h2{font-family:' + serif + ';font-weight:400;font-size:24px;letter-spacing:-.01em;margin-bottom:12px;color:var(--i)}' +
      '.sec-body p{font-size:16px;line-height:1.7;opacity:.72}' +
      '.sec-body p::first-letter{font-family:' + serif + ';font-size:1.4em;font-weight:400;color:var(--a)}' +
      // Footer — clean, no "generated" labels
      'footer{margin-top:80px;padding-top:32px;border-top:1px solid ' + borderCol + ';font-family:' + mono + ';font-size:11px;color:var(--m)}' +
      craftFloor +
      '</style></head><body>' +
      '<section class="hero">' +
      '<p class="kicker">' + (brief || 'Content-Derived Design') + '</p>' +
      '<h1>' + esc(content.title) + '</h1>' +
      '<p class="lede">' + esc(paras[0] || content.paragraphs[0] || 'Content read, palette derived, design shipped.') + '</p>' +
      '<div class="meta">' +
        (dates.length ? '<span>' + esc(dates[0]) + '</span>' : '') +
        (content.emails.length ? '<span>' + esc(content.emails[0]) + '</span>' : '') +
        '<span>' + anchors.length + ' sections</span>' +
      '</div>' +
      '</section>' +
      sections +
      '<footer><span>' + esc(content.title) + '</span></footer>' +
      '</body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // INFOGRAPHIC — statistical poster, ISOTYPE, data table
  // ══════════════════════════════════════════════════════════════
  function infographic() {
    var groundIsLight = isLight(ground);
    var barColor = accent;
    var trackColor = groundIsLight ? shade(ground, 0.06) : tint(ground, 0.06);

    var dataRows = anchors.map(function(a, i) {
      var val = numbers[i] || dates[i] || String((i + 1) * (10 + i * 7));
      var barWidth = Math.min(100, 30 + (anchors.length - i) * (60 / anchors.length));
      return '<tr><td class="dl">' + esc(a) + '</td>' +
        '<td class="dc"><span class="bar" style="width:' + barWidth.toFixed(0) + '%;background:' + barColor + '"></span></td>' +
        '<td class="dv">' + esc(String(val)) + '</td></tr>';
    }).join('\n');

    var isoCount = Math.min(parseInt(numbers[0]) || 12, 40);
    var isoUnits = '';
    for (var k = 0; k < isoCount; k++) isoUnits += '<span class="iso"></span>';

    var timeline = dates.length >= 2 ? dates.slice(0, 8).map(function(d) {
      return '<div class="tl-node"><span class="tl-dot"></span><span class="tl-year">' + esc(d) + '</span></div>';
    }).join('') : '';

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + ' — poster</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html{background:var(--g);color:var(--i);font-family:' + serif + ';-webkit-font-smoothing:antialiased}' +
      'body{max-width:740px;margin:0 auto;padding:56px 28px 64px}' +
      '.poster-h1{font-size:clamp(30px,5.5vw,52px);font-weight:400;line-height:1.04;letter-spacing:-.02em;color:var(--a);margin-bottom:12px}' +
      '.deck{font-size:16px;line-height:1.6;opacity:.65;max-width:52ch;margin-bottom:48px}' +
      // Bar chart
      '.chart{margin-bottom:48px}' +
      '.chart table{width:100%;border-collapse:collapse}' +
      '.chart td{padding:8px 0;vertical-align:middle}' +
      '.chart .dl{font-size:14px;width:32%;font-family:' + sans + '}' +
      '.chart .dc{width:52%}' +
      '.chart .bar{display:block;height:20px;border-radius:1px;background:var(--a)}' +
      '.chart .dv{font-family:' + mono + ';font-size:13px;text-align:right;width:16%;opacity:.6}' +
      // ISOTYPE
      '.iso-section{margin-bottom:48px}' +
      '.iso-label{font-family:' + mono + ';font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.5;margin-bottom:12px}' +
      '.iso-row{display:flex;flex-wrap:wrap;gap:3px}' +
      '.iso{display:inline-block;width:14px;height:22px;background:var(--m);border-radius:1px}' +
      // Timeline
      '.tl{margin-bottom:48px}' +
      '.tl-label{font-family:' + mono + ';font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.5;margin-bottom:16px}' +
      '.tl-track{display:flex;align-items:center;gap:0;flex-wrap:wrap;position:relative;padding:20px 0}' +
      '.tl-track::before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:var(--m);opacity:.3}' +
      '.tl-node{flex:1;text-align:center;position:relative;min-width:60px}' +
      '.tl-dot{display:block;width:10px;height:10px;border-radius:50%;background:var(--a);margin:0 auto 8px;position:relative;z-index:1}' +
      '.tl-year{font-family:' + mono + ';font-size:12px;opacity:.7}' +
      // Data table
      '.dt{margin-top:40px;padding-top:24px;border-top:1px solid ' + (isLight(ground) ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.1)') + '}' +
      '.dt-label{font-family:' + mono + ';font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.5;margin-bottom:12px}' +
      '.dt table{width:100%;border-collapse:collapse;font-family:' + mono + ';font-size:12px}' +
      '.dt th{text-align:left;opacity:.4;font-weight:400;padding:6px 12px 6px 0;border-bottom:1px solid ' + (isLight(ground) ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)') + '}' +
      '.dt td{text-align:left;opacity:.7;padding:6px 12px 6px 0}' +
      craftFloor +
      '</style></head><body>' +
      '<h1 class="poster-h1">' + esc(content.title) + '</h1>' +
      '<p class="deck">' + esc(paras[0] || 'A statistical poster of facts from the source — common-scale encodings, no pies.') + '</p>' +
      '<div class="chart"><table>' + dataRows + '</table></div>' +
      (isoCount ? '<div class="iso-section"><p class="iso-label">ISOTYPE · 1 unit = 1 ' + esc(anchors[0] || 'item') + '</p><div class="iso-row">' + isoUnits + '</div></div>' : '') +
      (timeline ? '<div class="tl"><p class="tl-label">Timeline</p><div class="tl-track">' + timeline + '</div></div>' : '') +
      '<div class="dt"><p class="dt-label">Data table</p><table><thead><tr><th>Anchor</th><th>Value</th></tr></thead><tbody>' +
        anchors.map(function(a, i) { return '<tr><td>' + esc(a) + '</td><td>' + esc(String(dates[i] || numbers[i] || '—')) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '</body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // DASHBOARD — dark ops console with KPI cards + sparkline
  // ══════════════════════════════════════════════════════════════
  function dashboard() {
    var groundIsLight = isLight(ground);
    // Force dark ground for dashboard — it reads better
    var dGround = groundIsLight ? shade(ground, 0.75) : ground;
    var dInk = isLight(dGround) ? '#0a0a0a' : '#e6edf3';
    var dSurface = tint(dGround, 0.06);
    var dAccent = ensureContrast(dGround, accent, 3.0);
    var dMuted = ensureContrast(dGround, muted, 2.5);
    var borderCol = 'rgba(255,255,255,.08)';

    var kpis = anchors.slice(0, 4).map(function(a, i) {
      var val = numbers[i] || dates[i] || String(Math.floor(rng() * 90 + 10));
      var up = i % 2 === 0;
      var delta = Math.floor(rng() * 25 + 2);
      var sparkPath = '';
      var sx = 0, sy = 20;
      for (var s = 0; s < 12; s++) {
        sx = s * 8;
        sy = 10 + rng() * 20;
        sparkPath += (s === 0 ? 'M' : 'L') + sx + ' ' + sy.toFixed(1) + ' ';
      }
      return '<div class="kpi">' +
        '<span class="kpi-l">' + esc(a) + '</span>' +
        '<span class="kpi-v">' + esc(String(val)) + '</span>' +
        '<div class="kpi-row"><span class="kpi-d ' + (up ? 'up' : 'down') + '">' + (up ? '▲' : '▼') + ' ' + delta + '%</span>' +
        '<svg class="spark" viewBox="0 0 88 30" width="88" height="30"><path d="' + sparkPath + '" fill="none" stroke="' + (up ? '#3ae098' : '#e85a5a') + '" stroke-width="1.5"/></svg></div>' +
        '</div>';
    }).join('\n');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + '</title><style>' +
      ':root{--g:' + dGround + ';--a:' + dAccent + ';--m:' + dMuted + ';--s:' + dSurface + ';--i:' + dInk + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html{background:var(--g);color:var(--i);font-family:' + sans + ';-webkit-font-smoothing:antialiased}' +
      'body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 28px}' +
      '.dash{max-width:820px;width:100%}' +
      '.dash-h1{font-size:clamp(24px,4vw,36px);font-weight:600;letter-spacing:-.02em;margin-bottom:4px}' +
      '.dash-sub{font-family:' + mono + ';font-size:12px;color:var(--m);margin-bottom:36px}' +
      '.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}' +
      '.kpi{background:var(--s);border:1px solid ' + borderCol + ';border-radius:14px;padding:20px 22px;content-visibility:auto}' +
      '.kpi-l{display:block;font-family:' + mono + ';font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--m);margin-bottom:10px}' +
      '.kpi-v{display:block;font-size:30px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--a);letter-spacing:-.02em;margin-bottom:8px}' +
      '.kpi-row{display:flex;align-items:center;justify-content:space-between;gap:8px}' +
      '.kpi-d{font-family:' + mono + ';font-size:11px;font-variant-numeric:tabular-nums}' +
      '.kpi-d.up{color:#3ae098}.kpi-d.down{color:#e85a5a}' +
      '.spark{opacity:.8}' +
      craftFloor +
      '</style></head><body>' +
      '<div class="dash">' +
      '<h1 class="dash-h1">' + esc(content.title) + '</h1>' +
      '<p class="dash-sub">' + anchors.length + ' metrics · derived from source content</p>' +
      '<div class="kpis">' + kpis + '</div>' +
      '</div></body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // ARTISTIC — full-bleed canvas, oversized type, blend modes
  // ══════════════════════════════════════════════════════════════
  function artistic() {
    var words = content.title.split(' ');
    var displayWords = words.slice(0, 3).map(function(w, i) {
      return '<span class="w w' + (i + 1) + '">' + esc(w) + '</span>';
    }).join('');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + '</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html{background:var(--g);color:var(--i);overflow-x:hidden}' +
      'body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:56px 28px;font-family:' + serif + '}' +
      '.canvas{max-width:680px;position:relative;z-index:1}' +
      '.title{font-size:clamp(44px,10vw,104px);font-weight:400;line-height:.92;letter-spacing:-.035em;color:var(--a);mix-blend-mode:difference}' +
      '.w{display:block}' +
      '.w2{margin-left:.15em;color:var(--m);font-style:italic}' +
      '.w3{margin-left:.05em}' +
      '.words{margin-top:32px;font-size:14px;font-family:' + sans + ';line-height:1.7;opacity:.45;max-width:36ch}' +
      // Background stripes — subtle, layered
      '.bg{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;opacity:.03;pointer-events:none}' +
      '.bg div{position:absolute;top:0;bottom:0}' +
      '.bg div:nth-child(1){left:4%;width:22%;background:var(--a)}' +
      '.bg div:nth-child(2){left:30%;width:16%;background:var(--m)}' +
      '.bg div:nth-child(3){left:56%;width:12%;background:var(--a)}' +
      '.bg div:nth-child(4){left:74%;width:20%;background:var(--m)}' +
      craftFloor +
      '</style></head><body>' +
      '<div class="bg"><div></div><div></div><div></div><div></div></div>' +
      '<div class="canvas">' +
      '<h1 class="title">' + displayWords + '</h1>' +
      '<p class="words">' + esc(anchors.join(' · ') + '.') + ' ' + esc(paras[0] || '') + '</p>' +
      '</div></body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // CINEMATIC — full-viewport hero, scroll-driven sections, depth
  // ══════════════════════════════════════════════════════════════
  function cinematic() {
    var groundIsLight = isLight(ground);
    var glowColor = accent;
    var sections = anchors.slice(0, 5).map(function(a, i) {
      var para = paras[i % paras.length] || paras[0] || 'Content derived from the source.';
      return '<section class="ch">' +
        '<span class="ch-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h2>' + esc(a) + '</h2>' +
        '<p>' + esc(para) + '</p>' +
        '</section>';
    }).join('\n');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + '</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html{background:var(--g);color:var(--i);font-family:' + serif + ';scroll-behavior:smooth;-webkit-font-smoothing:antialiased}' +
      // Hero — full viewport, radial glow, centered display type
      '.vh{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}' +
      '.vh::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 35%,' + glowColor + ',transparent 65%);opacity:.12}' +
      '.vh-inner{text-align:center;position:relative;z-index:1;padding:0 28px}' +
      '.vh h1{font-size:clamp(44px,9vw,96px);font-weight:400;line-height:.94;letter-spacing:-.035em;color:var(--a)}' +
      '.vh .vh-sub{margin-top:20px;font-family:' + sans + ';font-size:15px;opacity:.5;letter-spacing:.02em}' +
      '.vh .scroll-hint{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);font-family:' + mono + ';font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.3;animation:pulse 2.5s ease-in-out infinite}' +
      '@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.6}}' +
      // Sections — scroll-driven, generous spacing
      '.ch{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 28px;max-width:620px;margin:0 auto;position:relative}' +
      '.ch-num{font-family:' + mono + ';font-size:11px;letter-spacing:.2em;color:var(--m);margin-bottom:16px;opacity:.5}' +
      '.ch h2{font-size:clamp(28px,5vw,44px);font-weight:400;letter-spacing:-.02em;margin-bottom:20px;color:var(--a);text-align:center}' +
      '.ch p{font-family:' + sans + ';font-size:17px;line-height:1.8;opacity:.6;text-align:center;max-width:52ch}' +
      craftFloor +
      '</style></head><body>' +
      '<div class="vh"><div class="vh-inner">' +
      '<h1>' + esc(content.title) + '</h1>' +
      '<p class="vh-sub">' + esc(anchors.slice(0, 3).join(' · ')) + '</p>' +
      '</div><div class="scroll-hint">scroll</div></div>' +
      sections +
      '</body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // PHOTOGRAPHY — folio with masonry-ish grid, large plates
  // ══════════════════════════════════════════════════════════════
  function photography() {
    var plates = anchors.map(function(a, i) {
      var span = i % 3 === 0 ? 'grid-column:span 2' : '';
      var h = i % 3 === 1 ? '480px' : '320px';
      return '<figure class="plate" style="' + span + ';height:' + h + '">' +
        '<div class="plate-bg" style="background:' + (i % 2 ? shade(accent, 0.2) : tint(muted, 0.1)) + '"></div>' +
        '<figcaption><span class="p-num">' + String(i + 1).padStart(2, '0') + '</span>' + esc(a) + '</figcaption>' +
        '</figure>';
    }).join('\n');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + ' — folio</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html{background:var(--g);color:var(--i);font-family:' + serif + ';-webkit-font-smoothing:antialiased}' +
      'body{max-width:900px;margin:0 auto;padding:56px 28px 64px}' +
      '.folio-hdr{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:48px;padding-bottom:20px;border-bottom:1px solid ' + (isLight(ground) ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)') + '}' +
      '.folio-hdr h1{font-size:clamp(28px,5vw,44px);font-weight:400;letter-spacing:-.02em}' +
      '.folio-hdr .count{font-family:' + mono + ';font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.4}' +
      '.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}' +
      '.plate{position:relative;overflow:hidden;border-radius:2px;min-height:200px;content-visibility:auto}' +
      '.plate-bg{position:absolute;inset:0;opacity:.5}' +
      '.plate figcaption{position:absolute;bottom:0;left:0;right:0;padding:20px;display:flex;align-items:baseline;gap:12px;color:var(--i);z-index:1}' +
      '.plate figcaption::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.6));z-index:-1}' +
      '.p-num{font-family:' + mono + ';font-size:11px;opacity:.6}' +
      '@media(max-width:600px){.grid{grid-template-columns:1fr}.plate{height:280px!important;grid-column:span 1!important}}' +
      craftFloor +
      '</style></head><body>' +
      '<div class="folio-hdr"><h1>' + esc(content.title) + '</h1><span class="count">' + anchors.length + ' plates</span></div>' +
      '<div class="grid">' + plates + '</div>' +
      '</body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // LANDING — hero + features + CTA, modern SaaS aesthetic
  // ══════════════════════════════════════════════════════════════
  function landing() {
    var features = anchors.slice(0, 3).map(function(a, i) {
      var desc = items[i] || paras[i % paras.length] || 'Derived from the source content.';
      return '<div class="feat">' +
        '<span class="feat-ic">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h3>' + esc(a) + '</h3>' +
        '<p>' + esc(desc) + '</p>' +
        '</div>';
    }).join('\n');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + '</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html{background:var(--g);color:var(--i);font-family:' + sans + ';-webkit-font-smoothing:antialiased}' +
      'body{max-width:960px;margin:0 auto;padding:0 28px}' +
      // Hero
      '.hero{text-align:center;padding:96px 0 64px;position:relative}' +
      '.hero::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:300px;height:300px;background:radial-gradient(circle,' + accent + '20,transparent 70%);pointer-events:none}' +
      '.hero h1{font-family:' + serif + ';font-size:clamp(36px,7vw,64px);font-weight:400;line-height:1.08;letter-spacing:-.025em;color:var(--a);position:relative}' +
      '.hero p{font-size:17px;line-height:1.6;opacity:.6;max-width:44ch;margin:24px auto 0;position:relative}' +
      '.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:36px;position:relative}' +
      '.cta{display:inline-flex;align-items:center;gap:6px;padding:13px 26px;border-radius:999px;background:var(--a);color:var(--g);font-weight:600;font-size:14px;text-decoration:none;transition:transform .15s,box-shadow .15s}' +
      '.cta:hover{transform:translateY(-2px);box-shadow:0 12px 28px -8px ' + accent + '60}' +
      '.cta--ghost{background:transparent;color:var(--i);box-shadow:inset 0 0 0 1px var(--m);opacity:.6}' +
      '.cta--ghost:hover{opacity:1;box-shadow:inset 0 0 0 1px var(--i)}' +
      // Features
      '.feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px;padding:64px 0 80px}' +
      '.feat{content-visibility:auto}' +
      '.feat-ic{font-family:' + mono + ';font-size:12px;color:var(--a);margin-bottom:12px;display:block}' +
      '.feat h3{font-size:17px;font-weight:600;margin-bottom:8px}' +
      '.feat p{font-size:14px;line-height:1.6;opacity:.5}' +
      craftFloor +
      '</style></head><body>' +
      '<section class="hero">' +
      '<h1>' + esc(content.title) + '</h1>' +
      '<p>' + esc(paras[0] || 'Content-derived design — palette and motifs from your source.') + '</p>' +
      '<div class="cta-row">' +
      '<a href="#" class="cta">' + esc(anchors[0] || 'Get started') + ' →</a>' +
      '<a href="#" class="cta cta--ghost">Learn more</a>' +
      '</div></section>' +
      '<div class="feats">' + features + '</div>' +
      '</body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // SVG — inline living SVG with geometric motif + anchor nodes
  // ══════════════════════════════════════════════════════════════
  function svg() {
    var cx = 200, cy = 200, r1 = 35, r2 = 80;
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = (i * Math.PI / 5) - Math.PI / 2;
      var r = i % 2 === 0 ? r2 : r1;
      pts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
    }
    var nodes = anchors.slice(0, 5).map(function(label, i) {
      var angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      var px = cx + Math.cos(angle) * 120;
      var py = cy + Math.sin(angle) * 120;
      return '<circle cx="' + px.toFixed(0) + '" cy="' + py.toFixed(0) + '" r="3" fill="' + accent + '"/>' +
        '<text x="' + (px + 10).toFixed(0) + '" y="' + (py + 4).toFixed(0) + '" font-size="11" fill="' + ink + '" font-family="' + sans + '">' + esc(label) + '</text>';
    }).join('\n      ');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + ' — SVG</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html,body{height:100%;background:var(--g);color:var(--i);font-family:' + serif + '}' +
      'body{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;padding:28px}' +
      'svg{max-width:90vw;max-height:70vh}' +
      '.title{font-size:clamp(20px,3vw,28px);font-weight:400;letter-spacing:-.01em;color:var(--a)}' +
      '.star{transform-origin:' + cx + 'px ' + cy + 'px;animation:breathe 3s ease-in-out infinite}' +
      '@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}' +
      '.river{animation:flow 4s linear infinite}' +
      '@keyframes flow{to{stroke-dashoffset:-20}}' +
      craftFloor +
      '</style></head><body>' +
      '<svg viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="' + esc(content.title) + ' as SVG">' +
      '<rect width="400" height="400" fill="' + ground + '"/>' +
      '<path class="river" d="M 40 340 Q 100 290 160 310 T 260 300 T 360 290" stroke="' + muted + '" stroke-width="2" fill="none" stroke-dasharray="4 4" opacity=".4"/>' +
      '<polygon class="star" points="' + pts.join(' ') + '" fill="' + accent + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + ground + '"/>' +
      '      ' + nodes +
      '<text x="200" y="385" text-anchor="middle" font-size="12" fill="' + accent + '" opacity=".5" font-family="' + sans + '">' + esc(content.title) + '</text>' +
      '</svg>' +
      '<p class="title">' + esc(content.title) + '</p>' +
      '</body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // 3JS — canvas 3D cube, drag to rotate, content-derived colors
  // ══════════════════════════════════════════════════════════════
  function threejs() {
    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + ' — 3D</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html,body{height:100%;background:var(--g);color:var(--i);font-family:' + sans + ';display:flex;flex-direction:column;overflow:hidden}' +
      '#view{flex:1;position:relative;min-height:0}' +
      'canvas{position:absolute;inset:0;display:block;width:100%;height:100%;cursor:grab}' +
      'canvas:active{cursor:grabbing}' +
      '.bar{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:18px 24px;border-top:1px solid ' + (isLight(ground) ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)') + '}' +
      '.bar h1{font-family:' + serif + ';font-size:18px;font-weight:400;color:var(--a)}' +
      '.bar .meta{font-family:' + mono + ';font-size:11px;opacity:.4}' +
      craftFloor +
      '</style></head><body>' +
      '<div id="view"><canvas id="c"></canvas></div>' +
      '<footer class="bar"><h1>' + esc(content.title) + '</h1>' +
      '<span class="meta">' + esc(anchors.slice(0, 3).join(' · ')) + '</span></footer>' +
      '<scr' + 'ipt>' +
      '(function(){' +
      'var c=document.getElementById("c"),ctx=c.getContext("2d");' +
      'function resize(){c.width=c.clientWidth;c.height=c.clientHeight;draw()}' +
      'var rx=0.3,ry=0,drag=false,lx=0,ly=0;' +
      'c.addEventListener("mousedown",function(e){drag=true;lx=e.clientX;ly=e.clientY});' +
      'window.addEventListener("mouseup",function(){drag=false});' +
      'window.addEventListener("mousemove",function(e){if(!drag)return;ry+=(e.clientX-lx)*.01;rx+=(e.clientY-ly)*.01;lx=e.clientX;ly=e.clientY;draw()});' +
      'function proj(x,y,z){var cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);' +
      'var x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cx-z1*sx,z2=y*sx+z1*cx;return{x:x1,y:y1,d:z2}}' +
      'function draw(){ctx.clearRect(0,0,c.width,c.height);' +
      'var cx=c.width/2,cy=c.height/2,s=Math.min(c.width,c.height)*.25;' +
      'var F=[[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1]],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]];' +
      'var cols=["' + accent + '","' + tint(accent, 0.15) + '","' + muted + '","' + shade(accent, 0.15) + '","' + muted + '","' + accent + '"];' +
      'var P=F.map(function(f){return f.map(function(v){var p=proj(v[0],v[1],v[2]);return{x:cx+p.x*s,y:cy+p.y*s,d:p.d}})});' +
      'P.sort(function(a,b){return a[0].d-b[0].d});' +
      'P.forEach(function(fc,i){ctx.fillStyle=cols[i];ctx.globalAlpha=.82;ctx.beginPath();fc.forEach(function(p,j){j===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)});ctx.closePath();ctx.fill();ctx.strokeStyle="' + ground + '";ctx.lineWidth=1;ctx.stroke()})}' +
      'window.addEventListener("resize",resize);resize()})()' +
      '</scr' + 'ipt></body></html>';
  }

  // ══════════════════════════════════════════════════════════════
  // SIMULATION — playable timeline scrubber with year events
  // ══════════════════════════════════════════════════════════════
  function simulation() {
    var yearStart = dates.length ? parseInt(dates[0]) || 1800 : 1800;
    var yearEnd = dates.length > 1 ? (parseInt(dates[1]) || yearStart + 100) : yearStart + 100;
    if (yearEnd <= yearStart) yearEnd = yearStart + 100;
    var span = yearEnd - yearStart;

    var events = anchors.slice(0, 6).map(function(label, i) {
      var yr = yearStart + Math.round(i * span / Math.max(anchors.length - 1, 1));
      return { year: yr, label: label };
    });

    var eventNodes = events.map(function(e) {
      var pct = ((e.year - yearStart) / span * 100).toFixed(1);
      return '<div class="ev" style="left:' + pct + '%"><span class="ev-d"></span><span class="ev-y">' + e.year + '</span><span class="ev-l">' + esc(e.label) + '</span></div>';
    }).join('\n      ');

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(content.title) + ' — timeline</title><style>' +
      ':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'html,body{height:100%;background:var(--g);color:var(--i);font-family:' + sans + ';-webkit-font-smoothing:antialiased}' +
      'header{padding:28px 32px 8px}' +
      'h1{font-family:' + serif + ';font-weight:400;font-size:clamp(24px,4vw,40px);letter-spacing:-.02em;color:var(--a);margin-bottom:4px}' +
      '.sub{font-size:13px;opacity:.4}' +
      '.tl{position:relative;height:50vh;margin:32px 0;padding:0 32px}' +
      '.track{position:absolute;top:50%;left:32px;right:32px;height:2px;background:var(--m);opacity:.3;border-radius:1px}' +
      '.prog{position:absolute;top:50%;left:32px;height:2px;background:var(--a);border-radius:1px;width:0;transition:width .1s linear}' +
      '.scrub{position:absolute;top:50%;left:32px;width:18px;height:18px;margin-top:-9px;margin-left:-9px;background:var(--a);border-radius:50%;cursor:grab;border:3px solid var(--g);box-shadow:0 4px 12px ' + accent + '40}' +
      '.scrub:active{cursor:grabbing}' +
      '.ev{position:absolute;top:50%;transform:translate(-50%,-50%);text-align:center;max-width:80px}' +
      '.ev-d{display:block;width:8px;height:8px;background:var(--m);border-radius:50%;margin:0 auto 6px}' +
      '.ev-y{display:block;font-family:' + mono + ';font-size:12px;font-weight:600;color:var(--a)}' +
      '.ev-l{display:block;font-size:11px;opacity:.5;line-height:1.3;margin-top:2px}' +
      '.ctrls{display:flex;gap:12px;align-items:center;padding:0 32px 24px;flex-wrap:wrap}' +
      '.btn{background:var(--a);color:var(--g);border:0;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}' +
      '.btn:active{transform:scale(.97)}' +
      '.spd{font-family:' + mono + ';font-size:12px;opacity:.5;cursor:pointer}' +
      craftFloor +
      '</style></head><body>' +
      '<header><h1>' + esc(content.title) + '</h1><p class="sub">Drag the timeline or press play</p></header>' +
      '<div class="tl"><div class="track"></div><div class="prog" id="pr"></div><div class="scrub" id="sc" tabindex="0"></div>' +
      '      ' + eventNodes + '</div>' +
      '<div class="ctrls"><button class="btn" id="pl">▶ Play</button><span class="spd" id="sp">1x</span></div>' +
      '<scr' + 'ipt>' +
      '(function(){var sc=document.getElementById("sc"),pr=document.getElementById("pr"),pl=document.getElementById("pl"),sp=document.getElementById("sp"),tl=document.querySelector(".tl");' +
      'var p=false,spd=1,pos=0,sL=32,eL=32;' +
      'function mx(){return tl.clientWidth-sL-eL-18}' +
      'function set(v){pos=Math.max(0,Math.min(1,v));var x=mx();sc.style.left=(sL+pos*x)+"px";pr.style.width=(pos*x)+"px"}' +
      'sc.addEventListener("mousedown",function(e){p=false;pl.textContent="▶ Play";var sx=e.clientX,sp2=pos;var mv=function(ev){set(sp2+(ev.clientX-sx)/mx())};var up=function(){document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up)};document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up)});' +
      'pl.addEventListener("click",function(){p=!p;pl.textContent=p?"⏸ Pause":"▶ Play";if(p)tk()});' +
      'sp.addEventListener("click",function(){spd=spd===1?2:spd===2?4:1;sp.textContent=spd+"x"});' +
      'function tk(){if(!p)return;pos+=.001*spd;if(pos>=1)pos=0;set(pos);requestAnimationFrame(tk)}' +
      'set(0)})()' +
      '</scr' + 'ipt></body></html>';
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function makeRNG(seed) {
  var s = seed | 0;
  return function() {
    s = s + 0x6D2B79F5 | 0;
    var t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

module.exports = { generate };
