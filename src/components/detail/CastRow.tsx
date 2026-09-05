import { CastMember } from "@/lib/providers/types";
import { profileUrl } from "@/lib/images";

export function CastRow({ cast }: { cast: CastMember[] }) {
  const people = cast.slice(0, 20);
  if (people.length === 0) return null;
  return (
    <section className="container-page py-6">
      <h2 className="mb-4 text-xl font-bold tracking-tight">Cast</h2>
      <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {people.map((c) => {
          const img = profileUrl(c.profilePath, "w185");
          return (
            <div key={`${c.id}-${c.order}`} className="w-28 flex-none">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-ink-700 ring-1 ring-white/10">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-3xl">
                    👤
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-semibold text-white/90">
                {c.name}
              </p>
              {c.character && (
                <p className="line-clamp-1 text-xs text-white/45">
                  {c.character}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
