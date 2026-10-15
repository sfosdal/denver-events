# Denver Events

Event feed and calendar for Denver, Colorado: Ball Arena, Empower Field at
Mile High, Coors Field, the Mission Ballroom, the Fillmore, the Paramount, the
Denver Center's Buell Theatre and Ellie Caulkins Opera House, Boettcher Concert
Hall, the Bellco, the Coliseum and the National Western Complex, the Colfax
and Broadway rooms (the Ogden, Bluebird, Summit, Marquis, Cervantes', Ophelia's,
Hi-Dive, Oriental, Club Vinyl), Meow Wolf, Comedy Works, the Grizzly Rose,
Magness Arena and Levitt Pavilion, with Red Rocks, Fiddler's Green, the
Gothic, Dick's Sporting Goods Park and the Boulder rooms (Folsom Field, the CU
Events Center, the Boulder Theater, Chautauqua) as the "Red Rocks, Boulder &
Beyond" group — and the home teams' seasons (Broncos, Nuggets, Avalanche,
Rockies, Rapids, DU Pioneers hockey, CU Buffs football and basketball) in a
Teams view.

Live at **https://denver.here.events/** (GitHub Pages, built by the Actions
workflow once a day at noon Mountain).

Built 2026-10-15 on the family's city pattern. Everything that makes this
Denver's is `site/city.js` (every team, venue, type, default, share-code
registry, holiday and string), `site/index.html`, `scripts/fetch-events.mjs`
(the sources), `site/embed.js`, `outlook.json`, `scripts/data/postseason.json`,
`channels.json`, the manifest and icons. Everything else — `app.js`,
`filter.js`, `styles.css` bar its `--v-*` hue lines, the shared `scripts/*.mjs`
and their tests — is lqa-events' own, byte for byte, copied in by
`sync-shared.sh` from the lqa-events project.

## Sources

- **Ticketmaster Discovery API** — the 33 rooms Ticketmaster lists, each by
  its venue id (every page). Parking, suites, tours, VIP upgrades and season
  bundles are dropped per room (`tm.exclude`); Meow Wolf's daily admission rows
  and Red Rocks' yoga mornings too. Church events are left out (`isChurch`).
  Coors Field and Dick's Sporting Goods Park list little or nothing there, so
  the Rockies' and Rapids' home dates are injected from the league schedules
  (city.js `inject`).
- **Levitt Pavilion Denver** — its Squarespace calendar (`?format=json`,
  `scripts/feeds.mjs` kind `squarespace`); the free season runs May to
  September, so the row is empty over the winter.
- **Chautauqua** — the park's Events Calendar REST feed (kind `tribe`), kept
  to the shows: tours, hikes, classes and meetings are dropped.
- **Seasons** — ESPN for the Broncos, Nuggets, Rapids, Pioneers and Buffs, the
  NHL's schedule API for the Avalanche and MLB's Stats API for the Rockies
  (`scripts/schedules.mjs`).

## Build

```
cp .env.example .env   # TICKETMASTER_API_KEY=… (a free Discovery key)
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # writes site/events.json, the .ics feeds, teams.json
node --test scripts/*.test.mjs
python3 -m http.server 8000 --directory site
```

`ALLOW_NO_ARCHIVE=1` is only for the first build, before the `events-archive`
branch exists; in CI the workflow sets it as a repository variable until the
first run has pushed the archive, then it is deleted.

## Sister sites

lqa-events (Seattle Center) is the source of truth for the shared files. See
its README for the pipeline, the share codes and the Teams view.
