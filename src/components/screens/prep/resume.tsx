"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  PageWrap,
  SectionHeading,
  Shimmer,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

type TabKey = "upload" | "results" | "history";

const SKILLS_FOUND = ["Python", "FastAPI", "React", "SQL", "PostgreSQL", "REST", "Git"];
const SKILLS_MISSING = ["Docker", "CI/CD", "Testing"];
const SKILLS_RECOMMENDED = ["System Design", "Redis", "Kafka"];

const GRAMMAR_ISSUES = [
  { line: 12, issue: "“utilised” - overused verb", fix: "Use “built” or “shipped” for impact." },
  { line: 23, issue: "Passive voice - “was implemented”", fix: "Use active: “Implemented a FastAPI service…”" },
  { line: 41, issue: "Missing Oxford comma", fix: "Add a comma before the final “and”." },
];

const FORMAT_ISSUES = [
  "No consistent date format (mix of Mar 2022 and 03/2022).",
  "Missing LinkedIn URL in the header.",
  "Bullet points inconsistent (some end with periods, some don’t).",
  "Two fonts detected (Inter + Georgia).",
];

const HISTORY = [
  { date: "Jan 15, 2025", ats: 87, fit: 78, role: "Backend Developer", file: "priya_sharma_v4.pdf" },
  { date: "Dec 28, 2024", ats: 81, fit: 72, role: "Backend Developer", file: "priya_sharma_v3.pdf" },
  { date: "Dec 10, 2024", ats: 74, fit: 68, role: "Full-stack Developer", file: "priya_sharma_v2.pdf" },
  { date: "Nov 22, 2024", ats: 67, fit: 60, role: "Backend Developer", file: "priya_sharma_v1.pdf" },
];

export function ResumeHub() {
  const { set } = useNav();
  const [tab, setTab] = useState<TabKey>("upload");
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading">("idle");

  const onPick = () => {
    setFile({ name: "priya_sharma_v4.pdf", size: "184 KB" });
    setPhase("idle");
  };
  const onAnalyze = () => {
    if (!file) return;
    setPhase("loading");
    setTimeout(() => {
      setPhase("idle");
      setTab("results");
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap>
        <BackToHome />
        <SectionHeading
          eyebrow="Resume Hub"
          title={<>Resume <span className="text-violet-500 dark:text-violet-400">ATS Analyzer</span></>}
          description="Upload your resume in PDF or DOCX. Our AI gives you an ATS score, missing keywords, grammar and formatting issues, and a personalised improvement plan in under 15 seconds."
          align="left"
        />

        {/* In-page tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {([
            ["upload", "1. Upload"],
            ["results", "2. Results"],
            ["history", "3. History"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "relative rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                tab === k
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-100"
                  : "border-black/10 bg-black/[0.02] text-muted-foreground hover:text-foreground dark:border-white/10 dark:bg-white/[0.03]",
              )}
            >
              {label}
              {tab === k && (
                <motion.span
                  layoutId="resume-tab-pill"
                  className="absolute inset-x-2 -bottom-px h-px bg-violet-400"
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {tab === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm sm:p-8 dark:border-white/10">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
                    <div>
                      <Badge variant="outline" className="mb-3 border-emerald-400/30 bg-emerald-500/10 text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-200">
                        Free analysis · 15s avg
                      </Badge>
                      <h3 className="text-xl font-semibold tracking-tight">Drop your resume here</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        We accept PDF or DOCX up to 5&nbsp;MB. Your resume never leaves the platform. Analysis runs over a secure worker and is deleted after 30 days. All past versions are saved to your account so you can compare progress over time.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                        {[
                          "ATS keyword scan against 200+ role templates",
                          "Grammar & formatting audit with line-level fixes",
                          "Skill-gap detection and recommendation list",
                          "Job-fit percentage for your chosen role",
                        ].map((l) => (
                          <li key={l} className="flex items-start gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-500 dark:bg-violet-400" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Dropzone
                      file={file}
                      onPick={onPick}
                      onClear={() => setFile(null)}
                      onAnalyze={onAnalyze}
                      loading={phase === "loading"}
                    />
                  </div>
                </div>

                {phase === "loading" && (
                  <div className="mt-4 rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-500 dark:text-violet-400" />
                      <p className="text-sm text-muted-foreground">
                        Analyzing resume… extracting skills, running ATS scan, scoring grammar.
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Shimmer key={i} className="h-28" />
                      ))}
                    </div>
                    <Shimmer className="mt-3 h-40" />
                  </div>
                )}
              </motion.div>
            )}

            {tab === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <StaggeredReveal className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <motion.div variants={revealItem}>
                    <ScoreCard label="ATS Score" value={87} max={100} tone="emerald" hint="Top quartile for Backend Developer" />
                  </motion.div>
                  <motion.div variants={revealItem}>
                    <ScoreCard label="Overall Resume Score" value={82} max={100} tone="violet" hint="Weighted across structure, content, keywords" />
                  </motion.div>
                  <motion.div variants={revealItem}>
                    <ScoreCard label="Job Fit" value={78} max={100} tone="amber" hint="Backend Developer · +6 since last edit" />
                  </motion.div>
                </StaggeredReveal>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Skills Found</p>
                      <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">{SKILLS_FOUND.length}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {SKILLS_FOUND.map((s) => (
                        <Badge key={s} className="border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                    <p className="text-sm font-medium">Missing & Recommended Skills</p>
                    <div className="mt-3">
                      <p className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-300">Missing. High priority</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {SKILLS_MISSING.map((s) => (
                          <Badge key={s} className="border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200">
                            <X className="h-3 w-3" /> {s}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-3 text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-300">Recommended. Bonus</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {SKILLS_RECOMMENDED.map((s) => (
                          <Badge key={s} className="border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Grammar Issues</p>
                      <Badge className="border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200">{GRAMMAR_ISSUES.length}</Badge>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {GRAMMAR_ISSUES.map((g) => (
                        <li key={g.line} className="rounded-md border border-black/5 bg-black/[0.02] p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-rose-700 dark:text-rose-200">L{g.line}</span>
                            <span className="text-foreground/80">{g.issue}</span>
                          </div>
                          <p className="mt-1.5 text-emerald-700 dark:text-emerald-300">
                            <span className="font-medium">Fix:</span> {g.fix}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Formatting Issues</p>
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    </div>
                    <ul className="mt-3 space-y-2 text-xs text-foreground/80">
                      {FORMAT_ISSUES.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-md border border-black/5 bg-black/[0.02] px-3 py-2 dark:border-white/5 dark:bg-white/[0.02]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                    <p className="text-sm font-medium">AI Summary</p>
                  </div>
                  <p className="mt-3 text-sm text-pretty text-muted-foreground">
                    Priya has a strong foundation in backend development with Python and FastAPI. Her resume shows real impact, shipping a service that handles 2M requests/day, and owning a key ingestion pipeline end-to-end. However, the document under-sells her DevOps experience: she mentions Docker briefly but doesn&apos;t list CI/CD tools (GitHub Actions, GitLab CI) which the backend JD requires. Adding 2-3 measurable bullets around observability and testing would push her ATS score past 90 for the Backend Developer role.
                  </p>
                  <p className="mt-3 text-sm text-pretty text-muted-foreground">
                    The resume is clean and uses action verbs, but mixes two typefaces (Inter + Georgia) and lacks a LinkedIn URL. Address these formatting issues first. They&apos;re 10-minute fixes. Then add the missing keywords (Docker, CI/CD, Testing) and re-upload to see the score jump.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/5">Experience Level: Junior</Badge>
                    <Badge variant="outline" className="border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/5">Word Count: 487</Badge>
                    <Badge variant="outline" className="border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/5">Pages: 1</Badge>
                    <Badge variant="outline" className="border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/5">File: PDF · 184 KB</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-full bg-violet-500 text-white hover:bg-violet-600">
                    <Download className="mr-2 h-4 w-4" /> Download Full Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTab("upload")}
                    className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload New Resume
                  </Button>
                </div>
              </motion.div>
            )}

            {tab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Upload History</p>
                      <p className="text-[11px] text-muted-foreground">All resume versions are saved. Click “View” to re-open an analysis.</p>
                    </div>
                    <BookOpen className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                  </div>

                  {/* Desktop table */}
                  <div className="mt-4 hidden overflow-hidden rounded-lg border border-black/10 md:block dark:border-white/10">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-black/10 hover:bg-transparent dark:border-white/10">
                          <TableHead className="text-muted-foreground">Date</TableHead>
                          <TableHead className="text-muted-foreground">File</TableHead>
                          <TableHead className="text-muted-foreground">Target Role</TableHead>
                          <TableHead className="text-muted-foreground">ATS Score</TableHead>
                          <TableHead className="text-muted-foreground">Job Fit</TableHead>
                          <TableHead className="text-right text-muted-foreground">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {HISTORY.map((h, i) => (
                          <TableRow key={i} className="border-black/10 hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.02]">
                            <TableCell className="text-sm">{h.date}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{h.file}</TableCell>
                            <TableCell className="text-sm">{h.role}</TableCell>
                            <TableCell>
                              <span className={cn("font-mono font-semibold", h.ats >= 80 ? "text-emerald-600 dark:text-emerald-300" : h.ats >= 70 ? "text-amber-600 dark:text-amber-300" : "text-rose-600 dark:text-rose-300")}>
                                {h.ats}/100
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono font-semibold text-foreground">{h.fit}%</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <button
                                onClick={() => setTab("results")}
                                className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                              >
                                View →
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <ul className="mt-4 space-y-2 md:hidden">
                    {HISTORY.map((h, i) => (
                      <li key={i} className="rounded-lg border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{h.role}</p>
                          <button
                            onClick={() => setTab("results")}
                            className="text-xs text-violet-600 dark:text-violet-400"
                          >
                            View →
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{h.date} · {h.file}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-300">ATS {h.ats}</span>
                          <span className="text-muted-foreground">·</span>
                          <span>Fit {h.fit}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Inline tab list at bottom */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-8 hidden">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" />
          <TabsContent value="results" />
          <TabsContent value="history" />
        </Tabs>

        {/* Footer CTA */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-lg border border-black/10 bg-card p-5 shadow-sm sm:flex-row sm:items-center dark:border-white/10">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-300" />
            <div>
              <p className="text-sm font-medium">Want tailored interview questions for your role?</p>
              <p className="text-xs text-muted-foreground">Take an AI interview. Questions are generated from your resume + profile.</p>
            </div>
          </div>
          <Button
            onClick={() => set("interview")}
            className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
          >
            Start Interview <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

      </PageWrap>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Dropzone({
  file,
  onPick,
  onClear,
  onAnalyze,
  loading,
}: {
  file: { name: string; size: string } | null;
  onPick: () => void;
  onClear: () => void;
  onAnalyze: () => void;
  loading: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <div>
      <button
        onClick={onPick}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onPick();
        }}
        className={cn(
          "group grid min-h-[260px] w-full place-items-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragging
            ? "border-violet-400/60 bg-violet-500/10"
            : "border-black/15 bg-black/[0.02] hover:border-violet-400/40 hover:bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.02] dark:hover:bg-white/[0.03]",
        )}
      >
        <div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-violet-500/10 text-violet-500 ring-1 ring-inset ring-black/10 dark:text-violet-400 dark:ring-white/10"
          >
            <Upload className="h-6 w-6" />
          </motion.div>
          <p className="mt-4 text-sm font-medium">
            {dragging ? "Drop your file to upload" : "Drag & drop your resume"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or <span className="text-violet-600 underline-offset-2 group-hover:underline dark:text-violet-400">browse files</span> · PDF or DOCX · max 5&nbsp;MB
          </p>
        </div>
      </button>

      {file && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-300">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-[11px] text-muted-foreground">{file.size} · ready to analyze</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-rose-500"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
            <Button
              onClick={onAnalyze}
              disabled={loading}
              className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" /> Analyze Resume
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  max,
  tone,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  tone: "emerald" | "violet" | "amber";
  hint: string;
}) {
  const toneRing: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-300",
    violet: "text-violet-500 dark:text-violet-300",
    amber: "text-amber-600 dark:text-amber-300",
  };
  const pct = (value / max) * 100;
  return (
    <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cn("text-4xl font-semibold tracking-tight", toneRing[tone])}>{value}</span>
        <span className="text-sm text-muted-foreground">/{max}</span>
      </div>
      <Progress value={pct} className={cn("mt-3 bg-black/10 dark:bg-white/10")} />
      <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

/* keep imports referenced */
export const __icons = { Clock };
