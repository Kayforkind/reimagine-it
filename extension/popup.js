/**
 * Reimagine This Page — browser extension popup script.
 *
 * The popup extracts the active page, shows the same signals as the CLI, and
 * opens a standalone result using the bundled engine. There is deliberately no
 * second renderer here: extension, playground, and CLI share one source of
 * truth.
 */

(function() {
  var currentToken = 'webpage';
  var pageContent = null;
  var engine = typeof window !== 'undefined' ? {
    extract: window.ReimagineExtract,
    generate: window.ReimagineGenerate,
    auto: window.ReimagineAuto,
  } : null;

  function showError(message) {
    var info = document.getElementById('extractInfo');
    info.textContent = '';
    var label = document.createElement('div');
    label.className = 'label';
    label.textContent = 'Error';
    var value = document.createElement('div');
    value.className = 'val';
    value.textContent = message;
    info.appendChild(label);
    info.appendChild(value);
    document.getElementById('runBtn').disabled = true;
  }

  // ── Token selection ──────────────────────────────────────────
  var tokenBtns = document.querySelectorAll('.token-btn');
  tokenBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tokenBtns.forEach(function(other) { other.classList.remove('active'); });
      btn.classList.add('active');
      currentToken = btn.dataset.token;
    });
  });

  if (!engine || !engine.extract || !engine.generate || !engine.auto) {
    showError('The local engine bundle is missing. Reinstall or reload the extension.');
    return;
  }

  // ── Extract from the active tab ──────────────────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    if (!tab) {
      showError('No active tab was found.');
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        var titleNode = document.querySelector('title');
        var headingNode = document.querySelector('h1');
        var title = titleNode ? titleNode.textContent.trim() : headingNode ? headingNode.textContent.trim() : 'Untitled';
        var paras = [];
        document.querySelectorAll('p').forEach(function(node) {
          var text = node.textContent.trim();
          if (text.length > 20) paras.push(text);
        });
        var items = [];
        document.querySelectorAll('li').forEach(function(node) {
          var text = node.textContent.trim();
          if (text) items.push(text);
        });
        return {
          title: title,
          paras: paras.slice(0, 8),
          items: items.slice(0, 16),
          sourceHtml: document.documentElement ? document.documentElement.outerHTML.slice(0, 1000000) : '',
        };
      },
    }, function(results) {
      if (chrome.runtime.lastError || !results || !results[0] || !results[0].result) {
        showError('Cannot read this page (browser restriction).');
        return;
      }

      var data = results[0].result;
      var content = engine.extract.extractContent(data.sourceHtml, 'active-page.html');
      pageContent = { data: data, content: content };

      var info = document.getElementById('extractInfo');
      info.textContent = '';
      var title = document.createElement('div');
      title.className = 'label';
      title.textContent = 'Extracted from page';
      info.appendChild(title);

      function addSignal(label, value) {
        if (!value) return;
        var row = document.createElement('div');
        var key = document.createElement('span');
        key.className = 'label';
        key.textContent = label + ': ';
        var val = document.createElement('span');
        val.className = 'val';
        val.textContent = value;
        row.appendChild(key);
        row.appendChild(val);
        info.appendChild(row);
      }

      addSignal('Title', content.title);
      addSignal('Profile', content.profile + ' · ' + content.density);
      addSignal('Palette', [content.palette.ground, content.palette.accent, content.palette.muted].join(' / '));
      addSignal('Dates', content.dates.slice(0, 4).join(', '));
      addSignal('Numbers', content.numbers.slice(0, 4).join(', '));
      addSignal('Anchors', content.anchors.slice(0, 4).join(', '));
      addSignal('Paragraphs', String(content.paragraphs.length));
    });
  });

  // ── Run ──────────────────────────────────────────────────────
  document.getElementById('runBtn').addEventListener('click', function() {
    if (!pageContent) return;

    var result;
    if (currentToken === 'auto') {
      result = engine.auto.autoGenerate(pageContent.content).output;
    } else {
      result = engine.generate.generate({ content: pageContent.content, token: currentToken });
    }

    var blob = new Blob([result], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    chrome.tabs.create({ url: url });
  });
})();
