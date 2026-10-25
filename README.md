<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,21,27,31&height=220&section=header&text=InterviewAI&fontSize=65&fontAlignY=38&desc=Next-Gen%20AI-Powered%20Interview%20%26%20Assessment%20Platform&descFontSize=20&descAlignY=62&fontColor=ffffff&descAlign=50" alt="InterviewAI Header" width="100%" />

  <p align="center">
    <strong>Master Every Interview with Generative AI • Enterprise Talent Assessment • Anti-Cheat Proctoring</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://neon.tech"><img src="https://img.shields.io/badge/Neon%20Serverless%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black" alt="Neon Postgres" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Google%20Gemini%202.5-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
    <a href="https://framer.com/motion"><img src="https://img.shields.io/badge/Framer%20Motion%2012-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Configuration</a> •
    <a href="#-license">License</a>
  </p>

  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&duration=2800&pause=1000&color=6366F1&center=true&vCenter=true&width=750&lines=AI+Resume+Auditor+%E2%80%A2+Instant+ATS+Scoring;1%2C500%2B+Aptitude+Practice+Problems;Interactive+VS+Code+Coding+Arena+%2B+AI+Code+Review;Voice-Enabled+Conversational+AI+Interviewer;Enterprise+Recruiter+Portal+%2B+Live+Proctoring" alt="Typing SVG" />

</div>

---

## 🌟 Executive Overview

**InterviewAI** (I With AI) is a dual-platform full-stack recruitment ecosystem built on Next.js 16, TypeScript, Tailwind 4, Neon PostgreSQL, and Google Gemini AI. It provides:

1. **Student / Job-Seeker Prep Hub**: An all-in-one AI interview coach with instant resume optimization, aptitude tests, sandboxed coding challenges, live conversational avatar interviews, and actionable 17-section PDF diagnostics.
2. **Enterprise Recruiter Suite**: A hiring and evaluation suite with campaign workflows, customizable question pools, multi-modal anti-cheat proctoring, live score projection, and ranked hiring leaderboards.
3. **Superadmin Governance**: Centralized platform telemetry, database diagnostics, multi-tenant company authorization, and audit trail management.

---

## 🚀 Key Features

### 🎓 1. Prep Mode (For Candidates & Students)

| Feature | Description | Highlight |
| :--- | :--- | :--- |
| **📄 AI Resume Analyzer** | Upload PDF/DOCX resumes for instant ATS compatibility scoring, quantified bullet analysis, and STAR-method suggestions. | Google Gemini 2.0 Flash + Mammoth/PDF-Parse |
| **🧠 Adaptive Aptitude Arena** | 1,500+ curated quantitative, logical, verbal, and CS questions with categorized timer tests and instant step-by-step solutions. | Seed dataset + Randomizer engine |
| **💻 Interactive Coding Arena** | Full Monaco (VS Code) in-browser code editor with multi-language execution (Python, JS, Java, C++), automated test assertion, and AI line-by-line feedback. | Isolated code execution + AI code reviewer |
| **🎙️ AI Interview Studio** | Live conversational AI interviewer with animated speaking avatar, interactive speech waveforms, real-time speech recognition, and adaptive questions. | Web Audio API + Speech Recognition |
| **📊 Comprehensive Report** | 17-section in-depth performance breakdown with spider skill charts, filler-word counters, body-language analysis, and downloadable PDF reports. | Recharts + Automated Scoring Model |

---

### 🏢 2. Recruiter Portal (For Companies & Institutions)

- 🎯 **Campaign Workflow**: Create hiring drives, specify rounds (Aptitude → Coding → Technical AI Interview), and set automatic passing cutoffs.
- 👁️ **Multi-Modal Proctoring**: Detects tab switches, fullscreen escapes, secondary displays, copy-paste attempts, and devtools access in real-time.
- 📋 **Candidate Pipeline**: Bulk candidate CSV upload, automated email invitation tokens, credential management, and status tracking.
- 🏆 **Live Leaderboards**: Aggregated candidate scores across all rounds with instant shortlist and rejection dispatching.

---

### ⚡ 3. Superadmin Governance

- 📊 **System Health Dashboard**: Real-time compute latency, database connection pooling stats, and AI token consumption metrics.
- 🏢 **Multi-Tenant Management**: Approve, verify, suspend, or configure hiring organizations and enterprise accounts.
- 📜 **Security & Audit Logs**: Immutable audit trails tracking every administrative action, assessment attempt, and proctoring violation.

---

## 🏗️ System Architecture

The project adopts a **Production Clean Layered Architecture** with root-level separation of concerns (eliminating nested `src/` wrappers):

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                             CLIENT / BROWSER                              │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         HTTP & API CONTROLLERS                            │
│                             (app/api/v1/...)                              │
│           • Input validation via Zod schemas                              │
│           • Session, JWT, & RBAC role enforcement                         │
│           • Dispatches to domain services                                 │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
                    ▼                                   ▼
┌──────────────────────────────────────┐ ┌──────────────────────────────────┐
│        BACKEND LAYER (backend/)      │ │      SHARED LAYER (shared/)      │
│   ├── db/ (Neon Prisma Client)       │ │   ├── types/ (DTOs & interfaces) │
│   ├── services/ (Business logic)     │ │   ├── utils/ (cn formatting)     │
│   ├── runners/ (Sandboxed execution) │ │   └── validators/ (Zod schemas)  │
│   └── data/ (Datasets & seeds)       │ └──────────────────────────────────┘
└──────────────────────────────────────┘                  ▲
                    ▲                                     │
                    │                                     │
┌───────────────────┴─────────────────────────────────────┴─────────────────┐
│                        FRONTEND LAYER (frontend/)                         │
│   ├── screens/ (Role-specific views: prep, admin, candidate, superadmin)  │
│   ├── components/ (Design tokens, shadcn/ui primitives, AuroraBackground) │
│   ├── stores/ (Zustand client state: navigation, auth context)            │
│   ├── hooks/ (useFullscreen, useToast, useMobile)                         │
│   ├── services/ (Client-side proctoring listeners, audio streams)         │
│   └── config/ (Role flow definitions, screen registries)                  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```text
├── app/                       # Next.js App Router (HTTP controllers, layout, global styles)
│   ├── api/v1/                # REST endpoints (auth, candidate, admin, code-runner)
│   ├── layout.tsx             # Root HTML layout with providers & theme scripts
│   ├── globals.css            # Global Tailwind CSS definitions
│   └── page.tsx               # SPA entry point mounting frontend screens
│
├── frontend/                  # Presentation & Client-Side Logic
│   ├── screens/               # Role-based feature views
│   │   ├── prep/              # Candidate preparation screens (Resume, Aptitude, Coding, Interview)
│   │   ├── admin/             # Recruiter portal (Campaigns, Questions, Proctoring, Leaderboard)
│   │   ├── candidate/         # Assessment portal (Apply, Syscheck, Live Test)
│   │   ├── superadmin/        # Governance (System health, Companies, Audit)
│   │   └── legal/             # Privacy, Terms, Cookie Notice
│   ├── components/            # UI components (shared primitives + shadcn atomic widgets)
│   ├── stores/                # Zustand client state (nav-store.ts)
│   ├── hooks/                 # Custom React hooks (use-fullscreen.ts, etc.)
│   ├── services/              # Client browser proctoring listeners
│   ├── config/                # Flow rules and screen registry (flows.ts)
│   └── utils/                 # Client utilities (utm.ts)
│
├── backend/                   # Server Domain & Execution Layer
│   ├── db/                    # Neon PostgreSQL adapter & Prisma client (client.ts)
│   ├── services/              # Pure domain services (resume-analysis, aptitude, auth, email, storage)
│   ├── runners/               # Sandboxed code execution, AI code reviewer, test evaluator
│   └── data/                  # Problem catalogs & dataset JSONs
│
├── shared/                    # Cross-cutting contracts
│   ├── utils/                 # Common helpers (cn.ts)
│   └── types/                 # Shared TypeScript interfaces & DTOs
│
├── prisma/                    # Relational schema (schema.prisma) & migrations
├── public/                    # Web static assets (logos, icons, vector backgrounds)
├── scripts/                   # Dataset compilation & database seed scripts
├── docs/                      # Formal architecture & production contracts
├── seed.json                  # Aptitude & coding test dataset (1,500+ problems)
├── package.json               # Manifest & scripts
├── tsconfig.json              # Path aliases configuration (@/frontend, @/backend, @/shared)
├── tailwind.config.ts         # Tailwind 4 styling configuration
└── components.json            # shadcn UI design system registry
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | `Next.js 16` • `React 19` • `TypeScript 5` |
| **Styling & Animation** | `Tailwind CSS 4` • `Framer Motion 12` • `Lucide Icons` |
| **UI Component Primitives** | `Radix UI` • `shadcn/ui` • `Sonner` (Toasts) • `Recharts` |
| **State Management** | `Zustand 5` (Client-side reactive store) • `TanStack Query 5` |
| **Database & ORM** | `Neon Serverless PostgreSQL` • `Prisma ORM 6` • `@prisma/adapter-neon` |
| **AI & LLM Services** | `Google Gemini 2.5 Pro` • `Google Gemini 2.0 Flash` |
| **Code Editor & Sandboxing**| `Monaco Editor (@monaco-editor/react)` • `Piston API Engine` |
| **File Processing & Storage**| `Cloudinary` • `PDF-Parse` • `Mammoth` (DOCX extraction) |
| **Communications** | `Resend` • `Nodemailer / Brevo SMTP` |

</div>

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (v22/v24 recommended)
- **Package Manager**: `npm` or `bun`
- **PostgreSQL Database**: Free [Neon](https://neon.tech) serverless account or local PostgreSQL.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/interview-ai.git
cd interview-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the sanitized template to create your `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your local or production credentials:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `AUTH_SECRET`: A secure 32+ character random secret string.
- `GEMINI_API_KEY`: Your Google AI Studio API key.

### 4. Initialize Database Schema & Seed Data

```bash
# Push the Prisma schema to your database
npx prisma db push

# Generate the Prisma client
npx prisma generate

# (Optional) Seed aptitude & coding problem catalog
node scripts/seed-aptitude.js
node scripts/seed-coding.js
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application!

---

## 🔒 Security & Privacy

- **Safe Credential Management**: `.env` is strictly gitignored and excluded from version control.
- **Role-Based Access Control (RBAC)**: Strong authorization gates for Candidate, Company Admin, and Platform Superadmin roles.
- **Isolated Code Runner**: Candidate code is executed within isolated execution sandboxes to prevent privilege escalation.
- **Proctoring Integrity**: Real-time client listeners respect GDPR and user consent banners before camera and microphone activation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with ❤️ for students, developers, and modern hiring teams worldwide.</sub>
</div>
