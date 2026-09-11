# Task ID: 6 · Agent candidate-screens

## Scope
Build the 6 Invited-Candidate screens (B0, B2, B3, B4, B5, B9) of the AI Interview Assistant SaaS frontend.

## Files created
All under `/home/z/my-project/src/components/screens/candidate/`:

| File | Export | Screen |
|------|--------|--------|
| `apply.tsx` | `ApplyPage` | B0 — public apply form (no login) |
| `login.tsx` | `CandidateLogin` | B2 — candidate ID + password |
| `change-password.tsx` | `ForcePasswordChange` | B3 — first-login password set |
| `system-check.tsx` | `PreTestCheck` | B4 — browser/mic/camera/fullscreen |
| `dashboard.tsx` | `CandidateDashboard` | B5 — campaign dashboard |
| `results.tsx` | `CandidateResults` | B9 — read-only results |

## Routing (via Zustand `useNav`)
```
apply            → (form submit) → in-place success card
candidate-login  → (1.1s auth)   → candidate-change-password
candidate-change-password → (submit) → candidate-system-check
candidate-system-check    → (continue) → candidate-dashboard
candidate-dashboard: Continue Coding → aptitude (prep, shared component)
candidate-results: Logout → landing
```

## Design language
- AuroraBackground page wrapper
- GlowCard with `border-white/10 bg-white/[0.03]`
- Primary CTAs: `bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0`
- PulseBadge for status pills
- MagneticButton for primary actions
- framer-motion entrances (`initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}`)
- `gradient-text` class for accent words
- Palette: violet / fuchsia / emerald / amber / rose / sky / slate (no indigo/blue)

## Mock data (hardcoded in screen files)
- Company: Acme Corp
- Role: Backend Developer
- Round 1 Aptitude: 74/100 ✅ Passed
- Round 2 Coding: in-progress
- Round 3 AI Interview: locked
- Results: Aptitude 74, Coding 81, Interview 85
- Dashboard deadline: now + 2d 8h 23m (amber zone, 24–72h)

## Lint
`bun run lint` → 0 errors, 0 warnings on the 6 new files. The only lint warning in the repo is a pre-existing one in `prep/dashboard.tsx` (outside this task's scope).

## Out of scope (per task brief)
- B1 (email template) — not a screen
- B6/B7/B8 (candidate aptitude/coding/interview strict versions) — reuse prep components, future task
