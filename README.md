# Roster Run (prototype)

Clickable prototype for rostering bus drivers, driver assistants, buses **and passengers** onto routes. **All data is fake demo data** – people, passengers, phone numbers, regos and places (Kellerton, Wattle Creek, Silverleaf Valley etc.) are fictional, stored in the browser's localStorage. Use "Reset demo data" to start over.

Static site – no build step. Open `index.html` via any static host (e.g. GitHub Pages) or `python3 -m http.server`.

## Sections

- **Dashboard** – today's runs (with passenger counts), warnings this week, compliance alerts, week at a glance, and a **Passengers** tile (active passengers, how many ride today, wheelchair users).
- **Roster** – week grid (drag drivers, assistants and buses onto runs) or day list. Each run shows its passenger count; click a run to edit the crew and see the passenger list.
- **Drivers / Assistants / Buses / Routes** – add, edit, delete and search. Buses show the passengers they carry today; Routes show passengers per run (click the count to see names).
- **Passengers** – add, edit, delete, search, and filter by route.
- **Trip log** – who drove which bus, when, and how many passengers; export to CSV (includes passenger count and names).
- **Run sheet** – printable daily sheet with a **passenger manifest** under each run (name, pickup stop, contact, medical notes, on/off tick boxes).

## Passengers

Each passenger has: full name (required), route plus the runs they ride (AM and/or PM, or Midday/Day for single-run routes), pickup stop/address, guardian or contact name and phone, wheelchair user (yes/no), medical/notes, and active/inactive. Inactive passengers stay on file but are left off runs, counts and manifests.

**How passengers link to buses:** a passenger is booked on a route's run (e.g. S101 AM). Whichever bus is rostered on that run on a given day carries them. Swap the bus in the roster and the passengers move with the run.

New checks (they appear with the existing roster warnings):

- **Over capacity** – more active passengers on a run than the rostered bus has seats.
- **Wheelchair passenger, no access** – a wheelchair user is booked on a run whose bus is not wheelchair accessible.
- **No assistant** – the existing "route needs an assistant" check now also says how many passengers are on board.

The demo data has 58 passengers (55 active, 4 wheelchair users) across all eight routes. Two runs this week deliberately trigger the new warnings: R201 Midday on Monday (16 seniors on the 14-seat B05) and S105 PM on Wednesday (three wheelchair users on B10, which has no hoist).

## Data

Stored in localStorage under `rosterrun.v3` (data version 3). Visitors with saved v2 data are migrated automatically: their drivers, buses, routes and roster are kept and the demo passengers are added.

Files: `index.html`, `styles.css`, `app.js`, `icon.svg`, `apple-touch-icon.png`, `favicon-32.png`, `icon-192.png`, `icon-512.png`, `manifest.webmanifest`. Tests (`tests/test.js`, `tests/shots.js`) use Playwright against `http://localhost:8765/`.
