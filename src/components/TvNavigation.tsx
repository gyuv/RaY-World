"use client";

import { useEffect } from "react";

/**
 * TvNavigation — deterministic D-pad / arrow-key focus movement for Android TV
 * (and any remote-driven browser or WebView).
 *
 * WHY: on a TV the app is a WebView with no pointer, driven by the remote's
 * D-pad. The WebView's built-in spatial navigation is unreliable with the
 * horizontally-scrolling rails (it skips rows, jumps to the navbar, or just
 * scrolls the page), which reads as "glitchy". This takes the arrow keys over
 * and moves focus to the nearest focusable element in the pressed direction
 * using rectangle geometry, so the remote walks one card / one row at a time.
 *
 * It engages on remote/TV/WebView environments and leaves desktop mouse users'
 * arrow-scroll and text-field typing alone. Because programmatic focus() often
 * does NOT trigger :focus-visible, it also marks <html data-remote-nav> so a
 * always-on focus ring is shown (see globals.css) — otherwise the cursor is
 * invisible and navigation feels broken.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type Dir = "up" | "down" | "left" | "right";

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const s = window.getComputedStyle(el);
  if (
    s.visibility === "hidden" ||
    s.display === "none" ||
    s.pointerEvents === "none" ||
    s.opacity === "0"
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
    const root = document.documentElement;

    // Engage on anything that isn't clearly a fine-pointer desktop. The
    // Capacitor WebView on a TV can misreport its pointer, so also force it on
    // for Android (harmless on phones, which never emit arrow keys).
    const fineQuery = window.matchMedia("(pointer: fine)");
    const isAndroid = /Android/i.test(navigator.userAgent || "");
    let engaged = false;
    const setEngaged = (on: boolean) => {
      engaged = on;
      if (on) root.setAttribute("data-remote-nav", "");
      else root.removeAttribute("data-remote-nav");
    };
    setEngaged(!fineQuery.matches || isAndroid);
    const onPointerChange = () => setEngaged(!fineQuery.matches || isAndroid);
    fineQuery.addEventListener?.("change", onPointerChange);

    // Keep focus movement inside an open modal dialog (intro splash, filters).
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

    const pick = (
      dir: Dir,
      from: DOMRect,
      current: Element | null,
    ): HTMLElement | null => {
      const vertical = dir === "up" || dir === "down";
      let best: HTMLElement | null = null;
      let bestScore = Infinity;

      for (const el of focusables()) {
        if (el === current) continue;
        const r = el.getBoundingClientRect();

        // How far the candidate lies in the travel direction. Reject anything
        // not strictly ahead so one press advances exactly one step.
        let primary: number;
        let gap: number; // perpendicular gap; 0 when the rects overlap on that axis
        if (vertical) {
          primary = dir === "down" ? r.top - from.bottom : from.top - r.bottom;
          const overlap =
            Math.min(from.right, r.right) - Math.max(from.left, r.left);
          gap =
            overlap > 0
              ? 0
              : r.left > from.right
              ? r.left - from.right
              : from.left - r.right;
        } else {
          primary = dir === "right" ? r.left - from.right : from.left - r.right;
          const overlap =
            Math.min(from.bottom, r.bottom) - Math.max(from.top, r.top);
          gap =
            overlap > 0
              ? 0
              : r.top > from.bottom
              ? r.top - from.bottom
              : from.top - r.bottom;
        }
        if (primary < -2) continue;

        // Prefer the nearest element in the travel direction, and strongly
        // prefer ones aligned on the perpendicular axis (a real overlap → 0).
        const score = Math.max(primary, 0) + gap * 4;
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
      // Never steal cursor movement inside a text field. Up/down are useless in
      // a single-line input, so let those navigate out of it.
      if (active && (tag === "TEXTAREA" || active.isContentEditable)) return;
      if (tag === "INPUT" && (dir === "left" || dir === "right")) return;
      // A focused cross-origin iframe (the player) handles its own keys.
      if (tag === "IFRAME") return;

      const from =
        active && active !== document.body && isVisible(active)
          ? active.getBoundingClientRect()
          : new DOMRect(window.innerWidth / 2, 0, 1, 1);

      const target = pick(dir, from, active);
      if (!target) return; // nothing in that direction → let the page scroll

      // Take the key: stop the WebView from also scrolling / running its own
      // spatial nav, which is what causes the double-move flicker.
      e.preventDefault();
      target.focus({ preventScroll: true });
      // Instant (not smooth) — smooth scroll on every keypress janks on TVs.
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    };

    // Capture phase so we pre-empt the WebView's own key handling.
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      fineQuery.removeEventListener?.("change", onPointerChange);
      root.removeAttribute("data-remote-nav");
    };
  }, []);

  return null;
}
