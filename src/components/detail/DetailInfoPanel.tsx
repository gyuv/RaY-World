import { MovieDetail, SeriesDetail } from "@/lib/providers/types";
import { getLanguageName } from "@/lib/config/languages";
import { formatCurrency, formatDate, formatRuntime } from "@/lib/utils";

/**
 * Glass info panel (Runtime / Language / Release / Budget…) shown to the right
 * of the detail hero on large screens. Only rows with real values render.
 */
export function DetailInfoPanel({ item }: { item: MovieDetail | SeriesDetail }) {
  const rows: { label: string; value: string }[] = [];

  const language = getLanguageName(item.language);
  if (language) rows.push({ label: "Language", value: language });

  if (item.type === "movie") {
    const rt = formatRuntime(item.runtime);
    if (rt) rows.unshift({ label: "Runtime", value: rt });
    const rel = formatDate(item.releaseDate);
    if (rel) rows.push({ label: "Release Date", value: rel });
    const budget = formatCurrency(item.budget);
    if (budget) rows.push({ label: "Budget", value: budget });
    const revenue = formatCurrency(item.revenue);
    if (revenue) rows.push({ label: "Revenue", value: revenue });
  } else {
    const s = item.numberOfSeasons;
    if (s) rows.unshift({ label: "Seasons", value: String(s) });
    if (item.numberOfEpisodes)
      rows.push({ label: "Episodes", value: String(item.numberOfEpisodes) });
    const rel = formatDate(item.releaseDate);
    if (rel) rows.push({ label: "First Air", value: rel });
  }

  if (item.status) rows.push({ label: "Status", value: item.status });

  const houses =
    item.type === "movie" ? item.productionCompanies : item.networks;
  const production = (houses ?? [])
    .map((h) => h.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
  if (production)
    rows.push({
      label: item.type === "movie" ? "Production" : "Network",
      value: production,
    });

  if (rows.length === 0) return null;

  return (
    <aside className="glass hidden w-72 flex-none self-start p-1 lg:block">
      <dl className="divide-y divide-white/10">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
          >
            <dt className="text-white/50">{r.label}</dt>
            <dd className="text-right font-semibold text-white/90">{r.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
