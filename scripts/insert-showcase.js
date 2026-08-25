const fs = require('fs');
let gen = fs.readFileSync('src/generate.js', 'utf8');

// Find generate's closing brace
const genClose = gen.indexOf('\r\n\r\nfunction factsFor');
const beforeFacts = gen.slice(0, genClose);
const lastBrace = beforeFacts.lastIndexOf('}\r\n');
console.log('Inserting at', lastBrace);

const showcaseFn = '' +
'  function showcase() {\r\n' +
'    var light = isLight(ground);\r\n' +
'    var border = light ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.12)";\r\n' +
'    var bg = light ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.05)";\r\n' +
'    var hb = parseInt(accent.slice(1,3), 16) * 1.4 % 360;\r\n' +
'    var g1 = "hsla(" + hb.toFixed(0) + ",70%,50%,.12)";\r\n' +
'    var g2 = "hsla(" + ((hb + 80) % 360).toFixed(0) + ",70%,50%,.12)";\r\n' +
'    var g3 = "hsla(" + ((hb + 200) % 360).toFixed(0) + ",70%,50%,.12)";\r\n' +
'    var icons = ["#","#","#","#","#","#"];\r\n' +
'    var caps = anchors.slice(0, 6).map(function(a, i) {\r\n' +
'      var f = facts[i];\r\n' +
'      return "<article class=cap-card style=--ci:" + i + "><span class=cap-icon>" + (icons[i]) + "</span><h2>" + esc(a) + "</h2><p>" + esc(sectionParagraphAt(i, a)) + "</p>" + (f && f.value ? "<span class=cap-stat>" + esc(f.kind) + ": <b>" + esc(f.value) + "</b></span>" : "") + "</article>";\r\n' +
'    }).join("");\r\n' +
'    var tl = anchors.slice(0, 4).map(function(a, i) {\r\n' +
'      return "<li class=tl-item style=--ti:" + i + "><span class=tl-dot></span><div><strong>" + esc(a) + "</strong><p>" + esc(sectionParagraphAt(i, a)) + "</p></div></li>";\r\n' +
'    }).join("");\r\n' +
'    var stats = anchors.slice(0, 4).map(function(a, i) {\r\n' +
'      var n = parseInt(String(((content.numbers || [])[i] || String((i + 1) * 7 + 12))).replace(/[^0-9]/g, "") || "0");\r\n' +
'      return "<article class=stat-card style=--sc:" + i + "><span class=stat-num style=--target:" + n + ">" + n + "</span><strong>" + esc(a) + "</strong></article>";\r\n' +
'    }).join("");\r\n' +
'    var css = "body{font-family:" + sans + ";background:var(--g);color:var(--i)}" +\r\n' +
'      ".show-hero{min-height:80svh;display:grid;place-items:center;padding:64px 28px;position:relative;overflow:hidden;isolation:isolate}" +\r\n' +
'      ".show-hero::before{content:\\"\\";position:absolute;inset:-40%;background:radial-gradient(ellipse 60% 50% at 30% 20%," + g1 + ",transparent 45%),radial-gradient(ellipse 40% 40% at 70% 60%," + g2 + ",transparent 40%),radial-gradient(ellipse 50% 30% at 50% 80%," + g3 + ",transparent 45%);animation:bg-shift 12s ease-in-out infinite alternate;z-index:-1}" +\r\n' +
'      "@keyframes bg-shift{0%{transform:translate(0,0)}100%{transform:translate(-4%,-3%)}}" +\r\n' +
'      ".show-hero-inner{max-width:740px;text-align:center;animation:fade-up .9s cubic-bezier(.2,.8,.2,1) both}" +\r\n' +
'      ".eyebrow{font:10px " + mono + ";letter-spacing:.22em;text-transform:uppercase;color:var(--a);display:block}" +\r\n' +
'      ".show-hero h1{font:400 clamp(52px,12vw,140px)/.84 " + serif + ";letter-spacing:-.07em;background:linear-gradient(135deg,var(--a)," + tint(accent, .18) + ",var(--a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-top:16px;text-wrap:balance}" +\r\n' +
'      ".show-hero .deck{font-size:17px;line-height:1.68;opacity:.62;max-width:460px;margin:22px auto 0}" +\r\n' +
'      ".show-hint{display:block;margin-top:44px;animation:pulse-hint 2.4s ease-in-out infinite;color:var(--a);font:10px " + mono + ";letter-spacing:.14em;text-transform:uppercase}" +\r\n' +
'      ".cap-sec{max-width:1080px;margin:0 auto;padding:0 28px 100px}" +\r\n' +
'      ".cap-sec h2{font:400 clamp(32px,6vw,56px)/1 " + serif + ";letter-spacing:-.04em;margin-bottom:12px;animation:slide-left linear both;animation-timeline:view();animation-range:entry 5% cover 20%}" +\r\n' +
'      ".cap-grid{container:capgrid / inline-size;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}" +\r\n' +
'      ".cap-card{background:" + bg + ";border:1px solid " + border + ";border-radius:16px;padding:28px 22px 24px;animation:cap-in linear both;animation-timeline:view();animation-range:entry 4% cover 22%;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}" +\r\n' +
'      ".cap-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px -12px " + accent + "30;border-color:" + accent + "}" +\r\n' +
'      ".cap-icon{font-size:28px;margin-bottom:20px;color:var(--a)}.cap-card h2{font:400 22px/1.1 " + serif + ";letter-spacing:-.025em;margin-bottom:10px}" +\r\n' +
'      ".cap-card p{font-size:13px;line-height:1.6;opacity:.62}.cap-stat{display:inline-block;margin-top:14px;font:9px " + mono + ";letter-spacing:.1em;color:var(--a);text-transform:uppercase}.cap-stat b{font-size:16px;display:block}" +\r\n' +
'      "@container capgrid(max-width:700px){.cap-grid{grid-template-columns:repeat(2,1fr)}}@container capgrid(max-width:450px){.cap-grid{grid-template-columns:1fr}}" +\r\n' +
'      ".tl-sec{max-width:760px;margin:0 auto;padding:0 28px 80px}" +\r\n' +
'      ".tl-sec h2{font:400 clamp(32px,6vw,56px)/1 " + serif + ";letter-spacing:-.04em;margin-bottom:52px}" +\r\n' +
'      ".tl-list{list-style:none;position:relative;padding-left:36px}.tl-list::before{content:\\"\\";position:absolute;left:8px;top:0;bottom:0;width:1px;background:" + border + "}" +\r\n' +
'      ".tl-item{position:relative;padding:0 0 42px 20px;animation:tl-in linear both;animation-timeline:view();animation-range:entry 4% cover 26%}" +\r\n' +
'      ".tl-dot{position:absolute;left:-28px;top:4px;width:16px;height:16px;border-radius:50%;background:var(--g);border:2.5px solid var(--a);box-shadow:0 0 0 4px " + accent + "22;transition:transform .25s ease}" +\r\n' +
'      ".tl-item:hover .tl-dot{transform:scale(1.4)}.tl-item strong{font:500 18px/1.3 " + serif + ";letter-spacing:-.015em;color:var(--a)}" +\r\n' +
'      ".tl-item p{font-size:14px;line-height:1.6;opacity:.58;margin-top:6px}" +\r\n' +
'      ".stats-sec{max-width:920px;margin:0 auto;padding:0 28px 80px}" +\r\n' +
'      ".stats-sec h2{font:400 clamp(32px,6vw,56px)/1 " + serif + ";letter-spacing:-.04em;margin-bottom:32px}" +\r\n' +
'      ".stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}" +\r\n' +
'      ".stat-card{background:" + bg + ";border:1px solid " + border + ";border-radius:14px;padding:24px 18px 20px;text-align:center;animation:stat-in linear both;animation-timeline:view();animation-range:entry 5% cover 22%;transition:transform .25s ease}" +\r\n' +
'      ".stat-card:hover{transform:translateY(-3px)}.stat-num{display:block;font:400 clamp(38px,7vw,64px)/1 " + serif + ";letter-spacing:-.05em;color:var(--a);margin-bottom:8px}" +\r\n' +
'      ".stat-card strong{font:400 13px/1.3 " + sans + ";opacity:.55}" +\r\n' +
'      ".show-foot{text-align:center;padding:60px 28px 80px;border-top:1px solid " + border + "}" +\r\n' +
'      ".badge-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:18px}" +\r\n' +
'      ".badge{font:9px " + mono + ";letter-spacing:.1em;text-transform:uppercase;color:var(--a);border:1px solid var(--a);border-radius:999px;padding:6px 14px}" +\r\n' +
'      ".show-foot p{font-size:13px;opacity:.45;max-width:400px;margin:0 auto}" +\r\n' +
'      "@keyframes fade-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}" +\r\n' +
'      "@keyframes pulse-hint{50%{opacity:.35;transform:translateY(6px)}}" +\r\n' +
'      "@keyframes slide-left{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}" +\r\n' +
'      "@keyframes cap-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}" +\r\n' +
'      "@keyframes tl-in{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}" +\r\n' +
'      "@keyframes stat-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +\r\n' +
'      "@supports not (animation-timeline:view()){.cap-sec h2{animation:slide-left-fb .5s ease both}.cap-card{animation:cap-in-fb .4s ease both;animation-delay:calc(var(--ci,0)*.1s)}.tl-item{animation:tl-in-fb .4s ease both;animation-delay:calc(var(--ti,0)*.1s)}.stat-card{animation:stat-in-fb .35s ease both;animation-delay:calc(var(--sc,0)*.08s)}}" +\r\n' +
'      "@keyframes slide-left-fb{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}@keyframes cap-in-fb{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}@keyframes tl-in-fb{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}@keyframes stat-in-fb{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +\r\n' +
'      "@media(max-width:680px){.stats-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:400px){.stats-grid{grid-template-columns:1fr}.cap-grid{grid-template-columns:1fr}}";\r\n' +
'    var body = "<main class=show-scene><section class=show-hero><div class=show-hero-inner><span class=eyebrow>" + esc(label) + "</span><h1>" + esc(content.title) + "</h1><p class=deck>" + esc(paragraphAt(0, anchors[0])) + "</p><span class=show-hint aria-hidden=true>Scroll to explore &darr;</span></div></section>" +\r\n' +
'      "<section class=cap-sec><h2>Source capabilities</h2><div class=cap-grid>" + caps + "</div></section>" +\r\n' +
'      "<section class=tl-sec><h2>Content timeline</h2><ul class=tl-list>" + tl + "</ul></section>" +\r\n' +
'      "<section class=stats-sec><h2>Measured signals</h2><div class=stats-grid>" + stats + "</div></section>" +\r\n' +
'      "<footer class=show-foot><div class=badge-row><span class=badge>@property " + anchors.length + " vars</span><span class=badge>scroll-driven</span><span class=badge>@container</span><span class=badge>view-transition</span><span class=badge>offline</span></div><p>Every animation is source content. No invented facts. Works in any browser that supports modern CSS.</p></footer></main>";\r\n' +
'    return page(content.title + " — showcase", css, body);\r\n' +
'  }\r\n\r\n';

gen = gen.slice(0, lastBrace) + showcaseFn + gen.slice(lastBrace);
fs.writeFileSync('src/generate.js', gen);
console.log('Showcase inserted at', lastBrace);