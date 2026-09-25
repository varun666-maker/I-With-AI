"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  Cpu,
  Database,
  FileText,
  Gauge,
  ListChecks,
  ScrollText,
  Settings2,
  Users,
  Zap,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  GlowCard,
  PageWrap,
  SectionHeading,
  StatCard,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const PULSE_DATA = [
  { t: "00:00", v: 320 },
  { t: "03:00", v: 240 },
  { t: "06:00", v: 410 },
  { t: "09:00", v: 680 },
  { t: "12:00", v: 920 },
  { t: "15:00", v: 740 },
  { t: "18:00", v: 880 },
  { t: "21:00", v: 560 },
  { t: "23:59", v: 410 },
];

const NAV_CARDS = [
  {
    id: "superadmin-companies" as const,
    title: "Company Management",
    desc: "Suspend, reactivate and audit 23 registered companies.",
    icon: Building2,
    tone: "violet" as const,
  },
  {
    id: "superadmin-users" as const,
    title: "User Management",
    desc: "12,450 accounts across all roles with reset & GDPR delete.",
    icon: Users,
    tone: "sky" as const,
  },
  {
    id: "superadmin-ai-usage" as const,
    title: "AI Usage Monitor",
    desc: "Gemini calls, token usage, rate-limit events in real time.",
    icon: Cpu,
    tone: "emerald" as const,
  },
  {
    id: "superadmin-questions" as const,
    title: "Question Bank",
    desc: "1,770 aptitude + 315 coding problems. Reseed on demand.",
    icon: ListChecks,
    tone: "amber" as const,
  },
  {
    id: "superadmin-system" as const,
    title: "System Config",
    desc: "Maintenance mode, feature toggles, masked API keys.",
    icon: Settings2,
    tone: "violet" as const,
  },
  {
    id: "superadmin-audit" as const,
    title: "Audit Logs",
    desc: "Every admin action across the platform. Searchable.",
    icon: ScrollText,
    tone: "rose" as const,
  },
  {
    id: "superadmin-db-health" as const,
    title: "Database Health",
    desc: "PostgreSQL, MongoDB, Redis, Cloudinary, Piston, Celery.",
    icon: Database,
    tone: "emerald" as const,
  },
];

const TONE_RING: Record<string, string> = {
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  slate: "bg-black/5 text-foreground dark:bg-white/10 dark:text-white/80",
};

export function SuperAdminDashboard() {
  const { set } = useNav();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-300/80">
              Super Admin · Platform Overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Mission control for <span className="text-violet-500 dark:text-violet-400">InterviewAI</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Full cross-tenant visibility. Manage companies, users, AI quota,
              questions, infrastructure and audit trails from a single console.
            </p>
          </div>
          <Badge variant="outline" className="self-start rounded-full border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300 sm:self-end">
            All systems operational
          </Badge>
        </motion.header>

        {/* Stat cards. 4×2 grid (2×4 on mobile) */}
        <StaggeredReveal
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          delay={0.05}
        >
          <motion.div variants={revealItem}>
            <StatCard
              label="Students"
              value="12,450"
              hint="+184 this week"
              icon={<Users className="h-4 w-4" />}
              tone="violet"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Companies"
              value="23"
              hint="21 active · 2 suspended"
              icon={<Building2 className="h-4 w-4" />}
              tone="sky"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Campaigns"
              value="47"
              hint="14 currently running"
              icon={<Gauge className="h-4 w-4" />}
              tone="emerald"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Interviews"
              value="8,320"
              hint="312 in the last 24h"
              icon={<Activity className="h-4 w-4" />}
              tone="amber"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Resumes Analyzed"
              value="18,200"
              hint="Avg ATS score 73"
              icon={<FileText className="h-4 w-4" />}
              tone="violet"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Gemini Calls"
              value="45,000"
              hint="342 today · 2.3% of quota"
              icon={<Zap className="h-4 w-4" />}
              tone="sky"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="DB Health"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Good
                </span>
              }
              hint="PostgreSQL · 12ms"
              icon={<Database className="h-4 w-4" />}
              tone="emerald"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Redis Health"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Good
                </span>
              }
              hint="Upstash · 3ms"
              icon={<Cpu className="h-4 w-4" />}
              tone="amber"
            />
          </motion.div>
        </StaggeredReveal>

        {/* Platform pulse. Mini chart */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4"
        >
          <GlowCard className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Platform pulse · last 24h
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  4,891 <span className="text-sm font-normal text-muted-foreground">events processed</span>
                </p>
                <p className="mt-1 text-xs text-emerald-300">
                  ↑ 12.4% vs yesterday · throughput stable
                </p>
              </div>
              <div className="h-20 w-full md:w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PULSE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      cursor={{ stroke: "#a855f7", strokeOpacity: 0.3 }}
                      contentStyle={{
                        background: "rgba(10,10,15,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                      formatter={(v: number) => [`${v} events`, "Volume"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fill="url(#pulseGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Navigation cards */}
        <section className="mt-12">
          <SectionHeading
            align="left"
            eyebrow="Jump to"
            title="Manage the platform"
            description="Seven admin surfaces, one console. Click any card to dive in."
          />
          <StaggeredReveal
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            delay={0.05}
          >
            {NAV_CARDS.map((c) => (
              <motion.div key={c.id} variants={revealItem}>
                <GlowCard
                  className="group h-full cursor-pointer p-5"
                  glowColor="rgba(168, 85, 247, 0.22)"
                >
                  <button
                    onClick={() => set(c.id)}
                    className="flex h-full w-full flex-col items-start text-left"
                  >
                    <div
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-lg ring-1 ring-inset ring-black/10 transition-transform group-hover:scale-110 dark:ring-white/10",
                        TONE_RING[c.tone],
                      )}
                    >
                      <c.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold tracking-tight">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-300 transition-transform group-hover:translate-x-1">
                      Open section →
                    </span>
                  </button>
                </GlowCard>
              </motion.div>
            ))}
          </StaggeredReveal>
        </section>

      </PageWrap>
    </div>
  );
}
