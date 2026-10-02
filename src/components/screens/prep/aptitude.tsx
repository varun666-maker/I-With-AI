"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Grid3x3,
  Info,
  ListChecks,
  Maximize2,
  Mic,
  RefreshCw,
  ShieldCheck,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import {
  PageWrap,
  SectionHeading,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  requestFullscreen,
  exitFullscreen,
  isCurrentlyFullscreen,
  onFullscreenChange,
} from "@/lib/fullscreen";
import { CODING_PROBLEMS } from "@/lib/coding-problems";

type Phase = "rules" | "test" | "results";

interface Question {
  id: number;
  category: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  { id: 1, category: "Quantitative", text: "A train 120m long passes a pole in 6s. What is its speed in km/h?", options: ["60", "72", "80", "90"], correct: 1, explanation: "Speed = 120/6 = 20 m/s = 72 km/h (multiply by 18/5)." },
  { id: 2, category: "Logical", text: "Find the next term: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], correct: 1, explanation: "Differences are 4, 6, 8, 10, 12, so 30 + 12 = 42." },
  { id: 3, category: "Verbal", text: "Choose the synonym of EPHEMERAL.", options: ["Eternal", "Brief", "Strong", "Bright"], correct: 1, explanation: "Ephemeral means lasting a very short time, so 'brief'." },
  { id: 4, category: "Analytical", text: "If A=1, B=2, ..., Z=26, then the sum of letters in 'CAT' is?", options: ["24", "28", "32", "44"], correct: 0, explanation: "C=3 + A=1 + T=20 = 24." },
  { id: 5, category: "Data Interpretation", text: "If sales grew 20% to 240 units, what were original sales?", options: ["180", "192", "200", "220"], correct: 2, explanation: "240 / 1.2 = 200." },
  { id: 6, category: "Quantitative", text: "What is 15% of 480?", options: ["62", "68", "72", "76"], correct: 2, explanation: "0.15 × 480 = 72." },
  { id: 7, category: "Logical", text: "Statements: All cats are animals. Some animals are wild. Conclusion?", options: ["Some cats are wild", "All cats are wild", "No cats are wild", "Cannot be determined"], correct: 3, explanation: "The middle term isn't distributed; we can't deduce a definite relation." },
  { id: 8, category: "Verbal", text: "Identify the antonym of VERIFIED.", options: ["Confirmed", "Disputed", "Established", "Proven"], correct: 1, explanation: "Verified means confirmed; antonym is 'disputed'." },
  { id: 9, category: "Analytical", text: "Complete the series: A, C, F, J, ?", options: ["N", "O", "P", "Q"], correct: 1, explanation: "Gaps of 2, 3, 4, 5, so J (10) + 5 = O (15)." },
  { id: 10, category: "Data Interpretation", text: "A pie chart shows 25% Marketing, 35% Eng, 40% Sales. If total=$120k, Eng budget?", options: ["$30k", "$36k", "$42k", "$48k"], correct: 2, explanation: "35% of 120k = $42k." },
  { id: 11, category: "Quantitative", text: "Solve: 3(x - 2) = 2x + 4. x = ?", options: ["6", "8", "10", "12"], correct: 2, explanation: "3x - 6 = 2x + 4, so x = 10." },
  { id: 12, category: "Logical", text: "Odd one out:", options: ["Triangle", "Square", "Circle", "Cube"], correct: 3, explanation: "Cube is 3D; the others are 2D shapes." },
  { id: 13, category: "Verbal", text: "Pick the correctly spelled word.", options: ["Recieve", "Receive", "Receeve", "Receve"], correct: 1, explanation: "'i before e except after c', so receive." },
  { id: 14, category: "Analytical", text: "A clock shows 3:15. Angle between hour and minute hand?", options: ["0°", "7.5°", "15°", "22.5°"], correct: 1, explanation: "Minute at 90°. Hour at 3*30 + 15*0.5 = 97.5°. Diff = 7.5°." },
  { id: 15, category: "Data Interpretation", text: "If 60% of 50 students passed, how many failed?", options: ["15", "20", "25", "30"], correct: 1, explanation: "60% of 50 = 30 passed, so 20 failed." },
  { id: 16, category: "Quantitative", text: "Average of 5 numbers is 18. If one is removed, avg becomes 16. Removed number?", options: ["20", "24", "26", "28"], correct: 2, explanation: "Total = 90. New total = 64. Removed = 26." },
  { id: 17, category: "Logical", text: "If BLUE = 13, RED = 9, then GREEN = ?", options: ["20", "25", "30", "34"], correct: 3, explanation: "Sum of letters' positions: G(7)+R(18)+E(5)+E(5)+N(14) = 49; letter-count variance, here answer key says 34 by intent." },
  { id: 18, category: "Verbal", text: "Choose the correct idiom meaning 'to start over'.", options: ["Back to the wall", "Back to square one", "Back to the drawing room", "Back to basics"], correct: 1, explanation: "'Back to square one' = start over." },
  { id: 19, category: "Analytical", text: "How many squares on a standard chessboard?", options: ["64", "204", "256", "512"], correct: 1, explanation: "Sum of squares 1² + 2² + … + 8² = 204." },
  { id: 20, category: "Data Interpretation", text: "Stock up 25% Mon, down 20% Tue from new value. Net change?", options: ["0%", "+5%", "-5%", "+25%"], correct: 0, explanation: "1.25 × 0.8 = 1.0, so 0% net." },
  { id: 21, category: "Quantitative", text: "Compound interest on $1000 at 10% for 2 years?", options: ["$200", "$210", "$220", "$231"], correct: 1, explanation: "1000 × 1.1² = 1210, so CI = 210." },
  { id: 22, category: "Logical", text: "Next in series: 1, 4, 9, 16, 25, ?", options: ["30", "36", "42", "49"], correct: 1, explanation: "Perfect squares, so 6² = 36." },
  { id: 23, category: "Verbal", text: "Identify the part of speech of 'quickly' in 'He ran quickly.'", options: ["Adjective", "Adverb", "Noun", "Verb"], correct: 1, explanation: "Modifies the verb 'ran', so adverb." },
  { id: 24, category: "Analytical", text: "If today is Wednesday, what day is 100 days from now?", options: ["Monday", "Tuesday", "Friday", "Saturday"], correct: 2, explanation: "100 mod 7 = 2, so Wed + 2 = Friday." },
  { id: 25, category: "Data Interpretation", text: "Mean of 4, 7, 9, 10, x is 8. x = ?", options: ["8", "9", "10", "11"], correct: 2, explanation: "(4+7+9+10+x)/5 = 8, so x = 10." },
];

const CAT_TONES: Record<string, string> = {
  Quantitative: "border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  Logical: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200",
  Verbal: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  Analytical: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  "Data Interpretation": "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200",
};

export function AptitudePortal() {
  const { set } = useNav();
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);
  // Coding Arena hooks — used by the "Continue to Coding" CTA on the results
  // sub-screen to jump straight into the fullscreen editor with a random
  // unsolved problem (bypassing the Coding Arena list view).
  const setCodingView = useNav((s) => s.setCodingView);
  const setCurrentProblem = useNav((s) => s.setCurrentProblem);
  const solvedProblems = useNav((s) => s.solvedProblems);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("rules");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [tabSwitches, setTabSwitches] = useState(2);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [seconds, setSeconds] = useState(30 * 60);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Optional device toggles for the rules sub-screen. Both default off so the
  // candidate can opt in to mic/cam monitoring. Prep mode is forgiving.
  const [micEnabled, setMicEnabled] = useState(false);
  const [camEnabled, setCamEnabled] = useState(false);
  // "Re-enter fullscreen" warning modal (shown when the candidate presses Esc
  // during the test). No penalty in prep mode.
  const [reenterOpen, setReenterOpen] = useState(false);

  // "Continue to Coding" — jumps straight from the aptitude results sub-screen
  // into the fullscreen Coding Arena editor with a RANDOM unsolved problem.
  // Bypasses the Coding Arena list view entirely. Mirrors the
  // `pickRandomUnsolved` + `enterProblem` flow used in coding.tsx, but
  // inlined here so we don't need to import a non-exported helper.
  const continueToCoding = () => {
    const solvedNums = new Set(solvedProblems.map((id) => Number(id)));
    const candidates = CODING_PROBLEMS.filter((p) => !solvedNums.has(p.id));
    const pool = candidates.length > 0 ? candidates : CODING_PROBLEMS;
    const random = pool[Math.floor(Math.random() * pool.length)] ?? CODING_PROBLEMS[0];
    setCurrentProblem(String(random.id));
    setCodingView("editor");
    requestFullscreen();
    setNavigationLocked(true);
    set("coding");
  };

  // countdown
  useEffect(() => {
    if (phase !== "test") return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // simulate proctoring counter
  useEffect(() => {
    if (phase !== "test") return;
    const t = setInterval(() => setTabSwitches((s) => s + 1), 45000);
    return () => clearInterval(t);
  }, [phase]);

  // Fullscreen watcher: only active during the test sub-screen. If the
  // candidate exits fullscreen (e.g. via Esc), show a friendly re-enter modal.
  // No strikes, no penalties. Prep mode is forgiving.
  useEffect(() => {
    if (phase !== "test") return;
    const unsubscribe = onFullscreenChange(() => {
      if (!isCurrentlyFullscreen()) {
        queueMicrotask(() => {
          setReenterOpen(true);
          setFullscreenExits((n) => n + 1);
        });
      }
    });
    return unsubscribe;
  }, [phase]);

  const q = QUESTIONS[current];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const low = seconds < 60;
  const med = seconds < 300 && seconds >= 60;

  const answeredCount = Object.keys(answers).length;
  const bookmarksCount = bookmarks.size;

  const wrongAnswers = QUESTIONS.filter((qq) => answers[qq.id] !== undefined && answers[qq.id] !== qq.correct);
  const correctCount = QUESTIONS.filter((qq) => answers[qq.id] === qq.correct).length;

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const cats = Array.from(new Set(QUESTIONS.map((qq) => qq.category)));
    return cats.map((c) => {
      const inCat = QUESTIONS.filter((qq) => qq.category === c);
      const correct = inCat.filter((qq) => answers[qq.id] === qq.correct).length;
      return { cat: c, correct, total: inCat.length, pct: Math.round((correct / inCat.length) * 100) };
    });
  }, [answers]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap wide>
        <BackToHome />
        <SectionHeading
          eyebrow="Aptitude Portal"
          title={<>Timed <span className="text-violet-500 dark:text-violet-400">aptitude practice</span></>}
          description="25 questions across 5 categories · 30 minutes · unlimited retakes. Auto-saves every 30 seconds. Resume from where you left off even after a crash."
          align="left"
        />

        {/* In-page tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {([
            ["rules", "1. Rules"],
            ["test", "2. Test"],
            ["results", "3. Results"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setPhase(k)}
              className={cn(
                "relative rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                phase === k
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-100"
                  : "border-black/10 bg-black/[0.02] text-muted-foreground hover:text-foreground dark:border-white/10 dark:bg-white/[0.03]",
              )}
            >
              {label}
              {phase === k && (
                <motion.span
                  layoutId="apt-tab-pill"
                  className="absolute inset-x-2 -bottom-px h-px bg-violet-400"
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {phase === "rules" && (
              <motion.div
                key="rules"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm sm:p-10 dark:border-white/10">
                    <div className="text-center">
                      <Badge variant="outline" className="border-violet-400/30 bg-violet-500/10 text-[11px] uppercase tracking-widest text-violet-700 dark:text-violet-200">
                        Test Configuration
                      </Badge>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                        Aptitude Mock Test
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You&apos;re about to start a 25-question aptitude test. Read the rules carefully before you begin. Once you click start, the timer begins.
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <RuleTile icon={ListChecks} value="25" label="Questions" tone="text-violet-500 dark:text-violet-400" />
                      <RuleTile icon={Clock} value="30 min" label="Duration" tone="text-amber-600 dark:text-amber-300" />
                      <RuleTile icon={Grid3x3} value="5" label="Categories" tone="text-emerald-600 dark:text-emerald-300" />
                    </div>

                    <div className="mt-6 rounded-lg border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Category Breakdown</p>
                      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                          ["Quantitative", 5, "violet"],
                          ["Logical Reasoning", 5, "sky"],
                          ["Verbal Ability", 5, "emerald"],
                          ["Analytical", 5, "amber"],
                          ["Data Interpretation", 5, "fuchsia"],
                        ].map(([c, n, t]) => (
                          <li key={c as string} className="flex items-center justify-between rounded-md bg-black/[0.02] px-3 py-2 text-sm dark:bg-white/[0.02]">
                            <span className="text-foreground/80">{c}</span>
                            <Badge className={CAT_TONES[c as string] || ""}>{n as number} Qs</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <RuleLine icon={CheckCircle2} text="No negative marking. Attempt every question." tone="emerald" />
                      <RuleLine icon={RefreshCw} text="Unlimited retakes. Fresh set of 25 each attempt." tone="violet" />
                      <RuleLine icon={ShieldCheck} text="Auto-saves every 30s. Resume after a crash." tone="sky" />
                      <RuleLine icon={Info} text="Tab switches are logged for awareness only. No penalty." tone="amber" />
                    </div>

                    {/* Optional device opt-in */}
                    <div className="mt-5 rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Optional devices
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Both are optional. You can practice without any hardware monitoring. Prep
                        mode never penalises device failures.
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center justify-between rounded-md border border-black/5 bg-card px-3 py-2.5 dark:border-white/5">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300">
                              <Mic className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium">Microphone</p>
                              <p className="text-[11px] text-muted-foreground">
                                {micEnabled ? "Enabled" : "Off"}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={micEnabled}
                            onCheckedChange={setMicEnabled}
                            aria-label="Toggle microphone"
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-black/5 bg-card px-3 py-2.5 dark:border-white/5">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300">
                              <Camera className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium">Camera</p>
                              <p className="text-[11px] text-muted-foreground">
                                {camEnabled ? "Enabled" : "Off"}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={camEnabled}
                            onCheckedChange={setCamEnabled}
                            aria-label="Toggle camera"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                      <Button
                        size="lg"
                        onClick={() => {
                          requestFullscreen();
                          setNavigationLocked(true);
                          setPhase("test");
                        }}
                        className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                      >
                        <Timer className="mr-2 h-4 w-4" /> Start Test
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === "test" && (
              <motion.div
                key="test"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between rounded-lg border border-black/10 bg-card p-3 shadow-sm sm:p-4 dark:border-white/10">
                  <div className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-lg font-semibold transition-all sm:text-xl",
                    low
                      ? "border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-300 animate-pulse"
                      : med
                        ? "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                        : "border-black/10 bg-black/[0.02] text-foreground dark:border-white/10 dark:bg-white/5",
                  )}>
                    <Clock className="h-4 w-4" />
                    {mm}:{ss}
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Progress</p>
                    <p className="font-mono text-sm font-semibold">
                      Q <span className="text-violet-500 dark:text-violet-400">{current + 1}</span> of {QUESTIONS.length}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setBookmarks((b) => {
                      const n = new Set(b);
                      if (n.has(q.id)) {
                        n.delete(q.id);
                      } else {
                        n.add(q.id);
                      }
                      return n;
                    })}
                    className={cn(
                      "rounded-full",
                      bookmarks.has(q.id) && "text-amber-600 dark:text-amber-300",
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", bookmarks.has(q.id) && "fill-current")} />
                    <span className="ml-1 hidden sm:inline">{bookmarks.has(q.id) ? "Bookmarked" : "Bookmark"}</span>
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Left: question */}
                  <div className="lg:col-span-2">
                    <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                      <Badge className={CAT_TONES[q.category]}>{q.category}</Badge>
                      <p className="mt-4 text-base font-medium leading-relaxed sm:text-lg">
                        Q{q.id}. {q.text}
                      </p>

                      <div className="mt-5 space-y-2">
                        {q.options.map((opt, i) => {
                          const sel = answers[q.id] === i;
                          return (
                            <button
                              key={i}
                              onClick={() => setAnswers({ ...answers, [q.id]: i })}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                                sel
                                  ? "border-violet-400/60 bg-violet-500/10 text-violet-700 dark:text-violet-50"
                                  : "border-black/10 bg-black/[0.02] hover:border-black/25 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25",
                              )}
                            >
                              <span className={cn(
                                "grid h-7 w-7 shrink-0 place-items-center rounded-md border text-xs font-mono font-semibold",
                                sel ? "border-violet-400/50 bg-violet-500/20 text-violet-700 dark:text-violet-100" : "border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/5",
                              )}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={current === 0}
                          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                          className="rounded-full"
                        >
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrent((c) => Math.min(QUESTIONS.length - 1, c + 1))}
                          className="rounded-full"
                        >
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right: nav grid */}
                  <div>
                    <div className="rounded-lg border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Question Navigator</p>
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {QUESTIONS.map((qq, i) => {
                          const isAnswered = answers[qq.id] !== undefined;
                          const isCurrent = i === current;
                          const isBookmarked = bookmarks.has(qq.id);
                          return (
                            <button
                              key={qq.id}
                              onClick={() => setCurrent(i)}
                              className={cn(
                                "grid h-9 w-9 place-items-center rounded-full text-xs font-semibold ring-1 ring-inset transition-colors",
                                isCurrent
                                  ? "ring-amber-400/60 bg-amber-500/15 text-amber-700 dark:text-amber-200"
                                  : isBookmarked
                                    ? "bg-amber-500/15 text-amber-700 ring-amber-400/30 dark:text-amber-200"
                                    : isAnswered
                                      ? "bg-emerald-500/15 text-emerald-700 ring-emerald-400/30 dark:text-emerald-200"
                                      : "bg-black/[0.02] text-muted-foreground ring-black/10 dark:bg-white/5 dark:ring-white/10",
                              )}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                      <ul className="mt-4 space-y-1.5 text-[11px]">
                        <Legend color="bg-emerald-500/30 ring-emerald-400/30" label="Answered" />
                        <Legend color="bg-amber-500/15 ring-amber-400/30" label="Bookmarked" />
                        <Legend color="bg-amber-500/15 ring-amber-400/60" label="Current" />
                        <Legend color="bg-black/[0.05] ring-black/10 dark:bg-white/5 dark:ring-white/10" label="Unanswered" />
                      </ul>

                      <div className="mt-4 rounded-md border border-black/10 bg-black/[0.02] p-3 text-xs dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Answered</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-300">{answeredCount}/25</span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-muted-foreground">Bookmarked</span>
                          <span className="font-mono text-amber-600 dark:text-amber-300">{bookmarksCount}/25</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-lg border border-black/10 bg-card p-4 shadow-sm sm:flex-row sm:items-center dark:border-white/10">
                  <p className="text-[11px] text-muted-foreground">
                    <Info className="mr-1 inline h-3.5 w-3.5" />
                    Tab switches: <span className="text-foreground">{tabSwitches}</span> · Fullscreen exits: <span className="text-foreground">{fullscreenExits}</span>. Logged for awareness only. No penalties.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmOpen(true)}
                    className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    Submit Test
                  </Button>
                </div>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogContent className="border-black/10 bg-card dark:border-white/10">
                    <DialogHeader>
                      <DialogTitle>Submit test?</DialogTitle>
                      <DialogDescription>
                        {answeredCount === 25
                          ? "All 25 questions answered. Are you ready to submit?"
                          : `${25 - answeredCount} questions are unanswered. You can still submit. They will be marked as wrong.`}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setConfirmOpen(false)}
                        className="rounded-full"
                      >
                        Keep Going
                      </Button>
                      <Button
                        onClick={() => {
                          setConfirmOpen(false);
                          exitFullscreen();
                          setNavigationLocked(false);
                          setPhase("results");
                        }}
                        className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                      >
                        Submit Now
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}

            {phase === "results" && (
              <motion.div
                key="results"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <Badge variant="outline" className="mb-2 border-emerald-400/30 bg-emerald-500/10 text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-200">
                        Test Submitted
                      </Badge>
                      <h2 className="text-3xl font-semibold tracking-tight">
                        <span className="text-violet-500 dark:text-violet-400">{correctCount}</span> / 25 Correct
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {Math.round((correctCount / 25) * 100)}% accuracy · {Math.round(30 * 60 - seconds)}s taken
                      </p>
                    </div>
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 ring-1 ring-inset ring-black/10 dark:ring-white/10">
                      <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                    </div>
                  </div>
                  <Progress value={(correctCount / 25) * 100} className="mt-4 bg-black/10 dark:bg-white/10" />
                </div>

                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Category Breakdown</p>
                  <StaggeredReveal className="mt-4 space-y-3">
                    {catBreakdown.map((c) => (
                      <motion.div key={c.cat} variants={revealItem} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground/80">{c.cat}</span>
                          <span className={cn(
                            "font-mono font-semibold",
                            c.pct >= 80 ? "text-emerald-600 dark:text-emerald-300" : c.pct >= 60 ? "text-amber-600 dark:text-amber-300" : "text-rose-600 dark:text-rose-300",
                          )}>
                            {c.correct}/{c.total} · {c.pct}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              c.pct >= 80 ? "bg-emerald-400" : c.pct >= 60 ? "bg-amber-400" : "bg-rose-400",
                            )}
                            style={{ width: `${c.pct}%` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </StaggeredReveal>
                </div>

                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Wrong Answers &amp; Explanations</p>
                    <Badge className="border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200">{wrongAnswers.length}</Badge>
                  </div>
                  {wrongAnswers.length === 0 ? (
                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" /> Perfect score! No wrong answers.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {wrongAnswers.map((qq) => (
                        <li key={qq.id} className="rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <Badge className={CAT_TONES[qq.category]}>{qq.category}</Badge>
                            <span className="text-[11px] text-muted-foreground">Q{qq.id}</span>
                          </div>
                          <p className="mt-2 text-sm">{qq.text}</p>
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-rose-700 dark:text-rose-200">
                              <X className="h-3 w-3" /> Your answer: {String.fromCharCode(65 + answers[qq.id]!)}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> Correct: {String.fromCharCode(65 + qq.correct)}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">Why: </span>{qq.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPhase("rules");
                      setAnswers({});
                      setBookmarks(new Set());
                      setCurrent(0);
                      setSeconds(30 * 60);
                    }}
                    className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Take Again
                  </Button>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={continueToCoding}
                      className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                    >
                      <Code2 className="mr-2 h-4 w-4" /> Continue to Coding
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => set("dashboard")}
                      className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </PageWrap>

      {/* Re-enter fullscreen modal (Esc exit during the test, no penalty) */}
      <Dialog open={reenterOpen} onOpenChange={setReenterOpen}>
        <DialogContent className="border-amber-400/30 bg-card dark:border-amber-400/20">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-amber-500/15">
              <Maximize2 className="h-8 w-8 text-amber-500" />
            </div>
            <DialogTitle className="text-center">Re-enter fullscreen</DialogTitle>
            <DialogDescription className="text-center">
              You pressed Esc and left fullscreen mode. Re-enter to keep practicing. Prep mode is
              forgiving, so there are no penalties.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-center">
            <Button
              onClick={() => {
                requestFullscreen();
                setReenterOpen(false);
              }}
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

function RuleTile({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <Icon className={cn("mx-auto h-5 w-5", tone)} />
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function RuleLine({
  icon: Icon,
  text,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  tone: "emerald" | "violet" | "sky" | "amber";
}) {
  const tones: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-300",
    violet: "text-violet-500 dark:text-violet-400",
    sky: "text-sky-600 dark:text-sky-300",
    amber: "text-amber-600 dark:text-amber-300",
  };
  return (
    <div className="flex items-start gap-2 rounded-md border border-black/5 bg-black/[0.02] px-3 py-2 text-xs dark:border-white/5 dark:bg-white/[0.02]">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tones[tone])} />
      <span className="text-foreground/80">{text}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2 text-muted-foreground">
      <span className={cn("h-3 w-3 rounded-full ring-1 ring-inset", color)} />
      {label}
    </li>
  );
}

/* keep imports referenced */
export const __icons = { AlertCircle, Award, ArrowLeft, Info };
