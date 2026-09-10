import Link from "next/link";
import Image from "next/image";
import { MediaItem } from "@/lib/providers/types";
import { backdropUrl } from "@/lib/images";
import { getLanguageName } from "@/lib/config/languages";
import { getGenreName } from "@/lib/config/genres";
import { formatRating } from "@/lib/utils";
import { PlayIcon } from "./icons";
import { WatchlistButton } from "./WatchlistButton";

export function Hero({ item }: { item: MediaItem }) {
  const backdrop = backdropUrl(item.backdropPath, "w1280");
  const detailHref = `/${item.type}/${item.id}`;
  const watchHref = `/watch/${item.type}/${item.id}`;
  const language = getLanguageName(item.language);
  const rating = formatRating(item.rating);
  const genres = item.genreIds
    .map((id) => getGenreName(id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <section className="relative -mt-16 sm:-mt-20">
      <div className="relative h-[62vh] min-h-[440px] w-full overflow-hidden sm:h-[68vh]">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink-800 via-ink-850 to-ink-950" />
        )}
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 bg-side-fade" />
      </div>

      <div className="container-page absolute inset-x-0 bottom-0">
        <div className="max-w-2xl pb-10 sm:pb-16">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            <span className="rounded-full bg-ray-gradient px-2.5 py-1 text-ink-950">
              Featured
            </span>
            {item.type === "tv" ? "Series" : "Movie"}
            {language && <span className="text-white/40">•</span>}
            {language && <span>{language}</span>}
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow sm:text-5xl">
            {item.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            {item.year && <span>{item.year}</span>}
            {rating && (
              <span className="text-ray-300">★ {rating}</span>
            )}
            {genres.length > 0 && (
              <span className="text-white/50">{genres.join(" · ")}</span>
            )}
          </div>

          {item.overview && (
            <p className="mt-4 line-clamp-3 max-w-xl text-sm text-white/75 sm:text-base">
              {item.overview}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={watchHref} className="btn-primary">
              <PlayIcon /> Watch Now
            </Link>
            <Link href={detailHref} className="btn-ghost">
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
      </div>
    </section>
  );
}
