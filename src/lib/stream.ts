// src/lib/stream.ts
import { StreamSource } from "@/lib/providers/types";

/**
 * Resolve a playable stream for a title/episode.
 *
 * This is the single seam where you connect a streaming source you are
 * LICENSED to serve — for example:
 *   - your own hosted files on a CDN (S3/CloudFront, Bunny) -> { kind: "file" }
 *   - a managed streaming provider (Mux, Cloudflare Stream)  -> { kind: "hls" | "embed" }
 *   - an authorized studio/OTT partner player embed          -> { kind: "embed" }
 *
 * Return `null` when no licensed source is available for the title — the player
 * then falls back to the trailer preview / "connect a source" state.
 *
 * Do NOT return URLs from unauthorized/pirated streaming sites here. Doing so
 * would make RaY-World distribute copyrighted content illegally.
 *
 * Example (reading from your own catalog):
 *
 *   const row = await db.streams.find({ type, tmdbId: id, season, episode });
 *   if (!row) return null;
 *   return { url: row.hlsUrl, kind: "hls" };
 */
export async function getStreamSource(
  _type: "movie" | "tv",
  _id: number,
  _season?: number,
  _episode?: number,
): Promise<StreamSource | null> {
  // No licensed source wired up yet. Plug yours in above and return it here.
  return null;
}
