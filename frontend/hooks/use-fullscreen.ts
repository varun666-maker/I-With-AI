"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fullscreen API wrapper — safe to call from any context.
 * All functions silently no-op if not in fullscreen mode.
 */

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type WebkitHTMLElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export function requestFullscreen(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const el = document.documentElement as WebkitHTMLElement;
  try {
    if (el.requestFullscreen) {
      return el.requestFullscreen().catch(() => {});
    }
    if (el.webkitRequestFullscreen) {
      return Promise.resolve(el.webkitRequestFullscreen()).catch(() => {});
    }
  } catch {
    // ignore
  }
  return Promise.resolve();
}

export function exitFullscreen(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  // Only call exitFullscreen if we're actually in fullscreen — prevents "Document not active" error
  if (!isCurrentlyFullscreen()) return Promise.resolve();
  const doc = document as any;
  try {
    if (doc.exitFullscreen) return Promise.resolve(doc.exitFullscreen()).catch(() => {});
    if (doc.webkitExitFullscreen) return Promise.resolve(doc.webkitExitFullscreen()).catch(() => {});
    if (doc.mozCancelFullScreen) return Promise.resolve(doc.mozCancelFullScreen()).catch(() => {});
    if (doc.msExitFullscreen) return Promise.resolve(doc.msExitFullscreen()).catch(() => {});
  } catch {
    // ignore
  }
  return Promise.resolve();
}

export function isCurrentlyFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    false
  );
}

export function onFullscreenChange(callback: (isFs: boolean) => void): () => void {
  if (typeof document === "undefined") return () => {};
  const handler = () => callback(isCurrentlyFullscreen());
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  document.addEventListener("mozfullscreenchange", handler);
  document.addEventListener("MSFullscreenChange", handler);
  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
    document.removeEventListener("mozfullscreenchange", handler);
    document.removeEventListener("MSFullscreenChange", handler);
  };
}

export function useFullscreen(): {
  isFullscreen: boolean;
  request: () => Promise<void>;
  exit: () => Promise<void>;
} {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsFullscreen(isCurrentlyFullscreen()));
    const unsubscribe = onFullscreenChange((fs) => setIsFullscreen(fs));
    return unsubscribe;
  }, []);

  const request = useCallback(() => requestFullscreen(), []);
  const exit = useCallback(() => exitFullscreen(), []);

  return { isFullscreen, request, exit };
}
