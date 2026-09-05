import type { Metadata } from "next";
import { Suspense } from "react";
import { provider } from "@/lib/providers";
import { parseBrowseParams, runBrowse, browseHref } from "@/lib/browse";
import { getLanguageName } from "@/lib/config/languages";
import { getGenre } from "@/lib/config/genres";
import { FilterPanel } from "@/components/browse/FilterPanel";
import { MediaGrid } from "@/components/MediaGrid";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { ProviderNotice } from "@/components/ProviderNotice";

export const metadata: Metadata = {
  title: "Browse",
  description:
    "Browse the entire RaY-World catalog. Filter by type, language, genre, year and rating.",
};

export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

function describe(p: ReturnType<typeof parseBrowseParams>): string {
  const bits: string[] = [];
  if (p.language) bits.push(getLanguageName(p.language) ?? p.language);
  if (p.genre) bits.push(getGenre(p.genre)?.name ?? p.genre);
  bits.push(p.type === "tv" ? "Series" : p.type === "movie" ? "Movies" : "Titles");
  return bits.join(" ");
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SP;
}) {
  if (!provider.available) return <ProviderNotice reason="unconfigured" />;

  const params = parseBrowseParams(searchParams);
  const data = await runBrowse(params);
  const heading = describe(params);

  return (
    <div className="container-page py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Browse {heading}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {data.totalResults > 0
            ? `${data.totalResults.toLocaleString()} titles across the catalog`
            : "Filter the full catalog by type, language, genre, year and rating."}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={<div className="hidden lg:block" />}>
          <FilterPanel />
        </Suspense>

        <div>
          {data.results.length > 0 ? (
            <>
              <MediaGrid items={data.results} />
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                makeHref={(page) => browseHref("/browse", params, { page })}
              />
            </>
          ) : (
            <EmptyState
              title="No titles match these filters"
              message="Try widening your filters — remove a genre or year, or switch language."
            />
          )}
        </div>
      </div>
    </div>
  );
}
