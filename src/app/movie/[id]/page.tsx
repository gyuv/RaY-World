import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { provider } from "@/lib/providers";
import { ProviderError } from "@/lib/providers/types";
import { DetailHero } from "@/components/detail/DetailHero";
import { PageBackdrop } from "@/components/PageBackdrop";
import { backdropUrl } from "@/lib/images";
import { CastRow } from "@/components/detail/CastRow";
import { MediaRail } from "@/components/MediaRail";
import { ProviderNotice } from "@/components/ProviderNotice";

export const revalidate = 43200; // 12h (spec §19: medium/long detail cache)

async function load(id: string) {
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) return { detail: null, unavailable: false };
  try {
    return { detail: await provider.getMovie(numeric), unavailable: false };
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
  if (!detail) return { title: "Movie" };
  return {
    title: detail.title,
    description: detail.overview?.slice(0, 160),
  };
}

export default async function MoviePage({
  params,
}: {
  params: { id: string };
}) {
  const { detail, unavailable } = await load(params.id);
  if (unavailable) return <ProviderNotice reason="unconfigured" />;
  if (!detail) notFound();

  const director = detail.crew.find((c) => c.job === "Director");
  const writers = detail.crew
    .filter((c) => c.job === "Writer" || c.job === "Screenplay")
    .slice(0, 2);

  return (
    <div className="animate-fade-in">
      <PageBackdrop src={backdropUrl(detail.backdropPath, "w1280")} />
      <DetailHero item={detail} />

      <FactsBlock
        facts={[
          director && { label: "Director", value: director.name },
          writers.length > 0 && {
            label: "Writers",
            value: writers.map((w) => w.name).join(", "),
          },
          detail.status && { label: "Status", value: detail.status },
        ]}
      />

      <CastRow cast={detail.cast} />

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

type Fact = { label: string; value: string };

export function FactsBlock({
  facts,
}: {
  facts: Array<Fact | false | null | undefined | "">;
}) {
  const items = facts.filter(Boolean) as Fact[];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-2">
      <dl className="flex flex-wrap gap-x-10 gap-y-3">
        {items.map((f) => (
          <div key={f.label}>
            <dt className="text-xs uppercase tracking-wider text-white/40">
              {f.label}
            </dt>
            <dd className="text-sm font-medium text-white/85">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
