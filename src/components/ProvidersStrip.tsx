import Link from "next/link";
import { PROVIDERS } from "@/lib/config/providers";

/**
 * Decorative "explore across platforms" strip for the homepage.
 *
 * Original, stylised monogram badges (a tinted tile + the platform name)
 * rendered semi-transparently — NOT the platforms' real logos, and no
 * affiliation is implied. Each links to that platform's discovery page, which
 * organises real TMDB "where to watch" data. Availability varies by region.
 */
export function ProvidersStrip() {
  // Two copies for a seamless marquee loop.
  const row = [...PROVIDERS, ...PROVIDERS];

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

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-850/40 py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink-950 to-transparent" />

        <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-3 group-hover:[animation-play-state:paused]">
          {row.map((p, i) => (
            <Link
              key={`${p.slug}-${i}`}
              href={`/provider/${p.slug}`}
              aria-label={`Explore ${p.name}`}
              className="flex flex-none items-center gap-3 rounded-xl border border-white/10 px-4 py-2.5 opacity-50 transition hover:opacity-100 focus-visible:opacity-100"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${p.tint} text-sm font-black text-white/70`}
              >
                {p.mono}
              </span>
              <span className="whitespace-nowrap text-sm font-semibold text-white/70">
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
