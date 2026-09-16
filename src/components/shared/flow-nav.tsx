"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav, type ScreenId } from "@/lib/store";
import { getFlowForScreen } from "@/lib/flows";
import { cn } from "@/lib/utils";

type FlowKind = "prep" | "admin" | "candidate" | "superadmin";

const HOME_BASE: Record<FlowKind, ScreenId> = {
  prep: "dashboard",
  admin: "admin-dashboard",
  candidate: "candidate-dashboard",
  superadmin: "superadmin-dashboard",
};

const FLOW_LABELS: Record<FlowKind, string> = {
  prep: "Prep Mode",
  admin: "Hiring · Admin",
  candidate: "Hiring · Candidate",
  superadmin: "Super Admin",
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

/**
 * FlowNav — sticky top navigation bar showing the current flow's steps as
 * clickable pills. Rendered globally in page.tsx (between TopNav and the
 * active screen). No locks, no "Step X of Y", no explicit Back button.
 *
 * Design:
 *  - Left:  flow label + horizontally-scrollable step pills
 *  - Right: "Continue to {next}" primary button (or "Back to {home}" on last step)
 *
 * All pills are always clickable — free navigation. Sequential locking for
 * candidate rounds lives on the candidate dashboard itself, not here.
 */
export function FlowNav() {
  const current = useNav((s) => s.current);
  const set = useNav((s) => s.set);

  const flow = getFlowForScreen(current);
  if (!flow) return null;

  const kind = inferFlowKind(current);
  const currentIdx = flow.findIndex((s) => s.id === current);
  if (currentIdx === -1) return null;

  const next = flow[currentIdx + 1] ?? null;
  const homeBaseId = HOME_BASE[kind];
  const isLastStep = !next;

  return (
    <div className="sticky top-16 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-6 lg:px-8">
        {/* Flow label — hidden on mobile to save space */}
        <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:inline">
          {FLOW_LABELS[kind]}
        </span>

        {/* Steps strip — horizontally scrollable on small screens */}
        <div className="flex-1 overflow-x-auto scrollbar-custom">
          <div className="flex items-center gap-1 min-w-max pr-2">
            {flow.map((step, i) => {
              const active = step.id === current;
              const done = i < currentIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => set(step.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
                    active
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_16px_-4px_rgba(168,85,247,0.5)]"
                      : done
                        ? "text-emerald-300 hover:bg-emerald-500/10"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white",
                  )}
                  title={step.hint}
                >
                  {done && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary action button — right side */}
        <div className="flex shrink-0 items-center">
          {isLastStep ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => set(homeBaseId)}
              className="rounded-full border-white/15 bg-white/5 text-foreground hover:bg-white/10"
            >
              Back to {kind === "prep" ? "Dashboard" : kind === "candidate" ? "Campaign" : "Home"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => set(next!.id)}
              className="group rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={next!.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  {next!.label}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </motion.span>
              </AnimatePresence>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
