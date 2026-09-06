// src/lib/stream.ts
import { StreamSource } from "@/lib/providers/types";

/**
 * Resolve the list of "servers" (playable sources) for a title/episode.
 *
 * This is the single place you connect sources you are LICENSED to serve —
 * your own CDN files/HLS, Mux, Cloudflare Stream, or an authorized provider
 * embed. Fill each server's `url` below; a server with an empty `url` renders
 * as a disabled button until you configure it.
 *
 * Do NOT put URLs from unauthorized/pirated streaming sites here — that would
 * make RaY-World distribute copyrighted content illegally.
 *
 * Example once you have licensed URLs:
 *   url: `https://stream.yoursite.com/${type}/${id}.m3u8`, kind: "hls"
 *   url: muxPlaybackUrl,                                    kind: "hls"
 *   url: authorizedPartnerEmbedUrl,                         kind: "embed"
 */
export async function getStreamSources(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number,
): Promise<StreamSource[]> {
  if (!id) return [];

  // 3 server slots. Set each `url` to a licensed source to enable its button.
  // `type`, `id`, `season`, `episode` are available to build your URLs.
  return [
    { id: "server-1", label: "Orange-Server", url: "", kind: "embed" },
    { id: "server-2", label: "Apple-Server", url: "", kind: "embed" },
    { id: "server-3", label: "Mango-Server", url: "", kind: "embed" },
  ];
}
