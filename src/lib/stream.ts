// src/lib/stream.ts
import { StreamSource } from "@/lib/providers/types";

// REMOVE the interface definition below. It conflicts with the import.
// export interface StreamSource { ... }

export async function getStreamSource(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number
): Promise<StreamSource | null> {
  if (!id) return null;

  let url = `https://peachify.top/embed/${type}/${id}`;
  if (type === "tv" && season && episode) {
    url += `?s=${season}&e=${episode}`;
  }

  return {
    url,
    kind: "embed",
  };
}
