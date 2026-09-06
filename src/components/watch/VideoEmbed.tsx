"use client";

import { StreamSource } from "@/lib/providers/types";

/**
 * VideoEmbed — the ONLY place that renders an actual playable stream.
 *
 * Keep all streaming/playback changes inside this file so the watch page and
 * WatchPlayer stay stable. Given a `StreamSource` (resolved by
 * `src/lib/stream.ts` → getStreamSource), it renders the right player:
 *
 *   kind: "embed" -> <iframe>  (a licensed provider/partner player URL)
 *   kind: "file"  -> <video>   (a direct MP4/WebM URL)
 *   kind: "hls"   -> <video>   (an .m3u8 manifest; native on Safari/iOS —
 *                               add hls.js here for other browsers)
 *
 * Only use sources you are LICENSED to serve (your own CDN, Mux, Cloudflare
 * Stream, or an authorized embed). Do not point this at unauthorized/pirated
 * streaming sites.
 */
export function VideoEmbed({
  source,
  title,
  poster,
  onError,
}: {
  source: StreamSource;
  title: string;
  poster?: string | null;
  /** Called if a <video> source fails to load (e.g. to try another server). */
  onError?: () => void;
}) {
  if (source.kind === "embed") {
    return (
      <iframe
        src={source.url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    );
  }

  // "file" or "hls" — native HTML5 video.
  // For HLS on Chrome/Firefox, install hls.js and attach it here in a
  // useEffect against a ref; Safari/iOS play .m3u8 natively via `src`.
  return (
    <video
      src={source.url}
      controls
      autoPlay
      playsInline
      poster={poster ?? undefined}
      onError={onError}
      className="h-full w-full bg-black"
    />
  );
}
