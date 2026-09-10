"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BrandImage } from "./BrandImage";
import { SearchBox } from "./SearchBox";
import { MenuIcon, CloseIcon, SearchIcon } from "./icons";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/tamil", label: "Tamil" },
  { href: "/english", label: "English" },
  { href: "/trending", label: "Trending" },
  { href: "/genres", label: "Genres" },
  { href: "/watchlist", label: "Watchlist" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        scrolled || menuOpen
          ? "border-b border-white/10 bg-ink-950/70 backdrop-blur-xl"
          : "bg-gradient-to-b from-ink-950/70 via-ink-950/20 to-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center gap-4 sm:h-20">
        <Link
          href="/"
          aria-label="RAYWORLD home"
          className="rounded-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ray-400"
        >
          <BrandImage
            src="/brand/footer.png"
            alt="RAYWORLD"
            className="h-12 w-auto sm:h-16 lg:h-[68px]"
            fallback={<Logo asStatic size={44} />}
          />
        </Link>

        {/* Floating glass nav pill */}
        <nav className="mx-auto hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-1 backdrop-blur-xl lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                isActive(link.href)
                  ? "bg-ray-gradient text-ink-950 shadow-glow"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs lg:block">
          <SearchBox variant="compact" />
        </div>

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

      {/* Mobile search drawer */}
      {searchOpen && (
        <div className="container-page pb-3 lg:hidden">
          <SearchBox autoFocus />
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
