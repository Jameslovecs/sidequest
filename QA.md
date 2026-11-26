# Release QA

## Automated

`npm run check` and `npm test`: passing, 12 tests.

Coverage: English/Chinese supported prompt fields, date rollover, noon/midnight, hard budget/cuisine/vegan/party constraints, invalid shared payloads, encoded Uber/Maps destinations, PST and PDT calendar conversion, departure buffer math, tentative calendar status and UTF-8 line folding.

## Browser checks

Chrome desktop and a 390 × 844 viewport:

- Initial app renders with Friday date, two guests, $85 allowance and Ferry Building origin.
- Plant-based example selects Japanese/vegan and Salesforce Park, with Shizen as the single matching venue.
- Saving and restoring retains all plan fields; saved-count updates.
- Share dialog exposes a plan-bearing URL and explains what it includes.
- Five guests plus vegan/Japanese produces zero results, with a recovery button and no stale booking links.
- Selecting Foreign Cinema updates the itinerary, budget, and handoff links.
- Mobile cards and itinerary remain within viewport width; layout switches to one column.
- No purchases, real rides, or restaurant bookings were made during testing.

## Limits of verification

Core calendar content is tested in Node; desktop calendar-app import is not tested. External provider links are constructed according to documented URL schemes and use verified official restaurant URLs; authenticated provider checkout, availability, and app behavior are outside this static MVP and have not been transaction-tested. Holiday hours and cancellations are not synchronized. Safari and Firefox were not separately tested.
