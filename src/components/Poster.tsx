import Image from "next/image";
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

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
