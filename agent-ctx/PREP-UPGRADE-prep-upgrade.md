## Task ID: PREP-UPGRADE · Agent: prep-upgrade

**Task:** Upgrade 3 prep-mode screen files (coding, aptitude, interview) to add
fullscreen + coding arena LeetCode-style split. These files were restored from
git but had lost the Stream B upgrades (fullscreen lifecycle, navigation lock,
ProblemListTable integration, re-enter-fullscreen modal).

### Reference files read first
- `src/lib/fullscreen.ts` — confirmed exports: `requestFullscreen`,
  `exitFullscreen`, `isCurrentlyFullscreen`, `onFullscreenChange`, `useFullscreen`.
  All SSR-safe (no-op when `document` is undefined). The `useFullscreen` hook
  defers its initial `setIsFullscreen` to a `queueMicrotask` to avoid the
  set-state-in-effect lint rule.
- `src/lib/store.ts` — confirmed the coding-arena state on `NavState`:
  `codingView: "list" | "editor"`, `currentProblemId: string | null`,
  `solvedProblems: string[]`, `attemptedProblems: string[]`,
  `submissions: { problemId: string; timestamp: number; passed: boolean }[]`,
  plus the actions `setCodingView`, `setCurrentProblem`, `markSolved`,
  `markAttempted`, `recordSubmission`, `resetCodingProgress`. Also confirmed
  `navigationLocked` + `setNavigationLocked` for the proctoring lock that
  hides TopNav/FlowNav during a test.
- `src/lib/coding-problems.ts` — confirmed 24 problems across 6 topics.
  Each `CodingProblem` has `{ id: number; title; difficulty; topic; description;
  examples; constraints; testCases; functionSignature; starterCode: {Python,
  JavaScript}; acceptance }`. `getProblemById(id: number)` returns
  `CodingProblem | undefined`. The store persists IDs as strings, so the
  editor view converts via `Number(currentProblemId)`.
- `src/components/shared/problem-list-table.tsx` — confirmed the
  `ProblemListTable` props: `solvedProblems: number[]`,
  `attemptedProblems: number[]`, `submissions: HeatmapSubmission[]` (where
  `HeatmapSubmission.problemId` is `number`), `onPickProblem: (p:
  CodingProblem) => void`, `onRandomQuestion: () => void`. The store uses
  string IDs, so the list view converts via `.map(Number)` before passing.
- `src/components/shared/coding-heatmap.tsx` — confirmed
  `HeatmapSubmission = { problemId: number; timestamp: number; passed: boolean }`.
- `src/components/screens/candidate/coding-test.tsx` — borrowed the fullscreen
  lifecycle pattern: `useEffect` on mount calls `requestFullscreen()` +
  `setNavigationLocked(true)`; cleanup calls `exitFullscreen()` +
  `setNavigationLocked(false)`. Confirmed the `queueMicrotask` convention for
  setState inside useEffect bodies.
- `src/components/shared/flow-nav.tsx` — confirmed FlowNav returns `null` when
  `navigationLocked === true`, so setting the lock during a fullscreen test
  automatically hides the bottom nav CTA.

### Files modified (3)

#### 1. `src/components/screens/prep/coding.tsx` (MAJOR UPGRADE)

Split `CodingArena` into two views driven by `useNav(s => s.codingView)`:

- **`ProblemListView`** (view "list", NOT fullscreen):
  - Renders `<ProblemListTable>` with props from the store. The store persists
    IDs as strings (localStorage-friendly), but the table works with numbers,
    so the view converts via `useMemo(() => solvedProblems.map(Number), [...])`
    for `solvedProblems`, `attemptedProblems`, and `submissions`.
  - `onPickProblem={(p) => { setCurrentProblem(String(p.id));
    setCodingView("editor"); requestFullscreen(); setNavigationLocked(true); }}`.
  - `onRandomQuestion` picks a random unsolved problem via
    `pickRandomUnsolved(solvedSet)` (falls back to any non-current problem if
    all are solved), then calls `enterProblem`.
  - Wrapped in `<div className="min-h-screen bg-background text-foreground">`
    with `<PageWrap wide>` + `<BackToHome />` + `<SectionHeading>`.

- **`CodingEditorView`** (view "editor", fullscreen + navigation locked):
  - Resolves the active problem via `getProblemById(Number(currentProblemId))`,
    defaulting to `CODING_PROBLEMS[0]` if not found.
  - **Top bar (NEW):** "Back to Problems" outline button (left) + problem
    title + difficulty badge (center) + "Next Question" violet button (right).
    - Back → `setCodingView("list") + exitFullscreen() +
      setNavigationLocked(false)`.
    - Next → `pickRandomUnsolved(solvedSet, problem.id)` +
      `setCurrentProblem(String(next.id))`.
  - **Fullscreen lifecycle** (useEffect, deps `[setNavigationLocked]`):
    - Mount: `requestFullscreen()` + `queueMicrotask(() =>
      setNavigationLocked(true))`.
    - Subscribes to `onFullscreenChange`; if `!isCurrentlyFullscreen()`, opens
      the re-enter modal and increments `fullscreenExits`.
    - Cleanup: `unsubscribe() + exitFullscreen() + queueMicrotask(() =>
      setNavigationLocked(false))`.
  - **Problem change reset** (useEffect, deps `[problem]`): resets `language`
    to Python, `code` to `problem.starterCode.Python`, `customInput` to the
    first test case input, and clears `results`/`submitted`. All setState
    calls are wrapped in `queueMicrotask`.
  - **Autosave simulation** (useEffect, empty deps): 30s interval pulses the
    "Auto-saved" indicator. setState wrapped in `queueMicrotask`.
  - **LEFT PANE:** problem statement driven by `problem.description`,
    `problem.examples`, `problem.constraints`, `problem.acceptance`.
  - **RIGHT PANE:** editor chrome (`solution.py`/`solution.js`), language
    dropdown (Python/JavaScript only, since `starterCode` only ships those),
    Monaco-styled textarea with line numbers, custom input, Run/Submit/Copy
    buttons, test-case results, AI review panel, proctoring footer showing
    live `tabSwitches`/`fullscreenExits` counts.
  - **Run:** simulates 8/10 pass (cases at index 2 and 7 fail) so the
    candidate sees realistic feedback.
  - **Submit:** simulates all tests passing (prep mode is forgiving). On
    success: `markSolved(String(problem.id))` +
    `recordSubmission(String(problem.id), true)` + opens the success modal.
    The failure branch (`markAttempted` + `recordSubmission(false)`) is in
    place but not exercised by the mock.
  - **Success modal:** emerald-themed Dialog with CheckCircle2 icon,
    "Accepted" title, "Back to Problems" + "Next Question" buttons.
  - **Re-enter fullscreen modal:** amber-themed Dialog with Maximize2 icon,
    "Re-enter fullscreen" title, "Re-enter Fullscreen" button that calls
    `requestFullscreen()` + closes the modal. No penalties.
  - Kept the `AIReview` and `SubScore` helper components; the refactor
    snippet now shows the candidate's actual `code` instead of a hardcoded
    Two Sum string.

#### 2. `src/components/screens/prep/aptitude.tsx` (ADD FULLSCREEN)

Added fullscreen lifecycle + optional device toggles + re-enter modal:

- **Rules sub-screen:**
  - Added a "Optional devices" card with two shadcn `Switch` toggles:
    "Microphone" and "Camera", both default off. Each toggle has an icon
    (Mic/Camera), label, and live status text ("Enabled"/"Off"). Prep mode
    never penalises device failures.
  - "Start Test" button onClick now calls `requestFullscreen() +
    setNavigationLocked(true) + setPhase("test")` (previously just
    `setPhase("test")`).
- **Test sub-screen:**
  - Added a useEffect (deps `[phase]`) that only runs when `phase === "test"`:
    subscribes to `onFullscreenChange`. If `!isCurrentlyFullscreen()`, opens
    the re-enter modal and increments `fullscreenExits`. Cleanup unsubscribes
    on phase change.
  - "Submit Now" button (in the confirmation dialog) onClick now calls
    `exitFullscreen() + setNavigationLocked(false) + setPhase("results")`
    (previously just `setPhase("results")`).
- **Results sub-screen:**
  - No changes needed; the submit handler already exits fullscreen and
    releases the lock. "Take Again" returns to rules (unlimited retakes).
- **Re-enter fullscreen modal:** amber-themed Dialog with Maximize2 icon,
  rendered at the top level (outside AnimatePresence) so it's always
  available. "Re-enter Fullscreen" button calls `requestFullscreen()` +
  closes the modal.
- Applied `useReducedMotion` to all 3 phase transition `motion.div`s:
  `initial={reduce ? false : ...}` and `exit={reduce ? undefined : ...}`.
  Using `undefined` (not `false`) for `exit` avoids the TypeScript error
  seen in the candidate screens (`Type 'false' is not assignable to
  'TargetAndTransition | VariantLabels | undefined'`).

#### 3. `src/components/screens/prep/interview.tsx` (ADD FULLSCREEN)

Added fullscreen lifecycle + re-enter modal:

- **Setup sub-screen:**
  - Kept existing mic/camera system check (both mandatory; "Begin Interview"
    disabled until both pass).
  - "Begin Interview" button onClick now calls `requestFullscreen() +
    setNavigationLocked(true) + setSub("live")` (previously just
    `setSub("live")`).
- **Live sub-screen:**
  - Added a useEffect (deps `[sub]`) that only runs when `sub === "live"`:
    subscribes to `onFullscreenChange`. If `!isCurrentlyFullscreen()`, opens
    the re-enter modal. Cleanup unsubscribes on sub change.
  - "End Interview" button (in the End Early confirmation dialog) onClick now
    calls `exitFullscreen() + setNavigationLocked(false) + setSub("processing")`
    (previously just `setSub("processing")`).
- **Processing sub-screen:**
  - Added a useEffect (deps `[sub, setNavigationLocked]`) that runs when
    `sub === "processing"`: calls `exitFullscreen()` +
    `queueMicrotask(() => setNavigationLocked(false))`. Idempotent with the
    End Interview handler. Ensures FlowNav re-appears during processing.
- **Done sub-screen:** normal mode, FlowNav visible. "Go to Dashboard"
  button unchanged.
- **Re-enter fullscreen modal:** amber-themed Dialog with Maximize2 icon,
  rendered at the top level. "Re-enter Fullscreen" button calls
  `requestFullscreen()` + closes the modal.
- Applied `useReducedMotion` to all 4 sub-screen `motion.div`s.

### Critical implementation rules honored
- **Fullscreen imports:** all 3 files import `requestFullscreen`,
  `exitFullscreen`, `isCurrentlyFullscreen`, `onFullscreenChange` from
  `@/lib/fullscreen`.
- **Navigation lock:** all 3 files read `setNavigationLocked` from
  `@/lib/store` via `useNav((s) => s.setNavigationLocked)`.
- **useEffect for fullscreen entry/exit:** no direct `requestFullscreen()`/
  `exitFullscreen()` calls in render bodies. Entry is in click handlers
  (Start Test / Begin Interview / pick problem) or useEffect (coding editor
  mount). Exit is in click handlers (Submit / End Interview / Back) or
  useEffect cleanup (coding editor unmount) or useEffect entry (interview
  processing).
- **queueMicrotask for setState in useEffect:** every setState call inside a
  useEffect body (or inside a listener registered by useEffect) is wrapped
  in `queueMicrotask(() => ...)`. This includes `setNavigationLocked`,
  `setReenterOpen`, `setFullscreenExits`, `setAutoSaved`, and the editor
  state resets.
- **useReducedMotion:** all 3 files import and use `useReducedMotion` from
  framer-motion to gate entrance/exit animations.
- **No emojis, no em dashes:** verified via `grep "—"` (empty) and unicode
  emoji grep (empty) across all 3 files.
- **All existing functionality preserved:** Monaco-styled editor, language
  dropdown, Run/Submit, test cases, AI review panel (coding); 25 MCQs,
  question navigator, bookmark, countdown, category breakdown, wrong-answer
  explanations (aptitude); 6 interview types, mic/cam system check,
  AvatarBlock, Waveform, AnalysisIndicators, live transcript, MicToggle,
  ConicSpinner processing, done stats (interview).
- **Named exports kept:** `CodingArena`, `AptitudePortal`, `InterviewStudio`.
- **No files outside `src/components/screens/prep/` were modified.**

### Verification
- `bun run lint` → **0 errors, 0 warnings**. Exit code 0.
- `npx tsc --noEmit --skipLibCheck` → no type errors in the 3 prep files
  (pre-existing errors in candidate screens and examples are unrelated and
  out of scope).
- `grep -c "codingView\|ProblemListTable\|requestFullscreen\|exitFullscreen\|setNavigationLocked" src/components/screens/prep/coding.tsx` → **21** (> 0).
- `grep -c "requestFullscreen\|exitFullscreen\|setNavigationLocked" src/components/screens/prep/aptitude.tsx` → **8** (> 0).
- `grep -c "requestFullscreen\|exitFullscreen\|setNavigationLocked" src/components/screens/prep/interview.tsx` → **11** (> 0).
- Named exports verified:
  `grep "^export function CodingArena" prep/coding.tsx` → line 114.
  `grep "^export function AptitudePortal" prep/aptitude.tsx` → line 102.
  `grep "^export function InterviewStudio" prep/interview.tsx` → line 83.
- Dev server (`bun run dev`) recompiled cleanly after each edit. Latest
  `dev.log` entries show `✓ Compiled in 209ms` with no errors.

### Notes for downstream agents
- The coding editor's `submit()` mock always simulates all tests passing
  (prep mode is forgiving). The failure branch (`markAttempted` +
  `recordSubmission(false)`) is in place but not exercised. To demo the
  failure path, swap the mock to reintroduce the index-2/index-7 failures
  from `run()`.
- The `pickRandomUnsolved` helper excludes the current problem and all
  solved problems. If every problem is solved, it falls back to any
  non-current problem, so "Next Question" never gets stuck.
- The aptitude mic/cam toggles are purely cosmetic state (`micEnabled` /
  `camEnabled`). They don't wire into any real device API; they just signal
  intent for a future proctoring integration.
- The re-enter fullscreen modals in aptitude + interview use the same amber
  theme and copy pattern. If a future agent wants a shared component, the
  `ProctoringWarning` in `src/components/shared/proctoring-warning.tsx` is
  strike-based and not a good fit (prep mode has no strikes); a new
  `ReenterFullscreenModal` shared component would be cleaner.
- The interview processing useEffect calls `exitFullscreen()` +
  `setNavigationLocked(false)` on entry. This is idempotent with the End
  Interview click handler which does the same. Both run; no harm.
