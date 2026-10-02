# Complete AI Interview Assistant — PRD v2.0

**PRODUCT REQUIREMENTS DOCUMENT**
**End-to-End AI-Powered Hiring Simulation Platform**

| Field | Detail |
|---|---|
| Document Version | 2.2 — LLM Optimized (Dual Platform Architecture: Student/Company Admin/Candidate roles, campaigns) |
| Author | Varun Kumar A |
| Project Type | AI SaaS Platform — Final Year Project |
| Target Platform | Web Application (React + FastAPI) |
| Document Date | June 2026 |
| Classification | Internal / Project Reference |
| Audience | Developers, LLMs, Reviewers, Evaluators |

---

## Table of Contents

- [Part 1 — Project Overview](#part-1--project-overview)
  - [1. Document Purpose & LLM Usage Guide](#1-document-purpose--llm-usage-guide)
  - [2. Vision & Problem Statement](#2-vision--problem-statement)
  - [3. Goals & Success Metrics](#3-goals--success-metrics)
  - [3B. Dual Platform Architecture [NEW]](#3b-dual-platform-architecture-new)
  - [4. Target Users & Personas](#4-target-users--personas)
- [Part 2 — System Architecture](#part-2--system-architecture)
  - [5. Technology Stack](#5-technology-stack)
  - [6. Complete User Journey](#6-complete-user-journey)
- [Part 3 — Modules (Detailed Specifications)](#part-3--modules-detailed-specifications)
  - [Module 1 — Authentication & Authorization](#module-1--authentication--authorization-required)
  - [Module 2 — Profile Management](#module-2--profile-management-required)
  - [Module 3 — AI Resume Analyzer](#module-3--ai-resume-analyzer-required-ai)
  - [Module 4 — Aptitude Test Engine](#module-4--aptitude-test-engine-required)
  - [Module 5 — Technical Coding Round](#module-5--technical-coding-round-required)
  - [Module 6 — AI Interview Engine](#module-6--ai-interview-engine-required-ai-realtime)
  - [Module 7 — Post-Interview AI Analysis](#module-7--post-interview-ai-analysis-required-ai-async)
  - [Module 8 — User Dashboard](#module-8--user-dashboard-required)
  - [Module 9 — PDF Report Generation](#module-9--pdf-report-generation-required-ai)
  - [Module 10 — Fair-Usage Monitoring & Proctoring Engine](#module-10--fair-usage-monitoring--proctoring-engine-required-cv)
  - [Module 11 — Hiring Mode: Companies, Campaigns & Candidate Access](#module-11--hiring-mode-companies-campaigns--candidate-access-required)
- [Part 4 — Complete API Reference](#part-4--complete-api-reference)
  - [10. Complete API Endpoint Reference](#10-complete-api-endpoint-reference)
    - [10.6 Proctoring API](#106-proctoring-api)
    - [10.7 Company / Campaign Admin API](#107-company--campaign-admin-api)
- [Part 5 — Complete Database Schemas](#part-5--complete-database-schemas)
  - [11. Database Schema Reference](#11-database-schema-reference)
- [Part 6 — UI/UX Design System](#part-6--uiux-design-system)
  - [12. UI/UX Design System](#12-uiux-design-system)
    - [12.1 Design Language](#121-design-language)
    - [12.2 Multi-Theme Color System (CSS Variable Architecture)](#122-multi-theme-color-system-css-variable-architecture)
    - [12.3 Typography](#123-typography)
    - [12.4 Component Library (Semantic Token Classes & Utility Classes)](#124-component-library-semantic-token-classes--utility-classes)
    - [12.5 Page-by-Page Screen List](#125-page-by-page-screen-list)
    - [12.6 Premium Motion & Visual Effects Library](#126-premium-motion--visual-effects-library)
- [Part 7 — Non-Functional Requirements & Deployment](#part-7--non-functional-requirements--deployment)
  - [13. Non-Functional Requirements](#13-non-functional-requirements)
- [Part 8 — MVP Scope, Monetization & Roadmap](#part-8--mvp-scope-monetization--roadmap)
  - [14. MVP Scope (Version 1.0)](#14-mvp-scope-version-10)
  - [15. Access Model — Fully Free (Academic Project)](#15-access-model--fully-free-academic-project)
  - [16. Roadmap](#16-roadmap)
- [Part 9 — Admin Panel & Integrations](#part-9--admin-panel--integrations)
  - [17. Admin Panel](#17-admin-panel)
  - [18. Third-Party Integrations](#18-third-party-integrations)
- [Appendices](#appendices)
  - [Appendix A — Acceptance Criteria Checklist](#appendix-a--acceptance-criteria-checklist)
  - [Appendix B — Environment Variables Reference](#appendix-b--environment-variables-reference)
  - [Appendix C — Glossary](#appendix-c--glossary)

---

## PART 1 — PROJECT OVERVIEW

---

## 1. Document Purpose & LLM Usage Guide

This Product Requirements Document (PRD) is written for maximum machine readability. Every section is self-contained so that a Large Language Model (LLM) can generate accurate frontend components, backend APIs, database schemas, AI prompts, or test cases from a single section without needing additional context.

### 1.1 How to Use This Document

- Each module section fully specifies: inputs, outputs, data models, AI behavior, UI state, and error handling.
- Tables are preferred over prose for structured data so LLMs can parse them directly.
- Every API endpoint includes request/response schema, HTTP method, authentication, and error codes.
- AI prompt templates are written inline where the AI model behavior needs to be specified.
- Acceptance criteria are listed per feature so generated code can be validated.

### 1.2 Document Conventions

| Symbol / Term | Meaning |
|---|---|
| [REQUIRED] | Must be implemented in MVP (Version 1.0) |
| [OPTIONAL] | Nice-to-have; can defer to Phase 2 |
| [AI] | Feature involves an AI/ML model call |
| [CV] | Computer Vision feature (webcam/video processing) |
| [ASYNC] | Operation runs asynchronously in background |
| [REALTIME] | Requires WebSocket or SSE connection |
| JWT protected | Endpoint requires valid JWT Bearer token in Authorization header |

---

## 2. Vision & Problem Statement

### 2.1 Vision Statement

Complete AI Interview Assistant is an AI-powered, end-to-end hiring simulation platform. Unlike isolated tools that address only one aspect of interview preparation (resume checking, mock Q&A, or coding practice), this platform replicates every stage of a real corporate recruitment pipeline — from resume screening through aptitude testing, coding rounds, AI-conducted voice interviews, post-interview analysis, and downloadable performance reports — inside a single product.

### 2.2 Problem Statement

Candidates preparing for software engineering interviews currently face a fragmented experience across multiple disconnected tools:

| Current Gap | Current Tool Used | Limitation |
|---|---|---|
| Resume review | ResumeWorded, Jobscan | No connection to interview performance |
| Aptitude practice | IndiaBix, PrepInsta | No AI personalization |
| Coding practice | LeetCode, HackerRank | No interview context or follow-up |
| Mock interviews | Pramp, Interviewing.io | Human-dependent, not scalable |
| Body language feedback | None available | Zero tools exist at student price points |
| Holistic hiring report | None available | No single score or improvement roadmap |

### 2.3 Solution Summary

This platform unifies all six pillars above into one AI-powered experience, delivering a repeatable, scalable, personalized hiring simulation available 24/7 at a fraction of the cost of human coaching.

### 2.4 Two Operating Modes

The platform serves two distinct user groups on the same codebase: **Preparation Mode** (self-serve students) and **Hiring Mode** (recruiter-driven campaigns). See §3B (Dual Platform Architecture) immediately following the goals/personas sections for the full breakdown of roles, routes, question sourcing, and proctoring behavior — this is the architectural backbone the rest of the document builds on.

---

## 3. Goals & Success Metrics

### 3.1 Primary Product Goals

- Simulate a complete real-world hiring pipeline within a single web application.
- Provide AI-generated, personalized, actionable feedback after each stage.
- Track candidate improvement over time through a persistent dashboard.
- Generate a professional, downloadable PDF report equivalent to a recruiter's evaluation.

### 3.2 Project Scope

This is a final year academic project built entirely with free and open-source tools. There are no paid plans, subscriptions, or payment integrations. All features are available to every registered user at no cost.

### 3.3 Key Performance Indicators (KPIs)

| KPI | Target (6 months post-launch) | Measurement Method |
|---|---|---|
| Daily Active Users (DAU) | 5,000+ | Analytics dashboard |
| Resume analyses completed | 20,000+ | Database event count |
| AI interviews conducted | 10,000+ | Session completion event |
| Average interview score improvement (2nd vs 1st attempt) | +12% | Longitudinal score comparison |
| PDF report downloads | 15,000+ | Download event count |
| Session completion rate (started vs finished) | >65% | Funnel analytics |
| User retention (D30) | >40% | Cohort retention report |

---

## 3B. Dual Platform Architecture [NEW]

> **This section is the architectural backbone of the whole product.** Every module downstream (Aptitude, Coding, Interview, Resume, Proctoring, Admin Panel) branches its behavior based on the concepts defined here. Read this before implementing any other module.

### 3B.1 Two Modes — One Codebase

| Dimension | Prep Mode | Hiring Mode |
|---|---|---|
| Who | Students, job seekers (self-registered) | Candidates invited by a company |
| Registration | Self-register (email/password or Google OAuth) | Receive invite email with system-generated credentials — never self-registers |
| Login screen | Standard login + Google OAuth at `/login` | Company candidate login at `/company/login` |
| Question source — Aptitude | Automated dataset (1,500+ seeded questions) — no admin curation needed | Company admin's custom questions for that specific campaign |
| Question source — Coding | Automated dataset (200+ DSA + 100+ SQL) — no admin curation needed | Company admin's custom DSA/SQL problems for that campaign |
| Interview types | Any of the 6 types (Module 6) — user chooses | Fixed by the company admin in campaign config |
| Dashboard | Full personal progress dashboard (Module 8) — history, trends, roadmap | Stripped view — current campaign's results only, no cross-campaign history |
| PDF Report | Full 17-section personal report (Module 9) | Campaign report + proctoring summary, scoped to that one attempt |
| Retakes | Unlimited (prep = a learning tool) | **Zero** — one attempt per campaign, no exceptions |
| Anti-cheat — screenshots/frames stored | **No.** Nothing from the optional webcam self-check is ever uploaded or stored — privacy by default for prep users | **Yes.** Flagged webcam frames are stored (Cloudinary) and visible to the company admin for review |
| Anti-cheat — does it block/exit? | **No.** Tab-switch and fullscreen-exit events are logged and shown to the student only, for their own awareness. The test is never paused, exited, or auto-submitted because of them. | **Yes — full proctoring engine.** Fullscreen + camera mandatory; progressive warnings; 2+ tab-switch/fullscreen-exit violations → auto-submit and flag; multi-face/device-detected events can trigger admin review or instant auto-disqualification if the company enabled that rule for the campaign |
| Anti-cheat — score penalty | **No.** Prep is self-improvement; nothing about the score is ever touched by proctoring events. | **Yes.** If the session is auto-submitted for violations (`integrity_flag = true`), a 20% deduction is applied to the candidate's overall score (§3B.4) |

### 3B.2 URL Structure

| Route | Who | Description |
|---|---|---|
| `/` | Public | Landing page with "Start Preparing Free" + "For Companies" CTAs |
| `/register` | Public | Student self-registration |
| `/login` | Students | Standard login + Google OAuth |
| `/company/login` | Candidates | Candidate ID + password login (system-generated credentials) |
| `/company/register` | Companies | Company admin registration |
| `/dashboard` | Students | Full personal prep dashboard |
| `/resume`, `/aptitude`, `/coding`, `/interview` | Students | Prep-mode assessment pages |
| `/c/:campaign_slug/dashboard` | Candidates | Campaign-specific dashboard (stripped view) |
| `/c/:campaign_slug/aptitude` | Candidates | Campaign aptitude round (company-curated questions only) |
| `/c/:campaign_slug/coding` | Candidates | Campaign coding round (company-curated DSA/SQL only) |
| `/c/:campaign_slug/interview` | Candidates | Campaign interview round (fixed type from campaign config) |
| `/admin` | Company Admin | Hiring management dashboard |
| `/admin/campaigns` | Company Admin | Campaign management |
| `/admin/campaigns/:id/candidates` | Company Admin | Leaderboard + shortlisting |
| `/superadmin` | Super Admin | Platform-level management |

### 3B.3 User Role Hierarchy

```
super_admin
    └── company_admin (one per registered company)
            └── candidate (invited per campaign; zero self-registration)

student (fully independent; no company affiliation)
```

| Role | Created By | Key Permissions |
|---|---|---|
| `student` | Self-registers at `/register` | Full prep platform; unlimited retakes; personal dashboard; any of the 6 interview types |
| `candidate` | Company admin sends invite (never self-registers) | Only the campaign's assigned rounds; **one attempt**; read-only results scoped to that campaign |
| `company_admin` | Super admin, or self-registers via `/company/register` ("For Companies") | Create/manage campaigns, add questions, bulk-upload & shortlist resumes, invite candidates, review proctoring flags, mark final selection |
| `super_admin` | Seeded at deployment (not self-registrable) | Everything — company account management, platform health, AI usage monitor, global analytics |

### 3B.4 Score Weighting for Hiring Mode

Only Hiring Mode campaigns use weighted scoring — Prep Mode simply shows each round's score independently (Module 8 dashboard) with no combined "overall" figure.

```
If all 3 rounds active (aptitude + coding + interview):
  overall = (aptitude_score × 0.30) + (coding_score × 0.30) + (interview_score × 0.40)

If aptitude + coding only:
  overall = (aptitude_score × 0.50) + (coding_score × 0.50)

If aptitude only:
  overall = aptitude_score

Integrity penalty (applied AFTER the above, only if integrity_flag = true):
  overall = overall × 0.80   ← 20% deduction when the session was auto-submitted due to
                                proctoring violations (Module 10 §10.3–§10.4)
```

The round weights (0.30/0.30/0.40 default) and which rounds are active are configured per-campaign by the company admin at campaign creation (§11.2). `integrity_flag` is set to `true` exactly when a Module 10 `TERMINATED` or `AUTO_DISQUALIFIED` event fires during any round of that candidate's attempt.

---

## 4. Target Users & Personas

### 4.1 User Personas

| Persona | Profile | Primary Goal | Pain Point | Success Criteria |
|---|---|---|---|---|
| College Student (Priya, 21) | 3rd year CS student, campus placement season approaching | Get placed in a top IT company | No real interview experience; nervous about HR rounds | Completes 5+ mock interviews; confidence score improves by 20% |
| Fresh Graduate (Rahul, 23) | 6 months post-graduation, applying to startups | Land first developer job quickly | Resume not getting shortlisted; no structured feedback | ATS score improves from 60% to 85%; gets callback within 2 weeks |
| Working Professional (Aisha, 28) | 3 years experience, targeting product companies | Switch to FAANG-level companies | Needs company-specific prep; limited practice time | Completes company-specific interview packs on mobile during commute |
| Placement Coordinator (Dr. Mehta) | College TPO managing 500 students | Maximize placement percentage | No scalable mock interview solution; manual tracking | Bulk-enrolls students; views analytics dashboard per batch |
| Recruiter (Vikram, 35) | HR manager at mid-size tech firm | Pre-screen candidates efficiently | Spends 4+ hours daily on first-round screening | Uses the Admin Panel to shortlist by resume, curate a private aptitude+coding question set, invite candidates via campaign credentials, and review proctoring flags before the human interview |
| Invited Candidate (Sana, 24) | Applicant shortlisted by a company using the platform to hire | Complete the company's aptitude/coding rounds fairly and get seen | Doesn't want to use her personal practice account for a real hiring round; needs a distraction-free, monitored test | Logs in with the access code/credentials the recruiter sent, sees only that campaign's question set, completes the test in fullscreen without being flagged for cheating |

---

## PART 2 — SYSTEM ARCHITECTURE

---

## 5. Technology Stack

### 5.1 Full Stack Overview

| Layer | Technology | Purpose | Version / Notes |
|---|---|---|---|
| Frontend Framework | React.js | SPA, component-based UI | React 18+ |
| Styling | Tailwind CSS | Utility-first CSS framework | v3+ |
| Animations | Framer Motion | Page transitions, micro-interactions | v10+ |
| State Management | Zustand or Redux Toolkit | Global app state | Prefer Zustand for simplicity |
| Backend API | FastAPI (Python) | RESTful + WebSocket API server | Python 3.11+ |
| Database — Relational | PostgreSQL | Users, sessions, scores, payments | v15+ |
| Database — Document | MongoDB | Interview transcripts, AI analysis JSON | v7+ |
| Cache / Session | Redis | JWT blacklist, rate limiting, real-time state | v7+ |
| Authentication | JWT + Google OAuth 2.0 | Token-based auth + social login | PyJWT, Authlib |
| AI — Text | Google Gemini 1.5 Flash (free tier) | Question generation, answer evaluation, report generation | Free via Google AI Studio API — 15 RPM, 1M tokens/day |
| AI — Speech-to-Text | Whisper (local, openai/whisper library) | Convert interview audio to transcript | Runs locally on server — 100% free, no API cost |
| AI — Text-to-Speech | Web Speech API (browser built-in) | AI avatar voice synthesis | Free — native browser TTS, no external service needed |
| AI — Computer Vision | MediaPipe (browser JS) + face-api.js | Eye contact, posture, emotion detection from webcam | 100% free, runs entirely in browser — no server cost |
| Code Execution | Piston API (free, self-hostable) | Sandboxed multi-language code execution | Free open-source alternative to Judge0; self-host on localhost |
| File Storage | Local filesystem / Supabase Storage free tier | Resumes, recordings, reports | Supabase free tier: 1GB storage; or local /uploads directory for dev |
| 3D Avatar | Three.js custom avatar + CSS animation | Lip-synced AI interviewer avatar | Free — no external avatar service needed; custom animated character |
| PDF Generation | WeasyPrint (open-source Python library) | Downloadable interview reports | 100% free and open-source |
| Deployment | Docker + Render.com free tier / Railway free tier | Container hosting for web app | Render free tier: 512MB RAM; Railway: $5 credit/month free |
| Database Hosting | Supabase free tier (PostgreSQL) + MongoDB Atlas free tier | Managed DB hosting | Supabase: 500MB; Atlas: 512MB — both permanently free |
| CDN / Static Hosting | Vercel free tier (frontend) | Static assets delivery | Vercel free tier: unlimited bandwidth for static hosting |
| Monitoring | Built-in FastAPI logging + browser console | Basic error and performance tracking | Free — structured logging to stdout; no paid APM needed |
| Proctoring — Fullscreen Enforcement | Fullscreen API (browser built-in) | Force fullscreen during aptitude, coding, and interview rounds | `element.requestFullscreen()` — free, no SDK |
| Proctoring — Tab/Window Detection | Page Visibility API + `blur`/`focus` window events (browser built-in) | Detect tab switches, minimized windows, or app-switch away from the test | Free, no SDK |
| Proctoring — Device/Object Detection | TensorFlow.js + COCO-SSD model (browser-side, free) | Detects phones, extra people, or external devices in webcam frame during proctored rounds | `@tensorflow-models/coco-ssd` via CDN — 100% free, runs entirely in browser |

### 5.2 System Architecture Diagram (Textual)

> **LLM Instruction:** Generate a layered system architecture diagram from the following component description. Use boxes and arrows. Group by: Client, API Gateway, Microservices, AI Services, Storage.

**Client Layer:** React SPA (Browser) communicates over HTTPS with API Gateway.

**API Gateway:** Nginx reverse proxy routes to: Auth Service, Interview Service, Resume Service, Coding Service, AI Orchestration Service.

**AI Orchestration Service calls:** Google Gemini 1.5 Flash API (free), local Whisper STT, Web Speech API TTS (browser), MediaPipe CV (browser JS), Piston API code execution (free).

**All services read/write to:** PostgreSQL on Supabase (structured data), MongoDB Atlas free tier (transcripts/AI JSON), Upstash Redis free tier (cache/session), Cloudinary free tier (files).

**Background jobs (Celery + Redis):** post-interview analysis, PDF report generation. On completion, a WebSocket event is pushed to the user's active session to unlock the dashboard download button.

---

## 6. Complete User Journey

The platform supports **three** parallel journeys sharing the same engine (Modules 3–9): the **Student** journey (self-serve, Prep Mode), the **Company Admin** journey (campaign creation and shortlisting), and the **Invited Candidate** journey (recruiter-driven, one attempt, strict proctoring). See §3B for the full architectural split these journeys are built on.

### 6.1 Student (Prep Mode) Journey

| Step # | Screen / Action | System Behavior | AI Involved | Data Written |
|---|---|---|---|---|
| 1 | Landing Page | "Start Preparing Free" CTA | No | — |
| 2 | Register | Email+password or Google OAuth; `role = student` | No | users table (`role='student'`) |
| 3 | OTP Verify | 6-digit OTP to email; 10-min expiry | No | otp_tokens table |
| 4 | Profile Setup | Name, role preference, skills, education | No | profiles table |
| 5 | Resume Upload | PDF/DOCX → Cloudinary → async Gemini analysis | Gemini 1.5 Flash (free) | resumes, resume_analyses tables |
| 6 | Aptitude Test | 25 MCQs from the **auto-seeded dataset** (1,500+ questions). Fullscreen is optional; tab-switch/fullscreen-exit events are **logged and shown to the student only** — nothing blocks or exits the test. | [CV] webcam self-check, advisory only, optional | aptitude_results + proctoring_events (`severity='logged_only'`) |
| 7 | Coding Round | DSA (Piston API) or SQL (sandboxed query execution) from the **auto-seeded dataset** (200+ DSA + 100+ SQL). Same non-blocking fullscreen/tab-switch logging as the aptitude round. | Piston API + Gemini review (free) + [CV] advisory | coding_results + proctoring_events (`severity='logged_only'`) |
| 8 | Interview Setup | Webcam/mic permission requested (student may choose any of the 6 interview types), avatar loads | No | interview_sessions table (init) |
| 9 | AI Interview | [REALTIME] Avatar speaks, user answers via mic; MediaPipe + face-api.js active for emotion/eye-contact/posture; tab-switch/fullscreen-exit still only logged, never terminates the interview | Gemini 1.5 Flash + local Whisper + Web Speech API + MediaPipe (all free) | transcripts, webcam_analysis, emotion_data, proctoring_events |
| 10 | Post-Analysis | Celery background pipeline; scores aggregated per round (no combined "overall" score in Prep Mode — see §3B.4); WebSocket progress updates | Gemini 1.5 Flash (free) | interview_analyses table |
| 11 | Dashboard | Full personal dashboard — all scores, trend charts, skill radar, roadmap, and a private "fair-usage summary" showing the student their own logged tab-switch/fullscreen-exit count for self-awareness only | No (reads cached data) | — |
| 12 | PDF Report | Full 17-section personal report; unlocks automatically via WebSocket (~60s) | Gemini 1.5 Flash summary text (free) | reports table (Cloudinary URL) |
| 13 | Interview Replay / Roadmap | Synchronized video + transcript + AI comments; personalized 6-week learning roadmap | Gemini 1.5 Flash (free) | roadmaps table |

### 6.2 Company Admin Journey

| Step # | Screen / Action | System Behavior | Data Written |
|---|---|---|---|
| 1 | Landing → "For Companies" | Admin clicks "Use for Hiring" | — |
| 2 | Company Register (`/company/register`) | Registers with company name + email; `role = company_admin` | users, companies tables |
| 3 | Admin Dashboard (`/admin`) | Sees all campaigns for their company and candidate stats | — |
| 4 | Create Campaign (`/admin/campaigns`) | Sets campaign name, job role, which rounds are active (aptitude/coding/interview), deadline, round score weights (§3B.4), proctoring strictness (including which events auto-disqualify) | campaigns table |
| 5 | Add Questions | Aptitude: form entry or bulk CSV. Coding: DSA or SQL problem forms — scoped to this campaign only | campaign_questions / campaign_problems tables |
| 6 | Bulk Upload & Shortlist Resumes | Recruiter batch-uploads candidate resumes; Gemini 1.5 Flash scores each against the campaign's job role and ranks them; admin marks top candidates `shortlisted` | resumes, resume_analyses, shortlist tables |
| 7 | Invite Candidates | System auto-generates a `candidate_id` + temporary password per shortlisted candidate and emails it with the login URL and deadline | candidate_credentials table + notification/email log |
| 8 | Monitor (`/admin/campaigns/:id/candidates`) | Real-time view of candidate completion status, scores as they come in, and any proctoring flags | — (reads) |
| 9 | Shortlist / Final Selection | Ranked leaderboard once results are in; admin marks each candidate Selected / Rejected / Waitlisted with notes; can export all results as CSV or a bulk PDF ZIP | selection_decisions table |

### 6.3 Invited Candidate (Hiring Mode) Journey

| Step # | Screen / Action | System Behavior | AI Involved | Data Written |
|---|---|---|---|---|
| 1 | Invite email received | Contains: company name, `candidate_id`, temporary password, login URL (`/company/login`), and the campaign deadline | No | — |
| 2 | `/company/login` | Enters `candidate_id` + password; JWT issued scoped to exactly this campaign (`role='candidate'`, `campaign_id` fixed, one attempt) | No | auth_sessions table |
| 3 | Pre-Test Proctoring Check | **Mandatory** webcam permission, fullscreen lock, mic check | [CV] strict | proctoring_sessions (init) |
| 4 | Campaign Dashboard (`/c/:campaign_slug/dashboard`) | Stripped view — only this campaign's assigned rounds, deadline countdown, completion status; no personal history from other campaigns | No | — |
| 5 | Aptitude Test (`/c/:campaign_slug/aptitude`) | Questions sourced **only** from this campaign's admin-curated question set. Fullscreen enforced; progressive warnings; 2+ tab-switch/fullscreen-exit violations → auto-submit and flag (Module 10 §10.3–§10.4); webcam monitoring continuous | [CV] strict, continuous | aptitude_results + proctoring_events |
| 6 | Coding Round (`/c/:campaign_slug/coding`) | DSA + SQL problems from this campaign's curated set only; identical strict proctoring rules as the aptitude round | Piston API + Gemini review (free) + [CV] strict | coding_results + proctoring_events |
| 7 | AI Interview (`/c/:campaign_slug/interview`) | Fixed interview type (set by the company admin in campaign config, not chosen by the candidate); webcam + tab-switch + fullscreen proctoring continues; serious/repeated violations can disqualify (§3B.1, §3B.4) | Gemini 1.5 Flash + local Whisper + MediaPipe + Proctoring Engine | interview_sessions + proctoring_events |
| 8 | Post-Interview Analysis | Same async scoring pipeline as Prep Mode, but the final score is the weighted `overall` from §3B.4 (with the 20% integrity penalty applied if any round was auto-submitted for violations) | Gemini 1.5 Flash (free) | interview_analyses table |
| 9 | Completion | "Assessment complete — results shared with [Company Name]." Read-only campaign results only — no retake, no personal dashboard | No | — |

---

## PART 3 — MODULES (DETAILED SPECIFICATIONS)

---

## Module 1 — Authentication & Authorization [REQUIRED]

### 1.1 Feature List

| Feature | Description | Priority |
|---|---|---|
| Email/Password Registration | Bcrypt hashed, email verified via OTP | P0 |
| Google OAuth 2.0 Login | One-click sign-in via Google | P0 |
| JWT Access + Refresh Tokens | Access: 15 min TTL; Refresh: 7 days TTL | P0 |
| OTP Email Verification | 6-digit code, 10-minute expiry, max 3 attempts | P0 |
| Forgot Password via Email | Secure reset link, 30-minute expiry | P0 |
| JWT Blacklisting on Logout | Redis stores invalidated tokens until expiry | P1 |
| Rate Limiting | 5 failed login attempts → 15-minute lockout | P1 |
| Admin Role | `role` claim (`student`/`candidate`/`company_admin`/`super_admin`) in JWT; guards `/dashboard/*` (student), `/c/:campaign_slug/*` (candidate, scoped to their own `campaign_id`), `/admin/*` (company_admin, scoped to their own `company_id`), and `/superadmin/*` (super_admin only) — see §3B.3 | P1 |
| Candidate Credential Login | Separate auth path for Hiring Mode: `candidate_id` + system-generated password (never self-registered), issued only after a company admin's shortlist action (§11.2) | P0 |

### 1.2 API Endpoints

| Method | Endpoint | Auth | Request Body | Success Response | Error Codes |
|---|---|---|---|---|---|
| POST | /auth/register | None | {email, password, name} | 201 {user_id, message} | 400 validation, 409 duplicate email |
| POST | /auth/login | None | {email, password} | 200 {access_token, refresh_token, user} | 401 invalid credentials, 403 unverified |
| POST | /auth/google | None | {google_id_token} | 200 {access_token, refresh_token, user} | 400 invalid token |
| POST | /auth/verify-otp | None | {email, otp} | 200 {verified: true} | 400 wrong OTP, 410 expired |
| POST | /auth/refresh | Refresh JWT | {} | 200 {access_token} | 401 expired/blacklisted |
| POST | /auth/logout | JWT | {} | 200 {message} | 401 unauthorized |
| POST | /auth/forgot-password | None | {email} | 200 {message} | 404 email not found |
| POST | /auth/reset-password | None | {token, new_password} | 200 {message} | 400 invalid/expired token |
| POST | /company/register | None | {company_name, admin_email, admin_password} | 201 {company_id, user_id} | 400 validation, 409 duplicate |
| POST | /company/login | None | {candidate_id, password} | 200 {access_token, campaign_id, campaign_slug} | 401 invalid credentials, 410 campaign deadline passed |

### 1.3 Database Schema — `users` table

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | Auto-generated UUID v4 |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | User email address |
| password_hash | VARCHAR(255) | NULLABLE | Bcrypt hash; NULL for OAuth-only users |
| name | VARCHAR(100) | NOT NULL | Display name |
| google_id | VARCHAR(100) | UNIQUE, NULLABLE | Google OAuth subject ID |
| is_verified | BOOLEAN | DEFAULT FALSE | Email OTP verified |
| role | ENUM('student','candidate','company_admin','super_admin') | DEFAULT 'student' | `student` = self-registered Prep Mode user, unlimited retakes. `candidate` = company-invited Hiring Mode user, created only via a company admin's invite, one attempt per campaign. `company_admin` = manages their company's campaigns in the Admin Panel. `super_admin` = platform owner, seeded at deployment (see §3B.3) |
| campaign_id | UUID, NULLABLE | FK → campaigns.id | Set only for `role = 'candidate'`; scopes this user to exactly one campaign's rounds and question sets |
| company_id | UUID, NULLABLE | FK → companies.id | Set only for `role = 'company_admin'`; scopes which company's campaigns this admin manages |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| last_login | TIMESTAMP | NULLABLE | Last successful login |

---

## Module 2 — Profile Management [REQUIRED]

### 2.1 Profile Data Model

| Field | Type | UI Element | Validation | Notes |
|---|---|---|---|---|
| full_name | string | Text input | 2–100 chars | Pre-filled from auth |
| phone | string | Tel input | E.164 format, optional | Used for notifications |
| date_of_birth | date | Date picker | Must be 16–50 years old | |
| city | string | Text input | Max 60 chars | |
| linkedin_url | string | URL input | Valid LinkedIn URL, optional | |
| github_url | string | URL input | Valid GitHub URL, optional | |
| preferred_job_role | string[] | Multi-select dropdown | 1–5 roles | Used for question targeting |
| experience_years | float | Slider 0–30 | 0–30 | 0 = fresher |
| skills | string[] | Tag input with autocomplete | 3–30 skills | Used by AI for question selection |
| education | object[] | Repeating form group | Degree, institution, year | Array of education entries |
| resume_headline | string | Textarea | Max 200 chars | Used in resume ATS analysis |
| avatar_url | string | Image upload | JPG/PNG, max 2MB | Stored in Cloudinary (free) |

### 2.2 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /profile/me | JWT | Fetch current user profile |
| PUT | /profile/me | JWT | Update profile fields (partial update supported) |
| POST | /profile/avatar | JWT | Upload profile picture (multipart/form-data) |
| GET | /profile/resume-history | JWT | List all uploaded resumes with analysis scores |
| DELETE | /profile/resume/{resume_id} | JWT | Delete a specific resume |

---

## Module 3 — AI Resume Analyzer [REQUIRED] [AI]

### 3.1 Feature Overview

The Resume Analyzer accepts PDF or DOCX uploads, parses them using a combination of rule-based extraction and Google Gemini 1.5 Flash (free API), and returns a structured analysis covering ATS compatibility, skill gap analysis, keyword density, grammar quality, and job-role match percentage.

### 3.2 Processing Pipeline

1. File received via multipart upload; stored temporarily in memory.
2. File type validated (PDF or DOCX only, max 5MB).
3. Text extracted: PyMuPDF for PDF, python-docx for DOCX.
4. Extracted text sent to Gemini 1.5 Flash with structured analysis prompt (see Section 3.4) — free API, no cost.
5. Gemini 1.5 Flash returns JSON with all analysis fields.
6. JSON stored in `resume_analyses` table; file stored in Cloudinary (free tier).
7. Response returned to client with full analysis.

### 3.3 Analysis Output Schema

| Output Field | Type | Description | Example Value |
|---|---|---|---|
| ats_score | integer 0–100 | ATS machine-readability score | 87 |
| overall_resume_score | integer 0–100 | Holistic resume quality score | 82 |
| job_fit_percentage | integer 0–100 | Match % to preferred job role from profile | 78 |
| skills_identified | string[] | Skills found in resume | ["Python","FastAPI","React","SQL"] |
| missing_skills | string[] | Skills expected for role but absent | ["Docker","CI/CD","Testing"] |
| recommended_skills | string[] | Skills to add for stronger fit | ["System Design","Redis","Testing"] |
| grammar_issues | object[] | Grammar errors with location and suggestion | [{line: 12, issue: "...", fix: "..."}] |
| keyword_density | object | Keyword → frequency map | {"Python": 5, "REST API": 3} |
| formatting_issues | string[] | Formatting problems detected | ["No consistent date format","Missing LinkedIn URL"] |
| strengths | string[] | What the resume does well | ["Well-structured","Good project descriptions"] |
| improvements | string[] | Specific actionable improvements | ["Add measurable outcomes","Include GitHub links"] |
| ai_summary | string | 2-paragraph narrative summary by Gemini 1.5 Flash | Plain text, ~150 words |
| experience_level_detected | string | Fresher / Junior / Mid / Senior | "Junior" |
| word_count | integer | Total word count of resume | 487 |
| page_count | integer | Number of pages | 1 |

### 3.4 Gemini 1.5 Flash Prompt Template

> **LLM Instruction:** Use the exact prompt below when calling Gemini 1.5 Flash (google-generativeai Python SDK) for resume analysis. Replace `{{RESUME_TEXT}}` with the extracted resume content and `{{JOB_ROLE}}` with the user's preferred job role from their profile.

```
SYSTEM INSTRUCTION (Gemini): You are an expert ATS recruiter and technical hiring manager with 15 years of experience in software engineering recruitment. Analyze the provided resume strictly and return your analysis as a JSON object matching the schema provided. Do not include any text outside the JSON.

USER: Analyze this resume for the role of "{{JOB_ROLE}}".

Resume Text: """{{RESUME_TEXT}}"""

Return JSON with these exact keys: ats_score, overall_resume_score, job_fit_percentage, skills_identified, missing_skills, recommended_skills, grammar_issues, keyword_density, formatting_issues, strengths, improvements, ai_summary, experience_level_detected, word_count, page_count.

Be strict: penalize vague bullet points, unexplained acronyms, missing metrics, and overuse of buzzwords without evidence.
```

---

## Module 4 — Aptitude Test Engine [REQUIRED]

> **Question sourcing (see §2.4 and Module 11):** In **Prep Mode**, all 25 questions are randomly drawn from the auto-generated public question dataset — no admin action required to populate or maintain it. In **Hiring Mode**, questions are drawn exclusively from the `campaign_id` the company's admin curated; that set is invisible to Prep Mode users and to every other company's campaigns.
>
> **Fair-usage monitoring:** Governed by Module 10 for the full duration of the test. **Prep Mode:** tab switches/fullscreen exits are only logged and shown to the candidate — never pause or exit the test. **Hiring Mode:** fullscreen and camera are mandatory, with progressive warnings and auto-submit on repeated violations.

### 4.1 Test Configuration

| Parameter | Value | Configurable? |
|---|---|---|
| Total questions per test | 25 | Admin configurable (10–50) |
| Time limit | 30 minutes | Admin configurable |
| Question selection | Random from question bank per category | Yes |
| Difficulty distribution | Easy 40%, Medium 40%, Hard 20% | Admin configurable |
| Passing score | 70% | Role-dependent, admin configurable |
| Negative marking | Off by default (-0.25 per wrong optional) | Admin toggle |
| Retake policy | Unlimited retakes for all users | N/A |
| Auto-submit | Yes — on timer expiry | Always on |

### 4.2 Question Categories & Sub-topics

| Category | Sub-topics | Question Count in Bank |
|---|---|---|
| Quantitative Aptitude | Percentages, Ratios, Time & Work, Speed & Distance, Profit & Loss, Simple & Compound Interest | 500+ |
| Logical Reasoning | Series completion, Blood relations, Directions, Coding-decoding, Syllogisms, Puzzles | 400+ |
| Verbal Ability | Reading comprehension, Sentence correction, Fill in the blanks, Synonyms & Antonyms, Idioms | 300+ |
| Analytical Reasoning | Data sufficiency, Cause & effect, Statement & assumptions, Critical reasoning | 300+ |
| Data Interpretation | Bar charts, Pie charts, Line graphs, Tables, Mixed DI sets | 250+ |

### 4.3 Question Schema (Database)

| Field | Type | Description |
|---|---|---|
| id | UUID | Question unique ID |
| category | ENUM | One of the 5 categories above |
| sub_topic | VARCHAR | Specific sub-topic |
| difficulty | ENUM('easy','medium','hard') | Difficulty level |
| question_text | TEXT | Full question with LaTeX math if needed |
| options | JSONB array | [{label: "A", text: "..."}, ...] — always 4 options |
| correct_option | CHAR(1) | "A", "B", "C", or "D" |
| explanation | TEXT | Step-by-step explanation shown after answer |
| tags | text[] | Additional topic tags for filtering |
| times_used | integer | Usage counter for fairness rotation |
| created_by | UUID | Admin who created the question — `NULL` for auto-generated Prep Mode questions |
| source | ENUM('auto_generated','campaign_curated') | `auto_generated` = ships with the public dataset, needs no admin. `campaign_curated` = created by a company admin for a specific campaign | 
| campaign_id | UUID, NULLABLE | FK → `campaigns.id`. `NULL` for the public Prep Mode pool; set for Hiring Mode questions so they are only served to candidates of that campaign |

### 4.4 UI State Machine

**States:** `IDLE → SETUP → IN_PROGRESS → PAUSED (optional) → SUBMITTED → RESULTS`

- **SETUP:** Display test rules, timer duration, category breakdown. User clicks Start.
- **IN_PROGRESS:** Show question number/total, countdown timer (red when <5 min), option buttons, navigation panel (grid of 25 circles: unanswered=gray, answered=green, bookmarked=yellow, skipped=orange), Bookmark button, Previous/Next buttons, Submit button.
- **SUBMITTED:** Backend scores test; show loading state.
- **RESULTS:** Per-category scores, correct/wrong breakdown, explanations for wrong answers, comparison to average, recommendation text.

---

## Module 5 — Technical Coding Round [REQUIRED]

> **Question sourcing (see §2.4 and Module 11):** Same split as the Aptitude Engine — Prep Mode draws from the auto-generated public DSA + SQL problem bank (no admin curation needed); Hiring Mode serves only that campaign's `campaign_id`-scoped problems. **Fair-usage monitoring:** governed by Module 10 through the whole coding round — **Prep Mode** only logs tab switches/fullscreen exits for the candidate's own awareness (never interrupts them); **Hiring Mode** enforces fullscreen + mandatory camera with progressive warnings and auto-submit/auto-disqualify on repeated or serious violations.

### 5.1 Feature Specifications

| Feature | Specification |
|---|---|
| Code Editor | Monaco Editor (same as VS Code) with syntax highlighting, autocomplete, multi-language support |
| Supported Languages | Python 3.11, Java 17, C++ 17, JavaScript (Node 20), SQL (PostgreSQL), Go 1.21, TypeScript |
| Question Type | `DSA` (Arrays, Strings, Trees, Graphs, DP, etc. — executed via Piston API) or `SQL` (schema-provided query-writing problems — executed against a sandboxed PostgreSQL instance seeded per-problem) |
| Execution Engine | Piston API for DSA (free, open-source, self-hostable, 70+ languages) — SQL problems run against an ephemeral, per-submission PostgreSQL sandbox seeded from `schema_setup_sql`, also free/self-hosted |
| Problem Difficulty | Easy / Medium / Hard; random assignment based on user's skill level |
| Time Limit per Problem | 45 minutes (configurable by admin) |
| Test Cases | 3 visible sample cases + 7 hidden evaluation cases per problem |
| Custom Input | User can provide custom stdin input for manual testing |
| Code Submission | Runs against all 10 test cases; partial scoring for partial passes |
| AI Code Review | [AI] Gemini 1.5 Flash (free API) reviews submitted code for quality, style, optimization after submission |
| Language Switching | User can switch language; code clears with confirmation modal |
| Execution Metrics | Show runtime (ms), memory usage (KB), test case pass/fail breakdown |
| Code Persistence | Auto-save to localStorage every 30 seconds; restore on reload |

### 5.2 Problem Schema

| Field | Type | Description |
|---|---|---|
| id | UUID | Problem unique ID |
| title | VARCHAR(200) | Problem title |
| difficulty | ENUM | easy / medium / hard |
| problem_statement | TEXT (Markdown) | Full problem with examples, constraints, I/O format |
| function_signature | JSONB | Per-language starter code template |
| test_cases_visible | JSONB | Array of 3 {input, expected_output} objects |
| test_cases_hidden | JSONB (encrypted) | Array of 7 hidden {input, expected_output} objects |
| time_limit_ms | integer | Execution time limit per test case |
| memory_limit_kb | integer | Memory limit per test case |
| tags | text[] | Topics: Arrays, DP, Graphs, etc. |
| accepted_languages | text[] | Subset of supported languages if restriction needed |
| editorial_solution | TEXT | Admin-only solution explanation |
| question_type | ENUM('dsa','sql') | Distinguishes DSA problems (Piston execution) from SQL query-writing problems |
| schema_setup_sql | TEXT, NULLABLE | For `question_type='sql'` only — DDL/seed script run in the sandbox before the candidate's query executes |
| source | ENUM('auto_generated','campaign_curated') | `auto_generated` = public Prep Mode dataset, no admin needed. `campaign_curated` = added by a company admin for a specific campaign |
| campaign_id | UUID, NULLABLE | FK → `campaigns.id`; `NULL` for the public pool, set for campaign-scoped Hiring Mode problems |

### 5.3 AI Code Review Prompt

> **LLM Instruction:** Send this prompt to Gemini 1.5 Flash (google-generativeai SDK) after user submits code. Replace placeholders with actual values.

```
SYSTEM: You are a senior software engineer conducting a code review. Review the submitted solution and return a JSON object with keys: overall_score (0-100), time_complexity, space_complexity, code_quality_score (0-100), readability_score (0-100), correctness_score (0-100), strengths (string[]), issues (string[]), optimization_suggestions (string[]), refactored_snippet (string, optional, only if a major improvement is possible).

USER: Problem: {{PROBLEM_TITLE}}. Language: {{LANGUAGE}}. Code: ```{{USER_CODE}}```. Test results: {{PASS_COUNT}}/{{TOTAL_COUNT}} test cases passed.
```

---

## Module 6 — AI Interview Engine [REQUIRED] [AI] [REALTIME]

> **Fair-usage monitoring:** Module 10 remains active for the entire interview, in the same non-blocking (Practice) vs enforced (Hiring) split as the other rounds. The webcam feed already captured for emotion/eye-contact/posture analysis (§6.2) is additionally passed through the Module 10 cheat-detection layer (multiple-faces check, no-face check, phone/device detection) in parallel — no second camera stream is needed; in Prep Mode this is purely informational, in Hiring Mode it can trigger warnings/auto-disqualification.

### 6.1 Interview Types

| Interview Type | Focus Areas | Question Count | Duration |
|---|---|---|---|
| HR / Behavioral | Self-intro, motivation, teamwork, conflict resolution, career goals | 8–12 | 20–30 min |
| Technical — General | DSA, OS, DBMS, Networking, OOP based on resume skills | 10–15 | 30–45 min |
| Technical — Role-Specific | Framework-specific deep dives based on job role | 10–15 | 30–45 min |
| Managerial | Leadership, project ownership, stakeholder management, decision-making | 8–10 | 25–35 min |
| Company-Specific | Company values, culture fit, company-specific tech stack questions | 8–12 | 25–35 min |
| Full End-to-End | All of the above combined in one session | 25–40 | 55–75 min |

### 6.2 Technical Components

| Component | Technology | Role in Interview |
|---|---|---|
| AI Avatar (Visual) | Three.js custom 3D animated character (free) | 3D lip-synced avatar rendered in browser using Three.js — no external avatar service |
| Avatar Voice (Output) | Web Speech API — SpeechSynthesis (browser built-in, free) | Built into every modern browser; zero API cost; lip-sync driven by word timing events |
| User Speech (Input) | Browser MediaRecorder API → local Whisper STT (free) | Records mic audio per turn; sent to server running openai/whisper library locally |
| Question AI Brain | Google Gemini 1.5 Flash API (free tier, streaming) | 15 RPM free; generates dynamic, context-aware follow-up questions via streaming |
| Emotion Detection | face-api.js (browser-side, free) | Runs entirely in browser using TensorFlow.js models; classifies emotion every 5s from webcam — no server round-trip |
| Eye Contact | MediaPipe Face Mesh (browser-side JS) | Tracks iris position; calculates gaze deviation from camera center |
| Posture Analysis | MediaPipe Pose (browser-side JS) | Detects shoulder alignment, head tilt, lean angle |
| Hand Gesture | MediaPipe Hands (browser-side JS) | Tracks hand landmark movement frequency |
| Session Recording | MediaRecorder API (video+audio) | Full session recorded to Blob; uploaded to Cloudinary free tier on completion |
| Real-time Communication | WebSocket (/ws/interview/{session_id}) | Bi-directional for transcript, emotion data, avatar state |

### 6.3 Gemini 1.5 Flash Dynamic Question Generation Prompt

> **LLM Instruction:** This is the core interview AI prompt. It runs at the start of the interview and is updated with each answer. The conversation history is maintained in the messages array.

```
SYSTEM: You are an expert AI interviewer for the role of {{JOB_ROLE}} at a top tech company. You are conducting a {{INTERVIEW_TYPE}} interview. Candidate's resume summary: {{RESUME_SUMMARY}}. Detected skills: {{SKILLS_LIST}}.

Rules:
(1) Ask one question at a time.
(2) Analyze each answer before generating the next question.
(3) Ask relevant follow-up questions based on what the candidate mentions — probe for depth, not breadth.
(4) If the candidate mentions a technology, ask a deeper technical question about it.
(5) If an answer is weak, ask the same concept differently.
(6) After {{QUESTION_COUNT}} questions, end with 'Thank you for your time. The interview is now complete.'
(7) Vary question types: conceptual, scenario-based, opinion, and example-based.
(8) Never repeat a question already asked.
(9) Return only the next question as plain text — no labels, no preamble.
```

### 6.4 Answer Evaluation Schema (per question, stored post-interview)

| Field | Type | Description |
|---|---|---|
| question_id | UUID | Reference to the question asked |
| question_text | TEXT | Exact question asked by AI |
| answer_transcript | TEXT | Whisper-transcribed user answer |
| answer_duration_seconds | integer | How long the candidate took to answer |
| relevance_score | integer 0–100 | How relevant the answer was to the question |
| depth_score | integer 0–100 | Conceptual depth demonstrated |
| clarity_score | integer 0–100 | Clarity and structure of explanation |
| confidence_score | integer 0–100 | Inferred from voice tone and pacing |
| technical_accuracy | integer 0–100 | Correctness of technical claims (for tech questions) |
| filler_word_count | integer | Count of um, uh, like, actually, you know |
| emotion_during_answer | ENUM | Dominant emotion from face-api.js (browser, free) during this answer |
| eye_contact_percentage | float | % of answer duration with maintained gaze |
| ai_feedback_text | TEXT | Gemini 1.5 Flash generated specific feedback for this answer (free) |

---

## Module 7 — Post-Interview AI Analysis [REQUIRED] [AI] [ASYNC]

### 7.1 Analysis Pipeline

After the interview session ends, a Celery background worker processes the complete session. This job runs asynchronously and targets completion within 45–60 seconds. The user sees a real-time step-by-step processing screen showing which stage is currently running (e.g., 'Transcribing audio...', 'Evaluating answers...', 'Generating report...'). The dashboard Download Report button becomes active the moment the job completes — no email required.

1. Retrieve full transcript from MongoDB.
2. Send each Q&A pair to Gemini 1.5 Flash for individual answer evaluation (free API; batch sequentially).
3. CV analysis already completed in-browser (face-api.js + MediaPipe); aggregate stored frame data from MongoDB.
4. Run local Whisper (openai/whisper Python library) on full audio for communication analysis (grammar, pace, fillers) — zero API cost.
5. Aggregate all sub-scores into overall scores using weighted formula (Section 7.3).
6. Generate executive summary and recommendations via Gemini 1.5 Flash (free).
7. Generate personalized 6-week learning roadmap via Gemini 1.5 Flash (free).
8. Trigger PDF report generation (Section 9).
9. Mark session status as 'analyzed'; emit a WebSocket event to the client so the dashboard instantly unlocks the Download Report button without any page refresh or email.

### 7.2 Scoring Dimensions

| Score Category | Sub-Scores Included | Weight in Overall Score |
|---|---|---|
| Technical Knowledge | Answer accuracy, concept depth, explanation quality, code quality | 25% |
| Communication | Grammar, fluency, vocabulary, sentence structure, speaking speed, pause analysis | 20% |
| Behavioral / HR | STAR method usage, leadership indicators, teamwork examples, professionalism | 15% |
| Body Language | Eye contact, posture, head movement, hand gestures, facial stability | 15% |
| Confidence & Delivery | Voice tone, filler word count, response time, emotional stability | 15% |
| Problem Solving | Coding round performance, analytical reasoning, logical structuring | 10% |

### 7.3 Overall Score Calculation

> **LLM Instruction:** Implement this scoring formula exactly.

```
overall_score = (technical_score * 0.25) + (communication_score * 0.20) + (behavioral_score * 0.15) + (body_language_score * 0.15) + (confidence_score * 0.15) + (problem_solving_score * 0.10)
```

Each sub-score is an integer 0–100. Overall score is rounded to 1 decimal place.

### 7.4 Hiring Recommendation Logic

| Overall Score Range | Hiring Recommendation | Badge Color |
|---|---|---|
| 90–100 | Strongly Recommended — Exceptional Candidate | Green |
| 80–89 | Recommended — Suitable for Interview Round | Light Green |
| 70–79 | Conditionally Recommended — Minor Improvements Needed | Yellow |
| 60–69 | Not Recommended Now — Significant Improvement Required | Orange |
| 0–59 | Not Ready — Fundamental Gaps Identified | Red |

---

## Module 8 — User Dashboard [REQUIRED]

> **This module is Prep Mode only.** Widgets below live at `/dashboard` for `student` users. Hiring Mode `candidate` users get the intentionally stripped-down Campaign Dashboard at `/c/:campaign_slug/dashboard` instead (§3B.2, §6.3) — current campaign's rounds, deadline countdown, and completion status only; no score trend chart, no roadmap, no cross-campaign history, since a candidate has exactly one attempt at one campaign.

### 8.1 Dashboard Widgets

| Widget | Data Source | Update Frequency | Description |
|---|---|---|---|
| Overall Progress Score | Latest interview session | Per interview | Large circular gauge showing current hiring readiness % |
| Score Trend Chart | All past sessions | Per interview | Line chart: overall score over time (last 10 sessions) |
| Skill Radar Chart | Latest analysis | Per interview | Hexagonal radar with 6 axes: Technical, Communication, Behavioral, Body Language, Confidence, Problem Solving |
| Recent Interviews | interview_sessions table | Real-time | List of last 5 sessions with date, type, score, Replay button |
| Resume Score Card | resume_analyses table | Per upload | ATS score, resume score, job fit % with color coding |
| Aptitude History | aptitude_results table | Per test | Bar chart of category scores across last 5 tests |
| Coding Streak | coding_results table | Daily | GitHub-style heatmap of coding activity |
| Learning Roadmap Progress | roadmaps table | Weekly | Week-by-week checklist with completion toggle |
| Quick Action Buttons | Static | N/A | Start New Interview, Upload Resume, Take Aptitude Test, View Reports |
| Download Report Button | reports table + WebSocket | Real-time unlock | Appears on dashboard automatically once post-interview analysis completes (~60s after interview ends). Shows as disabled/loading spinner while processing; activates with a green 'Download Report' CTA when PDF is ready. |
| Notifications Bell | notifications table | Real-time (WebSocket) | Report ready alert, streak reminder |

---

## Module 9 — PDF Report Generation [REQUIRED] [AI]

> **Mode difference (§3B.1):** The full 17-section report below is generated for **Prep Mode students**. **Hiring Mode candidates** instead get a shorter **Campaign Report** — sections 1–9 and 17 (identity, executive summary, score table, hiring recommendation, phase-by-phase results, and final recommendation) plus a **Proctoring Summary** (integrity score, violation log, `integrity_flag` status) inserted after section 4 — scoped strictly to that one campaign attempt, with no learning-roadmap or personal-history sections since candidates don't retake or track progress over time.

### 9.1 Report Sections

| Section # | Section Name | Content | Generated By |
|---|---|---|---|
| 1 | Cover Page | Candidate name, role, interview ID, date, duration, interview type | Template |
| 2 | Executive Summary | 2-paragraph AI narrative of overall performance | Gemini 1.5 Flash (free) |
| 3 | Overall Performance Table | Score table: Resume, Aptitude, Coding, Technical, HR, Communication, Body Language, Confidence, Overall | Computed scores |
| 4 | Hiring Recommendation | Badge + Hiring Readiness stars (out of 5) | Recommendation logic |
| 5 | Phase 1 — Resume Analysis | ATS score, skills identified, missing skills, AI feedback strengths/improvements | resume_analyses |
| 6 | Phase 2 — Aptitude Assessment | Category breakdown, score, time taken, AI insights | aptitude_results |
| 7 | Phase 3 — Coding Assessment | Language, score, evaluation sub-scores, AI code review | coding_results |
| 8 | Phase 4 — Technical Interview | Knowledge area scores, Q count, follow-up count, AI evaluation | interview_analysis |
| 9 | Phase 5 — HR & Behavioral | Behavioral competency scores, STAR method usage, AI observations | interview_analysis |
| 10 | Communication Analysis | Grammar, fluency, vocabulary, WPM, filler word breakdown | local Whisper + Gemini (both free) |
| 11 | Computer Vision Analysis | Eye contact %, posture score, emotion distribution, hand gesture notes | MediaPipe + face-api.js (browser, free) |
| 12 | Emotion Timeline | Detected emotion per 5-second interval plotted as timeline chart | face-api.js (browser, free) |
| 13 | Session Timeline Highlights | Timestamped notable moments (positive and negative) | Gemini 1.5 Flash + CV stored data (free) |
| 14 | Strengths Summary | Top 7 identified strengths with brief explanation | Gemini 1.5 Flash (free) |
| 15 | Areas for Improvement | Top 7 specific, actionable improvement areas | Gemini 1.5 Flash (free) |
| 16 | Personalized Learning Roadmap | 6-week week-by-week study plan | Gemini 1.5 Flash (free) |
| 17 | Final Recommendation | Hiring readiness score, suitability statement, placement readiness stars | Computed + Gemini 1.5 Flash (free) |

### 9.2 PDF Generation Technical Approach

- Use WeasyPrint (Python) to generate PDF from an HTML/CSS template.
- HTML template uses Jinja2 for dynamic data injection.
- Charts (radar, line, bar) are pre-rendered as SVG and embedded inline.
- Final PDF stored in Cloudinary free tier (25GB/month free); a direct Cloudinary URL returned.
- URL pushed to dashboard in real-time via WebSocket — user clicks Download Report directly from the dashboard. No email, no paid storage needed.

---

## Module 10 — Fair-Usage Monitoring & Proctoring Engine [REQUIRED] [CV]

### 10.1 Purpose & Scope

This module has **two very different behavior profiles depending on the mode**, sharing the same underlying event-detection mechanics (fullscreen, tab-switch, webcam checks). This distinction is the most important thing to understand about this module — **do not apply the same enforcement logic to both modes.**

| | Prep Mode | Hiring Mode |
|---|---|---|
| **Purpose** | Self-awareness — help the student build exam discipline by showing them their own distraction/violation pattern | Real proctoring — protect the integrity of a hiring decision the company is making |
| **Who sees the violations** | Only the candidate themselves, on their own results screen | The company's admin, in the Admin Panel, tied to that candidate's shortlist record |
| **Does it stop the test?** | **No.** The test is never interrupted, exited, paused, or auto-submitted because of a tab switch or fullscreen exit. The candidate can keep working normally no matter how many events are logged. | **Yes.** Enforced with a progressive warning policy and optional auto-disqualification (§10.4). |
| **Camera requirement** | Fully optional | Mandatory |
| **Consequence of violations** | None — informational only, for the candidate's own benefit | Logged against the candidate's shortlist record; admin can manually disqualify, or the company admin can configure specific events to auto-disqualify |

Everything runs client-side (browser APIs + browser-side ML models) so it is 100% free and requires no server-side video streaming in either mode.

### 10.2 Prep Mode — Fair-Usage Awareness (Non-Blocking)

Prep Mode exists to help a student build good habits, not to police them. Nothing in this section ever exits, pauses, or force-submits the test.

| Feature | Behavior | Applies To |
|---|---|---|
| Fullscreen Suggestion | Test view offers a "Start in Fullscreen (recommended)" prompt at the start. Optional — candidate can decline and take the test in a normal browser tab. | Aptitude, Coding, Interview |
| Tab-Switch / Window-Blur Logging | Listens to Page Visibility API (`visibilitychange`) and window `blur`/`focus` events. Each switch-away is logged and a small **non-blocking counter badge** (e.g., "Tab switches: 2") stays visible on screen so the candidate can see their own count in real time. No modal interrupts them, no action is required from them. | Aptitude, Coding, Interview |
| Fullscreen-Exit Logging | If the candidate opted into fullscreen and then exits it, that event is logged the same way as a tab switch — displayed in the same counter, no forced re-entry. | Aptitude, Coding, Interview |
| Optional Webcam Self-Check | Candidate may turn on their camera if they want the AI to note distraction signals (looking away a lot, leaving the frame). Entirely opt-in; skipping it has zero effect on the test. | Aptitude, Coding, Interview |
| End-of-Test Summary | On the results screen, the candidate sees a simple, private summary: "You switched tabs 3 times and left fullscreen once during this test — staying focused like this in a real interview will help your evaluation." Purely a self-improvement nudge, never shown to anyone else. | Aptitude, Coding, Interview |

> **Explicitly not present in Prep Mode:** progressive warning modals, forced fullscreen re-entry, auto-submit/force-exit on repeated violations, camera mandate, or any score penalty. A Prep Mode candidate's test always runs to completion exactly as they choose to take it.

### 10.3 Hiring Mode — Enforced Proctoring

Hiring Mode is where real enforcement lives, because a real shortlisting decision depends on the result being honest.

| Feature | Behavior | Priority |
|---|---|---|
| Fullscreen Enforcement | Mandatory. Test view requests `element.requestFullscreen()` on start; the timer/editor is blurred and paused with a "Return to fullscreen to continue" overlay whenever fullscreen is exited | P0 |
| Tab-Switch / Window-Blur Detection | Same detection mechanism as Prep Mode, but here each event increments a violation counter that drives the warning policy below | P0 |
| Progressive Warning Policy | **1st violation** (tab switch OR fullscreen exit): dismissible warning modal, violation counter shown, logged to the candidate's shortlist record. **2nd violation**: stronger warning modal — "One more violation will end your test." **3rd violation (i.e., 2 or more violations after the first warning)**: session is auto-submitted/force-ended and flagged for admin review | P0 |
| Mandatory Camera Permission | Candidate cannot proceed without granting camera access — this is a condition of taking an campaign-issued test | P0 |
| AI Webcam Cheat Detection | Runs entirely in-browser via TensorFlow.js + COCO-SSD (free) sampling the webcam every ~5 seconds: (a) **no face detected** for a sustained period, (b) **multiple faces** in frame, (c) **phone/external device** (cell phone, tablet, book, laptop other than the test device) detected in frame. Each flagged frame is logged as a violation event against the candidate's shortlist record | P0 |
| Prolonged Gaze-Away Detection | Reuses MediaPipe Face Mesh (already used in Module 6, §6.2) to flag sustained gaze away from the screen beyond a configurable threshold | P1 |
| Copy-Paste / Right-Click Restriction | Disables clipboard paste into answer fields and right-click context menu during Aptitude and Coding rounds; configurable per campaign | P1 |
| Auto-Disqualification Rules (Admin-Configurable) | Per campaign, the admin can optionally mark specific event types as **auto-disqualifying** (e.g., "multiple faces detected" or "device detected" instantly sets `shortlist_status = disqualified`), instead of only being force-ended and left for manual review. Off by default — the company admin opts in per campaign (§11.4). | P0 |
| Admin Review | Every flagged Hiring Mode session — whether auto-disqualified or just warned/terminated — surfaces in the Admin Panel's Proctoring Violation Monitor (§17.1) with timestamps, violation type, and (since camera is mandatory) the flagged webcam frame thumbnail, so the admin can confirm, override, or manually disqualify before finalizing a shortlist decision | P0 |

### 10.4 Hiring Mode Progressive Warning State Machine

**States:** `MONITORING → WARNING_1 → WARNING_2 → TERMINATED` (plus an immediate `AUTO_DISQUALIFIED` path if the company admin has enabled auto-disqualification for the triggering event type — see §10.3)

- **MONITORING:** Default state; fullscreen active, camera live, violation counter = 0.
- **WARNING_1:** Triggered by the first tab switch or fullscreen exit. Modal shown: *"Leaving fullscreen or switching tabs is recorded and visible to the company reviewing this test. 1 warning issued — 1 more warning and your test will be auto-submitted."* Candidate must click "Return to Test" (which re-triggers fullscreen) to resume.
- **WARNING_2:** Triggered by the second violation. Modal shown: *"Final warning. One more tab switch or fullscreen exit will end this test immediately and notify the company admin."*
- **TERMINATED:** Triggered by the **third violation (i.e., 2 or more violations after the first warning)**. Test is force-submitted with whatever answers exist so far; session is flagged `terminated_for_violation = true` on the candidate's shortlist record; candidate sees a neutral "Your test has ended due to repeated fair-usage violations. The company admin has been notified." screen; admin is notified for review.
- **AUTO_DISQUALIFIED:** Triggered instantly, bypassing the warning sequence, if the company admin has configured this event type (e.g., multi-face or device-detected) as auto-disqualifying. Candidate's `shortlist_status` is set to `disqualified` immediately; admin sees the reason in the Proctoring Violation Monitor and can still manually reverse it.

### 10.5 Proctoring Event Schema (Database)

| Field | Type | Description |
|---|---|---|
| id | UUID | Event unique ID |
| session_id | UUID | FK → aptitude_sessions / coding_submissions / interview_sessions |
| session_type | ENUM('aptitude','coding','interview') | Which round the event occurred in |
| mode | ENUM('prep','hiring') | Determines whether this event was purely informational (`prep`, tied to a `student`) or enforcement-driving (`hiring`, tied to a `candidate`'s campaign attempt) |
| event_type | ENUM('tab_switch','fullscreen_exit','no_face','multi_face','device_detected','gaze_away','terminated','auto_disqualified') | Violation category |
| timestamp | TIMESTAMP | When the event occurred |
| frame_snapshot_url | VARCHAR, NULLABLE | Cloudinary URL of the flagged webcam frame (free tier) — only ever populated in Hiring Mode; Prep Mode never uploads or stores webcam frames, even when the optional self-check camera is on (analysis is transient/on-device only) |
| severity | ENUM('logged_only','warning_1','warning_2','terminated','auto_disqualified') | `logged_only` = Prep Mode (no consequence). The rest are Hiring Mode enforcement stages |
| candidate_credentials_id | UUID, NULLABLE | FK → candidate_credentials.id — set only in Hiring Mode, links the violation to the candidate's shortlist record so the admin can see it |

### 10.6 Integrity Score Calculation

`integrity_score = 100 − (tab_switch_or_fullscreen_events × 15) − (no_face_events × 5) − (multi_face_events × 25) − (device_detected_events × 25)`, floored at 0.

- **Prep Mode:** shown only to the candidate themselves, as a private self-awareness metric on their own results screen. Never used to alter their score, never shown to anyone else, never blocks anything.
- **Hiring Mode:** shown to the admin alongside the candidate's actual test score in the Proctoring Violation Monitor and candidate results view, to support (not silently replace) the admin's shortlist/disqualify decision.

---

## Module 11 — Hiring Mode: Companies, Campaigns & Candidate Access [REQUIRED]

### 11.1 Concept

Module 11 is what turns the same product into a recruiting tool, built entirely on the roles and routes defined in §3B. A **Company Admin** manages everything from the Admin Panel (§17) — no separate app. Prep Mode continues to run fully automated with the pre-seeded public dataset and needs zero admin involvement.

A **Campaign** is the core hiring object: one campaign = one job role, one deadline, one set of active rounds, one question set, one batch of invited candidates. A company can run multiple campaigns in parallel (e.g., "Backend SDE-1 — Bangalore" and "Frontend Intern — Remote").

### 11.2 Company & Campaign Flow

| Step | Actor | Action |
|---|---|---|
| 1 | Company Admin | Registers at `/company/register`; `role = company_admin` |
| 2 | Company Admin | Creates a **Campaign** in the Admin Panel (`/admin/campaigns`) — job role, active rounds, deadline, score weights (§3B.4), proctoring strictness including auto-disqualify rules |
| 3 | Company Admin | Bulk-uploads candidate resumes for this campaign (or candidates apply via a public campaign application link) |
| 4 | Company Admin | Uses the **Resume Shortlisting Engine** (§11.3, extends Module 3) to shortlist candidates before any test is unlocked |
| 5 | Company Admin | Curates an **Aptitude Question Set** and/or **Coding Question Set** (DSA + SQL) scoped to this campaign via the Question Set Manager (§17.1) |
| 6 | Platform | Auto-generates each shortlisted candidate a `candidate_id` + temporary password (§3B.3) and emails it with the `/company/login` URL and deadline — never the candidate's own self-registered login |
| 7 | Candidate | Logs in with the issued `candidate_id` + password at `/company/login`; sees **only** this campaign's question sets and rounds (`/c/:campaign_slug/...`), routed through Module 10's strict proctoring throughout, **one attempt only** |
| 8 | Company Admin | Monitors real-time completion at `/admin/campaigns/:id/candidates`, reviews proctoring flags, then marks each candidate Selected / Rejected / Waitlisted |

### 11.3 Resume Shortlisting Engine (Admin-Side, extends Module 3)

| Feature | Description |
|---|---|
| Bulk Resume Ingestion | Admin uploads multiple resumes (ZIP or multi-file) for a specific campaign, or candidates submit via a campaign-specific public application link |
| Automatic AI Scoring | Every resume runs through the existing Gemini 1.5 Flash resume analysis pipeline (§3.2–§3.4) against the campaign's target job role — ATS score, job-fit %, skills match |
| Ranked Candidate List | Admin sees all candidates for a campaign sorted by `job_fit_percentage` / `ats_score`, with filters (min score, required skills, experience range) |
| Shortlist / Reject Action | Admin marks each candidate `shortlisted`, `rejected`, or `pending`; only `shortlisted` candidates receive campaign login credentials |
| Bulk Shortlist Threshold | Admin can set a rule (e.g., "auto-shortlist all candidates with job_fit ≥ 75%") to speed up high-volume screening |

### 11.4 Campaign & Question Set Scoping

| Field | Type | Description |
|---|---|---|
| id | UUID | Campaign unique ID |
| company_id | UUID | FK → companies.id |
| slug | VARCHAR, UNIQUE | Used in candidate-facing routes: `/c/:campaign_slug/...` |
| job_role | VARCHAR | Target role this campaign is hiring for |
| active_rounds | text[] | Subset of `('aptitude','coding','interview')` — determines which routes are unlocked and which score-weighting formula applies (§3B.4) |
| interview_type | ENUM | Fixed by the admin from Module 6's 6 types — candidates in Hiring Mode do not choose |
| score_weights | JSONB | e.g., `{"aptitude": 0.30, "coding": 0.30, "interview": 0.40}` — defaults per §3B.4, admin-overridable |
| deadline | TIMESTAMP | After this, `/c/:campaign_slug/...` routes reject new attempts |
| auto_disqualify_events | text[], NULLABLE | Which Module 10 event types (e.g., `multi_face`, `device_detected`) should instantly disqualify a candidate rather than just warn/flag. Empty by default — admin opts in per campaign (see §10.3) |
| created_by | UUID | Company admin who created it |
| is_active | BOOLEAN | Inactive campaigns reject new candidate logins |

Questions/problems with a non-null `campaign_id` (Module 4 §4.3, Module 5 §5.2) are served **exclusively** to candidates authenticated for that specific campaign — they never appear in the public Prep Mode pool, and no other campaign's (or company's) candidates can see them.

### 11.5 Database Additions

| Table Name | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|
| companies | UUID | — | Company accounts using Hiring Mode |
| campaigns | UUID | company_id → companies | One hiring campaign — job role, active rounds, weights, deadline, proctoring rules (§11.4) |
| candidate_credentials | UUID | campaign_id → campaigns, resume_id → resumes | System-generated `candidate_id` + password issued to shortlisted candidates; tracks `shortlist_status` and `used_at` |
| campaign_questions / campaign_problems | UUID | campaign_id → campaigns | Campaign-scoped Aptitude questions and Coding (DSA/SQL) problems |
| selection_decisions | UUID | campaign_id → campaigns, candidate_credentials_id | Final Selected / Rejected / Waitlisted decision + admin notes |

---

## PART 4 — COMPLETE API REFERENCE

---

## 10. Complete API Endpoint Reference

### 10.1 Resume API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /resume/upload | JWT | Upload PDF/DOCX; trigger AI analysis [ASYNC] |
| GET | /resume/analysis/{analysis_id} | JWT | Fetch analysis result |
| GET | /resume/list | JWT | List all user resumes |
| DELETE | /resume/{resume_id} | JWT | Delete resume and its analysis |
| GET | /resume/download/{resume_id} | JWT | Get Cloudinary URL for resume download (free) |

### 10.2 Aptitude API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /aptitude/start | JWT | Create a new test session; returns 25 randomized questions |
| POST | /aptitude/submit | JWT | Submit answers {session_id, answers: [{q_id, selected_option}]}; returns score |
| GET | /aptitude/results/{session_id} | JWT | Fetch detailed results with explanations |
| GET | /aptitude/history | JWT | List all past test sessions |
| POST | /aptitude/bookmark | JWT | Bookmark a question {question_id} |

### 10.3 Coding API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /coding/problem | JWT | Get a random problem (optionally: ?difficulty=medium&language=python) |
| POST | /coding/run | JWT | Run code against visible test cases {problem_id, language, code, stdin} |
| POST | /coding/submit | JWT | Submit code against all test cases; trigger AI review [ASYNC] |
| GET | /coding/submission/{submission_id} | JWT | Get submission result + AI code review |
| GET | /coding/history | JWT | List all coding submissions |

### 10.4 Interview API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /interview/create | JWT | Create interview session {type, job_role}; returns session_id |
| GET | /interview/session/{session_id} | JWT | Get session status and metadata |
| POST | /interview/end/{session_id} | JWT | End session; trigger post-interview analysis [ASYNC] |
| GET | /interview/analysis/{session_id} | JWT | Fetch post-interview analysis results |
| GET | /interview/list | JWT | List all past interview sessions |
| GET | /interview/replay/{session_id} | JWT | Get Cloudinary URL for session recording + transcript for replay (free) |
| WS | /ws/interview/{session_id} | JWT (query param) | WebSocket for real-time interview: send/receive transcript, emotion data, avatar state |

### 10.5 Report API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /report/{session_id} | JWT | Fetch full report data as JSON |
| GET | /report/{session_id}/pdf | JWT | Get Cloudinary URL for PDF download (generates if not exists) — free storage |
| GET | /report/list | JWT | List all generated reports |

### 10.6 Proctoring API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /proctoring/session/start | JWT | Initialize a proctoring session for a given round {session_id, session_type, camera_enabled} |
| POST | /proctoring/event | JWT | Log a violation event {session_id, event_type, frame_snapshot (optional)} |
| GET | /proctoring/session/{session_id} | JWT | Get violation count, current warning state, and integrity score |
| POST | /proctoring/terminate/{session_id} | JWT | Force-end a session after the 3rd violation; triggers auto-submit of the underlying round |
| GET | /admin/proctoring/flagged | JWT (company_admin) | List all Hiring Mode sessions with violations for review |

### 10.7 Company / Campaign Admin API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /company/register | None | Company admin self-registers (or is created by super_admin); creates `companies` row + `company_admin` user |
| GET | /admin/companies/{company_id} | JWT (company_admin) | Get company account details |
| POST | /admin/companies/{company_id}/campaigns | JWT (company_admin) | Create a new hiring campaign under this company (job role, active rounds, score weights, deadline, proctoring rules — §11.4) |
| POST | /admin/campaigns/{campaign_id}/resumes | JWT (company_admin) | Bulk upload/ingest candidate resumes for this campaign |
| GET | /admin/campaigns/{campaign_id}/candidates | JWT (company_admin) | List candidates for this campaign ranked by AI resume score, with filters |
| POST | /admin/campaigns/{campaign_id}/candidates/{candidate_id}/shortlist | JWT (company_admin) | Mark a candidate shortlisted/rejected; shortlisting auto-generates and emails their `candidate_id` + password |
| POST | /admin/campaigns/{campaign_id}/questions | JWT (company_admin) | Add a question/problem (Aptitude or Coding — DSA/SQL) to this campaign's question set |
| GET | /admin/campaigns/{campaign_id}/results | JWT (company_admin) | View all candidate results, scores, and integrity scores for this campaign |
| POST | /admin/campaigns/{campaign_id}/candidates/{candidate_id}/decision | JWT (company_admin) | Record final Selected / Rejected / Waitlisted decision + notes |
| POST | /company/login | None (candidate_id + password in body) | Candidate exchanges their issued `candidate_id` + password for a session token scoped to exactly one campaign |

---

## PART 5 — COMPLETE DATABASE SCHEMAS

---

## 11. Database Schema Reference

### 11.1 PostgreSQL Tables Summary

| Table Name | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|
| users | UUID | — | Authentication and account management |
| profiles | UUID | user_id → users | Extended profile data |
| resumes | UUID | user_id → users | Uploaded resume files (Cloudinary URLs — free) |
| resume_analyses | UUID | resume_id → resumes | Gemini 1.5 Flash analysis output (JSONB) |
| aptitude_sessions | UUID | user_id → users | Test sessions and questions selected |
| aptitude_results | UUID | session_id → aptitude_sessions | Submitted answers and scores |
| coding_problems | UUID | — | Problem bank |
| coding_submissions | UUID | user_id, problem_id | Code submissions and Piston API results (free) |
| interview_sessions | UUID | user_id → users | Interview session metadata |
| interview_analyses | UUID | session_id → interview_sessions | Post-interview computed scores (JSONB) |
| reports | UUID | session_id → interview_sessions | Generated PDF report metadata (Cloudinary URL — free) |
| roadmaps | UUID | user_id → users | 6-week learning roadmap (JSONB) |
| notifications | UUID | user_id → users | In-app notification queue |
| admin_questions | UUID | — | Aptitude question bank (public `auto_generated` pool + `campaign_curated`, see §4.3) |
| proctoring_events | UUID | session_id (polymorphic: aptitude/coding/interview) | Fair-usage violation log — tab switches, fullscreen exits, no-face/multi-face/device-detected (Module 10) |
| companies | UUID | — | Company/college accounts running Hiring Mode (Module 11) |
| campaigns | UUID | company_id → companies | One hiring campaign — job role, active rounds, weights, deadline, proctoring rules (§11.4) |
| candidate_credentials | UUID | campaign_id → campaigns, resume_id → resumes | System-generated candidate_id + password, shortlist status, usage tracking |
| campaign_questions / campaign_problems | UUID | campaign_id → campaigns | Campaign-scoped Aptitude questions and Coding (DSA/SQL) problems |

### 11.2 MongoDB Collections

| Collection | Document Structure | Purpose |
|---|---|---|
| interview_transcripts | {session_id, turns: [{role, text, timestamp, emotion, eye_contact}]} | Full interview Q&A with per-turn metadata |
| webcam_analysis_frames | {session_id, frames: [{timestamp, emotion, gaze_x, gaze_y, posture_score, hand_activity}]} | Per-frame CV analysis data |
| question_evaluations | {session_id, evaluations: [{question_id, question_text, answer_text, scores: {...}, ai_feedback}]} | Per-question Gemini 1.5 Flash evaluation (free) |
| ai_report_narratives | {session_id, executive_summary, strengths, improvements, roadmap, recommendations} | Gemini 1.5 Flash generated narrative text blocks (free) |

---

## PART 6 — UI/UX DESIGN SYSTEM

---

## 12. UI/UX Design System

### 12.1 Design Language

The design uses a **Premium AI SaaS aesthetic** with a dark futuristic theme as default, plus a fully-featured Light mode. All screens should feel like a high-end AI product — think Claude.ai meets Vercel's dashboard — not a generic educational portal. The system supports **3 appearance modes** (Light, Dark, System) and **12 accent color themes**, all switchable at runtime via a dropdown in the sticky navigation bar with flash-free persistence.

Beyond the color system, the design language ships with a **Premium Motion & Effects Library** baked into `globals.css` — animated gradient borders, floating ambient blobs, glass-morphism panels, aurora-sweep button hovers, shimmer skeletons, pulse-ring live indicators, conic-spin processing states, voice waveform bars, typing-dot indicators, and gradient text. Every interactive surface responds to hover with elevation, glow, or sheen — never a flat color change. These effects are implemented as composable CSS utility classes (§12.6) and consumed throughout every view (landing hero, dashboard cards, interview live screen, processing states, report charts).

**Design Principles enforced across all screens:**

1. **Semantic tokens, never hex** — every color in every component goes through a `--token`. Changing one accent variable cascades to buttons, focus rings, chart series, sidebar active items, and glow effects simultaneously.
2. **Dark-first, light-aware** — every effect has both a default and a `.dark` variant. Blobs dim in dark mode (opacity 0.25 vs 0.4 in light), glow shadows intensify in dark mode, glass panels lighten in dark mode. Never a flat inversion.
3. **Motion as feedback** — every state change is accompanied by a micro-animation (page enter, stagger-in, hover lift, focus ring). The product should feel "alive" without being distracting.
4. **Accent follows the user** — the chosen accent drives `--primary`, `--ring`, `--chart-1`, and `--sidebar-primary`. Charts, buttons, focus rings, and nav active states all retint in real-time when the user picks a new accent — no page reload.

### 12.2 Multi-Theme Color System (CSS Variable Architecture)

All colors use **semantic CSS custom properties** defined in `globals.css` under the `@theme inline` block, which maps every `--color-*` Tailwind token to its semantic CSS variable. Components reference tokens like `bg-primary`, `text-muted-foreground`, `border-border` — never hardcoded hex values. The accent color overrides `--primary`, `--primary-foreground`, `--ring`, `--chart-1`, `--sidebar-primary`, `--sidebar-primary-foreground`, and `--sidebar-ring` via `[data-accent]` attribute selectors on `<html>`.

#### 12.2.1 Semantic Token Map

| Token | Purpose | Example Usage |
|---|---|---|
| `--primary` / `--primary-foreground` | Buttons, links, active nav, key highlights | `bg-primary text-primary-foreground` |
| `--secondary` / `--secondary-foreground` | Subtle surfaces, secondary buttons | `bg-secondary text-secondary-foreground` |
| `--accent` / `--accent-foreground` | Hover states, selected items | `bg-accent text-accent-foreground` |
| `--muted` / `--muted-foreground` | Disabled states, subtle labels, captions | `text-muted-foreground` |
| `--destructive` / `--destructive-foreground` | Errors, danger states, low scores (<70) | `bg-destructive text-destructive-foreground` |
| `--success` / `--success-foreground` | Success states, recommended badges, score ≥ 80 | `bg-success/15 text-success` |
| `--warning` / `--warning-foreground` | Warning states, medium scores (70–79), caution badges | `bg-warning/18 text-warning` |
| `--card` / `--card-foreground` | Card surfaces | `bg-card text-card-foreground` |
| `--popover` / `--popover-foreground` | Dropdown/popover surfaces | `bg-popover text-popover-foreground` |
| `--border` | All border colors | `border-border` |
| `--input` / `--ring` | Input borders, focus rings | `border-input ring-ring` |
| `--background` / `--foreground` | Page backgrounds, body text | `bg-background text-foreground` |
| `--chart-1` through `--chart-5` | Data visualization palette (`--chart-1` follows accent) | `bg-chart-1`, `text-chart-2` |
| `--sidebar` / `--sidebar-foreground` | Sidebar background and text | `bg-sidebar text-sidebar-foreground` |
| `--sidebar-primary` / `--sidebar-primary-foreground` | Sidebar active item (follows accent) | `bg-sidebar-primary text-sidebar-primary-foreground` |
| `--sidebar-accent` / `--sidebar-accent-foreground` | Sidebar hover (follows accent token, not accent color) | `hover:bg-sidebar-accent` |
| `--sidebar-border` / `--sidebar-ring` | Sidebar border and focus ring | `border-sidebar-border` |
| `--radius` | Base border radius (`0.625rem`) — derived into `--radius-sm`/`md`/`lg`/`xl`/`2xl` via `calc()` in `@theme inline` | `rounded-xl` |

#### 12.2.2 Light Theme Values (`:root` default)

| Token | Value | Token | Value |
|---|---|---|---|
| `--background` | `#F8FAFC` | `--foreground` | `#0F172A` |
| `--card` | `#FFFFFF` | `--card-foreground` | `#0F172A` |
| `--popover` | `#FFFFFF` | `--popover-foreground` | `#0F172A` |
| `--primary` | `#2563EB` | `--primary-foreground` | `#FFFFFF` |
| `--secondary` | `#F1F5F9` | `--secondary-foreground` | `#1E293B` |
| `--muted` | `#F1F5F9` | `--muted-foreground` | `#64748B` |
| `--accent` | `#F1F5F9` | `--accent-foreground` | `#1E293B` |
| `--destructive` | `#EF4444` | `--destructive-foreground` | `#FFFFFF` |
| `--success` | `#22C55E` | `--success-foreground` | `#FFFFFF` |
| `--warning` | `#F59E0B` | `--warning-foreground` | `#1C1917` |
| `--border` | `#E2E8F0` | `--input` | `#CBD5E1` |
| `--ring` | `#2563EB` | `--radius` | `0.625rem` |
| `--chart-1` | `#2563EB` | `--chart-2` | `#7C3AED` |
| `--chart-3` | `#06B6D4` | `--chart-4` | `#F59E0B` |
| `--chart-5` | `#10B981` | | |
| `--sidebar` | `#FFFFFF` | `--sidebar-foreground` | `#0F172A` |
| `--sidebar-primary` | `#2563EB` | `--sidebar-primary-foreground` | `#FFFFFF` |
| `--sidebar-accent` | `#F1F5F9` | `--sidebar-accent-foreground` | `#1E293B` |
| `--sidebar-border` | `#E2E8F0` | `--sidebar-ring` | `#2563EB` |

#### 12.2.3 Dark Theme Values (`.dark` class)

| Token | Value | Token | Value |
|---|---|---|---|
| `--background` | `#0F172A` | `--foreground` | `#F1F5F9` |
| `--card` | `#1E293B` | `--card-foreground` | `#F1F5F9` |
| `--popover` | `#1E293B` | `--popover-foreground` | `#F1F5F9` |
| `--primary` | `#3B82F6` | `--primary-foreground` | `#FFFFFF` |
| `--secondary` | `#334155` | `--secondary-foreground` | `#F1F5F9` |
| `--muted` | `#334155` | `--muted-foreground` | `#94A3B8` |
| `--accent` | `#334155` | `--accent-foreground` | `#F1F5F9` |
| `--destructive` | `#EF4444` | `--destructive-foreground` | `#FFFFFF` |
| `--success` | `#22C55E` | `--success-foreground` | `#FFFFFF` |
| `--warning` | `#F59E0B` | `--warning-foreground` | `#1C1917` |
| `--border` | `#334155` | `--input` | `#475569` |
| `--ring` | `#3B82F6` | `--radius` | `0.625rem` |
| `--chart-1` | `#3B82F6` | `--chart-2` | `#A78BFA` |
| `--chart-3` | `#22D3EE` | `--chart-4` | `#FBBF24` |
| `--chart-5` | `#34D399` | | |
| `--sidebar` | `#1E293B` | `--sidebar-foreground` | `#F1F5F9` |
| `--sidebar-primary` | `#3B82F6` | `--sidebar-primary-foreground` | `#FFFFFF` |
| `--sidebar-accent` | `#334155` | `--sidebar-accent-foreground` | `#F1F5F9` |
| `--sidebar-border` | `#334155` | `--sidebar-ring` | `#3B82F6` |

#### 12.2.4 Accent Color Themes (12 Accents)

Each accent overrides `--primary`, `--primary-foreground` (only for high-luminance accents like Gold/Rose — others inherit `#FFFFFF`), `--ring`, `--chart-1`, `--sidebar-primary`, `--sidebar-primary-foreground` (same conditional override), and `--sidebar-ring`. Applied via `[data-accent="<id>"]` attribute on `<html>` in both `:not(.dark)` (light) and `.dark` (dark) variants. Ocean Blue is the default.

The 12 accents are authored in two places that must stay in sync: (1) the CSS selector blocks in `globals.css`, and (2) the `ACCENTS` array exported from `src/components/theme-provider.tsx` (which feeds the swatch UI in the theme switcher dropdown).

| # | Name | Accent ID | Light Swatch | Dark Swatch | Light `--primary` | Dark `--primary` | Dark `--primary-foreground` |
|---|---|---|---|---|---|---|---|
| 1 | **Ocean Blue** (default) | `ocean` | `#2563EB` | `#3B82F6` | `#2563EB` | `#3B82F6` | `#FFFFFF` |
| 2 | **Emerald Green** | `emerald` | `#059669` | `#10B981` | `#059669` | `#10B981` | `#FFFFFF` |
| 3 | **Master Purple** | `purple` | `#7C3AED` | `#8B5CF6` | `#7C3AED` | `#8B5CF6` | `#FFFFFF` |
| 4 | **Ruby Sovereign** | `ruby` | `#BE123C` | `#E11D48` | `#BE123C` | `#E11D48` | `#FFFFFF` |
| 5 | **Legendary Gold** | `gold` | `#CA8A04` | `#EAB308` | `#CA8A04` | `#EAB308` | `#1C1917` |
| 6 | **Rose Red** | `rose` | `#E11D48` | `#FB7185` | `#E11D48` | `#FB7185` | `#1C1917` |
| 7 | **Midnight** | `midnight` | `#1E3A8A` | `#3B5998` | `#1E3A8A` | `#3B5998` | `#FFFFFF` |
| 8 | **Sakura Pink** | `sakura` | `#DB2777` | `#EC4899` | `#DB2777` | `#EC4899` | `#FFFFFF` |
| 9 | **Forest Sovereign** | `forest` | `#15803D` | `#22C55E` | `#15803D` | `#22C55E` | `#FFFFFF` |
| 10 | **Slate** | `slate` | `#475569` | `#64748B` | `#475569` | `#64748B` | `#FFFFFF` |
| 11 | **Coral** | `coral` | `#EA580C` | `#F97316` | `#EA580C` | `#F97316` | `#FFFFFF` |
| 12 | **Cosmic Dia** | `cosmic` | `#0891B2` | `#06B6D4` | `#0891B2` | `#06B6D4` | `#FFFFFF` |

#### 12.2.5 Theme Switching Architecture

The system uses a **custom `ThemeProvider`** (no third-party dependency for the mode/accent state machine) wired into React Context. `next-themes` is only retained as a transitive dependency for the Sonner toaster's internal theming; the application's source-of-truth is the custom provider.

| Layer | Implementation |
|---|---|
| **Mode Switching** | Custom `useTheme()` hook in `src/components/theme-provider.tsx`. Maintains `mode: "light" \| "dark" \| "system"` in React state, toggles the `.dark` class on `<html>`, and listens to `matchMedia("(prefers-color-scheme: dark)")` when `mode === "system"` so OS-level theme changes propagate live without a reload. |
| **Accent Switching** | Same custom provider exposes `setAccent(id: AccentId)` which sets `data-accent="<id>"` attribute on `<html>`. The `ACCENTS` array in `theme-provider.tsx` is the single source of truth for the 12 accent metadata (id, name, light swatch, dark swatch). |
| **State Persistence** | Single `localStorage` key `interviewai-theme` holding JSON `{ mode, accent }`. Read on mount via `useEffect`; written on every change. Failures are silently swallowed (try/catch) so private-mode browsers and SSR environments don't crash. |
| **Flash Prevention** | Inline `<script>` injected into `<head>` from `app/layout.tsx` (before React hydrates). Reads `interviewai-theme` from `localStorage`, resolves `system` → `light`\|`dark` via `matchMedia`, and synchronously sets `.dark` class + `data-accent` attribute on `<html>`. Eliminates the white-flash / dark-flash that occurs when React mounts after first paint. Falls back to `data-accent="ocean"` on any error. |
| **CSS Override Chain** | `:root` (light default) → `.dark` (dark overrides) → `[data-accent="<id>"]:not(.dark)` (accent light) → `[data-accent="<id>"].dark` (accent dark). Later selectors always win due to CSS specificity and source order in `globals.css`. |
| **Theme Switcher UI** | `ThemeSwitcher` component (compact mode in navbar, full mode available). Trigger button shows current mode icon (Sun/Moon) + a live accent swatch chip that retints with the resolved theme. Dropdown panel has: (1) Appearance header, (2) Mode section — 3-column segmented grid (Light / Dark / System) with icon + label + active-state highlight via `bg-background shadow-sm`, (3) Accent section header showing currently-selected accent name, (4) Accent grid — 6-column × 2-row grid of round color swatches (`h-9 w-9 rounded-full`) with `ring-2 ring-offset-2 ring-offset-background` on active and a `Check` icon overlay, hover scales the swatch 110%, (5) Footer note about local persistence. |
| **Sonner Toaster Sync** | Sonner's `<Toaster>` uses `useTheme` from `next-themes` internally; the two systems stay in sync because both read the same `.dark` class on `<html>`. No manual bridge code needed. |
| **Hydration Safety** | `<html lang="en" suppressHydrationWarning>` — the `suppressHydrationWarning` attribute is intentional because the flash-prevention script mutates `<html>` before React mounts; without this attribute React would warn about the mismatch on every page load. |

### 12.3 Typography

The system uses a **3-font stack** loaded via `next/font/google` with CSS variable integration. All fonts use `display: swap` for optimal loading performance.

| Font | CSS Variable | Weights Loaded | Usage |
|---|---|---|---|
| **Plus Jakarta Sans** | `--font-plus-jakarta` | 500, 600, 700, 800 | All headings (`h1`–`h6`), brand text, logo, hero titles. Applied via `@theme inline { --font-heading }` and `font-heading` utility class. |
| **Inter** | `--font-inter` | 400, 500, 600, 700 | Body text, paragraphs, descriptions, labels, form inputs. Applied as default `--font-sans` via `@theme inline`. |
| **JetBrains Mono** | `--font-jetbrains` | 400 | Code snippets, Monaco editor, score displays, tabular data. Applied via `font-code` utility class and `--font-mono` / `--font-code` in `@theme inline`. |

| Element | Font Family | Size Range | Weight | Tailwind Classes |
|---|---|---|---|---|
| Page Title (H1) | Plus Jakarta Sans | 36–48px | Bold (700–800) | `font-heading text-4xl md:text-5xl font-bold` |
| Section Heading (H2–H3) | Plus Jakarta Sans | 24–30px | SemiBold (600) | `font-heading text-2xl font-semibold` |
| Subsection (H4–H6) | Plus Jakarta Sans | 18–20px | Medium (500–600) | `font-heading text-lg font-medium` |
| Body Text | Inter | 16px (base) | Regular (400) | Default body text (no extra class needed) |
| Caption / Label | Inter | 13–14px | Medium (500) | `text-sm text-muted-foreground` |
| Code / Score / Metric | JetBrains Mono | 14–64px | Regular (400) | `font-code` |
| Gradient Brand Text | Plus Jakarta Sans | Inherited | Inherited | `font-heading text-gradient` (uses `--chart-1/2/3` gradient) |

### 12.4 Component Library (Semantic Token Classes & Utility Classes)

All components use **semantic CSS variable tokens** — never hardcoded hex colors. Classes marked with `(utility)` are custom CSS classes defined in `globals.css`. Every utility uses `color-mix(in srgb, var(--token) X%, transparent)` so the effect always retints with the active accent.

#### 12.4.1 Core Component Patterns

| Component | Tailwind / Semantic Classes | Notes |
|---|---|---|
| Primary Button | `bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all shadow-lg` + `.aurora-hover` | Adapts to accent color automatically; aurora sweep on hover |
| Card | `bg-card text-card-foreground backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl` + `.card-hover` or `.gradient-border` | Two premium variants: hover-lift or animated gradient border |
| Input Field | `bg-background border border-input focus:border-ring text-foreground rounded-xl px-4 py-3 outline-none transition-colors` + `.focus-ring` | Focus ring follows accent |
| Navigation Bar | `bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50` | Glassmorphic, adapts to light/dark |
| Modal Overlay | `fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center` | Universal, works in both modes |
| Active Nav Item | `bg-primary text-primary-foreground shadow-sm glow-sm` | Sidebar/nav active state follows accent + subtle glow |
| Inactive Nav Item | `text-muted-foreground hover:text-foreground hover:bg-accent` | Semantic hover states |
| Progress Bar | `bg-muted rounded-full overflow-hidden h-2` with inner div `bg-primary` | Follows accent color |
| Scrollbar (custom) | 8px width, `color-mix(--muted-foreground 40%, transparent)` thumb with `padding-box` clip, transparent track, hover bumps to 60% opacity | Defined in `globals.css` `::-webkit-scrollbar` |
| Selection | `::selection` uses `color-mix(--primary 25%, transparent)` background + `--foreground` text | Accent-tinted text selection across the whole app |

#### 12.4.2 Premium Utility Classes (from `globals.css`)

| Utility Class | Effect | Where Used |
|---|---|---|
| `.text-gradient` | 135° gradient text using `--chart-1 → --chart-2 → --chart-3` | Hero headlines, brand text, section titles |
| `.gradient-border` | 1px animated gradient border via `mask-composite: exclude` (chart tokens) | CTA cards, hero preview, score cards, result cards |
| `.glow-primary` | Triple-layer box-shadow using `color-mix(--primary X%, transparent)` — intensifies in `.dark` | Hero CTA, primary buttons in dark mode |
| `.glow-sm` | Smaller, softer version of `.glow-primary` — for active nav items and small CTAs | Active nav, dashboard quick-action buttons |
| `.score-badge-success` | `bg-success/15 text-success border-success/30` | Scores ≥ 80, "Recommended" badges |
| `.score-badge-warning` | `bg-warning/18 text-warning border-warning/35` | Scores 70–79, "Caution" badges |
| `.score-badge-destructive` | `bg-destructive/15 text-destructive border-destructive/30` | Scores < 70, error states |
| `.ai-badge` | 135° gradient background using `color-mix(--chart-1 15%)` + `color-mix(--chart-2 15%)` | "AI" tagged elements, AI interviewer label |
| `.glass` | `bg-card` at 70% opacity + `backdrop-blur(12px) saturate(180%)` — `.dark` variant uses 60% opacity | Navbar, sticky headers, modal overlays |
| `.card-hover` | Lifts card `-4px` on hover with primary-tinted border + primary-tinted shadow | Feature cards, testimonial cards, dashboard widgets |
| `.lift-on-hover` | Lighter lift (`-2px`) with primary shadow — for smaller interactive tiles | Dashboard quick-action tiles |
| `.aurora-hover` | Light sweep across the element (90° gradient, `transparent → white 25% → transparent`) on hover | Primary buttons, CTAs, "Get Started" buttons |
| `.animated-gradient` | 4-stop animated gradient background cycling `chart-1 → chart-2 → chart-3 → chart-1` over 12s | Hero backgrounds, special section accents |
| `.blob` | Absolutely-positioned blurred circle (`filter: blur(80px)`) with `blobFloat` 18s animation; opacity 0.4 in light, 0.25 in dark | Landing page ambient, auth page ambient |
| `.shimmer` | 200%-wide gradient that animates `background-position` over 1.6s linear | Loading skeletons, async content placeholders |
| `.pulse-ring` | Pulsing ring that scales 1 → 1.4 over 2s with opacity fade — `::before` pseudo-element | Live indicators, "REC" badges, active interview dot |
| `.floating` | Gentle `translateY(0 → -8px → 0)` over 6s ease-in-out | AI interviewer avatar, hero floating elements |
| `.grid-pattern` | 32×32px grid using `color-mix(--border 50%, transparent)` lines | Auth page background, technical section dividers |
| `.dot-pattern` | 20×20px dot grid using `color-mix(--muted-foreground 30%, transparent)` circles | Interview setup background, processing screen backdrop |
| `.typing-dot` | 6×6px dot with `typingBounce` 1.4s animation (stagger 0.2s/0.4s) | AI "is typing" indicator, chat transcript loading |
| `.conic-spin` | Conic-gradient ring with `spin 1s linear infinite` | Processing states, "Analyzing your interview…" spinner |
| `.page-enter` | Page-level enter animation: `opacity 0 → 1` + `translateY(8px → 0)` over 0.4s | Every view root `<div>` |
| `.stagger-in` | List-item enter animation: `opacity 0 → 1` + `translateY(12px → 0)` over 0.5s with `backwards` fill | Dashboard cards, feature grids |
| `.avatar-pulse` | Pulsing box-shadow on `--primary` (35% → 0% over 20px) over 2.5s | AI interviewer avatar on landing + live interview |
| `.wave-bar` | 3px-wide vertical bar that animates `height: 6px → 18px → 6px` over 1s | Voice activity waveform (interview live screen, landing preview) |
| `.focus-ring` | `:focus-visible` outline: 2px background + 4px `--ring` — accessible focus indicator | Buttons, nav items, custom interactive elements |
| `.code-block` | `--font-code` + darkened background (`--background` 80% + black) + `--border` | Code snippets, Monaco editor wrappers |
| `.soft-divider` | 1px gradient line: `transparent → --border → transparent` | Section dividers, content separators |
| `.tabular-nums` | `font-variant-numeric: tabular-nums` + `--font-code` | Score displays, metrics, timing displays |
| `.tint-border` | Border tinted 20% with `--primary`: `color-mix(--primary 20%, --border)` | Highlighted cards, accent-tinted containers |

### 12.5 Page-by-Page Screen List

> **Implementation Note (MVP):** In the current MVP build, the routes below are rendered as **views** inside a single-page app shell (`src/components/app-provider.tsx` exposes `view` + `navigate(viewId)` via React Context). Navigation between views happens instantly without a network round-trip — the URL stays at `/` and the active view is swapped in-place with a `.page-enter` animation. The route paths below are the **logical screen list** and will map 1:1 to Next.js App Router routes (`app/<route>/page.tsx`) when the backend is wired in.

| Route (logical) | View ID | Screen Name | Key Components | Auth Required |
|---|---|---|---|---|
| / | `landing` | Landing Page | Hero with animated avatar + waveform + typing dots, feature grid (`card-hover`), 3-step flow, AI interviewer preview (`avatar-pulse`), CV analysis showcase, testimonials, pricing CTA (`gradient-border`) | No |
| /auth | `auth` | Auth Page (Login / Register / OTP / Profile Setup) | Card with `blob` ambient background + `grid-pattern` overlay, multi-step form, Google OAuth button, OTP grid, profile completion wizard | No |
| /dashboard | `dashboard` | User Dashboard | Score gauge (`gradient-border`), trend chart, radar chart, quick-action tiles (`lift-on-hover`), skills breakdown (`score-badge-*`), roadmap | Yes |
| /profile | `profile` | Profile Page | Tabbed form: Personal, Education, Skills, Preferences — uses `.focus-ring` on all inputs | Yes |
| /resume | `resume` | Resume Hub | Upload zone (drag-drop), analysis results card (`gradient-border`), history list, download button (`aurora-hover`) | Yes |
| /aptitude | `aptitude` | Aptitude Portal | Test landing with rules, test interface with timer (`tabular-nums`), results screen (`score-badge-*` + `gradient-border`) | Yes |
| /coding | `coding` | Coding Arena | Split-pane: problem statement + Monaco editor (JetBrains Mono), test case panel, submit button (`aurora-hover`), results with `score-badge-success` | Yes |
| /interview | `interview` | AI Interview (Setup → Live → Processing → Done) | Type selector, mic/cam test, live screen with `floating` avatar + `wave-bar` waveform + `typing-dot` transcript, processing with `conic-spin` + `dot-pattern`, done card with `gradient-border` | Yes |
| /report/:id | (within `reports`) | Interview Report | Full report view with charts, expandable sections, PDF download | Yes |
| /replay/:id | (within `reports`) | Interview Replay | Video player synced with transcript, AI annotations, timeline | Yes |
| /reports | `reports` | Reports Library | List of all past reports with filter, sort, download buttons | Yes |
| /login, /register | `auth` | Student Auth (Prep Mode) | Standard login/register + Google OAuth, OTP grid, profile wizard | No |
| /company/login | `companyLogin` | Candidate Login (Hiring Mode) | `candidate_id` + password form, campaign name/deadline shown after auth | No |
| /company/register | `companyRegister` | Company Admin Registration | Company name, contact, admin account creation | No |
| /c/:campaign_slug/dashboard | `campaignDashboard` | Candidate Campaign Dashboard | Stripped view: this campaign's rounds only, deadline countdown, completion status — no cross-campaign history | Candidate |
| /c/:campaign_slug/aptitude, /coding, /interview | (within `campaignDashboard`) | Candidate Campaign Rounds | Same UI shells as Prep Mode's /aptitude, /coding, /interview but sourced from campaign-scoped questions with strict proctoring (Module 10 §10.3) | Candidate |
| /admin | `admin` | Company Admin Dashboard | Campaign list, candidate stats, quick links to §17.1 admin modules | Company Admin |
| /admin/campaigns | `adminCampaigns` | Campaign Management | Create/edit campaigns, active rounds, score weights, deadline, proctoring/auto-disqualify rules | Company Admin |
| /admin/campaigns/:id/candidates | `adminCandidates` | Candidate Leaderboard & Shortlisting | AI-ranked resume list, shortlist/reject, credential issuance status, results, proctoring flags | Company Admin |
| /superadmin | `superAdmin` | Platform Management | Company account management, platform health, AI usage monitor, global analytics | Super Admin |

### 12.6 Premium Motion & Visual Effects Library

All effects are defined as composable CSS utility classes in `src/app/globals.css` and use `color-mix(in srgb, var(--token) X%, transparent)` so they retint automatically with the active accent. None of them require JavaScript to drive the animation — they are pure CSS keyframes triggered by class application or `:hover` / `:focus-visible` pseudo-classes. This keeps motion GPU-accelerated and zero-cost to React's reconciler.

#### 12.6.1 Animation Catalog

| Class / Keyframe | Duration | Easing | Trigger | Description |
|---|---|---|---|---|
| `page-enter` / `pageEnter` | 0.4s | `cubic-bezier(0.16, 1, 0.3, 1)` | View mount | Whole-page fade + slide-up |
| `stagger-in` / `staggerIn` | 0.5s | `cubic-bezier(0.16, 1, 0.3, 1)` | List mount (with `backwards` fill) | List-item fade + slide-up — set `animation-delay` per item |
| `card-hover` | 0.3s | `cubic-bezier(0.16, 1, 0.3, 1)` | `:hover` | Card lifts `-4px` + primary-tinted border + primary-tinted shadow |
| `lift-on-hover` | 0.25s | `ease` | `:hover` | Lighter `-2px` lift + primary shadow |
| `aurora-hover` | 0.3s (`all`) + 0.6s (`left`) | `ease` | `:hover` | Aurora light sweep across the element (90° gradient) |
| `floating` / `floating` | 6s | `ease-in-out` | Always on | Subtle `translateY(0 → -8px → 0)` for avatars and hero elements |
| `blob` / `blobFloat` | 18s | `ease-in-out` | Always on | Blob translates + scales: `0 → (40px, -30px, 1.1) → (-30px, 30px, 0.95) → 0` |
| `animated-gradient` / `gradientShift` | 12s | `ease` (infinite) | Always on | Background-position cycles `0% → 100% → 0%` across a 400%-sized gradient |
| `shimmer` / `shimmer` | 1.6s | `linear` (infinite) | Always on (loading) | `background-position: 200% → -200%` |
| `pulse-ring` / `pulseRing` | 2s | `ease-out` (infinite) | Always on (live) | Ring scales `1 → 1.4` with opacity `0.5 → 0` |
| `avatar-pulse` / `avatarPulse` | 2.5s | `ease-in-out` (infinite) | Always on | Box-shadow `0 0 0 0 primary@35% → 0 0 0 20px primary@0%` |
| `wave-bar` / `wave` | 1s | `ease-in-out` (infinite) | Always on (speaking) | Height `6px → 18px → 6px` — set per-bar `animation-delay` for staggered waveform |
| `typing-dot` / `typingBounce` | 1.4s | `ease-in-out` (infinite) | Always on (typing) | `translateY(0 → -6px → 0)` + opacity `0.5 → 1 → 0.5` — children delayed `0.2s` and `0.4s` |
| `conic-spin` / `spin` | 1s | `linear` (infinite) | Always on (processing) | 360° rotation |

#### 12.6.2 Background Pattern Catalog

| Class | Visual | Use Case |
|---|---|---|
| `.grid-pattern` | 32×32px grid lines, `color-mix(--border 50%, transparent)` | Auth page, technical section dividers |
| `.dot-pattern` | 20×20px dot grid, `color-mix(--muted-foreground 30%, transparent)` | Interview setup, processing screens |
| `.blob` (with inline `style`) | Blurred 80px circle, opacity 0.4 (light) / 0.25 (dark), 18s float animation | Landing hero ambient, auth page ambient — set `width`, `height`, `top/left`, `background: var(--chart-N)`, optional `animationDelay` |
| `.animated-gradient` | 4-stop cycling gradient (`chart-1 → 2 → 3 → 1`) over 12s | Hero accents, special section backgrounds |

#### 12.6.3 Premium Surface Treatments

| Class | Visual | Use Case |
|---|---|---|
| `.text-gradient` | 135° text gradient `chart-1 → chart-2 → chart-3` via `background-clip: text` | Hero headlines, brand text, section emphasis |
| `.gradient-border` | 1px border using chart-token gradient via `mask-composite: exclude` `::before` pseudo-element | CTA cards, hero preview, score cards, result cards |
| `.glass` | `bg-card` at 70% opacity + `backdrop-blur(12px) saturate(180%)` (60% in dark) | Navbar, sticky headers, modal overlays |
| `.glow-primary` | Triple-layer `box-shadow` using `color-mix(--primary X%, transparent)` — intensifies in dark | Hero CTA, primary buttons (especially in dark mode) |
| `.glow-sm` | Smaller, softer glow for nav items and small CTAs | Active nav item, dashboard quick actions |
| `.ai-badge` | 135° gradient background using `color-mix(chart-1 15%)` + `color-mix(chart-2 15%)` | "AI" tagged elements, AI interviewer label |
| `.tint-border` | Border tinted 20% with `--primary` | Highlighted / accent-tinted containers |
| `.code-block` | JetBrains Mono font + darkened background + border | Code snippets, Monaco editor wrappers |
| `.soft-divider` | 1px gradient line `transparent → --border → transparent` | Section dividers, content separators |
| `.tabular-nums` | `font-variant-numeric: tabular-nums` + JetBrains Mono | Score displays, metrics, timers |

#### 12.6.4 Score Badge System

Score badges use semantic `--success` / `--warning` / `--destructive` tokens with `color-mix()` transparency for backgrounds and borders. Threshold mapping (used across dashboard, aptitude results, coding results, landing testimonials):

| Score Range | Class | Color Source | Background | Border |
|---|---|---|---|---|
| ≥ 80 (Excellent) | `.score-badge-success` | `--success` | `success/15` | `success/30` |
| 70–79 (Caution) | `.score-badge-warning` | `--warning` | `warning/18` | `warning/35` |
| < 70 (Needs Work) | `.score-badge-destructive` | `--destructive` | `destructive/15` | `destructive/30` |

#### 12.6.5 Accessibility & Reduced-Motion Considerations

- All hover-driven effects (`card-hover`, `lift-on-hover`, `aurora-hover`) degrade gracefully — they only enhance; the underlying content remains fully usable without hover.
- Focus indicators use `.focus-ring` (`:focus-visible` only) which renders a 2px background + 4px `--ring` outline — never removed.
- Animated infinite loops (`blob`, `floating`, `wave-bar`, `pulse-ring`, `avatar-pulse`, `typing-dot`, `conic-spin`, `shimmer`, `animated-gradient`) are subtle and low-frequency (1–18s cycles) to avoid vestibular discomfort.
- **TODO (post-MVP):** Wrap infinite animations in `@media (prefers-reduced-motion: reduce)` to disable them for users who request reduced motion at the OS level. Currently not implemented — see §13.4 for the WCAG 2.1 AA target.


---

## PART 7 — NON-FUNCTIONAL REQUIREMENTS & DEPLOYMENT

---

## 13. Non-Functional Requirements

### 13.1 Performance Requirements

| Metric | Requirement | Measurement Method |
|---|---|---|
| Page Load Time (LCP) | < 2.0 seconds on 4G | Lighthouse / Core Web Vitals |
| API Response Time (P95) | < 500ms for non-AI endpoints | Render built-in logs + browser DevTools |
| AI Response Latency (first token) | < 2 seconds for Gemini 1.5 Flash streaming (free tier) | Custom timing log in FastAPI |
| Whisper STT Latency (per turn) | < 3 seconds per audio segment (local whisper-tiny/base model) | Server-side timing log |
| PDF Report Generation Time | < 60 seconds (async background) | Job queue timing |
| Concurrent Users | 10,000+ without degradation | Load test with k6 or Locust |
| WebSocket Connection Stability | < 0.1% drop rate during interview | WebSocket health monitoring |
| Database Query Time (P99) | < 100ms for indexed queries | PostgreSQL slow query log |

### 13.2 Security Requirements

| Requirement | Implementation |
|---|---|
| HTTPS everywhere | TLS 1.3; HTTP → HTTPS redirect via Nginx |
| JWT security | RS256 algorithm; access token 15-min TTL; refresh token rotated on use |
| Password hashing | Bcrypt with cost factor 12 |
| SQL injection prevention | Parameterized queries via SQLAlchemy ORM |
| XSS prevention | React's JSX escaping + Content-Security-Policy header |
| CSRF protection | SameSite=Strict cookie; CSRF token for state-changing forms |
| File upload validation | MIME type check + file extension allowlist; scan with ClamAV |
| Rate limiting | Redis-based: 100 req/min per IP; 5 failed logins → 15-min lockout |
| Data encryption at rest | Cloudinary auto-encrypts stored files; PII fields encrypted in PostgreSQL using pgcrypto |
| Secure file access | Cloudinary files served via signed delivery URLs (configurable expiry); private delivery type enabled |
| GDPR / Data privacy | User data export endpoint; account deletion wipes all data within 30 days |
| API key management | All API keys in .env file (never committed to Git); use python-dotenv; deployed as environment variables on Render |

### 13.3 Scalability Architecture

- For this academic project: single FastAPI instance on Render free tier is sufficient for demo/evaluation load.
- Celery + Upstash Redis (free tier) for background AI analysis jobs — 1 worker sufficient for project scale.
- PostgreSQL on Supabase free tier (500MB) — handles all project data comfortably.
- MongoDB Atlas free tier (512MB) — sufficient for interview transcripts at project scale.
- Vercel CDN automatically caches all React static assets globally at no cost.
- Upstash Redis free tier (10,000 requests/day) handles session cache and WebSocket pub/sub for project usage.

### 13.4 Accessibility (WCAG 2.1 AA)

- All interactive elements keyboard-navigable with visible focus indicators.
- ARIA labels on all icons, buttons, and form elements.
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
- Dark mode as default; light mode toggle available in settings.
- Responsive breakpoints: Mobile (360px), Tablet (768px), Desktop (1280px), Wide (1536px).
- Screen reader support for all dashboard data (score tables use proper HTML table semantics).

---

## PART 8 — MVP SCOPE, MONETIZATION & ROADMAP

---

## 14. MVP Scope (Version 1.0)

### 14.1 Features Included in MVP

| Module | MVP Features Included | Excluded from MVP (Phase 2+) |
|---|---|---|
| Authentication | Email login, Google OAuth, OTP, JWT, forgot password | SSO, MFA, biometric |
| Profile | Basic profile, skills, education, avatar upload | Portfolio analyzer, LinkedIn sync |
| Resume Analyzer | Upload, ATS score, skill gap, AI suggestions, download | Resume builder, LinkedIn import |
| Aptitude Test | 25-question test, 5 categories, timer, auto-submit, results | Company-specific question packs |
| Coding Round | Monaco editor, 5 languages, Piston API execution (free), Gemini AI review (free) | Live pair-coding, whiteboard |
| AI Interview | HR + Technical types, Gemini questions (free), local Whisper STT (free), Web Speech API TTS (free), webcam recording | VR room, group discussion, company-specific packs |
| CV Analysis | Eye contact, posture, emotion detection (post-interview) | Real-time live CV feedback during interview |
| **Fair-Usage Monitoring & Proctoring** (Module 10) | Prep Mode: non-blocking tab-switch/fullscreen-exit logging shown only to the candidate. Hiring Mode: enforced fullscreen + mandatory camera, progressive warnings (auto-submit after 2+ violations), camera-based no-face/multi-face/device detection, optional auto-disqualification, integrity score visible to admin | Live human proctor takeover, browser-lockdown kiosk mode |
| Dashboard | Score widgets, charts, progress tracking, quick actions | Leaderboard, peer comparison, achievements |
| PDF Report | Full 17-section report, downloadable directly from dashboard within ~60s | Shareable report link, recruiter view |
| Admin Panel | User management, resume shortlisting engine, campaign-scoped question bank (aptitude + DSA/SQL), candidate credential issuance, proctoring violation monitor, basic analytics | Revenue dashboard, A/B testing tools |
| **Hiring Mode** (Module 11) | Organization accounts, resume-based shortlisting, campaign-scoped question sets, candidate access-code login, integrity score visible to admin | Multi-round interview scheduling, applicant tracking system (ATS) integration |

### 14.2 MVP Launch Checklist

- All P0 authentication flows working end-to-end.
- Resume upload and analysis pipeline tested with 50+ sample resumes.
- Aptitude question bank seeded with minimum 200 questions per category.
- Coding problem bank seeded with minimum 20 problems per difficulty.
- AI Interview working for HR and Technical types with stable WebSocket connection.
- Post-interview analysis completing within 60 seconds; Download Report button activates on dashboard automatically.
- PDF report generating correctly for all 17 sections.
- Mobile responsive layout verified on iPhone 14 and Samsung Galaxy S23.
- Security audit completed: no P0/P1 vulnerabilities.
- Load test: 500 concurrent users without degradation.
- Proctoring engine verified: fullscreen re-entry works, 2nd tab-switch/fullscreen-exit shows final warning, 3rd auto-submits and flags the session.
- Webcam cheat detection tested against sample frames for no-face, multi-face, and phone-in-frame scenarios (COCO-SSD model).
- Hiring Mode verified end-to-end: company admin registers, creates a campaign, bulk-uploads resumes, shortlists via AI score, curates a campaign question set, the system issues candidate credentials, and the candidate can log in at /company/login and see only that campaign's questions.

---

## 15. Access Model — Fully Free (Academic Project)

This is a final year academic project. There are no paid plans, subscriptions, paywalls, or feature restrictions. Every registered user gets full access to all features for free.

| Feature | Access Level for All Users |
|---|---|
| Resume Analyses | Unlimited |
| AI Interviews | Unlimited — all 6 interview types |
| AI Avatar (3D Lip-sync) | Available to all users |
| Coding Rounds | Unlimited — all languages and difficulties |
| Aptitude Tests | Unlimited retakes |
| PDF Report Download | Full 17-section report, downloadable directly from dashboard |
| Video Replay | Available — 30-day local retention |
| Learning Roadmap | Full 6-week personalized roadmap |
| Post-Interview Analysis | Full analysis — unlocked on dashboard within ~60 seconds |
| Data Export | Available to all users |

> **Implementation Note:** Since there is no payment system, the users table does not have a plan or subscription column. No Stripe, Razorpay, or billing integration is included. The admin panel does not have a Revenue Dashboard or Subscription Manager.

---

## 16. Roadmap

| Phase | Timeline | Key Deliverables |
|---|---|---|
| Phase 1 — MVP | Months 1–3 | Full authentication, resume analyzer, aptitude, coding round, AI HR + Technical interview, post-interview analysis, PDF report, dashboard |
| Phase 2 — Growth | Months 4–6 | Company-specific interview packs, AI resume builder, real-time CV feedback, LinkedIn import, mobile-responsive improvements, leaderboard |
| Phase 3 — Enterprise | Months 7–12 | Recruiter dashboard, college portal, bulk enrollment, custom branding, API for integration, AI group discussion simulator |
| Phase 4 — Platform | Year 2 | Mobile app (React Native), VR interview room, AI career coach, multi-language AI interviewer, GitHub/LeetCode integration |

---

## PART 9 — ADMIN PANEL & INTEGRATIONS

---

## 17. Admin Panel

### 17.1 Admin Modules

| Admin Module | Key Functions |
|---|---|
| User Management | View all users, filter by date/activity, suspend accounts, manually verify email, view user interview history |
| Interview Management | View all sessions, watch recordings, flag problematic sessions, export session data |
| **Company & Campaign Manager** (Module 11) | Create/manage companies and campaigns, view per-campaign candidate counts and test activity |
| **Resume Shortlisting Engine** (§11.3) | Bulk-ingest candidate resumes for a campaign, view AI-ranked candidate list, shortlist/reject, set auto-shortlist thresholds |
| **Candidate Credential Manager** (§11.2) | Issue/resend access-code or magic-link credentials to shortlisted candidates only; revoke access |
| Question Bank Manager | For the **public Prep Mode pool**, this is read-only/reporting — the pool is auto-generated and needs no manual entry. For **Hiring Mode**, company admins get full CRUD scoped to their own campaign's questions only (aptitude + DSA/SQL coding, with bulk CSV import), set difficulty/category/tags, preview questions |
| Coding Problem Manager | CRUD for campaign-scoped DSA and SQL coding problems, add test cases / SQL schema seed scripts, set time/memory limits, test execution |
| **Proctoring Violation Monitor** (Module 10) | Review flagged Hiring Mode sessions — violation type, timestamp, integrity score, flagged webcam frame thumbnail; confirm or dismiss before finalizing a shortlist decision |
| AI Prompt Manager | Edit system prompts for interview AI, resume analysis, code review without redeployment |
| Analytics Dashboard | DAU/MAU charts, interviews conducted, score distributions, completion funnels |
| System Health | API response time, job queue depth, error rate, active WebSocket connections |
| Support Tickets | View user-submitted issues, assign to team, mark resolved |
| AI Usage Monitor | Gemini API free-tier usage tracker — monitors daily request count vs free quota (15 RPM / 1M tokens per day) |

> **Important distinction:** There is **no admin panel involved in Prep Mode question supply** — the public aptitude + DSA/SQL dataset is pre-seeded and auto-generated so preparation candidates always have questions with zero manual curation. The Admin Panel above exists specifically for companies running **Hiring Mode** campaigns: shortlisting candidates by resume, curating a private question set, issuing credentials, and reviewing proctoring integrity — exactly as described in Module 11.

---

## 18. Third-Party Integrations

| Service | Purpose | SDK / API | Phase |
|---|---|---|---|
| Google Gemini 1.5 Flash | Question generation, answer evaluation, report narration | google-generativeai Python SDK — FREE tier: 15 RPM, 1M tokens/day | MVP |
| Whisper (local) | Speech-to-text transcription — runs on server, no API cost | openai/whisper Python library (pip install openai-whisper) | MVP |
| Web Speech API | Text-to-speech for AI avatar — built into every browser | Browser SpeechSynthesis API — no SDK, no cost, no API key | MVP |
| Piston API | Sandboxed code execution — free, open-source, 70+ languages | HTTP REST calls to self-hosted or public piston instance | MVP |
| Cloudinary Free Tier | File storage (resumes, recordings, PDFs) — 25GB/month free | cloudinary Python SDK | MVP |
| Email (Auth only) | SMTP via Gmail / Resend free tier | OTP and password reset emails only | MVP |
| Google OAuth 2.0 | Social login | Authlib / google-auth | MVP |
| MediaPipe (Google) | Browser-side face mesh, pose, and hand tracking — runs in browser | MediaPipe JS via CDN (tasks-vision package) — completely free | MVP |
| face-api.js | Browser-side emotion classification from webcam — runs in browser via TensorFlow.js | face-api.js via npm or CDN — completely free | MVP |
| Three.js | Custom 3D avatar character — animated, lip-synced using Web Speech API word events | three npm package — free open-source | MVP |
| LinkedIn API | Profile import, job recommendation context | LinkedIn REST API | Phase 2 |
| GitHub API | Fetch repos for coding skill assessment | PyGitHub | Phase 2 |
| WeasyPrint | HTML to PDF report generation | weasyprint Python library | MVP |
| Render.com / Vercel built-in logs | Error tracking and monitoring sufficient for project scope | No extra SDK needed — use browser DevTools + Render log dashboard | MVP |

---

## APPENDICES

---

## Appendix A — Acceptance Criteria Checklist

### A.1 Core Module Acceptance Criteria

| Module | Acceptance Criteria |
|---|---|
| Auth | User can register, receive OTP, verify, login, and logout. Google OAuth returns valid session. Refresh token rotates correctly. Failed login locks account after 5 attempts. |
| Resume Analyzer | PDF and DOCX files up to 5MB accepted. Analysis returns all 15 required fields within 30 seconds. ATS score correlates visually with resume quality in user testing (n=20). |
| Aptitude Test | 25 questions load within 1 second. Timer counts down accurately. Auto-submit fires at 00:00. Results page shows per-category breakdown and explanation for each wrong answer. |
| Coding Round | Code executes in <5 seconds for Python/JS. Hidden test cases not visible to user. AI code review returns within 15 seconds post-submission. Language switch clears editor with confirmation. |
| AI Interview | Avatar renders and speaks within 3 seconds of interview start (Web Speech API). Local Whisper transcription accuracy >85% for clear English speech. Gemini 1.5 Flash follow-up questions are contextually relevant (verified by evaluator review of 20 sessions). Session recording uploads to Cloudinary successfully (free tier). |
| Post-Interview Analysis | Analysis completes within 60 seconds. All 13 score dimensions populated. Dashboard Download Report button activates automatically via WebSocket when job completes. PDF report displays all 17 sections correctly. |
| Dashboard | All widgets load within 2 seconds. Score trend chart updates after each new interview. Quick action buttons navigate to correct screens. |
| Proctoring | Fullscreen exit or tab switch shows a warning modal within 500ms. 2nd violation shows the final-warning modal. 3rd violation force-submits the session and sets `terminated_for_violation = true`. Integrity score is computed and stored correctly for every violation combination. Camera-based checks correctly flag no-face, multiple faces, and a phone held in frame in manual test scenarios. |
| Hiring Mode | Company admin can register, create a campaign, bulk-upload resumes, and see them ranked by AI job-fit score. Shortlist action auto-generates working candidate_id/password credentials. A candidate logging in at /company/login sees only that campaign's question sets — never the public pool, and never another campaign's set. Non-shortlisted candidates cannot obtain test access. One attempt only. |

---

## Appendix B — Environment Variables Reference

| Variable | Service | Example Value Format |
|---|---|---|
| GEMINI_API_KEY | Google Gemini (Free) | Get from https://aistudio.google.com/apikey — completely free |
| PISTON_API_URL | Piston (Free) | http://localhost:2000 (self-hosted) or https://emkc.org/api/v2/piston (free public) |
| CLOUDINARY_CLOUD_NAME | Cloudinary (Free) | your_cloud_name from Cloudinary dashboard |
| CLOUDINARY_API_KEY | Cloudinary (Free) | 123456789012345 |
| CLOUDINARY_API_SECRET | Cloudinary (Free) | abcdefghijklmnop |
| DATABASE_URL | PostgreSQL (Supabase Free) | postgresql+asyncpg://postgres:[password]@db.[ref].supabase.co:5432/postgres |
| MONGODB_URL | MongoDB Atlas (Free) | mongodb+srv://user:pass@cluster.mongodb.net — free 512MB cluster |
| REDIS_URL | Upstash Redis (Free) | rediss://default:[token]@[host].upstash.io:6379 — free 10K req/day |
| JWT_SECRET_KEY | Auth | 64-char random hex string |
| GOOGLE_CLIENT_ID | Google OAuth (Free) | xxx.apps.googleusercontent.com — free via Google Cloud Console |
| GOOGLE_CLIENT_SECRET | Google OAuth (Free) | GOCSPX-... — free |
| SMTP_HOST / SMTP_PASSWORD | Email (SMTP) | smtp.gmail.com / app password |
| SENTRY_DSN | Monitoring | https://xxx@sentry.io/yyy |

---

## Appendix C — Glossary

| Term | Definition |
|---|---|
| ATS | Applicant Tracking System — software used by recruiters to parse and filter resumes |
| STT | Speech-to-Text — converting spoken audio to written text (Whisper) |
| TTS | Text-to-Speech — converting text to spoken audio; in this project uses the browser's built-in Web Speech API (SpeechSynthesis) at zero cost |
| CV Analysis | Computer Vision Analysis — processing webcam video to detect emotions, eye contact, posture |
| JWT | JSON Web Token — stateless authentication token signed with RS256 |
| MediaPipe | Google's open-source framework for real-time ML pipelines on media (face, pose, hands) |
| face-api.js | Browser-side JavaScript library for facial analysis (emotion, age, gender) using TensorFlow.js models — runs fully in browser, completely free |
| Piston API | Free open-source code execution engine supporting 70+ programming languages; replaces Judge0 in this project |
| STAR Method | Behavioral interview response framework: Situation, Task, Action, Result |
| LCP | Largest Contentful Paint — Core Web Vital measuring page load performance |
| Celery | Distributed task queue for Python used for background/async jobs |
| WebSocket | Full-duplex TCP connection protocol used for real-time interview communication |
| Blendshapes | 3D facial animation weights used for avatar lip-sync; driven by Web Speech API word-boundary events in this project |
| WeasyPrint | Python library for generating PDF documents from HTML/CSS templates |
| Render.com | Free cloud hosting platform used to deploy the FastAPI backend and Celery worker for this project (750 free hours/month) |
| Prep Mode | Self-registered usage of the platform for personal exam preparation; draws from the public, auto-generated question dataset |
| Hiring Mode | Company-managed usage of the platform to shortlist and test real job/placement candidates via campaigns; candidates log in at /company/login with system-issued credentials and see only that campaign's curated question sets |
| Company | A registered organization/college using Hiring Mode, managed by one or more `company_admin` users; can run multiple campaigns in parallel |
| Campaign | The core hiring object — one job role, one deadline, one set of active rounds, one question set, one batch of invited candidates. Candidate-facing routes are scoped as `/c/:campaign_slug/...` |
| Candidate | A `role='candidate'` user, created only by a company admin's shortlist/invite action, scoped to exactly one campaign, with a single test attempt and no self-registration path |
| Proctoring Engine | Module 10 — the fullscreen/tab-switch/webcam fair-usage monitoring system that runs across Aptitude, Coding, and Interview rounds |
| Integrity Score | 0–100 score computed from a session's logged proctoring violations; shown to the candidate (Prep Mode) or the admin (Hiring Mode) alongside the actual test score |
| Access Code / Candidate Credential | The system-generated `candidate_id` + temporary password a company admin's shortlist action issues to a candidate, so they can log in at `/company/login` without a self-registered Prep Mode account |
| COCO-SSD | A lightweight, pre-trained TensorFlow.js object-detection model used browser-side to spot phones/extra people/devices during proctored rounds — free, no server round-trip |
| Fullscreen API | Browser-native API (`requestFullscreen()`) used to force and detect exits from fullscreen during proctored test rounds |
| Page Visibility API | Browser-native API used to detect tab switches and window minimization during proctored test rounds |

---

*— END OF DOCUMENT —*

*Complete AI Interview Assistant PRD v2.2 | Varun Kumar A | June 2026*
*Confidential — Final Year Project*

*v2.2 changelog: Replaced the earlier org-based Hiring Mode with the full **Dual Platform Architecture** (§3B) — explicit `student`/`candidate`/`company_admin`/`super_admin` role hierarchy, `/company/login` + `/c/:campaign_slug/...` routing, and campaign-based score weighting with a 20% integrity penalty. Rewrote §6 as three separate journeys (Student, Company Admin, Invited Candidate). Module 10 (Fair-Usage Monitoring & Proctoring) is now explicitly non-blocking/log-only in Prep Mode and fully enforced with progressive warnings + optional auto-disqualification in Hiring Mode. Module 11 renamed to Companies/Campaigns/Candidate Access with a `campaigns` table replacing standalone question sets. Propagated the terminology change (company/campaign/candidate, not organization) through the DB schema, API reference, Module 1/8/9, Admin Panel, routes table, MVP scope, and glossary.*
