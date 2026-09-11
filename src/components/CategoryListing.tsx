import { Suspense } from "react";
import { provider } from "@/lib/providers";
import { BrowseParams, parseBrowseParams, runBrowse } from "@/lib/browse";
import { MediaGrid } from "./MediaGrid";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { ProviderNotice } from "./ProviderNotice";
import { SortTabs } from "./SortTabs";
import { BrowseFilters } from "./BrowseFilters";

type SP = Record<string, string | string[] | undefined>;

function categoryHref(
  basePath: string,
  params: BrowseParams,
  page: number,
): string {
  const q = new URLSearchParams();
  if (params.language) q.set("language", params.language);
  if (params.genre) q.set("genre", params.genre);
  if (params.sort && params.sort !== "popular") q.set("sort", params.sort);
  if (page > 1) q.set("page", String(page));
  const qs = q.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

interface CategoryListingProps {
  title: string;
  subtitle?: string;
  accent?: string;
  basePath: string;
  /** Forced params that define this category (language, genre, type…). */
  base: Partial<BrowseParams>;
  searchParams: SP;
  showSort?: boolean;
  /** Show the full language/genre/sort filter bar (Movies & Series pages). */
  showFilters?: boolean;
  /** Sort used when the URL has no explicit sort (e.g. "latest"). */
  defaultSort?: BrowseParams["sort"];
}

/**
 * Reusable catalog listing behind every category route (spec §27: generated
 * from shared logic, not duplicated page implementations).
 */
export async function CategoryListing({
  title,
  subtitle,
  accent,
  basePath,
  base,
  searchParams,
  showSort = true,
  showFilters = false,
  defaultSort,
}: CategoryListingProps) {
  if (!provider.available) return <ProviderNotice reason="unconfigured" />;

  // Merge forced category params with the user's sort/page from the URL.
  const parsed = parseBrowseParams(searchParams);
  // Use `defaultSort` when the user hasn't picked a sort in the URL, so pages
  // like Movies/Series can default to "latest" while still honouring a choice.
  const sortInUrl = typeof searchParams.sort === "string" && searchParams.sort.length > 0;
  const params: BrowseParams = {
    ...parsed,
    ...base,
    type: base.type ?? parsed.type,
    sort: base.sort ?? (sortInUrl ? parsed.sort : defaultSort ?? parsed.sort),
  } as BrowseParams;

  const data = await runBrowse(params);

  return (
    <div className="container-page py-8">
      <header className="mb-5">
        {accent && (
          <p className="text-sm text-white/40" lang="ta">
            {accent}
          </p>
        )}
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </header>

      {showFilters ? (
        <div className="relative z-30 mb-6">
          <Suspense fallback={null}>
            <BrowseFilters defaultSort={defaultSort} />
          </Suspense>
        </div>
      ) : (
        showSort && (
          <div className="mb-6">
            <Suspense fallback={null}>
              <SortTabs />
            </Suspense>
          </div>
        )
      )}

      {data.results.length > 0 ? (
        <>
          <MediaGrid items={data.results} />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            makeHref={(page) => categoryHref(basePath, params, page)}
          />
        </>
      ) : (
        <EmptyState
          title={`No ${title} yet`}
          message="There's nothing to show here right now — explore another path below."
        />
      )}
    </div>
  );
}
