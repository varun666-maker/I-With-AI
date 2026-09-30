"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  LayoutGrid,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ALL_SCREENS, useNav, type ScreenId } from "@/lib/store";
import { ThemeSwitcher } from "./theme-switcher";

const GROUP_LABELS: Record<string, string> = {
  prep: "Prep Mode",
  admin: "Hiring Admin",
  candidate: "Candidate",
  superadmin: "Super Admin",
};

// Quick-access screen links per section (for the 3-line hamburger menu)
const QUICK_LINKS: Record<string, { label: string; target: ScreenId }[]> = {
  prep: [
    { label: "Dashboard", target: "dashboard" },
    { label: "Resume Hub", target: "resume" },
    { label: "Aptitude", target: "aptitude" },
    { label: "Coding Arena", target: "coding" },
    { label: "AI Interview", target: "interview" },
    { label: "Report", target: "report" },
    { label: "Replay", target: "replay" },
    { label: "Profile", target: "profile" },
  ],
  admin: [
    { label: "Dashboard", target: "admin-dashboard" },
    { label: "Create Campaign", target: "campaign-new" },
    { label: "Questions", target: "question-manager" },
    { label: "Candidates", target: "candidate-leaderboard" },
    { label: "Bulk Upload", target: "bulk-upload" },
    { label: "Proctoring", target: "proctoring-review" },
    { label: "Final Selection", target: "final-selection" },
  ],
  candidate: [
    { label: "Apply", target: "apply" },
    { label: "Login", target: "candidate-login" },
    { label: "System Check", target: "candidate-system-check" },
  ],
  superadmin: [
    { label: "Dashboard", target: "superadmin-dashboard" },
    { label: "Companies", target: "superadmin-companies" },
    { label: "Users", target: "superadmin-users" },
    { label: "AI Usage", target: "superadmin-ai-usage" },
    { label: "Questions", target: "superadmin-questions" },
    { label: "System", target: "superadmin-system" },
    { label: "Audit", target: "superadmin-audit" },
    { label: "DB Health", target: "superadmin-db-health" },
  ],
};

function getSection(id: ScreenId): string {
  if (id === "landing" || id === "company-landing") return "public";
  if (id.startsWith("candidate")) return "candidate";
  if (id.startsWith("superadmin")) return "superadmin";
  if (
    id.startsWith("admin") || id.startsWith("company") ||
    id.startsWith("campaign") || id.startsWith("question") ||
    id.startsWith("bulk") || id.startsWith("proctoring") ||
    id.startsWith("final")
  ) return "admin";
  return "prep";
}

export function TopNav() {
  const { current, set, navigationLocked } = useNav();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const go = (id: ScreenId) => {
    set(id);
    setDrawerOpen(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Locked state (during fullscreen tests)
  if (navigationLocked) {
    return (
      <header className="sticky top-0 z-50 h-12 w-full border-b border-black/10 bg-background/95 px-4 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <button onClick={() => go("landing")} className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-violet-500 text-white">
              <span className="text-[10px] font-bold">AI</span>
            </div>
            <span className="text-sm font-semibold">InterviewAI</span>
          </button>
          <button
            onClick={() => {
              useNav.setState({ navigationLocked: false });
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
              go("landing");
            }}
            className="rounded-full border border-rose-400/30 px-3 py-1 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
          >
            Exit Test
          </button>
        </div>
      </header>
    );
  }

  const section = getSection(current);
  const quickLinks = QUICK_LINKS[section] || [];

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
      <header className="sticky top-0 z-50 h-14 w-full border-b border-black/10 bg-background/80 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <button onClick={() => go("landing")} className="flex shrink-0 items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500 text-white">
              <span className="text-xs font-bold">AI</span>
            </div>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              InterviewAI
            </span>
          </button>

          {/* Center: Nav tabs (desktop only) */}
          <nav className="hidden items-center gap-0.5 md:flex">
            <NavTab active={current === "landing"} onClick={() => go("landing")}>
              Home
            </NavTab>
            <NavTab
              active={["auth", "dashboard", "resume", "aptitude", "coding", "interview", "report", "replay", "profile"].includes(current)}
              onClick={() => go("auth")}
            >
              Prep Mode
            </NavTab>
            <NavTab
              active={current.startsWith("company-") || current.startsWith("admin-") || ["campaign-new", "question-manager", "candidate-leaderboard", "bulk-upload", "proctoring-review", "final-selection"].includes(current)}
              onClick={() => go("company-landing")}
            >
              For Companies
            </NavTab>
            <NavTab
              active={current.startsWith("candidate") || current === "apply"}
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
          </nav>

          {/* Right: Theme + 3-line menu + CTA */}
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeSwitcher />

            {/* 3-line hamburger menu — always visible (mobile + desktop) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              title="Quick navigation"
              aria-label="Quick navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* All Screens button — desktop only */}
            <Button
              size="sm"
              variant="ghost"
              className="hidden h-8 gap-1.5 rounded-full px-3 text-muted-foreground lg:inline-flex"
              onClick={() => setDrawerOpen(true)}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>All Screens</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                {ALL_SCREENS.length}
              </span>
            </Button>

            <Button
              size="sm"
              className="hidden rounded-full bg-violet-500 px-4 text-white hover:bg-violet-600 sm:inline-flex"
              onClick={() => go("auth")}
            >
              Start Free
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation drawer — opens on hamburger or All Screens click */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute right-0 top-0 h-full w-full max-w-md border-l border-black/10 bg-card/95 backdrop-blur-2xl overflow-y-auto scrollbar-custom dark:border-white/10"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-black/10 bg-card/90 px-5 py-4 backdrop-blur-xl dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Menu className="h-5 w-5 text-violet-500" />
                    <h3 className="font-semibold">Navigation</h3>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDrawerOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick links for current section */}
                {quickLinks.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Quick Access · {GROUP_LABELS[section] || "Public"}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {quickLinks.map((link) => (
                        <button
                          key={link.target}
                          onClick={() => go(link.target)}
                          className={cn(
                            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
                            current === link.target
                              ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                              : "hover:bg-black/5 text-foreground/70 dark:hover:bg-white/5",
                          )}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="Search all screens..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full rounded-lg border border-black/10 bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10"
                  />
                </div>
              </div>

              {/* All screens grouped */}
              <div className="px-3 py-4 space-y-5">
                {(query ? Object.entries(filtered) : Object.entries(grouped)).map(([g, items]) => {
                  const displayItems = query
                    ? items.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
                    : items;
                  if (displayItems.length === 0) return null;
                  return (
                    <div key={g}>
                      <p className="px-3 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                        {GROUP_LABELS[g] || g} · {displayItems.length}
                      </p>
                      <ul className="mt-2 space-y-0.5">
                        {displayItems.map((s) => (
                          <li key={s.id}>
                            <button
                              onClick={() => go(s.id)}
                              className={cn(
                                "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all",
                                current === s.id
                                  ? "bg-violet-500/15 text-violet-700 border border-violet-400/30 dark:text-violet-200"
                                  : "hover:bg-black/5 text-foreground/80 dark:hover:bg-white/5",
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-violet-400/50" />
                              <span className="flex-1 truncate">{s.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                {query && Object.keys(filtered).length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No screens match &ldquo;{query}&rdquo;.
                  </p>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
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
        active ? "text-white" : "text-muted-foreground hover:text-white",
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

export function BackToHome() {
  const { set } = useNav();
  return (
    <button
      onClick={() => set("landing")}
      className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <Home className="h-3.5 w-3.5" />
      Home
    </button>
  );
}
