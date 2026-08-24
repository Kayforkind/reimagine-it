/** Report which detected source values survive in generated HTML. */

function valuesInOutput(output, values) {
  return values.map(function(value) {
    var text = String(value == null ? '' : value);
    var decoded = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    var encoded = decoded.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return { value: text, preserved: !text || output.indexOf(text) >= 0 || output.indexOf(decoded) >= 0 || output.indexOf(encoded) >= 0 };
  });
}

function sourceFidelity(content, output) {
  var checks = {
    title: valuesInOutput(output, content.title ? [content.title] : []),
    headings: valuesInOutput(output, content.headings || []),
    dates: valuesInOutput(output, content.dates || []),
    numbers: valuesInOutput(output, content.numbers || []),
    emails: valuesInOutput(output, content.emails || []),
    anchors: valuesInOutput(output, content.anchors || []),
    links: (content.links || []).map(function(link) {
      return { value: link.href, label: link.label, preserved: output.indexOf(link.href) >= 0 };
    }),
  };
  var all = [];
  Object.keys(checks).forEach(function(key) { all = all.concat(checks[key]); });
  var preserved = all.filter(function(item) { return item.preserved; }).length;
  return { preserved: preserved, detected: all.length, percentage: all.length ? Math.round(preserved * 100 / all.length) : 100, checks: checks };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { sourceFidelity: sourceFidelity };
if (typeof window !== 'undefined') window.ReimagineResult = { sourceFidelity: sourceFidelity };
