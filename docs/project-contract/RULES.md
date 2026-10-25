# Project and Agent Rules

Version: 2.2.0  
Status: Canonical replacement contract

## 1. Source-of-truth rules

1. Read all files in this directory before coding.
2. Treat the current frontend as a visual specification and prototype, not as a production backend contract.
3. Treat the latest owner decisions as authoritative over old screenshots, comments, and mock strings.
4. If two requirements conflict, stop, record the conflict, and update these documents before implementation.
5. Never silently invent a product behavior.

## 2. Scope rules

1. Implement Prep Mode first: student profile, resume, aptitude, coding, interview, report, and replay.
2. Implement Hiring Mode after the completed Prep Mode foundation is stable.
3. SQL is Prep Phase 3 and must remain feature-gated until its sandbox exists.
4. Python, JavaScript, and C++ are the initial code-execution languages.
5. Billing is not part of the academic release.
6. Do not add MongoDB.
7. Do not make a paid service mandatory for local development or the academic release.
8. Use WSL2 and PostgreSQL 16 as the first local baseline; do not block work on Docker.
9. Use the configured SMTP provider for required email flows; Mailpit is optional only.
10. Use private Cloudinary objects through a storage adapter; never expose unsigned public media URLs.

## 3. Frontend rules

1. Use route-backed screens in production.
2. Do not use localStorage as the authority for scores, attempts, timers, roles, permissions, or submissions.
3. Every server-backed screen has loading, empty, error, retry, and expired-session states.
4. Do not render hidden tests, private evidence, peer data, or unauthorized PII.
5. Forms use typed validation and display server field errors.
6. Realtime UI reconciles from server sequence/state after reconnect.
7. Strict assessment UI must not offer a client-only bypass.
8. Keep accessibility, keyboard operation, reduced motion, responsive layouts, and safe media permission UX.

## 4. Backend rules

1. Every request authenticates and authorizes at the boundary.
2. Every company query includes a tenant predicate.
3. Every candidate query includes application ownership and campaign predicates.
4. Use PostgreSQL transactions for publication, attempts, submissions, qualification, decisions, and offers.
5. Use idempotency keys for retries and client double-clicks.
6. Do not return secrets, raw tokens, hidden tests, or raw private media.
7. Audit sensitive mutations.
8. Never trust client timers, scores, round IDs, candidate IDs, or qualification values.

## 5. Hiring rules

1. Published campaign configuration is immutable through versioned snapshots.
2. The server controls candidate order, timers, unlocks, qualification, and submission.
3. Candidate cannot retake or reopen a submitted round.
4. Proctoring policy is campaign configuration, not a hardcoded frontend rule.
5. AI suitability notes never make the final hiring decision.
6. Candidate-facing result projections must hide overall score, rank, and peer data.
7. Offers require an explicit human-selected decision.

## 6. AI rules

1. Provider adapters are server-side only.
2. Every AI output is schema-validated and versioned.
3. Store provider, model, prompt version, status, latency, and usage metadata.
4. AI failures become visible queued/retry/fallback states, not fake success.
5. Local realtime inference and Gemini analysis are selected through configuration.
6. Do not claim a model, avatar, voice, or animation SDK is production-ready before benchmark and license review.
7. Approved baseline adapters are faster-whisper small, Kokoro, optional Chatterbox, and Gemini analysis.

## 6A. Super Admin rules

1. Super Admin requires MFA and a privileged session separate from ordinary user sessions.
2. Super Admin can operate across tenants only through explicit server-side commands.
3. Company, candidate, application, attempt, interview, job, and health data are paginated and redacted by default.
4. Suspension, reset, deletion, export, retry, configuration, and override actions require confirmation, reason, idempotency, and audit.
5. Raw provider secrets never enter browser responses, logs, audit details, or PostgreSQL settings values.
6. Super Admin must not silently edit published campaign snapshots, completed attempts, scores, evidence, or decisions.
7. Health checks must represent PostgreSQL, optional Redis, storage, workers, realtime, AI, email, and runner; never MongoDB.

## 7. Realtime and media rules

1. FastAPI owns long-lived interview sessions and state transitions.
2. Commands are idempotent and events are sequenced.
3. Reconnect restores PostgreSQL-backed state.
4. Media uses private object references, resumable upload, checksum, retention, and signed URLs.
5. Prep capture includes webcam, microphone, screen, and avatar output only after both browser permissions and explicit AI/storage consent.
6. Students can access their own Prep recordings only; no other student or company account may receive them.
7. Default Prep media and resume-history retention is 30 days after result availability.
8. Account deletion must purge database, object storage, and derived AI data within 30 days and prevent future training use.
9. Data export must produce a machine-readable ZIP and email a secure link within 7 business days.
5. Recording failure must not destroy transcript, score, or completed assessment state.

## 8. Code execution rules

1. Never execute candidate code in Next.js, FastAPI, or a worker without isolation.
2. Disable network access and constrain CPU, memory, time, processes, filesystem, and output.
3. Persist run metadata and result; never reveal hidden test inputs.
4. SQL requires an isolated PostgreSQL sandbox and is disabled before Prep Phase 3.

## 9. Change rules

1. Make small vertical changes, completing the current Prep screen/module before starting Hiring work.
2. Do not rewrite unrelated dirty files.
3. Do not commit or create branches unless explicitly requested.
4. Update `TASKS.md` and `AGENT-MEMORY.md` after meaningful work.
5. Do not call a mock, placeholder, or hardcoded result production-ready.

## 10. Required verification

Before marking a task complete:

- Run targeted unit/integration tests.
- Run typecheck/lint/build where configured.
- Verify tenant and candidate isolation.
- Verify retry/idempotency behavior.
- Verify loading/error/reconnect states.
- Verify no secret appears in browser bundles or logs.
- Update documentation and report known limitations.
