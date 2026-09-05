import Link from "next/link";
import Image from "next/image";
import { MovieDetail, SeriesDetail } from "@/lib/providers/types";
import { backdropUrl } from "@/lib/images";
import { getLanguageName } from "@/lib/config/languages";
import { formatRating, formatRuntime } from "@/lib/utils";
import { Poster } from "@/components/Poster";
import { PlayIcon, StarIcon } from "@/components/icons";
import { WatchlistButton } from "@/components/WatchlistButton";
import { TrailerButton } from "./TrailerButton";

export function DetailHero({ item }: { item: MovieDetail | SeriesDetail }) {
  const backdrop = backdropUrl(item.backdropPath, "w1280");
  const rating = formatRating(item.rating);
  const language = getLanguageName(item.language);
  const watchHref = `/watch/${item.type}/${item.id}`;

  const metaBits: string[] = [];
  if (item.year) metaBits.push(String(item.year));
  if (item.type === "movie" && item.runtime) {
    const r = formatRuntime(item.runtime);
    if (r) metaBits.push(r);
  }
  if (item.type === "tv") {
    const s = (item as SeriesDetail).numberOfSeasons;
    if (s) metaBits.push(`${s} Season${s > 1 ? "s" : ""}`);
  }
  if (language) metaBits.push(language);

  return (
    <section className="relative">
      {/* Backdrop */}
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden sm:h-[56vh]">
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
          <div className="h-full w-full bg-gradient-to-br from-ink-800 to-ink-950" />
        )}
        <div className="absolute inset-0 bg-hero-fade" />
      </div>

      {/* Content */}
      <div className="container-page relative -mt-40 pb-8 sm:-mt-48">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="relative aspect-[2/3] w-32 flex-none overflow-hidden rounded-2xl shadow-card ring-1 ring-white/10 sm:w-52">
            <Poster path={item.posterPath} alt={item.title} size="w500" priority />
          </div>

          <div className="min-w-0 flex-1">
            {item.genres.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {item.genres.slice(0, 4).map((g) => (
                  <Link
                    key={g.id}
                    href={`/genre/${slugForGenre(g.name)}`}
                    className="chip !py-0.5 !text-[11px]"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              {item.title}
            </h1>
            {item.originalTitle && (
              <p className="mt-1 text-sm text-white/50">{item.originalTitle}</p>
            )}
            {item.tagline && (
              <p className="mt-2 text-sm italic text-ray-200/80">
                “{item.tagline}”
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
              {rating && (
                <span className="inline-flex items-center gap-1 font-semibold text-ray-300">
                  <StarIcon className="text-ray-300" /> {rating}
                  {item.voteCount ? (
                    <span className="font-normal text-white/40">
                      ({item.voteCount.toLocaleString()})
                    </span>
                  ) : null}
                </span>
              )}
              {metaBits.map((b, i) => (
                <span key={i} className="text-white/60">
                  {b}
                </span>
              ))}
            </div>

            {item.overview && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                {item.overview}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={watchHref} className="btn-primary">
                <PlayIcon /> Watch Now
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
              <TrailerButton videos={item.videos} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function slugForGenre(name: string): string {
  return name.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-");
}
