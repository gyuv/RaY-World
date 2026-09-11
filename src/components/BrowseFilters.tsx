"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LANGUAGES } from "@/lib/config/languages";
import { GENRES } from "@/lib/config/genres";
import { FilterIcon, CloseIcon } from "./icons";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "latest", label: "Latest" },
  { value: "alphabetical", label: "A–Z" },
];

/**
 * Compact, expandable catalog filters (language / genre / sort) for the Movies
 * and Series pages. Collapsed by default to a slim gold-tinted bar showing the
 * active selections; expands into a floating glass panel (absolutely positioned,
 * so it never pushes the grid down). Every choice is written to the URL search
 * params, so the server re-runs the browse query with the combined filters.
 */
export function BrowseFilters({ defaultSort = "popular" }: { defaultSort?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const language = params.get("language") ?? "";
  const genre = params.get("genre") ?? "";
  const sort = params.get("sort") ?? defaultSort;

  const langName = LANGUAGES.find((l) => l.code === language)?.name;
  const genreName = GENRES.find((g) => g.slug === genre)?.name;
  const sortLabel = SORTS.find((s) => s.value === sort)?.label;

  const activeCount =
    (language ? 1 : 0) + (genre ? 1 : 0) + (sort !== defaultSort ? 1 : 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Collapsed bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-xl transition",
            "border-ray-400/40 bg-ray-500/10 text-ray-100 hover:bg-ray-500/20",
          )}
        >
          <FilterIcon className="text-base" />
          Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ray-gradient px-1 text-[11px] font-bold text-ink-950">
              {activeCount}
            </span>
          )}
        </button>

        {/* Active selections as removable chips */}
        {langName && (
          <FilterChip label={langName} onClear={() => setParam("language", null)} />
        )}
        {genreName && (
          <FilterChip label={genreName} onClear={() => setParam("genre", null)} />
        )}
        {sort !== defaultSort && sortLabel && (
          <FilterChip label={sortLabel} onClear={() => setParam("sort", null)} />
        )}
      </div>

      {/* Expanded floating panel — absolute, so it never occupies layout space */}
      {open && (
        <>
          {/* click-away */}
          <button
            aria-label="Close filters"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute left-0 top-full z-30 mt-2 max-h-[64vh] w-[min(92vw,560px)] overflow-y-auto rounded-2xl border border-ray-400/30 bg-ink-950/85 p-4 shadow-2xl backdrop-blur-xl">
            {/* faint gold sheen */}
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-ray-500/[0.06]" />

            <Group title="Language">
              <Chip active={!language} onClick={() => setParam("language", null)}>
                All
              </Chip>
              {LANGUAGES.map((l) => (
                <Chip
                  key={l.code}
                  active={language === l.code}
                  onClick={() => setParam("language", l.code)}
                >
                  {l.name}
                  {l.nativeName && (
                    <span className="ml-1 opacity-60" lang={l.code}>
                      {l.nativeName}
                    </span>
                  )}
                </Chip>
              ))}
            </Group>

            <Group title="Genre">
              <Chip active={!genre} onClick={() => setParam("genre", null)}>
                All
              </Chip>
              {GENRES.map((g) => (
                <Chip
                  key={g.slug}
                  active={genre === g.slug}
                  onClick={() => setParam("genre", g.slug)}
                >
                  {g.name}
                </Chip>
              ))}
            </Group>

            <Group title="Sort by">
              {SORTS.map((s) => (
                <Chip
                  key={s.value}
                  active={sort === s.value}
                  onClick={() => setParam("sort", s.value === defaultSort ? null : s.value)}
                >
                  {s.label}
                </Chip>
              ))}
            </Group>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <button
                onClick={clearAll}
                disabled={activeCount === 0}
                className="text-sm font-medium text-white/60 transition hover:text-white disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-ray-gradient px-4 py-1.5 text-sm font-bold text-ink-950"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ray-200/70">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "border-transparent bg-ray-gradient text-ink-950"
          : "border-ray-400/25 bg-ray-500/5 text-white/80 hover:border-ray-400/50 hover:bg-ray-500/15",
      )}
    >
      {children}
    </button>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ray-400/40 bg-ray-500/15 px-3 py-1 text-xs font-semibold text-ray-100">
      {label}
      <button
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="grid h-4 w-4 place-items-center rounded-full text-ray-100/70 hover:bg-white/10 hover:text-white"
      >
        <CloseIcon className="text-[10px]" />
      </button>
    </span>
  );
}
