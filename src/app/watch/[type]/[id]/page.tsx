import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { provider } from "@/lib/providers";
import { ProviderError, SeriesDetail } from "@/lib/providers/types";
import { WatchPlayer } from "@/components/watch/WatchPlayer";
import { HistoryTracker } from "@/components/watch/HistoryTracker";
import { getStreamSource } from "@/lib/stream";
import { MediaRail } from "@/components/MediaRail";
import { ProviderNotice } from "@/components/ProviderNotice";
import { EmptyState } from "@/components/EmptyState";
import { getLanguageName } from "@/lib/config/languages";
import { formatRating, formatRuntime, cn } from "@/lib/utils";
import { stillUrl } from "@/lib/images";
import { PlayIcon, ChevronRight } from "@/components/icons";

export const revalidate = 43200;

type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: { type: string; id: string };
}): Promise<Metadata> {
  const title = params.type === "tv" ? "Watch Series" : "Watch";
  return { title };
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { type: string; id: string };
  searchParams: SP;
}) {
  const { type, id } = params;
  if (type !== "movie" && type !== "tv") notFound();
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) notFound();

  try {
    if (type === "movie") {
      const detail = await provider.getMovie(numeric);
      if (!detail) notFound();
      const stream = await getStreamSource("movie", detail.id);
      return (
        <div className="animate-fade-in">
          <HistoryTracker
            entry={{
              id: detail.id,
              type: "movie",
              title: detail.title,
              posterPath: detail.posterPath,
              backdropPath: detail.backdropPath,
            }}
          />
          <div className="container-page py-6">
            <WatchPlayer
              title={detail.title}
              backdropPath={detail.backdropPath}
              videos={detail.videos}
              source={stream}
            />
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  {detail.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-white/60">
                  {detail.year && <span>{detail.year}</span>}
                  {formatRuntime(detail.runtime) && (
                    <span>{formatRuntime(detail.runtime)}</span>
                  )}
                  {getLanguageName(detail.language) && (
                    <span>{getLanguageName(detail.language)}</span>
                  )}
                  {formatRating(detail.rating) && (
                    <span className="text-ray-300">★ {formatRating(detail.rating)}</span>
                  )}
                </div>
              </div>
              <Link href={`/movie/${detail.id}`} className="btn-outline">
                Details
              </Link>
            </div>
            {detail.overview && (
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70">
                {detail.overview}
              </p>
            )}
          </div>

          {detail.recommendations.length > 0 && (
            <MediaRail
              title="Related"
              items={detail.recommendations.filter((m) => m.posterPath).slice(0, 20)}
            />
          )}
        </div>
      );
    }

    // TV
    const detail = await provider.getSeries(numeric);
    if (!detail) notFound();
    return <TvWatch detail={detail} searchParams={searchParams} />;
  } catch (err) {
    if (err instanceof ProviderError && err.kind === "unconfigured") {
      return <ProviderNotice reason="unconfigured" />;
    }
    if (err instanceof ProviderError) {
      return <ProviderNotice reason="upstream" />;
    }
    throw err;
  }
}

async function TvWatch({
  detail,
  searchParams,
}: {
  detail: SeriesDetail;
  searchParams: SP;
}) {
  const seasons = detail.seasons.filter((s) => s.seasonNumber > 0);
  const firstSeason = seasons[0]?.seasonNumber ?? 1;
  const seasonNumber = Math.max(
    1,
    Number(searchParams.season) || firstSeason,
  );

  const episodes = await provider.getSeason(detail.id, seasonNumber);
  const episodeNumber = Number(searchParams.episode) || episodes[0]?.episodeNumber || 1;
  const current =
    episodes.find((e) => e.episodeNumber === episodeNumber) ?? episodes[0];

  const nextEpisode = current
    ? episodes.find((e) => e.episodeNumber === current.episodeNumber + 1)
    : undefined;

  const stream = await getStreamSource(
    "tv",
    detail.id,
    seasonNumber,
    current?.episodeNumber,
  );

  return (
    <div className="animate-fade-in">
      {current && (
        <HistoryTracker
          entry={{
            id: detail.id,
            type: "tv",
            title: detail.title,
            posterPath: detail.posterPath,
            backdropPath: detail.backdropPath,
            seasonNumber,
            episodeNumber: current.episodeNumber,
          }}
        />
      )}

      <div className="container-page py-6">
        <WatchPlayer
          title={detail.title}
          backdropPath={detail.backdropPath}
          stillPath={current?.stillPath}
          videos={detail.videos}
          source={stream}
        />

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">{detail.title}</p>
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              S{seasonNumber} · E{current?.episodeNumber ?? "—"}
              {current?.name ? `: ${current.name}` : ""}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/tv/${detail.id}`} className="btn-outline">
              Details
            </Link>
            {nextEpisode && (
              <Link
                href={`/watch/tv/${detail.id}?season=${seasonNumber}&episode=${nextEpisode.episodeNumber}`}
                className="btn-primary"
              >
                Next <ChevronRight />
              </Link>
            )}
          </div>
        </div>

        {current?.overview && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70">
            {current.overview}
          </p>
        )}

        {/* Season selector */}
        {seasons.length > 1 && (
          <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
            {seasons.map((s) => (
              <Link
                key={s.id}
                href={`/watch/tv/${detail.id}?season=${s.seasonNumber}`}
                className={cn(
                  "chip flex-none",
                  s.seasonNumber === seasonNumber && "chip-active",
                )}
              >
                {s.name}
              </Link>
            ))}
          </div>
        )}

        {/* Episode list */}
        <div className="mt-4 space-y-2">
          {episodes.length === 0 ? (
            <EmptyState
              title="Episodes coming soon"
              message="Episode information for this season isn't available yet."
              showDiscovery={false}
            />
          ) : (
            episodes.map((ep) => {
              const active = ep.episodeNumber === current?.episodeNumber;
              const still = stillUrl(ep.stillPath, "w300");
              return (
                <Link
                  key={ep.id}
                  href={`/watch/tv/${detail.id}?season=${seasonNumber}&episode=${ep.episodeNumber}`}
                  className={cn(
                    "flex gap-4 rounded-2xl border p-3 transition",
                    active
                      ? "border-ray-400/50 bg-white/5"
                      : "border-white/10 hover:border-white/25 hover:bg-white/5",
                  )}
                >
                  <div className="relative aspect-video w-32 flex-none overflow-hidden rounded-lg bg-ink-800 sm:w-44">
                    {still ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={still}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-white/20">
                        <PlayIcon />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white/40">
                        {ep.episodeNumber}
                      </span>
                      <h3 className="truncate text-sm font-semibold text-white/90">
                        {ep.name}
                      </h3>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-white/45">
                      {ep.airDate && <span>{ep.airDate}</span>}
                      {formatRuntime(ep.runtime) && (
                        <span>{formatRuntime(ep.runtime)}</span>
                      )}
                    </div>
                    {ep.overview && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/55">
                        {ep.overview}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {detail.recommendations.length > 0 && (
        <MediaRail
          title="Related"
          items={detail.recommendations.filter((m) => m.posterPath).slice(0, 20)}
        />
      )}
    </div>
  );
}
