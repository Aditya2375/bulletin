# The Bulletin

Every hackathon, meetup and builder gathering worth your Saturday — read from a dozen sites so you read one. A Bengaluru what's-on wire for builders.

## Run it

Open `index.html` in a browser, or serve the folder statically. Interests and filters live in `localStorage`.

## Backend

The board is served live from a Supabase Postgres table (`public.events`) over PostgREST with the project's publishable (browser-safe) key; Row Level Security allows anonymous reads and no anonymous writes. If the database is unreachable the app falls back to the baked seed in `events.js` and says so in the masthead. The "suggest an event" form writes to `public.submissions` (anonymous INSERT only, no reads; check constraints validate shape and URL scheme server-side) — a review queue, not a direct path to the board. The service-role key is never shipped.

## What's inside

- **Unified board**: hackathons, meetups and summits from MLH, Luma, Unstop, Devpost and Internshala in one stream, each card linking out to the original listing.
- **Explainable matching**: pick your interests and city; every card shows *why* it matched ("why this: #ai · #hackathon · bengaluru"). Transparent scoring, no black box. A real LLM matcher can replace `score()` later — the shape is already "reasons in, list out".
- **Clash detection**: events are checked against plans marked as "going" and overlapping cards get a warning (online events get a softer note — you can do those from anywhere).
- **Cross-site search**: one box searches the wire, and offers the same search as deep links on Luma, Unstop, Devpost and Eventbrite.
- **My tracker**: anyone can keep a private list of events they are chasing: status, event date, registration deadline, team code, link and note, with live countdowns. It is stored in this browser's localStorage only; nothing is sent to any server. "+ track this" on any card pre-fills it.
- **Filters**: next 30 days, online / in person, free only, and "you're going".

## Data & honesty

Seed listings in `events.js` were checked against their public source pages on 27 Sept 2026. Where a source had not published firm dates, the card says "dates TBA" rather than guessing. Entries marked ★ going are neutral example plans baked into the demo so clash detection has something to check against — edit `COMMITTED` in `events.js` to make them your own.

## Going live (ingestion architecture)

Each source has an adapter entry in `SOURCES` describing exactly what live ingestion needs:

- **Meetup, Eventbrite** — official APIs; drop an API key into config and the adapter specced in the UI goes live.
- **Luma, MLH** — poll `.ics` exports / season listings hourly; no key needed.
- **Unstop, Devpost, Internshala** — no public API; need a polite cached scraper or a partner agreement.

The seeded registry is the cache layer of that same pipeline, so the app is fully usable today and the live layer is a drop-in, not a rewrite.
