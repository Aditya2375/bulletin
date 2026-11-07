# Contributing to Bulletin

Thanks for helping. Bulletin is a small static site: plain JavaScript, HTML and CSS, no build step.

## Run it locally

1. Clone the repo.
2. Open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`).
3. With no network, the site falls back to the bundled event archive.

## What helps most

- Bug fixes and small UI or accessibility improvements
- Documentation fixes
- Tests for the date handling and the tracker
- New event sources, as long as every listing stays labeled unverified

## Ground rules

- Keep it dependency-free. No build tools or frameworks.
- Keep the safety checks: escape external text, allow only HTTP(S) links, keep the read limits.
- Never add real keys, tokens or personal data. The backend (Supabase) is not in this repo.
- Do not post to the review endpoint while testing.

## Sending a change

1. Open an issue first for anything bigger than a small fix.
2. Fork, branch, and keep each pull request to one change.
3. In the pull request, say what you changed and how you checked it in the browser.

Questions: open an issue.
