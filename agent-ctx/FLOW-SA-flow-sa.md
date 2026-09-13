# Task ID: FLOW-SA · Agent: flow-sa

## Task
Add the `FlowNav` sequential navigation component to 8 Super Admin screen
files. This is a small surgical edit: import `FlowNav` from
`@/components/shared/flow-nav` and render `<FlowNav flowId="superadmin" />`
once near the bottom of each screen, inside the page wrapper
(`PageWrap`) so it inherits the Aurora dark background, but outside any
tab content, dialog, or conditional render block.

The Super Admin flow sequence (already defined in `src/lib/flows.ts`) is:
Super Admin Dashboard → Companies → Users → AI Usage → Questions → System
→ Audit → DB Health.

## Work Log
- Read `src/components/shared/flow-nav.tsx` to understand the component API:
  - Props: `flowId?: "prep" | "admin" | "candidate" | "superadmin"`,
    `currentScreenId?: ScreenId`, `className?: string`.
  - It is a self-contained `GlowCard` with a built-in `mt-12` wrapper, a
    horizontal stepper, and a Continue/Back/Skip CTA cluster. So placing it
    as a direct child of `PageWrap` is sufficient — no extra spacing needed.
  - It pulls the current screen id from `useNav`, looks up the matching
    flow via `getFlowForScreen`, and returns `null` if no flow matches —
    so passing `flowId="superadmin"` is the only required prop.
- Read `src/lib/flows.ts` to confirm the SUPERADMIN_FLOW sequence (8 steps)
  maps exactly to the 8 screen files I was asked to edit, in this order:
  Dashboard → Companies → Users → AI Usage → Questions → System → Audit →
  DB Health.
- Read all 8 target screen files end-to-end to identify the exact
  closing `</PageWrap>` location in each, the position of any trailing
  dialogs (which live *after* `</PageWrap>` but still inside
  `<AuroraBackground>` so they can render as Radix overlays), and the
  last import line. None of these files used any in-page Tabs component
  (they all use motion.div blocks or static markup), which made the
  placement deterministic — I added `FlowNav` as the last child of
  `PageWrap`, immediately before `</PageWrap>`.
- Edited each file with two surgical edits:
  1. Added `import { FlowNav } from "@/components/shared/flow-nav";` as the
     last import line (right after the previous last import — `useNav`,
     `cn`, or the shadcn Table import, depending on the file).
  2. Added `<FlowNav flowId="superadmin" />` immediately before the
     `</PageWrap>` closing tag, with one blank line above it for
     readability.
- For files with trailing Dialogs (`companies.tsx`, `users.tsx`,
  `questions.tsx`), I was careful to insert `FlowNav` *before* `</PageWrap>`
  — i.e. inside the page wrapper, after the main content, and *not*
  inside or after the Dialog block. The Dialog remains a sibling of
  `PageWrap` under `AuroraBackground`, exactly as before.
- Did not touch any other code: no reordering, no signature changes,
  no prop additions, no class adjustments. Diff for each file is exactly
  +1 import line and +2 lines for the FlowNav render (one blank, one JSX).

## Files Edited (8)
1. `src/components/screens/superadmin/dashboard.tsx`
   — import added after `cn`; FlowNav placed after the `<section>` of
   nav cards, before `</PageWrap>`.
2. `src/components/screens/superadmin/companies.tsx`
   — import added after `cn`; FlowNav placed after the recent-activity
   `<motion.div>` block, before `</PageWrap>` (Dialog stays after
   `</PageWrap>`).
3. `src/components/screens/superadmin/users.tsx`
   — import added after `cn`; FlowNav placed after the legend `<p>`,
   before `</PageWrap>` (three trailing Dialogs stay after `</PageWrap>`).
4. `src/components/screens/superadmin/ai-usage.tsx`
   — import added after `cn`; FlowNav placed after the per-module +
   rate-limit grid `<div>`, before `</PageWrap>`.
5. `src/components/screens/superadmin/questions.tsx`
   — import added after `cn`; FlowNav placed after the audit-link
   `<p>`, before `</PageWrap>` (Reseed Dialog stays after `</PageWrap>`).
6. `src/components/screens/superadmin/system.tsx`
   — import added after `cn`; FlowNav placed after the save-bar
   `<motion.div>`, before `</PageWrap>`.
7. `src/components/screens/superadmin/audit.tsx`
   — import added after `cn`; FlowNav placed after the audit-table
   `<motion.div>`, before `</PageWrap>`.
8. `src/components/screens/superadmin/db-health.tsx`
   — import added after `cn`; FlowNav placed after the health-check log
   `<motion.div>`, before `</PageWrap>`.

## Verification
- Ran `bun run lint` → exit code 0, zero errors, zero warnings.
- Verified dev.log: dev server compiles all 8 edited files cleanly with
  no new errors.

## Stage Summary
- 8 files edited, 16 lines added total (8 imports + 8 FlowNav renders,
  each with one preceding blank line).
- No other code touched. No exports or function signatures changed.
- FlowNav now renders at the bottom of every Super Admin screen, giving
  the user a persistent stepper + Continue CTA through the 8-screen
  platform-tour flow.
