# System Architecture

Version: 2.2.0  
Status: Canonical replacement contract

## 1. Architectural style

Use a modular monolith first. Keep domain boundaries explicit so realtime,
workers, GPU inference, and code runners can split later without changing the
frontend contract.

```text
Browser
  | HTTPS REST/BFF
  | WebSocket/WebRTC
  v
Next.js web/BFF -------- FastAPI realtime
  |                           |
  +-------------+-------------+
                v
           PostgreSQL
                |
       Worker / job dispatcher
        |       |       |
      Redis  Media   Code runner
               |
          AI provider adapters
```

## 2. Bounded contexts

### Identity

Users, credentials, sessions, email verification, password recovery, MFA, and
role claims.

### Tenancy and hiring

Companies, memberships, campaigns, rounds, question snapshots, applications,
candidate credentials, decisions, and offers.

### Assessment

Aptitude questions/attempts, coding problems/attempts, code runs, scoring,
qualification, and result projections.

### Interview runtime

Interview sessions, state transitions, question selection, transcript turns,
voice, avatar events, code snapshots, whiteboards, evaluation, reports, and replay.

### Integrity and privacy

Consent, system checks, proctoring sessions/events, evidence, penalties,
appeals, recording references, retention, and deletion.

### Operations

Jobs, notifications, AI usage, audit logs, settings, health, and feature flags.

### Super Admin control plane

Privileged access to tenant, user, candidate/application, question, usage,
configuration, audit, and health operations. The control plane is not a second
source of truth; it invokes the same domain services with elevated, explicitly
audited authorization.

## 3. Authority model

PostgreSQL is authoritative for all durable facts. The server is authoritative
for identity, tenant access, campaign configuration, timers, questions, attempts,
scores, qualification, submissions, interview state, proctoring decisions, and
final hiring decisions.

The browser is a rendering cache. Zustand may hold UI state but never authorizes
or finalizes an action.

## 4. Request ownership

- Next.js: public pages, browser-facing APIs, session cookies, and normal CRUD.
- FastAPI: long-lived interview connections, realtime commands, state transitions, and media session coordination.
- Worker: slow/retryable processing.
- PostgreSQL: durable facts and transactional consistency.
- Redis: temporary queue/cache/rate-limit data only.
- Object storage: private resume, recording, evidence, PDF, and avatar assets.
- Code runner: isolated execution only.

The first local topology runs under WSL2 with PostgreSQL 16. Cloudinary is the
initial private media adapter and SMTP is the required email adapter. Docker,
MinIO, and Mailpit are optional development conveniences, not production
assumptions or local prerequisites.

## 5. Hiring command authority

For every candidate command:

1. Authenticate the session.
2. Resolve the application and campaign.
3. Read current server state.
4. Validate allowed action, timer, policy, and idempotency key.
5. Write the durable result in a transaction.
6. Emit a sequenced event.
7. Return the accepted state or a safe rejection.

The candidate cannot choose a campaign, round, score, timer, question, or
qualification result by editing a URL or browser payload.

## 5A. Super Admin authority

Super Admin can inspect all product domains and perform only documented
operations: suspend/reactivate, reset credentials, create export/deletion jobs,
manage global content/configuration, retry safe jobs, review health, and record
audited exceptional overrides. It cannot silently rewrite completed attempts,
published campaign snapshots, scores, evidence, or hiring decisions.

Every privileged command stores actor, role, tenant, target, reason, request ID,
before/after summary, and timestamp in `audit_logs`.

## 6. Campaign immutability

Draft campaign configuration is mutable. Publishing creates a versioned snapshot
of rounds, questions, weights, cutoffs, interview settings, and proctoring
policy. Candidate attempts reference that snapshot. Later admin edits create a
new draft/version and do not mutate in-progress or completed assessments.

## 7. Interview architecture

```text
Browser command/audio
  -> FastAPI authorization/state machine
  -> context builder
  -> local realtime provider or approved fallback
  -> validated structured response
  -> PostgreSQL event/turn persistence
  -> transcript/audio/avatar events
```

Slow analysis and report generation use a worker. Voice/animation outages fall
back to text and browser-side avatar behavior without corrupting the session.

## 8. Code runner architecture

The API creates a run record and sends a constrained job to the runner. The
runner creates an ephemeral workspace, applies language policy, executes with
network disabled, captures bounded output, destroys the workspace, and returns a
signed result to the API. The API persists the result and emits status.

SQL Phase 3 uses an isolated PostgreSQL database/schema per run or attempt,
fixture versioning, read-only transaction policy, query timeout, result-set
comparison, and guaranteed cleanup.

## 9. Media architecture

The browser requests an upload session, sends chunks to the storage adapter,
finalizes with checksum/metadata, and sends only the media reference to the API.
Playback creates an authorization-checked short-lived signed URL. PostgreSQL
stores metadata and references, not media bytes.

The media policy creates separate private assets for resume files, webcam,
microphone, screen, avatar output, transcript audio, reports, and exports. An
account deletion job enumerates both PostgreSQL references and Cloudinary
objects, then records completion evidence. Export jobs package authorized JSON
and media references into a ZIP and deliver only a short-lived signed link.

## 10. Scaling path

Phase 1 may run one local stack and one local GPU worker. Later deployment can
split web/API nodes, realtime nodes, workers, GPU workers, and code runners. The
interfaces in `TRD.md` remain stable during the split.
