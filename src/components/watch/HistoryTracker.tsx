"use client";

import { useEffect } from "react";
import { useContinueWatching, ProgressEntry } from "@/lib/storage";

/**
 * Records a Continue Watching entry when a watch page mounts. For the MVP this
 * marks the title as "started"; a real player would update `progress` over time.
 * The schema matches `ProgressEntry` so account-sync can adopt it later.
 */
export function HistoryTracker({
  entry,
}: {
  entry: Omit<ProgressEntry, "updatedAt" | "progress"> & { progress?: number };
}) {
  const { upsert, items } = useContinueWatching();

  useEffect(() => {
    const existing = items.find(
      (i) => i.id === entry.id && i.type === entry.type,
    );
    upsert({
      ...entry,
      // Preserve prior progress if we already have some for this title.
      progress: entry.progress ?? existing?.progress ?? 0.02,
    });
    // Only run when the identifying fields change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id, entry.type, entry.seasonNumber, entry.episodeNumber]);

  return null;
}
