import { providerLogoUrl } from "@/lib/images";
import { resolveProviderLogoPath } from "@/lib/provider-logo";
import { StreamingProvider } from "@/lib/config/providers";
import { WatchProviderInfo } from "@/lib/providers/types";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for rendering a platform logo. The real TMDB logo
 * fills the shape (object-cover); falls back to a monogram badge when TMDB has
 * no logo. Use this everywhere a provider logo appears so they stay consistent.
 *
 * Size is controlled by the caller via `className` (e.g. "h-16 w-16 sm:h-20").
 */
export function ProviderLogo({
  provider,
  list,
  big = false,
  shape = "circle",
  className,
}: {
  provider: StreamingProvider;
  list: WatchProviderInfo[];
  /** Request a higher-res logo (for larger headers). */
  big?: boolean;
  shape?: "circle" | "rounded";
  className?: string;
}) {
  const url = providerLogoUrl(
    resolveProviderLogoPath(
      provider.tmdbId,
      provider.name,
      provider.aliases,
      list,
    ),
    big ? "w154" : "w92",
  );

  return (
    <span
      className={cn(
        "grid flex-none place-items-center overflow-hidden bg-white ring-1 ring-white/15",
        shape === "circle" ? "rounded-full" : "rounded-2xl",
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`${provider.name} logo`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className={cn(
            "grid h-full w-full place-items-center bg-gradient-to-br text-2xl font-black text-white/80",
            provider.tint,
          )}
        >
          {provider.mono}
        </span>
      )}
    </span>
  );
}
