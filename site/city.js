// The city — every fact that makes this calendar Denver's rather than
// another town's, in one place (2026-10-15: built on the Anchorage site's
// pattern the afternoon Pioneer Square went live). The browser (filter.js,
// app.js) and the build (scripts/*.mjs) both read it; nothing else names a
// venue or a team. The shared files (app.js, filter.js, styles.css bar its
// --v-* hues, scripts/*.mjs bar fetch-events.mjs and sources.mjs) are
// lqa-events' own, byte for byte — see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right; the first match wins (app.js teamFor).
  // Per team:
  //   re        the title match (Ticketmaster's titles — "Denver Nuggets vs.
  //             …" — and the injected ones, "<inject.name> vs …")
  //   venue     the home building; schedule = the club's own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   season    where the schedule comes from: ESPN for the Broncos,
  //             Nuggets, Rapids, Pioneers and Buffaloes, the NHL's own API
  //             for the Avalanche, MLB's statsapi for the Rockies
  //   inject    a club whose home dates no ticket feed lists: the league's
  //             schedule puts them on the calendar under this ticket link.
  //             Ticketmaster lists nothing at Coors Field and a handful of
  //             Rapids dates, so both seasons are injected
  //   club      the club's name on Ticketmaster; wiki the article; opens
  //             when the season usually starts
  var TEAMS = [
    // Denver Broncos, NFL, Empower Field at Mile High — Ticketmaster lists the home games
    { slug: 'broncos', label: 'Broncos', re: /\bbroncos\b/i, sport: 'football', venue: 'Empower Field at Mile High', colors: ['#fb4f14', '#002244'],
      espn: { sport: 'football', league: 'nfl', id: '7' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png', schedule: 'https://www.denverbroncos.com/schedule/',
      club: 'Denver Broncos', opens: 'September', wiki: { title: 'Denver Broncos', startYear: true },
      news: [['https://www.denverbroncos.com/rss/news', 'DenverBroncos.com']] },
    // Denver Nuggets, NBA, Ball Arena — Ticketmaster lists the home games
    { slug: 'nuggets', label: 'Nuggets', re: /\bnuggets\b/i, sport: 'basketball', venue: 'Ball Arena', colors: ['#0e2240', '#fec524'],
      espn: { sport: 'basketball', league: 'nba', id: '7' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', schedule: 'https://www.nba.com/nuggets/schedule',
      club: 'Denver Nuggets', opens: 'late October', wiki: { title: 'Denver Nuggets' } },
    // Colorado Avalanche, NHL, Ball Arena — Ticketmaster lists the home games
    { slug: 'avalanche', label: 'Avalanche', re: /\bavalanche\b/i, sport: 'hockey', venue: 'Ball Arena', colors: ['#6f263d', '#236192'],
      espn: { sport: 'hockey', league: 'nhl', id: '17' }, season: { kind: 'nhl', abbrev: 'COL' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png', schedule: 'https://www.nhl.com/avalanche/schedule',
      club: 'Colorado Avalanche', opens: 'early October', wiki: { title: 'Colorado Avalanche' } },
    // Colorado Rockies, MLB, Coors Field — nothing on Ticketmaster, so the home stands are injected from MLB's schedule
    { slug: 'rockies', label: 'Rockies', re: /\brockies\b/i, sport: 'baseball', venue: 'Coors Field', colors: ['#333366', '#c4ced4'],
      espn: { sport: 'baseball', league: 'mlb', id: '27' }, season: { kind: 'mlb', id: 115 }, form: { kind: 'espn' },
      inject: { url: 'https://www.mlb.com/rockies/tickets' },
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/col.png', schedule: 'https://www.mlb.com/rockies/schedule',
      club: 'Colorado Rockies', opens: 'late March', wiki: { title: 'Colorado Rockies' },
      division: ['LAD', 'SD', 'SF', 'AZ'] }, // NL West, by the abbreviations the schedule carries
    // Colorado Rapids, MLS, Dick's Sporting Goods Park — Ticketmaster carries a few dates; the league's schedule fills the season
    { slug: 'rapids', label: 'Rapids', re: /\brapids\b/i, sport: 'soccer', venue: "Dick's Sporting Goods Park", colors: ['#960a2c', '#8bb8e8'],
      espn: { sport: 'soccer', league: 'usa.1', id: '184' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://www.coloradorapids.com/tickets/' },
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/184.png', schedule: 'https://www.coloradorapids.com/schedule/',
      club: 'Colorado Rapids', opens: 'late February', wiki: { title: 'Colorado Rapids' } },
    // Denver Pioneers hockey, NCHC, Magness Arena — Ticketmaster lists the home games
    { slug: 'pioneers', label: 'Pioneers', name: 'Denver Pioneers', abbr: 'DU', re: /\bpioneers\b|denver hockey/i, sport: 'hockey', venue: 'Magness Arena', colors: ['#8b2332', '#8b6f4e'],
      espn: { sport: 'hockey', league: 'mens-college-hockey', id: '2172' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2172.png', schedule: 'https://denverpioneers.com/sports/mens-ice-hockey/schedule',
      club: 'University of Denver Pioneers Hockey', opens: 'early October', wiki: { title: "Denver Pioneers men's ice hockey", teamPage: true } },
    // Colorado Buffaloes football, Big 12, Folsom Field — Ticketmaster lists the home Saturdays
    { slug: 'buffs', label: 'Buffs', name: 'Colorado Buffaloes', abbr: 'COLO', re: /buffaloes football|colorado football|\bbuffs\b(?!.*basketball)/i, sport: 'football', venue: 'Folsom Field', colors: ['#cfb87c', '#000000'],
      espn: { sport: 'football', league: 'college-football', id: '38' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png', schedule: 'https://cubuffs.com/sports/football/schedule',
      club: 'Colorado Buffaloes Football', opens: 'late August', wiki: { title: 'Colorado Buffaloes football', teamPage: true } },
    // Colorado Buffaloes men's basketball, Big 12, the CU Events Center — Ticketmaster lists the home games
    { slug: 'buffsbasketball', label: 'Buffs Basketball', name: 'Colorado Buffaloes', abbr: 'COLO', re: /buffaloes (men'?s )?basketball|colorado (men'?s )?basketball/i, sport: 'basketball', venue: 'CU Events Center', colors: ['#cfb87c', '#565a5c'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '38' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png', schedule: 'https://cubuffs.com/sports/mens-basketball/schedule',
      club: "Colorado Buffaloes Men's Basketball", opens: 'early November', wiki: { title: "Colorado Buffaloes men's basketball", teamPage: true } },
  ];

  // The venues, one record each, by size. Per venue:
  //   capacity how many people the place holds
  //   area     absent = Denver proper; 'town' = beyond the city — Morrison,
  //            Englewood, Greenwood Village, Commerce City, Boulder — the
  //            panel's second group
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page). exclude drops the parking,
  //            suites, tours and bundles the rooms list beside their events
  //   alias    the other spellings the feeds use for it, folded to this name
  //   feed     the room's own calendar, read by scripts/feeds.mjs (kinds
  //            squarespace, tribe — see there)
  // Scouted and left out (README "Sources scouted"): Larimer Lounge, Globe
  // Hall and Lost Lake (Etix rooms with no readable feed), Dazzle (walled),
  // Swallow Hill (an empty calendar export), the Federal, Church, La Rumba
  // and the Soiled Dove (nightly programs), Comedy Works South, the Mercury
  // Cafe and Herman's Hideaway (no listings found).
  var VENUES = {
    // --- Denver: the arena and the stadiums, the Arts Complex, the AEG and Live Nation rooms, the clubs ---
    'Ball Arena': { // the Nuggets', the Avalanche's and the Mammoth's arena, and the biggest concerts
      capacity: 19520,
      type: 'sports',
      cssVar: '--v-ball',
      color: '#e99285',
      url: 'https://www.ballarena.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.ballarena.com&sz=128',
      tm: { id: 'KovZpZAFaJeA', match: 'ball arena', fallbackUrl: 'https://www.ballarena.com/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /ball arena|pepsi center/i,
    },
    'Empower Field at Mile High': { // the Broncos' stadium and the summer stadium tours
      capacity: 76125,
      type: 'sports',
      cssVar: '--v-empower',
      color: '#e9a485',
      url: 'https://www.empowerfieldatmilehigh.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.empowerfieldatmilehigh.com&sz=128',
      tm: { id: 'KovZpa3Wne', match: 'empower', fallbackUrl: 'https://www.empowerfieldatmilehigh.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /empower field|mile high/i,
    },
    'Coors Field': { // the Rockies' ballpark — Ticketmaster lists nothing there, so the home stands come from MLB's schedule (inject)
      capacity: 50144,
      type: 'sports',
      cssVar: '--v-coors',
      color: '#e9b685',
      url: 'https://www.mlb.com/rockies/ballpark',
      icon: 'https://www.google.com/s2/favicons?domain=www.mlb.com&sz=128',
      tm: { id: 'KovZpZA6t7kA', match: 'coors field', fallbackUrl: 'https://www.mlb.com/rockies/ballpark', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /coors field/i,
    },
    'Mission Ballroom': { // AEG's big room in RiNo
      capacity: 3950,
      type: 'concert',
      cssVar: '--v-mission',
      color: '#e9c785',
      url: 'https://www.missionballroom.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.missionballroom.com&sz=128',
      tm: { id: 'KovZ917AxRI', match: 'mission ballroom', fallbackUrl: 'https://www.missionballroom.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /mission ballroom/i,
    },
    'The Fillmore Auditorium': { // Colfax's old ballroom, Live Nation's
      capacity: 3700,
      type: 'concert',
      cssVar: '--v-fillmore',
      color: '#e9d985',
      url: 'https://www.fillmoreauditorium.org/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.fillmoreauditorium.org&sz=128',
      tm: { id: 'KovZpZAE6eJA', match: 'fillmore', fallbackUrl: 'https://www.fillmoreauditorium.org/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /fillmore/i,
    },
    'Paramount Theatre': { // the 16th Street art-deco house: comedy, touring bands, the Mighty Wurlitzer
      capacity: 1870,
      type: 'concert',
      cssVar: '--v-paramount',
      color: '#e8e985',
      url: 'https://www.paramountdenver.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.paramountdenver.com&sz=128',
      tm: { id: 'KovZpZAFa1nA', match: 'paramount', fallbackUrl: 'https://www.paramountdenver.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /paramount theat/i,
    },
    'The Buell Theatre': { // the Denver Center's Broadway house
      capacity: 2830,
      type: 'arts',
      cssVar: '--v-buell',
      color: '#d6e985',
      url: 'https://www.denvercenter.org/tickets-events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.denvercenter.org&sz=128',
      tm: { id: 'KovZpapEke', match: 'buell', fallbackUrl: 'https://www.denvercenter.org/tickets-events/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /buell theat/i,
    },
    'Ellie Caulkins Opera House': { // Opera Colorado and Colorado Ballet's house in the Arts Complex
      capacity: 2225,
      type: 'arts',
      cssVar: '--v-ellie',
      color: '#c4e985',
      url: 'https://www.denvercenter.org/tickets-events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.denvercenter.org&sz=128',
      tm: { id: 'KovZpZAanEvA', match: 'ellie caulkins', fallbackUrl: 'https://www.denvercenter.org/tickets-events/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /ellie caulkins|the ellie/i,
    },
    'Boettcher Concert Hall': { // the Colorado Symphony's hall
      capacity: 2679,
      type: 'arts',
      cssVar: '--v-boettcher',
      color: '#b3e985',
      url: 'https://coloradosymphony.org/events/',
      icon: 'https://www.google.com/s2/favicons?domain=coloradosymphony.org&sz=128',
      tm: { id: 'Z6r9jZdv1e', match: 'boettcher', fallbackUrl: 'https://coloradosymphony.org/events/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /boettcher/i,
    },
    'Bellco Theatre': { // the convention center's theatre
      capacity: 5000,
      type: 'concert',
      cssVar: '--v-bellco',
      color: '#a1e985',
      url: 'https://denverconvention.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.denverconvention.com&sz=128',
      tm: { id: 'KovZpaKBBe', match: 'bellco', fallbackUrl: 'https://denverconvention.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /bellco/i,
    },
    'Denver Coliseum': { // the old barn by the stockyards: rodeo, monster trucks, graduations, Latin shows
      capacity: 10200,
      type: 'community',
      cssVar: '--v-coliseum',
      color: '#8fe985',
      url: 'https://www.denvercoliseum.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.denvercoliseum.com&sz=128',
      tm: { id: 'KovZpZAaeIeA', match: 'coliseum', fallbackUrl: 'https://www.denvercoliseum.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /denver coliseum/i,
    },
    'National Western Complex': { // the Stock Show grounds and the new Cinch Arena
      capacity: 10000,
      type: 'community',
      cssVar: '--v-nwc',
      color: '#85e98d',
      url: 'https://nationalwesterncenter.com/calendar',
      icon: 'https://www.google.com/s2/favicons?domain=nationalwesterncenter.com&sz=128',
      tm: { id: 'KovZpZA1EaEA', match: 'national western', fallbackUrl: 'https://nationalwesterncenter.com/calendar', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /national western|stock show|cinch arena/i,
    },
    'Ogden Theatre': { // AEG's Colfax room
      capacity: 1600,
      type: 'concert',
      cssVar: '--v-ogden',
      color: '#85e99e',
      url: 'https://www.ogdentheatre.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.ogdentheatre.com&sz=128',
      tm: { id: 'KovZpZAJv67A', match: 'ogden', fallbackUrl: 'https://www.ogdentheatre.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /ogden theat/i,
    },
    'Bluebird Theater': { // AEG's small Colfax room
      capacity: 550,
      type: 'concert',
      cssVar: '--v-bluebird',
      color: '#85e9b0',
      url: 'https://www.bluebirdtheater.net/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.bluebirdtheater.net&sz=128',
      tm: { id: 'KovZpZAkEk1A', match: 'bluebird', fallbackUrl: 'https://www.bluebirdtheater.net/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /bluebird theat/i,
    },
    'Summit Music Hall': { // Live Nation's Blake Street hall and its Moon Room
      capacity: 1300,
      type: 'concert',
      cssVar: '--v-summit',
      color: '#85e9c1',
      url: 'https://www.thesummitdenver.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.thesummitdenver.com&sz=128',
      tm: { id: 'KovZpZAFFt1A', match: 'summit', fallbackUrl: 'https://www.thesummitdenver.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /summit music hall|the summit|moon room/i,
    },
    'Marquis Theater': { // Live Nation's Larimer Street club
      capacity: 500,
      type: 'concert',
      cssVar: '--v-marquis',
      color: '#85e9d3',
      url: 'https://www.marquistheater.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.marquistheater.com&sz=128',
      tm: { id: 'KovZpZAJeFkA', match: 'marquis', fallbackUrl: 'https://www.marquistheater.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /marquis/i,
    },
    'Cervantes\' Masterpiece Ballroom': { // the Five Points ballroom and its Other Side
      capacity: 1000,
      type: 'concert',
      cssVar: '--v-cervantes',
      color: '#85e9e5',
      url: 'https://www.cervantesmasterpiece.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.cervantesmasterpiece.com&sz=128',
      tm: { id: 'KovZpZAalekA', match: 'cervantes', fallbackUrl: 'https://www.cervantesmasterpiece.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /cervantes|other side/i,
    },
    'Ophelia\'s Electric Soapbox': { // the LoDo gastro-brothel's stage
      capacity: 300,
      type: 'concert',
      cssVar: '--v-ophelias',
      color: '#85dce9',
      url: 'https://opheliasdenver.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.opheliasdenver.com&sz=128',
      tm: { id: 'KovZ917Aai0', match: 'ophelia', fallbackUrl: 'https://opheliasdenver.com/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /ophelia'?s/i,
    },
    'Hi-Dive': { // South Broadway's indie room (Ticketmaster carries a few of its shows; most sell on DICE)
      capacity: 300,
      type: 'concert',
      cssVar: '--v-hidive',
      color: '#85cae9',
      url: 'https://hi-dive.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=hi-dive.com&sz=128',
      tm: { id: 'KovZpZAE7I1A', match: 'hi-dive', fallbackUrl: 'https://hi-dive.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /hi-?dive/i,
    },
    'Grizzly Rose': { // the country dance hall up I-25
      capacity: 1500,
      type: 'concert',
      cssVar: '--v-grizzly',
      color: '#85b8e9',
      url: 'https://grizzlyrose.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=grizzlyrose.com&sz=128',
      tm: { id: 'KovZpZAFFtFA', match: 'grizzly rose', fallbackUrl: 'https://grizzlyrose.com/events/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /grizzly rose/i,
    },
    'Oriental Theater': { // the Berkeley neighbourhood's old cinema
      capacity: 700,
      type: 'concert',
      cssVar: '--v-oriental',
      color: '#85a7e9',
      url: 'https://theorientaltheater.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=theorientaltheater.com&sz=128',
      tm: { id: 'KovZpaprpe', match: 'oriental', fallbackUrl: 'https://theorientaltheater.com/events/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /oriental theat/i,
    },
    'Meow Wolf Denver': { // Convergence Station's Perplexiplex stage — the daily admission rows are dropped, the shows kept
      capacity: 500,
      type: 'concert',
      cssVar: '--v-meowwolf',
      color: '#8595e9',
      url: 'https://meowwolf.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=meowwolf.com&sz=128',
      tm: { id: 'KovZ917AYbY', match: 'meow wolf', fallbackUrl: 'https://meowwolf.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass|convergence station|admission|general entry|anytime|day pass/i },
      alias: /meow wolf|perplexiplex/i,
    },
    'Comedy Works': { // the Larimer Square basement club (the South room in Greenwood Village is left out)
      capacity: 300,
      type: 'arts',
      cssVar: '--v-comedyworks',
      color: '#8785e9',
      url: 'https://www.comedyworks.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.comedyworks.com&sz=128',
      tm: { id: 'ZFr9jZAeed', match: 'comedy works', fallbackUrl: 'https://www.comedyworks.com/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /comedy works(?! south)/i,
    },
    'Club Vinyl': { // Broadway's four-floor dance club — the ticketed nights
      capacity: 1000,
      type: 'concert',
      cssVar: '--v-vinyl',
      color: '#9885e9',
      url: 'https://www.coclubs.com/event-calendar',
      icon: 'https://www.google.com/s2/favicons?domain=www.coclubs.com&sz=128',
      tm: { id: 'KovZ917AY2e', match: 'vinyl', fallbackUrl: 'https://www.coclubs.com/event-calendar', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /club vinyl/i,
    },
    'Magness Arena': { // DU's rink — Pioneers hockey, the Ritchie Center
      capacity: 6000,
      type: 'sports',
      cssVar: '--v-magness',
      color: '#aa85e9',
      url: 'https://denverpioneers.com/sports/mens-ice-hockey/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=denverpioneers.com&sz=128',
      tm: { id: 'KovZpZAFa7lA', match: 'magness', fallbackUrl: 'https://denverpioneers.com/sports/mens-ice-hockey/schedule', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /magness/i,
    },
    'Levitt Pavilion Denver': { // Ruby Hill Park's free summer stage — its Squarespace calendar (feeds.mjs `squarespace`); empty between September and May
      capacity: 7500,
      type: 'concert',
      cssVar: '--v-levitt',
      color: '#bc85e9',
      url: 'https://www.levittdenver.org/full-calendar',
      icon: 'https://www.google.com/s2/favicons?domain=www.levittdenver.org&sz=128',
      feed: { kind: 'squarespace', url: 'https://www.levittdenver.org/full-calendar?format=json' },
      alias: /levitt/i,
    },
    // --- beyond the city: Red Rocks, Fiddler's Green, Englewood, Commerce City, Boulder ---
    'Red Rocks Amphitheatre': { // Morrison — the season runs April to November
      capacity: 9525,
      type: 'concert',
      area: 'town',
      cssVar: '--v-redrocks',
      color: '#cd85e9',
      url: 'https://www.redrocksonline.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.redrocksonline.com&sz=128',
      tm: { id: 'KovZpZAaeIvA', match: 'red rocks', fallbackUrl: 'https://www.redrocksonline.com/events/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass|yoga on the rocks/i },
      alias: /red rocks/i,
    },
    'Fiddler\'s Green Amphitheatre': { // Greenwood Village's summer shed
      capacity: 17000,
      type: 'concert',
      area: 'town',
      cssVar: '--v-fiddlers',
      color: '#df85e9',
      url: 'https://www.fiddlersgreenamp.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.fiddlersgreenamp.com&sz=128',
      tm: { id: 'KovZpZAEkakA', match: 'fiddler', fallbackUrl: 'https://www.fiddlersgreenamp.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /fiddler'?s green/i,
    },
    'Gothic Theatre': { // AEG's Englewood room on South Broadway
      capacity: 1100,
      type: 'concert',
      area: 'town',
      cssVar: '--v-gothic',
      color: '#e985e2',
      url: 'https://www.gothictheatre.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.gothictheatre.com&sz=128',
      tm: { id: 'KovZpZAanJEA', match: 'gothic', fallbackUrl: 'https://www.gothictheatre.com/events', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /gothic theat/i,
    },
    'Dick\'s Sporting Goods Park': { // Commerce City — the Rapids' ground; Ticketmaster lists a few dates, the league's schedule fills the season (inject)
      capacity: 18061,
      type: 'sports',
      area: 'town',
      cssVar: '--v-dsgp',
      color: '#e985d0',
      url: 'https://www.coloradorapids.com/schedule/',
      icon: 'https://www.google.com/s2/favicons?domain=www.coloradorapids.com&sz=128',
      tm: { id: 'KovZpZAE7aJA', match: 'dick\'s sporting', fallbackUrl: 'https://www.coloradorapids.com/schedule/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /dick'?s sporting goods park|dsg park/i,
    },
    'Folsom Field': { // Boulder — Buffs football, Dead & Company
      capacity: 50183,
      type: 'sports',
      area: 'town',
      cssVar: '--v-folsom',
      color: '#e985be',
      url: 'https://cubuffs.com/sports/football/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=cubuffs.com&sz=128',
      tm: { id: 'KovZpZA1EvaA', match: 'folsom', fallbackUrl: 'https://cubuffs.com/sports/football/schedule', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /folsom field/i,
    },
    'CU Events Center': { // Boulder — Buffs basketball (Ticketmaster still calls it the Coors Event Center)
      capacity: 11064,
      type: 'sports',
      area: 'town',
      cssVar: '--v-cuevents',
      color: '#e985ad',
      url: 'https://cubuffs.com/sports/mens-basketball/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=cubuffs.com&sz=128',
      tm: { id: 'KovZpZA1FEeA', match: 'coors event', fallbackUrl: 'https://cubuffs.com/sports/mens-basketball/schedule', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /coors events? center|cu events center/i,
    },
    'Boulder Theater': { // Z2's downtown Boulder house
      capacity: 1000,
      type: 'concert',
      area: 'town',
      cssVar: '--v-boulder',
      color: '#e9859b',
      url: 'https://www.z2ent.com/venues-we-book/boulder-theater',
      icon: 'https://www.google.com/s2/favicons?domain=www.bouldertheater.com&sz=128',
      tm: { id: 'KovZpZAanJIA', match: 'boulder theater', fallbackUrl: 'https://www.z2ent.com/venues-we-book/boulder-theater', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      alias: /boulder theat/i,
    },
    'Chautauqua Auditorium': { // Boulder's barn-like summer hall; the park's own Events Calendar feed adds the rest of its program (tours, hikes and classes dropped)
      capacity: 1300,
      type: 'concert',
      area: 'town',
      cssVar: '--v-chautauqua',
      color: '#e98589',
      url: 'https://www.chautauqua.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.chautauqua.com&sz=128',
      tm: { id: 'KovZpZA1FJJA', match: 'chautauqua', fallbackUrl: 'https://www.chautauqua.com/events/', exclude: /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass/i },
      feed: { kind: 'tribe', url: 'https://www.chautauqua.com/wp-json/tribe/events/v1/events', drop: /\btour\b|hike|yoga|class|workshop|open house|volunteer|meeting/i },
      alias: /chautauqua/i,
    },
  };

  // City-wide feeds (scripts/feeds.mjs): none — every listing is read by
  // room (Ticketmaster by venue id, Levitt's and Chautauqua's own calendars
  // on their rows).
  var FEEDS = [];

  // The usual view: every room on
  var DEFAULT_ON = ['Ball Arena', 'Empower Field at Mile High', 'Coors Field', 'Mission Ballroom', 'The Fillmore Auditorium', 'Paramount Theatre', 'The Buell Theatre', 'Ellie Caulkins Opera House', 'Boettcher Concert Hall', 'Bellco Theatre', 'Denver Coliseum', 'National Western Complex', 'Ogden Theatre', 'Bluebird Theater', 'Summit Music Hall', 'Marquis Theater', 'Cervantes\' Masterpiece Ballroom', 'Ophelia\'s Electric Soapbox', 'Hi-Dive', 'Grizzly Rose', 'Oriental Theater', 'Meow Wolf Denver', 'Comedy Works', 'Club Vinyl', 'Magness Arena', 'Levitt Pavilion Denver', 'Red Rocks Amphitheatre', 'Fiddler\'s Green Amphitheatre', 'Gothic Theatre', 'Dick\'s Sporting Goods Park', 'Folsom Field', 'CU Events Center', 'Boulder Theater', 'Chautauqua Auditorium'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — Red Rocks, the Mission, the Fillmore, the Colfax rooms, the clubs' },
    { key: 'sports', label: 'Sports', title: 'The Broncos, Nuggets, Avalanche, Rockies, Rapids, Pioneers hockey, the Buffs' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Arts Complex — Broadway tours, the symphony, opera, ballet, comedy' },
    { key: 'community', label: 'Community', title: 'The Stock Show, rodeo, monster trucks, expos at the Coliseum and the complex' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 50 slots from the first build: 10 base-36 digits.
  var CODE_LENGTH = 10;
  var REGISTRY = [
    ['venue', 'Ball Arena'], ['venue', 'Empower Field at Mile High'], ['venue', 'Coors Field'], ['venue', 'Mission Ballroom'], ['venue', 'The Fillmore Auditorium'], ['venue', 'Paramount Theatre'], ['venue', 'The Buell Theatre'], ['venue', 'Ellie Caulkins Opera House'], ['venue', 'Boettcher Concert Hall'], ['venue', 'Bellco Theatre'], ['venue', 'Denver Coliseum'], ['venue', 'National Western Complex'], ['venue', 'Ogden Theatre'], ['venue', 'Bluebird Theater'], ['venue', 'Summit Music Hall'], ['venue', 'Marquis Theater'], ['venue', 'Cervantes\' Masterpiece Ballroom'], ['venue', 'Ophelia\'s Electric Soapbox'], ['venue', 'Hi-Dive'], ['venue', 'Grizzly Rose'], ['venue', 'Oriental Theater'], ['venue', 'Meow Wolf Denver'], ['venue', 'Comedy Works'], ['venue', 'Club Vinyl'], ['venue', 'Magness Arena'], ['venue', 'Levitt Pavilion Denver'], ['venue', 'Red Rocks Amphitheatre'], ['venue', 'Fiddler\'s Green Amphitheatre'], ['venue', 'Gothic Theatre'], ['venue', 'Dick\'s Sporting Goods Park'], ['venue', 'Folsom Field'], ['venue', 'CU Events Center'], ['venue', 'Boulder Theater'], ['venue', 'Chautauqua Auditorium'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'broncos'], ['team', 'nuggets'], ['team', 'avalanche'], ['team', 'rockies'], ['team', 'rapids'], ['team', 'pioneers'], ['team', 'buffs'], ['team', 'buffsbasketball'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Denver', // the board drops it from the clubs' names ("Denver Nuggets" → Nuggets)
    presetDefault: 'Every room — Ball Arena, the stadiums, Red Rocks, the Arts Complex, the Colfax rooms, the clubs, Boulder — every team and type',
    presetNeighborhood: 'Denver proper only — the arena, the stadiums, the Arts Complex, the Mission, the Fillmore, the Colfax rooms and the clubs',
    presetBig: 'Only the places that hold 2,000 or more — the arena, the stadiums, Red Rocks, Fiddler\'s Green, the Mission, the Fillmore, the Buell, the Coliseum',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing Denver proper only.', big: 'Showing the big rooms only — the arena, the stadiums, Red Rocks, the Mission, the Fillmore, the Buell.' },
  };

  // Colorado's public holidays (app.js holidaysFor reads this instead of its
  // Seattle list): the federal set, with Frances Xavier Cabrini Day on the
  // first Monday of October in place of Columbus Day (Colorado, since 2020).
  function nthWeekday(y, month, weekday, n) { var d = new Date(y, month, 1); while (d.getDay() !== weekday) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + (n - 1) * 7); return d; }
  function lastMonday(y, month) { var d = new Date(y, month + 1, 0); while (d.getDay() !== 1) d.setDate(d.getDate() - 1); return d; }
  var HOLIDAYS = function (y) {
    return [
      [new Date(y, 0, 1), "New Year's Day"],
      [nthWeekday(y, 0, 1, 3), 'Martin Luther King Jr. Day'],
      [nthWeekday(y, 1, 1, 3), "Presidents' Day"],
      [lastMonday(y, 4), 'Memorial Day'],
      [new Date(y, 5, 19), 'Juneteenth'],
      [new Date(y, 6, 4), 'Independence Day'],
      [nthWeekday(y, 8, 1, 1), 'Labor Day'],
      [nthWeekday(y, 9, 1, 1), 'Cabrini Day'],
      [new Date(y, 10, 11), 'Veterans Day'],
      [nthWeekday(y, 10, 4, 4), 'Thanksgiving'],
      [new Date(y, 11, 25), 'Christmas Day'],
    ];
  };

  global.LQACity = {
    key: 'denver',
    name: 'Denver',
    site: 'https://denver.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; denver-events/1.0; +https://denver.here.events/)',
    tz: 'America/Denver', tzName: 'Mountain', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: 'Colorado', stateOutline: null, // no state drawing (the masthead's state strip went away 2026-10-13)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Denver Events', short: 'Denver Events', teams: 'Denver home teams — every season', prodid: '-//here.events//denver-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events in Denver\, CO — Ball Arena\, the stadiums\, Red Rocks\, the Arts Complex\, the Mission\, the Fillmore\, the Colfax rooms\, the clubs and Boulder' },
    teams: TEAMS,
    venues: VENUES,
    feeds: FEEDS,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
    holidays: HOLIDAYS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
