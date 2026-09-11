"use client";

import { useRef } from "react";
import Link from "next/link";
import { MediaItem } from "@/lib/providers/types";
import { MediaCard } from "./MediaCard";
import { ChevronLeft, ChevronRight } from "./icons";
import { cn } from "@/lib/utils";

interface MediaRailProps {
  title: string;
  accent?: string;
  href?: string;
  items: MediaItem[];
  priority?: boolean;
}

export function MediaRail({
  title,
  accent,
  href,
  items,
  priority,
}: MediaRailProps) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className={cn("container-page group/rail py-4", !priority && "cv-auto")}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-6 w-1.5 flex-none rounded-full bg-[linear-gradient(180deg,#ffc933,#ec4899,#a855f7)]"
          />
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              {href ? (
                <Link href={href} className="hover:text-ray-300">
                  {title}
                </Link>
              ) : (
                title
              )}
            </h2>
            {accent && (
              <p className="text-sm text-white/40" lang="ta">
                {accent}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="text-sm font-medium text-white/50 hover:text-ray-300"
            >
              See all
            </Link>
          )}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scroll(-1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/50 hover:text-white"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scroll(1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/50 hover:text-white"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:gap-4"
      >
        {items.map((item, i) => (
          <div
            key={`${item.type}:${item.id}`}
            className="w-[38vw] flex-none snap-start sm:w-[180px] lg:w-[190px] tv:w-[240px]"
          >
            <MediaCard item={item} priority={priority && i < 5} />
          </div>
        ))}
      </div>
    </section>
  );
}
