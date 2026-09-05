"use client";

import Link from "next/link";
import { useContinueWatching } from "@/lib/storage";
import { posterUrl } from "@/lib/images";
import { PlayIcon, CloseIcon } from "./icons";

export function ContinueWatchingRail() {
  const { items, remove } = useContinueWatching();
  if (items.length === 0) return null;

  return (
    <section className="container-page py-4">
      <h2 className="mb-3 text-lg font-bold tracking-tight sm:text-xl">
        Continue Watching
      </h2>
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:gap-4">
        {items.map((entry) => {
          const img = posterUrl(entry.posterPath, "w342");
          const href = `/watch/${entry.type}/${entry.id}`;
          const pct = Math.round(Math.min(1, Math.max(0, entry.progress)) * 100);
          return (
            <div
              key={`${entry.type}:${entry.id}`}
              className="group relative w-[60vw] flex-none sm:w-[280px]"
            >
              <Link
                href={href}
                className="block overflow-hidden rounded-xl ring-1 ring-white/10"
              >
                <div className="relative aspect-video bg-ink-800">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={entry.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xl">
                      🎬
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
                  <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-ray-gradient text-ink-950">
                      <PlayIcon className="text-lg" />
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {entry.title}
                    </p>
                    {entry.type === "tv" &&
                      entry.seasonNumber != null &&
                      entry.episodeNumber != null && (
                        <p className="text-xs text-white/60">
                          S{entry.seasonNumber} · E{entry.episodeNumber}
                        </p>
                      )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-ray-gradient"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
              <button
                type="button"
                aria-label="Remove from Continue Watching"
                onClick={() => remove(entry.id, entry.type)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink-950/80 text-white/80 opacity-0 transition hover:text-white group-hover:opacity-100"
              >
                <CloseIcon className="text-sm" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
