# Show HN Draft — reimagine-it

**Title:** Show HN: reimagine-it — an AI agent skill that redesigns any file from its own content

---

Paste a file. Type `/reimagine-it webpage`. Ship a real artifact — not a mood board.

Same naive HTML. Different pages depending on what *your* content is actually about. A Texas notebook gets navy, cream, and a sunset shader because the source names the Lone Star flag and Big Bend. A SaaS observability page gets dark teal and trace-wave paths because it mentions "traces" and "water balloon." The palette, motifs, and motion are all derived from the content — nothing is hard-coded.

**Five sources, one method, zero templates.**
- Texas notebook → dashboards, editorial covers, shader-lit heroes, infographic posters
- Jules Ice Cream → parlor DNA (counter, cone, freezer), not a Texas reskin
- Pulsewave SaaS → dark teal, pulse-ring SVG, KPI dashboard
- Two Lights essay → slate + cream + lighthouse beam sweep
- Saffron & Smoke menu → warm clay + saffron + smoke-drift + flame-flicker

**Works in Claude Code, Cursor, Codex, Copilot, Gemini CLI:**

```
npx skills add Kayforkind/reimagine-it
/reimagine-it webpage
/reimagine-it infographic
/reimagine-it svg
/reimagine-it 3js
/reimagine-it simulation
```

**But you don't need an agent to try it.** I just shipped a browser playground on the gallery page — paste any HTML, pick a token, see the redesign live in an iframe. The client-side engine extracts nouns, colors, dates, and numbers from your source, builds a palette, and renders a token-specific page. Same method. No install.

**Live demo:** [kayforkind.github.io/reimagine-it](https://kayforkind.github.io/reimagine-it/)
**Repo:** [github.com/Kayforkind/reimagine-it](https://github.com/Kayforkind/reimagine-it)

Every output is a single `.html` file — offline, no CDN, no Figma. The infographic is a real statistical poster (common-scale timeline, ISOTYPE units, data table), not a fake dashboard. The SVG has micro-motion tied to facts. The 3D room ships vendored Three.js r185.

**Three hard guarantees v2.2:**
1. Same-format twin by default (point at a `.pdf`, get back a `.pdf`)
2. Visual verification pass on every render (no lorem, no blank plates, no placeholder "TBD")
3. Craft floor: compositor-only motion, `:focus-visible` rings, no `transition: all`, `prefers-reduced-motion` respected by decomposing (not by hiding focus rings)

I built this over the last week. Would love feedback on which domains / modifiers / forms you'd want next. The repo's discussion board has the roadmap.

Thanks for looking —