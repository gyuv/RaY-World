"use client";

import { useState } from "react";
import Image from "next/image";
import { backdropUrl, stillUrl } from "@/lib/images";
import { Video } from "@/lib/providers/types";
import { PlayIcon } from "@/components/icons";

interface WatchPlayerProps {
  title: string;
  backdropPath?: string | null;
  stillPath?: string | null;
  videos: Video[];
}

/**
 * Cinematic player surface. RaY-World ships without bundled streams: the player
 * shell plays an authorized YouTube trailer preview when available and clearly
 * indicates where a licensed source integration would attach. It never scrapes
 * or proxies unauthorized streaming sources (spec §23).
 */
export function WatchPlayer({
  title,
  backdropPath,
  stillPath,
  videos,
}: WatchPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const trailer =
    videos.find((v) => v.type === "Trailer" && v.official) ??
    videos.find((v) => v.type === "Trailer") ??
    videos.find((v) => v.type === "Teaser");

  const image =
    stillUrl(stillPath, "w780") ?? backdropUrl(backdropPath, "w1280");

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      {playing && trailer ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
          title={`${title} — preview`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
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
              onClick={() => trailer && setPlaying(true)}
              disabled={!trailer}
              className="grid h-16 w-16 place-items-center rounded-full bg-ray-gradient text-ink-950 shadow-glow transition hover:scale-105 disabled:opacity-50"
              aria-label={trailer ? "Play preview" : "No preview available"}
            >
              <PlayIcon className="text-2xl" />
            </button>
            <p className="max-w-md px-6 text-sm text-white/70">
              {trailer
                ? "Playing official preview. Connect a licensed source to stream the full title."
                : "Connect a licensed streaming source to play this title."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
