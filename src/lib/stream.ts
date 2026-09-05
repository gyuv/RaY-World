// src/lib/stream.ts
import { StreamSource } from "@/lib/providers/types";

export interface StreamSource { 
  url: string; 
  kind: "file" | "hls" | "embed"; 
}

export async function getStreamSource(
  type: "movie" | "tv", 
  id: number, 
  season?: number, 
  episode?: number
): Promise<StreamSource | null> {
  // Check if we have a valid ID
  if (!id) return null;

  // Build the Peachify URL
  let url = `https://peachify.top/embed/${type}/${id}`;
  
  // For TV shows, append season/episode if available
  if (type === "tv" && season && episode) {
    url += `?s=${season}&e=${episode}`;
  }

  // Return the source
  return {
    url,
    kind: "embed",
  };
}
