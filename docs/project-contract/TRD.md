# Technical Requirements Document

Version: 2.2.0  
Status: Canonical replacement contract

## 1. Required system shape

Build a modular monolith with explicit boundaries:

```text
Browser
  -> Next.js web/BFF (HTTPS)
  -> FastAPI realtime service (WebSocket/WebRTC coordination)
  -> Worker service (AI, media, reports, imports, email, cleanup)
  -> PostgreSQL (durable truth)
  -> optional Redis (ephemeral queues/cache/rate limits only)
  -> private object storage adapter
  -> isolated code runner
  -> AI provider adapters
```

The first environment is WSL2 with PostgreSQL 16 and host-run services. Docker
Compose is optional infrastructure parity and must not be required for local
development. Every external adapter must have a local implementation or a
documented free development substitute.

## 2. Web application

- Next.js 16.x as installed in the repository.
- React 19.x and TypeScript.
- Existing Tailwind and UI primitives may be reused.
- Zustand is allowed for view state, draft UI state, and connection state only.
- TanStack Query or an equivalent typed data layer owns server cache and invalidation.
- Zod validates browser-facing request and response payloads.
- URL routes replace the prototype-only global screen registry for production.
- Three.js and GLTF/GLB loading render the avatar in the browser.

## 3. Backend services

### Next.js web/BFF

Owns public pages, route protection, session cookies, normal REST/BFF endpoints,
CSRF protection, and typed proxying. It does not own long-lived interview
connections, heavy inference, or code execution.

### FastAPI realtime service

Owns interview WebSocket/WebRTC coordination, server-authoritative interview
state transitions, heartbeat/reconnect, transcript/event streaming, audio session
coordination, and realtime authorization.

### Worker

Owns resume extraction, AI analysis, report/PDF generation, media finalization,
CSV imports, bulk resume processing, email, cleanup, and retryable jobs.

### Super Admin control plane

Uses the same web/BFF and database boundaries with a separate privileged session
and role guard. It may inspect or operate across tenants only through explicit
audited commands. It never receives raw provider secrets or silently mutates
completed assessment facts.

### PostgreSQL

Owns users, tenants, campaigns, applications, attempts, scores, submissions,
interviews, consent, proctoring, decisions, offers, audit records, and job state.

### Redis

Optional and ephemeral. It may provide a queue, rate limit counter, heartbeat,
or transient cache, but it is never the only copy of a durable fact.

## 4. API requirements

All APIs use versioned JSON contracts and a common error shape:

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "safe_user_message",
    "request_id": "correlation-id",
    "field_errors": {}
  }
}
```

Requirements:

- Validate every request and response.
- Use cursor pagination for large lists.
- Require idempotency keys for registration, submissions, invitations, decisions, offers, and jobs.
- Return `request_id` on every response.
- Never return hidden tests, passwords, provider keys, raw tokens, or unauthorized PII.
- Use optimistic concurrency/version checks for campaign configuration and decisions.

Core API groups:

- `/api/v1/auth`
- `/api/v1/companies`
- `/api/v1/campaigns`
- `/api/v1/applications`
- `/api/v1/assessments`
- `/api/v1/questions`
- `/api/v1/proctoring`
- `/api/v1/media`
- `/api/v1/interviews`
- `/api/v1/reports`
- `/api/v1/decisions`
- `/api/v1/offers`
- `/api/v1/admin`

Exact route names may evolve, but ownership and authorization rules may not.

## 5. Realtime protocol

Every command includes `command_id`, `session_id`, and a client sequence. Every
event includes `event_id`, `session_id`, `sequence`, `occurred_at`, and origin.

Required event categories:

- `session.started`
- `session.state_changed`
- `question.presented`
- `candidate.audio.started`
- `candidate.audio.chunk`
- `candidate.audio.ended`
- `candidate.transcript.partial`
- `candidate.transcript.final`
- `candidate.code.changed`
- `candidate.code.run_requested`
- `candidate.code.run_completed`
- `candidate.whiteboard.saved`
- `interviewer.thinking`
- `interviewer.response.started`
- `interviewer.response.audio`
- `avatar.state_changed`
- `proctoring.event`
- `session.autosaved`
- `session.reconnected`
- `session.submitted`
- `session.failed`

Duplicate commands must be safe. Reconnect resumes from the last acknowledged
sequence and server state, not browser guesses.

## 6. AI provider interfaces

Implement provider interfaces before concrete providers:

- `InterviewLLMProvider`
- `AnalysisProvider`
- `SpeechToTextProvider`
- `TextToSpeechProvider`
- `FacialAnimationProvider`

Initial approved direction:

- Gemini adapter for server-side analysis where approved.
- faster-whisper small for local STT.
- Kokoro baseline for lightweight local TTS; Chatterbox is an optional expressive GPU adapter.
- Browser viseme/timestamp fallback when facial animation inference is unavailable.
- Local realtime LLM adapter is configurable and benchmarked against the 4 GB GTX 1650.

No model version, license, or provider assumption may be hidden in application
code. Store provider, model, prompt version, latency, token usage, and status.

## 7. Media and recording

- Use browser MediaRecorder where supported.
- Request explicit camera/microphone/recording consent.
- Capture webcam, microphone, screen, and avatar output for Prep interviews when
  the corresponding permission and explicit AI/storage consent are active.
- Upload chunks with resumable upload state.
- Use the Cloudinary adapter initially with private/authenticated objects; keep
  the storage interface provider-neutral for later S3-compatible migration.
- Store object references and checksums in PostgreSQL, never raw media blobs.
- Generate short-lived signed URLs for authorized playback.
- Record codec, duration, upload status, and retention deadline.
- Cleanup expired media through an idempotent worker.
- If recording fails, preserve transcript and score data where possible.
- Default Prep media and resume-history retention is 30 days after the relevant
  result is available. Account deletion starts a cross-store purge completed
  within 30 days, subject to legal holds; deleted data is excluded from future
  model training.
- Data export is a retryable job that creates a JSON-plus-media ZIP and sends a
  short-lived link by SMTP within 7 business days.

The UI must show two distinct consent layers:

1. Browser permission prompt: `Allow [App Name] to access your camera and
   microphone to enable real-time features?`
2. Explicit checkbox: `By clicking continue, you agree to allow [App Name] to
   process your voice and video streams using artificial intelligence models.
   Your data will be encrypted and stored to improve your experience. You can
   revoke this consent at any time in your settings.`

The storage wording must be selected from a versioned policy; if a deployment
uses real-time-only processing, it must show the alternate deletion wording
before recording starts.

## 7A. Email delivery

Email verification, password reset, export links, and required product
notifications use the configured SMTP provider through the worker. The initial
academic configuration uses the owner-provided SMTP service. Mailpit is not a
required dependency. Delivery attempts are idempotent, rate-limited, logged as
safe metadata, and retried through the job system without storing provider
passwords in PostgreSQL.

## 8. Code execution

Candidate code never executes in the Next.js or FastAPI request process.

### Initial runtimes

- Python 3.12
- JavaScript on Node.js 22 LTS
- C++20 on GCC 13 or an approved compatible toolchain

Each runner must enforce language version, CPU, memory, wall-clock timeout,
output limit, filesystem isolation, process limit, and disabled network access.
Persist source hash, language, runtime, limits, status, output metadata, and
failure reason. Hidden tests never return their inputs.

Initial non-SQL limits are one CPU, 256 MiB memory, 5 seconds wall time, 64 MiB
output, disabled network, and an isolated temporary filesystem. These are
server policy defaults, not client-controlled values, and must be benchmarked
before launch.

### SQL Phase 3

SQL is disabled until a separate PostgreSQL sandbox adapter supports database
cloning/reset, schema and fixture loading, read-only policy, statement timeout,
result-set comparison, mutation blocking, and cleanup.

## 9. Security requirements

- HttpOnly, Secure, SameSite cookies.
- CSRF protection for cookie-authenticated mutations.
- Argon2id or bcrypt password hashing, used consistently.
- Tenant predicates on every company query.
- Candidate application predicate on every candidate query.
- Rate limits for authentication, uploads, AI, code runs, media, exports, and email.
- Secure headers and CSP.
- Redact credentials, tokens, raw audio, transcripts, and sensitive PII from logs.
- Signed URLs expire and are authorization-checked before creation.
- Audit sensitive mutations.

## 10. Performance and resilience

- Non-AI API p95 target: 500 ms locally under normal development load.
- Code execution returns within five seconds or an explicit timeout state.
- AI work queues when capacity is unavailable.
- Realtime heartbeat and exponential reconnect backoff are mandatory.
- Jobs use bounded retries and dead-letter status.
- Health endpoints distinguish ready, degraded, and unavailable.
- A GPU worker outage cannot corrupt interview state.

## 10A. Super Admin technical requirements

- MFA is required for privileged login and sensitive actions.
- Company, user, candidate, application, attempt, session, job, and health lookups are paginated and filtered server-side.
- Suspension revokes applicable login sessions and blocks new access without deleting historical data.
- Export, deletion, reset, retry, configuration, and override actions require idempotency, confirmation, authorization, and audit metadata.
- Feature flags and maintenance mode are versioned and rollback-safe.
- Secret fields in the UI are write-only metadata controls; raw keys are never returned to the browser.
- Health checks use adapters and store status/latency summaries in PostgreSQL.
- Audit export is a server job for large ranges, not an unbounded browser query.

## 11. Local WSL2 services

Required local processes are the Next.js web/BFF, FastAPI realtime service,
worker, isolated code runner, and PostgreSQL 16. Redis is optional and may be
added for ephemeral queues/rate limits. Cloudinary is the configured media
adapter; MinIO is not required. Docker Compose files may be added later for
reproducible deployment, but the application must run without Docker on WSL2.

## 12. Testing

- Unit: validators, state machines, scoring, timers, policy, and authorization.
- Integration: PostgreSQL transactions, tenant isolation, jobs, provider adapters, media metadata, and runner protocol.
- Realtime: ordering, duplicate commands, reconnect, interruption, cancellation, and recovery.
- E2E: company campaign, candidate assessment, and student Prep journey.
- Security: role bypass, tenant escape, upload abuse, runner escape, CSRF, rate limits, and signed media access.
- Load: concurrent candidate sessions, leaderboard refresh, media uploads, and code runs.

## 13. Observability

Every request, job, runner invocation, and interview session carries a
correlation ID. Record latency, status, retries, provider/model usage, realtime
connections, media progress, runner outcomes, and slow queries without raw
secrets or candidate content by default.
