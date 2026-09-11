"use client";

/**
 * RaY-World native HLS player.
 *
 * A full, self-hosted player (no third-party iframe) built on the browser's
 * <video> element + hls.js. It plays direct .m3u8 / .mp4 sources resolved by
 * src/lib/stream-licensed.ts (getLicensedSources) — sources you are licensed to
 * serve — and exposes the full control set: auto-balancing server failover,
 * Auto+manual quality, audio-track and subtitle selection, subtitle upload and
 * sync, playback speed, sleep timer, Picture-in-Picture, AirPlay/Chromecast,
 * a lightweight Watch Party, resume-from-position, keyboard + D-pad control,
 * and true fullscreen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type Hls from "hls.js";
import type { LicensedSource } from "@/lib/stream-licensed";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ icons -- */
const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
};
const IPlay = (p: any) => (
  <svg {...s} fill="currentColor" stroke="none" {...p}>
    <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
  </svg>
);
const IPause = (p: any) => (
  <svg {...s} fill="currentColor" stroke="none" {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
const IBack10 = (p: any) => (
  <svg {...s} {...p}>
    <path d="M11 4 6 8l5 4" />
    <path d="M6 8h8a5 5 0 1 1-4.9 6" />
  </svg>
);
const IFwd10 = (p: any) => (
  <svg {...s} {...p}>
    <path d="m13 4 5 4-5 4" />
    <path d="M18 8h-8a5 5 0 1 0 4.9 6" />
  </svg>
);
const IVol = (p: any) => (
  <svg {...s} {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <path d="M16 9a3 3 0 0 1 0 6M18.5 7a6 6 0 0 1 0 10" />
  </svg>
);
const IMute = (p: any) => (
  <svg {...s} {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
);
const IFull = (p: any) => (
  <svg {...s} {...p}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);
const IPip = (p: any) => (
  <svg {...s} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <rect x="12" y="11" width="7" height="5" rx="1" fill="currentColor" stroke="none" />
  </svg>
);
const ICc = (p: any) => (
  <svg {...s} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M9 10.5a2 2 0 1 0 0 3M16 10.5a2 2 0 1 0 0 3" />
  </svg>
);
const IGear = (p: any) => (
  <svg {...s} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 12a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.3 7.3 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.3 7.3 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.3 7.3 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.3 7.3 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2Z" />
  </svg>
);
const ICast = (p: any) => (
  <svg {...s} {...p}>
    <path d="M3 6h18v12h-6" />
    <path d="M3 12a6 6 0 0 1 6 6M3 16a2 2 0 0 1 2 2M3 20h.01" />
  </svg>
);
const ICloud = (p: any) => (
  <svg {...s} {...p}>
    <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 18 18H7Z" />
  </svg>
);
const IArrowLeft = (p: any) => (
  <svg {...s} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const IMoon = (p: any) => (
  <svg {...s} {...p}>
    <path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z" />
  </svg>
);
const IPeople = (p: any) => (
  <svg {...s} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" />
  </svg>
);
const ICheck = (p: any) => (
  <svg {...s} {...p}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);
const IChevron = (p: any) => (
  <svg {...s} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
const IUpload = (p: any) => (
  <svg {...s} {...p}>
    <path d="M12 16V4m0 0L8 8m4-4 4 4" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

/* --------------------------------------------------------------- helpers -- */
function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = Math.floor(sec % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? h + ":" : ""}${mm}:${String(ss).padStart(2, "0")}`;
}

function flagEmoji(region?: string): string {
  if (!region || region.length !== 2) return "🎬";
  const A = 0x1f1e6;
  const cc = region.toUpperCase();
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65, A + cc.charCodeAt(1) - 65);
}

// Convert an .srt file's text to WebVTT so the browser can render it.
function srtToVtt(src: string): string {
  const body = src
    .replace(/\r+/g, "")
    .replace(/^\d+\s*$/gm, "") // strip sequence numbers
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2"); // comma → dot
  return "WEBVTT\n\n" + body.trim() + "\n";
}

type QualityLevel = { index: number; height: number; bitrate: number };
type MenuId = null | "settings" | "quality" | "audio" | "subs" | "servers" | "speed" | "sleep" | "party";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_MINS = [15, 30, 45, 60, 90];

/* ------------------------------------------------------------- component -- */
export function HlsPlayer({
  sources,
  title,
  subtitle,
  poster,
  logo,
  storageKey,
  onExit,
}: {
  sources: LicensedSource[];
  title: string;
  subtitle?: string;
  poster?: string | null;
  logo?: string | null;
  /** localStorage key for resume-from-position (e.g. "movie-123"). */
  storageKey?: string;
  onExit?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const customTrackRef = useRef<HTMLTrackElement | null>(null);
  const uploadedCuesRef = useRef<{ start: number; end: number; text: string }[] | null>(null);
  const partyRef = useRef<BroadcastChannel | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const valid = useMemo(() => sources.filter((x) => x.url), [sources]);
  const [serverIdx, setServerIdx] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("loading");

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [menu, setMenu] = useState<MenuId>(null);

  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [levelIdx, setLevelIdx] = useState(-1); // -1 = Auto
  const [audioTracks, setAudioTracks] = useState<{ id: number; name: string }[]>([]);
  const [audioIdx, setAudioIdx] = useState(0);
  const [subTracks, setSubTracks] = useState<{ id: number; name: string }[]>([]);
  const [subIdx, setSubIdx] = useState(-1); // -1 = off
  const [subOffset, setSubOffset] = useState(0);
  const [hasUpload, setHasUpload] = useState(false);

  const [sleepMin, setSleepMin] = useState<number | null>(null);
  const [party, setParty] = useState<string | null>(null);
  const [canCast, setCanCast] = useState(false);

  const activeSource = valid[serverIdx];

  /* ---- load / attach a source (with auto-failover) ---- */
  const attach = useCallback(
    async (idx: number) => {
      const video = videoRef.current;
      const src = valid[idx];
      if (!video || !src) {
        setStatus("error");
        return;
      }
      setStatus("loading");
      // Tear down any previous hls instance.
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setLevels([]);
      setAudioTracks([]);
      setSubTracks([]);
      setLevelIdx(-1);

      const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl");

      if (src.kind === "file" || (src.kind === "hls" && canNativeHls)) {
        video.src = src.url;
        setStatus("ready");
        return;
      }

      // hls.js path (Chrome/Firefox/Edge).
      const HlsMod = (await import("hls.js")).default;
      if (!HlsMod.isSupported()) {
        video.src = src.url; // last-ditch native attempt
        setStatus("ready");
        return;
      }
      const hls = new HlsMod({ enableWorker: true, lowLatencyMode: false });
      hlsRef.current = hls;
      hls.loadSource(src.url);
      hls.attachMedia(video);

      hls.on(HlsMod.Events.MANIFEST_PARSED, () => {
        setLevels(
          hls.levels.map((l, i) => ({
            index: i,
            height: l.height || 0,
            bitrate: l.bitrate || 0,
          })),
        );
        setStatus("ready");
      });
      hls.on(HlsMod.Events.LEVEL_SWITCHED, (_e, d) => {
        if (hls.autoLevelEnabled) setLevelIdx(-1);
        else setLevelIdx(d.level);
      });
      hls.on(HlsMod.Events.AUDIO_TRACKS_UPDATED, () => {
        setAudioTracks(hls.audioTracks.map((t, i) => ({ id: i, name: t.name || t.lang || `Track ${i + 1}` })));
        setAudioIdx(hls.audioTrack);
      });
      hls.on(HlsMod.Events.SUBTITLE_TRACKS_UPDATED, () => {
        setSubTracks(
          hls.subtitleTracks.map((t, i) => ({ id: i, name: t.name || t.lang || `Subtitle ${i + 1}` })),
        );
      });
      hls.on(HlsMod.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        // Fatal error → try to recover, else fail over to the next server.
        if (data.type === HlsMod.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === HlsMod.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hlsRef.current = null;
          if (idx + 1 < valid.length) {
            setServerIdx(idx + 1);
          } else {
            setStatus("error");
          }
        }
      });
    },
    [valid],
  );

  useEffect(() => {
    if (valid.length === 0) {
      setStatus("error");
      return;
    }
    attach(serverIdx);
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverIdx, valid]);

  /* ---- <video> event wiring ---- */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrent(v.currentTime);
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onDur = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVol = () => {
      setVolume(v.volume);
      setMuted(v.muted);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("durationchange", onDur);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVol);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onDur);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVol);
    };
  }, []);

  /* ---- resume from last position ---- */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !storageKey || status !== "ready") return;
    try {
      const saved = Number(localStorage.getItem(`rw-pos-${storageKey}`));
      if (saved > 5 && (!v.duration || saved < v.duration - 10)) v.currentTime = saved;
    } catch {}
  }, [status, storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const t = setInterval(() => {
      const v = videoRef.current;
      if (v && v.currentTime > 0) {
        try {
          localStorage.setItem(`rw-pos-${storageKey}`, String(Math.floor(v.currentTime)));
        } catch {}
      }
    }, 5000);
    return () => clearInterval(t);
  }, [storageKey]);

  /* ---- Chromecast availability (Google Cast SDK, loaded once) ---- */
  useEffect(() => {
    const w = window as any;
    if (w.__castChecked) {
      setCanCast(Boolean(w.chrome?.cast));
      return;
    }
    w.__castChecked = true;
    w.__onGCastApiAvailable = (ok: boolean) => setCanCast(ok);
    if (!document.querySelector('script[data-cast]')) {
      const el = document.createElement("script");
      el.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
      el.async = true;
      el.setAttribute("data-cast", "1");
      document.head.appendChild(el);
    }
  }, []);

  /* ---- fullscreen tracking ---- */
  useEffect(() => {
    const on = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  /* ---- auto-hide controls ---- */
  const poke = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, 3200);
  }, []);
  useEffect(() => {
    poke();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [poke]);

  /* ---- actions ---- */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);
  const seek = useCallback((to: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration || to, to));
  }, []);
  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (v) seek(v.currentTime + delta);
  }, [seek]);
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  }, []);
  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => {});
  }, []);
  const togglePip = useCallback(async () => {
    const v = videoRef.current as any;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await (document as any).exitPictureInPicture();
      else await v.requestPictureInPicture?.();
    } catch {}
  }, []);

  const setQuality = (i: number) => {
    const hls = hlsRef.current;
    if (hls) hls.currentLevel = i; // -1 = auto
    setLevelIdx(i);
    setMenu(null);
  };
  const setAudio = (i: number) => {
    const hls = hlsRef.current;
    if (hls) hls.audioTrack = i;
    setAudioIdx(i);
    setMenu(null);
  };
  const setSubtitle = (i: number) => {
    const hls = hlsRef.current;
    if (hls) hls.subtitleTrack = i; // -1 = off
    // Native text tracks (uploaded / native-hls) mirror.
    const v = videoRef.current;
    if (v) {
      for (let k = 0; k < v.textTracks.length; k++) {
        v.textTracks[k].mode = "disabled";
      }
    }
    setSubIdx(i);
    setMenu(null);
  };
  const setSpeed = (r: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = r;
    setRate(r);
    setMenu(null);
  };

  /* ---- subtitle upload + sync ---- */
  const applyUploadOffset = useCallback((offset: number) => {
    const v = videoRef.current;
    const cues = uploadedCuesRef.current;
    const track = customTrackRef.current?.track;
    if (!v || !cues || !track) return;
    while (track.cues && track.cues.length) track.removeCue(track.cues[0]);
    for (const c of cues) {
      try {
        const cue = new VTTCue(Math.max(0, c.start + offset), Math.max(0, c.end + offset), c.text);
        track.addCue(cue);
      } catch {}
    }
  }, []);

  const onUpload = useCallback(
    async (file: File) => {
      const v = videoRef.current;
      if (!v) return;
      const raw = await file.text();
      const isSrt = /\.srt$/i.test(file.name) || !/^WEBVTT/.test(raw.trim());
      const vtt = isSrt ? srtToVtt(raw) : raw;

      // Parse cues so we can re-apply a sync offset later.
      const cues: { start: number; end: number; text: string }[] = [];
      const re =
        /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})([^\n]*)\n([\s\S]*?)(?=\n\n|\n*$)/g;
      let m: RegExpExecArray | null;
      const toSec = (h: string, mi: string, se: string, ms: string) =>
        +h * 3600 + +mi * 60 + +se + +ms / 1000;
      while ((m = re.exec(vtt))) {
        cues.push({
          start: toSec(m[1], m[2], m[3], m[4]),
          end: toSec(m[5], m[6], m[7], m[8]),
          text: m[10].trim().replace(/<[^>]+>/g, ""),
        });
      }
      uploadedCuesRef.current = cues;

      // (Re)create a managed text track.
      if (customTrackRef.current) customTrackRef.current.remove();
      const trackEl = document.createElement("track");
      trackEl.kind = "subtitles";
      trackEl.label = `Uploaded — ${file.name}`;
      trackEl.default = true;
      v.appendChild(trackEl);
      customTrackRef.current = trackEl;
      // Disable other tracks and show ours.
      for (let k = 0; k < v.textTracks.length; k++) v.textTracks[k].mode = "disabled";
      trackEl.track.mode = "showing";
      applyUploadOffset(subOffset);
      setHasUpload(true);
      setSubIdx(-2); // -2 = uploaded
      setMenu(null);
    },
    [applyUploadOffset, subOffset],
  );

  useEffect(() => {
    applyUploadOffset(subOffset);
  }, [subOffset, applyUploadOffset]);

  /* ---- sleep timer ---- */
  useEffect(() => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    if (sleepMin) {
      sleepTimer.current = setTimeout(() => {
        videoRef.current?.pause();
        setSleepMin(null);
      }, sleepMin * 60_000);
    }
    return () => {
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
    };
  }, [sleepMin]);

  /* ---- watch party (same-browser sync via BroadcastChannel) ---- */
  const startParty = useCallback(() => {
    const existing = new URLSearchParams(window.location.search).get("party");
    const room = existing || Math.random().toString(36).slice(2, 8);
    const ch = new BroadcastChannel(`rw-party-${room}`);
    partyRef.current = ch;
    ch.onmessage = (ev) => {
      const v = videoRef.current;
      if (!v) return;
      const { t, action } = ev.data || {};
      if (typeof t === "number" && Math.abs(v.currentTime - t) > 1.2) v.currentTime = t;
      if (action === "play") v.play().catch(() => {});
      if (action === "pause") v.pause();
    };
    const v = videoRef.current;
    const emit = (action?: string) => ch.postMessage({ t: v?.currentTime ?? 0, action });
    v?.addEventListener("play", () => emit("play"));
    v?.addEventListener("pause", () => emit("pause"));
    v?.addEventListener("seeked", () => emit());
    const url = new URL(window.location.href);
    url.searchParams.set("party", room);
    window.history.replaceState({}, "", url.toString());
    try {
      navigator.clipboard?.writeText(url.toString());
    } catch {}
    setParty(room);
    setMenu(null);
  }, []);

  const startCast = useCallback(() => {
    const w = window as any;
    const src = activeSource?.url;
    try {
      const ctx = w.cast?.framework?.CastContext?.getInstance();
      ctx?.requestSession().then(() => {
        const session = ctx.getCurrentSession();
        const media = new w.chrome.cast.media.MediaInfo(src, "application/x-mpegURL");
        const req = new w.chrome.cast.media.LoadRequest(media);
        session?.loadMedia(req);
      });
    } catch {}
  }, [activeSource]);

  /* ---- keyboard / D-pad ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      poke();
      switch (e.key) {
        case " ":
        case "k":
        case "Enter":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "ArrowUp":
          if (videoRef.current) videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
          break;
        case "ArrowDown":
          if (videoRef.current) videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "c":
          setMenu((x) => (x === "subs" ? null : "subs"));
          break;
        case "Escape":
          if (menu) setMenu(null);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [poke, togglePlay, skip, toggleFullscreen, toggleMute, menu]);

  const pct = duration ? (current / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  /* ------------------------------------------------------------- render -- */
  return (
    <div
      ref={wrapRef}
      className={cn(
        "group relative aspect-video w-full select-none overflow-hidden rounded-2xl bg-black ring-1 ring-white/10",
        fullscreen && "!aspect-auto !h-screen !w-screen !rounded-none",
        !showControls && "cursor-none",
      )}
      onMouseMove={poke}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.surface) togglePlay();
        if (menu) setMenu(null);
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        poster={poster ?? undefined}
        playsInline
        autoPlay
        className="absolute inset-0 h-full w-full bg-black"
        data-surface
      />

      {/* loading / error overlays */}
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/40">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-ray-400" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 px-6 text-center">
          <div>
            <p className="text-lg font-bold text-white">No available source</p>
            <p className="mt-1 max-w-sm text-sm text-white/60">
              No authorized stream is configured for this title yet. Add a licensed source in{" "}
              <code className="text-ray-300">getLicensedSources</code> and it will play here.
            </p>
          </div>
        </div>
      )}

      {/* top bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <button
          onClick={onExit}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
        >
          <IArrowLeft className="text-xl" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold text-white sm:text-base">{title}</p>
          {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
        </div>
        <button
          onClick={startCast}
          aria-label="Cast"
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10",
            canCast ? "text-white/90" : "text-white/30",
          )}
        >
          <ICast className="text-xl" />
        </button>
      </div>

      {/* center transport */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-8 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <button
          onClick={() => skip(-10)}
          aria-label="Back 10 seconds"
          className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
        >
          <IBack10 className="text-3xl" />
        </button>
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="pointer-events-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:scale-105 hover:bg-white/20"
        >
          {playing ? <IPause className="text-3xl" /> : <IPlay className="text-3xl" />}
        </button>
        <button
          onClick={() => skip(10)}
          aria-label="Forward 10 seconds"
          className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
        >
          <IFwd10 className="text-3xl" />
        </button>
      </div>

      {/* bottom bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* progress */}
        <div className="group/bar relative mb-2 h-4 cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="absolute inset-0 z-10 h-4 w-full cursor-pointer opacity-0"
          />
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/25">
            <div className="absolute h-full rounded-full bg-white/25" style={{ width: `${bufPct}%` }} />
            <div className="absolute h-full rounded-full bg-ray-gradient" style={{ width: `${pct}%` }} />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition group-hover/bar:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 text-white">
          <ControlBtn onClick={togglePlay} label={playing ? "Pause" : "Play"}>
            {playing ? <IPause className="text-xl" /> : <IPlay className="text-xl" />}
          </ControlBtn>

          {/* volume */}
          <div className="group/vol flex items-center">
            <ControlBtn onClick={toggleMute} label="Mute">
              {muted || volume === 0 ? <IMute className="text-xl" /> : <IVol className="text-xl" />}
            </ControlBtn>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = videoRef.current;
                if (v) {
                  v.volume = Number(e.target.value);
                  v.muted = Number(e.target.value) === 0;
                }
              }}
              aria-label="Volume"
              className="h-1 w-0 cursor-pointer accent-white opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100"
            />
          </div>

          <span className="ml-1 text-xs tabular-nums text-white/80">
            {fmtTime(current)} <span className="text-white/40">/ {fmtTime(duration)}</span>
          </span>

          <div className="flex-1" />

          {party && (
            <span className="mr-1 hidden items-center gap-1 rounded-full bg-ray-500/20 px-2 py-1 text-[11px] font-semibold text-ray-200 sm:flex">
              <IPeople /> Party {party}
            </span>
          )}

          <ControlBtn onClick={() => setMenu((x) => (x === "servers" ? null : "servers"))} label="Servers">
            <ICloud className="text-xl" />
          </ControlBtn>
          <ControlBtn onClick={() => setMenu((x) => (x === "subs" ? null : "subs"))} label="Subtitles" active={subIdx !== -1}>
            <ICc className="text-xl" />
          </ControlBtn>
          <ControlBtn onClick={() => setMenu((x) => (x === "settings" ? null : "settings"))} label="Settings">
            <IGear className="text-xl" />
          </ControlBtn>
          <ControlBtn onClick={togglePip} label="Picture in picture" className="hidden sm:grid">
            <IPip className="text-xl" />
          </ControlBtn>
          <ControlBtn onClick={toggleFullscreen} label="Fullscreen">
            <IFull className="text-xl" />
          </ControlBtn>
        </div>
      </div>

      {/* ---- menus ---- */}
      {menu && (
        <div
          className="absolute bottom-20 right-4 z-30 w-72 max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-ink-950/85 shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {menu === "settings" && (
            <SettingsMenu
              quality={levelIdx === -1 ? "Auto" : `${levels.find((l) => l.index === levelIdx)?.height || ""}p`}
              server={activeSource?.label ?? "—"}
              subs={subIdx === -1 ? "Off" : subIdx === -2 ? "Uploaded" : subTracks[subIdx]?.name ?? "On"}
              audio={audioTracks[audioIdx]?.name ?? "Track 1"}
              speed={rate}
              sleep={sleepMin}
              onPick={setMenu}
              onParty={startParty}
              hasParty={Boolean(party)}
            />
          )}
          {menu === "quality" && (
            <RadioMenu
              title="Quality"
              onBack={() => setMenu("settings")}
              value={levelIdx}
              options={[
                { id: -1, label: "Auto" },
                ...levels
                  .slice()
                  .sort((a, b) => b.height - a.height)
                  .map((l) => ({ id: l.index, label: `${l.height}p` })),
              ]}
              onSelect={setQuality}
            />
          )}
          {menu === "audio" && (
            <RadioMenu
              title="Audio"
              onBack={() => setMenu("settings")}
              value={audioIdx}
              options={
                audioTracks.length
                  ? audioTracks.map((t) => ({ id: t.id, label: t.name }))
                  : [{ id: 0, label: "Track 1" }]
              }
              onSelect={setAudio}
            />
          )}
          {menu === "speed" && (
            <RadioMenu
              title="Playback speed"
              onBack={() => setMenu("settings")}
              value={rate}
              options={SPEEDS.map((r) => ({ id: r, label: r === 1 ? "Normal" : `${r}×` }))}
              onSelect={setSpeed}
            />
          )}
          {menu === "sleep" && (
            <RadioMenu
              title="Sleep timer"
              onBack={() => setMenu("settings")}
              value={sleepMin ?? 0}
              options={[{ id: 0, label: "Off" }, ...SLEEP_MINS.map((m) => ({ id: m, label: `${m} min` }))]}
              onSelect={(v) => {
                setSleepMin(v === 0 ? null : v);
                setMenu(null);
              }}
            />
          )}
          {menu === "servers" && (
            <div className="p-2">
              <MenuHeader title="Servers" hint="Auto-failover" />
              {valid.map((sv, i) => (
                <MenuRow key={sv.id} active={i === serverIdx} onClick={() => {
                  setServerIdx(i);
                  setMenu(null);
                }}>
                  <span className="mr-2">{flagEmoji(sv.region)}</span>
                  {sv.label}
                </MenuRow>
              ))}
              {valid.length === 0 && <p className="px-3 py-2 text-sm text-white/50">No sources configured.</p>}
            </div>
          )}
          {menu === "subs" && (
            <SubtitleMenu
              value={subIdx}
              tracks={subTracks}
              offset={subOffset}
              hasUpload={hasUpload}
              onSelect={setSubtitle}
              onOffset={setSubOffset}
              onUpload={onUpload}
            />
          )}
        </div>
      )}

      {/* brand watermark */}
      {logo && showControls && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          className="pointer-events-none absolute right-4 top-16 z-10 hidden h-6 w-auto opacity-70 sm:block"
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------- subcomponents */
function ControlBtn({
  children,
  onClick,
  label,
  active,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15",
        active ? "text-ray-300" : "text-white/90",
        className,
      )}
    >
      {children}
    </button>
  );
}

function MenuHeader({ title, hint, onBack }: { title: string; hint?: string; onBack?: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 pb-2 pt-1">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="text-white/70 hover:text-white">
            <IChevron className="rotate-180 text-lg" />
          </button>
        )}
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      {hint && <span className="text-[11px] text-white/40">{hint}</span>}
    </div>
  );
}

function MenuRow({
  children,
  active,
  onClick,
  right,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  right?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
    >
      <span className="flex items-center">{children}</span>
      {right ?? (active ? <ICheck className="text-base text-ray-300" /> : null)}
    </button>
  );
}

function SettingsMenu({
  quality,
  server,
  subs,
  audio,
  speed,
  sleep,
  onPick,
  onParty,
  hasParty,
}: {
  quality: string;
  server: string;
  subs: string;
  audio: string;
  speed: number;
  sleep: number | null;
  onPick: (m: MenuId) => void;
  onParty: () => void;
  hasParty: boolean;
}) {
  const Tile = ({ label, value, onClick }: { label: string; value: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold text-white">{value}</div>
    </button>
  );
  return (
    <div className="p-2">
      <div className="mb-2 flex gap-2 px-1">
        <Tile label="Quality" value={quality} onClick={() => onPick("quality")} />
        <Tile label="Server" value={server} onClick={() => onPick("servers")} />
      </div>
      <div className="mb-2 flex gap-2 px-1">
        <Tile label="Subtitles" value={subs} onClick={() => onPick("subs")} />
        <Tile label="Audio" value={audio} onClick={() => onPick("audio")} />
      </div>
      <div className="mt-1 border-t border-white/10 pt-1">
        <MenuRow onClick={() => onPick("speed")} right={<span className="text-xs text-white/50">{speed === 1 ? "Normal" : `${speed}×`}</span>}>
          Playback speed
        </MenuRow>
        <MenuRow onClick={() => onPick("sleep")} right={<span className="text-xs text-white/50">{sleep ? `${sleep} min` : "Off"}</span>}>
          <IMoon className="mr-2 text-base" /> Sleep timer
        </MenuRow>
        <MenuRow onClick={onParty} right={<span className="text-xs text-white/50">{hasParty ? "On" : ""}</span>}>
          <IPeople className="mr-2 text-base" /> Watch Party
        </MenuRow>
      </div>
    </div>
  );
}

function RadioMenu<T extends number>({
  title,
  options,
  value,
  onSelect,
  onBack,
}: {
  title: string;
  options: { id: T; label: string }[];
  value: T;
  onSelect: (v: T) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-h-80 overflow-y-auto p-2">
      <MenuHeader title={title} onBack={onBack} />
      {options.map((o) => (
        <MenuRow key={String(o.id)} active={o.id === value} onClick={() => onSelect(o.id)}>
          {o.label}
        </MenuRow>
      ))}
    </div>
  );
}

function SubtitleMenu({
  value,
  tracks,
  offset,
  hasUpload,
  onSelect,
  onOffset,
  onUpload,
}: {
  value: number;
  tracks: { id: number; name: string }[];
  offset: number;
  hasUpload: boolean;
  onSelect: (i: number) => void;
  onOffset: (v: number) => void;
  onUpload: (f: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="max-h-96 overflow-y-auto p-2">
      <MenuHeader title="Subtitles" />
      <MenuRow active={value === -1} onClick={() => onSelect(-1)}>
        Off
      </MenuRow>
      {tracks.map((t) => (
        <MenuRow key={t.id} active={value === t.id} onClick={() => onSelect(t.id)}>
          {t.name}
        </MenuRow>
      ))}
      {hasUpload && (
        <MenuRow active={value === -2} onClick={() => onSelect(-2)}>
          Uploaded file
        </MenuRow>
      )}

      <div className="mt-1 border-t border-white/10 pt-1">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
        >
          <IUpload className="text-base" /> Upload subtitle file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".srt,.vtt"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = "";
          }}
        />
        <div className="px-3 py-2">
          <div className="mb-1 flex items-center justify-between text-xs text-white/60">
            <span>Sync subtitle</span>
            <span className="tabular-nums text-white/80">
              {offset > 0 ? "+" : ""}
              {offset.toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOffset(Math.round((offset - 0.5) * 10) / 10)}
              className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              −
            </button>
            <input
              type="range"
              min={-10}
              max={10}
              step={0.1}
              value={offset}
              onChange={(e) => onOffset(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-ray-400"
            />
            <button
              onClick={() => onOffset(Math.round((offset + 0.5) * 10) / 10)}
              className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
