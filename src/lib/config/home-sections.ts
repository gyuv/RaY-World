import { SortKey } from "../providers/types";

/**
 * Data-driven homepage layout (spec §15). Rails are declared as config, not
 * hardcoded components — new collections are added by appending here.
 *
 * The ordering encodes the Tamil-first content strategy (spec §2):
 * Tamil dominates the top of the page, English is prominent, other languages
 * follow, then a global International rail.
 */

export type FeedKind = "trending" | "popular" | "top_rated" | "latest" | "discover";

export interface HomeSection {
  id: string;
  title: string;
  /** Optional short native-script / accent label shown under the title. */
  accent?: string;
  kind: FeedKind;
  mediaType: "movie" | "tv";
  language?: string;
  genreSlug?: string;
  sort?: SortKey;
  /** Link the rail header to a browse/category route. */
  href?: string;
  /** Render the first rail as a large hero + poster rail. */
  hero?: boolean;
}

export const HOME_SECTIONS: HomeSection[] = [
  // ---- Tamil (priority) ----
  {
    id: "tamil-trending",
    title: "Trending in Tamil",
    accent: "தமிழ்",
    kind: "trending",
    mediaType: "movie",
    language: "ta",
    href: "/tamil",
    hero: true,
  },
  {
    id: "tamil-latest",
    title: "Latest Tamil Releases",
    accent: "புதிய வெளியீடுகள்",
    kind: "latest",
    mediaType: "movie",
    language: "ta",
    href: "/browse?type=movie&language=ta&sort=latest",
  },
  {
    id: "tamil-popular",
    title: "Popular Tamil Movies",
    kind: "popular",
    mediaType: "movie",
    language: "ta",
    href: "/tamil",
  },
  {
    id: "tamil-series",
    title: "Popular Tamil Series",
    kind: "popular",
    mediaType: "tv",
    language: "ta",
    href: "/browse?type=tv&language=ta",
  },
  {
    id: "tamil-top-rated",
    title: "Top Rated Tamil",
    kind: "top_rated",
    mediaType: "movie",
    language: "ta",
    href: "/browse?type=movie&language=ta&sort=top_rated",
  },
  {
    id: "tamil-action",
    title: "Tamil Action",
    kind: "discover",
    mediaType: "movie",
    language: "ta",
    genreSlug: "action",
    href: "/tamil/action",
  },
  {
    id: "tamil-thriller",
    title: "Tamil Thriller",
    kind: "discover",
    mediaType: "movie",
    language: "ta",
    genreSlug: "thriller",
    href: "/tamil/thriller",
  },
  {
    id: "tamil-romance",
    title: "Tamil Romance",
    kind: "discover",
    mediaType: "movie",
    language: "ta",
    genreSlug: "romance",
    href: "/tamil/romance",
  },
  {
    id: "tamil-comedy",
    title: "Tamil Comedy",
    kind: "discover",
    mediaType: "movie",
    language: "ta",
    genreSlug: "comedy",
    href: "/tamil/comedy",
  },
  {
    id: "tamil-crime",
    title: "Tamil Crime",
    kind: "discover",
    mediaType: "movie",
    language: "ta",
    genreSlug: "crime",
    href: "/tamil/crime",
  },

  // ---- English ----
  {
    id: "english-trending",
    title: "Trending in English",
    kind: "popular",
    mediaType: "movie",
    language: "en",
    sort: "popular",
    href: "/english",
  },
  {
    id: "english-series",
    title: "Popular English Series",
    kind: "popular",
    mediaType: "tv",
    language: "en",
    href: "/browse?type=tv&language=en",
  },
  {
    id: "english-latest",
    title: "Latest English Releases",
    kind: "latest",
    mediaType: "movie",
    language: "en",
    href: "/browse?type=movie&language=en&sort=latest",
  },
  {
    id: "english-top-rated",
    title: "Top Rated English",
    kind: "top_rated",
    mediaType: "movie",
    language: "en",
    href: "/browse?type=movie&language=en&sort=top_rated",
  },

  // ---- Other Indian languages ----
  {
    id: "hindi-popular",
    title: "Popular Hindi",
    kind: "popular",
    mediaType: "movie",
    language: "hi",
    href: "/browse?type=movie&language=hi",
  },
  {
    id: "telugu-popular",
    title: "Popular Telugu",
    kind: "popular",
    mediaType: "movie",
    language: "te",
    href: "/browse?type=movie&language=te",
  },
  {
    id: "malayalam-popular",
    title: "Popular Malayalam",
    kind: "popular",
    mediaType: "movie",
    language: "ml",
    href: "/browse?type=movie&language=ml",
  },
  {
    id: "kannada-popular",
    title: "Popular Kannada",
    kind: "popular",
    mediaType: "movie",
    language: "kn",
    href: "/browse?type=movie&language=kn",
  },

  // ---- International ----
  {
    id: "international-trending",
    title: "Trending Worldwide",
    kind: "trending",
    mediaType: "movie",
    href: "/trending",
  },
];
