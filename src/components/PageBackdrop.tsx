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
        // Same crop/anchor + brightness as the detail hero backdrop, so the hero
        // dissolves into an identical but blurred picture — no seam.
        className="scale-110 object-cover object-top blur-[44px]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,15,30,0.12) 0%, rgba(10,15,30,0.5) 62%, rgba(10,15,30,0.9) 100%)",
        }}
      />
    </div>
  );
}
