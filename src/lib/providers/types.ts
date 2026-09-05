/**
 * Normalized internal catalog model.
 *
 * The rest of RaY-World depends ONLY on these types — never on raw TMDB
 * response shapes. This is the seam that lets additional providers be added
 * later without rewriting the UI.
 */
export interface StreamSource {
  url: string;
  kind: "hls" | "file" | "embed";
}
export type MediaType = "movie" | "tv" | "person";

/** A single movie or TV entry, normalized. */
export interface MediaItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  originalTitle?: string;
  overview?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  /** ISO 639-1 original language code. */
  language?: string;
  genreIds: number[];
  /** 0–10, TMDB scale. Undefined when unknown (never fabricated). */
  rating?: number;
  voteCount?: number;
  popularity?: number;
  /** ISO date string, e.g. "2022-06-03". */
  releaseDate?: string;
  /** Convenience: 4-digit year derived from releaseDate. */
  year?: number;
}

export interface PersonItem {
  id: number;
  type: "person";
  name: string;
  profilePath?: string | null;
  knownForDepartment?: string;
  popularity?: number;
  /** A few representative titles, already normalized. */
  knownFor: MediaItem[];
}

export type SearchEntry = MediaItem | PersonItem;

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profilePath?: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  profilePath?: string | null;
}

export interface Video {
  key: string;
  site: string;
  type: string;
  name: string;
  official?: boolean;
}

export interface Episode {
  id: number;
  episodeNumber: number;
  seasonNumber: number;
  name: string;
  overview?: string;
  stillPath?: string | null;
  airDate?: string;
  runtime?: number;
  rating?: number;
}

export interface Season {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate?: string;
  posterPath?: string | null;
  overview?: string;
}

/**
 * A playable stream for a title/episode, resolved from a source you are
 * licensed to serve. `kind` tells the player how to render it:
 *  - "file"  : a direct MP4/WebM URL   -> <video src>
 *  - "hls"   : an HLS manifest (.m3u8) -> <video> (native on Safari; hls.js elsewhere)
 *  - "embed" : a licensed provider player URL -> <iframe>
 */
export interface StreamSource {
  url: string;
  kind: "file" | "hls" | "embed";
}

/** Full detail record for a movie. */
export interface MovieDetail extends MediaItem {
  type: "movie";
  runtime?: number;
  tagline?: string;
  genres: { id: number; name: string }[];
  cast: CastMember[];
  crew: CrewMember[];
  videos: Video[];
  recommendations: MediaItem[];
  similar: MediaItem[];
  status?: string;
}

/** Full detail record for a TV series. */
export interface SeriesDetail extends MediaItem {
  type: "tv";
  tagline?: string;
  genres: { id: number; name: string }[];
  cast: CastMember[];
  crew: CrewMember[];
  videos: Video[];
  recommendations: MediaItem[];
  similar: MediaItem[];
  seasons: Season[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  episodeRunTime?: number[];
  status?: string;
  creators: CrewMember[];
}

export interface Paginated<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface SearchOptions {
  page?: number;
  /** Restrict to a single media type; otherwise multi-search. */
  type?: MediaType;
  /** Preferred language for ranking (not a hard filter). */
  preferLanguage?: string;
}

export interface DiscoverOptions {
  type: "movie" | "tv";
  language?: string; // original language (e.g. "ta")
  genreId?: number;
  genreSlug?: string;
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  sort?: SortKey;
  page?: number;
}

export type SortKey =
  | "popular"
  | "top_rated"
  | "latest"
  | "oldest"
  | "alphabetical";

export interface TrendingOptions {
  type?: "movie" | "tv" | "all";
  window?: "day" | "week";
  page?: number;
}

export interface FeedOptions {
  type: "movie" | "tv";
  language?: string;
  page?: number;
}

/**
 * Provider abstraction. TMDB is the first implementation; additional legitimate
 * providers can implement the same contract.
 */
export interface MediaProvider {
  readonly id: string;
  readonly available: boolean;

  search(query: string, options?: SearchOptions): Promise<Paginated<SearchEntry>>;
  getMovie(id: number): Promise<MovieDetail | null>;
  getSeries(id: number): Promise<SeriesDetail | null>;
  getSeason(id: number, seasonNumber: number): Promise<Episode[]>;
  discover(options: DiscoverOptions): Promise<Paginated<MediaItem>>;
  getTrending(options?: TrendingOptions): Promise<Paginated<MediaItem>>;
  getPopular(options: FeedOptions): Promise<Paginated<MediaItem>>;
  getTopRated(options: FeedOptions): Promise<Paginated<MediaItem>>;
  getLatest(options: FeedOptions): Promise<Paginated<MediaItem>>;
}

/** Thrown when the upstream provider is not configured or unreachable. */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly kind: "unconfigured" | "upstream" | "notfound" = "upstream",
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
