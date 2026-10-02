# InterviewAI — Complete Screen-by-Screen Workflow

**38 screens across 4 user modes** · Single-page Next.js 16 app · Zustand store-based router
(via `useNav().set(screenId)` from `src/lib/store.ts`)

The app has **4 distinct user modes**, each with its own color of entry in the
top nav: **Prep Mode** (students practicing), **For Companies** (HR teams
hiring), **Candidate** (invited applicants in a live hiring flow), and **Super
Admin** (platform operators).

This document walks every screen in the order a user would encounter it,
including sub-screens, every flow, and what was recently added.

---

## Table of Contents

1. [Shared Chrome (always visible)](#1-shared-chrome-always-visible)
2. [Prep Mode — 10 screens](#2-prep-mode--10-screens)
3. [For Companies — 9 screens](#3-for-companies--9-screens)
4. [Candidate — 11 screens](#4-candidate--11-screens)
5. [Super Admin — 8 screens](#5-super-admin--8-screens)
6. [Recently-Added Features Summary](#6-recently-added-features-summary)
7. [End-to-End User Journeys](#7-end-to-end-user-journeys)

---

## 1. Shared Chrome (always visible)

Every screen renders inside a shared shell that consists of 4 always-mounted
components (`src/app/page.tsx`):

### 1.1 `TopNav` — sticky top bar (`h-14`)

Has **3 render modes**:

| Mode | When | What it shows |
|---|---|---|
| **Locked** | `navigationLocked === true` (during a proctored test) | Minimal 48px bar — just the InterviewAI logo + a rose **"Exit Test"** button. All other nav is hidden so the candidate can't tab away. |
| **Normal** | default | Logo (→ `landing`), 5 desktop tabs (Home / Prep Mode / For Companies / Candidate / Super Admin) with animated layoutId pill, **Theme Switcher**, **Hamburger** drawer, **Screens 38** button (dev navigator), **Start Free** CTA (→ `auth`). |
| **Hamburger drawer** | user clicks hamburger | Slide-in 320px panel from the right: "Sections" list + "Quick Access" for the *current* section (e.g. when on a superadmin screen, lists all 8 superadmin screens). |

The **Screens 38** button opens a separate searchable dev drawer that lists
all 38 screens grouped by mode — used for QA / demo navigation.

### 1.2 `FlowNav` — sticky progress bar (`h-9`, sits at `top-14`)

A thin progress stepper that appears on flow screens. Returns `null` when
`navigationLocked === true` or when the current screen isn't in any flow
(`PREP_FLOW`, `ADMIN_FLOW`, `CANDIDATE_FLOW`, `SUPERADMIN_FLOW`).

3-column layout:
- **Left (w-32)**: Back button (arrow + previous step label). Hidden on the
  first step of each flow.
- **Center**: Clickable progress dots — one per step. Active dot is larger +
  accent-gradient; done dots are solid accent; future dots are muted. Click
  any dot to jump.
- **Right (w-32)**: **Continue** button (gradient pill with next step label +
  arrow) — or **Done** on the last step (returns to flow's home base).

16 accent themes available (violet, ocean, forest, sunrise, emerald,
master-purple, ruby, gold, rose, midnight, sakura, forest-sovereign, slate,
coral, cosmic-diamond, custom) — switched via the Theme Switcher.

### 1.3 `SiteChrome` — ambient background
### 1.4 `SmartFooter` — global footer

---

## 2. Prep Mode — 10 screens

The "student practice" mode. **Forgiving proctoring** — logs only, no
penalties. Unlimited retakes. Mock persona throughout: "Priya Sharma",
Backend Developer, last interview 78/100.

**Flow**: `PREP_FLOW` steps through `landing → auth → dashboard → resume →
aptitude → coding → interview → report → replay`.

### 2.1 Landing Page — `LandingPage`

**Heading**: *"Practice interviews with an AI that listens back."*

7 scrolling sections:
1. **Hero** — asymmetric 7/5 split, single "Start free" CTA, floating "78
   last interview score" card.
2. **Stat band** — 4 stats (5,200 candidates, 47 companies, 12k mocks, 4.6
   avg improvement).
3. **Six features** — vertical narrative, alternating image/text, numbered
   01–06: Resume analysis, Aptitude practice, Coding practice, Live AI
   interview, 17-section report, Interview replay.
4. **How it works** — 4 horizontal steps (Upload resume → Practice tests →
   AI interview → Get report).
5. **Testimonials marquee** — Framer Motion `x: [0, -1600]` 40s infinite
   scroll, edge-fade masks, 6 testimonials duplicated. Pause-on-hover.
   Falls back to horizontal scroll when `useReducedMotion()` is true.
6. **Quiet CTA** — second "Start free" button.
7. **Footer** — rendered by global `SmartFooter`.

**CTAs**: Two "Start free" buttons → `auth`.

---

### 2.2 Auth — `AuthScreen`

**Heading**: *"Land your dream role with AI on your side."*

Two-column layout: left marketing aside (floating violet avatar mock + 3
stat tiles: Students 5,000+ / Mock Qs 1.5k+ / Reports 17-sec), right form
panel with **pill-style tab switcher**.

**Tabs**: `signup` | `login`.

**Signup sub-flow** — 3 steps via `AnimatePresence`:
- **Step 1 — Account**: Name, Email, Password (with show/hide + Google
  button). 1.1s loading → step 2.
- **Step 2 — Verify OTP**: 6-digit `InputOTP`, 272s resend countdown, demo
  tip `000000` (accepts; otherwise 3-attempt limit).
- **Step 3 — Profile**: Target role (10 options), skill tag-input with
  autocomplete (30 suggestions), education rows, LinkedIn/GitHub URLs.
  0.9s loading → `dashboard`.

**Login sub-flow**: Email + password with field-level validation, Remember
me, Forgot Password → reset-sent success state, "Continue with Google"
(decorative).

**CTAs**: "Back to home" → `landing`; "Complete Setup" / "Login" →
`dashboard`.

---

### 2.3 Student Dashboard — `StudentDashboard`

**Heading**: *"Welcome back, Priya."*

Central hub showing scores, trends, recent activity, and entry points to
all prep modules. Single screen, no sub-screens.

**Sections**:
- **Header** with "Download Report" button.
- **Top row (5-col grid)**: `ScoreGauge` (animated SVG circle, 78%) +
  trend `AreaChart` (last 10 sessions, violet gradient, goal line 85).
- **Middle row (3-col)**: Skill Radar (6-axis: Technical / Comm / Behav. /
  Body / Conf. / PS), Resume ATS card (87/100, "View Full Analysis" link),
  Aptitude Quick Stats (5 progress bars).
- **Bottom row (2-col)**: Recent Interviews list (5 entries with tone-
  colored badges, "Replay →" links, "Start New Interview" button), Learning
  Roadmap (6 weeks: 2 done, 1 active spinning, 3 locked), Coding Activity
  heatmap (12×7 random cells).
- **Fair usage summary** (`Collapsible`): 4 stats — Tab switches (3),
  Fullscreen exits (1), Posture warnings (2), Mic activations (9). Note:
  *"proctoring data is purely informational. It never blocks you."*
- **Bottom actions row**: 4 quick-launch cards (Resume Hub / Aptitude
  Portal / Coding Arena / AI Interview).

**CTAs**: `report` (Download), `resume`, `aptitude`, `coding`, `interview`,
`replay`.

---

### 2.4 Resume Hub — `ResumeHub`

**Heading**: *"Resume ATS Analyzer"*

Upload PDF/DOCX → AI returns ATS score, missing keywords, grammar/formatting
issues, improvement plan in <15s.

**Tabs**: `upload` | `results` | `history` (pill tabs with `layoutId`).

- **Upload tab**: 2-col card — left feature bullets, right `Dropzone`
  (drag-and-drop + browse, file card with name/size, "Analyze Resume"
  button). Loading state shows `Shimmer` skeletons.
- **Results tab**: 3 `ScoreCard`s (ATS 87, Overall 82, Job Fit 78), Skills
  Found (7), Missing/Recommended (3+3), Grammar Issues (3 with line refs +
  fixes), Formatting Issues, AI Summary (2 paragraphs + metadata badges:
  Experience Junior, Word Count 487, Pages 1, File PDF 184KB), Download
  Full Report + Upload New Resume buttons.
- **History tab**: Table with 4 past uploads (date/file/role/ATS/fit +
  View action), mobile card variant.
- **Footer CTA card**: "Want tailored interview questions for your role?"
  → **Start Interview** button.

**CTAs**: "Start Interview" → `interview`. (Leaf screen otherwise.)

---

### 2.5 Aptitude Portal — `AptitudePortal`

**Heading**: *"Timed aptitude practice"*

25 questions, 5 categories, 30 min, **unlimited retakes**.

**Phases**: `rules` | `test` | `results` (pill tabs).

- **Rules**: Test Configuration card with `RuleTile`s (25 Qs / 30 min / 5
  categories), category breakdown (Quantitative, Logical, Verbal,
  Analytical, Data Interpretation — 5 each), `RuleLine`s (no negative
  marking, unlimited retakes, auto-save 30s, tab switches logged),
  **optional** device opt-in (Mic + Camera `Switch`es, both default off),
  **Start Test** button.
- **Test**: Top bar (color-coded timer — green/amber/pulse-red when <60s,
  Q N of 25, Bookmark toggle). 2-col grid: left question card (category
  badge, question text, A–D option buttons), right Question Navigator
  (5×5 grid with legend: answered/bookmarked/current/unanswered, answered
  + bookmarked counters). Footer: proctoring info + Submit Test button
  (opens confirmation `Dialog`).
- **Results**: Score header (X/25 correct, % accuracy, time taken, trophy
  icon, progress bar), Category Breakdown (5 progress bars with
  `StaggeredReveal`), Wrong Answers & Explanations (your answer vs correct
  + explanation), Take Again + Back to Dashboard buttons.

**Proctoring**: `requestFullscreen()` + `setNavigationLocked(true)` on
entering test. **Re-enter fullscreen `Dialog`** on Esc exit — copy:
*"Prep mode is forgiving, so there are no penalties."* Simulated
tab-switch counter increments every 45s.

**CTAs**: "Back to Dashboard" → `dashboard`. "Take Again" → resets to
rules.

---

### 2.6 Coding Arena — `CodingArena`

**Heading**: *"Practice with the AI code reviewer"*

VS Code-like editor with syntax highlighting, 10 test cases per problem,
real-time execution, AI review.

**Two views** driven by `useNav(s => s.codingView)`:

#### List view (`codingView === "list"`)
- `SectionHeading` + shared `ProblemListTable` component (LeetCode-style
  index with submission heatmap, topic progress, solved/attempted counters)
  + **random-question picker** (`pickRandomUnsolved` — picks a problem the
  candidate hasn't solved yet; falls back to any non-current problem).

#### Editor view (`codingView === "editor"`)
**Fullscreen + navigation-locked.** Top bar (Back to Problems, Problem # +
difficulty badge, Next Question). 2-col grid:

- **Left pane** — problem statement (title, topic, acceptance, description,
  examples in dark code blocks, constraints, avg solve time).
- **Right pane** — editor chrome (`solution.py`/`.js` filename, language
  `Select` with switch-confirm dialog, auto-saved indicator pulsing every
  30s), Monaco-styled dark textarea with line numbers, custom-input
  Textarea, Run/Submit/Copy buttons, test-case results list (pass/fail
  with runtime/mem, hidden cases flagged), **AIReview panel** (appears
  after submit — scores complexity, readability, gives refactor
  suggestions).

**Languages**: Python + JavaScript only.

**Mock execution**: Run → 8/10 pass (cases 2 wrong-answer, 7 timeout).
Submit → all pass → success modal "Accepted" → `markSolved` +
`recordSubmission`.

**Proctoring**: Fullscreen + nav lock on entering editor. **Esc re-enter
modal** (no penalty).

**Store integration**: `solvedProblems`, `attemptedProblems`,
`submissions`, `currentProblemId`, `markSolved`, `markAttempted`,
`recordSubmission` — all persisted to localStorage.

**CTAs**: "Back to Problems" → list view (internal); "Next Question" →
editor with new problem. Exits via `BackToHome` (top-left link →
`landing`).

---

### 2.7 AI Interview — `InterviewStudio`

**Heading**: *"Live AI Interviewer"*

Real-time conversation with a 3D avatar that asks, listens, generates
follow-ups, analyses body language/emotion/eye contact.

**Sub-screens**: `setup` | `live` | `processing` | `done`. A "Demo
controls" pill bar at top lets you jump between subs directly.

- **Setup**: Step 1 — Choose Interview Type (6 cards: HR/Behavioral,
  Technical-General, Technical-Role-Specific, Managerial, Company-
  Specific, Full E2E — each with icon/desc/duration/qCount/tone). Step 2
  — System Check (`SystemCheckCard` for Mic + Camera, each with
  idle/ok/fail status + Test button), **Begin Interview** button
  (disabled until both OK).
- **Live**: Top bar (timer 08:42 amber, Progress Q3 of 10, End Early
  button → confirm dialog). 2-col grid: Left = `AvatarBlock` (animated
  violet circle with Video icon + floating "thinking" pill) +
  `Waveform` (24 bars) + `AnalysisIndicators` (Emotion/Eye
  Contact/Posture); Right = AI Question bubble (violet), Live Transcript
  (`ChatBubble` for ai/user with timestamps, `TypingDots` "AI is
  thinking…"), `MicToggle`, proctoring footer.
- **Processing**: `ConicSpinner`, "Processing your interview…", 4
  `PROCESSING_STEPS` (Transcribing 12s / Evaluating 18s / Generating
  report 20s / Calculating scores 8s) with done/active/pending states,
  "Go to Dashboard" link.
- **Done**: Spring-animated violet check circle, "Interview Complete", 3
  stat tiles (Questions Asked 10, Avg Answer Length 1m 12s, Filler Words
  23), **View Report** + **Go to Dashboard** buttons.

**Proctoring**: Fullscreen + nav lock during `live` only. On entering
`processing`: auto `exitFullscreen()` + `setNavigationLocked(false)`.

**CTAs**: "Go to Dashboard" → `dashboard` (from processing + done); "View
Report" → `report` (from done).

---

### 2.8 Interview Report — `InterviewReport`

**Heading**: *"Interview Report. Priya Sharma"*

Full **17-section** post-interview report. Single long scroll of 17
`SectionCard`s.

**Sticky floating "Download PDF" button** (top-right, with "Generating…"
spinner state). Header with `Interview Report · v4` badge, candidate name,
generation metadata (Jan 15, 2025 · Technical-Role-Specific Backend ·
Session ID #INT-2025-0115-P3XK · 28m 14s).

**17 numbered sections**:
1. Cover Page (logo + 4 meta tiles)
2. Executive Summary (3 paragraphs)
3. Overall Score Table (6 dims: Technical 82, Communication 74, Behavioral
   68, Body Language 71, Confidence 79, Problem Solving 85)
4. Hiring Recommendation ("Recommend" band 65–85, with
   Not-Recommended/Conditional/Recommend/Strong legend)
5. Resume Analysis (ATS 87, Job Fit 78%, Skills Match 9/14)
6. Aptitude Analysis (5 category progress bars + Strengths/Weaknesses
   InsightBoxes)
7. Coding Analysis (4 stats + AI Code Review Summary for "Two Sum")
8. Technical Analysis (table Q1–Q10 with topic/accuracy/depth)
9. HR/Behavioral Analysis (STAR 70%, Motivation 82%, Culture Fit 78%)
10. Communication Analysis (Clarity 82, Structure 70, Filler Words 34,
    Pacing 142 wpm)
11. CV/Emotion Analysis (Dominant Neutral, Eye Contact 78%, Posture 71%)
12. Emotion Timeline Chart (recharts LineChart — Neutral/Happy/Surprised/Sad
    per question)
13. Session Highlights (3 cards)
14. Top 7 Strengths (bulleted, `dangerouslySetInnerHTML`)
15. Top 7 Improvements
16. 6-Week Learning Roadmap (`Accordion` with daily goals, free resources,
    milestones)
17. Final Recommendation (quote-styled, **Take Another Interview** +
    **Back to Dashboard** buttons)

Footer: "Generated by Gemini 1.5 Flash + Whisper + MediaPipe. © 2025
InterviewAI." + Download PDF.

**CTAs**: "Take Another Interview" → `interview`; "Back to Dashboard" →
`dashboard`.

---

### 2.9 Interview Replay — `InterviewReplay`

**Heading**: *"Re-watch your interview"*

Video recording synced to transcript + AI annotations; click any
transcript line to jump.

**3-col grid**:
- **Left (col-span-2)**: (1) Video player mock — dark aspect-video frame,
  animated floating violet avatar, center play button, top overlay (date +
  mm:ss / 10:00 timecode), bottom controls (scrubbable progress bar with
  **chapter markers** from transcript timestamps, rewind 10s / play-pause
  / forward 10s, volume bar, captions + fullscreen buttons). (2)
  Transcript card — 12 items (6 ai + 6 user), each a clickable button that
  jumps the player, AI vs You avatars, timestamps, amber "AI note"
  callouts (e.g. "Good tone, slight nervous laugh", "Best answer of the
  session", "Lost structure. Should use STAR-L").
- **Right (1 col)**: (1) Emotion Timeline strip — 6 items
  (Neutral/Happy/Neutral/Happy/Thinking/Neutral, color-coded, clickable).
  (2) Session Summary — Score 78/100, Recommendation "Recommend", Duration
  8m 40s, Questions 6 of 10, Filler words 23; **Full Report** button. (3)
  Body Language Highlights — Eye contact 78%, Posture warnings 4, Hand
  gestures 18, Smiles 9; note: "Body language analyzed locally via
  MediaPipe. No video leaves your browser."

**Bottom 2-CTA grid**: "Open Report" → `report`; "Take another interview"
→ `interview`.

---

### 2.10 Student Profile — `StudentProfile`

**Heading**: *"Your profile"*

Data personalizes AI interview questions, resume analysis, and learning
roadmap.

**4 tabs** via shared `Tabs`:

- **Personal Info**: Avatar upload card (PS monogram, Upload Image button,
  2MB PNG/JPG/GIF square) + 8-field grid (Full Name, Phone, DOB, City,
  Email read-only, LinkedIn, GitHub, Portfolio) + Short Bio textarea +
  amber "Why we ask" callout.
- **Education**: Repeating rows (Degree Select from 11 options,
  Institution, Year, Field) with add/remove; "Add Education Row" button.
- **Skills**: Tag-input with autocomplete (30 suggestions), 4 `SkillStat`s
  (Total, Backend, Frontend, Infra), emerald "Profile completeness 82%"
  callout (add Docker + CI/CD → 100%).
- **Job Preferences**: Multi-select roles (10 options, grid of toggle
  buttons), Experience level Select (Fresher → Staff), Expected Salary
  input, Preferred Locations tag-input (7 Indian cities + Remote), Notice
  Period / Remote / Shift selects, violet callout: "Saved preferences are
  visible to recruiters in Hiring Mode."

**CTAs**: None — purely internal (returns via `BackToHome`).

---

## 3. For Companies — 9 screens

The "HR team hiring" mode. **Strict proctoring** with 3-strike auto-submit
and 20% penalties. No retakes.

**Flow**: `ADMIN_FLOW` steps through `company-landing → company-register →
admin-dashboard → campaign-new → question-manager → candidate-leaderboard
→ bulk-upload → proctoring-review → final-selection`.

### 3.1 Company Landing — `CompanyLanding`

**Heading**: *"Run your next campus drive in an afternoon"*

Public marketing page targeted at recruiters. 12 sections including:

1. Hero with CTAs (`Start Hiring Free`, `See How It Works`) + trust chips.
2. ROI Stats — 4 GlowCards (87% less screening time, 10× faster
   shortlisting, 0 scheduling conflicts, 20% higher offer-accept).
3. Pain Points — 4 cards.
4. Bento Features — 6 cards (public apply link, AI resume ranking,
   one-click shortlist + invites, strict 3-strike proctoring, live AI
   interviews, real-time leaderboard).
5. Automation Pipeline — 7 numbered steps.
6. Comparison Table — Manual vs InterviewAI.
7. Proctoring Spotlight — mock candidate integrity timeline card.
8. Logo Cloud — marquee of 12 company names (Razorpay, Cred, Zomato,
   Postman, Freshworks, Atlassian, Stripe, Linear, Notion, etc.).
9. Testimonials — 5 cards in pause-on-hover Marquee.
10. Pricing — Monthly/Yearly toggle (20% off yearly); 3 tiers: Starter
    (Free), Growth ($299/mo, most popular), Enterprise (Custom).
11. FAQ — 6-item accordion.
12. Final CTA.

**`CompanyMockup`** floating dashboard preview (animated stats row + mini
leaderboard + floating chips).

**CTAs**: `Start Hiring Free` / `Create Company Account` / pricing Growth
→ `company-register`; `See the leaderboard` → `candidate-leaderboard`;
`See the proctoring review screen` → `proctoring-review`; `Tour the admin
dashboard` → `admin-dashboard`.

---

### 3.2 Company Registration — `CompanyRegister`

**Heading**: *"Hire 100 candidates in a week. Not a quarter."*

Two-column grid — left pitch (hidden on mobile), right form card.

**Left pitch**: badge "For Companies. Hiring Mode", headline, pitch
paragraph, 4 TRUST_ITEMS (1,500+ aptitude bank, AI resume + ATS extraction,
Live proctoring + integrity scores, Per-candidate PDF reports),
"One-time setup. 2 minutes. No credit card. Free for 14 days." card.

**Right form (5 fields)**:
1. Company Name
2. Admin Name
3. Admin Email (regex validated)
4. Admin Password (show/hide toggle, min 8 chars)
5. Confirm Password (show/hide toggle, mismatch validation)

**Submit**: "Register & Open Dashboard" (disabled until `canSubmit`). 900ms
simulated loading → `admin-dashboard`.

**CTAs**: "Back to home" → `landing`; "Sign in" → `landing`.

---

### 3.3 Admin Dashboard — `AdminDashboard`

**Heading**: *"Welcome back, Priya Sharma · HR Lead"*

Main admin home screen after registration.

**Sections**:
- Header with plan ("Teams. 50 seats"), company name "Northwind Labs Pvt
  Ltd", **Create New Campaign** button.
- **Stats grid (4)**: Total Campaigns (5, violet), Active Campaigns (3,
  emerald), Total Candidates (142, sky), Interviews Completed (89, amber).
- **Quick actions grid (4 cards)**: Create new campaign → `campaign-new`;
  Manage question sets → `question-manager`; Bulk resume upload →
  `bulk-upload`; Final selection → `final-selection`.
- **Campaign pipeline table** — Searchable; columns: Campaign, Role,
  Deadline, Candidates, Progress bar, Status badge (Active/Closed/Draft),
  View link. 5 mock campaigns. Row click → `candidate-leaderboard`.
- **Live activity strip** — "3 candidates are taking assessments right
  now" with pulsing dots (Priya · Aptitude, Amit · Coding, Rahul ·
  Interview).
- **Integrity score card** — 96% with "2 flags auto-flagged for review"
  and `Review flags` link → `proctoring-review`.

---

### 3.4 Campaign Creation — `CampaignCreate`  ⭐ RECENTLY UPGRADED

**Heading**: *"Create a new hiring campaign"*

Two-phase flow: `form` → `success` (AnimatePresence, 900ms loading).

#### Form phase — 2-column layout (1.4fr main / 1fr sticky summary)

**Main form sections (6 cards)**:

1. **Campaign Details** — Name, Job Role, Experience Band (0-1/1-3/3-5/5+),
   Deadline (datetime-local).
2. **Active Rounds** — Three toggle cards: Aptitude (25 MCQs · 30 min),
   Coding (3 problems · 60 min), Interview (Live AI · variable).
3. **Score Weights** — Per-round sliders (0-100, step 5); must sum to 100%
   with live Σ badge; error shown if invalid.
4. **Qualification Cutoffs** ⭐ UPDATED — Min Aptitude Score (%) and **Min
   Coding Questions to Solve Correctly** (of 3). Old "min to attempt" was
   replaced with "min to solve correctly" — attempts alone do not
   qualify. Helper copy: "Fewer solved = Interview round locked.
   Attempts alone do not qualify."
5. **Interview Type** ⭐ NEW — 6 selectable cards:
   - **Full Interview** (30 min, 12 Q) — Technical + behavioral +
     role-specific. Most thorough.
   - **Role Specific** (25 min, 10 Q) — Tailored to job role's must-have
     skills.
   - **Technical** (20 min, 8 Q) — Deep-dive on DSA, system design, coding
     concepts.
   - **Behavioral** (15 min, 6 Q) — Soft skills, culture fit, past-
     experience probes.
   - **System Design** (30 min, 4 Q) — Architecture + scalability for
     senior engineering roles.
   - **Quick Screen** (10 min, 5 Q) — Short filter round for high-volume
     pipelines.
6. **Proctoring & Integrity** ⭐ HEAVILY EXPANDED — the standout section:
   - Strictness dropdown: Relaxed (warnings only) / Standard (auto-submit
     3rd strike) / Strict (auto-DQ 2nd strike).
   - **Auto-DQ toggles (6)**: 3+ tab switches, Phone in frame, Extra
     person, Copy/paste, Right-click, DevTools open.
   - **Anti-AI / Anti-Parakeet Detection panel** ⭐ NEW (rose-tinted)
     with **8 toggle rules**:
     - Secondary voice detection (whispered AI prompts via mic)
     - Gaze tracking (off-screen glances pattern-matched to AI use)
     - Screen-share / second monitor detection
     - Second device detection (audio fingerprint for nearby phones)
     - **Browser extension scan** (block known AI-helper extensions like
       Parakeet)
     - Keystroke dynamics (flag paste-from-AI typing patterns)
     - Clipboard lock (disable clipboard + log every paste attempt)
     - AI-response latency analysis (flag answers with LLM-typical
       cadence)
   - Camera note: "When AI-use is detected, a high-res webcam snapshot +
     audio recording is captured and queued for human review. The
     candidate sees no warning until the admin confirms."
   - "N rules active" badge at the top.

**Right sticky summary card**: Rounds active / Weight total / Interview
type / Min aptitude / Min coding solved / Strictness / Auto-DQ rules /
Anti-AI rules + **Create Campaign & Generate Link** button.

#### Success phase
- Green spring-animated check.
- Campaign details recap (3+3 grid).
- **`ApplyLinkBox`** — URL (`https://interviewai.com/apply/backend-sde-1-a3f2`),
  `Copy link` button, `Copy with caption`, **deterministic 21×21
  `QRPlaceholder`** (procedurally generated pseudo-QR — no library, just
  a finder-pattern stamp + LCG-randomized data cells), sharing tip.
- Two action buttons: `Add Questions` → `question-manager`, `View
  Applicants` → `candidate-leaderboard`.

---

### 3.5 Question Set Manager — `QuestionManager`  ⭐ RECENTLY UPGRADED

**Heading**: *"Question Set Manager"*

Per-campaign question bank for aptitude MCQs and coding problems.

**Tabs (2)**: `Aptitude Questions` | `Coding Problems`. Each tab is a
2-column grid (form left / list right).

#### Aptitude tab
- **AptitudeForm**: Category (Quant/Logical/Verbal/Analytical/DI),
  Difficulty, Sub-topic, Question text, 4 option inputs with RadioGroup
  for marking correct (A/B/C/D), Explanation. Buttons: `Add Question`,
  `Bulk Upload CSV` ⭐ WIRED, `Download template` ⭐ WIRED (real CSV
  download).
- **AptitudeList**: Scrollable list of 5 mock questions with category/
  subtopic/difficulty tags, options (correct highlighted green),
  explanation, edit (Pencil) + delete (Trash2) icons.

#### Coding tab
- **CodingForm**: Title, Difficulty, Type (DSA / SQL radio cards),
  Problem statement (markdown), Function signatures (multiline),
  Visible test cases (1-10), Hidden test cases (0-20), Time limit (ms),
  Memory limit (KB), Schema SQL (conditional, SQL only). Buttons: `Add
  Coding Problem`, `Bulk Upload CSV` ⭐ WIRED, `Download template` ⭐
  WIRED.
- **CodingList**: Table of 3 mock problems (Two Sum Sorted Easy DSA, LRU
  Cache Hard DSA, Top 3 Products Medium SQL) with type/difficulty tags,
  tests count, edit/delete.

#### `BulkUploadDialog` (shared, 3-stage) ⭐ NEW
1. **select** — File picker (CSV only, max 5MB), parsing spinner, required-
   columns reference.
2. **preview** — Parsed table preview (4-5 mock rows) with `Pick another
   file` and `Import N questions/problems` CTA.
3. **done** — Success checkmark, auto-close after 1.5s.

#### `downloadCsvTemplate(kind)` ⭐ NEW (pure client-side)
Generates RFC-4180-compliant CSV (properly escaped quotes) with header +
2 example rows for either aptitude or coding. Triggers browser download
via Blob + anchor. Aptitude schema: 10 columns
(`category,sub_topic,difficulty,question_text,option_a..d,correct,explanation`).
Coding schema: 10 columns
(`title,difficulty,type,statement,signatures,visible_tests,hidden_tests,time_limit_ms,memory_limit_kb,schema`).

---

### 3.6 Candidate Leaderboard — `CandidateLeaderboard`

**Heading**: *"Candidate leaderboard"* (State 4. Post-shortlist)

Real-time ranked candidate leaderboard. The hub of the entire pipeline.

**Sections**:
- Header with campaign pill, subtitle "Updates in real-time via
  WebSocket", `Bulk upload` button (top-right) → `bulk-upload`.
- **Stats bar (4)**: Total (8), Shortlisted (5), Invited (5), Completed
  (2).
- **Notification banner** — Amber: "3 new applicants in the last hour.
  Auto-ranked by AI job-fit score."
- **Auto-shortlist panel** — Rocket icon, live preview count, method
  `Select` with 8 options (Top 5/10/20, Job Fit ≥75/80/90%, All
  applicants, Manual select), `Shortlist & Send Invites · N` button.
- **Source tabs** — All (8) / Apply Link (5) / Bulk Upload (3).
- **Main table (14 columns, scrollable, 680px max height)**: Checkbox, #,
  Name (+ auto-generated `BACKEN-XXXXXX` ID), Source badge, Job Fit
  (progress bar + %), ATS, Email (inline editable input for missing
  emails with confirm button), Aptitude score, Qualification pass/fail
  icon, Coding (with Lock icon when qualification failed), Interview
  (Live pulsing badge or score), Overall, Integrity (Clean / 2 flags /
  20% penalty badge — click → `proctoring-review`), Status badge.
- **Bottom actions**: `Refresh`, `Export CSV`, `Export PDF ZIP` (primary
  violet).

**Notable**: Inline email fixing for missing-email candidates (amber input
box with confirm). "Live" pulsing badge for candidates currently in
interview round. Lock icon indicating coding round is locked due to
aptitude failure.

---

### 3.7 Bulk Resume Upload — `BulkUpload`

**Heading**: *"Bulk resume upload"*

Alternative to the public apply link — for candidates you already have
(campus drive, agency, internal DB).

**3 phases via AnimatePresence**:

#### Phase 1: `upload`
- Info banner (sky) explaining when to use this vs the public apply link.
- Dropzone: drag & drop or click. Supports PDF / DOCX / ZIP, max 50MB
  total, max 100 files.
- Selected files list (scrollable, removable).
- `Upload & Analyze` button.

#### Phase 2: `processing`
- Auto-advances (280ms per file via `useEffect` timer).
- Progress bar + countdown.
- Per-file status list: Analyzed / Extracting... (i/N) / Waiting...
- Note: "Please don't close this page · server keeps processing even if
  you navigate away."

#### Phase 3: `results`
- **Summary**: "N resumes fully extracted" (emerald) + "N resumes need
  manual input" (amber).
- **Needs-input section**: Cards for each resume with missing fields —
  Filename + Saved badge; AI Extracted panel (Name, Email, Phone, Job Fit
  %, ATS score); Inputs (Candidate Name if missing + Email Address always
  required + Save button).
- **Fully extracted section**: Scrollable list with name, email, Fit %
  badge.
- **Bottom actions**: `Discard all` (back to upload) + `Add all N to
  leaderboard` (disabled until all needs-input saved) →
  `candidate-leaderboard`.

---

### 3.8 Proctoring Review — `ProctoringReview`

**Heading**: per-candidate proctoring integrity review

Candidate: Amit Patel, ID `BACKEN-3FA82C`, Aptitude 52/100, Integrity 64%,
2 flags, 1 penalty.

**Sections**:
- Candidate info card (avatar, name, ID, email, source, score chips,
  Integrity 64% amber chip).
- **Two-column grid**:
  - **Left (1.6fr) — Integrity score breakdown**: Base +100, Tab switch
    -15, Phone detection -12, Copy-paste -9, Final 64%. Note: "A 20%
    penalty was applied to the overall weighted score per policy (Strict
    mode · 3+ tab switches)."
  - **Right (1fr) — Summary**: 3 stat tiles (Events / Open flags /
    Confirmed), rows for Flags raised (2), Penalties applied (1),
    Auto-submit triggered (Yes · 11:02), Recommendation (Hold for
    review).
- **Proctoring event timeline table** — Time / Round badge / Event /
  Severity badge (Info/Warning/Critical/Auto-submitted) / Screenshot
  (View button) / Action buttons (Dismiss X / Confirm ✓). 5 mock events.
  Row styling: confirmed rows get rose tint, dismissed rows get
  opacity-60.
- **Bottom CTA**: Audit-log note + `Auto-disqualify candidate` outline
  button + `Save & return to leaderboard` violet button →
  `candidate-leaderboard`.

#### Screenshot dialog
Opens when clicking `View` on an event. Shows `FramePlaceholder` — a faux
webcam frame: dark slate background, person silhouette, phone overlay
(rose), bounding box "PHONE · 94% confidence", "● REC · {time}", "cam_001
· 1280×720". Footer: `Dismiss flag` + `Confirm violation`. Description:
"stored in Cloudinary, available to company admins only."

---

### 3.9 Final Selection — `FinalSelection`  ⭐ RECENTLY UPGRADED

**Heading**: *"Final selection"*

Final selection screen — AI-generated suitability notes, lock decisions,
and dispatch personalized job offer emails with auto-generated PDF
letters.

**Sections**:
- Header with status badge: "{pending} pending · {selected} selected ·
  {offersSent} offers sent".
- **AI explainer banner** ⭐ NEW (violet): "AI Suitability Notes —
  auto-generated per candidate. The note in each row is generated by
  Gemini using the candidate's aptitude, coding, interview, and
  proctoring signals. It surfaces whether they are a strong hire, hire,
  borderline, or no-hire. Admins do not need to write notes — only
  review and confirm the decision."
- **Summary chips (4)**: Selected (emerald), Waitlisted (amber), Rejected
  (rose), Pending (slate).
- **Main table** — Columns: #, Candidate (name + ID + "Offer sent" badge
  if applicable), Rounds (mini-breakdown per round with score & color:
  emerald ≥75, amber ≥60, rose <60, "DQ" if 0), Overall, **AI Verdict**
  ⭐ NEW (`VERDICT_TONE`: Strong Hire / Hire / Borderline / No Hire badge
  with icon), Decision (`DecisionSelect` dropdown: Selected / Waitlisted
  / Rejected / Pending), **AI Note** ⭐ NEW (expandable line-clamp-2 card
  with `Read full note` + `Regenerate` buttons).
  - For "Selected" rows, a **Send Job Offer** button ⭐ NEW appears below
    the AI note.
  - 8 mock candidates with full AI notes.
- **Export actions**: "Decisions are versioned. Every change is logged
  with timestamp & admin name." + `Save decisions`, `Export CSV`,
  `Export PDF ZIP`.
- **Footer card**: "{N} candidates selected · {M} offers sent" + "PDF ZIP
  includes per-candidate 17-section reports + integrity audit trail."

#### `OfferComposerDialog` ⭐ NEW — 3 stages
Triggered by `Send Job Offer` on selected candidates. Pre-fills defaults
via `useEffect + queueMicrotask`.

**`compose` stage — Offer Details (12 fields, editable)**:
- Role / Title (Backend Developer)
- Team / Department (Platform Engineering)
- Level (Intern / SDE-1 / SDE-2 / Senior / Lead)
- Work mode (Remote / Hybrid / Onsite)
- Office Location (Bangalore HQ)
- Start Date (2025-03-03)
- Annual CTC (fixed) — ₹18,00,000
- Joining Bonus — ₹1,80,000
- Stock / ESOPs — ₹4,00,000 vested over 4 years
- Reporting To
- Offer Validity (days, 1-30, default 7)

**Email section**:
- To (locked, font-mono, candidate's email)
- Subject — "Job Offer from InterviewAI — {firstName}"
- Message — Personalized template message (8-row textarea)

**Attachment preview**: `Offer_Letter_First_Last.pdf` — "auto-filled with
the details above + candidate's resume & signed e-NDA."

**`sending` stage**: Spinner — "Generating PDF & sending email... Signing
offer letter · queuing email to {email}".

**`sent` stage**: Emerald check — "Offer sent! The offer email has been
queued to {email}. The candidate will receive it within 1-2 minutes."

After sent: `markOfferSent(id)` updates the row state → "Offer already
sent" disabled button + "Offer sent" badge in candidate cell.

---

## 4. Candidate — 11 screens

The "invited applicant" mode. **Strict flow-through**: System Check →
Aptitude → Aptitude Result → Coding → Coding Result → Interview → Final
Summary. **No dashboard retakes, no going back.** Strict proctoring with
3-strike auto-submit and 20% penalties.

**Flow**: `CANDIDATE_FLOW` steps through `apply → candidate-login →
candidate-change-password → candidate-system-check →
candidate-dashboard → candidate-aptitude → candidate-aptitude-result →
candidate-coding → candidate-coding-result → candidate-interview →
candidate-results`.

### 4.1 Public Apply Page — `ApplyPage`

**Heading**: *"Apply for: Backend Developer"*

Public application form. No login required.

**Two-state view** via `AnimatePresence`:
- **`form` (default)**: Top badge "Public Application · No login
  required", company header card (Acme Corp, role, deadline Jan 30,
  2025), form fields (Full Name*, Email*, Phone, Resume upload* PDF/DOCX
  ≤5 MB), resume uploader with click + drag-and-drop zone, file size +
  extension validation, file preview chip with name/size and remove
  button.
- **`submitted` (success)**: animated green CheckCircle, "Application
  Submitted", thank-you note, two checklist items ("Resume uploaded &
  analyzed by AI", "Acknowledgement email sent").

**Submit**: "Submit Application" (spinner "Submitting…", mock 2s
processing — comment notes Cloudinary upload + Gemini resume analysis).

**CTAs**: None — self-contained. The success message just tells the user
to await an email.

---

### 4.2 Candidate Login — `CandidateLogin`

**Heading**: *"Welcome back to your assessment"*

Invited candidate sign-in. GlowCard with ShieldCheck icon. Subtitle: "Acme
Corp · Backend Developer Campaign".

**Fields**: Candidate ID (mono font, placeholder `BACKEN-3FA82C`),
Password (with Eye/EyeOff show-hide toggle).

**Submit**: "Login" button (mock 1100ms "Verifying credentials…").

**Footer links**: "Apply to a campaign" → `apply`; "Trouble logging in?"
→ alert.

**CTAs**: Always → `candidate-change-password` (simulates first-login
force-change flow).

---

### 4.3 Force Password Change — `ForcePasswordChange`

**Heading**: *"Set Your New Password"*

First-login mandatory password change.

**Fields**: New Password (show/hide), Confirm Password (show/hide) with
live mismatch warning.

**Strength meter**: animated width, color tone: rose ≤40%, amber ≤70%,
emerald >70%.

**Password requirements checklist (5 rules, dynamically checked)**:
- ≥8 chars
- One uppercase
- One lowercase
- One number
- One symbol

**Submit**: "Update Password" — disabled if `newPw.length < 8` or
`newPw !== confirmPw`. Mock 1100ms "Updating password…".

**CTAs**: → `candidate-system-check`.

---

### 4.4 Pre-Test Proctoring Check — `PreTestCheck`

**Heading**: *"System Check"*

Mandatory pre-test proctoring gate.

**4 dynamic check rows**:
| ID | Label | Initial state | Action button |
|---|---|---|---|
| browser | Browser (Chrome 120 supported) | ok | — |
| mic | Microphone | ok | — |
| camera | Camera | pending | "Request Permission" |
| fullscreen | Fullscreen | pending | "Enter Fullscreen" |

Each row animates between pending / busy (spinner) / ok (green check).

**Progress header**: "X/4 checks passed" + mini progress bar.

**Amber ShieldAlert warning**: "All checks must pass... Exiting fullscreen
or covering the webcam will trigger proctoring warnings."

**Footer note**: "Your camera feed is processed locally for object
detection. Webcam frames are stored only if a violation is flagged."

**CTAs**: "Continue to Assessment" — disabled until `allOk` →
`candidate-aptitude`.

---

### 4.5 Candidate Campaign Dashboard — `CandidateDashboard`

**Heading**: "{Company} {Role}"

Campaign dashboard with countdown + rounds list.

**Sections**:
- Header: "Invited Candidate · Hiring Mode" badge, company/role title,
  Logout button → `landing`.
- **Countdown card** (`GlowCard` with tone-based ring color): Mock
  deadline = `now + 2d 8h 23m` → amber zone (24–72h). Live per-second
  ticking countdown (Days:Hrs:Min:Sec, big mono digits). Tone logic:
  emerald (>72h), amber (24–72h), rose (<24h).
- **Rounds list (3 `RoundCard`s)**:
  | # | Round | Status | Score | Action |
  |---|---|---|---|---|
  | 1 | Aptitude Test (25 Q · 30 min) | completed | 74/100, Passed | "Round Cleared" badge |
  | 2 | Coding Round (3 problems · 90 min) | in-progress | — | "Continue Coding" button |
  | 3 | AI Interview (~35 min) | locked | — | "Locked" button (disabled) |
- **Integrity status card**: 0 violations → "Integrity: Clean".
- **Footer**: "Once a round is submitted, it's permanently locked. No
  re-entry or retakes."

**CTAs**: Logout → `landing`; "Continue Coding" → `candidate-aptitude`
(should be `candidate-coding` — flagged bug).

---

### 4.6 Candidate Aptitude Test — `CandidateAptitudeTest`

**Heading**: *"Round 1 Aptitude Test"*

25 questions · 30 minutes · no retakes. **Strict proctoring.**

**Single live-test view** (with overlay modals).

**Sections**:
- Header: "Strict Proctoring" badge, round title, live countdown timer
  (mm:ss, turns rose when `timeLeft < 60s`).
- Progress bar: "Answered X / 25" + "% complete".
- **Main grid `[1fr_280px]`**:
  - **Question card**: category badge, "Question X of 25", question text,
    4 options (A–D) with selectable radio-style buttons, Previous / Next
    buttons (Next becomes "Submit Test" on Q25).
  - **Sidebar**: Question Grid (5×5 = 25 buttons, current=violet,
    answered=emerald, legend below), Categories breakdown list,
    "Submit Test" button.
- **Proctoring footer**: "Tab switches: N · Strikes: X/3 · Integrity:
  [Clean/Flags/Penalty]" + "Three strikes will auto-submit your test."

**Question bank**: 25 static questions (5 per category), pre-defined
correct indices. **No shuffle/randomization.**

**Triggers to navigate to result** (all 3 call `exitFullscreen() +
setNavigationLocked(false) + stopMonitoring()` first):
1. Manual submit (`handleSubmit`)
2. Timer expiry → `autoSubmitted=true`
3. 3 strikes → `proctor.isAutoSubmitted` / `proctor.strikes >= 3`

**Auto-submit overlay**: "Time up" (timer) or "Auto-submitted" (strikes ≥
3) — different icon/copy.

**CTAs**: → `candidate-aptitude-result`.

---

### 4.7 Candidate Aptitude Result — `CandidateAptitudeResult`

**Heading**: *"Aptitude: 74/100"*

**On mount**: `exitFullscreen()` + `setNavigationLocked(false)`.

**Sections**:
- Top badge: "Round 1 Complete · Passed" (emerald) or "· Did Not Qualify"
  (rose).
- Big CheckCircle / XCircle icon.
- Score headline.
- Card with: Round label + "Integrity: Clean" pill, Overall score bar
  (qualifying cutoff = 50/100), **Category breakdown** (5 rows with
  progress bars — emerald ≥60%, amber <60%), Integrity: Clean block,
  Next-action panel.

**Mock values**: `SCORE=74`, `QUALIFYING=50`, `qualified=true`.

**CTAs** (branched):
- **If qualified**: "Continue to Coding" button ⭐ — calls
  `continueToCoding()` = `requestFullscreen() + setNavigationLocked(true)
  + set("candidate-coding")`. Preceded by violet info box: "You qualified
  for the Coding round. The next round will run in strict proctoring
  mode. Get ready before you continue."
- **If not qualified**: "Exit" button → `landing`. Preceded by rose box.

Footer: "You cannot retake this round."

---

### 4.8 Candidate Coding Test — `CandidateCodingTest`  ⭐ RECENTLY UPGRADED

**Heading**: *"Round 2 Coding Test"*

3 problems · 60 minutes · one submission per problem. **Strict
proctoring.**

**Single live-test view** (with overlay modals).

**Sections**:
- Header: "Strict Proctoring" badge, title, countdown timer (turns rose
  when `timeLeft < 300s` = 5 min).
- **Main grid `[260px_1fr]`**:
  - **Sidebar (Problems list)**: List of 3 problems with status
    indicator (solved = emerald check, attempted = amber alert, unsolved
    = index number), footer stats grid (Solved / Attempted / Unsolved
    counts), "Submit Round" button.
  - **Right column**:
    - **Problem statement card**: title, difficulty badge, description,
      Examples (visible test cases only — hidden ones filtered out).
    - **Editor card**: Chrome bar (filename `solution.py` / `solution.js`
      + language `Select` Python / JavaScript), dark `bg-zinc-900` code
      area with line-number gutter + `<textarea>` (mono, emerald-100
      text, tabSize 4, disabled after submit), action bar ("Run Tests"
      + "Submit"), test results panel (per-case pass/fail with runtime,
      hidden cases flagged).
    - Problem navigation: Previous / "Problem X of N" / Next (becomes
      "Submit Round" on last).
- **Proctoring footer**: same as aptitude + "Each problem allows one
  submission. Three strikes will auto-submit your round."

**Problem bank**: 3 hardcoded problems — Two Sum (Easy), Valid Parentheses
(Medium), Binary Tree Level Order (Hard). Starter code for Python + JS.

**Randomization** ⭐ NEW — **Fisher-Yates `shuffle()`** applied to
`PROBLEMS` once on mount via `useState(() => shuffle(PROBLEMS))`. Each
candidate starts on a random problem (the order they see is randomized;
all 3 problems still appear in sidebar).

**Mock grading**: Both `runTests()` (900ms) and `submitProblem()` (1200ms)
return hardcoded results — first 2 tests pass, 3rd (hidden) test fails
with "wrong answer".

**One-submission enforcement**: editor locks after `submitProblem`.

**Triggers to navigate to result** (same as aptitude):
1. Manual submit (`handleSubmitRound`)
2. Timer expiry → `autoSubmitted`
3. 3 strikes → auto-submit

**CTAs**: → `candidate-coding-result`.

---

### 4.9 Candidate Coding Result — `CandidateCodingResult`

**Heading**: *"Coding: 81/100"*

**On mount**: `exitFullscreen()` + `setNavigationLocked(false)`.

**Sections**:
- Top badge: "Round 2 Complete · Passed" / "· Did Not Qualify".
- Big CheckCircle / XCircle.
- Score headline.
- Card with: Round 2 label + Integrity pill, Overall score bar +
  qualifying cutoff note ("solve at least 2 of 3 problems. You solved
  2."), **Per-problem breakdown** (3 rows — Two Sum solved 3/3 weight 25,
  Valid Parentheses solved 3/3 weight 30, Binary Tree Level Order failed
  1/3 weight 45), Integrity: Clean block.

**Mock values**: `SCORE=81`, `QUALIFYING_SOLVED=2`, `qualified=true`.

**CTAs** (branched):
- **If qualified**: "Continue to Interview" button — calls
  `continueToInterview()` = `requestFullscreen() + setNavigationLocked(true)
  + set("candidate-interview")`. Preceded by violet info box.
- **If not qualified**: "Exit" button → `landing`.

Footer: "You cannot retake this round."

---

### 4.10 Candidate AI Interview — `CandidateInterviewTest`

**Heading**: *"Ready for your AI Interview"*

**4-phase sub-screen state machine** via `useState<SubScreen>("confirm")`,
swapped with `AnimatePresence mode="wait"`:

#### Phase 1 — `confirm`
- Badge: "Round 3 · Final".
- Heading: "Ready for your AI Interview".
- Interview type card (Brain icon, "Technical - General").
- Two pre-verified emerald cards: "Microphone verified" + "Camera
  verified".
- Amber proctoring notice: "Strict proctoring on. Tab switches,
  fullscreen exits, and face-absence are monitored. Three strikes will
  end the interview automatically."
- **"Begin Interview"** CTA → `beginInterview()` = `requestFullscreen +
  setNavigationLocked(true) + startMonitoring + setSub("live")`.

#### Phase 2 — `live`
- **Top bar**: Live timer pill (mock `08:42`), "Q 3 of 12" progress, red
  "End Early" button.
- **Two-column grid**:
  - **Left card**: `AvatarBlock` (large animated violet circle with Video
    icon, floating "thinking" badge with TypingDots), `Waveform` (24
    animated violet bars), `AnalysisIndicators` (3 mini stats: Emotion
    Neutral, Eye Contact 78%, Posture Good), `WebcamPreview` (dark
    thumbnail with pulsing red "REC" pill).
  - **Right card**: "AI Question" label + violet card with current
    question, "Live Transcript" — scrollable list of `ChatBubble`
    components (alternating AI violet / user gray with timestamps),
    followed by "AI is thinking..." with TypingDots, proctoring footer.
- **End Early Dialog**: "End interview early? You won't be able to resume.
  Your partial transcript will still be processed into a report." → "Keep
  Going" / "End Interview" (rose).
- `<ProctoringWarning>` modal (strikes 1–2).
- Auto-submit overlay (rose AlertTriangle, "Auto-ended") when 3 strikes
  hit.

#### Phase 3 — `processing`
- Triggered by: End Early / 3 strikes / `proctor.isAutoSubmitted`.
- **On entry**: `exitFullscreen + setNavigationLocked(false)` (proctoring
  stopped).
- Auto-advances to `done` after **3 seconds** (`setTimeout`).
- UI: `ConicSpinner` (animated conic-gradient ring with center Loader2),
  "Processing your interview...", explanatory text (~60s estimate), 4
  `PROCESSING_STEPS` rows (Transcribing audio 12s / Evaluating answers
  18s / Generating report 20s / Calculating scores 8s) with
  done/active/pending states.

#### Phase 4 — `done`
- Big violet CheckCircle.
- "Interview complete." headline + "Your responses have been submitted to
  the hiring team."
- 3 stat tiles: **12 Questions Asked**, **1m 12s Avg Answer**, **Clean
  Integrity**.
- **"View Final Summary"** CTA → `set("candidate-results")`.

**CTAs**: → `candidate-results` (only exit point).

---

### 4.11 Candidate Results (read-only) — `CandidateResults`

**Heading**: *"Assessment Complete"*

Final read-only summary screen. Terminal.

**Sections**:
- Badge: "Read-only · Final".
- Big emerald CheckCircle.
- Heading "Assessment Complete" + "Your responses have been submitted to
  {company}."
- `GlowCard` with:
  - "Your Results" label + company/role + "Integrity: Clean" pill.
  - **Per-round score rows** (`RoundScoreRow`): Aptitude 74 (emerald),
    Coding 81 (violet), Interview 85 (sky) — each with icon, score,
    progress bar.
  - Separator.
  - **"Shared with company only" section**: 3 hidden rows — Overall
    Score, Your Rank, Other Candidates. Each rendered with Lock + EyeOff
    icons and a "Hidden" pill. Hints: "Shared with the company only.",
    "Visible to the hiring team only.", "Other candidates' data is
    private."
  - Sky info note explaining the privacy design.
  - Thank-you message.
  - **"Logout"** button → `landing`.
  - Ghost link: "Need help? Contact support" → alert.

**Privacy design**: candidate sees per-round scores only; weighted
overall, rank, and peer data are explicitly hidden (locked from candidate
view, visible only to hiring team).

Footer: "You will not be able to retake or revise these assessments."

**CTAs**: → `landing` only.

---

## 5. Super Admin — 8 screens

The "platform operator" mode. Manages tenants, users, AI consumption,
question bank, system config, audit logs, infrastructure health.

**Flow**: `SUPERADMIN_FLOW` steps through `superadmin-dashboard →
superadmin-companies → superadmin-users → superadmin-ai-usage →
superadmin-questions → superadmin-system → superadmin-audit →
superadmin-db-health`.

### 5.1 Super Admin Dashboard — `SuperAdminDashboard`

**Heading**: *"Mission control for InterviewAI"*

Status badge: "All systems operational" (emerald).

**Sections**:
- **Stat cards (4×2 grid, 8 total)**: Students (12,450), Companies (23),
  Campaigns (47), Interviews (8,320), Resumes Analyzed (18,200), Gemini
  Calls (45,000), DB Health (Good · PostgreSQL 12ms), Redis Health (Good
  · Upstash 3ms).
- **Platform Pulse panel** (`GlowCard`): 24h "events processed" summary
  (4,891 events, +12.4% vs yesterday) with recharts `AreaChart` gradient
  sparkline.
- **Navigation cards (7)**: A grid of clickable `GlowCard`s, each with a
  tonally-colored icon tile. Hover scales the icon and shifts the arrow.

**Navigation cards → next screen IDs**:
1. Company Management → `superadmin-companies`
2. User Management → `superadmin-users`
3. AI Usage Monitor → `superadmin-ai-usage`
4. Question Bank → `superadmin-questions`
5. System Config → `superadmin-system`
6. Audit Logs → `superadmin-audit`
7. Database Health → `superadmin-db-health`

---

### 5.2 Company Management — `CompanyManagement`

**Heading**: *"Company management"*

Suspend/reactivate tenants.

**Sections**:
- **Stat cards (3)**: Active companies, Suspended, Total candidates —
  computed live from `companies` state.
- **Companies table** (`GlowCard`): Columns = Company (avatar + name +
  plan/joined), Admin Email, Campaigns, Candidates, Status (Active
  emerald / Suspended rose badge), Actions.
- **Two side panels**:
  - *Recent tenant activity* — 4-row timestamped log.
  - *What suspension does* — bulleted policy explainer (5 items: disables
    admin login, apply links return "company suspended", in-flight
    sessions continue, data preserved, logged as `COMPANY_SUSPENDED`).

**Per-row actions**:
- **Suspend / Reactivate** button (toggles color & label by status) →
  opens a confirmation `Dialog`.
- **View** button → navigates to `admin-dashboard` (jumps into that
  tenant's admin context).

**Mock data**: 5 companies; 2 pre-suspended.

---

### 5.3 User Management — `UserManagement`

**Heading**: *"User management"*

Cross-tenant user directory with GDPR delete, suspend, password reset.

**Sections**:
- **Debounced search bar** (`GlowCard`): Full-width `Input` with `Search`
  icon, plus a live status pill that pulses "Searching…" (violet ping)
  while `query !== debounced`, then settles to "Synced" (emerald dot).
  Shows `{filtered.length} matches`. Debounce is 300 ms.
- **Users table** (`GlowCard`): Columns = Email (mono), Name, Role
  (color-coded badge: candidate amber / company_admin sky / student
  violet / super_admin emerald), Company, Created, Actions.
- **Legend tip** below the table.

**Per-row actions**:
- **View** (eye icon) → `superadmin-audit`
- **Reset PW** (key icon, sky) → opens Reset Password dialog
- **Suspend** (pause icon, amber) — only for `company_admin` role →
  opens Suspend dialog
- **Delete** (trash icon, rose) — for non-admin roles → opens Delete
  dialog

**Three confirmation dialogs**:
1. **Delete** (rose border) — "Permanently delete {name}?": warns of full
   wipe across PostgreSQL / MongoDB / Cloudinary / Redis, mentions Celery
   GDPR job (~90s), "Delete forever" button.
2. **Suspend** (amber accent) — "Suspend {name}?": blocks login, sessions
   continue.
3. **Reset Password** (sky accent) — generates temporary password, emailed
   to user, forced change on next login.

---

### 5.4 AI Usage Monitor — `AIUsageMonitor`

**Heading**: *"Gemini consumption monitor"*

Badge: "Token quota 120%" (amber — over limit!).

**Sections**:
- **Stat cards (4)**: Requests today (342/15,000 — 2.3%), Token usage
  (1.2M with ⚠ amber, 120% of 1M limit), Avg response time (2.3s, p95
  4.1s, p99 6.8s), Rate limit hits (5 today).
- **Stacked horizontal bar chart** ("Usage by module"): single stacked
  `BarChart` showing the 5-way split of today's 342 calls. Below it, a
  5-cell manual legend grid: Resume Analysis 45% (violet), Interview
  Q&A 30% (cyan), Code Review 12% (emerald), Post-Interview Report 8%
  (amber), Question Seeding 5% (rose).
- **Two side panels**:
  - *Calls per module* — vertical `BarChart` with per-cell colors.
  - *Recent rate-limit events* — 5-row feed with **Soft / Hard** severity
    badges. Footer explains: Soft = 1 retry recovered, Hard = 3+ retries,
    both respect 15 RPM contract with 4-second sleep.

**Read-only** — no buttons/dialogs.

---

### 5.5 Question Bank Management — `QuestionBankAdmin`  ⭐ RECENTLY UPGRADED

**Heading**: *"Question bank management"*

Badge: "{grandTotal} items live" (2,085 total = 1,770 aptitude + 315
coding).

**Sub-screens**:
1. Main inventory view (always visible)
2. **`BulkUploadDialog`** ⭐ NEW — 3-stage internal flow: `select →
   preview → done`
3. **Reseed dialog** with animated progress

**Sections**:
- **Stat cards (4)**: Aptitude items (1,770), Coding problems (315), Last
  full reseed ("12 days", by admin@platform.com), Bank quality (Healthy ·
  emerald dot).
- **Aptitude table** (`GlowCard`): 5 categories (Quantitative 512, Logical
  Reasoning 408, Verbal Ability 305, Analytical Reasoning 298, Data
  Interpretation 247) + Total row (1,770). Each row has a `Progress`
  coverage bar, last-reseeded text, "Healthy" status badge.
- **Coding table** (`GlowCard`): DSA Problems 210 + SQL Problems 105 =
  315 total. Same shape as aptitude.
- **`BulkUploadSection`** ⭐ NEW (between tables and danger zone):
  - Two `BulkCard`s side-by-side: Aptitude Questions (Brain icon,
    violet) and Coding Problems (Code2 icon, emerald). Each shows the
    required CSV column schema inline.
    - Buttons: **Upload CSV** (violet) + **Template** ⭐ WIRED (downloads
      real CSV).
  - **`BulkUploadDialog`** — 3-stage flow (mirrors admin side but writes
    to the *global* bank):
    - `select`: dashed-border drop zone with parsing spinner; shows
      required columns + "Download here" template link.
    - `preview`: dry-run table (5 mock rows) with "Found N valid rows · 0
      errors · 0 duplicates" + **Import N questions/problems** CTA.
    - `done`: emerald check circle, "Imported to master bank"
      confirmation, "Done" button.
  - **`downloadCsvTemplate(kind)`** ⭐ NEW helper — real client-side CSV
    generator (Blob download). Same schemas as admin side.
- **Quality metrics panel** (2/3 width): 3 stat tiles — Avg times used
  per question (12.3), Never used (234, eligible for reseed), Over-used
  >50 times (45, memorization risk).
- **Danger zone** (`GlowCard`, 1/3 width, rose-tinted): **Reseed All
  Questions** button → confirmation dialog.

**Reseed confirmation dialog** (rose border): Explains consequences —
Celery job enqueues 2,085 Gemini calls; 4-second sleep between calls (15
RPM quota); Old questions replaced atomically per category; Audit log
records `QUESTION_RESEED`. The "Reseed everything" button starts a mock
animated progress bar (increments 5% every 120ms, ~2.4s total — stands in
for the real ~30-minute Celery job).

**Footer link**: "Need to inspect per-question analytics? View the audit
log →" → `superadmin-audit`.

---

### 5.6 System Configuration — `SystemConfig`

**Heading**: *"Platform configuration"*

Badge: "Maintenance ON" (rose) or "All systems live" (emerald) — flips
with the maintenance switch.

**Sections**:
- **Core settings table** (`GlowCard`): 3 columns = Setting / Current
  value / Control. Rows:
  1. **Maintenance Mode** — Switch + ON/OFF badge. Blocks all non-super-
     admin logins.
  2. **Default Proctoring Strictness** — `Select` with 4 options:
     Lenient / Standard / Strict / **Paranoid**.
  3. **Email Provider** — `Select`: Resend / AWS SES / Postmark /
     Mailgun.
  4. **Resend API Key** — `MaskedKeyField` (prefix `rsk_`). "Stored
     encrypted at rest."
  5. **From Email** — inline editable `Input` (mono font).
  6. **Gemini API Key** — `MaskedKeyField` (prefix `AIza`). "15 RPM quota
     enforced."
- **Feature toggles panel** (`GlowCard`): Grid of 5 feature-flag cards,
  each with a `Switch`:
  - Resume Analyzer, Aptitude Test, Coding Arena, AI Interview, Hiring
    Mode (all default ON). When OFF, the feature's nav card and routes
    disappear for non-super-admins; existing data preserved.
- **Save bar**: Amber ⚠ warning + "Saved at HH:MM" confirmation + violet
  **Save changes** button.

**`MaskedKeyField` helper component**: Per-key state machine with
`editing` / `show` / `value` / `saved`. Displays masked dots by default,
an eye toggle to reveal, an "Update" button that swaps to an inline
password `Input` + Cancel + Save.

---

### 5.7 Audit Logs — `AuditLogs`

**Heading**: *"The platform audit trail"*

Immutable, filterable, exportable audit trail across all tenants.

**Sections**:
- **Stat cards (4)**: Today (count), Filtered (live count), Super-admin
  acts, Storage (∞ — "Logs never deleted", emerald).
- **Filter bar** (`GlowCard`): 4 stacked controls:
  1. User search (`Input` with `Search` icon)
  2. Role `Select`: All / student / candidate / company_admin /
     super_admin
  3. Action type `Select`: All / `CAMPAIGN_CREATED` / `BULK_SHORTLIST` /
     `COMPANY_SUSPENDED` / `QUESTION_RESEED` / `USER_DELETED` / `LOGIN`
  4. Date range: two `<input type="date">` fields with a `→` separator
- **Audit table** (`GlowCard`): Columns = Timestamp (mono), User (mono
  email), Role, Action (color-coded badge — each action has its own
  tone), Details. Footer shows "Showing X of Y entries" + **Export CSV**
  button.

**`exportCsv()`** ⭐ functional client-side implementation: Builds a CSV
string with proper header + quoted/escaped fields, creates a `Blob`,
triggers an `<a download="audit-logs-{from}-to-{to}.csv">` click, then
revokes the object URL. Disabled when `filtered.length === 0`.

**Mock data**: 7 audit rows spanning all action types and roles.

---

### 5.8 Database Health — `DatabaseHealth`

**Heading**: *"Infrastructure health"*

Badge: "{okCount}/{total} healthy" (emerald).

**Sections**:
- **Stat cards (4)**: Components (6/6 up, emerald dot), Avg latency (7.7ms
  weighted), Total rows (24,690 across 4 tables), Last check ("12
  minutes ago" → updates to "just now" after a run).
- **Per-service status cards (6)** in a responsive grid: PostgreSQL
  (Supabase, 12ms, violet), MongoDB Atlas (interview transcripts, 8ms,
  emerald), Redis (Upstash rate-limiting, 3ms, rose), Cloudinary (resume
  PDFs & proctoring screenshots, sky), Piston API (code sandbox,
  "running", amber), Celery Workers (2 active / 0 queued, emerald).
- **Table sizes table** (`GlowCard`): Columns = Table (mono), Rows, Size,
  Growth, Utilization (`Progress` bar + %). Rows: `users` (12,500 / 45MB),
  `aptitude_questions` (1,770 / 12MB), `interview_sessions` (8,320 /
  120MB), `applicant_pool` (2,100 / 8MB). Total row: 185 MB · "Well below
  PG 8GB soft cap".
- **Run health check panel** (`GlowCard`): Description + violet **Run
  Full Health Check** button (Loader2 spinner while running). Animated
  `Progress` bar increments 8% every 120ms (~1.5s).
- **Health-check log** (`GlowCard`): 4 manual entries with emerald/amber
  status dots, timestamps, actor, and result text. One entry shows "5 /
  6 healthy · Piston degraded (retried 2x)".

---

## 6. Recently-Added Features Summary

### 6.1 Anti-AI / Anti-Parakeet Detection Suite ⭐
**Where**: `campaign-new.tsx` (Campaign Creation, For Companies mode)
**What**: 8 detection toggles that catch candidates using AI assistants
(Parakeet, ChatGPT, Whisper, etc.) for live answer generation:
- Secondary voice detection (whispered AI prompts via mic)
- Gaze tracking (off-screen glances pattern-matched to AI use)
- Screen-share / second monitor detection
- Second device detection (audio fingerprint for nearby phones)
- Browser extension scan (block Parakeet and similar extensions)
- Keystroke dynamics (flag paste-from-AI typing patterns)
- Clipboard lock (disable clipboard + log every paste attempt)
- AI-response latency analysis (flag answers with LLM-typical cadence)
**Behavior**: When AI-use is detected, a high-res webcam snapshot + audio
recording is captured and queued for human review. The candidate sees no
warning until the admin confirms.

### 6.2 Interview Type Selector ⭐
**Where**: `campaign-new.tsx`
**What**: 6 selectable interview formats replacing the single "Live AI"
option:
- Full Interview (30 min, 12 Q)
- Role Specific (25 min, 10 Q)
- Technical (20 min, 8 Q)
- Behavioral (15 min, 6 Q)
- System Design (30 min, 4 Q)
- Quick Screen (10 min, 5 Q)

### 6.3 Min Coding Questions to Solve Correctly ⭐
**Where**: `campaign-new.tsx`
**What**: Renamed from "Min to attempt" to "Min to **solve correctly**"
(max=3, with helper explaining attempts alone do not qualify). Aligns
qualification with actual problem-solving, not just opening the editor.

### 6.4 Random First Question on Candidate Coding Test ⭐
**Where**: `coding-test.tsx` (Candidate mode)
**What**: Fisher-Yates `shuffle()` applied to the 3-problem list once on
mount. Each candidate session sees a different first problem (and
different sidebar order). All 3 problems still appear; only the order is
randomized.

### 6.5 Bulk CSV Upload + Template Download ⭐
**Where**: `admin/questions.tsx` (Aptitude + Coding tabs) AND
`superadmin/questions.tsx` (Bulk Upload Section for the master bank)
**What**:
- **`BulkUploadDialog`** — 3-stage flow: file picker (CSV, max 5-10MB) →
  parsing spinner → preview table (4-5 mock rows) → import confirmation →
  done state with auto-close.
- **`downloadCsvTemplate(kind)`** — real client-side CSV generator (Blob
  download). RFC-4180-compliant with proper quote escaping. Aptitude
  schema (10 columns) + Coding schema (10 columns), each with 2 example
  rows. File names: `aptitude_questions_template.csv` /
  `coding_problems_template.csv`.

### 6.6 AI-Generated Suitability Notes ⭐
**Where**: `admin/selection.tsx` (Final Selection)
**What**: Each candidate row now has:
- **AI verdict pill**: Strong Hire / Hire / Borderline / No Hire
- **AI-generated note** in a colored card with `Read full note` (expand)
  + `Regenerate` buttons (per-row spinner tracked via `aiRefreshId`)
- AI explainer banner above the table: "auto-generated by Gemini using
  the candidate's aptitude, coding, interview, and proctoring signals"
- Admins no longer need to write notes manually — only review and confirm
  the decision.

### 6.7 Send Job Offer Flow ⭐
**Where**: `admin/selection.tsx` (Final Selection)
**What**: When a candidate is marked "Selected", a "Send Job Offer"
button appears. Clicking it opens `OfferComposerDialog`:
- **compose stage**: 12 editable offer fields pre-filled with sensible
  defaults (role, team, level, work mode, office, start date, CTC
  ₹18,00,000, joining bonus, stock, report-to, validity days) + email
  section (To locked to candidate email, editable Subject + Message) +
  attachment preview (`Offer_Letter_First_Last.pdf`)
- **sending stage**: Spinner — "Generating PDF & sending email..."
- **sent stage**: Emerald check — "Offer sent! The offer email has been
  queued to {email}. The candidate will receive it within 1-2 minutes."
- After sent: row tagged with "Offer sent" badge + button becomes "Offer
  already sent" (disabled).

### 6.8 Functional CSV Export (Audit Logs) ⭐
**Where**: `superadmin/audit.tsx`
**What**: Real client-side Blob download (not a stub). Filename includes
the date range: `audit-logs-{from}-to-{to}.csv`.

---

## 7. End-to-End User Journeys

### 7.1 Prep Mode Student Journey
```
landing (Start free)
  → auth (signup: 3 steps / login)
    → dashboard
      ├─ resume (upload → analyze → results / history)
      ├─ aptitude (rules → test [fullscreen, forgiving] → results → take again)
      ├─ coding (list → editor [fullscreen, forgiving] → submit → AI review)
      ├─ interview (setup → live [fullscreen] → processing → done)
      │              ↓
      │            report (17 sections) → replay (video + transcript)
      └─ profile (4 tabs: personal / education / skills / preferences)
```

### 7.2 Company Admin Hiring Journey
```
company-landing (Start Hiring Free)
  → company-register (5-field form)
    → admin-dashboard
      ├─ campaign-new ⭐ (6 cards: details, rounds, weights, cutoffs,
      │                   interview type, proctoring+anti-AI) → success
      │                   (apply link + QR) → question-manager OR
      │                   candidate-leaderboard
      ├─ question-manager ⭐ (aptitude tab + coding tab, each with bulk
      │                       upload + template download)
      ├─ bulk-upload (3 phases: upload → processing → results)
      ├─ candidate-leaderboard (real-time ranked table + auto-shortlist)
      │   └─ proctoring-review (per-candidate event timeline + screenshots)
      └─ final-selection ⭐ (AI notes + verdicts + send-job-offer flow)
```

### 7.3 Invited Candidate Journey (strict flow-through, no retakes)
```
[public apply link] → apply (form + resume upload, no login)
  [invitation email with candidate ID + password]
    → candidate-login
      → candidate-change-password (forced, with strength meter)
        → candidate-system-check (4 checks: browser, mic, camera, fullscreen)
          → candidate-dashboard (countdown + 3 rounds list)
            → candidate-aptitude [STRICT proctor, 25 Q / 30 min, 3-strike]
              → candidate-aptitude-result
                ├─ if qualified → "Continue to Coding" → candidate-coding
                └─ if not → "Exit" → landing
                  → candidate-coding [STRICT proctor, 3 problems / 60 min,
                                      ⭐ random first question, 1 submit
                                      per problem]
                    → candidate-coding-result
                      ├─ if qualified → "Continue to Interview" →
                      │                 candidate-interview
                      └─ if not → "Exit" → landing
                        → candidate-interview (4 phases:
                                               confirm → live [STRICT proctor]
                                               → processing → done)
                          → candidate-results (read-only, per-round scores
                                              only; overall/rank/peers hidden)
                            → landing (logout)
```

### 7.4 Super Admin Platform Operations Journey
```
superadmin-dashboard (mission control, 8 stats + 7 nav cards)
  ├─ superadmin-companies (suspend/reactivate tenants, "circuit breaker")
  ├─ superadmin-users (debounced search, GDPR delete / suspend / reset PW)
  ├─ superadmin-ai-usage (Gemini consumption, 120%-over-quota alert,
  │                       rate-limit event feed)
  ├─ superadmin-questions ⭐ (inventory + bulk upload to master bank +
  │                          reseed danger zone)
  ├─ superadmin-system (maintenance mode, Paranoid strictness, masked API
  │                     keys, 5 feature flags)
  ├─ superadmin-audit (immutable filterable log + functional CSV export)
  └─ superadmin-db-health (6 services + table sizes + animated health check)
```

---

*Generated for InterviewAI · 38 screens · 4 user modes · Single-page
Next.js 16 app · Zustand store-based router.*
