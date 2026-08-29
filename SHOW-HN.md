# Show HN Draft — reimagine-it v2.4.4

**Title:** Show HN: reimagine-it — redesign existing HTML from its own content (CLI + agent skill)

---

Paste HTML. Run one command. Ship a standalone page — not a mood board.

```bash
npx reimagine-it --auto -i your-page.html -o redesign.html
npx reimagine-it -i source.html -t dashboard
npx reimagine-it -i menu.html --dry
```

The engine reads headings, facts, names, dates, numbers, links, emails, and colors already in the file, then writes a new HTML page in one of 15 directions. Source facts stay source facts.

**Seven journeys:** [`examples/end-users/`](examples/end-users/) — Venator, Crimson Circuit, Velocita, Maracuyá, Flick, Meridian, Horizon.

```
npx skills add Kayforkind/reimagine-it
npx reimagine-it --auto -i page.html -o redesign.html
```

**Live demo:** [kayforkind.github.io/reimagine-it](https://kayforkind.github.io/reimagine-it/)
**Repo:** [github.com/Kayforkind/reimagine-it](https://github.com/Kayforkind/reimagine-it)
