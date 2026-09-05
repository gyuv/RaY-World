import { MediaProvider } from "./types";
import { tmdbProvider } from "./tmdb";

/**
 * Active provider selection.
 *
 * TMDB is the primary provider today. To add another legitimate provider,
 * implement `MediaProvider` and compose it here (e.g. a fan-out aggregator).
 * Nothing in the UI imports a concrete provider directly.
 */
export const provider: MediaProvider = tmdbProvider;

export * from "./types";
