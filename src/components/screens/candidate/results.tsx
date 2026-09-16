"use client";

import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Code2,
  EyeOff,
  Info,
  Lock,
  LogOut,
  ShieldCheck,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PulseBadge,
  revealItem,
  StaggeredReveal,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

// Mock results context — would come from /api/campaigns/:slug/results
const CAMPAIGN = {
  company: "Acme Corp",
  role: "Backend Developer",
};

interface RoundResult {
  label: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "violet" | "sky";
  processing?: boolean;
}

const ROUNDS: RoundResult[] = [
  {
    label: "Aptitude",
    score: 74,
    icon: Brain,
    tone: "emerald",
  },
  {
    label: "Coding",
    score: 81,
    icon: Code2,
    tone: "violet",
  },
  {
    label: "Interview",
    score: 85,
    icon: Video,
    tone: "sky",
  },
];

const HIDDEN_ROWS = [
  {
    label: "Overall Score",
    hint: "Shared with the company only.",
    icon: Trophy,
  },
  {
    label: "Your Rank",
    hint: "Visible to the hiring team only.",
    icon: Trophy,
  },
  {
    label: "Other Candidates",
    hint: "Other candidates' data is private.",
    icon: Users,
  },
];

export function CandidateResults() {
  const { set } = useNav();

  return (
    <AuroraBackground>
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <PulseBadge color="emerald">Read-only · Final</PulseBadge>
        </motion.div>

        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 16,
            delay: 0.1,
          }}
          className="mt-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30"
        >
          <CheckCircle2 className="h-10 w-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-5 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          ✅ <span className="gradient-text text-glow">Assessment Complete</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-3 text-center text-sm text-muted-foreground sm:text-base"
        >
          Your responses have been submitted to{" "}
          <span className="font-medium text-white">{CAMPAIGN.company}</span>.
        </motion.p>

        <StaggeredReveal className="mt-8 w-full" delay={0.05}>
          <motion.div variants={revealItem}>
            <GlowCard className="relative overflow-hidden p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Your Results
                  </p>
                  <p className="text-sm text-white/80">
                    {CAMPAIGN.company} · {CAMPAIGN.role}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Integrity: Clean
                </div>
              </div>

              {/* Round scores */}
              <ul className="space-y-3">
                {ROUNDS.map((r) => (
                  <li key={r.label}>
                    <RoundScoreRow result={r} />
                  </li>
                ))}
              </ul>

              <Separator className="my-6 bg-white/5" />

              {/* Hidden fields */}
              <div>
                <p className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Shared with company only
                </p>
                <ul className="space-y-2.5">
                  {HIDDEN_ROWS.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white/40 ring-1 ring-inset ring-white/10">
                        <row.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white/80">
                          {row.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {row.hint}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                        <Lock className="h-3 w-3" />
                        <EyeOff className="h-3 w-3" />
                        Hidden
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-lg border border-sky-400/20 bg-sky-500/5 px-3 py-2.5 text-xs text-sky-100/90">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />
                <p>
                  Individual round scores are visible to you. The weighted
                  overall score, your rank, and other candidates&apos; data are
                  visible only to {CAMPAIGN.company}&apos;s hiring team.
                </p>
              </div>

              <Separator className="my-6 bg-white/5" />

              <p className="text-center text-sm text-muted-foreground">
                Thank you for your time. Results will be shared with{" "}
                <span className="font-medium text-white">
                  {CAMPAIGN.company}
                </span>{" "}
                directly.
              </p>

              <MagneticButton
                onClick={() => set("landing")}
                className="mt-5 h-11 w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </MagneticButton>

              <div className="mt-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-white"
                  onClick={() => alert("Support: support@interviewai.dev")}
                >
                  Need help? Contact support
                </Button>
              </div>
            </GlowCard>
          </motion.div>
        </StaggeredReveal>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          You will not be able to retake or revise these assessments. Reach out
          to {CAMPAIGN.company}&apos;s hiring team for next steps.
        </motion.p>

      </section>
    </AuroraBackground>
  );
}

function RoundScoreRow({ result }: { result: RoundResult }) {
  const toneText = {
    emerald: "text-emerald-300",
    violet: "text-violet-300",
    sky: "text-sky-300",
  }[result.tone];

  const toneBg = {
    emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    violet: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
    sky: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  }[result.tone];

  const toneProgress = {
    emerald:
      "bg-emerald-500/15 [&>[data-slot=progress-indicator]]:bg-emerald-400",
    violet: "bg-violet-500/15 [&>[data-slot=progress-indicator]]:bg-violet-400",
    sky: "bg-sky-500/15 [&>[data-slot=progress-indicator]]:bg-sky-400",
  }[result.tone];

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
          toneBg,
        )}
      >
        <result.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium">{result.label}</span>
          <span className={cn("text-sm font-semibold tabular-nums", toneText)}>
            {result.score}/100
          </span>
        </div>
        <Progress value={result.score} className={cn("h-1.5", toneProgress)} />
      </div>
    </div>
  );
}
