/** TMDB image URL helpers with sane fallbacks (spec §16). */

const IMAGE_BASE =
  process.env.TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";

export type PosterSize = "w185" | "w342" | "w500" | "w780" | "original";
export type BackdropSize = "w780" | "w1280" | "original";
export type ProfileSize = "w185" | "w342" | "original";
export type StillSize = "w300" | "w780";

export function posterUrl(
  path?: string | null,
  size: PosterSize = "w500",
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(
  path?: string | null,
  size: BackdropSize = "w1280",
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(
  path?: string | null,
  size: ProfileSize = "w185",
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function stillUrl(
  path?: string | null,
  size: StillSize = "w300",
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}
