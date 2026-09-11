"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StreamSource } from "@/lib/providers/types";
import { PlayIcon, CloseIcon } from "@/components/icons";
import { LogoMark } from "@/components/Logo";
import { BrandImage } from "@/components/BrandImage";
import { cn } from "@/lib/utils";

export interface VideoEmbedProps {
  title: string;
  subtitle?: string;
  poster?: string | null;
  logo?: string | null;
  storageKey?: string;
  detailHref?: string;
  servers?: StreamSource[];
  /** Alias for servers to maintain compatibility with WatchPage */
  sources?: StreamSource[];
  /** YouTube trailer key, used as a preview when no server is configured. */
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
  // Combine passed sources/servers, or build default embed streaming servers
  const effectiveServers: StreamSource[] =
    sources.length > 0
      ? sources
      : servers.length > 0
      ? servers
      : [
          {
            id: "server1",
            label: "Server 1 (VidSrc XYZ)",
            url:
              mediaType === "tv"
                ? `https://vidsrc.xyz/embed/tv/${mediaId}/${season}/${episode}`
                : `https://vidsrc.xyz/embed/movie/${mediaId}`,
            kind: "embed",
          },
          {
            id: "server2",
            label: "Server 2 (Embed.su)",
            url:
              mediaType === "tv"
                ? `https://embed.su/embed/tv/${mediaId}/${season}/${episode}`
                : `https://embed.su/embed/movie/${mediaId}`,
            kind: "embed",
          },
          {
            id: "server3",
            label: "Server 3 (VidSrc TO)",
            url:
              mediaType === "tv"
                ? `https://vidsrc.to/embed/tv/${mediaId}/${season}/${episode}`
                : `https://vidsrc.to/embed/movie/${mediaId}`,
            kind: "embed",
          },
          {
            id: "server4",
            label: "Server 4 (VidSrc NL)",
            url:
              mediaType === "tv"
                ? `https://player.vidsrc.nl/embed/tv/${mediaId}/${season}/${episode}`
                : `https://player.vidsrc.nl/embed/movie/${mediaId}`,
            kind: "embed",
          },
        ];

  const configured = effectiveServers.filter((s) => s.url);
  const [activeId, setActiveId] = useState<string | undefined>(configured[0]?.id);
  const [playing, setPlaying] = useState(false);

  // Keep active server valid when media or episode changes
  useEffect(() => {
    if (configured.length && !configured.some((s) => s.id === activeId)) {
      setActiveId(configured[0].id);
    }
  }, [configured, activeId]);

  const active = configured.find((s) => s.id === activeId) ?? configured[0];
  const canPlay = Boolean(active || trailerKey);

  function nextServer() {
    if (configured.length < 2 || !active) return;
    const i = configured.findIndex((s) => s.id === active.id);
    setActiveId(configured[(i + 1) % configured.length].id);
  }

  return (
    <div>
      {/* ---------- Player Window ---------- */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        {playing && canPlay ? (
          <>
            {active ? (
              active.kind === "embed" ? (
                <iframe
                  key={active.id}
                  src={active.url}
                  title={`${title} — ${active.label}`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <video
                  key={active.id}
                  src={active.url}
                  controls
                  autoPlay
                  playsInline
                  onError={nextServer}
                  poster={poster ?? undefined}
                  className="h-full w-full bg-black"
                />
              )
            ) : trailerKey ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title={`${title} — preview`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
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
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-ray-gradient text-ink-950 shadow-glow transition group-hover:scale-105 disabled:opacity-50">
              <PlayIcon className="text-2xl" />
            </span>
            {/* Brand watermark */}
            <span className="pointer-events-none absolute right-3 top-3 opacity-80">
              <BrandImage
                src="/brand/watchplayer.png"
                alt="RAYWORLD"
                className="h-6 w-auto sm:h-7"
                fallback={
                  <span className="flex items-center gap-1.5">
                    <LogoMark size={22} animate={false} />
                    <span className="font-display text-xs font-black tracking-tight">
                      <span className="text-white/90">RAY</span>
                      <span className="bg-[linear-gradient(120deg,#ec4899,#a855f7)] bg-clip-text text-transparent">
                        WORLD
                      </span>
                    </span>
                  </span>
                }
              />
            </span>
          </button>
        )}
      </div>

      {/* ---------- Golden Server Buttons ---------- */}
      {configured.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-ink-850/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/75">Servers</h3>
            <span className="text-xs text-white/40">Switch if one doesn’t load</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {configured.map((s) => {
              const isActive = s.id === active?.id;
              const disabled = !s.url;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (disabled) return;
                    setActiveId(s.id);
                    setPlaying(true);
                  }}
                  disabled={disabled}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-bold transition",
                    isActive
                      ? "bg-ray-gradient text-ink-950 shadow-glow"
                      : disabled
                      ? "cursor-not-allowed border border-ray-500/30 bg-transparent text-ray-200/40"
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
