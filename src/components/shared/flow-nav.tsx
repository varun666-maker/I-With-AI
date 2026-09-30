"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  candidate: "landing",
  superadmin: "superadmin-dashboard",
};

const ACCENT_GRADIENTS: Record<
  AccentTheme,
  { from: string; to: string; solid: string; soft: string }
> = {
  violet:           { from: "#a855f7", to: "#d946ef", solid: "#a855f7", soft: "rgba(168,85,247,0.06)" },
  ocean:            { from: "#0ea5e9", to: "#06b6d4", solid: "#0ea5e9", soft: "rgba(14,165,233,0.06)" },
  forest:           { from: "#10b981", to: "#14b8a6", solid: "#10b981", soft: "rgba(16,185,129,0.06)" },
  sunrise:          { from: "#f59e0b", to: "#f97316", solid: "#f59e0b", soft: "rgba(245,158,11,0.06)" },
  emerald:          { from: "#059669", to: "#34d399", solid: "#059669", soft: "rgba(5,150,105,0.06)" },
  "master-purple":  { from: "#6d28d9", to: "#a855f7", solid: "#6d28d9", soft: "rgba(109,40,217,0.06)" },
  ruby:             { from: "#be123c", to: "#f43f5e", solid: "#be123c", soft: "rgba(190,18,60,0.06)" },
  gold:             { from: "#b45309", to: "#fbbf24", solid: "#b45309", soft: "rgba(180,83,9,0.06)" },
  rose:             { from: "#9f1239", to: "#fb7185", solid: "#9f1239", soft: "rgba(159,18,57,0.06)" },
  midnight:         { from: "#334155", to: "#64748b", solid: "#64748b", soft: "rgba(100,116,139,0.06)" },
  sakura:           { from: "#ec4899", to: "#fbcfe8", solid: "#ec4899", soft: "rgba(236,72,153,0.06)" },
  "forest-sovereign": { from: "#14532d", to: "#22c55e", solid: "#22c55e", soft: "rgba(34,197,94,0.06)" },
  slate:            { from: "#334155", to: "#64748b", solid: "#64748b", soft: "rgba(100,116,139,0.06)" },
  coral:            { from: "#f97316", to: "#fb7185", solid: "#f97316", soft: "rgba(249,115,22,0.06)" },
  "cosmic-diamond": { from: "#6366f1", to: "#e0e7ff", solid: "#6366f1", soft: "rgba(99,102,241,0.06)" },
  custom:           { from: "#a855f7", to: "#ec4899", solid: "#a855f7", soft: "rgba(168,85,247,0.06)" },
};

// Screens where Back button is hidden (onboarding or first-in-flow)
const NO_BACK_SCREENS: ScreenId[] = [
  "landing", "auth", "company-landing", "company-register",
  "apply", "candidate-login", "superadmin-dashboard", "admin-dashboard", "dashboard",
];

// Screens where the Continue button is HIDDEN because the user is in a sub-screen
// (e.g. aptitude rules screen, resume upload screen) — not the final result yet.
// The Continue button should only appear on the "final" state of each screen.
// For screens with internal sub-states (tabs/phases), the FlowNav can't know
// the internal state, so we hide Continue on these screens entirely and let
// the screen's own UI provide the "Continue" CTA when appropriate.
const HIDE_CONTINUE_SCREENS: ScreenId[] = [
  "aptitude",    // has Rules / Test / Results sub-screens — screen handles its own Continue
  "resume",      // has Upload / Results / History tabs — screen handles its own Continue
  "coding",      // has List / Editor views — screen handles its own Continue
  "interview",   // has Setup / Live / Processing / Done — screen handles its own Continue
  "report",      // long scrollable report — no Continue needed (Replay is last in flow)
  "replay",      // last step — uses Done button instead
  "profile",     // settings page — not in the sequential flow
];

function inferFlowKind(id: ScreenId): FlowKind {
  if (CANDIDATE_FLOW.some((s) => s.id === id)) return "candidate";
  if (SUPERADMIN_FLOW.some((s) => s.id === id)) return "superadmin";
  if (ADMIN_FLOW.some((s) => s.id === id)) return "admin";
  return "prep";
}

/**
 * FlowNav — ultra-minimal progress bar.
 *
 * Design principles:
 * - Back arrow: only when previous step is NOT an onboarding screen
 * - Progress dots: always visible, no labels, no lock icons
 * - Continue button: HIDDEN on screens with internal sub-states (aptitude, resume, coding, interview)
 *   Those screens provide their own Continue CTAs when the user reaches the final sub-state.
 * - Continue button: VISIBLE on simple screens (dashboard, report, admin screens, etc.)
 * - Last step: shows "Done →" which goes to the home base
 * - Uses the user's selected theme color
 */
export function FlowNav() {
  const current = useNav((s) => s.current);
  const accentTheme = useNav((s) => s.accent);
  const navigationLocked = useNav((s) => s.navigationLocked);
  const set = useNav((s) => s.set);

  if (navigationLocked) return null;

  const flow = getFlowForScreen(current);
  if (!flow) return null;

  const kind = inferFlowKind(current);
  const currentIdx = flow.findIndex((s) => s.id === current);
  if (currentIdx === -1) return null;

  const prev = flow[currentIdx - 1] ?? null;
  const next = flow[currentIdx + 1] ?? null;
  const accent = ACCENT_GRADIENTS[accentTheme];
  const showBack = prev && !NO_BACK_SCREENS.includes(prev.id);
  const isLastStep = !next;
  const hideContinue = HIDE_CONTINUE_SCREENS.includes(current);

  return (
    <div
      className="sticky top-14 z-40 h-9 w-full border-b backdrop-blur-md"
      style={{
        borderColor: `${accent.solid}15`,
        background: `linear-gradient(180deg, ${accent.soft}, transparent)`,
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Back arrow (hidden on onboarding/first screens) */}
        <div className="flex w-32 items-center">
          {showBack ? (
            <button
              onClick={() => set(prev!.id)}
              className="group inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              title={`Back to ${prev!.label}`}
            >
              <ArrowLeft className="h-3 w-3" />
              <span className="hidden sm:inline">{prev!.label}</span>
            </button>
          ) : null}
        </div>

        {/* Center: Progress dots only */}
        <div className="flex items-center gap-1">
          {flow.map((step, i) => {
            const active = i === currentIdx;
            const done = i < currentIdx;
            return (
              <button
                key={step.id}
                onClick={() => set(step.id)}
                title={step.label}
                className="p-1"
              >
                <span
                  className="block rounded-full transition-all"
                  style={{
                    width: active ? 8 : 5,
                    height: active ? 8 : 5,
                    background: active
                      ? `linear-gradient(135deg, ${accent.from}, ${accent.to})`
                      : done
                        ? accent.solid
                        : "color-mix(in oklab, var(--foreground) 15%, transparent)",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Continue button (hidden on screens with internal sub-states) */}
        <div className="flex w-32 items-center justify-end">
          {isLastStep ? (
            <button
              onClick={() => set(HOME_BASE[kind])}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
            >
              <span className="hidden sm:inline">Done</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : hideContinue ? null : (
            <button
              onClick={() => set(next!.id)}
              className="group inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={next!.id}
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">{next!.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </motion.span>
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
