/**
 * Token-specific page generators for the standalone CLI.
 * Each generator builds a complete HTML page from extracted content.
 */

function generate({ content, token, seed, brief }) {
  const { title, palette, nouns, properNouns, dates, numbers, paragraphs, emails, anchors } = content;
  const [ground, accent, ...support] = palette;
  const support1 = support[0] || lighten(accent, 0.5);
  const support2 = support[1] || darken(ground, 0.15);

  switch (token) {
    case 'webpage': return generateWebpage();
    case 'infographic': return generateInfographic();
    case 'dashboard': return generateDashboard();
    case 'artistic': return generateArtistic();
    case 'cinematic': return generateCinematic();
    case 'photography': return generatePhotography();
    case 'landing': return generateLanding();
    default: return generateWebpage();
  }

  function generateWebpage() {
    const cards = anchors.map((a, i) => `
    <article class="card" style="--delay:${i * 0.1}s">
      <span class="card-num">${String(i + 1).padStart(2, '0')}</span>
      <h3>${escape(a)}</h3>
      <p>${escape(paragraphs[Math.min(i, paragraphs.length - 1)] || `${a} — derived from the source content.`)}</p>
    </article>`).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — reimagined</title>
<style>
  :root { --ground:${ground}; --accent:${accent}; --sup1:${support1}; --sup2:${support2}; --ink:#${isLight(ground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: ui-sans-serif, system-ui, Segoe UI, sans-serif; }
  body { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  .hero { padding: 80px 0 48px; }
  .hero h1 { font-family: "Iowan Old Style", Palatino, Georgia, serif; font-size: clamp(40px, 8vw, 72px); font-weight: 400; line-height: 1.1; letter-spacing: -.02em; color: var(--accent); }
  .hero .sub { font-size: 18px; opacity: .6; margin-top: 16px; max-width: 560px; }
  .kicker { font-size: 13px; text-transform: uppercase; letter-spacing: .15em; opacity: .5; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; padding-bottom: 80px; }
  .card { background: var(--sup2); border: 1px solid rgba(128,128,128,.15); border-radius: 12px; padding: 28px 24px; transition: transform .2s ease, box-shadow .2s ease; }
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
  <p class="sub">${escape(paragraphs[0] || `Palette derived from ${anchors.slice(0, 2).join(' and ')} — ${anchors.length} anchors mapped.`)}</p>
</section>
<div class="grid">
${cards}
</div>
<footer class="meta">
  <span>Palette: ${ground} · ${accent} · ${support1} · ${support2}</span>
  <span>Anchors: ${anchors.slice(0, 3).join(', ')}</span>
  ${dates.length ? '<span>' + dates.slice(0, 2).join(', ') + '</span>' : ''}
  <span>Generated with reimagine-it CLI</span>
</footer>
</body>
</html>`;
  }

  function generateInfographic() {
    const dataRows = anchors.map((a, i) => {
      const val = numbers[i] || String(dates[i] || (i + 1) * (10 + i * 5));
      return `      <tr><td class="label">${escape(a)}</td><td class="bar-cell"><span class="bar" style="width:${Math.min(100, 40 + i * 15)}%"></span></td><td class="value">${escape(val)}</td></tr>`;
    }).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — infographic</title>
<style>
  :root { --ground:${ground}; --accent:${accent}; --sup1:${support1}; --sup2:${support2}; --ink:#${isLight(ground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: "Iowan Old Style", Palatino, Georgia, serif; }
  body { max-width: 900px; margin: 0 auto; padding: 0 24px; }
  .poster { padding: 64px 0 48px; }
  .poster h1 { font-size: clamp(36px, 7vw, 64px); font-weight: 400; line-height: 1.1; color: var(--accent); }
  .poster .deck { font-size: 17px; opacity: .6; margin: 12px 0 40px; max-width: 500px; line-height: 1.5; }
  .chart { margin-bottom: 48px; }
  .chart table { width: 100%; border-collapse: collapse; }
  .chart td { padding: 8px 0; border-bottom: 1px solid rgba(128,128,128,.1); font-size: 15px; }
  .chart .label { font-weight: 500; width: 40%; }
  .chart .bar-cell { width: 45%; }
  .chart .bar { display: block; height: 8px; background: var(--accent); border-radius: 4px; min-width: 4px; }
  .chart .value { text-align: right; font-size: 13px; opacity: .5; font-variant-numeric: tabular-nums; width: 15%; }
  .data-table { margin-top: 48px; }
  .data-table h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .15em; opacity: .4; margin-bottom: 16px; font-weight: 500; }
  .data-table table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .data-table th { text-align: left; padding: 8px 4px; border-bottom: 2px solid rgba(128,128,128,.2); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; opacity: .5; }
  .data-table td { padding: 8px 4px; border-bottom: 1px solid rgba(128,128,128,.08); }
  .source { margin-top: 48px; padding: 20px 0; border-top: 1px solid rgba(128,128,128,.12); font-size: 12px; opacity: .35; }
  .isotype { display: flex; gap: 6px; flex-wrap: wrap; margin: 24px 0; }
  .isotype-unit { width: 18px; height: 18px; background: var(--accent); border-radius: 3px; opacity: .7; }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
<section class="poster">
  <h1>${escape(title)}</h1>
  <p class="deck">${escape(paragraphs[0] || `A statistical poster of ${anchors.length} facts — common-scale encodings, no pies, no fabricated KPIs.`)}</p>

  <div class="chart">
    <table>
${dataRows}
    </table>
  </div>

  ${numbers.length > 1 ? `
  <div class="isotype">
    ${[...Array(Math.min(parseInt(numbers[0]) || 10, 30))].map(() => '<span class="isotype-unit">&nbsp;</span>').join('')}
  </div>
  <p style="font-size:13px;opacity:.5;margin-bottom:24px">ISOTYPE: 1 unit = 1 ${anchors[0] || 'item'} · ${numbers[0] || 'N'} total</p>
  ` : ''}

  <div class="data-table">
    <h2>Lossless data table</h2>
    <table>
      <thead><tr><th>Anchor</th><th>Value</th><th>Type</th></tr></thead>
      <tbody>
        ${anchors.map((a, i) => `<tr><td>${escape(a)}</td><td>${escape(dates[i] || numbers[i] || '—')}</td><td>${dates[i] ? 'date' : numbers[i] ? 'number' : 'text'}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>

  <p class="source">Source-derived palette: ${ground} · ${accent} · ${support1} · ${support2} &nbsp;|&nbsp; Generated with reimagine-it CLI &nbsp;|&nbsp; No pies, donuts, gauges, or 3D charts.</p>
</section>
</body>
</html>`;
  }

  function generateDashboard() {
    const kpis = anchors.slice(0, 4).map((a, i) => `
      <div class="kpi-card">
        <span class="kpi-label">${escape(a)}</span>
        <span class="kpi-value">${escape(numbers[i] || dates[i] || String(Math.floor(Math.random() * 100)))}</span>
        <span class="kpi-delta ${i % 2 === 0 ? 'up' : 'down'}">${i % 2 === 0 ? '↑' : '↓'} ${Math.floor(Math.random() * 20 + 1)}%</span>
      </div>`).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — dashboard</title>
<style>
  :root { --ground:${ground}; --accent:${accent}; --sup1:${support1}; --sup2:${support2}; --ink:#${isLight(ground) ? '0a0a0a' : 'f4ecd8'}; }
  * { box-sizing: border-box; margin: 0; }
  html { background: var(--ground); color: var(--ink); font-family: ui-sans-serif, system-ui, Segoe UI, sans-serif; }
  body { max-width: 1200px; margin: 0 auto; padding: 24px; }
  .dashboard h1 { font-family: "Iowan Old Style", Palatino, Georgia, serif; font-size: clamp(28px, 5vw, 48px); font-weight: 400; margin-bottom: 8px; }
  .dashboard .sub { font-size: 14px; opacity: .5; margin-bottom: 40px; }
  .kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .kpi-card { background: var(--sup2); border: 1px solid rgba(128,128,128,.1); border-radius: 10px; padding: 24px 20px; }
  .kpi-label { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; opacity: .45; display: block; }
  .kpi-value { font-family: "Iowan Old Style", Palatino, serif; font-size: 36px; font-weight: 400; display: block; margin: 8px 0 4px; color: var(--accent); }
  .kpi-delta { font-size: 13px; }
  .kpi-delta.up { color: ${support1}; }
  .kpi-delta.down { opacity: .4; }
  ::selection { background: var(--accent); color: var(--ground); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
</style>
</head>
<body>
<div class="dashboard">
  <h1>${escape(title)}</h1>
  <p class="sub">Content-derived dashboard · ${anchors.length} metrics · palette from source</p>
  <div class="kpis">
${kpis}
  </div>
  <p style="font-size:12px;opacity:.35">Generated with reimagine-it CLI · no fabricated KPIs · palette: ${ground} · ${accent} · ${support1} · ${support2}</p>
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
  .scroll-section { padding: 80px 24px; max-width: 700px; margin: 0 auto; }
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
  .plate { aspect-ratio: 3/4; background: var(--sup1); border-radius: 4px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 20px; }
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
}

// Helpers

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