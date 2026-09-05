import Link from "next/link";
import { ChevronLeft, ChevronRight } from "./icons";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Build an href for a given page from the current query. */
  makeHref: (page: number) => string;
}

/** SEO-friendly, link-based pagination (spec §20). */
export function Pagination({ page, totalPages, makeHref }: PaginationProps) {
  if (totalPages <= 1) return null;
  const max = Math.min(totalPages, 500);

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(max, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <PageLink
        href={makeHref(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </PageLink>

      {start > 1 && (
        <>
          <PageLink href={makeHref(1)}>1</PageLink>
          {start > 2 && <span className="px-1 text-white/30">…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageLink key={p} href={makeHref(p)} active={p === page}>
          {p}
        </PageLink>
      ))}

      {end < max && (
        <>
          {end < max - 1 && <span className="px-1 text-white/30">…</span>}
          <PageLink href={makeHref(max)}>{max}</PageLink>
        </>
      )}

      <PageLink
        href={makeHref(page + 1)}
        disabled={page >= max}
        aria-label="Next page"
      >
        <ChevronRight />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const cls = cn(
    "grid h-10 min-w-[2.5rem] place-items-center rounded-lg px-2 text-sm font-semibold transition",
    active
      ? "bg-ray-gradient text-ink-950"
      : "border border-white/10 text-white/70 hover:border-white/40 hover:text-white",
    disabled && "pointer-events-none opacity-40",
  );
  if (disabled) {
    return (
      <span className={cls} aria-disabled {...rest}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
