"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StreamSource } from "@/lib/providers/types";
import { PlayIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * VideoEmbed — the complete streaming widget and the ONLY place that renders
 * playable streams. Keep all playback/server changes here so the watch page and
 * WatchPlayer stay stable.
 *
 * It shows the player and a row of golden "Server" buttons below it, mapped
 * from `servers` (resolved by src/lib/stream.ts → getStreamSources). A server
 * with an empty `url` is treated as not-yet-configured and its button is
 * disabled. Playback:
 *   kind "embed" -> <iframe>   (licensed provider/partner player URL)
 *   kind "file"  -> <video>    (direct MP4/WebM)
 *   kind "hls"   -> <video>    (.m3u8; native on Safari/iOS — add hls.js here)
 *
 * Only use sources you are LICENSED to serve.
 */
interface VideoEmbedProps {
  title: string;
  poster?: string | null;
  servers?: StreamSource[];
  /** YouTube trailer key, used as a preview when no server is configured. */
  trailerKey?: string | null;
}

export function VideoEmbed({
  title,
  poster,
  servers = [],
  trailerKey,
}: VideoEmbedProps) {
  const configured = servers.filter((s) => s.url);
  const [activeId, setActiveId] = useState<string | undefined>(configured[0]?.id);
  const [playing, setPlaying] = useState(false);

  // Keep the active server valid when the list changes (e.g. episode switch).
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
      {/* ---------- Player ---------- */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        {playing && canPlay ? (
          <>
            {active ? (
              active.kind === "embed" ? (
                <iframe
                  key={active.id}
                  src={active.url}
                  title={`${title} — ${active.label}`}
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
          </button>
        )}
      </div>

      {/* ---------- Golden server buttons (below the player) ---------- */}
      {servers.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-ink-850/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/75">Servers</h3>
            <span className="text-xs text-white/40">Switch if one doesn’t load</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {servers.map((s) => {
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
                  title={disabled ? "Add a licensed source in getStreamSources" : undefined}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-bold transition",
                    isActive
                      ? "bg-ray-gradient text-ink-950 shadow-glow"
                      : disabled
                        ? "cursor-not-allowed border border-ray-500/30 bg-transparent text-ray-200/40"
                        : "border border-ray-400/40 bg-ray-500/10 text-ray-200 hover:bg-ray-500/20",
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
