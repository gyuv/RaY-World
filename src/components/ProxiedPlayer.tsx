"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface ProxiedPlayerProps {
  embedUrl: string;
}

export function ProxiedPlayer({ embedUrl }: ProxiedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const proxyEndpoint = `/api/proxy?url=${encodeURIComponent(embedUrl)}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hls.loadSource(proxyEndpoint);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Fallback native Safari HLS support
      video.src = proxyEndpoint;
    }
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
