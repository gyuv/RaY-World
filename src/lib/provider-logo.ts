import { WatchProviderInfo } from "./providers/types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Resolve a platform's TMDB logo_path from the region's watch-provider list —
 * by id first, then by name/alias (so ids that drift, e.g. Hotstar → JioHotstar
 * or JioCinema, still match). Shared by the homepage strip and provider pages.
 */
export function resolveProviderLogoPath(
  tmdbId: number,
  name: string,
  aliases: string[] | undefined,
  list: WatchProviderInfo[],
): string | null {
  const byId = list.find((w) => w.id === tmdbId);
  if (byId) return byId.logoPath;

  const needles = [name, ...(aliases ?? [])].map(norm).filter(Boolean);
  const match = list.find((w) => {
    const wn = norm(w.name);
    return needles.some((n) => wn.includes(n) || n.includes(wn));
  });
  return match?.logoPath ?? null;
}
