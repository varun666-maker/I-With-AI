# Task ID: DESIGN-PREP · Agent: design-prep

## Summary
Redesigned 9 Prep Mode screen files to match the redesigned landing page quality level. Applied the 30-things-to-avoid list, Taste Skill v2 rules, Impeccable anti-patterns, and Motion Skill principles.

## Files Edited
1. `src/components/screens/prep/auth.tsx` — AuthScreen
2. `src/components/screens/prep/dashboard.tsx` — StudentDashboard
3. `src/components/screens/prep/resume.tsx` — ResumeHub
4. `src/components/screens/prep/aptitude.tsx` — AptitudePortal
5. `src/components/screens/prep/coding.tsx` — CodingArena
6. `src/components/screens/prep/interview.tsx` — InterviewStudio
7. `src/components/screens/prep/report.tsx` — InterviewReport
8. `src/components/screens/prep/replay.tsx` — InterviewReplay
9. `src/components/screens/prep/profile.tsx` — StudentProfile

## Key Changes
- **AuroraBackground** → replaced with `<div className="min-h-screen bg-background text-foreground">`
- **GlowCard** → replaced with `<div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">`
- **MagneticButton** → replaced with regular `<Button>`
- **PulseBadge** → replaced with `<Badge>` or `<span>`
- **Sparkles icon** → removed from all imports and JSX; replaced with Video/Code2/FileText/Info/Award/Briefcase
- **Emojis** (👋🎉😐🙂😊🤔) → removed from all copy; replaced with icons or colored dots
- **Em dashes (—)** → replaced with periods or hyphens throughout
- **Gradient buttons** (`bg-gradient-to-r from-violet-500 to-fuchsia-500`) → solid `bg-violet-500 hover:bg-violet-600`
- **Gradient text** → solid `text-violet-500 dark:text-violet-400`
- **Glow shadows** (`shadow-[0_0_24px...]`, `shadow-2xl`) → `shadow-sm` or removed
- **Terminal window chrome** (traffic light dots in coding.tsx) → removed
- **Pure black** (`#0a0a0f`) → `bg-zinc-900`
- **Rainbow ConicSpinner** → single-violet gradient
- **Animated arrows** (group-hover translate) → static ArrowRight
- **Bounce easing** → spring `stiffness: 120, damping: 20`
- **Checkmark characters** (✓) → CheckCircle2 icons
- **rounded-xl/2xl** → `rounded-lg` for cards
- **Terms + Privacy links** → added as `<a href="#">` in auth.tsx footer

## Preserved
- All 9 named exports (AuthScreen, StudentDashboard, ResumeHub, AptitudePortal, CodingArena, InterviewStudio, InterviewReport, InterviewReplay, StudentProfile)
- All `set("...")` navigation calls
- All tabs, sub-screens, forms, tables, charts, modals, dialogs, accordions
- All data constants and component logic

## Verification
- `bun run lint` → 0 errors
- No AuroraBackground/Sparkles/MagneticButton/BorderBeam/PulseBadge/GlowCard in any of the 9 files
- No em dashes in any of the 9 files
- No emojis in any of the 9 files
- No gradient buttons in any of the 9 files
- Dev server compiles successfully (GET / 200)
