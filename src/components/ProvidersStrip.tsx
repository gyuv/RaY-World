import Link from "next/link";
import { PROVIDERS } from "@/lib/config/providers";
import { provider as mediaProvider } from "@/lib/providers";
import { WatchProviderInfo } from "@/lib/providers/types";
import { providerLogoUrl } from "@/lib/images";

/**
 * "Explore across platforms" strip.
 *
 * Shows each platform's real logo from TMDB's authorized watch-provider data
 * (served via image.tmdb.org) in a circle, with the name below on up to two
 * lines. Logos resolve by TMDB id first, then by name/alias — so platforms
 * whose ids drift (e.g. Hotstar → JioHotstar, JioCinema) still find a logo.
 * Static (no motion); the row scrolls horizontally if it overflows. Falls back
 * to a monogram badge when no logo is available.
 */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function resolveLogo(
  tmdbId: number,
  name: string,
  aliases: string[] | undefined,
  list: WatchProviderInfo[],
): string | null {
  const byId = list.find((w) => w.id === tmdbId);
  if (byId) return byId.logoPath;

  const needles = [name, ...(aliases ?? [])].map(norm).filter(Boolean);
  const match = list.find((w) => {
    const wn = norm(w.name);
    return needles.some((n) => wn.includes(n) || n.includes(wn));
  });
  return match?.logoPath ?? null;
}

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
        {PROVIDERS.map((p) => {
          const logo = providerLogoUrl(
            resolveLogo(p.tmdbId, p.name, p.aliases, list),
            "w92",
          );
          return (
            <Link
              key={p.slug}
              href={`/provider/${p.slug}`}
              aria-label={`Explore ${p.name}`}
              className="group flex w-20 flex-none flex-col items-center gap-2 text-center focus:outline-none sm:w-24"
            >
              <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white p-2 ring-1 ring-white/15 transition group-hover:ring-2 group-hover:ring-ray-400 sm:h-[72px] sm:w-[72px]">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt={`${p.name} logo`}
                    className="h-full w-full rounded-lg object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={`grid h-full w-full place-items-center rounded-full bg-gradient-to-br ${p.tint} text-lg font-black text-white/80`}
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
