import Link from "next/link";
import { PROVIDERS } from "@/lib/config/providers";
import { provider as mediaProvider } from "@/lib/providers";
import { ProviderLogo } from "@/components/ProviderLogo";

/**
 * "Explore across platforms" strip.
 *
 * Shows each platform's real logo from TMDB's authorized watch-provider data
 * (served via image.tmdb.org) in a circle, with the name below on up to two
 * lines. Static (no motion); the row scrolls horizontally if it overflows.
 * Falls back to a monogram badge when no logo is available.
 */
export async function ProvidersStrip() {
  const list = mediaProvider.available
    ? await mediaProvider.getWatchProviders("IN").catch(() => [])
    : [];

  return (
    <section className="container-page py-5">
      <div className="mb-3">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          Explore Across Platforms
        </h2>
        <p className="text-sm text-white/40">
          Availability varies by title and region.
        </p>
      </div>

      <div className="rail-scroll -mx-1 flex gap-5 overflow-x-auto px-1 pb-3 sm:gap-7">
        {PROVIDERS.map((p) => (
          <Link
            key={p.slug}
            href={`/provider/${p.slug}`}
            aria-label={`Explore ${p.name}`}
            className="group flex w-20 flex-none flex-col items-center gap-2 text-center focus:outline-none sm:w-24"
          >
            <ProviderLogo
              provider={p}
              list={list}
              className="h-16 w-16 transition group-hover:ring-2 group-hover:ring-ray-400 sm:h-[72px] sm:w-[72px]"
            />
            <span className="line-clamp-2 text-xs font-semibold leading-tight text-white/75 group-hover:text-white">
              {p.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
