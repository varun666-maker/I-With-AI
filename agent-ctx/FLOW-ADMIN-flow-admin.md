# Task ID: FLOW-ADMIN · Agent flow-admin

## Scope
Add the `FlowNav` sequential navigation component to the 8 Company Admin screen files. Surgical edit only — import `FlowNav` and render it once near the bottom of each screen, as the LAST child of `PageWrap` (inside `AuroraBackground`).

## Reference files read
- `/home/z/my-project/src/components/shared/flow-nav.tsx` — self-contained card with stepper + Continue button. Accepts `flowId: FlowKind` ("prep" | "admin" | "candidate" | "superadmin"). Built-in `mt-12` spacing.
- `/home/z/my-project/src/lib/flows.ts` — defines `ADMIN_FLOW` (8 steps): company-register → admin-dashboard → campaign-new → question-manager → candidate-leaderboard → bulk-upload → proctoring-review → final-selection.

## Files edited (8)
All under `/home/z/my-project/src/components/screens/admin/`:

| File | Export | FlowNav placement |
|------|--------|-------------------|
| `register.tsx`    | `CompanyRegister`       | After the grid container `</div>` (closing the 2-column layout pitch+form), as last child of `PageWrap` |
| `dashboard.tsx`   | `AdminDashboard`       | After the bottom strip `</div>` (closing the Live activity + Integrity score row), as last child of `PageWrap` |
| `campaign-new.tsx`| `CampaignCreate`       | OUTSIDE the `AnimatePresence` phase switch (after `</AnimatePresence>`), as last child of `PageWrap` — shows in BOTH `form` and `success` phases |
| `questions.tsx`   | `QuestionManager`      | OUTSIDE the `Tabs` component (after `</Tabs>`), as last child of `PageWrap` — shows regardless of active tab (aptitude/coding) |
| `candidates.tsx` | `CandidateLeaderboard` | After the bottom actions `</div>` (closing the Refresh / Export row), as last child of `PageWrap` |
| `bulk-upload.tsx` | `BulkUpload`           | OUTSIDE the `AnimatePresence` phase switch (after `</AnimatePresence>`), as last child of `PageWrap` — shows in all 3 phases (upload/processing/results) |
| `proctoring.tsx`  | `ProctoringReview`     | After the bottom CTA `</div>` (closing the Auto-disqualify / Save row), as last child of `PageWrap` — placed BEFORE the `<Dialog>` (which sits outside `PageWrap`, directly inside `AuroraBackground`) |
| `selection.tsx`   | `FinalSelection`       | After the footer card `</GlowCard>` (closing the PDF ZIP summary card), as last child of `PageWrap` |

## Import added (top of each file, after other imports)
```tsx
import { FlowNav } from "@/components/shared/flow-nav";
```
Anchored after `import { cn } from "@/lib/utils";` (verified unique per file — exactly 1 occurrence across all 8 files via `rg --count`).

## Render added (once per file, last child of `PageWrap`, inside `AuroraBackground`)
```tsx
<FlowNav flowId="admin" />
```
At 8-space indent (sibling of other top-level `PageWrap` children like `<motion.div>`, `<GlowCard>`, `<Tabs>`, `<AnimatePresence>`).

## Placement rules followed
- ✅ Self-contained card (built-in `mt-12` spacing — no extra margin classes added)
- ✅ Placed OUTSIDE any conditional render blocks / phase switches / Tabs / Dialog content:
  - `campaign-new.tsx`: outside `<AnimatePresence mode="wait">` phase switch
  - `questions.tsx`: outside `<Tabs>` component
  - `bulk-upload.tsx`: outside `<AnimatePresence mode="wait">` phase switch (3 phases)
- ✅ Placed INSIDE the page wrapper (`<AuroraBackground>` → `<PageWrap>` → `<section>` → FlowNav) so it inherits the dark aurora background
- ✅ LAST child of `PageWrap`, after the existing final section (table, CTA strip, footer card, etc.)
- ✅ For `proctoring.tsx` specifically: placed BEFORE the trailing `<Dialog>` screenshot viewer (which sits outside `PageWrap`, directly inside `AuroraBackground`). FlowNav still lives inside `PageWrap` — only the Dialog is the next sibling of `PageWrap` inside `AuroraBackground`.

## Constraints respected
- ❌ Did NOT modify any other code in the files
- ❌ Did NOT add FlowNav multiple times in the same file
- ❌ Did NOT place FlowNav inside a Tab, Dialog, or conditional render block
- ❌ Did NOT reorder existing sections
- ❌ Did NOT change screen exports or function signatures

## Verification
- `bun run lint` → 0 errors, 0 warnings (clean run, no output beyond `$ eslint .`).
- `rg FlowNav src/components/screens/admin` → 16 hits across 8 files (8 imports + 8 renders), confirming exactly one FlowNav per file.

## Summary of the 8 files edited
1. `src/components/screens/admin/register.tsx`
2. `src/components/screens/admin/dashboard.tsx`
3. `src/components/screens/admin/campaign-new.tsx`
4. `src/components/screens/admin/questions.tsx`
5. `src/components/screens/admin/candidates.tsx`
6. `src/components/screens/admin/bulk-upload.tsx`
7. `src/components/screens/admin/proctoring.tsx`
8. `src/components/screens/admin/selection.tsx`

## Cross-references
- Previous agent work: `/home/z/my-project/agent-ctx/FLOW-CAND-flow-cand.md` (analogous task for the 6 Candidate screens — same `FlowNav` component, `flowId="candidate"`).
- Flow source of truth: `/home/z/my-project/src/lib/flows.ts` (`ADMIN_FLOW` constant).
