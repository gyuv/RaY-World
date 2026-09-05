/**
 * Genre configuration.
 *
 * TMDB uses distinct (but overlapping) genre-ID spaces for movies and TV. We
 * keep a stable, slug-addressable catalog so genre routes (`/genre/action`) and
 * browse filters map cleanly to the correct TMDB IDs per media type.
 */

export interface Genre {
  slug: string;
  name: string;
  /** TMDB movie genre id, if applicable. */
  movieId?: number;
  /** TMDB tv genre id, if applicable. */
  tvId?: number;
}

export const GENRES: Genre[] = [
  { slug: "action", name: "Action", movieId: 28, tvId: 10759 },
  { slug: "adventure", name: "Adventure", movieId: 12, tvId: 10759 },
  { slug: "animation", name: "Animation", movieId: 16, tvId: 16 },
  { slug: "comedy", name: "Comedy", movieId: 35, tvId: 35 },
  { slug: "crime", name: "Crime", movieId: 80, tvId: 80 },
  { slug: "documentary", name: "Documentary", movieId: 99, tvId: 99 },
  { slug: "drama", name: "Drama", movieId: 18, tvId: 18 },
  { slug: "family", name: "Family", movieId: 10751, tvId: 10751 },
  { slug: "fantasy", name: "Fantasy", movieId: 14, tvId: 10765 },
  { slug: "history", name: "History", movieId: 36 },
  { slug: "horror", name: "Horror", movieId: 27 },
  { slug: "music", name: "Music", movieId: 10402 },
  { slug: "mystery", name: "Mystery", movieId: 9648, tvId: 9648 },
  { slug: "romance", name: "Romance", movieId: 10749 },
  { slug: "science-fiction", name: "Science Fiction", movieId: 878, tvId: 10765 },
  { slug: "thriller", name: "Thriller", movieId: 53 },
  { slug: "war", name: "War", movieId: 10752, tvId: 10768 },
  { slug: "western", name: "Western", movieId: 37, tvId: 37 },
];

const GENRE_BY_SLUG: Record<string, Genre> = Object.fromEntries(
  GENRES.map((g) => [g.slug, g]),
);

/** Map of TMDB id -> genre name, merged across movie + tv spaces. */
const GENRE_NAME_BY_ID: Record<number, string> = (() => {
  const map: Record<number, string> = {};
  for (const g of GENRES) {
    if (g.movieId) map[g.movieId] = g.name;
    if (g.tvId) map[g.tvId] = g.name;
  }
  // A few TMDB ids that aren't in our curated slug list but appear in payloads.
  map[10770] = "TV Movie";
  map[10766] = "Soap";
  map[10767] = "Talk";
  map[10763] = "News";
  map[10764] = "Reality";
  map[10768] = "War & Politics";
  map[10765] = "Sci-Fi & Fantasy";
  map[10762] = "Kids";
  return map;
})();

export function getGenre(slug?: string | null): Genre | undefined {
  if (!slug) return undefined;
  return GENRE_BY_SLUG[slug.toLowerCase()];
}

export function getGenreName(id?: number | null): string | undefined {
  if (id == null) return undefined;
  return GENRE_NAME_BY_ID[id];
}

/**
 * Resolve a genre slug to the correct TMDB id for a given media type.
 * Falls back to whichever id exists so a filter is never silently dropped.
 */
export function getGenreId(
  slug: string,
  type: "movie" | "tv",
): number | undefined {
  const g = getGenre(slug);
  if (!g) return undefined;
  if (type === "movie") return g.movieId ?? g.tvId;
  return g.tvId ?? g.movieId;
}
