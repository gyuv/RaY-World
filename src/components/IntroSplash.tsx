"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

const SEEN_KEY = "rayworld:intro:v3";
const DURATION = 4200; // total ms before auto-dismiss

const STRANDS = 18;

/**
 * Netflix-style brand intro: on a black stage, gold + arcade-blue light strands
 * rise and shimmer, a bright "ta-dum" flash reveals the RaY-World mark, the
 * wordmark resolves, then the stage zooms in and fades to the app.
 *
 * Plays once per browser session. Respects prefers-reduced-motion (animations
 * collapse via global CSS) and is skippable.
 */
export function IntroSplash() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    setShow(true);
    document.body.style.overflow = "hidden";

    const leaveT = setTimeout(() => setLeaving(true), DURATION - 650);
    const endT = setTimeout(dismiss, DURATION);

    return () => {
      clearTimeout(leaveT);
      clearTimeout(endT);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    setLeaving(true);
    setTimeout(() => setShow(false), 550);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1 }}
      role="dialog"
      aria-label="RaY-World intro"
    >
      {/* Rising light strands */}
      <div className="absolute inset-0 flex items-stretch justify-center gap-[1.2vw] px-[4vw]">
        {Array.from({ length: STRANDS }).map((_, i) => {
          const gold = i % 2 === 0;
          const color = gold
            ? "rgba(255,215,94,0.85)"
            : "rgba(61,132,255,0.85)";
          return (
            <span
              key={i}
              className="h-full flex-1 origin-bottom rounded-full"
              style={{
                maxWidth: "10px",
                background: `linear-gradient(to top, transparent, ${color} 45%, ${
                  gold ? "#fff6d6" : "#cfe0ff"
                } 100%)`,
                filter: "blur(1px)",
                mixBlendMode: "screen",
                opacity: 0,
                animation: `nf-strand 1.9s cubic-bezier(0.22,0.61,0.36,1) ${
                  i * 45
                }ms forwards`,
              }}
            />
          );
        })}
      </div>

      {/* Center stage: flash + mark + wordmark, with a final zoom */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ animation: "nf-zoom 0.9s ease-in 3.2s forwards" }}
      >
        {/* Ta-dum flash */}
        <span
          className="pointer-events-none absolute h-[52vmin] w-[52vmin] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,215,94,0.6) 35%, rgba(31,107,255,0.25) 60%, transparent 72%)",
            opacity: 0,
            animation: "nf-flash 1.2s ease-out 1.1s forwards",
          }}
        />

        <div
          style={{
            opacity: 0,
            animation:
              "nf-mark 1.2s cubic-bezier(0.2,0.8,0.2,1) 1.1s forwards",
          }}
        >
          <LogoMark size={132} animate rings />
        </div>

        <h1
          className="mt-8 font-display text-5xl font-black tracking-tight opacity-0 sm:text-7xl tv:text-8xl"
          style={{ animation: "intro-word 0.8s ease-out 2.15s forwards" }}
        >
          <span className="text-gold-shine">RaY</span>
          <span className="text-white">-World</span>
        </h1>

        <p
          className="mt-5 text-xs uppercase tracking-[0.4em] text-arcade-200 opacity-0 sm:text-sm"
          style={{ animation: "intro-word 0.9s ease-out 2.5s forwards" }}
        >
          Tamil-first · Universal · Cinematic
        </p>
      </div>

      <button
        onClick={dismiss}
        className="absolute bottom-8 right-8 z-10 rounded-full border border-white/25 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-ray-300 hover:text-white"
      >
        Skip Intro
      </button>
    </div>
  );
}
