"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Lock, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/shared/primitives";
import { useNav, type ScreenId } from "@/lib/store";
import { getFlowForScreen, type FlowStep } from "@/lib/flows";
import { cn } from "@/lib/utils";

type FlowKind = "prep" | "admin" | "candidate" | "superadmin";

const HOME_BASE: Record<FlowKind, ScreenId> = {
  prep: "dashboard",
  admin: "admin-dashboard",
  candidate: "candidate-dashboard",
  superadmin: "superadmin-dashboard",
};

const FLOW_KINDS: Record<FlowKind, FlowStep[]> = {
  prep: [],          // populated below via getFlowForScreen
  admin: [],
  candidate: [],
  superadmin: [],
};

function inferFlowKind(id: ScreenId): FlowKind {
  if (id.startsWith("candidate")) return "candidate";
  if (id.startsWith("superadmin")) return "superadmin";
  if (
    id.startsWith("admin") ||
    id.startsWith("company") ||
    id.startsWith("campaign") ||
    id.startsWith("question") ||
    id.startsWith("bulk") ||
    id.startsWith("proctoring") ||
    id.startsWith("final")
  )
    return "admin";
  return "prep";
}

const HOME_BASE_LABEL: Record<FlowKind, string> = {
  prep: "Dashboard",
  admin: "Admin Dashboard",
  candidate: "Campaign",
  superadmin: "Super Admin Dashboard",
};

/**
 * FlowNav — sequential navigation CTA placed at the bottom of every screen
 * in a flow. Shows the user where they are in the journey and what comes next.
 */
export function FlowNav({
  flowId,
  currentScreenId,
  className,
}: {
  flowId?: FlowKind;
  currentScreenId?: ScreenId;
  className?: string;
}) {
  const current = useNav((s) => s.current);
  const set = useNav((s) => s.set);
  const id = currentScreenId ?? current;

  const kind = flowId ?? inferFlowKind(id);
  const flow = getFlowForScreen(id);
  if (!flow) return null;

  const currentIdx = flow.findIndex((s) => s.id === id);
  if (currentIdx === -1) return null;

  const next = flow[currentIdx + 1] ?? null;
  const prev = flow[currentIdx - 1] ?? null;
  const homeBaseId = HOME_BASE[kind];
  const homeBaseLabel = HOME_BASE_LABEL[kind];

  return (
    <div className={cn("mt-12", className)}>
      <GlowCard className="relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />

        {/* Stepper */}
        <div className="mb-5 overflow-x-auto scrollbar-custom">
          <ol className="flex min-w-max items-center gap-2 pr-4">
            {flow.map((step, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              const locked = i > currentIdx;
              return (
                <li key={step.id} className="flex items-center gap-2">
                  <button
                    onClick={() => i <= currentIdx && set(step.id)}
                    disabled={locked}
                    className={cn(
                      "group flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-all",
                      active
                        ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                        : done
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                          : "border-white/5 bg-white/[0.02] text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : active ? (
                      <Circle className="h-3.5 w-3.5 fill-violet-400 text-violet-400" />
                    ) : (
                      <Lock className="h-3 w-3.5 opacity-50" />
                    )}
                    <span className="font-medium">{step.label}</span>
                  </button>
                  {i < flow.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Hint + next CTA */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Step {currentIdx + 1} of {flow.length}
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              <span className="font-semibold text-foreground">{flow[currentIdx].label}</span>
              {" — "}
              {flow[currentIdx].hint}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {prev && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => set(prev.id)}
                className="rounded-full text-muted-foreground"
              >
                Back: {prev.label}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => set(homeBaseId)}
              className="rounded-full text-muted-foreground"
            >
              <SkipForward className="mr-1 h-3.5 w-3.5" />
              Skip to {homeBaseLabel}
            </Button>
            {next ? (
              <Button
                size="sm"
                onClick={() => set(next.id)}
                className="group rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={next.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-1.5"
                  >
                    Continue to {next.label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </motion.span>
                </AnimatePresence>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => set(homeBaseId)}
                className="group rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 hover:from-emerald-400 hover:to-teal-400"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Finish — back to {homeBaseLabel}
              </Button>
            )}
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

// Keep this for backwards-compat with any code that might import it
export { FLOW_KINDS };
