# Show HN — reimagine-it v2.6.0

Paste this on https://news.ycombinator.com/submit (your HN account). Do not edit the title down to a slogan.

**Title:** Show HN: reimagine-it – redesign existing HTML from its own content (CLI)

**URL:** https://github.com/Kayforkind/reimagine-it

**Text:**

```
npx reimagine-it --auto -i page.html -o redesign.html
```

Paste HTML. Get one standalone page — offline, no CDN, no Figma. The engine reads headings, facts, names, dates, numbers, links, emails, and hex colors already in the file. It does not invent a SaaS landing page.

Auto scores the source into a subject lane (game, festival, skate, food, fashion, architecture, ops, …) and will not put two tokens from the same silhouette on the shortlist. Nine committed journeys:

- crypto battle royale → gradient
- music festival → cinematic
- skate brand → artistic
- juice bar → landing
- streetwear drop → photography
- living building → 3js (+ editorial + svg)
- observability → dashboard
- bakery bake gallery → photography
- city budget report → infographic (timeline first fold)

Live playground (no install): https://kayforkind.github.io/reimagine-it/#playground
Results: https://kayforkind.github.io/reimagine-it/#results

Also: `variations`, `lock` / `--ref`, and `audit` (19 Design Health rules). MCP: `npx -y --package reimagine-it reimagine-it-mcp`.
```

Post after `v2.6.0` is on npm (`npm view reimagine-it version` → 2.6.0). HN punishes a demo that `npx` cannot reproduce.
