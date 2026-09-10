"use client";

import { useRouter } from "next/navigation";
import type { PlayableSource } from "@/lib/stream-hls";
import { HlsPlayer } from "./HlsPlayer";

/**
 * Client wrapper that mounts the native HLS player and wires its "back" button
 * to the title's detail page. Kept thin so the watch page stays a server
 * component.
 */
export function PlayerStage({
  sources,
  title,
  subtitle,
  poster,
  logo,
  storageKey,
  detailHref,
}: {
  sources: PlayableSource[];
  title: string;
  subtitle?: string;
  poster?: string | null;
  logo?: string | null;
  storageKey?: string;
  detailHref: string;
}) {
  const router = useRouter();
  return (
    <HlsPlayer
      sources={sources}
      title={title}
      subtitle={subtitle}
      poster={poster}
      logo={logo}
      storageKey={storageKey}
      onExit={() => router.push(detailHref)}
    />
  );
}
