"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  Download,
  Info,
  Maximize2,
  Mic,
  Play,
  Terminal,
  X,
} from "lucide-react";
import {
  PageWrap,
  SectionHeading,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  requestFullscreen,
  exitFullscreen,
  isCurrentlyFullscreen,
  onFullscreenChange,
} from "@/lib/fullscreen";
import {
  CODING_PROBLEMS,
  getProblemById,
  type CodingProblem,
  type Difficulty,
} from "@/lib/coding-problems";
import { ProblemListTable } from "@/components/shared/problem-list-table";

/**
 * CodingArena
 *
 * Prep-mode coding practice. Splits into two views driven by the
 * `codingView` flag in the global nav store:
 *
 *   - "list"   -> LeetCode-style problem index (ProblemListTable) with a
 *                 submission heatmap, topic progress, and a random-picker.
 *   - "editor" -> VS Code-like split view (problem statement + Monaco-styled
 *                 textarea editor) with fullscreen + navigation lock.
 *
 * Prep mode is forgiving: exiting fullscreen via Esc shows a friendly
 * "Re-enter fullscreen" modal with no penalty. Submissions are recorded
 * to the store so the heatmap and solved/attempted counters update live.
 */

const LANGUAGES = ["Python", "JavaScript"];

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Easy: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  Medium: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  Hard: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

interface TestCaseResult {
  id: number;
  status: "pass" | "fail";
  runtime: string;
  mem: string;
  got?: string;
}

/**
 * Pick a random problem the candidate hasn't solved yet. If everything is
 * solved, fall back to any problem that isn't the one they're currently on.
 */
function pickRandomUnsolved(solvedIds: Set<number>, excludeId?: number): CodingProblem {
  const candidates = CODING_PROBLEMS.filter(
    (p) => !solvedIds.has(p.id) && p.id !== excludeId,
  );
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  const fallback = CODING_PROBLEMS.filter((p) => p.id !== excludeId);
  return fallback[Math.floor(Math.random() * fallback.length)] ?? CODING_PROBLEMS[0];
}

export function CodingArena() {
  const codingView = useNav((s) => s.codingView);
  if (codingView === "list") return <ProblemListView />;
  return <CodingEditorView />;
}

/* -------------------------------------------------------------------------- */
/*  LIST VIEW                                                                 */
/* -------------------------------------------------------------------------- */

function ProblemListView() {
  const solvedProblems = useNav((s) => s.solvedProblems);
  const attemptedProblems = useNav((s) => s.attemptedProblems);
  const submissions = useNav((s) => s.submissions);
  const setCodingView = useNav((s) => s.setCodingView);
  const setCurrentProblem = useNav((s) => s.setCurrentProblem);
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);

  // The store persists solved/attempted IDs as strings (localStorage friendly),
  // but ProblemListTable works with numeric IDs. Convert once per render.
  const solvedNums = useMemo(() => solvedProblems.map((id) => Number(id)), [solvedProblems]);
  const attemptedNums = useMemo(
    () => attemptedProblems.map((id) => Number(id)),
    [attemptedProblems],
  );
  const heatSubs = useMemo(
    () => submissions.map((s) => ({ ...s, problemId: Number(s.problemId) })),
    [submissions],
  );

  const enterProblem = (p: CodingProblem) => {
    setCurrentProblem(String(p.id));
    setCodingView("editor");
    requestFullscreen();
    setNavigationLocked(true);
  };

  const handleRandom = () => {
    const solved = new Set(solvedNums);
    enterProblem(pickRandomUnsolved(solved));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap wide>
        <BackToHome />
        <SectionHeading
          eyebrow="Coding Arena"
          title={
            <>
              Practice with the{" "}
              <span className="text-violet-500 dark:text-violet-400">AI code reviewer</span>
            </>
          }
          description="A VS Code-like editor with syntax highlighting, 10 test cases per problem, real-time execution, and an AI review that scores complexity, readability, and gives refactor suggestions."
          align="left"
        />

        <div className="mt-6">
          <ProblemListTable
            solvedProblems={solvedNums}
            attemptedProblems={attemptedNums}
            submissions={heatSubs}
            onPickProblem={enterProblem}
            onRandomQuestion={handleRandom}
          />
        </div>
      </PageWrap>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EDITOR VIEW (fullscreen + navigation locked)                              */
/* -------------------------------------------------------------------------- */

function CodingEditorView() {
  const set = useNav((s) => s.set);
  const setCodingView = useNav((s) => s.setCodingView);
  const currentProblemId = useNav((s) => s.currentProblemId);
  const solvedProblems = useNav((s) => s.solvedProblems);
  const setCurrentProblem = useNav((s) => s.setCurrentProblem);
  const markSolved = useNav((s) => s.markSolved);
  const markAttempted = useNav((s) => s.markAttempted);
  const recordSubmission = useNav((s) => s.recordSubmission);
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);
  const reduce = useReducedMotion();

  // Resolve the active problem. Default to the first problem if the store
  // doesn't have one yet (e.g. user deep-linked into the editor view).
  const problem = useMemo<CodingProblem>(() => {
    const id = currentProblemId ? Number(currentProblemId) : null;
    if (id !== null) {
      const found = getProblemById(id);
      if (found) return found;
    }
    return CODING_PROBLEMS[0];
  }, [currentProblemId]);

  const [language, setLanguage] = useState<string>("Python");
  // F-29: Per-language code buffers. Each language has its own buffer so
  // switching languages preserves the code written in each. Initialized from
  // the problem's starter code for each language.
  const [codeByLang, setCodeByLang] = useState<Record<string, string>>(() => ({
    Python: problem.starterCode.Python ?? "",
    JavaScript: problem.starterCode.JavaScript ?? "",
  }));
  const code = codeByLang[language] ?? "";
  const [customInput, setCustomInput] = useState<string>(
    problem.testCases[0]?.input ?? "",
  );
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [running, setRunning] = useState(false);
  const [confirmLang, setConfirmLang] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [reenterOpen, setReenterOpen] = useState(false);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [tabSwitches] = useState(1);

  // Reset the editor state whenever the active problem changes (e.g. when the
  // candidate picks "Next Question"). Deferred to a microtask to keep the
  // effect body free of synchronous setState calls.
  useEffect(() => {
    queueMicrotask(() => {
      setLanguage("Python");
      // F-29: Reset per-language buffers for the new problem.
      setCodeByLang({
        Python: problem.starterCode.Python ?? "",
        JavaScript: problem.starterCode.JavaScript ?? "",
      });
      setCustomInput(problem.testCases[0]?.input ?? "");
      setResults(null);
      setSubmitted(false);
    });
  }, [problem]);

  // Fullscreen lifecycle: request on mount, exit on unmount, and listen for
  // the user pressing Esc so we can show a friendly "re-enter" modal. Prep
  // mode is forgiving, so there are no penalties.
  useEffect(() => {
    requestFullscreen();
    queueMicrotask(() => setNavigationLocked(true));
    const unsubscribe = onFullscreenChange(() => {
      if (!isCurrentlyFullscreen()) {
        queueMicrotask(() => {
          setReenterOpen(true);
          setFullscreenExits((n) => n + 1);
        });
      }
    });
    return () => {
      unsubscribe();
      exitFullscreen();
      queueMicrotask(() => setNavigationLocked(false));
    };
  }, [setNavigationLocked]);

  // Autosave simulation. The indicator pulses every 30s to reassure the
  // candidate their work is safe.
  useEffect(() => {
    const t = setInterval(() => {
      queueMicrotask(() => setAutoSaved(true));
      setTimeout(() => queueMicrotask(() => setAutoSaved(false)), 1500);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const onLangChange = (lang: string) => {
    if (lang === language) return;
    setConfirmLang(lang);
  };

  const confirmSwitch = () => {
    if (!confirmLang) return;
    setLanguage(confirmLang);
    // F-29: No longer clears code — each language has its own buffer.
    // If the target language's buffer is empty, initialize from starter code.
    setCodeByLang((prev) => {
      if (prev[confirmLang]) return prev;
      return { ...prev, [confirmLang]: problem.starterCode[confirmLang] ?? "" };
    });
    setResults(null);
    setSubmitted(false);
    setConfirmLang(null);
  };

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      // Mock: 8/10 pass. Cases at index 2 and 7 fail so the candidate sees
      // realistic feedback before submitting.
      setResults(
        problem.testCases.map((tc, i) => ({
          id: tc.id,
          status: i === 2 || i === 7 ? ("fail" as const) : ("pass" as const),
          runtime: `${8 + Math.floor(Math.random() * 12)}ms`,
          mem: "14.0MB",
          got: i === 2 ? "wrong answer" : i === 7 ? "timeout" : undefined,
        })),
      );
    }, 900);
  };

  const submit = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      // Mock: all tests pass on submit (prep mode is forgiving). The failure
      // path below stays in place so the success/attempted branching is real.
      const newResults: TestCaseResult[] = problem.testCases.map((tc) => ({
        id: tc.id,
        status: "pass" as const,
        runtime: `${8 + Math.floor(Math.random() * 12)}ms`,
        mem: "14.0MB",
      }));
      setResults(newResults);
      setSubmitted(true);
      const allPassed = newResults.every((r) => r.status === "pass");
      const idStr = String(problem.id);
      if (allPassed) {
        markSolved(idStr);
        recordSubmission(idStr, true);
        queueMicrotask(() => setSuccessOpen(true));
      } else {
        markAttempted(idStr);
        recordSubmission(idStr, false);
      }
    }, 1400);
  };

  const passCount = results ? results.filter((r) => r.status === "pass").length : 0;

  const handleBack = () => {
    setCodingView("list");
    exitFullscreen();
    setNavigationLocked(false);
  };

  const handleNext = () => {
    const solved = new Set(solvedProblems.map((id) => Number(id)));
    const next = pickRandomUnsolved(solved, problem.id);
    setCurrentProblem(String(next.id));
    setSuccessOpen(false);
  };

  // "Continue to AI Interview" — exits the fullscreen coding editor and
  // navigates to the AI Interview studio. Mirrors the "Continue to Coding"
  // CTA on the aptitude result screen. Offered in the success modal after
  // the candidate solves a problem.
  const continueToInterview = () => {
    setSuccessOpen(false);
    exitFullscreen();
    setNavigationLocked(false);
    set("interview");
  };

  const reenterFullscreen = () => {
    requestFullscreen();
    setReenterOpen(false);
  };

  const difficultyBadge = DIFFICULTY_BADGE[problem.difficulty];
  const fileExt = language === "Python" ? "py" : "js";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap wide>
        {/* Top bar: Back / Title / Next */}
        <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4 dark:border-white/10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problems
          </Button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-3 px-2 text-center">
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
              <span className="font-mono text-muted-foreground">#{problem.id}</span>{" "}
              {problem.title}
            </span>
            <Badge className={cn("shrink-0", difficultyBadge)}>{problem.difficulty}</Badge>
          </div>
          <Button
            size="sm"
            onClick={handleNext}
            className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
          >
            Next Question <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT PANE: problem statement */}
          <div className="flex h-full flex-col rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  <span className="font-mono text-muted-foreground">#{problem.id}</span>{" "}
                  {problem.title}
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Problem #{problem.id} · {problem.topic} · Acceptance{" "}
                  <span className="text-emerald-600 dark:text-emerald-300">{problem.acceptance}%</span>
                </p>
              </div>
              <Badge className={difficultyBadge}>{problem.difficulty}</Badge>
            </div>

            <div className="mt-4 space-y-3 text-sm text-foreground/85">
              <p>{problem.description}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Examples</p>
              <div className="mt-2 space-y-2">
                {problem.examples.map((e, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-black/10 bg-zinc-900 p-3 font-mono text-xs dark:border-white/10"
                  >
                    <p className="text-emerald-300">
                      Input: <span className="text-white/80">{e.input}</span>
                    </p>
                    <p className="mt-1 text-violet-300">
                      Output: <span className="text-white/80">{e.output}</span>
                    </p>
                    {e.explanation && <p className="mt-1 text-zinc-400"># {e.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Constraints</p>
              <ul className="mt-2 space-y-1 font-mono text-xs text-foreground/70">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-5">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Avg solve time: <span className="text-foreground">4m 12s</span> · Acceptance
                rate:{" "}
                <span className="text-emerald-600 dark:text-emerald-300">{problem.acceptance}%</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: editor */}
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-black/10 bg-card shadow-sm dark:border-white/10">
            {/* Editor chrome */}
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-2 dark:border-white/5">
              <span className="font-mono text-xs text-muted-foreground">solution.{fileExt}</span>
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={onLangChange}>
                  <SelectTrigger size="sm" className="w-32 rounded-md border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {autoSaved && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-300">
                    <Check className="mr-0.5 inline h-3 w-3" /> Auto-saved
                  </span>
                )}
              </div>
            </div>

            {/* Editor (textarea styled like Monaco) */}
            <div className="relative bg-zinc-900">
              <div className="flex">
                {/* Line numbers */}
                <div className="select-none border-r border-white/5 px-2 py-3 text-right font-mono text-xs text-white/30">
                  {code.split("\n").map((_, i) => (
                    <div key={i} className="leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCodeByLang((prev) => ({ ...prev, [language]: e.target.value }))}
                  spellCheck={false}
                  className="flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-6 text-emerald-100 outline-none"
                  style={{ minHeight: 280, tabSize: 4 }}
                />
              </div>
            </div>

            {/* Custom input + actions */}
            <div className="border-t border-black/10 p-4 dark:border-white/5">
              <Label2 text="Custom Input" />
              <Textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="mt-1 h-16 rounded-md bg-zinc-900 font-mono text-xs text-emerald-100 border-black/10 dark:border-white/10"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={run}
                  disabled={running}
                  className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {running ? (
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Run
                </Button>
                <Button
                  size="sm"
                  onClick={submit}
                  disabled={running}
                  className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                >
                  {running ? (
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Submit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                  onClick={() => navigator.clipboard?.writeText(code)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>

            {/* Test cases */}
            {results && (
              <div className="border-t border-black/10 p-4 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {submitted ? "Submit Results" : "Run Results"}
                  </p>
                  {submitted && (
                    <Badge className="border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200">
                      {passCount}/{results.length} passed
                    </Badge>
                  )}
                </div>
                <ul className="mt-3 space-y-1.5">
                  {results.map((r) => {
                    const tc = problem.testCases.find((x) => x.id === r.id);
                    return (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded-md border border-black/5 bg-black/[0.02] px-3 py-1.5 text-xs dark:border-white/5 dark:bg-white/[0.02]"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {r.status === "pass" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          ) : (
                            <X className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                          )}
                          <span className="truncate font-mono text-muted-foreground">
                            Case {r.id} {tc?.hidden && <span className="text-[10px]">(hidden)</span>}
                          </span>
                          {r.status === "fail" && (
                            <span className="ml-2 truncate text-rose-600 dark:text-rose-300">
                              Expected {tc?.expected} · Got{" "}
                              <span className="font-mono">{r.got}</span>
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {r.runtime} · {r.mem}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* AI review panel */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-black/10 dark:border-white/5"
                >
                  <AIReview
                    language={language}
                    code={code}
                    passCount={passCount}
                    total={problem.testCases.length}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proctoring footer */}
            <div className="mt-auto border-t border-black/10 px-4 py-2 text-[11px] text-muted-foreground dark:border-white/5">
              <Info className="mr-1 inline h-3 w-3" />
              Tab switches: <span className="text-foreground">{tabSwitches}</span> · Fullscreen
              exits: <span className="text-foreground">{fullscreenExits}</span>. Logged for
              awareness only. No penalties.
            </div>
          </div>
        </div>
      </PageWrap>

      {/* Switch language dialog */}
      <Dialog open={confirmLang !== null} onOpenChange={(o) => !o && setConfirmLang(null)}>
        <DialogContent className="border-black/10 bg-card dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Switch language?</DialogTitle>
            <DialogDescription>
              Switching to <strong className="text-foreground">{confirmLang}</strong> will clear
              your current code. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmLang(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSwitch}
              className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              Switch &amp; Clear Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success modal: all tests passed */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="border-emerald-400/30 bg-card dark:border-emerald-400/20">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-center">Accepted</DialogTitle>
            <DialogDescription className="text-center">
              All {problem.testCases.length} test cases passed. Problem{" "}
              <span className="font-medium text-foreground">#{problem.id} {problem.title}</span>{" "}
              is now marked as solved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problems
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Next Question <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={continueToInterview}
              className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              <Mic className="mr-2 h-4 w-4" /> Continue to AI Interview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-enter fullscreen modal (Esc exit, no penalty) */}
      <Dialog open={reenterOpen} onOpenChange={setReenterOpen}>
        <DialogContent className="border-amber-400/30 bg-card dark:border-amber-400/20">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-amber-500/15">
              <Maximize2 className="h-8 w-8 text-amber-500" />
            </div>
            <DialogTitle className="text-center">Re-enter fullscreen</DialogTitle>
            <DialogDescription className="text-center">
              You pressed Esc and left fullscreen mode. Re-enter to keep practicing. Prep mode
              is forgiving, so there are no penalties.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-center">
            <Button
              onClick={reenterFullscreen}
              className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              <Maximize2 className="mr-2 h-4 w-4" /> Re-enter Fullscreen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Label2({ text }: { text: string }) {
  return <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{text}</p>;
}

function AIReview({
  language,
  code,
  passCount,
  total,
}: {
  language: string;
  code: string;
  passCount: number;
  total: number;
}) {
  const [showRefactor, setShowRefactor] = useState(false);
  const overall = passCount === total ? 92 : passCount >= total - 2 ? 85 : 72;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <Code2 className="h-4 w-4 text-violet-500 dark:text-violet-400" />
        <p className="text-sm font-medium">AI Code Review</p>
        <Badge className="border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200">
          Gemini 1.5 Flash · {language}
        </Badge>
      </div>

      <div className="mt-3 rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Overall Score</p>
          <p className="text-xl font-semibold text-violet-500 dark:text-violet-300">
            {overall}/100
          </p>
        </div>
        <Progress value={overall} className="mt-2 bg-black/10 dark:bg-white/10" />
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <SubScore label="Correctness" value={Math.round((passCount / total) * 100)} />
          <SubScore label="Code Quality" value={90} />
          <SubScore label="Readability" value={85} />
          <SubScore label="Complexity" value={95} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
            <Check className="h-3 w-3" /> Time: O(n) · Optimal
          </Badge>
          <Badge className="border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200">
            <Terminal className="h-3 w-3" /> Space: O(n)
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.04] p-4">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Strengths</p>
          <ul className="mt-2 space-y-1.5 text-xs text-foreground/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> Clean,
              descriptive variable naming.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> Single pass
              O(n). No nested loop. Optimal.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> Handles edge
              case where no solution exists.
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-amber-400/20 bg-amber-500/[0.04] p-4">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Suggestions</p>
          <ul className="mt-2 space-y-1.5 text-xs text-foreground/80">
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" /> Add a docstring
              explaining parameters and return type.
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" /> Type hints
              missing. Add explicit parameter and return types.
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" /> Raise an
              exception instead of returning empty when no pair found.
            </li>
          </ul>
        </div>
      </div>

      <Collapsible open={showRefactor} onOpenChange={setShowRefactor} className="mt-4">
        <div className="rounded-lg border border-black/10 bg-card dark:border-white/10">
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <span className="text-sm font-medium">Refactored Snippet</span>
              <Badge
                variant="outline"
                className="border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/5"
              >
                AI-generated
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showRefactor && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-black/10 bg-zinc-900 p-4 dark:border-white/5">
              <pre className="overflow-x-auto whitespace-pre font-mono text-xs text-emerald-100">
{code}
              </pre>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                  onClick={() => navigator.clipboard?.writeText(code)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Refactor
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                >
                  <Download className="h-3.5 w-3.5" /> Export Snippet
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Progress value={value} className="bg-black/10 dark:bg-white/10" />
        <span className="font-mono text-[11px] font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}
