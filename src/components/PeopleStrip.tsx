import Link from "next/link";
import { PersonItem } from "@/lib/providers/types";
import { profileUrl } from "@/lib/images";

export function PeopleStrip({ people }: { people: PersonItem[] }) {
  if (people.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold tracking-tight">People</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {people.map((p) => {
          const img = profileUrl(p.profilePath, "w185");
          return (
            <Link
              key={p.id}
              href={`/search?q=${encodeURIComponent(p.name)}`}
              className="group w-24 flex-none text-center"
            >
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-ink-700 ring-1 ring-white/10 transition group-hover:ring-ray-400/50">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl">
                    👤
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-medium text-white/80">
                {p.name}
              </p>
              {p.knownForDepartment && (
                <p className="text-[11px] text-white/40">
                  {p.knownForDepartment}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
