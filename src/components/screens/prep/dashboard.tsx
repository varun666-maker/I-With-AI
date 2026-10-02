"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Code2,
  Download,
  FileText,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  TrendingUp,
  Trophy,
  Video,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PageWrap,
  SectionHeading,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const TREND = [
  { d: "Nov 1", score: 52 },
  { d: "Nov 8", score: 58 },
  { d: "Nov 15", score: 55 },
  { d: "Nov 22", score: 64 },
  { d: "Nov 29", score: 67 },
  { d: "Dec 6", score: 71 },
  { d: "Dec 13", score: 69 },
  { d: "Dec 20", score: 74 },
  { d: "Jan 2", score: 76 },
  { d: "Jan 15", score: 78 },
];

const RADAR = [
  { dim: "Technical", v: 82 },
  { dim: "Comm", v: 74 },
  { dim: "Behav.", v: 68 },
  { dim: "Body", v: 71 },
  { dim: "Conf.", v: 79 },
  { dim: "PS", v: 85 },
];

const APT = [
  { cat: "Quant", v: 80 },
  { cat: "Logical", v: 60 },
  { cat: "Verbal", v: 100 },
  { cat: "Analytical", v: 80 },
  { cat: "DI", v: 40 },
];

const RECENT = [
  { date: "Jan 15, 2025", type: "Technical", tone: "violet", score: 78 },
  { date: "Jan 10, 2025", type: "HR / Behavioral", tone: "emerald", score: 82 },
  { date: "Jan 4, 2025", type: "Coding", tone: "amber", score: 91 },
  { date: "Dec 28, 2024", type: "Managerial", tone: "sky", score: 74 },
  { date: "Dec 20, 2024", type: "Full E2E", tone: "rose", score: 67 },
];

const ROADMAP = [
  { wk: "Week 1", theme: "Core Fundamentals. DSA basics, Big-O, Arrays & Strings", state: "done" as const },
  { wk: "Week 2", theme: "System Design Primer. Load balancers, caching, queues", state: "done" as const },
  { wk: "Week 3", theme: "Backend Deep Dive. Concurrency, REST, gRPC, DB indexes", state: "active" as const },
  { wk: "Week 4", theme: "Frontend Speedrun. React hooks, state mgmt, perf", state: "locked" as const },
  { wk: "Week 5", theme: "Behavioral STAR Stories. 6 rehearsed anecdotes", state: "locked" as const },
  { wk: "Week 6", theme: "Mock Loop. Daily 1 interview + report review", state: "locked" as const },
];

const TONE_MAP: Record<string, string> = {
  violet: "border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  sky: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

export function StudentDashboard() {
  const { set } = useNav();
  const [reportReady, setReportReady] = useState(true);
  const [usageOpen, setUsageOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap>
        <BackToHome />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <Badge variant="outline" className="mb-3 border-black/10 bg-black/[0.02] text-[11px] uppercase tracking-widest text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]">
              Prep Mode · Student
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, <span className="text-violet-500 dark:text-violet-400">Priya</span>.
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Last interview: <span className="text-foreground">Jan 15, 2025</span> · Score <span className="text-emerald-600 dark:text-emerald-300">78%</span> · Trending up 4 pts vs last week.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => set("report")}
            className={cn(
              "rounded-full",
              reportReady
                ? "bg-violet-500 text-white hover:bg-violet-600"
                : "bg-black/[0.05] text-muted-foreground hover:bg-black/[0.08] dark:bg-white/5 dark:hover:bg-white/10",
            )}
          >
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </motion.div>

        {/* Top section: gauge + trend */}
        <StaggeredReveal className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <motion.div variants={revealItem} className="lg:col-span-2">
            <div className="h-full rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall Interview Score</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">From your last session</p>
                </div>
                <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                  <TrendingUp className="mr-1 h-3 w-3" /> +4
                </Badge>
              </div>
              <ScoreGauge value={78} />
            </div>
          </motion.div>
          <motion.div variants={revealItem} className="lg:col-span-3">
            <div className="h-full rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Score Trend. Last 10 sessions</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Higher is better. Goal line at 85.</p>
                </div>
                <TrendingUp className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              </div>
              <div className="mt-4 h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" />
                    <XAxis dataKey="d" tick={{ fill: "rgba(120,120,120,0.7)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[40, 100]} tick={{ fill: "rgba(120,120,120,0.7)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20,20,25,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="url(#trendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </StaggeredReveal>

        {/* Middle: radar + resume + aptitude */}
        <StaggeredReveal className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.div variants={revealItem}>
            <div className="h-full rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Skill Radar</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Six-axis breakdown of your interview performance.</p>
              <div className="mt-3 h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RADAR} outerRadius={78}>
                    <PolarGrid stroke="rgba(120,120,120,0.2)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: "rgba(120,120,120,0.8)", fontSize: 11 }} />
                    <Radar name="Score" dataKey="v" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.45} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20,20,25,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
          <motion.div variants={revealItem}>
            <div className="h-full rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Resume ATS Score</p>
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-300">87</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <Progress value={87} className="mt-3 bg-black/10 dark:bg-white/10" />
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Backend Developer fit · 78%</span>
                <span className="text-emerald-600 dark:text-emerald-300">+6 since last edit</span>
              </div>
              <button
                onClick={() => set("resume")}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                View Full Analysis <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
          <motion.div variants={revealItem}>
            <div className="h-full rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Aptitude Quick Stats</p>
                <Activity className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              </div>
              <div className="mt-4 space-y-2.5">
                {APT.map((a) => (
                  <div key={a.cat} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{a.cat}</span>
                      <span className={cn(
                        "font-mono font-semibold",
                        a.v >= 80 ? "text-emerald-600 dark:text-emerald-300" : a.v >= 60 ? "text-amber-600 dark:text-amber-300" : "text-rose-600 dark:text-rose-300",
                      )}>{a.v}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          a.v >= 80 ? "bg-emerald-400" : a.v >= 60 ? "bg-amber-400" : "bg-rose-400",
                        )}
                        style={{ width: `${a.v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => set("aptitude")}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Take Test <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </StaggeredReveal>

        {/* Bottom: recent + roadmap + heatmap */}
        <StaggeredReveal className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <motion.div variants={revealItem}>
            <div className="h-full rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent Interviews</p>
                <Video className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              </div>
              <ul className="mt-3 space-y-2">
                {/* F-09: Report-generating ghost card */}
                <li className="flex items-center justify-between rounded-lg border border-violet-400/20 bg-violet-500/[0.04] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 place-items-center rounded-lg border border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-muted-foreground">
                        Report generating…
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Usually ~60s. Available soon.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300">
                    Pending
                  </span>
                </li>
                {RECENT.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-black/5 bg-black/[0.02] px-3 py-2.5 transition-colors hover:border-black/15 dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/15"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn("inline-flex h-8 w-8 shrink-0 place-items-center rounded-lg border", TONE_MAP[r.tone])}>
                        <Video className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.type}</p>
                        <p className="text-[11px] text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-foreground">{r.score}%</span>
                      <button
                        onClick={() => set("replay")}
                        className="text-[11px] text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                      >
                        Replay →
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => set("interview")}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-500/15 dark:text-violet-200"
              >
                <Video className="h-3.5 w-3.5" /> Start New Interview
              </button>
            </div>
          </motion.div>

          <motion.div variants={revealItem} className="space-y-4">
            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Learning Roadmap</p>
                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              </div>
              <ul className="mt-3 space-y-1.5">
                {ROADMAP.map((r) => (
                  <li key={r.wk} className="flex items-center gap-3 rounded-md px-2 py-1.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs">
                      {r.state === "done" && (
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 ring-1 ring-inset ring-emerald-400/30 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {r.state === "active" && (
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500/15 text-violet-600 ring-1 ring-inset ring-violet-400/30 dark:text-violet-300">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "2s" }} />
                        </span>
                      )}
                      {r.state === "locked" && (
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-black/[0.03] text-muted-foreground ring-1 ring-inset ring-black/10 dark:bg-white/5 dark:ring-white/10">
                          <Lock className="h-3 w-3" />
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-xs font-semibold",
                        r.state === "locked" ? "text-muted-foreground" : "text-foreground",
                      )}>{r.wk}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{r.theme}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Coding Activity (12 wks)</p>
                <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <Heatmap />
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                Less
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/15" />
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" />
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                More
              </div>
            </div>
          </motion.div>
        </StaggeredReveal>

        {/* Fair usage summary */}
        <div className="mt-6">
          <Collapsible open={usageOpen} onOpenChange={setUsageOpen}>
            <div className="rounded-lg border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
              <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-500/15 text-sky-600 ring-1 ring-inset ring-sky-400/30 dark:text-sky-300">
                    <Info className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Your self-awareness stats</p>
                    <p className="text-[11px] text-muted-foreground">
                      Tab switches, fullscreen exits and posture flags. Logged for your awareness only. No penalties.
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", usageOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <UsageStat label="Tab switches (last test)" value="3" />
                  <UsageStat label="Fullscreen exits" value="1" />
                  <UsageStat label="Posture warnings" value="2" />
                  <UsageStat label="Mic activations" value="9" />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  In Prep Mode, proctoring data is purely informational. It never blocks you, never pauses a test, and never affects your score. Use these signals to build self-awareness before real interviews.
                </p>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Bottom actions row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Resume Hub", icon: FileText, screen: "resume" as const },
            { label: "Aptitude Portal", icon: Activity, screen: "aptitude" as const },
            { label: "Coding Arena", icon: Code2, screen: "coding" as const },
            { label: "AI Interview", icon: Video, screen: "interview" as const },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => set(a.screen)}
              className="group relative overflow-hidden rounded-lg border border-black/10 bg-card p-4 text-left shadow-sm transition-colors hover:border-black/20 dark:border-white/10 dark:hover:border-white/20"
            >
              <a.icon className="h-5 w-5 text-foreground/80" />
              <p className="mt-2 text-sm font-medium">{a.label}</p>
              <ArrowRight className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>

      </PageWrap>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ScoreGauge({ value }: { value: number }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative mt-4 grid place-items-center">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} stroke="rgba(120,120,120,0.15)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="80"
          cy="80"
          r={r}
          stroke="#8b5cf6"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-semibold tracking-tight">{value}%</p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Last: Jan 15</p>
      </div>
    </div>
  );
}

function Heatmap() {
  // 12 cols (weeks) × 7 rows (days) - value 0-4
  const cells = useMemo(() => {
    return Array.from({ length: 12 * 7 }).map(() => Math.floor(Math.random() * 5));
  }, []);
  return (
    <div className="mt-3 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto scrollbar-custom">
      {cells.map((v, i) => (
        <div
          key={i}
          title={`${v} sessions`}
          className={cn(
            "h-3 w-3 rounded-sm",
            v === 0 && "bg-black/[0.05] dark:bg-white/5",
            v === 1 && "bg-emerald-500/15",
            v === 2 && "bg-emerald-500/40",
            v === 3 && "bg-emerald-500/70",
            v === 4 && "bg-emerald-500",
          )}
        />
      ))}
    </div>
  );
}

function UsageStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-2xl font-semibold tracking-tight text-sky-600 dark:text-sky-300">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* keep imports referenced */
export const __icons = { Award, Calendar, Line, LineChart, SectionHeading };
