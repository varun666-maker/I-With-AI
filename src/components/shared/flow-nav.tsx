"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav, type ScreenId } from "@/lib/store";
import {
  getFlowForScreen,
  PREP_FLOW,
  ADMIN_FLOW,
  CANDIDATE_FLOW,
  SUPERADMIN_FLOW,
} from "@/lib/flows";
import { cn } from "@/lib/utils";

type FlowKind = "prep" | "admin" | "candidate" | "superadmin";

const HOME_BASE: Record<FlowKind, ScreenId> = {
  prep: "dashboard",
  admin: "admin-dashboard",
  candidate: "candidate-dashboard",
  superadmin: "superadmin-dashboard",
};

const HOME_BASE_LABEL: Record<FlowKind, string> = {
  prep: "Dashboard",
  admin: "Admin Dashboard",
  candidate: "Campaign",
  superadmin: "Super Admin Dashboard",
};

/**
 * Each flow has its OWN distinct accent — no repeating the same violet.
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
    soft: "rgba(168, 85, 247, 0.10)",
    text: "#d8b4fe",
  },
  admin: {
    from: "#0ea5e9",
    to: "#06b6d4",
    solid: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.5)",
    soft: "rgba(14, 165, 233, 0.10)",
    text: "#7dd3fc",
  },
  candidate: {
    from: "#f59e0b",
    to: "#f97316",
    solid: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.5)",
    soft: "rgba(245, 158, 11, 0.10)",
    text: "#fcd34d",
  },
  superadmin: {
    from: "#10b981",
    to: "#14b8a6",
    solid: "#10b981",
    glow: "rgba(16, 185, 129, 0.5)",
    soft: "rgba(16, 185, 129, 0.10)",
    text: "#6ee7b7",
  },
};

function inferFlowKind(id: ScreenId): FlowKind {
  if (CANDIDATE_FLOW.some((s) => s.id === id)) return "candidate";
  if (SUPERADMIN_FLOW.some((s) => s.id === id)) return "superadmin";
  if (ADMIN_FLOW.some((s) => s.id === id)) return "admin";
  return "prep";
}

/**
 * FlowNav — wizard-style sticky top bar (Swiggy/Zomato checkout pattern).
 *
 * Layout:
 *   [← Back to {prev}]    ● ● ◉ ○ ○ ○ ○ ○    [Continue to {next} →]
 *
 * - First step:  no Back button, just Continue on the right
 * - Last step:   no Continue, just "Back to {home}" on the right
 * - Middle:      Back (left) + progress dots (center) + Continue (right)
 *
 * Each flow has its own accent color. The progress dots are minimal —
 * filled = completed, accent ring = current, muted = future. No step
 * names shown in the strip (production SaaS pattern — progressive
 * disclosure, not "show everything on the home page").
 *
 * Candidate logic: the strict round-unlocking (Aptitude → Coding →
 * Interview) lives on the candidate dashboard's round cards, NOT here.
 * FlowNav allows free navigation between all candidate screens.
 */
export function FlowNav() {
  const current = useNav((s) => s.current);
  const set = useNav((s) => s.set);

  const flow = getFlowForScreen(current);
  if (!flow) return null;

  const kind = inferFlowKind(current);
  const currentIdx = flow.findIndex((s) => s.id === current);
  if (currentIdx === -1) return null;

  const prev = flow[currentIdx - 1] ?? null;
  const next = flow[currentIdx + 1] ?? null;
  const homeBaseId = HOME_BASE[kind];
  const homeBaseLabel = HOME_BASE_LABEL[kind];
  const isFirstStep = !prev;
  const isLastStep = !next;
  const accent = FLOW_ACCENTS[kind];
  const totalSteps = flow.length;

  return (
    <div
      className="sticky top-16 z-40 w-full border-b backdrop-blur-xl"
      style={{
        borderColor: `${accent.solid}22`,
        background: `linear-gradient(180deg, ${accent.soft}, transparent)`,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 lg:px-8">
        {/* ─── LEFT: Back button (contextual) ─── */}
        <div className="flex min-w-[120px] flex-1 items-center justify-start">
          {!isFirstStep ? (
            <button
              onClick={() => set(prev!.id)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back to</span>
              <span className="font-semibold text-foreground">{prev!.label}</span>
            </button>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: accent.text }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: accent.solid }}
              />
              <span className="hidden sm:inline">
                {kind === "prep" ? "Prep Mode" : kind === "admin" ? "Hiring · Admin" : kind === "candidate" ? "Hiring · Candidate" : "Super Admin"}
              </span>
            </span>
          )}
        </div>

        {/* ─── CENTER: Progress dots (minimal, no labels) ─── */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            {flow.map((step, i) => {
              const active = i === currentIdx;
              const done = i < currentIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => set(step.id)}
                  className="group relative"
                  title={`${step.label} — ${step.hint}`}
                  aria-label={`Go to ${step.label}`}
                >
                  {active ? (
                    <span
                      className="block h-2 w-2 rounded-full transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                        boxShadow: `0 0 8px ${accent.glow}`,
                        transform: "scale(1.4)",
                      }}
                    />
                  ) : done ? (
                    <span
                      className="block h-2 w-2 rounded-full transition-all group-hover:scale-125"
                      style={{ background: accent.solid }}
                    />
                  ) : (
                    <span className="block h-2 w-2 rounded-full bg-white/15 transition-all group-hover:bg-white/30 group-hover:scale-125" />
                  )}
                </button>
              );
            })}
          </div>
          {/* Tiny step counter — only visible on sm+ */}
          <span className="hidden text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:inline">
            {currentIdx + 1} / {totalSteps}
          </span>
        </div>

        {/* ─── RIGHT: Continue button (contextual) ─── */}
        <div className="flex min-w-[120px] flex-1 items-center justify-end">
          {isLastStep ? (
            <button
              onClick={() => set(homeBaseId)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <Home className="h-3 w-3" />
              <span className="hidden sm:inline">Back to</span>
              <span className="font-semibold text-foreground">{homeBaseLabel}</span>
            </button>
          ) : (
            <button
              onClick={() => set(next!.id)}
              className="group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
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
                  <span className="hidden sm:inline">Continue to</span>
                  <span>{next!.label}</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </motion.span>
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
