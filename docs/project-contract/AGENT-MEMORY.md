# Agent Memory

Version: 2.2.0

## Read first

Read `README.md`, `PRD.md`, `TRD.md`, `ARCHITECTURE.md`, `APP-FLOWS.md`,
`BACKEND-SCHEMA.md`, `RULES.md`, `IMPLEMENTATION-PLAN.md`, and `TASKS.md`.
Also read `SECURITY-SYSTEM-DESIGN.md` before adding or changing an API,
worker, media flow, AI adapter, assessment, or privileged operation.

## Product in one paragraph

InterviewAI is a free academic dual-mode platform. Prep Mode is implemented
first: students complete private, repeatable resume, aptitude, coding,
voice/avatar interview, report, and replay experiences. Hiring Mode follows:
companies create immutable campaign snapshots, candidates complete strict
server-controlled aptitude/coding/interview rounds, and admins review evidence
and make human hiring decisions.

## Non-negotiable decisions

- PostgreSQL only; never add MongoDB.
- Prep first; Hiring second; Super Admin operational expansion after the shared foundations.
- Python, JavaScript, and C++ before SQL.
- SQL is Prep Phase 3 and must be feature-gated until its PostgreSQL sandbox exists.
- Phase 1 includes realtime voice, realistic browser 3D avatar, recording, whiteboard, and interview code editor.
- Hybrid AI: local realtime inference plus server-side Gemini analysis adapter.
- Baseline AI adapters: faster-whisper small, Kokoro, optional Chatterbox, and Gemini analysis.
- GTX 1650 4 GB is the local GPU constraint.
- WSL2 with PostgreSQL 16 is the first local baseline; Docker is optional.
- Required email uses the configured SMTP provider; initial private media uses Cloudinary.
- Prep captures webcam, microphone, screen, and avatar output only after both browser permissions and explicit AI/storage consent.
- Prep media and resume history default to 30-day retention; export is due within 7 business days; deletion purges all stores within 30 days.
- Initial runner defaults are Python 3.12, Node.js 22 LTS, C++20/GCC 13, 5 seconds, 256 MiB, one CPU, 64 MiB output, and no network.
- Browser/localStorage state is never authority for security or business facts.
- No paid-only or Colab-only production dependency.
- Super Admin controls the platform through MFA-protected, tenant-aware, audited operations; its UI is not enough without real support/detail actions.

## Current repository reality

- The current Next.js screen registry and components are visual prototypes.
- Many screens use mock data, `setTimeout`, or localStorage.
- The existing Prisma User/Post schema and hello-world API are not the product backend.
- Legacy docs and screenshots are references, not authority.

## Implementation order

1. Contract gate and assets.
2. Foundation identity/profile/storage/jobs.
3. Prep profile/resume/aptitude/coding slices.
4. Prep realtime interview/voice/avatar/media/report/replay.
5. Prep Phase 3 SQL.
6. Hiring company/campaign/question/leaderboard/selection slices.
7. Hiring candidate/strict assessment slices.
8. Hiring realtime interview and security hardening.
9. Super Admin control plane and operations.

## Stop conditions

Stop and update the contract when a requirement conflicts, a secret/provider is
unknown, an avatar/model license is unapproved, a runner boundary is unclear,
or a UI mock implies behavior not backed by a server rule. Report limitations
instead of inventing a successful response.
