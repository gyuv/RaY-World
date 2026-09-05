import { StarIcon } from "./icons";
import { classForRating, cn, formatRating } from "@/lib/utils";

/** Renders a rating chip only when a real rating exists (never fabricated). */
export function RatingBadge({
  rating,
  className,
}: {
  rating?: number;
  className?: string;
}) {
  const value = formatRating(rating);
  if (!value) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-xs font-semibold backdrop-blur",
        classForRating(rating),
        className,
      )}
    >
      <StarIcon className="text-[0.85em] text-ray-300" />
      {value}
    </span>
  );
}
