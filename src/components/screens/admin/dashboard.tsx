"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  Clock,
  Plus,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const COMPANY = {
  name: "Northwind Labs Pvt Ltd",
  admin: "Priya Sharma",
  role: "HR Lead",
  plan: "Teams. 50 seats",
};

const STATS = [
  {
    label: "Total Campaigns",
    value: 5,
    hint: "+2 this quarter",
    tone: "violet" as const,
    icon: <Activity className="h-4 w-4" />,
  },
  {
    label: "Active Campaigns",
    value: 3,
    hint: "2 closing this week",
    tone: "emerald" as const,
    icon: <ArrowUpRight className="h-4 w-4" />,
  },
  {
    label: "Total Candidates",
    value: 142,
    hint: "47 new this week",
    tone: "sky" as const,
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Interviews Completed",
    value: 89,
    hint: "62% completion rate",
    tone: "amber" as const,
    icon: <Trophy className="h-4 w-4" />,
  },
];

type Campaign = {
  id: string;
  name: string;
  role: string;
  deadline: string;
  candidates: number;
  status: "active" | "closed" | "draft";
  progress: number;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "backend-sde-1",
    name: "Backend SDE-1. Campus Drive 2025",
    role: "Backend Developer",
    deadline: "Jan 30, 2025",
    candidates: 47,
    status: "active",
    progress: 78,
  },
  {
    id: "frontend-intern",
    name: "Frontend Intern - Summer Cohort",
    role: "Frontend Developer",
    deadline: "Feb 15, 2025",
    candidates: 23,
    status: "active",
    progress: 41,
  },
  {
    id: "data-analyst",
    name: "Data Analyst. Mid-level",
    role: "Data Science",
    deadline: "Dec 31, 2024",
    candidates: 31,
    status: "closed",
    progress: 100,
  },
  {
    id: "devops-engineer",
    name: "DevOps Engineer - Senior",
    role: "DevOps / SRE",
    deadline: "Feb 28, 2025",
    candidates: 18,
    status: "active",
    progress: 22,
  },
  {
    id: "qa-automation",
    name: "QA Automation Engineer",
    role: "QA / Test",
    deadline: "Mar 10, 2025",
    candidates: 23,
    status: "draft",
    progress: 0,
  },
];

const STATUS_STYLES: Record<
  Campaign["status"],
  { label: string; cls: string }
> = {
  active: {
    label: "Active",
    cls: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  closed: {
    label: "Closed",
    cls: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  draft: {
    label: "Draft",
    cls: "border-black/15 bg-muted/40 text-muted-foreground dark:border-white/15",
  },
};

const QUICK_ACTIONS = [
  {
    label: "Create new campaign",
    desc: "Configure rounds + generate apply link",
    icon: Plus,
    screen: "campaign-new" as const,
    cls: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  {
    label: "Manage question sets",
    desc: "Aptitude + coding problems per campaign",
    icon: Settings,
    screen: "question-manager" as const,
    cls: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  {
    label: "Bulk resume upload",
    desc: "Upload resumes & AI-extract candidates",
    icon: Users,
    screen: "bulk-upload" as const,
    cls: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  {
    label: "Final selection",
    desc: "Lock decisions & export reports",
    icon: Trophy,
    screen: "final-selection" as const,
    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
];

export function AdminDashboard() {
  const { set } = useNav();
  const [query, setQuery] = useState("");

  const filtered = CAMPAIGNS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.role.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap className="pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1 text-xs font-medium text-muted-foreground dark:border-white/15">
                Admin Dashboard
              </span>
              <span className="text-xs text-muted-foreground">
                {COMPANY.plan}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              {COMPANY.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back,{" "}
              <span className="text-foreground/90">{COMPANY.admin}</span> ·{" "}
              {COMPANY.role}
            </p>
          </div>
          <Button
            onClick={() => set("campaign-new")}
            className="h-11 rounded-full bg-violet-500 px-5 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Campaign
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-lg border border-black/10 bg-background p-5 shadow-sm dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className={cn("mt-2 text-2xl font-semibold tracking-tight", TONE_TEXT[s.tone])}>
                    {s.value}
                  </p>
                  {s.hint && <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>}
                </div>
                {s.icon && (
                  <div className={cn("rounded-lg border border-black/10 bg-muted/40 p-2 dark:border-white/10", TONE_TEXT[s.tone])}>
                    {s.icon}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => set(a.screen)}
              className="group flex flex-col items-start gap-2 rounded-lg border border-black/10 bg-background p-4 text-left transition-colors hover:border-black/20 hover:bg-muted/30 dark:border-white/10 dark:hover:border-white/20"
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg",
                  a.cls,
                )}
              >
                <a.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{a.label}</span>
              <span className="text-xs text-muted-foreground">{a.desc}</span>
              <span className="mt-1 inline-flex items-center text-xs text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-violet-300">
                Open <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
            </motion.button>
          ))}
        </div>

        {/* Campaigns table */}
        <div className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Your campaigns
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Campaign pipeline
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Click a row to drill into its candidate leaderboard.
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <input
                placeholder="Search campaigns..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-black/10 bg-background pl-9 pr-3 text-sm outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                ⌕
              </span>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-black/10 bg-background shadow-sm dark:border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-black/10 hover:bg-transparent dark:border-white/10">
                  <TableHead className="pl-6">Campaign</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Deadline
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Candidates
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Progress
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const st = STATUS_STYLES[c.status];
                  return (
                    <TableRow
                      key={c.id}
                      onClick={() => set("candidate-leaderboard")}
                      className="cursor-pointer border-black/5 transition-colors hover:bg-muted/30 dark:border-white/5"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-600 dark:text-violet-300">
                            {c.role.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {c.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {c.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.role}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {c.deadline} <span className="text-[10px]">IST</span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.candidates}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-violet-500"
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {c.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            st.cls,
                          )}
                        >
                          {st.label}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-300">
                          View <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No campaigns match &ldquo;{query}&rdquo;.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Bottom strip. integrity + interviews live */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-black/10 bg-background p-5 shadow-sm dark:border-white/10 md:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Live activity
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">3</span>{" "}
                  candidates are taking assessments right now
                </p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { name: "Priya Sharma", round: "Aptitude" },
                { name: "Amit Patel", round: "Coding" },
                { name: "Rahul Kumar", round: "Interview" },
              ].map((p) => (
                <span
                  key={p.name}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-muted/30 px-3 py-1 text-xs dark:border-white/10"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {p.name} · {p.round}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-background p-5 shadow-sm dark:border-white/10">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Integrity score
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                  96%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  2 flags auto-flagged for review
                </p>
                <button
                  onClick={() => set("proctoring-review")}
                  className="mt-3 inline-flex items-center text-xs text-violet-600 hover:text-violet-700 dark:text-violet-300 dark:hover:text-violet-200"
                >
                  Review flags <ArrowRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </PageWrap>
    </div>
  );
}

const TONE_TEXT: Record<"violet" | "emerald" | "amber" | "rose" | "sky" | "slate", string> = {
  violet: "text-violet-600 dark:text-violet-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  amber: "text-amber-600 dark:text-amber-300",
  rose: "text-rose-600 dark:text-rose-300",
  sky: "text-sky-600 dark:text-sky-300",
  slate: "text-foreground/80",
};
