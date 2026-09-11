// src/lib/stream-licensed.ts
//
// Licensed-source seam for the native HLS player (HlsPlayer). It returns ONLY
// direct video the site is authorized to serve — an HLS manifest (.m3u8) or a
// progressive file (.mp4/.webm) — which the <video>/hls.js player can play with
// no third-party iframe, no ads and no popups.
//
// This is deliberately separate from src/lib/stream.ts and src/lib/stream-hls.ts
// (the iframe/embed "server" lists). The HLS player cannot render an iframe
// embed, so those belong to the embed path, not here.
//
// HOW TO GO LIVE WITH YOUR OWN CONTENT
// ------------------------------------
// Replace the body of getLicensedSources() with a lookup mapping a
// (type, id, season, episode) to the authorized manifest URLs for that title:
//   - a signed URL from your CDN/DRM service, or
//   - a base URL from RAYWORLD_STREAM_BASE + your own path convention.
// The array order is the failover order: the player auto-selects the first that
// plays and falls through to the next on error.

export interface LicensedSource {
  /** Stable key, e.g. "primary". */
  id: string;
  /** Shown in the in-player Servers menu, e.g. "Aurora". */
  label: string;
  /** ISO-3166 country for the little flag in the menu (optional). */
  region?: string;
  /** A direct .m3u8 (hls) or .mp4/.webm (file) URL you are licensed to serve. */
  url: string;
  kind: "hls" | "file";
}

/**
 * Public, license-clear TEST streams used ONLY as placeholders so the whole
 * player UI (quality / audio / subtitle / server-failover) is fully functional
 * before you wire in your own catalogue. Standard Apple / Mux / Bitmovin
 * developer test assets — swap them out in getLicensedSources().
 */
const SAMPLE_SERVERS: LicensedSource[] = [
  {
    id: "sample-apple",
    label: "Aurora",
    region: "US",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
    kind: "hls",
  },
  {
    id: "sample-mux",
    label: "Nebula",
    region: "US",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    kind: "hls",
  },
  {
    id: "sample-sintel",
    label: "Sintel",
    region: "NL",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    kind: "hls",
  },
];

/**
 * Resolve the ordered list of authorized HLS/file servers for a title/episode.
 * Returns the public sample servers until a licensed lookup is wired in; return
 * an empty array for titles you are not authorized to stream and the player
 * shows a clean "not available" state.
 */
export async function getLicensedSources(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number,
): Promise<LicensedSource[]> {
  if (!id) return [];

  const base = process.env.RAYWORLD_STREAM_BASE;
  if (base) {
    const path =
      type === "movie"
        ? `movie/${id}/master.m3u8`
        : `tv/${id}/${season ?? 1}/${episode ?? 1}/master.m3u8`;
    return [{ id: "primary", label: "Primary", url: `${base}/${path}`, kind: "hls" }];
  }

  return SAMPLE_SERVERS;
}
