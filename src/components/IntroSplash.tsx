"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

const SEEN_KEY = "rayworld:intro:v3";
const DURATION = 4000; // total ms before auto-dismiss

const STRANDS = 12;

/**
 * Netflix-style brand intro that paints FIRST (before the page).
 *
 * It renders in the server HTML (initial `show = true`) so the overlay is the
 * first thing on screen — no flash of the page underneath. A tiny inline script
 * in the layout sets `data-intro-seen` on <html> before paint for repeat
 * visitors, and CSS (`:root[data-intro-seen] .intro-overlay { display:none }`)
 * hides the overlay instantly for them, so it only animates once per session.
 *
 * Every animation is transform/opacity only (GPU-composited). Skippable and
 * reduced-motion aware.
 */
export function IntroSplash() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    // Repeat visitor: the inline script already hid the overlay via CSS; just
    // unmount it and leave scrolling alone.
    if (seen) {
      setShow(false);
      return;
    }

    document.body.style.overflow = "hidden";
    const leaveT = setTimeout(() => setLeaving(true), DURATION - 600);
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
    try {
      document.documentElement.setAttribute("data-intro-seen", "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    setLeaving(true);
    setTimeout(() => setShow(false), 500);
  }

  if (!show) return null;

  return (
    <div
      className="intro-overlay fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1, contain: "strict" }}
      role="dialog"
      aria-label="RaY-World intro"
    >
      {/* Static ambient glow (painted once, never animated). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 55% at 50% 52%, rgba(31,107,255,0.18), transparent 70%)",
        }}
      />

      {/* Rising light strands — transform/opacity only, GPU-composited. */}
      <div className="absolute inset-0 flex items-stretch justify-center gap-[1.4vw] px-[6vw]">
        {Array.from({ length: STRANDS }).map((_, i) => {
          const gold = i % 2 === 0;
          const color = gold ? "rgba(255,215,94,0.9)" : "rgba(61,132,255,0.9)";
          const tip = gold ? "#fff6d6" : "#cfe0ff";
          return (
            <span
              key={i}
              className="h-full flex-1 origin-bottom rounded-full"
              style={{
                maxWidth: "8px",
                background: `linear-gradient(to top, transparent, ${color} 50%, ${tip} 100%)`,
                opacity: 0,
                willChange: "transform, opacity",
                transform: "translateZ(0)",
                animation: `nf-strand 1.7s cubic-bezier(0.22,0.61,0.36,1) ${
                  i * 40
                }ms both`,
              }}
            />
          );
        })}
      </div>

      {/* Center stage: flash + mark + wordmark, with a final zoom */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{
          willChange: "transform",
          animation: "nf-zoom 0.8s ease-in 3.1s forwards",
        }}
      >
        <span
          className="pointer-events-none absolute h-[52vmin] w-[52vmin] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,215,94,0.6) 35%, rgba(31,107,255,0.25) 60%, transparent 72%)",
            opacity: 0,
            willChange: "transform, opacity",
            animation: "nf-flash 1.1s ease-out 1.05s both",
          }}
        />

        <div
          style={{
            opacity: 0,
            willChange: "transform, opacity",
            animation: "nf-mark 1.1s cubic-bezier(0.2,0.8,0.2,1) 1.05s both",
          }}
        >
          <LogoMark size={132} animate rings />
        </div>

        <h1
          className="mt-8 font-display text-5xl font-black tracking-tight opacity-0 sm:text-7xl tv:text-8xl"
          style={{
            willChange: "transform, opacity",
            animation: "intro-word 0.7s ease-out 2.05s forwards",
          }}
        >
          <span className="text-gold-shine">RaY</span>
          <span className="text-white">-World</span>
        </h1>

        <p
          className="mt-5 text-xs uppercase tracking-[0.4em] text-arcade-200 opacity-0 sm:text-sm"
          style={{
            willChange: "transform, opacity",
            animation: "intro-word 0.8s ease-out 2.35s forwards",
          }}
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
