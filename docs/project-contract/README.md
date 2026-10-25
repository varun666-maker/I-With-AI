# InterviewAI Implementation Contract

Version: 2.2.0  
Status: Canonical replacement contract  
Updated: 2026-10-15

## Purpose

This directory is the only implementation contract for the production
application. It replaces the previous `docs/project-contract` contents. Agents
must read these files before changing product behavior:

1. `PRD.md`
2. `TRD.md`
3. `ARCHITECTURE.md`
4. `APP-FLOWS.md`
5. `BACKEND-SCHEMA.md`
6. `RULES.md`
7. `IMPLEMENTATION-PLAN.md`
8. `TASKS.md`
9. `AGENT-MEMORY.md`
10. `BUILD-STATUS.md` for implementation progress and restart instructions

## Product identity

InterviewAI is a free academic AI interview and hiring platform.

- Hiring Mode lets companies run campaign-scoped, strict candidate assessments.
- Prep Mode lets students privately practice resumes, aptitude, coding, and AI interviews.
- Super Admin operates the platform; its privileged control plane is required before Hiring Mode is considered production-ready.

The current Next.js frontend is a visual prototype. The contract describes the
real production behavior that must replace mock data, timers, localStorage
business state, and decorative integrations.

## Authority

This contract overrides legacy mock behavior and old conflicting references.
Explicit owner decisions in the latest conversation override this contract; an
agent must update the contract before coding when a conflict is discovered.

## Non-negotiable decisions

- PostgreSQL is the only durable application database. MongoDB is prohibited.
- WSL2 with PostgreSQL 16 is the first local deployment target; Docker is optional and not required.
- Free and open-source infrastructure is the default; no paid-only dependency.
- Email verification, password reset, and product notifications use the configured SMTP provider; Mailpit is not required.
- Cloudinary is the initial private object-storage adapter for resumes and all interview capture streams.
- Webcam, microphone, screen, and avatar-output capture are required for the interview recording pipeline.
- The academic default retention window is 30 days for Prep media and resume history after the relevant result is available; users may download/export before cleanup.
- Account deletion starts an auditable purge of database, object-storage, and derived AI data, completed within 30 days; deleted data is excluded from future training.
- User data export produces a machine-readable ZIP and secure email link within 7 business days.
- Initial authentication is email/password with verification and password reset; Google OAuth is later scope.
- Launch jurisdiction/legal counsel is intentionally deferred; agents must not invent compliance claims before it is selected.
- Prep Mode is the first implementation priority.
- Hiring Mode follows the completed Prep Mode foundation and shared services.
- Python, JavaScript, and C++ execution are required before SQL execution.
- SQL coding is Prep Mode Phase 3 and is disabled until the isolated SQL runner exists.
- Realtime, production voice, realistic 3D avatar, recording, whiteboard, and interview code editor are Phase 1 product requirements.
- Hybrid AI is required: local realtime inference plus a server-side Gemini analysis adapter.
- Browser state is never authoritative for identity, timers, scores, attempts, permissions, or submissions.
- No temporary Colab session may be a production dependency.

## Confirmed runtime baseline

- Hybrid AI: faster-whisper small for local STT, Kokoro for baseline local TTS,
  optional Chatterbox for expressive TTS, and Gemini for server-side analysis.
- Local LLM inference is optional and permitted only after it fits the GTX 1650
  4 GB benchmark envelope.
- The initial runner targets Python 3.12, JavaScript on Node.js 22 LTS, and
  C++20 on GCC 13 or the approved compatible toolchain.
- Initial non-SQL runner limits are 5 seconds wall time, 256 MiB memory, one
  CPU, 64 MiB output, disabled network, and isolated temporary filesystem.
- SQL remains Prep Mode Phase 3 and uses a separate isolated PostgreSQL sandbox.

## Legacy material

The following remain reference material only and must not silently override this
contract:

- `upload/PRD_v2.2_DualPlatform.md`
- `download/InterviewAI-Complete-Screen-Workflow.md`
- `download/Feature-2-AI-Interview-Code-Editor-Spec.md`
- Supplied avatar image/video references
- Existing mock screen components and demo data

## Definition of done for a screen

A screen is not production-ready until its frontend, API, authorization,
PostgreSQL persistence, loading/empty/error/reconnect states, audit behavior,
tests, and documentation are complete. A mock success animation is not an
implementation.
