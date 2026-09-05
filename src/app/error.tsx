"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client-side; never surface provider secrets to the UI (spec Test 10).
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-ink-850/70 p-10 text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ray-gradient text-2xl text-ink-950">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/60">
          We hit an unexpected error loading this page. Try again, or head back
          to discovery.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-outline">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
