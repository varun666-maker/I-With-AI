# Task ID: FLOW-PREP · Agent: flow-prep

## Summary

Surgically injected the `FlowNav` sequential navigation component into the 9 Prep Mode screen files (per the PREP_FLOW sequence in `src/lib/flows.ts`) plus `profile.tsx` for consistency. Each file received:

1. A new import: `import { FlowNav } from "@/components/shared/flow-nav";`
2. A single render: `<FlowNav flowId="prep" />`

No other code was touched. No file got FlowNav twice. No FlowNav was placed inside a Tab, Dialog, or conditional render block.

## Files edited (10)

All under `src/components/screens/prep/`:

| # | File | Placement of `<FlowNav flowId="prep" />` |
|---|------|-------------------------------------------|
| 1 | `landing.tsx`  | Between the final CTA `</section>` (the "Ready to ace your next interview?" GlowCard) and the `{/* FOOTER */}` comment — sits at the `AuroraBackground` sibling level, ABOVE the `<footer>` so the footer stays at the bottom |
| 2 | `auth.tsx`     | After the root grid `</div>` (the 2-col marketing/form layout), directly before `</AuroraBackground>`. Skipped the optional `<div className="px-4 pb-12">` wrapper because the screen already wraps in `AuroraBackground`. |
| 3 | `dashboard.tsx`| Last child of `PageWrap`, after the quick-actions grid `</div>` (Resume Hub / Aptitude / Coding / Interview tiles) |
| 4 | `resume.tsx`   | Last child of `PageWrap`, after the footer CTA `</div>` ("Want tailored interview questions for your role?") |
| 5 | `aptitude.tsx` | Last child of `PageWrap`, after the `<AnimatePresence>` results block `</div>` (Take Again / Back to Dashboard buttons) |
| 6 | `coding.tsx`   | Last child of `PageWrap`, after the stats strip `</div>` — placed BEFORE the `<Dialog>` (language-switch confirm) which lives OUTSIDE `PageWrap` between `</PageWrap>` and `</AuroraBackground>` |
| 7 | `interview.tsx`| Last child of `PageWrap`, after the `<AnimatePresence>` phase-switch `</div>` (setup/live/processing/done) |
| 8 | `report.tsx`   | Last child of `PageWrap`, after the Download-PDF CTA `</div>` |
| 9 | `replay.tsx`   | Last child of `PageWrap`, after the bottom GlowCard `</div>` ("Start New") |
| 10 | `profile.tsx` | Last child of `PageWrap`, after the `</Tabs>` `</div>` (profile is not in PREP_FLOW but `flowId="prep"` was applied anyway — falls back to landing as the current step, which is acceptable per the task instructions) |

## Import location

In every file the import was added immediately after the existing line:

```tsx
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FlowNav } from "@/components/shared/flow-nav";   // ← NEW
```

The `import { cn } from "@/lib/utils";` anchor was unique in each file (verified via grep), so the insertion was deterministic.

## Verification

- `bun run lint` → **0 errors, 0 warnings**
- `rg FlowNav src/components/screens/prep` → **20 hits across 10 files** (10 imports + 10 renders), confirming exactly one FlowNav per file and zero duplicates.

## Constraints respected

- ❌ Did NOT modify any other code in any of the 10 files (only the import + the single render were added)
- ❌ Did NOT add FlowNav multiple times in any single file
- ❌ Did NOT place FlowNav inside a Tab, Dialog, AnimatePresence, or conditional render block
- ❌ Did NOT reorder existing sections, change screen exports, or change function signatures
- ❌ Did NOT create any new files (only edited existing prep screen files)

## Notes for downstream agents

- The `coding.tsx` file has an unusual structure: a `<Dialog>` (language-switch confirm) sits OUTSIDE `PageWrap`, between `</PageWrap>` and `</AuroraBackground>`. FlowNav was placed INSIDE `PageWrap` (before `</PageWrap>`), so it remains a sibling of the main content and never inside the Dialog. The Dialog itself is unmodified.
- The `landing.tsx` file is the only one where FlowNav sits at the AuroraBackground sibling level rather than inside a `PageWrap`. This is intentional — landing doesn't use `PageWrap`, and the instruction was to place FlowNav between the final CTA section and the footer.
- The `auth.tsx` file also has FlowNav at the AuroraBackground level (after the root grid `</div>`), because the auth page uses a custom 2-col grid layout instead of `PageWrap`.
