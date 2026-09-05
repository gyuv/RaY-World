/**
 * Central language configuration for RaY-World.
 *
 * RaY-World is a Tamil-first platform. The ordering of this list encodes the
 * global content-priority hierarchy used across the homepage, browse filters,
 * and ranking. New languages can be added here WITHOUT touching UI components.
 */

export interface MediaLanguage {
  /** ISO 639-1 code, as used by TMDB's `with_original_language`. */
  code: string;
  /** English display name. */
  name: string;
  /** Endonym (native-script name), shown as a subtle accent in the UI. */
  nativeName?: string;
  /** Broad region grouping, used for editorial grouping. */
  region?: "tamil" | "indian" | "east-asian" | "european" | "other";
  /**
   * Discovery weight. Higher = stronger default surfacing on the homepage and
   * in ambiguous-query ranking. Tamil is intentionally weighted highest.
   */
  priority: number;
}

/**
 * Ordered by content priority (Tamil first). The array order is meaningful:
 * homepage rails and language pickers render in this order.
 */
export const LANGUAGES: MediaLanguage[] = [
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "tamil", priority: 100 },
  { code: "en", name: "English", nativeName: "English", region: "other", priority: 80 },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "indian", priority: 70 },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "indian", priority: 65 },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "indian", priority: 62 },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "indian", priority: 60 },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "indian", priority: 50 },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "indian", priority: 48 },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "indian", priority: 46 },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "indian", priority: 44 },
  { code: "bho", name: "Bhojpuri", nativeName: "भोजपुरी", region: "indian", priority: 40 },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "indian", priority: 38 },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "east-asian", priority: 36 },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "east-asian", priority: 35 },
  { code: "zh", name: "Chinese", nativeName: "中文", region: "east-asian", priority: 32 },
  { code: "es", name: "Spanish", nativeName: "Español", region: "european", priority: 30 },
  { code: "fr", name: "French", nativeName: "Français", region: "european", priority: 28 },
  { code: "de", name: "German", nativeName: "Deutsch", region: "european", priority: 26 },
];

export const DEFAULT_LANGUAGE = "ta";

const LANGUAGE_BY_CODE: Record<string, MediaLanguage> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
);

export function getLanguage(code?: string | null): MediaLanguage | undefined {
  if (!code) return undefined;
  return LANGUAGE_BY_CODE[code.toLowerCase()];
}

export function getLanguageName(code?: string | null): string | undefined {
  const lang = getLanguage(code);
  if (lang) return lang.name;
  // Fall back to the raw code (upper-cased) so unknown languages still render.
  return code ? code.toUpperCase() : undefined;
}

export function getLanguagePriority(code?: string | null): number {
  return getLanguage(code)?.priority ?? 10;
}

/** Languages surfaced by default in compact pickers before "More…". */
export const PRIMARY_LANGUAGES = LANGUAGES.slice(0, 6);
