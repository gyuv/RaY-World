import { provider } from "./providers";
import {
  DiscoverOptions,
  MediaItem,
  Paginated,
} from "./providers/types";
import { HomeSection } from "./config/home-sections";
import { rankMedia } from "./ranking";
import { unique } from "./utils";

/**
 * Catalog helpers that sit between the provider and the UI. These apply
 * RaY-World's ranking/fallback rules so pages never render empty when the
 * backend can reasonably provide content (spec §13, §30, §32).
 */

const EMPTY: Paginated<MediaItem> = {
  results: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

/** Fetch a single homepage rail's items. Never throws. */
export async function fetchSection(section: HomeSection): Promise<MediaItem[]> {
  if (!provider.available) return [];

  const { mediaType: type, language, genreSlug, kind } = section;

  let page: Paginated<MediaItem> = EMPTY;
  switch (kind) {
    case "trending":
      page = await safe(
        provider.getTrending({ type, window: "week" }),
        EMPTY,
      );
      // Trending "all/movie" isn't language-filtered upstream; when a language
      // is requested we prefer discover to keep the rail on-language.
      if (language) {
        const disc = await safe(
          provider.discover({ type, language, sort: "popular" }),
          EMPTY,
        );
        page = disc.results.length ? disc : page;
      }
      break;
    case "popular":
      page = await safe(
        provider.getPopular({ type, language }),
        EMPTY,
      );
      break;
    case "top_rated":
      page = await safe(provider.getTopRated({ type, language }), EMPTY);
      break;
    case "latest":
      page = await safe(provider.getLatest({ type, language }), EMPTY);
      break;
    case "discover":
      page = await safe(
        provider.discover({
          type,
          language,
          genreSlug,
          sort: section.sort ?? "popular",
        }),
        EMPTY,
      );
      break;
  }

  // Keep rails visually solid: require a poster (spec §16 imagery fallback still
  // applies, but rails look best poster-first).
  const items = page.results.filter((m) => m.posterPath);
  return unique(items, (m) => `${m.type}:${m.id}`).slice(0, 20);
}

/** A resolved section with its items, ready to render. */
export interface ResolvedSection {
  section: HomeSection;
  items: MediaItem[];
}

/**
 * Resolve all homepage sections in parallel, dropping any that came back empty
 * (spec §13: never show an empty section).
 */
export async function fetchHomeSections(
  sections: HomeSection[],
): Promise<ResolvedSection[]> {
  const resolved = await Promise.all(
    sections.map(async (section) => ({
      section,
      items: await fetchSection(section),
    })),
  );
  // A rail needs a few items to be worth showing.
  return resolved.filter((r) => r.items.length >= 4);
}

/**
 * Browse/discover with ranking applied. Used by /browse and category routes.
 */
export async function browse(
  options: DiscoverOptions,
): Promise<Paginated<MediaItem>> {
  if (!provider.available) return EMPTY;
  const page = await safe(provider.discover(options), EMPTY);
  // Preserve upstream sort but ensure poster-bearing items lead for popular.
  return page;
}

/**
 * Discover a single rail's items with the standard poster-first filtering.
 * Never throws — returns [] on any error so a page never breaks.
 */
export async function discoverRail(
  options: DiscoverOptions,
  limit = 20,
): Promise<MediaItem[]> {
  if (!provider.available) return [];
  const page = await safe(provider.discover(options), EMPTY);
  return unique(
    page.results.filter((m) => m.posterPath),
    (m) => `${m.type}:${m.id}`,
  ).slice(0, limit);
}

/** Pick a hero item from a set of candidates: first with a backdrop. */
export function pickHero(items: MediaItem[]): MediaItem | undefined {
  const ranked = rankMedia(
    items.filter((i) => i.backdropPath && i.overview),
    { preferLanguage: "ta", weights: { language: 0.5 } },
  );
  return ranked[0] ?? items.find((i) => i.backdropPath) ?? items[0];
}
