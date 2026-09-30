"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock,
  Code2,
  Download,
  FileArchive,
  FileText,
  Mail,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type Decision = "Selected" | "Rejected" | "Waitlisted" | "Pending";

type RoundScore = {
  round: "Aptitude" | "Coding" | "Interview";
  score: number;
  weight: number;
  integrity: "clean" | "flags" | "penalty" | "dq";
};

type Row = {
  rank: number;
  name: string;
  id: string;
  email: string;
  source: "Apply Link" | "Bulk Upload";
  overall: number;
  integrity: "clean" | "flags" | "penalty" | "dq";
  decision: Decision;
  rounds: RoundScore[];
  aiNote: string;
  aiVerdict: "strong-hire" | "hire" | "borderline" | "no-hire";
  offerSent?: boolean;
};

const INITIAL: Row[] = [
  {
    rank: 1,
    name: "Priya Sharma",
    id: "BACKEN-3FA82C",
    email: "priya.sharma@example.com",
    source: "Apply Link",
    overall: 88,
    integrity: "clean",
    decision: "Selected",
    rounds: [
      { round: "Aptitude", score: 82, weight: 30, integrity: "clean" },
      { round: "Coding", score: 91, weight: 30, integrity: "clean" },
      { round: "Interview", score: 89, weight: 40, integrity: "clean" },
    ],
    aiNote:
      "Priya demonstrated strong backend fundamentals, clean code structure, and articulate system-design reasoning. Her coding round solved 3/3 problems with optimal complexity. She articulated trade-offs (consistency vs availability) clearly in the interview. Recommended for hire at SDE-1 with backend focus.",
    aiVerdict: "strong-hire",
  },
  {
    rank: 2,
    name: "Sneha Iyer",
    id: "BACKEN-1B77AC",
    email: "sneha.iyer@example.com",
    source: "Apply Link",
    overall: 76,
    integrity: "clean",
    decision: "Selected",
    rounds: [
      { round: "Aptitude", score: 70, weight: 30, integrity: "clean" },
      { round: "Coding", score: 80, weight: 30, integrity: "clean" },
      { round: "Interview", score: 77, weight: 40, integrity: "clean" },
    ],
    aiNote:
      "Sneha is a junior with high potential. Solid fundamentals, slightly slow on the harder coding problem but reached an optimal solution. Interview showed coachability and growth mindset. Recommended for hire at SDE-1 with mentoring support.",
    aiVerdict: "hire",
  },
  {
    rank: 3,
    name: "Arjun Reddy",
    id: "BACKEN-77AB99",
    email: "arjun.reddy@example.com",
    source: "Apply Link",
    overall: 81,
    integrity: "flags",
    decision: "Pending",
    rounds: [
      { round: "Aptitude", score: 78, weight: 30, integrity: "clean" },
      { round: "Coding", score: 84, weight: 30, integrity: "flags" },
      { round: "Interview", score: 80, weight: 40, integrity: "clean" },
    ],
    aiNote:
      "Arjun has strong technical scores but 2 proctoring flags on the coding round (tab switches). Manual review of webcam frames recommended before hire. If the flags are benign, this is a strong-hire candidate for SDE-1.",
    aiVerdict: "borderline",
  },
  {
    rank: 4,
    name: "Kavya Nair",
    id: "BACKEN-88CC02",
    email: "kavya.nair@example.com",
    source: "Bulk Upload",
    overall: 73,
    integrity: "clean",
    decision: "Pending",
    rounds: [
      { round: "Aptitude", score: 75, weight: 30, integrity: "clean" },
      { round: "Coding", score: 70, weight: 30, integrity: "clean" },
      { round: "Interview", score: 74, weight: 40, integrity: "clean" },
    ],
    aiNote:
      "Kavya is a consistent performer with no stand-out strengths or weaknesses. Coding solutions were correct but not optimal. Interview was clear but lacked depth on system design. Recommended for hire at SDE-1, with training on scalability.",
    aiVerdict: "hire",
  },
  {
    rank: 5,
    name: "Meera Krishnan",
    id: "BACKEN-22E0DD",
    email: "meera.krishnan@example.com",
    source: "Apply Link",
    overall: 64,
    integrity: "clean",
    decision: "Waitlisted",
    rounds: [
      { round: "Aptitude", score: 72, weight: 30, integrity: "clean" },
      { round: "Coding", score: 58, weight: 30, integrity: "clean" },
      { round: "Interview", score: 63, weight: 40, integrity: "clean" },
    ],
    aiNote:
      "Meera showed solid aptitude but struggled with the harder coding problem (1/3 solved). Interview communication was good but technical depth was lacking. Re-evaluate for a junior role or training pipeline. Not recommended for SDE-1 in this cycle.",
    aiVerdict: "borderline",
  },
  {
    rank: 6,
    name: "Amit Patel",
    id: "BACKEN-7E12BD",
    email: "amit.patel@example.com",
    source: "Bulk Upload",
    overall: 61,
    integrity: "penalty",
    decision: "Waitlisted",
    rounds: [
      { round: "Aptitude", score: 70, weight: 30, integrity: "clean" },
      { round: "Coding", score: 60, weight: 30, integrity: "penalty" },
      { round: "Interview", score: 55, weight: 40, integrity: "clean" },
    ],
    aiNote:
      "Amit was borderline across rounds and received a 20% proctoring penalty on the coding round for repeated tab switches. With penalty applied, falls below the hire threshold. Reserve for re-evaluation if primary offers fall through.",
    aiVerdict: "no-hire",
  },
  {
    rank: 7,
    name: "Rahul Kumar",
    id: "BACKEN-9C5A11",
    email: "rahul.kumar@example.com",
    source: "Apply Link",
    overall: 52,
    integrity: "clean",
    decision: "Rejected",
    rounds: [
      { round: "Aptitude", score: 58, weight: 30, integrity: "clean" },
      { round: "Coding", score: 45, weight: 30, integrity: "clean" },
      { round: "Interview", score: 53, weight: 40, integrity: "clean" },
    ],
    aiNote:
      "Rahul fell below the qualifying cutoff in the coding round (1/3 solved with suboptimal solutions). Interview lacked backend depth. Not recommended for this role; consider for an entry-level support role.",
    aiVerdict: "no-hire",
  },
  {
    rank: 8,
    name: "John Doe",
    id: "BACKEN-04F2AA",
    email: "john.doe@example.com",
    source: "Bulk Upload",
    overall: 0,
    integrity: "dq",
    decision: "Rejected",
    rounds: [
      { round: "Aptitude", score: 0, weight: 30, integrity: "dq" },
      { round: "Coding", score: 0, weight: 30, integrity: "dq" },
      { round: "Interview", score: 0, weight: 40, integrity: "dq" },
    ],
    aiNote:
      "Disqualified for integrity violations: phone detected in frame + 3 tab switches. No score computed. Flag profile for future campaigns.",
    aiVerdict: "no-hire",
  },
];

const VERDICT_TONE: Record<Row["aiVerdict"], { label: string; tone: string }> = {
  "strong-hire": {
    label: "Strong Hire",
    tone: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  hire: {
    label: "Hire",
    tone: "border-emerald-400/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
  },
  borderline: {
    label: "Borderline",
    tone: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  "no-hire": {
    label: "No Hire",
    tone: "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
};

export function FinalSelection() {
  const { set } = useNav();
  const [rows, setRows] = useState<Row[]>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [aiRefreshId, setAiRefreshId] = useState<string | null>(null);
  const [offerFor, setOfferFor] = useState<Row | null>(null);

  const setDecision = (id: string, decision: Decision) =>
    setRows((arr) => arr.map((r) => (r.id === id ? { ...r, decision } : r)));

  const regenerateAiNote = (id: string) => {
    setAiRefreshId(id);
    setTimeout(() => {
      setRows((arr) =>
        arr.map((r) =>
          r.id === id
            ? {
                ...r,
                aiNote:
                  r.aiNote +
                  " [Re-evaluated: confidence high — verdict unchanged.]",
              }
            : r,
        ),
      );
      setAiRefreshId(null);
    }, 900);
  };

  const markOfferSent = (id: string) =>
    setRows((arr) =>
      arr.map((r) => (r.id === id ? { ...r, offerSent: true } : r)),
    );

  const summary = {
    selected: rows.filter((r) => r.decision === "Selected").length,
    waitlisted: rows.filter((r) => r.decision === "Waitlisted").length,
    rejected: rows.filter((r) => r.decision === "Rejected").length,
    pending: rows.filter((r) => r.decision === "Pending").length,
    offersSent: rows.filter((r) => r.offerSent).length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap className="pt-8">
        <button
          onClick={() => set("admin-dashboard")}
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Campaign · backend-sde-1
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Final selection
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              AI-generated suitability notes per candidate. Lock decisions and
              send job offers to selected candidates.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            {summary.pending} pending · {summary.selected} selected ·{" "}
            {summary.offersSent} offers sent
          </span>
        </div>

        {/* AI explainer banner */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-violet-400/30 bg-violet-500/5 p-4 text-xs text-violet-800 dark:text-violet-100/90">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />
          <div>
            <p className="font-medium">
              AI Suitability Notes — auto-generated per candidate
            </p>
            <p className="mt-1 text-violet-700/80 dark:text-violet-200/70">
              The note in each row is generated by Gemini using the
              candidate&apos;s aptitude, coding, interview, and proctoring
              signals. It surfaces whether they are a strong hire, hire,
              borderline, or no-hire for this role. Admins do not need to write
              notes — only review and confirm the decision.
            </p>
          </div>
        </div>

        {/* Summary chips */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            label="Selected"
            value={summary.selected}
            tone="emerald"
            icon={<UserCheck className="h-4 w-4" />}
          />
          <SummaryCard
            label="Waitlisted"
            value={summary.waitlisted}
            tone="amber"
            icon={<Clock className="h-4 w-4" />}
          />
          <SummaryCard
            label="Rejected"
            value={summary.rejected}
            tone="rose"
            icon={<UserX className="h-4 w-4" />}
          />
          <SummaryCard
            label="Pending"
            value={summary.pending}
            tone="slate"
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-background shadow-sm dark:border-white/10">
          <div className="max-h-[760px] overflow-auto scrollbar-custom">
            <Table>
              <TableHeader>
                <TableRow className="border-black/10 hover:bg-transparent dark:border-white/10">
                  <TableHead className="w-12 pl-5">#</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead className="hidden md:table-cell">Rounds</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>AI Verdict</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead className="pr-5">AI Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <CandidateRow
                    key={r.id}
                    row={r}
                    onDecision={(v) => setDecision(r.id, v)}
                    onRegenerate={() => regenerateAiNote(r.id)}
                    refreshing={aiRefreshId === r.id}
                    onSendOffer={() => setOfferFor(r)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Export actions */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
            Decisions are versioned. Every change is logged with timestamp &amp;
            admin name.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              }}
              className="h-10 rounded-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {saved ? "Saved!" : "Save decisions"}
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button className="h-11 rounded-full bg-violet-500 px-6 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600">
              <FileArchive className="mr-2 h-4 w-4" />
              Export PDF ZIP
            </Button>
          </div>
        </div>

        {/* Footer card */}
        <div className="mt-6 rounded-lg border border-black/10 bg-background p-5 shadow-sm dark:border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {summary.selected} candidate{summary.selected === 1 ? "" : "s"}{" "}
                  selected · {summary.offersSent} offer
                  {summary.offersSent === 1 ? "" : "s"} sent
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF ZIP includes per-candidate 17-section reports + integrity
                  audit trail. Use the &quot;Send Offer&quot; button on each row
                  to email a personalized offer letter.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-xs text-muted-foreground"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Preview PDF report sample
            </Button>
          </div>
        </div>

      </PageWrap>

      {/* Offer composer dialog */}
      <OfferComposerDialog
        row={offerFor}
        onOpenChange={(o) => !o && setOfferFor(null)}
        onSent={(id) => {
          markOfferSent(id);
          setOfferFor(null);
        }}
      />
    </div>
  );
}

/* ---------- per-candidate row ---------- */

function CandidateRow({
  row,
  onDecision,
  onRegenerate,
  refreshing,
  onSendOffer,
}: {
  row: Row;
  onDecision: (v: Decision) => void;
  onRegenerate: () => void;
  refreshing: boolean;
  onSendOffer: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const v = VERDICT_TONE[row.aiVerdict];

  return (
    <TableRow
      className={cn(
        "border-black/5 align-top dark:border-white/5",
        row.decision === "Selected" && "bg-emerald-500/[0.04]",
        row.decision === "Rejected" && "opacity-70",
      )}
    >
      <TableCell className="pl-5 text-xs text-muted-foreground">
        {row.rank}
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-500/10 text-xs font-semibold text-violet-700 dark:text-violet-300">
            {row.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-mono">{row.id}</span>
              {row.offerSent && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                  <Mail className="h-2.5 w-2.5" /> Offer sent
                </span>
              )}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Rounds mini-breakdown */}
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1.5">
          {row.rounds.map((r) => (
            <div
              key={r.round}
              className="flex items-center gap-1.5 rounded-md border border-black/5 bg-muted/30 px-2 py-1 text-[10px] dark:border-white/5"
            >
              {r.round === "Aptitude" ? (
                <Brain className="h-3 w-3 text-violet-500 dark:text-violet-300" />
              ) : r.round === "Coding" ? (
                <Code2 className="h-3 w-3 text-violet-500 dark:text-violet-300" />
              ) : (
                <Sparkles className="h-3 w-3 text-violet-500 dark:text-violet-300" />
              )}
              <span className="text-muted-foreground">{r.round.slice(0, 4)}.</span>
              <span
                className={cn(
                  "font-mono font-semibold tabular-nums",
                  r.score === 0
                    ? "text-rose-600 dark:text-rose-300"
                    : r.score >= 75
                      ? "text-emerald-600 dark:text-emerald-300"
                      : r.score >= 60
                        ? "text-amber-600 dark:text-amber-300"
                        : "text-rose-600 dark:text-rose-300",
                )}
              >
                {r.score === 0 ? "DQ" : `${r.score}%`}
              </span>
            </div>
          ))}
        </div>
      </TableCell>

      <TableCell>
        <span
          className={cn(
            "text-sm font-semibold",
            row.overall === 0
              ? "text-rose-600 dark:text-rose-300"
              : row.overall >= 80
                ? "text-emerald-600 dark:text-emerald-300"
                : row.overall >= 60
                  ? "text-amber-600 dark:text-amber-300"
                  : "text-rose-600 dark:text-rose-300",
          )}
        >
          {row.overall === 0 ? "DQ" : `${row.overall}%`}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex flex-col items-start gap-1">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              v.tone,
            )}
          >
            {row.aiVerdict === "strong-hire" || row.aiVerdict === "hire" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : row.aiVerdict === "borderline" ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <ShieldAlert className="h-3 w-3" />
            )}
            {v.label}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <DecisionSelect value={row.decision} onChange={onDecision} />
      </TableCell>

      <TableCell className="pr-5">
        <div className="min-w-[260px]">
          <div
            className={cn(
              "rounded-lg border bg-muted/20 p-2.5 text-xs text-foreground/80 dark:border-white/5",
              row.aiVerdict === "strong-hire" || row.aiVerdict === "hire"
                ? "border-emerald-400/20 bg-emerald-500/[0.04]"
                : row.aiVerdict === "borderline"
                  ? "border-amber-400/20 bg-amber-500/[0.04]"
                  : "border-rose-400/20 bg-rose-500/[0.04]",
            )}
          >
            <p className={cn("line-clamp-2 text-xs leading-relaxed", !expanded && "line-clamp-2")}>
              {row.aiNote}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setExpanded((x) => !x)}
                className="text-[10px] font-medium text-violet-700 hover:underline dark:text-violet-300"
              >
                {expanded ? "Show less" : "Read full note"}
              </button>
              <button
                onClick={onRegenerate}
                disabled={refreshing}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-violet-700 disabled:opacity-50 dark:hover:text-violet-300"
              >
                <RefreshCw className={cn("h-2.5 w-2.5", refreshing && "animate-spin")} />
                {refreshing ? "Re-evaluating..." : "Regenerate"}
              </button>
            </div>
          </div>

          {row.decision === "Selected" && (
            <Button
              size="sm"
              onClick={onSendOffer}
              disabled={row.offerSent}
              className="mt-2 h-8 w-full rounded-full bg-violet-500 text-[11px] text-white hover:bg-violet-600 disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-600"
            >
              <Mail className="mr-1.5 h-3 w-3" />
              {row.offerSent ? "Offer already sent" : "Send Job Offer"}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ---------- Offer composer dialog ---------- */

function OfferComposerDialog({
  row,
  onOpenChange,
  onSent,
}: {
  row: Row | null;
  onOpenChange: (v: boolean) => void;
  onSent: (id: string) => void;
}) {
  const [stage, setStage] = useState<"compose" | "sending" | "sent">("compose");

  // Offer details (admin-editable). Pre-filled with sensible defaults so the
  // admin can ship in one click, but every field is editable.
  const [role, setRole] = useState("");
  const [team, setTeam] = useState("");
  const [level, setLevel] = useState<"Intern" | "SDE-1" | "SDE-2" | "Senior" | "Lead">("SDE-1");
  const [location, setLocation] = useState<"Remote" | "Hybrid" | "Onsite">("Hybrid");
  const [office, setOffice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [salary, setSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [stock, setStock] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");

  // Reset / pre-fill whenever a new row is opened. Runs when `row` transitions
  // from null to a candidate (i.e. when the dialog opens). Wrapped in
  // useEffect + queueMicrotask so we don't call setState during render or
  // trigger cascading renders.
  useEffect(() => {
    if (!row) return;
    const firstName = row.name.split(" ")[0];
    queueMicrotask(() => {
      setRole("Backend Developer");
      setTeam("Platform Engineering");
      setLevel("SDE-1");
      setLocation("Hybrid");
      setOffice("Bangalore HQ");
      setStartDate("2025-03-03");
      setSalary("\u20B918,00,000");
      setBonus("\u20B91,80,000 (joining bonus)");
      setStock("\u20B94,00,000 (vested over 4 years)");
      setReportTo("Engineering Manager - Platform");
      setSubject(`Job Offer from InterviewAI \u2014 ${firstName}`);
      setMessage(
        `Hi ${firstName},\n\n` +
          `Congratulations! Based on your strong performance across all rounds ` +
          `of our hiring process, we are delighted to extend you an offer for the ` +
          `role of Backend Developer (SDE-1) at InterviewAI.\n\n` +
          `Please find the offer details below. The full offer letter is attached ` +
          `as a PDF. This offer is valid for 7 days from the date of this email.\n\n` +
          `We look forward to welcoming you to the team!\n\n` +
          `Warm regards,\nThe Talent Team\nInterviewAI`,
      );
      setExpiryDays("7");
      setStage("compose");
    });
  }, [row]);

  if (!row) return null;

  const send = () => {
    setStage("sending");
    setTimeout(() => {
      setStage("sent");
      setTimeout(() => {
        onSent(row.id);
        setStage("compose");
      }, 1400);
    }, 900);
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-2xl border-black/10 bg-card dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            Send Job Offer · {row.name}
          </DialogTitle>
          <DialogDescription>
            Fill in the offer details. We&apos;ll generate a personalized offer
            letter PDF and email it to{" "}
            <span className="font-medium text-foreground/80">{row.email}</span>.
          </DialogDescription>
        </DialogHeader>

        {stage === "compose" && (
          <div className="mt-2 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {/* Offer details */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Offer Details
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Role / Title</Label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Team / Department</Label>
                  <Input value={team} onChange={(e) => setTeam(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Level</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="SDE-1">SDE-1</SelectItem>
                      <SelectItem value="SDE-2">SDE-2</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Work mode</Label>
                  <Select value={location} onValueChange={(v) => setLocation(v as typeof location)}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Office Location</Label>
                  <Input value={office} onChange={(e) => setOffice(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Annual CTC (fixed)</Label>
                  <Input value={salary} onChange={(e) => setSalary(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Joining Bonus</Label>
                  <Input value={bonus} onChange={(e) => setBonus(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Stock / ESOPs</Label>
                  <Input value={stock} onChange={(e) => setStock(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Reporting To</Label>
                  <Input value={reportTo} onChange={(e) => setReportTo(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    Offer Validity (days)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="border-t border-black/5 pt-4 dark:border-white/5">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input value={row.email} disabled className="h-9 bg-muted/40 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Message</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Attachment preview */}
            <div className="rounded-lg border border-black/5 bg-muted/30 p-3 text-xs dark:border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                <p className="font-medium">Attachment (auto-generated)</p>
              </div>
              <p className="mt-1 text-muted-foreground">
                Offer_Letter_{row.name.replace(/\s+/g, "_")}.pdf · auto-filled
                with the details above + candidate&apos;s resume &amp; signed
                e-NDA.
              </p>
            </div>
          </div>
        )}

        {stage === "sending" && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400/40 border-t-violet-500" />
            <p className="text-sm font-medium">Generating PDF &amp; sending email...</p>
            <p className="text-xs text-muted-foreground">
              Signing offer letter · queuing email to {row.email}
            </p>
          </div>
        )}

        {stage === "sent" && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Offer sent!</p>
            <p className="text-xs text-muted-foreground">
              The offer email has been queued to {row.email}. The candidate
              will receive it within 1-2 minutes.
            </p>
          </div>
        )}

        <DialogFooter className="mt-4 flex gap-2">
          {stage === "compose" && (
            <>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button onClick={send} className="bg-violet-500 text-white hover:bg-violet-600">
                <Mail className="mr-1.5 h-4 w-4" />
                Send Offer Email
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- sub-components ---------- */

function DecisionSelect({
  value,
  onChange,
}: {
  value: Decision;
  onChange: (v: Decision) => void;
}) {
  const opts: { label: Decision; tone: string; icon: React.ReactNode }[] = [
    {
      label: "Selected",
      tone: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
      icon: <UserCheck className="h-3.5 w-3.5" />,
    },
    {
      label: "Waitlisted",
      tone: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-200",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    {
      label: "Rejected",
      tone: "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-200",
      icon: <UserX className="h-3.5 w-3.5" />,
    },
    {
      label: "Pending",
      tone: "border-black/15 bg-muted/40 text-muted-foreground dark:border-white/15",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
  ];
  const current = opts.find((o) => o.label === value) ?? opts[3];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex h-9 min-w-[140px] items-center justify-between gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
            current.tone,
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            {current.icon}
            {value}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-44 border-black/10 bg-card dark:border-white/10"
      >
        <DropdownMenuLabel>Set decision</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
        {opts.map((o) => (
          <DropdownMenuItem
            key={o.label}
            onClick={() => onChange(o.label)}
            className="gap-2 text-sm focus:bg-muted"
          >
            <span className={cn("rounded p-1", o.tone)}>{o.icon}</span>
            <span className="flex-1">{o.label}</span>
            {value === o.label && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "violet" | "emerald" | "amber" | "rose" | "slate";
  icon: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    violet: "text-violet-600 dark:text-violet-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
    slate: "text-foreground/80",
  };
  return (
    <div className="rounded-lg border border-black/10 bg-background p-4 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-1 text-2xl font-semibold", tones[tone])}>
            {value}
          </p>
        </div>
        <div className={cn("rounded-lg border border-black/10 bg-muted/40 p-2 dark:border-white/10", tones[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
