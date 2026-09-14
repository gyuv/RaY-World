"use client";

import { useEffect, useRef, useState } from "react";
import { StreamSource } from "@/lib/providers/types";
import {
  PlayIcon,
  CloseIcon,
  ExpandIcon,
  CompressIcon,
} from "@/components/icons";
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

/* Cross-browser fullscreen helpers — Safari/WebKit still needs the prefixes. */
type FsDoc = Document & {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};
type FsEl = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

function fsElement(): Element | null {
  const d = document as FsDoc;
  return (
    d.fullscreenElement || d.webkitFullscreenElement || d.msFullscreenElement || null
  );
}
function settle(r: Promise<void> | void) {
  if (r && typeof (r as Promise<void>).catch === "function") {
    (r as Promise<void>).catch(() => {});
  }
}
function requestFs(el: HTMLElement) {
  const e = el as FsEl;
  const fn = e.requestFullscreen || e.webkitRequestFullscreen || e.msRequestFullscreen;
  // Best-effort — if it throws or is unsupported (e.g. iOS Safari on a div),
  // the CSS overlay still delivers a full-viewport experience.
  if (fn) {
    try {
      settle(fn.call(el));
    } catch {
      /* ignore */
    }
  }
}
function exitFs() {
  if (!fsElement()) return;
  const d = document as FsDoc;
  const fn = d.exitFullscreen || d.webkitExitFullscreen || d.msExitFullscreen;
  if (fn) {
    try {
      settle(fn.call(document));
    } catch {
      /* ignore */
    }
  }
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
  // `open` = the immersive full-viewport player is showing (and the iframe is
  // mounted). Closed = the inline poster preview + server list.
  const [open, setOpen] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (configured.length && !configured.some((s) => s.id === activeId)) {
      setActiveId(configured[0].id);
    }
  }, [configured, activeId]);

  const active = configured.find((s) => s.id === activeId) ?? configured[0];
  const canPlay = Boolean(active || trailerKey);

  // Direct file/HLS sources go through the proxy; embeds load as-is.
  const getPlayableUrl = (source: StreamSource) => {
    if (source.kind === "file" || source.kind === "hls") {
      return `/api/proxy?url=${encodeURIComponent(source.url)}`;
    }
    return source.url;
  };

  // Enter the immersive player from a user gesture, and request real browser
  // fullscreen on the same element synchronously so the activation counts.
  const openPlayer = (id?: string) => {
    if (id) setActiveId(id);
    setOpen(true);
    if (containerRef.current) requestFs(containerRef.current);
  };
  const closePlayer = () => {
    exitFs();
    setOpen(false);
  };
  const toggleFs = () => {
    if (fsElement()) exitFs();
    else if (containerRef.current) requestFs(containerRef.current);
  };

  // Track native fullscreen so the toggle button shows the right icon.
  useEffect(() => {
    const onChange = () => setIsFs(!!fsElement());
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  // While immersive: lock body scroll and let Escape close the player. When in
  // native fullscreen the browser consumes the first Escape to exit that, so we
  // only close on Escape once fullscreen is already gone.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Escape leaves the watch experience. When we're in native fullscreen the
    // browser may consume the first Escape to exit that (a second one then
    // reaches us); closePlayer() also calls exitFs() so a single press exits
    // fully whenever the event does reach us.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlayer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const iconBtn =
    "pointer-events-auto grid h-9 w-9 flex-none place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/80";
  const chip = "rounded-lg px-3 py-1.5 text-xs font-bold transition";
  const chipActive = "bg-ray-gradient text-ink-950";
  const chipIdle = "bg-white/10 text-white/80 hover:bg-white/20";

  return (
    <div>
      {/* The player container is always mounted so it can be the fullscreen
          target from a user gesture. When open it becomes a fixed, viewport-
          filling overlay (100dvh) that covers the header, footer and page. */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden bg-black",
          open
            ? "fixed inset-0 z-[90] h-[100dvh] w-screen rounded-none"
            : "aspect-video w-full rounded-2xl ring-1 ring-white/10",
        )}
      >
        {open && canPlay ? (
          <>
            {active ? (
              <iframe
                key={active.id}
                src={getPlayableUrl(active)}
                title={`${title} — ${active.label}`}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; screen-wake-lock; web-share; clipboard-write"
                referrerPolicy="no-referrer"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : trailerKey ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title={`${title} — preview`}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; screen-wake-lock; web-share; clipboard-write"
                referrerPolicy="no-referrer"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : null}

            {/* Top control bar — title, servers (sm+), fullscreen toggle, close.
                pointer-events pass through except on the actual controls. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
              <span className="pointer-events-auto min-w-0 truncate text-sm font-semibold text-white/90">
                {title}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                {configured.length > 1 && (
                  <div className="pointer-events-auto mr-1 hidden items-center gap-1.5 sm:flex">
                    {configured.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveId(s.id)}
                        className={cn(
                          chip,
                          s.id === active?.id ? chipActive : chipIdle,
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={toggleFs}
                  aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
                  className={iconBtn}
                >
                  {isFs ? <CompressIcon /> : <ExpandIcon />}
                </button>
                <button
                  onClick={closePlayer}
                  aria-label="Close player"
                  className={iconBtn}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Bottom server strip on phones (where the top row is hidden). */}
            {configured.length > 1 && (
              <div className="no-scrollbar pointer-events-none absolute inset-x-0 bottom-0 z-20 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/70 to-transparent px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-8 sm:hidden">
                {configured.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={cn(
                      "pointer-events-auto flex-none",
                      chip,
                      s.id === active?.id ? chipActive : chipIdle,
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => canPlay && openPlayer()}
            disabled={!canPlay}
            className="group absolute inset-0 grid place-items-center"
            aria-label={canPlay ? "Play" : "No source available"}
          >
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
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

      {/* Inline server list — visible only while the immersive player is closed.
          Picking a server here opens the fullscreen player on that server. */}
      {!open && configured.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-ink-850/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/75">Servers</h3>
            <span className="text-xs text-white/40">
              Tap a server to play fullscreen
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {configured.map((s) => {
              const isActive = s.id === active?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => openPlayer(s.id)}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-bold transition",
                    isActive
                      ? "bg-ray-gradient text-ink-950 shadow-glow"
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
