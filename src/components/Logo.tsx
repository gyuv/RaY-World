import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Pixel size of the mark. */
  size?: number;
  /** Heartbeat animation on the mark. */
  animate?: boolean;
  /** Expanding pulse-rings behind the mark (for the intro / showcase). */
  rings?: boolean;
  /** Render as a plain span (no link) — for the intro splash. */
  asStatic?: boolean;
  /** Hide the wordmark, show only the mark. */
  markOnly?: boolean;
}

/** The RaY-World brand mark: an arcade-blue badge with a shining-gold ray + heartbeat pulse. */
export function LogoMark({
  size = 36,
  animate = true,
  rings = false,
}: {
  size?: number;
  animate?: boolean;
  rings?: boolean;
}) {
  return (
    <span
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      {rings && (
        <>
          <span className="absolute inset-0 rounded-[28%] bg-ray-300/40 animate-pulse-ring" />
          <span
            className="absolute inset-0 rounded-[28%] bg-arcade-400/30 animate-pulse-ring"
            style={{ animationDelay: "1.2s" }}
          />
        </>
      )}
      <span
        className={cn(
          "relative grid h-full w-full place-items-center rounded-[28%] bg-arcade-gradient shadow-glow",
          animate && "animate-heartbeat",
        )}
      >
        <svg
          viewBox="0 0 48 48"
          className="h-[70%] w-[70%]"
          aria-hidden
          fill="none"
        >
          {/* Heartbeat / ECG ray forming an upward pulse */}
          <path
            d="M6 27 H15 L19 15 L25 34 L29 24 H34"
            stroke="#02060f"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
          <path
            d="M6 27 H15 L19 15 L25 34 L29 24 H34"
            stroke="url(#rayGold)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Play spark */}
          <path d="M34 19 L42 24 L34 29 Z" fill="url(#rayGold)" />
          <defs>
            <linearGradient id="rayGold" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#fff6d6" />
              <stop offset="50%" stopColor="#ffd75e" />
              <stop offset="100%" stopColor="#d99406" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </span>
  );
}

export function Logo({
  className,
  size = 36,
  animate = true,
  rings = false,
  asStatic = false,
  markOnly = false,
}: LogoProps) {
  const inner = (
    <>
      <LogoMark size={size} animate={animate} rings={rings} />
      {!markOnly && (
        <span
          className="font-display text-lg font-black tracking-tight"
          style={{ fontSize: size * 0.52 }}
        >
          <span className="text-gold-shine">RaY</span>
          <span className="text-white/90">-World</span>
        </span>
      )}
    </>
  );

  if (asStatic) {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ray-400 rounded-xl",
        className,
      )}
      aria-label="RaY-World home"
    >
      {inner}
    </Link>
  );
}
