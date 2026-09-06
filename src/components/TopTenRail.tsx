import Link from "next/link";
import { MediaItem } from "@/lib/providers/types";
import { Poster } from "./Poster";
import { RatingBadge } from "./RatingBadge";

/**
 * Top 10 rail with large rank numerals behind each poster (streaming-app style).
 */
export function TopTenRail({
  title,
  accent,
  items,
}: {
  title: string;
  accent?: string;
  items: MediaItem[];
}) {
  const top = items.slice(0, 10);
  if (top.length === 0) return null;

  return (
    <section className="container-page py-4">
      <div className="mb-3">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
        {accent && (
          <p className="text-sm text-white/40" lang="ta">
            {accent}
          </p>
        )}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:gap-4">
        {top.map((item, i) => (
          <Link
            key={`${item.type}:${item.id}`}
            href={`/${item.type}/${item.id}`}
            className="group relative flex flex-none items-end focus:outline-none"
            aria-label={`#${i + 1} ${item.title}`}
          >
            {/* Big rank numeral */}
            <span
              aria-hidden
              className="select-none font-display text-[110px] font-black leading-[0.75] tracking-tighter text-transparent sm:text-[150px] tv:text-[190px]"
              style={{
                WebkitTextStroke: "2px rgba(255,215,94,0.55)",
              }}
            >
              {i + 1}
            </span>

            {/* Poster */}
            <div className="relative -ml-6 aspect-[2/3] w-[110px] flex-none overflow-hidden rounded-xl bg-ink-800 shadow-card ring-1 ring-white/5 transition group-hover:ring-ray-400/40 sm:w-[130px] tv:w-[170px]">
              <Poster path={item.posterPath} alt={item.title} size="w342" />
              <div className="absolute right-1.5 top-1.5">
                <RatingBadge rating={item.rating} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
