import { provider } from "@/lib/providers";
import { HOME_SECTIONS } from "@/lib/config/home-sections";
import { fetchHomeSections, pickHero } from "@/lib/catalog";
import { Hero } from "@/components/Hero";
import { MediaRail } from "@/components/MediaRail";
import { ProviderNotice } from "@/components/ProviderNotice";
import { ContinueWatchingRail } from "@/components/ContinueWatchingRail";
import { LanguageQuickNav } from "@/components/LanguageQuickNav";
import { ProvidersStrip } from "@/components/ProvidersStrip";
import { PageBackdrop } from "@/components/PageBackdrop";
import { backdropUrl } from "@/lib/images";

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

  // Hero comes from the first (Tamil trending) rail, Tamil-weighted.
  const heroPool = resolved.flatMap((r) => r.items).slice(0, 30);
  const hero = pickHero(heroPool);

  return (
    <div className="animate-fade-in">
      <PageBackdrop src={backdropUrl(hero?.backdropPath, "w1280")} />
      {hero && <Hero item={hero} />}

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
            items={items.filter((it) => it.id !== hero?.id)}
            priority={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
