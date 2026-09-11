"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { backdropUrl, posterUrl, titleLogoUrl } from "@/lib/images";
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

  const activeItem = items[active];
  const washSrc = backdropUrl(activeItem.backdropPath, "w300");
  const activeBackdrop = backdropUrl(activeItem.backdropPath, "w1280");
  const activePoster = posterUrl(activeItem.posterPath, "w780") ?? activeBackdrop;

  // Preload the next slide so the crossfade is instant, without mounting it.
  const nextItem = count > 1 ? items[(active + 1) % count] : null;
  const nextPoster = nextItem ? posterUrl(nextItem.posterPath, "w780") : null;
  const nextBackdrop = nextItem ? backdropUrl(nextItem.backdropPath, "w1280") : null;

  return (
    <section
      className="relative -mt-24 sm:-mt-28 lg:-mt-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Full-page blurred wash — only the active slide is rendered, from a
          tiny w300 source (it's blurred anyway), so there is next to nothing to
          decode or blur. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {washSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={activeItem.id}
            src={washSrc}
            alt=""
            decoding="async"
            className="h-full w-full scale-110 animate-fade-in object-cover object-top blur-[34px]"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,15,30,0.12) 0%, rgba(10,15,30,0.5) 62%, rgba(10,15,30,0.9) 100%)",
          }}
        />
      </div>

      {/* Hero stage — fills the screen */}
      <div className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
        {/* Imagery dissolves to transparent at the bottom into the page wash. */}
        <div
          className="absolute inset-0"
          style={{
            // Long, smooth ramp with no hard stops: the banner dissolves over
            // the bottom ~15% into the blurred wash, so there is no line where
            // it meets the page.
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 48%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.18) 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 48%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.18) 88%, transparent 100%)",
          }}
        >
          {/* Only the active slide's image is mounted. <picture> loads the
              portrait poster on phones OR the wide backdrop at sm+ — never both. */}
          {activeBackdrop || activePoster ? (
            <div key={activeItem.id} className="absolute inset-0 animate-fade-in">
              <picture>
                {activeBackdrop && (
                  <source media="(min-width: 640px)" srcSet={activeBackdrop} />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePoster ?? activeBackdrop ?? ""}
                  alt=""
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </picture>
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-ink-800 to-ink-950" />
          )}
          {/* Left scrim — inside the mask so it fades at the bottom too. */}
          <div className="absolute inset-0 bg-side-fade" />
        </div>

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

      {/* Invisible preloader for the next slide — keeps switches instant. */}
      {nextItem && (
        <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {nextPoster && <img src={nextPoster} alt="" loading="lazy" decoding="async" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {nextBackdrop && <img src={nextBackdrop} alt="" loading="lazy" decoding="async" />}
        </div>
      )}
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
