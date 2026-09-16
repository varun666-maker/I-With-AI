"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Compass,
  Grid3x3,
  LayoutGrid,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ALL_SCREENS, useNav, type ScreenId } from "@/lib/store";
import { PulseBadge } from "./primitives";
import { ThemeSwitcher } from "./theme-switcher";

const GROUP_LABELS: Record<string, string> = {
  prep: "Prep Mode — Students",
  admin: "Hiring — Company Admin",
  candidate: "Hiring — Invited Candidate",
  superadmin: "Super Admin",
};

const GROUP_COLORS: Record<string, string> = {
  prep: "text-violet-300",
  admin: "text-sky-300",
  candidate: "text-amber-300",
  superadmin: "text-emerald-300",
};

export function TopNav() {
  const { current, set } = useNav();
  const [demoOpen, setDemoOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isLanding = current === "landing";

  const go = (id: ScreenId) => {
    set(id);
    setDemoOpen(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const grouped = ALL_SCREENS.reduce<Record<string, typeof ALL_SCREENS>>(
    (acc, s) => {
      (acc[s.group] ||= []).push(s);
      return acc;
    },
    {},
  );

  const filtered = (Object.keys(grouped) as (keyof typeof grouped)[]).reduce(
    (acc, g) => {
      const items = grouped[g].filter((s) =>
        s.label.toLowerCase().includes(query.toLowerCase()),
      );
      if (items.length) acc[g] = items;
      return acc;
    },
    {} as Record<string, typeof ALL_SCREENS>,
  );

  return (
    <>
      {/* Top navigation */}
      <motion.header
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="absolute inset-0 -z-10 backdrop-blur-xl bg-background/60 border-b border-white/5" />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => go("landing")}
            className="flex items-center gap-2 group"
          >
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">
                Interview<span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                Prep · Hiring · Insights
              </span>
            </div>
          </button>

          <div className="hidden items-center gap-1 md:flex">
            <NavTab active={isLanding} onClick={() => go("landing")}>
              Home
            </NavTab>
            <NavTab active={current === "auth"} onClick={() => go("auth")}>
              Prep Mode
            </NavTab>
            <NavTab
              active={current.startsWith("company-") || current.startsWith("admin-")}
              onClick={() => go("company-landing")}
            >
              For Companies
            </NavTab>
            <NavTab
              active={current.startsWith("candidate")}
              onClick={() => go("apply")}
            >
              Candidate
            </NavTab>
            <NavTab
              active={current.startsWith("superadmin")}
              onClick={() => go("superadmin-dashboard")}
            >
              Super Admin
            </NavTab>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button
              size="sm"
              variant="ghost"
              className="hidden md:inline-flex text-muted-foreground"
              onClick={() => setDemoOpen(true)}
            >
              <LayoutGrid className="mr-1.5 h-4 w-4" />
              All Screens
              <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                {ALL_SCREENS.length}
              </span>
            </Button>
            <Button
              size="sm"
              className="hidden sm:inline-flex bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 border-0"
              onClick={() => go("auth")}
            >
              Start Preparing Free
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setDemoOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Screen switcher drawer */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            className="fixed inset-0 z-[60] md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDemoOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-card/95 backdrop-blur-2xl overflow-y-auto scrollbar-custom"
            >
              <div className="sticky top-0 z-10 border-b border-white/10 bg-card/90 px-5 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-violet-300" />
                    <h3 className="font-semibold">Screen Navigator</h3>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setDemoOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Search 35+ screens…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                </div>
              </div>
              <div className="px-3 py-4 space-y-5">
                {Object.entries(filtered).map(([g, items]) => (
                  <div key={g}>
                    <p
                      className={cn(
                        "px-3 text-[11px] uppercase tracking-wider font-semibold",
                        GROUP_COLORS[g],
                      )}
                    >
                      {GROUP_LABELS[g]} · {items.length}
                    </p>
                    <ul className="mt-2 space-y-0.5">
                      {items.map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => go(s.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                              current === s.id
                                ? "bg-violet-500/15 text-violet-100 border border-violet-400/30"
                                : "hover:bg-white/5 text-foreground/80",
                            )}
                          >
                            <Grid3x3 className="h-3.5 w-3.5 opacity-60" />
                            <span className="flex-1 truncate">{s.label}</span>
                            {current === s.id && (
                              <Check className="h-3.5 w-3.5 text-violet-300" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {Object.keys(filtered).length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No screens match &ldquo;{query}&rdquo;.
                  </p>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating "all screens" pill on mobile */}
      {!demoOpen && (
        <motion.button
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setDemoOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-card/80 px-4 py-2.5 text-xs font-medium backdrop-blur-xl shadow-2xl hover:bg-card md:hidden"
        >
          <LayoutGrid className="h-4 w-4 text-violet-300" />
          {ALL_SCREENS.length} Screens
        </motion.button>
      )}
    </>
  );
}

function NavTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "text-white"
          : "text-muted-foreground hover:text-white",
      )}
    >
      {children}
      {active && (
        <motion.span
          layoutId="nav-tab"
          className="absolute inset-0 -z-10 rounded-md bg-white/5"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}

/** Mini breadcrumb-style back button used inside secondary screens */
export function BackToHome() {
  const { back, set } = useNav();
  return (
    <button
      onClick={() => set("landing")}
      className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      Back to home
    </button>
  );
}
