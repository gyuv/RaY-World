import { NextRequest, NextResponse } from "next/server";
import { runQuickSearch, runSearch } from "@/lib/search";

/**
 * Universal search API. Backs the live header dropdown (`quick=1`) and any
 * client-side "load more" on the search page. Always queries the catalog, not
 * a preloaded slice (spec §4, §21).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const quick = searchParams.get("quick") === "1";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  if (!q.trim()) {
    return NextResponse.json({
      query: q,
      movies: [],
      series: [],
      people: [],
      media: [],
      totalResults: 0,
      totalPages: 0,
      page: 1,
    });
  }

  const results = quick ? await runQuickSearch(q) : await runSearch(q, page);

  return NextResponse.json(results, {
    headers: {
      // Short cache for repeated popular searches (spec §19).
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
