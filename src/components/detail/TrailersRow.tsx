"use client";

import { useState } from "react";
import { Video } from "@/lib/providers/types";
import { PlayIcon, CloseIcon } from "@/components/icons";

/**
 * Row of trailer/teaser thumbnails; clicking plays that video in a modal.
 * Uses YouTube thumbnails + the authorized nocookie embed.
 */
export function TrailersRow({ videos }: { videos: Video[] }) {
  const clips = videos
    .filter((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
    .slice(0, 12);
  const [playing, setPlaying] = useState<string | null>(null);

  if (clips.length === 0) return null;

  return (
    <section className="container-page py-6">
      <h2 className="mb-4 text-xl font-bold tracking-tight">Trailers &amp; Teasers</h2>
      <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {clips.map((v) => (
          <button
            key={v.key}
            onClick={() => setPlaying(v.key)}
            className="group relative aspect-video w-64 flex-none overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10 transition hover:ring-ray-400/50 sm:w-72"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${v.key}/hqdefault.jpg`}
              alt={v.name}
              loading="lazy"
              className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
            />
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-ray-gradient text-ink-950 shadow-glow transition group-hover:scale-110">
                <PlayIcon />
              </span>
            </div>
            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink-950/90 to-transparent p-2 text-left text-xs font-medium text-white/90">
              {v.name}
            </span>
          </button>
        ))}
      </div>

      {playing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/90 p-4 backdrop-blur"
          onClick={() => setPlaying(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPlaying(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-ink-950/80 text-white hover:bg-ink-800"
            >
              <CloseIcon />
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing}?autoplay=1&rel=0`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
