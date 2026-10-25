"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpDown,
  Building2,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Filter,
  Mic,
  RotateCcw,
  Search,
  Shield,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CODING_PROBLEMS,
  TOPICS,
  COMPANIES,
  type CodingProblem,
  type Difficulty,
} from "@/lib/coding-problems";
import { CodingHeatmap, type HeatmapSubmission } from "@/components/shared/coding-heatmap";
import { useNav } from "@/lib/store";
import { toast } from "sonner";

interface ProblemListTableProps {
  solvedProblems: number[];
  attemptedProblems: number[];
  submissions: HeatmapSubmission[];
  onPickProblem: (problem: CodingProblem) => void;
  onRandomQuestion: () => void;
  className?: string;
}

type DifficultyFilter = "All" | Difficulty;
type StatusFilter = "All" | "Solved" | "Attempted" | "Todo";
type SortOption = "id-asc" | "id-desc" | "acceptance-desc" | "acceptance-asc" | "difficulty";

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Easy: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  Medium: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  Hard: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

const ITEMS_PER_PAGE = 25;

export function ProblemListTable({
  solvedProblems,
  attemptedProblems,
  submissions,
  onPickProblem,
  onRandomQuestion,
  className,
}: ProblemListTableProps) {
  const shouldReduce = useReducedMotion();
  const proctorCamera = useNav((s) => s.proctorCamera);
  const proctorMic = useNav((s) => s.proctorMic);
  const setProctorCamera = useNav((s) => s.setProctorCamera);
  const setProctorMic = useNav((s) => s.setProctorMic);

  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("id-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const solvedSet = useMemo(() => new Set(solvedProblems), [solvedProblems]);
  const attemptedSet = useMemo(
    () => new Set(attemptedProblems.filter((id) => !solvedSet.has(id))),
    [attemptedProblems, solvedSet],
  );

  // Toggle Camera
  const handleToggleCam = async (val: boolean) => {
    if (val) {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({ video: true });
          s.getTracks().forEach((t) => t.stop());
        }
        setProctorCamera(true);
        toast.success("Webcam simulation enabled for Coding Arena");
      } catch {
        setProctorCamera(false);
        toast.error("Camera permission denied or device unavailable");
      }
    } else {
      setProctorCamera(false);
      toast.info("Webcam simulation turned off");
    }
  };

  // Toggle Mic
  const handleToggleMic = async (val: boolean) => {
    if (val) {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({ audio: true });
          s.getTracks().forEach((t) => t.stop());
        }
        setProctorMic(true);
        toast.success("Microphone simulation enabled for Coding Arena");
      } catch {
        setProctorMic(false);
        toast.error("Microphone permission denied or device unavailable");
      }
    } else {
      setProctorMic(false);
      toast.info("Microphone simulation turned off");
    }
  };

  // Filter & Sort problems
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = CODING_PROBLEMS.filter((p) => {
      if (selectedTopic !== "All" && p.topic.toLowerCase() !== selectedTopic.toLowerCase()) {
        return false;
      }
      if (selectedCompany !== "all") {
        if (
          !p.companies ||
          !p.companies.some((c) => c.toLowerCase() === selectedCompany.toLowerCase())
        ) {
          return false;
        }
      }
      if (difficulty !== "All" && p.difficulty !== difficulty) {
        return false;
      }
      if (statusFilter === "Solved" && !solvedSet.has(p.id)) return false;
      if (statusFilter === "Attempted" && !attemptedSet.has(p.id)) return false;
      if (statusFilter === "Todo" && (solvedSet.has(p.id) || attemptedSet.has(p.id))) return false;

      if (q) {
        const matchesId = String(p.id).includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCompany = p.companies?.some((c) => c.toLowerCase().includes(q));
        if (!matchesId && !matchesTitle && !matchesCompany) return false;
      }

      return true;
    });

    // Sort order
    return result.sort((a, b) => {
      if (sortBy === "id-asc") return a.id - b.id;
      if (sortBy === "id-desc") return b.id - a.id;
      if (sortBy === "acceptance-desc") return (b.acceptance || 0) - (a.acceptance || 0);
      if (sortBy === "acceptance-asc") return (a.acceptance || 0) - (b.acceptance || 0);
      if (sortBy === "difficulty") {
        const diffRank = { Easy: 1, Medium: 2, Hard: 3 };
        return diffRank[a.difficulty] - diffRank[b.difficulty];
      }
      return a.id - b.id;
    });
  }, [query, selectedTopic, selectedCompany, difficulty, statusFilter, sortBy, solvedSet, attemptedSet]);

  // Safe pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProblems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  // Strictly deduplicated window of 5 pages
  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  const handleFilterChange = (setter: () => void) => {
    setter();
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setQuery("");
    setSelectedTopic("All");
    setSelectedCompany("all");
    setDifficulty("All");
    setStatusFilter("All");
    setSortBy("id-asc");
    setCurrentPage(1);
    toast.info("Filters reset to default");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ------------------------------------------------ Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Coding Arena
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {solvedSet.size} of {CODING_PROBLEMS.length} problems solved across {TOPICS.length} DSA topics & {COMPANIES.length} top companies.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onRandomQuestion}
            className="gap-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 shadow-sm"
            size="sm"
          >
            <Shuffle className="h-4 w-4" />
            Pick Random Problem
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------ Proctoring Simulation Toggle Banner */}
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-card to-background p-4 shadow-sm dark:border-violet-500/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">Proctoring Simulation</span>
                <Badge variant="outline" className="border-violet-500/30 text-[10px] text-violet-600 dark:text-violet-300">
                  Optional Prep Mode
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Practice in realistic full-screen interview conditions with optional camera & mic PiP monitoring.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 border-t border-black/5 pt-3 sm:border-0 sm:pt-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Camera</span>
              <Switch checked={proctorCamera} onCheckedChange={handleToggleCam} />
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <Mic className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Microphone</span>
              <Switch checked={proctorMic} onCheckedChange={handleToggleMic} />
            </label>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Activity Heatmap */}
      <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
        <CodingHeatmap submissions={submissions} />
      </div>

      {/* ------------------------------------------------ Top Tech Companies (All 27 Companies) */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-black/10 bg-card p-4 shadow-sm dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-violet-500" />
            <span>Target Tech Companies ({COMPANIES.length})</span>
          </div>
          {selectedCompany !== "all" && (
            <button
              onClick={() => handleFilterChange(() => setSelectedCompany("all"))}
              className="text-xs text-violet-500 hover:underline font-medium"
            >
              Show All Companies
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-h-24 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleFilterChange(() => setSelectedCompany("all"))}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all shrink-0",
              selectedCompany === "all"
                ? "border-violet-500 bg-violet-500 text-white shadow-sm font-semibold"
                : "border-black/10 bg-card text-muted-foreground hover:border-violet-400/40 hover:text-foreground dark:border-white/10",
            )}
          >
            <span>All Companies</span>
            <span className={cn("text-[10px]", selectedCompany === "all" ? "text-white/80" : "text-muted-foreground")}>
              {CODING_PROBLEMS.length}
            </span>
          </button>

          {COMPANIES.map((c) => {
            const isSelected = selectedCompany.toLowerCase() === c.name.toLowerCase();
            const displayName = c.name.charAt(0).toUpperCase() + c.name.slice(1);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleFilterChange(() => setSelectedCompany(c.name))}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all shrink-0",
                  isSelected
                    ? "border-violet-500 bg-violet-500 text-white shadow-sm font-semibold"
                    : "border-black/10 bg-card text-muted-foreground hover:border-violet-400/40 hover:text-foreground dark:border-white/10",
                )}
              >
                <span>{displayName}</span>
                <span className={cn("text-[10px]", isSelected ? "text-white/80" : "text-muted-foreground/80")}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------ Control Bar: Search + Topic + Sort + Clear */}
      <div className="rounded-xl border border-black/10 bg-card p-4 shadow-sm dark:border-white/10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleFilterChange(() => setQuery(e.target.value))}
              placeholder="Search by title, #ID, company..."
              className="h-9 w-full rounded-lg pl-9 text-xs"
              aria-label="Search coding problems"
            />
          </div>

          {/* Topic Dropdown */}
          <Select
            value={selectedTopic}
            onValueChange={(val) => handleFilterChange(() => setSelectedTopic(val))}
          >
            <SelectTrigger size="sm" className="h-9 rounded-lg text-xs">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-xs">
                All Topics ({CODING_PROBLEMS.length})
              </SelectItem>
              {TOPICS.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By Dropdown */}
          <Select
            value={sortBy}
            onValueChange={(val) => handleFilterChange(() => setSortBy(val as SortOption))}
          >
            <SelectTrigger size="sm" className="h-9 rounded-lg text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id-asc" className="text-xs">
                #ID: 1 to 600 (Ascending)
              </SelectItem>
              <SelectItem value="id-desc" className="text-xs">
                #ID: 600 to 1 (Descending)
              </SelectItem>
              <SelectItem value="acceptance-desc" className="text-xs">
                Acceptance: High to Low
              </SelectItem>
              <SelectItem value="acceptance-asc" className="text-xs">
                Acceptance: Low to High
              </SelectItem>
              <SelectItem value="difficulty" className="text-xs">
                Difficulty: Easy to Hard
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllFilters}
            className="h-9 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
          </Button>
        </div>

        {/* Secondary Filter Row: Difficulty & Status */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3.5 dark:border-white/5">
          {/* Difficulty Segment */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Difficulty:</span>
            {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => handleFilterChange(() => setDifficulty(d))}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  difficulty === d
                    ? "bg-violet-500 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Status Segment */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
            {(["All", "Solved", "Attempted", "Todo"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange(() => setStatusFilter(s))}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "bg-violet-500 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Table Container */}
      <div className="overflow-hidden rounded-xl border border-black/10 bg-card shadow-sm dark:border-white/10">
        {/* Table Head Legend & Result Count */}
        <div className="flex items-center justify-between border-b border-black/5 bg-black/[0.01] px-4 py-3 dark:border-white/5 dark:bg-white/[0.01]">
          <span className="text-xs font-medium text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} problems
          </span>
          <span className="text-[11px] text-muted-foreground">
            Sorted by: <span className="text-foreground font-medium">{sortBy}</span>
          </span>
        </div>

        {/* Column Headers */}
        <div className="hidden grid-cols-[60px_60px_1fr_130px_110px_100px] gap-3 border-b border-black/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid dark:border-white/5">
          <span>Status</span>
          <span className="text-right">#ID</span>
          <span>Title & Company Tags</span>
          <span>Topic</span>
          <span>Difficulty</span>
          <span className="text-right">Acceptance</span>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-black/5 dark:divide-white/5">
          {pagedProblems.length === 0 && (
            <li className="px-4 py-16 text-center text-sm text-muted-foreground">
              No problems match your selected criteria. Try resetting the filters.
            </li>
          )}
          {pagedProblems.map((p) => {
            const solved = solvedSet.has(p.id);
            const attempted = attemptedSet.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPickProblem(p)}
                  className={cn(
                    "grid w-full grid-cols-[60px_60px_1fr] items-center gap-3 px-4 py-3 text-left transition-colors",
                    "hover:bg-violet-500/5 focus-visible:bg-violet-500/5 focus-visible:outline-none",
                    "md:grid-cols-[60px_60px_1fr_130px_110px_100px]",
                  )}
                >
                  {/* Status Indicator */}
                  <span className="flex items-center justify-start">
                    {solved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="solved" />
                    ) : attempted ? (
                      <Circle className="h-3.5 w-3.5 fill-violet-500/60 text-violet-500" aria-label="attempted" />
                    ) : (
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full border border-black/20 dark:border-white/20"
                        aria-label="not started"
                      />
                    )}
                  </span>

                  {/* ID */}
                  <span className="text-right font-mono text-xs font-semibold text-muted-foreground">
                    #{p.id}
                  </span>

                  {/* Title & Companies */}
                  <div className="min-w-0 pr-2">
                    <span className="block truncate text-sm font-medium text-foreground hover:text-violet-600 dark:hover:text-violet-400">
                      {p.title}
                    </span>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {p.companies &&
                        p.companies.slice(0, 3).map((comp, cIdx) => (
                          <span
                            key={`${comp}-${cIdx}`}
                            className="rounded bg-black/[0.04] px-1.5 py-0.2 text-[10px] text-muted-foreground dark:bg-white/[0.06]"
                          >
                            {comp}
                          </span>
                        ))}
                      {p.companies && p.companies.length > 3 && (
                        <span className="text-[10px] text-muted-foreground/70">
                          +{p.companies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topic (md+) */}
                  <span className="hidden text-xs text-muted-foreground md:block">
                    {p.topic}
                  </span>

                  {/* Difficulty (md+) */}
                  <span className="hidden md:block">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                        DIFFICULTY_BADGE[p.difficulty],
                      )}
                    >
                      {p.difficulty}
                    </span>
                  </span>

                  {/* Acceptance (md+) */}
                  <span className="hidden items-center justify-end gap-1.5 text-right text-xs text-muted-foreground md:flex font-mono">
                    {p.acceptance}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Deduplicated Safe Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/5 px-4 py-3 dark:border-white/5">
            <span className="text-xs text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="h-8 gap-1 rounded-md px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <div className="hidden sm:flex items-center gap-1">
                {paginationPages.map((pageNum) => (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-8 w-8 rounded text-xs font-medium transition-colors",
                      safePage === pageNum
                        ? "bg-violet-500 text-white font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5",
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="h-8 gap-1 rounded-md px-2.5 text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
