"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileArchive,
  Filter,
  Lock,
  Mail,
  RefreshCw,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PageWrap,
  PulseBadge,
  SectionHeading,
  StatCard,
} from "@/components/shared/primitives";
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
    <AuroraBackground>
      <PageWrap className="pt-8">
        <button
          onClick={() => set("admin-dashboard")}
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Campaign · backend-sde-1"
            title="Candidate leaderboard"
            description="State 4 · post-shortlist. Candidates are taking assessment rounds. Updates in real-time via WebSocket."
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set("bulk-upload")}
              className="h-9 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Bulk upload
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={SUMMARY.total}
            tone="violet"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Shortlisted"
            value={SUMMARY.shortlisted}
            tone="sky"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <StatCard
            label="Invited"
            value={SUMMARY.invited}
            tone="amber"
            icon={<Mail className="h-4 w-4" />}
          />
          <StatCard
            label="Completed"
            value={SUMMARY.completed}
            tone="emerald"
            icon={<Check className="h-4 w-4" />}
          />
        </div>

        {/* Notification banner */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <Bell className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">3 new applicants</span> in the last
            hour — auto-ranked by AI job-fit score.
          </span>
          <button className="ml-auto text-xs underline hover:text-amber-50">
            View
          </button>
        </div>

        {/* Auto-shortlist panel */}
        <GlowCard className="mt-5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300">
                <Rocket className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Auto-shortlist</p>
                <p className="text-xs text-muted-foreground">
                  Will shortlist:{" "}
                  <span className="font-semibold text-violet-200">
                    {previewCount}
                  </span>{" "}
                  candidates ·{" "}
                  <span className="text-emerald-300">
                    {eligibleForShortlist} have emails
                  </span>
                  {CANDIDATES.some((c) => c.emailMissing) && (
                    <span className="text-amber-300">
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
              <MagneticButton className="h-10 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-white hover:from-violet-400 hover:to-fuchsia-400">
                <Rocket className="mr-1.5 h-4 w-4" />
                Shortlist &amp; Send Invites · {previewCount}
              </MagneticButton>
            </div>
          </div>
        </GlowCard>

        {/* Source tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="mt-5"
        >
          <TabsList className="h-auto bg-white/[0.03] p-1">
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
        <GlowCard className="mt-4 overflow-hidden p-0">
          <div className="max-h-[680px] overflow-auto scrollbar-custom">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.rank}
                    className={cn(
                      "border-white/5 hover:bg-white/[0.03]",
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
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-xs font-semibold text-violet-100">
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
                        <PulseBadge color="emerald">Apply Link</PulseBadge>
                      ) : (
                        <PulseBadge color="sky">Bulk Upload</PulseBadge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={c.jobFit}
                          className="h-1.5 w-16 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500"
                        />
                        <span className="text-xs font-medium text-violet-200">
                          {c.jobFit}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {c.ats}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {c.emailMissing ? (
                        <div className="flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
                          <Mail className="h-3 w-3" />
                          <input
                            placeholder="type email"
                            className="w-28 bg-transparent outline-none placeholder:text-amber-200/50"
                          />
                          <button className="ml-1 grid h-5 w-5 place-items-center rounded hover:bg-amber-500/20">
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-emerald-300" />
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
                              ? "text-emerald-300"
                              : c.aptitude >= 50
                                ? "text-amber-300"
                                : "text-rose-300",
                          )}
                        >
                          {c.aptitude}/100
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.qualification === "pass" ? (
                        <Check className="h-4 w-4 text-emerald-300" />
                      ) : c.qualification === "fail" ? (
                        <span className="text-rose-300">✗</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.coding !== null ? (
                        <span
                          className={cn(
                            "font-medium",
                            c.coding >= 70
                              ? "text-emerald-300"
                              : "text-amber-300",
                          )}
                        >
                          {c.coding}/100
                        </span>
                      ) : c.qualification === "fail" ? (
                        <Lock className="h-3.5 w-3.5 text-rose-300/70" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {c.interview === "live" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                          Live
                        </span>
                      ) : c.interview !== null ? (
                        <span className="text-sm font-medium text-emerald-300">
                          {c.interview}/100
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.overall !== null ? (
                        <span className="text-sm font-semibold text-violet-200">
                          {c.overall}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IntegrityBadge state={c.integrity} onClick={() => set("proctoring-review")} />
                    </TableCell>
                    <TableCell className="pr-4">
                      <StatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </GlowCard>

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
              className="h-10 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button className="h-10 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400">
              <FileArchive className="mr-2 h-4 w-4" />
              Export PDF ZIP
            </Button>
          </div>
        </div>

      </PageWrap>
    </AuroraBackground>
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
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-200 transition-colors hover:bg-emerald-500/20"
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
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-200 transition-colors hover:bg-amber-500/20"
      >
        <ShieldAlert className="h-3 w-3" />
        2 flags
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-200 transition-colors hover:bg-rose-500/20"
    >
      <ShieldAlert className="h-3 w-3" />
      20% penalty
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<
    Status,
    { color: "violet" | "emerald" | "rose" | "sky" | "slate" }
  > = {
    "In Progress": { color: "violet" },
    Completed: { color: "emerald" },
    Locked: { color: "rose" },
    Invited: { color: "sky" },
  };
  return <PulseBadge color={map[status].color}>{status}</PulseBadge>;
}
