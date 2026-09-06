import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { provider as mediaProvider } from "@/lib/providers";
import { PROVIDERS, getProvider } from "@/lib/config/providers";
import { GENRES } from "@/lib/config/genres";
import { discoverRail } from "@/lib/catalog";
import { MediaRail } from "@/components/MediaRail";
import { TopTenRail } from "@/components/TopTenRail";
import { EmptyState } from "@/components/EmptyState";
import { ProviderNotice } from "@/components/ProviderNotice";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const p = getProvider(params.slug);
  if (!p) return { title: "Provider" };
  return {
    title: `${p.name} — What to Watch`,
    description: `Discover what to watch on ${p.name}: new releases, top 10 in India, popular titles and picks by genre. Availability varies by region.`,
  };
}

const RAIL_GENRES = ["action", "comedy", "drama", "thriller", "romance", "crime"];

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SP;
}) {
  const p = getProvider(params.slug);
  if (!p) notFound();
  if (!mediaProvider.available) return <ProviderNotice reason="unconfigured" />;

  const type: "movie" | "tv" =
    searchParams.type === "tv" ? "tv" : "movie";
  const kindLabel = type === "tv" ? "Shows" : "Movies";

  const base = { type, watchProvider: p.tmdbId, watchRegion: p.region } as const;

  // Build all rails in parallel; each never throws.
  const [topTenTamil, latest, popular, topRated, ...genreRails] =
    await Promise.all([
      discoverRail({ ...base, language: "ta", sort: "popular" }, 10),
      discoverRail({ ...base, sort: "latest" }),
      discoverRail({ ...base, sort: "popular" }),
      discoverRail({ ...base, sort: "top_rated" }),
      ...RAIL_GENRES.map((g) =>
        discoverRail({ ...base, genreSlug: g, sort: "popular" }),
      ),
    ]);

  const genreSections = RAIL_GENRES.map((slug, i) => ({
    slug,
    name: GENRES.find((g) => g.slug === slug)?.name ?? slug,
    items: genreRails[i],
  })).filter((s) => s.items.length >= 5);

  const hasAnything =
    topTenTamil.length + latest.length + popular.length + topRated.length +
      genreSections.length >
    0;

  return (
    <div className="animate-fade-in">
      {/* Provider header */}
      <header className="border-b border-white/10 bg-ink-900/40">
        <div className="container-page py-8 sm:py-10">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "grid h-16 w-16 flex-none place-items-center rounded-2xl bg-gradient-to-br text-2xl font-black text-white/80 ring-1 ring-white/10 sm:h-20 sm:w-20 sm:text-3xl",
                p.tint,
              )}
            >
              {p.mono}
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl tv:text-5xl">
                {p.name}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-white/55 sm:text-base">
                {p.tagline}
              </p>
            </div>
          </div>

          {/* Movies | Shows toggle */}
          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-ink-850/60 p-1">
            {(["movie", "tv"] as const).map((t) => (
              <Link
                key={t}
                href={`/provider/${p.slug}?type=${t}`}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-semibold transition",
                  type === t
                    ? "bg-ray-gradient text-ink-950 shadow-glow"
                    : "text-white/70 hover:text-white",
                )}
              >
                {t === "movie" ? "Movies" : "TV Shows"}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {!hasAnything ? (
        <div className="container-page py-12">
          <EmptyState
            title={`No ${kindLabel.toLowerCase()} to show for ${p.name} yet`}
            message="Availability data for this platform/region isn't available right now. Explore more below."
          />
        </div>
      ) : (
        <div className="space-y-2 py-4">
          {topTenTamil.length >= 5 && (
            <TopTenRail
              title="Top 10 in India Today"
              accent="Tamil"
              items={topTenTamil}
            />
          )}
          {latest.length >= 4 && (
            <MediaRail title={`New on ${p.name}`} items={latest} priority />
          )}
          {popular.length >= 4 && (
            <MediaRail title={`Popular on ${p.name}`} items={popular} />
          )}
          {topRated.length >= 4 && (
            <MediaRail title={`Top Rated on ${p.name}`} items={topRated} />
          )}
          {genreSections.map((s) => (
            <MediaRail
              key={s.slug}
              title={`${s.name} ${kindLabel}`}
              href={`/genre/${s.slug}`}
              items={s.items}
            />
          ))}
        </div>
      )}
    </div>
  );
}
