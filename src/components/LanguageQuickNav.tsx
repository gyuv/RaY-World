import Link from "next/link";
import { LANGUAGES } from "@/lib/config/languages";

/** Horizontal language shortcuts — Tamil-first, then the full ladder. */
export function LanguageQuickNav() {
  return (
    <section className="container-page py-3">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {LANGUAGES.map((lang) => (
          <Link
            key={lang.code}
            href={`/browse?language=${lang.code}`}
            className="chip flex-none"
          >
            <span>{lang.name}</span>
            {lang.nativeName && lang.nativeName !== lang.name && (
              <span className="text-white/40" lang={lang.code}>
                {lang.nativeName}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
