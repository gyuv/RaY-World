"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Cinematic detail-page backdrop: shows the backdrop image, then (after a beat)
 * fades in the trailer playing muted + blurred behind the hero content, so the
 * top of the page feels alive. Uses the authorized YouTube embed; falls back to
 * the still image when there's no trailer or before it loads.
 */
export function DetailBackdrop({
  backdrop,
  trailerKey,
}: {
  backdrop: string | null;
  trailerKey?: string | null;
}) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!trailerKey) return;
    const t = setTimeout(() => setShowVideo(true), 1400);
    return () => clearTimeout(t);
  }, [trailerKey]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {backdrop ? (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-ink-800 to-ink-950" />
      )}

      {showVideo && trailerKey && (
        <div className="absolute inset-0 animate-[fade-in_1s_ease-out] opacity-70">
          <iframe
            title="Trailer preview"
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 scale-125 blur-[3px]"
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3`}
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* Legibility overlays */}
      <div className="absolute inset-0 bg-ink-950/30" />
      <div className="absolute inset-0 bg-hero-fade" />
      <div className="absolute inset-0 bg-side-fade" />
    </div>
  );
}
