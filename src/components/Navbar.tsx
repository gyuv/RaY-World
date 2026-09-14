"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BrandImage } from "./BrandImage";
import { SearchBox } from "./SearchBox";
import { MenuIcon, CloseIcon, SearchIcon } from "./icons";
import { cn } from "@/lib/utils";

// Full category list — reached from the top-bar "more" menu. Primary
// destinations (Home / Movies / Shows / Trending / My List) live in the
// floating bottom bubble; this covers the extra language & discovery pages.
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
        // Transparent at rest; only the open menu / search panel gets a
        // backdrop so its content stays legible.
        menuOpen || searchOpen
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-24 items-center gap-4 sm:h-28 lg:h-32">
        <Link
          href="/"
          aria-label="RAYWORLD home"
          className="relative -mt-2 rounded-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ray-400 sm:-mt-3 lg:-mt-4"
        >
          {/* Rhythmic white pulse behind the logo */}
          <span
            aria-hidden
            className="logo-pulse pointer-events-none absolute inset-0 rounded-full bg-white/40 blur-2xl"
          />
          <BrandImage
            src="/brand/footer.png"
            alt="RAYWORLD"
            className="relative h-[76px] w-auto sm:h-[100px] lg:h-[120px]"
            fallback={<Logo asStatic size={52} />}
          />
        </Link>

        {/* Actions — search + more-categories menu, at every size */}
        <div className="ml-auto -mt-1 flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition tv:h-12 tv:w-12",
              searchOpen
                ? "bg-white text-ink-950"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <SearchIcon className="text-xl" />
          </button>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition tv:h-12 tv:w-12",
              menuOpen
                ? "bg-white text-ink-950"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            {menuOpen ? <CloseIcon className="text-xl" /> : <MenuIcon className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Search overlay — opens on click */}
      {searchOpen && (
        <div className="container-page pb-3">
          <div className="mx-auto max-w-2xl">
            <SearchBox autoFocus />
          </div>
        </div>
      )}

      {/* Categories menu */}
      {menuOpen && (
        <nav className="container-page grid gap-1 pb-4 sm:grid-cols-2 lg:grid-cols-4">
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
