import type { Metadata } from "next";
import Link from "next/link";
import { runSearch } from "@/lib/search";
import { provider } from "@/lib/providers";
import { MediaGrid } from "@/components/MediaGrid";
import { PeopleStrip } from "@/components/PeopleStrip";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { ProviderNotice } from "@/components/ProviderNotice";
import { SearchBox } from "@/components/SearchBox";

type SP = Record<string, string | string[] | undefined>;

export function generateMetadata({ searchParams }: { searchParams: SP }): Metadata {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  return {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Search results for "${q}" across the RaY-World catalog.`
      : "Search movies, series, actors and directors across every language.",
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  if (!provider.available) return <ProviderNotice reason="unconfigured" />;

  const results = q ? await runSearch(q, page) : null;

  return (
    <div className="container-page py-8">
      <div className="mx-auto mb-8 max-w-2xl">
        <SearchBox autoFocus />
      </div>

      {!q && (
        <EmptyState
          title="Search RaY-World"
          message="Find any movie, series, actor or director — across Tamil, English and every other language."
        />
      )}

      {q && results?.unavailable && <ProviderNotice reason="upstream" />}

      {q && results && !results.unavailable && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Results for “{q}”
            </h1>
            {results.media.length > 0 && (
              <p className="mt-1 text-sm text-white/50">
                {results.totalResults > 0
                  ? `${results.totalResults.toLocaleString()} matches`
                  : `${results.media.length} matches`}
                {results.approximate && " • showing the closest matches"}
              </p>
            )}
          </div>

          <PeopleStrip people={results.people} />

          {results.media.length > 0 ? (
            <>
              <MediaGrid items={results.media} />
              <Pagination
                page={results.page}
                totalPages={results.totalPages}
                makeHref={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`}
              />
            </>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-ink-850/60 p-6 text-center">
                <p className="text-lg font-semibold">
                  No exact matches found for “{q}”
                </p>
                <p className="mt-1 text-sm text-white/55">
                  Try another spelling, or explore these instead:
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link href="/tamil" className="chip">Browse Tamil Movies</Link>
                  <Link href="/series" className="chip">Browse Tamil Series</Link>
                  <Link href="/trending" className="chip">Browse Trending</Link>
                  <Link href="/browse" className="chip">Browse Popular</Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
