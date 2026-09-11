"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  Eye,
  FileText,
  FlaskConical,
  GraduationCap,
  Heart,
  Info,
  Layers,
  Lightbulb,
  ListChecks,
  Mic,
  Milestone,
  Quote,
  RefreshCw,
  Smile,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
  Video,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AuroraBackground,
  GlowCard,
  PageWrap,
  PulseBadge,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const SCORES = [
  { dim: "Technical", score: 82, color: "bg-violet-400" },
  { dim: "Communication", score: 74, color: "bg-fuchsia-400" },
  { dim: "Behavioral", score: 68, color: "bg-sky-400" },
  { dim: "Body Language", score: 71, color: "bg-emerald-400" },
  { dim: "Confidence", score: 79, color: "bg-amber-400" },
  { dim: "Problem Solving", score: 85, color: "bg-rose-400" },
];

const EMOTION_TIMELINE = [
  { q: 1, neutral: 65, happy: 20, surprised: 10, sad: 5 },
  { q: 2, neutral: 55, happy: 30, surprised: 12, sad: 3 },
  { q: 3, neutral: 60, happy: 25, surprised: 8, sad: 7 },
  { q: 4, neutral: 40, happy: 45, surprised: 12, sad: 3 },
  { q: 5, neutral: 50, happy: 35, surprised: 8, sad: 7 },
  { q: 6, neutral: 35, happy: 50, surprised: 10, sad: 5 },
  { q: 7, neutral: 70, happy: 15, surprised: 5, sad: 10 },
  { q: 8, neutral: 45, happy: 25, surprised: 5, sad: 25 },
  { q: 9, neutral: 55, happy: 30, surprised: 10, sad: 5 },
  { q: 10, neutral: 40, happy: 50, surprised: 7, sad: 3 },
];

const HIGHLIGHTS = [
  { q: 5, t: "1:42", title: "Best answer at Q5", desc: "Strong STAR story about the Redis memory leak — concrete metrics, clear ownership." },
  { q: 8, t: "3:30", title: "Weakest moment at Q8", desc: "Lost structure when asked about cross-team conflict. Consider the STAR-L framework." },
  { q: 3, t: "0:54", title: "Surprising insight at Q3", desc: "Used the word &lsquo;curious&rsquo; 4 times — strong curiosity signal flagged for the role." },
];

const STRENGTHS = [
  "Strong conceptual understanding of distributed systems — explained CAP theorem correctly.",
  "Excellent eye contact throughout (78% — well above the 65% baseline).",
  "Clear, calm vocal tone even under pressure. Pacing averaged 142 wpm (ideal range).",
  "Used concrete metrics — &ldquo;2M req/day&rdquo;, &ldquo;p99 latency 80ms&rdquo; — instead of vague claims.",
  "Asked a thoughtful clarifying question before answering the system design prompt.",
  "Owned failures honestly — talked about a Postgres deadlock without blaming teammates.",
  "Closed the interview with two strong questions about the team&apos;s roadmap.",
];

const IMPROVEMENTS = [
  "Reduce filler words — used &lsquo;um&rsquo; 23 times and &lsquo;like&rsquo; 11 times (mostly in Q1 and Q8).",
  "Provide more structured answers using the STAR method — 3 of 10 answers lacked the &lsquo;Result&rsquo; step.",
  "Posture dropped in the second half — 4 slouching warnings after Q6. Sit upright, feet flat.",
  "Eye contact breaks during technical explanations — you looked up-left 7 times while thinking.",
  "Avoid hedging phrases like &lsquo;sort of&rsquo; / &lsquo;I guess&rsquo; — used 9 times. Replace with confident assertions.",
  "When stuck on system design, draw the architecture aloud instead of pausing 8+ seconds.",
  "End answers with a 1-line summary — only 2 of 10 answers had a closing line.",
];

const ROADMAP_WEEKS = [
  {
    theme: "Week 1 · Core Fundamentals",
    goal: "Refresh DSA basics, Big-O, and core data structures (arrays, hashmaps, linked lists).",
    resources: ["NeetCode 150 (free)", "Big-O Cheat Sheet (free)", "Structy.dev arrays track"],
    milestone: "Solve 15 array + hashmap problems in under 12 min each.",
  },
  {
    theme: "Week 2 · System Design Primer",
    goal: "Understand load balancers, caching layers, message queues, and DB trade-offs.",
    resources: ["ByteByteGo newsletter (free)", "Designing Data-Intensive Apps (book)", "Gaurav Sen YouTube"],
    milestone: "Design a URL-shortener end-to-end on a whiteboard.",
  },
  {
    theme: "Week 3 · Backend Deep Dive",
    goal: "Concurrency, REST/gRPC, DB indexes, transactions, idempotency.",
    resources: ["FastAPI docs", "PostgreSQL EXPLAIN tutorial", "Stripe idempotency blog"],
    milestone: "Refactor a personal project to add idempotent POST endpoints.",
  },
  {
    theme: "Week 4 · Frontend Speedrun",
    goal: "React hooks, state management, performance budgets, accessibility.",
    resources: ["Epic React (free chapters)", "Web.dev Performance", "Josh Comeau CSS"],
    milestone: "Build a dashboard with Lighthouse score ≥ 90.",
  },
  {
    theme: "Week 5 · Behavioral STAR Stories",
    goal: "Write 6 rehearsed STAR stories covering conflict, failure, leadership, ambiguity.",
    resources: ["Amazon LP list (free)", "STAR method primer", "Your own resume bullets"],
    milestone: "Record 6 stories and rehearse each under 90 seconds.",
  },
  {
    theme: "Week 6 · Mock Loop",
    goal: "Daily 1 mock interview + report review. Target overall score ≥ 85.",
    resources: ["InterviewAI (this platform)", "Pramp (free peer mocks)", "Exponent mock library"],
    milestone: "Complete 5 mock interviews with score ≥ 85 on the final one.",
  },
];

export function InterviewReport() {
  const { set } = useNav();
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <AuroraBackground showGrid={false}>
      {/* Sticky download button */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed right-4 top-20 z-40 sm:right-6"
      >
        <Button
          onClick={download}
          disabled={downloading}
          className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 shadow-2xl"
        >
          <Download className={cn("mr-2 h-4 w-4", downloading && "animate-bounce")} />
          {downloading ? "Generating…" : "Download PDF"}
        </Button>
      </motion.div>

      <PageWrap>
        <BackToHome />

        <div className="mt-2">
          <PulseBadge color="emerald" className="mb-3 text-[11px] uppercase tracking-widest">
            Interview Report · v4
          </PulseBadge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Interview Report — <span className="gradient-text">Priya Sharma</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Generated on <span className="text-foreground">Jan 15, 2025</span> · Interview type <span className="text-foreground">Technical — Role-Specific (Backend)</span> · Session ID <span className="font-mono text-foreground">#INT-2025-0115-P3XK</span> · Duration 28 min 14 sec.
          </p>
        </div>

        <StaggeredReveal className="mt-8 space-y-4" delay={0.04}>
          {/* 1. Cover Page */}
          <SectionCard n={1} title="Cover Page" icon={FileText}>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">
                      Interview<span className="gradient-text">AI</span>
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Interview Report</h3>
                  <p className="mt-1 text-sm text-muted-foreground">A comprehensive analysis of your AI interview performance.</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Candidate</p>
                  <p className="mt-1 font-semibold">Priya Sharma</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">Date</p>
                  <p className="mt-1 font-medium">Jan 15, 2025</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { l: "Interview Type", v: "Technical · Backend" },
                  { l: "Duration", v: "28m 14s" },
                  { l: "Questions", v: "10 / 10" },
                  { l: "Overall Score", v: "78 / 100" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                    <p className="mt-1 text-sm font-semibold">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* 2. Executive Summary */}
          <SectionCard n={2} title="Executive Summary" icon={BarChart3}>
            <div className="space-y-3 text-sm text-foreground/85">
              <p>
                Priya demonstrated a strong technical foundation with a clear ability to articulate distributed-systems concepts. Her overall interview score of <strong className="text-violet-300">78/100</strong> places her in the &ldquo;Recommend&rdquo; band — a 4-point improvement from her previous session, indicating steady growth. The interview was conducted in <em>Technical — Role-Specific (Backend)</em> mode with 10 questions across behavioral, system design, and deep technical tracks.
              </p>
              <p>
                Her strengths lie in conceptual clarity (scoring 85/100 in Problem Solving) and consistent vocal tone under pressure. She used concrete metrics (&ldquo;2M requests/day&rdquo;, &ldquo;p99 latency 80ms&rdquo;) — a sign of seasoned engineering communication. Eye contact averaged <strong>78%</strong>, well above the 65% baseline, and posture remained consistent through the first half of the interview.
              </p>
              <p>
                The two most impactful improvements are (1) reducing filler words (used &lsquo;um&rsquo; 23 times — mostly during transitions), and (2) tightening the &lsquo;Result&rsquo; step in STAR-format answers. Addressing these two items is estimated to push the next score past 85. A detailed 6-week roadmap is provided in section 16.
              </p>
            </div>
          </SectionCard>

          {/* 3. Overall Score Table */}
          <SectionCard n={3} title="Overall Score Table" icon={Award}>
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Dimension</th>
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Score</th>
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {SCORES.map((s) => (
                    <tr key={s.dim} className="border-b border-white/5 last:border-0">
                      <td className="px-3 py-2 font-medium">{s.dim}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-violet-300">{s.score}/100</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                            <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.score}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground">{s.score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* 4. Hiring Recommendation */}
          <SectionCard n={4} title="Hiring Recommendation" icon={Trophy}>
            <div className="relative overflow-hidden rounded-xl border border-sky-400/30 bg-sky-500/10 p-6 text-center">
              <Badge className="mx-auto border-sky-400/40 bg-sky-500/20 text-sky-100">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Backend Developer · Junior-Mid
              </Badge>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-sky-200 sm:text-4xl">Recommend</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Based on overall score (78), technical accuracy (82), and behavioral signals. Priya shows strong potential for the Backend Developer role. Suggest a follow-up system design round to confirm seniority band.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-rose-300">Not Recommended &lt; 50</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-amber-300">Conditional 50-65</span>
                <span className="rounded-full border border-sky-400/40 bg-sky-500/20 px-2 py-0.5 text-sky-100">Recommend 65-85</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-emerald-300">Strong ≥ 85</span>
              </div>
            </div>
          </SectionCard>

          {/* 5. Resume Analysis */}
          <SectionCard n={5} title="Resume Analysis" icon={FileText}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ScoreStat label="ATS Score" value="87" tone="text-emerald-300" />
              <ScoreStat label="Job Fit" value="78%" tone="text-amber-300" />
              <ScoreStat label="Skills Match" value="9 / 14" tone="text-violet-300" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-300">Skills Found</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Python", "FastAPI", "React", "SQL", "PostgreSQL", "REST", "Git", "Microservices", "Redis"].map((s) => (
                    <Badge key={s} className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">{s}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-rose-300">Missing / Recommended</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Docker", "CI/CD", "Testing", "System Design", "Kafka", "Kubernetes"].map((s) => (
                    <Badge key={s} className="border-rose-400/30 bg-rose-500/10 text-rose-200">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 6. Aptitude Analysis */}
          <SectionCard n={6} title="Aptitude Analysis" icon={Brain}>
            <p className="text-sm text-muted-foreground">
              Last aptitude test: <span className="text-foreground">Jan 14, 2025</span> · Score <span className="text-emerald-300">18/25 (72%)</span>.
            </p>
            <div className="mt-4 space-y-2">
              {[
                { c: "Quantitative", v: 80 },
                { c: "Logical", v: 60 },
                { c: "Verbal", v: 100 },
                { c: "Analytical", v: 80 },
                { c: "Data Interpretation", v: 40 },
              ].map((r) => (
                <div key={r.c} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/80">{r.c}</span>
                    <span className={cn("font-mono font-semibold", r.v >= 80 ? "text-emerald-300" : r.v >= 60 ? "text-amber-300" : "text-rose-300")}>{r.v}%</span>
                  </div>
                  <Progress value={r.v} className="bg-white/10" />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <InsightBox tone="emerald" title="Strengths" items={["Strong Verbal (100%)", "Solid Quant (80%) and Analytical (80%)"]} />
              <InsightBox tone="rose" title="Weaknesses" items={["Data Interpretation needs work (40%)", "Logical — practice syllogisms and series"]} />
            </div>
          </SectionCard>

          {/* 7. Coding Analysis */}
          <SectionCard n={7} title="Coding Analysis" icon={Code2}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ScoreStat label="Problems Attempted" value="2" tone="text-violet-300" />
              <ScoreStat label="Pass Rate" value="7/10" tone="text-emerald-300" />
              <ScoreStat label="Code Quality" value="90" tone="text-sky-300" />
              <ScoreStat label="Complexity" value="O(n)" tone="text-amber-300" />
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
              <p className="font-medium">AI Code Review Summary</p>
              <p className="mt-2 text-foreground/80">
                Priya&apos;s solution to &ldquo;Two Sum&rdquo; was optimal — single-pass O(n) with a hash map. Variable naming was clean and the code handled the no-solution edge case. Suggestions: add type hints and raise <code className="font-mono text-violet-200">ValueError</code> instead of returning an empty list. The Two-Pointer refactor is included in the editor.
              </p>
            </div>
          </SectionCard>

          {/* 8. Technical Analysis */}
          <SectionCard n={8} title="Technical Analysis" icon={FlaskConical}>
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Q#</th>
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Topic</th>
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Accuracy</th>
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Depth</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { q: 1, t: "REST vs gRPC", a: 95, d: "Deep" },
                    { q: 2, t: "DB Indexing", a: 88, d: "Deep" },
                    { q: 3, t: "Idempotency", a: 92, d: "Medium" },
                    { q: 4, t: "Connection Pooling", a: 70, d: "Medium" },
                    { q: 5, t: "CAP Theorem", a: 100, d: "Deep" },
                    { q: 6, t: "Redis Use Cases", a: 85, d: "Medium" },
                    { q: 7, t: "Async vs Threading", a: 65, d: "Shallow" },
                    { q: 8, t: "Message Queues", a: 78, d: "Medium" },
                    { q: 9, t: "Observability", a: 88, d: "Deep" },
                    { q: 10, t: "Trade-offs", a: 80, d: "Medium" },
                  ].map((r) => (
                    <tr key={r.q} className="border-b border-white/5 last:border-0">
                      <td className="px-3 py-2 font-mono">Q{r.q}</td>
                      <td className="px-3 py-2">{r.t}</td>
                      <td className="px-3 py-2 font-mono">
                        <span className={cn("font-semibold", r.a >= 85 ? "text-emerald-300" : r.a >= 70 ? "text-amber-300" : "text-rose-300")}>{r.a}%</span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className="border-white/10 bg-white/5 text-white/70">{r.d}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* 9. HR/Behavioral Analysis */}
          <SectionCard n={9} title="HR / Behavioral Analysis" icon={User}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ScoreStat label="STAR Usage" value="70%" tone="text-amber-300" />
              <ScoreStat label="Motivation Clarity" value="82%" tone="text-emerald-300" />
              <ScoreStat label="Culture Fit" value="78%" tone="text-violet-300" />
            </div>
            <p className="mt-4 text-sm text-foreground/80">
              Priya&apos;s behavioral answers were structured but skipped the &lsquo;Result&rsquo; step in 3 of 6 STAR stories. Motivation was clear — she connected her FastAPI experience directly to the role&apos;s API ownership requirement. Culture-fit signals included collaborative language and explicit ownership of failures.
            </p>
          </SectionCard>

          {/* 10. Communication Analysis */}
          <SectionCard n={10} title="Communication Analysis" icon={Mic}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <ScoreStat label="Clarity" value="82" tone="text-emerald-300" />
              <ScoreStat label="Structure" value="70" tone="text-amber-300" />
              <ScoreStat label="Filler Words" value="34" tone="text-rose-300" />
              <ScoreStat label="Pacing (wpm)" value="142" tone="text-sky-300" />
            </div>
            <p className="mt-4 text-sm text-foreground/80">
              Pacing is in the ideal range (140-160 wpm). Filler words (&lsquo;um&apos; 23×, &lsquo;like&apos; 11×) appeared most in Q1 (nerves) and Q8 (system design). Structure score is lower than peers — apply the STAR-L framework and close each answer with a one-line summary.
            </p>
          </SectionCard>

          {/* 11. CV/Emotion Analysis */}
          <SectionCard n={11} title="CV / Emotion Analysis" icon={Eye}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ScoreStat label="Dominant Emotion" value="Neutral" tone="text-sky-300" />
              <ScoreStat label="Avg Eye Contact" value="78%" tone="text-emerald-300" />
              <ScoreStat label="Posture Consistency" value="71%" tone="text-amber-300" />
            </div>
            <p className="mt-4 text-sm text-foreground/80">
              The dominant emotion across the interview was <em>Neutral</em> (avg 52%), with notable <em>Happy</em> peaks at Q4, Q6, and Q10. Sad/Concerned emotion spiked at Q8 (25%) — coincides with the weakest answer (cross-team conflict). Posture warnings: 4 (after Q6). Eye contact breaks: 7 (up-left lookups while thinking).
            </p>
          </SectionCard>

          {/* 12. Emotion Timeline Chart */}
          <SectionCard n={12} title="Emotion Timeline Chart" icon={Heart}>
            <p className="text-sm text-muted-foreground">
              Emotion scores per question over the 28-minute session. X-axis = question number; Y-axis = % of frames tagged with each emotion.
            </p>
            <div className="mt-4 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={EMOTION_TIMELINE} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="q" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Q${v}`} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,12,25,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelFormatter={(v) => `Question ${v}`}
                  />
                  <Line type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="happy" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="surprised" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sad" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
              <LegendDot color="#94a3b8" label="Neutral" />
              <LegendDot color="#10b981" label="Happy" />
              <LegendDot color="#f59e0b" label="Surprised" />
              <LegendDot color="#f43f5e" label="Sad" />
            </div>
          </SectionCard>

          {/* 13. Session Highlights */}
          <SectionCard n={13} title="Session Highlights" icon={Star}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {HIGHLIGHTS.map((h) => (
                <div key={h.q} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <Badge className="border-violet-400/30 bg-violet-500/10 text-violet-200">Q{h.q}</Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">{h.t}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{h.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{h.desc}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 14. Top 7 Strengths */}
          <SectionCard n={14} title="Top 7 Strengths" icon={CheckCircle2}>
            <ul className="space-y-2">
              {STRENGTHS.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span dangerouslySetInnerHTML={{ __html: s }} />
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* 15. Top 7 Improvements */}
          <SectionCard n={15} title="Top 7 Improvements" icon={AlertTriangle}>
            <ul className="space-y-2">
              {IMPROVEMENTS.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span dangerouslySetInnerHTML={{ __html: s }} />
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* 16. 6-Week Learning Roadmap */}
          <SectionCard n={16} title="6-Week Learning Roadmap" icon={Calendar}>
            <Accordion type="single" collapsible defaultValue="week-1">
              {ROADMAP_WEEKS.map((w, i) => (
                <AccordionItem key={w.theme} value={`week-${i + 1}`} className="border-white/10">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-500/15 text-violet-300 text-[11px] ring-1 ring-inset ring-violet-400/30">{i + 1}</span>
                      {w.theme}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    <p className="mt-1"><span className="font-medium text-foreground/80">Daily goal:</span> {w.goal}</p>
                    <p className="mt-2"><span className="font-medium text-foreground/80">Free resources:</span></p>
                    <ul className="mt-1 space-y-1">
                      {w.resources.map((r) => (
                        <li key={r} className="flex items-start gap-2">
                          <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 rounded-md border border-emerald-400/20 bg-emerald-500/[0.04] px-3 py-2 text-xs text-emerald-200">
                      <Milestone className="mr-1 inline h-3.5 w-3.5" /> Milestone: {w.milestone}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SectionCard>

          {/* 17. Final Recommendation */}
          <SectionCard n={17} title="Final Recommendation" icon={Target}>
            <div className="relative overflow-hidden rounded-xl border border-violet-400/30 bg-violet-500/10 p-6">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15" />
              <Quote className="h-6 w-6 text-violet-300/50" />
              <p className="mt-3 text-pretty text-sm text-foreground/85">
                Priya is a <strong>Recommend</strong> for the Backend Developer (Junior-Mid) role. To convert this into an offer, focus on the two highest-impact improvements: <em>reduce filler words</em> and <em>close STAR answers with a Result line</em>. Pair this with the 6-week roadmap — specifically Week 3 (Backend Deep Dive) and Week 5 (STAR Stories) — and you should comfortably clear 85 in your next mock.
              </p>
              <p className="mt-3 text-sm text-foreground/85">
                We suggest re-taking the Technical — Role-Specific interview in <strong>10-14 days</strong> after completing Weeks 1-2 of the roadmap. Until then, prioritize 30 minutes of daily practice. Your trajectory (52 → 78 in 10 weeks) shows strong, consistent improvement.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button onClick={() => set("interview")} className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
                  <Video className="mr-2 h-4 w-4" /> Take Another Interview
                </Button>
                <Button onClick={() => set("dashboard")} variant="outline" className="rounded-full border-white/15 bg-white/5 hover:bg-white/10">
                  <TrendingUp className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </div>
            </div>
          </SectionCard>
        </StaggeredReveal>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/5 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> This report was generated by Gemini 1.5 Flash + Whisper + MediaPipe. © 2025 InterviewAI.
          </div>
          <Button onClick={download} disabled={downloading} className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
            <Download className="mr-2 h-4 w-4" /> {downloading ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </PageWrap>
    </AuroraBackground>
  );
}

/* -------------------------------------------------------------------------- */

function SectionCard({
  n,
  title,
  icon: Icon,
  children,
}: {
  n: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={revealItem}>
      <GlowCard className="p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/30">
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{String(n).padStart(2, "0")}</span>
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </GlowCard>
    </motion.div>
  );
}

function ScoreStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className={cn("text-2xl font-semibold tracking-tight", tone)}>{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function InsightBox({ tone, title, items }: { tone: "emerald" | "rose"; title: string; items: string[] }) {
  const tones: Record<string, string> = {
    emerald: "border-emerald-400/20 bg-emerald-500/[0.04] text-emerald-300",
    rose: "border-rose-400/20 bg-rose-500/[0.04] text-rose-300",
  };
  return (
    <div className={cn("rounded-lg border p-3", tones[tone])}>
      <p className="text-xs font-medium">{title}</p>
      <ul className="mt-2 space-y-1 text-xs text-foreground/80">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-start gap-1.5">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", tone === "emerald" ? "bg-emerald-400" : "bg-rose-400")} />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/* keep imports referenced */
export const __icons = {
  ListChecks, Lightbulb, RefreshCw, Sparkles, TrendingUp, Trophy, Zap, Clock, GraduationCap, Smile,
};
