import { MediaItem } from "@/lib/providers/types";
import { MediaCard } from "./MediaCard";
import { MediaRailClient } from "./MediaRailClient";

interface MediaRailProps {
  title: string;
  accent?: string;
  href?: string;
  items: MediaItem[];
  priority?: boolean;
}

/**
 * A horizontal poster rail. This is a Server Component: it renders the cards on
 * the server and hands them to <MediaRailClient> as children, so only the small
 * scroll/arrow logic runs on the client. The cards (and their images) never
 * hydrate, which keeps pages full of rails light and smooth.
 */
export function MediaRail({
  title,
  accent,
  href,
  items,
  priority,
}: MediaRailProps) {
  if (!items.length) return null;

  return (
    <MediaRailClient title={title} accent={accent} href={href} priority={priority}>
      {items.map((item, i) => (
        <div
          key={`${item.type}:${item.id}`}
          className="w-[38vw] flex-none snap-start sm:w-[180px] lg:w-[190px] tv:w-[240px]"
        >
          <MediaCard item={item} priority={priority && i < 5} />
        </div>
      ))}
    </MediaRailClient>
  );
}
