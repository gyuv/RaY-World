import { TitleWatchAvailability, WatchOffer } from "@/lib/providers/types";
import { providerLogoUrl } from "@/lib/images";

const REGION_NAME: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
};

/**
 * "Where to watch" panel — shows the legal streaming / rent / buy platforms a
 * title is available on, from TMDB's watch/providers (JustWatch) data, with a
 * deep-link to the official source. No unauthorized playback: we point people
 * to the licensed platform rather than streaming it ourselves.
 */
export function WatchProviders({ data }: { data?: TitleWatchAvailability | null }) {
  if (!data) return null;
  const { flatrate, rent, buy, link, region } = data;
  if (!flatrate.length && !rent.length && !buy.length) return null;

  return (
    <section className="container-page py-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">Where to Watch</h2>
        <span className="text-xs text-white/40">
          Availability in {REGION_NAME[region] ?? region} · data by JustWatch
        </span>
      </div>

      <div className="glass space-y-5 p-5">
        {flatrate.length > 0 && (
          <OfferRow title="Stream" offers={flatrate} link={link} />
        )}
        {rent.length > 0 && <OfferRow title="Rent" offers={rent} link={link} />}
        {buy.length > 0 && <OfferRow title="Buy" offers={buy} link={link} />}

        {link && (
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <p className="text-xs text-white/45">
              RaY-World links to licensed platforms — it doesn’t host these titles.
            </p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-primary !py-2 text-sm"
            >
              Open options
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function OfferRow({
  title,
  offers,
  link,
}: {
  title: string;
  offers: WatchOffer[];
  link?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ray-200/70">
        {title}
      </p>
      <div className="flex flex-wrap gap-3">
        {offers.map((o) => {
          const logo = providerLogoUrl(o.logoPath, "w92");
          const inner = (
            <>
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt={o.name}
                  loading="lazy"
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10"
                />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-800 text-xs font-bold text-white/70 ring-1 ring-white/10">
                  {o.name.slice(0, 2)}
                </span>
              )}
              <span className="max-w-[7rem] truncate text-xs text-white/70 group-hover:text-white">
                {o.name}
              </span>
            </>
          );
          const cls =
            "group flex flex-col items-center gap-1.5 text-center transition";
          return link ? (
            <a
              key={o.id}
              href={link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={cls}
              title={`Watch on ${o.name}`}
            >
              {inner}
            </a>
          ) : (
            <div key={o.id} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
