"use client";

import { useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { Flame, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeatmapSubmission {
  problemId: number;
  timestamp: number;
  passed: boolean;
}

interface CodingHeatmapProps {
  submissions: HeatmapSubmission[];
  /** Number of weeks to render. Defaults to 16 for rich timeline. */
  weeks?: number;
  className?: string;
}

// 5 intensity buckets (0 = no activity, 4 = heavy activity).
const LEVEL_STYLES = [
  "bg-muted/50 dark:bg-zinc-800/60",
  "bg-violet-300 dark:bg-violet-900/60",
  "bg-violet-400 dark:bg-violet-700/80",
  "bg-violet-500 dark:bg-violet-500",
  "bg-violet-600 dark:bg-violet-400",
] as const;

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

// Logical GitHub/LeetCode day labels aligned to actual row indices (0=Sun, 1=Mon, ..., 6=Sat)
const DAY_LABELS: Record<number, string> = {
  1: "Mon",
  3: "Wed",
  5: "Fri",
};

export function CodingHeatmap({
  submissions,
  weeks = 16,
  className,
}: CodingHeatmapProps) {
  const shouldReduce = useReducedMotion();

  const { grid, totalSolved, totalSubmissions, activeDays, currentStreak, monthHeaders } =
    useMemo(() => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const totalDays = weeks * 7;
      // End on Saturday of the current week to align columns cleanly
      const end = new Date(today);
      const dow = end.getDay(); // 0 = Sun, 6 = Sat
      end.setDate(end.getDate() + (6 - dow));

      const start = new Date(end);
      start.setDate(start.getDate() - (totalDays - 1));
      start.setHours(0, 0, 0, 0);

      // Group submissions by YYYY-MM-DD
      const byDay = new Map<string, { count: number; passed: number }>();
      for (const sub of submissions) {
        const d = new Date(sub.timestamp);
        d.setHours(0, 0, 0, 0);
        if (d < start || d > end) continue;
        const key = d.toISOString().slice(0, 10);
        const entry = byDay.get(key) ?? { count: 0, passed: 0 };
        entry.count += 1;
        if (sub.passed) entry.passed += 1;
        byDay.set(key, entry);
      }

      // Build grid and extract month header milestones
      const columns: Array<Array<{ date: Date; count: number; passed: number; key: string }>> = [];
      const months: Array<{ name: string; colIndex: number }> = [];
      let lastMonth = -1;

      const cursor = new Date(start);
      for (let w = 0; w < weeks; w++) {
        const column: Array<{ date: Date; count: number; passed: number; key: string }> = [];
        for (let d = 0; d < 7; d++) {
          const date = new Date(cursor);
          const key = date.toISOString().slice(0, 10);
          const entry = byDay.get(key) ?? { count: 0, passed: 0 };

          if (d === 0) {
            const m = date.getMonth();
            if (m !== lastMonth && w < weeks - 1) {
              months.push({
                name: date.toLocaleDateString(undefined, { month: "short" }),
                colIndex: w,
              });
              lastMonth = m;
            }
          }

          column.push({ date, count: entry.count, passed: entry.passed, key });
          cursor.setDate(cursor.getDate() + 1);
        }
        columns.push(column);
      }

      const totalSubmissions = submissions.length;
      const totalSolved = new Set(
        submissions.filter((s) => s.passed).map((s) => s.problemId),
      ).size;
      const activeDays = byDay.size;

      // Calculate streak ending today or yesterday
      let streak = 0;
      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      const todayKey = checkDate.toISOString().slice(0, 10);
      if (!byDay.has(todayKey)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      while (true) {
        const k = checkDate.toISOString().slice(0, 10);
        if (byDay.has(k)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return {
        grid: columns,
        totalSolved,
        totalSubmissions,
        activeDays,
        currentStreak: streak,
        monthHeaders: months,
      };
    }, [submissions, weeks]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Activity Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Solved</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{totalSolved}</p>
        </div>

        <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-violet-500" />
            <span>Submissions</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{totalSubmissions}</p>
        </div>

        <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span>Active Days</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{activeDays}</p>
        </div>

        <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Current Streak</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">
            {currentStreak} <span className="text-xs font-normal text-muted-foreground">days</span>
          </p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Month labels row */}
          <div className="flex text-[10px] text-muted-foreground mb-1 pl-7">
            {grid.map((_, colIdx) => {
              const header = monthHeaders.find((m) => m.colIndex === colIdx);
              return (
                <div key={colIdx} className="w-[14px] text-center">
                  {header ? (
                    <span className="font-semibold text-foreground/80">{header.name}</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="inline-flex items-start gap-1">
            {/* Day-of-week gutter: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat */}
            <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-1.5 select-none">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex h-[13px] items-center justify-end">
                  <span className="leading-none text-[9px]">{DAY_LABELS[i] || ""}</span>
                </div>
              ))}
            </div>

            {/* Grid Columns */}
            {grid.map((column, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {column.map((cell, d) => {
                  const level = levelFor(cell.count);
                  const isToday =
                    cell.date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={d}
                      title={`${cell.date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}: ${cell.count} submission${cell.count === 1 ? "" : "s"}, ${cell.passed} passed`}
                      className={cn(
                        "h-[13px] w-[13px] rounded-[3px] transition-all cursor-pointer",
                        LEVEL_STYLES[level],
                        isToday &&
                          "ring-2 ring-violet-500 ring-offset-1 ring-offset-background",
                        !shouldReduce && "hover:scale-125",
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3 text-xs text-muted-foreground dark:border-white/5">
        <span>Recent submission activity over the last {weeks} weeks</span>
        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span>Less</span>
      {LEVEL_STYLES.map((style, i) => (
        <span
          key={i}
          className={cn("h-3 w-3 rounded-[3px]", style)}
          aria-hidden
        />
      ))}
      <span>More</span>
    </div>
  );
}
