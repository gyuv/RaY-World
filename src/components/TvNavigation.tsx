"use client";

import { useEffect } from "react";

/**
 * TvNavigation — deterministic D-pad / arrow-key focus movement for Android TV
 * (and any remote-driven browser).
 *
 * WHY THIS EXISTS: on a TV the app is a WebView shell with no pointer. Focus is
 * driven entirely by the remote's D-pad, and the Android WebView's built-in
 * spatial navigation is unreliable with horizontally-scrolling rails — pressing
 * up/down would skip the content rows and jump straight to the navbar. This
 * component takes over the arrow keys and moves focus to the nearest focusable
 * element in the pressed direction using simple rectangle geometry, so the
 * remote walks the content one card / one row at a time.
 *
 * It only engages where the primary pointer is NOT fine (i.e. TVs and other
 * remote/touch devices). On a desktop with a mouse or trackpad the arrow keys
 * keep their normal page-scroll behaviour, and typing in a search field is
 * never hijacked.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type Dir = "up" | "down" | "left" | "right";

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = window.getComputedStyle(el);
  if (
    style.visibility === "hidden" ||
    style.display === "none" ||
    style.pointerEvents === "none" ||
    style.opacity === "0"
  ) {
    return false;
  }
  return true;
}

function dirFor(key: string): Dir | null {
  switch (key) {
    case "ArrowUp":
      return "up";
    case "ArrowDown":
      return "down";
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
    default:
      return null;
  }
}

export function TvNavigation() {
  useEffect(() => {
    // Engage only when the primary pointer is not a mouse/trackpad. On a TV the
    // remote reports a coarse / no pointer; a phone is coarse too but never
    // emits arrow keys, so the handler simply never fires there.
    const fineQuery = window.matchMedia("(pointer: fine)");
    let engaged = !fineQuery.matches;
    const onPointerChange = () => {
      engaged = !fineQuery.matches;
    };
    fineQuery.addEventListener?.("change", onPointerChange);

    // When a modal dialog (intro splash, filters sheet, …) is open, keep focus
    // movement inside it.
    const scopeRoot = (): ParentNode => {
      const dialogs = Array.from(
        document.querySelectorAll<HTMLElement>('[role="dialog"]'),
      ).filter(isVisible);
      return dialogs.length ? dialogs[dialogs.length - 1] : document;
    };

    const focusables = (): HTMLElement[] =>
      Array.from(scopeRoot().querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        isVisible,
      );

    const pick = (dir: Dir, from: DOMRect, current: Element | null): HTMLElement | null => {
      const fromCx = from.left + from.width / 2;
      const fromCy = from.top + from.height / 2;
      const vertical = dir === "up" || dir === "down";

      let best: HTMLElement | null = null;
      let bestScore = Infinity;

      for (const el of focusables()) {
        if (el === current) continue;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        // `primary` is how far the candidate lies in the pressed direction.
        // Anything not strictly ahead (same row for up/down, same column for
        // left/right) is rejected so a single press advances exactly one step.
        let primary: number;
        let cross: number;
        if (vertical) {
          primary = dir === "down" ? r.top - from.bottom : from.top - r.bottom;
          cross = Math.abs(cx - fromCx);
        } else {
          primary = dir === "right" ? r.left - from.right : from.left - r.right;
          cross = Math.abs(cy - fromCy);
        }
        if (primary < -1) continue;

        // Prefer the closest in the travel direction, then the best aligned on
        // the perpendicular axis (weighted so we don't leap to a far column).
        const score = Math.max(primary, 0) + cross * 2;
        if (score < bestScore) {
          bestScore = score;
          best = el;
        }
      }
      return best;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!engaged || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }
      const dir = dirFor(e.key);
      if (!dir) return;

      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      const editing =
        !!active && (tag === "TEXTAREA" || active.isContentEditable);
      // Never steal cursor movement inside a text field. For a single-line
      // input, up/down are meaningless there, so allow those to navigate out.
      if (editing) return;
      if (tag === "INPUT" && (dir === "left" || dir === "right")) return;

      const from =
        active && active !== document.body && isVisible(active)
          ? active.getBoundingClientRect()
          : new DOMRect(window.innerWidth / 2, 0, 1, 1);

      const target = pick(dir, from, active);
      if (!target) return; // no candidate → let the page scroll natively

      e.preventDefault();
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
    };

    // Capture phase so we pre-empt the WebView's own scroll/spatial handling.
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      fineQuery.removeEventListener?.("change", onPointerChange);
    };
  }, []);

  return null;
}
