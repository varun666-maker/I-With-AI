"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav, type ScreenId, type AccentTheme } from "@/lib/store";
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

const FLOW_LABELS: Record<FlowKind, string> = {
  prep: "Prep Mode",
  admin: "Hiring · Admin",
  candidate: "Hiring · Candidate",
  superadmin: "Super Admin",
};

/**
 * Map each of the 12 accent themes to a gradient pair.
 * The FlowNav uses the USER'S SELECTED accent — not a hardcoded per-flow color.
 * So if you pick "ocean" from the theme switcher, every flow's nav bar is ocean-colored.
 */
const ACCENT_GRADIENTS: Record<
  AccentTheme,
  { from: string; to: string; solid: string; glow: string; soft: string; text: string }
> = {
  violet:   { from: "#a855f7", to: "#d946ef", solid: "#a855f7", glow: "rgba(168, 85, 247, 0.5)",  soft: "rgba(168, 85, 247, 0.10)",  text: "#a855f7" },
  ocean:    { from: "#0ea5e9", to: "#06b6d4", solid: "#0ea5e9", glow: "rgba(14, 165, 233, 0.5)",  soft: "rgba(14, 165, 233, 0.10)",  text: "#0ea5e9" },
  forest:   { from: "#10b981", to: "#14b8a6", solid: "#10b981", glow: "rgba(16, 185, 129, 0.5)",  soft: "rgba(16, 185, 129, 0.10)",  text: "#10b981" },
  sunset:   { from: "#f59e0b", to: "#f43f5e", solid: "#f59e0b", glow: "rgba(245, 158, 11, 0.5)",  soft: "rgba(245, 158, 11, 0.10)",  text: "#f59e0b" },
  coral:    { from: "#f43f5e", to: "#fb923c", solid: "#f43f5e", glow: "rgba(244, 63, 94, 0.5)",   soft: "rgba(244, 63, 94, 0.10)",   text: "#f43f5e" },
  lavender: { from: "#a855f7", to: "#ec4899", solid: "#a855f7", glow: "rgba(168, 85, 247, 0.5)",  soft: "rgba(168, 85, 247, 0.10)",  text: "#a855f7" },
  mint:     { from: "#10b981", to: "#84cc16", solid: "#10b981", glow: "rgba(16, 185, 129, 0.5)",  soft: "rgba(16, 185, 129, 0.10)",  text: "#10b981" },
  sunrise:  { from: "#f59e0b", to: "#f97316", solid: "#f59e0b", glow: "rgba(245, 158, 11, 0.5)",  soft: "rgba(245, 158, 11, 0.10)",  text: "#f59e0b" },
  berry:    { from: "#ec4899", to: "#a855f7", solid: "#ec4899", glow: "rgba(236, 72, 153, 0.5)",  soft: "rgba(236, 72, 153, 0.10)",  text: "#ec4899" },
  sage:     { from: "#14b8a6", to: "#22c55e", solid: "#14b8a6", glow: "rgba(20, 184, 166, 0.5)",  soft: "rgba(20, 184, 166, 0.10)",  text: "#14b8a6" },
  ember:    { from: "#ef4444", to: "#f59e0b", solid: "#ef4444", glow: "rgba(239, 68, 68, 0.5)",   soft: "rgba(239, 68, 68, 0.10)",   text: "#ef4444" },
  mono:     { from: "#64748b", to: "#1f2937", solid: "#64748b", glow: "rgba(100, 116, 139, 0.4)", soft: "rgba(100, 116, 139, 0.10)", text: "#64748b" },
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
 * Uses the USER'S SELECTED ACCENT THEME for all colors — so if you pick
 * "ocean" from the theme switcher, the nav bar is ocean-colored across
 * all 4 flows. The flow is identified by the text label only.
 *
 * Layout:
 *   [← Back to {prev}]    ● ● ◉ ○ ○ ○ ○ ○    [Continue to {next} →]
 *
 * - First step:  no Back button, just flow label + Continue
 * - Last step:   no Continue, just "Back to {home}"
 * - Middle:      Back (left) + progress dots (center) + Continue (right)
 */
export function FlowNav() {
  const current = useNav((s) => s.current);
  const accentTheme = useNav((s) => s.accent);
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
  const accent = ACCENT_GRADIENTS[accentTheme];
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
              className="group inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-black/20 hover:bg-black/5 hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
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
              <span className="hidden sm:inline">{FLOW_LABELS[kind]}</span>
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
                    <span className="block h-2 w-2 rounded-full bg-black/15 transition-all group-hover:bg-black/30 group-hover:scale-125 dark:bg-white/15 dark:group-hover:bg-white/30" />
                  )}
                </button>
              );
            })}
          </div>
          <span className="hidden text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:inline">
            {currentIdx + 1} / {totalSteps}
          </span>
        </div>

        {/* ─── RIGHT: Continue button (contextual) ─── */}
        <div className="flex min-w-[120px] flex-1 items-center justify-end">
          {isLastStep ? (
            <button
              onClick={() => set(homeBaseId)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-black/20 hover:bg-black/5 hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
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
