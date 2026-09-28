# Task ID: DESIGN-ADMIN-LANDING · Agent: design-admin-landing

## Summary
Cleaned up banned design patterns in `src/components/screens/admin/landing.tsx` (the `CompanyLanding` component) to match the redesigned prep landing page (`src/components/screens/prep/landing.tsx`). Removed all 5 banned primitives (AuroraBackground, Sparkles, MagneticButton, BorderBeam, PulseBadge), all em dashes, all harsh gradients, all gradient-text/text-glow classes, and glow shadows — while preserving all sections, data, interactivity, navigation calls, and the `CompanyLanding` named export.

## Reference consulted
- `/home/z/my-project/src/components/screens/prep/landing.tsx` — clean design reference (read in full)
- `/home/z/my-project/agent-ctx/DESIGN-ADMIN-design-admin.md` — prior admin-screen cleanup notes (informed the standard: zero `bg-gradient-to-*`, zero `gradient-text`/`text-glow`, dual `border-black/10 dark:border-white/10` tokens)
- `/home/z/my-project/src/components/shared/primitives.tsx` — read GlowCard/Marquee/SectionHeading definitions (these were kept since they are not in the banned list)

## File edited
`src/components/screens/admin/landing.tsx` (1 file only — no other file touched)

## Changes applied

### Banned components removed (5)
1. **AuroraBackground** — wrapper replaced with `<div className="min-h-screen bg-background text-foreground">`; import removed.
2. **Sparkles** — removed from lucide imports and from the pricing "Most popular" Badge JSX. Also removed 5 dead lucide imports (`ArrowDown`, `Download`, `Plug`, `Star`, `Trophy`).
3. **MagneticButton** — all 3 instances → plain `<Button>` (hero primary, hero secondary, final-CTA primary); import removed.
4. **BorderBeam** — all 4 `<BorderBeam />` elements removed (pipeline callout, pricing popular, final CTA, CompanyMockup); import removed.
5. **PulseBadge** — all 3 instances → native `<span>` pills with the same emerald/amber color tokens; import removed.

### Em dashes removed (16 instances)
All `—` characters replaced with periods, commas, or colons per the task spec (lines 98, 146, 157, 165, 248, 264, 268, 313, 436, 514, 583-584, 593, 822, 912, 988 in the original file).

### Gradients + glow removed
- All `bg-gradient-to-r from-violet-500 to-fuchsia-500` on buttons → solid `bg-violet-500 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600`.
- All decorative `bg-gradient-to-*` (icon containers, avatars, progress bars, pills, overlay divs) → solid `bg-violet-500` or `bg-violet-500/10`.
- All 12 `gradient-text` → `text-violet-500 dark:text-violet-400`.
- `text-glow` (hero headline) → removed.
- `FloatingChip` `shadow-2xl` → `shadow-sm`.
- Testimonial `accent` gradient field dropped from TESTIMONIALS data + JSX.

### Light/dark token consistency (to match prep landing)
Section bands, borders, and backgrounds converted from dark-mode-only (`border-white/5`, `bg-white/[0.01]`) to dual tokens (`border-black/10 dark:border-white/10`, `bg-black/[0.02] dark:bg-white/[0.02]`). `hover:text-white` → `hover:text-foreground`. Accent text paired with `dark:` variants.

## Preserved
- `CompanyLanding` named export (line 257).
- All 11 `useNav` `set(...)` navigation calls: `company-register`, `candidate-leaderboard`, `proctoring-review`, `company-landing` (×3), `apply`, `admin-dashboard`.
- All sections: hero, ROI stats, pain points, bento features, automation pipeline, comparison table, proctoring spotlight, logo cloud, testimonials, pricing (3 tiers + monthly/yearly toggle), FAQ accordion, final CTA, footer, CompanyMockup.
- All data constants (only the cosmetic `accent` field dropped from TESTIMONIALS).
- All interactivity (billing toggle state, FAQ accordion state, scroll-to-pipeline, floating chip animations).
- `GlowCard`, `Marquee`, `SectionHeading`, `StaggeredReveal`, `revealItem` primitives kept (not banned); only className props restyled.

## Verification (all passing)
- `bun run lint` → exit 0, 0 errors ✓
- `rg "AuroraBackground|Sparkles|MagneticButton|BorderBeam|PulseBadge" src/components/screens/admin/landing.tsx` → no matches ✓
- `rg "—" src/components/screens/admin/landing.tsx` → no matches ✓
- `rg "bg-gradient-to|gradient-text|text-glow|shadow-\[" src/components/screens/admin/landing.tsx` → no matches ✓
- `rg "^export function CompanyLanding"` → present ✓
- `useNav` wiring → 1 import + 11 `set(...)` calls preserved ✓
- dev server → `GET / 200` (compiled successfully) ✓

## Worklog
Appended to `/home/z/my-project/worklog.md` under Task ID `DESIGN-ADMIN-LANDING`.
