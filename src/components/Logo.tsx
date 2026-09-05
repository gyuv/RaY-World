import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="RaY-World home"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-ray-gradient shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink-950" aria-hidden>
          <g fill="currentColor">
            <circle cx="12" cy="12" r="3.4" />
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI) / 4;
              const x1 = 12 + Math.cos(angle) * 5.4;
              const y1 = 12 + Math.sin(angle) * 5.4;
              const x2 = 12 + Math.cos(angle) * 8.2;
              const y2 = 12 + Math.sin(angle) * 8.2;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </svg>
      </span>
      <span className="text-lg font-black tracking-tight">
        <span className="text-white">RaY</span>
        <span className="bg-ray-gradient bg-clip-text text-transparent">
          -World
        </span>
      </span>
    </Link>
  );
}
