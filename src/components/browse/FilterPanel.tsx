"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LANGUAGES } from "@/lib/config/languages";
import { GENRES } from "@/lib/config/genres";
import { CURRENT_YEAR, cn } from "@/lib/utils";
import { FilterIcon, CloseIcon } from "@/components/icons";

const TYPES = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "A–Z" },
];

const RATINGS = [
  { value: "", label: "All" },
  { value: "7", label: "7+" },
  { value: "8", label: "8+" },
  { value: "9", label: "9+" },
];

const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR + 1 - i);

/**
 * Filter control center (spec §10–§12). Every change rewrites the shareable URL
 * and re-queries the catalog server-side — filters are never a client-side
 * "hide already-loaded cards" trick.
 */
export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const get = (key: string, fallback = "") => params.get(key) ?? fallback;

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      next.delete("page"); // any filter change resets pagination
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const reset = () => router.push(pathname);

  const type = get("type", "all");
  const language = get("language");
  const genre = get("genre");
  const year = get("year");
  const minRating = get("minRating");
  const sort = get("sort", "popular");

  const activeCount = [language, genre, year, minRating].filter(Boolean).length;

  const body = (
    <div className="space-y-6">
      <FilterGroup label="Type">
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => update({ type: t.value === "all" ? null : t.value })}
              className={cn(
                "chip flex-1 justify-center",
                (type === t.value || (t.value === "all" && !params.get("type"))) &&
                  "chip-active",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Language">
        <div className="flex flex-wrap gap-2">
          <Chip active={!language} onClick={() => update({ language: null })}>
            All
          </Chip>
          {LANGUAGES.map((l) => (
            <Chip
              key={l.code}
              active={language === l.code}
              onClick={() => update({ language: l.code })}
            >
              {l.name}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Genre">
        <div className="flex flex-wrap gap-2">
          <Chip active={!genre} onClick={() => update({ genre: null })}>
            All
          </Chip>
          {GENRES.map((g) => (
            <Chip
              key={g.slug}
              active={genre === g.slug}
              onClick={() => update({ genre: g.slug })}
            >
              {g.name}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Year">
        <div className="flex flex-wrap gap-2">
          <Chip active={!year} onClick={() => update({ year: null })}>
            Any
          </Chip>
          {YEARS.slice(0, 12).map((y) => (
            <Chip
              key={y}
              active={year === String(y)}
              onClick={() => update({ year: String(y) })}
            >
              {y}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Minimum Rating">
        <div className="flex gap-2">
          {RATINGS.map((r) => (
            <Chip
              key={r.value}
              active={minRating === r.value || (!minRating && r.value === "")}
              onClick={() => update({ minRating: r.value || null })}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Sort">
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Chip
              key={s.value}
              active={sort === s.value}
              onClick={() => update({ sort: s.value })}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <button onClick={reset} className="btn-outline w-full">
        Reset Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="card-surface sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rail-scroll p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
            Filters
          </h2>
          {body}
        </div>
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost fixed bottom-20 left-1/2 z-30 -translate-x-1/2 shadow-glow lg:hidden"
      >
        <FilterIcon />
        Filters
        {activeCount > 0 && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ray-gradient text-[11px] font-bold text-ink-950">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-ink-900 p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>
            {body}
            <button
              onClick={() => setOpen(false)}
              className="btn-primary mt-4 w-full"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
        {label}
      </h3>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("chip", active && "chip-active")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
