"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchIcon, CloseIcon } from "./icons";
import { posterUrl, profileUrl } from "@/lib/images";
import { getLanguageName } from "@/lib/config/languages";
import type { SearchResults } from "@/lib/search";
import { cn, formatRating } from "@/lib/utils";

interface SearchBoxProps {
  variant?: "bar" | "compact";
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

const EMPTY: SearchResults = {
  query: "",
  normalized: "",
  movies: [],
  series: [],
  people: [],
  media: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
  approximate: false,
};

export function SearchBox({
  variant = "bar",
  autoFocus,
  placeholder = "Search movies, series, actors, directors…",
  className,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced live search (spec §8: 250–350ms).
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(
          `/api/search?quick=1&q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal },
        );
        const data = (await res.json()) as SearchResults;
        setResults(data);
        setOpen(true);
      } catch {
        /* aborted or network error — keep prior results */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const hasResults =
    results.movies.length + results.series.length + results.people.length > 0;

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} role="search">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-white/40" />
          <input
            type="search"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hasResults && setOpen(true)}
            placeholder={placeholder}
            aria-label="Search"
            enterKeyHint="search"
            className={cn(
              "w-full rounded-full border border-white/10 bg-ink-800/80 py-2.5 pl-11 pr-10 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-ray-400/60 focus:bg-ink-800 focus:ring-2 focus:ring-ray-400/20",
              variant === "compact" && "py-2 text-sm",
            )}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setResults(EMPTY);
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-850/95 p-2 shadow-2xl backdrop-blur-xl">
          {loading && !hasResults && (
            <p className="px-3 py-4 text-sm text-white/50">Searching…</p>
          )}

          {!loading && !hasResults && (
            <div className="px-3 py-4">
              <p className="text-sm text-white/70">
                No matches for “{query.trim()}”.
              </p>
              <p className="mt-1 text-xs text-white/45">
                Press Enter for a full search, or try browsing.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/tamil" className="chip" onClick={() => setOpen(false)}>
                  Tamil Movies
                </Link>
                <Link href="/trending" className="chip" onClick={() => setOpen(false)}>
                  Trending
                </Link>
                <Link href="/browse" className="chip" onClick={() => setOpen(false)}>
                  Browse
                </Link>
              </div>
            </div>
          )}

          {results.approximate && hasResults && (
            <p className="px-3 pb-1 pt-2 text-xs text-ray-300">
              Showing the best matches for “{query.trim()}”
            </p>
          )}

          <ResultGroup label="Movies">
            {results.movies.map((m) => (
              <ResultRow
                key={`m${m.id}`}
                href={`/movie/${m.id}`}
                img={posterUrl(m.posterPath, "w185")}
                title={m.title}
                meta={[m.year?.toString(), getLanguageName(m.language), formatRating(m.rating) && `★ ${formatRating(m.rating)}`]}
                onClick={() => setOpen(false)}
              />
            ))}
          </ResultGroup>

          <ResultGroup label="TV Series">
            {results.series.map((s) => (
              <ResultRow
                key={`s${s.id}`}
                href={`/tv/${s.id}`}
                img={posterUrl(s.posterPath, "w185")}
                title={s.title}
                meta={[s.year?.toString(), getLanguageName(s.language), formatRating(s.rating) && `★ ${formatRating(s.rating)}`]}
                onClick={() => setOpen(false)}
              />
            ))}
          </ResultGroup>

          <ResultGroup label="People">
            {results.people.map((p) => (
              <ResultRow
                key={`p${p.id}`}
                href={`/search?q=${encodeURIComponent(p.name)}`}
                img={profileUrl(p.profilePath, "w185")}
                title={p.name}
                meta={[p.knownForDepartment]}
                round
                onClick={() => setOpen(false)}
              />
            ))}
          </ResultGroup>

          {hasResults && (
            <button
              onClick={submit}
              className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2.5 text-center text-sm font-semibold text-ray-300 hover:bg-white/10"
            >
              See all results for “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode[];
}) {
  const items = children.filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="py-1">
      <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      {items}
    </div>
  );
}

function ResultRow({
  href,
  img,
  title,
  meta = [],
  round,
  onClick,
}: {
  href: string;
  img: string | null;
  title: string;
  meta?: (string | false | undefined)[];
  round?: boolean;
  onClick?: () => void;
}) {
  const metaText = meta.filter(Boolean).join(" • ");
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/10"
    >
      <div
        className={cn(
          "h-12 w-9 flex-none overflow-hidden bg-ink-700",
          round ? "h-10 w-10 rounded-full" : "rounded-md",
        )}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-white/20">
            🎞️
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white/90">{title}</p>
        {metaText && <p className="truncate text-xs text-white/45">{metaText}</p>}
      </div>
    </Link>
  );
}
