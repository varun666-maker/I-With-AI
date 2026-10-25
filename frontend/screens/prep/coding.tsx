"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { generateAICodeReview } from "@/lib/ai-code-reviewer";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-full items-center justify-center bg-[#1e1e1e] font-mono text-xs text-zinc-400">
      <Clock className="mr-2 h-4 w-4 animate-spin text-violet-400" />
      Loading LeetCode Editor Environment...
    </div>
  ),
});
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Info,
  Maximize2,
  Play,
  RotateCcw,
  Shield,
  Shuffle,
  Sparkles,
  Terminal,
  Wand2,
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
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  requestFullscreen,
  exitFullscreen,
} from "@/lib/fullscreen";
import {
  CODING_PROBLEMS,
  getProblemById,
  type CodingProblem,
  type Difficulty,
} from "@/lib/coding-problems";
import { runCodeViaApi, type EvaluatedTestCase } from "@/lib/code-evaluator";
import { useProctoring } from "@/lib/proctoring";
import { ProblemListTable } from "@/components/shared/problem-list-table";
import { getSuggestions, type SuggestionItem } from "@/lib/code-suggestions";
import { toast } from "sonner";

const LANGUAGES = ["Python", "Java", "JavaScript", "C++"] as const;
type SupportedLanguage = (typeof LANGUAGES)[number];

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Easy: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  Medium: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  Hard: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};


function pickRandomUnsolved(solvedSet: Set<number>, excludeId?: number): CodingProblem {
  const candidates = CODING_PROBLEMS.filter(
    (p) => !solvedSet.has(p.id) && (excludeId === undefined || p.id !== excludeId),
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

  const solvedNums = useMemo(() => solvedProblems.map((id) => Number(id)), [solvedProblems]);
  const attemptedNums = useMemo(
    () => attemptedProblems.map((id) => Number(id)),
    [attemptedProblems],
  );
  const heatSubs = useMemo(
    () => submissions.map((s) => ({ ...s, problemId: Number(s.problemId) })),
    [submissions],
  );

  const setIsRandomMode = useNav((s) => s.setIsRandomMode);

  const enterProblem = (p: CodingProblem, isRandom = false) => {
    setCurrentProblem(String(p.id));
    setIsRandomMode(isRandom);
    setCodingView("editor");
    requestFullscreen();
    setNavigationLocked(true);
  };

  const handleRandom = () => {
    const solved = new Set(solvedNums);
    enterProblem(pickRandomUnsolved(solved), true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap wide>
        <BackToHome />
        <SectionHeading
          eyebrow="Coding Arena"
          title={
            <>
              Master 600+ DSA Questions with{" "}
              <span className="text-violet-500 dark:text-violet-400">Multi-Language Sandbox</span>
            </>
          }
          description="A VS Code-grade environment with real Java, Python, and JavaScript compilation, test case verification, company-tagged problem sets, and optional proctoring simulation."
          align="left"
        />

        <div className="mt-6">
          <ProblemListTable
            solvedProblems={solvedNums}
            attemptedProblems={attemptedNums}
            submissions={heatSubs}
            onPickProblem={(p) => enterProblem(p, false)}
            onRandomQuestion={handleRandom}
          />
        </div>
      </PageWrap>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PERSISTENT USER CODE STORAGE HELPERS                                      */
/* -------------------------------------------------------------------------- */

function getSavedCodeKey(userId: string | null, problemId: number | string, lang: string): string {
  return `arena_code_p${problemId}_${lang}`;
}

function loadSavedCode(userId: string | null, problemId: number | string, lang: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    const directKey = `arena_code_p${problemId}_${lang}`;
    const userKey = `arena_code_${userId || "guest"}_${problemId}_${lang}`;
    const legacyKey = `coding_code_${userId || "guest"}_${problemId}_${lang}`;
    const val = localStorage.getItem(directKey) ?? localStorage.getItem(userKey) ?? localStorage.getItem(legacyKey);
    if (val !== null) return val;

    // Check master solutions dictionary
    const masterRaw = localStorage.getItem("arena_all_saved_solutions");
    if (masterRaw) {
      const map = JSON.parse(masterRaw);
      const compositeKey = `${problemId}_${lang}`;
      if (compositeKey in map && typeof map[compositeKey] === "string") {
        return map[compositeKey];
      }
    }
  } catch {}
  return fallback;
}

function saveCodeToStorage(userId: string | null, problemId: number | string, lang: string, code: string): void {
  if (typeof window === "undefined") return;
  try {
    const directKey = `arena_code_p${problemId}_${lang}`;
    const userKey = `arena_code_${userId || "guest"}_${problemId}_${lang}`;
    localStorage.setItem(directKey, code);
    localStorage.setItem(userKey, code);

    // Save into master dictionary so code is never lost under any circumstance
    const masterRaw = localStorage.getItem("arena_all_saved_solutions");
    const map = masterRaw ? JSON.parse(masterRaw) : {};
    map[`${problemId}_${lang}`] = code;
    localStorage.setItem("arena_all_saved_solutions", JSON.stringify(map));
  } catch {}
}

/* -------------------------------------------------------------------------- */
/*  EDITOR VIEW                                                               */
/* -------------------------------------------------------------------------- */

function CodingEditorView() {
  const { set } = useNav();
  const currentProblemId = useNav((s) => s.currentProblemId);
  const currentUserId = useNav((s) => s.currentUserId);
  const setCurrentProblem = useNav((s) => s.setCurrentProblem);
  const setCodingView = useNav((s) => s.setCodingView);
  const solvedProblems = useNav((s) => s.solvedProblems);
  const markSolved = useNav((s) => s.markSolved);
  const markAttempted = useNav((s) => s.markAttempted);
  const recordSubmission = useNav((s) => s.recordSubmission);
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);
  const reduce = useReducedMotion();

  // Resolve active problem
  const problem = useMemo<CodingProblem>(() => {
    const id = currentProblemId ? Number(currentProblemId) : null;
    if (id !== null) {
      const found = getProblemById(id);
      if (found) return found;
    }
    return CODING_PROBLEMS[0];
  }, [currentProblemId]);

  // Restore user's preferred language or active language for this problem
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved =
        localStorage.getItem(`arena_lang_p${problem.id}`) ||
        localStorage.getItem("arena_last_lang");
      if (saved && (LANGUAGES as readonly string[]).includes(saved)) {
        return saved as SupportedLanguage;
      }
    }
    return "Python";
  });

  // Per-language code buffers with persistent storage recovery
  const [codeByLang, setCodeByLang] = useState<Record<string, string>>(() => ({
    Python: loadSavedCode(currentUserId, problem.id, "Python", problem.starterCode.Python ?? "class Solution:\n    def solve(self, *args):\n        pass\n"),
    Java: loadSavedCode(currentUserId, problem.id, "Java", problem.starterCode.Java ?? "class Solution {\n    public Object solve(Object... args) {\n        return null;\n    }\n}\n"),
    JavaScript: loadSavedCode(currentUserId, problem.id, "JavaScript", problem.starterCode.JavaScript ?? "var solution = function(...args) {\n};\n"),
    "C++": loadSavedCode(currentUserId, problem.id, "C++", problem.starterCode["C++"] ?? "class Solution {\npublic:\n    // implement\n};\n"),
  }));

  // Synchronize from persistent storage whenever problemId or currentUserId changes
  useEffect(() => {
    setCodeByLang({
      Python: loadSavedCode(currentUserId, problem.id, "Python", problem.starterCode.Python ?? "class Solution:\n    def solve(self, *args):\n        pass\n"),
      Java: loadSavedCode(currentUserId, problem.id, "Java", problem.starterCode.Java ?? "class Solution {\n    public Object solve(Object... args) {\n        return null;\n    }\n}\n"),
      JavaScript: loadSavedCode(currentUserId, problem.id, "JavaScript", problem.starterCode.JavaScript ?? "var solution = function(...args) {\n};\n"),
      "C++": loadSavedCode(currentUserId, problem.id, "C++", problem.starterCode["C++"] ?? "class Solution {\npublic:\n    // implement\n};\n"),
    });
    // Also restore language if saved for this problem
    if (typeof window !== "undefined") {
      const saved =
        localStorage.getItem(`arena_lang_p${problem.id}`) ||
        localStorage.getItem("arena_last_lang");
      if (saved && (LANGUAGES as readonly string[]).includes(saved)) {
        setLanguage(saved as SupportedLanguage);
      }
    }
    setResults(null);
  }, [problem.id, currentUserId]);

  const code = codeByLang[language] ?? "";

  const isRandomMode = useNav((s) => s.isRandomMode);
  const setIsRandomMode = useNav((s) => s.setIsRandomMode);

  const [results, setResults] = useState<EvaluatedTestCase[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeCaseTab, setActiveCaseTab] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [reenterOpen, setReenterOpen] = useState(false);
  const [devToolsAttempts, setDevToolsAttempts] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);

  // Code editor IntelliSense and cursor state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number>(0);

  const activeLineIdx = useMemo(() => {
    return code.slice(0, cursorPos).split("\n").length - 1;
  }, [code, cursorPos]);

  const activeColIdx = useMemo(() => {
    const lines = code.slice(0, cursorPos).split("\n");
    return lines[lines.length - 1].length;
  }, [code, cursorPos]);

  // Automatically open problem in fullscreen mode on mount
  useEffect(() => {
    requestFullscreen();
    setNavigationLocked(true);
    return () => {
      exitFullscreen();
      setNavigationLocked(false);
    };
  }, [setNavigationLocked]);


  // Anti-cheat proctoring hook
  const { startMonitoring, stopMonitoring, stats: proctorStats } = useProctoring({
    mode: "informational",
    onWarning: (msg) => {
      toast.warning(`${msg} · Logged in prep self-awareness stats`);
    },
    onFullscreenExit: () => {
      setReenterOpen(true);
    },
  });

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  // Fullscreen exit listener to prompt re-entry on ESC
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setReenterOpen(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Anti-cheat key & copy event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        setDevToolsAttempts((n) => n + 1);
        toast.warning("Developer Tools shortcuts are restricted during prep simulation");
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("textarea")) {
        e.preventDefault();
        setCopyAttempts((n) => n + 1);
        toast.warning("Copying question text is disabled in prep simulation");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  // Autosave notification simulation
  useEffect(() => {
    const t = setInterval(() => {
      queueMicrotask(() => setAutoSaved(true));
      setTimeout(() => queueMicrotask(() => setAutoSaved(false)), 1500);
    }, 25000);
    return () => clearInterval(t);
  }, []);

  const handleLangChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(`arena_lang_p${problem.id}`, newLang);
      localStorage.setItem("arena_last_lang", newLang);
    }
    setResults(null);
    setSubmitted(false);
  };
  const updateSuggestionsForCursor = (newCode: string, pos: number) => {
    setCursorPos(pos);
    const textBefore = newCode.slice(0, pos);
    const match = textBefore.match(/([a-zA-Z0-9_\.]+)$/);
    if (match && match[1].length >= 1) {
      const prefix = match[1];
      const matched = getSuggestions(language, prefix);
      setSuggestions(matched);
      setSelectedSuggestionIdx(0);
    } else {
      setSuggestions([]);
    }
  };

  const applySuggestion = (item: SuggestionItem) => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = code.slice(0, pos);
    const match = textBefore.match(/([a-zA-Z0-9_\.]+)$/);
    if (!match) return;

    const prefixLen = match[1].length;
    const startReplace = pos - prefixLen;
    const newCode = code.slice(0, startReplace) + item.insertText + code.slice(pos);
    setCodeByLang((prev) => ({ ...prev, [language]: newCode }));
    setSuggestions([]);

    const newPos = startReplace + item.insertText.length - (item.cursorOffset ?? 0);
    queueMicrotask(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
        setCursorPos(newPos);
      }
    });
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIdx]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
        return;
      }
    }

    // Tab key inserts 4 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart ?? 0;
      const end = textareaRef.current?.selectionEnd ?? 0;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCodeByLang((prev) => ({ ...prev, [language]: newCode }));
      queueMicrotask(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
          setCursorPos(start + 4);
        }
      });
      return;
    }

    // Auto-closing brackets and quotes
    const PAIRS: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    };
    if (PAIRS[e.key]) {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart ?? 0;
      const end = textareaRef.current?.selectionEnd ?? 0;
      const closing = PAIRS[e.key];
      const newCode = code.substring(0, start) + e.key + closing + code.substring(end);
      setCodeByLang((prev) => ({ ...prev, [language]: newCode }));
      queueMicrotask(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
          setCursorPos(start + 1);
        }
      });
      return;
    }

    // Auto-indent on Enter
    if (e.key === "Enter") {
      const start = textareaRef.current?.selectionStart ?? 0;
      const linesBefore = code.substring(0, start).split("\n");
      const currentLine = linesBefore[linesBefore.length - 1];
      const matchIndent = currentLine.match(/^(\s*)/);
      let indent = matchIndent ? matchIndent[1] : "";
      if (currentLine.trimEnd().endsWith(":") || currentLine.trimEnd().endsWith("{")) {
        indent += "    ";
      }
      e.preventDefault();
      const newCode = code.substring(0, start) + "\n" + indent + code.substring(start);
      setCodeByLang((prev) => ({ ...prev, [language]: newCode }));
      queueMicrotask(() => {
        if (textareaRef.current) {
          const nextPos = start + 1 + indent.length;
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = nextPos;
          setCursorPos(nextPos);
        }
      });
      return;
    }
  };

  const resetCurrentCode = () => {
    const starter = problem.starterCode[language] ?? "";
    setCodeByLang((prev) => ({ ...prev, [language]: starter }));
    saveCodeToStorage(currentUserId, problem.id, language, starter);
    toast.info(`Reset ${language} code to initial template`);
  };

  const run = async () => {
    setRunning(true);
    try {
      const evalRes = await runCodeViaApi(problem.id, code, language, false);
      setResults(evalRes.results);
      setSubmitted(false);
      setActiveCaseTab(0);
      toast.info(`Ran ${evalRes.results.length} test cases: ${evalRes.passCount} passed`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to execute code");
    } finally {
      setRunning(false);
    }
  };

  const submit = async () => {
    setRunning(true);
    try {
      const evalRes = await runCodeViaApi(problem.id, code, language, true);
      setResults(evalRes.results);
      setSubmitted(true);
      setActiveCaseTab(0);
      const idStr = String(problem.id);
      if (evalRes.allPassed) {
        markSolved(idStr);
        recordSubmission(idStr, true);
        setSuccessOpen(true);
      } else {
        markAttempted(idStr);
        recordSubmission(idStr, false);
        toast.warning(`Submission evaluated: ${evalRes.passCount}/${evalRes.total} test cases passed`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Submission failed");
    } finally {
      setRunning(false);
    }
  };

  const passCount = results ? results.filter((r) => r.status === "pass").length : 0;

  // Clean exit from fullscreen back to list view
  const handleBack = () => {
    exitFullscreen();
    setNavigationLocked(false);
    setCodingView("list");
  };

  // Problem navigation: sequential Prev, Next, and Random Shuffle
  const currentIndex = useMemo(() => {
    const idx = CODING_PROBLEMS.findIndex((p) => p.id === problem.id);
    return idx >= 0 ? idx : 0;
  }, [problem.id]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsRandomMode(false);
      const prev = CODING_PROBLEMS[currentIndex - 1];
      setCurrentProblem(String(prev.id));
      setSuccessOpen(false);
    }
  };

  const handleShuffle = () => {
    const solved = new Set(solvedProblems.map((id) => Number(id)));
    const next = pickRandomUnsolved(solved, problem.id);
    setIsRandomMode(true);
    setCurrentProblem(String(next.id));
    setSuccessOpen(false);
    toast.info(`Random Question #${next.id}: ${next.title}`);
  };

  const handleNext = () => {
    if (isRandomMode) {
      handleShuffle();
    } else {
      if (currentIndex < CODING_PROBLEMS.length - 1) {
        const next = CODING_PROBLEMS[currentIndex + 1];
        setCurrentProblem(String(next.id));
        setSuccessOpen(false);
      }
    }
  };

  const continueToInterview = () => {
    setSuccessOpen(false);
    exitFullscreen();
    setNavigationLocked(false);
    set("interview");
  };

  const difficultyBadge = DIFFICULTY_BADGE[problem.difficulty];
  const fileExt =
    language === "Python"
      ? "py"
      : language === "Java"
      ? "java"
      : language === "C++"
      ? "cpp"
      : "js";

  const totalWarnings =
    proctorStats.totalViolations + devToolsAttempts + copyAttempts;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PageWrap wide>
        {/* Top bar: Back / Title / Proctoring Status / Prev / Next / Shuffle */}
        <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Problems
          </Button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-center">
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
              <span className="font-mono text-muted-foreground">#{problem.id}</span>{" "}
              {problem.title}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground hidden md:inline">
              ({currentIndex + 1} of {CODING_PROBLEMS.length})
            </span>
            <Badge className={cn("shrink-0", difficultyBadge)}>{problem.difficulty}</Badge>
            <Badge variant="outline" className="hidden lg:inline-flex border-black/10 text-xs dark:border-white/15">
              {problem.topic}
            </Badge>
            {isRandomMode && (
              <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-[10px]">
                🎲 Random Practice
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-700 dark:text-violet-300">
              <Shield className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-medium hidden sm:inline">Proctoring Guard</span>
              {totalWarnings > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {totalWarnings}
                </span>
              )}
            </div>

            {/* Prev, Next, and Shuffle navigation */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="h-8 rounded-full border-black/10 px-2.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10 disabled:opacity-40"
                title="Previous sequential problem"
              >
                <ChevronLeft className="mr-0.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                disabled={!isRandomMode && currentIndex >= CODING_PROBLEMS.length - 1}
                className="h-8 rounded-full bg-violet-500 px-3 text-xs text-white hover:bg-violet-600 shadow-sm disabled:opacity-40"
                title={isRandomMode ? "Next random question" : "Next problem in catalog"}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleShuffle}
                className="h-8 rounded-full border-black/10 px-2.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                title="Pick another random question"
              >
                <Shuffle className="h-3.5 w-3.5 text-violet-500" />
                <span className="hidden sm:inline ml-1">Shuffle</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT PANE: Problem description & constraints (Copy Protected) */}
          <div
            className="flex h-full flex-col rounded-xl border border-black/10 bg-card p-6 shadow-sm select-none dark:border-white/10"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  <span className="font-mono text-muted-foreground">#{problem.id}</span>{" "}
                  {problem.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Problem #{problem.id} · {problem.topic} · Acceptance Rate{" "}
                  <span className="text-emerald-600 font-semibold dark:text-emerald-300">
                    {problem.acceptance}%
                  </span>
                </p>
              </div>
              {problem.leetcodeLink && (
                <a
                  href={problem.leetcodeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-violet-500 transition-colors"
                >
                  <span>LeetCode</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Target Companies */}
            {problem.companies && problem.companies.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Asked at:</span>
                {problem.companies.map((c, idx) => (
                  <span
                    key={`${c}-${idx}`}
                    className="rounded bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-foreground/80 dark:bg-white/[0.06]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Problem Statement */}
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
              <p>{problem.description}</p>
            </div>

            {/* Examples */}
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Examples
              </p>
              <div className="mt-2 space-y-2.5">
                {problem.examples.map((e, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-black/10 bg-zinc-950 p-3 font-mono text-xs dark:border-white/10"
                  >
                    <p className="text-emerald-300">
                      Input: <span className="text-zinc-200">{e.input}</span>
                    </p>
                    <p className="mt-1 text-violet-300">
                      Output: <span className="text-zinc-200">{e.output}</span>
                    </p>
                    {e.explanation && <p className="mt-1 text-zinc-400"># {e.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Constraints
              </p>
              <ul className="mt-2 space-y-1.5 font-mono text-xs text-foreground/75">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-muted-foreground">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Time Limit: {problem.timeLimit || 1000}ms</span> ·{" "}
                <span>Memory Limit: {problem.memoryLimit || 256}MB</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: Code Editor & Test Case Runner */}
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-card shadow-sm dark:border-white/10">
            {/* Editor Chrome Bar */}
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-2.5 bg-black/[0.01] dark:border-white/5 dark:bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-violet-500" />
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  Solution.{fileExt}
                </span>
                <span className="rounded bg-violet-500/10 px-1.5 py-0.2 text-[10px] font-medium text-violet-600 dark:text-violet-300">
                  Auto-imports active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={language}
                  onValueChange={(v) => handleLangChange(v as SupportedLanguage)}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-32 rounded-lg border-black/10 bg-background text-xs dark:border-white/10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l} className="text-xs">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCurrentCode}
                  title="Reset to starter template"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>

                {autoSaved && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-300">
                    <Check className="mr-0.5 inline h-3 w-3" /> Saved
                  </span>
                )}
              </div>
            </div>

            {/* LeetCode Environment & Prebuilt Auto-Imports Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 px-4 py-2 bg-zinc-900/30 text-[11px] dark:border-white/5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">
                  {language === "Python" && "Python 3.11 Runtime"}
                  {language === "Java" && "Java OpenJDK 21 Runtime"}
                  {language === "JavaScript" && "Node.js (ES2022) Runtime"}
                  {language === "C++" && "GCC C++20 Runtime"}
                </span>
                <span className="text-muted-foreground/60 hidden sm:inline">·</span>
                <span className="font-mono text-xs text-violet-600 dark:text-violet-400">
                  {language === "Python" && "Pre-imported: typing, collections, heapq, bisect, math (no imports needed)"}
                  {language === "Java" && "Pre-imported: java.util.*, java.io.*, java.math.*"}
                  {language === "JavaScript" && "Pre-imported: Math, Map, Set, BigInt"}
                  {language === "C++" && "Pre-included: <vector>, <string>, <unordered_map>, <algorithm>"}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300">
                LeetCode Auto-Imports Active
              </Badge>
            </div>

            {/* Editor Area with Authentic LeetCode Monaco Editor */}
            <div className="relative border-b border-black/10 bg-[#1e1e1e] font-mono dark:border-white/5">
              <MonacoEditor
                height="380px"
                path={`solution_p${problem.id}_${language}.${fileExt}`}
                language={
                  language === "Python"
                    ? "python"
                    : language === "Java"
                      ? "java"
                      : language === "C++"
                        ? "cpp"
                        : "javascript"
                }
                theme="vs-dark"
                value={code}
                onChange={(val) => {
                  const nextVal = val ?? "";
                  setCodeByLang((prev) => ({ ...prev, [language]: nextVal }));
                  saveCodeToStorage(currentUserId, problem.id, language, nextVal);
                  setAutoSaved(true);
                }}
                onMount={(editor, monaco) => {
                  editor.onDidChangeCursorPosition((e) => {
                    const offset = editor.getModel()?.getOffsetAt(e.position) ?? 0;
                    setCursorPos(offset);
                  });

                  // Register auto-completion provider for .* and standard DSA modules
                  if (!(monaco.languages as any)._dsaCompletionsRegistered) {
                    (monaco.languages as any)._dsaCompletionsRegistered = true;

                    monaco.languages.registerCompletionItemProvider("python", {
                      triggerCharacters: [".", "*", "i"],
                      provideCompletionItems: (model, position) => {
                        const word = model.getWordUntilPosition(position);
                        const range = {
                          startLineNumber: position.lineNumber,
                          endLineNumber: position.lineNumber,
                          startColumn: word.startColumn,
                          endColumn: word.endColumn,
                        };

                        return {
                          suggestions: [
                            {
                              label: ".* (Auto-Import All Standard DSA Modules)",
                              kind: monaco.languages.CompletionItemKind.Snippet,
                              insertText: "from typing import List, Dict, Tuple, Set, Optional, Any\nfrom collections import defaultdict, deque, Counter\nfrom heapq import heappush, heappop, heapify\nimport math\n",
                              detail: "Inserts complete standard library DSA imports",
                              range,
                            },
                            {
                              label: "typing.*",
                              kind: monaco.languages.CompletionItemKind.Snippet,
                              insertText: "from typing import List, Dict, Tuple, Set, Optional, Any\n",
                              detail: "Pre-imported: List, Dict, Tuple, Set, Optional",
                              range,
                            },
                            {
                              label: "collections.*",
                              kind: monaco.languages.CompletionItemKind.Snippet,
                              insertText: "from collections import defaultdict, deque, Counter\n",
                              detail: "Pre-imported: deque, defaultdict, Counter",
                              range,
                            },
                            {
                              label: "heapq.*",
                              kind: monaco.languages.CompletionItemKind.Snippet,
                              insertText: "from heapq import heappush, heappop, heapify\n",
                              detail: "Pre-imported: heappush, heappop, heapify",
                              range,
                            },
                            {
                              label: "math.*",
                              kind: monaco.languages.CompletionItemKind.Snippet,
                              insertText: "import math\n",
                              detail: "Pre-imported: math.isqrt, math.inf, etc.",
                              range,
                            },
                          ],
                        };
                      },
                    });
                  }
                }}
                options={{
                  fontSize: 13.5,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace",
                  fontLigatures: true,
                  tabSize: 4,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: "on",
                  lineNumbersMinChars: 3,
                  wordWrap: "on",
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  matchBrackets: "always",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  padding: { top: 12, bottom: 12 },
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />

              {/* Status bar */}
              <div className="flex items-center justify-between border-t border-white/5 bg-[#181818] px-3 py-1 font-mono text-[11px] text-zinc-400 select-none">
                <div className="flex items-center gap-3">
                  <span>Ln {activeLineIdx + 1}, Col {activeColIdx + 1}</span>
                  <span>Spaces: 4</span>
                  <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-violet-400">LeetCode IntelliSense Active</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-black/10 p-3.5 dark:border-white/5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={run}
                    disabled={running}
                    className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    {running ? (
                      <Clock className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-3.5 w-3.5" />
                    )}
                    Run Code
                  </Button>

                  <Button
                    size="sm"
                    onClick={submit}
                    disabled={running}
                    className="rounded-full bg-violet-500 text-white hover:bg-violet-600 shadow-sm"
                  >
                    {running ? (
                      <Clock className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                    )}
                    Submit Solution
                  </Button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-muted-foreground text-xs hover:text-amber-500 hover:bg-amber-500/10"
                    onClick={() => {
                      const defaultStarter = problem.starterCode[language] ?? "";
                      setCodeByLang((prev) => ({ ...prev, [language]: defaultStarter }));
                      saveCodeToStorage(currentUserId, problem.id, language, defaultStarter);
                      toast.info(`Reset to default ${language} starter template`);
                    }}
                    title="Reset to default starter template"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Template
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-muted-foreground text-xs"
                    onClick={() => {
                      navigator.clipboard?.writeText(code);
                      toast.success("Code copied to clipboard");
                    }}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Code
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Case & Submission Results Drawer */}
            {results && (
              <div className="border-t border-black/10 bg-black/[0.01] p-4 dark:border-white/5 dark:bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {submitted ? "Submission Result" : "Run Verification"}
                    </span>
                    <Badge
                      className={cn(
                        "text-[11px]",
                        passCount === results.length
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-400/30"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-400/30",
                      )}
                    >
                      {passCount}/{results.length} Passed
                    </Badge>
                  </div>
                </div>

                {/* Case Tabs */}
                <div className="mt-3 flex items-center gap-1.5 border-b border-black/5 pb-2 dark:border-white/5 overflow-x-auto">
                  {results.map((r, idx) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setActiveCaseTab(idx)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                        activeCaseTab === idx
                          ? "bg-violet-500 text-white font-semibold"
                          : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5",
                      )}
                    >
                      {r.status === "pass" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-rose-400" />
                      )}
                      <span>Case {r.id}</span>
                    </button>
                  ))}
                </div>

                {/* Active Case Details */}
                {results[activeCaseTab] && (
                  <div className="mt-3 space-y-2 font-mono text-xs">
                    {results[activeCaseTab].input && (
                      <div className="rounded-lg bg-zinc-950 p-3 text-zinc-300">
                        <span className="text-muted-foreground block text-[10px] uppercase font-sans font-semibold">
                          Input:
                        </span>
                        <span className="mt-0.5 block">{results[activeCaseTab].input}</span>
                      </div>
                    )}
                    {results[activeCaseTab].expected && (
                      <div className="rounded-lg bg-zinc-950 p-3 text-emerald-300">
                        <span className="text-muted-foreground block text-[10px] uppercase font-sans font-semibold">
                          Expected Output:
                        </span>
                        <span className="mt-0.5 block">{results[activeCaseTab].expected}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3",
                        results[activeCaseTab].status === "pass"
                          ? "bg-zinc-950 text-emerald-300"
                          : "bg-rose-950/30 text-rose-300 border border-rose-500/20",
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-sans text-muted-foreground font-semibold">
                        <span>Your Output:</span>
                        <span>Runtime: {results[activeCaseTab].runtime}</span>
                      </div>
                      <span className="mt-0.5 block font-mono">{results[activeCaseTab].got || "(empty)"}</span>
                    </div>
                    {results[activeCaseTab].error && (
                      <div className="rounded-lg bg-rose-950/50 p-3 text-rose-200 text-[11px]">
                        <span className="text-rose-400 font-sans block text-[10px] uppercase font-semibold">
                          Error Details:
                        </span>
                        <pre className="whitespace-pre-wrap mt-0.5 font-mono">{results[activeCaseTab].error}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Code Reviewer Section (Matches User's Provided UI Photo) */}
            {results && (
              <div className="border-t border-black/10 p-4 dark:border-white/5">
                <AICodeReviewerCard
                  problem={problem}
                  code={code}
                  language={language}
                  results={results}
                  allPassed={passCount === results.length}
                  passCount={passCount}
                  totalCount={results.length}
                  proctorStats={proctorStats}
                />
              </div>
            )}

            {/* Proctoring live stats footer (shown before run is executed) */}
            {!results && (
              <div className="mt-auto border-t border-black/10 px-4 py-2.5 text-[11px] text-muted-foreground dark:border-white/5">
                <Info className="mr-1 inline h-3.5 w-3.5 text-violet-500" />
                <span>Fullscreen exits: </span>
                <strong className="text-foreground">{proctorStats.fullscreenExits}</strong> ·{" "}
                <span>Tab switches: </span>
                <strong className="text-foreground">{proctorStats.tabSwitches}</strong> ·{" "}
                <span>DevTools attempts: </span>
                <strong className="text-foreground">{devToolsAttempts}</strong> ·{" "}
                <span>Copy blocks: </span>
                <strong className="text-foreground">{copyAttempts}</strong> (Recorded for prep self-awareness)
              </div>
            )}
          </div>
        </div>
      </PageWrap>

      {/* Re-enter Fullscreen Modal on ESC */}
      <Dialog open={reenterOpen} onOpenChange={setReenterOpen}>
        <DialogContent className="border-black/10 bg-card p-6 shadow-2xl dark:border-white/10 sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-violet-500/15 text-violet-500">
              <Maximize2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Fullscreen Mode Exited
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground mt-1">
              You exited fullscreen mode (ESC pressed). Coding simulations require fullscreen to prevent distractions and simulate technical interview environments.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReenterOpen(false);
                handleBack();
              }}
              className="rounded-full border-black/10 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              Exit to Problem List
            </Button>
            <Button
              size="sm"
              onClick={() => {
                requestFullscreen();
                setReenterOpen(false);
              }}
              className="rounded-full bg-violet-500 text-xs text-white hover:bg-violet-600 shadow-md"
            >
              <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
              Re-enter Fullscreen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal: All tests passed */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md border-emerald-400/30 bg-card p-6 dark:border-emerald-400/20">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">Accepted</DialogTitle>
            <DialogDescription className="text-center text-sm">
              All {problem.testCases.length} test cases passed. Problem{" "}
              <span className="font-semibold text-foreground">
                #{problem.id} {problem.title}
              </span>{" "}
              is now marked as solved!
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-2.5">
            <Button
              onClick={handleNext}
              className="w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              Next Question <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={continueToInterview}
              className="w-full rounded-full border-black/10 dark:border-white/10"
            >
              Continue to AI Interview
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSuccessOpen(false);
                handleBack();
              }}
              className="w-full rounded-full text-muted-foreground text-xs"
            >
              Return to Problem List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AI CODE REVIEWER CARD (Matches User Sample Photo)                          */
/* -------------------------------------------------------------------------- */

interface AICodeReviewerCardProps {
  problem: CodingProblem;
  code: string;
  language: SupportedLanguage;
  results: EvaluatedTestCase[] | null;
  allPassed: boolean;
  passCount: number;
  totalCount: number;
  proctorStats: { fullscreenExits: number; tabSwitches: number };
}

function AICodeReviewerCard({
  problem,
  code,
  language,
  results,
  allPassed,
  passCount,
  totalCount,
  proctorStats,
}: AICodeReviewerCardProps) {
  const [refactorExpanded, setRefactorExpanded] = useState(false);
  const [asyncSnippet, setAsyncSnippet] = useState<string | null>(null);
  const [isRefactorLoading, setIsRefactorLoading] = useState(true);

  const review = useMemo(() => {
    return generateAICodeReview(problem, code, language, results, passCount, totalCount);
  }, [problem, code, language, results, passCount, totalCount]);

  useEffect(() => {
    let active = true;
    setIsRefactorLoading(true);
    void fetch("/api/v1/me/coding/ai-refactor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.id,
        language,
        code,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.success && data?.snippet) {
          setAsyncSnippet(data.snippet);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsRefactorLoading(false);
      });

    return () => {
      active = false;
    };
  }, [problem.id, language, code]);

  const activeSnippet = asyncSnippet || review.refactoredSnippet;

  const copyRefactor = () => {
    navigator.clipboard?.writeText(activeSnippet);
    toast.success("Refactored snippet copied to clipboard");
  };

  const exportSnippet = () => {
    const ext = language === "Python" ? "py" : language === "Java" ? "java" : language === "C++" ? "cpp" : "js";
    const blob = new Blob([activeSnippet], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution_refactored.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Snippet exported as file");
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-violet-500" />
          <span className="font-bold text-base text-foreground">AI Code Review</span>
          <Badge
            variant="outline"
            className="text-xs border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 font-normal px-2.5 py-0.5"
          >
            AI Review · {language}
          </Badge>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="rounded-xl border border-black/10 bg-black/[0.01] p-5 dark:border-white/5 dark:bg-white/[0.01]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Score</span>
          <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
            {review.overallScore}/100
          </span>
        </div>

        {/* Full-width Overall Score Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-5">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500"
            style={{ width: `${review.overallScore}%` }}
          />
        </div>

        {/* 4 Sub-metrics with mini progress bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">Correctness</span>
              <span className="font-bold text-foreground">{review.correctnessScore}</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-300"
                style={{ width: `${review.correctnessScore}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">Code Quality</span>
              <span className="font-bold text-foreground">{review.codeQualityScore}</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-300"
                style={{ width: `${review.codeQualityScore}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">Readability</span>
              <span className="font-bold text-foreground">{review.readabilityScore}</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-300"
                style={{ width: `${review.readabilityScore}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">Complexity</span>
              <span className="font-bold text-foreground">{review.complexityScore}</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-300"
                style={{ width: `${review.complexityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Time and Space Complexity Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          {/* Time Complexity Card */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border p-3 transition-colors",
              review.isTimeOptimal
                ? "border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/20"
                : review.timeBigO === "N/A"
                  ? "border-zinc-500/20 bg-zinc-500/[0.02]"
                  : "border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/20"
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-violet-500" />
                <span>Time Complexity</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-foreground">
                  {review.timeBigO}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {review.timeLabel}
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5",
                review.isTimeOptimal
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : review.timeBigO === "N/A"
                    ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-500"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              {review.isTimeOptimal ? "Optimal" : review.timeBigO === "N/A" ? "No Code" : "Suboptimal"}
            </Badge>
          </div>

          {/* Space Complexity Card */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border p-3 transition-colors",
              review.isSpaceOptimal
                ? "border-cyan-500/30 bg-cyan-500/[0.04] dark:border-cyan-500/20"
                : review.spaceBigO === "N/A"
                  ? "border-zinc-500/20 bg-zinc-500/[0.02]"
                  : "border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/20"
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Cpu className="h-3.5 w-3.5 text-cyan-500" />
                <span>Space Complexity</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-foreground">
                  {review.spaceBigO}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {review.spaceLabel}
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5",
                review.isSpaceOptimal
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                  : review.spaceBigO === "N/A"
                    ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-500"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              {review.isSpaceOptimal ? "Optimal Space" : review.spaceBigO === "N/A" ? "No Code" : "High Space"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Strengths & Suggestions 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths Card */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] p-4 dark:border-emerald-500/20">
          <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-3">
            Strengths
          </div>
          <ul className="space-y-2.5 text-xs">
            {review.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions Card */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.03] p-4 dark:border-amber-500/20">
          <div className="font-bold text-sm text-amber-600 dark:text-amber-400 mb-3">
            Suggestions
          </div>
          <ul className="space-y-2.5 text-xs">
            {review.suggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground/90">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Refactored Snippet - Hidden / Collapsed until user clicks! */}
      <div className="rounded-xl border border-black/10 bg-card overflow-hidden dark:border-white/10 shadow-sm">
        <button
          type="button"
          onClick={() => setRefactorExpanded(!refactorExpanded)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
              &lt;/&gt; Refactored Snippet
            </span>
            <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              AI-generated
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              refactorExpanded && "rotate-180"
            )}
          />
        </button>

        {refactorExpanded && (
          <div className="border-t border-black/10 dark:border-white/10 bg-[#121316] p-4 font-mono text-xs text-emerald-200">
            {isRefactorLoading && !asyncSnippet ? (
              <div className="flex items-center gap-2.5 py-4 text-xs text-zinc-400">
                <Clock className="h-4 w-4 animate-spin text-violet-400" />
                <span>Generating optimal, correct LeetCode solution with AI...</span>
              </div>
            ) : (
              <>
                <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {activeSnippet}
                </pre>
                <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={copyRefactor}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Refactor</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportSnippet}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Snippet</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Proctoring live stats footer matching screenshot 2 */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-black/5 dark:border-white/5">
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>
          Tab switches: <strong className="text-foreground">{proctorStats.tabSwitches}</strong> · Fullscreen exits:{" "}
          <strong className="text-foreground">{proctorStats.fullscreenExits}</strong>. Logged for awareness only. No penalties.
        </span>
      </div>
    </div>
  );
}
