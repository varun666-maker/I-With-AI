"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crosshair,
  Download,
  FileText,
  GraduationCap,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserCheck,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  PageWrap,
  SectionHeading,
  Shimmer,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "@/hooks/use-toast";

type TabKey = "upload" | "results" | "history";
type ResultsSubTab = "overview" | "sections" | "bullets" | "redflags" | "jddiff" | "softskills";

type SectionAuditItem = {
  name: string;
  status: "pass" | "warning" | "fail";
  score: number;
  findings: string[];
  recommendation: string;
};

type BulletAuditItem = {
  original: string;
  section?: string;
  isQuantified: boolean;
  weakVerbs: string[];
  starCompliant: boolean;
  lengthStatus: "good" | "too_short" | "too_long";
  critique: string;
  suggestedRewrite: string;
  leadershipRewrite?: string;
  technicalRewrite?: string;
};

type RedFlag = {
  type: string;
  severity: "critical" | "warning" | "info";
  detail: string;
  location?: string;
  recruiterInsight: string;
};

type SeniorityEstimation = {
  estimatedYears: number;
  level: string;
  titleInflationDetected: boolean;
  inflationDetails?: string;
  careerProgression: string;
  scopeOfImpact: string;
};

type SoftSkill = {
  skill: string;
  score: number;
  evidence: string;
};

type AtsCompatibility = {
  score: number;
  extractability: "high" | "medium" | "low";
  twoColumnDetected: boolean;
  tablesDetected: boolean;
  headerFooterRisk: boolean;
  verdict: string;
};

type ResumeReport = {
  atsScore: number;
  overallScore: number;
  jobFitScore: number;
  summary: string;
  skillsFound: string[];
  skillsMissing: string[];
  skillsRecommended: string[];
  grammarIssues: Array<{ line?: number; issue: string; fix: string }>;
  formattingIssues: string[];
  improvementPlan: Array<{ priority: "high" | "medium" | "low"; action: string; reason: string }>;
  sectionAudit?: SectionAuditItem[];
  bulletQuality?: {
    quantificationRate?: number;
    quantifiedCount?: number;
    totalBulletsAnalyzed?: number;
    strongVerbsFound?: string[];
    weakVerbsFound?: string[];
    starComplianceScore?: number;
    bullets?: BulletAuditItem[];
  };
  redFlags?: RedFlag[];
  seniorityEstimation?: SeniorityEstimation;
  softSkills?: SoftSkill[];
  atsCompatibility?: AtsCompatibility;
};

type JobDescriptionDiff = {
  tailoringScore: number;
  roleTitleDetected: string;
  companyDetected: string;
  verdict: string;
  matchingKeywords: string[];
  missingKeywords: string[];
  missingRequirements: string[];
  tailoredBulletsSuggestions: Array<{
    original: string;
    tailored: string;
    keywordsCovered: string[];
  }>;
};

type ResumeRecord = {
  id: string;
  fileName: string;
  status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED" | "DELETED";
  createdAt: string;
  retentionUntil: string | null;
  mimeType: string;
  sizeBytes: number;
  analysis: {
    id: string;
    status: string;
    atsScore: number | null;
    overallScore: number | null;
    jobFitScore: number | null;
    completedAt: string | null;
  } | null;
};

type ResumeAnalysisDetail = {
  status: string;
  atsScore: number | null;
  overallScore: number | null;
  jobFitScore: number | null;
  summary: string | null;
  report: ResumeReport | null;
  wordCount: number | null;
  pageCount: number | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(status: ResumeRecord["status"]) {
  switch (status) {
    case "UPLOADED":
      return "Ready to analyze";
    case "PROCESSING":
      return "Analyzing…";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Analysis failed";
    default:
      return status;
  }
}

export function ResumeScreen() {
  const { set } = useNav();
  const [tab, setTab] = useState<TabKey>("upload");
  const [resultsSubTab, setResultsSubTab] = useState<ResultsSubTab>("overview");
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysisDetail | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // JD Diff state
  const [jdText, setJdText] = useState("");
  const [jdLoading, setJdLoading] = useState(false);
  const [jdDiffResult, setJdDiffResult] = useState<JobDescriptionDiff | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/v1/me/resumes");
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load resume history.");
      setResumes(payload.data.resumes as ResumeRecord[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load resume history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const loadAnalysis = async (resumeId: string) => {
    setAnalysisLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/me/resumes/${resumeId}`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load resume analysis.");
      setSelectedAnalysis(payload.data.analysis as ResumeAnalysisDetail);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load resume analysis.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (selectedResumeId && tab === "results") {
      void loadAnalysis(selectedResumeId);
    }
  }, [selectedResumeId, tab]);

  const onAnalyze = async () => {
    if (!file) return;
    setPhase("loading");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/v1/me/resumes", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to upload your resume.");
      const uploadedResume = payload.data.resume as ResumeRecord;
      setResumes((current) => [uploadedResume, ...current]);
      setSelectedAnalysis(null);
      setFile(null);

      const processResponse = await fetch(`/api/v1/me/resumes/${uploadedResume.id}/process`, { method: "POST" });
      const processPayload = await processResponse.json().catch(() => null);
      if (!processResponse.ok) throw new Error(processPayload?.error?.message ?? "Unable to analyze your resume.");
      await loadHistory();

      if (processPayload?.data?.status === "completed" || processPayload?.data?.status === "already_completed") {
        toast({
          title: "Analysis complete",
          description: "Your recruiter-grade ATS report is ready.",
        });
        setSelectedResumeId(uploadedResume.id);
        setTab("results");
        setResultsSubTab("overview");
      } else if (processPayload?.data?.status === "retry_scheduled") {
        setError("Analysis is queued. It will complete shortly; check back in History.");
        setTab("history");
      } else {
        setTab("history");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to upload your resume.");
    } finally {
      setPhase("idle");
    }
  };

  const onProcess = async (resumeId: string, force = false) => {
    setPhase("loading");
    setError(null);
    try {
      const response = await fetch(`/api/v1/me/resumes/${resumeId}/process${force ? "?force=true" : ""}`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to analyze your resume.");
      await loadHistory();
      if (payload?.data?.status === "completed" || payload?.data?.status === "already_completed") {
        toast({
          title: "Analysis updated",
          description: "Recruiter-grade audit complete.",
        });
        setSelectedResumeId(resumeId);
        setSelectedAnalysis(null);
        setTab("results");
        setResultsSubTab("overview");
      } else if (payload?.data?.status === "retry_scheduled") {
        setError("Analysis did not finish within 30 seconds. Please retry shortly.");
      }
    } catch (cause) {
      await loadHistory();
      setError(cause instanceof Error ? cause.message : "Unable to analyze your resume.");
    } finally {
      setPhase("idle");
    }
  };

  const onDelete = async (resumeId: string) => {
    if (!window.confirm("Delete this resume and its stored copy?")) return;
    setError(null);
    try {
      const response = await fetch(`/api/v1/me/resumes/${resumeId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to delete this resume.");
      setResumes((current) => current.filter((resume) => resume.id !== resumeId));
      if (selectedResumeId === resumeId) {
        setSelectedResumeId(null);
        setSelectedAnalysis(null);
        setTab("upload");
      }
      toast({ title: "Resume deleted" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete this resume.");
    }
  };

  const onRunJdDiff = async () => {
    if (!selectedResumeId || !jdText.trim()) return;
    setJdLoading(true);
    try {
      const res = await fetch(`/api/v1/me/resumes/${selectedResumeId}/jd-diff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jdText.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? "Unable to compare with Job Description.");
      setJdDiffResult(data.data.diff as JobDescriptionDiff);
      toast({ title: "Job Description matched", description: "Gap analysis generated." });
    } catch (err) {
      toast({
        title: "JD Match Failed",
        description: err instanceof Error ? err.message : "Could not analyze JD.",
        variant: "destructive",
      });
    } finally {
      setJdLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const downloadFullReport = () => {
    if (!selectedAnalysis || !selectedAnalysis.report) return;
    const r = selectedAnalysis.report;
    const md = `# Recruiter-Grade Resume Audit Report
Generated by InterviewAI on ${new Date().toLocaleDateString()}

## Scores & Compatibility
- ATS Parsing Score: ${selectedAnalysis.atsScore ?? r.atsScore}/100
- Overall Content Score: ${selectedAnalysis.overallScore ?? r.overallScore}/100
- Target Job Fit: ${selectedAnalysis.jobFitScore ?? r.jobFitScore}/100
- Seniority Level: ${r.seniorityEstimation?.level ?? "Not specified"} (${r.seniorityEstimation?.estimatedYears ?? 0} yrs exp)
- ATS Verdict: ${r.atsCompatibility?.verdict ?? "Clean single-column parsing"}

## Executive Recruiter Summary
${selectedAnalysis.summary ?? r.summary}

## Section Completeness Audit
${(r.sectionAudit ?? [])
  .map(
    (s) => `### ${s.name} (${s.score}/100 - ${s.status.toUpperCase()})
Findings: ${s.findings.join(", ")}
Recommendation: ${s.recommendation}`
  )
  .join("\n\n")}

## Red Flag Warnings
${(r.redFlags ?? [])
  .map(
    (f) => `- [${f.severity.toUpperCase()}] ${f.type}: ${f.detail}
  Recruiter Insight: ${f.recruiterInsight}`
  )
  .join("\n")}

## Bullet Point Quality & Rewrites
Quantification Rate: ${r.bulletQuality?.quantificationRate ?? 0}% (${r.bulletQuality?.quantifiedCount ?? 0} of ${r.bulletQuality?.totalBulletsAnalyzed ?? 0} quantified)
STAR Compliance: ${r.bulletQuality?.starComplianceScore ?? 0}/100
Strong Verbs: ${(r.bulletQuality?.strongVerbsFound ?? []).join(", ") || "None"}
Weak Verbs to Eliminate: ${(r.bulletQuality?.weakVerbsFound ?? []).join(", ") || "None"}

${(r.bulletQuality?.bullets ?? [])
  .map(
    (b, i) => `### Bullet #${i + 1}
Original: "${b.original}"
Critique: ${b.critique}
Suggested Metrics Rewrite: "${b.suggestedRewrite}"
${b.leadershipRewrite ? `Leadership Rewrite: "${b.leadershipRewrite}"` : ""}
${b.technicalRewrite ? `Technical Rewrite: "${b.technicalRewrite}"` : ""}`
  )
  .join("\n\n")}

## Skills Breakdown
- Skills Found: ${(r.skillsFound ?? []).join(", ")}
- Missing Critical Skills: ${(r.skillsMissing ?? []).join(", ")}
- Recommended Bonus Skills: ${(r.skillsRecommended ?? []).join(", ")}

## Grammar & Formatting
${(r.grammarIssues ?? []).map((g) => `- ${g.issue} -> Fix: ${g.fix}`).join("\n")}
${(r.formattingIssues ?? []).map((f) => `- ${f}`).join("\n")}
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Resume_Audit_${selectedResumeId ?? "report"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAiFixPrompt = () => {
    if (!selectedAnalysis || !selectedAnalysis.report) return;
    const r = selectedAnalysis.report;
    const prompt = `Act as an executive resume writer and FAANG hiring manager. 
Rewrite my resume based on this strict ATS audit:

SUMMARY ISSUES:
${r.summary}

CRITICAL WEAK BULLETS TO REWRITE WITH NUMBERS (STAR METHOD):
${(r.bulletQuality?.bullets ?? [])
  .map((b) => `- BEFORE: "${b.original}"\n  CRITIQUE: ${b.critique}\n  TARGET REWRITE: "${b.suggestedRewrite}"`)
  .join("\n\n")}

MISSING SKILLS TO WEAVE TRUTHFULLY INTO BULLETS:
${(r.skillsMissing ?? []).join(", ")}

RED FLAGS TO REMOVE:
${(r.redFlags ?? []).map((f) => `- ${f.type}: ${f.detail}`).join("\n")}

Please provide:
1. A rewritten 3-line Professional Summary.
2. Polished work experience bullets with measurable metrics (% / $ / scale).
3. Optimized Skills section categorized by Languages, Frameworks, Cloud, Databases.`;

    copyToClipboard(prompt, "ai-fix-prompt");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap>
        {/* Navigation breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <SectionHeading
            badge="AI Powered · Recruiter-Grade"
            title="Resume ATS & Executive Auditor"
            subtitle="Deep per-section audit, bullet quantification coach, recruiter red-flag detector, and interactive Job Description matching in seconds."
          />

          <div className="flex items-center gap-2">
            <Button
              variant={tab === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("upload")}
              className="rounded-full"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
            </Button>
            <Button
              variant={tab === "results" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (!selectedResumeId && resumes.length > 0) {
                  const completed = resumes.find((r) => r.status === "COMPLETED");
                  if (completed) setSelectedResumeId(completed.id);
                }
                setTab("results");
              }}
              disabled={resumes.filter((r) => r.status === "COMPLETED").length === 0}
              className="rounded-full"
            >
              <Target className="mr-1.5 h-3.5 w-3.5" /> Results
            </Button>
            <Button
              variant={tab === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("history")}
              className="rounded-full"
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" /> History ({resumes.length})
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: UPLOAD */}
        {tab === "upload" && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Dropzone
                file={file}
                onPick={setFile}
                onClear={() => setFile(null)}
                onAnalyze={onAnalyze}
                loading={phase === "loading"}
              />
            </div>
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Recruiter-Grade Engine</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unlike basic word-counters, our engine simulates both modern ATS parsers (Greenhouse, Workday, Lever) and senior technical recruiters:
                </p>
                <ul className="mt-4 space-y-3 text-xs text-foreground/80">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span><strong>Section Completeness Audit:</strong> Contact info, summary, experience, education, skills, and certifications scored independently.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                    <span><strong>Bullet Point Quality:</strong> Metric quantification rate (% with numbers), weak verb alerts, and 3-way instant rewrites.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span><strong>Recruiter Red Flags:</strong> Unexplained gaps, future dates, passive phrasing clusters, and exaggeration checks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <span><strong>Job Description Matcher:</strong> Paste any job posting for immediate side-by-side keyword gaps and tailoring recommendations.</span>
                  </li>
                </ul>
              </div>

              {resumes.length > 0 && (
                <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-xs font-medium text-muted-foreground">Recently uploaded resumes:</p>
                  <div className="mt-2 space-y-2">
                    {resumes.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-lg border border-black/5 bg-card p-2.5 text-xs shadow-xs dark:border-white/5"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate font-medium">{r.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {r.status === "COMPLETED" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedResumeId(r.id);
                                setTab("results");
                              }}
                              className="h-7 rounded-full text-xs"
                            >
                              View Report →
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onProcess(r.id)}
                              className="h-7 rounded-full text-xs"
                            >
                              Analyze Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RESULTS */}
        {tab === "results" && (
          <div className="mt-6 space-y-6">
            {analysisLoading || !selectedAnalysis ? (
              <div className="rounded-xl border border-black/10 bg-card p-12 text-center shadow-sm dark:border-white/10">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-500" />
                <p className="mt-4 text-base font-medium">Extracting deep recruiter insights…</p>
                <p className="mt-1 text-xs text-muted-foreground">Evaluating structure, bullets, metrics, and red flags.</p>
              </div>
            ) : selectedAnalysis.status !== "COMPLETED" || !selectedAnalysis.report ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-8 text-center">
                <Clock className="mx-auto h-8 w-8 text-amber-500" />
                <p className="mt-3 text-base font-medium">Analysis is being processed</p>
                <p className="mt-1 text-xs text-muted-foreground">The AI engine is working on this resume. Click below to refresh or rerun.</p>
                {selectedResumeId && (
                  <Button
                    size="sm"
                    onClick={() => onProcess(selectedResumeId, true)}
                    className="mt-4 rounded-full bg-violet-600 text-white"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-Analyze Now
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Header Selector & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-black/10 bg-card p-4 shadow-sm dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold">
                          {resumes.find((r) => r.id === selectedResumeId)?.fileName ?? "Resume Audit Report"}
                        </h2>
                        {selectedAnalysis.report.seniorityEstimation?.level && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            {selectedAnalysis.report.seniorityEstimation.level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedAnalysis.wordCount ?? 0} words · {selectedAnalysis.pageCount ?? 1} page(s) · Analyzed by {selectedAnalysis.report.seniorityEstimation?.level ?? "AI"} Recruiter
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyAiFixPrompt}
                      className="rounded-full text-xs"
                    >
                      {copiedIndex === "ai-fix-prompt" ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Copied Prompt!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy AI Prompt to Fix
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadFullReport}
                      className="rounded-full text-xs"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download Report
                    </Button>
                    {selectedResumeId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onProcess(selectedResumeId, true)}
                        title="Re-run analysis with latest model"
                        className="h-8 w-8 rounded-full p-0"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-2 dark:border-white/10">
                  <button
                    onClick={() => setResultsSubTab("overview")}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                      resultsSubTab === "overview"
                        ? "bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    1. Overview &amp; Scores
                  </button>
                  <button
                    onClick={() => setResultsSubTab("sections")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                      resultsSubTab === "sections"
                        ? "bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span>2. Section Audit</span>
                    <Badge variant="outline" className="h-4 px-1 text-[9px]">
                      {selectedAnalysis.report.sectionAudit?.length ?? 0}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setResultsSubTab("bullets")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                      resultsSubTab === "bullets"
                        ? "bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span>3. Bullet Quality &amp; Rewrites</span>
                    <Badge className="h-4 bg-emerald-500/20 px-1 text-[9px] text-emerald-700 dark:text-emerald-300">
                      {selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0}% metrics
                    </Badge>
                  </button>
                  <button
                    onClick={() => setResultsSubTab("redflags")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                      resultsSubTab === "redflags"
                        ? "bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span>4. Recruiter Red Flags</span>
                    {(selectedAnalysis.report.redFlags?.length ?? 0) > 0 && (
                      <Badge className="h-4 bg-rose-500/20 px-1 text-[9px] text-rose-700 dark:text-rose-300">
                        {selectedAnalysis.report.redFlags?.length}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={() => setResultsSubTab("jddiff")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                      resultsSubTab === "jddiff"
                        ? "bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <Crosshair className="h-3 w-3 text-violet-500" />
                    <span>5. Job Description Matcher</span>
                  </button>
                  <button
                    onClick={() => setResultsSubTab("softskills")}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                      resultsSubTab === "softskills"
                        ? "bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    6. Soft Skills &amp; ATS Safety
                  </button>
                </div>

                {/* SUBTAB CONTENT 1: OVERVIEW */}
                {resultsSubTab === "overview" && (
                  <div className="space-y-6">
                    <StaggeredReveal className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <motion.div variants={revealItem}>
                        <ScoreCard
                          label="ATS Score"
                          value={selectedAnalysis.atsScore ?? selectedAnalysis.report.atsScore}
                          max={100}
                          tone="emerald"
                          hint="Parsing safety, clean hierarchy & keywords"
                        />
                      </motion.div>
                      <motion.div variants={revealItem}>
                        <ScoreCard
                          label="Content Strength"
                          value={selectedAnalysis.overallScore ?? selectedAnalysis.report.overallScore}
                          max={100}
                          tone="violet"
                          hint="Action verbs, measurable impact & clarity"
                        />
                      </motion.div>
                      <motion.div variants={revealItem}>
                        <ScoreCard
                          label="Quantification Rate"
                          value={selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0}
                          max={100}
                          displayValue={`${selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0}%`}
                          subBadge={`${selectedAnalysis.report.bulletQuality?.quantifiedCount ?? 0}/${selectedAnalysis.report.bulletQuality?.totalBulletsAnalyzed ?? 0} bullets`}
                          tone={(selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0) >= 60 ? "emerald" : "amber"}
                          hint={
                            (selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0) === 0
                              ? "0 bullets contain metrics (% / $ / time / scale). Click to view 1-click rewrites."
                              : "Bullets with measurable results or scale. Click to inspect."
                          }
                          onClick={() => setResultsSubTab("bullets")}
                        />
                      </motion.div>
                      <motion.div variants={revealItem}>
                        <ScoreCard
                          label="Target Role Fit"
                          value={selectedAnalysis.jobFitScore ?? selectedAnalysis.report.jobFitScore}
                          max={100}
                          tone="emerald"
                          hint="Alignment with your targeted engineering role"
                        />
                      </motion.div>
                    </StaggeredReveal>

                    {/* Executive Summary & Seniority */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm lg:col-span-8 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-violet-500" />
                          <h3 className="text-sm font-semibold">Executive Recruiter Evaluation</h3>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {selectedAnalysis.summary ?? selectedAnalysis.report.summary}
                        </p>

                        <div className="mt-6 border-t border-black/10 pt-4 dark:border-white/10">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Immediate Action Plan
                          </h4>
                          <div className="mt-3 space-y-2">
                            {(selectedAnalysis.report.improvementPlan ?? []).slice(0, 3).map((item, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 rounded-lg border border-black/5 bg-black/[0.02] p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]"
                              >
                                <Badge
                                  className={cn(
                                    "shrink-0 uppercase text-[9px]",
                                    item.priority === "high"
                                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                  )}
                                >
                                  {item.priority}
                                </Badge>
                                <div>
                                  <p className="font-medium text-foreground">{item.action}</p>
                                  <p className="mt-0.5 text-muted-foreground">{item.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Seniority & Career Signals */}
                      <div className="space-y-4 lg:col-span-4">
                        <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                            <TrendingUp className="h-4 w-4" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider">Seniority &amp; Scope</h3>
                          </div>
                          <div className="mt-3">
                            <span className="text-2xl font-bold">
                              {selectedAnalysis.report.seniorityEstimation?.level ?? "Junior / Entry"}
                            </span>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Estimated experience: ~{selectedAnalysis.report.seniorityEstimation?.estimatedYears ?? 1} year(s)
                            </p>
                          </div>
                          <div className="mt-4 space-y-2 text-xs text-foreground/80">
                            <div className="rounded-md bg-black/[0.02] p-2 dark:bg-white/[0.02]">
                              <span className="font-medium">Progression:</span>{" "}
                              <span className="text-muted-foreground">
                                {selectedAnalysis.report.seniorityEstimation?.careerProgression ?? "Early career foundation"}
                              </span>
                            </div>
                            <div className="rounded-md bg-black/[0.02] p-2 dark:bg-white/[0.02]">
                              <span className="font-medium">Impact Scope:</span>{" "}
                              <span className="text-muted-foreground">
                                {selectedAnalysis.report.seniorityEstimation?.scopeOfImpact ?? "Feature & project execution"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ATS Parsing Safety Card */}
                        <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-emerald-500" />
                              <h3 className="text-xs font-semibold uppercase tracking-wider">ATS Parser Safety</h3>
                            </div>
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              {selectedAnalysis.report.atsCompatibility?.score ?? 90}% Safe
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {selectedAnalysis.report.atsCompatibility?.verdict ?? "Clean document structure parses safely across Workday and Greenhouse."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                            <span className="rounded bg-black/[0.03] px-2 py-0.5 dark:bg-white/5">
                              Extractability: {selectedAnalysis.report.atsCompatibility?.extractability ?? "High"}
                            </span>
                            <span className="rounded bg-black/[0.03] px-2 py-0.5 dark:bg-white/5">
                              Two-Column Risk: {selectedAnalysis.report.atsCompatibility?.twoColumnDetected ? "Detected ⚠️" : "None ✓"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Summary Grid */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Skills Found in Resume</p>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            {selectedAnalysis.report.skillsFound?.length ?? 0}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(selectedAnalysis.report.skillsFound ?? []).map((s) => (
                            <Badge
                              key={s}
                              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            >
                              ✓ {s}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Missing High-Priority Skills</p>
                          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300">
                            {selectedAnalysis.report.skillsMissing?.length ?? 0}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(selectedAnalysis.report.skillsMissing ?? []).map((s) => (
                            <Badge
                              key={s}
                              className="border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            >
                              + {s}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-3 text-[11px] text-muted-foreground">
                          Add these skills to your bullets or skills list to improve your keyword match rate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB CONTENT 2: SECTION AUDIT */}
                {resultsSubTab === "sections" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                      <h3 className="text-sm font-semibold">Section Completeness Checklist &amp; Scorecard</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Every section is audited for completeness, clarity, formatting, and ATS-parsing readiness.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {(selectedAnalysis.report.sectionAudit ?? []).map((section, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-black/10 bg-card p-5 shadow-sm transition-all hover:border-violet-500/30 dark:border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {section.status === "pass" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : section.status === "warning" ? (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-rose-500" />
                              )}
                              <h4 className="text-sm font-semibold">{section.name}</h4>
                            </div>
                            <span className="font-mono text-xs font-semibold">
                              {section.score}/100
                            </span>
                          </div>

                          <Progress value={section.score} className="mt-2.5 h-1.5 bg-black/10 dark:bg-white/10" />

                          <div className="mt-3">
                            <p className="text-[11px] font-medium text-muted-foreground">Findings:</p>
                            <ul className="mt-1 space-y-1 text-xs text-foreground/80">
                              {section.findings.map((finding, fi) => (
                                <li key={fi} className="flex items-start gap-1.5">
                                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {section.recommendation && (
                            <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-2.5 text-xs text-violet-900 dark:text-violet-200">
                              <span className="font-semibold">Recruiter Tip:</span> {section.recommendation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB CONTENT 3: BULLET POINT QUALITY & REWRITES */}
                {resultsSubTab === "bullets" && (
                  <div className="space-y-6">
                    {/* Educational Banner for Quantification Rate */}
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs dark:border-amber-400/20 dark:bg-amber-400/5">
                      <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Understanding Your Quantification Rate: {selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0}%</span>
                      </div>
                      <p className="mt-1 text-muted-foreground leading-relaxed">
                        Quantification Rate measures how many of your experience and project bullets include measurable proof (e.g. percentages, request scale, latency drop, dollar amounts, team size).
                        {(selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0) === 0 ? (
                          <> <strong>Your resume currently scores 0% because bullets describe tasks without numbers or metrics</strong> (e.g., <em>&ldquo;Completed MERN Stack training&rdquo;</em>, <em>&ldquo;Designed full-stack hiring simulation&rdquo;</em>). Recruiters look for &gt;60% quantified bullets. Use the 1-click rewrites below to immediately add high-impact numbers!</>
                        ) : (
                          <> You have {selectedAnalysis.report.bulletQuality?.quantifiedCount ?? 0} quantified bullets. Aim for &gt;60% to maximize recruiter callback rates.</>
                        )}
                      </p>
                    </div>

                    {/* Bullet Metric Banner */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Quantification Rate</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                            {selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({selectedAnalysis.report.bulletQuality?.quantifiedCount ?? 0} of {selectedAnalysis.report.bulletQuality?.totalBulletsAnalyzed ?? 0} bullets)
                          </span>
                        </div>
                        <Progress
                          value={selectedAnalysis.report.bulletQuality?.quantificationRate ?? 0}
                          className="mt-3 h-2 bg-black/10 dark:bg-white/10"
                        />
                        <p className="mt-2 text-[11px] text-muted-foreground">Target: 60%+ of bullets should contain numbers, percentages, or scale.</p>
                      </div>

                      <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">STAR Method Score</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {selectedAnalysis.report.bulletQuality?.starComplianceScore ?? 0}/100
                          </span>
                        </div>
                        <p className="mt-3 text-[11px] text-muted-foreground">
                          Measures whether bullets explain the <strong>Action</strong> taken and the resulting <strong>Business Outcome</strong>.
                        </p>
                      </div>

                      <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Action Verbs Audit</p>
                        <div className="mt-2 space-y-1.5 text-xs">
                          <div>
                            <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-semibold">Strong Action Verbs:</span>
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {(selectedAnalysis.report.bulletQuality?.strongVerbsFound ?? []).map((v) => (
                                <Badge key={v} className="bg-emerald-500/10 text-emerald-700 text-[10px] dark:text-emerald-300">
                                  {v}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {(selectedAnalysis.report.bulletQuality?.weakVerbsFound ?? []).length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] uppercase text-rose-600 dark:text-rose-400 font-semibold">Weak Verbs to Replace:</span>
                              <div className="mt-0.5 flex flex-wrap gap-1">
                                {(selectedAnalysis.report.bulletQuality?.weakVerbsFound ?? []).map((v) => (
                                  <Badge key={v} className="bg-rose-500/10 text-rose-700 text-[10px] dark:text-rose-300">
                                    {v}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Bullet Rewrites List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">Interactive Bullet Rewrite Suggestions</h3>
                          <p className="text-xs text-muted-foreground">
                            Weak and passive bullets detected in your resume, with 3 recruiter-crafted alternatives ready to copy.
                          </p>
                        </div>
                      </div>

                      {(selectedAnalysis.report.bulletQuality?.bullets ?? []).map((bullet, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-black/10 bg-card p-5 shadow-sm space-y-4 dark:border-white/10"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-3 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">
                                {bullet.section ?? "Bullet"} #{idx + 1}
                              </Badge>
                              {!bullet.isQuantified && (
                                <Badge className="bg-amber-500/15 text-amber-700 text-[10px] dark:text-amber-300">
                                  Missing Numbers
                                </Badge>
                              )}
                              {bullet.weakVerbs.length > 0 && (
                                <Badge className="bg-rose-500/15 text-rose-700 text-[10px] dark:text-rose-300">
                                  Weak Opener: {bullet.weakVerbs.join(", ")}
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground italic">
                              {bullet.critique}
                            </span>
                          </div>

                          <div className="rounded-lg bg-black/[0.02] p-3 text-xs dark:bg-white/[0.02]">
                            <span className="font-semibold text-muted-foreground">Original:</span>{" "}
                            <span className="text-foreground/90 font-mono text-[11px]">"{bullet.original}"</span>
                          </div>

                          {/* 3 Rewrite Options */}
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {/* Option 1: Standard Metrics */}
                            <div className="flex flex-col justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3.5 text-xs">
                              <div>
                                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                                  <span className="font-semibold flex items-center gap-1">
                                    <Zap className="h-3.5 w-3.5" /> High-Impact Metrics
                                  </span>
                                  <Badge className="bg-emerald-500/20 text-[9px] text-emerald-800 dark:text-emerald-200">Recommended</Badge>
                                </div>
                                <p className="mt-2 text-foreground/90 leading-relaxed font-sans">
                                  "{bullet.suggestedRewrite}"
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(bullet.suggestedRewrite, `b-sugg-${idx}`)}
                                className="mt-3 w-full rounded-md border-emerald-500/30 text-xs hover:bg-emerald-500/10"
                              >
                                {copiedIndex === `b-sugg-${idx}` ? (
                                  <>
                                    <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Rewrite
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Option 2: Leadership */}
                            {bullet.leadershipRewrite && (
                              <div className="flex flex-col justify-between rounded-lg border border-violet-500/25 bg-violet-500/5 p-3.5 text-xs">
                                <div>
                                  <span className="font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1">
                                    <Briefcase className="h-3.5 w-3.5" /> Leadership &amp; Ownership
                                  </span>
                                  <p className="mt-2 text-foreground/90 leading-relaxed font-sans">
                                    "{bullet.leadershipRewrite}"
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(bullet.leadershipRewrite!, `b-lead-${idx}`)}
                                  className="mt-3 w-full rounded-md border-violet-500/30 text-xs hover:bg-violet-500/10"
                                >
                                  {copiedIndex === `b-lead-${idx}` ? (
                                    <>
                                      <Check className="mr-1.5 h-3.5 w-3.5 text-violet-600" /> Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Rewrite
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}

                            {/* Option 3: Technical */}
                            {bullet.technicalRewrite && (
                              <div className="flex flex-col justify-between rounded-lg border border-sky-500/25 bg-sky-500/5 p-3.5 text-xs">
                                <div>
                                  <span className="font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1">
                                    <Sparkles className="h-3.5 w-3.5" /> Technical Depth
                                  </span>
                                  <p className="mt-2 text-foreground/90 leading-relaxed font-sans">
                                    "{bullet.technicalRewrite}"
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(bullet.technicalRewrite!, `b-tech-${idx}`)}
                                  className="mt-3 w-full rounded-md border-sky-500/30 text-xs hover:bg-sky-500/10"
                                >
                                  {copiedIndex === `b-tech-${idx}` ? (
                                    <>
                                      <Check className="mr-1.5 h-3.5 w-3.5 text-sky-600" /> Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Rewrite
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB CONTENT 4: RED FLAGS */}
                {resultsSubTab === "redflags" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-rose-500" />
                        <h3 className="text-sm font-semibold">Recruiter Red-Flag Detection</h3>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Senior recruiters discard resumes in under 10 seconds when these flags trigger. Address them to maximize interview callback rates.
                      </p>
                    </div>

                    {(selectedAnalysis.report.redFlags ?? []).length === 0 ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                        <h4 className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                          Zero Critical Red Flags Detected!
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          No severe date inconsistencies, unexplained gaps, or suspicious claims found.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {(selectedAnalysis.report.redFlags ?? []).map((flag, fi) => (
                          <div
                            key={fi}
                            className="rounded-xl border border-black/10 bg-card p-5 shadow-sm space-y-3 dark:border-white/10"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "uppercase text-[10px]",
                                    flag.severity === "critical"
                                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                                      : flag.severity === "warning"
                                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                      : "bg-sky-500/20 text-sky-700 dark:text-sky-300"
                                  )}
                                >
                                  {flag.severity}
                                </Badge>
                                <span className="font-semibold text-sm">{flag.type}</span>
                              </div>
                              {flag.location && (
                                <span className="text-xs text-muted-foreground font-mono">
                                  Location: {flag.location}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-foreground/90">{flag.detail}</p>

                            <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]">
                              <p className="font-semibold text-violet-600 dark:text-violet-400">
                                💡 Recruiter Perspective &amp; Fix:
                              </p>
                              <p className="mt-1 text-muted-foreground leading-relaxed">
                                {flag.recruiterInsight}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB CONTENT 5: JOB DESCRIPTION DIFF */}
                {resultsSubTab === "jddiff" && (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Crosshair className="h-5 w-5 text-violet-500" />
                        <h3 className="text-sm font-semibold">Side-by-Side Job Description Gap Matcher</h3>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Paste the full Job Description of the role you want to apply for. Our AI will analyze your resume against its exact requirements, find missing keywords, and suggest tailored bullets.
                      </p>

                      <div className="mt-4 space-y-3">
                        <textarea
                          rows={5}
                          value={jdText}
                          onChange={(e) => setJdText(e.target.value)}
                          placeholder="Paste Job Description here (e.g. Senior Full Stack Engineer at Stripe... Requirements: React, TypeScript, Node.js, Kubernetes...)"
                          className="w-full rounded-lg border border-black/15 bg-background p-3 text-xs leading-relaxed focus:border-violet-500 focus:outline-none dark:border-white/15"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={onRunJdDiff}
                            disabled={jdLoading || jdText.trim().length < 20}
                            className="rounded-full bg-violet-600 text-white hover:bg-violet-700"
                          >
                            {jdLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Matching JD…
                              </>
                            ) : (
                              <>
                                <Crosshair className="mr-2 h-4 w-4" /> Compare with Resume
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* JD Diff Results Display */}
                    {jdDiffResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Match Gauge */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm md:col-span-1 dark:border-white/10">
                            <p className="text-xs uppercase text-muted-foreground font-semibold">Tailoring Match Score</p>
                            <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                                {jdDiffResult.tailoringScore}%
                              </span>
                              <span className="text-xs text-muted-foreground">match to JD</span>
                            </div>
                            <Progress value={jdDiffResult.tailoringScore} className="mt-3 h-2" />
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              {jdDiffResult.roleTitleDetected} · {jdDiffResult.companyDetected}
                            </p>
                          </div>

                          <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm md:col-span-2 dark:border-white/10">
                            <p className="text-xs uppercase text-muted-foreground font-semibold">Recruiter Verdict</p>
                            <p className="mt-2 text-xs leading-relaxed text-foreground/90">
                              {jdDiffResult.verdict}
                            </p>
                            {jdDiffResult.missingRequirements?.length > 0 && (
                              <div className="mt-3 border-t border-black/5 pt-2 dark:border-white/5">
                                <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400">
                                  Unmet Role Requirements:
                                </span>
                                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                                  {jdDiffResult.missingRequirements.map((r, ri) => (
                                    <li key={ri} className="flex items-start gap-1.5">
                                      <X className="mt-0.5 h-3 w-3 shrink-0 text-rose-500" /> {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Keyword Overlap Badges */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                ✓ Matching Keywords in Resume ({jdDiffResult.matchingKeywords?.length ?? 0})
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {jdDiffResult.matchingKeywords.map((k) => (
                                <Badge key={k} className="bg-emerald-500/15 text-emerald-800 text-xs dark:text-emerald-200">
                                  {k}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                                ✗ Missing Keywords from JD ({jdDiffResult.missingKeywords?.length ?? 0})
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {jdDiffResult.missingKeywords.map((k) => (
                                <Badge key={k} className="bg-rose-500/15 text-rose-800 text-xs dark:text-rose-200">
                                  + {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Suggested Tailored Bullets */}
                        {jdDiffResult.tailoredBulletsSuggestions?.length > 0 && (
                          <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm space-y-4 dark:border-white/10">
                            <h4 className="text-sm font-semibold">Suggested Bullet Additions to Close Keyword Gaps</h4>
                            <div className="space-y-3">
                              {jdDiffResult.tailoredBulletsSuggestions.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 text-xs space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                      Weaves in: {item.keywordsCovered.join(", ")}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(item.tailored, `jd-b-${idx}`)}
                                      className="h-6 rounded-md px-2 text-[10px]"
                                    >
                                      {copiedIndex === `jd-b-${idx}` ? "Copied!" : "Copy Bullet"}
                                    </Button>
                                  </div>
                                  <p className="text-foreground leading-relaxed font-sans font-medium">
                                    "{item.tailored}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* SUBTAB CONTENT 6: SOFT SKILLS & ATS SAFETY */}
                {resultsSubTab === "softskills" && (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
                      <h3 className="text-sm font-semibold">Inferred Soft Skills &amp; Behavioral Evidence</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Derived directly from how actions, outcomes, and stakeholder collaborations are phrased in your bullets.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {(selectedAnalysis.report.softSkills ?? []).map((soft, si) => (
                        <div
                          key={si}
                          className="rounded-xl border border-black/10 bg-card p-5 shadow-sm space-y-2 dark:border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">{soft.skill}</h4>
                            <span className="font-mono text-xs font-semibold text-violet-600 dark:text-violet-400">
                              {soft.score}/100
                            </span>
                          </div>
                          <Progress value={soft.score} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium text-foreground">Cited Evidence:</span> {soft.evidence}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Grammar & Typo Audit */}
                    <div className="rounded-xl border border-black/10 bg-card p-5 shadow-sm space-y-3 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Grammar &amp; Formatting Polish</h4>
                        <Badge variant="outline" className="text-xs">
                          {selectedAnalysis.report.grammarIssues?.length ?? 0} items
                        </Badge>
                      </div>

                      {(selectedAnalysis.report.grammarIssues ?? []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No grammar or typo errors detected.</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedAnalysis.report.grammarIssues ?? []).map((g, gi) => (
                            <div
                              key={gi}
                              className="flex items-start justify-between gap-4 rounded-lg border border-black/5 bg-black/[0.02] p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]"
                            >
                              <div>
                                <span className="font-medium text-rose-600 dark:text-rose-400">Issue:</span>{" "}
                                <span className="text-foreground">{g.issue}</span>
                                <div className="mt-1 text-emerald-700 dark:text-emerald-300">
                                  <span className="font-medium">Correction:</span> {g.fix}
                                </div>
                              </div>
                              {g.line && (
                                <span className="font-mono text-[10px] text-muted-foreground">Line {g.line}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {tab === "history" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Resume Upload History</h3>
                  <p className="text-xs text-muted-foreground">
                    All uploaded versions and analyses are securely saved. Re-open any report or run a fresh scan.
                  </p>
                </div>
                <BookOpen className="h-4 w-4 text-violet-500" />
              </div>

              <ResumeHistory
                resumes={resumes}
                loading={historyLoading}
                onDelete={onDelete}
                onProcess={(id) => onProcess(id, true)}
                onView={(resumeId) => {
                  setSelectedResumeId(resumeId);
                  setSelectedAnalysis(null);
                  setTab("results");
                  setResultsSubTab("overview");
                }}
              />
            </div>
          </div>
        )}

        {/* Footer CTAs */}
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-black/10 bg-card p-5 shadow-sm sm:flex-row sm:items-center dark:border-white/10">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-violet-500" />
              <div>
                <p className="text-sm font-medium">Ready to test these skills live?</p>
                <p className="text-xs text-muted-foreground">Start an AI mock interview tailored to your resume&apos;s tech stack.</p>
              </div>
            </div>
            <Button
              onClick={() => set("interview")}
              className="rounded-full bg-violet-600 text-white hover:bg-violet-700"
            >
              Start Interview <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-black/10 bg-card p-5 shadow-sm sm:flex-row sm:items-center dark:border-white/10">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Strengthen your problem-solving foundation</p>
                <p className="text-xs text-muted-foreground">&ldquo;Speed and accuracy in aptitude differentiate top candidates before technical rounds.&rdquo;</p>
              </div>
            </div>
            <Button
              onClick={() => set("aptitude")}
              variant="outline"
              className="rounded-full border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              Aptitude Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
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
  file: File | null;
  onPick: (file: File) => void;
  onClear: () => void;
  onAnalyze: () => void;
  loading: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onPick(selected);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) onPick(dropped);
        }}
        className={cn(
          "group grid min-h-[300px] w-full place-items-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
          dragging
            ? "border-violet-500 bg-violet-500/10"
            : "border-black/15 bg-black/[0.02] hover:border-violet-500/50 hover:bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.02] dark:hover:bg-white/[0.03]"
        )}
      >
        <div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-black/10 dark:text-violet-400 dark:ring-white/10"
          >
            <Upload className="h-7 w-7" />
          </motion.div>
          <p className="mt-4 text-base font-semibold">
            {dragging ? "Drop your resume to upload" : "Drag & drop your resume"}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            or{" "}
            <span className="text-violet-600 underline-offset-2 group-hover:underline dark:text-violet-400 font-medium">
              browse files
            </span>{" "}
            · PDF or DOCX · up to 5 MB
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5">✓ ATS Parsing Safe</span>
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5">✓ STAR Metric Coach</span>
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 dark:bg-white/5">✓ Red Flag Audit</span>
          </div>
        </div>
      </button>

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-black/10 bg-card p-4 shadow-sm dark:border-white/10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{file.name}</p>
              <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)} · Ready to analyze</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-rose-500"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
            <Button
              type="button"
              onClick={onAnalyze}
              disabled={loading}
              className="rounded-full bg-violet-600 text-white hover:bg-violet-700 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Resume…
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> Upload &amp; Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumeHistory({
  resumes,
  loading,
  onDelete,
  onView,
  onProcess,
}: {
  resumes: ResumeRecord[];
  loading: boolean;
  onDelete: (resumeId: string) => void;
  onView: (resumeId: string) => void;
  onProcess: (resumeId: string) => void;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">Loading resume history…</p>
      ) : resumes.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No resumes uploaded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-black/10 hover:bg-transparent dark:border-white/10">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">File</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Size</TableHead>
                <TableHead className="text-right text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumes.map((resume) => (
                <TableRow
                  key={resume.id}
                  className="border-black/10 hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="text-xs">{new Date(resume.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[220px] truncate font-mono text-xs text-foreground font-medium">
                    {resume.fileName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        resume.status === "COMPLETED"
                          ? "border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300"
                          : "text-muted-foreground"
                      )}
                    >
                      {resume.analysis?.status === "COMPLETED"
                        ? `ATS ${resume.analysis.atsScore ?? "—"}`
                        : statusLabel(resume.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatBytes(resume.sizeBytes)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(resume.id)}
                      disabled={resume.status !== "COMPLETED"}
                      className="h-7 text-xs text-violet-600 hover:text-violet-700 disabled:opacity-30 dark:text-violet-400"
                    >
                      View Report
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onProcess(resume.id)}
                      className="h-7 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400"
                    >
                      {resume.status === "COMPLETED" ? "Re-Audit" : "Analyze"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(resume.id)}
                      className="h-7 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
  displayValue,
  subBadge,
  onClick,
}: {
  label: string;
  value: number;
  max: number;
  tone: "emerald" | "violet" | "amber" | "rose";
  hint: string;
  displayValue?: string;
  subBadge?: string;
  onClick?: () => void;
}) {
  const toneRing: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  };
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-black/10 bg-card p-5 shadow-sm transition-all dark:border-white/10",
        onClick && "cursor-pointer hover:border-violet-500/40 hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        {subBadge && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
            {subBadge}
          </Badge>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn("text-3xl font-bold tracking-tight", toneRing[tone])}>
          {displayValue ?? value}
        </span>
        {!displayValue && <span className="text-xs text-muted-foreground">/{max}</span>}
      </div>
      <Progress value={pct} className="mt-3 h-1.5 bg-black/10 dark:bg-white/10" />
      <p className="mt-2 text-[11px] text-muted-foreground leading-snug">{hint}</p>
    </div>
  );
}

export { ResumeScreen as ResumeHub };
export default ResumeScreen;
