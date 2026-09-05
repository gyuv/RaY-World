"use client";

import { useState } from "react";
import { Video } from "@/lib/providers/types";
import { PlayIcon, CloseIcon } from "@/components/icons";

/** Picks the best official trailer and plays it in a modal (authorized embed). */
export function TrailerButton({ videos }: { videos: Video[] }) {
  const [open, setOpen] = useState(false);

  const trailer =
    videos.find((v) => v.type === "Trailer" && v.official) ??
    videos.find((v) => v.type === "Trailer") ??
    videos.find((v) => v.type === "Teaser");

  if (!trailer) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline">
        <PlayIcon /> Trailer
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/90 p-4 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close trailer"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-ink-950/80 text-white hover:bg-ink-800"
            >
              <CloseIcon />
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
