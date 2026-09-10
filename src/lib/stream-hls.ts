// src/lib/stream-hls.ts
//
// Licensed-source seam for the native HLS player. This is intentionally
// SEPARATE from src/lib/stream.ts — it never touches unauthorized embed hosts.
// Each source is a direct HLS manifest (.m3u8) or a progressive file that YOU
// are licensed to serve (your own CDN, Mux, Cloudflare Stream, a distributor
// feed, etc.). The player fetches and plays these directly, so there is no
// third-party iframe, no ads, and no popups — you own every pixel.
//
// HOW TO GO LIVE WITH YOUR OWN CONTENT
// ------------------------------------
// Replace the body of getPlayableSources() with a lookup that maps a
// (type, id, season, episode) to the authorized manifest URLs for that title.
// Two common shapes:
//   1. A signed URL from your CDN/DRM service:
//        return [{ id, label: "Primary", url: signedUrl, kind: "hls" }];
//   2. A base URL from an env var + your own path convention:
//        const base = process.env.RAYWORLD_STREAM_BASE;
//        return [{ id, label: "CDN", url: `${base}/movie/${id}/master.m3u8`, kind: "hls" }];
//
// The array order is the failover order: the player auto-selects the first that
// plays and falls through to the next on error, exactly like the "auto-balance"
// server list you asked for.
//
// NOTE: this player plays HLS/MP4 directly, so it only accepts kind "hls" or
// "file". iframe embed URLs (kind "embed") belong to the separate stream.ts
// path and cannot be rendered here.

export interface PlayableSource {
  /** Stable key, e.g. "primary". */
  id: string;
  /** Shown in the in-player Servers menu, e.g. "Lisbon". */
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
 * before you wire in your own catalogue. These are the standard Apple, Mux and
 * Bitmovin developer test assets — swap them out in getPlayableSources().
 */
const SAMPLE_SERVERS: PlayableSource[] = [
  {
    id: "sample-apple",
    label: "Aurora",
    region: "US",
    // BipBop — multiple qualities + audio tracks + subtitle tracks.
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
    kind: "hls",
  },
  {
    id: "sample-mux",
    label: "Nebula",
    region: "US",
    // Big Buck Bunny — multi-bitrate + subtitles.
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
 * Resolve the ordered list of authorized servers for a title/episode.
 *
 * Right now it returns the public sample servers (so the player is live).
 * Replace this with your licensed lookup — return an empty array for titles you
 * are not authorized to stream and the player shows a clean "not available"
 * state instead of anything unlicensed.
 */
export async function getPlayableSources(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number,
): Promise<PlayableSource[]> {
  if (!id) return [];

  // --- BEGIN licensed lookup (replace this block) -------------------------
  // Example env-driven wiring, disabled until RAYWORLD_STREAM_BASE is set:
  const base = process.env.RAYWORLD_STREAM_BASE;
  if (base) {
    const path =
      type === "movie"
        ? `movie/${id}/master.m3u8`
        : `tv/${id}/${season ?? 1}/${episode ?? 1}/master.m3u8`;
    return [{ id: "primary", label: "Primary", url: `${base}/${path}`, kind: "hls" }];
  }
  // --- END licensed lookup ------------------------------------------------

  // No authorized source configured → fall back to the public test servers so
  // the player UI stays fully functional during development.
  return SAMPLE_SERVERS;
}
