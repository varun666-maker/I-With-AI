"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertOctagon, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViolationType } from "@/lib/proctoring";

/**
 * ProctoringWarning
 *
 * A modal-style overlay that announces a proctoring strike. Strikes 1 and 2
 * are advisory (amber), strike 3 is terminal (rose) and triggers an
 * auto-submit flow. The overlay sits at z-index 700 so it sits above every
 * other UI surface including dialogs and toasts.
 *
 * No emojis are used. Copy avoids em dashes per the design system rules.
 */

const VIOLATION_LABELS: Record<ViolationType, string> = {
  "tab-switch": "Tab switch detected",
  "fullscreen-exit": "Fullscreen exit detected",
  phone: "Phone detected in frame",
  "extra-person": "Extra person detected",
  keyboard: "Blocked keyboard shortcut",
  "copy-paste": "Copy / paste blocked",
  "right-click": "Right-click blocked",
  devtools: "Developer tools detected",
};

interface ProctoringWarningProps {
  /** Which strike this warning represents (1, 2 or 3). */
  strikeNumber: 1 | 2 | 3;
  /** The kind of violation that triggered the strike. */
  violationType: ViolationType;
  /** Called when the candidate dismisses an advisory warning. */
  onAcknowledge: () => void;
  /** Called when the candidate chooses to leave the test on strike 3. */
  onAutoSubmit?: () => void;
  /** Whether the modal is currently open. */
  open: boolean;
}

export function ProctoringWarning({
  strikeNumber,
  violationType,
  onAcknowledge,
  onAutoSubmit,
  open,
}: ProctoringWarningProps) {
  const shouldReduce = useReducedMotion();
  const isTerminal = strikeNumber >= 3;

  // F-03: Focus trap — auto-focus the dismiss button when the modal opens so
  // keyboard-only users can press Enter to dismiss. Also announce strike
  // count via aria-live="assertive".
  const acknowledgeBtnRef = useRef<HTMLButtonElement>(null);
  const autoSubmitBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (isTerminal) {
        autoSubmitBtnRef.current?.focus();
      } else {
        acknowledgeBtnRef.current?.focus();
      }
    }, 50);
    return () => clearTimeout(t);
  }, [open, isTerminal]);

  const tone = isTerminal ? "rose" : "amber";
  const toneClasses = {
    rose: {
      ring: "border-rose-500/40",
      glow: "shadow-[0_0_60px_-12px_rgba(244,63,94,0.55)]",
      icon: "text-rose-500",
      accentText: "text-rose-600 dark:text-rose-300",
      accentBg: "bg-rose-500/10",
      button: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    amber: {
      ring: "border-amber-500/40",
      glow: "shadow-[0_0_60px_-12px_rgba(245,158,11,0.5)]",
      icon: "text-amber-500",
      accentText: "text-amber-600 dark:text-amber-300",
      accentBg: "bg-amber-500/10",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
    },
  }[tone];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[700] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.2 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="proctoring-warning-title"
          aria-describedby="proctoring-warning-desc"
        >
          {/* Scrim that blocks all interaction underneath. */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={shouldReduce ? undefined : { scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={shouldReduce ? undefined : { scale: 0.96, opacity: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6 shadow-2xl",
              toneClasses.ring,
              toneClasses.glow,
            )}
          >
            {/* Tone band */}
            <div className={cn("absolute inset-x-0 top-0 h-1", toneClasses.accentBg)} />

            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
                  toneClasses.ring,
                  toneClasses.accentBg,
                  toneClasses.icon,
                )}
              >
                {isTerminal ? (
                  <AlertOctagon className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {/* GR-1: Exact copy — WARNING 1 of 3 / WARNING 2 of 3 / TEST AUTO-SUBMITTED */}
                <p
                  className={cn("text-xs font-semibold uppercase tracking-widest", toneClasses.accentText)}
                  aria-live="assertive"
                >
                  {isTerminal ? "TEST AUTO-SUBMITTED" : `WARNING ${strikeNumber} of 3`}
                </p>
                <h3 id="proctoring-warning-title" className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {isTerminal ? "Test auto-submitted" : strikeNumber === 2 ? "Final warning" : "Proctoring violation"}
                </h3>
                <p id="proctoring-warning-desc" className="mt-2 text-sm text-muted-foreground">
                  {isTerminal ? (
                    <>
                      The test has been auto-submitted because 3 proctoring violations were recorded.
                      The last violation was:{" "}
                      <span className={cn("font-medium", toneClasses.accentText)}>
                        {VIOLATION_LABELS[violationType]}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      We noticed:{" "}
                      <span className={cn("font-medium", toneClasses.accentText)}>
                        {VIOLATION_LABELS[violationType]}
                      </span>
                      . Staying focused keeps your test valid. One more violation will end the test.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Strike pips */}
            <div className="mt-5 flex items-center gap-2" aria-hidden>
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    n <= strikeNumber
                      ? isTerminal
                        ? "bg-rose-500"
                        : "bg-amber-500"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {isTerminal ? (
                <Button
                  ref={autoSubmitBtnRef}
                  className={cn("gap-2", toneClasses.button)}
                  onClick={onAutoSubmit}
                >
                  Go to result
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:mr-auto">
                    <ShieldAlert className={cn("h-3.5 w-3.5", toneClasses.icon)} />
                    Logged for review.
                  </div>
                  <Button
                    ref={acknowledgeBtnRef}
                    className={cn("gap-2", toneClasses.button)}
                    onClick={onAcknowledge}
                  >
                    I Understand
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
