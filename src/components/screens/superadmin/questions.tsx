"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Database,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import {
  GlowCard,
  PageWrap,
  SectionHeading,
  StatCard,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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

const APTITUDE = [
  { category: "Quantitative", count: 512, lastReseed: "12 days ago", tone: "violet" as const },
  { category: "Logical Reasoning", count: 408, lastReseed: "12 days ago", tone: "sky" as const },
  { category: "Verbal Ability", count: 305, lastReseed: "12 days ago", tone: "emerald" as const },
  { category: "Analytical Reasoning", count: 298, lastReseed: "12 days ago", tone: "amber" as const },
  { category: "Data Interpretation", count: 247, lastReseed: "12 days ago", tone: "rose" as const },
];

const CODING = [
  { category: "DSA Problems", count: 210, lastReseed: "8 days ago", tone: "violet" as const },
  { category: "SQL Problems", count: 105, lastReseed: "8 days ago", tone: "emerald" as const },
];

const QUALITY = [
  {
    label: "Avg times used per question",
    value: 12.3,
    hint: "Across all surfaces",
    tone: "violet" as const,
    icon: <ListChecks className="h-4 w-4" />,
  },
  {
    label: "Never used",
    value: 234,
    hint: "Eligible for reseed",
    tone: "amber" as const,
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    label: "Over-used (>50 times)",
    value: 45,
    hint: "Risk of memorization",
    tone: "rose" as const,
    icon: <AlertTriangle className="h-4 w-4" />,
  },
];

export function QuestionBankAdmin() {
  const { set } = useNav();
  const [reseedOpen, setReseedOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(0);

  const startReseed = () => {
    setSeeding(true);
    setProgress(0);
    // Mock the 30-minute job with a fast animated progress bar
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setSeeding(false);
          setReseedOpen(false);
          return 100;
        }
        return p + 5;
      });
    }, 120);
  };

  const aptitudeTotal = APTITUDE.reduce((a, c) => a + c.count, 0);
  const codingTotal = CODING.reduce((a, c) => a + c.count, 0);
  const grandTotal = aptitudeTotal + codingTotal;

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
              <ListChecks className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              <p className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-300/80">
                Super Admin · Question Bank
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Question <span className="text-violet-500 dark:text-violet-400">bank</span> management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Inventory of {grandTotal.toLocaleString()} AI-generated items
              across aptitude and coding. Trigger a full reseed to regenerate
              everything via Gemini (respecting the 15 RPM quota).
            </p>
          </div>
          <Badge variant="outline" className="self-start rounded-full border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300 sm:self-end">
            {grandTotal.toLocaleString()} items live
          </Badge>
        </motion.header>

        {/* Top-level stat cards */}
        <StaggeredReveal className="grid grid-cols-2 gap-4 lg:grid-cols-4" delay={0.05}>
          <motion.div variants={revealItem}>
            <StatCard
              label="Aptitude items"
              value={aptitudeTotal.toLocaleString()}
              hint="5 categories"
              icon={<ListChecks className="h-4 w-4" />}
              tone="violet"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Coding problems"
              value={codingTotal.toLocaleString()}
              hint="DSA + SQL"
              icon={<Code2 className="h-4 w-4" />}
              tone="emerald"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Last full reseed"
              value="12 days"
              hint="By admin@platform.com"
              icon={<RefreshCw className="h-4 w-4" />}
              tone="sky"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Bank quality"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy
                </span>
              }
              hint="Coverage ≥ target on all categories"
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="emerald"
            />
          </motion.div>
        </StaggeredReveal>

        {/* Aptitude table */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <GlowCard className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
              <SectionHeading
                align="left"
                eyebrow="Aptitude"
                title="Aptitude categories"
                description="Five banks, each maintained above its target coverage."
              />
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-5">Category</TableHead>
                    <TableHead className="text-right">Questions</TableHead>
                    <TableHead className="text-right">Coverage</TableHead>
                    <TableHead>Last reseeded</TableHead>
                    <TableHead className="pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {APTITUDE.map((c) => (
                    <TableRow key={c.category} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell className="pl-5 font-medium">{c.category}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c.count}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto flex w-32 items-center gap-2">
                          <Progress
                            value={Math.min(100, (c.count / 512) * 100)}
                            className="h-1.5 bg-white/5"
                          />
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {Math.round((c.count / 512) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.lastReseed}
                      </TableCell>
                      <TableCell className="pr-5">
                        <Badge variant="outline" className="rounded-full border-emerald-400/40 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Healthy
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t border-white/10 bg-white/[0.02]">
                    <TableCell className="pl-5 font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {aptitudeTotal.toLocaleString()}
                    </TableCell>
                    <TableCell colSpan={3} className="pr-5 text-right text-xs text-muted-foreground">
                      Updated automatically when Celery reseeds
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </motion.div>

        {/* Coding table */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="mt-6"
        >
          <GlowCard className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
              <SectionHeading
                align="left"
                eyebrow="Coding"
                title="Coding problems"
                description="Auto-validated with hidden test cases via Piston."
              />
              <Code2 className="h-5 w-5 text-emerald-300/70" />
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-5">Section</TableHead>
                    <TableHead className="text-right">Problems</TableHead>
                    <TableHead className="text-right">Coverage</TableHead>
                    <TableHead>Last reseeded</TableHead>
                    <TableHead className="pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CODING.map((c) => (
                    <TableRow key={c.category} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell className="pl-5 font-medium">{c.category}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.count}</TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto flex w-32 items-center gap-2">
                          <Progress
                            value={Math.min(100, (c.count / 210) * 100)}
                            className="h-1.5 bg-white/5"
                          />
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {Math.round((c.count / 210) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.lastReseed}
                      </TableCell>
                      <TableCell className="pr-5">
                        <Badge variant="outline" className="rounded-full border-emerald-400/40 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Healthy
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t border-white/10 bg-white/[0.02]">
                    <TableCell className="pl-5 font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {codingTotal}
                    </TableCell>
                    <TableCell colSpan={3} className="pr-5 text-right text-xs text-muted-foreground">
                      Test-case coverage: 100%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </motion.div>

        {/* Quality metrics + Reseed danger zone */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GlowCard className="h-full p-6">
              <SectionHeading
                align="left"
                eyebrow="Quality"
                title="Bank health metrics"
                description="Surfaced from the last 30 days of question usage."
              />
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {QUALITY.map((q) => (
                  <div
                    key={q.label}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {q.label}
                      </p>
                      <div
                        className={cn(
                          "rounded-lg border border-white/10 bg-white/5 p-1.5",
                          q.tone === "violet" && "text-violet-300",
                          q.tone === "amber" && "text-amber-300",
                          q.tone === "rose" && "text-rose-300",
                        )}
                      >
                        {q.icon}
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      {q.value}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {q.hint}
                    </p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>

          <GlowCard className="relative overflow-hidden p-6">
            <SectionHeading
              align="left"
              eyebrow="Danger zone"
              title="Reseed all questions"
              description="Regenerate every item via Gemini."
            />
            <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/5 p-3 text-xs text-rose-200/80">
              Existing questions are replaced. ~30 minutes. Respects the 15 RPM
              quota with a 4-second sleep between Gemini calls.
            </p>
            <Button
              className="mt-4 w-full bg-rose-500 text-white hover:bg-rose-600"
              onClick={() => setReseedOpen(true)}
              disabled={seeding}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", seeding && "animate-spin")} />
              {seeding ? "Reseeding…" : "Reseed All Questions"}
            </Button>
            {seeding && (
              <div className="mt-4">
                <Progress value={progress} className="h-1.5 bg-white/5" />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {progress}% · calling Gemini… (mock. Real job ~30 min)
                </p>
              </div>
            )}
          </GlowCard>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need to inspect per-question analytics?{" "}
          <button
            onClick={() => set("superadmin-audit")}
            className="font-medium text-violet-300 hover:text-violet-200"
          >
            View the audit log →
          </button>
        </p>

      </PageWrap>

      {/* Reseed confirmation */}
      <Dialog open={reseedOpen} onOpenChange={(o) => !o && setReseedOpen(o)}>
        <DialogContent className="border-rose-400/30 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-200">
              <Database className="h-5 w-5" />
              Reseed all questions?
            </DialogTitle>
            <DialogDescription className="text-rose-200/80">
              This will regenerate ALL questions via Gemini and replace existing
              ones. Takes approximately 30 minutes. Continue?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 rounded-lg border border-rose-400/20 bg-rose-500/5 p-3 text-xs text-rose-200/80">
            <p className="font-medium text-rose-100">What happens next</p>
            <ul className="mt-1.5 space-y-1">
              <li>· A Celery job enqueues 2,085 Gemini calls.</li>
              <li>· 4-second sleep between calls (15 RPM quota).</li>
              <li>· Old questions are replaced atomically per category.</li>
              <li>· Audit log records QUESTION_RESEED.</li>
            </ul>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setReseedOpen(false)}
              disabled={seeding}
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={startReseed}
              disabled={seeding}
            >
              <RefreshCw className={cn("mr-1.5 h-4 w-4", seeding && "animate-spin")} />
              {seeding ? "Reseeding…" : "Reseed everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
