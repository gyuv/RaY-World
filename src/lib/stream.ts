// src/lib/stream.ts
import { StreamSource } from "@/lib/providers/types";

/**
 * Resolve the list of "servers" (playable sources) for a title/episode
 * using the providers (Peachify, 2embed, and Vidsrc) from Code 2.
 */
export async function getStreamSources(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number,
): Promise<StreamSource[]> {
  if (!id) return [];

  // Fallback to season 1, episode 1 if missing for TV shows
  const s = season || 1;
  const e = episode || 1;

  // 1. Peachify URL generation (from Code 2 logic)
  const peachifyUrl =
    type === "movie"
      ? `https://peachify.top/embed/movie/${id}`
      : `https://peachify.top/embed/tv/${id}/${s}/${e}`;

  // 2. 2embed URL generation (adapted for movies and TV)
  const twoEmbedUrl =
    type === "movie"
      ? `https://2embed.cc/embed/movie/${id}`
      : `https://2embed.cc/embed/tv/${id}/${s}/${e}`;

  // 3. Promulti / Vidsrc fallback URL generation (from Code 2 logic)
  const vidsrcUrl =
    type === "movie"
      ? `https://vidsrc.sbs/embed/movie/${id}?provider=free`
      : `https://vidsrc.sbs/embed/tv/${id}/${s}/${e}?provider=free`;

  return [
    { 
      id: "server-1", 
      label: "Orange-Server (Peachify)", 
      url: peachifyUrl, 
      kind: "embed" 
    },
    { 
      id: "server-2", 
      label: "Apple-Server (2embed)", 
      url: twoEmbedUrl, 
      kind: "embed" 
    },
    { 
      id: "server-3", 
      label: "Mango-Server (Vidsrc)", 
      url: vidsrcUrl, 
      kind: "embed" 
    },
  ];
}
