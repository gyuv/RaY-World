"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StreamSource } from "@/lib/providers/types";
import { PlayIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface VideoEmbedProps {
  title: string;
  subtitle?: string;
  poster?: string | null;
  logo?: string | null;
  storageKey?: string;
  detailHref?: string;
  servers?: StreamSource[];
  sources?: StreamSource[];
  trailerKey?: string | null;
  mediaType?: "movie" | "tv";
  mediaId?: string | number;
  season?: number;
  episode?: number;
}

export function VideoEmbed({
  title,
  poster,
  servers = [],
  sources = [],
  trailerKey,
  mediaType = "movie",
  mediaId = "12345",
  season = 1,
  episode = 1,
}: VideoEmbedProps) {
  const effectiveServers: StreamSource[] =
    sources.length > 0
      ? sources
      : servers.length > 0
      ? servers
      : [
          {
            id: "server1",
            label: "Pikachu",
            url:
              mediaType === "tv"
                ? `https://nxsha.space/embed/tv/${mediaId}/${season}/${episode}`
                : `https://nxsha.space/embed/movie/${mediaId}`,
            kind: "embed",
          },
          {
            id: "server2",
            label: "Charizard",
            url:
              mediaType === "tv"
                ? `https://peachify.top/embed/tv/${mediaId}/${season}/${episode}`
                : `https://peachify.top/embed/movie/${mediaId}`,
            kind: "embed",
          },
          {
            id: "server3",
            label: "Bulbasaur",
            url:
              mediaType === "tv"
                ? `https://vidsrc.to/embed/tv/${mediaId}/${season}/${episode}`
                : `https://vidsrc.to/embed/movie/${mediaId}`,
            kind: "embed",
          },
          {
            id: "server4",
            label: "Snorlax",
            url:
              mediaType === "tv"
                ? `https://vidfast.vc/tv/${mediaId}/${season}/${episode}?autoPlay=true`
                : `https://vidfast.vc/movie/${mediaId}?autoPlay=true`,
            kind: "embed",
          },
        ];

  const configured = effectiveServers.filter((s) => s.url);
  const [activeId, setActiveId] = useState<string | undefined>(configured[0]?.id);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (configured.length && !configured.some((s) => s.id === activeId)) {
      setActiveId(configured[0].id);
    }
  }, [configured, activeId]);

  const active = configured.find((s) => s.id === activeId) ?? configured[0];
  const canPlay = Boolean(active || trailerKey);

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        {playing && canPlay ? (
          <>
            {active ? (
              <iframe
                key={active.id}
                src={active.url}
                title={`${title} — ${active.label}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="origin"
                
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : trailerKey ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title={`${title} — preview`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : null}

            <button
              onClick={() => setPlaying(false)}
              aria-label="Close player"
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <CloseIcon />
            </button>
          </>
        ) : (
          <button
            onClick={() => canPlay && setPlaying(true)}
            disabled={!canPlay}
            className="group absolute inset-0 grid place-items-center"
            aria-label={canPlay ? "Play" : "No source available"}
          >
            {poster ? (
              <Image src={poster} alt="" fill sizes="100vw" className="object-cover opacity-70" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />
            )}
            <div className="absolute inset-0 bg-ink-950/40" />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-ray-gradient text-ink-950 shadow-glow transition group-hover:scale-105">
              <PlayIcon className="text-2xl" />
            </span>
          </button>
        )}
      </div>

      {configured.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-ink-850/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/75">Servers</h3>
            <span className="text-xs text-white/40">Switch server if playback stalls</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {configured.map((s) => {
              const isActive = s.id === active?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveId(s.id);
                    setPlaying(true);
                  }}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-bold transition",
                    isActive
                      ? "bg-ray-gradient text-ink-950 shadow-glow"
                      : "border border-ray-400/40 bg-ray-500/10 text-ray-200 hover:bg-ray-500/20"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
