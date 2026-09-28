# Task DESIGN-ADMIN · design-admin

**Date:** 2025
**Scope:** Apply professional design edits to 8 Company Admin screen files to match the redesigned landing page (prep/landing.tsx) quality bar, following the 30-things-to-avoid list and Taste Skill v2 rules.

## Files edited (8)

| # | File | Named export |
|---|---|---|
| 1 | `src/components/screens/admin/register.tsx` | `CompanyRegister` |
| 2 | `src/components/screens/admin/dashboard.tsx` | `AdminDashboard` |
| 3 | `src/components/screens/admin/campaign-new.tsx` | `CampaignCreate` |
| 4 | `src/components/screens/admin/questions.tsx` | `QuestionManager` |
| 5 | `src/components/screens/admin/candidates.tsx` | `CandidateLeaderboard` |
| 6 | `src/components/screens/admin/bulk-upload.tsx` | `BulkUpload` |
| 7 | `src/components/screens/admin/proctoring.tsx` | `ProctoringReview` |
| 8 | `src/components/screens/admin/selection.tsx` | `FinalSelection` |

## What was changed

### A. AuroraBackground removed
Replaced `<AuroraBackground>` wrapper with `<div className="min-h-screen bg-background text-foreground">`. Removed import from all 8 files.

### B. Emojis removed from copy
Verified zero matches for `[✅🔄🔒📋🚀⚠️❌✨🎯🔥💡📥📤📊👥🟢🔴]`. Replaced:
- `✓ correct` text in questions.tsx → `<Check>` icon
- `✗` red X in candidates.tsx → `<X>` icon (lucide-react `X as XIcon`)
- `🚫 Auto-DQ` in selection.tsx → `<ShieldAlert>` icon
- `⚠️ 2 flags` in selection.tsx → `<ShieldAlert>` icon

### C. Em dashes removed
All `—` characters converted:
- Copy: `"in a week — not a quarter"` → `"in a week. Not a quarter"`, `"auto-submitted — 3+"` → `"Auto-submitted. 3+"`, `"Disqualified — phone"` → `"Disqualified. Phone"`, `"versioned — every change"` → `"versioned. Every change"`, `"automatically — you confirm"` → `"automatically. You confirm"`, etc.
- Strictness select options: `"Relaxed — warnings only"` → `"Relaxed. Warnings only"`, etc.
- Table-cell null placeholders (`<span>—</span>`) → `<span>-</span>`
- JSX comments (`{/* LEFT — form */}`) → `{/* LEFT. form */}` (also cleaned for full rg compliance)

### D. Sparkles icon removed
Removed from imports and JSX in: register.tsx (pitch card), dashboard.tsx (Active Campaigns stat), campaign-new.tsx (Create Campaign button).

### E. Harsh button gradients removed
`bg-gradient-to-r from-violet-500 to-fuchsia-500` → `bg-violet-500 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600` everywhere. Also applied to:
- Slider range fills (`[&_[data-slot=slider-range]]:bg-violet-500`)
- Progress bar fills (`[&>div]:bg-violet-500`)
- Avatar/icon chip backgrounds (`bg-violet-500/10 text-violet-700 dark:text-violet-300`)
- Tab active state (`data-[state=active]:bg-violet-500`)
- Success checkmark badge (`bg-emerald-500`, no gradient)

### F. Glow shadows removed
`shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]` and similar → `shadow-sm` (or removed entirely).

### G. BorderBeam removed
Not present in any of the 8 edited files (only in `admin/landing.tsx`, which was off-limits).

### H. MagneticButton removed
Replaced with plain `<Button>` and removed import. All props (`onClick`, `disabled`, `className`, `type`, `variant`) preserved.

### I. PulseBadge removed
Replaced with native `<span>` elements using the same color tokens (`border-X-400/30 bg-X-500/10 text-X-700 dark:text-X-300`). For muted "Admin Dashboard"/"Step 1. Configure" labels, used simpler `border-black/15 dark:border-white/15` muted pills to keep eyebrow count low (Taste Skill v2: max 1 per 3 sections).

### J. Shape consistency fixed
- All card containers: `rounded-lg` (was `rounded-xl` via GlowCard)
- All action buttons: `rounded-full` (some were `rounded-lg`)
- Pills/badges: `rounded-full` (kept)
- Dropzone: `rounded-lg` (was `rounded-2xl`)
- Avatar circles: `rounded-full` (kept)

### K. "it's not X, it's Y" copy removed
Verified zero matches. No instances existed in the original 8 files anyway.

### L. Filler verbs removed
Verified zero matches for `Elevate|Unleash|Seamless|Next-Gen|Revolutionize`.

### M. Functionality preserved
All features kept intact:
- Tabs (questions.tsx, candidates.tsx)
- Tables with sortable rows (dashboard, questions, candidates, proctoring, selection)
- Forms with validation (register, campaign-new, questions)
- Modals/dialogs (proctoring screenshot dialog)
- QR placeholder generator (campaign-new)
- Dropzone with drag handlers (bulk-upload)
- Processing animation with auto-advance (bulk-upload)
- Decision dropdowns (selection)
- Live activity ticker (dashboard)
- Integrity score breakdown with animated bars (proctoring)
- All state hooks, useState, useEffect, useMemo preserved

### N. Named exports preserved
Verified via `rg "^export function"` — all 8 exports still present with original names.

### O. useNav navigation preserved
Verified via `rg -c "useNav"` — all 8 files import `useNav` from `@/lib/store` and call `set(...)` for navigation.

## Additional refinements

- **Realistic company name:** `Acme Labs Pvt Ltd` → `Northwind Labs Pvt Ltd` (avoids the "Acme Corp" generic-name anti-pattern). Email placeholder `priya@acme.com` → `priya@northwind.com`.
- **Light-mode contrast:** All `text-X-200/300/400` accent classes paired with `dark:` variants using `text-X-700/600` for readability on white backgrounds (works alongside the existing globals.css `:root:not(.dark)` overrides).
- **Border tokens:** `border-white/10` → `border-black/10 dark:border-white/10` on cards/containers for native light-mode visibility.
- **Background tokens:** `bg-white/[0.03]` → `bg-muted/30` (or `bg-muted/40`) on cards/inputs for solid surface in light mode.
- **Hover tokens:** `hover:text-white` → `hover:text-foreground` on text-only ghost buttons.
- **Unused imports:** Removed `motion` from `candidates.tsx`, `questions.tsx`, `proctoring.tsx`, `selection.tsx` since those files no longer use framer-motion after edits (would trip ESLint's `no-unused-vars`).
- **Faux webcam frame:** Converted from gradient fills to solid slate shades; the bobbing motion on the phone overlay was removed for restraint.

## Verification (all passing)

| Check | Result |
|---|---|
| `bun run lint` | exit code 0, 0 errors, 0 warnings ✅ |
| `rg "[✅🔄🔒📋🚀⚠️❌✨🎯🔥💡📥📤📊👥🟢🔴]" {8 files}` | no matches ✅ |
| `rg "—" {8 files}` | no matches ✅ |
| `rg "AuroraBackground\|Sparkles\|MagneticButton\|BorderBeam" {8 files}` | no matches ✅ |
| `rg "bg-gradient-to-(r\|br\|b)" {8 files}` | no matches ✅ |
| `rg "shadow-\[" {8 files}` | no matches ✅ |
| `rg "text-glow\|gradient-text" {8 files}` | no matches ✅ |
| `rg "hover:text-white" {8 files}` | no matches ✅ |
| `rg "Elevate\|Unleash\|Seamless\|Next-Gen\|Revolutionize" {8 files}` | no matches ✅ |
| `curl localhost:3000` | HTTP 200 ✅ |
| Named exports (`rg "^export function"`) | all 8 preserved ✅ |
| useNav wiring (`rg -c "useNav"`) | all 8 files wired ✅ |

## Out of scope (NOT touched)

- `src/components/screens/admin/landing.tsx` — explicitly listed as already redesigned; left intact despite it still containing AuroraBackground/Sparkles/MagneticButton/BorderBeam/GlowCard/PulseBadge (the task owner is aware — that file is the "do not touch" carve-out).
- All non-admin screen files (`prep/`, `candidate/`, `superadmin/`).
- `primitives.tsx`, `globals.css`, `package.json`, `tsconfig.json`, any config.

## Reference files consulted

- `/home/z/my-project/src/components/screens/prep/landing.tsx` — design reference (matched style: violet-500 accent, rounded-lg cards, rounded-full buttons, no gradients, no glass, no aurora, no Sparkles, no em dashes)
- `/home/z/my-project/src/components/screens/admin/landing.tsx` — read for context (NOT modified, per task constraints)
- `/home/z/my-project/src/components/shared/primitives.tsx` — to understand the primitives being removed (AuroraBackground, GlowCard, MagneticButton, PulseBadge, BorderBeam definitions)
- `/home/z/my-project/src/app/globals.css` lines 615-760 — light-mode contrast overrides (informed the choice of `text-X-700 dark:text-X-300` pairings and `bg-muted/30` for solid light-mode surfaces)
