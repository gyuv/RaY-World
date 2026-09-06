"use client";

import { useEffect } from "react";

/**
 * SiteGuard — client-side deterrents against casual copying/inspection.
 *
 * IMPORTANT / HONEST LIMITATION: none of this can actually prevent someone from
 * viewing your front-end code. Everything a browser runs is, by design,
 * downloadable and readable (view-source:, disable JS, DevTools via menu, a
 * proxy, or plain `curl` all bypass these handlers in seconds). This only
 * discourages casual right-click/save/shortcut use. Real protection is
 * server-side — RaY-World already keeps its API keys and stream resolution on
 * the server, never in the browser bundle. Do not rely on this for security.
 *
 * Deliberately NOT included: DevTools "detection" that blanks/redirects the
 * page, and `debugger` trap loops. They freeze real users' browsers, break
 * accessibility and Lighthouse/SEO, and are still trivially bypassed.
 */
export function SiteGuard() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrlish = e.ctrlKey || e.metaKey;

      // F12 — open DevTools
      if (k === "f12") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd+Shift+I / J / C — DevTools panels
      if (ctrlish && e.shiftKey && (k === "i" || k === "j" || k === "c")) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd+U — view source; Ctrl/Cmd+S — save page
      if (ctrlish && (k === "u" || k === "s")) {
        e.preventDefault();
        return;
      }
    };

    // Block dragging images out of the page.
    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("dragstart", onDragStart);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
