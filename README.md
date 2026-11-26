# Sidequest — Dinner & Ride

**[Try the live app](https://sidequest-dinner-ride.jamesbonds520.chatgpt.site)** · [Source](https://github.com/Jameslovecs/sidequest)

A free, account-free San Francisco evening planner. Describe a dinner, compare curated restaurants, choose one, adjust your departure plan, and open the restaurant, Uber, or Google Maps to complete the next step.

## Run locally

Requires Node.js 20 or newer. No dependencies, API keys, billing setup, or installation step.

```sh
git clone https://github.com/Jameslovecs/sidequest.git
cd sidequest
npm run dev
```

Open http://127.0.0.1:4173. Run `npm test` for the core tests and `npm run check` for JavaScript syntax checks.

## What works

- Deterministic English/Chinese parsing for supported date, time, guest count, budget, cuisine, vibe, and departure landmarks. Example: `Italian dinner for four on Friday at 6:30pm under $100 from Union Square`.
- Six real SF restaurants, with official website links, editorial food allowances, hard budget/cuisine/party filters, and a strict fully-vegan filter.
- Editable travel allowance and arrival buffer; all times interpreted in America/Los_Angeles.
- Uber deep links carrying pickup/drop-off coordinates and addresses; Google Maps directions links.
- Official restaurant booking handoff. Dates and guests must be entered at the destination website.
- Local saved plans, duplicate prevention, restore/remove, shareable URL fragments, and downloadable tentative `.ics` calendar events.
- Responsive layout, keyboard-accessible controls, dialogs, validation, and no-results states.

## Honest scope

This is a working planning-and-handoff MVP, **not an autonomous booking agent**. The prompt parser is rule-based, not an LLM. No live reservation inventory, live menu prices, automated ordering, charges, cancellations, Uber fare quotes, traffic ETA, delivery ordering, or background monitoring are implemented. No DoorDash API is integrated. Start points are six SF landmarks, not arbitrary address geocoding.

Restaurant suggestions do not imply availability or opening hours. Hours, holidays, reservation windows, and cancellation policies must be checked at the official venue. The 5–9pm input range is a product boundary, not a promise that venues are open. Editorial budgets cover food only; drinks, tax, tips, surcharges, and rides are extra. Dietary needs and noise preferences must be confirmed directly. The map illustration is schematic, not a road map. Travel defaults to a user-editable 25-minute allowance; consult Maps for live conditions.

Uber links initiate the provider's **current** request flow; they do not schedule the ride for the dinner date. Review the locations, price, vehicle, and timing before confirming with Uber. Sidequest never labels a reservation as confirmed and calendar events are `TENTATIVE`.

## Architecture

Buildless HTML/CSS/ES modules, with no npm dependencies:

```text
dist/index.html    accessible application shell
dist/styles.css    desktop and mobile styles; original SVG illustrations in app.js
dist/data.js       curated restaurants and departure landmarks
dist/planner.js    pure parsing, filtering, links, timezone and calendar logic
dist/app.js        rendering, user interactions, local saves and sharing
server.mjs        local-only static development server
tests/            core regression tests using node:test
.openai/hosting.json  Sites deployment identity and static directory
```

There is no build step. Deploy the contents of `dist/` to any static HTTPS host. All asset paths are relative, so subpath hosting works. No SPA fallback is needed; plans use URL fragments. `.openai/hosting.json` configures the current Sites deployment; it contains no credential. For a new independently owned Site, use its own project identity rather than reusing this one.

### Free GitHub Pages alternative

The included Pages workflow is manual to avoid enabling a second deployment unintentionally. In GitHub Settings → Pages choose **GitHub Actions**, then run **Deploy GitHub Pages** from Actions. It tests the source and uploads only `dist/`. For this public repository, GitHub Pages can serve at `https://jameslovecs.github.io/sidequest/` without a custom domain or paid services. The primary live deployment is the Sites link above.

## Data and privacy

Prompts and parsing stay in the browser. Only clicking Save writes plans to `localStorage` under `sidequest.plans.v1` (latest 20). Shared URL fragments contain the plan; anyone with the URL can read it. They are not sent to the static host as HTTP request data. No analytics, account backend, cookies set by the application, or payment data storage. Hosting and external services have their own policies. Google Fonts is the sole external resource on page load and has a system-font fallback. Booking/ride/maps links send the selected destination details to their providers.

Never commit `.env` files, API keys, tokens, or account data. `.gitignore` excludes common secret/runtime files. No secrets are required. Future paid APIs should be opt-in and server-side; never place credentials in `dist/` or shared URLs.

## Sources

Official restaurant sites reviewed November 25, 2026. Coordinates and vibe/allowance labels are approximate editorial data; refresh before expanding the catalog.

- [Foreign Cinema](https://foreigncinema.com/)
- [Nopa reservations](https://www.nopasf.com/reservations)
- [Cotogna](https://www.cotognasf.com/)
- [Shizen](https://www.shizensf.com/)
- [Souvla Hayes Valley](https://www.souvla.com/location/souvla-hayes-valley/)
- [Delfina](https://www.delfinasf.com/)
- [Uber deep links](https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction)
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)

Independent project, not affiliated with these services or restaurants. Original interface illustrations; no restaurant photography is represented.

## Validation and next steps

`npm test` checks parsing, constraint filtering, malformed share data, URL encoding, PST/PDT conversion, timeline offsets, and RFC 5545 calendar folding. See [QA.md](QA.md) for manual validation.

To graduate to autonomous execution: secure approved platform API access, add a server-side connector boundary, an explicit transaction review step, idempotent booking/ride operations, verified receipts, cancellation support, and integration tests against provider sandboxes. Keep the current handoff flow as a fallback. No paid integrations have been enabled.

## License

MIT; see [LICENSE](LICENSE).
