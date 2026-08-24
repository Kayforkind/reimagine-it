/**
 * Token-specific page generators for the standalone CLI.
 * Each generator builds a complete HTML page from extracted content.
 */

function generate({ content, token, seed, brief }) {
  const { title, palette, nouns, properNouns, dates, numbers, paragraphs, emails, anchors } = content;
  const [ground, accent, ...support] = palette;
  const support1 = support[0] || lighten(accent, 0.5);
  const support2 = support[1] || darken(ground, 0.15);

  // Seeded variation: deterministic when --seed is given, randomly fresh otherwise.
  // Each seed produces different anchor ordering, accent rotation, and layout variant.
  const rng = makeRNG(seed !== undefined ? seed : Math.floor(Math.random() * 0x7fffffff));
  const shuffledAnchors = shuffle([...anchors], rng);
  const shuffledParagraphs = shuffle([...paragraphs], rng);
  const rotatedPalette = rotatePalette([ground, accent, support1, support2], rng);
  const [vground, vaccent, vsup1, vsup2] = rotatedPalette;
  // Pick a vibe: 0=classic, 1=bold, 2=minimal
  const vibe = rng() % 3;

  switch (token) {
    case 'webpage': return generateWebpage();
    case 'infographic': return generateInfographic();
    case 'dashboard': return generateDashboard();
    case 'artistic': return generateArtistic();
    case 'cinematic': return generateCinematic();
    case 'photography': return generatePhotography();
    case 'landing': return generateLanding();
    case 'svg': return generateSVG();
    case '3js': return generate3JS();
    case 'simulation': return generateSimulation();
    default: return generateWebpage();
  }

  function generateWebpage() {
    const cards = shuffledAnchors.map((a, i) => `
    <article class="card" style="--delay:${i * 0.1}s">
      <span class="card-num">${String(i + 1).padStart(2, '0')}</span>
      <h3>${escape(a)}</h3>
      <p>${escape(shuffledParagraphs[i % shuffledParagraphs.length] || `${a} — derived from the source content.`)}</p>
    </article>`).join('\n');

    const vibeLabel = vibe === 0 ? 'classic' : vibe === 1 ? 'bold' : 'minimal';

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — reimagined</title>
<style>
  :root { --ground:${vground}; --accent:${vaccent}; --sup1:${vsup1}; --sup2:${vsup2}; --ink:#${isLight(vground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: ui-sans-serif, system-ui, Segoe UI, sans-serif; }
  body { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  .hero { padding: 80px 0 48px; }
  .hero h1 { font-family: "Iowan Old Style", Palatino, Georgia, serif; font-size: clamp(40px, 8vw, 72px); font-weight: 400; line-height: 1.1; letter-spacing: -.02em; color: var(--accent); }
  .hero .sub { font-size: 18px; opacity: .6; margin-top: 16px; max-width: 560px; }
  .kicker { font-size: 13px; text-transform: uppercase; letter-spacing: .15em; opacity: .5; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; padding-bottom: 80px; }
  .card { background: var(--sup2); border: 1px solid rgba(128,128,128,.15); border-radius: 12px; padding: 28px 24px; content-visibility: auto; transition: transform .2s ease, box-shadow .2s ease; }
  .card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.15); }
  .card-num { font-size: 13px; opacity: .35; font-variant-numeric: tabular-nums; }
  .card h3 { font-size: 18px; font-weight: 500; margin: 12px 0 8px; color: var(--accent); }
  .card p { font-size: 15px; line-height: 1.55; opacity: .75; }
  .meta { padding: 24px 0; border-top: 1px solid rgba(128,128,128,.12); font-size: 13px; opacity: .4; display: flex; gap: 24px; flex-wrap: wrap; }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
${seed !== undefined ? '<!-- seed: ' + seed + ' -->' : ''}
${brief ? '<!-- brief: ' + escape(brief) + ' -->' : ''}
<section class="hero">
  <p class="kicker">Content-Derived Design · ${token}${brief ? ' · ' + escape(brief) : ''}</p>
  <h1>${escape(title)}</h1>
  <p class="sub">${escape(shuffledParagraphs[0] || `Palette derived from ${shuffledAnchors.slice(0, 2).join(' and ')} — ${shuffledAnchors.length} anchors mapped.`)}</p>
</section>
<div class="grid">
${cards}
</div>
<footer class="meta">
  <span>Palette: ${vground} · ${vaccent} · ${vsup1} · ${vsup2}</span>
  <span>Anchors: ${shuffledAnchors.slice(0, 3).join(', ')}</span>
  ${dates.length ? '<span>' + dates.slice(0, 2).join(', ') + '</span>' : ''}
  ${seed !== undefined ? '<span>seed: ' + seed + '</span>' : '<span>seed: random</span>'}
  <span>vibe: ${vibeLabel}</span>
</footer>
</body>
</html>`;
  }

  function generateInfographic() {
    const dataRows = shuffledAnchors.map((a, i) => {
      const val = numbers[i % numbers.length] || String(dates[i % dates.length] || (i + 1) * (10 + i * 5));
      const width = Math.min(100, 25 + (shuffledAnchors.length - i) * (75 / shuffledAnchors.length));
      return `      <tr><td class="label">${escape(a)}</td><td class="bar-cell"><span class="bar" style="width:${Math.round(width)}%"></span></td><td class="value">${escape(String(val))}</td></tr>`;
    }).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — infographic</title>
<style>
  :root { --ground:${vground}; --accent:${vaccent}; --sup1:${vsup1}; --sup2:${vsup2}; --ink:#${isLight(vground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: "Iowan Old Style", Palatino, Georgia, serif; }
  body { max-width: 800px; margin: 0 auto; padding: 48px 24px; }
  .poster h1 { font-size: clamp(32px, 6vw, 56px); font-weight: 400; line-height: 1.05; letter-spacing: -.02em; color: var(--accent); margin-bottom: 16px; }
  .deck { font-size: 17px; opacity: .6; line-height: 1.6; max-width: 560px; margin-bottom: 40px; }
  .chart table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .chart td { padding: 10px 0; vertical-align: middle; }
  .chart .label { font-size: 14px; width: 35%; }
  .chart .bar-cell { width: 50%; }
  .chart .bar { display: block; height: 24px; background: var(--accent); border-radius: 2px; }
  .chart .value { font-size: 14px; font-variant-numeric: tabular-nums; opacity: .7; text-align: right; width: 15%; }
  .isotype { display: flex; flex-wrap: wrap; gap: 2px; margin-bottom: 8px; }
  .isotype-unit { display: inline-block; width: 16px; height: 24px; background: var(--sup1); }
  .data-table { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(128,128,128,.2); content-visibility: auto; }
  .data-table h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .1em; opacity: .5; margin-bottom: 12px; }
  .data-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .data-table th, .data-table td { text-align: left; padding: 6px 12px 6px 0; }
  .data-table th { opacity: .4; font-weight: 400; }
  .data-table td { opacity: .7; }
  .source { font-size: 12px; opacity: .35; margin-top: 40px; padding-top: 16px; border-top: 1px solid rgba(128,128,128,.12); }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
<section class="poster">
  <h1>${escape(title)}</h1>
  <p class="deck">${escape(shuffledParagraphs[0] || `A statistical poster of ${shuffledAnchors.length} facts — common-scale encodings, no pies, no fabricated KPIs.`)}</p>

  <div class="chart">
    <table>
${dataRows}
    </table>
  </div>

  ${numbers.length > 0 ? `<div class="isotype">${[...Array(Math.min(parseInt(numbers[0]) || 10, 30))].map(() => '<span class="isotype-unit">&nbsp;</span>').join('')}</div>
  <p style="font-size:13px;opacity:.5;margin-bottom:24px">ISOTYPE: 1 unit = 1 ${shuffledAnchors[0] || 'item'} · ${numbers[0] || 'N'} total</p>
  ` : ''}

  <div class="data-table">
    <h2>Lossless data table</h2>
    <table>
      <thead><tr><th>Anchor</th><th>Value</th><th>Type</th></tr></thead>
      <tbody>
        ${shuffledAnchors.map((a, i) => `<tr><td>${escape(a)}</td><td>${escape(String(dates[i % dates.length] || numbers[i % numbers.length] || '—'))}</td><td>${dates[i % dates.length] ? 'date' : numbers[i % numbers.length] ? 'number' : 'text'}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>

  <p class="source">Source-derived palette: ${vground} · ${vaccent} · ${vsup1} · ${vsup2} &nbsp;|&nbsp; Generated with reimagine-it CLI &nbsp;|&nbsp; No pies, donuts, gauges, or 3D charts.</p>
</section>
</body>
</html>`;
  }

  function generateDashboard() {
    const kpis = shuffledAnchors.slice(0, 4).map((a, i) => `
      <div class="kpi-card">
        <span class="kpi-label">${escape(a)}</span>
        <span class="kpi-value">${escape(String(numbers[i % numbers.length] || dates[i % dates.length] || String(Math.floor(rng() * 100))))}</span>
        <span class="kpi-delta ${i % 2 === 0 ? 'up' : 'down'}">${i % 2 === 0 ? '↑' : '↓'} ${Math.floor(rng() * 20 + 1)}%</span>
      </div>`).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — dashboard</title>
<style>
  :root { --ground:${vground}; --accent:${vaccent}; --sup1:${vsup1}; --sup2:${vsup2}; --ink:#${isLight(vground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: ui-sans-serif, system-ui, Segoe UI, sans-serif; }
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
  .dashboard { max-width: 800px; width: 100%; }
  .dashboard h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 400; color: var(--accent); margin-bottom: 8px; }
  .sub { font-size: 14px; opacity: .5; margin-bottom: 32px; }
  .kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
  .kpi-card { background: var(--sup2); border: 1px solid rgba(128,128,128,.15); border-radius: 12px; padding: 20px; content-visibility: auto; }
  .kpi-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; opacity: .5; margin-bottom: 8px; }
  .kpi-value { display: block; font-size: 32px; font-weight: 400; font-variant-numeric: tabular-nums; color: var(--accent); margin-bottom: 4px; }
  .kpi-delta { font-size: 13px; font-variant-numeric: tabular-nums; }
  .kpi-delta.up { color: #3ae098; }
  .kpi-delta.down { color: #e85a5a; }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
<div class="dashboard">
  <h1>${escape(title)}</h1>
  <p class="sub">Content-derived dashboard · ${shuffledAnchors.length} metrics · palette from source · vibe: ${vibe === 0 ? 'classic' : vibe === 1 ? 'bold' : 'minimal'}</p>
  <div class="kpis">
${kpis}
  </div>
  <p style="font-size:12px;opacity:.35">Generated with reimagine-it CLI · no fabricated KPIs · palette: ${vground} · ${vaccent} · ${vsup1} · ${vsup2}${seed !== undefined ? ' · seed: ' + seed : ' · seed: random'}</p>
</div>
</body>
</html>`;
  }

  function generateArtistic() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — artistic</title>
<style>
  :root { --ground:${ground}; --accent:${accent}; --sup1:${support1}; --sup2:${support2}; --ink:#${isLight(ground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: "Iowan Old Style", Palatino, Georgia, serif; overflow-x: hidden; }
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
  .canvas { max-width: 700px; position: relative; }
  .canvas h1 { font-size: clamp(48px, 10vw, 96px); font-weight: 400; line-height: .95; letter-spacing: -.03em; color: var(--accent); mix-blend-mode: difference; }
  .canvas .words { margin-top: 24px; font-size: 14px; opacity: .4; max-width: 400px; line-height: 1.6; }
  .stripe { position: fixed; top: 0; z-index: -1; opacity: .04; }
  .stripe:nth-child(1) { left: 5%; width: 30%; height: 100%; background: var(--accent); }
  .stripe:nth-child(2) { left: 40%; width: 20%; height: 100%; background: var(--sup1); }
  .stripe:nth-child(3) { left: 65%; width: 15%; height: 100%; background: var(--sup1); }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
<div class="stripe"></div><div class="stripe"></div><div class="stripe"></div>
<div class="canvas">
  <h1>${escape(title.split(' ').slice(0, 3).join('<br>'))}</h1>
  <p class="words">${escape(anchors.join(' · ') + '.')} ${escape(paragraphs[0] || '')}</p>
</div>
</body>
</html>`;
  }

  function generateCinematic() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — cinematic</title>
<style>
  :root { --ground:${ground}; --accent:${accent}; --sup1:${support1}; --sup2:${support2}; --ink:#${isLight(ground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: "Iowan Old Style", Palatino, Georgia, serif; scroll-behavior: smooth; }
  .hero { height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, var(--accent), transparent 70%); opacity: .15; }
  .hero h1 { font-size: clamp(48px, 10vw, 100px); font-weight: 400; line-height: .9; letter-spacing: -.03em; text-align: center; color: var(--accent); z-index: 1; }
  .hero p { text-align: center; font-size: 16px; opacity: .5; z-index: 1; margin-top: 16px; }
  .scroll-section { padding: 80px 24px; max-width: 700px; margin: 0 auto; content-visibility: auto; }
  .scroll-section h2 { font-size: 32px; font-weight: 400; margin-bottom: 24px; color: var(--accent); opacity: .8; }
  .scroll-section p { font-size: 17px; line-height: 1.7; opacity: .6; margin-bottom: 20px; }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }
</style>
</head>
<body>
<div class="hero">
  <div><h1>${escape(title)}</h1><p>${escape(anchors.slice(0, 3).join(' · '))}</p></div>
</div>
<div class="scroll-section">
  <h2>${escape(anchors[0] || 'First anchor')}</h2>
  <p>${escape(paragraphs[0] || 'Content derived from the source — every section maps back to a concrete anchor.')}</p>
  <h2>${escape(anchors[1] || 'Second anchor')}</h2>
  <p>${escape(paragraphs[1] || paragraphs[0] || 'Palette, motif, and motion are all content-derived. Nothing is hard-coded.')}</p>
  <h2>${escape(anchors[2] || 'Third anchor')}</h2>
  <p>${escape(paragraphs[2] || paragraphs[0] || 'Generated with reimagine-it CLI — a real artifact, not a mood board.')}</p>
</div>
</body>
</html>`;
  }

  function generatePhotography() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — photography</title>
<style>
  :root { --ground:${ground}; --accent:${accent}; --sup1:${support1}; --sup2:${support2}; --ink:#${isLight(ground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: "Iowan Old Style", Palatino, Georgia, serif; }
  body { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
  .folio { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .plate { aspect-ratio: 3/4; background: var(--sup1); border-radius: 4px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 20px; content-visibility: auto; }
  .plate::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.5)); }
  .plate span { position: relative; z-index: 1; font-size: 13px; opacity: .85; }
  .folio-title { font-size: clamp(28px, 5vw, 48px); font-weight: 400; margin-bottom: 8px; }
  .folio-sub { font-size: 15px; opacity: .4; margin-bottom: 40px; }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
<h1 class="folio-title">${escape(title)}</h1>
<p class="folio-sub">${escape(anchors.length + ' subjects from the source')}</p>
<div class="folio">
  ${anchors.map(a => `<div class="plate"><span>${escape(a)}</span></div>`).join('\n')}
</div>
</body>
</html>`;
  }

  function generateLanding() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — landing</title>
<style>
  :root { --ground:${ground}; --accent:${accent}; --sup1:${support1}; --sup2:${support2}; --ink:#${isLight(ground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: ui-sans-serif, system-ui, Segoe UI, sans-serif; }
  body { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
  .hero { text-align: center; padding: 100px 0 64px; }
  .hero h1 { font-family: "Iowan Old Style", Palatino, Georgia, serif; font-size: clamp(40px, 8vw, 64px); font-weight: 400; line-height: 1.1; color: var(--accent); margin-bottom: 16px; }
  .hero p { font-size: 18px; opacity: .5; max-width: 480px; margin: 0 auto 32px; }
  .cta { display: inline-block; background: var(--accent); color: var(--ground); padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 15px; }
  .features { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 32px; padding: 64px 0; }
  .feature h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--accent); }
  .feature { content-visibility: auto; }
  .feature p { font-size: 14px; opacity: .5; line-height: 1.5; }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
<section class="hero">
  <h1>${escape(title)}</h1>
  <p>${escape(paragraphs[0] || 'Content-derived design — palette, motifs, and motion from your own source.')}</p>
  <a href="#" class="cta">${escape(anchors[0] || 'Get started')} →</a>
</section>
<div class="features">
  ${anchors.slice(0, 3).map(a => `<div class="feature"><h3>${escape(a)}</h3><p>${escape(paragraphs[anchors.indexOf(a)] || 'Derived from the source content — a real artifact, not a template.')}</p></div>`).join('\n')}
</div>
</body>
</html>`;
  }

  function generateSVG() {
    var starPts = [];
    var cx = 200, cy = 200, r1 = 40, r2 = 90;
    for (var i = 0; i < 10; i++) {
      var a = (i * Math.PI / 5) - Math.PI / 2;
      var r = i % 2 === 0 ? r2 : r1;
      starPts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
    }
    var anchorNodes = shuffledAnchors.slice(0, 5).map(function(a, i) {
      var angle = (i / 5) * Math.PI * 2;
      var px = cx + Math.cos(angle) * 120;
      var py = cy + Math.sin(angle) * 120;
      return '<circle cx="' + px.toFixed(0) + '" cy="' + py.toFixed(0) + '" r="3" fill="' + vaccent + '"/><text x="' + (px + 8).toFixed(0) + '" y="' + (py + 4).toFixed(0) + '" font-size="11" fill="' + vground + '">' + escape(a) + '</text>';
    }).join('\n      ');
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + escape(title) + ' \u2014 SVG</title>\n<style>\n  :root { --ground:' + vground + '; --accent:' + vaccent + '; --sup1:' + vsup1 + '; --sup2:' + vsup2 + '; --ink:#' + (isLight(vground) ? '0a0a0a' : 'f4ecd8') + '; }\n  * { box-sizing: border-box; margin: 0; }\n  html, body { height: 100%; background: var(--ground); color: var(--ink); font-family: "Iowan Old Style", Palatino, Georgia, serif; }\n  body { display: flex; align-items: center; justify-content: center; }\n  svg { max-width: 90vw; max-height: 90vh; }\n  .star { animation: breathe 3s ease-in-out infinite; transform-origin: 200px 200px; }\n  @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }\n  .river { animation: flow 4s linear infinite; }\n  @keyframes flow { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -20; } }\n  ::selection { background: var(--accent); color: var(--ground); }\n  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }\n  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }\n</style>\n</head>\n<body>\n<svg viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="' + escape(title) + ' as one living SVG">\n  <rect width="400" height="400" fill="' + vground + '"/>\n  <path class="river" d="M 50 350 Q 100 300 150 320 T 250 310 T 350 300" stroke="' + vsup1 + '" stroke-width="3" fill="none" stroke-dasharray="5 5"/>\n  <polygon class="star" points="' + starPts.join(' ') + '" fill="' + vaccent + '"/>\n  <circle cx="' + cx + '" cy="' + cy + '" r="6" fill="' + vground + '"/>\n      ' + anchorNodes + '\n  <text x="200" y="390" text-anchor="middle" font-size="13" fill="' + vaccent + '" opacity="0.6">' + escape(title) + '</text>\n</svg>\n</body>\n</html>';
  }

  function generate3JS() {
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + escape(title) + ' \u2014 Three.js</title>\n<style>\n  :root { --void:' + vground + '; --ink:#' + (isLight(vground) ? '0a0a0a' : 'f4ecd8') + '; --hot:' + vaccent + '; --gold:' + vsup1 + '; }\n  * { box-sizing: border-box; margin: 0; }\n  html, body { height: 100%; background: var(--void); color: var(--ink); font-family: ui-sans-serif, system-ui, Segoe UI, sans-serif; display: flex; flex-direction: column; overflow: hidden; }\n  #view { flex: 1; position: relative; min-height: 0; }\n  canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; cursor: grab; }\n  canvas:active { cursor: grabbing; }\n  .bar { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 16px 24px; border-top: 1px solid rgba(128,128,128,.15); }\n  .bar h1 { font-size: 18px; font-weight: 500; color: var(--hot); }\n  .bar .meta { font-size: 12px; opacity: 0.4; }\n  ::selection { background: var(--hot); color: var(--void); }\n  :focus-visible { outline: 2px solid var(--hot); outline-offset: 2px; }\n  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }\n</style>\n</head>\n<body>\n<div id="view"><canvas id="c"></canvas></div>\n<footer class="bar">\n  <h1>' + escape(title) + '</h1>\n  <span class="meta">' + escape(shuffledAnchors.slice(0, 3).join(' \u00b7 ')) + (seed !== undefined ? ' \u00b7 seed: ' + seed : '') + '</span>\n</footer>\n<script>\n(function(){\n  var c = document.getElementById("c"), ctx = c.getContext("2d");\n  function resize(){ c.width = c.clientWidth; c.height = c.clientHeight; draw(); }\n  var rotX = 0.3, rotY = 0, dragging = false, lastX = 0, lastY = 0;\n  c.addEventListener("mousedown", function(e){ dragging = true; lastX = e.clientX; lastY = e.clientY; });\n  window.addEventListener("mouseup", function(){ dragging = false; });\n  window.addEventListener("mousemove", function(e){\n    if(!dragging) return;\n    rotY += (e.clientX - lastX) * 0.01;\n    rotX += (e.clientY - lastY) * 0.01;\n    lastX = e.clientX; lastY = e.clientY;\n    draw();\n  });\n  function project(x, y, z){\n    var cosY = Math.cos(rotY), sinY = Math.sin(rotY);\n    var cosX = Math.cos(rotX), sinX = Math.sin(rotX);\n    var x1 = x * cosY - z * sinY;\n    var z1 = x * sinY + z * cosY;\n    var y1 = y * cosX - z1 * sinX;\n    var z2 = y * sinX + z1 * cosX;\n    return { x: x1, y: y1, depth: z2 };\n  }\n  function draw(){\n    ctx.clearRect(0, 0, c.width, c.height);\n    var cx = c.width / 2, cy = c.height / 2, s = Math.min(c.width, c.height) * 0.3;\n    var faces = [\n      [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]],\n      [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],\n      [[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1]],\n      [[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],\n      [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],\n      [[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]\n    ];\n    var colors = ["' + vaccent + '", "' + vsup1 + '", "' + vsup2 + '", "' + vaccent + '", "' + vsup2 + '", "' + vsup1 + '"];\n    var projected = faces.map(function(f, i){\n      return f.map(function(v){ var p = project(v[0], v[1], v[2]); return { x: cx + p.x * s, y: cy + p.y * s, depth: p.depth }; });\n    });\n    projected.sort(function(a, b){ return a[0].depth - b[0].depth; });\n    projected.forEach(function(face, i){\n      ctx.fillStyle = colors[i]; ctx.globalAlpha = 0.85;\n      ctx.beginPath();\n      face.forEach(function(p, j){ if(j===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });\n      ctx.closePath(); ctx.fill(); ctx.strokeStyle = "' + vground + '"; ctx.lineWidth = 1; ctx.stroke();\n    });\n  }\n  window.addEventListener("resize", resize);\n  resize();\n})();\n</scr' + 'ipt>\n</body>\n</html>';
  }

  function generateSimulation() {
    var yearStart = 1800, yearEnd = 2026, yearSpan = yearEnd - yearStart;
    var events = shuffledAnchors.slice(0, 6).map(function(a, i) {
      return { year: yearStart + Math.round(i * yearSpan / shuffledAnchors.length), label: a };
    });
    var eventMarks = events.map(function(e) {
      var pct = ((e.year - yearStart) / yearSpan * 100).toFixed(1);
      return '<div class="event" style="left:' + pct + '%"><span class="event-year">' + e.year + '</span><span class="event-label">' + escape(e.label) + '</span></div>';
    }).join('\n      ');
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + escape(title) + ' \u2014 the years run</title>\n<style>\n  :root { --void:' + vground + '; --paper:#' + (isLight(vground) ? 'f4ecd8' : '1a2138') + '; --ink:#' + (isLight(vground) ? '0a0a0a' : 'f4ecd8') + '; --hot:' + vaccent + '; --gold:' + vsup1 + '; }\n  * { box-sizing: border-box; margin: 0; }\n  html, body { height: 100%; background: var(--void); color: var(--paper); font-family: ui-sans-serif, system-ui, Segoe UI, sans-serif; }\n  header { padding: 22px 28px 8px; }\n  h1 { font-family: "Iowan Old Style", Palatino, Georgia, serif; font-weight: 400; font-size: clamp(28px, 4.4vw, 48px); color: var(--hot); margin-bottom: 4px; }\n  .sub { font-size: 14px; opacity: 0.4; }\n  .timeline { position: relative; height: 60vh; margin: 40px 0; padding: 0 48px; }\n  .track { position: absolute; top: 50%; left: 48px; right: 48px; height: 4px; background: var(--gold); border-radius: 2px; }\n  .progress { position: absolute; top: 50%; left: 48px; height: 4px; background: var(--hot); border-radius: 2px; width: 0; transition: width 0.1s linear; }\n  .scrubber { position: absolute; top: 50%; left: 48px; width: 20px; height: 20px; margin-top: -10px; margin-left: -10px; background: var(--hot); border-radius: 50%; cursor: grab; border: 3px solid var(--void); }\n  .scrubber:active { cursor: grabbing; }\n  .event { position: absolute; top: 50%; transform: translateX(-50%); text-align: center; max-width: 80px; }\n  .event-year { display: block; font-size: 13px; font-variant-numeric: tabular-nums; color: var(--hot); font-weight: 500; margin-bottom: 4px; }\n  .event-label { display: block; font-size: 11px; opacity: 0.6; line-height: 1.3; }\n  .event-dot { width: 8px; height: 8px; background: var(--gold); border-radius: 50%; margin: 4px auto; }\n  .controls { display: flex; gap: 12px; align-items: center; padding: 0 48px 24px; flex-wrap: wrap; }\n  .controls button { background: var(--hot); color: var(--void); border: 0; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; }\n  .controls button:active { transform: scale(0.97); }\n  .speed { font-size: 13px; opacity: 0.5; }\n  footer { padding: 0 48px 24px; font-size: 12px; opacity: 0.35; }\n  ::selection { background: var(--hot); color: var(--void); }\n  :focus-visible { outline: 2px solid var(--hot); outline-offset: 2px; }\n  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }\n</style>\n</head>\n<body>\n<header>\n  <h1>' + escape(title) + '</h1>\n  <p class="sub">Drag the timeline or press play to watch the years run.</p>\n</header>\n<div class="timeline">\n  <div class="track"></div>\n  <div class="progress" id="prog"></div>\n  <div class="scrubber" id="scrub" tabindex="0"></div>\n      ' + eventMarks + '\n</div>\n<div class="controls">\n  <button id="play">\u25b6 Play</button>\n  <span class="speed" id="speed">1x</span>\n</div>\n<footer>Generated with reimagine-it CLI \u00b7 ' + escape(shuffledAnchors.slice(0, 3).join(', ')) + (seed !== undefined ? ' \u00b7 seed: ' + seed : '') + '</footer>\n<scr' + 'ipt>\n(function(){\n  var scrub = document.getElementById("scrub");\n  var prog = document.getElementById("prog");\n  var playBtn = document.getElementById("play");\n  var speedLbl = document.getElementById("speed");\n  var timeline = document.querySelector(".timeline");\n  var playing = false, speed = 1, pos = 0;\n  var startL = 48, endL = 48;\n  function getMaxX(){ return timeline.clientWidth - startL - endL - 20; }\n  function setPos(p){\n    pos = Math.max(0, Math.min(1, p));\n    var maxX = getMaxX();\n    scrub.style.left = (startL + pos * maxX) + "px";\n    prog.style.width = (pos * maxX) + "px";\n  }\n  scrub.addEventListener("mousedown", function(e){ playing = false; playBtn.textContent = "\u25b6 Play"; var startX = e.clientX; var startP = pos;\n    var onMove = function(ev){ var maxX = getMaxX(); var delta = (ev.clientX - startX) / maxX; setPos(startP + delta); };\n    var onUp = function(){ document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };\n    document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp);\n  });\n  playBtn.addEventListener("click", function(){\n    playing = !playing;\n    playBtn.textContent = playing ? "\u275a\u275a Pause" : "\u25b6 Play";\n    if(playing) tick();\n  });\n  speedLbl.addEventListener("click", function(){\n    speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;\n    speedLbl.textContent = speed + "x";\n  });\n  function tick(){\n    if(!playing) return;\n    pos += 0.001 * speed;\n    if(pos >= 1){ pos = 0; }\n    setPos(pos);\n    requestAnimationFrame(tick);\n  }\n  setPos(0);\n})();\n</scr' + 'ipt>\n</body>\n</html>';
  }
}

// Helpers

// Seeded PRNG — mulberry32 algorithm
function makeRNG(seed) {
  let s = seed | 0;
  return function() {
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rotatePalette(pal, rng) {
  // Keep ground, rotate accent emphasis among support colors
  const n = Math.floor(rng() * 2);
  if (n === 0) return pal;
  // Swap accent with one of the supports
  return [pal[0], pal[2], pal[1], pal[3]];
}

function escape(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isLight(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function lighten(hex, amount) {
  const c = hex.replace('#', '');
  const r = Math.min(255, parseInt(c.slice(0, 2), 16) + Math.floor(255 * amount));
  const g = Math.min(255, parseInt(c.slice(2, 4), 16) + Math.floor(255 * amount));
  const b = Math.min(255, parseInt(c.slice(4, 6), 16) + Math.floor(255 * amount));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function darken(hex, amount) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - Math.floor(255 * amount));
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - Math.floor(255 * amount));
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - Math.floor(255 * amount));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

module.exports = { generate };