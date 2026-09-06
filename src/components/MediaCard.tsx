import Link from "next/link";
import { MediaItem } from "@/lib/providers/types";
import { getLanguageName } from "@/lib/config/languages";
import { cn } from "@/lib/utils";
import { Poster } from "./Poster";
import { RatingBadge } from "./RatingBadge";
import { WatchlistButton } from "./WatchlistButton";
import { PlayIcon, TvIcon, FilmIcon } from "./icons";

interface MediaCardProps {
  item: MediaItem;
  className?: string;
  priority?: boolean;
}

export function MediaCard({ item, className, priority }: MediaCardProps) {
  const href = `/${item.type}/${item.id}`;
  const language = getLanguageName(item.language);

  return (
    <Link
      href={href}
      className={cn(
        "group relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-ray-400 rounded-xl",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-800 shadow-card ring-1 ring-white/5 transition duration-300 group-hover:ring-ray-400/40">
        <Poster
          path={item.posterPath}
          alt={item.title}
          priority={priority}
          className="transition duration-500 group-hover:scale-105"
        />

        {/* Top meta */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-ink-950/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
            {item.type === "tv" ? (
              <TvIcon className="text-[0.9em]" />
            ) : (
              <FilmIcon className="text-[0.9em]" />
            )}
            {item.type === "tv" ? "Series" : "Movie"}
          </span>
          <RatingBadge rating={item.rating} />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="flex items-center gap-2 p-3">
            <span className="btn-primary pointer-events-none !px-3 !py-1.5 text-xs">
              <PlayIcon /> Play
            </span>
            <div className="pointer-events-auto ml-auto">
              <WatchlistButton
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
        </div>
      </div>

      {/* Caption */}
      <div className="mt-2 px-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white/90 group-hover:text-white">
          {item.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
          {item.year && <span>{item.year}</span>}
          {item.year && language && <span className="text-white/25">•</span>}
          {language && <span>{language}</span>}
        </div>
      </div>
    </Link>
  );
}
