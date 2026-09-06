"use client";

import { useState } from "react";

/**
 * Renders a brand image from /public, and if the file isn't present yet (or
 * fails to load) falls back to the given node (the CSS logo). This lets us wire
 * the real logo files in advance: drop them in public/brand/ and they appear
 * everywhere automatically; until then the CSS brand shows, never a broken img.
 */
export function BrandImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
