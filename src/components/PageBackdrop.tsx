import Image from "next/image";

/**
 * Full-page ambient wash: a heavily blurred copy of the page's key image
 * (backdrop/poster) fixed behind all content, so the whole page floats over the
 * film's soft, frosted colors. A layered gradient keeps text legible while
 * still letting the ambient colour bleed through (airy, not pure black).
 */
export function PageBackdrop({ src }: { src: string | null }) {
  if (!src) return null;
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-125 object-cover opacity-40 blur-[64px]"
      />
      {/* Soft, lightened wash + legibility gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(31,107,255,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/55 via-ink-950/75 to-ink-950" />
    </div>
  );
}
