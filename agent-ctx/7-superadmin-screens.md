# Task ID: 7 · Agent: superadmin-screens

## Task
Build the 8 frontend screens for the Super Admin section of the AI Interview
Assistant SaaS. Each screen is a named-export React component under
`src/components/screens/superadmin/`, using the dark-mode design language
established in `landing.tsx` (Aurora background, GlowCard, PulseBadge,
gradient text, Framer Motion entrances).

## Work Log
- Read `worklog.md`, `primitives.tsx`, `top-nav.tsx`, `store.ts`, `landing.tsx`
  and the spec section (lines 1128–1335 of the pasted spec) to understand the
  design language, available primitives, navigation IDs and the exact mock
  data required for each screen.
- Verified the available shadcn UI primitives, `recharts`, `framer-motion`,
  `zustand`, `lucide-react` and `next-themes` are installed. Verified that
  `Switch`, `Select`, `Dialog`, `Table`, `Progress`, `Input`, `Button` are
  importable from `@/components/ui/*`.
- S1 — `SuperAdminDashboard`: 8 StatCards (Students 12,450 / Companies 23 /
  Campaigns 47 / Interviews 8,320 / Resumes 18,200 / Gemini 45,000 /
  DB Health ✅ / Redis Health ✅) in a responsive 2×4 / 4×2 grid, a 24h
  platform-pulse sparkline (recharts AreaChart), plus 7 navigation cards
  (Companies, Users, AI Usage, Questions, System, Audit, DB Health) that call
  `set("superadmin-…")` on click.
- S2 — `CompanyManagement`: 5-row company table (Acme Corp, TechStart,
  OldCorp, InnovateCo, LegacyLabs) with Suspend/Reactivate buttons that open
  a confirmation Dialog and flip the row status, plus a View button that
  navigates to `admin-dashboard`. Includes a 3-card KPI strip and a recent
  activity feed.
- S3 — `UserManagement`: debounced (300ms) search bar with a live "syncing /
  synced" indicator, 6 users across all four roles, per-row actions
  (View → audit, Reset PW → email dialog, Suspend (admins) / Delete
  (others) → danger GDPR dialog with the exact required copy). Role-coloured
  PulseBadge per row.
- S4 — `AIUsageMonitor`: 4 StatCards (342 / 15k requests, 1.2M / 1M tokens ⚠️,
  2.3s avg, 5 rate-limit hits), a stacked horizontal BarChart showing usage
  share per module (Resume 45% / Q&A 30% / Code 12% / Report 8% / Seed 5%),
  a per-module BarChart with custom-cell colours, and a recent rate-limit
  events list with timestamps (5 entries with soft/hard severity badges).
- S5 — `QuestionBankAdmin`: aptitude table (5 categories with counts, ✅
  badges and a totals row), coding table (DSA 210 / SQL 105 with totals),
  4 summary StatCards, a 3-card quality-metrics block (avg 12.3, never-used
  234, over-used 45), and a "🔄 Reseed All Questions" danger button that
  opens the exact-spec confirmation Dialog and runs a mock progress bar
  while "calling Gemini".
- S6 — `SystemConfig`: settings table with Maintenance Mode (Switch),
  Default Proctoring Strictness (Select: Lenient/Standard/Strict/Paranoid),
  Email Provider (Select: Resend/SES/Postmark/Mailgun), Resend API Key
  (masked `rsk_…` + Update button that reveals a password input + Save),
  From Email (inline Input), Gemini API Key (masked `AIza…` + Update), and
  a feature-flags grid with 5 Switches (Resume Analyzer / Aptitude / Coding /
  AI Interview / Hiring Mode). A "Save changes" button at the bottom records
  a timestamp.
- S7 — `AuditLogs`: 4 StatCards, a 4-column filter bar (user search + Role
  Select + Action Select + From/To date range), a 7-row audit table with
  coloured Action badges per type, and a working "Export CSV" button that
  actually downloads a CSV blob of the filtered rows. Footer shows "Showing
  X of Y entries".
- S8 — `DatabaseHealth`: 4 StatCards, a 6-card grid of component status
  (PostgreSQL ✅ 12ms, MongoDB ✅ 8ms, Redis ✅ 3ms, Cloudinary ✅, Piston ✅
  running, Celery ✅ 2 active) with tone-coloured icon tiles, a 4-row table
  sizes table with utilization bars + totals row, a "Run Full Health Check"
  button that runs an animated progress bar, and a recent health-check log
  list with tone-coloured dots.
- Ran `bun run lint` — 0 errors. The two warnings reported are in
  `src/components/screens/prep/aptitude.tsx` and
  `src/components/screens/prep/dashboard.tsx`, both owned by another agent —
  not my files.
- Checked `/home/z/my-project/dev.log` — Next.js dev server is healthy,
  compiling on every save with no errors.

## Stage Summary
### Files created (all under `src/components/screens/superadmin/`)
1. `dashboard.tsx` → exports `SuperAdminDashboard`
2. `companies.tsx` → exports `CompanyManagement`
3. `users.tsx` → exports `UserManagement`
4. `ai-usage.tsx` → exports `AIUsageMonitor`
5. `questions.tsx` → exports `QuestionBankAdmin`
6. `system.tsx` → exports `SystemConfig`
7. `audit.tsx` → exports `AuditLogs`
8. `db-health.tsx` → exports `DatabaseHealth`

### Notes
- The `/agent-ctx` root directory was not writable (permission denied), so
  this work record is mirrored at `/home/z/my-project/agent-ctx/7-superadmin-screens.md`.
- All 8 screens start with `"use client";`, use `useNav` from `@/lib/store`,
  wrap in `<AuroraBackground>` + `<PageWrap>`, use `StatCard`/`GlowCard`/
  `PulseBadge`/`SectionHeading`/`StaggeredReveal`/`revealItem` from
  `@/components/shared/primitives`, and use shadcn `Switch`/`Select`/`Dialog`/
  `Table`/`Progress`/`Input`/`Button` plus lucide-react icons. recharts is
  used for the AI-usage stacked bar, the per-module bar chart and the
  dashboard sparkline.
- No `indigo` or `blue` Tailwind colours are used. Palette is strictly
  violet / fuchsia / sky / cyan / emerald / teal / amber / orange / rose /
  pink / slate / white, matching the established design language.
- No existing files outside `src/components/screens/superadmin/` were
  modified. No Next.js route files were created.
