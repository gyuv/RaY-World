import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Brand rendition of the RAYWORLD logo: a dark rounded "RY" badge (silver R,
 * magenta→violet Y) + the RAYWORLD wordmark (RAY white, WORLD gradient) and the
 * "Discover • Watch • Enjoy" tagline.
 *
 * TO USE THE EXACT ARTWORK: drop your exported files in `public/brand/`
 * (rayworld-mark.svg, rayworld-lockup.svg) and replace the inner markup of
 * LogoMark / the wordmark with <img src="/brand/…"/>. Everything else that
 * imports Logo/LogoMark will pick it up automatically.
 */

interface LogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
  rings?: boolean;
  asStatic?: boolean;
  markOnly?: boolean;
  tagline?: boolean;
}

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
          <span className="absolute inset-0 rounded-[26%] bg-glow-500/40 animate-pulse-ring" />
          <span
            className="absolute inset-0 rounded-[26%] bg-[#a855f7]/30 animate-pulse-ring"
            style={{ animationDelay: "1.2s" }}
          />
        </>
      )}
      <span
        className={cn(
          "relative grid h-full w-full place-items-center rounded-[26%] bg-gradient-to-br from-ink-800 to-ink-950 shadow-glow ring-1 ring-white/15",
          animate && "animate-heartbeat",
        )}
      >
        <span
          className="font-display font-black leading-none tracking-tighter"
          style={{ fontSize: size * 0.48 }}
        >
          <span className="bg-[linear-gradient(160deg,#ffffff,#9aa2ba)] bg-clip-text text-transparent">
            R
          </span>
          <span className="bg-[linear-gradient(160deg,#f472b6,#a855f7)] bg-clip-text text-transparent">
            Y
          </span>
        </span>
      </span>
    </span>
  );
}

function Wordmark({ size, tagline }: { size: number; tagline?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span
        className="font-display font-black tracking-tight"
        style={{ fontSize: size * 0.5 }}
      >
        <span className="text-white">RAY</span>
        <span className="bg-[linear-gradient(120deg,#ec4899,#a855f7)] bg-clip-text text-transparent">
          WORLD
        </span>
      </span>
      {tagline && (
        <span
          className="mt-1 font-semibold uppercase text-white/45"
          style={{ fontSize: Math.max(8, size * 0.16), letterSpacing: "0.28em" }}
        >
          Discover • Watch • Enjoy
        </span>
      )}
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
  tagline = false,
}: LogoProps) {
  const inner = (
    <>
      <LogoMark size={size} animate={animate} rings={rings} />
      {!markOnly && <Wordmark size={size} tagline={tagline} />}
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
        "group inline-flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ray-400",
        className,
      )}
      aria-label="RAYWORLD home"
    >
      {inner}
    </Link>
  );
}
