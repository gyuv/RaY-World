"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
          className={cn(
            "object-cover object-top transition-opacity duration-1000",
            showVideo && trailerKey ? "opacity-0" : "opacity-100",
          )}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-ink-800 to-ink-950" />
      )}

      {showVideo && trailerKey && (
        <div className="absolute inset-0 animate-[fade-in_1.2s_ease-out]">
          {/* Sharp trailer, sized to COVER so YouTube's controls/title sit
              off-screen (cropped) — no blur, no visible play/next chrome. */}
          <iframe
            title="Trailer preview"
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "100vw",
              height: "56.25vw",
              minHeight: "100%",
              minWidth: "177.78vh",
            }}
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`}
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
