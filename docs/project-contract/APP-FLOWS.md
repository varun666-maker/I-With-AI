# Application Flows and Screen Contracts

Version: 2.2.0  
Status: Canonical replacement contract

## 1. Global navigation rules

- Production screens use URL routes, not only Zustand screen state.
- A route is never an authorization boundary; every API repeats authorization.
- Company routes require an authenticated company membership and tenant predicate.
- Candidate routes require a valid application-scoped session.
- Strict assessment routes suppress ordinary navigation and browser back behavior.
- The server decides the active round, timer, question, qualification, and submission state.
- Every screen implements loading, empty, error, retry, expired-session, and reconnect states where relevant.

## 2. Hiring Mode state rules

### Campaign lifecycle

```text
draft -> published -> closed -> archived
```

Published question, scoring, and proctoring configuration is immutable. Deadline
changes require an audited operation.

### Candidate lifecycle

```text
applied -> invited -> authenticated -> system_checked
-> round_1 -> round_1_result -> round_2 -> round_2_result
-> round_3 -> completed
```

Disabled rounds are skipped by the server. A failed qualification gate ends the
candidate journey. A submitted round cannot be reopened or retaken.

### Strict proctoring

The campaign stores the policy. A policy may define warning-only behavior,
three-strike auto-submit, stricter auto-disqualification, penalties, and event
types. The browser displays policy state but cannot decide or apply it.

## 3. Company/Admin flow

```text
company landing
  -> registration or login
  -> admin dashboard
  -> create draft campaign
  -> configure rounds and questions
  -> publish application link
  -> review applications/leaderboard
  -> review integrity evidence
  -> record final decisions
  -> generate and send offers
```

### 3.1 Company landing

Frontend: public recruiter marketing page, product benefits, workflow, pricing
information, FAQ, and registration/login CTAs. Pricing is informational in the
academic release; no checkout is built.

Backend: public configuration and aggregate marketing statistics only. Never
return tenant or candidate data.

States: normal, public-content unavailable, reduced-motion, mobile layout.

### 3.2 Company registration

Frontend: company name, admin name/email, password confirmation, validation,
loading, duplicate/error states, email-verification state, and redirect.

Backend: transactionally create `user`, `company`, `company_member`, session,
verification token, and audit event. Hash passwords and rate-limit registration.

Success: authenticated admin reaches the tenant dashboard. Failure leaves no
partial company account.

### 3.3 Company login

Frontend: email/password, forgot password, session-expired handling, and
company-context redirect.

Backend: verify credentials, membership, company status, and session. Reject
suspended tenants, rotate/refresh secure cookies, rate-limit attempts, and audit
success/failure without logging secrets.

### 3.4 Admin dashboard

Frontend: campaign KPIs, campaign table, search/filter, quick actions, live
activity, integrity summary, empty state, and realtime updates.

Backend: tenant-scoped aggregates for campaigns, applications, completed rounds,
active sessions, and integrity flags. Provide cursor pagination and a realtime
activity stream.

### 3.5 Campaign creation

Frontend: draft wizard for name, role, experience, deadline, enabled rounds,
round counts, weights, cutoffs, interview type, strictness, anti-abuse rules,
summary, save draft, publish confirmation, link, and QR/share view.

Backend: validate and persist a draft; validate weights and thresholds; assign
round positions; create an unguessable public slug; publish transactionally;
version configuration; freeze published content; audit every mutation.

States: draft, validation error, saving, published, expired, closed, and
configuration conflict.

### 3.6 Question set manager

Frontend: campaign-scoped aptitude/coding tabs, create/edit/delete, preview,
visible/hidden tests, limits, CSV template/download/import, row errors, and
published-lock state. Python, JavaScript, and C++ are the initial coding
languages. SQL question type is disabled until the SQL runner phase is enabled.

Backend: CRUD question drafts, validate answer/options/tests, import CSV through
an idempotent job, version questions, attach questions to campaign rounds, and
create an immutable published snapshot.

### 3.7 Candidate leaderboard

Frontend: searchable/paginated candidate table, sources, ATS/job-fit, round
scores, qualification, integrity, live status, shortlist controls, invite
controls, missing-email correction, CSV/PDF export, and realtime refresh.

Backend: tenant-scoped application query, server-calculated ranking and
qualification, shortlist rule execution, credential/invite creation, idempotent
email jobs, export jobs, and audited mutations. The browser never calculates a
final ranking.

### 3.8 Bulk resume upload

Frontend: PDF/DOCX/ZIP selection, size/count validation, resumable progress,
per-file statuses, missing-field correction, duplicate warnings, partial
failure state, and add-to-leaderboard confirmation.

Backend: secure upload, ZIP path-traversal protection, extraction, resume
analysis jobs, deduplication, application creation, missing-field workflow,
retries, and import audit record. Processing continues if the browser closes.

### 3.9 Proctoring review

Frontend: candidate summary, integrity calculation view, event timeline, severity
filters, private screenshot/media viewer, confirm/dismiss actions, penalty/DQ
confirmation, appeal status, and save state.

Backend: ingest events, apply campaign policy, calculate strikes/penalties,
store private evidence references, issue signed URLs, record review decisions,
process appeals, and audit every action.

### 3.10 Final selection and offer

Frontend: candidate score breakdown, AI suitability note, verdict display,
decision selector, regenerate note, version history, exports, offer composer,
PDF preview, sending state, sent/failed state, and duplicate-send prevention.

Backend: generate validated AI notes asynchronously; store provider metadata;
persist human decisions as versions; require selected state before offer; create
private PDF; queue email idempotently; track delivery; export reports and audit
trails. AI cannot choose the final decision.

## 4. Candidate flow

```text
public apply or admin import
  -> candidate login
  -> force password change
  -> system check and consent
  -> candidate dashboard
  -> aptitude
  -> aptitude result
  -> coding
  -> coding result
  -> AI interview
  -> final read-only result
```

### 4.1 Public apply

Frontend: campaign header, deadline/status, name/email/phone, PDF/DOCX resume
upload, validation, submit progress, duplicate/closed-campaign errors, and
acknowledgement state.

Backend: resolve public campaign slug, reject closed/expired campaigns, create a
deduplicated application, store resume privately, queue analysis, create public
candidate ID, and send acknowledgement.

### 4.2 Candidate login

Frontend: candidate ID/password, campaign context, invalid/expired credential
states, and password-change redirect.

Backend: verify application-scoped credentials, create candidate session, check
revocation/expiry and campaign state, and audit access.

### 4.3 Force password change

Frontend: new/confirm password, strength rules, mismatch feedback, submit
loading, and blocked navigation until complete.

Backend: validate and hash password, clear temporary-password flag, rotate session
if necessary, and audit the change.

### 4.4 System check and consent

Frontend: browser, microphone, camera, fullscreen, network/device checks,
permission recovery, consent policy display, progress, and continue lock.

Backend: record consent version, device-check result, application context,
proctoring session, enabled capture modes, and session token. Do not unlock a
strict round until all required checks pass.

The browser permission prompt and the AI/storage consent are separate events.
The required product copy is:

- System prompt: `Allow [App Name] to access your camera and microphone to
  enable real-time features?`
- Explicit opt-in: `By clicking continue, you agree to allow [App Name] to
  process your voice and video streams using artificial intelligence models.
  Your data will be encrypted and stored to improve your experience. You can
  revoke this consent at any time in your settings.`

If a deployment processes strictly in real time, the checkbox must use the
versioned real-time-only deletion wording instead of the storage wording.

### 4.5 Candidate campaign dashboard

Frontend: company/role, server countdown, enabled-round cards, current status,
integrity status, continue action, logout, and no-retake warning.

Backend: return only this candidate's campaign state, deadline, round unlocks,
attempt status, and allowed next action. Never trust a client-provided round ID.

### 4.6 Candidate aptitude test

Frontend: server-provided questions, server timer display, answer navigator,
autosave, bookmarks if enabled, fullscreen lock, warnings, strike display,
manual submit, timer submit, and reconnect recovery.

Backend: create one immutable attempt, choose the campaign question snapshot,
persist answers, reconcile time, ingest proctoring events, apply policy, perform
one idempotent submission, score, and decide qualification.

### 4.7 Candidate aptitude result

Frontend: immutable score, category breakdown, pass/fail, integrity status,
qualification message, and continue/exit action. No retake control.

Backend: return a candidate-safe result projection, persist round completion,
and unlock coding only when the configured rule passes.

### 4.8 Candidate coding test

Frontend: assigned problem list, randomized display order if configured, problem
statement, editor, Python/JavaScript/C++ selector, custom input, run, one final
submit per problem, hidden-test-safe results, round timer, strict proctoring,
and locked editor after submission.

Backend: assign immutable problems, persist drafts, execute code in an isolated
runner, enforce language/version/time/memory/network policy, store runs, enforce
one final submission, calculate solved count/score, and auto-submit on timer or
policy threshold.

### 4.9 Candidate coding result

Frontend: per-problem result summary, solved count, score, cutoff, integrity,
continue-to-interview only when qualified, and terminal failure state.

Backend: persist immutable result, calculate qualification, unlock interview
transactionally, and hide hidden tests and other candidates.

### 4.10 Candidate AI interview

Frontend: confirmation, production 3D avatar, voice, live transcript, webcam
recording indicator, question timer, progress, integrated code editor for coding
questions, whiteboard for design questions, strict warning/auto-submit states,
reconnect, end-early confirmation, processing, and completion.

Backend: server-authoritative interview state machine; campaign-specific
question selection; STT/TTS/LLM routing; interruption; transcript; code;
whiteboard; media chunks; strict timer; proctoring; reconnect; auto-submit; and
report job creation.

### 4.11 Candidate final result

Frontend: read-only completion screen, round scores, integrity state, hidden
overall/rank/peer data, support/appeal action, and logout.

Backend: return a candidate-safe projection, store final snapshot, create appeal
records, enforce read-only access, and prevent cross-application access.

## 5. Super Admin control plane

```text
superadmin login -> MFA -> dashboard
  -> companies
  -> users/candidates
  -> AI usage
  -> global questions
  -> system configuration
  -> audit logs
  -> infrastructure health
```

Super Admin is a platform operator, not a company member. Every privileged
request requires a separate role check, a privileged session, and an audit log.

### 5.1 Super Admin login and MFA

Frontend: dedicated login, password-reset request, MFA challenge, loading/error
states, suspicious-login message, and session-expiry handling.

Backend: verify privileged account, enforce MFA, create a short-lived privileged
session, rate-limit attempts, record IP/user-agent hashes, and audit success,
failure, reset, and logout.

### 5.2 Super Admin dashboard

Frontend: platform KPIs, system status, event pulse, navigation cards, degraded
service alerts, and links to active incidents/jobs.

Backend: aggregate students, companies, campaigns, applications, interviews,
resumes, AI usage, queues, and health checks. Values come from PostgreSQL and
health adapters, never hardcoded mock counters.

### 5.3 Company management

Frontend: tenant search, status/filter, company details, campaign/application
summary, suspend/reactivate confirmation, and read-only tenant support view.

Backend: list/update company status, revoke admin sessions when suspended,
preserve in-flight candidate sessions according to policy, block public links,
and audit every action. Support views must not bypass tenant predicates; they
use explicit privileged context.

### 5.4 User and candidate management

Frontend: cross-role search, user details, candidate application/round summary,
password reset, suspend, export/delete request, and link to audit history.

Backend: search users and applications by authorized fields, reset credentials,
suspend accounts, create export/deletion jobs, preserve legal/appeal holds, and
prevent destructive actions without confirmation and audit records.

### 5.5 AI usage monitor

Frontend: provider/model/module usage, latency percentiles, quota state,
rate-limit events, failures, and queue backlog. Read-only by default.

Backend: aggregate `ai_usage_events`, provider health, job status, retry counts,
and quota signals. Never expose provider secrets or raw candidate prompts by
default.

### 5.6 Global question bank management

Frontend: aptitude/coding inventory, quality metrics, version status, CSV import
preview, validation errors, reseed confirmation, job progress, and audit link.

Backend: global question CRUD/import/versioning, duplicate and quality checks,
atomic reseed jobs, campaign snapshot protection, retry/dead-letter status, and
audit records. Reseed never mutates questions already referenced by a published
campaign version.

### 5.7 System configuration and feature flags

Frontend: maintenance mode, feature flags, provider status, safe configuration
metadata, confirmation dialogs, saved/version state, and rollback visibility.

Backend: validated settings/flags with versioning, authorization, audit, and
safe rollout. Raw API keys remain in environment or a server-side secret
adapter; masked browser fields must never read actual secrets.

### 5.8 Immutable audit logs

Frontend: search, role/action/tenant/date filters, details view, pagination,
CSV export, and empty/error states.

Backend: append-only audit writes, tamper-resistant ordering, request IDs,
actor/tenant/target metadata, export jobs, and retention/legal-hold rules.

### 5.9 Infrastructure health

Frontend: service cards, latency/status, last check, degraded explanation,
manual check action, job/runner/realtime state, and safe failure display.

Backend: authenticated health adapters for PostgreSQL, Redis if enabled, object
storage, worker, realtime service, AI providers, email, and code runner. Persist
health-check summaries and audit manual checks. PostgreSQL is the only database.

### 5.10 Cross-screen privileged actions

These are required even if rendered as drawers rather than new screens:

- Read-only inspect company -> campaign -> application -> round -> session chain.
- Reset credentials and revoke sessions.
- Create data export/deletion jobs with legal-hold checks.
- Suspend/reactivate with explicit scope and reason.
- Inspect failed jobs and retry only idempotent jobs.
- View audit history before sensitive action.
- Record audited override for an exceptional correction; never edit facts silently.

## 6. Prep Mode flow

Prep Mode is the first complete product implementation. It is a private student
journey with unlimited practice, private scores, optional camera/microphone
outside voice interview, informational proctoring, and recoverable state.

```text
landing -> auth/onboarding -> dashboard -> profile/resume
-> aptitude -> coding -> AI interview -> report -> replay
```

### 6.1 Prep landing

Frontend: public hero, statistics, six feature sections, how-it-works steps,
testimonials, FAQ, cookie consent, theme, responsive layout, and Start Free
CTAs.

Backend: public configuration and aggregate metrics only. Auth links start the
student flow. No private score or candidate data is returned.

States: normal, public data fallback, cookie consent pending, reduced motion,
mobile, and offline retry.

### 6.2 Student authentication and onboarding

Frontend: signup, login, email/OTP verification, password reset, target role,
skills, education, LinkedIn/GitHub, validation, loading, and session recovery.

Backend: create student user/profile, hash credentials, verify email, issue
secure session, rate-limit auth/OTP, reset password, and persist onboarding in
transactions. Google OAuth is optional and must be a real adapter if enabled.

### 6.3 Student dashboard

Frontend: overall score/trends, skill radar, ATS card, aptitude stats, interview
history, roadmap, coding heatmap, informational usage, report download, and
quick links. Each widget has skeleton, empty, stale, error, and retry states.

Backend: aggregate only the authenticated student's profile, resume analyses,
aptitude results, coding submissions, interviews, reports, roadmap, and
informational proctoring events. Never accept client-provided scores.

### 6.4 Student profile

Frontend: personal information, avatar upload, education rows, skills,
experience/job preferences, profile completeness, save states, validation, and
privacy/visibility settings.

Backend: profile/education/skills/preferences CRUD, avatar media reference,
completeness calculation, ownership checks, and consent-aware visibility. The
profile feeds personalization but remains private unless a student applies to a
Hiring campaign.

### 6.5 Resume Hub

Frontend: upload/results/history tabs; PDF/DOCX validation; upload progress;
queued/processing/completed/failed states; ATS, job-fit, keyword, grammar,
formatting, summary, report download, history, delete, and Start Interview.

Backend: private upload session, file validation, text extraction, analysis job,
structured ATS/skill/grammar result, history, report generation, retry, and
retention/deletion. The default Prep resume-history window is 30 days after the
relevant result is available. AI failure must show queued/retry, never fake
results.

### 6.6 Aptitude Portal

Frontend: rules, timed test, results; 25-question/30-minute baseline; five
categories; navigator; bookmarks; answer autosave; explanations; optional
camera/microphone; fullscreen; re-enter prompt; and unlimited Take Again.

Backend: create repeatable attempt, choose balanced questions, persist answers
and bookmarks, reconcile server timer, score, category breakdown, explanations,
and informational fullscreen/tab events. Prep events never create strikes,
penalties, disqualification, or hiring outcomes.

### 6.7 Coding Arena

Frontend: problem list, counters, heatmap, random unsolved picker, statement,
examples, constraints, editor, custom input, Run, Submit, hidden-safe results,
autosaved drafts, AI review, fullscreen/re-entry state, success modal, and
unlimited practice.

Initial languages: Python, JavaScript, and C++. The editor must support separate
starter code, filename, syntax mode, compile/runtime errors, and limits for each
language.

SQL is **Prep Mode Phase 3**. Its future UI includes SQL editor, schema viewer,
fixture-data viewer, query results, query errors, reset database, and SQL review.
It is disabled until the PostgreSQL sandbox, read-only policy, timeout,
result-set comparator, cleanup, and security tests are complete.

Backend: problem/version service, attempt/draft service, isolated runner,
language adapters, runs, submissions, progress, and AI code-review jobs. Prep
allows unlimited runs/submissions; a successful submission marks progress but
does not create a hiring restriction.

### 6.8 AI Interview

Frontend states: setup, live, processing, done. Setup selects interview type and
checks devices. Live contains a production Three.js rigged GLB avatar, voice
controls, live transcript, waveform, timer, question progress, code editor for
coding questions, whiteboard for design questions, recording indicator, hints,
skip, explain-logic, interruption, and reconnect. Processing shows job status;
done links to report/dashboard.

Backend: create repeatable session, server timer/state machine, adaptive
questions, STT/TTS/LLM routing, interruption/cancellation, transcript,
avatar-state events, code snapshots/runs, whiteboard versions, recording chunks,
informational proctoring, reconnect, evaluation, and report job.

Prep recording capture includes webcam, microphone, screen, and avatar output
when enabled by permission and consent. The student owns access to the capture;
other student accounts and company accounts cannot view it. Media defaults to a
30-day retention deadline, and the UI exposes download/export and deletion
actions.

### 6.9 Interview Report

Frontend: report-generation state, 17 report sections, scores, resume/aptitude/
coding/interview analysis, communication/body-language data when available,
strengths, improvements, six-week roadmap, final recommendation, PDF download,
and Take Another Interview.

Backend: snapshot completed inputs, run schema-validated analysis, calculate
deterministic score inputs, persist report version/status, generate PDF, provide
private signed download, and preserve report history. Report generation is
retryable and asynchronous.

### 6.10 Interview Replay

Frontend: private video/audio player, transcript synchronized to timestamps,
click-to-seek, captions, chapter markers, AI annotations, emotion timeline,
summary, body-language highlights, and transcript-only fallback.

Backend: finalize chunked media, store transcript/annotation timestamps, create
authorized signed playback URLs, enforce retention, and permit replay only for
the owning student. If recording fails, transcript and report remain available.

The profile privacy flow also exposes `Delete Account & All Data` and `Export My
Data`. Export creates a JSON-plus-media ZIP and emails a secure expiring link
within 7 business days. Deletion queues a cross-store purge of PostgreSQL,
Cloudinary, transcripts, reports, embeddings, and derived AI metadata, completed
within 30 days unless a legal hold applies.

## 7. Shared state machines

### Interview

```text
created -> preparing -> presenting -> listening -> processing_answer
-> responding -> presenting
```

Other valid states: `evaluating_code`, `evaluating_whiteboard`,
`paused_for_reconnect`, `completed`, `emergency_exit`, `auto_submitted`, and
`failed`. Every transition is server-validated and persisted.

### Avatar

```text
idle -> thinking -> listening -> speaking -> processing -> responding
```

The browser must have a safe fallback if inference, TTS, or facial animation is
unavailable.
