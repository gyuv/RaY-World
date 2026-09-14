import { posterUrl, PosterSize } from "@/lib/images";
import { cn } from "@/lib/utils";

interface PosterProps {
  path?: string | null;
  alt: string;
  size?: PosterSize;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

// TMDB poster size buckets (their real pixel widths) used to build a responsive
// srcSet. Images are served straight from TMDB's CDN (the Vercel optimizer is
// intentionally off on the free tier), so instead of shipping one fixed w500
// to every device we let the browser pick the smallest bucket that fits the
// slot — phones download ~185/342px posters, retina desktops the larger ones.
const POSTER_SRCSET: { size: PosterSize; w: number }[] = [
  { size: "w185", w: 185 },
  { size: "w342", w: 342 },
  { size: "w500", w: 500 },
  { size: "w780", w: 780 },
];

/** Poster image with a branded RaY-World fallback (spec §16). */
export function Poster({
  path,
  alt,
  size = "w500",
  sizes = "(max-width: 640px) 40vw, 200px",
  className,
  priority,
}: PosterProps) {
  const url = posterUrl(path, size);

  if (!url) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-700",
          className,
        )}
        aria-label={alt}
      >
        <div className="px-3 text-center">
          <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-ray-gradient opacity-70" />
          <p className="line-clamp-3 text-xs font-medium text-white/50">{alt}</p>
        </div>
      </div>
    );
  }

  const srcSet = POSTER_SRCSET.map(
    ({ size: s, w }) => `${posterUrl(path, s)} ${w}w`,
  ).join(", ");

  return (
    /* Plain <img> (not next/image): images are unoptimized/TMDB-direct anyway,
       and a hand-built srcSet gives true responsive downloads without the
       optimizer. The parent reserves the aspect ratio, so there is no layout
       shift. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
