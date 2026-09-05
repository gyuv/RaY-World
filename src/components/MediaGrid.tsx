import { MediaItem } from "@/lib/providers/types";
import { MediaCard } from "./MediaCard";

export function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 tv:grid-cols-8 tv:gap-6">
      {items.map((item, i) => (
        <MediaCard
          key={`${item.type}:${item.id}`}
          item={item}
          priority={i < 6}
        />
      ))}
    </div>
  );
}

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 tv:grid-cols-8 tv:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton aspect-[2/3] rounded-xl" />
          <div className="skeleton h-3.5 w-4/5 rounded" />
          <div className="skeleton h-3 w-2/5 rounded" />
        </div>
      ))}
    </div>
  );
}
