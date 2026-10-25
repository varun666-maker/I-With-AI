"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronLeft,
  Clock,
  Eye,
  Gauge,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type Severity = "info" | "warning" | "critical" | "auto-submitted";

type Event = {
  id: string;
  time: string;
  round: "Aptitude" | "Coding" | "Interview";
  event: string;
  severity: Severity;
  screenshot?: boolean;
  status: "open" | "dismissed" | "confirmed";
};

const CAND = {
  name: "Amit Patel",
  id: "BACKEN-3FA82C",
  email: "amit@company.com",
  source: "Bulk Upload",
  aptitude: 52,
  coding: null,
  interview: null,
  overall: null,
  integrityScore: 64,
  flags: 2,
  penalties: 1,
};

const EVENTS: Event[] = [
  {
    id: "e1",
    time: "10:23",
    round: "Aptitude",
    event: "Tab switch (1/3)",
    severity: "warning",
    screenshot: true,
    status: "confirmed",
  },
  {
    id: "e2",
    time: "10:45",
    round: "Aptitude",
    event: "Tab switch (2/3)",
    severity: "warning",
    screenshot: true,
    status: "dismissed",
  },
  {
    id: "e3",
    time: "11:02",
    round: "Aptitude",
    event: "Tab switch (3/3). Auto-submitted",
    severity: "auto-submitted",
    screenshot: true,
    status: "confirmed",
  },
  {
    id: "e4",
    time: "11:35",
    round: "Coding",
    event: "Copy-paste from external source detected",
    severity: "critical",
    screenshot: true,
    status: "open",
  },
  {
    id: "e5",
    time: "14:30",
    round: "Interview",
    event: "Phone detected in frame",
    severity: "critical",
    screenshot: true,
    status: "open",
  },
];

const INTEGRITY_BREAKDOWN = [
  { label: "Base integrity", value: 100, max: 100, tone: "emerald" as const },
  { label: "Tab switch penalty", value: -15, max: 100, tone: "rose" as const },
  { label: "Phone detection flag", value: -12, max: 100, tone: "amber" as const },
  { label: "Copy-paste penalty", value: -9, max: 100, tone: "rose" as const },
];

export function ProctoringReview() {
  const { set } = useNav();
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [activeScreenshot, setActiveScreenshot] = useState<Event | null>(null);

  const setStatus = (id: string, status: Event["status"]) =>
    setEvents((arr) => arr.map((e) => (e.id === id ? { ...e, status } : e)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap className="pt-8">
        <button
          onClick={() => set("candidate-leaderboard")}
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to leaderboard
        </button>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Proctoring Review. backend-sde-1
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Candidate integrity timeline
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Detailed review of every flagged event. Click View to inspect the captured webcam frame.
          </p>
        </div>

        {/* Candidate info */}
        <div className="mt-5 rounded-lg border border-black/10 bg-background p-5 shadow-sm dark:border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-700 dark:text-violet-300">
                {CAND.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-base font-semibold">{CAND.name}</p>
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono">{CAND.id}</span> ·{" "}
                  {CAND.email} · Source: {CAND.source}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ScoreChip label="Aptitude" value={`${CAND.aptitude}/100`} />
              <ScoreChip label="Coding" value="-" muted />
              <ScoreChip label="Interview" value="-" muted />
              <ScoreChip label="Overall" value="-" muted />
              <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Integrity
                  </p>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">
                    {CAND.integrityScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integrity breakdown */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              <h3 className="text-sm font-medium">Integrity score breakdown</h3>
            </div>
            <div className="mt-4 space-y-3">
              {INTEGRITY_BREAKDOWN.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span
                      className={cn(
                        "font-medium",
                        row.value === 100
                          ? "text-emerald-600 dark:text-emerald-300"
                          : row.tone === "amber"
                            ? "text-amber-700 dark:text-amber-200"
                            : "text-rose-600 dark:text-rose-300",
                      )}
                    >
                      {row.value > 0 ? `+${row.value}` : row.value}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        row.value === 100
                          ? "bg-emerald-500"
                          : row.tone === "amber"
                            ? "bg-amber-500"
                            : "bg-rose-500",
                      )}
                      style={{
                        width: `${Math.abs(row.value === 100 ? 100 : row.value)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 flex items-center justify-between rounded-lg border border-black/10 bg-muted/30 px-4 py-2.5 dark:border-white/10">
                <span className="text-sm font-medium">Final integrity</span>
                <span className="text-lg font-semibold text-amber-600 dark:text-amber-300">
                  {CAND.integrityScore}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                A 20% penalty was applied to the overall weighted score per
                policy (Strict mode · 3+ tab switches).
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              <h3 className="text-sm font-medium">Summary</h3>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <SummaryStat label="Events" value={EVENTS.length} tone="violet" />
              <SummaryStat
                label="Open flags"
                value={events.filter((e) => e.status === "open").length}
                tone="amber"
              />
              <SummaryStat
                label="Confirmed"
                value={events.filter((e) => e.status === "confirmed").length}
                tone="rose"
              />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Flags raised" value={`${CAND.flags}`} />
              <Row label="Penalties applied" value={`${CAND.penalties}`} />
              <Row label="Auto-submit triggered" value="Yes · 11:02" />
              <Row label="Recommendation" value="Hold for review" tone="amber" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-background shadow-sm dark:border-white/10">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              <p className="text-sm font-medium">Proctoring event timeline</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              {events.filter((e) => e.status === "open").length} open
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-black/10 hover:bg-transparent dark:border-white/10">
                <TableHead className="pl-5">Time</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead className="pr-5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow
                  key={e.id}
                  className={cn(
                    "border-black/5 dark:border-white/5",
                    e.status === "confirmed" && "bg-rose-500/[0.04]",
                    e.status === "dismissed" && "opacity-60",
                  )}
                >
                  <TableCell className="pl-5 py-3 font-mono text-xs text-muted-foreground">
                    {e.time}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">
                      {e.round}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {e.event}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={e.severity} />
                  </TableCell>
                  <TableCell>
                    {e.screenshot ? (
                      <button
                        onClick={() => setActiveScreenshot(e)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-700 transition-colors hover:bg-violet-500/20 dark:text-violet-300"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No capture
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setStatus(e.id, "dismissed")}
                        disabled={e.status !== "open"}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-40",
                          e.status === "dismissed"
                            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-black/10 text-muted-foreground hover:bg-muted dark:border-white/10",
                        )}
                      >
                        <X className="h-3 w-3" />
                        Dismiss
                      </button>
                      <button
                        onClick={() => setStatus(e.id, "confirmed")}
                        disabled={e.status !== "open"}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-40",
                          e.status === "confirmed"
                            ? "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : "border-black/10 text-muted-foreground hover:bg-muted dark:border-white/10",
                        )}
                      >
                        <Check className="h-3 w-3" />
                        Confirm
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            All actions are audit-logged and visible to your company admins.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-full"
            >
              <Ban className="mr-2 h-4 w-4" />
              Auto-disqualify candidate
            </Button>
            <Button
              onClick={() => set("candidate-leaderboard")}
              className="h-10 rounded-full bg-violet-500 px-5 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Save &amp; return to leaderboard
            </Button>
          </div>
        </div>

      </PageWrap>

      {/* Screenshot dialog */}
      <Dialog
        open={!!activeScreenshot}
        onOpenChange={(open) => !open && setActiveScreenshot(null)}
      >
        <DialogContent className="max-w-2xl border-black/10 bg-card dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              Captured frame · {activeScreenshot?.time}
            </DialogTitle>
            <DialogDescription>
              {activeScreenshot?.event} · stored in Cloudinary, available to
              company admins only.
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-black/10 bg-slate-900 dark:border-white/10">
            <FramePlaceholder />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => activeScreenshot && setStatus(activeScreenshot.id, "dismissed")}
            >
              <X className="mr-2 h-4 w-4" />
              Dismiss flag
            </Button>
            <Button
              className="rounded-full bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
              onClick={() => activeScreenshot && setStatus(activeScreenshot.id, "confirmed")}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm violation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- sub ---------- */

function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<
    Severity,
    { label: string; cls: string }
  > = {
    info: { label: "Info", cls: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    warning: { label: "Warning", cls: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    critical: { label: "Critical", cls: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300" },
    "auto-submitted": { label: "Auto-submitted", cls: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  };
  const s = map[severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", s.cls)}>
      {s.label}
    </span>
  );
}

function ScoreChip({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-muted/30 px-3 py-2 text-center dark:border-white/10">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium",
          muted ? "text-muted-foreground" : "text-foreground/90",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "violet" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    violet: "text-violet-600 dark:text-violet-300",
    amber: "text-amber-600 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
  };
  return (
    <div className="rounded-lg border border-black/5 bg-muted/30 p-3 dark:border-white/5">
      <p className={cn("text-xl font-semibold", tones[tone])}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber" | "rose" | "emerald";
}) {
  const tones: Record<string, string> = {
    amber: "text-amber-600 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", tone ? tones[tone] : "text-foreground/90")}>
        {value}
      </span>
    </div>
  );
}

function FramePlaceholder() {
  return (
    <div className="relative h-full w-full">
      {/* Faux webcam frame. A person silhouette in dim room */}
      <div className="absolute inset-0 bg-slate-900" />
      <div className="absolute left-1/2 top-1/2 h-44 w-32 -translate-x-1/2 -translate-y-1/2 rounded-t-full bg-slate-700" />
      <div className="absolute left-1/2 top-[58%] h-32 w-56 -translate-x-1/2 rounded-t-[64px] bg-slate-800" />
      {/* Phone */}
      <div className="absolute right-10 top-1/3 h-20 w-10 -rotate-12 rounded-md border-2 border-rose-400/60 bg-rose-500/10">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-rose-300">
          PHONE
        </span>
      </div>
      {/* Bounding box */}
      <div className="absolute left-[38%] top-[20%] h-[60%] w-[24%] rounded-md border-2 border-rose-400/70">
        <span className="absolute -top-6 left-0 rounded-sm bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          PHONE · 94% confidence
        </span>
      </div>
      <div className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[10px] text-emerald-300">
        ● REC · {`{time}`}
      </div>
      <div className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] text-muted-foreground">
        cam_001 · 1280×720
      </div>
    </div>
  );
}
