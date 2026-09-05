// src/lib/stream.ts
import { StreamSource } from "./providers/types";

/**
 * Maps a TMDB ID/Season/Episode to a Peachify embed URL.
 * Peachify uses the format: https://peachify.top/embed/{type}/{tmdb_id}
 * 
 * Note: Peachify handles server selection via query params or internal state.
 * We return the base embed URL. The UI component can append `?server=X` if needed,
 * but typically the embed player handles fallbacks internally.
 */
export async function getStreamSource(
  type: "movie" | "tv",
  id: number,
  season?: number,
  episode?: number
): Promise<StreamSource | null> {
  // Construct the base URL
  let baseUrl = `https://peachify.top/embed/${type}/${id}`;
  
  // For TV shows, append season and episode if available
  if (type === "tv" && season && episode) {
    baseUrl += `?s=${season}&e=${episode}`;
  }

  // Return a static embed source. 
  // Since Peachify is an embed provider, we mark it as 'embed'.
  return {
    url: baseUrl,
    kind: "embed",
  };
}
