"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import { exitFullscreen, requestFullscreen } from "@/lib/fullscreen";

const SCORE = 81;
const QUALIFYING_SOLVED = 2;

interface ProblemResult {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "solved" | "failed";
  testsPassed: number;
  testsTotal: number;
  weight: number;
}

const RESULTS: ProblemResult[] = [
  { id: 1, title: "Two Sum", difficulty: "Easy", status: "solved", testsPassed: 3, testsTotal: 3, weight: 25 },
  { id: 2, title: "Valid Parentheses", difficulty: "Medium", status: "solved", testsPassed: 3, testsTotal: 3, weight: 30 },
  { id: 3, title: "Binary Tree Level Order", difficulty: "Hard", status: "failed", testsPassed: 1, testsTotal: 3, weight: 45 },
];

const solvedCount = RESULTS.filter((r) => r.status === "solved").length;
const qualified = solvedCount >= QUALIFYING_SOLVED;

export function CandidateCodingResult() {
  const reduce = useReducedMotion();
  const set = useNav((s) => s.set);
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);

  useEffect(() => {
    exitFullscreen();
    setNavigationLocked(false);
  }, [setNavigationLocked]);

  const continueToInterview = () => {
    requestFullscreen();
    setNavigationLocked(true);
    set("candidate-interview");
  };

  const exitToLanding = () => {
    set("landing");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Badge variant="outline" className={cn(
            "rounded-full px-3 py-1",
            qualified
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
          )}>
            {qualified ? "Round 2 Complete · Passed" : "Round 2 Complete · Did Not Qualify"}
          </Badge>
        </motion.div>

        <motion.div
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
          className={cn(
            "mt-6 grid h-20 w-20 place-items-center rounded-full ring-1 ring-inset",
            qualified
              ? "bg-emerald-500/15 text-emerald-600 ring-emerald-400/30 dark:text-emerald-300"
              : "bg-rose-500/15 text-rose-600 ring-rose-400/30 dark:text-rose-300",
          )}
        >
          {qualified ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-5 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Coding: <span className="text-violet-500 dark:text-violet-400">{SCORE}/100</span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-3 text-center text-sm text-muted-foreground sm:text-base"
        >
          {qualified
            ? "You qualified for the Interview round."
            : "You did not meet the qualifying criteria."}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-8 w-full rounded-lg border border-black/10 bg-card p-6 shadow-sm sm:p-8 dark:border-white/10"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Round 2</p>
                <p className="text-sm font-medium">Coding Test</p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
              "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            )}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Integrity: Clean
            </div>
          </div>

          {/* Score + qualifying */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall score</span>
              <span className="font-semibold text-violet-500 dark:text-violet-400">{SCORE}/100</span>
            </div>
            <Progress value={SCORE} className="h-2 bg-violet-500/15 [&>[data-slot=progress-indicator]]:bg-violet-500" />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Qualifying cutoff: solve at least {QUALIFYING_SOLVED} of {RESULTS.length} problems.
              You solved {solvedCount}.
            </p>
          </div>

          <Separator className="my-5 bg-black/5 dark:bg-white/5" />

          {/* Per-problem breakdown */}
          <p className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            Per-problem breakdown
          </p>
          <ul className="space-y-2.5">
            {RESULTS.map((r) => (
              <li
                key={r.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm",
                  r.status === "solved"
                    ? "border-emerald-400/30 bg-emerald-500/5"
                    : "border-rose-400/30 bg-rose-500/5",
                )}
              >
                <span className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                  r.status === "solved"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-300",
                )}>
                  {r.status === "solved"
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <XCircle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.difficulty} · {r.testsPassed}/{r.testsTotal} tests passed · weight {r.weight}
                  </p>
                </div>
                <span className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  r.status === "solved"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                )}>
                  {r.status === "solved" ? "Solved" : "Failed"}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-5 bg-black/5 dark:bg-white/5" />

          {/* Integrity block */}
          <div className={cn(
            "flex items-start gap-3 rounded-lg border p-3 text-xs",
            "border-emerald-400/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-100/90",
          )}>
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <div>
              <p className="font-medium">Integrity: Clean</p>
              <p className="mt-1 text-muted-foreground">
                No proctoring violations were detected during this round. One submission per
                problem was enforced.
              </p>
            </div>
          </div>

          <Separator className="my-5 bg-black/5 dark:bg-white/5" />

          {qualified ? (
            <>
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-violet-400/20 bg-violet-500/5 px-3 py-2.5 text-xs text-violet-800 dark:text-violet-100/90">
                <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                <p>
                  You qualified for the Interview round. The AI interview runs in
                  strict proctoring mode with mic and camera monitoring.
                </p>
              </div>
              <Button
                onClick={continueToInterview}
                className="h-11 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
              >
                Continue to Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-800 dark:text-rose-100/90">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                <p>
                  You did not solve enough problems to qualify. Your results have been
                  submitted to the hiring team. Thank you for your time.
                </p>
              </div>
              <Button
                onClick={exitToLanding}
                className="h-11 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Exit
              </Button>
            </>
          )}
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          You cannot retake this round. Reach out to the hiring team for feedback.
        </motion.p>
      </section>
    </div>
  );
}
