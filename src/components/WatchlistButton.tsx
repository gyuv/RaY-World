"use client";

import { useWatchlist, WatchlistEntry } from "@/lib/storage";
import { BookmarkIcon, CheckIcon, PlusIcon } from "./icons";
import { cn } from "@/lib/utils";

type Entry = Omit<WatchlistEntry, "addedAt">;

interface Props {
  entry: Entry;
  variant?: "icon" | "button";
  className?: string;
}

export function WatchlistButton({ entry, variant = "icon", className }: Props) {
  const { has, toggle } = useWatchlist();
  const active = has(entry.id, entry.type);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(entry);
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(active ? "btn-ghost" : "btn-outline", className)}
      >
        {active ? <CheckIcon /> : <PlusIcon />}
        {active ? "In Watchlist" : "Add to Watchlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border backdrop-blur transition",
        active
          ? "border-transparent bg-ray-gradient text-ink-950"
          : "border-white/25 bg-ink-950/70 text-white hover:border-white/60",
        className,
      )}
    >
      {active ? <CheckIcon /> : <BookmarkIcon />}
    </button>
  );
}
