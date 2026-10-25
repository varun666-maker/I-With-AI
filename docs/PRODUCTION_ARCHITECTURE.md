# Production Layered Architecture Specification

## 1. Architectural Philosophy

This project adopts a **Clean Layered Monolith Architecture** with **root-level layers** (eliminating the redundant `src/` wrapper) optimized for high maintainability, enterprise separation of concerns, and clean boundaries between the client and server layers.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / BROWSER                              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       HTTP / API CONTROLLERS                            │
│                       (app/api/v1/...)                                  │
│         • Thin request validation (Zod)                                 │
│         • Session & Role auth enforcement                               │
│         • Dispatches to backend domain services                         │
└──────────────────┬───────────────────────────────────┬──────────────────┘
                   │                                   │
                   ▼                                   ▼
┌─────────────────────────────────────┐ ┌─────────────────────────────────┐
│       BACKEND LAYER (backend/)      │ │   SHARED LAYER (shared/)        │
│  ├── db/ (Prisma Client & repos)    │ │  ├── types/ (DTOs & interfaces) │
│  ├── services/ (Business logic)     │ │  ├── utils/ (cn, formatting)    │
│  ├── runners/ (Sandboxed execution) │ │  └── validators/ (Zod schemas)  │
│  └── data/ (Datasets & seeds)       │ └─────────────────────────────────┘
└─────────────────────────────────────┘                 ▲
                   ▲                                    │
                   │                                    │
┌──────────────────┴────────────────────────────────────┴─────────────────┐
│                      FRONTEND LAYER (frontend/)                         │
│  ├── screens/ (Role-specific views: prep, admin, candidate, superadmin) │
│  ├── components/ (shared UI primitives, design system, shadcn/ui)       │
│  ├── stores/ (Zustand client state: navigation, auth context)           │
│  ├── hooks/ (useFullscreen, audio/video capture hooks)                  │
│  ├── services/ (Client proctoring event listeners, WebRTC streams)      │
│  └── config/ (Role flow definitions, screen registry)                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Layer Responsibilities

### `frontend/` (Presentation & Client State)
Contains strictly client-side UI code, state management, and design system components:
- **`screens/`**: Role-isolated views:
  - `prep/`: Candidate preparation screens (Resume Hub, Aptitude, Coding Arena, AI Interview Studio, Report, Replay).
  - `admin/`: Company recruiter portal (Dashboard, Campaigns, Questions Pool, Proctoring, Leaderboard).
  - `candidate/`: Assessment exam portal (Apply, Candidate Login, System Check, Active Test).
  - `superadmin/`: Platform governance (System Health, Multi-tenant Companies, Database Health, Audit Logs).
- **`components/`**:
  - `shared/`: High-level UI primitives (`TopNav`, `FlowNav`, `AuroraBackground`, `ThemeSwitcher`, `BorderBeam`).
  - `ui/`: Design tokens and Radix/shadcn atomic components (`button`, `dialog`, `badge`, `tabs`).
- **`stores/`**: Client-side reactive stores (`nav-store.ts` for Zustand screen routing).
- **`hooks/`**: Custom React hooks (`use-fullscreen.ts`, `use-toast.ts`, `use-mobile.ts`).
- **`services/`**: Client browser monitoring services (`proctoring.ts` tracking tab-switches and fullscreen escapes).
- **`config/`**: Flow configs and step navigation rules (`flows.ts`).

### `backend/` (Domain Logic & Infrastructure)
Encapsulates all server-side operations, database access, sandboxed code runners, and business logic:
- **`db/`**: Connection management, Neon HTTP adapter, and Prisma client instantiation (`client.ts`).
- **`services/`**: Pure domain services:
  - `resume-analysis.ts`: AI resume parsing, ATS scoring, and bullet point rewriting.
  - `aptitude.ts`: Question pool queries, difficulty balancing, and scoring.
  - `storage.ts`: Secure cloud asset upload and signed URLs.
  - `email.ts` & `notifications.ts`: Transactional email and notification dispatcher.
  - `password.ts` & `auth.ts`: Password hashing, token generation, and RBAC validation.
- **`runners/`**: Multi-language code execution engines:
  - `server-code-runner.ts`: Isolated Node/Python/Java execution runner.
  - `ai-code-reviewer.ts`: Code complexity, style, and bug analysis.
  - `code-evaluator.ts`: Testcase runner and assertion engine.
- **`data/`**: Problem catalogs and datasets (`coding-problems.ts`, `coding-dataset.json`).

### `shared/` (Cross-Cutting Contracts)
Common code imported by both frontend and backend without creating circular dependencies:
- **`types/`**: Shared interfaces, user role definitions, assessment states.
- **`utils/`**: Shared formatting functions and `cn()` utility (`utils/cn.ts`).
- **`validators/`**: Shared validation schemas (Zod).

### `app/` (Next.js Application Gateway)
- **`app/api/v1/`**: Thin API controllers that handle incoming HTTP requests, validate input via `shared/`, and invoke `backend/services/`.
- **`app/page.tsx`**: Main SPA entry point mounting `frontend/`.
- **`app/layout.tsx`**: HTML document shell, fonts, theme scripts.

---

## 3. Path Aliases (`tsconfig.json`)

To keep imports clean and decoupled:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/frontend/*": ["./frontend/*"],
      "@/backend/*": ["./backend/*"],
      "@/shared/*": ["./shared/*"]
    }
  }
}
```
