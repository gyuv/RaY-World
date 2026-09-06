"use client";

import { backdropUrl, stillUrl } from "@/lib/images";
import { StreamSource, Video } from "@/lib/providers/types";
import { VideoEmbed } from "./VideoEmbed";

interface WatchPlayerProps {
  title: string;
  backdropPath?: string | null;
  stillPath?: string | null;
  videos: Video[];
  /** Licensed servers resolved by getStreamSources(). */
  servers?: StreamSource[];
}

/**
 * Thin shell around the streaming widget. It only computes the poster image and
 * picks a trailer preview, then hands off to <VideoEmbed>, which owns the player
 * and the server buttons. Future streaming changes live in VideoEmbed and
 * src/lib/stream.ts — this file and the watch page stay stable.
 */
export function WatchPlayer({
  title,
  backdropPath,
  stillPath,
  videos,
  servers = [],
}: WatchPlayerProps) {
  const trailer =
    videos.find((v) => v.type === "Trailer" && v.official) ??
    videos.find((v) => v.type === "Trailer") ??
    videos.find((v) => v.type === "Teaser");

  const poster = stillUrl(stillPath, "w780") ?? backdropUrl(backdropPath, "w1280");

  return (
    <VideoEmbed
      title={title}
      poster={poster}
      servers={servers}
      trailerKey={trailer?.key ?? null}
    />
  );
}
