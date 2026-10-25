"use client";

import { useState } from "react";
import {
  Ban,
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileArchive,
  Filter,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Rocket,
  Send,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Users,
  X as XIcon,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

type Source = "apply-link" | "bulk-upload";
type Status = "In Progress" | "Completed" | "Locked" | "Invited";

type Candidate = {
  rank: number;
  name: string;
  source: Source;
  jobFit: number;
  ats: number;
  email?: string;
  emailMissing?: boolean;
  aptitude: number | null;
  qualification: "pass" | "fail" | null;
  coding: number | null;
  interview: number | "live" | null;
  overall: number | null;
  integrity: "clean" | "flags" | "penalty";
  status: Status;
};

const CANDIDATES: Candidate[] = [
  {
    rank: 1,
    name: "Priya Sharma",
    source: "apply-link",
    jobFit: 91,
    ats: 88,
    email: "priya@gmail.com",
    aptitude: 74,
    qualification: "pass",
    coding: 81,
    interview: "live",
    overall: null,
    integrity: "clean",
    status: "In Progress",
  },
  {
    rank: 2,
    name: "Amit Patel",
    source: "bulk-upload",
    jobFit: 87,
    ats: 82,
    email: "amit@company.com",
    aptitude: 52,
    qualification: "fail",
    coding: null,
    interview: null,
    overall: null,
    integrity: "flags",
    status: "In Progress",
  },
  {
    rank: 3,
    name: "Rahul Kumar",
    source: "apply-link",
    jobFit: 88,
    ats: 91,
    email: "rahul.k@gmail.com",
    aptitude: 88,
    qualification: "pass",
    coding: 92,
    interview: 85,
    overall: 88,
    integrity: "clean",
    status: "Completed",
  },
  {
    rank: 4,
    name: "Sneha Iyer",
    source: "apply-link",
    jobFit: 79,
    ats: 75,
    email: "sneha.iyer@outlook.com",
    aptitude: 68,
    qualification: "pass",
    coding: 71,
    interview: "live",
    overall: null,
    integrity: "clean",
    status: "In Progress",
  },
  {
    rank: 5,
    name: "John Doe",
    source: "bulk-upload",
    jobFit: 84,
    ats: 79,
    email: undefined,
    emailMissing: true,
    aptitude: 41,
    qualification: "fail",
    coding: null,
    interview: null,
    overall: null,
    integrity: "penalty",
    status: "Locked",
  },
  {
    rank: 6,
    name: "Meera Krishnan",
    source: "apply-link",
    jobFit: 76,
    ats: 72,
    email: "meera.k@gmail.com",
    aptitude: 62,
    qualification: "pass",
    coding: 58,
    interview: 70,
    overall: 64,
    integrity: "clean",
    status: "Completed",
  },
  {
    rank: 7,
    name: "Arjun Reddy",
    source: "apply-link",
    jobFit: 83,
    ats: 80,
    email: "arjun.r@gmail.com",
    aptitude: 79,
    qualification: "pass",
    coding: 84,
    interview: "live",
    overall: null,
    integrity: "flags",
    status: "In Progress",
  },
  {
    rank: 8,
    name: "Kavya Nair",
    source: "bulk-upload",
    jobFit: 72,
    ats: 68,
    email: "kavya.nair@gmail.com",
    aptitude: 55,
    qualification: "pass",
    coding: 61,
    interview: null,
    overall: null,
    integrity: "clean",
    status: "In Progress",
  },
];

const SUMMARY = {
  total: CANDIDATES.length,
  shortlisted: 5,
  invited: 5,
  completed: 2,
};

export function CandidateLeaderboard() {
  const { set } = useNav();
  const [tab, setTab] = useState<"all" | "apply" | "bulk">("all");
  const [method, setMethod] = useState("top-10");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = CANDIDATES.filter((c) => {
    if (tab === "all") return true;
    if (tab === "apply") return c.source === "apply-link";
    return c.source === "bulk-upload";
  });

  const eligibleForShortlist = CANDIDATES.filter((c) => c.email).length;

  const previewCount = (() => {
    switch (method) {
      case "top-5":
        return Math.min(5, eligibleForShortlist);
      case "top-10":
        return Math.min(10, eligibleForShortlist);
      case "top-20":
        return Math.min(20, eligibleForShortlist);
      case "fit-75":
        return CANDIDATES.filter((c) => c.email && c.jobFit >= 75).length;
      case "fit-80":
        return CANDIDATES.filter((c) => c.email && c.jobFit >= 80).length;
      case "fit-90":
        return CANDIDATES.filter((c) => c.email && c.jobFit >= 90).length;
      case "all":
        return eligibleForShortlist;
      case "manual":
        return selected.size;
      default:
        return eligibleForShortlist;
    }
  })();

  const toggleSelect = (rank: number) => {
    const next = new Set(selected);
    if (next.has(rank)) next.delete(rank);
    else next.add(rank);
    setSelected(next);
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
              Campaign. backend-sde-1
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Candidate leaderboard
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              State 4. Post-shortlist. Candidates are taking assessment rounds. Updates in real-time via WebSocket.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set("bulk-upload")}
              className="h-9 rounded-full"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Bulk upload
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBlock
            label="Total"
            value={SUMMARY.total}
            tone="violet"
            icon={<Users className="h-4 w-4" />}
          />
          <StatBlock
            label="Shortlisted"
            value={SUMMARY.shortlisted}
            tone="sky"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <StatBlock
            label="Invited"
            value={SUMMARY.invited}
            tone="amber"
            icon={<Mail className="h-4 w-4" />}
          />
          <StatBlock
            label="Completed"
            value={SUMMARY.completed}
            tone="emerald"
            icon={<Check className="h-4 w-4" />}
          />
        </div>

        {/* Notification banner */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-100">
          <Bell className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">3 new applicants</span> in the last
            hour. Auto-ranked by AI job-fit score.
          </span>
          <button className="ml-auto text-xs underline hover:text-amber-50">
            View
          </button>
        </div>

        {/* Auto-shortlist panel */}
        <div className="mt-5 rounded-lg border border-black/10 bg-background p-5 shadow-sm dark:border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
                <Rocket className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Auto-shortlist</p>
                <p className="text-xs text-muted-foreground">
                  Will shortlist:{" "}
                  <span className="font-semibold text-violet-700 dark:text-violet-300">
                    {previewCount}
                  </span>{" "}
                  candidates ·{" "}
                  <span className="text-emerald-600 dark:text-emerald-300">
                    {eligibleForShortlist} have emails
                  </span>
                  {CANDIDATES.some((c) => c.emailMissing) && (
                    <span className="text-amber-600 dark:text-amber-300">
                      {" "}
                      · {CANDIDATES.filter((c) => c.emailMissing).length} need
                      manual fix
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-10 w-full min-w-[200px] sm:w-[230px]">
                  <Filter className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-5">Top 5 candidates</SelectItem>
                  <SelectItem value="top-10">Top 10 candidates</SelectItem>
                  <SelectItem value="top-20">Top 20 candidates</SelectItem>
                  <SelectItem value="fit-75">Job Fit ≥ 75%</SelectItem>
                  <SelectItem value="fit-80">Job Fit ≥ 80%</SelectItem>
                  <SelectItem value="fit-90">Job Fit ≥ 90%</SelectItem>
                  <SelectItem value="all">All applicants</SelectItem>
                  <SelectItem value="manual">
                    Manual select ({selected.size} chosen)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-10 rounded-full bg-violet-500 px-5 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600">
                <Rocket className="mr-1.5 h-4 w-4" />
                Shortlist &amp; Send Invites · {previewCount}
              </Button>
            </div>
          </div>
        </div>

        {/* Source tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="mt-5"
        >
          <TabsList className="h-auto bg-muted/40 p-1">
            <TabsTrigger value="all" className="px-4 py-1.5 text-sm">
              All ({CANDIDATES.length})
            </TabsTrigger>
            <TabsTrigger value="apply" className="px-4 py-1.5 text-sm">
              Apply Link ({CANDIDATES.filter((c) => c.source === "apply-link").length})
            </TabsTrigger>
            <TabsTrigger value="bulk" className="px-4 py-1.5 text-sm">
              Bulk Upload ({CANDIDATES.filter((c) => c.source === "bulk-upload").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-lg border border-black/10 bg-background shadow-sm dark:border-white/10">
          <div className="max-h-[680px] overflow-auto scrollbar-custom">
            <Table>
              <TableHeader>
                <TableRow className="border-black/10 hover:bg-transparent dark:border-white/10">
                  <TableHead className="pl-4">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Source</TableHead>
                  <TableHead className="hidden lg:table-cell">Job Fit</TableHead>
                  <TableHead className="hidden lg:table-cell">ATS</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Apt.</TableHead>
                  <TableHead className="hidden md:table-cell">Qual.</TableHead>
                  <TableHead>Coding</TableHead>
                  <TableHead className="hidden sm:table-cell">Interview</TableHead>
                  <TableHead className="hidden md:table-cell">Overall</TableHead>
                  <TableHead>Integrity</TableHead>
                  <TableHead className="pr-4">Status</TableHead>
                  <TableHead className="hidden lg:table-cell pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.rank}
                    className={cn(
                      "border-black/5 hover:bg-muted/30 dark:border-white/5",
                      selected.has(c.rank) && "bg-violet-500/[0.05]",
                    )}
                  >
                    <TableCell className="pl-4 py-3">
                      <Checkbox
                        checked={selected.has(c.rank)}
                        onCheckedChange={() => toggleSelect(c.rank)}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.rank}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-500/10 text-xs font-semibold text-violet-700 dark:text-violet-300">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: BACKEN-{(c.rank * 41298 + 0xa3f2).toString(16).toUpperCase().slice(0, 6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.source === "apply-link" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Apply Link
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">
                          Bulk Upload
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={c.jobFit}
                          className="h-1.5 w-16 [&>div]:bg-violet-500"
                        />
                        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                          {c.jobFit}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {c.ats}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {c.emailMissing ? (
                        <div className="flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-200">
                          <Mail className="h-3 w-3" />
                          <input
                            placeholder="type email"
                            className="w-28 bg-transparent outline-none placeholder:text-amber-700/50 dark:placeholder:text-amber-200/50"
                          />
                          <button className="ml-1 grid h-5 w-5 place-items-center rounded hover:bg-amber-500/20">
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-300" />
                          <span className="truncate max-w-[140px]">
                            {c.email}
                          </span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.aptitude !== null ? (
                        <span
                          className={cn(
                            "font-medium",
                            c.aptitude >= 70
                              ? "text-emerald-600 dark:text-emerald-300"
                              : c.aptitude >= 50
                                ? "text-amber-600 dark:text-amber-300"
                                : "text-rose-600 dark:text-rose-300",
                          )}
                        >
                          {c.aptitude}/100
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.qualification === "pass" ? (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      ) : c.qualification === "fail" ? (
                        <XIcon className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.coding !== null ? (
                        <span
                          className={cn(
                            "font-medium",
                            c.coding >= 70
                              ? "text-emerald-600 dark:text-emerald-300"
                              : "text-amber-600 dark:text-amber-300",
                          )}
                        >
                          {c.coding}/100
                        </span>
                      ) : c.qualification === "fail" ? (
                        <Lock className="h-3.5 w-3.5 text-rose-600/70 dark:text-rose-300/70" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {c.interview === "live" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          Live
                        </span>
                      ) : c.interview !== null ? (
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                          {c.interview}/100
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.overall !== null ? (
                        <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                          {c.overall}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IntegrityBadge state={c.integrity} onClick={() => set("proctoring-review")} />
                    </TableCell>
                    <TableCell className="pr-4">
                      <StatusBadge status={c.status} />
                    </TableCell>
                    {/* F-14: Per-row invite actions */}
                    <TableCell className="hidden lg:table-cell pr-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Resend Invite"
                          onClick={() => {}}
                          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-violet-700 dark:hover:text-violet-300"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Reset Password"
                          onClick={() => {}}
                          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-sky-700 dark:hover:text-sky-300"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Revoke Access"
                          onClick={() => {}}
                          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-rose-600 dark:hover:text-rose-300"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="text-foreground/80">{filtered.length}</span> of{" "}
            {CANDIDATES.length} candidates · live updates every 5s
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button className="h-10 rounded-full bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600">
              <FileArchive className="mr-2 h-4 w-4" />
              Export PDF ZIP
            </Button>
          </div>
        </div>

      </PageWrap>
    </div>
  );
}

/* ---------- sub-components ---------- */

function IntegrityBadge({
  state,
  onClick,
}: {
  state: Candidate["integrity"];
  onClick?: () => void;
}) {
  if (state === "clean") {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300"
      >
        <ShieldCheck className="h-3 w-3" />
        Clean
      </button>
    );
  }
  if (state === "flags") {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
      >
        <ShieldAlert className="h-3 w-3" />
        2 flags
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-700 transition-colors hover:bg-rose-500/20 dark:text-rose-300"
    >
      <ShieldAlert className="h-3 w-3" />
      20% penalty
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<
    Status,
    string
  > = {
    "In Progress": "border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    Completed: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    Locked: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    Invited: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", map[status])}>
      {status}
    </span>
  );
}

function StatBlock({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";
  icon: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    violet: "text-violet-600 dark:text-violet-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
    sky: "text-sky-600 dark:text-sky-300",
    slate: "text-foreground/80",
  };
  return (
    <div className="rounded-lg border border-black/10 bg-background p-4 shadow-sm dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-2 text-2xl font-semibold tracking-tight", tones[tone])}>
            {value}
          </p>
        </div>
        {icon && (
          <div className={cn("rounded-lg border border-black/10 bg-muted/40 p-2 dark:border-white/10", tones[tone])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
