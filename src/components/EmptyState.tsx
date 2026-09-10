import Link from "next/link";
import { FireIcon, FilmIcon, TvIcon, GridIcon } from "./icons";

interface EmptyStateProps {
  title?: string;
  message?: string;
  /** Show discovery links so users are never at a dead end (spec §30, §32). */
  showDiscovery?: boolean;
}

const DISCOVERY = [
  { href: "/trending", label: "Trending", Icon: FireIcon },
  { href: "/tamil", label: "Tamil Movies", Icon: FilmIcon },
  { href: "/series", label: "Popular Series", Icon: TvIcon },
  { href: "/browse", label: "Browse All", Icon: GridIcon },
];

export function EmptyState({
  title = "Nothing here yet",
  message = "We couldn't find anything to show, but there's plenty more to explore.",
  showDiscovery = true,
}: EmptyStateProps) {
  return (
    <div className="glass mx-auto max-w-xl p-8 text-center sm:p-12">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ray-gradient/20">
        <span className="grid h-full w-full place-items-center rounded-2xl bg-ink-900 text-2xl">
          🎬
        </span>
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-white/60">{message}</p>

      {showDiscovery && (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/40">
            Try exploring
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {DISCOVERY.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="chip">
                <Icon className="text-sm" />
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
