# AI Interview Assistant — Frontend Fixes Package

**Version:** 1.0 · **Date:** 2026-10-03
**Scope: FRONTEND ONLY.** Backend / API / DB work is explicitly deferred (see FRONTEND_CHANGE_SPEC.md §7 — do not start it yet).

---

## What is in this package

| File | Purpose |
|------|---------|
| `FRONTEND_CHANGE_SPEC.md` | **The actionable spec.** 33 frontend changes in 4 priority waves (P0 → P3), with exact copy strings, screen locations, acceptance criteria, and the pre-applied decision defaults. |
| `findings.json` | Machine-readable register of all 107 audit findings (39 PRD↔workflow mismatches, 20 workflow defects, 25 UI/UX recommendations, 12 deployed-app observations, 11 decisions, 21-item PRD update plan). |
| `PRD_v2.2_Review_and_Alignment_Report.docx` | Full 34-page review report (context, rationale, severity ratings). Read when you need the "why" behind an item. |
| `screenshots/` | 40 PNG evidence screenshots of the currently deployed app (file names map to the 38 screens, `01-landing.png` … `38-super-dbhealth.png`). |

## How to apply (for the AI/code agent in the project chat)

1. **Read `FRONTEND_CHANGE_SPEC.md` top to bottom before touching code.**
2. Work in priority order: **P0 (5 items) → P1 (12) → P2 (11) → P3 (5)**. Each item has a "Done when" acceptance test.
3. §1 ground rules (3-strike copy, camera scoping, colour semantics, "Free forever") apply globally — sweep the whole app for them, not just the listed screens.
4. **§8 decision defaults are PRE-APPLIED** (D1=A role-aware /auth, D3=6 hiring interview types, D6=hide live AI review in Hiring, D10=Free forever, …). Implement against these unless the user explicitly overrides.
5. Anything marked **`[backend-dependent]`** ships as UI + graceful degradation (button renders, call fails silently/queued) — the API contract is stubbed in the spec.
6. **§7 lists what NOT to build now** (applicant_pool table, ~18 endpoints, cutoff unlock logic, email verification send, etc.). Backend comes in a later package.
7. Do not change routing structure beyond what the spec says (`/auth` stays canonical; `/login` and `/register` become redirect aliases).

## Source context

- PRD: `PRD_v2.2_DualPlatform.md` (v2.2, kept as-is — the PRD update itself is a separate later task)
- Workflow doc: screen-by-screen spec (the accepted source of truth for UI behaviour)
- Live app audited 2026-10-02 at https://g1wua7arpqv0-d.space-z.ai — 38 screens verified, every discrepancy screenshot in `screenshots/`
