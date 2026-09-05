"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  GridIcon,
  SearchIcon,
  BookmarkIcon,
  FireIcon,
} from "./icons";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/browse", label: "Browse", Icon: GridIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/trending", label: "Trending", Icon: FireIcon },
  { href: "/watchlist", label: "Watchlist", Icon: BookmarkIcon },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/90 backdrop-blur-xl lg:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition",
              isActive(href) ? "text-ray-300" : "text-white/55",
            )}
          >
            <Icon className="text-xl" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
