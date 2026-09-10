import { provider } from "@/lib/providers";
import { HOME_SECTIONS } from "@/lib/config/home-sections";
import { fetchHomeSections } from "@/lib/catalog";
import { rankMedia } from "@/lib/ranking";
import { unique } from "@/lib/utils";
import { HeroShowcase, FeaturedItem } from "@/components/HeroShowcase";
import { MediaRail } from "@/components/MediaRail";
import { ProviderNotice } from "@/components/ProviderNotice";
import { ContinueWatchingRail } from "@/components/ContinueWatchingRail";
import { LanguageQuickNav } from "@/components/LanguageQuickNav";
import { ProvidersStrip } from "@/components/ProvidersStrip";

// Revalidate the homepage feed periodically (spec §19: long cache for feeds).
export const revalidate = 3600;

export default async function HomePage() {
  if (!provider.available) {
    return <ProviderNotice reason="unconfigured" />;
  }

  const resolved = await fetchHomeSections(HOME_SECTIONS);

  if (resolved.length === 0) {
    return <ProviderNotice reason="upstream" />;
  }

  // Build the rotating featured set: Tamil-weighted, needs backdrop + overview.
  // Fetch each one's detail (cached) to get the official title-logo artwork.
  const pool = unique(
    resolved.flatMap((r) => r.items).filter((i) => i.backdropPath && i.overview),
    (i) => `${i.type}:${i.id}`,
  );
  const candidates = rankMedia(pool, {
    preferLanguage: "ta",
    weights: { language: 0.5 },
  }).slice(0, 6);

  const featured = (
    await Promise.all(
      candidates.map(async (c): Promise<FeaturedItem | null> => {
        try {
          const d =
            c.type === "movie"
              ? await provider.getMovie(c.id)
              : await provider.getSeries(c.id);
          if (!d) return null;
          return {
            id: d.id,
            type: d.type,
            title: d.title,
            overview: d.overview,
            backdropPath: d.backdropPath,
            posterPath: d.posterPath,
            titleLogoPath: d.titleLogoPath,
            year: d.year,
            rating: d.rating,
            genreIds: d.genreIds,
          };
        } catch {
          return null;
        }
      }),
    )
  ).filter((x): x is FeaturedItem => x !== null).slice(0, 5);

  const featuredIds = new Set(featured.map((f) => `${f.type}:${f.id}`));

  return (
    <div className="animate-fade-in">
      {featured.length > 0 && <HeroShowcase items={featured} />}

      <div className="relative z-10 -mt-6 space-y-2">
        <ContinueWatchingRail />
        <LanguageQuickNav />
        <ProvidersStrip />

        {resolved.map(({ section, items }, i) => (
          <MediaRail
            key={section.id}
            title={section.title}
            accent={section.accent}
            href={section.href}
            items={items.filter(
              (it) => !featuredIds.has(`${it.type}:${it.id}`),
            )}
            priority={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
