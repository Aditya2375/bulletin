/* The Bulletin — seed registry + source adapters.
   Every listing below was checked against its public source page on 27 Sept 2026.
   `tba: true` means the source had not published firm dates at that time — the card
   says so rather than inventing one. `committed: true` entries are Aditya's own
   calendar, included so clash detection has something to clash against. */

const INTERESTS = ["ai", "hackathon", "web", "open-source", "cp", "design", "startups", "hardware"];

const COMMITTED = [
  { name: "KJU hackathon", start: "2026-10-08", end: "2026-10-08", place: "bengaluru" },
  { name: "ZeroCode, Chennai", start: "2026-10-09", end: "2026-10-10", place: "chennai" },
  { name: "Devforge", start: "2026-10-24", end: "2026-10-24", place: "bengaluru" },
  { name: "Atria / RVU event", start: "2026-10-30", end: "2026-10-30", place: "bengaluru" }
];

const EVENTS = [
  {
    id: "ghw-hacktoberfest",
    name: "Global Hack Week: Hacktoberfest",
    org: "Major League Hacking",
    start: "2026-10-09", end: "2026-10-15", tba: false,
    mode: "online", city: "online",
    tags: ["hackathon", "open-source", "web", "ai"],
    fee: "free", prize: "swag & badges",
    deadline: "reg open",
    source: { name: "MLH", url: "https://events.mlh.io/events/14553" },
    blurb: "A week of workshops, mini-events and open-source contributions timed to Hacktoberfest. Fully online; join from the hostel room."
  },
  {
    id: "odoo-nmit",
    name: "Odoo × NMIT Bangalore Hackathon 26",
    org: "Odoo & NMIT",
    start: "2026-10-01", end: "2026-10-31", tba: true,
    mode: "in-person", city: "bengaluru", venue: "NMIT, Yelahanka",
    tags: ["hackathon", "web", "startups"],
    fee: "free", prize: "per source page",
    deadline: "see listing",
    source: { name: "Odoo", url: "https://hackathon.odoo.com/event/odoo-x-nmit-bangalore-hackathon-26-38/register" },
    blurb: "Build on the Odoo platform at Nitte Meenakshi Institute. The listing pins it to October 2026; exact dates publish on the page."
  },
  {
    id: "agentversity",
    name: "Agentversity AI Hackathon: Build the Agentic Future",
    org: "Agentversity",
    start: "2026-11-21", end: "2026-11-21", tba: true,
    mode: "in-person", city: "bengaluru",
    tags: ["ai", "hackathon", "startups"],
    fee: "free", prize: "per source page",
    deadline: "Luma RSVP",
    source: { name: "Luma", url: "https://luma.com/agentv-31xl" },
    blurb: "An agentic-AI build day in Bengaluru, tentatively 21 Nov. Closest thing on the wire to what you already build every night."
  },
  {
    id: "ai-for-good",
    name: "AI for Good Hackathon 2026",
    org: "Internshala · UN SDG hybrid sprint",
    start: "2026-10-01", end: "2026-11-30", tba: true,
    mode: "hybrid", city: "bengaluru", venue: "Bengaluru & Dubai",
    tags: ["ai", "hackathon", "startups"],
    fee: "free", prize: "per source page",
    deadline: "see listing",
    source: { name: "Internshala", url: "https://internshala.com/competitions/ai-for-good-hackathon-2026/" },
    blurb: "UN SDG-themed AI sprint run hybrid across Bengaluru and Dubai. Good first ‘serious’ hackathon: structured, mentored, judged."
  },
  {
    id: "mini-sih",
    name: "Mini Smart India Hackathon 2026",
    org: "Presidency University",
    start: "2026-10-01", end: "2026-12-31", tba: true,
    mode: "in-person", city: "bengaluru", venue: "Presidency University",
    tags: ["hackathon", "ai", "hardware"],
    fee: "free", prize: "per source page",
    deadline: "see listing",
    source: { name: "Unstop", url: "https://unstop.com/hackathons/mini-smart-india-hackathon-2026-presidency-university-pu-bangalore-1650656" },
    blurb: "A campus-scale rehearsal for the national SIH. Same problem-statement format, friendlier stakes."
  },
  {
    id: "next-gen",
    name: "Next Gen Hackathon 2026 — Bengaluru",
    org: "NextGen Expo",
    start: "2026-10-01", end: "2026-12-31", tba: true,
    mode: "hybrid", city: "bengaluru",
    tags: ["hackathon", "web", "ai", "startups"],
    fee: "see listing", prize: "per source page",
    deadline: "Devpost",
    source: { name: "Devpost", url: "https://next-gen-hackathon.devpost.com/" },
    blurb: "National-level challenge series for students and early builders, judging on Devpost."
  },
  {
    id: "cafe-compute",
    name: "Cafe Compute Meetup: Bangalore",
    org: "Cafe Compute",
    start: "2026-10-01", end: "2026-12-31", tba: true,
    mode: "in-person", city: "bengaluru",
    tags: ["ai", "startups"],
    fee: "free", prize: "—",
    deadline: "Luma RSVP",
    source: { name: "Luma", url: "https://luma.com/cafecomputebangalore" },
    blurb: "Recurring builders-over-coffee meetup, back in Bengaluru again. Low ceremony, high signal; dates drop on Luma."
  },
  {
    id: "ai-gpu-presummit",
    name: "AI × GPU Pre-Summit",
    org: "Electronic City",
    start: "2026-10-01", end: "2026-12-31", tba: true,
    mode: "in-person", city: "bengaluru", venue: "Electronic City",
    tags: ["ai", "hardware", "startups"],
    fee: "see listing", prize: "—",
    deadline: "Luma RSVP",
    source: { name: "Luma", url: "https://luma.com/f5uhl6l8" },
    blurb: "Hardware-adjacent AI summit warm-up out in Electronic City. Worth it if GPUs are your kind of fun."
  },
  {
    id: "ai-product-hack",
    name: "AI Product Hackathon",
    org: "Product Space",
    start: "2026-10-01", end: "2026-12-31", tba: true,
    mode: "online", city: "online",
    tags: ["ai", "startups", "hackathon"],
    fee: "see listing", prize: "per source page",
    deadline: "see listing",
    source: { name: "Unstop", url: "https://unstop.com/hackathons/ai-product-hackathon-product-space-1702203" },
    blurb: "Ship a product-shaped AI thing rather than a demo-shaped one. Online, runs on Unstop."
  },
  {
    id: "social-hack-cmrit",
    name: "The Social Hackathon 2026",
    org: "CMRIT",
    start: "2026-10-01", end: "2026-12-31", tba: true,
    mode: "in-person", city: "bengaluru", venue: "CMR Institute of Technology",
    tags: ["hackathon", "web", "ai"],
    fee: "see listing", prize: "per source page",
    deadline: "see listing",
    source: { name: "Unstop", url: "https://unstop.com/hackathons/the-social-hackathon-2026-cmr-institute-of-technology-cmrit-bangalore-1673563" },
    blurb: "Social-impact themed hack at CMRIT, Whitefield side. Good team-of-four practice ground."
  }
];

/* Committed events, rendered as such so clashes are visible. */
const MINE = COMMITTED.map((c, i) => ({
  id: "mine-" + i, name: c.name, org: "your stated plans",
  start: c.start, end: c.end, tba: false,
  mode: c.place === "bengaluru" ? "in-person" : "in-person", city: c.place,
  tags: ["hackathon"], fee: "—", prize: "—", deadline: "—",
  source: { name: "Going", url: "" }, committed: true,
  blurb: "You said you're going — so the wire checks everything else against this."
}));

/* Source adapters: what the wire reads today and what live ingestion needs. */
const SOURCES = [
  { name: "Luma", status: "seeded", needs: "No public REST API; ingestion via each event’s .ics export or the Luma calendar feed. An adapter can poll subscribed calendars hourly.", url: "https://luma.com/bengaluru" },
  { name: "Unstop", status: "seeded", needs: "No public API for third parties. Live mode needs a polite scraper with caching + their robots/terms respected, or a partner agreement.", url: "https://unstop.com/hackathons" },
  { name: "Devpost", status: "seeded", needs: "Hackathon listings are public pages; a scraper or RSS watch works. No official API.", url: "https://devpost.com/hackathons" },
  { name: "MLH", status: "seeded", needs: "events.mlh.io publishes listings and many events expose .ics; adapter can poll the season page.", url: "https://mlh.io/seasons/2026/events" },
  { name: "Internshala", status: "seeded", needs: "Public competition pages; scraper adapter with cache. No official API.", url: "https://internshala.com/competitions/" },
  { name: "Meetup", status: "adapter-spec", needs: "Official GraphQL API — needs a Meetup Pro/OAuth key. Adapter is specced in README; drop a key in config to go live.", url: "https://www.meetup.com/api/" },
  { name: "Eventbrite", status: "adapter-spec", needs: "Official REST API — needs a private token. Specced in README; drop a key in config to go live.", url: "https://www.eventbrite.com/platform/api" }
];
