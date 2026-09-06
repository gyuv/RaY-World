import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes RaY-World an installable PWA, which is also the
 * prerequisite for wrapping it as an Android app via a Trusted Web Activity
 * (Bubblewrap) or Capacitor.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RaY-World",
    short_name: "RaY-World",
    description:
      "Tamil-first universal movie & series discovery — search, browse and explore across every language.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#02060f",
    theme_color: "#02060f",
    categories: ["entertainment", "movies"],
    icons: [
      // Real uploaded app icon (public/brand/app-icon.png). Falls back to the
      // generated /api/icon if the file isn't present.
      {
        src: "/brand/app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/api/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
