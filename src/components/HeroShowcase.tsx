"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { backdropUrl, titleLogoUrl } from "@/lib/images";
import { getLanguageName } from "@/lib/config/languages";
import { getGenreName } from "@/lib/config/genres";
import { cn, formatRating } from "@/lib/utils";
import { PlayIcon, ChevronLeft, ChevronRight } from "./icons";
import { WatchlistButton } from "./WatchlistButton";

export interface FeaturedItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview?: string;
  backdropPath?: string | null;
  posterPath?: string | null;
  titleLogoPath?: string | null;
  year?: number;
  rating?: number;
  genreIds: number[];
}

const INTERVAL = 7000;

/**
 * Rotating featured hero. As the banner changes, a full-page blurred background
 * wash crossfades to the active title's backdrop, so the whole site takes on
 * that film's colours. Auto-advances, pauses on hover, and has dots + arrows.
 */
export function HeroShowcase({ items }: { items: FeaturedItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % count), INTERVAL);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;
  const go = (n: number) => setActive(((n % count) + count) % count);

  return (
    <section
      className="relative -mt-16 sm:-mt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Full-page blurred wash following the active banner */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {items.map((it, i) => {
          const wash = backdropUrl(it.backdropPath, "w780");
          return (
            <div
              key={it.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                i === active ? "opacity-100" : "opacity-0",
              )}
            >
              {wash && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={wash}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full scale-125 object-cover opacity-40 blur-[64px]"
                />
              )}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(31,107,255,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/55 via-ink-950/75 to-ink-950" />
      </div>

      {/* Hero stage */}
      <div className="relative h-[68vh] min-h-[460px] w-full overflow-hidden">
        {items.map((it, i) => {
          const bd = backdropUrl(it.backdropPath, "w1280");
          return (
            <div
              key={it.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === active ? "opacity-100" : "opacity-0",
              )}
            >
              {bd ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bd}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-ink-800 to-ink-950" />
              )}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 bg-side-fade" />

        {/* Active content */}
        <div className="container-page absolute inset-x-0 bottom-0">
          <ActiveContent item={items[active]} />
        </div>

        {/* Arrows */}
        {count > 1 && (
          <div className="absolute inset-y-0 right-4 hidden items-center gap-2 sm:flex">
            <div className="flex flex-col gap-2">
              <button
                aria-label="Previous"
                onClick={() => go(active - 1)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-ink-950/50 text-white/80 backdrop-blur transition hover:border-white/60 hover:text-white"
              >
                <ChevronLeft />
              </button>
              <button
                aria-label="Next"
                onClick={() => go(active + 1)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-ink-950/50 text-white/80 backdrop-blur transition hover:border-white/60 hover:text-white"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Dots */}
        {count > 1 && (
          <div className="container-page absolute inset-x-0 bottom-4 flex gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-8 bg-ray-gradient" : "w-3 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ActiveContent({ item }: { item: FeaturedItem }) {
  const logo = titleLogoUrl(item.titleLogoPath, "w500");
  const rating = formatRating(item.rating);
  const language = getLanguageName(undefined); // reserved; language not carried here
  const genres = item.genreIds
    .map((id) => getGenreName(id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div key={item.id} className="max-w-2xl animate-fade-in pb-12 sm:pb-16">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
        <span className="rounded-full bg-ray-gradient px-2.5 py-1 text-ink-950">Featured</span>
        {item.type === "tv" ? "Series" : "Movie"}
        {language && <span className="text-white/40">•</span>}
      </div>

      {logo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={item.title}
            className="max-h-24 w-auto max-w-[85%] object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:max-h-32"
          />
          <h1 className="sr-only">{item.title}</h1>
        </>
      ) : (
        <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-white drop-shadow sm:text-6xl">
          {item.title}
        </h1>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
        {item.year && <span>{item.year}</span>}
        {rating && <span className="text-ray-300">★ {rating}</span>}
        {genres.length > 0 && <span className="text-white/50">{genres.join(" · ")}</span>}
      </div>

      {item.overview && (
        <p className="mt-4 line-clamp-3 max-w-xl text-sm text-white/75 sm:text-base">
          {item.overview}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={`/watch/${item.type}/${item.id}`} className="btn-primary">
          <PlayIcon /> Watch Now
        </Link>
        <Link href={`/${item.type}/${item.id}`} className="btn-ghost">
          More Info
        </Link>
        <WatchlistButton
          variant="button"
          entry={{
            id: item.id,
            type: item.type,
            title: item.title,
            posterPath: item.posterPath,
            year: item.year,
            rating: item.rating,
          }}
        />
      </div>
    </div>
  );
}
