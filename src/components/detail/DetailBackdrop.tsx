"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cinematic detail-page backdrop: shows the backdrop image, then (after a beat)
 * fades in a trailer playing muted behind the hero content, so the top of the
 * page feels alive — the same effect cinejoy gets from the TMDB trailer.
 *
 * Many YouTube trailers are embedding-disabled or age-restricted, which is why
 * a plain <iframe> shows a blank/black box for a lot of titles. To avoid that we
 * drive the official YouTube IFrame Player API: it reports an error for a video
 * it can't embed, and we simply advance to the next candidate key until one
 * plays. If none can embed, we keep the still image. No third-party sources are
 * involved — only YouTube's own player, same as the rest of the site.
 */

// Minimal shape of the YouTube IFrame API we use (avoids a global type dep).
type YTPlayer = {
  mute: () => void;
  playVideo: () => void;
  seekTo: (s: number, allowSeekAhead: boolean) => void;
  loadVideoById: (id: string) => void;
  destroy: () => void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => YTPlayer;
  PlayerState: { ENDED: number };
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return apiPromise;
}

export function DetailBackdrop({
  backdrop,
  trailerKeys,
}: {
  backdrop: string | null;
  trailerKeys?: string[];
}) {
  const keys = trailerKeys?.filter(Boolean) ?? [];
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (keys.length === 0) return;
    let cancelled = false;
    let idx = 0;

    const start = setTimeout(() => {
      loadYouTubeApi()
        .then((YT) => {
          if (cancelled || !hostRef.current) return;
          const mount = document.createElement("div");
          hostRef.current.appendChild(mount);

          playerRef.current = new YT.Player(mount, {
            width: "100%",
            height: "100%",
            videoId: keys[idx],
            playerVars: {
              autoplay: 1,
              mute: 1,
              controls: 0,
              loop: 1,
              playlist: keys[idx],
              playsinline: 1,
              modestbranding: 1,
              rel: 0,
              iv_load_policy: 3,
              disablekb: 1,
              fs: 0,
            },
            events: {
              onReady: (e: { target: YTPlayer }) => {
                e.target.mute();
                e.target.playVideo();
              },
              onStateChange: (e: { data: number; target: YTPlayer }) => {
                if (e.data === YT.PlayerState.ENDED) {
                  e.target.seekTo(0, true);
                  e.target.playVideo();
                } else if (e.data === 1 /* PLAYING */) {
                  if (!cancelled) setPlaying(true);
                }
              },
              onError: () => {
                // Embedding disabled / age-restricted / removed — try the next.
                idx += 1;
                if (idx < keys.length && playerRef.current) {
                  setPlaying(false);
                  playerRef.current.loadVideoById(keys[idx]);
                }
              },
            },
          });
        })
        .catch(() => {});
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(start);
      try {
        playerRef.current?.destroy();
      } catch {
        /* no-op */
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join(",")]);

  // Fade the sharp imagery to transparent at the bottom so it dissolves into
  // the page's blurred wash — no hard seam between the hero and the sections.
  const fadeMask =
    "linear-gradient(to bottom, #000 0%, #000 28%, rgba(0,0,0,0.35) 66%, transparent 90%)";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
      >
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className={cn(
              "object-cover object-top transition-opacity duration-1000",
              playing ? "opacity-0" : "opacity-100",
            )}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink-800 to-ink-950" />
        )}

        {/* Player host — sized to COVER so YouTube chrome sits off-screen. */}
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000",
            playing ? "opacity-100" : "opacity-0",
          )}
          style={{
            width: "100vw",
            height: "56.25vw",
            minHeight: "100%",
            minWidth: "177.78vh",
          }}
        >
          <div ref={hostRef} className="h-full w-full" aria-hidden />
        </div>
      </div>

      {/* Left scrim only (vertical gradient) — text legibility, no horizontal band. */}
      <div className="absolute inset-0 bg-side-fade" />
    </div>
  );
}
