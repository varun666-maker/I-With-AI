"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  | "devtools";

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
}

/**
 * Hook that wires up the proctoring detectors and exposes the live state.
 *
 * Detectors only attach listeners while `monitoring` is true (toggled via
 * `startMonitoring` / `stopMonitoring`). All `setState` calls performed
 * inside event handlers are deferred via `queueMicrotask` to keep the
 * listener hot-path allocation-free and to satisfy the React lint rule
 * against calling `setState` directly during render of an effect.
 */
export function useProctoring({ mode, onAutoSubmit }: UseProctoringArgs) {
  const [strikes, setStrikes] = useState<number>(0);
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);
  const [monitoring, setMonitoring] = useState<boolean>(false);

  // Refs hold the latest mode + callback so detector closures stay stable
  // without forcing re-binds on every render (which would re-attach listeners).
  const modeRef = useRef<ProctoringMode>(mode);
  const onAutoSubmitRef = useRef<UseProctoringArgs["onAutoSubmit"]>(onAutoSubmit);
  const strikesRef = useRef<number>(0);
  const autoSubmittedRef = useRef<boolean>(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

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

    // TabSwitchDetector: rely on the Page Visibility API.
    const onVisibility = () => {
      if (document.hidden) {
        recordViolation("tab-switch", "Document became hidden");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

    // KeyboardMonitor: block developer shortcuts and clipboard keys.
    // `detail` is a function of the event so it can interpolate the actual
    // key without evaluating it eagerly inside this effect body.
    const blockedCombos: Array<{
      test: (e: KeyboardEvent) => boolean;
      type: ViolationType;
      detail: (e: KeyboardEvent) => string;
    }> = [
      {
        test: (e) =>
          (e.ctrlKey || e.metaKey) && ["c", "v", "x", "a"].includes(e.key.toLowerCase()),
        type: "copy-paste",
        detail: (e) => `Blocked clipboard key: ${e.key.toUpperCase()}`,
      },
      {
        test: (e) => e.key === "F12",
        type: "keyboard",
        detail: () => "Blocked F12 (DevTools)",
      },
      {
        test: (e) =>
          (e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()),
        type: "keyboard",
        detail: (e) => `Blocked Ctrl+Shift+${e.key.toUpperCase()} (DevTools)`,
      },
      {
        test: (e) => e.key === "PrintScreen",
        type: "keyboard",
        detail: () => "Blocked PrintScreen",
      },
    ];

    const onKeyDown = (e: KeyboardEvent) => {
      for (const combo of blockedCombos) {
        if (combo.test(e)) {
          e.preventDefault();
          recordViolation(combo.type, combo.detail(e));
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    cleanups.push(() => window.removeEventListener("keydown", onKeyDown, { capture: true } as EventListenerOptions));

    // CopyPasteBlocker: kill copy/cut/paste/contextmenu at the capture phase.
    const blockEvent = (type: string, violation: ViolationType) => {
      const handler = (e: Event) => {
        e.preventDefault();
        recordViolation(violation, `${type} blocked`);
      };
      window.addEventListener(type, handler, { capture: true });
      cleanups.push(() => window.removeEventListener(type, handler, { capture: true } as EventListenerOptions));
    };
    blockEvent("copy", "copy-paste");
    blockEvent("cut", "copy-paste");
    blockEvent("paste", "copy-paste");
    blockEvent("contextmenu", "right-click");

    // DevToolsDetector: heuristic based on the gap between outer and inner
    // window sizes. A sudden large delta usually means docked DevTools.
    let baseline = window.outerWidth - window.innerWidth > 200 ||
      window.outerHeight - window.innerHeight > 200;
    const devtoolsTimer = window.setInterval(() => {
      const deltaW = window.outerWidth - window.innerWidth;
      const deltaH = window.outerHeight - window.innerHeight;
      const nowOpen = deltaW > 200 || deltaH > 200;
      if (nowOpen && !baseline) {
        recordViolation("devtools", `Window delta ${deltaW}x${deltaH}`);
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

  return {
    strikes,
    events,
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
