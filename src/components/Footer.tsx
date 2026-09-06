import Link from "next/link";
import { Logo } from "./Logo";
import { BrandImage } from "./BrandImage";
import { LANGUAGES } from "@/lib/config/languages";
import { GENRES } from "@/lib/config/genres";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-ink-950/60">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" aria-label="RAYWORLD home" className="inline-block">
            <BrandImage
              src="/brand/footer.png"
              alt="RAYWORLD — Discover • Watch • Enjoy"
              className="h-20 w-auto"
              fallback={<Logo tagline asStatic />}
            />
          </Link>
          <p className="max-w-xs text-sm text-white/50">
            A Tamil-first universal entertainment discovery platform. Explore
            movies and series across every language.
          </p>
        </div>

        <FooterCol title="Discover">
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/movies">Movies</FooterLink>
          <FooterLink href="/series">Series</FooterLink>
          <FooterLink href="/trending">Trending</FooterLink>
          <FooterLink href="/browse">Browse</FooterLink>
        </FooterCol>

        <FooterCol title="Languages">
          {LANGUAGES.slice(0, 7).map((l) => (
            <FooterLink key={l.code} href={`/browse?language=${l.code}`}>
              {l.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Genres">
          {GENRES.slice(0, 7).map((g) => (
            <FooterLink key={g.slug} href={`/genre/${g.slug}`}>
              {g.name}
            </FooterLink>
          ))}
        </FooterCol>
      </div>

      <div className="container-page space-y-2 border-t border-white/10 py-6 text-xs text-white/40">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>© {new Date().getFullYear()} RaY-World. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/disclaimer" className="hover:text-ray-300">
              Disclaimer
            </Link>
            <span className="text-white/50">
              Metadata by TMDB — not endorsed or certified by TMDB.
            </span>
          </div>
        </div>
        <p className="text-center text-white/30 sm:text-left">
          The RaY-World name, logo, design and code are protected by copyright.
          Unauthorized reproduction, scraping, framing, or redistribution of this
          site or its content is prohibited.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white/80">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/50 hover:text-ray-300">
        {children}
      </Link>
    </li>
  );
}
