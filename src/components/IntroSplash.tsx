"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

const SEEN_KEY = "rayworld:intro:v2";
const DURATION = 4200; // total ms before auto-dismiss

/**
 * Cinematic brand intro — an arcade-blue + shining-gold reveal that plays once
 * per browser session (like a premium streaming service open). Respects
 * prefers-reduced-motion (animations collapse via global CSS) and is skippable.
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
    document.body.style.overflow = "";
    setLeaving(true);
    setTimeout(() => setShow(false), 500);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-ink-950 transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1 }}
      role="dialog"
      aria-label="RaY-World intro"
    >
      {/* Ambient arcade glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(31,107,255,0.25), transparent 70%), radial-gradient(50% 50% at 50% 55%, rgba(245,182,12,0.18), transparent 70%)",
        }}
      />

      {/* Sweeping light rays */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-[140vmax] w-[6px] origin-center rounded-full"
            style={
              {
                ["--r"]: `${(i - 3) * 26}deg`,
                transform: `rotate(${(i - 3) * 26}deg)`,
                background:
                  "linear-gradient(to bottom, transparent, rgba(255,215,94,0.5), transparent)",
                animation: `intro-rays 2.6s ease-out ${i * 60}ms forwards`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Center stage */}
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="animate-[intro-mark_1.2s_cubic-bezier(0.2,0.8,0.2,1)_forwards]">
          <LogoMark size={128} animate rings />
        </div>

        <h1
          className="mt-8 font-display text-5xl font-black tracking-tight opacity-0 sm:text-7xl tv:text-8xl"
          style={{
            animation: "intro-word 0.9s ease-out 0.9s forwards",
          }}
        >
          <span className="text-gold-shine">RaY</span>
          <span className="text-white">-World</span>
        </h1>

        <div
          className="divider-gold mt-6 w-0 opacity-0"
          style={{ animation: "intro-word 0.8s ease-out 1.5s forwards", width: "220px" }}
        />

        <p
          className="mt-5 text-sm uppercase tracking-[0.35em] text-arcade-200 opacity-0 sm:text-base"
          style={{ animation: "intro-word 0.9s ease-out 1.7s forwards" }}
        >
          Tamil-first · Universal · Cinematic
        </p>
      </div>

      <button
        onClick={dismiss}
        className="absolute bottom-8 right-8 rounded-full border border-white/25 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-ray-300 hover:text-white"
      >
        Skip Intro
      </button>
    </div>
  );
}
