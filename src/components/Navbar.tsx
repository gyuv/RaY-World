"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BrandImage } from "./BrandImage";
import { SearchBox } from "./SearchBox";
import {
  MenuIcon,
  CloseIcon,
  SearchIcon,
  GearIcon,
  HomeIcon,
  FilmIcon,
  TvIcon,
  BookmarkIcon,
} from "./icons";
import { cn } from "@/lib/utils";

// Compact primary nav (desktop pill) — icon + label.
const PRIMARY = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/movies", label: "Movies", Icon: FilmIcon },
  { href: "/series", label: "Shows", Icon: TvIcon },
  { href: "/watchlist", label: "My List", Icon: BookmarkIcon },
];

// Full list for the mobile menu.
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/tamil", label: "Tamil" },
  { href: "/english", label: "English" },
  { href: "/trending", label: "Trending" },
  { href: "/genres", label: "Genres" },
  { href: "/watchlist", label: "My List" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        // Transparent at all times (including on scroll). Only the open
        // mobile menu / search panel gets a backdrop so its content stays
        // legible; the floating nav pill and logo carry their own contrast.
        menuOpen || searchOpen
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-24 items-center gap-4 sm:h-28 lg:h-32">
        <Link
          href="/"
          aria-label="RAYWORLD home"
          className="rounded-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ray-400"
        >
          <BrandImage
            src="/brand/footer.png"
            alt="RAYWORLD"
            className="h-[76px] w-auto sm:h-[100px] lg:h-[120px]"
            fallback={<Logo asStatic size={52} />}
          />
        </Link>

        {/* Right-aligned glass nav pill (desktop) */}
        <nav className="ml-auto hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.07] p-1.5 backdrop-blur-xl lg:flex">
          {PRIMARY.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                isActive(href)
                  ? "bg-white text-ink-950 shadow"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="text-base" />
              {label}
            </Link>
          ))}

          <span className="mx-1 h-6 w-px bg-white/15" />

          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full transition",
              searchOpen
                ? "bg-white text-ink-950"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <SearchIcon className="text-lg" />
          </button>

          <Link
            href="/genres"
            aria-label="Settings & categories"
            className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <GearIcon className="text-lg" />
          </Link>
        </nav>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10"
          >
            <SearchIcon className="text-xl" />
          </button>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10"
          >
            {menuOpen ? <CloseIcon className="text-xl" /> : <MenuIcon className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Search overlay (desktop + mobile) — opens on click */}
      {searchOpen && (
        <div className="container-page pb-3">
          <div className="mx-auto max-w-2xl">
            <SearchBox autoFocus />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="container-page grid gap-1 pb-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-4 py-3 text-base font-medium transition",
                isActive(link.href)
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
