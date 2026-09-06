"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";
import { BrandImage } from "./BrandImage";

const SEEN_KEY = "rayworld:intro:v3";
const DURATION = 4000; // total ms before auto-dismiss

const STRANDS = 12;

// RAYWORLD logo palette: silver → magenta → violet.
const STRAND_COLORS = [
  { body: "rgba(236,72,153,0.9)", tip: "#fbcfe8" }, // magenta
  { body: "rgba(168,85,247,0.9)", tip: "#ddd6fe" }, // violet
  { body: "rgba(203,213,225,0.9)", tip: "#ffffff" }, // silver
];

/**
 * Netflix-style brand intro that paints FIRST (before the page). Centres the
 * RAYWORLD header logo and matches its magenta→violet→silver palette.
 *
 * Renders in the server HTML (initial show=true) so the overlay paints before
 * the page; an inline script in the layout hides it for repeat visitors before
 * paint. Transform/opacity-only animations (GPU). Skippable, reduced-motion
 * aware.
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
      aria-label="RAYWORLD intro"
    >
      {/* Ambient magenta/violet glow (painted once, never animated). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 55% at 50% 52%, rgba(168,85,247,0.20), transparent 70%), radial-gradient(45% 50% at 50% 55%, rgba(236,72,153,0.14), transparent 72%)",
        }}
      />

      {/* Rising light strands in the logo palette. */}
      <div className="absolute inset-0 flex items-stretch justify-center gap-[1.4vw] px-[6vw]">
        {Array.from({ length: STRANDS }).map((_, i) => {
          const c = STRAND_COLORS[i % STRAND_COLORS.length];
          return (
            <span
              key={i}
              className="h-full flex-1 origin-bottom rounded-full"
              style={{
                maxWidth: "8px",
                background: `linear-gradient(to top, transparent, ${c.body} 50%, ${c.tip} 100%)`,
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

      {/* Center stage: flash + the header logo, with a final zoom. */}
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
              "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(236,72,153,0.6) 35%, rgba(168,85,247,0.3) 60%, transparent 72%)",
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
          <BrandImage
            src="/brand/header.png"
            alt="RAYWORLD — Discover • Watch • Enjoy"
            className="h-28 w-auto drop-shadow-[0_0_40px_rgba(168,85,247,0.35)] sm:h-36 tv:h-44"
            fallback={
              <div className="flex flex-col items-center">
                <LogoMark size={120} animate rings />
                <h1 className="mt-6 font-display text-5xl font-black tracking-tight sm:text-7xl">
                  <span className="text-white">RAY</span>
                  <span className="bg-[linear-gradient(120deg,#ec4899,#a855f7)] bg-clip-text text-transparent">
                    WORLD
                  </span>
                </h1>
                <p className="mt-4 text-xs uppercase tracking-[0.4em] text-white/50 sm:text-sm">
                  Discover • Watch • Enjoy
                </p>
              </div>
            }
          />
        </div>
      </div>

      <button
        onClick={dismiss}
        className="absolute bottom-8 right-8 z-10 rounded-full border border-white/25 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-[#ec4899] hover:text-white"
      >
        Skip Intro
      </button>
    </div>
  );
}
