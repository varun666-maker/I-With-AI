"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  Info,
  Lock,
  LogOut,
  PlayCircle,
  ShieldCheck,
  Timer,
  Trophy,
  Video,
} from "lucide-react";
import {
  GlowCard,
  revealItem,
  StaggeredReveal,
} from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

// Mock campaign context. Would come from /api/campaigns/:slug
const CAMPAIGN = {
  company: "Acme Corp",
  role: "Backend Developer",
  // Dynamic deadline = now + 2d 8h 23m → places us in amber zone (24–72h)
  deadlineOffsetMs:
    2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000 + 23 * 60 * 1000,
  violations: 0,
};

type RoundStatus = "completed" | "in-progress" | "locked";

interface Round {
  n: number;
  title: string;
  subtitle: string;
  status: RoundStatus;
  icon: React.ComponentType<{ className?: string }>;
  score?: number;
  qualification?: "passed" | "failed";
  lockedReason?: string;
}

const ROUNDS: Round[] = [
  {
    n: 1,
    title: "Aptitude Test",
    subtitle: "25 questions · 30 minutes",
    status: "completed",
    icon: Brain,
    score: 74,
    qualification: "passed",
  },
  {
    n: 2,
    title: "Coding Round",
    subtitle: "3 problems · 90 minutes",
    status: "in-progress",
    icon: Code2,
  },
  {
    n: 3,
    title: "AI Interview",
    subtitle: "Role-specific · ~35 minutes",
    status: "locked",
    icon: Video,
    lockedReason: "Complete Coding first to unlock",
  },
];

export function CandidateDashboard() {
  const { set } = useNav();
  const deadline = useMemo(
    () => Date.now() + CAMPAIGN.deadlineOffsetMs,
    [],
  );
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, deadline - now);
  const totalHours = remaining / (1000 * 60 * 60);
  const tone = totalHours > 72 ? "emerald" : totalHours > 24 ? "amber" : "rose";

  const toneRing = {
    emerald: "ring-emerald-400/40 text-emerald-700 dark:text-emerald-300",
    amber: "ring-amber-400/40 text-amber-700 dark:text-amber-300",
    rose: "ring-rose-400/40 text-rose-700 dark:text-rose-300",
  }[tone];

  const toneIconBg = {
    emerald: "bg-emerald-500/10",
    amber: "bg-amber-500/10",
    rose: "bg-rose-500/10",
  }[tone];

  const toneText = {
    emerald: "text-emerald-700 dark:text-emerald-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300",
  }[tone];

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((remaining / (1000 * 60)) % 60);
  const secs = Math.floor((remaining / 1000) % 60);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-4xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-3 rounded-full border-amber-400/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
            Invited Candidate · Hiring Mode
          </Badge>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {CAMPAIGN.company}{" "}
                <span className="text-violet-500 dark:text-violet-400">{CAMPAIGN.role}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete all rounds before the deadline. Rounds unlock
                sequentially.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="self-start text-muted-foreground hover:text-foreground"
              onClick={() => set("landing")}
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6"
        >
          <GlowCard
            className={cn(
              "relative overflow-hidden p-5 sm:p-6 ring-1 ring-inset",
              toneRing,
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-lg ring-1 ring-inset",
                    toneRing,
                    toneIconBg,
                  )}
                >
                  <Timer className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Time remaining
                  </p>
                  <p className={cn("text-sm font-medium", toneText)}>
                    {totalHours > 72
                      ? "Plenty of time"
                      : totalHours > 24
                        ? "Under 3 days left"
                        : "Final stretch"}
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-2 font-mono tabular-nums">
                <CountUnit value={pad(days)} label="Days" tone={tone} />
                <span className="pb-4 text-2xl text-muted-foreground/30">:</span>
                <CountUnit value={pad(hours)} label="Hrs" tone={tone} />
                <span className="pb-4 text-2xl text-muted-foreground/30">:</span>
                <CountUnit value={pad(mins)} label="Min" tone={tone} />
                <span className="pb-4 text-2xl text-muted-foreground/30">:</span>
                <CountUnit value={pad(secs)} label="Sec" tone={tone} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Deadline:{" "}
                {new Date(deadline).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                IST
              </span>
            </div>
          </GlowCard>
        </motion.div>

        {/* Rounds */}
        <StaggeredReveal className="mt-6 space-y-4" delay={0.07}>
          {ROUNDS.map((r) => (
            <motion.div key={r.n} variants={revealItem}>
              <RoundCard round={r} onContinue={() => set("aptitude")} />
            </motion.div>
          ))}
        </StaggeredReveal>

        {/* Integrity status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          {CAMPAIGN.violations > 0 ? (
            <GlowCard className="flex items-center justify-between gap-3 border-rose-400/20 bg-rose-500/5 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-rose-300" />
                <p className="text-sm text-rose-100">
                  Violations: <span className="font-semibold">{CAMPAIGN.violations}</span>{" "}
                  · Integrity: <AlertTriangle className="inline h-3 w-3 align-text-bottom" /> Flagged
                </p>
              </div>
              <span className="text-xs text-rose-300/80">
                20% penalty applied
              </span>
            </GlowCard>
          ) : (
            <GlowCard className="flex items-start gap-3 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground/80">Integrity: Clean</p>
                <p className="mt-1">
                  You currently have{" "}
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">0 violations</span>.
                  Proctoring (tab switches, fullscreen exits, multiple faces,
                  phone detection) is monitored throughout. Any violation will
                  appear here and may trigger the 3-strike auto-submit rule.
                </p>
              </div>
            </GlowCard>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          Once a round is submitted, it&apos;s permanently locked. No re-entry
          or retakes. Finish what you start.
        </motion.p>

      </section>
    </div>
  );
}

function CountUnit({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const toneText = {
    emerald: "text-emerald-700 dark:text-emerald-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300",
  }[tone];
  return (
    <div className="flex flex-col items-center">
      <span className={cn("text-3xl font-semibold sm:text-4xl", toneText)}>
        {value}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function RoundCard({
  round,
  onContinue,
}: {
  round: Round;
  onContinue: () => void;
}) {
  const isDone = round.status === "completed";
  const isProgress = round.status === "in-progress";
  const isLocked = round.status === "locked";

  return (
    <GlowCard
      className={cn(
        "relative overflow-hidden p-5 sm:p-6",
        isProgress && "border-violet-400/30",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Round icon */}
        <div
          className={cn(
            "grid h-14 w-14 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
            isDone &&
              "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-400/30",
            isProgress &&
              "bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-black/10 dark:ring-white/10",
            isLocked && "bg-black/5 text-muted-foreground dark:bg-white/5 dark:text-white/40 ring-black/10 dark:ring-white/10",
          )}
        >
          <round.icon className="h-6 w-6" />
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Round {round.n}
            </span>
            {isDone && (
              <Badge variant="outline" className="rounded-full border-emerald-400/40 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            )}
            {isProgress && (
              <Badge variant="outline" className="rounded-full border-violet-400/40 bg-violet-500/10 px-2.5 py-0.5 text-violet-700 dark:text-violet-300">
                <PlayCircle className="h-3 w-3" />
                In Progress
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="rounded-full border-black/10 bg-black/5 px-2.5 py-0.5 text-muted-foreground dark:border-white/10 dark:bg-white/5">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            {round.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {round.subtitle}
          </p>

          {/* Completed score block */}
          {isDone && round.score !== undefined && (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="min-w-[160px] flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {round.score}/100
                  </span>
                </div>
                <Progress
                  value={round.score}
                  className="h-1.5 bg-emerald-500/15 [&>[data-slot=progress-indicator]]:bg-emerald-400"
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                <Award className="h-3.5 w-3.5" />
                Qualification: Passed
              </div>
            </div>
          )}

          {/* In-progress indicator */}
          {isProgress && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/5 px-3 py-2 text-xs text-violet-800 dark:text-violet-100/90">
              You&apos;ve started this round. Resume anytime before the
              deadline. Your progress is auto-saved.
            </div>
          )}

          {/* Locked reason */}
          {isLocked && round.lockedReason && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              {round.lockedReason}
            </p>
          )}
        </div>

        {/* Action */}
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {isDone && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <Trophy className="h-3.5 w-3.5" />
              Round Cleared
            </div>
          )}
          {isProgress && (
            <Button
              onClick={onContinue}
              className="h-11 rounded-full bg-violet-500 px-5 text-white hover:bg-violet-600"
            >
              <Code2 className="mr-2 h-4 w-4" />
              Continue Coding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {isLocked && (
            <Button
              disabled
              variant="outline"
              className="h-11 cursor-not-allowed rounded-full border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]"
            >
              <Lock className="mr-2 h-4 w-4" />
              Locked
            </Button>
          )}
        </div>
      </div>
    </GlowCard>
  );
}
