"use client";

import { useEffect, useRef } from "react";
import type HlsType from "hls.js";

interface ProxiedPlayerProps {
  embedUrl: string;
}

export function ProxiedPlayer({ embedUrl }: ProxiedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const proxyEndpoint = `/api/proxy?url=${encodeURIComponent(embedUrl)}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: HlsType | null = null;
    let cancelled = false;

    // Lazy-load hls.js (~130KB) only when this player actually mounts, so it is
    // never pulled into the initial/route JS bundle. Native HLS (Safari) skips
    // the download entirely.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = proxyEndpoint;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !video || !Hls.isSupported()) return;
        hls = new Hls({
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });
        hls.loadSource(proxyEndpoint);
        hls.attachMedia(video);
      });
    }

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [proxyEndpoint]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      playsInline
      className="h-full w-full rounded-2xl bg-black"
    />
  );
}
