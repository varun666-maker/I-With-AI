"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WebcamPiP
 *
 * A draggable, resizable, minimizable webcam preview that floats above
 * proctored screens (aptitude test, coding test, AI interview live phase).
 *
 * Features:
 * - Live webcam feed via getUserMedia() (falls back to placeholder if denied)
 * - Draggable: click + drag anywhere on the PiP to move it
 * - Resizable: 3 sizes (small / medium / large) — cycle via the expand button
 * - Minimizable: collapse to a small camera icon
 * - REC indicator: pulsing red dot (visual reminder that camera is recording)
 * - Always on top: position fixed, z-index 9999
 * - Smart default: bottom-right corner on first mount
 *
 * The component is mounted globally in page.tsx and reads `enabled` from the
 * parent. When `enabled` is false (non-proctored screens), it renders null
 * and releases the camera.
 */

type PiPSize = "small" | "medium" | "large";

const SIZE_DIMS: Record<PiPSize, { w: number; h: number; label: string }> = {
  small: { w: 160, h: 120, label: "S" },
  medium: { w: 240, h: 180, label: "M" },
  large: { w: 320, h: 240, label: "L" },
};

export function WebcamPiP({ enabled }: { enabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<PiPSize>("small");
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // ── Start / stop webcam based on `enabled` ──────────────────────────────
  useEffect(() => {
    if (!enabled) {
      // Release camera when leaving proctored mode
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      queueMicrotask(() => {
        setCameraOn(false);
        setPermissionDenied(false);
        setPosition(null);
        setMinimized(false);
      });
      return;
    }

    // Request camera access
    let cancelled = false;
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 320, height: 240 }, audio: false })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraOn(true);
        })
        .catch(() => {
          if (!cancelled) queueMicrotask(() => setPermissionDenied(true));
        });
    } else {
      queueMicrotask(() => setPermissionDenied(true));
    }

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ── Default position: bottom-right corner ──────────────────────────────
  useEffect(() => {
    if (enabled && position === null) {
      const dims = SIZE_DIMS[size];
      const margin = 24;
      queueMicrotask(() => {
        setPosition({
          x: window.innerWidth - dims.w - margin,
          y: window.innerHeight - dims.h - margin,
        });
      });
    }
  }, [enabled, position, size]);

  // ── Drag handlers ───────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (minimized) return;
      // Don't drag when clicking on control buttons
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      setDragging(true);
      const dims = SIZE_DIMS[size];
      dragOffsetRef.current = {
        dx: e.clientX - (position?.x ?? 0),
        dy: e.clientY - (position?.y ?? 0),
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [minimized, position, size],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dims = SIZE_DIMS[size];
      const newX = Math.max(0, Math.min(window.innerWidth - dims.w, e.clientX - dragOffsetRef.current.dx));
      const newY = Math.max(0, Math.min(window.innerHeight - dims.h, e.clientY - dragOffsetRef.current.dy));
      setPosition({ x: newX, y: newY });
    },
    [dragging, size],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  if (!enabled) return null;

  const dims = SIZE_DIMS[size];

  // ── Minimized state: tiny camera icon ──────────────────────────────────
  if (minimized) {
    return (
      <div
        className="fixed z-[9999] select-none"
        style={{ left: position?.x ?? 0, top: position?.y ?? 0 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <button
          onClick={() => setMinimized(false)}
          className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/90 shadow-2xl backdrop-blur-sm transition-colors hover:bg-black/80"
          title="Show webcam"
        >
          <Camera className="h-5 w-5 text-white" />
          {cameraOn && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-red-500 ring-2 ring-black" />
          )}
        </button>
      </div>
    );
  }

  // ── Full PiP ────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "fixed z-[9999] select-none overflow-hidden rounded-lg border border-white/20 bg-black shadow-2xl",
        dragging && "cursor-grabbing",
        !dragging && "cursor-grab",
      )}
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: dims.w,
        height: dims.h,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Video feed or placeholder */}
      {cameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full -scale-x-100 object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-zinc-900">
          {permissionDenied ? (
            <div className="px-2 text-center">
              <Camera className="mx-auto h-6 w-6 text-zinc-600" />
              <p className="mt-1 text-[10px] text-zinc-500">
                Camera
                <br />
                unavailable
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 animate-pulse rounded-full bg-violet-400" />
              <span className="text-[10px] text-zinc-400">Starting…</span>
            </div>
          )}
        </div>
      )}

      {/* REC indicator (top-left) */}
      {cameraOn && (
        <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-white">REC</span>
        </div>
      )}

      {/* Size label (bottom-left, subtle) */}
      <div className="pointer-events-none absolute bottom-1.5 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/70">
        {dims.label}
      </div>

      {/* Controls (top-right) */}
      <div className="absolute right-1 top-1 flex gap-0.5">
        {/* Cycle size */}
        <button
          onClick={() => {
            setSize((s) => (s === "small" ? "medium" : s === "medium" ? "large" : "small"));
          }}
          className="grid h-6 w-6 place-items-center rounded bg-black/50 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
          title={`Size: ${dims.label} (click to cycle)`}
        >
          <Maximize2 className="h-3 w-3" />
        </button>
        {/* Minimize */}
        <button
          onClick={() => setMinimized(true)}
          className="grid h-6 w-6 place-items-center rounded bg-black/50 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
          title="Minimize"
        >
          <Minimize2 className="h-3 w-3" />
        </button>
      </div>

      {/* Drag handle hint (bottom-right) */}
      <div className="pointer-events-none absolute bottom-1 right-2 text-[8px] text-white/30">
        drag
      </div>
    </div>
  );
}
