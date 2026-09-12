// src/lib/stream-licensed.ts

export interface LicensedSource {
  /** Stable key, e.g. "server1" or "primary-hls" */
  id: string;
  /** Label shown in the player toolbar/menu */
  label: string;
  /** ISO-3166 country code for display */
  region?: string;
  /** Embed or direct stream URL */
  url: string;
  kind: "embed" | "hls" | "file";
}

/**
 * Server definitions for external embed fallback.
 */
const EMBED_SERVERS = [
  { id: "server1", label: "Pikachu", domain: "https://nxsha.space/watch", region: "US" },
  { id: "server2", label: "Charizard", domain: "https://peachify.top/embed", region: "US" },
  { id: "server3", label: "Bulbasaur", domain: "https://vidsrc.to/embed", region: "US" },
  { id: "server4", label: "Snorlax", domain: "https://vidfast.vc", region: "US" },
];

/**
 * Helper to generate iframe embed URLs according to media type and provider rules.
 */
function buildEmbedUrl(
  serverId: string,
  domain: string,
  type: "movie" | "tv",
  id: number | string,
  season: number = 1,
  episode: number = 1
): string {
  // Server 4 (VidFast) uses ?autoPlay=true query parameter
  if (serverId === "server4") {
    return type === "tv"
      ? `${domain}/tv/${id}/${season}/${episode}?autoPlay=true`
      : `${domain}/movie/${id}?autoPlay=true`;
  }

  // Standard embed path structure for Server 1, 2, and 3
  if (type === "tv") {
    return `${domain}/tv/${id}/${season}/${episode}`;
  }
  return `${domain}/movie/${id}`;
}

/**
 * Resolve the ordered list of streaming sources for a title or episode.
 * Prioritizes self-hosted HLS CDN streams when RAYWORLD_STREAM_BASE is configured.
 */
export async function getLicensedSources(
  type: "movie" | "tv",
  id: number | string,
  season?: number,
  episode?: number
): Promise<LicensedSource[]> {
  const targetId = id || "12345";

  // Check if custom self-hosted or licensed CDN base exists in environment
  const base = process.env.RAYWORLD_STREAM_BASE;
  if (base) {
    const path =
      type === "movie"
        ? `movies/${targetId}/master.m3u8`
        : `tv/${targetId}/s${season ?? 1}_e${episode ?? 1}/master.m3u8`;

    return [
      {
        id: "primary-hls",
        label: "Primary (HLS)",
        region: "Global CDN",
        url: `${base}/${path}`,
        kind: "hls",
      },
    ];
  }

  // Construct multi-server embed provider URLs dynamically
  return EMBED_SERVERS.map((server) => ({
    id: server.id,
    label: server.label,
    region: server.region,
    url: buildEmbedUrl(server.id, server.domain, type, targetId, season, episode),
    kind: "embed",
  }));
}
