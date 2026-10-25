"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Cpu,
  Gauge,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  GlowCard,
  PageWrap,
  SectionHeading,
  StatCard,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MODULE_USAGE = [
  { name: "Resume Analysis", value: 45, color: "#a855f7" },
  { name: "Interview Q&A", value: 30, color: "#06b6d4" },
  { name: "Code Review", value: 12, color: "#10b981" },
  { name: "Post-Interview Report", value: 8, color: "#f59e0b" },
  { name: "Question Seeding", value: 5, color: "#f43f5e" },
];

const CHART_DATA = MODULE_USAGE.map((m) => ({
  name: m.name,
  value: m.value,
  fill: m.color,
}));

const RATE_EVENTS = [
  {
    ts: "14:23:05",
    who: "Resume analysis",
    detail: "retry #2 (4s wait)",
    severity: "amber" as const,
  },
  {
    ts: "14:25:12",
    who: "Interview question",
    detail: "retry #1 (4s wait)",
    severity: "amber" as const,
  },
  {
    ts: "14:31:48",
    who: "Code review",
    detail: "retry #3 (4s wait)",
    severity: "rose" as const,
  },
  {
    ts: "14:42:01",
    who: "Report generation",
    detail: "retry #1 (4s wait)",
    severity: "amber" as const,
  },
  {
    ts: "15:02:33",
    who: "Question seeding",
    detail: "queue throttled (4s sleep)",
    severity: "rose" as const,
  },
];

const SEVERITY_COLOR: Record<string, string> = {
  amber: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rose: "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function AIUsageMonitor() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap>
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              <p className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-300/80">
                Super Admin · AI Usage
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Gemini <span className="text-violet-500 dark:text-violet-400">consumption</span> monitor
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Real-time visibility into daily request count, token usage and
              rate-limit events. Retries fire a 4-second sleep as per the 15
              RPM quota contract.
            </p>
          </div>
          <Badge variant="outline" className="self-start rounded-full border-amber-400/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300 sm:self-end">
            Token quota 120%
          </Badge>
        </motion.header>

        {/* Stat cards */}
        <StaggeredReveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" delay={0.05}>
          <motion.div variants={revealItem}>
            <StatCard
              label="Requests today"
              value={
                <span>
                  342{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / 15,000
                  </span>
                </span>
              }
              hint="2.3% of daily quota"
              icon={<Zap className="h-4 w-4" />}
              tone="violet"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Token usage"
              value={
                <span className="inline-flex items-center gap-1.5">
                  1.2M{" "}
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                </span>
              }
              hint="120% of daily 1M limit. Over!"
              icon={<TrendingUp className="h-4 w-4" />}
              tone="amber"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Avg response time"
              value="2.3s"
              hint="p95: 4.1s · p99: 6.8s"
              icon={<Timer className="h-4 w-4" />}
              tone="sky"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Rate limit hits"
              value={5}
              hint="Today · 0 in the last hour"
              icon={<Gauge className="h-4 w-4" />}
              tone="rose"
            />
          </motion.div>
        </StaggeredReveal>

        {/* Stacked bar by module */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <GlowCard className="p-6">
            <SectionHeading
              align="left"
              eyebrow="Breakdown"
              title="Usage by module"
              description="Share of today's 342 Gemini calls per product surface."
            />
            <div className="mt-6 h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[{ stack: "today" }]}
                  layout="vertical"
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="stack" hide />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "rgba(10,10,15,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(_v, _n, p: any) => [
                      `${p.payload.value}% · ${p.payload.name}`,
                      p.payload.name,
                    ]}
                  />
                  {MODULE_USAGE.map((m) => (
                    <Bar
                      key={m.name}
                      dataKey={() => m.value}
                      name={m.name}
                      stackId="usage"
                      fill={m.color}
                      radius={
                        m.name === "Question Seeding"
                          ? [4, 4, 4, 4]
                          : undefined
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Manual legend */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {MODULE_USAGE.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: m.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground">{m.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </motion.div>

        {/* Per-module call count + Rate limit events */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlowCard className="p-6">
              <SectionHeading
                align="left"
                eyebrow="Volume"
                title="Calls per module"
                description="Today's raw Gemini invocation count by surface."
              />
              <div className="mt-6 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      interval={0}
                      height={48}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "rgba(10,10,15,0.92)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v}% of calls`, "Share"]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {CHART_DATA.map((d) => (
                        <Cell key={d.name} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <GlowCard className="p-6">
              <SectionHeading
                align="left"
                eyebrow="Live"
                title="Recent rate-limit events"
                description="Each entry is a 429 / 503 from Gemini that triggered the 4-second backoff."
              />
              <ul className="mt-5 space-y-2.5">
                {RATE_EVENTS.map((e, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {e.ts}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{e.who}</span>
                        <span className="text-muted-foreground"> · {e.detail}</span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        SEVERITY_COLOR[e.severity],
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {e.severity === "rose" ? "Hard" : "Soft"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Soft = 1 retry recovered · Hard = required 3+ retries. Both
                respect the 15 RPM contract (4s sleep between calls).
              </p>
            </GlowCard>
          </motion.div>
        </div>

      </PageWrap>
    </div>
  );
}
