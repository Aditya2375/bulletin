# The Bulletin

Live: https://bulletin-two-weld.vercel.app/

A cached event-discovery reader and browser-local tracker. Open index.html or serve the folder statically. No build dependencies. Fonts self-hosted with licenses in assets/font-licenses.txt.

## What is and is not current

The bundled archive was marked checked 27 Sept 2026. A successful Supabase cache read does not verify source freshness. Every listing is labeled unverified; expired dates are marked past. Next 30 days uses the current local date, includes ongoing confirmed events and excludes expired/TBA entries. Verify dates, fees, eligibility and registration with the original organizer. No demo attendance is represented as your plans. No ingestion adapter source is included here. The database includes newer records, but its server automation and source verification are unverified. Discovery links do not implement ingestion.

## Safety and storage

External event fields are validated and escaped; listing links allow only HTTP(S) without credentials. Reads have 15s timeout, 100-row and 1.5MB parsed-response limits. Unavailable reads fall back to the labeled archive. Personal tracker is browser-local, with 500-item/1MB input limits, strict calendar dates, escaped text and JSON export. Export before clearing site data; quota failure keeps this tab's entries with a warning. Interests fail gracefully if storage is blocked.

Suggestions send only the visible form fields to the project's review endpoint, serialized with no automatic retries. Uncertain delivery is reported as unconfirmed, not failed. Publisher batches are limited, serialized and stop on uncertainty; publisher tokens are never saved and clear after a batch. Do not expose publisher tokens to untrusted pages.

## Backend audit limitation

Supabase SQL migrations, RLS policies, review/moderation, rate limiting, retention and ingest_event RPC authorization are not present in this repo. Their security cannot be certified from browser code or a publishable key. No real submission/publishing POST was used in this frontend audit. Backend audit remains blocked until source and permissions can be reviewed. The browser key is public by design, not an authorization boundary. No secrets or service-role keys belong here.

Support: adityakulkarnicoding@gmail.com
