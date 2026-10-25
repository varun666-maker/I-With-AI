# Build Status

As of: 2026-10-21  
Status: Active implementation log  
Source of truth: `docs/project-contract/`

This file records implementation progress only. Product requirements and
technical decisions remain authoritative in the other contract files.

## Completed

### Contract

- Canonical contract created and aligned around Prep Mode first, SQL Phase 3,
  then Hiring Mode and Super Admin.
- PostgreSQL only, WSL2-first, SMTP email, Cloudinary private media, hybrid AI,
  consent, retention, export, deletion, and runner policies are documented.

### PostgreSQL foundation

- Replaced the demo SQLite `User/Post` schema with the PostgreSQL Prisma schema.
- Applied migrations to the configured PostgreSQL database:
  - `20261015194342_prep_foundation`
  - `20261015195021_profile_preferences`
- The database smoke check confirmed the `public` schema, two completed
  migrations, and zero users/profiles before product testing.

### Authentication

- Added scrypt password hashing and secure HttpOnly session cookies.
- Added email/password registration, SMTP verification-code delivery, email
  verification, login, logout, password-reset request, and password reset APIs.
- Connected the Prep auth screen to real registration, OTP verification, login,
  and profile-completion APIs.
- Google sign-in remains intentionally disabled for the later scope.

### Prep Profile

- Added PostgreSQL APIs for profile, education, skills, dashboard aggregates,
  data export requests, and account-deletion requests.
- Connected the Profile screen's personal, education, skills, and preferences
  tabs to those APIs.
- Connected onboarding completion to persist the selected role, skills,
  education, LinkedIn, and GitHub values.
- Added a profile overview that surfaces the saved onboarding data before the
  editable tabs.
- Added owner-only export and `Delete account and all data` controls.
- Removed the development-only `Screens 44` navigator from the shared header;
  normal hamburger navigation remains available.
- Removed the floating development screen toolbar from the application shell
  and added a Student Dashboard profile shortcut to open Profile directly.
- Moved the profile shortcut into the shared Prep top navigation so it is
  available consistently across every Prep screen; removed the dashboard-only
  duplicate.

### Resume Hub first slice

- Added owner-scoped PDF/DOCX upload and history APIs with file-size, extension,
  MIME, and magic-byte validation.
- Added signed private Cloudinary upload/delete adapter, PostgreSQL media and
  resume metadata, 30-day retention metadata, and durable analysis/delete jobs.
- Connected the Resume Hub picker, upload queue state, real history list, and
  delete action; Results remains disabled until a real analysis is completed.
- Export and deletion are queued as durable jobs.

### Resume worker

- Added PDF text extraction with `pdf-parse` and DOCX extraction with `mammoth`.
- Added direct Gemini REST analysis with strict structured JSON validation and a
  versioned prompt contract.
- Added `resume_analyses` persistence for ATS, overall, job-fit, summary,
  findings, improvement plan, attempts, and failure state.
- Added atomic job claiming, stale-lock recovery, bounded exponential retries,
  idempotent completion, and protected internal worker routes.
- Added retention cleanup that removes extracted text and reports, queues
  private Cloudinary deletion, and retries failed media deletion jobs.
- Connected Results and History to real report data and added an Aptitude
  recommendation CTA alongside the interview recommendation.
- Added an owner-scoped processing trigger after upload so the uploaded resume
  is analyzed immediately in the local/monolith deployment and Results opens
  automatically after completion; the protected worker route remains available
  for scheduled production execution.
- Added Analyze/Retry actions in History for queued or failed resumes.
- The old prototype component functions remain in the profile file but are no
  longer rendered; remove them during cleanup after the live tabs stabilize.

## Validation completed

- Prisma schema validation passes.
- Prisma Client generated successfully.
- TypeScript check passes.
- Focused ESLint passes for the changed auth, profile, API, and server files.
- Read-only PostgreSQL smoke check passes.
- Local runtime check passes: frontend `GET /` returns `200`; unauthenticated
  `GET /api/v1/auth/me` returns the expected `401`.

## Not started yet

- Aptitude Portal.
- Coding Arena for Python, JavaScript, and C++.
- Prep realtime interview with voice, avatar, recording, whiteboard, and code
  editor.
- Interview report and replay.
- Prep completion gate.
- SQL Coding Arena Phase 3.
- Hiring Mode and Super Admin control plane.

## Next exact build order

1. Build the repeatable Aptitude Portal with server timers and scoring.
2. Build Coding Arena Python/JavaScript/C++ with the isolated runner.
3. Build Prep realtime interview, media, voice/avatar, report, and replay.
4. Pass `PREP-010` before starting SQL, Hiring Mode, or Super Admin work.

## Agent restart instructions

Read `README.md`, `PRD.md`, `TRD.md`, `ARCHITECTURE.md`, `APP-FLOWS.md`,
`BACKEND-SCHEMA.md`, `RULES.md`, `IMPLEMENTATION-PLAN.md`, `TASKS.md`,
`AGENT-MEMORY.md`, and this file. Continue at **Next exact build order 1**.
Do not rebuild authentication or profile from scratch, and do not start Hiring
Mode before the Prep completion gate passes.
