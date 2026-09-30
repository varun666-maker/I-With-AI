"use client";

import { useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * CodingHeatmap
 *
 * A GitHub-style activity grid that visualises a candidate's recent
 * submissions. Each square represents a single day. Color intensity
 * grows with the number of submissions on that day.
 *
 * Layout: 7 rows (days of the week) by N columns (weeks). Defaults
 * to the last 12 weeks. Older weeks are on the left, today on the right.
 */

export interface HeatmapSubmission {
  problemId: number;
  timestamp: number;
  passed: boolean;
}

interface CodingHeatmapProps {
  submissions: HeatmapSubmission[];
  /** Number of weeks to render. Defaults to 12. */
  weeks?: number;
  className?: string;
}

// 5 intensity buckets (0 = no activity, 4 = heavy activity).
const LEVEL_STYLES = [
  "bg-muted/60",
  "bg-violet-300/70 dark:bg-violet-500/40",
  "bg-violet-400/80 dark:bg-violet-500/70",
  "bg-violet-500 dark:bg-violet-500/90",
  "bg-violet-600 dark:bg-violet-400",
] as const;

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 6) return 3;
  return 4;
}

// Day labels for the left gutter. Saturday / Sunday are hidden to keep the
// gutter compact.
const DAY_LABELS = ["Mon", "Wed", "Fri"];

export function CodingHeatmap({
  submissions,
  weeks = 12,
  className,
}: CodingHeatmapProps) {
  const shouldReduce = useReducedMotion();

  const { grid, totalSolved, totalSubmissions } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Total days to render (round up so we always include the current week).
    const totalDays = weeks * 7;
    // Align the right edge to the current week's Saturday so columns are full.
    const end = new Date(today);
    const dow = end.getDay(); // 0 = Sun, 6 = Sat
    end.setDate(end.getDate() + (6 - dow));

    const start = new Date(end);
    start.setDate(start.getDate() - (totalDays - 1));
    start.setHours(0, 0, 0, 0);

    // Bucket submissions by day key (YYYY-MM-DD).
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

    // Build a 7 x weeks grid. Column 0 is the oldest week.
    const columns: Array<Array<{ date: Date; count: number; passed: number }>> = [];
    const cursor = new Date(start);
    for (let w = 0; w < weeks; w++) {
      const column: Array<{ date: Date; count: number; passed: number }> = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        const key = date.toISOString().slice(0, 10);
        const entry = byDay.get(key) ?? { count: 0, passed: 0 };
        column.push({ date, count: entry.count, passed: entry.passed });
        cursor.setDate(cursor.getDate() + 1);
      }
      columns.push(column);
    }

    const totalSubmissions = submissions.length;
    const totalSolved = new Set(
      submissions.filter((s) => s.passed).map((s) => s.problemId),
    ).size;

    return { grid: columns, totalSolved, totalSubmissions };
  }, [submissions, weeks]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalSolved}</span>
          <span className="mx-1">solved</span>
          <span className="text-muted-foreground/70">·</span>
          <span className="ml-1 font-semibold text-foreground">{totalSubmissions}</span>
          <span className="ml-1">submissions</span>
          <span className="ml-1 text-muted-foreground/70">in the last {weeks} weeks</span>
        </p>
        <Legend />
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-1">
          {/* Day-of-week gutter */}
          <div className="mr-1 flex flex-col gap-1 text-[10px] text-muted-foreground">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex h-3 items-center"
                style={{ height: 12 }}
              >
                {DAY_LABELS[i] ? <span className="leading-none">{DAY_LABELS[i]}</span> : null}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((column, w) => (
            <div key={w} className="flex flex-col gap-1">
              {column.map((cell, d) => {
                const level = levelFor(cell.count);
                const isToday =
                  cell.date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={d}
                    title={`${cell.date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}: ${cell.count} submission${cell.count === 1 ? "" : "s"}, ${cell.passed} passed`}
                    className={cn(
                      "h-3 w-3 rounded-[3px] transition-colors",
                      LEVEL_STYLES[level],
                      isToday && "ring-1 ring-violet-400/70 ring-offset-1 ring-offset-background",
                      !shouldReduce && "transition-transform duration-150 hover:scale-125",
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
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
