# RaY-World

**A Tamil-first, universal entertainment discovery platform.**

RaY-World reproduces the content-dense discovery UX people expect from
mainstream streaming-discovery sites (prominent nav, poster-driven rails,
search-first discovery, media detail + watch pages, genre/language browsing,
filtering, related-content discovery) — rebuilt from scratch as an original,
premium RaY-World product with a **Tamil-first content strategy** and a
**universal search engine that queries the whole catalog, not just the
homepage.**

---

## Highlights

- **Tamil-first everywhere** — a central [language config](src/lib/config/languages.ts)
  encodes a content-priority ladder (Tamil → English → Hindi → Telugu →
  Malayalam → Kannada → other Indian → international). The homepage, ranking and
  filters all favour Tamil by default, without making any language a
  second-class citizen.
- **Universal search** — a layered [search pipeline](src/lib/search.ts) that
  normalizes the query, searches movies + TV + people, widens to typed
  endpoints, surfaces person filmographies, and applies typo tolerance. It is
  designed so a user **never** hits a false "No results" caused by a limited
  frontend.
- **Real catalog filtering** — [`/browse`](src/app/browse/page.tsx) is a
  shareable, URL-driven control center. Filters (type, language, genre, year,
  rating, sort) query the provider **server-side** — never a client-side filter
  of a preloaded slice.
- **Config-driven homepage** — rails are declared as
  [data](src/lib/config/home-sections.ts), so new collections are added without
  touching components. Empty rails are dropped automatically.
- **Provider abstraction** — the UI depends only on a normalized
  [internal model](src/lib/providers/types.ts). TMDB is the first
  [provider](src/lib/providers/tmdb.ts); others can be added without rewriting
  the frontend.
- **Graceful everything** — branded fallbacks for missing posters/metadata
  (never fabricated), premium empty states with discovery links, and a clean
  degradation path when the provider is unconfigured or down.
- **Watchlist + Continue Watching** — local-device persistence with an
  account-sync-ready schema.
- **Responsive & accessible** — desktop sidebar filters, mobile bottom-sheet
  filters, a mobile tab bar, keyboard-focusable controls and a skip link.

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router, RSC, server-side data fetching)
- TypeScript
- Tailwind CSS (custom RaY-World design system)
- TMDB as the primary metadata provider

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your TMDB credentials
npm run dev
```

Open http://localhost:3000.

### Environment

RaY-World needs a TMDB credential. Provide **either**:

- `TMDB_ACCESS_TOKEN` — a TMDB **v4** read access token (recommended), or
- `TMDB_API_KEY` — a TMDB **v3** API key.

Get credentials at https://www.themoviedb.org/settings/api. Credentials stay
server-side and are never sent to the browser. Without a credential the app
renders a friendly "connect a provider" state instead of crashing.

## Scripts

| Script              | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start the dev server           |
| `npm run build`     | Production build               |
| `npm start`         | Run the production build       |
| `npm run lint`      | Lint                           |
| `npm run typecheck` | Type-check without emitting    |

## Project structure

```
src/
  app/                     # routes (home, browse, search, movie/tv, watch, categories)
    api/search/            # universal search API (backs the live dropdown)
  components/              # UI: rails, cards, hero, filters, player, nav…
  lib/
    config/                # languages, genres, homepage sections
    providers/             # provider abstraction + TMDB implementation
    search.ts              # layered universal search pipeline
    browse.ts              # catalog browse/filter query layer
    ranking.ts             # configurable Tamil-first ranking
    catalog.ts             # homepage section resolution + fallbacks
    storage.ts             # watchlist + continue watching (localStorage)
```

## Routes

- `/` — Tamil-first homepage with config-driven rails + hero
- `/browse` — full-catalog filter control center (shareable URLs)
- `/search?q=` — universal search results
- `/movies`, `/series`, `/trending`, `/tamil`, `/english`, `/genres`
- `/genre/[slug]`, `/tamil/[genre]` — generated category routes
- `/movie/[id]`, `/tv/[id]` — media detail pages
- `/watch/[type]/[id]` — watch experience (season/episode navigation for TV)
- `/watchlist` — saved titles

## Streaming & content policy

RaY-World ships **without** bundled streams. The watch page is a cinematic
player shell that plays authorized YouTube previews where available and clearly
indicates where a **licensed** streaming source would attach. It never scrapes
or proxies unauthorized streaming sources. Metadata is provided by TMDB; this
product uses the TMDB API but is not endorsed or certified by TMDB.
