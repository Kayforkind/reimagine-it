const fs = require('fs');
let gen = fs.readFileSync('src/generate.js', 'utf8');

// === @property + view-transition ===
gen = gen.replace(
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="view-transition" content="same-origin">'
);

const rootVars = "':root{--g:' + ground + ';--a:' + accent + ';--m:' + muted + ';--s:' + surface + ';--i:' + ink + ';--drift:' + variation.drift + 'px;--radius:' + variation.radius + 'px}' +\r\n";
const propBlock = "'@property --g{syntax:\"<color>\";inherits:true;initial-value:#000}' +\r\n      '@property --a{syntax:\"<color>\";inherits:true;initial-value:#fff}' +\r\n      '@property --radius{syntax:\"<length>\";inherits:false;initial-value:4px}' +\r\n      '@property --drift{syntax:\"<length>\";inherits:false;initial-value:0px}' +\r\n      ";
gen = gen.replace(rootVars, propBlock + rootVars);

gen = gen.replace(
  "html{scroll-behavior:smooth}';\r\n",
  "html{scroll-behavior:smooth}' +\r\n" +
  "    '@view-transition{crossfade}' +\r\n" +
  "    '::view-transition-old(root){animation:vt-old .35s cubic-bezier(.4,0,.2,1) both}' +\r\n" +
  "    '::view-transition-new(root){animation:vt-new .35s cubic-bezier(.4,0,.2,1) both}' +\r\n" +
  "    '@keyframes vt-old{to{opacity:0;filter:blur(8px)}}' +\r\n" +
  "    '@keyframes vt-new{from{opacity:0;filter:blur(8px)}to{opacity:1;filter:none}}';\r\n"
);

// === Webpage scroll-in ===
const oldSection = ".section{display:grid;grid-template-columns:70px minmax(0,1fr);gap:24px;padding:46px 0;border-bottom:1px solid ' + border + '}";
const newSection = ".section{display:grid;grid-template-columns:70px minmax(0,1fr);gap:24px;padding:46px 0;border-bottom:1px solid ' + border + ';animation:sec-in linear both;animation-timeline:view();animation-range:entry 4% cover 28%}";
gen = gen.replace(oldSection, newSection);

const oldWebMedia = "'@media(max-width:700px){.hero{grid-template-columns:1fr}.stamp{justify-self:start;transform:none}.section{grid-template-columns:42px 1fr;gap:12px}}';";
const newWebMedia = "'@media(max-width:700px){.hero{grid-template-columns:1fr}.stamp{justify-self:start;transform:none}.section{grid-template-columns:42px 1fr;gap:12px}}' +\r\n" +
  "    '@keyframes sec-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}' +\r\n" +
  "    '@supports not (animation-timeline:view()){.section{opacity:1;animation:none}}';";
gen = gen.replace(oldWebMedia, newWebMedia);

// === Landing @container + scroll ===
gen = gen.replace(
  ".feature-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid ' + border + ';border-bottom:1px solid ' + border + '}",
  ".feature-grid{container:features / inline-size;display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid ' + border + ';border-bottom:1px solid ' + border + '}"
);

const oldFeature = ".feature{padding:28px 20px 34px 0;border-right:1px solid ' + border + ';margin-right:20px;transition:transform .25s ease,box-shadow .25s ease;border-radius:var(--radius)}";
const newFeature = ".feature{padding:28px 20px 34px 0;border-right:1px solid ' + border + ';margin-right:20px;transition:transform .25s ease,box-shadow .25s ease;border-radius:var(--radius);animation:feat-in linear both;animation-timeline:view();animation-range:entry 5% cover 25%}";
gen = gen.replace(oldFeature, newFeature);

const oldLandingResponsive = "'@media(max-width:800px){.feature-grid{grid-template-columns:repeat(2,1fr)}.feature:nth-child(2){border-right:0;margin-right:0}.feature:nth-child(n+3){border-top:1px solid ' + border + '}}' +\r\n" +
  "      '@media(max-width:480px){.feature-grid{grid-template-columns:1fr}.feature{border-right:0!important;margin-right:0!important;border-top:1px solid ' + border + '}.feature:first-child{border-top:0}}' +";
const newLandingResponsive = "'@container features(max-width:800px){.feature-grid{grid-template-columns:repeat(2,1fr)}.feature:nth-child(2){border-right:0;margin-right:0}.feature:nth-child(n+3){border-top:1px solid ' + border + '}}' +\r\n" +
  "      '@container features(max-width:500px){.feature-grid{grid-template-columns:1fr}.feature{border-right:0!important;margin-right:0!important;border-top:1px solid ' + border + '}.feature:first-child{border-top:0}}' +\r\n" +
  "      '@media(max-width:800px){.feature-grid{grid-template-columns:repeat(2,1fr)}.feature:nth-child(2){border-right:0;margin-right:0}.feature:nth-child(n+3){border-top:1px solid ' + border + '}}' +\r\n" +
  "      '@media(max-width:480px){.feature-grid{grid-template-columns:1fr}.feature{border-right:0!important;margin-right:0!important;border-top:1px solid ' + border + '}.feature:first-child{border-top:0}}' +";
gen = gen.replace(oldLandingResponsive, newLandingResponsive);

const oldFeatKey = "    '@keyframes feat-in{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}' +";
const newFeatKey = "    '@keyframes feat-in{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}' +\r\n" +
  "    '@supports not (container-type:inline-size){.feature-grid{container:unset}}' +\r\n" +
  "    '@supports not (animation-timeline:view()){.feature{animation:feat-in-fb .4s ease both;animation-delay:calc(var(--n,0)*.1s)}}' +\r\n" +
  "    '@keyframes feat-in-fb{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}' +";
gen = gen.replace(oldFeatKey, newFeatKey);

// === Dashboard @container + scroll ===
gen = gen.replace(
  ".metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}",
  ".metrics{container:metrics / inline-size;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}"
);

const oldMetric = ".metric{background:' + dSurface + ';border:1px solid rgba(255,255,255,.1);border-radius:var(--radius);padding:20px;min-height:190px;display:flex;flex-direction:column;transition:transform .25s ease,border-color .25s ease}.metric:hover{transform:translateY(-3px);border-color:' + dAccent + '80}";
const newMetric = ".metric{background:' + dSurface + ';border:1px solid rgba(255,255,255,.1);border-radius:var(--radius);padding:20px;min-height:190px;display:flex;flex-direction:column;transition:transform .25s ease,border-color .25s ease;animation:met-in linear both;animation-timeline:view();animation-range:entry 4% cover 24%}.metric:hover{transform:translateY(-3px);border-color:' + dAccent + '80}";
gen = gen.replace(oldMetric, newMetric);

const oldDashResponsive = "'@media(max-width:820px){.metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.console-head{display:block}.console-head p{text-align:left;margin-top:12px}.metrics{grid-template-columns:1fr}}' +";
const newDashResponsive = "'@container metrics(max-width:820px){.metrics{grid-template-columns:repeat(2,1fr)}}@container metrics(max-width:480px){.metrics{grid-template-columns:repeat(1,1fr)}}' +\r\n" +
  "      '@media(max-width:820px){.metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.console-head{display:block}.console-head p{text-align:left;margin-top:12px}.metrics{grid-template-columns:1fr}}' +";
gen = gen.replace(oldDashResponsive, newDashResponsive);

const oldMetKey = "    '@keyframes met-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}' +";
const newMetKey = "    '@keyframes met-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}' +\r\n" +
  "    '@supports not (animation-timeline:view()){.metric{animation:met-in-fb .35s ease both;animation-delay:calc(var(--n,0)*.08s)}}' +\r\n" +
  "    '@keyframes met-in-fb{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}' +";
gen = gen.replace(oldMetKey, newMetKey);

// === Infographic scroll ===
const oldChart = ".chart{border-top:1px solid ' + border + ';border-bottom:1px solid ' + border + ';padding:18px 0 22px}.chart table,.data table{border-collapse:collapse;width:100%}";
const newChart = oldChart + ".chart tbody tr{animation:row-in linear both;animation-timeline:view();animation-range:entry 3% cover 18%}";
gen = gen.replace(oldChart, newChart);

// === Photography scroll ===
const oldPlate = ".plate{position:relative;min-height:300px;overflow:hidden;border-radius:calc(var(--radius) / 2);background:var(--s)}";
const newPlate = ".plate{position:relative;min-height:300px;overflow:hidden;border-radius:calc(var(--radius) / 2);background:var(--s);animation:plate-in linear both;animation-timeline:view();animation-range:entry 4% cover 22%}";
gen = gen.replace(oldPlate, newPlate);

const oldPhotoMedia = "'@media(max-width:480px){.gallery{grid-template-columns:1fr}.plate,.plate.wide{grid-column:span 1;min-height:300px}}';";
const newPhotoMedia = "'@media(max-width:480px){.gallery{grid-template-columns:1fr}.plate,.plate.wide{grid-column:span 1;min-height:300px}}' +\r\n" +
  "    '@keyframes plate-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}' +\r\n" +
  "    '@keyframes row-in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}' +\r\n" +
  "    '@supports not (animation-timeline:view()){.plate{animation:plate-in-fb .4s ease both;animation-delay:calc(var(--n,0)*.09s)}.chart tbody tr{animation:row-in-fb .35s ease both;animation-delay:calc(var(--n,0)*.07s)}}' +\r\n" +
  "    '@keyframes plate-in-fb{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}' +\r\n" +
  "    '@keyframes row-in-fb{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}';";
gen = gen.replace(oldPhotoMedia, newPhotoMedia);

// === auto.js ===
let auto = fs.readFileSync('src/auto.js', 'utf8');
auto = auto.replace(
  "'glass', 'editorial', 'motion', 'gradient'];",
  "'glass', 'editorial', 'motion', 'gradient', 'showcase'];"
);
auto = auto.replace(
  "  if (token === 'gradient') score += items * 2 + (/brand|modern|color|vibrant|bold|fresh/.test(text) ? 10 : 0) + (content.headings || []).length;\r\n  if (token === 'webpage') score += 5 + (content.paragraphs || []).length * 2 + (content.headings || []).length;",
  "  if (token === 'gradient') score += items * 2 + (/brand|modern|color|vibrant|bold|fresh/.test(text) ? 10 : 0) + (content.headings || []).length;\r\n  if (token === 'showcase') score += (/demo|showcase|motion|catalog|capability|feature|lab/.test(text) ? 12 : 0) + (content.anchors || []).length * 2;\r\n  if (token === 'showcase' && (content.anchors || []).length < 4) score -= 8;\r\n  if (token === 'webpage') score += 5 + (content.paragraphs || []).length * 2 + (content.headings || []).length;"
);
auto = auto.replace(
  "    gradient: 'The source has signals that benefit from bold color meshing.',",
  "    gradient: 'The source has signals that benefit from bold color meshing.',\r\n    showcase: 'The source has enough anchors for a full CSS motion demonstration.',"
);
fs.writeFileSync('src/auto.js', auto);

fs.writeFileSync('src/generate.js', gen);
console.log('ALL CSS UPGRADES APPLIED');