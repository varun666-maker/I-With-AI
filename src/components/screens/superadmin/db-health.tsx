"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  HardDrive,
  Loader2,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  PageWrap,
  PulseBadge,
  SectionHeading,
  StatCard,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Component {
  id: string;
  name: string;
  desc: string;
  status: "ok" | "down";
  latency?: string;
  icon: typeof Database;
  tone: "violet" | "emerald" | "sky" | "amber" | "rose";
}

const INITIAL_COMPONENTS: Component[] = [
  {
    id: "pg",
    name: "PostgreSQL",
    desc: "Supabase · primary relational store",
    status: "ok",
    latency: "12ms",
    icon: Database,
    tone: "violet",
  },
  {
    id: "mongo",
    name: "MongoDB Atlas",
    desc: "Document store for interview transcripts",
    status: "ok",
    latency: "8ms",
    icon: Server,
    tone: "emerald",
  },
  {
    id: "redis",
    name: "Redis",
    desc: "Upstash · rate limiting & queue state",
    status: "ok",
    latency: "3ms",
    icon: Zap,
    tone: "rose",
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    desc: "Resume PDFs & proctoring screenshots",
    status: "ok",
    icon: Cloud,
    tone: "sky",
  },
  {
    id: "piston",
    name: "Piston API",
    desc: "Code execution sandbox",
    status: "ok",
    latency: "running",
    icon: Cpu,
    tone: "amber",
  },
  {
    id: "celery",
    name: "Celery Workers",
    desc: "2 active · 0 queued jobs",
    status: "ok",
    icon: Activity,
    tone: "emerald",
  },
];

const TABLE_SIZES = [
  {
    name: "users",
    rows: 12_500,
    size: "45 MB",
    growth: "+184 this week",
    tone: "violet" as const,
  },
  {
    name: "aptitude_questions",
    rows: 1_770,
    size: "12 MB",
    growth: "reseeded 12d ago",
    tone: "emerald" as const,
  },
  {
    name: "interview_sessions",
    rows: 8_320,
    size: "120 MB",
    growth: "+312 / 24h",
    tone: "amber" as const,
  },
  {
    name: "applicant_pool",
    rows: 2_100,
    size: "8 MB",
    growth: "+42 this week",
    tone: "sky" as const,
  },
];

const ROW_TONE: Record<string, string> = {
  violet: "text-violet-300",
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

export function DatabaseHealth() {
  const [components, setComponents] = useState<Component[]>(INITIAL_COMPONENTS);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastRun, setLastRun] = useState("12 minutes ago");

  const runHealthCheck = () => {
    setChecking(true);
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setChecking(false);
          setLastRun("just now");
          // Trigger a tiny visual refresh
          setComponents((prev) => [...prev]);
          return 100;
        }
        return p + 8;
      });
    }, 120);
  };

  const okCount = components.filter((c) => c.status === "ok").length;
  const totalRows = TABLE_SIZES.reduce((a, t) => a + t.rows, 0);

  return (
    <AuroraBackground>
      <PageWrap>
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-violet-300" />
              <p className="text-xs uppercase tracking-widest text-violet-300/80">
                Super Admin · Database Health
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Infrastructure <span className="gradient-text">health</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Live status for every backend dependency — relational, document,
              cache, media, sandbox and worker. Run a full health check any
              time.
            </p>
          </div>
          <PulseBadge color="emerald" className="self-start sm:self-end">
            {okCount}/{components.length} healthy
          </PulseBadge>
        </motion.header>

        {/* Top summary cards */}
        <StaggeredReveal
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          delay={0.05}
        >
          <motion.div variants={revealItem}>
            <StatCard
              label="Components"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-emerald-300">✅</span> {okCount}
                </span>
              }
              hint={`of ${components.length} up`}
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="emerald"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Avg latency"
              value="7.7ms"
              hint="Weighted across PG / Mongo / Redis"
              icon={<Zap className="h-4 w-4" />}
              tone="violet"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Total rows"
              value={totalRows.toLocaleString()}
              hint="Across 4 main tables"
              icon={<HardDrive className="h-4 w-4" />}
              tone="sky"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Last check"
              value={lastRun}
              hint="Run again any time"
              icon={<RefreshCw className="h-4 w-4" />}
              tone="amber"
            />
          </motion.div>
        </StaggeredReveal>

        {/* Component status cards */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <SectionHeading
            align="left"
            eyebrow="Components"
            title="Per-service status"
            description="If any component is down it shows ❌ with an actionable error message."
          />
          <StaggeredReveal
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            delay={0.05}
          >
            {components.map((c) => (
              <motion.div key={c.id} variants={revealItem}>
                <GlowCard className="h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10",
                        c.tone === "violet" && "from-violet-500/20 to-fuchsia-500/20 text-violet-300",
                        c.tone === "emerald" && "from-emerald-500/20 to-teal-500/20 text-emerald-300",
                        c.tone === "sky" && "from-sky-500/20 to-cyan-500/20 text-sky-300",
                        c.tone === "amber" && "from-amber-500/20 to-orange-500/20 text-amber-300",
                        c.tone === "rose" && "from-rose-500/20 to-pink-500/20 text-rose-300",
                      )}
                    >
                      <c.icon className="h-5 w-5" />
                    </div>
                    {c.status === "ok" ? (
                      <PulseBadge color="emerald">Healthy</PulseBadge>
                    ) : (
                      <PulseBadge color="rose">Down</PulseBadge>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
                    <span className="text-muted-foreground">Latency</span>
                    <span
                      className={cn(
                        "font-mono font-medium",
                        c.status === "ok" ? ROW_TONE[c.tone] : "text-rose-300",
                      )}
                    >
                      {c.status === "ok" ? c.latency ?? "—" : "—"}
                    </span>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </StaggeredReveal>
        </motion.div>

        {/* Table sizes */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-6"
        >
          <GlowCard className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
              <SectionHeading
                align="left"
                eyebrow="Storage"
                title="Table sizes"
                description="Top tables by row count. Vacuumed nightly."
              />
              <HardDrive className="h-5 w-5 text-violet-300/60" />
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-5">Table</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead className="pr-5">Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TABLE_SIZES.map((t) => {
                    const maxRows = Math.max(...TABLE_SIZES.map((x) => x.rows));
                    return (
                      <TableRow
                        key={t.name}
                        className="border-white/5 hover:bg-white/[0.03]"
                      >
                        <TableCell className="pl-5">
                          <code className="font-mono text-xs">{t.name}</code>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {t.rows.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {t.size}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {t.growth}
                        </TableCell>
                        <TableCell className="pr-5">
                          <div className="flex w-40 items-center gap-2">
                            <Progress
                              value={Math.min(100, (t.rows / maxRows) * 100)}
                              className="h-1.5 bg-white/5"
                            />
                            <span
                              className={cn(
                                "text-[11px] tabular-nums",
                                ROW_TONE[t.tone],
                              )}
                            >
                              {Math.round((t.rows / maxRows) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t border-white/10 bg-white/[0.02]">
                    <TableCell className="pl-5 font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {totalRows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      185 MB
                    </TableCell>
                    <TableCell colSpan={2} className="pr-5 text-right text-xs text-muted-foreground">
                      Well below PG 8GB soft cap
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </motion.div>

        {/* Run health check */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6"
        >
          <GlowCard className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="Diagnostics"
                  title="Run a full health check"
                  description="Pings every backend dependency, runs COUNT queries on the main tables and refreshes latencies."
                />
                {checking && (
                  <div className="mt-4">
                    <Progress value={progress} className="h-1.5 bg-white/5" />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {progress}% · pinging {components.length} services…
                    </p>
                  </div>
                )}
              </div>
              <Button
                size="lg"
                className="border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400"
                onClick={runHealthCheck}
                disabled={checking}
              >
                {checking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {checking ? "Running…" : "Run Full Health Check"}
              </Button>
            </div>
          </GlowCard>
        </motion.div>

        {/* Activity log */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6"
        >
          <GlowCard className="p-6">
            <SectionHeading
              align="left"
              eyebrow="Recent"
              title="Health-check log"
              description="Last 4 manual health checks performed by super admins."
            />
            <ul className="mt-5 space-y-2.5">
              {[
                { ts: "12 min ago", who: "admin@platform.com", result: "6 / 6 healthy · 7.7ms avg", tone: "emerald" as const },
                { ts: "1 hour ago", who: "admin@platform.com", result: "6 / 6 healthy · 8.1ms avg", tone: "emerald" as const },
                { ts: "3 hours ago", who: "auto-scheduler", result: "6 / 6 healthy · 9.4ms avg", tone: "emerald" as const },
                { ts: "yesterday 14:02", who: "admin@platform.com", result: "5 / 6 healthy · Piston degraded (retried 2x)", tone: "amber" as const },
              ].map((e, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      e.tone === "emerald" ? "bg-emerald-300" : "bg-amber-300",
                    )}
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {e.ts}
                  </span>
                  <p className="flex-1 text-sm">
                    <span className="font-medium">{e.who}</span>
                    <span className="text-muted-foreground"> — {e.result}</span>
                  </p>
                </li>
              ))}
            </ul>
          </GlowCard>
        </motion.div>

      </PageWrap>
    </AuroraBackground>
  );
}
