import { MediaItem } from "./providers/types";
import { getLanguagePriority } from "./config/languages";
import { CURRENT_YEAR } from "./utils";

/**
 * Configurable homepage ranking (spec §29). These weights are starting points,
 * not hardcoded truth — they can be tuned or overridden per-surface.
 */
export interface RankingWeights {
  language: number;
  popularity: number;
  rating: number;
  recency: number;
  imagery: number;
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  language: 0.4,
  popularity: 0.25,
  rating: 0.2,
  recency: 0.15,
  imagery: 0.05,
};

/** Normalize popularity (unbounded) into 0..1 with diminishing returns. */
function popularityScore(popularity?: number): number {
  if (!popularity || popularity <= 0) return 0;
  return Math.min(1, Math.log10(popularity + 1) / 3); // ~1000 -> 1
}

function ratingScore(rating?: number): number {
  if (!rating) return 0;
  return Math.min(1, rating / 10);
}

function recencyScore(year?: number): number {
  if (!year) return 0.2;
  const age = CURRENT_YEAR - year;
  if (age <= 0) return 1;
  if (age >= 20) return 0;
  return Math.max(0, 1 - age / 20);
}

function imageryScore(item: MediaItem): number {
  let s = 0;
  if (item.posterPath) s += 0.7;
  if (item.backdropPath) s += 0.3;
  return s;
}

function languageScore(
  language: string | undefined,
  preferLanguage?: string,
): number {
  if (preferLanguage) {
    return language === preferLanguage ? 1 : 0.15;
  }
  // Default: use the global Tamil-first priority ladder (max priority = 100).
  return getLanguagePriority(language) / 100;
}

export interface RankOptions {
  preferLanguage?: string;
  weights?: Partial<RankingWeights>;
}

export function scoreItem(item: MediaItem, options: RankOptions = {}): number {
  const w = { ...DEFAULT_WEIGHTS, ...options.weights };
  return (
    w.language * languageScore(item.language, options.preferLanguage) +
    w.popularity * popularityScore(item.popularity) +
    w.rating * ratingScore(item.rating) +
    w.recency * recencyScore(item.year) +
    w.imagery * imageryScore(item)
  );
}

/** Rank a list of media, highest score first (stable). */
export function rankMedia(
  items: MediaItem[],
  options: RankOptions = {},
): MediaItem[] {
  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, options) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.item);
}
