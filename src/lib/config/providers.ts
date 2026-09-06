/**
 * Streaming platform configuration.
 *
 * `tmdbId` is the TMDB *watch provider* id, used with discover's
 * `with_watch_providers` + `watch_region` to genuinely organise titles by where
 * they're available (authorized TMDB data). `region` defaults the availability
 * lookup (India for a Tamil-first audience).
 *
 * Taglines are original one-liners (not the platforms' trademarked slogans).
 * Monogram/tint are for the original, non-logo badges.
 */

export interface StreamingProvider {
  slug: string;
  name: string;
  tmdbId: number;
  region: string;
  mono: string;
  tint: string;
  tagline: string;
}

export const PROVIDERS: StreamingProvider[] = [
  {
    slug: "netflix",
    name: "Netflix",
    tmdbId: 8,
    region: "IN",
    mono: "N",
    tint: "from-rose-500/30 to-rose-700/20",
    tagline: "Binge the world's biggest hits, originals and series.",
  },
  {
    slug: "prime-video",
    name: "Prime Video",
    tmdbId: 119,
    region: "IN",
    mono: "P",
    tint: "from-sky-500/30 to-sky-700/20",
    tagline: "Blockbusters, award-winning originals and more.",
  },
  {
    slug: "disney-hotstar",
    name: "Disney+ Hotstar",
    tmdbId: 122,
    region: "IN",
    mono: "D",
    tint: "from-indigo-500/30 to-indigo-700/20",
    tagline: "Movies, marquee series and live sport in one place.",
  },
  {
    slug: "sun-nxt",
    name: "Sun NXT",
    tmdbId: 309,
    region: "IN",
    mono: "S",
    tint: "from-amber-500/30 to-orange-700/20",
    tagline: "The home of South Indian cinema, all in one place.",
  },
  {
    slug: "aha",
    name: "aha",
    tmdbId: 532,
    region: "IN",
    mono: "a",
    tint: "from-orange-500/30 to-red-700/20",
    tagline: "Telugu and Tamil entertainment, unlimited.",
  },
  {
    slug: "zee5",
    name: "ZEE5",
    tmdbId: 232,
    region: "IN",
    mono: "Z",
    tint: "from-fuchsia-500/30 to-purple-700/20",
    tagline: "Stream across languages, genres and originals.",
  },
  {
    slug: "sonyliv",
    name: "SonyLIV",
    tmdbId: 237,
    region: "IN",
    mono: "L",
    tint: "from-blue-500/30 to-blue-800/20",
    tagline: "Premium originals and live entertainment.",
  },
  {
    slug: "jiocinema",
    name: "JioCinema",
    tmdbId: 970,
    region: "IN",
    mono: "J",
    tint: "from-pink-500/30 to-rose-700/20",
    tagline: "Movies, shows and blockbuster action.",
  },
  {
    slug: "apple-tv-plus",
    name: "Apple TV+",
    tmdbId: 350,
    region: "IN",
    mono: "TV",
    tint: "from-zinc-400/30 to-zinc-700/20",
    tagline: "Award-winning originals, made to be seen.",
  },
  {
    slug: "youtube",
    name: "YouTube",
    tmdbId: 192,
    region: "IN",
    mono: "Y",
    tint: "from-red-500/30 to-red-800/20",
    tagline: "From trailers to full features.",
  },
];

const BY_SLUG: Record<string, StreamingProvider> = Object.fromEntries(
  PROVIDERS.map((p) => [p.slug, p]),
);

export function getProvider(slug?: string | null): StreamingProvider | undefined {
  if (!slug) return undefined;
  return BY_SLUG[slug.toLowerCase()];
}
