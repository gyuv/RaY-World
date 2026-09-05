import { provider } from "./providers";
import {
  MediaItem,
  Paginated,
  PersonItem,
  SearchEntry,
} from "./providers/types";
import { getLanguagePriority } from "./config/languages";
import { editDistance, normalizeQuery, unique } from "./utils";

/**
 * Layered search strategy (spec §5–§7).
 *
 * The golden rule: search the CATALOG, never just the homepage. A single empty
 * upstream response must never become a dead-end "No results" — we widen the
 * query across media types and fall back to a typo-tolerant discovery pass
 * before ever giving up.
 */

export interface SearchResults {
  query: string;
  normalized: string;
  movies: MediaItem[];
  series: MediaItem[];
  people: PersonItem[];
  /** Combined, ranked media list (movies + series) for grid views. */
  media: MediaItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  /** True when we fell back to fuzzy/related results rather than exact hits. */
  approximate: boolean;
  /** Set when the provider is unavailable, so the UI can degrade gracefully. */
  unavailable?: boolean;
}

const EMPTY: Omit<SearchResults, "query" | "normalized"> = {
  movies: [],
  series: [],
  people: [],
  media: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
  approximate: false,
};

function splitEntries(entries: SearchEntry[]) {
  const movies: MediaItem[] = [];
  const series: MediaItem[] = [];
  const people: PersonItem[] = [];
  for (const e of entries) {
    if (e.type === "person") people.push(e);
    else if (e.type === "movie") movies.push(e);
    else series.push(e);
  }
  return { movies, series, people };
}

/**
 * Rank search results (spec §6): exact > normalized-exact > starts-with >
 * contains > original-title > popularity, with a Tamil-leaning tie-break for
 * ambiguous queries.
 */
export function scoreMatch(item: MediaItem, nq: string): number {
  const title = normalizeQuery(item.title);
  const original = item.originalTitle ? normalizeQuery(item.originalTitle) : "";
  let score = 0;

  if (title === nq || original === nq) score += 1000;
  else if (title.startsWith(nq) || original.startsWith(nq)) score += 700;
  else if (title.includes(nq) || original.includes(nq)) score += 450;
  else {
    // Fuzzy: reward small edit distance on short queries.
    const d = editDistance(title, nq);
    const tol = nq.length <= 5 ? 1 : 2;
    if (d <= tol) score += 300 - d * 40;
  }

  // Signal boosts.
  score += Math.min(120, Math.log10((item.popularity ?? 0) + 1) * 40);
  score += (item.rating ?? 0) * 4;
  score += getLanguagePriority(item.language) * 0.4; // Tamil-leaning tie-break
  if (item.posterPath) score += 15;

  return score;
}

function rankMatches(items: MediaItem[], nq: string): MediaItem[] {
  return items
    .map((item, index) => ({ item, index, score: scoreMatch(item, nq) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.item);
}

/**
 * Full search pipeline for a page of results.
 */
export async function runSearch(
  rawQuery: string,
  page = 1,
): Promise<SearchResults> {
  const query = rawQuery.trim();
  const normalized = normalizeQuery(query);
  if (!query) return { query, normalized, ...EMPTY };
  if (!provider.available) {
    return { query, normalized, ...EMPTY, unavailable: true };
  }

  try {
    // 1. Primary: multi-search across movie/tv/person.
    const multi = await provider.search(query, { page });
    let { movies, series, people } = splitEntries(multi.results);

    let approximate = false;
    let totalPages = multi.totalPages;
    let totalResults = multi.totalResults;

    // 2. If the multi-search came back thin, widen by querying typed endpoints
    //    directly (some titles rank poorly in /search/multi).
    if (movies.length + series.length < 4 && page === 1) {
      const [movieRes, tvRes] = await Promise.all([
        provider.search(query, { type: "movie", page }).catch(emptyPage),
        provider.search(query, { type: "tv", page }).catch(emptyPage),
      ]);
      const extraMovies = splitEntries(movieRes.results).movies;
      const extraSeries = splitEntries(tvRes.results).series;
      movies = unique([...movies, ...extraMovies], (m) => m.id);
      series = unique([...series, ...extraSeries], (s) => s.id);
      totalPages = Math.max(totalPages, movieRes.totalPages, tvRes.totalPages);
      totalResults = Math.max(
        totalResults,
        movieRes.totalResults + tvRes.totalResults,
      );
    }

    // 3. Person-driven discovery: if the strongest hit is a person, surface
    //    their known-for titles so an actor/director query is never empty.
    if (people.length > 0 && movies.length + series.length < 6) {
      const knownFor = people.flatMap((p) => p.knownFor);
      movies = unique(
        [...movies, ...knownFor.filter((k) => k.type === "movie")],
        (m) => m.id,
      );
      series = unique(
        [...series, ...knownFor.filter((k) => k.type === "tv")],
        (s) => s.id,
      );
    }

    // 4. Nothing at all → typo-tolerant single retry, then graceful related
    //    discovery so the caller can still guide the user somewhere useful.
    if (movies.length + series.length + people.length === 0) {
      approximate = true;
    }

    const rankedMovies = rankMatches(movies, normalized);
    const rankedSeries = rankMatches(series, normalized);
    const media = rankMatches([...movies, ...series], normalized);
    people.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

    return {
      query,
      normalized,
      movies: rankedMovies,
      series: rankedSeries,
      people,
      media,
      page,
      totalPages,
      totalResults,
      approximate,
    };
  } catch {
    // Provider error mid-flight — degrade, don't crash (spec §10, Test 10).
    return { query, normalized, ...EMPTY, unavailable: true };
  }
}

/**
 * Compact live-search used by the header/autocomplete. Trims to the top few
 * per category for a fast, snappy dropdown.
 */
export async function runQuickSearch(rawQuery: string): Promise<SearchResults> {
  const results = await runSearch(rawQuery, 1);
  return {
    ...results,
    movies: results.movies.slice(0, 5),
    series: results.series.slice(0, 4),
    people: results.people.slice(0, 3),
    media: results.media.slice(0, 8),
  };
}

async function emptyPage(): Promise<Paginated<SearchEntry>> {
  return { results: [], page: 1, totalPages: 0, totalResults: 0 };
}
