"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
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

// Quick-access screen links per section (for the hamburger menu)
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

// All section links for the hamburger menu (cross-section navigation)
const ALL_SECTIONS: { label: string; target: ScreenId }[] = [
  { label: "Home", target: "landing" },
  { label: "Prep Mode", target: "auth" },
  { label: "For Companies", target: "company-landing" },
  { label: "Candidate", target: "apply" },
  { label: "Super Admin", target: "superadmin-dashboard" },
];

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

/** Mock notifications for the bell dropdown. In production these come from the
 * WebSocket registry (LEADERBOARD_UPDATE, REPORT_READY, PROCTORING_ALERT). */
const NOTIFICATIONS = [
  {
    title: "New report ready",
    desc: "Priya Sharma's interview report is now available for download.",
    time: "2 min ago",
    unread: true,
  },
  {
    title: "3 new applicants",
    desc: "Auto-ranked by AI job-fit score on the Backend SDE-1 leaderboard.",
    time: "18 min ago",
    unread: true,
  },
  {
    title: "Proctoring flag raised",
    desc: "Amit Patel · 2 tab switches during the coding round. Review needed.",
    time: "1 hour ago",
    unread: true,
  },
  {
    title: "Campaign deadline approaching",
    desc: "Backend SDE-1 closes in 2 days. 5 candidates still pending.",
    time: "3 hours ago",
    unread: false,
  },
  {
    title: "Welcome to InterviewAI",
    desc: "Your company account is set up. Create your first campaign to begin.",
    time: "Yesterday",
    unread: false,
  },
];

export function TopNav() {
  const { current, set, navigationLocked } = useNav();
  const [navOpen, setNavOpen] = useState(false);       // hamburger menu
  const [drawerOpen, setDrawerOpen] = useState(false);  // All Screens (dev tool)
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);    // notifications dropdown

  // Visibility logic for the right-side CTAs:
  // - Landing page → show "Start Free" (entry-point CTA, no bell)
  // - Auth/Sign-in/Sign-up → show NEITHER (clean auth screen)
  // - All other main screens → show notification bell (no "Start Free")
  // - Fullscreen/proctored test mode → show NEITHER (handled by locked return)
  const showStartFree = current === "landing";
  const showNotifications = current !== "landing" && current !== "auth";

  // F-04: Screen Navigator demo tool is hidden unless ?demo=1 is in the URL.
  // This prevents recruiters/candidates from wandering into every screen in
  // a shared deployment. Deep links to views still resolve (route guard
  // unchanged) — only the navigator UI is hidden.
  const [demoMode, setDemoMode] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setDemoMode(new URLSearchParams(window.location.search).has("demo"));
    check();
    window.addEventListener("popstate", check);
    window.addEventListener("pushstate", check);
    return () => {
      window.removeEventListener("popstate", check);
      window.removeEventListener("pushstate", check);
    };
  }, []);

  const go = (id: ScreenId) => {
    set(id);
    setNavOpen(false);
    setDrawerOpen(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Locked state (during fullscreen tests) — minimal, no navigation
  if (navigationLocked) {
    return (
      <header className="sticky top-0 z-50 h-12 w-full border-b border-black/10 bg-background/95 px-4 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-violet-500 text-white">
              <span className="text-[10px] font-bold">AI</span>
            </div>
            <span className="text-sm font-semibold">InterviewAI</span>
          </div>
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
          {/* Left: Logo + nav tabs */}
          <div className="flex items-center gap-3">
            <button onClick={() => go("landing")} className="flex shrink-0 items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500 text-white">
                <span className="text-xs font-bold">AI</span>
              </div>
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                InterviewAI
              </span>
            </button>

            {/* Nav tabs (desktop) */}
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
          </div>

          {/* Right: Theme + hamburger + All Screens + CTA */}
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeSwitcher />

            {/* 3-line hamburger — professional navigation menu */}
            <button
              onClick={() => setNavOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              title="Navigation menu"
              aria-label="Navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* All Screens — dev/preview tool (F-04: hidden unless ?demo=1) */}
            {demoMode && (
              <Button
                size="sm"
                variant="ghost"
                className="hidden h-8 gap-1.5 rounded-full px-3 text-muted-foreground lg:inline-flex"
                onClick={() => setDrawerOpen(true)}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Screens</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {ALL_SCREENS.length}
                </span>
              </Button>
            )}

            {/* Right-side CTA — context-dependent:
                - Landing → "Start Free" (entry point to auth)
                - Auth    → neither (clean sign-in/sign-up screen)
                - All other main screens → notification bell
                - Proctored tests → neither (handled by the locked return above) */}
            {showStartFree && (
              <Button
                size="sm"
                className="rounded-full bg-violet-500 px-4 text-white hover:bg-violet-600"
                onClick={() => go("auth")}
              >
                Start Free
              </Button>
            )}

            {showNotifications && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {/* Unread badge */}
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    3
                  </span>
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      {/* Scrim to close on outside click */}
                      <div
                        className="fixed inset-0 z-[55]"
                        onClick={() => setNotifOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-10 z-[56] w-80 overflow-hidden rounded-lg border border-black/10 bg-card shadow-lg dark:border-white/10"
                      >
                        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/5">
                          <p className="text-sm font-medium">Notifications</p>
                          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-300">
                            3 new
                          </span>
                        </div>
                        <ul className="max-h-80 overflow-y-auto">
                          {NOTIFICATIONS.map((n, i) => (
                            <li
                              key={i}
                              className={cn(
                                "border-b border-black/5 px-4 py-3 transition-colors last:border-0 hover:bg-muted/30 dark:border-white/5",
                                n.unread && "bg-violet-500/[0.04]",
                              )}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className={cn(
                                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                                  n.unread ? "bg-violet-500" : "bg-transparent",
                                )} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-foreground/90">
                                    {n.title}
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    {n.desc}
                                  </p>
                                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                                    {n.time}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="w-full border-t border-black/5 py-2.5 text-center text-xs font-medium text-violet-600 hover:bg-muted/30 dark:border-white/5 dark:text-violet-300"
                        >
                          Mark all as read
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hamburger navigation menu (professional, NOT the dev tool) ─── */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-black/10 bg-card/95 backdrop-blur-2xl overflow-y-auto scrollbar-custom dark:border-white/10"
            >
              <div className="sticky top-0 z-10 border-b border-black/10 bg-card/90 px-5 py-4 backdrop-blur-xl dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Navigation</span>
                  <button
                    onClick={() => setNavOpen(false)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* All sections */}
                <div>
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sections
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {ALL_SECTIONS.map((link) => (
                      <button
                        key={link.target}
                        onClick={() => go(link.target)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          current === link.target || (link.label === "Prep Mode" && section === "prep") || (link.label === "For Companies" && section === "admin") || (link.label === "Candidate" && section === "candidate") || (link.label === "Super Admin" && section === "superadmin")
                            ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                            : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5",
                        )}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick access for current section */}
                {quickLinks.length > 0 && (
                  <div>
                    <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {GROUP_LABELS[section] || "Quick Access"}
                    </p>
                    <div className="mt-2 space-y-0.5">
                      {quickLinks.map((link) => (
                        <button
                          key={link.target}
                          onClick={() => go(link.target)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            current === link.target
                              ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                              : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5",
                          )}
                        >
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── All Screens drawer (dev/preview tool — separate from hamburger) ─── */}
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
              <div className="sticky top-0 z-10 border-b border-black/10 bg-card/90 px-5 py-4 backdrop-blur-xl dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-violet-500" />
                    <h3 className="font-semibold">Screen Navigator</h3>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDrawerOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Search all screens..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full rounded-lg border border-black/10 bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10"
                  />
                </div>
              </div>
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
