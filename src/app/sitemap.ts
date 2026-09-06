import type { MetadataRoute } from "next";
import { GENRES } from "@/lib/config/genres";
import { LANGUAGES } from "@/lib/config/languages";
import { PROVIDERS } from "@/lib/config/providers";

const BASE = "https://ray-world.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/movies",
    "/series",
    "/tamil",
    "/english",
    "/trending",
    "/genres",
    "/browse",
    "/disclaimer",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const genreRoutes = GENRES.map((g) => ({
    url: `${BASE}/genre/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const languageRoutes = LANGUAGES.map((l) => ({
    url: `${BASE}/browse?language=${l.code}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const providerRoutes = PROVIDERS.map((p) => ({
    url: `${BASE}/provider/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...genreRoutes,
    ...languageRoutes,
    ...providerRoutes,
  ];
}
