import Link from "next/link";

/**
 * Decorative "explore across platforms" strip for the homepage.
 *
 * These are original, stylised monogram badges (a tinted tile + the platform
 * name) rendered semi-transparently — NOT the platforms' real logos, and no
 * affiliation is implied. Availability of any title varies by region/provider;
 * this is a discovery cue, not a claim of what streams here.
 */

interface Provider {
  name: string;
  mono: string;
  tint: string;
}

const PROVIDERS: Provider[] = [
  { name: "Netflix", mono: "N", tint: "from-rose-500/30 to-rose-700/20" },
  { name: "Prime Video", mono: "P", tint: "from-sky-500/30 to-sky-700/20" },
  { name: "Disney+ Hotstar", mono: "D", tint: "from-indigo-500/30 to-indigo-700/20" },
  { name: "Sun NXT", mono: "S", tint: "from-amber-500/30 to-orange-700/20" },
  { name: "aha", mono: "a", tint: "from-orange-500/30 to-red-700/20" },
  { name: "ZEE5", mono: "Z", tint: "from-fuchsia-500/30 to-purple-700/20" },
  { name: "SonyLIV", mono: "L", tint: "from-blue-500/30 to-blue-800/20" },
  { name: "JioCinema", mono: "J", tint: "from-pink-500/30 to-rose-700/20" },
  { name: "Apple TV+", mono: "TV", tint: "from-zinc-400/30 to-zinc-700/20" },
  { name: "YouTube", mono: "Y", tint: "from-red-500/30 to-red-800/20" },
];

export function ProvidersStrip() {
  // Two copies for a seamless marquee loop.
  const row = [...PROVIDERS, ...PROVIDERS];

  return (
    <section className="container-page py-5">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            Explore Across Platforms
          </h2>
          <p className="text-sm text-white/40">
            Availability varies by title and region.
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-850/40 py-4">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink-950 to-transparent" />

        <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-3 group-hover:[animation-play-state:paused]">
          {row.map((p, i) => (
            <Link
              key={`${p.name}-${i}`}
              href={`/browse`}
              aria-label={`Explore titles — ${p.name}`}
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
