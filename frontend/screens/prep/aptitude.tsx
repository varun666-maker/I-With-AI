"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Grid3x3,
  HelpCircle,
  Info,
  ListChecks,
  Loader2,
  Maximize2,
  Mic,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  X,
  XCircle,
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
import { toast } from "sonner";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  requestFullscreen,
  exitFullscreen,
  isCurrentlyFullscreen,
  onFullscreenChange,
} from "@/lib/fullscreen";
import { CODING_PROBLEMS } from "@/lib/coding-problems";
import { useProctoring } from "@/lib/proctoring";

type Phase = "rules" | "test" | "results";

interface Question {
  id: string;
  position: number;
  category: string;
  subTopic: string | null;
  difficulty: string;
  questionText: string;
  options: string[];
}

interface GradedQuestion extends Question {
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  explanation: string | null;
  bookmarked?: boolean;
}

interface CategoryScore {
  category: string;
  total: number;
  attempted: number;
  correct: number;
  scorePercent: number;
}

interface ProctoringTelemetry {
  tabSwitches: number;
  fullscreenExits: number;
  audioSpikes: number;
  copyPasteAttempts: number;
  mouseWindowLeaves: number;
  integrityScore: number;
  verdict: "Clean Session" | "Minor Inattentions" | "Attention Recommended";
}

interface AptitudeScorecard {
  attemptId: string;
  status: string;
  startedAt: string;
  submittedAt: string;
  durationSecondsUsed: number;
  totalQuestions: number;
  attempted: number;
  unanswered: number;
  correct: number;
  incorrect: number;
  scorePercent: number;
  accuracyPercent: number;
  categoryBreakdown: CategoryScore[];
  tabSwitches: number;
  fullscreenExits: number;
  proctoringTelemetry?: ProctoringTelemetry;
  questions: GradedQuestion[];
}

const CAT_TONES: Record<string, string> = {
  Quantitative: "border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  "Logical Reasoning": "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200",
  Logical: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200",
  "Verbal Ability": "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  Verbal: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  "Analytical Reasoning": "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  Analytical: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  "Data Interpretation": "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200",
};

function getOptionDisplay(options: string[] | undefined, optKey: string | null | undefined) {
  if (!optKey) return null;
  const trimmed = optKey.trim();
  const upper = trimmed.toUpperCase();
  const optionLabels = ["A", "B", "C", "D"];
  const letterIndex = optionLabels.indexOf(upper);

  if (letterIndex >= 0) {
    const text = options && options[letterIndex] ? options[letterIndex] : "";
    return {
      letter: upper,
      text,
      fullDisplay: text ? `Option ${upper} — ${text}` : `Option ${upper}`,
    };
  }

  // Fallback: If optKey was stored as option text rather than a single letter
  if (options && options.length > 0) {
    const foundIndex = options.findIndex(
      (opt) => opt.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (foundIndex >= 0) {
      const letter = optionLabels[foundIndex];
      const text = options[foundIndex];
      return {
        letter,
        text,
        fullDisplay: `Option ${letter} — ${text}`,
      };
    }
  }

  return {
    letter: trimmed,
    text: "",
    fullDisplay: `Option ${trimmed}`,
  };
}

export function AptitudePortal() {
  const { set } = useNav();
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);
  const setProctorCamera = useNav((s) => s.setProctorCamera);
  const setProctorMic = useNav((s) => s.setProctorMic);
  const setCodingView = useNav((s) => s.setCodingView);
  const setCurrentProblem = useNav((s) => s.setCurrentProblem);
  const solvedProblems = useNav((s) => s.solvedProblems);
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("rules");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [audioSpikes, setAudioSpikes] = useState(0);
  const [copyPasteAttempts, setCopyPasteAttempts] = useState(0);
  const [mouseWindowLeaves, setMouseWindowLeaves] = useState(0);
  const [proctorWarning, setProctorWarning] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(30 * 60);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scorecard, setScorecard] = useState<AptitudeScorecard | null>(null);
  const [resultsFilter, setResultsFilter] = useState<"all" | "wrong" | "correct" | "bookmarked">("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [camEnabled, setCamEnabled] = useState(false);
  const [reenterOpen, setReenterOpen] = useState(false);
  // Device permission checks on user toggle
  const handleToggleMic = async (val: boolean) => {
    if (val) {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({ audio: true });
          s.getTracks().forEach((t) => t.stop());
        }
        setMicEnabled(true);
        setProctorMic(true);
        toast.success("Microphone enabled for proctoring simulation");
      } catch {
        setMicEnabled(false);
        setProctorMic(false);
        toast.error("Microphone permission was denied or device is unavailable");
      }
    } else {
      setMicEnabled(false);
      setProctorMic(false);
    }
  };

  const handleToggleCam = async (val: boolean) => {
    if (val) {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({ video: true });
          s.getTracks().forEach((t) => t.stop());
        }
        setCamEnabled(true);
        setProctorCamera(true);
        toast.success("Camera enabled for proctoring simulation");
      } catch {
        setCamEnabled(false);
        setProctorCamera(false);
        toast.error("Camera permission was denied or device is unavailable");
      }
    } else {
      setCamEnabled(false);
      setProctorCamera(false);
    }
  };

  // Comprehensive Exam Proctoring System
  const {
    startMonitoring,
    stopMonitoring,
    stats: proctorStats,
  } = useProctoring({
    mode: "informational",
    onWarning: (msg) => {
      setProctorWarning(msg + " · Recorded in self-awareness report");
      setTimeout(() => setProctorWarning(null), 3500);
    },
    onFullscreenExit: () => {
      setReenterOpen(true);
    },
  });

  useEffect(() => {
    if (phase === "test") {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    return () => {
      stopMonitoring();
    };
  }, [phase, startMonitoring, stopMonitoring]);

  // Jump straight to Coding Arena with random problem
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

  // Start test by sampling 25 randomized questions from 750+ question bank
  const handleStartTest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/me/aptitude/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please sign in or register to take the aptitude assessment.");
        }
        const errMsg = json?.error?.message || "Failed to start test session";
        throw new Error(errMsg);
      }
      const data = json.data;

      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setAnswers({});
      setBookmarks(new Set());
      setCurrent(0);
      setSeconds(data.durationSeconds || 1800);
      setTabSwitches(0);
      setFullscreenExits(0);
      setAudioSpikes(0);
      setCopyPasteAttempts(0);
      setMouseWindowLeaves(0);
      setProctorWarning(null);
      setScorecard(null);

      // Enable floating camera/mic placeholder only if selected
      setProctorCamera(camEnabled);
      setProctorMic(micEnabled);
      requestFullscreen();
      setNavigationLocked(true);
      setPhase("test");
    } catch (err: unknown) {
      console.error("Failed to start test:", err);
      const msg = err instanceof Error ? err.message : "Could not initialize test session. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save answer to database
  const handleSelectOption = (qId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
    if (attemptId) {
      const label = String.fromCharCode(65 + optionIndex);
      fetch(`/api/v1/me/aptitude/${attemptId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId, selectedOption: label }),
      }).catch(() => {});
    }
  };

  // Toggle bookmark with background persistence
  const handleToggleBookmark = (qId: string) => {
    const isBookmarked = !bookmarks.has(qId);
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.add(qId);
      else next.delete(qId);
      return next;
    });

    if (attemptId) {
      fetch(`/api/v1/me/aptitude/${attemptId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId, bookmarked: isBookmarked }),
      }).catch(() => {});
    }
  };

  // Ensure fullscreen is exited and navigation unlocked whenever viewing results or rules
  useEffect(() => {
    if (phase === "results" || phase === "rules") {
      setReenterOpen(false);
      setNavigationLocked(false);
      setProctorCamera(false);
      setProctorMic(false);
      exitFullscreen().catch(() => {});
      if (typeof document !== "undefined" && document.fullscreenElement) {
        try {
          document.exitFullscreen().catch(() => {});
        } catch {}
      }
    }
  }, [phase, setNavigationLocked, setProctorCamera, setProctorMic]);

  // Submit test and grade
  const handleSubmitTest = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    setConfirmOpen(false);
    setReenterOpen(false);

    // Promptly exit fullscreen while user click gesture token is fresh
    exitFullscreen().catch(() => {});
    if (typeof document !== "undefined" && document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch {}
    }

    try {
      const res = await fetch(`/api/v1/me/aptitude/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tabSwitches: proctorStats.tabSwitches + tabSwitches,
          fullscreenExits: proctorStats.fullscreenExits + fullscreenExits,
          audioSpikes,
          copyPasteAttempts: proctorStats.copyPasteAttempts + copyPasteAttempts,
          mouseWindowLeaves: mouseWindowLeaves + proctorStats.screenshotAttempts + proctorStats.keyboardShortcuts,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = json?.error?.message || "Failed to submit test";
        throw new Error(errMsg);
      }
      setScorecard(json.data);

      setNavigationLocked(false);
      setProctorCamera(false);
      setProctorMic(false);
      setReenterOpen(false);
      setPhase("results");

      // Finalize normal view exit
      exitFullscreen().catch(() => {});
      if (typeof document !== "undefined" && document.fullscreenElement) {
        try {
          document.exitFullscreen().catch(() => {});
        } catch {}
      }
    } catch (err: unknown) {
      console.error("Failed to submit test:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit test. Please check connection.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Listen for real audio spikes from floating WebcamPiP proctor
  useEffect(() => {
    if (phase !== "test") return;
    const handleAudioSpike = () => {
      setAudioSpikes((s) => s + 1);
      setProctorWarning("Audio spike detected · Logged in self-awareness report");
      setTimeout(() => setProctorWarning(null), 3500);
    };
    window.addEventListener("proctor:audio-spike", handleAudioSpike);
    return () => window.removeEventListener("proctor:audio-spike", handleAudioSpike);
  }, [phase]);

  // Anti-cheating & proctoring: listen for visibility / tab change
  useEffect(() => {
    if (phase !== "test") return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((s) => s + 1);
        setProctorWarning("Tab switch detected · Logged in self-awareness report");
        setTimeout(() => setProctorWarning(null), 3500);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [phase]);

  // Fullscreen watcher: only warn during active test and when not submitting
  useEffect(() => {
    if (phase !== "test") return;
    const unsubscribe = onFullscreenChange((isFs) => {
      if (!isFs && phase === "test" && !submitting) {
        queueMicrotask(() => {
          setReenterOpen(true);
          setFullscreenExits((n) => n + 1);
          setProctorWarning("Fullscreen exit detected · Logged in self-awareness report");
          setTimeout(() => setProctorWarning(null), 3500);
        });
      }
    });
    return unsubscribe;
  }, [phase, submitting]);

  // Copy/paste interception & mouse leaves
  useEffect(() => {
    if (phase !== "test") return;

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyPasteAttempts((c) => c + 1);
      setProctorWarning("Clipboard locked in exam mode · Logged in self-awareness report");
      setTimeout(() => setProctorWarning(null), 3500);
    };

    const handleMouseLeave = () => {
      setMouseWindowLeaves((m) => m + 1);
    };

    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("cut", handleCopyPaste);
    window.addEventListener("paste", handleCopyPaste);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("cut", handleCopyPaste);
      window.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [phase]);

  // 30-min countdown timer with auto-submit on 00:00
  useEffect(() => {
    if (phase !== "test") return;
    if (seconds <= 0) {
      handleSubmitTest();
      return;
    }
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, seconds]);

  const activeQuestion = questions[current];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isTimeCritical = seconds < 60;
  const isTimeWarning = seconds < 300 && seconds >= 60;

  const answeredCount = Object.keys(answers).length;
  const bookmarksCount = bookmarks.size;

  // Filtered review questions on scorecard
  const reviewQuestions = useMemo(() => {
    if (!scorecard) return [];
    switch (resultsFilter) {
      case "wrong":
        return scorecard.questions.filter((q) => !q.isCorrect);
      case "correct":
        return scorecard.questions.filter((q) => q.isCorrect);
      case "bookmarked":
        return scorecard.questions.filter((q) => bookmarks.has(q.id));
      default:
        return scorecard.questions;
    }
  }, [scorecard, resultsFilter, bookmarks]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap wide>
        {/* Only show BackToHome, Header, and Navigation Tabs when NOT in active test mode */}
        {phase !== "test" && (
          <>
            <BackToHome />
            <SectionHeading
              eyebrow="Aptitude Portal"
              title={<>Timed <span className="text-violet-500 dark:text-violet-400">aptitude practice</span></>}
              description="25 randomized questions from 750+ question bank · 30 minutes · Quantitative, Logical, Verbal & Data Interpretation. Instant step-by-step mathematical solutions."
              align="left"
            />

            {/* Phase navigation indicator */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {([
                ["rules", "1. Rules & Setup"],
                ["test", "2. Active Test"],
                ["results", "3. Scorecard & Solutions"],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  disabled={k === "test" && phase !== "test"}
                  onClick={() => {
                    if (k === "results" && !scorecard) return;
                    setPhase(k);
                  }}
                  className={cn(
                    "relative rounded-full border px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
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
          </>
        )}

        <div className={cn(phase === "test" ? "mt-2" : "mt-6")}>
          <AnimatePresence mode="wait">
            {/* 1. RULES PHASE */}
            {phase === "rules" && (
              <motion.div
                key="rules"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm sm:p-10 dark:border-white/10">
                    <div className="text-center">
                      <Badge variant="outline" className="border-violet-400/30 bg-violet-500/10 text-[11px] uppercase tracking-widest text-violet-700 dark:text-violet-200">
                        750+ Questions Vetted Bank
                      </Badge>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                        Mock Aptitude Assessment
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Each test is dynamically randomized with 25 fresh questions across all 4 core pillars. Once you start, the 30-minute server timer begins.
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <RuleTile icon={ListChecks} value="25" label="Random Questions" tone="text-violet-500 dark:text-violet-400" />
                      <RuleTile icon={Clock} value="30 min" label="Timed Assessment" tone="text-amber-600 dark:text-amber-300" />
                      <RuleTile icon={Grid3x3} value="4 Pillars" label="Core Categories" tone="text-emerald-600 dark:text-emerald-300" />
                    </div>

                    <div className="mt-6 rounded-lg border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Blueprint Distribution</p>
                        <span className="text-[10px] text-muted-foreground">Balanced Difficulty: Easy, Medium, Hard</span>
                      </div>
                      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                          ["Quantitative", "7 Questions", "Arithmetic, Ratios, Speed, Profit & Loss", "violet"],
                          ["Logical Reasoning", "7 Questions", "Series, Blood Relations, Syllogisms", "sky"],
                          ["Verbal Ability", "6 Questions", "Vocabulary, Cloze Test, Idioms", "emerald"],
                          ["Data Interpretation", "5 Questions", "Pie Charts, Tables, Puzzles", "fuchsia"],
                        ].map(([c, n, desc]) => (
                          <li key={c} className="rounded-md bg-black/[0.02] p-3 text-sm dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground/90">{c}</span>
                              <Badge className={CAT_TONES[c] || ""}>{n}</Badge>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <RuleLine icon={CheckCircle2} text="No negative marking (+1 for correct, 0 for blank/wrong)." tone="emerald" />
                      <RuleLine icon={RefreshCw} text="Unlimited retakes. Fresh randomized questions every time." tone="violet" />
                      <RuleLine icon={ShieldCheck} text="Instant auto-save on every answer. Safe from network loss." tone="sky" />
                      <RuleLine icon={Info} text="Zero answer leakage. Solutions are revealed only after submission." tone="amber" />
                    </div>

                    {/* Optional device opt-in for proctoring practice */}
                    <div className="mt-5 rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Proctoring Simulation (Optional)
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Simulate real company hiring conditions with webcam & mic monitoring. Prep mode is forgiving and never penalizes device issues.
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center justify-between rounded-md border border-black/5 bg-card px-3 py-2.5 dark:border-white/5">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300">
                              <Mic className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium">Microphone</p>
                              <p className="text-[11px] text-muted-foreground">{micEnabled ? "Active" : "Off"}</p>
                            </div>
                          </div>
                          <Switch
                            checked={micEnabled}
                            onCheckedChange={handleToggleMic}
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
                              <p className="text-[11px] text-muted-foreground">{camEnabled ? "Active" : "Off"}</p>
                            </div>
                          </div>
                          <Switch
                            checked={camEnabled}
                            onCheckedChange={handleToggleCam}
                            aria-label="Toggle camera"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                      <Button
                        size="lg"
                        disabled={loading}
                        onClick={handleStartTest}
                        className="rounded-full bg-violet-600 px-8 font-semibold text-white hover:bg-violet-700 shadow-md hover:shadow-violet-500/25"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sampling 25 Questions…
                          </>
                        ) : (
                          <>
                            <Timer className="mr-2 h-4 w-4" /> Start Aptitude Assessment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. ACTIVE TEST PHASE (DISTRACTION-FREE FULLSCREEN) */}
            {phase === "test" && activeQuestion && (
              <motion.div
                key="test"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* Clean Enterprise Test Header */}
                <div className="mb-3 flex items-center justify-between rounded-xl border border-black/10 bg-card p-3 shadow-sm dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-sm shadow-sm">
                      AP
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-sm font-semibold tracking-tight text-foreground">
                          Aptitude Assessment · Prep Mode
                        </h1>
                        <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-[10px] font-semibold text-rose-600 dark:text-rose-300 animate-pulse">
                          🔴 Live Proctored
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Simulating company hiring conditions · Forgiving practice (Zero score penalties)
                      </p>
                    </div>
                  </div>

                  {/* Center Countdown Timer */}
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-base font-bold sm:text-lg",
                      isTimeCritical
                        ? "border-rose-500/50 bg-rose-500/15 text-rose-600 dark:text-rose-300 animate-pulse"
                        : isTimeWarning
                        ? "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-300"
                        : "border-black/10 bg-black/[0.02] text-foreground dark:border-white/10 dark:bg-white/5",
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    <span>{mm}:{ss}</span>
                  </div>

                  {/* Quick Finish / Submit & Exit Test */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        exitFullscreen();
                        setNavigationLocked(false);
                        setPhase("rules");
                      }}
                      className="rounded-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      Exit Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmOpen(true)}
                      className="rounded-full border-black/10 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
                    >
                      Finish &amp; Submit
                    </Button>
                  </div>
                </div>

                {/* Inline Proctoring Event Banner */}
                {proctorWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-3 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-200"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="font-medium">{proctorWarning}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600/80">
                      Prep Mode (Forgiving)
                    </span>
                  </motion.div>
                )}

                {/* Sub-bar with Active Question & Bookmark */}
                <div className="mb-3 flex items-center justify-between rounded-xl border border-black/10 bg-card px-4 py-2.5 shadow-sm dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Question</span>
                    <span className="font-mono text-sm font-bold">
                      <span className="text-violet-600 dark:text-violet-400">{current + 1}</span> of {questions.length}
                    </span>
                    <Badge className={CAT_TONES[activeQuestion.category] || "bg-violet-500/10 text-violet-700"}>
                      {activeQuestion.category}
                    </Badge>
                    {activeQuestion.subTopic && (
                      <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
                        {activeQuestion.subTopic}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleBookmark(activeQuestion.id)}
                    className={cn(
                      "rounded-full text-xs",
                      bookmarks.has(activeQuestion.id) && "text-amber-600 dark:text-amber-300",
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", bookmarks.has(activeQuestion.id) && "fill-current")} />
                    <span className="ml-1 hidden sm:inline">
                      {bookmarks.has(activeQuestion.id) ? "Bookmarked" : "Bookmark"}
                    </span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Left: Question Card (Protected against text selection and copying) */}
                  <div className="lg:col-span-2">
                    <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm dark:border-white/10 select-none">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize text-[10px]">
                          Difficulty: {activeQuestion.difficulty}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          +1 mark · 0 penalty
                        </span>
                      </div>

                      <p className="mt-4 text-base font-medium leading-relaxed sm:text-lg">
                        <span className="font-bold text-violet-600 dark:text-violet-400">Q{current + 1}.</span> {activeQuestion.questionText}
                      </p>

                      {/* Options */}
                      <div className="mt-6 space-y-2.5">
                        {activeQuestion.options.map((opt, i) => {
                          const isSelected = answers[activeQuestion.id] === i;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSelectOption(activeQuestion.id, i)}
                              className={cn(
                                "flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
                                isSelected
                                  ? "border-violet-500/60 bg-violet-500/10 text-violet-900 font-medium dark:text-violet-100 ring-1 ring-violet-500/30"
                                  : "border-black/10 bg-black/[0.01] hover:border-violet-400/30 hover:bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.01] dark:hover:bg-white/[0.03]",
                              )}
                            >
                              <span
                                className={cn(
                                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-mono font-bold",
                                  isSelected
                                    ? "border-violet-500 bg-violet-600 text-white"
                                    : "border-black/15 bg-black/[0.03] text-muted-foreground dark:border-white/15 dark:bg-white/5",
                                )}
                              >
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="flex-1">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Question Navigation Buttons: Last question shows Submit Assessment instead of Next */}
                      <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={current === 0}
                          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                          className="rounded-full text-xs"
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                        </Button>

                        {current === questions.length - 1 ? (
                          <Button
                            onClick={() => setConfirmOpen(true)}
                            className="rounded-full bg-violet-600 px-5 text-xs font-semibold text-white hover:bg-violet-700 shadow-sm"
                          >
                            Review &amp; Submit Assessment <CheckCircle2 className="ml-1.5 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                            className="rounded-full text-xs"
                          >
                            Next <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Question Palette */}
                  <div className="space-y-4">
                    {/* Question Palette */}
                    <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Question Palette</p>
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {questions.map((qq, i) => {
                          const isAnswered = answers[qq.id] !== undefined;
                          const isCurrent = i === current;
                          const isBookmarked = bookmarks.has(qq.id);
                          return (
                            <button
                              key={qq.id}
                              onClick={() => setCurrent(i)}
                              className={cn(
                                "grid h-9 w-9 place-items-center rounded-lg text-xs font-mono font-semibold transition-all border",
                                isCurrent
                                  ? "border-violet-500 bg-violet-600 text-white shadow-sm ring-2 ring-violet-500/30"
                                  : isBookmarked
                                  ? "border-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-200"
                                  : isAnswered
                                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200"
                                  : "border-black/10 bg-black/[0.02] text-muted-foreground hover:border-black/20 dark:border-white/10 dark:bg-white/5",
                              )}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>

                      <ul className="mt-4 space-y-1.5 text-[11px] border-t border-black/5 pt-3 dark:border-white/5">
                        <Legend color="bg-emerald-500 ring-emerald-400/30" label="Answered" />
                        <Legend color="bg-amber-500 ring-amber-400/30" label="Bookmarked" />
                        <Legend color="bg-violet-600 ring-violet-400/60" label="Current" />
                        <Legend color="bg-black/10 dark:bg-white/10 ring-black/10" label="Unanswered" />
                      </ul>

                      <div className="mt-4 rounded-lg border border-black/5 bg-black/[0.02] p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Answered:</span>
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                            {answeredCount} / {questions.length}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-muted-foreground">Bookmarked:</span>
                          <span className="font-mono font-semibold text-amber-600 dark:text-amber-300">
                            {bookmarksCount} / {questions.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Submit Button */}
                <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-black/10 bg-card p-4 shadow-sm sm:flex-row sm:items-center dark:border-white/10">
                  <p className="text-[11px] text-muted-foreground">
                    <Info className="mr-1 inline h-3.5 w-3.5 text-sky-500" />
                    Auto-saving in real time · Tab switches: <span className="font-mono font-semibold text-foreground">{tabSwitches}</span> · Fullscreen exits: <span className="font-mono font-semibold text-foreground">{fullscreenExits}</span>
                  </p>
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    className="rounded-full bg-violet-600 px-6 text-white hover:bg-violet-700 shadow-sm"
                  >
                    Finish &amp; Submit Test
                  </Button>
                </div>

                {/* Submit Confirmation Modal */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogContent className="border-black/10 bg-card dark:border-white/10">
                    <DialogHeader>
                      <DialogTitle>Submit Aptitude Assessment?</DialogTitle>
                      <DialogDescription>
                        {answeredCount === questions.length
                          ? "All 25 questions answered. Are you ready to submit and calculate your scores?"
                          : `You have answered ${answeredCount} of ${questions.length} questions. Unanswered questions will receive 0 marks.`}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2">
                      <Button
                        variant="ghost"
                        disabled={submitting}
                        onClick={() => setConfirmOpen(false)}
                        className="rounded-full"
                      >
                        Keep Going
                      </Button>
                      <Button
                        disabled={submitting}
                        onClick={handleSubmitTest}
                        className="rounded-full bg-violet-600 text-white hover:bg-violet-700"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting &amp; Grading…
                          </>
                        ) : (
                          "Confirm Submission"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}

            {/* 3. RESULTS & EXPLANATIONS PHASE */}
            {phase === "results" && scorecard && (
              <motion.div
                key="results"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Scorecard Hero */}
                <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <Badge variant="outline" className="mb-2 border-emerald-400/30 bg-emerald-500/10 text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-200">
                        Assessment Graded
                      </Badge>
                      <h2 className="text-3xl font-bold tracking-tight">
                        <span className="text-violet-600 dark:text-violet-400">{scorecard.correct}</span> / {scorecard.totalQuestions} Correct
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Overall Score: <strong className="text-foreground">{scorecard.scorePercent}%</strong> · Accuracy: <strong className="text-foreground">{scorecard.accuracyPercent}%</strong> · Time: <strong className="text-foreground">{Math.floor(scorecard.durationSecondsUsed / 60)}m {scorecard.durationSecondsUsed % 60}s</strong>
                      </p>
                    </div>
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 ring-1 ring-inset ring-black/10 dark:ring-white/10">
                      <Trophy className="h-9 w-9 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <Progress value={scorecard.scorePercent} className="mt-5 h-2 bg-black/10 dark:bg-white/10" />
                </div>

                {/* Category Strength Breakdown */}
                <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Category Performance Breakdown</p>
                    <span className="text-[11px] text-muted-foreground">Pillar-wise evaluation</span>
                  </div>
                  <StaggeredReveal className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {scorecard.categoryBreakdown.map((c) => (
                      <motion.div
                        key={c.category}
                        variants={revealItem}
                        className="rounded-lg border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground/90">{c.category}</span>
                          <span
                            className={cn(
                              "font-mono font-bold",
                              c.scorePercent >= 75
                                ? "text-emerald-600 dark:text-emerald-300"
                                : c.scorePercent >= 50
                                ? "text-amber-600 dark:text-amber-300"
                                : "text-rose-600 dark:text-rose-300",
                            )}
                          >
                            {c.scorePercent}%
                          </span>
                        </div>
                        <Progress value={c.scorePercent} className="mt-2.5 h-1.5 bg-black/10 dark:bg-white/10" />
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          {c.correct} of {c.total} questions correct
                        </p>
                      </motion.div>
                    ))}
                  </StaggeredReveal>
                </div>

                {/* Proctoring Self-Awareness & Hiring Readiness Audit */}
                <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center border-b border-black/5 pb-4 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">Proctoring Self-Awareness &amp; Hiring Readiness Audit</h3>
                        <p className="text-xs text-muted-foreground">
                          Simulating real company hiring proctoring (TCS, Infosys, Amazon, HirePro).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "px-3 py-1 font-semibold text-xs",
                          scorecard.proctoringTelemetry?.verdict === "Clean Session"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : scorecard.proctoringTelemetry?.verdict === "Minor Inattentions"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        )}
                      >
                        {scorecard.proctoringTelemetry?.verdict ?? "Clean Session"}
                      </Badge>
                      <span className="font-mono text-sm font-bold text-foreground">
                        Integrity: {scorecard.proctoringTelemetry?.integrityScore ?? 100}/100
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3.5 text-xs leading-relaxed text-foreground/90">
                    <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-violet-500" />
                    <strong>Prep Mode Guarantee:</strong> This audit never penalizes your score or eligibility. It records real-time focus, device telemetry, and audio spikes so you become aware of habits before actual high-stakes corporate hiring rounds.
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Camera className="h-4 w-4" />
                        <span className="text-[11px] font-medium">Webcam Stream</span>
                      </div>
                      <p className="mt-2 font-mono text-sm font-bold">
                        {camEnabled ? "Monitored (Active)" : "Simulated Off"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Real video stream feed</p>
                    </div>

                    <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mic className="h-4 w-4" />
                        <span className="text-[11px] font-medium">Mic &amp; Audio Spikes</span>
                      </div>
                      <p className="mt-2 font-mono text-sm font-bold">
                        {scorecard.proctoringTelemetry?.audioSpikes ?? 0} Spikes
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Ambient sound deviations</p>
                    </div>

                    <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Maximize2 className="h-4 w-4" />
                        <span className="text-[11px] font-medium">Fullscreen &amp; Tabs</span>
                      </div>
                      <p className="mt-2 font-mono text-sm font-bold">
                        {(scorecard.proctoringTelemetry?.tabSwitches ?? 0) + (scorecard.proctoringTelemetry?.fullscreenExits ?? 0)} Events
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {scorecard.proctoringTelemetry?.tabSwitches ?? 0} tab switches · {scorecard.proctoringTelemetry?.fullscreenExits ?? 0} exits
                      </p>
                    </div>

                    <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[11px] font-medium">Clipboard &amp; Mouse</span>
                      </div>
                      <p className="mt-2 font-mono text-sm font-bold">
                        {(scorecard.proctoringTelemetry?.copyPasteAttempts ?? 0) + (scorecard.proctoringTelemetry?.mouseWindowLeaves ?? 0)} Events
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {scorecard.proctoringTelemetry?.copyPasteAttempts ?? 0} copy attempts · {scorecard.proctoringTelemetry?.mouseWindowLeaves ?? 0} window leaves
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Question Review & Solutions */}
                <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm dark:border-white/10 space-y-4">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center border-b border-black/5 pb-4 dark:border-white/5">
                    <div>
                      <h3 className="text-sm font-semibold">Detailed Question Review &amp; Mathematical Solutions</h3>
                      <p className="text-xs text-muted-foreground">
                        Step-by-step formulas and reasoning from the question bank.
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        ["all", `All (${scorecard.questions.length})`],
                        ["wrong", `Incorrect (${scorecard.incorrect})`],
                        ["correct", `Correct (${scorecard.correct})`],
                        ["bookmarked", `Bookmarked (${bookmarks.size})`],
                      ].map(([k, label]) => (
                        <button
                          key={k}
                          onClick={() => setResultsFilter(k as typeof resultsFilter)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                            resultsFilter === k
                              ? "bg-violet-600 text-white"
                              : "bg-black/5 text-muted-foreground hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {reviewQuestions.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No questions match the current filter.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviewQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="rounded-xl border border-black/10 bg-black/[0.01] p-5 dark:border-white/10 dark:bg-white/[0.01] space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-2.5 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <Badge className={CAT_TONES[q.category] || ""}>{q.category}</Badge>
                              {q.subTopic && (
                                <Badge variant="outline" className="text-[10px]">
                                  {q.subTopic}
                                </Badge>
                              )}
                              <span className="font-mono text-xs text-muted-foreground">#{q.position}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {q.isCorrect ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Correct (+1)
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300">
                                  <XCircle className="mr-1 h-3.5 w-3.5" /> Incorrect (0)
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-sm font-medium leading-relaxed">{q.questionText}</p>

                          {(() => {
                            const userOpt = getOptionDisplay(q.options, q.selectedOption);
                            const correctOpt = getOptionDisplay(q.options, q.correctOption);

                            return (
                              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
                                <div
                                  className={cn(
                                    "rounded-lg p-3 text-xs border transition-colors",
                                    !userOpt
                                      ? "border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]"
                                      : q.isCorrect
                                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                                      : "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                                      Your Answer
                                    </span>
                                    {userOpt && (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-[10px] px-1.5 py-0",
                                          q.isCorrect
                                            ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                            : "border-rose-500/40 text-rose-700 dark:text-rose-300"
                                        )}
                                      >
                                        Option {userOpt.letter}
                                      </Badge>
                                    )}
                                  </div>
                                  {userOpt ? (
                                    <p className="font-medium text-foreground leading-snug">
                                      {userOpt.text || `Option ${userOpt.letter}`}
                                    </p>
                                  ) : (
                                    <p className="italic text-muted-foreground">Not attempted (Unanswered)</p>
                                  )}
                                </div>

                                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-950 dark:text-emerald-100">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                      Correct Answer
                                    </span>
                                    {correctOpt && (
                                      <Badge
                                        variant="outline"
                                        className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0"
                                      >
                                        Option {correctOpt.letter}
                                      </Badge>
                                    )}
                                  </div>
                                  {correctOpt ? (
                                    <p className="font-medium text-foreground leading-snug">
                                      {correctOpt.text || `Option ${correctOpt.letter}`}
                                    </p>
                                  ) : (
                                    <p className="font-medium text-foreground">Option {q.correctOption}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {q.explanation && (
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-xs leading-relaxed text-foreground">
                              <span className="font-semibold text-violet-700 dark:text-violet-300">
                                <HelpCircle className="mr-1 inline h-3.5 w-3.5" /> Explanation &amp; Formula:
                              </span>{" "}
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-6 dark:border-white/10">
                  <Button
                    variant="outline"
                    disabled={loading}
                    onClick={handleStartTest}
                    className="rounded-full border-black/10 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Take Again (New Random 25 Questions)
                  </Button>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={continueToCoding}
                      className="rounded-full bg-violet-600 px-6 font-semibold text-white hover:bg-violet-700 shadow-md"
                    >
                      <Code2 className="mr-1.5 h-4 w-4" /> Continue to Coding Arena (Step 3)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => set("dashboard")}
                      className="rounded-full border-black/10 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
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

      {/* Re-enter Fullscreen Warning Modal (only shown during active test) */}
      <Dialog open={reenterOpen && phase === "test"} onOpenChange={setReenterOpen}>
        <DialogContent className="border-amber-400/30 bg-card dark:border-amber-400/20">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-amber-500/15">
              <Maximize2 className="h-8 w-8 text-amber-500" />
            </div>
            <DialogTitle className="text-center">Re-enter fullscreen</DialogTitle>
            <DialogDescription className="text-center">
              You left fullscreen mode. Re-enter to resume your practice session. Prep mode is forgiving, so there are no penalties.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReenterOpen(false);
                exitFullscreen();
                setNavigationLocked(false);
                setPhase("rules");
              }}
              className="rounded-full text-xs"
            >
              Exit to Rules
            </Button>
            <Button
              size="sm"
              onClick={() => {
                requestFullscreen();
                setReenterOpen(false);
              }}
              className="rounded-full bg-violet-600 text-xs text-white hover:bg-violet-700"
            >
              <Maximize2 className="mr-2 h-4 w-4" /> Re-enter Fullscreen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Helper Components */

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
