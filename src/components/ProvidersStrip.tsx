import Link from "next/link";
import { PROVIDERS } from "@/lib/config/providers";
import { provider as mediaProvider } from "@/lib/providers";
import { providerLogoUrl } from "@/lib/images";

/**
 * "Explore across platforms" strip.
 *
 * Shows each platform's real logo (from TMDB's authorized watch-provider data,
 * served via image.tmdb.org) in a circle, with the name below on up to two
 * lines. Static — no auto-motion; the row scrolls horizontally if it overflows.
 * Falls back to a monogram badge when a logo isn't available.
 */
export async function ProvidersStrip() {
  const logos = mediaProvider.available
    ? await mediaProvider.getWatchProviderLogos("IN").catch(() => ({}))
    : {};

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
        {PROVIDERS.map((p) => {
          const logo = providerLogoUrl(
            (logos as Record<number, string>)[p.tmdbId],
            "w92",
          );
          return (
            <Link
              key={p.slug}
              href={`/provider/${p.slug}`}
              aria-label={`Explore ${p.name}`}
              className="group flex w-20 flex-none flex-col items-center gap-2 text-center focus:outline-none sm:w-24"
            >
              <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-white/15 transition group-hover:ring-2 group-hover:ring-ray-400 sm:h-[72px] sm:w-[72px]">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt={`${p.name} logo`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={`grid h-full w-full place-items-center bg-gradient-to-br ${p.tint} text-lg font-black text-white/80`}
                  >
                    {p.mono}
                  </span>
                )}
              </span>
              <span className="line-clamp-2 text-xs font-semibold leading-tight text-white/75 group-hover:text-white">
                {p.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
