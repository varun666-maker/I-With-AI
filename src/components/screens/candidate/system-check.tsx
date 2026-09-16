"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Check,
  Chrome,
  Loader2,
  Maximize2,
  Mic,
  Monitor,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PulseBadge,
  revealItem,
  StaggeredReveal,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

type CheckState = "pending" | "ok" | "fail";

interface CheckRow {
  id: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  state: CheckState;
  action?: string; // when state is pending, the button label
  onAction?: () => void; // mock — flips to ok
}

export function PreTestCheck() {
  const { set } = useNav();
  // Pre-passed: browser + microphone. Pending: camera + fullscreen.
  const [checks, setChecks] = useState<Record<string, CheckState>>({
    browser: "ok",
    mic: "ok",
    camera: "pending",
    fullscreen: "pending",
  });
  const [busy, setBusy] = useState<string | null>(null);

  const runMock = (id: string) => {
    setBusy(id);
    // Mock permission request — in production this calls getUserMedia / requestFullscreen.
    setTimeout(() => {
      setChecks((p) => ({ ...p, [id]: "ok" }));
      setBusy(null);
    }, 900);
  };

  const rows: CheckRow[] = [
    {
      id: "browser",
      label: "Browser",
      detail: "Chrome 120 (supported)",
      icon: Chrome,
      state: checks.browser,
    },
    {
      id: "mic",
      label: "Microphone",
      detail: "Working — clear input detected",
      icon: Mic,
      state: checks.mic,
    },
    {
      id: "camera",
      label: "Camera",
      detail: checks.camera === "ok" ? "Permission granted" : "Permission required",
      icon: Camera,
      state: checks.camera,
      action: "Request Permission",
      onAction: () => runMock("camera"),
    },
    {
      id: "fullscreen",
      label: "Fullscreen",
      detail:
        checks.fullscreen === "ok"
          ? "Fullscreen mode active"
          : "Enter fullscreen to proceed",
      icon: Maximize2,
      state: checks.fullscreen,
      action: "Enter Fullscreen",
      onAction: () => runMock("fullscreen"),
    },
  ];

  const allOk = Object.values(checks).every((s) => s === "ok");

  return (
    <AuroraBackground>
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <PulseBadge color="amber">Mandatory · Enforced Proctoring</PulseBadge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-5 text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          🔍 <span className="gradient-text text-glow">System Check</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-3 text-center text-sm text-muted-foreground sm:text-base"
        >
          Run these checks before each assessment round. Hiring-mode proctoring
          is enforced — you can&apos;t skip any step.
        </motion.p>

        <StaggeredReveal className="mt-8 w-full" delay={0.05}>
          <motion.div variants={revealItem}>
            <GlowCard className="relative overflow-hidden p-6 sm:p-8">
              {/* Progress bar */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-violet-300" />
                  <p className="text-sm font-medium">
                    {Object.values(checks).filter((s) => s === "ok").length}/
                    {Object.keys(checks).length} checks passed
                  </p>
                </div>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    initial={{ width: "50%" }}
                    animate={{
                      width: `${
                        (Object.values(checks).filter((s) => s === "ok").length /
                          Object.keys(checks).length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <ul className="space-y-3">
                {rows.map((row) => (
                  <CheckRowItem
                    key={row.id}
                    row={row}
                    busyId={busy}
                    onAction={row.onAction}
                  />
                ))}
              </ul>

              <Separator className="my-5 bg-white/5" />

              <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-100/90">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                <p>
                  <span className="font-medium">All checks must pass to continue.</span>{" "}
                  Camera and fullscreen stay mandatory throughout your assessment.
                  Exiting fullscreen or covering the webcam will trigger
                  proctoring warnings.
                </p>
              </div>

              <MagneticButton
                disabled={!allOk}
                onClick={() => set("candidate-dashboard")}
                className="mt-5 h-11 w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Continue to Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </MagneticButton>
            </GlowCard>
          </motion.div>
        </StaggeredReveal>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          Your camera feed is processed locally for object detection. Webcam
          frames are stored only if a violation is flagged.
        </motion.p>

      </section>
    </AuroraBackground>
  );
}

function CheckRowItem({
  row,
  busyId,
  onAction,
}: {
  row: CheckRow;
  busyId: string | null;
  onAction?: () => void;
}) {
  const isOk = row.state === "ok";
  const isBusy = busyId === row.id;

  return (
    <motion.li
      layout
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
        isOk
          ? "border-emerald-400/20 bg-emerald-500/5"
          : "border-white/10 bg-white/[0.02]",
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
          isOk
            ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
            : "bg-violet-500/10 text-violet-200 ring-white/10",
        )}
      >
        <row.icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{row.label}</p>
        <p
          className={cn(
            "text-xs",
            isOk ? "text-emerald-200/90" : "text-muted-foreground",
          )}
        >
          {row.detail}
        </p>
      </div>

      {/* State indicator */}
      <AnimatePresence mode="wait" initial={false}>
        {isOk ? (
          <motion.div
            key="ok"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 16 }}
            className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-400/30"
          >
            <Check className="h-4 w-4" />
          </motion.div>
        ) : isBusy ? (
          <motion.div
            key="busy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-violet-200"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Requesting…
          </motion.div>
        ) : (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-dashed border-white/20 text-white/30">
              <span className="h-2 w-2 rounded-full bg-white/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {row.action && !isOk && !isBusy && (
        <Button
          size="sm"
          variant="outline"
          onClick={onAction}
          className="h-8 rounded-full border-white/15 bg-white/5 text-xs hover:bg-white/10"
        >
          {row.action}
        </Button>
      )}
    </motion.li>
  );
}
