"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Local-device persistence for Watchlist and Continue Watching (spec §24, §25).
 * Deliberately schema-stable so a future account-sync backend can migrate this
 * shape directly. Everything is wrapped in try/catch — storage can be blocked.
 */

const WATCHLIST_KEY = "rayworld:watchlist:v1";
const PROGRESS_KEY = "rayworld:progress:v1";
const LANG_KEY = "rayworld:language:v1";

export interface WatchlistEntry {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  year?: number;
  rating?: number;
  addedAt: number;
}

export interface ProgressEntry {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  seasonNumber?: number;
  episodeNumber?: number;
  /** 0..1 fraction watched. */
  progress: number;
  durationSeconds?: number;
  updatedAt: number;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(`rayworld:store:${key}`));
  } catch {
    /* storage unavailable — ignore */
  }
}

function useStore<T>(key: string, fallback: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const onChange = () => setValue(read(key, fallback));
    window.addEventListener(`rayworld:store:${key}`, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(`rayworld:store:${key}`, onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return [value, set];
}

export function useWatchlist() {
  const [items, setItems] = useStore<WatchlistEntry[]>(WATCHLIST_KEY, []);

  const has = useCallback(
    (id: number, type: "movie" | "tv") =>
      items.some((i) => i.id === id && i.type === type),
    [items],
  );

  const toggle = useCallback(
    (entry: Omit<WatchlistEntry, "addedAt">) => {
      const exists = items.some(
        (i) => i.id === entry.id && i.type === entry.type,
      );
      if (exists) {
        setItems(
          items.filter((i) => !(i.id === entry.id && i.type === entry.type)),
        );
      } else {
        setItems([{ ...entry, addedAt: Date.now() }, ...items]);
      }
    },
    [items, setItems],
  );

  const remove = useCallback(
    (id: number, type: "movie" | "tv") =>
      setItems(items.filter((i) => !(i.id === id && i.type === type))),
    [items, setItems],
  );

  return { items, has, toggle, remove };
}

export function useContinueWatching() {
  const [items, setItems] = useStore<ProgressEntry[]>(PROGRESS_KEY, []);

  const upsert = useCallback(
    (entry: Omit<ProgressEntry, "updatedAt">) => {
      const rest = items.filter(
        (i) => !(i.id === entry.id && i.type === entry.type),
      );
      setItems(
        [{ ...entry, updatedAt: Date.now() }, ...rest]
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 30),
      );
    },
    [items, setItems],
  );

  const remove = useCallback(
    (id: number, type: "movie" | "tv") =>
      setItems(items.filter((i) => !(i.id === id && i.type === type))),
    [items, setItems],
  );

  return { items, upsert, remove };
}

export function useDiscoveryLanguage() {
  return useStore<string>(LANG_KEY, "ta");
}
