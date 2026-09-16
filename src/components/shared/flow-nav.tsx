"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav, type ScreenId } from "@/lib/store";
import { getFlowForScreen, PREP_FLOW, ADMIN_FLOW, CANDIDATE_FLOW, SUPERADMIN_FLOW } from "@/lib/flows";
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

/**
 * Each of the 4 flows gets its OWN distinct accent — no repeating the same
 * violet everywhere. When you switch flows, the entire FlowNav color scheme
 * changes:
 *   prep       → violet  → fuchsia
 *   admin      → sky     → cyan
 *   candidate  → amber   → orange
 *   superadmin → emerald → teal
 */
const FLOW_ACCENTS: Record<
  FlowKind,
  { from: string; to: string; solid: string; glow: string; soft: string; text: string }
> = {
  prep: {
    from: "#a855f7",
    to: "#d946ef",
    solid: "#a855f7",
    glow: "rgba(168, 85, 247, 0.5)",
    soft: "rgba(168, 85, 247, 0.12)",
    text: "#d8b4fe",
  },
  admin: {
    from: "#0ea5e9",
    to: "#06b6d4",
    solid: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.5)",
    soft: "rgba(14, 165, 233, 0.12)",
    text: "#7dd3fc",
  },
  candidate: {
    from: "#f59e0b",
    to: "#f97316",
    solid: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.5)",
    soft: "rgba(245, 158, 11, 0.12)",
    text: "#fcd34d",
  },
  superadmin: {
    from: "#10b981",
    to: "#14b8a6",
    solid: "#10b981",
    glow: "rgba(16, 185, 129, 0.5)",
    soft: "rgba(16, 185, 129, 0.12)",
    text: "#6ee7b7",
  },
};

/**
 * 9-color spectrum — each step in a flow gets its own unique color dot so no
 * two pills look the same. The dot stays visible regardless of state (future /
 * current / done), giving the strip a colorful "journey" feel.
 */
const STEP_COLORS = [
  "#a855f7", // violet
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#d946ef", // fuchsia
  "#06b6d4", // cyan
  "#f97316", // orange
  "#8b5cf6", // purple
];

function inferFlowKind(id: ScreenId): FlowKind {
  if (CANDIDATE_FLOW.some((s) => s.id === id)) return "candidate";
  if (SUPERADMIN_FLOW.some((s) => s.id === id)) return "superadmin";
  if (ADMIN_FLOW.some((s) => s.id === id)) return "admin";
  return "prep";
}

/**
 * FlowNav — sticky top navigation bar. Each flow has its own distinct accent
 * color, and each step within a flow gets a unique color dot so nothing
 * repeats. All pills are always clickable — no locks.
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
  const accent = FLOW_ACCENTS[kind];

  return (
    <div
      className="sticky top-16 z-40 w-full border-b backdrop-blur-xl"
      style={{
        borderColor: `${accent.solid}22`,
        background: `linear-gradient(180deg, ${accent.soft}, transparent)`,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-6 lg:px-8">
        {/* Flow label with accent color — hidden on mobile */}
        <span
          className="hidden shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider lg:inline-flex"
          style={{ color: accent.text }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accent.solid }}
          />
          {FLOW_LABELS[kind]}
        </span>

        {/* Steps strip — each pill has its own unique color dot */}
        <div className="flex-1 overflow-x-auto scrollbar-custom">
          <div className="flex items-center gap-1 min-w-max pr-2">
            {flow.map((step, i) => {
              const active = step.id === current;
              const done = i < currentIdx;
              const stepColor = STEP_COLORS[i % STEP_COLORS.length];

              if (active) {
                return (
                  <button
                    key={step.id}
                    onClick={() => set(step.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white whitespace-nowrap transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                      boxShadow: `0 0 16px -4px ${accent.glow}`,
                    }}
                    title={step.hint}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-white"
                      style={{ boxShadow: `0 0 6px ${stepColor}` }}
                    />
                    {step.label}
                  </button>
                );
              }

              return (
                <button
                  key={step.id}
                  onClick={() => set(step.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
                    done
                      ? "hover:bg-white/5"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white",
                  )}
                  style={done ? { color: stepColor } : undefined}
                  title={step.hint}
                >
                  {done ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: stepColor }} />
                  ) : (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{
                        background: stepColor,
                        opacity: 0.6,
                      }}
                    />
                  )}
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary action button — uses the flow's accent gradient */}
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
              className="group rounded-full border-0 text-white hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                boxShadow: `0 0 20px -6px ${accent.glow}`,
              }}
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
