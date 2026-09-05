import { Suspense } from "react";
import { provider } from "@/lib/providers";
import { BrowseParams, parseBrowseParams, runBrowse } from "@/lib/browse";
import { MediaGrid } from "./MediaGrid";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { ProviderNotice } from "./ProviderNotice";
import { SortTabs } from "./SortTabs";

type SP = Record<string, string | string[] | undefined>;

function categoryHref(basePath: string, sort: string, page: number): string {
  const q = new URLSearchParams();
  if (sort && sort !== "popular") q.set("sort", sort);
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
}: CategoryListingProps) {
  if (!provider.available) return <ProviderNotice reason="unconfigured" />;

  // Merge forced category params with the user's sort/page from the URL.
  const parsed = parseBrowseParams(searchParams);
  const params: BrowseParams = {
    ...parsed,
    ...base,
    type: base.type ?? parsed.type,
    sort: base.sort ?? parsed.sort,
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

      {showSort && (
        <div className="mb-6">
          <Suspense fallback={null}>
            <SortTabs />
          </Suspense>
        </div>
      )}

      {data.results.length > 0 ? (
        <>
          <MediaGrid items={data.results} />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            makeHref={(page) => categoryHref(basePath, params.sort, page)}
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
