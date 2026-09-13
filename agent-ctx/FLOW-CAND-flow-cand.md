# Task ID: FLOW-CAND · Agent flow-cand

## Scope
Add the `FlowNav` sequential navigation component to the 6 Invited-Candidate screen files. Surgical edit only — import + render once near the bottom of each screen.

## Reference files read
- `/home/z/my-project/src/components/shared/flow-nav.tsx` — self-contained card with stepper + Continue button. Accepts `flowId: FlowKind` ("prep" | "admin" | "candidate" | "superadmin"). Built-in `mt-12` spacing.
- `/home/z/my-project/src/lib/flows.ts` — defines `CANDIDATE_FLOW` (6 steps): apply → candidate-login → candidate-change-password → candidate-system-check → candidate-dashboard → candidate-results.

## Files edited (6)
All under `/home/z/my-project/src/components/screens/candidate/`:

| File | Export | FlowNav placement |
|------|--------|-------------------|
| `apply.tsx`     | `ApplyPage`             | After trailing `motion.p` ("Powered by InterviewAI…"), as last child of `<section>` (outside the `AnimatePresence` success card so it always renders) |
| `login.tsx`     | `CandidateLogin`        | After trailing `motion.p` ("On first login…"), as last child of `<section>` |
| `change-password.tsx` | `ForcePasswordChange` | After `</StaggeredReveal>`, as last child of `<section>` |
| `system-check.tsx` | `PreTestCheck`       | After trailing `motion.p` ("Your camera feed…"), as last child of `<section>` |
| `dashboard.tsx` | `CandidateDashboard`   | After trailing `motion.p` ("Once a round is submitted…"), as last child of `<section>` |
| `results.tsx`   | `CandidateResults`      | After trailing `motion.p` ("You will not be able to retake…"), as last child of `<section>` |

## Import added (top of each file, after other imports)
```tsx
import { FlowNav } from "@/components/shared/flow-nav";
```

## Render added (once per file, last child of page `<section>`)
```tsx
<FlowNav flowId="candidate" />
```

## Placement rules followed
- ✅ Self-contained card (built-in `mt-12`)
- ✅ Placed OUTSIDE any conditional render blocks (after `</StaggeredReveal>` or after the trailing static `motion.p`, never inside `AnimatePresence` / `!submitted` / `error` branches)
- ✅ Placed INSIDE the page wrapper (`<AuroraBackground>` → `<section>`) so it gets the dark aurora background
- ✅ LAST child of the page wrapper, after any conditional success/error messages
- ✅ For `apply.tsx` specifically: placed AFTER the success card so it always renders (the success card is inside `<GlowCard>`'s `<AnimatePresence>`, and FlowNav sits below `</StaggeredReveal>` / trailing `motion.p`, completely outside that conditional)

## Constraints respected
- ❌ Did NOT modify any other code in the files
- ❌ Did NOT add FlowNav multiple times in any file
- ❌ Did NOT place FlowNav inside any conditional render block
- ❌ Did NOT reorder existing sections
- ❌ Did NOT change screen exports or function signatures

## Verification
- `bun run lint` → 0 errors, 0 warnings.

## Notes for downstream agents
- The candidate flow uses `flowId="candidate"` (lowercase), matching the `FlowKind` union in `flow-nav.tsx`.
- The `HOME_BASE` for the candidate kind is `candidate-dashboard`, so the "Skip to Campaign" button on apply/login/change-password screens jumps to the dashboard.
- `currentScreenId` prop is omitted — `FlowNav` reads `useNav(s => s.current)` from the Zustand store, so it auto-detects the active screen.
