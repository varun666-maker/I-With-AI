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
  | "candidate-aptitude"
  | "candidate-aptitude-result"
  | "candidate-coding"
  | "candidate-coding-result"
  | "candidate-interview"
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
  { id: "candidate-aptitude", label: "Candidate Aptitude Test (Strict)", group: "candidate" },
  { id: "candidate-aptitude-result", label: "Candidate Aptitude Result", group: "candidate" },
  { id: "candidate-coding", label: "Candidate Coding Test (Strict)", group: "candidate" },
  { id: "candidate-coding-result", label: "Candidate Coding Result", group: "candidate" },
  { id: "candidate-interview", label: "Candidate AI Interview (Strict)", group: "candidate" },
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
  // Kept from original
  | "violet"
  | "ocean"
  | "forest"
  | "sunrise"
  // New named themes
  | "emerald"
  | "master-purple"
  | "ruby"
  | "gold"
  | "rose"
  | "midnight"
  | "sakura"
  | "forest-sovereign"
  | "slate"
  | "coral"
  | "cosmic-diamond"
  // Custom color picker
  | "custom";

export const ACCENT_THEMES: { id: AccentTheme; label: string; swatch: string }[] = [
  { id: "violet",           label: "Violet",           swatch: "linear-gradient(135deg, #8b5cf6, #d946ef)" },
  { id: "ocean",            label: "Ocean",            swatch: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
  { id: "forest",           label: "Forest",           swatch: "linear-gradient(135deg, #10b981, #14b8a6)" },
  { id: "sunrise",          label: "Sunrise",          swatch: "linear-gradient(135deg, #f59e0b, #f97316)" },
  { id: "emerald",          label: "Emerald Green",    swatch: "linear-gradient(135deg, #059669, #34d399)" },
  { id: "master-purple",    label: "Master Purple",    swatch: "linear-gradient(135deg, #6d28d9, #a855f7)" },
  { id: "ruby",             label: "Ruby Sovereign",   swatch: "linear-gradient(135deg, #be123c, #f43f5e)" },
  { id: "gold",             label: "Legendary Gold",   swatch: "linear-gradient(135deg, #b45309, #fbbf24)" },
  { id: "rose",             label: "Rose Red",         swatch: "linear-gradient(135deg, #9f1239, #fb7185)" },
  { id: "midnight",         label: "Midnight",         swatch: "linear-gradient(135deg, #0f172a, #334155)" },
  { id: "sakura",           label: "Sakura Pink",      swatch: "linear-gradient(135deg, #ec4899, #fbcfe8)" },
  { id: "forest-sovereign", label: "Forest Sovereign", swatch: "linear-gradient(135deg, #14532d, #22c55e)" },
  { id: "slate",            label: "Slate",            swatch: "linear-gradient(135deg, #334155, #64748b)" },
  { id: "coral",            label: "Coral",            swatch: "linear-gradient(135deg, #f97316, #fb7185)" },
  { id: "cosmic-diamond",   label: "Cosmic Diamond",   swatch: "linear-gradient(135deg, #6366f1, #e0e7ff)" },
  { id: "custom",           label: "Custom",           swatch: "linear-gradient(135deg, #a855f7, #ec4899)" },
];

interface NavState {
  current: ScreenId;
  history: ScreenId[];
  set: (id: ScreenId) => void;
  back: () => void;
  // Proctoring lock — when true, the candidate is in a strict test round
  // (aptitude/coding/interview). TopNav + FlowNav should suppress their
  // navigation CTAs so the candidate can't tab away mid-test.
  navigationLocked: boolean;
  setNavigationLocked: (v: boolean) => void;
  // Theme
  theme: "light" | "dark";
  accent: AccentTheme;
  customColor: string; // hex color for the "custom" accent
  setTheme: (t: "light" | "dark") => void;
  setAccent: (a: AccentTheme) => void;
  setCustomColor: (hex: string) => void;
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
  navigationLocked: false,
  setNavigationLocked: (v) => set({ navigationLocked: v }),
  theme: "dark",
  accent: "violet",
  customColor: "#a855f7",
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
  setCustomColor: (hex) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customColor", hex);
      // If custom is the active accent, apply the color immediately
      if (get().accent === "custom") {
        applyCustomColor(hex);
      }
    }
    set({ customColor: hex });
  },
}));

/**
 * Apply a custom hex color as the accent by generating violet/fuchsia shade
 * scales via color-mix and setting them as CSS variables on <html>.
 * Works in both light and dark mode (the light-mode overrides in globals.css
 * use the same --color-violet-* / --color-fuchsia-* variables).
 */
export function applyCustomColor(hex: string) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  // Generate 10 shades (50-950) by mixing the hex with white/black
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  for (const shade of shades) {
    // Approximate Tailwind shade lightness percentages
    const mixPct: Record<number, number> = {
      50: 95, 100: 90, 200: 80, 300: 70, 400: 60,
      500: 50, 600: 40, 700: 30, 800: 20, 900: 10, 950: 5,
    };
    const pct = mixPct[shade];
    // Lighter shades = mix with white; darker = mix with black
    const isLight = pct > 50;
    const mixWith = isLight ? "white" : "black";
    const mixAmount = isLight ? (100 - pct) * 2 : pct * 2;
    const varName = `--color-violet-${shade}`;
    const varNameFuchsia = `--color-fuchsia-${shade}`;
    root.style.setProperty(varName, `color-mix(in oklab, ${hex} ${Math.min(mixAmount, 100)}%, ${mixWith})`);
    root.style.setProperty(varNameFuchsia, `color-mix(in oklab, ${hex} ${Math.min(mixAmount * 0.8, 100)}%, ${mixWith})`);
  }
  // Also set the gradient/aurora variables
  root.style.setProperty("--gradient-text-1", `color-mix(in oklab, ${hex} 30%, white)`);
  root.style.setProperty("--gradient-text-2", hex);
  root.style.setProperty("--gradient-text-3", `color-mix(in oklab, ${hex} 70%, black)`);
  root.style.setProperty("--accent-swatch", hex);
}
