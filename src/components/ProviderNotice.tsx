import Link from "next/link";

/**
 * Shown when no TMDB credentials are configured, or the upstream provider is
 * unreachable. Never exposes secrets; keeps the page from looking broken
 * (spec Test 10).
 */
export function ProviderNotice({
  reason = "unconfigured",
}: {
  reason?: "unconfigured" | "upstream";
}) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-ray-400/30 bg-ink-850/70 p-8 text-center sm:p-12">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ray-gradient text-2xl text-ink-950">
          ⚡
        </div>
        {reason === "unconfigured" ? (
          <>
            <h1 className="text-2xl font-bold">Connect a metadata provider</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
              RaY-World needs a TMDB API credential to load its catalog. Add{" "}
              <code className="rounded bg-ink-800 px-1.5 py-0.5 text-ray-300">
                TMDB_ACCESS_TOKEN
              </code>{" "}
              (or{" "}
              <code className="rounded bg-ink-800 px-1.5 py-0.5 text-ray-300">
                TMDB_API_KEY
              </code>
              ) to your environment and restart.
            </p>
            <p className="mx-auto mt-3 max-w-md text-xs text-white/40">
              See <code>.env.example</code> for setup. Credentials stay
              server-side and are never sent to the browser.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">We&apos;re having trouble loading</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
              The catalog provider is temporarily unavailable. Cached content
              may still be browsable — please try again shortly.
            </p>
          </>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className="btn-outline">
            Reload Home
          </Link>
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            Get a TMDB key
          </a>
        </div>
      </div>
    </div>
  );
}
