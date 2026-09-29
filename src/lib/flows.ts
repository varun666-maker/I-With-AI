import type { ScreenId } from "@/lib/store";

export interface FlowStep {
  id: ScreenId;
  label: string;
  /** Short one-line description of what happens here */
  hint: string;
}

/**
 * Prep Mode sequential flow:
 * Landing → Auth → Dashboard → Resume → Aptitude → Coding → Interview → Report → (Replay loops back to Dashboard)
 */
export const PREP_FLOW: FlowStep[] = [
  { id: "landing",    label: "Landing",      hint: "Discover the platform" },
  { id: "auth",       label: "Sign up",       hint: "Create your free account" },
  { id: "dashboard",  label: "Dashboard",     hint: "Your home base — see your scores" },
  { id: "resume",     label: "Resume Hub",   hint: "Upload resume → get ATS + skill analysis" },
  { id: "aptitude",   label: "Aptitude",      hint: "Take the 25-question timed mock test" },
  { id: "coding",     label: "Coding Arena",  hint: "Solve problems + get AI code review" },
  { id: "interview",  label: "AI Interview",  hint: "Live interview with the AI avatar" },
  { id: "report",     label: "Report",       hint: "17-section personalised PDF report" },
  { id: "replay",     label: "Replay",        hint: "Re-watch the interview synced to transcript" },
];

/**
 * Company Admin sequential flow:
 * Landing → Register → Admin Dashboard → Create Campaign → Add Questions → Leaderboard → (Bulk Upload alternative) → Proctoring → Final Selection
 */
export const ADMIN_FLOW: FlowStep[] = [
  { id: "company-landing",        label: "Company Landing",  hint: "Discover the hiring platform — ROI, automation, pricing" },
  { id: "company-register",       label: "Register",          hint: "Create the company admin account" },
  { id: "admin-dashboard",        label: "Admin Dashboard",   hint: "See all campaigns at a glance" },
  { id: "campaign-new",           label: "Create Campaign",   hint: "Configure + share the apply link" },
  { id: "question-manager",       label: "Question Manager",  hint: "Add aptitude + coding problems" },
  { id: "candidate-leaderboard",  label: "Leaderboard",       hint: "Auto-shortlist + send invite emails" },
  { id: "bulk-upload",            label: "Bulk Upload",       hint: "Or: upload resumes you already have" },
  { id: "proctoring-review",       label: "Proctoring",        hint: "Review flagged violations per candidate" },
  { id: "final-selection",         label: "Final Selection",   hint: "Make the hiring decision + export" },
];

/**
 * Invited Candidate sequential flow:
 * Apply → (email invite) → Login → Force Password → System Check → Dashboard → (Aptitude → Coding → Interview, all proctored) → Results
 */
export const CANDIDATE_FLOW: FlowStep[] = [
  { id: "apply",                     label: "Apply",            hint: "Public apply page — submit your resume" },
  { id: "candidate-login",           label: "Login",            hint: "Use the candidate ID from your invite email" },
  { id: "candidate-change-password", label: "Set Password",     hint: "First-login mandatory password change" },
  { id: "candidate-system-check",    label: "System Check",      hint: "One-time gatekeeper: fullscreen + mic + cam + keyboard monitoring" },
  { id: "candidate-aptitude",        label: "Aptitude",         hint: "Strict proctoring. Zero retakes." },
  { id: "candidate-aptitude-result", label: "Aptitude Result",  hint: "Score + qualification status" },
  { id: "candidate-coding",          label: "Coding",           hint: "Strict proctoring. One submission per problem." },
  { id: "candidate-coding-result",   label: "Coding Result",    hint: "Score + qualification status" },
  { id: "candidate-interview",       label: "Interview",        hint: "Strict proctoring. Flagged frames stored." },
  { id: "candidate-results",         label: "Final Summary",    hint: "All 3 round scores. Overall hidden. No rank." },
];

/**
 * Super Admin explore flow:
 * Dashboard → Companies → Users → AI Usage → Questions → System → Audit → DB Health
 */
export const SUPERADMIN_FLOW: FlowStep[] = [
  { id: "superadmin-dashboard",  label: "Dashboard",   hint: "8 platform KPIs at a glance" },
  { id: "superadmin-companies",  label: "Companies",    hint: "Suspend / reactivate / audit companies" },
  { id: "superadmin-users",      label: "Users",        hint: "Search, reset passwords, GDPR delete" },
  { id: "superadmin-ai-usage",  label: "AI Usage",      hint: "Gemini calls, tokens, rate limits" },
  { id: "superadmin-questions", label: "Questions",     hint: "Question bank health + reseed" },
  { id: "superadmin-system",    label: "System",        hint: "Maintenance mode + feature toggles" },
  { id: "superadmin-audit",     label: "Audit",         hint: "Every admin action, searchable" },
  { id: "superadmin-db-health", label: "DB Health",     hint: "Postgres / Mongo / Redis / Cloudinary" },
];

export const FLOWS: Record<"prep" | "admin" | "candidate" | "superadmin", FlowStep[]> = {
  prep: PREP_FLOW,
  admin: ADMIN_FLOW,
  candidate: CANDIDATE_FLOW,
  superadmin: SUPERADMIN_FLOW,
};

/** Get the flow that a given screen belongs to (or null if it's the landing). */
export function getFlowForScreen(id: ScreenId): FlowStep[] | null {
  if (PREP_FLOW.some((s) => s.id === id)) return PREP_FLOW;
  if (ADMIN_FLOW.some((s) => s.id === id)) return ADMIN_FLOW;
  if (CANDIDATE_FLOW.some((s) => s.id === id)) return CANDIDATE_FLOW;
  if (SUPERADMIN_FLOW.some((s) => s.id === id)) return SUPERADMIN_FLOW;
  return null;
}
