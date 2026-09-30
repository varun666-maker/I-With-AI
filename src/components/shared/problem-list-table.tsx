"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Search,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CODING_PROBLEMS,
  TOPICS,
  type CodingProblem,
  type Difficulty,
  type Topic,
} from "@/lib/coding-problems";
import { CodingHeatmap, type HeatmapSubmission } from "@/components/shared/coding-heatmap";

/**
 * ProblemListTable
 *
 * LeetCode-style index of the question bank. Drives the Coding Arena screen:
 * the candidate can filter by topic and difficulty, search by title, pick a
 * specific problem, or pull a random one. A heatmap at the top summarises
 * recent activity. Topic progress cards report solved / total per topic.
 *
 * Status column legend:
 *   - Check: solved (in solvedProblems)
 *   - Dot:   attempted but not solved (in attemptedProblems only)
 *   - Empty: never touched
 */

interface ProblemListTableProps {
  solvedProblems: number[];
  attemptedProblems: number[];
  submissions: HeatmapSubmission[];
  onPickProblem: (problem: CodingProblem) => void;
  onRandomQuestion: () => void;
  className?: string;
}

type TopicFilter = "All" | Topic;
type DifficultyFilter = "All" | Difficulty;

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Easy: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  Medium: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  Hard: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

export function ProblemListTable({
  solvedProblems,
  attemptedProblems,
  submissions,
  onPickProblem,
  onRandomQuestion,
  className,
}: ProblemListTableProps) {
  const shouldReduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<TopicFilter>("All");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");

  const solvedSet = useMemo(() => new Set(solvedProblems), [solvedProblems]);
  const attemptedSet = useMemo(
    () => new Set(attemptedProblems.filter((id) => !solvedSet.has(id))),
    [attemptedProblems, solvedSet],
  );

  // Per-topic progress (used by the progress cards above the table).
  const topicProgress = useMemo(() => {
    return TOPICS.map((t) => {
      const total = CODING_PROBLEMS.filter((p) => p.topic === t).length;
      const solved = CODING_PROBLEMS.filter(
        (p) => p.topic === t && solvedSet.has(p.id),
      ).length;
      return { topic: t, total, solved };
    });
  }, [solvedSet]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CODING_PROBLEMS.filter((p) => {
      if (topic !== "All" && p.topic !== topic) return false;
      if (difficulty !== "All" && p.difficulty !== difficulty) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, topic, difficulty]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ---------------------------------------------------------- Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Coding Arena
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {solvedSet.size} of {CODING_PROBLEMS.length} problems solved across {TOPICS.length} topics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems"
              className="h-9 w-56 rounded-lg pl-9"
              aria-label="Search coding problems"
            />
          </div>
          <Button
            onClick={onRandomQuestion}
            className="gap-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600"
          >
            <Shuffle className="h-4 w-4" />
            Random
          </Button>
        </div>
      </div>

      {/* ----------------------------------------------------- Heatmap card */}
      <div className="rounded-lg border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
        <CodingHeatmap submissions={submissions} />
      </div>

      {/* ------------------------------------------------ Topic progress */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {topicProgress.map((tp) => {
          const pct = tp.total === 0 ? 0 : Math.round((tp.solved / tp.total) * 100);
          const isComplete = tp.solved === tp.total && tp.total > 0;
          return (
            <button
              key={tp.topic}
              type="button"
              onClick={() => setTopic((cur) => (cur === tp.topic ? "All" : tp.topic))}
              className={cn(
                "group rounded-lg border bg-card p-4 text-left shadow-sm transition-colors",
                "hover:border-violet-400/50 hover:shadow-md",
                topic === tp.topic
                  ? "border-violet-500 ring-1 ring-violet-500/40"
                  : "border-black/10 dark:border-white/10",
              )}
              aria-pressed={topic === tp.topic}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {tp.topic}
                </span>
                {isComplete && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="topic complete" />
                )}
              </div>
              <p className="mt-1 text-sm text-foreground">
                <span className="font-semibold">{tp.solved}</span>
                <span className="text-muted-foreground">/{tp.total} solved</span>
              </p>
              <Progress
                value={pct}
                className="mt-2 h-1.5 bg-violet-500/10"
              />
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------- Topic filter pills row */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          active={topic === "All"}
          onClick={() => setTopic("All")}
          shouldReduce={shouldReduce}
        >
          All
        </FilterPill>
        {TOPICS.map((t) => (
          <FilterPill
            key={t}
            active={topic === t}
            onClick={() => setTopic((cur) => (cur === t ? "All" : t))}
            shouldReduce={shouldReduce}
          >
            {t}
          </FilterPill>
        ))}
      </div>

      {/* -------------------------------------- Difficulty filter + table */}
      <div className="overflow-hidden rounded-lg border border-black/10 bg-card shadow-sm dark:border-white/10">
        {/* Difficulty row + count */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-4 py-3 dark:border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Difficulty
            </span>
            {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map((d) => (
              <FilterPill
                key={d}
                size="sm"
                active={difficulty === d}
                onClick={() => setDifficulty(d)}
                shouldReduce={shouldReduce}
              >
                {d}
              </FilterPill>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} problem{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Table head */}
        <div className="hidden grid-cols-[64px_56px_1fr_120px_110px_120px] gap-2 border-b border-black/5 px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground md:grid dark:border-white/5">
          <span>Status</span>
          <span className="text-right">#</span>
          <span>Title</span>
          <span>Topic</span>
          <span>Difficulty</span>
          <span className="text-right">Acceptance</span>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-black/5 dark:divide-white/5">
          {filtered.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              No problems match the current filters.
            </li>
          )}
          {filtered.map((p) => {
            const solved = solvedSet.has(p.id);
            const attempted = attemptedSet.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPickProblem(p)}
                  className={cn(
                    "grid w-full grid-cols-[64px_56px_1fr] items-center gap-2 px-4 py-3 text-left transition-colors",
                    "hover:bg-violet-500/5 focus-visible:bg-violet-500/5 focus-visible:outline-none",
                    "md:grid-cols-[64px_56px_1fr_120px_110px_120px]",
                  )}
                >
                  {/* Status */}
                  <span className="flex items-center justify-start">
                    {solved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="solved" />
                    ) : attempted ? (
                      <Circle className="h-3.5 w-3.5 fill-violet-500/60 text-violet-500" aria-label="attempted" />
                    ) : (
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full border border-black/15 dark:border-white/15"
                        aria-label="not started"
                      />
                    )}
                  </span>

                  {/* ID */}
                  <span className="text-right font-mono text-xs text-muted-foreground">
                    {p.id}
                  </span>

                  {/* Title */}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {p.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground md:hidden">
                      {p.topic} · {p.difficulty}
                    </span>
                  </span>

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
                  <span className="hidden items-center justify-end gap-1.5 text-right text-xs text-muted-foreground md:flex">
                    <Progress
                      value={p.acceptance}
                      className="h-1 w-16 bg-violet-500/10"
                    />
                    <span className="w-9 text-right">{p.acceptance}%</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile acceptance row (collapses to single column for very small screens) */}
      <p className="sr-only">
        Tap a row to open that problem. Use the Random button for a surprise problem.
      </p>
    </div>
  );
}

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  shouldReduce: boolean | null;
  children: React.ReactNode;
  size?: "sm" | "md";
}

function FilterPill({ active, onClick, shouldReduce, children, size = "md" }: FilterPillProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={shouldReduce ? undefined : { scale: 0.96 }}
      aria-pressed={active}
      className={cn(
        "rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
        size === "sm" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        active
          ? "border-violet-500 bg-violet-500 text-white shadow-sm"
          : "border-black/10 bg-card text-muted-foreground hover:border-violet-400/40 hover:text-foreground dark:border-white/10",
      )}
    >
      {children}
    </motion.button>
  );
}
