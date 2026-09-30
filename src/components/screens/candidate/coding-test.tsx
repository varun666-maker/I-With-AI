"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  ListChecks,
  Play,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import { requestFullscreen, exitFullscreen } from "@/lib/fullscreen";
import { useProctoring } from "@/lib/proctoring";
import { ProctoringWarning } from "@/components/shared/proctoring-warning";

interface TestCase {
  id: number;
  input: string;
  expected: string;
  hidden?: boolean;
}

interface Problem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  starterCode: Record<string, string>;
  tests: TestCase[];
}

const PROBLEMS: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.",
    starterCode: {
      Python: "def two_sum(nums, target):\n    # your code here\n    pass\n",
      JavaScript: "function twoSum(nums, target) {\n  // your code here\n}\n",
    },
    tests: [
      { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
      { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
      { id: 3, input: "nums = [3,3], target = 6", expected: "[0,1]", hidden: true },
    ],
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Medium",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if open brackets are closed by the same type and in the correct order.",
    starterCode: {
      Python: "def is_valid(s):\n    # your code here\n    pass\n",
      JavaScript: "function isValid(s) {\n  // your code here\n}\n",
    },
    tests: [
      { id: 1, input: 's = "()"', expected: "true" },
      { id: 2, input: 's = "()[]{}"', expected: "true" },
      { id: 3, input: 's = "(]"', expected: "false", hidden: true },
    ],
  },
  {
    id: 3,
    title: "Binary Tree Level Order",
    difficulty: "Hard",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    starterCode: {
      Python: "def level_order(root):\n    # your code here\n    pass\n",
      JavaScript: "function levelOrder(root) {\n  // your code here\n}\n",
    },
    tests: [
      { id: 1, input: "root = [3,9,20,null,null,15,7]", expected: "[[3],[9,20],[15,7]]" },
      { id: 2, input: "root = [1]", expected: "[[1]]" },
      { id: 3, input: "root = []", expected: "[]", hidden: true },
    ],
  },
];

/**
 * Fisher-Yates shuffle. Returns a new array (does not mutate the input).
 * Used to randomize the order of problems each candidate sees, so the
 * first problem shown when entering the coding test is random.
 */
function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const LANGUAGES = ["Python", "JavaScript"];
const TEST_DURATION_SEC = 60 * 60;

type ProblemStatus = "unsolved" | "attempted" | "solved";
interface ProblemState {
  code: Record<string, string>;
  results: TestCaseResult[] | null;
  submitted: boolean;
  running: boolean;
}
interface TestCaseResult {
  id: number;
  status: "pass" | "fail";
  runtime: string;
  got?: string;
}

const emptyState = (problem: Problem): ProblemState => ({
  code: { ...problem.starterCode },
  results: null,
  submitted: false,
  running: false,
});

export function CandidateCodingTest() {
  const reduce = useReducedMotion();
  const set = useNav((s) => s.set);
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);

  const proctor = useProctoring({ mode: "strict" });
  const proctorRef = useRef(proctor);
  useEffect(() => {
    proctorRef.current = proctor;
  });

  const [language, setLanguage] = useState<string>("Python");
  // Shuffle the problem order ONCE on mount so each candidate starts on a
  // random question. The candidate still sees all problems in the sidebar;
  // only the order (and thus the first problem shown) is randomized.
  const [problems] = useState<Problem[]>(() => shuffle(PROBLEMS));
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SEC);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [states, setStates] = useState<Record<number, ProblemState>>(() => {
    const init: Record<number, ProblemState> = {};
    for (const p of problems) init[p.id] = emptyState(p);
    return init;
  });

  // Lock + fullscreen + start monitoring on mount
  useEffect(() => {
    setNavigationLocked(true);
    requestFullscreen();
    proctorRef.current.startMonitoring();
    return () => {
      proctorRef.current.stopMonitoring();
    };
     
  }, []);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          queueMicrotask(() => setAutoSubmitted(true));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-submit via proctor
  useEffect(() => {
    if (proctor.isAutoSubmitted) {
      queueMicrotask(() => setAutoSubmitted(true));
    }
  }, [proctor.isAutoSubmitted]);

  // Strike 3 -> navigate
  useEffect(() => {
    if (proctor.strikes >= 3) {
      const t = setTimeout(() => {
        exitFullscreen();
        setNavigationLocked(false);
        proctorRef.current.stopMonitoring();
        set("candidate-coding-result");
      }, 1500);
      return () => clearTimeout(t);
    }
     
  }, [proctor.strikes]);

  // Auto-submit -> navigate
  useEffect(() => {
    if (autoSubmitted) {
      const t = setTimeout(() => {
        exitFullscreen();
        setNavigationLocked(false);
        proctorRef.current.stopMonitoring();
        set("candidate-coding-result");
      }, 1200);
      return () => clearTimeout(t);
    }
     
  }, [autoSubmitted]);

  const handleSubmitRound = () => {
    exitFullscreen();
    setNavigationLocked(false);
    proctorRef.current.stopMonitoring();
    setSubmitOpen(false);
    set("candidate-coding-result");
  };

  const active = problems[activeIdx];
  const activeState = states[active.id];

  const setCode = (code: string) => {
    setStates((p) => ({
      ...p,
      [active.id]: { ...p[active.id], code: { ...p[active.id].code, [language]: code } },
    }));
  };

  const runTests = () => {
    setStates((p) => ({ ...p, [active.id]: { ...p[active.id], running: true } }));
    setTimeout(() => {
      const results: TestCaseResult[] = active.tests.map((tc, i) => ({
        id: tc.id,
        status: (i === 2 ? "fail" : "pass") as "pass" | "fail",
        runtime: `${8 + Math.floor(Math.random() * 12)}ms`,
        got: i === 2 ? "wrong answer" : undefined,
      }));
      setStates((p) => ({
        ...p,
        [active.id]: { ...p[active.id], running: false, results },
      }));
    }, 900);
  };

  const submitProblem = () => {
    setStates((p) => ({ ...p, [active.id]: { ...p[active.id], running: true } }));
    setTimeout(() => {
      const results: TestCaseResult[] = active.tests.map((tc, i) => ({
        id: tc.id,
        status: (i === 2 ? "fail" : "pass") as "pass" | "fail",
        runtime: `${8 + Math.floor(Math.random() * 12)}ms`,
        got: i === 2 ? "wrong answer" : undefined,
      }));
      setStates((p) => ({
        ...p,
        [active.id]: { ...p[active.id], running: false, results, submitted: true },
      }));
    }, 1200);
  };

  // Status per problem
  const problemStatus = (p: Problem): ProblemStatus => {
    const s = states[p.id];
    if (s.submitted && s.results && s.results.every((r) => r.status === "pass")) return "solved";
    if (s.results || s.submitted) return "attempted";
    return "unsolved";
  };

  const solvedCount = problems.filter((p) => problemStatus(p) === "solved").length;
  const attemptedCount = problems.filter((p) => problemStatus(p) === "attempted").length;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const lowTime = timeLeft < 300;

  const integrity =
    proctor.strikes === 0
      ? { label: "Clean", tone: "text-emerald-600 dark:text-emerald-300" }
      : proctor.strikes < 3
        ? { label: "Flags", tone: "text-amber-600 dark:text-amber-300" }
        : { label: "Penalty", tone: "text-rose-600 dark:text-rose-300" };

  const tabSwitches = proctor.events.filter((e) => e.type === "tab-switch" || e.type === "visibility-change").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-[1400px] px-4 pb-32 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Badge variant="outline" className="mb-2 rounded-full border-amber-400/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
              <ShieldAlert className="mr-1 h-3 w-3" />
              Strict Proctoring
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Round 2 <span className="text-violet-500 dark:text-violet-400">Coding Test</span>
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {problems.length} problems · 60 minutes · one submission per problem
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-lg font-semibold tabular-nums sm:text-2xl",
            lowTime
              ? "border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-300"
              : "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
          )}>
            <Clock className="h-4 w-4" />
            {pad(mins)}:{pad(secs)}
          </div>
        </motion.div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
          {/* Sidebar: problem list */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-black/10 bg-card p-4 shadow-sm dark:border-white/10">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" />
                Problems
              </div>
              <ul className="space-y-1.5">
                {problems.map((p, i) => {
                  const status = problemStatus(p);
                  const isActive = i === activeIdx;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => setActiveIdx(i)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-black/10 bg-black/[0.02] hover:border-violet-400/40 dark:border-white/10 dark:bg-white/[0.02]",
                        )}
                      >
                        <span className={cn(
                          "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                          status === "solved"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : status === "attempted"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                              : "bg-black/5 text-muted-foreground dark:bg-white/10",
                        )}>
                          {status === "solved" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : status === "attempted" ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate text-sm", isActive ? "font-semibold" : "font-medium")}>
                            {p.title}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {status === "solved" ? "Solved" : status === "attempted" ? "Attempted" : "Unsolved"} · {p.difficulty}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Separator className="my-3 bg-black/5 dark:bg-white/5" />
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div>
                  <p className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-300">{solvedCount}</p>
                  <p className="uppercase tracking-wider text-muted-foreground">Solved</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-300">{attemptedCount}</p>
                  <p className="uppercase tracking-wider text-muted-foreground">Attempted</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold text-muted-foreground">{problems.length - solvedCount - attemptedCount}</p>
                  <p className="uppercase tracking-wider text-muted-foreground">Unsolved</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setSubmitOpen(true)}
              className="w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Submit Round
            </Button>
          </aside>

          {/* Right: problem statement + editor + tests */}
          <div className="space-y-5">
            {/* Problem statement */}
            <motion.div
              key={active.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg border border-black/10 bg-card p-5 shadow-sm sm:p-6 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">
                  <span className="font-mono text-muted-foreground">#{active.id}</span> {active.title}
                </h2>
                <Badge className={cn(
                  "border",
                  active.difficulty === "Easy"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : active.difficulty === "Medium"
                      ? "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                )}>
                  {active.difficulty}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-foreground/85">
                {active.description}
              </p>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Examples</p>
                <div className="mt-2 space-y-2">
                  {active.tests.filter((t) => !t.hidden).map((tc) => (
                    <div key={tc.id} className="rounded-md border border-black/10 bg-zinc-900 p-3 font-mono text-xs dark:border-white/10">
                      <p className="text-emerald-300">Input: <span className="text-white/80">{tc.input}</span></p>
                      <p className="mt-1 text-violet-300">Output: <span className="text-white/80">{tc.expected}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Editor */}
            <div className="overflow-hidden rounded-lg border border-black/10 bg-card shadow-sm dark:border-white/10">
              {/* Editor chrome */}
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-2 dark:border-white/5">
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Terminal className="h-3 w-3" />
                  solution.{language === "Python" ? "py" : "js"}
                </span>
                <div className="flex items-center gap-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger size="sm" className="w-32 rounded-md border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Code area */}
              <div className="relative bg-zinc-900">
                <div className="flex">
                  <div className="select-none border-r border-white/5 px-2 py-3 text-right font-mono text-xs text-white/30">
                    {(activeState.code[language] ?? "").split("\n").map((_, i) => (
                      <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={activeState.code[language] ?? ""}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    disabled={activeState.submitted}
                    className="flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-6 text-emerald-100 outline-none disabled:opacity-60"
                    style={{ minHeight: 240, tabSize: 4 }}
                  />
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-2 border-t border-black/10 p-4 dark:border-white/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runTests}
                  disabled={activeState.running}
                  className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {activeState.running ? <Clock className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
                  Run Tests
                </Button>
                <Button
                  size="sm"
                  onClick={submitProblem}
                  disabled={activeState.running || activeState.submitted}
                  className="rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
                >
                  {activeState.submitted ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <Code2 className="mr-1.5 h-4 w-4" />}
                  {activeState.submitted ? "Submitted" : "Submit"}
                </Button>
                {activeState.submitted && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-300">
                    Submitted. No retry allowed.
                  </span>
                )}
              </div>

              {/* Test results */}
              {activeState.results && (
                <div className="border-t border-black/10 p-4 dark:border-white/5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Test Results</p>
                    <span className={cn(
                      "text-xs font-semibold",
                      activeState.results.every((r) => r.status === "pass")
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-rose-600 dark:text-rose-300",
                    )}>
                      {activeState.results.filter((r) => r.status === "pass").length}/{activeState.results.length} passed
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {activeState.results.map((r) => {
                      const tc = active.tests.find((t) => t.id === r.id);
                      return (
                        <li
                          key={r.id}
                          className={cn(
                            "flex items-center gap-3 rounded-md border px-3 py-2 text-xs",
                            r.status === "pass"
                              ? "border-emerald-400/30 bg-emerald-500/5"
                              : "border-rose-400/30 bg-rose-500/5",
                          )}
                        >
                          {r.status === "pass" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-500" />
                          )}
                          <span className="flex-1 font-mono text-foreground/80">
                            Case {r.id}{tc?.hidden ? " (hidden)" : ""}: {tc?.input}
                          </span>
                          <span className="font-mono text-muted-foreground">{r.runtime}</span>
                          {r.got && <span className="font-mono text-rose-600 dark:text-rose-300">got: {r.got}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Problem navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous Problem
              </Button>
              <span className="text-xs text-muted-foreground">
                Problem {activeIdx + 1} of {problems.length}
              </span>
              {activeIdx === problems.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setSubmitOpen(true)}
                  className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                >
                  Submit Round
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setActiveIdx((i) => Math.min(problems.length - 1, i + 1))}
                  className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                >
                  Next Problem
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Proctoring footer */}
        <div className="mt-6 flex flex-col items-start justify-between gap-2 rounded-lg border border-black/10 bg-card px-4 py-3 text-xs shadow-sm sm:flex-row sm:items-center dark:border-white/10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <span>Tab switches: <span className="font-semibold text-foreground">{tabSwitches}</span></span>
            <span>Strikes: <span className="font-semibold text-foreground">{proctor.strikes}/3</span></span>
            <span className="flex items-center gap-1">
              Integrity:
              <span className={cn("flex items-center gap-1 font-semibold", integrity.tone)}>
                {proctor.strikes === 0 ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {integrity.label}
              </span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Each problem allows one submission. Three strikes will auto-submit your round.
          </p>
        </div>
      </section>

      {/* Strike warning */}
      <ProctoringWarning
        open={proctor.strikes > 0 && proctor.strikes < 3}
        strikeNumber={proctor.strikes}
        violationType={proctor.events[proctor.events.length - 1]?.type ?? "tab-switch"}
        onAcknowledge={() => proctor.reset()}
        onAutoSubmit={() => setAutoSubmitted(true)}
      />

      {/* Submit round confirmation */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="border-black/10 bg-card dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Submit the coding round?</DialogTitle>
            <DialogDescription>
              You have solved {solvedCount} of {problems.length} problems and attempted {attemptedCount}.
              This action cannot be undone. All unsaved progress on unsubmitted problems will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setSubmitOpen(false)} className="rounded-full">
              Keep Going
            </Button>
            <Button
              onClick={handleSubmitRound}
              className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Submit Round
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-submit overlay */}
      <AnimatePresence>
        {autoSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={reduce ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-4 max-w-sm rounded-lg border border-black/10 bg-card p-6 text-center shadow-lg dark:border-white/10"
            >
              {proctor.strikes >= 3 ? (
                <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
              ) : (
                <XCircle className="mx-auto h-10 w-10 text-amber-500" />
              )}
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {proctor.strikes >= 3 ? "Auto-submitted" : "Time up"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {proctor.strikes >= 3
                  ? "Three proctoring strikes. Your round has been submitted automatically."
                  : "The 60-minute timer has elapsed. Submitting your round now."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
