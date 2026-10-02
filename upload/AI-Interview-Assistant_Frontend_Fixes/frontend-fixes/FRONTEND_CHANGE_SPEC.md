# AI Interview Assistant — FRONTEND Change Specification

**Package:** 1.0 · **Date:** 2026-10-03 · **Scope: frontend only (React 18 + Tailwind + Zustand SPA shell)**
**Sources:** PRD v2.2 + screen-by-screen workflow + audit of the deployed app (38 screens, 2026-10-02).
**Status line used in every item:** `Where` = screen/component · `Change` = what to build · `Done when` = acceptance test.

> **Backend policy:** items tagged `[backend-dependent]` must ship as working UI with graceful degradation — the action fires a stubbed call; on failure it shows a queued/disabled state. Do NOT block on API availability and do NOT invent endpoints beyond the contracts named here.

---

## 0. Priority waves

| Wave | Items | Theme |
|------|-------|-------|
| **P0** | F-01 … F-05 | Broken/blocked user paths, wrong policy copy, demo leakage |
| **P1** | F-06 … F-17 | High-impact UX, role navigation, timer integrity, report alignment |
| **P2** | F-18 … F-28 | Orientation, states, guards, accessibility |
| **P3** | F-29 … F-33 | Polish, mobile hardening, empty states |

---

## 1. Ground rules — sweep the ENTIRE app for these (not just listed screens)

- **GR-1 · Three-strike copy.** The only correct texts: `WARNING 1 of 3` → `WARNING 2 of 3` → `TEST AUTO-SUBMITTED`. Anywhere that says auto-submit after "2 violations" or "2+ violations" is WRONG (warning 1, warning 2, **3rd violation auto-submits**).
- **GR-2 · Camera scoping.** Camera is REQUIRED only for the **AI interview** (both modes). Prep aptitude/coding: no camera at all. Hiring aptitude/coding: tab-switch + fullscreen-exit counters only — no webcam events, no webcam UI.
- **GR-3 · Deadline countdown colours.** green > 72 h · yellow 24–72 h · red < 24 h. Deadline always shows explicit timezone: `11:59 PM IST`.
- **GR-4 · Recommendation badge colours.** Strongly Recommend (green, 90+) · Recommend (blue, 80–89) · Conditionally Recommend (yellow, 70–79) · Not Recommend (red, < 70).
- **GR-5 · Pricing copy.** `Free forever` everywhere — student landing, company landing, pricing CTA, footer. Delete every instance of `Free for 14 days`.
- **GR-6 · Candidate ID format.** `{ROLE}-XXXXXX` — role prefix + **6** hex chars (e.g. `BACKEN-3FA82C`). Fix any 5-hex displays.
- **GR-7 · Prep vs Hiring config.** Prep = no passing score, no negative marking, unlimited retakes, no pause (informational proctoring only). Hiring = admin-set cutoffs, zero retakes, single submission, 3-strike enforcement. Never mix the two in shared components without a mode branch.

---

## 2. P0 — Critical (do first)

### F-01 · Company-admin login entry `[backend-dependent: role in auth response]`
- **Where:** `/auth` (Login tab), auth store, route guard.
- **Problem:** admins register at `/company/register` but have NO login path anywhere — after logout they are locked out permanently.
- **Change (Decision D1 = Option A):** make `/auth` role-aware. On login success read `role` from the auth response; if `company_admin` → redirect `/admin`; if `student` → `/dashboard`; candidate invites still land via `/c/:slug`. Keep `/login` and `/register` as redirect aliases to `/auth` with the corresponding tab pre-selected. Add a `Forgot password?` link that works for admins too (stub call until backend lands).
- **Done when:** an admin who logs out can log back in at `/auth` and lands on `/admin`; `/login` and `/register` redirect correctly.

### F-02 · Integrity-policy acknowledgment gate
- **Where:** between Interview Setup (system check) and the first proctored round (Hiring Mode; also Prep AI interview).
- **Problem:** candidates jump straight into a monitored test — no consent moment, which invites disputes after auto-submit.
- **Change:** one-tap rules screen/modal before the round starts: 3-strike policy (warn 1 → warn 2 → 3rd auto-submit), one attempt / no retakes, camera + mic monitored, tab focus tracked. Single `I Understand` button, checked-state stored per attempt. Keep it skippable in Prep non-proctored rounds.
- **Done when:** no proctored round can start without the acknowledgment flag being set.

### F-03 · Proctoring warning modals — exact copy + a11y
- **Where:** interview/test overlay component (z-index ~700 full-screen modals).
- **Change:** strike 1 → `WARNING 1 of 3` (continue button); strike 2 → `WARNING 2 of 3` (final-warning styling); strike 3 → `TEST AUTO-SUBMITTED` (no dismiss). Accessibility: `role="alertdialog"`, `aria-modal`, focus trap, `aria-live="assertive"` announcements for strike count and remaining time, `I Understand` auto-focused so Enter dismisses.
- **Done when:** modal texts match exactly at each strike; keyboard-only users can dismiss warnings; screen reader announces strikes.

### F-04 · Hide the Screen Navigator demo tool
- **Where:** global shell (38-screen navigator).
- **Problem:** the demo switcher is reachable in any shared deployment — recruiters/candidates can wander into every screen.
- **Change:** navigator only mounts when URL contains `?demo=1`; hidden from all UI in normal use. Deep links to views without `?demo=1` still resolve (route guard unchanged).
- **Done when:** fresh visitor sees no navigator; `?demo=1` restores it.

### F-05 · Copy conflict sweep
- **Where:** company landing, student landing, pricing CTA, candidate ID chips.
- **Change:** GR-5 (`Free forever` replaces `Free for 14 days`) + GR-6 (6-hex candidate IDs) + landing "How It Works" shows exactly **4 steps** and the final CTA is the free-forever gradient section (not a pricing push).
- **Done when:** grep finds zero `14 days` / 5-hex IDs; landing shows 4 steps + free CTA.

---

## 3. P1 — High

### F-06 · Persistent logged-in navigation per role
- **Where:** app shell.
- **Change:**
  - **Student top-nav:** Dashboard · Resume · Aptitude · Coding · Interview · Reports · Profile · theme toggle · logout.
  - **Admin sidebar:** Dashboard · Campaigns (expandable: per-campaign children — Questions, Upload, Leaderboard, Proctoring, Selection) · Settings.
  - **Candidate minimal header:** campaign name · deadline countdown · logout. No app-wide nav.
  - **Super Admin sidebar:** the 8 S-sections (Dashboard, Companies, Campaigns, Users, Audit Logs, System Config, Jobs, DB Health).
- **Done when:** each role sees exactly its own nav set; candidate never sees global nav.

### F-07 · Timer integrity — client half of server-authoritative clock `[backend-dependent: remaining-time API]`
- **Where:** Hiring aptitude/coding/interview countdowns, crash-resume path.
- **Change:** treat localStorage answers as **cache only**. On any resume/reload: fetch remaining time from server (`GET` remaining-time stub) BEFORE restoring answers, then reconcile the local countdown. Timer never counts up from a stale local value. Until the endpoint exists, freeze the countdown on resume behind a "Re-syncing time…" state instead of trusting localStorage.
- **Done when:** reloading mid-test never grants extra time; resume shows server-reconciled remaining time (or a frozen re-sync state).

### F-08 · Report screen alignment with workflow
- **Where:** `/report` (17-section report).
- **Change:** Executive Summary = **3 paragraphs**; Overall Score Table = exactly **6 rows** (Technical, Communication, Behavioral, Problem Solving, Culture Fit, Role Readiness — matching the radar chart); recommendation = one of the **4 badges** per GR-4 with range mapping; Emotion Timeline X-axis = **question number** (matches replay's per-question strip); Roadmap = **6 collapsible cards**, each with week theme, daily goal, free-resource links, milestone.
- **Done when:** report shows 3-para summary, 6-row table, one 4-badge verdict, question-based emotion timeline, 6 roadmap cards.

### F-09 · Report-generating ghost card
- **Where:** student dashboard, Recent Interviews.
- **Change (Decision D9):** while analysis is running show a **disabled ghost card** (`Report generating… usually ~60 s`) instead of hiding the button; on `REPORT_READY` (WebSocket) fade the real `Download Report` button in. Keep a subtle skeleton so users know a report is coming even if WS is slow; on WS reconnect-miss, polling fallback flips the state (stub ok).
- **Done when:** generating state is visible (not hidden), and the button appears without a manual refresh.

### F-10 · Hide live AI code review in Hiring Mode
- **Where:** coding arena (Hiring candidate flow).
- **Change (Decision D6):** candidate-facing live Gemini review panel renders **only in Prep Mode**. In Hiring Mode the panel is absent (not merely disabled) — feedback reaches candidates only via the final read-only results. Keeps quota + anti-gaming.
- **Done when:** hiring coding round has no AI-review UI; prep coding still shows it.

### F-11 · Campaign form — Interview Type selector
- **Where:** campaign creation form (Interview round section).
- **Change (Decision D3):** when the Interview round is checked, show the Interview Type dropdown with the **6 hiring-specific types** (do NOT reuse Prep's 6): Full Interview (30 min / 12 Q) · Role Specific (25 / 10) · Technical (20 / 8) · Behavioral (15 / 6) · System Design (30 / 4) · Quick Screen (10 / 5). Selection drives the per-round metadata chip. Type is fixed after creation (show an "editable-after-creation" hint per current messaging).
- **Done when:** type picker appears exactly when Interview is checked; chip reflects duration/question count.

### F-12 · Campaign weights — live sum + Auto-balance
- **Where:** campaign form weight inputs.
- **Change:** keep the live Σ display (already shows `Sigma 100%`); add an **Auto-balance** button that redistributes weights to exactly 100 and normalizes rounding. Reject save while Σ ≠ 100 with inline error.
- **Done when:** one click yields Σ = 100; save blocked otherwise.

### F-13 · Deadline timezone everywhere
- **Where:** campaign deadline picker, admin campaign card, candidate dashboard countdown, invite-email preview.
- **Change:** display `11:59 PM IST` explicitly in all four places (GR-3 colour thresholds apply to the countdown).
- **Done when:** no bare datetime without IST on any deadline surface.

### F-14 · Leaderboard per-row invite actions `[backend-dependent]`
- **Where:** admin leaderboard / candidate table rows.
- **Change:** per-row actions: **Resend Invite** · **Reset Password** · **Revoke Access** (this one behind a confirm dialog). Add an email-status chip per candidate (`sent / failed / queued`) with a **Retry** button on failed — chip data comes from the stubbed invite-status API; until it responds, chips render `queued` and Retry shows a toast "Will retry when mail service connects".
- **Done when:** all four controls render per row with confirm/toast behaviour and no console errors on failure.

### F-15 · Force-password-change gate + strength meter
- **Where:** candidate first-login flow, `/c/:slug/change-password`.
- **Change:** if the auth response has `requirePasswordChange: true` (stub field), ALL routes redirect here until changed (B3 behaviour). Add password strength meter + show/hide toggle (reuse the auth login toggle). On success route to the campaign dashboard.
- **Done when:** gated candidate cannot reach any other screen; meter and toggle work.

### F-16 · Candidate results — live score flip
- **Where:** `/c/:slug/results` read-only screen + per-round result screens (kept per Decision D7: per-round screens show **that round's score only**, never overall/rank).
- **Change:** while processing show `--/100`; subscribe to a candidate-scoped `REPORT_READY`/`PROCESSING_STEP` event (stub w/ polling fallback) and flip scores **in place** — no page revisit needed.
- **Done when:** leaving the tab open, a completed round's score appears within seconds without refresh.

### F-17 · Admin email-verification gate (UI half) `[backend-dependent: OTP send/verify]`
- **Where:** admin signup → first campaign creation.
- **Change:** after admin signup, insert a "Verify your email" step (OTP input, resend cooldown per F-27 timing). Campaign creation (especially going live) is blocked behind a verified flag (stub) with a clear banner. Do not send real mail — stub returns success after cooldown so flow is testable.
- **Done when:** unverified admin sees the gate + cannot publish a campaign; verified path proceeds.

---

## 4. P2 — Medium

### F-18 · Signup step indicator
- **Where:** `/auth` Sign Up (3-step in-place flow).
- **Change:** content swaps without navigation, so add a step indicator — 3 dots/labels `Account → Verify → Profile`, current step highlighted, completed steps checked. No route changes.
- **Done when:** every signup step shows correct position; indicator updates on step change.

### F-19 · Aptitude quick-stats bars
- **Where:** student dashboard, Aptitude Quick Stats.
- **Change:** replace current layout with **5 small horizontal bars, one per category** (latest or best score per category) + a `Take Test` link to `/aptitude`.
- **Done when:** 5 per-category bars render with an empty state (see F-26) when no attempts.

### F-20 · Remove PAUSED state
- **Where:** test runners (aptitude/coding/interview).
- **Change:** tests are never paused — remove any PAUSED UI/state. Prep Mode proctoring is informational; Hiring auto-submits on strike 3. Auto-save every 30 s covers crash recovery (verify the interval exists; add if missing).
- **Done when:** no pause control remains; a reload mid-test resumes via auto-save without pause UI.

### F-21 · Camera/mic permission help panel
- **Where:** interview setup, device-permission step.
- **Change:** after **2 failed** permission attempts show a Help panel with browser-specific grant steps (Chrome/Firefox/Safari/Edge: address-bar lock icon → site settings → allow camera & mic → retry) instead of leaving `Begin Interview` permanently disabled.
- **Done when:** two failures open the help panel; retry button re-requests permission.

### F-22 · Early-end reason (one tap)
- **Where:** live AI interview, end-interview control.
- **Change:** when the candidate ends early (before time/question completion), show a 3-option picker: `Finished` / `Too long` / `Technical issue` — then submit. Store the reason with the attempt record payload (client-side only until backend lands).
- **Done when:** early end always captures a reason; normal completion does not prompt.

### F-23 · Processing screen — upload step + fallback
- **Where:** post-interview processing screen.
- **Change:** insert an **`Uploading recording`** step BEFORE `Transcribing` (Cloudinary upload can fail and must be visible). Keep existing steps; on > 5 minutes show the existing fallback message plus a `Return to dashboard` link that leaves a **pending-report badge** on the dashboard card.
- **Done when:** upload step renders with progress; > 5-min path offers dashboard return and the pending badge shows.

### F-24 · Report mini-TOC + collapsed sections
- **Where:** 17-section report.
- **Change:** sticky mini-TOC (section numbers 1–17) on desktop, accent-highlight on scroll-past; sections 5–15 collapsed by default, 1–4 and 16–17 expanded; clicking a TOC number smooth-scrolls.
- **Done when:** TOC tracks scroll position; deep sections are collapsed on open.

### F-25 · Profile unsaved-changes guard
- **Where:** profile page, 4 tabs.
- **Change:** switching tabs with dirty state triggers a confirm dialog (`Discard changes?`) or per-field autosave with a saved indicator — pick one pattern and apply to all 4 tabs consistently.
- **Done when:** dirty edits are never silently discarded; indicator/dialog behaves identically on every tab.

### F-26 · Empty states
- **Where:** dashboard Aptitude Quick Stats, Coding heatmap, Roadmap.
- **Change:** add friendly empty states (currently only Recent Interviews has one): icon + one-liner + primary CTA (`Take your first aptitude test`, `Solve a problem to start your heatmap`, `Generate a roadmap by completing an interview`).
- **Done when:** zero-attempt accounts see all three empty states with CTAs.

### F-27 · OTP resend cooldown = fixed 5:00
- **Where:** auth OTP step, admin verification (F-17).
- **Change:** replace the non-round countdown (starts at 4:32) with a deterministic **5:00** cooldown; keep 10-minute OTP expiry semantics. Timer starts at exactly 5:00 on every send/resend.
- **Done when:** countdown always begins 5:00; resend unlocks at 0.

### F-28 · Campaign dashboard states (candidate view)
- **Where:** candidate campaign dashboard.
- **Change:** deadline countdown uses GR-3 colour thresholds; round cards show states `Locked (neutral message — never reveal why)` / `Open` / `Completed` / `Processing (-- scores)`; violations footer shows `Strikes: n/3 · Integrity: Clean` in Hiring rounds only. Sequential unlock message must never mention cutoffs (the "never-reveal" rule).
- **Done when:** all four card states + colour thresholds render; locked cards show neutral copy only.

---

## 5. P3 — Low polish

### F-29 · Per-language code buffers
- **Where:** coding arena language switcher.
- **Change:** keep a separate buffer per language — switching restores that language's last code instead of clearing. Keep the existing confirmation modal as the safety net.
- **Done when:** write code → switch → switch back = code intact.

### F-30 · First-login coach marks
- **Where:** student dashboard.
- **Change:** 4 dismissible highlights: report-button area · quick actions · radar chart · self-awareness stats. Dismissal persisted (localStorage); "Show tips" re-enables.
- **Done when:** marks show once for new users, stay dismissed, and can be re-enabled.

### F-31 · Mobile hardening for proctored rounds
- **Where:** test runners on mobile.
- **Change:** suppress pull-to-refresh / overscroll during proctored rounds (accidental refresh can count as a fullscreen-exit event); show a landscape hint on the coding round.
- **Done when:** overscroll gesture does not trigger refresh mid-test; landscape hint shows in portrait.

### F-32 · Floating widgets never cover sticky actions
- **Where:** cookie banner + support widget.
- **Change:** ensure neither overlaps the sticky `Download PDF` / `Submit Test` actions on small screens (z-order + bottom offsets); on test/report screens the widgets hide entirely.
- **Done when:** at 360 px width the sticky actions are fully clickable.

### F-33 · Landing page polish
- **Where:** public landing.
- **Change:** per F-05 + A-06: 4-step How It Works, free-forever CTA, 4-column footer (Product · Modes · Company · Legal); hero keeps deployed copy as source of truth (Decision D8).
- **Done when:** footer renders 4 columns; no pricing CTA; copy matches deployed hero.

---

## 6. Verification checklist for the Anti-AI subsystem (already built — verify, don't rebuild)

The deployed app already ships 8 undocumented detections (D-2 in findings.json). **Do not implement new detection logic.** Only verify the UI surfaces:

1. Campaign form exposes the 13 proctoring rules incl. copy/paste, right-click, DevTools-open.
2. Strictness dropdown semantics match: Relaxed = warnings only · Standard = auto-submit on 3rd strike · Strict = auto-submit + disqualify (matches D-5).
3. Detections run silently (no candidate-facing warning), queue frame+audio for human review — confirm no UI leaks a "you are being flagged" toast.
4. The Auto-DQ checkbox label reads **`Disqualify on 3rd strike`** (Decision D4 rename) — semantics: when checked, the 3rd-strike auto-submit ALSO disqualifies (overall = 0) instead of submitting with score.
5. Min Coding cutoff label reads **`Min Coding Questions to Solve Correctly`** (Decision D2 wording).

---

## 7. DEFERRED — do NOT build now (backend package later)

| Area | Items |
|------|-------|
| Database | `applicant_pool` table · `application_status` ENUM(applied, invited, in_progress, completed, disqualified) · `campaign` columns (min_aptitude_cutoff, min_coding_solved_cutoff, proctoring_strictness, interview_type, experience_band, per-round config) · `candidate_credentials` += require_password_change, password_expires_at · `audit_logs` · `system_config` |
| APIs (~18) | public `POST /apply/:slug` + campaign summary · candidate change-password + results endpoints · admin campaign CRUD/edit · apply-link/QR endpoint · bulk-upload status · applicant pool/shortlist/invite endpoints · remaining-time endpoint (F-07) · candidate-scoped WebSocket (F-16) |
| Sequential round unlock | server-side cutoff enforcement + neutral-lock message source |
| Bulk upload 3-phase | per-file processing pipeline, Celery progress, missing-email remediation (UI shell may exist — wiring later) |
| Email/OTP | Resend integration, real OTP send/verify for F-17, invite + acknowledgement emails, temp-password expiry (7 days or deadline) |
| Admin verification backend | the send/confirm API behind F-17's gate |
| Super Admin ops backend | suspend/reactivate, GDPR delete job, reseed job, maintenance mode, feature toggles, audit-log actions |
| WebSocket registry | REPORT_READY, PROCESSING_STEP, LEADERBOARD_UPDATE, PROCTORING_ALERT server emission + REST polling fallbacks |

---

## 8. Decision defaults PRE-APPLIED (change only on explicit user override)

| # | Decision | Default used in this spec |
|---|----------|---------------------------|
| D1 | Admin login path | **A** — role-aware `/auth`, redirect by role |
| D2 | Min coding cutoff | **Solve correctly** (passed cases > 0) |
| D3 | Hiring interview types | **Adopt the 6 hiring-specific types**; Prep's 6 unchanged |
| D4 | Auto-DQ checkbox | **Disqualify on 3rd strike** (overall = 0), renamed label |
| D5 | Anti-AI scope | **Verify what is built** (P0) + privacy notice + human review — see §6 |
| D6 | AI code review in Hiring | **Admin-report-only** — hidden from candidates |
| D7 | Per-round results | **Keep** per-round screens; round score only, never overall/rank |
| D8 | Landing copy | **Deployed copy** is source of truth |
| D9 | Report-generating state | **Ghost card** + fade-in on REPORT_READY |
| D10 | Free-trial copy | **Free forever** everywhere |
| D11 | PRD versioning | PRD edited in place, keeps v2.2 — *not a frontend task; listed for completeness* |

---

## 9. Final acceptance sweep

- [ ] Zero occurrences of "2 violations"/"2+ violations" auto-submit copy anywhere (GR-1)
- [ ] Zero occurrences of "Free for 14 days" (GR-5)
- [ ] `/auth` serves admin login; admin logout→login round-trip works (F-01)
- [ ] No proctored round starts without acknowledgment (F-02)
- [ ] Strike modals exact texts + focus trap + aria-live (F-03)
- [ ] Screen navigator hidden without `?demo=1` (F-04)
- [ ] All four role navigations correct (F-06)
- [ ] Reload mid-test never grants time (F-07)
- [ ] Report: 3-para summary, 6-row table, 4 badges, question-based emotion timeline, 6 roadmap cards (F-08)
- [ ] Hiring coding round has no AI-review panel (F-10)
- [ ] Campaign form: interview type picker, Σ=100 + Auto-balance, IST deadlines (F-11/F-12/F-13)
- [ ] Leaderboard rows: Resend / Reset / Revoke + status chip + Retry (F-14)
- [ ] Force-password-change gate blocks all routes (F-15)
- [ ] Candidate results flip live from `--` (F-16)
- [ ] OTP cooldown exactly 5:00 (F-27)
- [ ] No PAUSED state anywhere; 30 s auto-save verified (F-20)
- [ ] Empty states on all three dashboard widgets (F-26)
- [ ] Mobile 360 px: sticky actions never covered (F-32)

