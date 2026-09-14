import type { CapacitorConfig } from "@capacitor/cli";

/**
 * RaY-World native shell (Capacitor).
 *
 * This app is a server-backed Next.js application (live search, stream
 * extraction proxy, and on-demand movie/TV pages all require the server), so
 * the native build is a thin WebView that loads the deployed site. That keeps
 * every feature working on phones AND Android TV, unlike a static export.
 *
 * `webDir` holds a small branded offline/loading fallback that is shown only
 * when the live site cannot be reached.
 */
const config: CapacitorConfig = {
  appId: "com.rayworld.app",
  appName: "RaY-World",
  webDir: "mobile-www",
  server: {
    // The live deployment the shell loads.
    url: "https://rayworld.vercel.app",
    androidScheme: "https",
    // Keep these navigations inside the WebView; everything else opens in the
    // system browser.
    allowNavigation: [
      "rayworld.vercel.app",
      "*.vercel.app",
      "image.tmdb.org",
      "www.youtube.com",
      "www.youtube-nocookie.com",
    ],
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
