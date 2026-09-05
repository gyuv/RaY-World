"use client";

import Link from "next/link";
import { useWatchlist } from "@/lib/storage";
import { MediaCard } from "@/components/MediaCard";
import { EmptyState } from "@/components/EmptyState";
import { MediaItem } from "@/lib/providers/types";

export default function WatchlistPage() {
  const { items } = useWatchlist();

  const mediaItems: MediaItem[] = items.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    posterPath: e.posterPath,
    year: e.year,
    rating: e.rating,
    genreIds: [],
  }));

  return (
    <div className="container-page py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          My Watchlist
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {items.length > 0
            ? `${items.length} title${items.length > 1 ? "s" : ""} saved on this device.`
            : "Titles you save appear here."}
        </p>
      </header>

      {mediaItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {mediaItems.map((item) => (
            <MediaCard key={`${item.type}:${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your watchlist is empty"
          message="Browse the catalog and tap the bookmark on any title to save it here."
        />
      )}

      {mediaItems.length === 0 && (
        <div className="mt-6 flex justify-center">
          <Link href="/tamil" className="btn-primary">
            Discover Tamil Movies
          </Link>
        </div>
      )}
    </div>
  );
}
