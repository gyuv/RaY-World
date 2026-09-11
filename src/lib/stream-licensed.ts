// src/lib/stream-licensed.ts

export interface LicensedSource {
  /** Stable key, e.g. "server1" */
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
 * Server definitions mirroring the embed provider configuration from Code 1.
 */
const EMBED_SERVERS = [
  { id: "server1", label: "Server 1 (VidSrc XYZ)", domain: "https://vidsrc.xyz/embed", region: "US" },
  { id: "server2", label: "Server 2 (Embed.su)", domain: "https://embed.su/embed", region: "US" },
  { id: "server3", label: "Server 3 (VidSrc TO)", domain: "https://vidsrc.to/embed", region: "US" },
  { id: "server4", label: "Server 4 (VidSrc NL)", domain: "https://player.vidsrc.nl/embed", region: "NL" },
];

/**
 * Helper to generate iframe embed URLs according to media type and IDs.
 */
function buildEmbedUrl(
  domain: string,
  type: "movie" | "tv",
  id: number | string,
  season: number = 1,
  episode: number = 1
): string {
  if (type === "tv") {
    return `${domain}/tv/${id}/${season}/${episode}`;
  }
  return `${domain}/movie/${id}`;
}

/**
 * Resolve the ordered list of streaming servers for a title/episode using 
 * the embed provider mechanism from Code 1.
 */
export async function getLicensedSources(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number
): Promise<LicensedSource[]> {
  const targetId = id || "12345";

  // Check if custom self-hosted CDN base exists in environment
  const base = process.env.RAYWORLD_STREAM_BASE;
  if (base) {
    const path =
      type === "movie"
        ? `movie/${targetId}/master.m3u8`
        : `tv/${targetId}/${season ?? 1}/${episode ?? 1}/master.m3u8`;
    return [{ id: "primary", label: "Primary", url: `${base}/${path}`, kind: "hls" }];
  }

  // Construct multi-server embed provider URLs dynamically
  return EMBED_SERVERS.map((server) => ({
    id: server.id,
    label: server.label,
    region: server.region,
    url: buildEmbedUrl(server.domain, type, targetId, season, episode),
    kind: "embed",
  }));
}
