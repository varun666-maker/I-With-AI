"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CircleUserRound,
  Home,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNav, type ScreenId } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "./theme-switcher";

const GROUP_LABELS: Record<string, string> = {
  prep: "Prep Mode",
  admin: "Hiring Admin",
  candidate: "Candidate",
  superadmin: "Super Admin",
  launch: "Launch & Legal",
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
    { label: "Dashboard", target: "candidate-dashboard" },
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
];

type PrimarySection = "public" | "prep" | "admin" | "candidate" | "superadmin";

interface PrimaryNavItem {
  label: string;
  target: ScreenId;
  activeOn: ScreenId[];
}

const PRIMARY_NAV: Record<PrimarySection, PrimaryNavItem[]> = {
  public: [
    { label: "Home", target: "landing", activeOn: ["landing"] },
    {
      label: "For teams",
      target: "company-landing",
      activeOn: ["company-landing", "company-register", "company-login"],
    },
    { label: "Candidate", target: "apply", activeOn: ["apply", "candidate-login"] },
  ],
  prep: [
    { label: "Overview", target: "dashboard", activeOn: ["dashboard"] },
    { label: "Resume", target: "resume", activeOn: ["resume"] },
    { label: "Aptitude", target: "aptitude", activeOn: ["aptitude"] },
    { label: "Coding", target: "coding", activeOn: ["coding"] },
    { label: "Interview", target: "interview", activeOn: ["interview"] },
    { label: "Report", target: "report", activeOn: ["report"] },
    { label: "Replay", target: "replay", activeOn: ["replay"] },
    { label: "Profile", target: "profile", activeOn: ["profile"] },
  ],
  admin: [
    { label: "Overview", target: "admin-dashboard", activeOn: ["admin-dashboard"] },
    { label: "Campaigns", target: "campaign-new", activeOn: ["campaign-new", "bulk-upload"] },
    { label: "Questions", target: "question-manager", activeOn: ["question-manager"] },
    {
      label: "Candidates",
      target: "candidate-leaderboard",
      activeOn: ["candidate-leaderboard", "proctoring-review", "final-selection"],
    },
  ],
  candidate: [
    { label: "Dashboard", target: "candidate-dashboard", activeOn: ["candidate-dashboard"] },
  ],
  superadmin: [
    { label: "Overview", target: "superadmin-dashboard", activeOn: ["superadmin-dashboard"] },
    { label: "Companies", target: "superadmin-companies", activeOn: ["superadmin-companies"] },
    { label: "Users", target: "superadmin-users", activeOn: ["superadmin-users"] },
    {
      label: "Platform",
      target: "superadmin-system",
      activeOn: ["superadmin-system", "superadmin-ai-usage", "superadmin-questions", "superadmin-audit", "superadmin-db-health"],
    },
  ],
};

function getSection(id: ScreenId): PrimarySection {
  if (
    id === "landing" ||
    id === "auth" ||
    id === "company-landing" ||
    id === "company-register" ||
    id === "company-login" ||
    id === "apply" ||
    id === "candidate-login" ||
    id === "superadmin-landing"
  ) return "public";
  if (id === "candidate-leaderboard") return "admin";
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

type NotificationItem = {
  id: string;
  type: string;
  payload: unknown;
  readAt: string | null;
  createdAt: string;
};

type NotificationPayload = {
  title?: string;
  message?: string;
  screen?: ScreenId;
};

function notificationPayload(notification: NotificationItem): NotificationPayload {
  return notification.payload && typeof notification.payload === "object"
    ? notification.payload as NotificationPayload
    : {};
}

function notificationTime(value: string) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

export function TopNav() {
  const { current, set, navigationLocked } = useNav();
  const [navOpen, setNavOpen] = useState(false);       // hamburger menu
  const [notifOpen, setNotifOpen] = useState(false);    // notifications dropdown
  const [authenticated, setAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showStartFree = current === "landing";

  useEffect(() => {
    const isPublic = [
      "landing", "auth", "company-landing", "company-register", "company-login",
      "apply", "candidate-login", "superadmin-landing",
    ].includes(current);
    if (isPublic) {
      setAuthenticated(false);
      return;
    }

    let cancelled = false;
    void fetch("/api/v1/auth/me", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unauthenticated");
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) {
          setAuthenticated(true);
          // Scope coding progress to this user's account
          const userId = payload?.data?.user?.id;
          if (userId) {
            useNav.getState().setCurrentUserId(userId);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthenticated(false);
          // Clear user scope on logout
          useNav.getState().setCurrentUserId(null);
        }
      });
    return () => { cancelled = true; };
  }, [current]);

  useEffect(() => {
    if (!authenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/v1/me/notifications?limit=20", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled) {
          setNotifications(payload.data.notifications as NotificationItem[]);
          setUnreadCount(Number(payload.data.unreadCount ?? 0));
        }
      } catch {
        // Notification delivery is non-critical and must not interrupt navigation.
      }
    };

    void loadNotifications();
    const stream = new EventSource("/api/v1/me/notifications/stream");
    const onNotification = (event: Event) => {
      try {
        const notification = JSON.parse((event as MessageEvent<string>).data) as NotificationItem;
        const payload = notificationPayload(notification);
        setNotifications((currentNotifications) => [notification, ...currentNotifications.filter((item) => item.id !== notification.id)].slice(0, 20));
        if (!notification.readAt) setUnreadCount((count) => count + 1);

        const seenKey = `interviewai-notification:${notification.id}`;
        if (!window.sessionStorage.getItem(seenKey)) {
          window.sessionStorage.setItem(seenKey, "1");
          toast({
            title: payload.title ?? "New notification",
            description: payload.message ?? "You have a new update.",
          });
        }
      } catch {
        // Ignore malformed events from a disconnected or outdated server.
      }
    };
    stream.addEventListener("notification", onNotification);
    return () => {
      cancelled = true;
      stream.close();
    };
  }, [authenticated]);

  // Demo-only sample activity and cross-role links remain opt-in via ?demo=1.
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

  const showNotifications = authenticated && current !== "landing" && current !== "auth";

  const go = (id: ScreenId) => {
    set(id);
    setNavOpen(false);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  // Locked state (during fullscreen tests) — minimal, no navigation
  if (navigationLocked) {
    return (
      <header className="sticky top-0 z-50 h-14 w-full border-b border-border bg-background/95 px-4 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <span className="text-[10px] font-bold">AI</span>
            </div>
            <span className="text-sm font-semibold">InterviewAI</span>
          </div>
          <button
            onClick={() => {
              useNav.setState({ navigationLocked: false });
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
              if (current === "coding") {
                useNav.setState({ codingView: "list" });
                go("coding");
              } else if (current === "aptitude") {
                go("aptitude");
              } else if (current.startsWith("candidate")) {
                go("candidate-dashboard");
              } else {
                go("dashboard");
              }
            }}
            className="inline-flex min-h-11 items-center rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Exit Test
          </button>
        </div>
      </header>
    );
  }

  const section = getSection(current);
  const quickLinks = QUICK_LINKS[section] || [];
  const primaryLinks = PRIMARY_NAV[section];
  const showProfileShortcut = section === "prep";
  const sectionLinks = demoMode
    ? [...ALL_SECTIONS, { label: "Super Admin", target: "superadmin-dashboard" as const }]
    : ALL_SECTIONS;

  return (
    <Sheet open={navOpen} onOpenChange={setNavOpen}>
      <>
      <header className="sticky top-0 z-50 h-14 w-full border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Hamburger menu + Logo + nav tabs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 3-line hamburger placed on the LEFT */}
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open workspace navigation"
                title="Navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>

            <button
              onClick={() => go("landing")}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
                <span className="text-xs font-bold">AI</span>
              </div>
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                InterviewAI
              </span>
            </button>

            {/* Nav tabs (desktop) */}
            <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
              {primaryLinks.map((link) => (
                <NavTab
                  key={link.target}
                  active={link.activeOn.includes(current)}
                  onClick={() => go(link.target)}
                >
                  {link.label}
                </NavTab>
              ))}
            </nav>
          </div>

          {/* Right: Theme, profile, CTA, notifications */}
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeSwitcher />

            {showProfileShortcut && (
              <button
                type="button"
                onClick={() => go("profile")}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current === "profile" && "bg-accent text-accent-foreground",
                )}
                aria-label="Open your profile"
                title="Open your profile"
              >
                <CircleUserRound className="h-5 w-5" />
              </button>
            )}

            {/* Right-side CTA — context-dependent:
                - Landing → "Start Free" (entry point to auth)
                - Auth    → neither (clean sign-in/sign-up screen)
                - All other main screens → notification bell
                - Proctored tests → neither (handled by the locked return above) */}
            {showStartFree && (
              <Button
                size="sm"
                className="rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90"
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
                  className="relative grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      {/* Scrim to close on outside click */}
                      <button
                        type="button"
                        aria-label="Close sample notifications"
                        className="fixed inset-0 z-[55] cursor-default"
                        onClick={() => setNotifOpen(false)}
                      />
                      <motion.div
                        role="dialog"
                        aria-label="Notifications"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-10 z-[56] w-80 overflow-hidden rounded-lg border border-black/10 bg-card shadow-lg dark:border-white/10"
                      >
                        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/5">
                          <p className="text-sm font-medium">Notifications</p>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              className="text-[10px] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                              onClick={() => {
                                void fetch("/api/v1/me/notifications", { method: "POST" });
                                setNotifications((items) => items.map((item) => ({ ...item, readAt: new Date().toISOString() })));
                                setUnreadCount(0);
                              }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <ul className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <li className="px-4 py-8 text-center text-xs text-muted-foreground">You are all caught up.</li>
                          ) : notifications.map((notification) => {
                            const payload = notificationPayload(notification);
                            return (
                              <li
                                key={notification.id}
                                className={cn(
                                  "border-b border-black/5 px-4 py-3 transition-colors last:border-0 hover:bg-muted/30 dark:border-white/5",
                                  !notification.readAt && "bg-violet-500/[0.04]",
                                )}
                              >
                                <button
                                  type="button"
                                  className="flex w-full items-start gap-2.5 text-left"
                                  onClick={() => {
                                    if (!notification.readAt) setUnreadCount((count) => Math.max(0, count - 1));
                                    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
                                    void fetch(`/api/v1/me/notifications/${notification.id}`, { method: "PATCH" });
                                    if (payload.screen) go(payload.screen);
                                    setNotifOpen(false);
                                  }}
                                >
                                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", !notification.readAt ? "bg-violet-500" : "bg-transparent")} />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-xs font-medium text-foreground/90">{payload.title ?? "Notification"}</span>
                                    <span className="mt-0.5 block text-[11px] text-muted-foreground">{payload.message ?? "You have a new update."}</span>
                                    <span className="mt-1 block text-[10px] text-muted-foreground/70">{notificationTime(notification.createdAt)}</span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          type="button"
                          onClick={() => setNotifOpen(false)}
                          className="min-h-11 w-full border-t border-border text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                        >
                          Close
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

      <SheetContent
        id="navigation-drawer"
        side="left"
        className="z-[60] w-[min(22rem,calc(100vw-1rem))] gap-0 overflow-y-auto border-r border-border bg-card p-0"
      >
        <SheetHeader className="border-b border-border px-5 py-5 pr-14 text-left">
          <SheetTitle className="text-base">Workspace navigation</SheetTitle>
          <SheetDescription>
            {GROUP_LABELS[section] || "Explore InterviewAI"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-4">
          {(section === "public" || demoMode) && (
            <section aria-labelledby="workspace-links-heading">
              <h2
                id="workspace-links-heading"
                className="px-2 text-xs font-medium text-muted-foreground"
              >
                Product areas
              </h2>
              <div className="mt-2 space-y-1">
                {sectionLinks.map((link) => {
                  const active =
                    current === link.target ||
                    (link.label === "Prep Mode" && section === "prep") ||
                    (link.label === "For Companies" &&
                      (section === "admin" || current.startsWith("company-"))) ||
                    (link.label === "Candidate" &&
                      (section === "candidate" || current === "apply" || current.startsWith("candidate"))) ||
                    (link.label === "Super Admin" && current.startsWith("superadmin"));

                  return (
                    <button
                      key={link.target}
                      type="button"
                      onClick={() => go(link.target)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {quickLinks.length > 0 && (
            <section aria-labelledby="workspace-quick-links-heading">
              <h2
                id="workspace-quick-links-heading"
                className="px-2 text-xs font-medium text-muted-foreground"
              >
                {GROUP_LABELS[section] || "Quick access"}
              </h2>
              <div className="mt-2 space-y-1">
                {quickLinks.map((link) => (
                  <button
                    key={link.target}
                    type="button"
                    onClick={() => go(link.target)}
                    aria-current={current === link.target ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      current === link.target
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/80 hover:bg-muted",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 rounded-full",
                        current === link.target ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                    {link.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Bottom actions: Logout when authenticated or in active Prep mode */}
          {(authenticated || section === "prep") && (
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={async () => {
                  setNavOpen(false);
                  try {
                    await fetch("/api/v1/auth/logout", { method: "POST" });
                  } catch {}
                  setAuthenticated(false);
                  useNav.getState().setCurrentUserId(null);
                  toast({
                    title: "Logged out",
                    description: "You have been safely signed out.",
                  });
                  go("auth");
                }}
                className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </SheetContent>

      </>
    </Sheet>
  );
}

function NavTab({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "min-h-11 rounded-md px-3 text-sm font-medium transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
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
