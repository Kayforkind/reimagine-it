"""Content-aware swap: replaces Jordan-Rivers-the-developer content in
every gold after.html with Texas-notebook content (Alamo / Big Bend /
Austin, Lone Star flag / Bluebonnet / Longhorn).

Why this exists:
  /reimagine-it is *content-aware*. Its visual choices (palette, motifs,
  motion) are supposed to emerge from what the source page is about. The
  gold demo therefore ships with a naive `before.html` that is about
  Texas, and the eight after pages redesign THAT content — which is why
  the Lone-Star palette and star motif land as content-appropriate
  choices instead of a fixed theme applied to unrelated content.

Idempotent. Safe to re-run. Ordered longest/most-specific first so
shorter patterns do not clobber longer ones that were meant to catch
richer context.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TARGETS = [
    ROOT / "gold/webpage/after.html",
    ROOT / "gold/domains/artistic/after.html",
    ROOT / "gold/domains/dashboard/after.html",
    ROOT / "gold/domains/photography/after.html",
    ROOT / "gold/domains/cinematic/after.html",
    ROOT / "gold/modifiers/cinematic-glassmorphism/after.html",
    ROOT / "gold/modifiers/dashboard-bento/after.html",
    ROOT / "gold/modifiers/landing-neon/after.html",
]

SWAPS: list[tuple[str, str]] = [
    # ================================================================
    # TITLE TAGS
    # ================================================================
    ("Jordan Rivers &mdash; small machines, out loud (cinema + glass)",
     "Texas notebook &mdash; a Lone-Star page (cinema + glass)"),
    ("Jordan Rivers &mdash; small machines, out loud",
     "Texas notebook &mdash; a Lone-Star page"),
    ("Jordan Rivers &mdash; /reimagine-it artistic",
     "Texas notebook &mdash; /reimagine-it artistic"),
    ("Jordan Rivers &mdash; /reimagine-it photography",
     "Texas notebook &mdash; /reimagine-it photography"),
    ("Jordan Rivers \u2014 after /reimagine-it",
     "Texas notebook \u2014 after /reimagine-it"),
    ("jordan-rivers.dev/status &mdash; /reimagine-it webpage dashboard bento",
     "texasnote.example/status &mdash; /reimagine-it webpage dashboard bento"),
    ("jordan-rivers.dev/status &mdash; /reimagine-it dashboard",
     "texasnote.example/status &mdash; /reimagine-it dashboard"),
    ("jordan-rivers.dev &mdash; /reimagine-it webpage landing neon",
     "texasnote.example &mdash; /reimagine-it webpage landing neon"),

    # ================================================================
    # HERO H1s
    # ================================================================
    ("Jordan Rivers <em>&amp;</em> the small machines",
     "Texas <em>&amp;</em> the Lone Star"),
    ("Jordan <em>&amp;</em> the small machines",
     "Texas <em>&amp;</em> the Lone Star"),
    ('Jordan <span class="amp">&amp;</span> the small<br>\n    machines <span class="last">Rivers</span>',
     'Texas <span class="amp">&amp;</span> the Lone<br>\n    Star <span class="last">REPUBLIC</span>'),
    ('Jordan<br><span class="last">Rivers</span>',
     'Texas<br><span class="last">Notes</span>'),
    (">Jordan Rivers</h1>", ">A Texas notebook</h1>"),

    # ================================================================
    # CINEMATIC — top masthead
    # ================================================================
    ("Small machines &middot; Austin &middot; since 2019",
     "Republic notes &middot; Austin &middot; since 1836"),
    ("Small machines \u00b7 Austin \u00b7 since 2019",
     "Republic notes \u00b7 Austin \u00b7 since 1836"),

    # CINEMATIC — three pieces of the year (Q1/Q2/Q3)
    ("<span class=\"pill\"><b>Q1</b> QUIET WEEK</span>",
     "<span class=\"pill\"><b>Q1</b> AUSTIN</span>"),
    ("<span class=\"pill\"><b>Q2</b> LANTERN</span>",
     "<span class=\"pill\"><b>Q2</b> BIG BEND</span>"),
    ("<span class=\"pill\"><b>Q3</b> RIFT</span>",
     "<span class=\"pill\"><b>Q3</b> ALAMO</span>"),
    ("<h3>Quiet week</h3>", "<h3>Austin</h3>"),
    ("<p>A seven-day ledger that says the word \"no\" out loud, once a day, until it stops surprising anyone.</p>",
     "<p>Live music, live oaks, live legislature. The capital that grew up on the Colorado River in 1839.</p>"),
    ("<p>A single-file demo that boots without a build step, prints \"hello\" three ways, and closes politely.</p>",
     "<p>Eight hundred thousand acres along the Rio Grande. Dark sky, cottonwood, and Chihuahuan desert since 1944.</p>"),
    ("<p>An eight-note scale played by hand at midnight, recorded on a phone, mixed for a small room.</p>",
     "<p>A small stone mission at the center of the Republic. Nineteen days, one long siege in 1836.</p>"),
    ("<div class=\"foot\"><span>2025 &middot; ESSAY</span><span>7 DAYS</span></div>",
     "<div class=\"foot\"><span>1839 &middot; CAPITAL</span><span>LIVE MUSIC</span></div>"),
    ("<div class=\"foot\"><span>2025 &middot; DEMO</span><span>ONE FILE</span></div>",
     "<div class=\"foot\"><span>1944 &middot; PARK</span><span>800K ACRES</span></div>"),
    ("<div class=\"foot\"><span>2025 &middot; RECORDING</span><span>8 NOTES</span></div>",
     "<div class=\"foot\"><span>1836 &middot; MISSION</span><span>19 DAYS</span></div>"),

    # CINEMATIC — terminal SVG in Q2 (Lantern -> Big Bend field notes)
    ("<text x=\"18\" y=\"30\">$ node lantern.js</text>",
     "<text x=\"18\" y=\"30\">$ read bigbend.md</text>"),
    ("<text x=\"18\" y=\"52\" fill=\"#f4ecd8\">hello, client.</text>",
     "<text x=\"18\" y=\"52\" fill=\"#f4ecd8\">cottonwood.</text>"),
    ("<text x=\"18\" y=\"70\" fill=\"#f4ecd8\">hello, machine.</text>",
     "<text x=\"18\" y=\"70\" fill=\"#f4ecd8\">prickly pear.</text>"),
    ("<text x=\"18\" y=\"88\" fill=\"#f4ecd8\">hello, small.</text>",
     "<text x=\"18\" y=\"88\" fill=\"#f4ecd8\">dark sky.</text>"),
    ("<text x=\"18\" y=\"110\" fill=\"#b22234\">$ <tspan fill=\"#f4ecd8\">bye</tspan></text>",
     "<text x=\"18\" y=\"110\" fill=\"#b22234\">$ <tspan fill=\"#f4ecd8\">rio grande</tspan></text>"),

    # CINEMATIC — bar-chart caption inside Q3 plate
    ("8-NOTE FIELD &middot; ONE MIC", "REPUBLIC MIX &middot; ONE VOICE"),

    # CINEMATIC — stats strip
    ("<div class=\"k\">SHIPPED</div><div class=\"v\">14</div>",
     "<div class=\"k\">MISSIONS</div><div class=\"v\">3</div>"),
    ("<div class=\"k\">DAYS DEEP</div><div class=\"v\">2,431</div>",
     "<div class=\"k\">YEARS</div><div class=\"v\">190</div>"),
    ("<div class=\"k\">READERS</div><div class=\"v\">918</div>",
     "<div class=\"k\">ACRES</div><div class=\"v\">800K</div>"),
    ("<div class=\"k\">OUTPUT / WEEK</div><div class=\"v\">1.8</div>",
     "<div class=\"k\">STARS</div><div class=\"v\">1</div>"),

    # CINEMATIC — signal section caption
    ("Signal per week (readers + replies + shipped drafts). Twelve-week window.",
     "Visitors per week (park + capital + mission). Twelve-week window."),

    # CINEMATIC — Right now section (Q4 cards)
    ("<h2>Right now &mdash; <em>Bristol</em></h2>",
     "<h2>Right now &mdash; <em>Austin</em></h2>"),
    ("<h2>Right now \u2014 <em>Bristol</em></h2>",
     "<h2>Right now \u2014 <em>Austin</em></h2>"),
    ("<span class=\"pill\"><b>Q4</b> WRITING</span>",
     "<span class=\"pill\"><b>Q4</b> READING</span>"),
    ("<h3>Essay: quiet week, part two</h3>",
     "<h3>Rereading J. Frank Dobie</h3>"),
    ("<p>Second week of the ledger. Draft two of four. Section on \"the polite no\" is holding.</p>",
     "<p>A Vaquero of the Brush Country, chapter eight. Slow reading, one paragraph per morning.</p>"),
    ("<div class=\"foot\"><span>DRAFT 2 / 4</span><span>~2,400w</span></div>",
     "<div class=\"foot\"><span>CH 8 / 14</span><span>~180pp</span></div>"),
    ("<span class=\"pill\"><b>Q4</b> BUILDING</span>",
     "<span class=\"pill\"><b>Q4</b> WATCHING</span>"),
    ("<h3>Lantern v2</h3>", "<h3>Bluebonnet season</h3>"),
    ("<p>Adds one flag: <code>--room</code>. Still one file. Still no build step. Ships next Tuesday.</p>",
     "<p>First week of March. State highways lined blue. One camera, one pair of boots, no rush.</p>"),
    ("<div class=\"foot\"><span>v2 &middot; NEXT TUE</span><span>ONE FILE</span></div>",
     "<div class=\"foot\"><span>MAR &middot; TX-16</span><span>ONE CAMERA</span></div>"),
    ("<h3>Rift, remixed once</h3>", "<h3>Willie at Luck</h3>"),
    ("<p>Same 8-note field. New mic. Wednesday session with one guest, no rehearsal.</p>",
     "<p>One microphone. One mesquite grove. Wednesday session near Spicewood, no rehearsal.</p>"),
    ("<div class=\"foot\"><span>WED &middot; ONE MIC</span><span>ONE GUEST</span></div>",
     "<div class=\"foot\"><span>WED &middot; ONE MIC</span><span>ONE HORSE</span></div>"),

    # CINEMATIC — contact terminal
    ("<div class=\"bar\"><span class=\"dots\"><i></i><i></i><i></i></span>jordan@rivers &mdash; hello</div>",
     "<div class=\"bar\"><span class=\"dots\"><i></i><i></i><i></i></span>notes@texas &mdash; hello</div>"),
    ("<div><span class=\"prompt\">$</span> mail jordan@example.dev</div>",
     "<div><span class=\"prompt\">$</span> mail notes@texasnote.example</div>"),
    ("<span class=\"em\">small machines, out loud</span>",
     "<span class=\"em\">Lone Star, out loud</span>"),

    # CINEMATIC — footer
    ("<span>MADE IN BRISTOL</span>", "<span>MADE IN AUSTIN</span>"),

    # CINEMATIC-GLASS — piece caption
    ("<h3>Piece 03 &mdash; small machines, out loud</h3>",
     "<h3>Piece 03 &mdash; Austin, live music</h3>"),
    ("<h3>Piece 03 \u2014 small machines, out loud</h3>",
     "<h3>Piece 03 \u2014 Austin, live music</h3>"),

    # ================================================================
    # DASHBOARD (domains/dashboard)
    # ================================================================
    (">Three small machines. One paper journal. One book in flight.</h1>",
     ">Three places. Three signals. One flag in the wind.</h1>"),
    ("operator &middot; jordan rivers &middot; est 2022",
     "operator &middot; texas notebook &middot; est 1836"),
    ("<span class=\"out\">jordan rivers &middot; est 2022 &middot; utc-8</span>",
     "<span class=\"out\">texas notebook &middot; est 1836 &middot; utc-6</span>"),

    # Dashboard status pills
    ("<span class=\"rift\">rift</span>", "<span class=\"rift\">alamo</span>"),
    ("<span class=\"lant\">lantern</span>", "<span class=\"lant\">big bend</span>"),
    ("<span class=\"quiet\">quiet-week</span>", "<span class=\"quiet\">austin</span>"),

    # Dashboard project rows
    ("<span class=\"name\"><span class=\"dot a\"></span>rift</span>",
     "<span class=\"name\"><span class=\"dot a\"></span>alamo</span>"),
    ("<span class=\"name\"><span class=\"dot v\"></span>lantern</span>",
     "<span class=\"name\"><span class=\"dot v\"></span>big bend</span>"),
    ("<span class=\"name\"><span class=\"dot w\"></span>quiet-week</span>",
     "<span class=\"name\"><span class=\"dot w\"></span>austin</span>"),
    ("<span class=\"desc\">offline reader for archived long-form journalism &middot; full-text search</span>",
     "<span class=\"desc\">eight hundred thousand acres along the rio grande &middot; darkest night sky in north america</span>"),
    ("<span class=\"desc\">month-per-page paper journal template &middot; 12 prompts, zero notifications</span>",
     "<span class=\"desc\">named for stephen f. austin &middot; live music, live oaks, live legislature</span>"),

    # Dashboard "rewriting" / "reading" items
    ("<div class=\"item\"><span class=\"k\">rewriting</span><span class=\"v\">quiet-week for A5, print run in september</span><span class=\"s wip\">WIP</span></div>",
     "<div class=\"item\"><span class=\"k\">rereading</span><span class=\"v\">J. Frank Dobie &middot; A Vaquero of the Brush Country</span><span class=\"s wip\">CH 8</span></div>"),
    ("<div class=\"item\"><span class=\"k\">reading</span><span class=\"v\">Ursula K. Le Guin &middot; The Dispossessed</span><span class=\"s rd\">READ</span></div>",
     "<div class=\"item\"><span class=\"k\">watching</span><span class=\"v\">mockingbird nest under the eave</span><span class=\"s rd\">WK 34</span></div>"),
    ("<div class=\"line\"><span class=\"p\">$</span><span>echo &quot;hi&quot; | mail jordan@example.dev<span class=\"caret\"></span></span></div>",
     "<div class=\"line\"><span class=\"p\">$</span><span>echo &quot;hi&quot; | mail notes@texasnote.example<span class=\"caret\"></span></span></div>"),

    # ================================================================
    # DEFAULT WEBPAGE (webpage/after.html)
    # ================================================================
    ("<span class=\"name\">quiet-week</span>", "<span class=\"name\">austin</span>"),
    ("<span class=\"name\">lantern</span>", "<span class=\"name\">big bend</span>"),
    ("<span class=\"name\">rift</span>", "<span class=\"name\">alamo</span>"),
    ("<span class=\"val\">offline reader &middot; 8k lines</span>",
     "<span class=\"val\">night sky park &middot; 800k acres</span>"),
    ("<h3><span class=\"dot\"></span>rift</h3>",
     "<h3><span class=\"dot\"></span>alamo</h3>"),
    ("<h3><span class=\"dot\"></span>lantern</h3>",
     "<h3><span class=\"dot\"></span>big bend</h3>"),
    ("<h3><span class=\"dot\"></span>quiet-week</h3>",
     "<h3><span class=\"dot\"></span>austin</h3>"),
    ("<p>A tiny language server for Markdown outlines. Watches your files, keeps a symbol tree, ships in one binary.</p>",
     "<p>A small stone mission at the center of the Texas Republic. Nineteen days, one long siege, one story that carried a state.</p>"),
    ("<p>An offline reader for archived long-form journalism. Reads epub, mobi, saved articles. Full-text search.</p>",
     "<p>Eight hundred thousand acres along the Rio Grande. Cottonwood, prickly pear, and one of the darkest night skies in North America.</p>"),
    ("<p>A month-per-page paper journal template you print at home. Twelve prompts, one grid, zero notifications.</p>",
     "<p>Live music, live oaks, live legislature. Named after Stephen F. Austin, the empresario who first brought settlers under Mexican rule.</p>"),
    ("<div class=\"row\"><span class=\"k\">rewriting</span><span class=\"v\">quiet-week for A5, print run in september</span><span class=\"s warm\">testing</span></div>",
     "<div class=\"row\"><span class=\"k\">rereading</span><span class=\"v\">J. Frank Dobie &middot; A Vaquero of the Brush Country</span><span class=\"s warm\">ch 8</span></div>"),
    ("<div class=\"row\"><span class=\"k\">reading</span><span class=\"v\">Ursula K. Le Guin, <em>The Dispossessed</em></span><span class=\"s dim\">page 214</span></div>",
     "<div class=\"row\"><span class=\"k\">watching</span><span class=\"v\">mockingbird nest under the eave</span><span class=\"s dim\">week 34</span></div>"),
    ("<span>echo \"hi\" | mail jordan@example.dev</span>",
     "<span>echo \"hi\" | mail notes@texasnote.example</span>"),

    # ================================================================
    # ARTISTIC (domains/artistic)
    # ================================================================
    ("<figcaption><b>quiet-week</b> &middot; 2022</figcaption>",
     "<figcaption><b>austin</b> &middot; 1839</figcaption>"),
    ("<figcaption><b>lantern</b> &middot; 2023</figcaption>",
     "<figcaption><b>big bend</b> &middot; 1944</figcaption>"),
    ("<figcaption><b>rift</b> &middot; 2024</figcaption>",
     "<figcaption><b>alamo</b> &middot; 1836</figcaption>"),
    ("<h3><span class=\"glyph\"></span>quiet-week</h3>",
     "<h3><span class=\"glyph\"></span>austin</h3>"),
    ("<h3><span class=\"glyph\"></span>lantern</h3>",
     "<h3><span class=\"glyph\"></span>big bend</h3>"),
    ("<h3><span class=\"glyph\"></span>rift</h3>",
     "<h3><span class=\"glyph\"></span>alamo</h3>"),
    ("<p>A month-per-page paper journal template you print at home. Twelve prompts, one grid, zero notifications. Made for the kind of Sunday where you cannot find your phone charger and decide that is the right answer.</p>",
     "<p>Named for Stephen F. Austin, the empresario who first brought settlers under Mexican rule. Live music, live oaks, live legislature on the Colorado River since 1839.</p>"),
    ("<p>An offline reader for archived long-form journalism. Reads epub, mobi, saved articles. Full-text search runs local. The magazine you would have kept, held in one window with no headline traps.</p>",
     "<p>Eight hundred thousand acres along the Rio Grande. Cottonwood, prickly pear, and one of the darkest night skies in North America since 1944.</p>"),
    ("<p>A tiny language server for Markdown outlines. Watches your files, keeps a symbol tree, ships in one binary. Meant to disappear into your editor and only speak when it can save you a keystroke.</p>",
     "<p>A small stone mission at the center of the Texas Republic. Nineteen days, one long siege, one story that carried a state in 1836.</p>"),
    ("Rewriting <em>quiet-week</em> for A5.",
     "Watching the mockingbird nest under the eave."),
    ("<div class=\"sign\">Now &middot; jordan rivers &middot; week 34</div>",
     "<div class=\"sign\">Now &middot; texas notebook &middot; week 34</div>"),
    ("<a class=\"cta\" href=\"mailto:jordan@example.dev\">jordan@example.dev</a>",
     "<a class=\"cta\" href=\"mailto:notes@texasnote.example\">notes@texasnote.example</a>"),

    # ================================================================
    # PHOTOGRAPHY (domains/photography)
    # ================================================================
    ("<span class=\"stamp\">Folio &middot; three plates &middot; 2022&mdash;2024</span>",
     "<span class=\"stamp\">Folio &middot; three plates &middot; 1836&mdash;1944</span>"),
    ("Three <b>small machines</b> from three quiet years.",
     "Three <b>Texas places</b>, three <b>Texas signals</b>."),
    ("<p>&ldquo;Three small machines from three quiet years. All three are the same size.&rdquo;</p>",
     "<p>&ldquo;Three places. Three signals. One flag in the wind.&rdquo;</p>"),
    ("<span class=\"byline\">Words &amp; pictures by jordan rivers &middot; set in Didot &amp; Iowan</span>",
     "<span class=\"byline\">Notes &amp; plates by texas notebook &middot; set in Didot &amp; Iowan</span>"),
    ("&lt; folio &middot; jordan-rivers.dev &gt;",
     "&lt; folio &middot; texasnote.example &gt;"),
    ("<div><span class=\"k\">Plate I</span><span class=\"v\">Quiet Week</span></div>",
     "<div><span class=\"k\">Plate I</span><span class=\"v\">Austin</span></div>"),
    ("<div><span class=\"k\">Plate II</span><span class=\"v\">Lantern</span></div>",
     "<div><span class=\"k\">Plate II</span><span class=\"v\">Big Bend</span></div>"),
    ("<div><span class=\"k\">Plate III</span><span class=\"v\">Rift</span></div>",
     "<div><span class=\"k\">Plate III</span><span class=\"v\">Alamo</span></div>"),
    ("Plate I &middot; 2022", "Plate I &middot; 1839"),
    ("Plate II &middot; 2023", "Plate II &middot; 1944"),
    ("Plate III &middot; 2024", "Plate III &middot; 1836"),
    ("<h2>Quiet Week</h2>", "<h2>Austin</h2>"),
    ("<h2>Lantern</h2>", "<h2>Big Bend</h2>"),
    ("<h2>Rift</h2>", "<h2>Alamo</h2>"),
    ("A month-per-page paper journal template you print at home. Twelve prompts, one grid, zero notifications &mdash; made for the kind of Sunday where you cannot find your phone charger and decide that is the right answer.",
     "Named after Stephen F. Austin, the empresario who first brought settlers under Mexican rule. Live music, live oaks, live legislature &mdash; the capital that grew up on the Colorado River in 1839."),
    ("An offline reader for archived long-form journalism. Reads epub, mobi, saved articles. Full-text search runs on your machine. The magazine you would have kept, held in one window with no headline traps and no comment feeds and no autoplay.",
     "Eight hundred thousand acres along the Rio Grande. Cottonwood, prickly pear, one of the darkest night skies in North America &mdash; a Chihuahuan desert park where the horizon does most of the talking."),
    ("A tiny language server for Markdown outlines. Watches your files, keeps a symbol tree, ships in one binary. Meant to disappear into your editor and only speak when it can save you a keystroke, and never louder than a status bar item.",
     "A small stone mission at the center of the Texas Republic. Nineteen days, one long siege, one story that carried a state &mdash; a limestone church that outlived every regime that ever tried to hold it."),
    ("<div class=\"meta\"><span>Medium: <b>PDF</b></span><span>Weight: <b>1 page</b></span><span>State: <b>Done</b></span></div>",
     "<div class=\"meta\"><span>Medium: <b>Live music</b></span><span>Weight: <b>The capital</b></span><span>State: <b>Bluebonnet</b></span></div>"),
    ("<div class=\"meta\"><span>Medium: <b>Rust</b></span><span>Weight: <b>8k loc</b></span><span>State: <b>Maintained</b></span></div>",
     "<div class=\"meta\"><span>Medium: <b>Chihuahuan</b></span><span>Weight: <b>800k acres</b></span><span>State: <b>Federal park</b></span></div>"),
    ("<div class=\"meta\"><span>Medium: <b>Go</b></span><span>Weight: <b>3k loc</b></span><span>State: <b>Shipping</b></span></div>",
     "<div class=\"meta\"><span>Medium: <b>Limestone</b></span><span>Weight: <b>19 days</b></span><span>State: <b>Republic</b></span></div>"),
    ("<span class=\"cap\">printable &middot; 1 page</span>",
     "<span class=\"cap\">capital &middot; 1839</span>"),
    ("<span class=\"cap\">rust &middot; 8k</span>",
     "<span class=\"cap\">chihuahuan &middot; 800k acres</span>"),
    ("<span class=\"cap\">go &middot; 3k</span>",
     "<span class=\"cap\">limestone &middot; 1836</span>"),
    ("<text x=\"76\" y=\"408\">// lantern &middot; offline reader</text>",
     "<text x=\"76\" y=\"408\">// big bend &middot; night sky park</text>"),
    ("<text x=\"76\" y=\"424\">// full text search</text>",
     "<text x=\"76\" y=\"424\">// 800k acres</text>"),
    ("<text x=\"76\" y=\"440\">// epub &middot; mobi &middot; saved</text>",
     "<text x=\"76\" y=\"440\">// rio grande &middot; chisos &middot; santa elena</text>"),
    ("MARKDOWN LSP", "LONE STAR 1836"),
    ("<span class=\"v\">Chapter 3 of a small book on the CLI. Rewriting <em>quiet-week</em> for A5. Reading Le Guin, page 214.</span>",
     "<span class=\"v\">Rereading J. Frank Dobie. Watching the mockingbird nest under the eave.</span>"),
    ("<span class=\"v\">github &middot; @jordan-rivers<br>rss &middot; /essays.xml</span>",
     "<span class=\"v\">github &middot; @texasnote<br>rss &middot; /notes.xml</span>"),
    ("&copy; 2026 jordan rivers &middot; folio no. 34",
     "&copy; 2026 texas notebook &middot; folio no. 34"),

    # ================================================================
    # LANDING-NEON (modifiers/landing-neon)
    # ================================================================
    ("Ship the <em>tool</em>, not the pitch.",
     "Ship the <em>note</em>, not the pitch."),
    ("jordan-rivers.dev is a one-person writing bench in Austin. Three small tools \u2014 rift, lantern, quiet-week. Same desk, one small book at a time.",
     "texasnote.example is a small notebook on Texas \u2014 the state, the flag, and the people. Three places, three signals, one flag in the wind."),
    ("jordan-rivers.dev is a one-person writing bench in Austin. Three small tools &mdash; rift, lantern, quiet-week. Same desk, one small book at a time.",
     "texasnote.example is a small notebook on Texas &mdash; the state, the flag, and the people. Three places, three signals, one flag in the wind."),

    # ================================================================
    # SECTION 2 — residual dev-persona copy that survived the first pass
    # ================================================================

    # Sub-copy under the H1 in default / artistic / dashboard
    ("Ships small <em>tools</em>, writes small <em>essays</em>, keeps small <em>notebooks</em>.",
     "Three places from three centuries. Three signals worn by the state."),
    ("Working in the seam between the CLI and paper.",
     "A small notebook on Texas \u2014 the state, the flag, and the people."),
    ("Working in the seam between the terminal and paper &mdash; three things at a time, one of them by hand.",
     "A small notebook on Texas \u2014 the state, the flag, and the people. One page at a time, all by hand."),
    ("Working in the seam between the terminal and paper.",
     "A small notebook on Texas \u2014 the state, the flag, and the people."),

    # Default webpage — section 01 head
    ("<h2>Work, by height and year</h2>", "<h2>Places, by scale and year</h2>"),
    ("<span class=\"meta\">3 projects &middot; 2022 &rarr; 2024</span>",
     "<span class=\"meta\">3 places &middot; 1836 &rarr; 1944</span>"),

    # Default webpage — skyline bars (year+name pairs so we don't hit other 2022/23/24)
    ("<span class=\"year\">2022</span>\n      <span class=\"name\">austin</span>",
     "<span class=\"year\">1839</span>\n      <span class=\"name\">austin</span>"),
    ("<span class=\"year\">2023</span>\n      <span class=\"name\">big bend</span>",
     "<span class=\"year\">1944</span>\n      <span class=\"name\">big bend</span>"),
    ("<span class=\"year\">2024</span>\n      <span class=\"name\">alamo</span>",
     "<span class=\"year\">1836</span>\n      <span class=\"name\">alamo</span>"),
    ("<span class=\"val\">paper journal &middot; 1 file</span>",
     "<span class=\"val\">state capital &middot; live music</span>"),
    ("<span class=\"val\">markdown LSP &middot; 1 binary</span>",
     "<span class=\"val\">stone mission &middot; 19 days</span>"),

    # Default webpage — three project cards (year is right before <h3>)
    ("<span class=\"year\">2024</span>\n      <h3><span class=\"dot\"></span>alamo</h3>",
     "<span class=\"year\">1836</span>\n      <h3><span class=\"dot\"></span>alamo</h3>"),
    ("<span class=\"year\">2023</span>\n      <h3><span class=\"dot\"></span>big bend</h3>",
     "<span class=\"year\">1944</span>\n      <h3><span class=\"dot\"></span>big bend</h3>"),
    ("<span class=\"year\">2022</span>\n      <h3><span class=\"dot\"></span>austin</h3>",
     "<span class=\"year\">1839</span>\n      <h3><span class=\"dot\"></span>austin</h3>"),

    # Default webpage — card foot metadata + tags
    ("<span>go &middot; 3k loc</span>\n        <span class=\"tag\">SHIPPING</span>",
     "<span>limestone &middot; 19 days</span>\n        <span class=\"tag\">REPUBLIC</span>"),
    ("<span>rust &middot; 8k loc</span>\n        <span class=\"tag\">MAINTAINED</span>",
     "<span>chihuahuan &middot; 800k acres</span>\n        <span class=\"tag\">FEDERAL</span>"),
    ("<span>pdf &middot; 1 page</span>\n        <span class=\"tag\">DONE</span>",
     "<span>live music &middot; 1839</span>\n        <span class=\"tag\">CAPITAL</span>"),

    # Default webpage — Now section rows
    ("<div class=\"row\"><span class=\"k\">writing</span><span class=\"v\">a small book on the CLI, chapter 3 of 9</span><span class=\"s\">shipping</span></div>",
     "<div class=\"row\"><span class=\"k\">writing</span><span class=\"v\">a small notebook on the Texas hill country, chapter 3 of 9</span><span class=\"s\">shipping</span></div>"),
    ("<div class=\"row\"><span class=\"k\">building</span><span class=\"v\">a small keyboard, tenkeyless, ortho</span><span class=\"s dim\">wiring</span></div>",
     "<div class=\"row\"><span class=\"k\">building</span><span class=\"v\">a small archive of Marfa clippings, one per week</span><span class=\"s dim\">week 34</span></div>"),

    # Dashboard — writing item
    ("<div class=\"item\"><span class=\"k\">writing</span><span class=\"v\">a small book on the CLI, chapter 3 of 9</span><span class=\"s ok\">SHIP</span></div>",
     "<div class=\"item\"><span class=\"k\">writing</span><span class=\"v\">a small notebook on the Texas hill country, chapter 3 of 9</span><span class=\"s ok\">SHIP</span></div>"),

    # Artistic — Writing a small book on the CLI
    ("Writing a small book on the <span class=\"coral\">CLI</span>.",
     "Rereading <span class=\"coral\">J. Frank Dobie</span>."),

    # Artistic — three stamps at bottom of the card fan
    ("<div class=\"stamps\"><span>pdf &middot; 1 page</span><span><b>DONE</b></span></div>",
     "<div class=\"stamps\"><span>live music &middot; 1839</span><span><b>CAPITAL</b></span></div>"),
    ("<div class=\"stamps\"><span>rust &middot; 8k loc</span><span><b>MAINTAINED</b></span></div>",
     "<div class=\"stamps\"><span>chihuahuan &middot; 1944</span><span><b>FEDERAL</b></span></div>"),
    ("<div class=\"stamps\"><span>go &middot; 3k loc</span><span><b>SHIPPING</b></span></div>",
     "<div class=\"stamps\"><span>limestone &middot; 1836</span><span><b>REPUBLIC</b></span></div>"),

    # Photography — colophon Chapter 3 line (variant that survived earlier pass)
    ("<span class=\"v\">Chapter 3 of a small book on the CLI. Watching the mockingbird nest under the eave. Reading Le Guin, page 214.</span>",
     "<span class=\"v\">Rereading J. Frank Dobie. Watching the mockingbird nest under the eave. Chapter 8 of A Vaquero of the Brush Country.</span>"),

    # ================================================================
    # SECTION 3 — dashboard-bento deep content awareness
    # ================================================================

    # Bento — sub-brand line under masthead
    ("<div class=\"sub\">Bento &middot; Dashboard &middot; Real values &middot; Single .html</div>",
     "<div class=\"sub\">Bento &middot; Texas notebook &middot; Places / Signals / Field log</div>"),

    # Bento — hours tile
    ("<div class=\"lab\">OPEN</div>\n    <div class=\"val\">wed&thinsp;&ndash;&thinsp;sat 11&thinsp;&ndash;&thinsp;5</div>\n    <div class=\"lab\" style=\"margin-top:6px\">Closed 1st wk Aug</div>",
     "<div class=\"lab\">SEASON</div>\n    <div class=\"val\">bluebonnet &middot; feb&thinsp;&ndash;&thinsp;apr</div>\n    <div class=\"lab\" style=\"margin-top:6px\">peaks late march</div>"),

    # Bento — state tile
    ("<div class=\"badge\">Nominal</div>\n    <div class=\"ts\">42s ago</div>",
     "<div class=\"badge\">Lone Star</div>\n    <div class=\"ts\">since 1839</div>"),

    # Bento — hero tile
    ("<div class=\"kicker\"><b>PIECE 03</b>NOW SHIPPING</div>",
     "<div class=\"kicker\"><b>TEXAS</b>3 PLACES &middot; 3 SIGNALS</div>"),
    ("<p class=\"desc\">One page, eight tiles. Every tile is one idea with one datum and one meta line. The hero tile is the only one carrying the make-strange move; the others stay quiet.</p>",
     "<p class=\"desc\">One page, eight tiles. Three places (Alamo, Big Bend, Austin), three signals (Lone Star flag, Bluebonnet, Longhorn), and one flag in the wind. Hero tile is the only one with the make-strange move.</p>"),
    ("<title id=\"chart-title\">Traffic last 12 weeks</title>",
     "<title id=\"chart-title\">Visitors last 12 weeks</title>"),
    ("TRAFFIC 12W", "VISITORS 12W"),
    ("<div class=\"cell\"><b>12,844</b><span>uniques 30d</span></div>",
     "<div class=\"cell\"><b>800K</b><span>acres, big bend</span></div>"),
    ("<div class=\"cell\"><b>4.2m</b><span>time on hero</span></div>",
     "<div class=\"cell\"><b>190y</b><span>since 1836</span></div>"),
    ("<div class=\"cell\"><b>0</b><span>errors 24h</span></div>",
     "<div class=\"cell\"><b>3</b><span>places on file</span></div>"),
    ("<div class=\"cell\"><b>1\u00d7</b><span>daily deploy</span></div>",
     "<div class=\"cell\"><b>1\u2605</b><span>lone star</span></div>"),

    # Bento — chart tile (Response time -> Sunset color)
    ("<div class=\"kicker\"><b>01</b>P50 / P95</div>\n    <div class=\"title\">Response time, last hour</div>",
     "<div class=\"kicker\"><b>01</b>DAWN / DUSK</div>\n    <div class=\"title\">Sunset color, last twelve hours</div>"),
    ("aria-label=\"Latency p50 and p95\"", "aria-label=\"Sunset warmth by hour\""),
    (">P50 68ms<", ">DAWN 06:14<"),
    (">P95 118ms<", ">DUSK 20:12<"),
    ("<div class=\"meta\"><span>WINDOW <b>60m</b></span><span>rolling</span></div>",
     "<div class=\"meta\"><span>WINDOW <b>12h</b></span><span>daylight</span></div>"),

    # Bento — latency tile (Error budget -> Star-count)
    ("<div class=\"kicker\"><b>02</b>ERROR BUDGET</div>\n    <div class=\"title\">This quarter</div>",
     "<div class=\"kicker\"><b>02</b>STAR COUNT</div>\n    <div class=\"title\">Since 1839</div>"),
    ("aria-label=\"72% of budget remaining\"",
     "aria-label=\"one lone star, unbroken since 1839\""),
    ("<div class=\"meta\"><span>SPENT <b>28%</b></span><span>on track</span></div>",
     "<div class=\"meta\"><span>HELD <b>1 / 1</b></span><span>unbroken</span></div>"),

    # Bento — logs tile (Live log -> Field log)
    ("<div class=\"kicker\"><b>03</b>LIVE LOG</div>",
     "<div class=\"kicker\"><b>03</b>FIELD LOG</div>"),
    ("<div class=\"row\"><span class=\"t\">21:07</span><span class=\"s\">\u2713</span><span class=\"m\">deploy web@1.14.7 \u2014 42s</span></div>",
     "<div class=\"row\"><span class=\"t\">06:12</span><span class=\"s\">\u2713</span><span class=\"m\">bluebonnet at TX-16, 18 miles</span></div>"),
    ("<div class=\"row\"><span class=\"t\">21:04</span><span class=\"s\">\u2713</span><span class=\"m\">pg backup \u2014 118 MB</span></div>",
     "<div class=\"row\"><span class=\"t\">05:44</span><span class=\"s\">\u2713</span><span class=\"m\">mockingbird nest, 3 chicks</span></div>"),
    ("<div class=\"row\"><span class=\"t\">20:58</span><span class=\"s w\">!</span><span class=\"m\">rate limit near /api/search</span></div>",
     "<div class=\"row\"><span class=\"t\">05:31</span><span class=\"s w\">\u2605</span><span class=\"m\">longhorn near kerrville</span></div>"),
    ("<div class=\"row\"><span class=\"t\">20:44</span><span class=\"s\">\u2713</span><span class=\"m\">nightly cron \u2014 3.1s</span></div>",
     "<div class=\"row\"><span class=\"t\">21:14</span><span class=\"s\">\u2713</span><span class=\"m\">colorado paddle, zilker</span></div>"),
    ("<div class=\"row\"><span class=\"t\">20:31</span><span class=\"s\">\u2713</span><span class=\"m\">cache purge \u2014 0.2s</span></div>",
     "<div class=\"row\"><span class=\"t\">20:03</span><span class=\"s\">\u2713</span><span class=\"m\">sunset, enchanted rock</span></div>"),
    ("<div class=\"row\"><span class=\"t\">20:12</span><span class=\"s\">\u2713</span><span class=\"m\">migration 0231 \u2014 1.4s</span></div>",
     "<div class=\"row\"><span class=\"t\">19:48</span><span class=\"s\">\u2713</span><span class=\"m\">mockingbird held the note</span></div>"),
    ("<div class=\"row\"><span class=\"t\">now</span><span class=\"s cur\">\u25ae</span><span class=\"m\">waiting\u2026</span></div>",
     "<div class=\"row\"><span class=\"t\">now</span><span class=\"s cur\">\u25ae</span><span class=\"m\">waiting for bluebonnet season\u2026</span></div>"),

    # Bento — stack tile (Six moving parts -> Six pieces the state carries)
    ("<div class=\"kicker\"><b>04</b>STACK</div>\n    <div class=\"title\">Six moving parts &mdash; documented</div>",
     "<div class=\"kicker\"><b>04</b>PARTS</div>\n    <div class=\"title\">Six pieces the state carries</div>"),
    ("<div class=\"p\"><b>web</b>next 14</div>", "<div class=\"p\"><b>flag</b>lone star</div>"),
    ("<div class=\"p\"><b>api</b>fastify</div>", "<div class=\"p\"><b>flower</b>bluebonnet</div>"),
    ("<div class=\"p\"><b>db</b>postgres</div>", "<div class=\"p\"><b>mammal</b>longhorn</div>"),
    ("<div class=\"p\"><b>cache</b>redis</div>", "<div class=\"p\"><b>tree</b>live oak</div>"),
    ("<div class=\"p\"><b>queue</b>bullmq</div>", "<div class=\"p\"><b>song</b>state hymn</div>"),
    ("<div class=\"p\"><b>edge</b>cloudflare</div>", "<div class=\"p\"><b>river</b>rio grande</div>"),

    # Bento — incidents tile (Incidents -> Field notes)
    ("<div class=\"kicker\"><b>05</b>INCIDENTS</div>\n    <div class=\"title\">Last 3 &mdash; with resolution</div>",
     "<div class=\"kicker\"><b>05</b>FIELD NOTES</div>\n    <div class=\"title\">Last 3 &mdash; with what carried</div>"),
    ("<li><span class=\"d\">Aug&nbsp;18</span><span class=\"t\">Elevated 5xx on /api/search &mdash; upstream provider limits.</span><span class=\"r\">14 min</span></li>",
     "<li><span class=\"d\">Aug&nbsp;18</span><span class=\"t\">Long walk in Big Bend at dusk. Chihuahuan wind carried the whole rim.</span><span class=\"r\">14 mi</span></li>"),
    ("<li><span class=\"d\">Aug&nbsp;05</span><span class=\"t\">Slow queries after schema migration; backfill re-run overnight.</span><span class=\"r w\">3 h</span></li>",
     "<li><span class=\"d\">Aug&nbsp;05</span><span class=\"t\">Alamo lit gold at 20:12. The limestone remembered the siege.</span><span class=\"r w\">3 h</span></li>"),
    ("<li><span class=\"d\">Jul&nbsp;27</span><span class=\"t\">Edge cache purge propagation delay in EU; cleared with manual push.</span><span class=\"r\">7 min</span></li>",
     "<li><span class=\"d\">Jul&nbsp;27</span><span class=\"t\">Austin porch at midnight, cicadas held the note past the last streetlight.</span><span class=\"r\">7 min</span></li>"),

    # Bento — foot strip
    ("<span><b>HERO</b>traffic 12w (2x2, elevated)</span>",
     "<span><b>HERO</b>visitors 12w (2x2, elevated)</span>"),

    # ================================================================
    # SECTION 4 — cinematic-glass + landing-neon polish
    # ================================================================

    # Cinematic-glass — deep glass tile
    ("<div class=\"k\"><b>NOW</b>SHIPPING</div>",
     "<div class=\"k\"><b>NOW</b>AT AUSTIN</div>"),
    ("<p>Every card ships an artifact the reader can run in ninety seconds.</p>",
     "<p>Every card holds a Texas signal the reader can carry in ninety seconds.</p>"),
    ("<div class=\"row\"><span><b>12</b>weeks live</span><span><b>3</b>pieces</span></div>",
     "<div class=\"row\"><span><b>190</b>years</span><span><b>3</b>places</span></div>"),

    # Landing-neon — CTA text
    ("<a class=\"prim\" href=\"#work\">See the ledger &rarr;</a>",
     "<a class=\"prim\" href=\"#work\">See the notebook &rarr;</a>"),

    # Landing-neon — proof strip
    ("<div class=\"p\"><b>18</b>projects shipped</div>",
     "<div class=\"p\"><b>3</b>places on file</div>"),
    ("<div class=\"p\"><b>0</b>slide decks</div>",
     "<div class=\"p\"><b>1</b>flag in the wind</div>"),
    ("<div class=\"p\"><b>2011</b>working since</div>",
     "<div class=\"p\"><b>1836</b>republic since</div>"),
    ("<div class=\"p\"><b>1</b>person operation</div>",
     "<div class=\"p\"><b>1</b>lone star</div>"),

    # ================================================================
    # SHARED CATCHALLS  (must be last)
    # ================================================================
    ("&copy; 2026 jordan rivers &middot; /status",
     "&copy; 2026 texas notebook &middot; /status"),
    ("&copy; 2026 jordan rivers", "&copy; 2026 texas notebook"),
    ("jordan-rivers.dev/status", "texasnote.example/status"),
    ("jordan-rivers.dev / status", "texasnote.example / status"),
    ("jordan-rivers.dev", "texasnote.example"),
    ("@jordan-rivers", "@texasnote"),
    ("mail jordan@example.dev", "mail notes@texasnote.example"),
    ("mailto:jordan@example.dev", "mailto:notes@texasnote.example"),
    ("jordan@example.dev", "notes@texasnote.example"),
    ("jordan@rivers", "notes@texas"),
    ("Jordan Rivers", "Texas notebook"),
    ("jordan rivers", "texas notebook"),
    ("Jordan RIVERS", "TEXAS NOTEBOOK"),
]


def apply(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    body = original
    for old, new in SWAPS:
        body = body.replace(old, new)
    if body != original:
        path.write_text(body, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for tgt in TARGETS:
        if not tgt.exists():
            print(f"  skip (missing) {tgt.relative_to(ROOT)}")
            continue
        marker = "swapped " if apply(tgt) else "no-op   "
        print(f"  {marker} {tgt.relative_to(ROOT)}")
        if marker.startswith("swapped"):
            changed += 1
    print(f"\nContent-swapped {changed}/{len(TARGETS)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
