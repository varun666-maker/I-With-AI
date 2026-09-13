# Task 5 — admin-screens work log

**Task:** Build 8 Company Admin screens (A1–A7 + A5b) for the AI Interview
Assistant SaaS frontend. Dark-mode, violet→fuchsia gradient design language
matching `landing.tsx`, glass cards, Framer Motion entrances.

## Work Log

- Read `worklog.md`, `primitives.tsx`, `top-nav.tsx`, `store.ts`,
  `landing.tsx`, and the screen-by-screen spec (lines 463–833 of the pasted
  content file) to absorb the design language, naming convention, available
  primitives, and the detailed spec for each Company Admin screen.
- Surveyed available shadcn/ui components in `src/components/ui/` and read
  the `select`, `dialog`, `tabs`, `slider`, `checkbox`, `radio-group`,
  `dropdown-menu`, `table`, and `badge` source to confirm exact prop APIs.
- Built the 8 screens in the order A1 → A7 (skipping A5b ahead of A6/A7):
  - `register.tsx` — centered registration card with show/hide password
    toggles, inline validation (email format, password length, confirm
    match), mock submit → navigate to `admin-dashboard`.
  - `dashboard.tsx` — 4 `StatCard` KPIs + quick-action grid + searchable
    campaign table whose rows route to `candidate-leaderboard`; right-rail
    live activity + integrity summary.
  - `campaign-new.tsx` — two-phase component (form → success). Phase 1
    includes round toggles, weight sliders with `Σ %` validation
    (disables submit if ≠ 100), qualification cutoffs, proctoring
    strictness dropdown, auto-DQ checkboxes, live summary panel. Phase 2
    shows animated spring checkmark, campaign details card, gradient-bordered
    Apply Link Box with URL + Copy + Copy-with-caption buttons and a
    deterministic 21×21 SVG-based QR placeholder (no external library).
    Buttons route to `question-manager` and `candidate-leaderboard`.
  - `questions.tsx` — two-tab manager. Tab 1 (Aptitude): category &
    difficulty dropdowns, sub-topic, question, 4 inline option rows with
    radio + correct highlight, explanation, Add + Bulk Upload CSV +
    Download-template. Tab 2 (Coding): title, difficulty, type radio
    (DSA/SQL), markdown statement, function signatures, visible/hidden test
    counts, time/memory limits, and a conditionally-shown SQL Schema Setup
    field when `SQL` is chosen. Lists below each form show all entries.
  - `candidates.tsx` — State 4 post-shortlist leaderboard. Top stats bar
    (Total / Shortlisted / Invited / Completed) + amber notification banner
    + auto-shortlist panel (method dropdown with 8 options + preview count
    + eligible count) + 3 source tabs (All / Apply Link / Bulk Upload).
    Table with: checkbox, rank, name+ID, source badge, job-fit progress,
    ATS, email (inline editable for missing), aptitude, qualification
    check, coding (locked when qualification failed), interview (live
    badge), overall, integrity badge (clean/flags/penalty), status.
    Bottom: Refresh + Export CSV + Export PDF ZIP.
  - `bulk-upload.tsx` — three-phase component via `useState` (upload →
    processing → results). Phase 1: info card + drag-drop dropzone +
    selected file list + Upload & Analyze button. Phase 2: animated
    progress bar + per-file row with `done / active / wait` status +
    seconds remaining. Phase 3: summary (✅ fully extracted / ⚠️ needs
    input) + manual-fix cards with AI-extracted row + required fields
    (email, name) + Save button that turns each card ✅ + collapsible
    fully-extracted list + Discard all + Add-all-to-leaderboard (disabled
    until all fixed → routes to `candidate-leaderboard`).
  - `proctoring.tsx` — candidate info bar (name, ID, scores, integrity),
    integrity score breakdown card (base 100 → -15 tab → -12 phone → -9
    copy-paste), summary card (events/open/confirmed + recommendation),
    timeline table (Time / Round / Event / Severity / Screenshot View),
    per-event Dismiss / Confirm action buttons that update row styling.
    View action opens a Dialog with a stylized webcam-frame placeholder
    showing the flagged phone with bounding box + REC timestamp.
  - `selection.tsx` — final selection leaderboard with per-row
    DropdownMenu decision selector (Selected / Waitlisted / Rejected /
    Pending) tinted to match decision, per-row notes Textarea, 4
    SummaryCards at top (Selected/Waitlisted/Rejected/Pending), bottom
    Save decisions + Export CSV + Export PDF ZIP + a footer card showing
    selected count and PDF ZIP explanation.
- Each file starts with `"use client";`, exports the EXACT named component
  requested in the spec, uses `useNav().set(...)` for routing, imports from
  `@/components/shared/primitives` and `@/components/ui/*`, and uses only
  `lucide-react` icons. No `indigo` or `blue` Tailwind colors were used.
- Verified with `bun run lint` — 0 errors / 0 warnings in any of the 8
  admin files I created (only pre-existing warnings in `prep/aptitude.tsx`
  and `prep/dashboard.tsx` remained).
- Per the task instructions, did NOT modify `src/app/page.tsx`,
  `globals.css`, `layout.tsx`, or any file outside
  `src/components/screens/admin/`. The main agent will wire the screens
  into the Zustand router.

## Stage Summary

Files created (all under `/home/z/my-project/src/components/screens/admin/`):
1. `register.tsx`        → exports `CompanyRegister`       (Screen A1)
2. `dashboard.tsx`       → exports `AdminDashboard`        (Screen A2)
3. `campaign-new.tsx`   → exports `CampaignCreate`        (Screen A3)
4. `questions.tsx`       → exports `QuestionManager`        (Screen A4)
5. `candidates.tsx`     → exports `CandidateLeaderboard`  (Screen A5 — State 4)
6. `bulk-upload.tsx`    → exports `BulkUpload`             (Screen A5b — 3 phases)
7. `proctoring.tsx`     → exports `ProctoringReview`       (Screen A6)
8. `selection.tsx`      → exports `FinalSelection`         (Screen A7)

No screens pending. All 8 build clean, lint clean, and are wired through
the `useNav` store to one another and back to the landing page.
