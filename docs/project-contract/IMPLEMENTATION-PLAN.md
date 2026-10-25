# Implementation Plan

Version: 2.2.0  
Status: Canonical replacement contract

## 1. Delivery strategy

Build vertical slices. A slice includes the screen, route, typed client, API,
authorization, PostgreSQL migration, worker/realtime behavior, loading/empty/
error/reconnect states, tests, observability, and documentation.

Prep Mode is the first complete product task. Hiring Mode and Super Admin reuse
its stable identity, assessment, code runner, interview, media, report, and job
foundations.

## 2. Release/build terminology

Phase 1 is the first production release. It includes Prep core, Hiring core,
realtime voice, realistic 3D avatar, recording, whiteboard, and interview code
editor. The work is staged below but no Phase 1 requirement is silently removed.

SQL is **Prep Mode Phase 3** and is feature-gated until its isolated PostgreSQL
runner is complete.

## 3. Gate 0: contract and assets

Deliver:

- Owner-approved contract.
- Avatar GLB/glTF asset and license review.
- Supplied image/video mapped to avatar style and behavior.
- STT/TTS/LLM/facial-animation benchmark plan for GTX 1650 4 GB.
- Recording scope, consent text, retention policy, and deletion policy.
- WSL2/PostgreSQL 16 topology and environment variable contract; Docker is optional.
- SMTP email delivery contract and Cloudinary private-media contract.
- Two-layer consent, 30-day default retention, seven-business-day export, and
  30-day deletion-purge contract.

Exit criteria: no unresolved requirement is hidden as an assumption.

## 4. Foundation slice

Implement:

- Next.js web/BFF, FastAPI realtime, worker, runner, and shared contracts.
- Environment validation and secret redaction.
- PostgreSQL migrations, seed fixtures, and transactional repositories.
- Student/company/candidate/Super Admin identity and secure sessions.
- Roles, tenant guards, application guards, MFA primitives, and audit primitives.
- Typed API errors, correlation IDs, idempotency, pagination, and jobs.
- Private object-storage adapter and signed URLs.
- Test harness and a repeatable WSL2 setup; optional Docker parity may follow.

Exit criteria: all roles authenticate; tenant/candidate isolation tests pass;
migrations, seed, jobs, and local services are repeatable.

## 5. Prep Mode Phase 1A: student foundation

Implement in order:

1. Student auth and onboarding.
2. Student profile, education, skills, preferences, and avatar.
3. Student dashboard data contract.

Exit criteria: a student can register, complete profile, refresh, log out, and
see a PostgreSQL-backed dashboard shell with correct empty/error states.

## 6. Prep Mode Phase 1B: resume and aptitude

Implement:

- Resume upload/history/results.
- PDF/DOCX extraction and private media storage.
- AI resume analysis job and structured result.
- Repeatable aptitude attempt, server timer, autosave, score, explanations, and result history.
- Informational proctoring events with no penalties.

Exit criteria: a student completes profile -> resume -> aptitude repeatedly with
recoverable state and no mock result source.

## 7. Prep Mode Phase 1C: Coding Arena

Implement:

- Problem list, filters/progress, and random unsolved selection.
- Problem/attempt/draft APIs.
- Isolated Python, JavaScript, and C++ runners.
- Runs, hidden-test-safe results, submissions, progress, and AI code review.
- Fullscreen/reconnect behavior and unlimited Prep submissions.

Exit criteria: a student can solve, run, submit, review, refresh, reconnect,
and see durable progress for all three languages.

## 8. Prep Mode Phase 1D: realtime interview

Implement:

- Server interview state machine and repeatable Prep sessions.
- Text transcript, adaptive questions, hints, skip, and explain-logic.
- In-interview code editor and whiteboard persistence.
- Local STT/TTS adapters and hybrid AI router.
- Three.js rigged avatar, avatar states, audio/viseme fallback, interruption, and reconnect.
- Recording chunks, consent, report job, report screen, and replay.

Exit criteria: a student completes an interview with transcript, voice response,
avatar behavior, code/whiteboard artifacts, report, and replay after refresh or
temporary disconnect.

## 9. Prep Mode Phase 2: expansion and hardening

Implement more question content, model optimization, provider fallback,
performance improvements, report quality, richer replay annotations, and
accessibility/performance hardening without changing the core contracts.

## 10. Prep Mode Phase 3: SQL Coding Arena

Implement only after Phase 1C is stable:

- SQL problem authoring/versioning.
- Per-attempt PostgreSQL sandbox/schema/fixture loading.
- Read-only policy and mutation blocking.
- Statement timeout, resource limits, and cleanup.
- Deterministic result-set comparison.
- SQL editor/schema/data UI and SQL AI review.

Exit criteria: malicious or mutating SQL cannot escape its sandbox or change
shared data; correct and incorrect result sets are deterministic.

## 11. Hiring Mode after Prep foundation

### Company slice

Company registration/login, dashboard, campaign lifecycle, question manager,
public application link, leaderboard, bulk resume import, proctoring review,
final selection, decisions, exports, and offers.

### Candidate slice

Public apply, scoped credentials, forced password change, system check, campaign
dashboard, strict aptitude, result, strict Python/JavaScript/C++ coding, result,
qualification gates, and candidate-safe final result.

### Realtime Hiring slice

Reuse the interview state machine with strict campaign policy, no retakes,
server timers, proctoring, voice/avatar, recording, code, whiteboard, report,
and reconnect.

Exit criteria: a company creates a campaign and one candidate completes it with
strict server-controlled behavior and reviewable evidence.

## 12. Super Admin control plane

Implement after foundation and before final production launch:

- MFA and privileged sessions.
- Company/user/candidate/application/assessment support.
- Suspension/reactivation, resets, exports, deletion jobs, and legal holds.
- Global question management and quality/reseed jobs.
- AI usage, jobs, provider status, and feature flags.
- Maintenance mode, safe configuration metadata, audit export, and infrastructure health.

Exit criteria: every privileged mutation is authorized, confirmed, idempotent,
audited, and reversible where policy permits; raw secrets never reach the UI.

## 13. Launch hardening

Run security, tenant-isolation, runner-escape, realtime, media, load,
backup/restore, retention, data-export/deletion, and clean-deployment tests.

## 14. Review gates

At every gate:

1. Run targeted tests.
2. Run lint/typecheck/build.
3. Review migrations and API contracts.
4. Verify permissions and tenant isolation.
5. Verify retries, reconnect, and idempotency.
6. Confirm no mock data remains in the completed slice.
7. Update `TASKS.md` and `AGENT-MEMORY.md`.
8. Obtain owner approval before crossing a scope gate.
