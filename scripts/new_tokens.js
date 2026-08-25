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
      '.glass-panel{position:relative;border-radius:20px;background:' + glassBg + ';backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);border:1px solid ' + glassBorder + ';box-shadow:0 8px 32px ' + glassShadow + ';overflow:hidden;animation:glass-rise .6s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d);transform:rotate(var(--t))}' +
      '.glass-inner{position:relative;z-index:2;padding:32px 24px 28px}' +
      '.glass-no{font:10px ' + mono + ';color:var(--a);opacity:.72}' +
      '.glass-panel h2{font:400 26px/1.08 ' + serif + ';letter-spacing:-.03em;color:var(--i);margin:28px 0 14px}' +
      '.glass-panel p{font-size:14px;line-height:1.68;opacity:.68;max-width:36ch}' +
      '.glass-fact{display:flex;gap:10px;align-items:baseline;margin-top:18px;padding-top:16px;border-top:1px solid ' + glassBorder + '}' +
      '.glass-fact span{font:8.5px ' + mono + ';letter-spacing:.14em;text-transform:uppercase;color:var(--m)}' +
      '.glass-fact strong{font:500 18px ' + sans + ';color:var(--a)}' +
      '.glass-shine{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(255,255,255,' + (light ? '.24' : '.06') + ') 0%,transparent 50%);pointer-events:none}' +
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
      '.magazine{max-width:780px;margin:0 auto;padding:clamp(40px,8vw,100px) 28px 120px}' +
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
    var body = '<main class="magazine"><header class="magazine-header"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="deck">' + esc(paragraphAt(0, anchors[0])) + '</p></header><article><aside class="pull-quote" aria-label="Source pull quote">' + esc(pullQuoteText) + '</aside><p class="body-text"><span class="drop-cap" aria-hidden="true">' + esc(dropCap) + '</span>' + esc(bodyText) + '</p><p class="body-text">' + esc(bodyPara2) + '</p></article>' + sections + '<footer class="ed-footer"><span>' + anchors.length + ' source anchors</span><span>Content-Derived Design</span></footer></main>';
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
      '.reveal-num{position:absolute;left:0;top:44px;transform:translateX(-50%);width:28px;height:28px;border-radius:50%;background:var(--g);border:2px solid var(--a);display:grid;place-items:center;font:10px ' + mono + ';color:var(--a)}' +
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
      '.grad-deck{font-size:16px;line-height:1.68;opacity:.6;max-width:460px;margin:18px auto 0}' +
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
    return page(content.title + ' — gradient', css, '<main class="grad-scene"><header class="grad-head"><span class="eyebrow">' + esc(label) + '</span><h1>' + esc(content.title) + '</h1><p class="grad-deck">' + esc(paragraphAt(0, anchors[0])) + '</p></header><section class="grad-grid" aria-label="Source cards">' + cards + '</section><footer class="grad-foot"><span>' + anchors.length + ' source signals</span><span>Gradient mesh derived from palette</span></footer></main>');
  }
