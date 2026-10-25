"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Maximize2, Mic, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WebcamPiP
 *
 * A draggable, resizable, minimizable webcam and microphone preview that floats above
 * proctored screens (aptitude test, coding test, AI interview live phase).
 *
 * Features:
 * - Live webcam feed via getUserMedia()
 * - Live microphone level visualizer via AudioContext & AnalyserNode
 * - Draggable: click + drag anywhere on the PiP to move it
 * - Resizable: 3 sizes (small / medium / large) — cycle via the expand button
 * - Minimizable: collapse to a small camera/mic icon
 * - REC indicator: pulsing red dot (visual reminder that proctoring is active)
 * - Returns null when both camera and mic are disabled
 */

type PiPSize = "small" | "medium" | "large";

const SIZE_DIMS: Record<PiPSize, { w: number; h: number; label: string }> = {
  small: { w: 170, h: 125, label: "S" },
  medium: { w: 240, h: 180, label: "M" },
  large: { w: 320, h: 240, label: "L" },
};

export function WebcamPiP({
  enabled,
  cameraEnabled = true,
  micEnabled = false,
}: {
  enabled: boolean;
  cameraEnabled?: boolean;
  micEnabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<PiPSize>("small");
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const shouldRender = enabled && (cameraEnabled || micEnabled);

  // ── Start / stop media based on `enabled`, `cameraEnabled`, and `micEnabled` ─────────
  useEffect(() => {
    if (!shouldRender) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      queueMicrotask(() => {
        setCameraOn(false);
        setMicOn(false);
        setAudioLevel(0);
        setPermissionDenied(false);
        setPosition(null);
        setMinimized(false);
      });
      return;
    }

    let cancelled = false;
    let animId: number;

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: cameraEnabled ? { width: 320, height: 240, facingMode: "user" } : false,
          audio: micEnabled ? { echoCancellation: true, noiseSuppression: false } : false,
        })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;

          if (cameraEnabled && stream.getVideoTracks().length > 0) {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
            setCameraOn(true);
          } else {
            setCameraOn(false);
          }

          if (micEnabled && stream.getAudioTracks().length > 0) {
            setMicOn(true);
            try {
              const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
              const audioCtx = new AudioContextClass();
              audioCtxRef.current = audioCtx;
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              const source = audioCtx.createMediaStreamSource(stream);
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              let lastSpike = 0;
              const monitor = () => {
                if (cancelled) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                const normalized = Math.min(100, Math.round((avg / 128) * 100));
                setAudioLevel(normalized);

                if (normalized > 35 && Date.now() - lastSpike > 1500) {
                  lastSpike = Date.now();
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("proctor:audio-spike"));
                  }
                }

                animId = requestAnimationFrame(monitor);
              };
              monitor();
            } catch (err) {
              console.warn("AudioContext setup failed:", err);
            }
          } else {
            setMicOn(false);
          }
        })
        .catch(() => {
          if (!cancelled) queueMicrotask(() => setPermissionDenied(true));
        });
    } else {
      queueMicrotask(() => setPermissionDenied(true));
    }

    return () => {
      cancelled = true;
      if (animId) cancelAnimationFrame(animId);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [shouldRender, cameraEnabled, micEnabled]);

  // Callback ref to instantly bind media stream whenever the video element mounts (e.g. after restoring from minimized)
  const bindVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && streamRef.current.getVideoTracks().length > 0) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = true; });
      if (el.srcObject !== streamRef.current) {
        el.srcObject = streamRef.current;
      }
      el.play().catch(() => {});
    }
  }, []);

  // Ensure video element gets stream if rendered after stream initialized or when un-minimized
  useEffect(() => {
    if (!minimized && cameraEnabled && videoRef.current && streamRef.current && streamRef.current.getVideoTracks().length > 0) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = true; });
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [cameraEnabled, cameraOn, minimized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // ── Default position: bottom-right corner ──────────────────────────────
  useEffect(() => {
    if (shouldRender && position === null) {
      const dims = SIZE_DIMS[size];
      const margin = 24;
      queueMicrotask(() => {
        setPosition({
          x: window.innerWidth - dims.w - margin,
          y: window.innerHeight - dims.h - margin,
        });
      });
    }
  }, [shouldRender, position, size]);

  // ── Drag handlers ───────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (minimized) return;
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      setDragging(true);
      dragOffsetRef.current = {
        dx: e.clientX - (position?.x ?? 0),
        dy: e.clientY - (position?.y ?? 0),
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [minimized, position],
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

  if (!shouldRender || permissionDenied) return null;

  const dims = SIZE_DIMS[size];

  // ── Minimized state: tiny icon pill ──────────────────────────────────
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
          onClick={() => {
            setMinimized(false);
            setTimeout(() => {
              if (videoRef.current && streamRef.current && streamRef.current.getVideoTracks().length > 0) {
                streamRef.current.getVideoTracks().forEach((t) => { t.enabled = true; });
                if (videoRef.current.srcObject !== streamRef.current) {
                  videoRef.current.srcObject = streamRef.current;
                }
                videoRef.current.play().catch(() => {});
              }
            }, 50);
          }}
          className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/90 shadow-2xl backdrop-blur-sm transition-colors hover:bg-black/80"
          title="Show proctoring window"
        >
          {cameraEnabled ? (
            <Camera className="h-5 w-5 text-white" />
          ) : (
            <Mic className="h-5 w-5 text-white" />
          )}
          {(cameraOn || micOn) && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-red-500 ring-2 ring-black" />
          )}
        </button>
      </div>
    );
  }

  // ── Audio-only Floating Widget (Camera OFF, Mic ON) ─────────────────────
  if (!cameraEnabled && micEnabled) {
    return (
      <div
        className={cn(
          "fixed z-[9999] select-none overflow-hidden rounded-xl border border-white/20 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md",
          dragging && "cursor-grabbing",
          !dragging && "cursor-grab",
        )}
        style={{
          left: position?.x ?? 0,
          top: position?.y ?? 0,
          width: 200,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Mic Active</span>
          </div>
          <button
            onClick={() => setMinimized(true)}
            className="grid h-5 w-5 place-items-center rounded bg-white/10 text-white/80 hover:bg-white/20"
            title="Minimize"
          >
            <Minimize2 className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <Mic className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-75"
              style={{ width: `${Math.min(100, audioLevel * 1.6)}%` }}
            />
          </div>
        </div>
        <p className="mt-1 text-[9px] text-zinc-400 text-center">Audio Proctoring Simulation</p>
      </div>
    );
  }

  // ── Full Camera (+ Mic) PiP ────────────────────────────────────────────
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
          ref={bindVideoRef}
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

      {/* Mic Audio Level overlay (bottom-left) */}
      {micEnabled && micOn && (
        <div className="pointer-events-none absolute bottom-1.5 left-2 flex items-center gap-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white">
          <Mic className="h-2.5 w-2.5 text-emerald-300" />
          <div className="h-1.5 w-10 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-75"
              style={{ width: `${Math.min(100, audioLevel * 1.5)}%` }}
            />
          </div>
        </div>
      )}

      {/* Size label (bottom-right, subtle if mic is active, else bottom-left) */}
      {!micEnabled && (
        <div className="pointer-events-none absolute bottom-1.5 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/70">
          {dims.label}
        </div>
      )}

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

      {/* Drag handle hint */}
      <div className="pointer-events-none absolute bottom-1 right-2 text-[8px] text-white/30">
        drag
      </div>
    </div>
  );
}
