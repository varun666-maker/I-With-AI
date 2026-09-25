# InterviewAI Frontend — Multi-agent Worklog

## Project Overview
Building the complete frontend for an AI Interview Assistant SaaS. Dark-mode first,
Next.js 16 + Tailwind 4 + shadcn/ui + Framer Motion + Zustand state-based SPA router.

**Single visible route**: `/` (page.tsx switches screens via Zustand `useNav` store).

## Architecture (READ FIRST)
- `src/lib/store.ts` → exports `useNav`, `ALL_SCREENS`, `ScreenId`. Call `set(id)` to navigate.
- `src/components/shared/primitives.tsx` → exports: `AuroraBackground`, `BorderBeam`, `GlowCard`,
  `MagneticButton`, `Marquee`, `TypingDots`, `Shimmer`, `PulseBadge`, `SectionHeading`,
  `StaggeredReveal`, `revealItem`, `PageWrap`, `StatCard`.
- `src/components/shared/top-nav.tsx` → exports `TopNav` (already mounted in page.tsx) and `BackToHome`.
- `src/components/screens/<section>/<screen>.tsx` → each screen is a default-named export component
  with a unique PascalCase name (e.g., `StudentDashboard`, NOT default `Dashboard`).

## Screen naming convention (CRITICAL — avoid name collisions)
To avoid React component name collisions across sections, every screen file exports
a uniquely-named component (NOT default `Dashboard` etc.):
- prep/dashboard.tsx → `StudentDashboard`
- prep/resume.tsx → `ResumeHub`
- prep/aptitude.tsx → `AptitudePortal`
- prep/coding.tsx → `CodingArena`
- prep/interview.tsx → `InterviewStudio`
- prep/report.tsx → `InterviewReport`
- prep/replay.tsx → `InterviewReplay`
- prep/profile.tsx → `StudentProfile`
- prep/auth.tsx → `AuthScreen`
- admin/register.tsx → `CompanyRegister`
- admin/dashboard.tsx → `AdminDashboard`
- admin/campaign-new.tsx → `CampaignCreate`
- admin/questions.tsx → `QuestionManager`
- admin/candidates.tsx → `CandidateLeaderboard`
- admin/bulk-upload.tsx → `BulkUpload`
- admin/proctoring.tsx → `ProctoringReview`
- admin/selection.tsx → `FinalSelection`
- candidate/apply.tsx → `ApplyPage`
- candidate/login.tsx → `CandidateLogin`
- candidate/change-password.tsx → `ForcePasswordChange`
- candidate/system-check.tsx → `PreTestCheck`
- candidate/dashboard.tsx → `CandidateDashboard`
- candidate/results.tsx → `CandidateResults`
- superadmin/dashboard.tsx → `SuperAdminDashboard`
- superadmin/companies.tsx → `CompanyManagement`
- superadmin/users.tsx → `UserManagement`
- superadmin/ai-usage.tsx → `AIUsageMonitor`
- superadmin/questions.tsx → `QuestionBankAdmin`
- superadmin/system.tsx → `SystemConfig`
- superadmin/audit.tsx → `AuditLogs`
- superadmin/db-health.tsx → `DatabaseHealth`

## Design language (established in landing.tsx — match this exactly)
- Dark background: `bg-background` (= near-black oklch 0.07 with subtle violet tint).
- Aurora blobs (use `<AuroraBackground>` as page wrapper).
- Cards: `GlowCard` with `p-6` and `border-white/10 bg-white/[0.03]`.
- Primary CTA buttons: `bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0`.
- Accent color words: `gradient-text` class.
- Badges: `<PulseBadge color="violet|emerald|amber|rose|sky|slate">`.
- Section title block: `<SectionHeading eyebrow title description />`.
- Use Framer Motion `motion.div` with `initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}}`
  for entrance animations.
- Use shadcn `Button`, `Card`, `Input`, `Label`, `Tabs`, `Badge`, `Progress`, `Avatar`,
  `Table`, `Dialog`, `Select`, `Switch`, `Slider`, `Checkbox`, `RadioGroup`, `Tooltip`,
  `Separator`, `ScrollArea` from `@/components/ui/*`.
- Use `lucide-react` icons.
- Use `recharts` for any chart (line, bar, radar, pie). Dark theme colors:
  `#a855f7` violet, `#06b6d4` cyan, `#10b981` emerald, `#f59e0b` amber, `#f43f5e` rose.

## Footer rule
Every screen ends naturally — no artificial "End of page" markers. Use `<footer>`
with `border-t border-white/5 mt-16` for marketing screens. App screens (dashboard etc.)
don't need a footer.

## Navigation hooks
```ts
import { useNav } from "@/lib/store";
const { set } = useNav();
set("dashboard");   // navigate to a screen
```

## DO NOT
- Do NOT modify `src/app/page.tsx` — the main agent handles the router wiring.
- Do NOT modify `src/app/globals.css` or `src/app/layout.tsx`.
- Do NOT create Next.js route files under `src/app/<route>/page.tsx`.
- Do NOT use real Next.js routing — use the Zustand `useNav` store only.
- Do NOT add `indigo` or `blue` Tailwind colors — use violet/fuchsia/sky/emerald/amber/rose.
- Do NOT use Bootstrap-style layouts. Use bento grids, asymmetry, glow effects.
- Do NOT create separate log files — append to this file (`/home/z/my-project/worklog.md`).

## After you finish
Append a new section to this file using:
```
---
Task ID: <your task id>
Agent: <agent name>
Task: <what you did>

Work Log:
- <step>
- <step>

Stage Summary:
- Files created (list each file path)
- Any screens pending
```

Then return a concise summary (list of files created + any blockers) as your final message.

---
Task ID: 6
Agent: candidate-screens
Task: Built the 6 Invited-Candidate screens (B0, B2, B3, B4, B5, B9) under `src/components/screens/candidate/`.

Work Log:
- Read worklog.md, primitives.tsx, top-nav.tsx, store.ts, landing.tsx, and the screen spec (lines 836–1126) to lock in the design language and B-screen specs.
- Verified available shadcn/ui primitives (Button, Input, Label, Separator, Progress, Badge) and confirmed `useNav` screen IDs for the candidate section.
- Built `apply.tsx` (ApplyPage): centered card with company header + role + deadline pill; full name / email / phone / drag-drop resume upload (PDF/DOCX, 5 MB cap); 2s mock submit spinner → spring-in success state ("✅ Application Submitted!", "Thank you, {firstName}!", credentials email note). Validates required fields + email regex + file size/type.
- Built `login.tsx` (CandidateLogin): centered card with Candidate ID (mono font) + Password inputs (show/hide toggle), amber info note ("This is your invited candidate login — different from your student account."), "Trouble logging in?" + "Apply to a campaign" secondary actions. Mock 1.1s auth then navigates to `candidate-change-password` (first-login flow).
- Built `change-password.tsx` (ForcePasswordChange): spring-in lock icon, "Set Your New Password" heading, New + Confirm password fields (show/hide), live strength meter + 5-rule checklist (length, upper, lower, num, symbol), "Min 8 characters" hint. Submit disabled until valid. Navigates to `candidate-system-check` on success.
- Built `system-check.tsx` (PreTestCheck): "🔍 System Check" heading, 4 rows (Browser ✅ Chrome 120, Microphone ✅ Working, Camera ⬜ Request Permission, Fullscreen ⬜ Enter Fullscreen). Mock permission handlers flip state to ✅ with spring-in checkmark + spinner. Progress bar tracks 0/4 → 4/4. Continue button disabled until all green, then navigates to `candidate-dashboard`.
- Built `dashboard.tsx` (CandidateDashboard): header "Acme Corp — Backend Developer" + logout; live deadline countdown card (DD:HH:MM:SS) with color tone that switches emerald (>72h) / amber (24–72h) / rose (<24h) — mock deadline = now + 2d 8h 23m to land in amber zone. 3 stacked round cards: R1 Aptitude (✅ Completed, 74/100, Qualification ✅ Passed), R2 Coding (🔄 In Progress, aurora "Continue Coding" button), R3 AI Interview (🔒 Locked, "Complete Coding first to unlock"). Integrity block: violations === 0 so renders the explainer note ("0 violations — proctoring monitored, 3-strike rule explained") instead of the violation counter.
- Built `results.tsx` (CandidateResults): centered card, spring-in ✅ icon, "✅ Assessment Complete", "Your responses have been submitted to Acme Corp." 3 round score rows (Aptitude 74/100 emerald, Coding 81/100 violet, Interview 85/100 sky) each with tone-matched progress bar. Divider → 3 hidden rows (Overall Score, Your Rank, Other Candidates) with Lock + EyeOff icons and "Shared with company only" eyebrow. Footer "Thank you for your time. Results will be shared with Acme Corp directly." + Logout button → `landing`.
- Ran `bun run lint` — 0 errors, 0 warnings on the new files (only a pre-existing warning in `prep/dashboard.tsx` which is outside this task's scope).
- Verified dev server log shows clean recompiles on every save.

Stage Summary:
- Files created (6):
  - /home/z/my-project/src/components/screens/candidate/apply.tsx → `ApplyPage`
  - /home/z/my-project/src/components/screens/candidate/login.tsx → `CandidateLogin`
  - /home/z/my-project/src/components/screens/candidate/change-password.tsx → `ForcePasswordChange`
  - /home/z/my-project/src/components/screens/candidate/system-check.tsx → `PreTestCheck`
  - /home/z/my-project/src/components/screens/candidate/dashboard.tsx → `CandidateDashboard`
  - /home/z/my-project/src/components/screens/candidate/results.tsx → `CandidateResults`
- All 6 export the EXACT named component specified in the task.
- All 6 start with `"use client";`, use `useNav` for routing, use shared primitives (`AuroraBackground`, `GlowCard`, `MagneticButton`, `PulseBadge`, `StaggeredReveal`, `revealItem`) + shadcn/ui + lucide-react + framer-motion.
- All 6 are fully responsive (mobile-first), use only the allowed palette (violet/fuchsia/emerald/amber/rose/sky/slate — no indigo/blue), and match the dark, glass-card, gradient design language of `landing.tsx`.
- Did NOT modify `page.tsx`, `globals.css`, `layout.tsx`, or any file outside `src/components/screens/candidate/`.
- Screens pending: B1 (email template — out of scope per task), B6/B7/B8 (candidate aptitude/coding/interview strict versions — out of scope per task).

---
Task ID: 7
Agent: superadmin-screens
Task: Built the 8 Super Admin screens (S1–S8) under `src/components/screens/superadmin/`.

Work Log:
- Read `worklog.md`, `primitives.tsx`, `top-nav.tsx`, `store.ts`, `landing.tsx`, and the screen spec (lines 1128–1335) to lock in the design language, available screen IDs and the exact mock data required for each screen.
- Verified the available shadcn/ui primitives (`Switch`, `Select`, `Dialog`, `Table`, `Progress`, `Input`, `Button`) and confirmed `recharts`, `framer-motion`, `zustand`, `lucide-react`, `next-themes` are installed.
- Built `dashboard.tsx` (SuperAdminDashboard, S1): 8 StatCards in responsive 2×4 / 4×2 grid (Students 12,450 · Companies 23 · Campaigns 47 · Interviews 8,320 · Resumes Analyzed 18,200 · Gemini Calls 45,000 · DB Health ✅ Good · Redis Health ✅ Good). 24h platform-pulse sparkline (recharts AreaChart). 7 navigation cards (Companies, Users, AI Usage, Questions, System, Audit, DB Health) that call `set("superadmin-…")` on click.
- Built `companies.tsx` (CompanyManagement, S2): 5-row company table (Acme Corp active, TechStart active, OldCorp suspended, InnovateCo active, LegacyLabs suspended) with Suspend/Reactivate buttons that open a confirmation Dialog and flip the row status, plus a View button that navigates to `admin-dashboard`. Includes a 3-card KPI strip (active / suspended / total candidates), a recent tenant activity feed, and a "what suspension does" explainer card.
- Built `users.tsx` (UserManagement, S3): debounced (300ms `setTimeout`) search bar with a live "syncing / synced" pulse indicator, 6 users across all four roles (candidate, company_admin, student, super_admin), per-row actions — View (→ audit), Reset PW (email dialog), Suspend (admins), Delete (others → danger GDPR dialog with the exact required copy: "This will permanently delete all user data across all databases (PostgreSQL, MongoDB, Cloudinary, Redis). This action cannot be undone. Continue?"). Role-coloured PulseBadge per row.
- Built `ai-usage.tsx` (AIUsageMonitor, S4): 4 StatCards (Requests today 342/15,000 · Token usage 1.2M/1M ⚠️ 120% · Avg response time 2.3s · Rate limit hits 5). Stacked horizontal BarChart showing usage share per module (Resume Analysis 45% / Interview Q&A 30% / Code Review 12% / Post-Interview Report 8% / Question Seeding 5%) with a manual colour-coded legend. Per-module BarChart with custom-cell colours. Recent rate-limit events list with timestamps + soft/hard severity badges.
- Built `questions.tsx` (QuestionBankAdmin, S5): aptitude table (Quantitative 512, Logical 408, Verbal 305, Analytical 298, Data Interpretation 247, Total 1,770 — each with ✅ Healthy badge + utilization bar). Coding table (DSA 210, SQL 105, Total 315). 4 top-level StatCards. 3-card quality-metrics block (avg 12.3, never-used 234, over-used 45). "🔄 Reseed All Questions" danger button opens the exact-spec confirmation Dialog ("This will regenerate ALL questions via Gemini and replace existing ones. Takes approximately 30 minutes. Continue?") and runs an animated progress bar while "calling Gemini".
- Built `system.tsx` (SystemConfig, S6): settings table — Maintenance Mode (Switch OFF, turns ON/amber when toggled), Default Proctoring Strictness (Select: Lenient/Standard/Strict/Paranoid), Email Provider (Select: Resend/SES/Postmark/Mailgun), Resend API Key (masked `rsk_••••…••••` + Update button → reveals password input + Save), From Email (inline Input), Gemini API Key (masked `AIza••••…••••` + Update), and a feature-flags grid with 5 Switches (Resume Analyzer / Aptitude / Coding / AI Interview / Hiring Mode). "Save changes" button records a timestamp footer.
- Built `audit.tsx` (AuditLogs, S7): 4 StatCards + 4-column filter bar (user search + Role Select + Action Select + From/To date range), 7-row audit table with colour-coded Action badges per type (CAMPAIGN_CREATED violet, BULK_SHORTLIST sky, COMPANY_SUSPENDED amber, QUESTION_RESEED rose, USER_DELETED rose, LOGIN slate). Working "Export CSV" button that builds a real CSV blob and triggers a download. Footer shows "Showing X of Y entries".
- Built `db-health.tsx` (DatabaseHealth, S8): 4 StatCards + 6-card status grid (PostgreSQL ✅ 12ms, MongoDB ✅ 8ms, Redis ✅ 3ms, Cloudinary ✅, Piston ✅ running, Celery ✅ 2 active) with tone-coloured icon tiles + latency readout. 4-row table-sizes table (users 12,500 / 45MB, aptitude_questions 1,770 / 12MB, interview_sessions 8,320 / 120MB, applicant_pool 2,100 / 8MB) with utilization bars + totals row. "Run Full Health Check" button runs an animated progress bar and refreshes `lastRun`. Recent health-check log list with tone-coloured dots.
- Ran `bun run lint` — 0 errors on the 8 new files. (2 pre-existing warnings in `prep/aptitude.tsx` and `prep/dashboard.tsx` — outside this task's scope.)
- Verified `/home/z/my-project/dev.log` — Next.js dev server is healthy, compiling on every save with no errors.
- Mirrored work record to `/home/z/my-project/agent-ctx/7-superadmin-screens.md` because the root-level `/agent-ctx` directory was not writable.

Stage Summary:
- Files created (8 — all under `src/components/screens/superadmin/`):
  - /home/z/my-project/src/components/screens/superadmin/dashboard.tsx → `SuperAdminDashboard`
  - /home/z/my-project/src/components/screens/superadmin/companies.tsx → `CompanyManagement`
  - /home/z/my-project/src/components/screens/superadmin/users.tsx → `UserManagement`
  - /home/z/my-project/src/components/screens/superadmin/ai-usage.tsx → `AIUsageMonitor`
  - /home/z/my-project/src/components/screens/superadmin/questions.tsx → `QuestionBankAdmin`
  - /home/z/my-project/src/components/screens/superadmin/system.tsx → `SystemConfig`
  - /home/z/my-project/src/components/screens/superadmin/audit.tsx → `AuditLogs`
  - /home/z/my-project/src/components/screens/superadmin/db-health.tsx → `DatabaseHealth`
- All 8 export the EXACT named component specified in the task.
- All 8 start with `"use client";`, use `useNav` for routing, wrap in `<AuroraBackground>` + `<PageWrap>`, and use shared primitives (`StatCard`, `GlowCard`, `PulseBadge`, `SectionHeading`, `StaggeredReveal`, `revealItem`) + shadcn/ui (`Switch`, `Select`, `Dialog`, `Table`, `Progress`, `Input`, `Button`) + lucide-react + framer-motion + recharts.
- All 8 are fully responsive (mobile-first), use only the allowed palette (violet/fuchsia/sky/cyan/emerald/teal/amber/orange/rose/pink/slate/white — no indigo/blue), and match the dark, glass-card, gradient design language of `landing.tsx`.
- Did NOT modify `page.tsx`, `globals.css`, `layout.tsx`, or any file outside `src/components/screens/superadmin/`. No Next.js route files were created.
- Screens pending: none — all 8 S screens delivered.

---
Task ID: 5
Agent: admin-screens
Task: Built 8 Company Admin screens (A1–A7 + A5b) of the AI Interview Assistant SaaS.

Work Log:
- Read worklog.md, primitives.tsx, top-nav.tsx, store.ts, landing.tsx, and the screen-by-screen spec (lines 463–833) to absorb design language and detailed specs for A1–A7.
- Surveyed shadcn/ui components and confirmed exact prop APIs (select, dialog, tabs, slider, checkbox, radio-group, dropdown-menu, table, badge).
- Built each screen with `"use client";`, exact named export as required by the spec, using `useNav().set(...)` for routing and shared primitives + shadcn/ui + lucide-react.
- register.tsx — registration card with show/hide password toggles, inline validation, mock submit → admin-dashboard.
- dashboard.tsx — 4 StatCards + quick-action grid + searchable campaign table (rows route to candidate-leaderboard) + live activity + integrity card.
- campaign-new.tsx — two-phase (form → success). Phase 1 has round toggles, weight sliders with Σ validation, cutoffs, proctoring strictness, auto-DQ checkboxes, live summary. Phase 2 has spring checkmark, campaign details, gradient-bordered Apply Link Box with Copy buttons and a 21×21 SVG QR placeholder (no qrcode.react dependency). CTAs route to question-manager / candidate-leaderboard.
- questions.tsx — two tabs (Aptitude / Coding). Aptitude form: category, sub-topic, difficulty, question, 4 radio-labelled option rows, explanation, Add + Bulk Upload CSV + Download-template. Coding form: title, difficulty, type radio (DSA/SQL), markdown statement, signatures, visible/hidden test counts, time/memory limits, conditional SQL Schema field. Lists below each form.
- candidates.tsx — State 4 post-shortlist leaderboard. Top stats bar + amber notification banner + auto-shortlist panel with 8-option method dropdown + source tabs + full table (checkbox, rank, name+ID, source badge, job-fit progress, ATS, email inline-edit for missing, aptitude, qualification, coding-locked, interview-live, overall, integrity badge, status) + Refresh + Export CSV + Export PDF ZIP.
- bulk-upload.tsx — three-phase via useState. Phase 1: info card + drag-drop zone + selected file list. Phase 2: animated progress bar + per-file row + ETA. Phase 3: summary + manual-fix cards (AI-extracted row + required fields + Save → card turns ✅) + collapsible fully-extracted list + Discard + Add-all.
- proctoring.tsx — candidate info bar + integrity score breakdown (base 100 → -15 / -12 / -9) + summary + timeline table (Time / Round / Event / Severity / Screenshot View) with Dismiss / Confirm action buttons. View opens Dialog with stylized webcam-frame placeholder (phone bounding box + REC stamp).
- selection.tsx — final selection leaderboard with per-row DropdownMenu decision selector (Selected / Waitlisted / Rejected / Pending, tinted), per-row notes Textarea, 4 SummaryCards, Save decisions + Export CSV + Export PDF ZIP + footer card.
- Did NOT modify page.tsx, globals.css, layout.tsx, or any file outside src/components/screens/admin/ (per task rules — main agent wires router).
- Verified with `bun run lint` — 0 errors / 0 warnings in any of the 8 new admin files (only pre-existing prep/* warnings remained).
- Wrote detailed work record to /home/z/my-project/agent-ctx/5-admin-screens.md.

Stage Summary:
- Files created (all under /home/z/my-project/src/components/screens/admin/):
  1. register.tsx     → CompanyRegister      (A1)
  2. dashboard.tsx    → AdminDashboard       (A2)
  3. campaign-new.tsx → CampaignCreate       (A3)
  4. questions.tsx    → QuestionManager      (A4)
  5. candidates.tsx   → CandidateLeaderboard (A5 — State 4)
  6. bulk-upload.tsx  → BulkUpload           (A5b — 3 phases)
  7. proctoring.tsx   → ProctoringReview     (A6)
  8. selection.tsx    → FinalSelection       (A7)
- No screens pending.

---
Task ID: 4b
Agent: prep-screens
Task: Build 9 frontend screens for the Prep Mode section of the AI Interview Assistant SaaS (Screens 2-10)

Work Log:
- Read worklog.md, primitives.tsx, top-nav.tsx, store.ts, landing.tsx, and the full screen spec to absorb the architecture, design language, naming convention, and screen requirements before writing any code.
- Confirmed available shadcn/ui components (full set including input-otp, accordion, dialog, collapsible, etc.), recharts v2.15.4, framer-motion v12, lucide-react.
- AuthScreen: split-screen desktop layout (gradient + 3D avatar mock + tagline left; form right). Sign Up tab = 3 in-place steps (Create Account → OTP via InputOTP → Profile Setup with role dropdown, skills tag input, repeatable education rows, LinkedIn/GitHub). Login tab with forgot password inline flow. Demo OTP = "000000".
- StudentDashboard: bento layout — SVG score gauge, recharts AreaChart trend, recharts RadarChart (6 axes), Resume ATS Progress, 5 aptitude bars, recent interviews list, 6-week roadmap checklist (done/active/locked), GitHub-style 12×7 heatmap, collapsible fair-usage summary, bottom CTA tiles.
- ResumeHub: 3 in-page tabs (Upload/Results/History). Upload = drag-drop zone + Analyze button + Shimmer loading. Results = 3 score cards + skills found/missing/recommended + grammar issues with line numbers + formatting list + 2-paragraph AI summary + metadata badges. History = shadcn Table (desktop) / cards (mobile).
- AptitudePortal: 3 in-page tabs (Rules/Test/Results). Test = color-changing timer (red < 1min), Q counter, bookmark, 5×5 navigation grid with state styling + legend, 4 option buttons, prev/next, submit confirmation Dialog. Results = score summary + 5 category bars + wrong-answers list with explanations + Take Again.
- CodingArena: 50/50 split pane. Left = problem statement with difficulty badge + examples in code blocks + constraints. Right = language dropdown (7 langs) + Monaco-styled `<textarea>` with line numbers + dark bg + mono font + custom input + Run/Submit + test cases list (visible + hidden) + AI Code Review panel (sub-scores, complexity badges, strengths/suggestions, collapsible refactor snippet). Language switch confirmation Dialog. Auto-save indicator.
- InterviewStudio: 4 sub-screens via useState with demo controls. Setup = 6 interview type cards + mic/camera system check. Live = top bar (timer, Q counter, End Early Dialog) + left (avatar with thinking dots + waveform + 3 analysis indicators) + right (question card + mic toggle + chat transcript with typing dots). Processing = conic-gradient spinner + 4 step states. Done = spring-scale checkmark + stats + report/dashboard CTAs.
- InterviewReport: 17 sections each in own GlowCard with section number badge + title + icon. Sticky Download PDF button (top-right + bottom CTA). Sections cover executive summary, score table, hiring recommendation, all 11 analysis dimensions, recharts LineChart emotion timeline, session highlights, top 7 strengths/improvements, 6-week accordion roadmap, final recommendation.
- InterviewReplay: video player mock (aspect-video, avatar mock, center play, chapter markers on seek bar, transport controls) + transcript panel with click-to-jump bubbles + AI annotations + emotion strip (6 emoji buttons with labels/times, click to jump). Side column with session summary stats + body-language highlights.
- StudentProfile: 4 shadcn Tabs. Personal Info = avatar upload + 8 input fields + bio textarea. Education = repeatable rows (degree dropdown, institution, year, field) + Add row. Skills = tag input with autocomplete + 4 stats + completeness callout. Job Preferences = multi-select roles grid + experience dropdown + salary + locations tag input + notice/remote/shift selects.
- Ran `bun run lint` — fixed 2 minor warnings (ternary-as-statement in aptitude.tsx; unused eslint-disable in dashboard.tsx). Final: 0 errors, 0 warnings.
- Verified dev.log: dev server compiles all 9 screens with no errors.

Stage Summary:
- Files created (list each file path):
  1. `/home/z/my-project/src/components/screens/prep/auth.tsx` — `AuthScreen`
  2. `/home/z/my-project/src/components/screens/prep/dashboard.tsx` — `StudentDashboard`
  3. `/home/z/my-project/src/components/screens/prep/resume.tsx` — `ResumeHub`
  4. `/home/z/my-project/src/components/screens/prep/aptitude.tsx` — `AptitudePortal`
  5. `/home/z/my-project/src/components/screens/prep/coding.tsx` — `CodingArena`
  6. `/home/z/my-project/src/components/screens/prep/interview.tsx` — `InterviewStudio`
  7. `/home/z/my-project/src/components/screens/prep/report.tsx` — `InterviewReport`
  8. `/home/z/my-project/src/components/screens/prep/replay.tsx` — `InterviewReplay`
  9. `/home/z/my-project/src/components/screens/prep/profile.tsx` — `StudentProfile`
- Any screens pending: None. All 9 Prep Mode screens complete, lint-clean, and compile-ready for router wiring.

---

## Task ID: FLOW-CAND · Agent flow-cand

**Scope:** Add the `FlowNav` sequential navigation component to the 6 Invited-Candidate screen files. Surgical edit only — import + render once near the bottom of each screen.

**Files edited (6)** — all under `src/components/screens/candidate/`:

| File | Export | FlowNav placement |
|------|--------|-------------------|
| `apply.tsx`     | `ApplyPage`             | After trailing `motion.p`, as last child of `<section>` (outside the `AnimatePresence` success card so it always renders) |
| `login.tsx`     | `CandidateLogin`        | After trailing `motion.p`, as last child of `<section>` |
| `change-password.tsx` | `ForcePasswordChange` | After `</StaggeredReveal>`, as last child of `<section>` |
| `system-check.tsx` | `PreTestCheck`       | After trailing `motion.p`, as last child of `<section>` |
| `dashboard.tsx` | `CandidateDashboard`   | After trailing `motion.p`, as last child of `<section>` |
| `results.tsx`   | `CandidateResults`      | After trailing `motion.p`, as last child of `<section>` |

**Import added** (after other imports, top of each file):
```tsx
import { FlowNav } from "@/components/shared/flow-nav";
```

**Render added** (once per file, last child of the page `<section>`, inside `AuroraBackground`):
```tsx
<FlowNav flowId="candidate" />
```

**Reference flow (from `src/lib/flows.ts`):**
Apply → Candidate Login → Force Password Change → Pre-Test System Check → Candidate Dashboard → Candidate Results

**Placement rules followed:**
- ✅ Outside any conditional render blocks (after `</StaggeredReveal>` or trailing static `motion.p`, never inside `AnimatePresence`/`!submitted`/`error` branches)
- ✅ Inside the page wrapper (`<AuroraBackground>` → `<section>`) so it gets the dark background
- ✅ LAST child of the page wrapper, after any conditional success/error messages
- ✅ For `apply.tsx`: placed AFTER the success card so it always renders

**Constraints respected:**
- Did NOT modify any other code, add FlowNav multiple times, place inside conditionals, reorder sections, or change exports/signatures.

**Verification:** `bun run lint` → 0 errors, 0 warnings.

**Agent work record:** `/home/z/my-project/agent-ctx/FLOW-CAND-flow-cand.md`

---

## Task ID: FLOW-SA · Agent: flow-sa

**Task:** Add the `FlowNav` sequential navigation component to 8 Super Admin
screen files. Surgical edit: import `FlowNav` from
`@/components/shared/flow-nav`, render `<FlowNav flowId="superadmin" />`
once near the bottom of each screen inside `PageWrap` (so it inherits the
Aurora dark background) but outside any Dialog / Tab / conditional render.

**Work Log:**
- Read `src/components/shared/flow-nav.tsx` and `src/lib/flows.ts` to
  confirm the component API (single required prop `flowId`, self-contained
  GlowCard with built-in `mt-12`, returns `null` if the current screen
  doesn't belong to the named flow) and the 8-step Super Admin sequence:
  Dashboard → Companies → Users → AI Usage → Questions → System → Audit →
  DB Health.
- Read all 8 target screen files end-to-end. Each one uses the same
  shape: `<AuroraBackground><PageWrap>…main content…</PageWrap>…optional
  Dialogs…</AuroraBackground>`. None use in-page Tabs, so placement was
  deterministic.
- For each file, made two surgical edits:
  1. Added `import { FlowNav } from "@/components/shared/flow-nav";`
     after the previous last import line.
  2. Added `<FlowNav flowId="superadmin" />` immediately before
     `</PageWrap>` (so it sits inside the page wrapper but outside any
     trailing Dialog block which stays after `</PageWrap>`).
- No other code touched. No reordering, no signature changes, no class
  adjustments. Diff per file = +1 import +2 render lines (incl. blank).

**Files Edited (8):**
1. `src/components/screens/superadmin/dashboard.tsx`
2. `src/components/screens/superadmin/companies.tsx`
3. `src/components/screens/superadmin/users.tsx`
4. `src/components/screens/superadmin/ai-usage.tsx`
5. `src/components/screens/superadmin/questions.tsx`
6. `src/components/screens/superadmin/system.tsx`
7. `src/components/screens/superadmin/audit.tsx`
8. `src/components/screens/superadmin/db-health.tsx`

**Verification:**
- `bun run lint` → exit code 0, 0 errors, 0 warnings.
- dev.log shows clean compilation of all 8 files after edits.
- Work record written to `/home/z/my-project/agent-ctx/FLOW-SA-flow-sa.md`.

**Stage Summary:**
- 8 files edited, ~16 lines added total. FlowNav now renders as the last
  child of `PageWrap` on every Super Admin screen, providing a persistent
  stepper + Continue CTA through the 8-screen platform-tour flow.

---

### FLOW-ADMIN · flow-admin — Add `FlowNav` to 8 Company Admin screens

**Task**: Surgically inject the `FlowNav` sequential navigation component at the bottom of every screen in the Company Admin flow (defined in `src/lib/flows.ts` as `ADMIN_FLOW`).

**Reference flow** (8 steps): Company Register → Admin Dashboard → Campaign New → Question Manager → Candidate Leaderboard → Bulk Upload → Proctoring Review → Final Selection.

**Files edited (8)** — all under `src/components/screens/admin/`:

| File | Export | Placement |
|------|--------|-----------|
| `register.tsx`     | `CompanyRegister`        | After 2-col grid `</div>`, last child of `PageWrap` |
| `dashboard.tsx`    | `AdminDashboard`         | After bottom strip `</div>` (Live activity + Integrity), last child of `PageWrap` |
| `campaign-new.tsx` | `CampaignCreate`        | **Outside** `<AnimatePresence>` phase switch — shows in BOTH `form` + `success` phases |
| `questions.tsx`    | `QuestionManager`        | **Outside** `<Tabs>` — shows regardless of active tab (aptitude/coding) |
| `candidates.tsx`  | `CandidateLeaderboard`  | After bottom actions `</div>` (Refresh / Export row), last child of `PageWrap` |
| `bulk-upload.tsx`  | `BulkUpload`            | **Outside** `<AnimatePresence>` phase switch — shows in all 3 phases (upload/processing/results) |
| `proctoring.tsx`   | `ProctoringReview`      | After bottom CTA `</div>`, last child of `PageWrap` (BEFORE the `<Dialog>` which sits outside `PageWrap`) |
| `selection.tsx`    | `FinalSelection`        | After footer `</GlowCard>`, last child of `PageWrap` |

**Import added** (after other imports, top of each file):
```tsx
import { FlowNav } from "@/components/shared/flow-nav";
```

**Render added** (once per file, last child of `PageWrap`, inside `AuroraBackground`):
```tsx
<FlowNav flowId="admin" />
```

**Placement rules followed:**
- ✅ Outside any conditional render blocks / phase switches / Tabs / Dialog content (specifically: outside `<AnimatePresence>` in campaign-new & bulk-upload, outside `<Tabs>` in questions, before the `<Dialog>` in proctoring)
- ✅ Inside the page wrapper (`<AuroraBackground>` → `<PageWrap>` → `<section>`) so it gets the dark aurora background
- ✅ LAST child of `PageWrap`, after the existing final section
- ✅ Self-contained card (built-in `mt-12` spacing — no extra margin classes added)

**Constraints respected:**
- ❌ Did NOT modify any other code, add FlowNav multiple times, place inside a Tab/Dialog/conditional, reorder sections, or change exports/signatures.

**Verification:** `bun run lint` → 0 errors, 0 warnings. `rg FlowNav src/components/screens/admin` → 16 hits across 8 files (8 imports + 8 renders), confirming exactly one FlowNav per file.

**Agent work record:** `/home/z/my-project/agent-ctx/FLOW-ADMIN-flow-admin.md`

---

## Task ID: FLOW-PREP · Agent: flow-prep

**Task:** Surgically inject the `FlowNav` sequential navigation component at the bottom of every screen in the Prep Mode flow (defined in `src/lib/flows.ts` as `PREP_FLOW`).

**Reference flow** (9 steps): Landing → Auth → Dashboard → Resume → Aptitude → Coding → Interview → Report → Replay.

**Files edited (10)** — all under `src/components/screens/prep/` (the 9 PREP_FLOW steps + `profile.tsx` for consistency):

| File | Export | Placement |
|------|--------|-----------|
| `landing.tsx`  | `LandingScreen` | Between the final CTA `</section>` ("Ready to ace your next interview?") and the `{/* FOOTER */}` comment — sits at the AuroraBackground sibling level, ABOVE the `<footer>` |
| `auth.tsx`     | `AuthScreen`   | After the root grid `</div>` (the 2-col marketing/form layout), directly before `</AuroraBackground>` (skipped the `<div className="px-4 pb-12">` wrapper because the screen wraps in `<AuroraBackground>`) |
| `dashboard.tsx`| `DashboardScreen` | Last child of `PageWrap`, after the quick-actions grid `</div>` |
| `resume.tsx`   | `ResumeHub`    | Last child of `PageWrap`, after the footer CTA `</div>` ("Want tailored interview questions...") |
| `aptitude.tsx` | `AptitudePortal` | Last child of `PageWrap`, after the `<AnimatePresence>` results block `</div>` |
| `coding.tsx`   | `CodingArena`  | Last child of `PageWrap`, after the stats strip `</div>` — placed BEFORE the `<Dialog>` (language-switch confirm) which sits OUTSIDE `PageWrap` between `</PageWrap>` and `</AuroraBackground>` |
| `interview.tsx`| `InterviewScreen` | Last child of `PageWrap`, after the `<AnimatePresence>` phase switch `</div>` |
| `report.tsx`   | `ReportScreen` | Last child of `PageWrap`, after the Download-PDF CTA `</div>` |
| `replay.tsx`   | `ReplayScreen` | Last child of `PageWrap`, after the bottom GlowCard `</div>` ("Start New") |
| `profile.tsx`  | `ProfileScreen` | Last child of `PageWrap`, after the Tabs `</div>` (profile is not in PREP_FLOW but `flowId="prep"` was still applied — falls back to landing as current step, acceptable) |

**Import added** (top of each file, after `import { cn } from "@/lib/utils";`):
```tsx
import { FlowNav } from "@/components/shared/flow-nav";
```

**Render added** (once per file):
```tsx
<FlowNav flowId="prep" />
```

**Placement rules followed:**
- ✅ Outside any Tabs / Dialog / AnimatePresence / conditional render blocks — every FlowNav is a sibling of the main content container, not inside a tab panel
- ✅ Inside `AuroraBackground` so it gets the dark aurora background (inside `PageWrap` everywhere except `landing.tsx` and `auth.tsx`, where it lives directly inside `AuroraBackground` because those screens don't use a single `PageWrap`)
- ✅ LAST child of its container (last child of `PageWrap` for 8 files; for `landing.tsx` it sits between the final CTA `<section>` and `<footer>` so the footer remains at the bottom; for `auth.tsx` it sits at the bottom of `AuroraBackground` below the form)
- ✅ Self-contained card — built-in `mt-12` spacing, no extra margin classes added

**Constraints respected:**
- ❌ Did NOT modify any other code in the files
- ❌ Did NOT add FlowNav multiple times in any file (verified: `rg FlowNav src/components/screens/prep` → 20 hits across 10 files = 10 imports + 10 renders)
- ❌ Did NOT place FlowNav inside a Tab, Dialog, or conditional render block
- ❌ Did NOT reorder existing sections, change screen exports, or change function signatures

**Verification:** `bun run lint` → 0 errors, 0 warnings.

**Agent work record:** `/home/z/my-project/agent-ctx/FLOW-PREP-flow-prep.md`

---

## Task ID: FLOWNAV-CLEANUP · Agent: flownav-cleanup

**Task:** `FlowNav` was promoted to a GLOBAL render in `src/app/page.tsx` (between `TopNav` and the active screen). Remove the per-screen `FlowNav` import + render from ALL screen files under `src/components/screens/` so only the global one remains (otherwise every screen would show TWO FlowNav bars).

**Files edited (33)** — all under `src/components/screens/`:

| Group | Files | Count |
|-------|-------|-------|
| Prep | `auth`, `dashboard`, `resume`, `aptitude`, `coding`, `interview`, `report`, `replay`, `profile`, `landing` | 10 |
| Admin | `landing`, `register`, `dashboard`, `campaign-new`, `questions`, `candidates`, `bulk-upload`, `proctoring`, `selection` | 9 |
| Candidate | `apply`, `login`, `change-password`, `system-check`, `dashboard`, `results` | 6 |
| Super Admin | `dashboard`, `companies`, `users`, `ai-usage`, `questions`, `system`, `audit`, `db-health` | 8 |

**Edits per file (exactly 2 via `MultiEdit`):**

1. **Removed the import line** (matched with trailing newline so no blank line was left behind):
   ```tsx
   import { FlowNav } from "@/components/shared/flow-nav";
   ```

2. **Removed the JSX render** (matched with trailing newline):
   - Simple pattern (32 files): `<FlowNav flowId="prep|admin|candidate|superadmin" />` (6- or 8-space indent per file)
   - Wrapped pattern (`admin/landing.tsx` only): removed the entire block — the `{/* Sequential flow nav at bottom */}` comment + two wrapping `<div>`s (which existed ONLY to hold FlowNav) + the `<FlowNav flowId="admin" />` line

**Post-edit cleanup:** `prep/landing.tsx` had blank lines on BOTH sides of the original FlowNav render; removing the line left a double-blank between `</section>` and `{/* FOOTER */}`. A follow-up `Edit` collapsed the double blank back to a single blank line to keep ESLint's `no-multiple-empty-lines` happy. All other files had only a single adjacent blank line, so no further cleanup was needed.

**⚠ Discrepancy note:** The task instructions claimed "the prep `landing.tsx` does NOT have FlowNav — skip it" and listed the total as 32 files. In reality, `prep/landing.tsx` DID contain FlowNav (line 40 import + line 531 render — added by the earlier FLOW-PREP agent). To satisfy the explicit verification criterion (`rg "FlowNav" src/components/screens/` → ZERO matches) and the overall stated goal ("only the global one remains"), `prep/landing.tsx` was ALSO cleaned up (bringing the actual total to 33 files). Details are documented in the agent work record.

**Constraints respected:**
- ✅ Did NOT modify any other code, change exports/signatures, reorder sections, or remove any other imports.
- ✅ Did NOT touch the FlowNav component definition (`src/components/shared/flow-nav.tsx`) or the global render (`src/app/page.tsx`).

**Verification:**
- `rg "FlowNav" src/components/screens/` → **No matches found** (ZERO per-screen references) ✅
- `bun run lint` → **exit code 0** (0 errors, 0 warnings) ✅
- `rg "FlowNav" src/` → only 4 matches remain, all in the expected locations:
  - `src/app/page.tsx:6` (import) + `src/app/page.tsx:96` (global `<FlowNav />` render)
  - `src/components/shared/flow-nav.tsx:43` (JSDoc) + `src/components/shared/flow-nav.tsx:54` (`export function FlowNav()`)

**Agent work record:** `/home/z/my-project/agent-ctx/FLOWNAV-CLEANUP-flownav-cleanup.md`

---

## Task DESIGN-ADMIN · design-admin · 2025

**Agent:** design-admin
**Scope:** Apply professional design edits to 8 Company Admin screen files to match the redesigned landing page (prep/landing.tsx) quality bar.

**Files edited (8):**
1. `src/components/screens/admin/register.tsx` → `CompanyRegister`
2. `src/components/screens/admin/dashboard.tsx` → `AdminDashboard`
3. `src/components/screens/admin/campaign-new.tsx` → `CampaignCreate`
4. `src/components/screens/admin/questions.tsx` → `QuestionManager`
5. `src/components/screens/admin/candidates.tsx` → `CandidateLeaderboard`
6. `src/components/screens/admin/bulk-upload.tsx` → `BulkUpload`
7. `src/components/screens/admin/proctoring.tsx` → `ProctoringReview`
8. `src/components/screens/admin/selection.tsx` → `FinalSelection`

**Surgical edits applied per file:**

A. **AuroraBackground removed** — replaced `<AuroraBackground>` wrapper with `<div className="min-h-screen bg-background text-foreground">`. Removed import.

B. **Emojis removed from copy** — verified zero matches for the emoji character class `[✅🔄🔒📋🚀⚠️❌✨🎯🔥💡📥📤📊👥🟢🔴]` across all 8 files. Replaced the inline `✓` text character in questions.tsx with the `<Check>` icon, and the `✗`/`🚫`/`⚠️` indicators in selection.tsx with `<X>` and `<ShieldAlert>` icons respectively.

C. **Em dashes removed** — replaced `—` with `.` (in copy) or `-` (in placeholders and JSX comments). All em dashes in rendered copy converted: e.g. "in a week — not a quarter." → "in a week. Not a quarter.", "auto-submitted — 3+ tab" → "Auto-submitted. 3+ tab", "Disqualified — phone detected" → "Disqualified. Phone detected", "versioned — every change" → "versioned. Every change". Table-cell null placeholders (`—`) replaced with regular hyphen `-`.

D. **Sparkles icon removed** — import and all JSX usages deleted from every file (was used in register.tsx pitch card, dashboard.tsx Active Campaigns stat icon, and campaign-new.tsx Create button).

E. **Harsh button gradients removed** — all `bg-gradient-to-r from-violet-500 to-fuchsia-500` (and br/to-fuchsia-400 hover variants) replaced with solid `bg-violet-500 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600`. Same treatment applied to slider range fills, progress bars, and avatar backgrounds (now `bg-violet-500/10 text-violet-700 dark:text-violet-300`).

F. **Glow shadows removed** — `shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]` and similar glow box-shadows replaced with `shadow-sm`. Verified zero `shadow-[` custom-class matches remain across the 8 files.

G. **BorderBeam removed** — was not present in any of the 8 edited files (only in admin/landing.tsx, which was off-limits).

H. **MagneticButton removed** — replaced with plain `<Button>` and removed import. All `onClick`, `disabled`, `className`, `type`, and `variant` props preserved.

I. **PulseBadge removed** — replaced with native `<span>` elements using the same color tokens (`border-X-400/30 bg-X-500/10 text-X-700 dark:text-X-300`). For the dashboard header label and candidates.tsx eyebrow, used simpler `border-black/15 dark:border-white/15` muted pills (eyebrow restraint: max 1 per 3 sections, most converted to plain eyebrow text).

J. **Shape consistency fixed** — all card containers now use `rounded-lg` (GlowCard used `rounded-xl`); all action buttons now use `rounded-full`. Inner pills/badges stay `rounded-full`. The pseudo-QR code box, dropzone, avatar circles, and form inputs retain their appropriate radii.

K. **"it's not X, it's Y" copy removed** — verified zero matches for `it's not|It's not` across all 8 files.

L. **Filler verbs removed** — verified zero matches for `Elevate|Unleash|Seamless|Next-Gen|Revolutionize`.

M. **Functionality preserved** — all tabs, tables, forms, modals, QR placeholder generator, dropzone handlers, processing animation, dropdown menus, score sliders, integrity timeline, screenshot dialog, decision select, and state hooks left intact. No features removed.

N. **Named exports preserved** — every `export function <Name>()` kept with the original name (verified via `rg "^export function"` across all 8 files).

O. **useNav navigation preserved** — every file still imports `useNav` from `@/lib/store` and calls `set(...)` for navigation. Verified via `rg -c "useNav"` (each file shows 2: 1 import + 1 usage).

**Additional refinements:**
- Realistic company name: `Acme Labs Pvt Ltd` → `Northwind Labs Pvt Ltd` in dashboard.tsx and register.tsx (sample placeholder email `priya@acme.com` → `priya@northwind.com`).
- `Plan: "Teams · 50 seats"` → `"Teams. 50 seats"` (middot preserved; would have failed em-dash rule otherwise — but middots are allowed per spec).
- Light-mode contrast: all `text-X-200/300` accent text classes paired with `dark:` variants using `text-X-700/600` so accents are readable on white backgrounds (works in conjunction with the existing globals.css `:root:not(.dark)` overrides).
- `border-white/10` → `border-black/10 dark:border-white/10` and `bg-white/[0.03]` → `bg-muted/30` on cards/containers for native light-mode visibility without relying solely on the globals.css overrides.
- `hover:text-white` → `hover:text-foreground` on text-only buttons.
- All removed `motion` imports from candidates.tsx, questions.tsx, proctoring.tsx, and selection.tsx (those files no longer use framer-motion after edits, and unused imports would trip ESLint).
- Faux webcam frame in proctoring.tsx dialog converted from gradient fills to solid slate shades; the bobbing motion on the phone overlay was removed (the spec's "hover animations → minimal color changes" spirit applies — and the bob was infinite, not hover-driven, but still removed for restraint).

**Verification (all passing):**
- `bun run lint` → exit code 0, 0 errors, 0 warnings ✅
- `rg "[✅🔄🔒📋🚀⚠️❌✨🎯🔥💡📥📤📊👥🟢🔴]" src/components/screens/admin/{8 files}` → no matches ✅
- `rg "—" src/components/screens/admin/{8 files}` → no matches ✅ (JSX comments cleaned too)
- `rg "AuroraBackground|Sparkles|MagneticButton|BorderBeam" src/components/screens/admin/{8 files}` → no matches ✅ (only `admin/landing.tsx` retains these, per the "do not touch" instruction)
- `rg "bg-gradient-to-(r|br|b)" src/components/screens/admin/{8 files}` → no matches ✅
- `rg "shadow-\[" src/components/screens/admin/{8 files}` → no matches ✅
- `rg "text-glow|gradient-text" src/components/screens/admin/{8 files}` → no matches ✅
- `rg "hover:text-white" src/components/screens/admin/{8 files}` → no matches ✅
- `rg "Elevate|Unleash|Seamless|Next-Gen|Revolutionize" src/components/screens/admin/{8 files}` → no matches ✅
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200 ✅
- `rg "^export function"` → all 8 named exports preserved ✅
- `rg -c "useNav"` → all 8 files still wired to the nav store ✅

**Out of scope (NOT touched, per task constraints):**
- `src/components/screens/admin/landing.tsx` — explicitly listed as already redesigned; left intact despite it still containing AuroraBackground/Sparkles/MagneticButton/BorderBeam/GlowCard/PulseBadge (the task owner is aware — that file is the "do not touch" carve-out).
- All non-admin screen files, primitives.tsx, globals.css, package.json.

**Agent work record:** `/home/z/my-project/agent-ctx/DESIGN-ADMIN-design-admin.md`

---

## Task ID: DESIGN-CAND-SA — Candidate & Super Admin Screen Redesign

**Agent:** design-cand-sa
**Scope:** Apply professional design quality to 14 screen files (6 candidate + 8 super admin), bringing them to the same quality level as the redesigned landing page (`src/components/screens/prep/landing.tsx`).

**Design references applied:**
- Landing page (`prep/landing.tsx`) — shape consistency (rounded-lg cards, rounded-full buttons), one accent (violet-500), no em dashes, no emojis, eyebrow restraint.
- Taste Skill v2 rules — no filler verbs, no "it's not X, it's Y", motion spring `[0.16, 1, 0.3, 1]` (kept existing motion), opacity + y only.
- 30-things-to-avoid list — applied surgically to each file.

**Surgical edits applied to all 14 files:**

A. **AuroraBackground** → replaced with `<div className="min-h-screen bg-background text-foreground">` (14 wrappers removed).

B. **Emojis removed** from all copy (✅ 🔍 ⚠️ 🔄). Status indicators swapped to either:
   - Icons (`AlertTriangle`, `CheckCircle2`, `Loader2`, etc.)
   - Inline dot spans (`<span className="h-2 w-2 rounded-full bg-emerald-500" />`)

C. **Em dashes (—)** → replaced with `. ` or `- ` (16 occurrences across user-facing copy + comments).

D. **Sparkles icon** → removed import and JSX in 6 files where present.

E. **Harsh button gradients** (`bg-gradient-to-r from-violet-500 to-fuchsia-500`) → solid `bg-violet-500 hover:bg-violet-600` (and analogous rose/emerald/amber/sky variants).

F. **Glow shadows** on icon containers (`bg-gradient-to-br from-X/30 to-Y/30`) → solid `bg-X/10` tints.

G. **BorderBeam** → none in scope (0 occurrences).

H. **MagneticButton** → replaced with `<Button>` in 6 files (apply, login, change-password, system-check, dashboard, results).

I. **PulseBadge** → replaced with `<Badge variant="outline">` (or inline span where Badge didn't fit). Added `BADGE_TONE_CLASS` lookup map in users.tsx and audit.tsx to preserve the color-coded badges for roles and audit actions.

J. **Shape consistency** — icon containers `rounded-xl`/`rounded-2xl` → `rounded-lg`; primary buttons already `rounded-full`. Header pills standardized to `rounded-full`.

K. **"It's not X, it's Y" copy** — removed from login.tsx (the "invited candidate login — different from your student account" line rewritten to a flat factual sentence).

L. **Filler verbs** — none found in scope; left meaningful verbs intact.

M. **All functionality preserved** — tabs, tables, forms, modals, dialogs, charts (recharts), progress bars, switches, selects, search debounce, CSV export, file upload, password strength meter, countdown timer.

N. **All 14 named exports preserved** (verified via grep).

O. **All useNav navigation preserved** (verified via grep).

**Additional light-mode contrast fixes applied:**
- `text-white` (no slash) on transparent card backgrounds → `text-foreground` (apply.tsx, results.tsx, dashboard.tsx).
- `hover:text-white` on ghost buttons → `hover:text-foreground` (login.tsx, dashboard.tsx, results.tsx, change-password.tsx).
- `text-violet-200/300/400` and similar low-contrast hues → paired with explicit `dark:` variants + `text-violet-600/700` for light mode (dashboard.tsx, results.tsx, system.tsx, audit.tsx, db-health.tsx, ai-usage.tsx, users.tsx, companies.tsx, questions.tsx).
- `text-white/40` and `text-white/20` decorative elements → `text-muted-foreground` / `text-muted-foreground/30` (dashboard.tsx timer colons, results.tsx hidden-row icons).
- `gradient-text` → `text-violet-500 dark:text-violet-400` (matches landing-page accent style).
- `text-glow` → removed (CSS light-mode override already nullifies, but cleaner to drop).

**Files edited (14):**

Candidate (6):
1. `src/components/screens/candidate/apply.tsx` → `ApplyPage`
2. `src/components/screens/candidate/login.tsx` → `CandidateLogin`
3. `src/components/screens/candidate/change-password.tsx` → `ForcePasswordChange`
4. `src/components/screens/candidate/system-check.tsx` → `PreTestCheck`
5. `src/components/screens/candidate/dashboard.tsx` → `CandidateDashboard`
6. `src/components/screens/candidate/results.tsx` → `CandidateResults`

Super Admin (8):
7. `src/components/screens/superadmin/dashboard.tsx` → `SuperAdminDashboard`
8. `src/components/screens/superadmin/companies.tsx` → `CompanyManagement`
9. `src/components/screens/superadmin/users.tsx` → `UserManagement`
10. `src/components/screens/superadmin/ai-usage.tsx` → `AIUsageMonitor`
11. `src/components/screens/superadmin/questions.tsx` → `QuestionBankAdmin`
12. `src/components/screens/superadmin/system.tsx` → `SystemConfig`
13. `src/components/screens/superadmin/audit.tsx` → `AuditLogs`
14. `src/components/screens/superadmin/db-health.tsx` → `DatabaseHealth`

**Verification (all pass):**
- `bun run lint` → exit code 0 (0 errors, 0 warnings)
- `rg "[✅🔄🔒⚠️❌✨🎯🔥💡📥📊🟢🔴⚡🔍📁]" src/components/screens/candidate/ src/components/screens/superadmin/` → **No matches**
- `rg "—" src/components/screens/candidate/ src/components/screens/superadmin/` → **No matches**
- `rg "AuroraBackground|Sparkles|MagneticButton|BorderBeam|PulseBadge" src/components/screens/candidate/ src/components/screens/superadmin/` → **No matches**
- `rg "bg-gradient-to-(r|br)" src/components/screens/candidate/ src/components/screens/superadmin/` → **No matches** (no harsh gradients left)
- Dev server (`bun run dev`) compiled all 14 files cleanly with `GET / 200` responses (verified via `dev.log`).

**Agent work record:** `/home/z/my-project/agent-ctx/DESIGN-CAND-SA-design-cand-sa.md`

---

## Task ID: DESIGN-PREP · Agent: design-prep
### Date: 2025-09-25
### Summary: Redesigned 9 Prep Mode screens to match the redesigned landing page quality

### Files Edited (9):
1. `src/components/screens/prep/auth.tsx` — AuthScreen
2. `src/components/screens/prep/dashboard.tsx` — StudentDashboard
3. `src/components/screens/prep/resume.tsx` — ResumeHub
4. `src/components/screens/prep/aptitude.tsx` — AptitudePortal
5. `src/components/screens/prep/coding.tsx` — CodingArena
6. `src/components/screens/prep/interview.tsx` — InterviewStudio
7. `src/components/screens/prep/report.tsx` — InterviewReport
8. `src/components/screens/prep/replay.tsx` — InterviewReplay
9. `src/components/screens/prep/profile.tsx` — StudentProfile

### Key Changes Applied (per the 30-things-to-avoid list + Taste Skill v2 + Motion Skill):

**A. AuroraBackground removed** — All 9 files: replaced `<AuroraBackground>` with `<div className="min-h-screen bg-background text-foreground">`. Aurora orbs and dot grid eliminated.

**B. Emojis removed from all copy** — Removed 👋 (dashboard welcome), 🎉 (aptitude perfect score), and 6 emotion-strip emojis (😐🙂😊🤔 in replay). Status indicators replaced with CheckCircle2/XCircle icons. Emotion strip replaced with colored dots.

**C. Em dashes removed** — All `—` characters replaced with periods or hyphens across all 9 files (roadmap themes, AI summary text, proctoring copy, transcript notes, report strengths/improvements, interview type descriptions, etc.).

**D. Sparkles icon removed** — Removed from all imports and JSX. Replaced with Video, Code2, FileText, Info, Award, or Briefcase depending on context.

**E. Harsh gradients removed** — All `bg-gradient-to-r from-violet-500 to-fuchsia-500` on buttons replaced with solid `bg-violet-500 hover:bg-violet-600`. Gradient text replaced with solid `text-violet-500 dark:text-violet-400`.

**F. Glow shadows removed** — All `shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]` and `shadow-2xl` replaced with `shadow-sm` or removed.

**G. BorderBeam removed** — Not present in these 9 files (was already absent).

**H. MagneticButton removed** — All `<MagneticButton>` in auth.tsx replaced with regular `<Button>`.

**I. PulseBadge removed** — All `<PulseBadge>` replaced with `<Badge>` or `<span>`.

**J. Shape consistency fixed** — All cards now use `rounded-lg` (replaced GlowCard's rounded-xl with plain divs using rounded-lg). Buttons use `rounded-full`. Dropzone changed from rounded-2xl to rounded-lg.

**K. "It's not X, it's Y" copy removed** — None found in these files; verified.

**L. Filler verbs removed** — No Elevate/Unleash/Seamless/Next-Gen/Revolutionize/Transform found in copy.

**M. Terms + Privacy links added** — auth.tsx footer now has `<a href="#">Terms</a>` and `<a href="#">Privacy</a>` links.

**N. All functionality preserved** — All tabs, sub-screens, forms, tables, charts, modals, dialogs, accordions, and interactive elements kept intact.

**O. All named exports preserved** — AuthScreen, StudentDashboard, ResumeHub, AptitudePortal, CodingArena, InterviewStudio, InterviewReport, InterviewReplay, StudentProfile all unchanged.

**P. All useNav navigation preserved** — All `set("...")` calls unchanged.

### Additional Design Fixes:
- **GlowCard replaced** with plain `<div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">` across all files (GlowCard used backdrop-blur and rounded-xl, violating #8 and #19).
- **Terminal window chrome removed** — coding.tsx editor: removed fake traffic-light dots (red/amber/green circles).
- **Pure black removed** — coding.tsx editor background changed from `#0a0a0f` to `bg-zinc-900`.
- **Rainbow coloring reduced** — dashboard stat tones consolidated; interview.tsx ConicSpinner changed from rainbow conic gradient to single-violet gradient.
- **Animated arrows removed** — dashboard.tsx bottom action buttons: removed `group-hover:translate-x-0.5` on ArrowRight.
- **Bounce easing removed** — interview.tsx done screen: spring changed from `stiffness: 200, damping: 14` to `stiffness: 120, damping: 20` (gentle). report.tsx download icon: `animate-bounce` replaced with `animate-spin`.
- **Checkmark characters removed** — dashboard.tsx roadmap: `✓` character replaced with CheckCircle2 icon. aptitude.tsx: `🎉` replaced with CheckCircle2 icon.
- **Color consistency** — one accent (violet-500) across all sections. Text colors use `dark:` variants for proper light/dark contrast.
- **Light-mode overrides respected** — Used `bg-black/[0.02]` and `dark:bg-white/[0.02]` patterns that work with the globals.css light-mode contrast fixes.

### Verification Results:
- `bun run lint` → 0 errors ✓
- `rg "AuroraBackground|Sparkles|MagneticButton|BorderBeam|PulseBadge|GlowCard" src/components/screens/prep/` → only landing.tsx (untouched) ✓
- `rg "—" src/components/screens/prep/` → 0 results (excluding landing.tsx) ✓
- `rg "[👋✅🔄🔒🎤📷📥📋🚀⚠️❌✨🎯🔥💡🎉😐🙂😊🤔]" src/components/screens/prep/` → 0 results ✓
- All 9 named exports verified present ✓
- All `set("...")` navigation calls verified preserved ✓
- Dev server compiles successfully (GET / 200) ✓

---

## Task ID: DESIGN-ADMIN-LANDING · Agent: design-admin-landing

**Date:** 2025
**Scope:** Clean up banned design patterns in `src/components/screens/admin/landing.tsx` (CompanyLanding component) to match the redesigned prep landing page (`src/components/screens/prep/landing.tsx`).

### File edited (1)
| # | File | Named export |
|---|---|---|
| 1 | `src/components/screens/admin/landing.tsx` | `CompanyLanding` |

### What was changed

**A. AuroraBackground removed** — Replaced `<AuroraBackground>...</AuroraBackground>` wrapper with `<div className="min-h-screen bg-background text-foreground">...</div>`. Removed the import from `@/components/shared/primitives`.

**B. Sparkles icon removed** — Removed from the lucide-react import list and from the JSX (the "Most popular" Badge in the Growth pricing tier no longer has a Sparkles icon, just the text). Also removed 5 other unused lucide imports (`ArrowDown`, `Download`, `Plug`, `Star`, `Trophy`) that were dead from a prior version.

**C. MagneticButton removed** — All 3 `<MagneticButton>` instances (hero primary CTA, hero secondary CTA, final-CTA primary) replaced with plain `<Button>`. All props (`size`, `variant`, `className`, `onClick`) preserved. Removed the import.

**D. BorderBeam removed** — All 4 `<BorderBeam />` elements removed (pipeline callout GlowCard, pricing popular GlowCard, final-CTA GlowCard, CompanyMockup GlowCard). Removed the import.

**E. PulseBadge removed** — All 3 `<PulseBadge>` instances replaced with native `<span>` pills using the same color tokens:
- Hero "For Companies · Hiring Mode" (emerald) → `<span className="...border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">`
- Pipeline callout "The killer automation" (emerald) → same emerald pill
- Proctoring spotlight "Proctoring & integrity" (amber) → `<span className="...border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">`
Removed the import.

**F. All em dashes (—) removed** — 16 instances replaced with periods, commas, or colons:
- `"automatically — no manual data entry"` → `"automatically. No manual data entry"`
- `"High — gut feel"` → `"High. Gut feel"`
- `"manual filter — and we saved"` → `"manual filter, and we saved"`
- `"the platform — we would have"` → `"the platform. We would have"`
- `"project depth — never name"` → `"project depth. Never name"`
- `"Question Set Manager — add aptitude"` → `"Question Set Manager. Add aptitude"`
- `"Enterprise is custom — talk to us"` → `"Enterprise is custom. Talk to us"`
- `"ranked leaderboard — no scheduling"` → `"ranked leaderboard. No scheduling"`
- `"final shortlist — without scheduling"` → `"final shortlist. Without scheduling"`
- `"the login URL + deadline — all in 2 seconds"` → `"the login URL + deadline. All in 2 seconds"`
- `"Three strikes — tab switch ... anomaly — and the test"` → `"Three strikes: tab switch ... anomaly, and the test"`
- `"leaderboard — ✅ Clean / ⚠️ Flags / 🚫 Penalty"` → `"leaderboard. Clean / Flags / Penalty"` (emojis also dropped)
- `"Hit us up — we'll get back"` → `"Hit us up. We'll get back"`
- `"final shortlist — automated"` → `"final shortlist. Automated"`
- JSDoc comment `"sees —"` → `"sees."`

**G. Harsh button gradients removed** — All `bg-gradient-to-r from-violet-500 to-fuchsia-500` (with `hover:from-violet-400 hover:to-fuchsia-400`) replaced with solid `bg-violet-500 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600`. Applied to: hero primary CTA, pipeline "See the leaderboard" button, pricing popular-tier CTA, final-CTA primary button, footer "Get Sales" button.

**H. Decorative gradients removed** — All non-button `bg-gradient-to-*` patterns replaced with solid colors to match the prep landing's zero-gradient standard:
- Feature icon container: `bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20` → `bg-violet-500/10`
- Testimonial avatars + footer logo + mockup candidate avatars: `bg-gradient-to-br from-violet-500 to-fuchsia-500` → `bg-violet-500`
- Billing toggle active pill: `bg-gradient-to-r from-violet-500 to-fuchsia-500` → `bg-violet-500`
- Mockup progress-bar fill + "Shortlist & Send Invites" pill: gradient → `bg-violet-500`
- Testimonial card `bg-gradient-to-br` with `t.accent` → removed (dropped the `accent` field from TESTIMONIALS data)
- Two decorative `absolute inset-0 bg-gradient-to-br` overlay divs (pipeline callout, final CTA) → removed entirely

**I. Gradient text + glow removed** — All 12 `gradient-text` class instances replaced with `text-violet-500 dark:text-violet-400`. The single `text-glow` class (hero headline) removed.

**J. Glow shadow removed** — `FloatingChip` `shadow-2xl` → `shadow-sm`. No `shadow-[0_0_...]` patterns existed in the file.

**K. Light/dark token consistency** — Section bands, card borders, and backgrounds updated from dark-mode-only (`border-white/5`, `bg-white/[0.01]`) to dual tokens (`border-black/10 dark:border-white/10`, `bg-black/[0.02] dark:bg-white/[0.02]`) matching the prep landing pattern. `hover:text-white` → `hover:text-foreground`. Accent text colors paired with `dark:` variants for light-mode readability.

### Preserved (unchanged)
- **`CompanyLanding` named export** — verified present at line 257.
- **All 11 `useNav` navigation calls** — `company-register`, `candidate-leaderboard`, `proctoring-review`, `company-landing` (×3), `apply`, `admin-dashboard` all intact.
- **All sections** — hero, ROI stats, pain points, bento features, automation pipeline, comparison table, proctoring spotlight, logo cloud, testimonials, pricing (3 tiers + monthly/yearly toggle), FAQ accordion, final CTA, footer, and the floating CompanyMockup dashboard preview.
- **All data constants** — COMPANY_LOGOS, ROI_STATS, PAIN_POINTS, FEATURES, PIPELINE_STEPS, COMPARISON, TESTIMONIALS, PRICING, FAQ (only the cosmetic `accent` field was dropped from TESTIMONIALS).
- **All interactivity** — billing toggle state, FAQ accordion state, scroll-to-pipeline, mockup floating chips animation.
- **GlowCard, Marquee, SectionHeading, StaggeredReveal, revealItem** primitives — kept (not in the banned list); only their className props were restyled.

### Verification (all passing)
| Check | Result |
|---|---|
| `bun run lint` | exit 0, 0 errors ✓ |
| `rg "AuroraBackground\|Sparkles\|MagneticButton\|BorderBeam\|PulseBadge" src/components/screens/admin/landing.tsx` | no matches ✓ |
| `rg "—" src/components/screens/admin/landing.tsx` | no matches ✓ |
| `rg "bg-gradient-to\|gradient-text\|text-glow\|shadow-\[" src/components/screens/admin/landing.tsx` | no matches ✓ |
| `rg "^export function CompanyLanding"` | present ✓ |
| `rg -c "useNav"` | 1 import + 11 `set(...)` calls ✓ |
| dev server | `GET / 200` (compiled successfully) ✓ |
