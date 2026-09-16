import { create } from "zustand";

export type ScreenId =
  // Prep Mode (Student)
  | "landing"
  | "auth"
  | "dashboard"
  | "resume"
  | "aptitude"
  | "coding"
  | "interview"
  | "report"
  | "replay"
  | "profile"
  // Company Admin
  | "company-landing"
  | "company-register"
  | "admin-dashboard"
  | "campaign-new"
  | "question-manager"
  | "candidate-leaderboard"
  | "bulk-upload"
  | "proctoring-review"
  | "final-selection"
  // Candidate
  | "apply"
  | "candidate-login"
  | "candidate-change-password"
  | "candidate-system-check"
  | "candidate-dashboard"
  | "candidate-results"
  // Super Admin
  | "superadmin-dashboard"
  | "superadmin-companies"
  | "superadmin-users"
  | "superadmin-ai-usage"
  | "superadmin-questions"
  | "superadmin-system"
  | "superadmin-audit"
  | "superadmin-db-health";

export interface ScreenMeta {
  id: ScreenId;
  label: string;
  group: "prep" | "admin" | "candidate" | "superadmin";
}

export const ALL_SCREENS: ScreenMeta[] = [
  // Prep Mode
  { id: "landing", label: "Landing Page", group: "prep" },
  { id: "auth", label: "Auth (Signup/Login/OTP/Profile)", group: "prep" },
  { id: "dashboard", label: "Student Dashboard", group: "prep" },
  { id: "resume", label: "Resume Hub", group: "prep" },
  { id: "aptitude", label: "Aptitude Portal", group: "prep" },
  { id: "coding", label: "Coding Arena", group: "prep" },
  { id: "interview", label: "AI Interview", group: "prep" },
  { id: "report", label: "Report (17 sections)", group: "prep" },
  { id: "replay", label: "Interview Replay", group: "prep" },
  { id: "profile", label: "Student Profile", group: "prep" },
  // Company Admin
  { id: "company-landing", label: "Company Landing Page", group: "admin" },
  { id: "company-register", label: "Company Registration", group: "admin" },
  { id: "admin-dashboard", label: "Admin Dashboard", group: "admin" },
  { id: "campaign-new", label: "Campaign Creation", group: "admin" },
  { id: "question-manager", label: "Question Set Manager", group: "admin" },
  { id: "candidate-leaderboard", label: "Candidate Leaderboard", group: "admin" },
  { id: "bulk-upload", label: "Bulk Resume Upload", group: "admin" },
  { id: "proctoring-review", label: "Proctoring Review", group: "admin" },
  { id: "final-selection", label: "Final Selection", group: "admin" },
  // Candidate
  { id: "apply", label: "Public Apply Page", group: "candidate" },
  { id: "candidate-login", label: "Candidate Login", group: "candidate" },
  { id: "candidate-change-password", label: "Force Password Change", group: "candidate" },
  { id: "candidate-system-check", label: "Pre-Test Proctoring Check", group: "candidate" },
  { id: "candidate-dashboard", label: "Candidate Campaign Dashboard", group: "candidate" },
  { id: "candidate-results", label: "Candidate Results (read-only)", group: "candidate" },
  // Super Admin
  { id: "superadmin-dashboard", label: "Super Admin Dashboard", group: "superadmin" },
  { id: "superadmin-companies", label: "Company Management", group: "superadmin" },
  { id: "superadmin-users", label: "User Management", group: "superadmin" },
  { id: "superadmin-ai-usage", label: "AI Usage Monitor", group: "superadmin" },
  { id: "superadmin-questions", label: "Question Bank Management", group: "superadmin" },
  { id: "superadmin-system", label: "System Configuration", group: "superadmin" },
  { id: "superadmin-audit", label: "Audit Logs", group: "superadmin" },
  { id: "superadmin-db-health", label: "Database Health", group: "superadmin" },
];

export type AccentTheme =
  | "violet"
  | "ocean"
  | "forest"
  | "sunset"
  | "coral"
  | "lavender"
  | "mint"
  | "sunrise"
  | "berry"
  | "sage"
  | "ember"
  | "mono";

export const ACCENT_THEMES: { id: AccentTheme; label: string; swatch: string }[] = [
  { id: "violet",   label: "Violet",   swatch: "linear-gradient(135deg, #8b5cf6, #d946ef)" },
  { id: "ocean",    label: "Ocean",    swatch: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
  { id: "forest",   label: "Forest",   swatch: "linear-gradient(135deg, #10b981, #14b8a6)" },
  { id: "sunset",   label: "Sunset",   swatch: "linear-gradient(135deg, #f59e0b, #f43f5e)" },
  { id: "coral",    label: "Coral",     swatch: "linear-gradient(135deg, #f43f5e, #fb923c)" },
  { id: "lavender", label: "Lavender", swatch: "linear-gradient(135deg, #a855f7, #ec4899)" },
  { id: "mint",     label: "Mint",     swatch: "linear-gradient(135deg, #10b981, #84cc16)" },
  { id: "sunrise",  label: "Sunrise",  swatch: "linear-gradient(135deg, #f59e0b, #f97316)" },
  { id: "berry",    label: "Berry",    swatch: "linear-gradient(135deg, #ec4899, #a855f7)" },
  { id: "sage",     label: "Sage",     swatch: "linear-gradient(135deg, #14b8a6, #22c55e)" },
  { id: "ember",    label: "Ember",    swatch: "linear-gradient(135deg, #ef4444, #f59e0b)" },
  { id: "mono",     label: "Mono",     swatch: "linear-gradient(135deg, #64748b, #1f2937)" },
];

interface NavState {
  current: ScreenId;
  history: ScreenId[];
  set: (id: ScreenId) => void;
  back: () => void;
  // Theme
  theme: "light" | "dark";
  accent: AccentTheme;
  setTheme: (t: "light" | "dark") => void;
  setAccent: (a: AccentTheme) => void;
}

export const useNav = create<NavState>((set, get) => ({
  current: "landing",
  history: ["landing"],
  set: (id) =>
    set((s) => ({
      current: id,
      history: [...s.history, id].slice(-20),
    })),
  back: () => {
    const hist = [...get().history];
    if (hist.length <= 1) return;
    hist.pop();
    set({ history: hist, current: hist[hist.length - 1] });
  },
  theme: "dark",
  accent: "violet",
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
    set({ theme });
  },
  setAccent: (accent) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accent", accent);
      document.documentElement.setAttribute("data-accent", accent);
    }
    set({ accent });
  },
}));
