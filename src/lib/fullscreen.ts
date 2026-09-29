"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fullscreen API wrapper that handles browser vendor prefixes
 * (Safari uses the `webkit` prefix for the legacy Fullscreen API).
 *
 * All functions are safe to call during SSR: they no-op when
 * `document` is undefined. The companion `useFullscreen` hook
 * tracks the live fullscreen state via event listeners.
 */

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type WebkitHTMLElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

/**
 * Request fullscreen mode for the document root element.
 * Falls back to the `webkitRequestFullscreen` legacy API on Safari.
 */
export function requestFullscreen(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const el = document.documentElement as WebkitHTMLElement;
  try {
    if (el.requestFullscreen) return Promise.resolve(el.requestFullscreen());
    if (el.webkitRequestFullscreen) return Promise.resolve(el.webkitRequestFullscreen());
  } catch (err) {
    return Promise.reject(err);
  }
  return Promise.resolve();
}

/**
 * Exit fullscreen mode. Falls back to `webkitExitFullscreen` on Safari.
 */
export function exitFullscreen(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const doc = document as WebkitDocument;
  try {
    if (doc.exitFullscreen) return Promise.resolve(doc.exitFullscreen());
    if (doc.webkitExitFullscreen) return Promise.resolve(doc.webkitExitFullscreen());
  } catch (err) {
    return Promise.reject(err);
  }
  return Promise.resolve();
}

/**
 * Returns `true` when the document is currently in fullscreen mode.
 * Reads the standard `fullscreenElement` property, falling back to
 * the `webkitFullscreenElement` legacy property on Safari.
 */
export function isCurrentlyFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as WebkitDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || false);
}

/**
 * Subscribe to fullscreen change events. Both the standard
 * `fullscreenchange` event and the legacy `webkitfullscreenchange`
 * event are observed so the wrapper works across browsers.
 *
 * @returns an unsubscribe function that removes the listeners.
 */
export function onFullscreenChange(callback: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const doc = document;
  doc.addEventListener("fullscreenchange", callback);
  doc.addEventListener("webkitfullscreenchange", callback);
  return () => {
    doc.removeEventListener("fullscreenchange", callback);
    doc.removeEventListener("webkitfullscreenchange", callback);
  };
}

/**
 * React hook that mirrors the live fullscreen state and exposes
 * imperative `request` / `exit` helpers.
 *
 * Example:
 *   const { isFullscreen, request, exit } = useFullscreen();
 */
export function useFullscreen(): {
  isFullscreen: boolean;
  request: () => Promise<void>;
  exit: () => Promise<void>;
} {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    // Initialise after mount to avoid SSR mismatch, then subscribe. The
    // initial sync is deferred to a microtask so we never call setState
    // synchronously inside the effect body (cascading-render lint rule).
    queueMicrotask(() => setIsFullscreen(isCurrentlyFullscreen()));
    const unsubscribe = onFullscreenChange(() => {
      // Defer state update to a microtask so the listener itself
      // never synchronously triggers a React re-render.
      queueMicrotask(() => setIsFullscreen(isCurrentlyFullscreen()));
    });
    return unsubscribe;
  }, []);

  const request = useCallback(() => requestFullscreen(), []);
  const exit = useCallback(() => exitFullscreen(), []);

  return { isFullscreen, request, exit };
}
