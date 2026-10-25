# Product Requirements Document

Version: 2.2.0  
Status: Canonical replacement contract  
Product: InterviewAI

## 1. Product definition

InterviewAI is a dual-mode platform for academic interview preparation and
structured hiring. The company side creates a campaign and evaluates applicants;
the candidate side completes a strict, ordered assessment. The student side
offers private, repeatable practice using the same core assessment and interview
technology.

Implementation priority is Prep Mode first. Hiring Mode and Super Admin reuse
the completed identity, assessment, code execution, interview, media, report,
and operations foundations.

## 2. Product modes and roles

### Hiring Mode

- Company admin owns a tenant and its campaigns.
- A campaign may enable aptitude, coding, and AI interview rounds in that order.
- Candidates apply or are imported, receive scoped credentials, complete one assessment, and cannot retake it.
- Company admins review scores, integrity evidence, appeals, decisions, and offers.

### Prep Mode

- Students register directly.
- Resume, aptitude, coding, and interview practice can be repeated without hiring penalties.
- Scores and reports are private to the student.
- Proctoring is informational only.

### Roles

- `student`: Prep Mode owner.
- `company_admin`: company tenant administrator.
- `candidate`: one campaign application identity.
- `super_admin`: platform operator with MFA and audited privileged actions.

### Academic release defaults

- Authentication starts with email/password, email verification, and password
  reset. Google sign-in is later scope.
- Email delivery is enabled for the academic release through the configured
  SMTP provider. Local development does not depend on Mailpit.
- WSL2 and PostgreSQL 16 are the first local development environment. Docker is
  optional infrastructure parity, not a prerequisite.
- Cloudinary is the initial private media adapter. Resumes, webcam, microphone,
  screen, avatar-output, reports, and exports use private authorization-checked
  objects; raw media is never stored in PostgreSQL.
- Prep recordings and resume history have a 30-day default retention window
  after the relevant result is available. Students can download/export data and
  can request account deletion at any time.
- A complete export is a machine-readable ZIP containing JSON plus available
  MP4/WAV/PDF assets. The system emails a secure expiring link within 7 business
  days.

## 3. Required screen inventory

### Company/Admin screens

1. Company landing
2. Company registration
3. Company login
4. Admin dashboard
5. Campaign creation
6. Question set manager
7. Candidate leaderboard
8. Bulk resume upload
9. Proctoring review
10. Final selection and offer

### Candidate screens

1. Public apply
2. Candidate login
3. Force password change
4. System check and consent
5. Campaign dashboard
6. Aptitude test
7. Aptitude result
8. Coding test
9. Coding result
10. AI interview
11. Final read-only result

### Super Admin screens

The existing frontend provides nine top-level screens: privileged login plus
eight operations screens. The shell is sufficient for navigation, but each
screen requires the production controls defined below.

1. Super Admin login and MFA
2. Super Admin dashboard
3. Company management
4. User and candidate management
5. AI usage monitor
6. Global question bank management
7. System configuration and feature flags
8. Immutable audit logs
9. Infrastructure health

### Prep screens

1. Public landing
2. Student authentication/onboarding
3. Student dashboard
4. Resume hub
5. Aptitude portal
6. Coding Arena
7. AI interview
8. Interview report
9. Interview replay
10. Student profile

The complete screen contracts and transitions are in `APP-FLOWS.md`.

## 4. Hiring Mode functional requirements

### Identity and tenancy

- Company registration creates a company, owner membership, admin user, and secure session transactionally.
- Every company query is filtered by tenant ID on the server.
- Candidate credentials are scoped to one application and campaign.
- Passwords, reset tokens, and OTPs are never stored in plaintext.
- Super Admin uses stronger authentication and is not reachable through company routes.

### Campaigns

- Lifecycle: `draft -> published -> closed -> archived`.
- Drafts may be edited; published question/scoring configuration is immutable.
- Campaigns store active rounds, order, weights, thresholds, interview type, timers, proctoring policy, and anti-abuse policy.
- Public application links are unguessable and expire with the campaign.

### Candidate assessment

- The server creates one attempt per enabled round.
- The server controls timers, questions, unlocks, qualification, autosave, and submission.
- Hiring attempts do not support retakes or backward navigation after submission.
- Reconnect and refresh recover the existing attempt without duplicating actions.
- Candidate results expose round scores only; overall score, rank, and peer data remain company-only.

### Proctoring and media

- System check and consent are required before strict rounds.
- Campaign policy controls warning, strike, penalty, auto-submit, and disqualification behavior.
- Proctoring evidence is private and available only to authorized company reviewers.
- Recording uploads are resumable where possible and stored outside PostgreSQL.
- Prep captures webcam, microphone, screen, and avatar output when the student
  grants the required permissions; the student is the only Prep viewer.
- The UI separates browser permission prompts from explicit AI/storage consent.
- The exact consent copy is defined in `APP-FLOWS.md` and versioned in the
  backend.
- Appeals are stored and reviewable.

### Hiring decisions

- AI may generate suitability notes but never makes the final hiring decision.
- Admin decisions are explicit, versioned, and audited.
- Offers require an explicit selected decision, generate a private PDF, and queue email delivery idempotently.

## 5. Super Admin functional requirements

- Super Admin authentication requires MFA, secure privileged sessions, rate limits, and complete access auditing.
- Super Admin can suspend/reactivate companies and users without deleting historical assessment data.
- Super Admin can inspect a company, campaign, application, candidate round, interview session, report status, and proctoring case through authorized read-only support views.
- Super Admin can perform explicit, audited account reset, data export, deletion, and emergency lock actions.
- Super Admin can manage global question-bank imports, validation, versioning, quality metrics, and reseed jobs.
- Super Admin can observe AI provider usage, latency, quota/rate-limit events, queue state, and failed jobs.
- Super Admin can manage feature flags and maintenance mode with typed validation, confirmation, audit records, and rollback-safe updates.
- Provider secrets are never returned to the browser. Configuration screens manage metadata or rotate through a server-side secret adapter; raw keys remain in environment/secret storage.
- Health screens check PostgreSQL, Redis if enabled, object storage, workers, realtime service, AI adapters, email adapter, and code runner. MongoDB is never a health component.
- Audit logs are append-only, filterable, exportable, and retain actor, tenant, target, action, timestamp, request ID, and safe details.
- Super Admin cannot silently alter candidate scores, published campaign snapshots, or completed assessment evidence. Corrections require an explicit audited override record.

Required operational capabilities may be implemented as detail drawers or
routes inside the existing Company Management, User Management, Audit, and
Health screens; they do not require extra top-level navigation cards.

## 6. Prep Mode functional requirements

- Students manage profile, education, skills, preferences, and avatar.
- Students upload PDF/DOCX resumes and receive structured ATS/skill/grammar analysis.
- Aptitude practice uses timed, repeatable attempts with explanations.
- Coding practice supports Python, JavaScript, and C++ in the initial release.
- SQL coding is enabled only in Prep Phase 3 after the isolated PostgreSQL SQL runner is complete.
- AI interviews support text and voice, realtime transcript, adaptive follow-ups, code editor, whiteboard, report, and replay.
- Production voice and realistic browser-rendered 3D avatar are required in Phase 1.
- The supplied avatar image is the visual identity reference and the supplied
  video is the motion/behavior reference; a rigged GLB/glTF asset and commercial
  use license approval are required before production release.

## 7. AI requirements

- Local inference is preferred for latency-sensitive STT/TTS/realtime work.
- Gemini is a server-side analysis adapter for approved resume, code, interview, and report workloads.
- Provider selection is configuration, never scattered conditional logic.
- Every AI response is schema-validated, versioned, metered, and persisted with provider/model metadata.
- AI output cannot directly alter authorization, scores, qualification, or final hiring decisions without deterministic server rules or human confirmation.

Approved baseline adapters are faster-whisper small for local STT, Kokoro for
baseline local TTS, optional Chatterbox for expressive TTS, and Gemini for
server-side analysis. All adapters are replaceable and benchmarked against the
local GTX 1650 4 GB constraint.

### 7A. Content ingestion

- The current 24 coding problems and existing aptitude mocks are development
  seed data only.
- The backend must support validated, versioned JSON bulk imports for the owner-
  supplied aptitude bank and the planned 3,000+ DSA-style coding bank.
- Imported content is not published until schema validation, duplicate checks,
  hidden-test checks, and quality review pass.

## 8. Non-functional requirements

- No browser-visible secret or provider key.
- API p95 target: 500 ms locally for non-AI requests under normal development load.
- Realtime sessions survive transient disconnects.
- Important mutations are idempotent.
- Media, PII, and proctoring retention are configurable and enforced.
- Critical flows have unit, integration, realtime, security, and end-to-end tests.
- The system remains deployable without a developer workstation.

## 9. Explicit non-goals

- Billing or payment processing in the academic release.
- MongoDB.
- SQL runner before Prep Phase 3.
- Public candidate scoreboards.
- Mobile strict proctored assessments.
- Automatic AI-only hiring decisions.
- Production dependency on Colab.
- Jurisdiction-specific compliance claims before the owner selects the launch country and legal requirements.
