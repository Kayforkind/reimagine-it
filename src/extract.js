/**
 * Content extraction engine — the same method the agent skill uses,
 * now as a standalone library for the CLI.
 */

const PALETTE_PRESETS = {
  saas: ['#08141a', '#3ae098', '#1a3a5c', '#e8a63f'],
  essay: ['#e8e0d4', '#c23a2a', '#5a5a6e', '#f0c060'],
  food: ['#f4efe4', '#d4882b', '#5c8a3f', '#c93a3a'],
  default: ['#1a2138', '#d97757', '#e8a63f', '#f4ecd8'],
};

const COLOR_NAMES = {
  red: '#c23a2a', blue: '#3a6ea5', green: '#5c8a3f', yellow: '#e8a63f',
  orange: '#d97757', purple: '#7b5ea7', teal: '#3ae098', navy: '#1a3a5c',
  cream: '#f4ecd8', white: '#ffffff', black: '#0a0a0a', gray: '#6e6e6e',
  brown: '#8b5e3c', pink: '#d4888b', gold: '#e8a63f', silver: '#c0c0c0',
};

function extractContent(html, filePath) {
  // Strip scripts and styles
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract title: <title> first, then <h1>, then filename, then 'Untitled'
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const titleRaw = titleMatch ? titleMatch[1].trim() : h1Match ? h1Match[1].trim() : null;
  const title = titleRaw || (filePath ? require('path').basename(filePath, '.html').replace(/^before$/, 'Untitled') : 'Untitled');

  // Extract colors from inline styles, CSS vars, hex values
  const hexColors = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const uniqueHex = [...new Set(hexColors.map(c => c.toLowerCase()))]
    .filter(c => !['#ffffff', '#fff', '#000000', '#000'].includes(c))
    .slice(0, 4);

  // Check for color names in text
  const foundColors = [];
  for (const [name, hex] of Object.entries(COLOR_NAMES)) {
    if (text.toLowerCase().includes(name)) {
      foundColors.push(hex);
    }
  }

  // Derive palette from content
  let palette;
  const fullText = text.toLowerCase();
  if (fullText.includes('observability') || fullText.includes('traces') || fullText.includes('infrastructure')) {
    palette = PALETTE_PRESETS.saas;
  } else if (fullText.includes('lighthouse') || fullText.includes('essay') || fullText.includes('memoir')) {
    palette = PALETTE_PRESETS.essay;
  } else if (fullText.includes('menu') || fullText.includes('recipe') || fullText.includes('dish') || fullText.includes('restaurant')) {
    palette = PALETTE_PRESETS.food;
  } else if (uniqueHex.length >= 3) {
    palette = uniqueHex.slice(0, 4);
  } else if (foundColors.length >= 3) {
    palette = [...new Set(foundColors)].slice(0, 4);
  } else {
    palette = uniqueHex.concat(foundColors).slice(0, 4);
    if (palette.length < 3) palette = PALETTE_PRESETS.default;
  }

  // Extract nouns (capitalized words that aren't sentence starts)
  const words = text.split(/\s+/);
  const properNouns = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^a-zA-Z]/g, '');
    if (w.length > 2 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase()
        && !['The', 'This', 'That', 'And', 'But', 'For', 'From', 'With', 'When', 'Where', 'What', 'How', 'Who', 'Which', 'There', 'Their', 'These', 'Those', 'About', 'After', 'Before', 'During', 'While', 'Since', 'Until', 'Above', 'Below', 'Under', 'Over', 'Into', 'Upon', 'Within', 'Without'].includes(w)) {
      properNouns.push(w);
    }
  }
  const uniqueProper = [...new Set(properNouns)].slice(0, 8);

  // Extract dates
  const datePattern = /\b(?:18|19|20)\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:18|19|20)\d{2}\b|\b\d{1,2}\/\d{1,2}\/(?:18|19|20)\d{2}\b/gi;
  const dates = [...new Set(text.match(datePattern) || [])].slice(0, 6);

  // Extract numbers
  const numberPattern = /\b\d+(?:\.\d+)?(?:\s*(?:px|em|rem|%|dollars|USD|EUR|GBP|years|months|weeks|days|hours|minutes|seconds|miles|km|meters|kg|lb|oz))?\b/g;
  const numbers = [...new Set(text.match(numberPattern) || [])]
    .filter(n => !dates.includes(n))
    .filter(n => parseInt(n) > 1)
    .slice(0, 6);

  // Extract paragraphs
  const paraPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const paragraphs = [];
  let m;
  while ((m = paraPattern.exec(html)) !== null) {
    const p = m[1].replace(/<[^>]+>/g, '').trim();
    if (p.length > 20) paragraphs.push(p);
  }

  // Extract emails
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emails = [...new Set(text.match(emailPattern) || [])];

  // Derive anchors (3-5 concrete things the design must serve)
  const nouns = [];
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (clean.length > 3 && !['this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'about', 'which', 'there', 'would', 'could', 'should', 'other', 'some', 'only', 'also', 'more', 'into', 'over', 'after', 'before', 'between', 'through', 'during', 'above', 'below', 'under'].includes(clean)) {
      nouns.push(clean);
    }
  }
  // Frequency count for common nouns
  const freq = {};
  for (const n of nouns) { freq[n] = (freq[n] || 0) + 1; }
  const topNouns = Object.entries(freq)
    .filter(([w]) => w.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  return {
    title,
    palette,
    nouns: topNouns,
    properNouns: uniqueProper,
    dates,
    numbers,
    paragraphs: paragraphs.slice(0, 5),
    emails,
    anchors: topNouns.slice(0, 5),
  };
}

module.exports = { extractContent };