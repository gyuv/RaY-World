import { provider } from "./providers";
import { MediaItem, Paginated, SortKey } from "./providers/types";
import { rankMedia } from "./ranking";
import { unique } from "./utils";

export interface BrowseParams {
  type: "all" | "movie" | "tv";
  language?: string;
  genre?: string;
  year?: number;
  minRating?: number;
  sort: SortKey;
  page: number;
}

const VALID_SORTS: SortKey[] = [
  "popular",
  "top_rated",
  "latest",
  "oldest",
  "alphabetical",
];

type RawParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Parse loose URL search params into a validated BrowseParams. */
export function parseBrowseParams(sp: RawParams): BrowseParams {
  const rawType = str(sp.type);
  const type =
    rawType === "movie" || rawType === "tv" ? rawType : "all";
  const rawSort = str(sp.sort) as SortKey | undefined;
  const sort = rawSort && VALID_SORTS.includes(rawSort) ? rawSort : "popular";
  const year = Number(str(sp.year));
  const minRating = Number(str(sp.minRating));
  const page = Math.max(1, Number(str(sp.page)) || 1);

  return {
    type,
    language: str(sp.language) || undefined,
    genre: str(sp.genre) || undefined,
    year: Number.isFinite(year) && year > 1900 ? year : undefined,
    minRating: Number.isFinite(minRating) && minRating > 0 ? minRating : undefined,
    sort,
    page,
  };
}

const EMPTY: Paginated<MediaItem> = {
  results: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
};

async function safeDiscover(
  type: "movie" | "tv",
  p: BrowseParams,
): Promise<Paginated<MediaItem>> {
  try {
    return await provider.discover({
      type,
      language: p.language,
      genreSlug: p.genre,
      year: p.year,
      minRating: p.minRating,
      sort: p.sort,
      page: p.page,
    });
  } catch {
    return EMPTY;
  }
}

/**
 * Run a catalog browse query. For `type=all` we query both movie and TV feeds
 * server-side and merge with ranking — never a client-side filter of a small
 * preloaded set (spec §11, §21).
 */
export async function runBrowse(
  p: BrowseParams,
): Promise<Paginated<MediaItem>> {
  if (!provider.available) return { ...EMPTY };

  if (p.type === "movie" || p.type === "tv") {
    return safeDiscover(p.type, p);
  }

  const [movies, tv] = await Promise.all([
    safeDiscover("movie", p),
    safeDiscover("tv", p),
  ]);

  const merged = unique(
    [...movies.results, ...tv.results],
    (m) => `${m.type}:${m.id}`,
  );
  // For "All", present a sensibly ranked interleave (Tamil-leaning default).
  const results =
    p.sort === "popular"
      ? rankMedia(merged, { preferLanguage: p.language })
      : merged;

  return {
    results,
    page: p.page,
    totalPages: Math.max(movies.totalPages, tv.totalPages),
    totalResults: movies.totalResults + tv.totalResults,
  };
}

/** Serialize BrowseParams back into a query string (for pagination links). */
export function browseHref(
  base: string,
  p: BrowseParams,
  overrides: Partial<BrowseParams> = {},
): string {
  const merged = { ...p, ...overrides };
  const q = new URLSearchParams();
  if (merged.type !== "all") q.set("type", merged.type);
  if (merged.language) q.set("language", merged.language);
  if (merged.genre) q.set("genre", merged.genre);
  if (merged.year) q.set("year", String(merged.year));
  if (merged.minRating) q.set("minRating", String(merged.minRating));
  if (merged.sort !== "popular") q.set("sort", merged.sort);
  if (merged.page > 1) q.set("page", String(merged.page));
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}
