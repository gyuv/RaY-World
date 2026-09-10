/** Small shared helpers. */

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Normalize a search query for matching and cache keys. */
export function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // punctuation -> space
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein distance, capped for cheap fuzzy comparison. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  let prev = Array.from({ length: bl + 1 }, (_, i) => i);
  let curr = new Array(bl + 1).fill(0);
  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[bl];
}

export function formatRuntime(minutes?: number): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatRating(rating?: number): string | undefined {
  if (rating == null || rating <= 0) return undefined;
  return rating.toFixed(1);
}

export function classForRating(rating?: number): string {
  if (rating == null) return "text-white/60";
  if (rating >= 8) return "text-emerald-400";
  if (rating >= 6.5) return "text-ray-300";
  if (rating >= 5) return "text-amber-400";
  return "text-white/60";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function unique<T, K>(items: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export const CURRENT_YEAR = new Date().getFullYear();

export function formatCurrency(n?: number): string | undefined {
  if (!n || n <= 0) return undefined;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  return `$${n.toLocaleString()}`;
}

export function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
