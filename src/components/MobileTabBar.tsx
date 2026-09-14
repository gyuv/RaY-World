"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  FilmIcon,
  TvIcon,
  FireIcon,
  BookmarkIcon,
} from "./icons";
import { cn } from "@/lib/utils";

// Primary navigation — icon-only until selected. The active item expands into
// a pill that reveals its label, everything else stays a bare glyph.
const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/movies", label: "Movies", Icon: FilmIcon },
  { href: "/series", label: "Shows", Icon: TvIcon },
  { href: "/trending", label: "Trending", Icon: FireIcon },
  { href: "/watchlist", label: "My List", Icon: BookmarkIcon },
];

/**
 * Floating, transparent "bubble" navigation docked to the bottom of every
 * screen (phone, tablet, desktop and TV). Each destination is shown as its
 * icon only; selecting one expands it into a labelled gold pill while the rest
 * collapse back to glyphs — a compact, remote-friendly primary menu.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      <nav className="nav-bubble flex items-center gap-1 rounded-full border border-white/12 bg-ink-950/55 p-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.85)]">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center rounded-full outline-none transition-colors duration-300",
                active
                  ? "bg-ray-gradient text-ink-950 shadow"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="grid h-11 w-11 flex-none place-items-center tv:h-14 tv:w-14">
                <Icon className="text-[1.35rem] tv:text-[1.7rem]" />
              </span>
              {/* Label reveals only for the active item (smooth width expand). */}
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap text-sm font-semibold tracking-tight transition-all duration-300 ease-out tv:text-base",
                  active
                    ? "max-w-[7rem] pr-4 opacity-100"
                    : "max-w-0 pr-0 opacity-0",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
