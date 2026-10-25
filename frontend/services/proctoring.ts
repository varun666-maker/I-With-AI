"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Proctoring engine for the coding-test experience.
 *
 * Two modes are supported:
 *   - "informational": violations are logged for review but never trigger
 *     an auto-submit. The candidate is simply warned.
 *   - "strict": every recorded violation increments the strike counter. After
 *     `MAX_STRIKES` strikes the test is auto-submitted.
 *
 * The detectors intentionally avoid throwing on missing browser APIs (SSR,
 * older browsers, permissions denied) so a candidate's test never crashes
 * because of the proctor.
 */

export type ProctoringMode = "informational" | "strict";

export type ViolationType =
  | "tab-switch"
  | "fullscreen-exit"
  | "phone"
  | "extra-person"
  | "keyboard"
  | "copy-paste"
  | "right-click"
  | "devtools"
  | "screenshot";

export interface ProctoringEvent {
  id: string;
  type: ViolationType;
  timestamp: number;
  detail?: string;
}

export interface ProctoringState {
  strikes: number;
  events: ProctoringEvent[];
  isAutoSubmitted: boolean;
  monitoring: boolean;
}

export const MAX_STRIKES = 3;

/**
 * Capture a single JPEG frame from a webcam <video> element and return it
 * as a base64 data URL. Returns `null` if the video is not yet playing or
 * the canvas API is unavailable.
 */
export function captureWebcamFrame(video: HTMLVideoElement): string | null {
  if (typeof document === "undefined") return null;
  if (!video.videoWidth || !video.videoHeight) return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}

interface UseProctoringArgs {
  mode: ProctoringMode;
  /** Called once when strict mode reaches MAX_STRIKES. */
  onAutoSubmit?: () => void;
  /** Optional callback when a violation occurs (for toasts or UI alerts) */
  onWarning?: (message: string) => void;
  /** Callback when fullscreen is exited */
  onFullscreenExit?: () => void;
}

/**
 * Hook that wires up comprehensive proctoring detectors and exposes live state.
 *
 * Covers:
 * - Copy/Paste/Cut prevention & right-click context menu blocking
 * - Developer tools prevention (F12, Ctrl+Shift+I/J/C, Ctrl+U, etc.)
 * - Function keys (F1-F12) blocking
 * - Screenshot blocking (PrintScreen, Win+Shift+S)
 * - Tab-switch & Page visibility tracking
 * - Fullscreen exit tracking
 */
export function useProctoring({
  mode,
  onAutoSubmit,
  onWarning,
  onFullscreenExit,
}: UseProctoringArgs) {
  const [strikes, setStrikes] = useState<number>(0);
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);
  const [monitoring, setMonitoring] = useState<boolean>(false);

  const modeRef = useRef<ProctoringMode>(mode);
  const onAutoSubmitRef = useRef<UseProctoringArgs["onAutoSubmit"]>(onAutoSubmit);
  const onWarningRef = useRef<UseProctoringArgs["onWarning"]>(onWarning);
  const onFullscreenExitRef = useRef<UseProctoringArgs["onFullscreenExit"]>(onFullscreenExit);
  const strikesRef = useRef<number>(0);
  const autoSubmittedRef = useRef<boolean>(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);
  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);
  useEffect(() => {
    onFullscreenExitRef.current = onFullscreenExit;
  }, [onFullscreenExit]);

  const isStrict = mode === "strict";

  const triggerAutoSubmit = useCallback(() => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    queueMicrotask(() => {
      setIsAutoSubmitted(true);
      onAutoSubmitRef.current?.();
    });
  }, []);

  const recordViolation = useCallback(
    (type: ViolationType, detail?: string) => {
      const ev: ProctoringEvent = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        timestamp: Date.now(),
        detail,
      };
      queueMicrotask(() => {
        setEvents((prev) => [...prev, ev]);
      });

      const readableMsg =
        type === "copy-paste"
          ? "Clipboard action blocked in exam mode"
          : type === "screenshot"
          ? "Screenshot key blocked"
          : type === "devtools"
          ? "Developer Tools shortcut blocked"
          : type === "keyboard"
          ? detail || "Restricted shortcut blocked"
          : type === "right-click"
          ? "Right-click context menu is disabled"
          : type === "tab-switch"
          ? "Window / tab switch detected"
          : type === "fullscreen-exit"
          ? "Fullscreen exit detected"
          : "Exam proctoring policy violation detected";

      onWarningRef.current?.(readableMsg);

      if (modeRef.current === "strict") {
        strikesRef.current = Math.min(strikesRef.current + 1, MAX_STRIKES);
        const next = strikesRef.current;
        queueMicrotask(() => setStrikes(next));
        if (next >= MAX_STRIKES) {
          triggerAutoSubmit();
        }
      }
    },
    [triggerAutoSubmit],
  );

  const reset = useCallback(() => {
    strikesRef.current = 0;
    autoSubmittedRef.current = false;
    queueMicrotask(() => {
      setStrikes(0);
      setEvents([]);
      setIsAutoSubmitted(false);
    });
  }, []);

  // ---- Detectors --------------------------------------------------------

  useEffect(() => {
    if (!monitoring) return;
    if (typeof window === "undefined") return;

    const cleanups: Array<() => void> = [];

    // TabSwitchDetector: rely on the Page Visibility API & Window Blur
    const onVisibility = () => {
      if (document.hidden) {
        recordViolation("tab-switch", "Document became hidden (tab/window switch)");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

    // Fullscreen exit detection (debounced to avoid duplicate standard + webkit events)
    let wasFullscreen = Boolean(
      document.fullscreenElement || (document as any).webkitFullscreenElement
    );
    const onFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
      if (wasFullscreen && !isFs) {
        wasFullscreen = false;
        recordViolation("fullscreen-exit", "Exited full-screen display mode");
        onFullscreenExitRef.current?.();
      } else if (isFs) {
        wasFullscreen = true;
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    cleanups.push(() => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    });

    // KeyboardMonitor: block developer shortcuts, function keys, and screenshot keys
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const keyLower = key.toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. Screenshot Prevention (PrintScreen, Win+Shift+S)
      if (key === "PrintScreen" || (isCtrlOrMeta && e.shiftKey && keyLower === "s")) {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("").catch(() => {});
          }
        } catch {}
        recordViolation("screenshot", "Blocked screenshot / PrintScreen attempt");
        return;
      }

      // 2. DevTools prevention (F12, Ctrl+Shift+I/J/C, Ctrl+U)
      if (
        key === "F12" ||
        (isCtrlOrMeta && e.shiftKey && ["i", "j", "c"].includes(keyLower)) ||
        (isCtrlOrMeta && keyLower === "u")
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordViolation("devtools", `Blocked DevTools shortcut: ${key}`);
        return;
      }

      // 3. Browser actions (Ctrl+S save, Ctrl+P print, F5/Ctrl+R refresh)
      if (
        (isCtrlOrMeta && ["s", "p"].includes(keyLower)) ||
        key === "F5" ||
        (isCtrlOrMeta && keyLower === "r")
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordViolation("keyboard", `Blocked system shortcut: ${key}`);
        return;
      }

      // 4. Function keys F1 - F11
      if (/^F([1-9]|1[0-1])$/.test(key)) {
        e.preventDefault();
        e.stopPropagation();
        recordViolation("keyboard", `Blocked function key: ${key}`);
        return;
      }

      // 5. Clipboard shortcuts on questions
      if (isCtrlOrMeta && ["c", "v", "x", "a"].includes(keyLower)) {
        const target = e.target as HTMLElement;
        const isEditable = target?.isContentEditable || ["TEXTAREA", "INPUT"].includes(target?.tagName || "");
        // In code editor or text input, allow normal typing; on questions/instructions, block copying
        if (!isEditable) {
          e.preventDefault();
          e.stopPropagation();
          recordViolation("copy-paste", `Blocked Ctrl+${key.toUpperCase()} on protected text`);
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    cleanups.push(() => window.removeEventListener("keydown", onKeyDown, { capture: true } as EventListenerOptions));

    // CopyPasteBlocker: kill copy/cut/paste/contextmenu on protected elements
    const blockEvent = (type: string, violation: ViolationType) => {
      const handler = (e: Event) => {
        const target = e.target as HTMLElement;
        const isEditable = target?.isContentEditable || ["TEXTAREA", "INPUT"].includes(target?.tagName || "");
        if (!isEditable || type === "contextmenu") {
          e.preventDefault();
          e.stopPropagation();
          recordViolation(violation, `${type} action prevented`);
        }
      };
      window.addEventListener(type, handler, { capture: true });
      cleanups.push(() => window.removeEventListener(type, handler, { capture: true } as EventListenerOptions));
    };
    blockEvent("copy", "copy-paste");
    blockEvent("cut", "copy-paste");
    blockEvent("paste", "copy-paste");
    blockEvent("contextmenu", "right-click");

    // DevToolsDetector: heuristic based on the gap between outer and inner window dimensions
    let baseline =
      window.outerWidth - window.innerWidth > 200 ||
      window.outerHeight - window.innerHeight > 200;
    const devtoolsTimer = window.setInterval(() => {
      const deltaW = window.outerWidth - window.innerWidth;
      const deltaH = window.outerHeight - window.innerHeight;
      const nowOpen = deltaW > 200 || deltaH > 200;
      if (nowOpen && !baseline) {
        recordViolation("devtools", `Docked DevTools detected (${deltaW}x${deltaH}px)`);
      }
      baseline = nowOpen;
    }, 2000);
    cleanups.push(() => window.clearInterval(devtoolsTimer));

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [monitoring, recordViolation]);

  // ---- Imperative controls --------------------------------------------

  const startMonitoring = useCallback(() => {
    queueMicrotask(() => setMonitoring(true));
  }, []);

  const stopMonitoring = useCallback(() => {
    queueMicrotask(() => setMonitoring(false));
  }, []);

  const totalViolations = events.length;

  const stats = useMemo(() => {
    let tabSwitches = 0;
    let fullscreenExits = 0;
    let copyPasteAttempts = 0;
    let screenshotAttempts = 0;
    let devtoolsAttempts = 0;
    let keyboardShortcuts = 0;

    for (const ev of events) {
      if (ev.type === "tab-switch") tabSwitches++;
      else if (ev.type === "fullscreen-exit") fullscreenExits++;
      else if (ev.type === "copy-paste" || ev.type === "right-click") copyPasteAttempts++;
      else if (ev.type === "screenshot") screenshotAttempts++;
      else if (ev.type === "devtools") devtoolsAttempts++;
      else if (ev.type === "keyboard") keyboardShortcuts++;
    }

    return {
      tabSwitches,
      fullscreenExits,
      copyPasteAttempts,
      screenshotAttempts,
      devtoolsAttempts,
      keyboardShortcuts,
      totalViolations: events.length,
    };
  }, [events]);

  return {
    strikes,
    events,
    stats,
    isAutoSubmitted,
    totalViolations,
    recordViolation,
    reset,
    startMonitoring,
    stopMonitoring,
    isStrict,
    monitoring,
  };
}
