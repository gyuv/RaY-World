import type { Metadata } from "next";
import Link from "next/link";
import { provider } from "@/lib/providers";
import { MediaGrid } from "@/components/MediaGrid";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { ProviderNotice } from "@/components/ProviderNotice";
import { rankMedia } from "@/lib/ranking";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trending",
  description: "What's trending now across movies and series on RaY-World.",
};
export const revalidate = 1800;

type SP = Record<string, string | string[] | undefined>;

const TABS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

export default async function TrendingPage({ searchParams }: { searchParams: SP }) {
  if (!provider.available) return <ProviderNotice reason="unconfigured" />;

  const rawType = typeof searchParams.type === "string" ? searchParams.type : "all";
  const type = (["all", "movie", "tv"].includes(rawType) ? rawType : "all") as
    | "all"
    | "movie"
    | "tv";
  const page = Math.max(1, Number(searchParams.page) || 1);

  let results = [] as Awaited<ReturnType<typeof provider.getTrending>>["results"];
  let totalPages = 1;
  try {
    const data = await provider.getTrending({ type, window: "week", page });
    // Tamil-leaning presentation on the default homepage-adjacent surface.
    results = rankMedia(
      data.results.filter((m) => m.posterPath),
      { preferLanguage: "ta", weights: { language: 0.2 } },
    );
    totalPages = data.totalPages;
  } catch {
    return <ProviderNotice reason="upstream" />;
  }

  const hrefFor = (t: string) =>
    t === "all" ? "/trending" : `/trending?type=${t}`;

  return (
    <div className="container-page py-8">
      <header className="mb-5">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Trending This Week
        </h1>
        <p className="mt-1 text-sm text-white/50">
          The most popular titles right now.
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={hrefFor(t.value)}
            className={cn("chip", type === t.value && "chip-active")}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {results.length > 0 ? (
        <>
          <MediaGrid items={results} />
          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) =>
              type === "all"
                ? `/trending?page=${p}`
                : `/trending?type=${type}&page=${p}`
            }
          />
        </>
      ) : (
        <EmptyState title="Nothing trending right now" />
      )}
    </div>
  );
}
