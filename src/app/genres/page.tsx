import type { Metadata } from "next";
import Link from "next/link";
import { GENRES } from "@/lib/config/genres";
import { LANGUAGES } from "@/lib/config/languages";

export const metadata: Metadata = {
  title: "Genres",
  description: "Browse RaY-World by genre and language.",
};

const GENRE_EMOJI: Record<string, string> = {
  action: "💥",
  adventure: "🧭",
  animation: "🎨",
  comedy: "😄",
  crime: "🕵️",
  documentary: "🎥",
  drama: "🎭",
  family: "👨‍👩‍👧",
  fantasy: "🐉",
  history: "🏛️",
  horror: "👻",
  music: "🎵",
  mystery: "🔎",
  romance: "❤️",
  "science-fiction": "🚀",
  thriller: "🔪",
  war: "⚔️",
  western: "🤠",
};

export default function GenresPage() {
  return (
    <div className="container-page py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Genres</h1>
        <p className="mt-1 text-sm text-white/50">
          Explore every mood and category across the catalog.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genre/${g.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-850/70 p-5 transition hover:border-ray-400/40 hover:bg-ink-800"
          >
            <div className="absolute -right-3 -top-3 text-5xl opacity-20 transition group-hover:scale-110 group-hover:opacity-40">
              {GENRE_EMOJI[g.slug] ?? "🎬"}
            </div>
            <span className="text-lg font-bold">{g.name}</span>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 mt-12 text-xl font-bold tracking-tight">By Language</h2>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <Link key={l.code} href={`/browse?language=${l.code}`} className="chip">
            {l.name}
            {l.nativeName && l.nativeName !== l.name && (
              <span className="text-white/40" lang={l.code}>
                {l.nativeName}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
