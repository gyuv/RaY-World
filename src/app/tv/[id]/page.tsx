import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { provider } from "@/lib/providers";
import { ProviderError } from "@/lib/providers/types";
import { DetailHero } from "@/components/detail/DetailHero";
import { PageBackdrop } from "@/components/PageBackdrop";
import { CastRow } from "@/components/detail/CastRow";
import { TrailersRow } from "@/components/detail/TrailersRow";
import { WatchProviders } from "@/components/detail/WatchProviders";
import { MediaRail } from "@/components/MediaRail";
import { ProviderNotice } from "@/components/ProviderNotice";
import { FactsBlock } from "@/app/movie/[id]/page";
import { posterUrl, backdropUrl } from "@/lib/images";

export const revalidate = 43200;

async function load(id: string) {
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) return { detail: null, unavailable: false };
  try {
    return { detail: await provider.getSeries(numeric), unavailable: false };
  } catch (err) {
    if (err instanceof ProviderError && err.kind === "unconfigured") {
      return { detail: null, unavailable: true };
    }
    return { detail: null, unavailable: false };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { detail } = await load(params.id);
  if (!detail) return { title: "Series" };
  return { title: detail.title, description: detail.overview?.slice(0, 160) };
}

export default async function TvPage({ params }: { params: { id: string } }) {
  const { detail, unavailable } = await load(params.id);
  if (unavailable) return <ProviderNotice reason="unconfigured" />;
  if (!detail) notFound();

  const seasons = detail.seasons.filter((s) => s.seasonNumber > 0);

  return (
    <div className="animate-fade-in">
      <PageBackdrop src={backdropUrl(detail.backdropPath, "w1280")} />
      <DetailHero item={detail} />

      <FactsBlock
        facts={[
          detail.creators.length > 0 && {
            label: "Created by",
            value: detail.creators.map((c) => c.name).join(", "),
          },
          detail.numberOfEpisodes != null && {
            label: "Episodes",
            value: String(detail.numberOfEpisodes),
          },
          detail.status && { label: "Status", value: detail.status },
        ]}
      />

      {seasons.length > 0 && (
        <section className="container-page py-6">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Seasons</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {seasons.map((s) => {
              const img = posterUrl(s.posterPath, "w342");
              return (
                <Link
                  key={s.id}
                  href={`/watch/tv/${detail.id}?season=${s.seasonNumber}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/5 transition group-hover:ring-ray-400/40">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={s.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-3xl">
                        📺
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm font-semibold">
                    {s.name}
                  </p>
                  <p className="text-xs text-white/45">
                    {s.episodeCount} episodes
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <WatchProviders data={detail.watchProviders} />

      <CastRow cast={detail.cast} />

      <TrailersRow videos={detail.videos} />

      {detail.recommendations.length > 0 && (
        <MediaRail
          title="Recommended"
          items={detail.recommendations.filter((m) => m.posterPath).slice(0, 20)}
        />
      )}
      {detail.similar.length > 0 && (
        <MediaRail
          title="More Like This"
          items={detail.similar.filter((m) => m.posterPath).slice(0, 20)}
        />
      )}
    </div>
  );
}
