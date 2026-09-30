"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  Code2,
  Database,
  Download,
  FileText,
  FileUp,
  ListChecks,
  RefreshCw,
  Upload,
  X,
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
import { Input } from "@/components/ui/input";
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

        {/* Bulk upload section */}
        <BulkUploadSection />

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

/* ---------- Bulk upload section (admin questions → master bank) ---------- */

function BulkUploadSection() {
  const [openKind, setOpenKind] = useState<null | "aptitude" | "coding">(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="mt-6"
    >
      <GlowCard className="p-6">
        <SectionHeading
          align="left"
          eyebrow="Bulk add"
          title="Bulk upload questions to the master bank"
          description="Upload CSVs of aptitude MCQs or coding problems. New items are appended to the global bank and become available to every company campaign."
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BulkCard
            kind="aptitude"
            onUpload={() => setOpenKind("aptitude")}
          />
          <BulkCard
            kind="coding"
            onUpload={() => setOpenKind("coding")}
          />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Both uploaders validate column headers, run a dry-run preview, then
          import. Schema templates are downloadable inside each dialog.
        </p>
      </GlowCard>

      <BulkUploadDialog
        kind={openKind}
        onOpenChange={(o) => !o && setOpenKind(null)}
      />
    </motion.div>
  );
}

function BulkCard({
  kind,
  onUpload,
}: {
  kind: "aptitude" | "coding";
  onUpload: () => void;
}) {
  const isApt = kind === "aptitude";
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg",
              isApt
                ? "bg-violet-500/15 text-violet-300"
                : "bg-emerald-500/15 text-emerald-300",
            )}
          >
            {isApt ? (
              <Brain className="h-4 w-4" />
            ) : (
              <Code2 className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isApt ? "Aptitude Questions" : "Coding Problems"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isApt
                ? "MCQs · 5 categories · auto-categorized"
                : "DSA + SQL · with test cases · auto-validated"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground/80">Required columns</p>
        <code className="mt-1.5 block overflow-x-auto whitespace-pre font-mono text-[10px] text-violet-300">
          {isApt
            ? "category,sub_topic,difficulty,question_text,option_a,option_b,option_c,option_d,correct,explanation"
            : "title,difficulty,type,statement,signatures,visible_tests,hidden_tests,time_limit_ms,memory_limit_kb,schema"}
        </code>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={onUpload}
          size="sm"
          className="bg-violet-500 text-white hover:bg-violet-600"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Upload CSV
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadCsvTemplate(kind)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Template
        </Button>
      </div>
    </div>
  );
}

function BulkUploadDialog({
  kind,
  onOpenChange,
}: {
  kind: null | "aptitude" | "coding";
  onOpenChange: (v: boolean) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [stage, setStage] = useState<"select" | "preview" | "done">("select");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!kind) return null;
  const isApt = kind === "aptitude";

  const reset = () => {
    setFileName(null);
    setStage("select");
    setParsing(false);
    setImporting(false);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 250);
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setStage("preview");
    }, 700);
  };

  const onConfirmImport = () => {
    setImporting(true);
    setTimeout(() => {
      setStage("done");
      setImporting(false);
    }, 900);
  };

  const previewRows = isApt
    ? [
        { c1: "Quant", c2: "Time & Work", c3: "Medium", c4: "If 5 men build a wall in 10 days..." },
        { c1: "Logical", c2: "Series", c3: "Easy", c4: "Find the next: 3, 6, 11, 18..." },
        { c1: "Verbal", c2: "Synonyms", c3: "Easy", c4: "Synonym of 'Tenacious'" },
        { c1: "DI", c2: "Pie charts", c3: "Hard", c4: "If pie shows 30/20/50 split..." },
        { c1: "Analytical", c2: "Puzzles", c3: "Medium", c4: "5 friends sit in a row..." },
      ]
    : [
        { c1: "DSA", c2: "Easy", c3: "3/7", c4: "Reverse a Linked List" },
        { c1: "DSA", c2: "Medium", c3: "3/7", c4: "Kth Largest Element" },
        { c1: "SQL", c2: "Medium", c3: "3/7", c4: "Department Top 3 Salaries" },
        { c1: "DSA", c2: "Hard", c3: "3/7", c4: "Word Ladder II" },
        { c1: "SQL", c2: "Hard", c3: "3/7", c4: "Recursive Org Hierarchy" },
      ];

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg border-white/10 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-violet-300" />
            Bulk upload {isApt ? "aptitude questions" : "coding problems"} to master bank
          </DialogTitle>
          <DialogDescription>
            Uploaded items are appended to the global question bank and become
            available to every company campaign. We&apos;ll parse, show a
            preview, then ask you to confirm.
          </DialogDescription>
        </DialogHeader>

        {stage === "select" && (
          <div className="mt-3 space-y-3">
            <label
              htmlFor={`super-bulk-${kind}`}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center transition-colors hover:border-violet-400/60 hover:bg-violet-500/5",
                fileName && "border-violet-400/60 bg-violet-500/5",
              )}
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/10 text-violet-300">
                {parsing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/40 border-t-violet-400" />
                ) : fileName ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {parsing
                    ? "Parsing CSV..."
                    : fileName
                      ? fileName
                      : "Click to choose a CSV file"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {parsing
                    ? "Validating column headers..."
                    : "Max 10MB · UTF-8 encoded · .csv only"}
                </p>
              </div>
              <input
                id={`super-bulk-${kind}`}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onFileSelected}
                disabled={parsing}
              />
            </label>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground/80">Required columns</p>
              <code className="mt-1.5 block overflow-x-auto whitespace-pre font-mono text-[11px] text-violet-300">
                {isApt
                  ? "category,sub_topic,difficulty,question_text,option_a,option_b,option_c,option_d,correct,explanation"
                  : "title,difficulty,type,statement,signatures,visible_tests,hidden_tests,time_limit_ms,memory_limit_kb,schema"}
              </code>
              <p className="mt-2">
                Need the template?{" "}
                <button
                  type="button"
                  onClick={() => downloadCsvTemplate(isApt ? "aptitude" : "coding")}
                  className="font-medium text-violet-300 hover:underline"
                >
                  <Download className="mr-1 inline h-3 w-3" />
                  Download here
                </button>
              </p>
            </div>
          </div>
        )}

        {stage === "preview" && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dry-run preview</p>
                <p className="text-xs text-muted-foreground">
                  Found{" "}
                  <span className="font-semibold text-foreground/80">
                    {previewRows.length} valid rows
                  </span>{" "}
                  · 0 errors · 0 duplicates
                </p>
              </div>
              <button
                onClick={() => setStage("select")}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted-foreground hover:bg-white/5"
              >
                <X className="h-3 w-3" />
                Pick another file
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    {isApt ? (
                      <>
                        <TableHead className="pl-3 text-xs">Category</TableHead>
                        <TableHead className="text-xs">Sub-topic</TableHead>
                        <TableHead className="text-xs">Diff</TableHead>
                        <TableHead className="pr-3 text-xs">Question</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="pl-3 text-xs">Type</TableHead>
                        <TableHead className="text-xs">Diff</TableHead>
                        <TableHead className="text-xs">Tests</TableHead>
                        <TableHead className="pr-3 text-xs">Title</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r, i) => (
                    <TableRow key={i} className="border-white/5">
                      {isApt ? (
                        <>
                          <TableCell className="pl-3 py-2 text-xs">{r.c1}</TableCell>
                          <TableCell className="py-2 text-xs">{r.c2}</TableCell>
                          <TableCell className="py-2 text-xs">{r.c3}</TableCell>
                          <TableCell className="pr-3 py-2 text-xs text-muted-foreground">
                            <span className="line-clamp-1">{r.c4}</span>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="pl-3 py-2 text-xs">{r.c1}</TableCell>
                          <TableCell className="py-2 text-xs">{r.c2}</TableCell>
                          <TableCell className="py-2 text-xs font-mono">{r.c3}</TableCell>
                          <TableCell className="pr-3 py-2 text-xs font-medium">
                            <span className="line-clamp-1">{r.c4}</span>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="mt-3 flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Imported to master bank</p>
            <p className="text-xs text-muted-foreground">
              {previewRows.length}{" "}
              {isApt ? "questions" : "problems"} appended. Available to all
              company campaigns now.
            </p>
          </div>
        )}

        <DialogFooter className="mt-4 flex gap-2">
          {stage !== "done" && (
            <Button
              variant="ghost"
              onClick={close}
              className="text-muted-foreground"
              disabled={parsing || importing}
            >
              Cancel
            </Button>
          )}
          {stage === "preview" && (
            <Button
              onClick={onConfirmImport}
              disabled={importing}
              className="bg-violet-500 text-white hover:bg-violet-600"
            >
              {importing ? (
                <>
                  <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Importing...
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Import {previewRows.length} {isApt ? "questions" : "problems"}
                </>
              )}
            </Button>
          )}
          {stage === "done" && (
            <Button
              onClick={close}
              className="bg-violet-500 text-white hover:bg-violet-600"
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- CSV template downloader (mirrors admin/questions.tsx) ---------- */

/**
 * Build a CSV template (with header row + 2 example rows) for either
 * aptitude or coding, then trigger a browser download. Pure client-side.
 */
function downloadCsvTemplate(kind: "aptitude" | "coding") {
  if (typeof window === "undefined") return;
  const isApt = kind === "aptitude";
  const header = isApt
    ? [
        "category",
        "sub_topic",
        "difficulty",
        "question_text",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct",
        "explanation",
      ].join(",")
    : [
        "title",
        "difficulty",
        "type",
        "statement",
        "signatures",
        "visible_tests",
        "hidden_tests",
        "time_limit_ms",
        "memory_limit_kb",
        "schema",
      ].join(",");

  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = isApt
    ? [
        [
          "Quant",
          "Time & Work",
          "Medium",
          esc("If 6 men can complete a task in 12 days, how long will 9 men take?"),
          esc("8 days"),
          esc("9 days"),
          esc("6 days"),
          esc("18 days"),
          "A",
          esc("Total man-days = 6 × 12 = 72. With 9 men, time = 72 / 9 = 8 days."),
        ].join(","),
        [
          "Logical",
          "Series",
          "Easy",
          esc("Find the next term: 2, 6, 12, 20, 30, ?"),
          esc("40"),
          esc("42"),
          esc("44"),
          esc("46"),
          "B",
          esc("Differences: 4, 6, 8, 10, 12. Next term = 30 + 12 = 42."),
        ].join(","),
      ]
    : [
        [
          esc("Two Sum (Sorted)"),
          "Easy",
          "DSA",
          esc("Given a sorted array of integers and a target, return the 1-based indices of the two numbers that add to target."),
          esc("function twoSum(arr: number[], target: number): number[]"),
          "3",
          "7",
          "1000",
          "256",
          "",
        ].join(","),
        [
          esc("Top 3 Products by Revenue"),
          "Medium",
          "SQL",
          esc("Given orders(order_id, product_id, qty, price, created_at), return the top 3 products by total revenue in the last 30 days."),
          esc("SELECT product_id, SUM(qty*price) AS revenue ..."),
          "3",
          "7",
          "2000",
          "512",
          esc("CREATE TABLE orders (order_id INT PRIMARY KEY, product_id INT, qty INT, price DECIMAL(10,2), created_at TIMESTAMP);"),
        ].join(","),
      ];

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = isApt
    ? "aptitude_questions_template.csv"
    : "coding_problems_template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
