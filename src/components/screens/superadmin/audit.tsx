"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  Filter,
  ScrollText,
  Search,
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
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

type Role = "all" | "student" | "candidate" | "company_admin" | "super_admin";
type Action =
  | "all"
  | "CAMPAIGN_CREATED"
  | "BULK_SHORTLIST"
  | "COMPANY_SUSPENDED"
  | "QUESTION_RESEED"
  | "USER_DELETED"
  | "LOGIN";

interface AuditRow {
  ts: string;
  user: string;
  role: Exclude<Role, "all">;
  action: Exclude<Action, "all">;
  details: string;
}

const AUDIT: AuditRow[] = [
  {
    ts: "Jan 16 · 14:23",
    user: "vikram@acme.com",
    role: "company_admin",
    action: "CAMPAIGN_CREATED",
    details: "“Campus Drive 2025”",
  },
  {
    ts: "Jan 16 · 14:30",
    user: "vikram@acme.com",
    role: "company_admin",
    action: "BULK_SHORTLIST",
    details: "10 candidates shortlisted",
  },
  {
    ts: "Jan 16 · 15:00",
    user: "admin@platform.com",
    role: "super_admin",
    action: "COMPANY_SUSPENDED",
    details: "OldCorp",
  },
  {
    ts: "Jan 16 · 15:05",
    user: "admin@platform.com",
    role: "super_admin",
    action: "QUESTION_RESEED",
    details: "All questions regenerated",
  },
  {
    ts: "Jan 16 · 15:42",
    user: "ananya@techstart.io",
    role: "company_admin",
    action: "CAMPAIGN_CREATED",
    details: "“Backend Hiring Q1”",
  },
  {
    ts: "Jan 16 · 16:11",
    user: "priya@gmail.com",
    role: "candidate",
    action: "LOGIN",
    details: "Force password change completed",
  },
  {
    ts: "Jan 16 · 16:34",
    user: "admin@platform.com",
    role: "super_admin",
    action: "USER_DELETED",
    details: "rahul@student.com. GDPR job queued",
  },
];

const ACTION_COLOR: Record<
  AuditRow["action"],
  string
> = {
  CAMPAIGN_CREATED: "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  BULK_SHORTLIST: "border-sky-400/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  COMPANY_SUSPENDED: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  QUESTION_RESEED: "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  USER_DELETED: "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  LOGIN: "border-black/10 bg-black/5 text-muted-foreground dark:border-white/10 dark:bg-white/5",
};

export function AuditLogs() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role>("all");
  const [action, setAction] = useState<Action>("all");
  const [from, setFrom] = useState("2025-01-16");
  const [to, setTo] = useState("2025-01-16");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT.filter((r) => {
      if (role !== "all" && r.role !== role) return false;
      if (action !== "all" && r.action !== action) return false;
      if (
        q &&
        !r.user.toLowerCase().includes(q) &&
        !r.details.toLowerCase().includes(q) &&
        !r.action.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [query, role, action]);

  const exportCsv = () => {
    const header = "timestamp,user,role,action,details\n";
    const rows = filtered
      .map((r) =>
        [
          r.ts,
          r.user,
          r.role,
          r.action,
          `"${r.details.replace(/"/g, '""')}"`,
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${from}-to-${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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
              <ScrollText className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              <p className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-300/80">
                Super Admin · Audit Logs
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              The platform <span className="text-violet-500 dark:text-violet-400">audit trail</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Every admin action across every tenant. Immutable, filterable,
              exportable. Search by user, role, action type or date range.
            </p>
          </div>
          <Badge variant="outline" className="self-start rounded-full border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300 sm:self-end">
            {AUDIT.length} events today
          </Badge>
        </motion.header>

        {/* Top stats */}
        <StaggeredReveal
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          delay={0.05}
        >
          <motion.div variants={revealItem}>
            <StatCard
              label="Today"
              value={AUDIT.length}
              hint="Audit events captured"
              icon={<ScrollText className="h-4 w-4" />}
              tone="violet"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Filtered"
              value={filtered.length}
              hint="Matches current filters"
              icon={<Filter className="h-4 w-4" />}
              tone="sky"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Super-admin acts"
              value={AUDIT.filter((r) => r.role === "super_admin").length}
              hint="Platform-level changes"
              icon={<Filter className="h-4 w-4" />}
              tone="amber"
            />
          </motion.div>
          <motion.div variants={revealItem}>
            <StatCard
              label="Storage"
              value="∞"
              hint="Logs never deleted"
              icon={<Calendar className="h-4 w-4" />}
              tone="emerald"
            />
          </motion.div>
        </StaggeredReveal>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <GlowCard className="p-5">
            <SectionHeading
              align="left"
              eyebrow="Filters"
              title="Refine the audit feed"
              description="Stack as many filters as you like. The table updates instantly."
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  User search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="email or keyword…"
                    className="h-9 border-white/10 bg-background/40 pl-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Role
                </label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="h-9 w-full border-white/10 bg-background/40 text-sm">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-card/95">
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="student">student</SelectItem>
                    <SelectItem value="candidate">candidate</SelectItem>
                    <SelectItem value="company_admin">company_admin</SelectItem>
                    <SelectItem value="super_admin">super_admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Action type
                </label>
                <Select value={action} onValueChange={(v) => setAction(v as Action)}>
                  <SelectTrigger className="h-9 w-full border-white/10 bg-background/40 text-sm">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-card/95">
                    <SelectItem value="all">All actions</SelectItem>
                    <SelectItem value="CAMPAIGN_CREATED">CAMPAIGN_CREATED</SelectItem>
                    <SelectItem value="BULK_SHORTLIST">BULK_SHORTLIST</SelectItem>
                    <SelectItem value="COMPANY_SUSPENDED">COMPANY_SUSPENDED</SelectItem>
                    <SelectItem value="QUESTION_RESEED">QUESTION_RESEED</SelectItem>
                    <SelectItem value="USER_DELETED">USER_DELETED</SelectItem>
                    <SelectItem value="LOGIN">LOGIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Date range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-9 w-full border-white/10 bg-background/40 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">→</span>
                  <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-9 w-full border-white/10 bg-background/40 text-sm"
                  />
                </div>
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Audit table */}
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
                eyebrow="Feed"
                title="Audit entries"
                description="Sorted newest-first."
              />
              <Badge variant="outline" className={cn("rounded-full capitalize px-2.5 py-0.5", role === "all" ? "border-black/10 bg-black/5 text-muted-foreground dark:border-white/10 dark:bg-white/5" : "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-300")}>
                {role === "all" ? "All roles" : role}
              </Badge>
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-5">Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="pr-5">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r, i) => (
                    <TableRow
                      key={i}
                      className="border-white/5 hover:bg-white/[0.03]"
                    >
                      <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                        {r.ts}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.user}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.role}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5", ACTION_COLOR[r.action])}>
                          {r.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-5 text-sm text-foreground/80">
                        {r.details}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No audit entries match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/5 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {AUDIT.length} entries
              </p>
              <Button
                variant="outline"
                className={cn(
                  "h-9 border-white/10 bg-white/5 text-sm hover:bg-white/10",
                )}
                onClick={exportCsv}
                disabled={filtered.length === 0}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </GlowCard>
        </motion.div>

      </PageWrap>
    </div>
  );
}
