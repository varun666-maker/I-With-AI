# REBUILD-A · rebuild-a — Work Record

**Task:** Recreate 6 accidentally-deleted shared infrastructure files for the coding interview platform.

## Files created

| # | Path | Public API |
|---|---|---|
| 1 | `src/lib/fullscreen.ts` | `requestFullscreen()`, `exitFullscreen()`, `isCurrentlyFullscreen()`, `onFullscreenChange(cb)`, `useFullscreen()` |
| 2 | `src/lib/proctoring.ts` | `useProctoring({ mode, onAutoSubmit })`, `captureWebcamFrame(video)`, types `ProctoringMode`, `ViolationType`, `ProctoringEvent`, `ProctoringState`, const `MAX_STRIKES = 3` |
| 3 | `src/lib/coding-problems.ts` | `CODING_PROBLEMS` (24 items), `TOPICS`, `DIFFICULTIES`, `getProblemById(id)`, types `Difficulty`, `Topic`, `CodingProblem`, `CodingExample`, `TestCase` |
| 4 | `src/components/shared/proctoring-warning.tsx` | `<ProctoringWarning strikeNumber violationType onAcknowledge onAutoSubmit? open />` |
| 5 | `src/components/shared/coding-heatmap.tsx` | `<CodingHeatmap submissions weeks? className? />`, type `HeatmapSubmission` |
| 6 | `src/components/shared/problem-list-table.tsx` | `<ProblemListTable solvedProblems attemptedProblems submissions onPickProblem onRandomQuestion className? />` |

## Key implementation choices

### fullscreen.ts
- `Document` and `HTMLElement` cast to local `WebkitDocument` / `WebkitHTMLElement` types to access the `webkit*` legacy fields without leaking vendor types into the public API.
- All functions guard `typeof document === "undefined"` so they are safe during SSR.
- `useFullscreen` defers the initial state sync to `queueMicrotask` (the `react-hooks/set-state-in-effect` rule fires on synchronous setState inside an effect body — see the first lint failure log).

### proctoring.ts
- `modeRef` and `onAutoSubmitRef` are kept in sync via tiny `useEffect`s so detector closures can read the latest values without forcing a re-bind of all listeners.
- `strikesRef` mirrors `strikes` so the listener can increment atomically and detect the auto-submit threshold in a single tick.
- Detectors only attach while `monitoring` is true (toggled by `startMonitoring` / `stopMonitoring`).
- `KeyboardMonitor` uses `{ test(e), type, detail(e) }` records rather than a switch so the `detail` string can interpolate the actual key without evaluating it eagerly during render (which would fail type-checking anyway).
- `CopyPasteBlocker` registers `copy`, `cut`, `paste`, `contextmenu` at the capture phase so the candidate's text editor can't intercept them first.
- `DevToolsDetector` is a 2-second interval that flags a sudden growth in the `outer - inner` window delta (a heuristic for docked DevTools). It compares against the previous reading, not the initial one, so resizing the browser window does not produce false positives.
- All `setState` calls performed inside event handlers are wrapped in `queueMicrotask(...)` (per the `react-hooks/set-state-in-effect` rule and the task spec).

### coding-problems.ts
- 24 problems distributed exactly: Arrays 5, Strings 4, DP 5, Graphs 3, SQL 3, Misc 4.
- Each problem ships exactly 10 test cases (`cases([...])` factory marks the first 3 visible and the remaining 7 hidden).
- Starter code uses `def solution(input):\n    pass\n` for Python and `function solution(input) {\n  // Write your solution here\n}\n` for JS, parameterised by a `starter(fnName)` helper so each problem gets the right function name. SQL problems override the JavaScript slot with the SQL query template.
- `getProblemById(id)` returns `CodingProblem | undefined` — callers should handle undefined defensively.

### proctoring-warning.tsx
- z-index `700` (above dialogs which sit at z-50, above toasts).
- AnimatePresence wraps the whole overlay; the inner card has its own spring entrance.
- Strike 3 swaps the icon to `AlertOctagon`, the tone to rose, hides the "I understand" button, and shows "Go to result" instead. The optional `onAutoSubmit` callback fires on click.
- Strike pips visually reinforce progress (3 horizontal bars filling with the tone color).
- `role="alertdialog"` + `aria-modal="true"` + `aria-labelledby` + `aria-describedby` for screen reader support.

### coding-heatmap.tsx
- Default 12 weeks, 7 rows. The grid is computed once via `useMemo` keyed on `submissions` and `weeks`.
- 5 intensity buckets (`0`, `1-2`, `3-5`, `6`, `7+`) mapped to violet shades.
- "Today" cell is wrapped in a `ring-1 ring-violet-400/70` so the candidate can spot their current day at a glance.
- Mobile-friendly: the grid scrolls horizontally when the viewport cannot fit all weeks.
- Summary line shows "X solved · Y submissions in the last N weeks" so the heatmap is self-explanatory.

### problem-list-table.tsx
- Header row: title + count summary on the left, search input + Random button on the right.
- 6 topic progress cards double as topic filters (click to toggle). Each shows "X/Y solved" + a `Progress` bar. Completed topics get a `CheckCircle2` decoration.
- Topic filter pill row sits below the cards (All + 6 topics). Clicking the active topic again toggles back to "All".
- Difficulty filter row is embedded in the table header so it visually groups with the table.
- Table is a `<ul>` of `<li>` buttons (not `<table>`) so the row remains fully clickable and accessible.
- Status column: `CheckCircle2` (emerald, solved), filled `Circle` (violet, attempted only), or an empty bordered dot (not started).
- Mobile collapses Topic / Difficulty / Acceptance columns into a single sub-title under the row title.
- Acceptance column shows a 16-px wide `Progress` + numeric percentage.

## Lint result

`bun run lint` exits 0 with **0 errors** and **0 warnings** in any of the 6 new files. The 6 warnings that remain are pre-existing `react-hooks/exhaustive-deps` unused-disable-directive warnings in `src/components/screens/candidate/aptitude-test.tsx` and `src/components/screens/candidate/coding-test.tsx` — both untouched by this task.

## Dev server

The dev server was already running before this task and continues to run. The only error visible in `dev.log` is a pre-existing `Module not found: '@/components/screens/candidate/interview-test'` import in `src/app/page.tsx` — out of scope for REBUILD-A. None of my new files contribute any new errors.

## Notes for downstream agents

- The Coding Arena screen (`components/screens/prep/coding.tsx`) currently inlines a single Two Sum problem. With `coding-problems.ts` and `problem-list-table.tsx` restored, a follow-up task can replace the inline data with `<ProblemListTable>` + `getProblemById(id)` to drive the existing editor pane.
- The candidate coding-test screen can now wire up `useProctoring({ mode: "strict", onAutoSubmit })` + `<ProctoringWarning>` + `useFullscreen()` to deliver the full proctored experience. The `useProctoring` hook returns `strikes`, `events`, `isAutoSubmitted`, `totalViolations`, `recordViolation`, `reset`, `startMonitoring`, `stopMonitoring`, `isStrict`, and `monitoring`.
- `captureWebcamFrame(video)` is exported but not yet consumed; a follow-up that records periodic webcam snapshots during strict-mode tests should call it on an interval and upload the returned base64 JPEG.
- All 6 files are stable and ready to be imported. No further changes were made outside the listed paths.
