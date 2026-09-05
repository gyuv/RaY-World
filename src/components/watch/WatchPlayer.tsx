"use client";

import { useState } from "react";
import Image from "next/image";
import { backdropUrl, stillUrl } from "@/lib/images";
import { Video } from "@/lib/providers/types";
import { PlayIcon, CloseIcon } from "@/components/icons";

interface WatchPlayerProps {
  title: string;
  backdropPath?: string | null;
  stillPath?: string | null;
  videos: Video[];
  /** A licensed stream URL, resolved by getStreamSource(). */
  streamUrl?: string | null;
  streamKind?: "file" | "hls" | "embed";
}

/**
 * Cinematic player surface.
 *
 * Playback priority: a licensed `streamUrl` if one is provided, otherwise the
 * authorized YouTube trailer preview, otherwise a "connect a source" state.
 * It never scrapes or proxies unauthorized streaming sources (spec §23).
 */
export function WatchPlayer({
  title,
  backdropPath,
  stillPath,
  videos,
  streamUrl,
  streamKind = "embed",
}: WatchPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const trailer =
    videos.find((v) => v.type === "Trailer" && v.official) ??
    videos.find((v) => v.type === "Trailer") ??
    videos.find((v) => v.type === "Teaser");

  const image =
    stillUrl(stillPath, "w780") ?? backdropUrl(backdropPath, "w1280");

  const canPlay = Boolean(streamUrl || trailer);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      {playing && canPlay ? (
        <>
          {streamUrl ? (
            streamKind === "embed" ? (
              // Licensed provider embed (e.g. Mux/Cloudflare Stream, or an
              // authorized partner player).
              <iframe
                src={streamUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              // Direct file (MP4/WebM) or HLS manifest. HLS plays natively in
              // Safari/iOS; add hls.js for other browsers if you use HLS.
              <video
                src={streamUrl}
                controls
                autoPlay
                playsInline
                poster={image ?? undefined}
                className="h-full w-full bg-black"
              />
            )
          ) : trailer ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={`${title} — preview`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : null}

          <button
            onClick={() => setPlaying(false)}
            aria-label="Close player"
            className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          >
            <CloseIcon />
          </button>
        </>
      ) : (
        <>
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-70"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />
          )}
          <div className="absolute inset-0 bg-ink-950/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <button
              onClick={() => canPlay && setPlaying(true)}
              disabled={!canPlay}
              className="grid h-16 w-16 place-items-center rounded-full bg-ray-gradient text-ink-950 shadow-glow transition hover:scale-105 disabled:opacity-50"
              aria-label={canPlay ? "Play" : "No source available"}
            >
              <PlayIcon className="text-2xl" />
            </button>
            <p className="max-w-md px-6 text-sm text-white/70">
              {streamUrl
                ? "Ready to play."
                : trailer
                  ? "Playing official preview. Connect a licensed source to stream the full title."
                  : "Connect a licensed streaming source to play this title."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
