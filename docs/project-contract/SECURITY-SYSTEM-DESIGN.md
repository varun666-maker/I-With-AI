# Security and System Design Baseline

Version: 1.0.0  
Status: Canonical engineering baseline for all modules

This document applies to Prep Mode, SQL Phase 3, Hiring Mode, and Super Admin.
It supplements `ARCHITECTURE.md`, `TRD.md`, and `RULES.md`; it does not change
the product order or PostgreSQL-only decision.

## 1. Architecture principles

1. Start as a modular monolith with explicit domain boundaries. Split workers,
   realtime, GPU inference, and runners only behind stable interfaces.
2. PostgreSQL is the source of truth for identity, permissions, attempts,
   scores, jobs, audit records, and retention state.
3. External systems are adapters: Cloudinary private media, SMTP, Gemini,
   local voice/vision models, and isolated code runners.
4. Slow or retryable work uses the durable `jobs` table with an idempotency key,
   lease/lock timestamp, attempt count, delayed retry, and terminal failure.
5. Every write has a clear owner, transaction boundary, audit event, and
   deletion/retention behavior before its UI is considered complete.

## 2. Request security

Every API route must:

- Authenticate at the boundary and authorize against the resource owner,
  tenant, campaign, or explicit Super Admin capability.
- Validate route parameters, query values, JSON, multipart metadata, and body
  sizes with a server-side schema; never trust client IDs or scores.
- Reject untrusted origins for cookie-authenticated state-changing requests.
- Use idempotency keys for retries, double-clicks, webhooks, submissions, and
  job creation.
- Return safe error codes and messages; never return tokens, provider keys,
  private storage keys, hidden tests, raw prompts, or stack traces.
- Set `Cache-Control: no-store` for authenticated API responses.

## 3. Identity and authorization

- Sessions are opaque, HttpOnly, Secure in production, SameSite, expiring, and
  revocable; passwords use a slow password hash.
- Email verification and password reset tokens are single-use, hashed at rest,
  short-lived, and rate limited.
- Student resources always include `ownerUserId` in the database predicate.
- Hiring resources always include company/campaign/application predicates.
- Super Admin uses separate MFA-protected privileged sessions and audited
  explicit commands; ordinary student sessions cannot reach admin actions.

## 4. Files, media, and privacy

- Accept only an allowlisted extension, MIME type, magic signature, and bounded
  request/file size. Normalize names and never use user filenames as storage
  authority.
- Store media privately behind an adapter. Browser responses expose metadata,
  not storage credentials or permanent public URLs.
- Verify downloaded worker bytes against the stored size limit before parsing.
- Record checksum, owner, retention deadline, deletion reason, and provider.
- Delete database text, derived reports, object storage, and future-training
  references together through a durable cleanup job.
- Keep Prep resume/media retention configurable; default is 30 days.

## 5. AI and worker safety

- Provider calls run server-side only. Keys exist only in environment secrets.
- Treat uploaded resume, candidate answers, and transcripts as untrusted input;
  do not grant model tool access from user content.
- Require schema validation, score bounds, prompt version, provider, model,
  status, latency/usage metadata, and retry state for every AI result.
- Use bounded timeouts, bounded input/output sizes, stale-lock recovery,
  exponential backoff, and a terminal failure state.
- Never create fake scores when a provider fails. Show queued, retrying, or
  failed states and allow a safe retry.

## 6. Assessment and runner boundaries

- Server owns timers, attempt status, round transitions, qualification,
  submissions, and final scores.
- Candidate code runs outside the web/API process in an isolated no-network
  sandbox with CPU, memory, process, filesystem, timeout, and output limits.
- SQL is disabled until the isolated PostgreSQL sandbox and reset policy exist.
- Hidden tests, private evidence, peer data, and internal ranking are never
  sent to candidate browsers.

## 7. Observability and operations

- Emit structured logs with request/job IDs, feature, outcome, latency, and
  safe error codes; redact email, tokens, prompts, media keys, and secrets.
- Audit uploads, deletes, exports, AI completion/failure, admin mutations,
  assessment submissions, decisions, and overrides.
- Monitor PostgreSQL, storage, worker queue age, retry rate, AI availability,
  SMTP, realtime, and runner health independently.
- Use bounded pagination, indexes for owner/tenant/status/time queries, and
  retention cleanup for logs and derived data.

## 8. Delivery checklist

Before merging a module, verify:

1. Happy path, loading, empty, error, retry, expired-session, and retention
   states exist in the UI.
2. Unauthorized, cross-owner, cross-tenant, duplicate, oversized, malformed,
   replayed, and concurrent requests are rejected safely.
3. Transactions, idempotency, job retries, stale locks, and cleanup are tested.
4. Typecheck, focused tests, Prisma validation/migration, build, and security
   checks pass.
5. No secret appears in source, browser bundles, logs, fixtures, or docs.
