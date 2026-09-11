"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  Download,
  FileArchive,
  FileText,
  Save,
  Shield,
  Trophy,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PageWrap,
  PulseBadge,
  SectionHeading,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type Row = {
  rank: number;
  name: string;
  id: string;
  source: "Apply Link" | "Bulk Upload";
  overall: number;
  integrity: "clean" | "flags" | "penalty" | "dq";
  decision: Decision;
  notes: string;
};

const INITIAL: Row[] = [
  {
    rank: 1,
    name: "Priya Sharma",
    id: "BACKEN-3FA82C",
    source: "Apply Link",
    overall: 88,
    integrity: "clean",
    decision: "Selected",
    notes: "Strong technical + communication. Hire for backend team.",
  },
  {
    rank: 2,
    name: "Amit Patel",
    id: "BACKEN-7E12BD",
    source: "Bulk Upload",
    overall: 61,
    integrity: "penalty",
    decision: "Waitlisted",
    notes: "Borderline. Reserve list — proctoring penalty applied.",
  },
  {
    rank: 3,
    name: "Rahul Kumar",
    id: "BACKEN-9C5A11",
    source: "Apply Link",
    overall: 52,
    integrity: "clean",
    decision: "Rejected",
    notes: "Below threshold. Coding round failed.",
  },
  {
    rank: 4,
    name: "Sneha Iyer",
    id: "BACKEN-1B77AC",
    source: "Apply Link",
    overall: 76,
    integrity: "clean",
    decision: "Selected",
    notes: "Great culture-fit. Junior with high potential.",
  },
  {
    rank: 5,
    name: "John Doe",
    id: "BACKEN-04F2AA",
    source: "Bulk Upload",
    overall: 0,
    integrity: "dq",
    decision: "Rejected",
    notes: "Disqualified — phone detected in frame + 3 tab switches.",
  },
  {
    rank: 6,
    name: "Meera Krishnan",
    id: "BACKEN-22E0DD",
    source: "Apply Link",
    overall: 64,
    integrity: "clean",
    decision: "Waitlisted",
    notes: "Solid aptitude, weaker interview. Re-evaluate next round.",
  },
  {
    rank: 7,
    name: "Arjun Reddy",
    id: "BACKEN-77AB99",
    source: "Apply Link",
    overall: 81,
    integrity: "flags",
    decision: "Pending",
    notes: "",
  },
  {
    rank: 8,
    name: "Kavya Nair",
    id: "BACKEN-88CC02",
    source: "Bulk Upload",
    overall: 73,
    integrity: "clean",
    decision: "Pending",
    notes: "",
  },
];

export function FinalSelection() {
  const { set } = useNav();
  const [rows, setRows] = useState<Row[]>(INITIAL);
  const [saved, setSaved] = useState(false);

  const setDecision = (id: string, decision: Decision) =>
    setRows((arr) => arr.map((r) => (r.id === id ? { ...r, decision } : r)));

  const setNotes = (id: string, notes: string) =>
    setRows((arr) => arr.map((r) => (r.id === id ? { ...r, notes } : r)));

  const summary = {
    selected: rows.filter((r) => r.decision === "Selected").length,
    waitlisted: rows.filter((r) => r.decision === "Waitlisted").length,
    rejected: rows.filter((r) => r.decision === "Rejected").length,
    pending: rows.filter((r) => r.decision === "Pending").length,
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
            title="Final selection"
            description="Lock hiring decisions. Per-candidate dropdown + notes. Export full report when ready."
          />
          <PulseBadge color="amber">
            {summary.pending} pending · {summary.selected} selected
          </PulseBadge>
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
        <GlowCard className="mt-6 overflow-hidden p-0">
          <div className="max-h-[640px] overflow-auto scrollbar-custom">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-12 pl-5">#</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead className="hidden md:table-cell">Source</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Integrity</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead className="pr-5">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className={cn(
                      "border-white/5 hover:bg-white/[0.03]",
                      r.decision === "Selected" && "bg-emerald-500/[0.04]",
                      r.decision === "Rejected" && "opacity-70",
                    )}
                  >
                    <TableCell className="pl-5 text-xs text-muted-foreground">
                      {r.rank}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-xs font-semibold text-violet-100">
                          {r.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {r.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            ID: <span className="font-mono">{r.id}</span>
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {r.source === "Apply Link" ? (
                        <PulseBadge color="emerald">Apply Link</PulseBadge>
                      ) : (
                        <PulseBadge color="sky">Bulk Upload</PulseBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            r.overall === 0
                              ? "text-rose-300"
                              : r.overall >= 80
                                ? "text-emerald-300"
                                : r.overall >= 60
                                  ? "text-amber-300"
                                  : "text-rose-300",
                          )}
                        >
                          {r.overall === 0 ? "DQ" : `${r.overall}%`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <IntegrityTag state={r.integrity} />
                    </TableCell>
                    <TableCell>
                      <DecisionSelect
                        value={r.decision}
                        onChange={(v) => setDecision(r.id, v)}
                      />
                    </TableCell>
                    <TableCell className="pr-5">
                      <Textarea
                        value={r.notes}
                        onChange={(e) => setNotes(r.id, e.target.value)}
                        rows={2}
                        placeholder="Add a note for this candidate…"
                        className="min-w-[200px] resize-none text-xs"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </GlowCard>

        {/* Export actions */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-violet-300" />
            Decisions are versioned — every change is logged with timestamp &amp;
            admin name.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              }}
              className="h-10 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
            >
              <Save className="mr-2 h-4 w-4" />
              {saved ? "Saved!" : "Save decisions"}
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <MagneticButton className="h-11 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-white hover:from-violet-400 hover:to-fuchsia-400">
              <FileArchive className="mr-2 h-4 w-4" />
              Export PDF ZIP
            </MagneticButton>
          </div>
        </div>

        {/* Footer card */}
        <GlowCard className="mt-6 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {summary.selected} candidate{summary.selected === 1 ? "" : "s"}{" "}
                  selected
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF ZIP includes per-candidate 17-section reports + integrity
                  audit trail.
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
        </GlowCard>
      </PageWrap>
    </AuroraBackground>
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
      tone: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
      icon: <UserCheck className="h-3.5 w-3.5" />,
    },
    {
      label: "Waitlisted",
      tone: "border-amber-400/40 bg-amber-500/10 text-amber-200",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    {
      label: "Rejected",
      tone: "border-rose-400/40 bg-rose-500/10 text-rose-200",
      icon: <UserX className="h-3.5 w-3.5" />,
    },
    {
      label: "Pending",
      tone: "border-white/15 bg-white/5 text-white/70",
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
        className="w-44 border-white/10 bg-card/95 backdrop-blur-xl"
      >
        <DropdownMenuLabel>Set decision</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {opts.map((o) => (
          <DropdownMenuItem
            key={o.label}
            onClick={() => onChange(o.label)}
            className="gap-2 text-sm focus:bg-white/5"
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

function IntegrityTag({
  state,
}: {
  state: Row["integrity"];
}) {
  if (state === "clean")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-200">
        <Check className="h-3 w-3" /> Clean
      </span>
    );
  if (state === "flags")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-200">
        ⚠️ 2 flags
      </span>
    );
  if (state === "penalty")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-200">
        -20% penalty
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/15 px-2.5 py-0.5 text-xs text-rose-200">
      🚫 Auto-DQ
    </span>
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
    violet: "text-violet-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    slate: "text-white/80",
  };
  return (
    <GlowCard className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-1 text-2xl font-semibold", tones[tone])}>
            {value}
          </p>
        </div>
        <div className={cn("rounded-lg border border-white/10 bg-white/5 p-2", tones[tone])}>
          {icon}
        </div>
      </div>
    </GlowCard>
  );
}
