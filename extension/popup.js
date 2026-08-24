/**
 * Reimagine This Page — browser extension popup script.
 *
 * Extracts content from the active tab, shows what the engine found,
 * and opens the redesigned page in a new tab using the same in-browser
 * generation engine as the playground.
 */

(function() {
  var currentToken = 'webpage';
  var pageContent = null;

  // ── Token selection ──────────────────────────────────────────
  var tokenBtns = document.querySelectorAll('.token-btn');
  tokenBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tokenBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentToken = btn.dataset.token;
    });
  });

  // ── Color map (same as playground) ───────────────────────────
  var COLOR_MAP = {
    'red': '#c23a2a', 'blue': '#2563eb', 'navy': '#1c2d3d', 'green': '#16a34a',
    'teal': '#0d9488', 'gold': '#e8a63f', 'amber': '#e8a63f', 'orange': '#ea580c',
    'purple': '#7c3aed', 'pink': '#db2777', 'cream': '#f4ecd8', 'white': '#ffffff',
    'black': '#1a1a1a', 'charcoal': '#2d2d2d', 'slate': '#475569', 'grey': '#6b7280',
    'gray': '#6b7280', 'brown': '#78350f', 'copper': '#b45309', 'saffron': '#d4882b',
    'clay': '#c67a3d', 'ocean': '#0e7490', 'sky': '#38bdf8', 'lime': '#84cc16',
    'indigo': '#4f46e5', 'rose': '#e11d48', 'violet': '#8b5cf6', 'mint': '#059669',
    'olive': '#4d7c0f', 'maroon': '#7f1d1d', 'coral': '#f43f5e', 'forest': '#166534',
    'sage': '#4ade80', 'sand': '#d4a373', 'ink': '#1a2138', 'shadow': '#18181b',
    'dusk': '#312e81', 'sunrise': '#f59e0b', 'flame': '#dc2626'
  };

  function extractFromText(text) {
    var lower = text.toLowerCase();
    var colors = [];
    Object.keys(COLOR_MAP).forEach(function(c) {
      if (lower.indexOf(c) !== -1) colors.push({ word: c, hex: COLOR_MAP[c] });
    });
    var dateMatches = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g) || [];
    var dates = [];
    dateMatches.forEach(function(d) { if (dates.indexOf(d) === -1) dates.push(d); });
    var numMatches = text.match(/\b(\d+[.,]?\d*)\s*(?:ms|s|min|hr|hour|day|week|month|year|seat|user|people|person|dollar|gb|mb|kb|px|em|rem|rpm|acres|miles|km|metres|meters|feet|ft|pounds|kg|g|oz|%)\b/gi) || [];
    var nums = [];
    numMatches.forEach(function(n) { if (nums.indexOf(n) === -1) nums.push(n); });
    var emailMatches = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g) || [];
    var proper = [];
    var words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    var stop = ['The','A','An','In','On','At','To','For','Of','And','Or','But','We','It','Is','Be','Are','This','That','Its','Each','All','Has','Not','Our','Your','With','From','They','You','Can','Will','Get','See','Try','Use','Open','Close','Free','New','Every','Any','Some','Many','More','Most','Less','Few','Only','Just','Also','Here','There','Now','Then','Still','Next','Last','First','Early','Late','Good','Bad','Big','Small','High','Low','Long','Short','Old','No','Yes','One','Two','Three','Four','Five'];
    words.forEach(function(w) { if (stop.indexOf(w) === -1 && w.length > 2 && proper.indexOf(w) === -1) proper.push(w); });
    return { colors: colors, dates: dates, nums: nums, emails: emailMatches, proper: proper.slice(0, 6) };
  }

  function pickPalette(content, title) {
    var p = { ground: '#ffffff', panel: '#f5f5f5', ink: '#1a1a1a', dim: '#6b7280', accent: '#2563eb' };
    if (content.colors.length >= 2) { p.accent = content.colors[0].hex; p.ink = content.colors[1].hex; }
    else if (content.colors.length === 1) { p.accent = content.colors[0].hex; }
    var lower = (title || '').toLowerCase();
    if (/night|dark|black|shadow|void|navy/.test(lower)) { p.ground = '#0d1624'; p.panel = '#152238'; p.ink = '#e5e7eb'; }
    if (/warm|fire|flame|sun|gold|amber|saffron|clay|earth/.test(lower)) { p.ground = '#f4ecd8'; p.panel = '#ede6d8'; p.ink = '#1e1814'; if (p.accent === '#2563eb') p.accent = '#d4882b'; }
    if (/garden|green|forest|nature|fresh|mint|herb|leaf/.test(lower)) { p.accent = '#059669'; }
    if (/ocean|sea|marine|water|wave|river|lake|coast|beach|bay/.test(lower)) { p.accent = '#0e7490'; p.ground = '#e8f4f8'; }
    return p;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function generatePage(title, paras, items, content, token) {
    var pal = pickPalette(content, title);
    var ground = pal.ground;
    if (token === 'dashboard') ground = '#0d1624';
    if (token === 'infographic' || token === 'artistic' || token === 'photography') ground = pal.ground;
    if (token === 'landing' || token === 'cinematic') ground = '#0a1626';

    var page = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + ' — reimagined</title>';
    page += '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;line-height:1.5}::selection{background:' + pal.accent + ';color:' + ground + '}';
    page += ':focus-visible{outline:2px solid ' + pal.accent + ';outline-offset:2px}';
    page += '@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation-duration:.001ms!important}}';
    page += '.card{padding:22px;border-radius:12px;border:1px solid rgba(0,0,0,.06)}';
    page += '</style></head><body style="background:' + ground + ';color:' + pal.ink + '">';

    if (token === 'webpage' || token === 'landing') {
      page += '<div style="padding:64px 28px;max-width:800px;margin:0 auto">';
      page += '<h1 style="font-size:clamp(32px,5vw,52px);line-height:1.08;color:' + pal.accent + '">' + esc(title) + '</h1>';
      if (paras[0]) page += '<p style="margin-top:16px;font-size:16px;opacity:.7;max-width:44ch">' + esc(paras[0]) + '</p>';
      if (items.length) {
        page += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:32px">';
        items.slice(0, 6).forEach(function(item, i) {
          page += '<div class="card" style="background:' + pal.panel + '"><h3 style="font-size:18px;color:' + pal.accent + '">' + esc(item.split(/[·•|–—-]/)[0].trim()) + '</h3></div>';
        });
        page += '</div>';
      }
      page += '</div>';
    } else if (token === 'infographic') {
      page += '<div style="max-width:800px;margin:0 auto;padding:48px 28px">';
      page += '<h1 style="font-size:clamp(28px,4vw,44px);color:' + pal.accent + '">' + esc(title) + '</h1>';
      if (paras[0]) page += '<p style="font-size:15px;opacity:.7;max-width:52ch;margin-top:12px">' + esc(paras[0]) + '</p>';
      if (content.dates.length >= 2) {
        page += '<div style="margin-top:32px"><h2 style="font-size:16px;color:' + pal.accent + '">Timeline</h2><div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:12px">';
        content.dates.forEach(function(d) { page += '<div style="text-align:center"><div style="width:8px;height:8px;border-radius:50%;background:' + pal.accent + ';margin:0 auto 6px"></div><span style="font-weight:600">' + esc(d) + '</span></div>'; });
        page += '</div></div>';
      }
      if (content.nums.length) {
        page += '<div style="margin-top:32px"><h2 style="font-size:16px;color:' + pal.accent + '">By the numbers</h2><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px">';
        content.nums.slice(0, 6).forEach(function(n) { page += '<div class="card" style="background:' + pal.panel + ';padding:14px 18px"><span style="font-size:22px;font-weight:700;color:' + pal.accent + '">' + esc(n) + '</span></div>'; });
        page += '</div></div>';
      }
      page += '</div>';
    } else if (token === 'dashboard') {
      page += '<div style="padding:28px;max-width:800px;margin:0 auto">';
      page += '<h1 style="font-size:28px;color:' + pal.accent + '">' + esc(title) + '</h1>';
      if (content.nums.length) {
        page += '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:24px">';
        content.nums.slice(0, 4).forEach(function(n) {
          page += '<div class="card" style="background:' + pal.panel + ';flex:1;min-width:120px;padding:18px"><div style="font-size:28px;font-weight:700;color:' + pal.accent + '">' + esc(n) + '</div></div>';
        });
        page += '</div>';
      }
      page += '</div>';
    } else if (token === 'artistic') {
      page += '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 28px">';
      page += '<div style="max-width:700px;text-align:center">';
      page += '<h1 style="font-size:clamp(40px,7vw,80px);font-style:italic;line-height:1.04;color:' + pal.accent + '">' + esc(title.split(' ').slice(0, 4).join(' ')) + '</h1>';
      if (paras[0]) page += '<p style="font-size:16px;opacity:.6;max-width:44ch;margin:24px auto 0">' + esc(paras[0]) + '</p>';
      page += '</div></div>';
    } else if (token === 'cinematic') {
      page += '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">';
      page += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,' + pal.accent + ',transparent 70%);opacity:.15"></div>';
      page += '<div style="position:relative;text-align:center"><h1 style="font-size:clamp(40px,8vw,80px);color:' + pal.accent + '">' + esc(title) + '</h1>';
      if (content.proper[0]) page += '<p style="margin-top:16px;font-size:16px;opacity:.5">' + esc(content.proper.slice(0, 3).join(' · ')) + '</p>';
      page += '</div></div>';
    } else if (token === 'svg') {
      page += '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center">';
      page += '<svg viewBox="0 0 400 400" width="400" height="400">';
      page += '<rect width="400" height="400" fill="' + ground + '"/>';
      page += '<polygon points="200,110 230,185 310,185 245,230 270,310 200,260 130,310 155,230 90,185 170,185" fill="' + pal.accent + '" style="animation:breathe 3s ease-in-out infinite;transform-origin:200px 210px"/>';
      content.proper.slice(0, 5).forEach(function(p, i) {
        var angle = (i / 5) * Math.PI * 2;
        var px = 200 + Math.cos(angle) * 120;
        var py = 210 + Math.sin(angle) * 120;
        page += '<circle cx="' + px.toFixed(0) + '" cy="' + py.toFixed(0) + '" r="3" fill="' + pal.accent + '"/>';
        page += '<text x="' + (px + 8).toFixed(0) + '" y="' + (py + 4).toFixed(0) + '" font-size="11" fill="' + pal.ink + '">' + esc(p) + '</text>';
      });
      page += '<text x="200" y="390" text-anchor="middle" font-size="13" fill="' + pal.accent + '" opacity="0.6">' + esc(title) + '</text>';
      page += '</svg>';
      page += '<style>@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}</style>';
      page += '</div>';
    } else if (token === 'simulation') {
      page += '<div style="padding:28px;max-width:800px;margin:0 auto">';
      page += '<h1 style="font-size:clamp(28px,4vw,44px);color:' + pal.accent + '">' + esc(title) + '</h1>';
      page += '<p style="font-size:14px;opacity:.5;margin-top:8px">Timeline of events from the page</p>';
      page += '<div style="position:relative;height:200px;margin:40px 0;padding:0 48px">';
      page += '<div style="position:absolute;top:50%;left:48px;right:48px;height:4px;background:' + pal.dim + ';border-radius:2px"></div>';
      content.dates.slice(0, 8).forEach(function(d, i) {
        var pct = content.dates.length > 1 ? (i / (content.dates.length - 1)) * 100 : 50;
        page += '<div style="position:absolute;left:' + pct.toFixed(1) + '%;top:50%;transform:translate(-50%,-50%);text-align:center">';
        page += '<div style="width:12px;height:12px;border-radius:50%;background:' + pal.accent + ';margin:0 auto 6px"></div>';
        page += '<span style="font-size:12px;font-weight:600;color:' + pal.accent + '">' + esc(d) + '</span>';
        if (content.proper[i]) page += '<br><span style="font-size:10px;opacity:.5">' + esc(content.proper[i]) + '</span>';
        page += '</div>';
      });
      page += '</div></div>';
    } else {
      // photography
      page += '<div style="padding:48px 28px;max-width:800px;margin:0 auto">';
      page += '<h1 style="font-size:clamp(28px,5vw,40px);color:' + pal.accent + '">' + esc(title) + '</h1>';
      if (items.length) {
        page += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:32px">';
        items.slice(0, 6).forEach(function(item, i) {
          page += '<div class="card" style="background:' + pal.panel + ';aspect-ratio:3/4;display:flex;align-items:flex-end;padding:20px"><span style="font-size:13px;opacity:.85">' + esc(item.split(/[·•|–—-]/)[0].trim()) + '</span></div>';
        });
        page += '</div>';
      }
      page += '</div>';
    }

    page += '<div style="padding:24px 28px;font-size:12px;opacity:.35;border-top:1px solid rgba(128,128,128,.12)">Reimagined with <a href="https://github.com/Kayforkind/reimagine-it" style="color:' + pal.accent + '">reimagine-it</a> browser extension · Palette: ' + pal.ground + ' · ' + pal.accent + ' · Token: ' + token + '</div>';
    page += '</body></html>';
    return page;
  }

  // ── Extract from the active tab ──────────────────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    if (!tab) return;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        var title = document.title || (document.querySelector('h1') ? document.querySelector('h1').textContent : 'Untitled');
        var paras = [];
        document.querySelectorAll('p').forEach(function(p) {
          var t = p.textContent.trim();
          if (t.length > 20) paras.push(t);
        });
        var items = [];
        document.querySelectorAll('li').forEach(function(li) {
          var t = li.textContent.trim();
          if (t) items.push(t);
        });
        var headings = [];
        document.querySelectorAll('h1,h2,h3').forEach(function(h) {
          headings.push(h.textContent.trim());
        });
        var bodyText = document.body ? document.body.innerText : '';
        return {
          title: title,
          paras: paras.slice(0, 5),
          items: items.slice(0, 10),
          headings: headings.slice(0, 8),
          bodyText: bodyText.slice(0, 5000)
        };
      }
    }, function(results) {
      if (chrome.runtime.lastError || !results || !results[0]) {
        document.getElementById('extractInfo').innerHTML =
          '<div class="label">Error</div><div class="val">Cannot read this page (browser restriction).</div>';
        document.getElementById('runBtn').disabled = true;
        return;
      }

      var data = results[0].result;
      var extracted = extractFromText(data.bodyText);
      pageContent = { data: data, extracted: extracted };

      var info = document.getElementById('extractInfo');
      var html = '<div class="label">Extracted from page</div>';
      html += '<div><span class="label">Title:</span> <span class="val">' + esc(data.title) + '</span></div>';
      if (extracted.colors.length) {
        html += '<div><span class="label">Colors:</span> <span class="val">' + extracted.colors.map(function(c) { return c.word; }).join(', ') + '</span></div>';
      }
      if (extracted.dates.length) {
        html += '<div><span class="label">Dates:</span> <span class="val">' + extracted.dates.slice(0, 4).join(', ') + '</span></div>';
      }
      if (extracted.nums.length) {
        html += '<div><span class="label">Numbers:</span> <span class="val">' + extracted.nums.slice(0, 4).join(', ') + '</span></div>';
      }
      if (extracted.proper.length) {
        html += '<div><span class="label">Nouns:</span> <span class="val">' + extracted.proper.slice(0, 4).join(', ') + '</span></div>';
      }
      html += '<div><span class="label">Paragraphs:</span> <span class="val">' + data.paras.length + '</span></div>';
      info.innerHTML = html;
    });
  });

  // ── Run ──────────────────────────────────────────────────────
  document.getElementById('runBtn').addEventListener('click', function() {
    if (!pageContent) return;
    var d = pageContent.data;
    var e = pageContent.extracted;
    var page = generatePage(d.title, d.paras, d.items, e, currentToken);

    // Open generated page in a new tab
    var blob = new Blob([page], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    chrome.tabs.create({ url: url });
  });
})();
