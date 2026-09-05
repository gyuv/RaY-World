"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "latest", label: "Latest" },
  { value: "alphabetical", label: "A–Z" },
];

export function SortTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("sort") ?? "popular";

  const set = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "popular") next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {SORTS.map((s) => (
        <button
          key={s.value}
          onClick={() => set(s.value)}
          className={cn("chip flex-none", active === s.value && "chip-active")}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
