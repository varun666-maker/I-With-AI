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
  | "company-login"
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
  | "superadmin-landing"
  | "superadmin-dashboard"
  | "superadmin-companies"
  | "superadmin-users"
  | "superadmin-ai-usage"
  | "superadmin-questions"
  | "superadmin-system"
  | "superadmin-audit"
  | "superadmin-db-health"
  // Launch Readiness & Legal (PDF Requirements)
  | "launch-checklist"
  | "privacy"
  | "thank-you"
  | "not-found";

export interface ScreenMeta {
  id: ScreenId;
  label: string;
  group: "prep" | "admin" | "candidate" | "superadmin" | "launch";
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
  { id: "company-login", label: "Company Admin Login", group: "admin" },
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
  { id: "superadmin-landing", label: "Super Admin Login", group: "superadmin" },
  { id: "superadmin-dashboard", label: "Super Admin Dashboard", group: "superadmin" },
  { id: "superadmin-companies", label: "Company Management", group: "superadmin" },
  { id: "superadmin-users", label: "User Management", group: "superadmin" },
  { id: "superadmin-ai-usage", label: "AI Usage Monitor", group: "superadmin" },
  { id: "superadmin-questions", label: "Question Bank Management", group: "superadmin" },
  { id: "superadmin-system", label: "System Configuration", group: "superadmin" },
  { id: "superadmin-audit", label: "Audit Logs", group: "superadmin" },
  { id: "superadmin-db-health", label: "Database Health", group: "superadmin" },
  // Launch Readiness & Compliance (from PDF)
  { id: "launch-checklist", label: "Launch Readiness (15 Items)", group: "launch" },
  { id: "privacy", label: "Privacy Policy", group: "launch" },
  { id: "thank-you", label: "Thank-You Confirmation", group: "launch" },
  { id: "not-found", label: "404 Page Not Found", group: "launch" },
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

/**
 * Helper: build user-scoped localStorage key.
 * When userId is null/undefined (not yet logged in), uses "anon" prefix
 * so we never collide with a real user's data.
 */
function codingKey(suffix: string, userId?: string | null): string {
  const prefix = userId || "anon";
  return `coding-${prefix}-${suffix}`;
}

/** Read a JSON array from user-scoped localStorage, defaulting to []. */
function readCodingArray<T>(suffix: string, userId?: string | null): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(codingKey(suffix, userId)) || "[]");
  } catch {
    return [];
  }
}

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
  // Proctoring devices opt-in status (camera & mic)
  proctorCamera: boolean;
  proctorMic: boolean;
  setProctorCamera: (v: boolean) => void;
  setProctorMic: (v: boolean) => void;
  // Theme
  theme: "light" | "dark";
  accent: AccentTheme;
  customColor: string; // hex color for the "custom" accent
  setTheme: (t: "light" | "dark") => void;
  setAccent: (a: AccentTheme) => void;
  setCustomColor: (hex: string) => void;
  // User identity — scoped per logged-in account
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;
  loadUserCodingData: (userId: string | null) => void;
  // Coding Arena progress (prep mode) — persisted to user-scoped localStorage
  codingView: "list" | "editor";
  currentProblemId: string | null;
  isRandomMode: boolean;
  solvedProblems: string[];
  attemptedProblems: string[];
  submissions: { problemId: string; timestamp: number; passed: boolean }[];
  setCodingView: (v: "list" | "editor") => void;
  setCurrentProblem: (id: string | null) => void;
  setIsRandomMode: (v: boolean) => void;
  markSolved: (id: string) => void;
  markAttempted: (id: string) => void;
  recordSubmission: (problemId: string, passed: boolean) => void;
  resetCodingProgress: () => void;
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
  proctorCamera: false,
  proctorMic: false,
  setProctorCamera: (v) => set({ proctorCamera: v }),
  setProctorMic: (v) => set({ proctorMic: v }),
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
  // User identity for data isolation
  currentUserId: (() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("currentUserId") || null;
  })(),
  setCurrentUserId: (userId) => {
    if (typeof window !== "undefined") {
      if (userId) {
        localStorage.setItem("currentUserId", userId);
      } else {
        localStorage.removeItem("currentUserId");
      }
    }
    // When user changes, reload their coding data
    const solvedProblems = readCodingArray<string>("solved", userId);
    const attemptedProblems = readCodingArray<string>("attempted", userId);
    const submissions = readCodingArray<{ problemId: string; timestamp: number; passed: boolean }>("submissions", userId);
    set({ currentUserId: userId, solvedProblems, attemptedProblems, submissions });
  },
  loadUserCodingData: (userId) => {
    const solvedProblems = readCodingArray<string>("solved", userId);
    const attemptedProblems = readCodingArray<string>("attempted", userId);
    const submissions = readCodingArray<{ problemId: string; timestamp: number; passed: boolean }>("submissions", userId);
    set({ solvedProblems, attemptedProblems, submissions });
  },
  // Coding Arena progress
  codingView: "list",
  currentProblemId: null,
  solvedProblems: (() => {
    if (typeof window === "undefined") return [];
    const uid = localStorage.getItem("currentUserId") || null;
    return readCodingArray<string>("solved", uid);
  })(),
  attemptedProblems: (() => {
    if (typeof window === "undefined") return [];
    const uid = localStorage.getItem("currentUserId") || null;
    return readCodingArray<string>("attempted", uid);
  })(),
  submissions: (() => {
    if (typeof window === "undefined") return [];
    const uid = localStorage.getItem("currentUserId") || null;
    return readCodingArray<{ problemId: string; timestamp: number; passed: boolean }>("submissions", uid);
  })(),
  setCodingView: (codingView) => set({ codingView }),
  isRandomMode: false,
  setCurrentProblem: (currentProblemId) => set({ currentProblemId }),
  setIsRandomMode: (isRandomMode) => set({ isRandomMode }),
  markSolved: (id) => {
    set((s) => {
      if (s.solvedProblems.includes(id)) return s;
      const solvedProblems = [...s.solvedProblems, id];
      if (typeof window !== "undefined") localStorage.setItem(codingKey("solved", s.currentUserId), JSON.stringify(solvedProblems));
      return { solvedProblems };
    });
  },
  markAttempted: (id) => {
    set((s) => {
      if (s.attemptedProblems.includes(id) || s.solvedProblems.includes(id)) return s;
      const attemptedProblems = [...s.attemptedProblems, id];
      if (typeof window !== "undefined") localStorage.setItem(codingKey("attempted", s.currentUserId), JSON.stringify(attemptedProblems));
      return { attemptedProblems };
    });
  },
  recordSubmission: (problemId, passed) => {
    set((s) => {
      const submissions = [...s.submissions, { problemId, timestamp: Date.now(), passed }];
      if (typeof window !== "undefined") localStorage.setItem(codingKey("submissions", s.currentUserId), JSON.stringify(submissions));
      return { submissions };
    });
  },
  resetCodingProgress: () => {
    const uid = get().currentUserId;
    if (typeof window !== "undefined") {
      localStorage.removeItem(codingKey("solved", uid));
      localStorage.removeItem(codingKey("attempted", uid));
      localStorage.removeItem(codingKey("submissions", uid));
    }
    set({ solvedProblems: [], attemptedProblems: [], submissions: [] });
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
