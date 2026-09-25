# Task ID: DESIGN-CAND-SA — Candidate & Super Admin Screen Redesign

**Agent:** design-cand-sa
**Started:** reading landing.tsx, primitives.tsx, globals.css (light-mode overrides lines 615-760)
**Finished:** all 14 files edited, lint clean, dev server compiles cleanly.

## What this task did

Applied the same design language as the redesigned landing page (`prep/landing.tsx`) to 14 screens (6 candidate + 8 super admin). Surgical edits only — no functionality removed, no component names or exports changed.

## Design rules applied

From the 30-things list + Taste Skill v2 + Impeccable:

| Rule | How applied |
|------|-------------|
| No AuroraBackground | Replaced with `<div className="min-h-screen bg-background text-foreground">` |
| No emojis in copy | Removed ✅ 🔍 ⚠️ 🔄. Status indicators → icons or dot spans. |
| No em dashes (—) | Replaced with `. ` or `- ` in user-facing copy AND comments. |
| No Sparkles icon | Removed imports + JSX. |
| No harsh button gradients | `bg-gradient-to-r from-violet-500 to-fuchsia-500` → `bg-violet-500 hover:bg-violet-600` (and analogous for rose/emerald/amber/sky). |
| No glow shadows on icon containers | `bg-gradient-to-br from-X/30 to-Y/30` → solid `bg-X/10`. |
| No BorderBeam | None in scope. |
| No MagneticButton | Replaced with `<Button>`. |
| No PulseBadge | Replaced with `<Badge variant="outline">` + custom className, or inline span. |
| Cards rounded-lg, buttons rounded-full | Changed `rounded-xl`/`rounded-2xl` icon containers to `rounded-lg`; primary buttons already `rounded-full`. |
| No "it's not X, it's Y" copy | Rewrote the offending paragraph in `login.tsx`. |
| One accent (violet-500) | `gradient-text` → `text-violet-500 dark:text-violet-400` to match landing page. |
| Light-mode contrast | `text-white` on transparent backgrounds → `text-foreground`. `text-violet-200/300/400` → paired with explicit `dark:` variants. |

## Files edited

### Candidate (6)

1. **`src/components/screens/candidate/apply.tsx`** → `ApplyPage`
   - Removed AuroraBackground, MagneticButton, PulseBadge, Sparkles.
   - Added `Badge` import.
   - Replaced `gradient-text text-glow` with `text-violet-500 dark:text-violet-400`.
   - Building2 icon container: `rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30` → `rounded-lg bg-violet-500/10`.
   - UploadCloud icon container: same treatment.
   - Submit button: solid violet instead of gradient.
   - Success icon container: `bg-gradient-to-br from-emerald-500/30 to-emerald-500/10` → `bg-emerald-500/15`.
   - Removed ✅ emoji from "Application Submitted!" heading.
   - Amber Badge with `text-amber-700 dark:text-amber-300` for the campaign banner.
   - `text-white` "Thank you, Priya" → `text-foreground`.
   - Removed 2 comment em dashes.

2. **`src/components/screens/candidate/login.tsx`** → `CandidateLogin`
   - Same AuroraBackground/MagneticButton/PulseBadge/Sparkles removal.
   - Rewrote the info-box copy: "This is your invited candidate login — different from your student account..." → "Use the credentials emailed to you for this campaign. They are separate from your InterviewAI prep-mode account." (Removes both the em dash AND the "it's not X, it's Y" framing.)
   - Login button: solid violet.
   - ShieldCheck icon container: `rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20` → `rounded-lg bg-violet-500/10`.
   - Removed "Apply to a campaign" Sparkles icon (button text only).
   - `hover:text-white` → `hover:text-foreground` on ghost link buttons.

3. **`src/components/screens/candidate/change-password.tsx`** → `ForcePasswordChange`
   - Same primitive removals.
   - Lock icon container: `rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-violet-100` → `rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300`.
   - Update Password button: solid violet.
   - `hover:text-white` on eye-toggle buttons → `hover:text-foreground dark:hover:text-white`.
   - Amber Badge for "First Login · Mandatory" header pill.
   - Removed comment em dash.

4. **`src/components/screens/candidate/system-check.tsx`** → `PreTestCheck`
   - Same primitive removals.
   - Removed 🔍 emoji from heading.
   - Progress bar fill: `bg-gradient-to-r from-violet-500 to-fuchsia-500` → `bg-violet-500`.
   - Continue button: solid violet.
   - Reworded "Hiring-mode proctoring is enforced — you can't skip any step." → "Hiring-mode proctoring is enforced. You can't skip any step." (period instead of em dash).
   - Reworded "Working — clear input detected" → "Working. Clear input detected".
   - Removed 3 comment em dashes.

5. **`src/components/screens/candidate/dashboard.tsx`** → `CandidateDashboard`
   - Same primitive removals. Added `AlertTriangle` import (for inline integrity warning icon).
   - Refactored `toneRing` to remove `from-X/15 to-Y/5` gradient stops. Split into `toneRing` (just ring + text colors with light/dark variants) + `toneIconBg` (solid `bg-X/10`).
   - Countdown timer icon: `rounded-xl bg-gradient-to-br ${toneRing}` → `rounded-lg ${toneRing} ${toneIconBg}`.
   - Timer colons `text-white/20` → `text-muted-foreground/30` (visible in both modes).
   - Header: `{CAMPAIGN.company} —` → `{CAMPAIGN.company} ` (removed em dash).
   - Removed `gradient-text text-glow` from role name → `text-violet-500 dark:text-violet-400`.
   - Round icon container: `rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-violet-100 ring-white/10` (in-progress state) → `rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-black/10 dark:ring-white/10`. Same treatment for `isLocked` state.
   - Replaced 3 `PulseBadge` instances (Completed/In Progress/Locked) with `Badge variant="outline"` + tone-specific className.
   - `text-emerald-300` score color → `text-emerald-700 dark:text-emerald-300`.
   - Removed ✅ emoji from "Qualification: Passed".
   - In-progress hint box: removed Sparkles icon, removed em dash from copy.
   - Locked-button: `border-white/10 bg-white/[0.02] text-white/40` → `border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]`.
   - Violations card: `⚠️ Flagged` → inline `<AlertTriangle className="inline h-3 w-3 align-text-bottom" /> Flagged`.
   - Integrity "Clean" card: removed ✅ emoji, `text-white/80` → `text-foreground/80`.
   - MagneticButton (Continue Coding) → `<Button>` with solid violet.
   - `hover:text-white` on Logout → `hover:text-foreground`.
   - Reworded "permanently locked — no re-entry" → "permanently locked. No re-entry".
   - Updated `toneText` in `CountUnit` to use light/dark variants.

6. **`src/components/screens/candidate/results.tsx`** → `CandidateResults`
   - Same primitive removals.
   - Success CheckCircle2 icon container: gradient → `bg-emerald-500/15`.
   - Removed ✅ emoji from "Assessment Complete" heading.
   - `gradient-text text-glow` → `text-violet-500 dark:text-violet-400`.
   - `text-white` (3 occurrences on transparent card backgrounds) → `text-foreground`.
   - Hidden-row icon container: `bg-white/5 text-white/40 ring-white/10` → `bg-black/5 text-muted-foreground ring-black/10 dark:bg-white/5 dark:text-white/40 dark:ring-white/10`.
   - Hidden-row "Hidden" badge: `border-white/10 bg-white/5 text-white/50` → `border-black/10 bg-black/5 text-muted-foreground dark:border-white/10 dark:bg-white/5`.
   - Logout MagneticButton → `<Button>` with solid violet.
   - `hover:text-white` on support link → `hover:text-foreground`.
   - Emerald integrity pill: `text-emerald-200` → `text-emerald-700 dark:text-emerald-300`.
   - Sky info box: `text-sky-100/90` → `text-sky-800 dark:text-sky-100/90`. Icon `text-sky-300` → `text-sky-600 dark:text-sky-300`.

### Super Admin (8)

7. **`src/components/screens/superadmin/dashboard.tsx`** → `SuperAdminDashboard`
   - Removed AuroraBackground, PulseBadge, Sparkles.
   - Added `Badge` import.
   - Refactored `TONE_RING` map from gradient stops (`from-X/20 to-Y/20`) to solid tints (`bg-X/10 text-X-600 dark:text-X-300`).
   - Header: removed Sparkles icon, `gradient-text` → `text-violet-500 dark:text-violet-400`.
   - PulseBadge "All systems operational" → Badge with emerald tone.
   - DB Health + Redis Health stat cards: replaced `✅` emoji with `<span className="h-2 w-2 rounded-full bg-emerald-500" />` dot.
   - Nav cards icon container: `rounded-xl bg-gradient-to-br ring-white/10` → `rounded-lg ring-black/10 dark:ring-white/10`.
   - Em-dash comments → periods.

8. **`src/components/screens/superadmin/companies.tsx`** → `CompanyManagement`
   - Removed AuroraBackground, PulseBadge, Sparkles.
   - Header `Building2` icon and `text-violet-300/80` → `text-violet-600 dark:text-violet-300/80`.
   - `gradient-text` → `text-violet-500 dark:text-violet-400`.
   - PulseBadge tenant count → Badge.
   - Removed `<Sparkles>` decoration next to "All registered companies" heading.
   - Company avatar: `rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-200 ring-white/10` → `rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-black/10 dark:ring-white/10`.
   - Active/Suspended PulseBadge → Badge with emerald/rose tones.
   - Recent activity list: ` — {a.what}` → ` · {a.what}`.
   - Policy bullet: "Existing data is preserved — reactivation is one click." → "Existing data is preserved. Reactivation is one click."
   - Suspend/Reactivate dialog buttons: gradient → solid (`bg-rose-500` / `bg-emerald-500`).

9. **`src/components/screens/superadmin/users.tsx`** → `UserManagement`
   - Removed AuroraBackground, PulseBadge.
   - Added `Badge` import + `cn` already imported.
   - Added `BADGE_TONE_CLASS` map to preserve per-role color coding (violet/sky/amber/emerald/rose/slate).
   - Replaced 2 em-dash `company: "—"` placeholders with `"-"`.
   - Header `Users` icon and `text-violet-300/80` → `text-violet-600 dark:text-violet-300/80`.
   - `gradient-text` → `text-violet-500 dark:text-violet-400`.
   - PulseBadge tenant count → Badge.
   - Role badges in table: PulseBadge → Badge with `BADGE_TONE_CLASS[badge.color]`.
   - Delete dialog button: gradient → `bg-rose-500 hover:bg-rose-600`.
   - Suspend dialog button: gradient → `bg-amber-500 hover:bg-amber-600`.
   - Reset-password dialog button: gradient → `bg-sky-500 hover:bg-sky-600`.
   - Removed comment em dash.

10. **`src/components/screens/superadmin/ai-usage.tsx`** → `AIUsageMonitor`
    - Removed AuroraBackground, PulseBadge.
    - Added `Badge` import.
    - Header `Cpu` icon and `text-violet-300/80` → `text-violet-600 dark:text-violet-300/80`.
    - `gradient-text` → `text-violet-500 dark:text-violet-400`.
    - PulseBadge "Token quota 120%" → Badge with amber tone.
    - `SEVERITY_COLOR` map: `text-amber-200` / `text-rose-200` → `text-amber-700 dark:text-amber-300` / `text-rose-700 dark:text-rose-300`.
    - Stat-card hint: "120% of daily 1M limit — over!" → "120% of daily 1M limit. Over!"
    - Rate-event row: ` — {e.detail}` → ` · {e.detail}`.

11. **`src/components/screens/superadmin/questions.tsx`** → `QuestionBankAdmin`
    - Removed AuroraBackground, PulseBadge, Sparkles.
    - Added `Badge` import.
    - Header `ListChecks` icon and `text-violet-300/80` → `text-violet-600 dark:text-violet-300/80`.
    - `gradient-text` → `text-violet-500 dark:text-violet-400`.
    - PulseBadge "items live" → Badge with emerald tone.
    - "Bank quality" stat card: ✅ emoji → emerald dot span.
    - Removed `<Sparkles>` decoration next to "Aptitude categories" heading.
    - Aptitude table status: PulseBadge `✅ Healthy` → Badge with emerald dot + "Healthy" text.
    - Coding table status: same.
    - Reseed button: gradient → `bg-rose-500 hover:bg-rose-600`. Removed 🔄 emoji from label.
    - Reseed dialog confirm button: same gradient → solid.
    - Progress note: "(mock — real job ~30 min)" → "(mock. Real job ~30 min)".

12. **`src/components/screens/superadmin/system.tsx`** → `SystemConfig`
    - Removed AuroraBackground, PulseBadge, Sparkles. Added `CheckCircle2` + `Badge` imports.
    - Header `Settings2` icon and `text-violet-300/80` → `text-violet-600 dark:text-violet-300/80`.
    - `gradient-text` → `text-violet-500 dark:text-violet-400`.
    - Description: "feature toggles — all here." → "feature toggles. All here."
    - Maintenance ON / All systems live PulseBadges → Badges with rose/emerald tones.
    - Removed `<Sparkles>` decoration next to "Platform-wide configuration" heading.
    - Maintenance table cell ON/OFF PulseBadges → Badges.
    - Proctoring + email-provider PulseBadges → Badges with violet/sky tones.
    - Save-bar warning: "off will hide every company & campaign route — but in-flight candidate sessions continue." → "...route. In-flight candidate sessions continue."
    - Save-bar success indicator: `✅ Saved at {time}` → inline `<CheckCircle2 />` + "Saved at {time}" with emerald tone.
    - Save button: gradient → solid violet.
    - Save button in `MaskedKeyField` helper: gradient → solid violet.

13. **`src/components/screens/superadmin/audit.tsx`** → `AuditLogs`
    - Removed AuroraBackground, PulseBadge, Sparkles.
    - Added `Badge` import. `cn` already imported.
    - Refactored `ACTION_COLOR` map from color-name strings (`"violet"`, `"rose"`, etc.) to full Badge class strings (so it can be applied directly via `cn(...)`).
    - Header `ScrollText` icon and `text-violet-300/80` → `text-violet-600 dark:text-violet-300/80`.
    - `gradient-text` → `text-violet-500 dark:text-violet-400`.
    - Description: "Every admin action across every tenant — immutable, filterable," → "...tenant. Immutable, filterable,".
    - PulseBadge "events today" → Badge with emerald tone.
    - Stat card "Super-admin acts" icon: `<Sparkles>` → `<Filter>` (already imported).
    - Filter-bar description: "Stack as many filters as you like — the table updates instantly." → "...you like. The table updates instantly."
    - Audit-row action PulseBadge → Badge with `ACTION_COLOR[r.action]`.
    - Filter-bar active-role PulseBadge → Badge with conditional slate/violet className.
    - Audit-row detail: `details: "rahul@student.com — GDPR job queued"` → `details: "rahul@student.com. GDPR job queued"`.

14. **`src/components/screens/superadmin/db-health.tsx`** → `DatabaseHealth`
    - Removed AuroraBackground, PulseBadge.
    - Added `Badge` import.
    - Header `Database` icon and `text-violet-300/80` → `text-violet-600 dark:text-violet-300/80`.
    - `gradient-text` → `text-violet-500 dark:text-violet-400`.
    - Description: "Live status for every backend dependency — relational, document," → "...dependency. Relational, document,".
    - PulseBadge "{okCount}/{total} healthy" → Badge with emerald tone.
    - "Components" stat card: ✅ emoji → emerald dot span.
    - "Per-service status" description: "If any component is down it shows ❌ with an actionable error message." → "If any component is down it shows a red Down badge with an actionable error message."
    - Per-component icon container: `rounded-xl bg-gradient-to-br ring-white/10` with tone-based gradient stops → `rounded-lg ring-black/10 dark:ring-white/10` with tone-based solid `bg-X/10 text-X-600 dark:text-X-300`.
    - Healthy/Down PulseBadges → Badges with emerald/rose tones.
    - Latency `—` placeholder → `-`.
    - "Run Full Health Check" button: gradient → solid violet.
    - Health-check log row: ` — {e.result}` → ` · {e.result}`.

## Verification

All four checks pass:

```bash
# 1. Lint
$ bun run lint
$ eslint .
# (exit code 0, 0 errors, 0 warnings)

# 2. No emojis
$ rg "[✅🔄🔒⚠️❌✨🎯🔥💡📥📊🟢🔴⚡🔍📁]" src/components/screens/candidate/ src/components/screens/superadmin/
# (no matches)

# 3. No em dashes
$ rg "—" src/components/screens/candidate/ src/components/screens/superadmin/
# (no matches)

# 4. No banned components
$ rg "AuroraBackground|Sparkles|MagneticButton|BorderBeam" src/components/screens/candidate/ src/components/screens/superadmin/
# (no matches)
# Bonus: PulseBadge also removed (per task instruction I).
$ rg "PulseBadge" src/components/screens/candidate/ src/components/screens/superadmin/
# (no matches)

# 5. No harsh gradients on buttons
$ rg "bg-gradient-to-(r|br)" src/components/screens/candidate/ src/components/screens/superadmin/
# (no matches)

# 6. All named exports intact
$ rg "^export function" src/components/screens/candidate/ src/components/screens/superadmin/
# 14 matches — ApplyPage, CandidateLogin, ForcePasswordChange, PreTestCheck,
# CandidateDashboard, CandidateResults, SuperAdminDashboard, CompanyManagement,
# UserManagement, AIUsageMonitor, QuestionBankAdmin, SystemConfig, AuditLogs,
# DatabaseHealth

# 7. Dev server compiles cleanly
# (verified via dev.log — multiple "✓ Compiled in Nms" + "GET / 200" entries
# during the edit session)
```

## Files NOT touched (per task scope)

- `src/components/screens/prep/*` (landing was the reference, others out of scope)
- `src/components/screens/admin/*` (out of scope)
- `src/components/shared/primitives.tsx` (AuroraBackground etc. still defined and used by other folders; only removed from candidate/superadmin imports)
- `src/app/globals.css` (the light-mode overrides at lines 615-760 are unchanged)
- `src/lib/store.ts`, `src/components/ui/*`, anything else outside `src/components/screens/candidate/` and `src/components/screens/superadmin/`
