import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileTabBar } from "@/components/MobileTabBar";
import { IntroSplash } from "@/components/IntroSplash";
import { SiteGuard } from "@/components/SiteGuard";

export const metadata: Metadata = {
  metadataBase: new URL("https://ray-world.example"),
  title: {
    default: "RaY-World — Tamil-first Movie & Series Discovery",
    template: "%s · RaY-World",
  },
  description:
    "RaY-World is a Tamil-first universal entertainment discovery platform. Search and browse movies and series across Tamil, English, Hindi, Telugu, Malayalam, Kannada and more.",
  keywords: [
    "Tamil movies",
    "Tamil series",
    "movie discovery",
    "watch online",
    "RaY-World",
  ],
  openGraph: {
    title: "RAYWORLD",
    description:
      "A Tamil-first universal entertainment discovery platform.",
    type: "website",
  },
  icons: {
    icon: "/api/icon?size=192",
    apple: "/api/icon?size=192",
  },
};

export const viewport: Viewport = {
  themeColor: "#02060f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('rayworld:intro:v3')==='1'){document.documentElement.setAttribute('data-intro-seen','1')}}catch(e){}",
          }}
        />
        <SiteGuard />
        <IntroSplash />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ray-500 focus:px-4 focus:py-2 focus:text-ink-950"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="pb-24 lg:pb-0">
          {children}
        </main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
