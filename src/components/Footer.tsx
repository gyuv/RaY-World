import Link from "next/link";
import { Logo } from "./Logo";
import { BrandImage } from "./BrandImage";
import { LANGUAGES } from "@/lib/config/languages";
import { GENRES } from "@/lib/config/genres";
import { DownloadIcon, TvIcon, GlobeIcon } from "./icons";

// Download targets. All three are overridable at build time via env so you can
// point them at a new release, a TV-specific build, or a different web host
// without touching code. The Android defaults resolve to the universal APK
// published by .github/workflows/android-apk.yml (one build carries both the
// phone launcher and the Android TV Leanback launcher).
const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL ??
  "https://github.com/gyuv/RaY-World/releases/download/apk-latest/app-universal.apk";
const APK_TV_URL = process.env.NEXT_PUBLIC_APK_TV_URL ?? APK_URL;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL ?? "https://rayworld.vercel.app";

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

      {/* Get the app — Android (phone/tablet), Android TV, and the Web App. */}
      <div className="border-t border-white/10">
        <div className="container-page py-10">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-white/80">
            Get the app
          </h3>
          <p className="mb-5 text-sm text-white/45">
            Install RaY-World on your phone, your Android TV, or use it right in
            the browser.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <DownloadCard
              href={APK_URL}
              download
              Icon={DownloadIcon}
              title="Android App"
              subtitle="Phone &amp; tablet · APK"
            />
            <DownloadCard
              href={APK_TV_URL}
              download
              Icon={TvIcon}
              title="Android TV"
              subtitle="Leanback build · sideload APK"
            />
            <DownloadCard
              href={WEBAPP_URL}
              Icon={GlobeIcon}
              title="Web App"
              subtitle="Open in browser · installable PWA"
            />
          </div>
          <p className="mt-3 text-xs text-white/30">
            The Android build is an unsigned APK — enable “Install unknown apps”
            for your browser/file manager, then open the downloaded file.
          </p>
        </div>
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

function DownloadCard({
  href,
  Icon,
  title,
  subtitle,
  download,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      {...(download ? { download: "" } : {})}
      rel="noopener"
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-ray-400"
    >
      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-ray-gradient text-ink-950">
        <Icon className="text-xl" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white/90 group-hover:text-white">
          {title}
        </span>
        <span className="block truncate text-xs text-white/45">{subtitle}</span>
      </span>
    </a>
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
