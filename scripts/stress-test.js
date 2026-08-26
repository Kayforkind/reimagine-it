// Stress test: drives the real auto entry point across 100 diverse sources.
// Usage: node scripts/stress-test.js
const { extractContent } = require('../src/extract');
const { autoGenerate } = require('../src/auto');
const { sourceFidelity } = require('../src/result');

const mk = (title, lines) => ({ title, lines });
const S = [
  // tech/saas
  mk('Neon Arcade', ['We build retro arcade cabinets with LED art and CRT shaders. Founded 2019, 40 staff, 3 locations, 12,000 cabinets shipped.', 'Play now', 'Our cabinets: Blaster, Nebula, Orbit.', 'sale ends 2026-06-30', 'pricing $1,200 per cabinet']),
  mk('Cloud Atlas', ['Enterprise data pipelines. 99.9% uptime SLA. Trusted by 200+ companies including Acme and Globex.', '$49/mo starter, $199/mo pro', 'datacenters in 12 regions', 'Founded 2015 in Austin']),
  mk('Finch Fintech', ['Banking APIs for developers. 4.2 rating. PCI-DSS certified.', '$0.10 per API call, 1M calls free', 'Series B $40M led by Foundry', 'launched 2021']),
  mk('ByteShop', ['The marketplace for indie software. 5,000 sellers, 200k buyers, 1.4M downloads.', 'Join as seller', 'Featured: PixelForge, Notebase, Camo']),
  // health
  mk('MediCare+', ['Patient-first telehealth. 1,200 licensed physicians, 98% satisfaction.', 'Book a visit — $39 flat', 'Open 24/7, 50 states', 'HIPAA compliant']),
  mk('RunWell', ['Personalized marathon training plans. 45,000 finishers coached since 2018.', 'Plans from $19/mo', 'Coach dashboard', 'heart-rate zones']),
  // education
  mk('Lingo Lab', ['Learn 12 languages with AI tutors. 3-minute daily lessons, 87% completion rate.', 'Free tier: 5 lessons/week', 'Certificates', 'CEFR levels A1-C2']),
  mk('Quantum School', ['Physics for everyone. 240 video lessons, interactive labs, 30k students.', 'Enroll $29/mo', 'Nobel-laureate guest lectures']),
  // creative/portfolio
  mk('Mira Studio', ['Award-winning brand studio. 120 projects, 14 design awards, clients in 9 countries.', 'See our work', 'Brand, Web, Motion', 'Est. 2011']),
  mk('Lumen Photos', ['Fine-art landscape photography prints. 3,000+ prints sold.', 'Shop prints from $85', 'Limited editions of 50', 'Printed on archival paper']),
  // food
  mk('Ember Kitchen', ['Wood-fired tasting menus. 4.9 stars, 800 reviews.', 'Reserve a table', 'Dinner Tue-Sun 5-11pm', 'Located in Portland']),
  mk('Bean & Leaf', ['Single-origin coffee roasted in small batches. 40 origins, 12 roast profiles.', 'Subscribe & save 20%', 'Free shipping over $40']),
  // travel
  mk('Nomad Pass', ['One pass, 600+ co-working spaces worldwide. 15,000 members.', '$99/mo global access', 'Cities: 40 countries', 'Pause anytime']),
  mk('Alpine Trails', ['Guided treks in the Alps and Dolomites. 98% of guests complete the full route.', '7-day tours from $1,900', 'Max 12 per group', 'Since 1998']),
  // events
  mk('Summit 2026', ['The annual product conference. 4,000 attendees, 120 speakers, 3 tracks.', 'Get tickets — early bird $399 until 2026-09-01', 'Venue: Moscone Center, San Francisco', 'June 8-10 2026']),
  mk('DevFest', ['A weekend of open-source hacking. 800 hackers, 60 mentors, $50k in prizes.', 'Register free', 'Workshops: Rust, WebGPU, Zig']),
  // home/realestate
  mk('Haven Homes', ['Modern cabins for remote work. 34 properties across 6 states.', 'Book from $180/night', 'Each cabin: fiber, desk, sauna']),
  mk('UrbanNest', ['Micro-apartments in city centers. 1,800 units, 92% occupancy.', 'Rent from $1,450/mo', 'Amenities: gym, rooftop, coworking']),
  // fitness
  mk('Iron Temple', ['Powerlifting gym. 24/7 access, 300 members, 2,000 sq ft of iron.', 'Join $59/mo', 'Coaching, nutrition, meets']),
  mk('Flow Yoga', ['Hot vinyasa and restorative classes. 45 classes/week, 12 instructors.', 'First class free', 'Drop-in $25']),
  // personal sites
  mk('Dr. Ada Chen', ['Cardiologist in Seattle. 15 years experience, UW Medicine affiliated.', 'Book a consultation', 'Accepted insurances: 12 plans']),
  mk('Sam Rivera Developer', ['I build fast, accessible web apps. 11 shipped products, 3 open-source projects.', 'Hire me', 'Stack: TypeScript, Go, Rust']),
  // non-profits
  mk('Ocean Trust', ['Protecting 10,000 sq miles of coral reef. 2.1M donors, 87c of every dollar to programs.', 'Donate monthly', 'Volunteer expeditions', '2025 impact report']),
  mk('Code for All', ['Free coding classes for underserved youth. 14,000 graduates, 68% placed in tech jobs.', 'Sponsor a student — $250/year', 'Partner with us']),
  // government/civic
  mk('Springfield Metro', ['Your transit system. 210 buses, 38 rail stations, 60M rides/year.', 'Plan your trip', 'Fares: $2.75 single ride, $89 monthly pass']),
  mk('City Parks Dept', ['1,400 acres of parks, 60 playgrounds, 22 miles of trails.', 'Find a park', 'Volunteer days every Saturday', 'Adopt-a-tree program']),
  // automotive
  mk('Volt Motors', ['Electric trucks built for work. 350-mile range, 12,000 lb towing.', 'Order now — $52k base', '4 trims: Work, Pro, Max, Fleet', '8-year battery warranty']),
  mk('Classic and Co', ['Vintage car restoration. 200 restorations completed, 5 concours wins.', 'Book an appraisal', 'Marque specialists: Ferrari, Porsche, Jag']),
  // fashion
  mk('Aster and Olive', ['Slow-fashion linen clothing. 60-piece seasonal drops, 100% European flax.', 'Shop the collection', 'Sizes XS-XXL', 'Free returns 30 days']),
  mk('Northbound', ['Outerwear built for alpine winters. -30C rated, 3-layer membrane.', 'Explore jackets from $320', 'Field-tested in 14 expeditions']),
  // finance
  mk('Pennywise', ['Automatic savings that round up your purchases. 800k users saved $240M.', 'Start free', '4.8 app-store rating', 'FDIC insured']),
  mk('RetireRight', ['Retirement planning with fiduciary advisors. $2.1B under management.', 'Free intro call', 'Fee: 0.5% of assets']),
  // music
  mk('Velvet Vinyl', ['Independent record store and label. 40k vinyl in stock, 120 releases pressed.', 'Browse the crates', 'Listening room daily 4-8pm', 'Rare finds every Friday']),
  mk('Synthwave FM', ['24/7 internet radio playing synthwave and retrowave. 200k monthly listeners.', 'Listen live', 'DJ sets Sat 10pm', 'Playlist requests via Discord']),
  // gaming
  mk('Pixel Bastion', ['A co-op tower-defense roguelike. 4-player online, 80+ upgrade combos, 12 biomes.', 'Wishlist on Steam', 'Early Access $19.99', 'Patch 1.4 out now']),
  mk('Starforge', ['Space station builder MMO. 3M registered pilots, 40-star systems.', 'Download free', 'Season 3: The Expanse', 'Cross-play on all platforms']),
  // ai/ml
  mk('ModelKit', ['Fine-tune LLMs on your data. 1-click deploys, 12k teams onboard.', 'Start free — 3 fine-tunes/mo', 'Pricing: $0.08/1k tokens', 'SOC2, GDPR']),
  mk('Visionary AI', ['Computer vision for warehouses. 99.2% detection accuracy, 40ms latency.', 'Book a demo', 'Deploys on your edge hardware']),
  // crypto
  mk('BlockVault', ['Self-custody hardware wallets. 500k devices shipped, 0 breaches.', 'Buy now from $79', 'Open-source firmware', '3-year warranty']),
  // engineering/industrial
  mk('Torque Robotics', ['Industrial robot arms for small shops. 6-axis, 20kg payload, $18k base.', 'Configure your arm', '14 countries served', '2-day on-site install']),
  mk('AeroSpec', ['Aerospace-grade fasteners. ISO 9001 certified, 8k SKUs, same-day ship.', 'Request a quote', 'Materials: Ti-6Al-4V, Inconel 718']),
  // legal
  mk('Clarity Legal', ['Flat-fee business law. 400 lawyers, 11 practice areas.', '$99 consult', 'Entity formation from $499', 'Reviewed 4.9/5 by 1,100 clients']),
  // beauty
  mk('Glow Theory', ['Clean skincare backed by dermatologists. 30-day guarantee, 94% saw results.', 'Shop serums from $28', 'Vegan, fragrance-free', 'Quiz: find your routine']),
  // pets
  mk('Happy Tails', ['Dog training that actually works. 12k dogs trained, force-free methods.', 'Start with a free consult', 'Puppy, adult, reactivity programs']),
  // sports
  mk('Elevate Sports', ['Youth athletic development. 3,500 athletes trained, 180 college placements.', 'Summer camps June-Aug', 'Strength, speed, recovery labs']),
  // media/news
  mk('The Daily Signal', ['Independent tech journalism. 2,000 stories/year, 1.2M monthly readers.', 'Subscribe $8/mo', 'No paywall on breaking news']),
  // jobs
  mk('Gig Finder', ['Weekly tech gigs for freelancers. 15k active listings, 30k freelancers.', 'Browse gigs', 'Median payout $1,800']),
  // e-commerce
  mk('Mountain Supply', ['Gear for high-altitude expeditions. 8,000 products, price-match promise.', 'Shop gear', 'Free shipping over $99', 'Expedition experts on chat']),
  // zero-content edge cases
  mk('', ['', '']),
  mk('untitled', ['just a single short line']),
  mk('LONG', [Array.from({ length: 60 }, (_, i) => 'Paragraph ' + i + ' with some detail about our service and value.').join(' ')]),
  mk('NumbersOnly', ['1999 42 7 88 12345 6 1000000']),
  mk('LinkHeavy', ['<a href="/">Home</a> <a href="/about">About</a> <a href="/pricing">Pricing</a> <a href="/blog">Blog</a> <a href="/careers">Careers</a> <a href="/contact">Contact</a>']),
  mk('DateTime', ['Event on 2026-03-14 at 2:30 PM. Registration closes 2026-04-01. The 2026 summit happens March 14-16 in Berlin.']),
  mk('ListHeavy', ['- Feature one: instant sync\n- Feature two: offline mode\n- Feature three: team workspaces\n- Feature four: API access\n- Feature five: audit logs\n- Feature six: SSO']),
  mk('Colored', ['Brand colors: primary #FF3366, secondary #00C2FF, background #0A0A0F. We love bold red and cyan.']),
  mk('Emoji', ['🚀 Launching soon! 🎉 Join 10,000+ happy users. 💳 Cancel anytime. ⭐ Rated 4.9.']),
  mk('MixedCase', ['THE PLATFORM FOR MODERN TEAMS. WE HANDLE SCALE SO YOU HANDLE PRODUCT. 99.99% UPTIME.']),
  mk('QuoteHeavy', ['"Quality is not an act, it is a habit." — Aristotle. Our team lives by this daily.']),
  mk('NoTitle', ['A paragraph about a fictional service called Zephyr that syncs notes between devices with end-to-end encryption.']),
  // batch 2: 40 more industries and shapes
  mk('Saffron & Salt', ['Modern Indian tasting menu. 6-course chef’s menu, 2 Michelin stars, 28 seats.', 'Dinner from $145', 'Reservations release 1st of each month', 'James Beard finalist 2025']),
  mk('Aurora Skincare', ['Bare-faced clinical skincare. 9 SKUs, derm-tested, 0% fragrance.', 'Serums $34–$68', 'SPF 50 mineral sunscreen', 'Recycled-glass packaging']),
  mk('Fern & Field', ['Community-supported organic farm. 450 weekly boxes, 12 partner farms.', 'Join CSA — $38/week', 'Pickup at 14 locations', 'Since 2012']),
  mk('Kindred Spirits', ['Small-batch whiskey distillery. 8 releases, 5,000 bottles per batch.', 'Tasting room Fri–Sun', 'Tour $25, includes 4 samples', 'Est. 2009 in the Catskills']),
  mk('Nova Skates', ['Handmade skateboards and apparel. 3,000 decks shipped, 25 pro riders.', 'Decks from $89', 'Custom grip art', 'Free bearings with every deck']),
  mk('Pulse Analytics', ['Real-time sports stats for coaches. 8,000 teams, 40M data points per season.', 'Team plan $79/mo', 'API for developers', 'NCAA compliant']),
  mk('Greenline Transit', ['Electric bus network for mid-sized cities. 120 buses, 38 routes, 4M rides in 2025.', 'Fares from $1.50', '24/7 frequency on 6 lines', 'Zero-emission fleet']),
  mk('Copperline', ['Hand-forged copper cookware. 500 pans/month, 30-year warranty.', 'Skillets from $180', 'Made in Brooklyn', 'Passed down for generations']),
  mk('Skylight', ['Astronomy subscription boxes. 12,000 subscribers, monthly celestial guides.', '$29/mo, cancel anytime', 'Includes planisphere + star charts', 'Founded by two astronomers']),
  mk('Marrow', ['Bone broth and gut-health drinks. 2,000 cafés stocked, 500k jars sold.', '4-pack $36', 'Slow-simmered 24 hours', 'Single-origin bones']),
  mk('Brightpath', ['Online tutoring for STEM. 15,000 sessions/month, 98% pass-rate lift.', 'From $32/hr', 'Vetted tutors: 1,800', 'Free first session']),
  mk('Tidepool', ['Surf coaching and retreats. 6 retreats/year, 90 guests total.', 'Retreats from $2,400', '1:4 coach ratio', 'All levels welcome']),
  mk('Grand Atlas', ['Luxury train journeys across 3 continents. 14 routes, 40 departures a year.', 'Fares from $4,800', 'Private suites with showers', 'Aboard since 1988']),
  mk('Fable & Fact', ['Historical fiction book club. 22,000 members, monthly hardcover picks.', '$19/mo includes shipping', 'Author AMAs every month', 'Founded 2019']),
  mk('Quickstep', ['Tap and jazz dance school. 350 students, 40 classes/week.', 'Trial class $15', 'Adult beginner track', 'Recitals each June']),
  mk('Halfmoon', ['Coworking for night owls. 24/7 access, 600 members across 3 locations.', 'Night pass $69/mo', 'Soundproof pods', 'Cafe open till 2am']),
  mk('Wavelength', ['Podcast production studio. 300 shows produced, 60M downloads/month.', 'Produce your show from $500', '4 booking rooms', 'Founded by ex-NPR producers']),
  mk('Berry Good', ['U-pick berry farms. 80 acres, 6 berry varieties, open May–Sept.', 'Entry $12/adult', 'Pies baked daily', 'Wine tasting from our berries']),
  mk('Circus Alba', ['Contemporary circus company. 40 performers, 2 touring shows.', 'Tickets from $38', 'Youth academy: 120 students', 'Performed in 14 countries']),
  mk('Lime & Thyme', ['Farm-to-table deli and caterer. 200 corporate clients, 40 event menus.', 'Catering from $18/head', 'Weekly market box', 'Est. 2007']),
  mk('Monarch', ['Butterfly conservation sanctuary. 12 acres of habitat, 8,000 monarchs tagged.', 'Visit: $15', 'Adopt-a-caterpillar $5', 'Volunteer weekends']),
  mk('Sable & Stone', ['Jewelry from reclaimed materials. 60 designs, recycled gold + lab diamonds.', 'Rings from $420', 'Repair service for life', 'Certified carbon neutral']),
  mk('Driftline', ['Wetsuits and swimwear. 4 collections/year, neoprene made from oyster shells.', 'Wetsuits from $240', '40+ year durability test', 'Repair-at-home kits']),
  mk('Cinder', ['Ceramics studio and school. 12 kilns, 300 students/semester.', 'Classes from $120', 'Open studio $25/day', 'Gallery: 40 local artists']),
  mk('North Star', ['Leadership coaching for first-time managers. 900 coached, 87% promoted within 2 years.', 'Program $1,800', '4:1 cohort ratio', '60-day guarantee']),
  mk('Dune & Co', ['Desert adventure tours. 22 guided routes, 5,000 travelers/year.', 'Half-day from $95', 'Solar-powered camp', 'Permits and safety first']),
  mk('Cantilever', ['Structural engineering for timber buildings. 140 projects, 12 mass-timber awards.', 'Consult from $2,500', '9 offices in 4 countries', 'B Corp certified']),
  mk('Stitch & Story', ['Knitwear patterns and kits. 400 patterns, 80k kits shipped.', 'Kits from $24', 'Beginner video tutorials', 'Yarn from ethical mills']),
  mk('Tamarind', ['Vietnamese street food kitchen. 4.8 stars, 900 reviews.', 'Bowl from $13', 'Chef’s tasting $48', 'Open till midnight Fri–Sat']),
  mk('Wildpeak', ['Backcountry ski guiding. 12 winter routes, groups capped at 6.', 'Day tours from $180', 'Avalanche safety included', 'AMGA-certified guides']),
  mk('Harbor & Hearth', ['Nantucket-style home goods. 300 products, 90% made in New England.', 'Throws from $68', 'Monogramming free', 'Gift wrap included']),
  mk('Nimbus', ['On-demand cloud workstations for 3D artists. 2,400 seats, 99.9% uptime.', 'From $0.60/hr', 'GPU: RTX 6000 Ada', 'Pause billing anytime']),
  mk('Scribe', ['Medical scribing for clinics. 800 providers, 2M notes transcribed.', 'Per-note pricing from $0.85', 'HIPAA + SOC2', '24-hour turnaround']),
  mk('Poppy & Pine', ['Floral design for weddings. 300 weddings, 45 venues served.', 'Designs from $2,200', 'In-house archivist team', 'Peony season specialists']),
  mk('Redwood', ['Wood-fired pizza + natural wine. 4.9 stars, 1,400 reviews.', 'Pies from $16', '75 natural wines by the glass', 'James Beard semifinalist']),
  mk('Terraform', ['Landscape architecture studio. 80 projects, 6 ASLA awards.', 'Residential from $6k', 'Native-plant specialists', 'Construction oversight included']),
  mk('Crow & Quill', ['Independent bookstore + rare press. 30k titles, 200 first editions.', 'Signed editions weekly', 'Bookbinding workshops', 'Est. 1964']),
  mk('Vantage', ['Drone surveying for construction. 600 sites mapped, 12cm accuracy.', 'Quote in 24h', 'FAA Part 107 pilots', '3D models in 48 hours']),
  mk('Solstice', ['Sauna + cold plunge studio. 8 private suites, 2,000 visits/month.', '60-min session $45', 'Membership $120/mo', 'Open 6am–11pm']),
  mk('Maple Row', ['Vermont maple syrup and pantry. 40,000 taps, 12,000 gallons a year.', 'Half-gallon $32', 'Graded: golden, amber, dark', 'Sugaring tours in March']),
];

const cases = S.map((s) => {
  let html;
  if (s.title === '') html = '';
  else if (s.title === 'LONG') html = '<html><head><title>Long</title></head><body><h1>Long</h1><p>' + s.lines.join('</p><p>') + '</p></body></html>';
  else if (s.title === 'ListHeavy') html = '<ul>' + s.lines[0].split('\n').map((l) => '<li>' + l.replace(/^- /, '') + '</li>').join('') + '</ul>';
  else html = '<h1>' + s.title + '</h1>' + s.lines.map((l) => '<p>' + l + '</p>').join('');
  return { name: s.title || 'empty', html };
});

const results = [];
const t0 = Date.now();
cases.forEach((c) => {
  try {
    const content = extractContent(c.html, c.name + '.html');
    const res = autoGenerate(content, { seed: 42 });
    const out = res.output;
    const fid = sourceFidelity(content, out);
    const q = res.design ? res.design.quality : (typeof res.total === 'number' ? res.total : 'n/a');
    results.push({ name: c.name, token: res.token, quality: q, fid: fid.percentage, anchors: content.anchors.length, preserved: fid.preserved || 0, size: out.length, hasCSS: out.includes('<style') });
  } catch (e) {
    results.push({ name: c.name, error: e.message });
  }
});
const ms = Date.now() - t0;
const ok = results.filter((w) => !w.error);
const qs = ok.map((w) => w.quality);
const fids = ok.map((w) => w.fid);
const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
console.log('cases:', cases.length, '| errors:', results.length - ok.length, '| in', ms + 'ms');
console.log('quality avg:', avg(qs), '| min:', Math.min(...qs), '| max:', Math.max(...qs));
console.log('fidelity avg:', avg(fids), '| min:', Math.min(...fids));
console.log('--- worst 10 by quality ---');
results
  .filter((w) => !w.error)
  .sort((a, b) => a.quality - b.quality)
  .slice(0, 10)
  .forEach((w) => console.log(JSON.stringify(w)));
console.log('--- lowest fidelity ---');
ok
  .sort((a, b) => a.fid - b.fid)
  .slice(0, 6)
  .forEach((w) => console.log(w.name, '| fid', w.fid, '| anchors', w.anchors, '| kept', w.preserved));
