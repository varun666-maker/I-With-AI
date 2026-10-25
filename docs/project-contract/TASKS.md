# Implementation Tasks

Version: 2.2.0  
Status: Canonical replacement contract

Status values: `todo`, `in_progress`, `blocked`, `done`.
No task is `done` without its acceptance criteria and tests.

## Gate 0

### CONTRACT-001 — Approve the replacement contract

Read this directory and approve the product scope, screen contracts, data
model, architecture, rules, and implementation order.

### CONTRACT-002 — Approve assets and runtime defaults

Record avatar asset/license, image/video mapping, local STT/TTS/LLM/facial model
versions, recording scope, retention, WSL2/PostgreSQL 16 topology, SMTP
delivery, and Cloudinary private-media configuration. Benchmark the GTX 1650
4 GB before declaring a model production-ready.

### CONTRACT-003 - Run the first contract acceptance test

Verify email/password registration, email verification, password reset, SMTP
delivery, private Cloudinary upload, two-layer camera/microphone/AI-storage
consent, all four Prep capture streams, owner-only replay, 30-day retention
metadata, export ZIP/link delivery within seven business days, and deletion
purge tracking within 30 days. Record target jurisdiction separately before a
public launch; do not invent legal compliance claims.

## Foundation

### FOUND-001 — Create service boundaries

Create web/BFF, FastAPI realtime, worker, isolated runner, shared contracts,
and a repeatable WSL2 service setup. Docker Compose is optional parity.

### FOUND-002 — Validate environment

Implement typed startup validation, safe configuration errors, `.env.example`,
and secret redaction.

### FOUND-003 — Replace demo schema

Create PostgreSQL migrations for `BACKEND-SCHEMA.md`; the demo User/Post schema
must not remain the application authority.

### FOUND-004 — Implement identity and sessions

Implement student, company admin, candidate, and Super Admin authentication,
verification, password reset, secure cookies, and session revocation.

### FOUND-005 — Implement authorization

Implement roles, company tenant guards, candidate application guards, privileged
MFA guards, and isolation tests.

### FOUND-006 — Implement API/error/audit primitives

Implement correlation IDs, typed errors, validation, pagination, idempotency,
and append-only audit writes.

### FOUND-007 — Implement jobs and storage

Implement retryable jobs, dead-letter state, private Cloudinary-backed storage,
signed URLs, checksums, retention metadata, export ZIP jobs, deletion purge, and
cleanup. Acceptance requires SMTP delivery for verification, reset, and export
links; 30-day Prep retention; seven-business-day export completion; and a
cross-store deletion purge completed within 30 days.

### FOUND-008 — Add fixtures and test harness

Seed students, campaigns, questions, and users for tests without using fixtures
as production responses.

## Prep Mode first implementation

### PREP-001 — Student auth and onboarding

Connect the auth/onboarding screen to real user/session/profile APIs with
verification, reset, loading, and failure states.

### PREP-002 — Student profile

Implement profile, education, skills, preferences, avatar upload, completeness,
privacy, and persistence.

### PREP-003 — Student dashboard

Implement private dashboard aggregates, score trend, resume/aptitude/coding/
interview history, roadmap, heatmap, and empty/error states.

### PREP-004 — Resume hub

Implement upload/history/results, extraction, AI analysis job, structured result,
report download, retry, deletion, and retention.

### PREP-005 — Repeatable aptitude

Implement rules/test/results, server timer, question selection, autosave,
scoring, explanations, retry, and informational proctoring events.

### PREP-006 — Coding Arena core

Implement problem list/editor/drafts/runs/submissions/reviews for Python,
JavaScript, and C++ using an isolated runner and durable progress.

### PREP-007 — Prep interview runtime

Implement repeatable interview state machine, text transcript, adaptive
questions, hints, skip, explain-logic, code editor, whiteboard, reconnect, and
server timers.

### PREP-008 — Production voice and avatar

Implement local STT/TTS adapters, hybrid AI routing, Three.js GLB avatar,
avatar states, interruption, audio/viseme fallback, and GPU-worker fallback.

### PREP-009 — Prep media and report

Implement consent, recording chunks, finalization, report job, 17-section report,
PDF, private replay, transcript synchronization, and retention. Capture webcam,
microphone, screen, and avatar output only after the two consent layers pass;
provide student-only playback, export, and deletion controls.

### PREP-010 — Prep completion gate

Verify the complete student journey: auth -> profile -> resume -> aptitude ->
coding -> interview -> report -> replay. No Prep task may be marked complete
until this gate passes.

## Prep Mode Phase 3

### PREP-011 — SQL problem authoring

Add versioned SQL problem content, schema, fixtures, expected result metadata,
and admin validation without enabling execution.

### PREP-012 — SQL sandbox runner

Implement isolated PostgreSQL sandbox, read-only enforcement, mutation blocking,
timeouts, resource limits, result comparison, cleanup, and escape tests.

### PREP-013 — SQL editor and review

Enable SQL editor/schema/data UI, query results, SQL scoring, SQL AI review, and
feature-flagged rollout only after runner acceptance.

## Hiring Mode after Prep completion

### HIRE-C-001 — Company registration/login

Implement tenant creation, membership, secure company login, suspension handling,
and audit.

### HIRE-C-002 — Admin dashboard

Implement tenant-scoped KPIs, campaign list, activity, integrity summary, and
realtime updates.

### HIRE-C-003 — Campaign lifecycle

Implement draft/publish/close/archive, versioned snapshots, rounds, weights,
cutoffs, interview configuration, and proctoring policy.

### HIRE-C-004 — Question manager

Implement campaign question CRUD, validation, CSV import, versioning, and
published locks. Do not enable SQL execution before PREP-012/013.

### HIRE-C-005 — Public application

Implement public campaign links, application, resume upload, deduplication,
acknowledgement, and expiry.

### HIRE-C-006 — Leaderboard and invitations

Implement candidate search/pagination, scores, qualification, shortlist rules,
invites, realtime activity, and exports.

### HIRE-C-007 — Bulk resume import

Implement secure PDF/DOCX/ZIP import, extraction, AI analysis, corrections,
deduplication, retry, and leaderboard insertion.

### HIRE-C-008 — Strict candidate assessment

Implement candidate login, forced password change, system check, consent,
server-controlled aptitude, result, Python/JavaScript/C++ coding, result, and
no-retake qualification gates.

### HIRE-C-009 — Strict realtime interview

Reuse the Prep interview engine with campaign timer, proctoring policy,
recording, code, whiteboard, voice/avatar, reconnect, auto-submit, and report.

### HIRE-C-010 — Proctoring, decisions, and offers

Implement review evidence, appeals, penalties, versioned decisions, AI notes,
human confirmation, offer PDF, email job, and delivery state.

## Super Admin control plane

### OPS-001 — Super Admin MFA and privileged sessions

Implement privileged authentication, MFA, short-lived sessions, rate limits,
logout/revocation, and audit coverage.

### OPS-002 — Company and tenant operations

Implement company search, details, suspend/reactivate, public-link blocking,
session effects, and read-only support view.

### OPS-003 — User, candidate, and assessment support

Implement cross-tenant authorized lookup, credential reset, session revocation,
application/round/session detail, export/deletion requests, and legal holds.

### OPS-004 — Global content and platform controls

Implement global question import/version/quality/reseed, feature flags,
maintenance mode, versioned configuration, and secret-safe settings.

### OPS-005 — AI, jobs, and infrastructure health

Implement usage dashboards, quota/rate-limit visibility, failed-job controls,
and health adapters for PostgreSQL, storage, workers, realtime, AI, email, and
code runner.

### OPS-006 — Immutable audit operations

Implement append-only audit search, filters, pagination, export jobs, retention,
and legal-hold behavior.

## Launch verification

### LAUNCH-001 — Security verification

Run tenant isolation, role bypass, CSRF, upload abuse, signed-media, and runner
escape tests.

### LAUNCH-002 — Realtime/media verification

Test reconnect, duplicate commands, chunk recovery, incomplete media, and
session recovery.

### LAUNCH-003 — Deployment and backup

Document Docker deployment, migrations, restore, retention cleanup, health
checks, rollback, and clean-environment setup.

## Completion standard

A task is complete only when its frontend, backend, migration, authorization,
tests, failure behavior, observability, and documentation are present. A mock
timer, hardcoded success, localStorage score, or decorative API call does not
satisfy a task.
