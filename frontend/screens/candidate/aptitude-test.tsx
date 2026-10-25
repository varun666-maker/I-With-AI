"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Grid3x3,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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

interface Question {
  id: number;
  category: "Quantitative" | "Logical" | "Verbal" | "Analytical" | "Data Interpretation";
  text: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  // Quantitative (5)
  { id: 1, category: "Quantitative", text: "A train 150 m long passes a pole in 9 seconds. What is its speed in km/h?", options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"], correct: 1 },
  { id: 2, category: "Quantitative", text: "If 3x + 7 = 22, what is x?", options: ["3", "4", "5", "6"], correct: 2 },
  { id: 3, category: "Quantitative", text: "The simple interest on Rs. 5000 at 8% per annum for 2 years is:", options: ["Rs. 600", "Rs. 700", "Rs. 800", "Rs. 900"], correct: 2 },
  { id: 4, category: "Quantitative", text: "A shopkeeper sells an article for Rs. 920 at a loss of 8%. The cost price is:", options: ["Rs. 900", "Rs. 1000", "Rs. 950", "Rs. 1080"], correct: 1 },
  { id: 5, category: "Quantitative", text: "What is 35% of 240?", options: ["72", "84", "96", "108"], correct: 1 },
  // Logical (5)
  { id: 6, category: "Logical", text: "Find the next term: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], correct: 1 },
  { id: 7, category: "Logical", text: "If CAT is coded as 24, DOG is coded as 26, what is FOX?", options: ["40", "42", "44", "46"], correct: 1 },
  { id: 8, category: "Logical", text: "Pointing to a photo, a man said: She is the daughter of my grandfather's only son. She is my:", options: ["Aunt", "Sister", "Mother", "Daughter"], correct: 1 },
  { id: 9, category: "Logical", text: "All roses are flowers. Some flowers fade quickly. Therefore:", options: ["All roses fade quickly", "Some roses fade quickly", "No roses fade quickly", "Cannot be determined"], correct: 3 },
  { id: 10, category: "Logical", text: "Find the odd one out: 3, 5, 11, 14, 17, 21", options: ["3", "11", "14", "21"], correct: 2 },
  // Verbal (5)
  { id: 11, category: "Verbal", text: "Choose the synonym of 'Ephemeral':", options: ["Eternal", "Short-lived", "Strong", "Heavy"], correct: 1 },
  { id: 12, category: "Verbal", text: "Choose the antonym of 'Benevolent':", options: ["Kind", "Generous", "Malevolent", "Friendly"], correct: 2 },
  { id: 13, category: "Verbal", text: "Pick the correctly spelled word:", options: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], correct: 2 },
  { id: 14, category: "Verbal", text: "The phrase 'break the ice' means:", options: ["To shatter glass", "To start a conversation", "To fight", "To leave a party"], correct: 1 },
  { id: 15, category: "Verbal", text: "Complete: Despite the heavy rain, he ____ to the office.", options: ["go", "gone", "went", "going"], correct: 2 },
  // Analytical (5)
  { id: 16, category: "Analytical", text: "If all Bloops are Razzies and some Razzies are Lazzies, then:", options: ["All Bloops are Lazzies", "Some Bloops are Lazzies", "No Bloops are Lazzies", "Cannot be determined"], correct: 3 },
  { id: 17, category: "Analytical", text: "Five friends sit in a row. A is left of B but right of C. D is right of B but left of E. Who is in the middle?", options: ["A", "B", "C", "D"], correct: 1 },
  { id: 18, category: "Analytical", text: "In a certain code, MONKEY is XDJMNL. How is TIGER coded?", options: ["QDFHS", "SHFDQ", "UJHFS", "RHFDS"], correct: 1 },
  { id: 19, category: "Analytical", text: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0 degrees", "7.5 degrees", "15 degrees", "22.5 degrees"], correct: 1 },
  { id: 20, category: "Analytical", text: "If 6 + 4 = 210 and 9 + 3 = 612, what is 8 + 2?", options: ["410", "610", "1010", "416"], correct: 3 },
  // Data Interpretation (5)
  { id: 21, category: "Data Interpretation", text: "A bar chart shows sales of 40, 60, 80, 100 for Q1 to Q4. The percentage increase from Q1 to Q4 is:", options: ["100%", "120%", "150%", "200%"], correct: 2 },
  { id: 22, category: "Data Interpretation", text: "If 30% of a pie chart represents Category A and total is 360 degrees, Category A's slice is:", options: ["90 degrees", "108 degrees", "120 degrees", "135 degrees"], correct: 1 },
  { id: 23, category: "Data Interpretation", text: "A line graph rises 10, 20, 40, 80 across 4 years. The growth is:", options: ["Linear", "Exponential", "Flat", "Declining"], correct: 1 },
  { id: 24, category: "Data Interpretation", text: "Average of 5 numbers is 18. If one number is removed, the average becomes 16. The removed number is:", options: ["20", "22", "24", "26"], correct: 3 },
  { id: 25, category: "Data Interpretation", text: "A table shows 200 employees: 120 male, 80 female. Ratio of female to total is:", options: ["1:3", "2:5", "3:5", "2:3"], correct: 1 },
];

const CATEGORIES = ["Quantitative", "Logical", "Verbal", "Analytical", "Data Interpretation"] as const;
const TEST_DURATION_SEC = 30 * 60;
const OPTION_LABELS = ["A", "B", "C", "D"];

export function CandidateAptitudeTest() {
  const reduce = useReducedMotion();
  const set = useNav((s) => s.set);
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);

  const proctor = useProctoring({ mode: "strict" });
  const proctorRef = useRef(proctor);
  useEffect(() => {
    proctorRef.current = proctor;
  });

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SEC);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Lock + fullscreen + start monitoring on mount
  useEffect(() => {
    setNavigationLocked(true);
    requestFullscreen();
    proctorRef.current.startMonitoring();
    return () => {
      proctorRef.current.stopMonitoring();
    };
     
  }, []);

  // Countdown timer
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

  // Auto-submit on strike 3 OR on timer expiry
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
        set("candidate-aptitude-result");
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
        set("candidate-aptitude-result");
      }, 1200);
      return () => clearTimeout(t);
    }
     
  }, [autoSubmitted]);

  const handleSubmit = () => {
    exitFullscreen();
    setNavigationLocked(false);
    proctorRef.current.stopMonitoring();
    setSubmitOpen(false);
    set("candidate-aptitude-result");
  };

  const current = QUESTIONS[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = (answeredCount / QUESTIONS.length) * 100;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const lowTime = timeLeft < 60;

  // Integrity display
  const integrity =
    proctor.strikes === 0
      ? { label: "Clean", tone: "text-emerald-600 dark:text-emerald-300" }
      : proctor.strikes < 3
        ? { label: "Flags", tone: "text-amber-600 dark:text-amber-300" }
        : { label: "Penalty", tone: "text-rose-600 dark:text-rose-300" };

  const tabSwitches = proctor.events.filter((e) => e.type === "tab-switch").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
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
              Round 1 <span className="text-violet-500 dark:text-violet-400">Aptitude Test</span>
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              25 questions · 30 minutes · no retakes
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

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Answered {answeredCount} / {QUESTIONS.length}</span>
            <span>{Math.round(progressPct)}% complete</span>
          </div>
          <Progress value={progressPct} className="h-1.5 bg-violet-500/15 [&>[data-slot=progress-indicator]]:bg-violet-500" />
        </div>

        {/* Main test area */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          {/* Question card */}
          <motion.div
            key={current.id}
            initial={reduce ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border border-black/10 bg-card p-5 shadow-sm sm:p-6 dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="rounded-full border-violet-400/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-700 dark:text-violet-300">
                {current.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Question {currentIdx + 1} of {QUESTIONS.length}
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold leading-relaxed sm:text-lg">
              {current.text}
            </h2>

            <div className="mt-5 space-y-2.5">
              {current.options.map((opt, i) => {
                const selected = answers[current.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers((p) => ({ ...p, [current.id]: i }))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      selected
                        ? "border-violet-500 bg-violet-500/10 text-foreground"
                        : "border-black/10 bg-black/[0.02] hover:border-violet-400/40 hover:bg-violet-500/[0.04] dark:border-white/10 dark:bg-white/[0.02]",
                    )}
                  >
                    <span className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      selected
                        ? "bg-violet-500 text-white"
                        : "bg-black/5 text-muted-foreground dark:bg-white/10",
                    )}>
                      {OPTION_LABELS[i]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {selected && <CheckCircle2 className="h-4 w-4 text-violet-500 dark:text-violet-400" />}
                  </button>
                );
              })}
            </div>

            <Separator className="my-5 bg-black/5 dark:bg-white/5" />

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Previous
              </Button>
              {currentIdx === QUESTIONS.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setSubmitOpen(true)}
                  className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Submit Test
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setCurrentIdx((i) => Math.min(QUESTIONS.length - 1, i + 1))}
                  className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                >
                  Next
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Sidebar: navigation grid */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-black/10 bg-card p-4 shadow-sm dark:border-white/10">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Grid3x3 className="h-3.5 w-3.5" />
                Question Grid
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {QUESTIONS.map((q, i) => {
                  const answered = answers[q.id] !== undefined;
                  const isCurrent = i === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-md border text-xs font-medium transition-colors",
                        isCurrent
                          ? "border-violet-500 bg-violet-500 text-white"
                          : answered
                            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-black/10 bg-black/[0.02] text-muted-foreground hover:border-violet-400/40 dark:border-white/10 dark:bg-white/[0.02]",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-violet-500" /> Current
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Answered
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-card p-4 shadow-sm dark:border-white/10">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <ul className="space-y-1.5 text-xs">
                {CATEGORIES.map((cat) => {
                  const catQs = QUESTIONS.filter((q) => q.category === cat);
                  const catAnswered = catQs.filter((q) => answers[q.id] !== undefined).length;
                  return (
                    <li key={cat} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{cat}</span>
                      <span className="font-mono tabular-nums">{catAnswered}/{catQs.length}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Button
              onClick={() => setSubmitOpen(true)}
              className="w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Submit Test
            </Button>
          </aside>
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
            Camera + tab focus are monitored. Three strikes will auto-submit your test.
          </p>
        </div>
      </section>

      {/* Strike warning */}
      <ProctoringWarning
        open={proctor.strikes > 0 && proctor.strikes < 3}
        strikeNumber={(Math.min(3, Math.max(1, proctor.strikes)) as 1 | 2 | 3)}
        violationType={proctor.events[proctor.events.length - 1]?.type ?? "tab-switch"}
        onAcknowledge={() => proctor.reset()}
        onAutoSubmit={() => setAutoSubmitted(true)}
      />

      {/* Submit confirmation */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="border-black/10 bg-card dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Submit your test?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {QUESTIONS.length} questions.
              {answeredCount < QUESTIONS.length
                ? " Unanswered questions will be marked as incorrect."
                : " All questions are answered."} This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setSubmitOpen(false)} className="rounded-full">
              Keep Going
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Submit Now
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
                  ? "Three proctoring strikes. Your test has been submitted automatically."
                  : "The 30-minute timer has elapsed. Submitting your test now."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
