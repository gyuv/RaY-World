import {
  CastMember,
  CrewMember,
  DiscoverOptions,
  Episode,
  FeedOptions,
  MediaItem,
  MediaProvider,
  MovieDetail,
  Paginated,
  PersonItem,
  ProviderError,
  SearchEntry,
  SearchOptions,
  Season,
  SeriesDetail,
  SortKey,
  TrendingOptions,
  Video,
  WatchProviderInfo,
} from "./types";
import { getGenreId } from "../config/genres";

const API_BASE = process.env.TMDB_API_BASE || "https://api.themoviedb.org/3";
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN?.trim();
const API_KEY = process.env.TMDB_API_KEY?.trim();

/** Cache tiers (seconds). See spec §19 — search short, feeds long, genres longest. */
export const CACHE = {
  search: 60 * 5, // 5 minutes
  detail: 60 * 60 * 12, // 12 hours
  feed: 60 * 60, // 1 hour
  trending: 60 * 30, // 30 minutes
  static: 60 * 60 * 24 * 7, // 7 days
} as const;

function isConfigured(): boolean {
  return Boolean(ACCESS_TOKEN || API_KEY);
}

interface FetchOptions {
  params?: Record<string, string | number | boolean | undefined>;
  revalidate?: number;
}

async function tmdbFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  if (!isConfigured()) {
    throw new ProviderError(
      "TMDB is not configured. Set TMDB_ACCESS_TOKEN or TMDB_API_KEY.",
      "unconfigured",
    );
  }

  const url = new URL(`${API_BASE}${path}`);
  // Always request English metadata as the base; original-language fields are
  // preserved separately for localized titles.
  if (!opts.params?.language) url.searchParams.set("language", "en-US");
  url.searchParams.set("include_adult", "false");

  for (const [key, value] of Object.entries(opts.params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  } else if (API_KEY) {
    url.searchParams.set("api_key", API_KEY);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers,
      next: { revalidate: opts.revalidate ?? CACHE.feed },
    });
  } catch (err) {
    throw new ProviderError(
      `Failed to reach TMDB: ${(err as Error).message}`,
      "upstream",
    );
  }

  if (res.status === 404) {
    throw new ProviderError("Not found", "notfound", 404);
  }
  if (!res.ok) {
    throw new ProviderError(
      `TMDB responded with ${res.status}`,
      "upstream",
      res.status,
    );
  }

  return (await res.json()) as T;
}

/* ----------------------------- Normalizers ------------------------------ */

function yearFrom(date?: string): number | undefined {
  if (!date) return undefined;
  const y = Number(date.slice(0, 4));
  return Number.isFinite(y) && y > 1870 ? y : undefined;
}

/** Rating is only kept when it is a real, non-zero vote. Never fabricated. */
function normalizeRating(vote?: number, count?: number): number | undefined {
  if (!vote || !count) return undefined;
  return Math.round(vote * 10) / 10;
}

interface RawMovie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  original_language?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

function normalizeMedia(raw: RawMovie, fallbackType?: "movie" | "tv"): MediaItem {
  const type =
    (raw.media_type === "movie" || raw.media_type === "tv"
      ? raw.media_type
      : fallbackType) ?? (raw.title ? "movie" : "tv");
  const title = raw.title || raw.name || "Untitled";
  const originalTitle = raw.original_title || raw.original_name;
  const releaseDate = raw.release_date || raw.first_air_date || undefined;
  const genreIds =
    raw.genre_ids ?? raw.genres?.map((g) => g.id) ?? [];

  return {
    id: raw.id,
    type,
    title,
    originalTitle: originalTitle && originalTitle !== title ? originalTitle : undefined,
    overview: raw.overview || undefined,
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    language: raw.original_language,
    genreIds,
    rating: normalizeRating(raw.vote_average, raw.vote_count),
    voteCount: raw.vote_count,
    popularity: raw.popularity,
    releaseDate,
    year: yearFrom(releaseDate),
  };
}

interface RawPerson {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string;
  popularity?: number;
  known_for?: RawMovie[];
}

function normalizePerson(raw: RawPerson): PersonItem {
  return {
    id: raw.id,
    type: "person",
    name: raw.name,
    profilePath: raw.profile_path ?? null,
    knownForDepartment: raw.known_for_department,
    popularity: raw.popularity,
    knownFor: (raw.known_for ?? [])
      .filter((k) => k.media_type === "movie" || k.media_type === "tv")
      .map((k) => normalizeMedia(k)),
  };
}

interface RawPaginated<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

function normalizePage<TIn, TOut>(
  raw: RawPaginated<TIn>,
  map: (item: TIn) => TOut,
): Paginated<TOut> {
  return {
    page: raw.page ?? 1,
    totalPages: Math.min(raw.total_pages ?? 1, 500), // TMDB hard limit
    totalResults: raw.total_results ?? raw.results?.length ?? 0,
    results: (raw.results ?? []).map(map),
  };
}

function sortToTmdb(sort: SortKey | undefined, type: "movie" | "tv"): string {
  const dateField = type === "movie" ? "primary_release_date" : "first_air_date";
  switch (sort) {
    case "top_rated":
      return "vote_average.desc";
    case "latest":
      return `${dateField}.desc`;
    case "oldest":
      return `${dateField}.asc`;
    case "alphabetical":
      return type === "movie" ? "title.asc" : "name.asc";
    case "popular":
    default:
      return "popularity.desc";
  }
}

/* ------------------------------ Provider -------------------------------- */

class TmdbProvider implements MediaProvider {
  readonly id = "tmdb";

  get available(): boolean {
    return isConfigured();
  }

  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<Paginated<SearchEntry>> {
    const q = query.trim();
    if (!q) {
      return { results: [], page: 1, totalPages: 0, totalResults: 0 };
    }
    const page = options.page ?? 1;

    if (options.type && options.type !== "person") {
      const raw = await tmdbFetch<RawPaginated<RawMovie>>(
        `/search/${options.type}`,
        { params: { query: q, page }, revalidate: CACHE.search },
      );
      return normalizePage<RawMovie, SearchEntry>(raw, (m) =>
        normalizeMedia(m, options.type as "movie" | "tv"),
      );
    }

    if (options.type === "person") {
      const raw = await tmdbFetch<RawPaginated<RawPerson>>("/search/person", {
        params: { query: q, page },
        revalidate: CACHE.search,
      });
      return normalizePage<RawPerson, SearchEntry>(raw, normalizePerson);
    }

    // Multi-search across movies, tv and people.
    const raw = await tmdbFetch<RawPaginated<RawMovie & RawPerson>>(
      "/search/multi",
      { params: { query: q, page }, revalidate: CACHE.search },
    );
    return normalizePage<RawMovie & RawPerson, SearchEntry>(raw, (item) => {
      if (item.media_type === "person") return normalizePerson(item);
      return normalizeMedia(item);
    });
  }

  async getMovie(id: number): Promise<MovieDetail | null> {
    try {
      const raw = await tmdbFetch<any>(`/movie/${id}`, {
        params: { append_to_response: "credits,videos,recommendations,similar" },
        revalidate: CACHE.detail,
      });
      const base = normalizeMedia({ ...raw, media_type: "movie" }, "movie");
      return {
        ...base,
        type: "movie",
        runtime: raw.runtime || undefined,
        tagline: raw.tagline || undefined,
        status: raw.status,
        genres: raw.genres ?? [],
        cast: mapCast(raw.credits?.cast),
        crew: mapCrew(raw.credits?.crew),
        videos: mapVideos(raw.videos?.results),
        recommendations: (raw.recommendations?.results ?? []).map((m: RawMovie) =>
          normalizeMedia(m, "movie"),
        ),
        similar: (raw.similar?.results ?? []).map((m: RawMovie) =>
          normalizeMedia(m, "movie"),
        ),
      };
    } catch (err) {
      if (err instanceof ProviderError && err.kind === "notfound") return null;
      throw err;
    }
  }

  async getSeries(id: number): Promise<SeriesDetail | null> {
    try {
      const raw = await tmdbFetch<any>(`/tv/${id}`, {
        params: {
          append_to_response: "credits,videos,recommendations,similar,aggregate_credits",
        },
        revalidate: CACHE.detail,
      });
      const base = normalizeMedia({ ...raw, media_type: "tv" }, "tv");
      const credits = raw.aggregate_credits ?? raw.credits;
      return {
        ...base,
        type: "tv",
        tagline: raw.tagline || undefined,
        status: raw.status,
        genres: raw.genres ?? [],
        cast: mapCast(credits?.cast),
        crew: mapCrew(raw.credits?.crew),
        creators: (raw.created_by ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          job: "Creator",
          profilePath: c.profile_path ?? null,
        })),
        videos: mapVideos(raw.videos?.results),
        recommendations: (raw.recommendations?.results ?? []).map((m: RawMovie) =>
          normalizeMedia(m, "tv"),
        ),
        similar: (raw.similar?.results ?? []).map((m: RawMovie) =>
          normalizeMedia(m, "tv"),
        ),
        seasons: mapSeasons(raw.seasons),
        numberOfSeasons: raw.number_of_seasons,
        numberOfEpisodes: raw.number_of_episodes,
        episodeRunTime: raw.episode_run_time,
      };
    } catch (err) {
      if (err instanceof ProviderError && err.kind === "notfound") return null;
      throw err;
    }
  }

  async getSeason(id: number, seasonNumber: number): Promise<Episode[]> {
    try {
      const raw = await tmdbFetch<any>(`/tv/${id}/season/${seasonNumber}`, {
        revalidate: CACHE.detail,
      });
      return (raw.episodes ?? []).map(
        (e: any): Episode => ({
          id: e.id,
          episodeNumber: e.episode_number,
          seasonNumber: e.season_number,
          name: e.name || `Episode ${e.episode_number}`,
          overview: e.overview || undefined,
          stillPath: e.still_path ?? null,
          airDate: e.air_date || undefined,
          runtime: e.runtime || undefined,
          rating: normalizeRating(e.vote_average, e.vote_count),
        }),
      );
    } catch (err) {
      if (err instanceof ProviderError && err.kind === "notfound") return [];
      throw err;
    }
  }

  async discover(options: DiscoverOptions): Promise<Paginated<MediaItem>> {
    const { type } = options;
    const genreId =
      options.genreId ??
      (options.genreSlug ? getGenreId(options.genreSlug, type) : undefined);

    // Vote-count floor is sort-aware: recent releases have few/zero votes, so
    // "latest"/"oldest" must NOT require votes or new releases vanish. Top-rated
    // needs a real sample to be meaningful; everything else uses a light floor.
    const voteFloor =
      options.sort === "top_rated"
        ? 100
        : options.sort === "latest" || options.sort === "oldest"
          ? 0
          : 10;

    const params: Record<string, string | number | undefined> = {
      with_original_language: options.language,
      with_genres: genreId,
      sort_by: sortToTmdb(options.sort, type),
      page: options.page ?? 1,
      "vote_count.gte": voteFloor,
    };

    if (options.minRating) params["vote_average.gte"] = options.minRating;

    // Watch-provider availability (TMDB "where to watch"). watch_region is
    // required whenever with_watch_providers is set.
    if (options.watchProvider) {
      params["with_watch_providers"] = options.watchProvider;
      params["watch_region"] = options.watchRegion ?? "IN";
    }

    const dateField =
      type === "movie" ? "primary_release_date" : "first_air_date";
    if (options.year) {
      if (type === "movie") params["primary_release_year"] = options.year;
      else params["first_air_date_year"] = options.year;
    }
    if (options.yearFrom) params[`${dateField}.gte`] = `${options.yearFrom}-01-01`;
    if (options.yearTo) params[`${dateField}.lte`] = `${options.yearTo}-12-31`;

    // For "latest", cap at today so we surface actual recent releases, not
    // announced-but-unreleased future titles.
    if (options.sort === "latest") {
      const today = new Date().toISOString().slice(0, 10);
      params[`${dateField}.lte`] = today;
    }

    const raw = await tmdbFetch<RawPaginated<RawMovie>>(`/discover/${type}`, {
      params,
      revalidate: CACHE.feed,
    });
    return normalizePage(raw, (m) => normalizeMedia(m, type));
  }

  async getTrending(options: TrendingOptions = {}): Promise<Paginated<MediaItem>> {
    const type = options.type ?? "all";
    const window = options.window ?? "week";
    const raw = await tmdbFetch<RawPaginated<RawMovie>>(
      `/trending/${type}/${window}`,
      { params: { page: options.page ?? 1 }, revalidate: CACHE.trending },
    );
    return normalizePage(
      raw,
      (m) => normalizeMedia(m, type === "tv" ? "tv" : "movie"),
    );
  }

  getPopular(options: FeedOptions): Promise<Paginated<MediaItem>> {
    return this.discover({ ...options, sort: "popular" });
  }

  getTopRated(options: FeedOptions): Promise<Paginated<MediaItem>> {
    return this.discover({ ...options, sort: "top_rated" });
  }

  getLatest(options: FeedOptions): Promise<Paginated<MediaItem>> {
    // "Latest" = most recent releases up to today, sorted newest first.
    // The date cap and zero vote-floor are applied inside discover().
    return this.discover({ ...options, sort: "latest" });
  }

  async getWatchProviders(region = "IN"): Promise<WatchProviderInfo[]> {
    const byId = new Map<number, WatchProviderInfo>();
    try {
      const [movies, tv] = await Promise.all([
        tmdbFetch<{ results?: any[] }>("/watch/providers/movie", {
          params: { watch_region: region },
          revalidate: CACHE.static,
        }),
        tmdbFetch<{ results?: any[] }>("/watch/providers/tv", {
          params: { watch_region: region },
          revalidate: CACHE.static,
        }),
      ]);
      for (const r of [...(movies.results ?? []), ...(tv.results ?? [])]) {
        if (r.provider_id && r.logo_path && !byId.has(r.provider_id)) {
          byId.set(r.provider_id, {
            id: r.provider_id,
            name: r.provider_name ?? "",
            logoPath: r.logo_path,
          });
        }
      }
    } catch {
      /* return whatever we have; caller falls back to monograms */
    }
    return [...byId.values()];
  }
}

function mapCast(cast?: any[]): CastMember[] {
  return (cast ?? []).slice(0, 30).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character || c.roles?.[0]?.character || undefined,
    profilePath: c.profile_path ?? null,
    order: c.order,
  }));
}

function mapCrew(crew?: any[]): CrewMember[] {
  return (crew ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    job: c.job,
    department: c.department,
    profilePath: c.profile_path ?? null,
  }));
}

function mapVideos(videos?: any[]): Video[] {
  return (videos ?? [])
    .filter((v) => v.site === "YouTube")
    .map((v) => ({
      key: v.key,
      site: v.site,
      type: v.type,
      name: v.name,
      official: v.official,
    }));
}

function mapSeasons(seasons?: any[]): Season[] {
  return (seasons ?? []).map((s) => ({
    id: s.id,
    seasonNumber: s.season_number,
    name: s.name,
    episodeCount: s.episode_count,
    airDate: s.air_date || undefined,
    posterPath: s.poster_path ?? null,
    overview: s.overview || undefined,
  }));
}

export const tmdbProvider = new TmdbProvider();
