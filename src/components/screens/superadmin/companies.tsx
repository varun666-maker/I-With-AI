"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Eye,
  PauseCircle,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import {
  GlowCard,
  PageWrap,
  SectionHeading,
  StatCard,
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

interface Company {
  id: string;
  name: string;
  adminEmail: string;
  campaigns: number;
  candidates: number;
  status: "active" | "suspended";
  joined: string;
  plan: string;
}

const INITIAL_COMPANIES: Company[] = [
  {
    id: "acme",
    name: "Acme Corp",
    adminEmail: "vikram@acme.com",
    campaigns: 5,
    candidates: 142,
    status: "active",
    joined: "Mar 2024",
    plan: "Enterprise",
  },
  {
    id: "techstart",
    name: "TechStart",
    adminEmail: "hr@techstart.io",
    campaigns: 2,
    candidates: 38,
    status: "active",
    joined: "Jul 2024",
    plan: "Teams",
  },
  {
    id: "oldcorp",
    name: "OldCorp",
    adminEmail: "old@oldcorp.com",
    campaigns: 1,
    candidates: 12,
    status: "suspended",
    joined: "Jan 2024",
    plan: "Teams",
  },
  {
    id: "innovateco",
    name: "InnovateCo",
    adminEmail: "talent@innovateco.ai",
    campaigns: 3,
    candidates: 67,
    status: "active",
    joined: "Sep 2024",
    plan: "Enterprise",
  },
  {
    id: "legacylabs",
    name: "LegacyLabs",
    adminEmail: "ops@legacylabs.dev",
    campaigns: 1,
    candidates: 9,
    status: "suspended",
    joined: "Feb 2024",
    plan: "Free",
  },
];

const ACTIVITY = [
  { ts: "14:23", who: "Acme Corp", what: "Created campaign “Campus Drive 2025”" },
  { ts: "14:30", who: "TechStart", what: "Bulk-shortlisted 10 candidates" },
  { ts: "15:00", who: "Super Admin", what: "Suspended OldCorp" },
  { ts: "16:12", who: "InnovateCo", what: "Completed 24 AI interviews" },
];

export function CompanyManagement() {
  const { set } = useNav();
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [pendingAction, setPendingAction] = useState<Company | null>(null);

  const confirmToggle = () => {
    if (!pendingAction) return;
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === pendingAction.id
          ? {
              ...c,
              status: c.status === "active" ? "suspended" : "active",
            }
          : c,
      ),
    );
    setPendingAction(null);
  };

  const activeCount = companies.filter((c) => c.status === "active").length;
  const suspendedCount = companies.length - activeCount;
  const totalCandidates = companies.reduce((a, c) => a + c.candidates, 0);

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
              <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              <p className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-300/80">
                Super Admin · Companies
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Company <span className="text-violet-500 dark:text-violet-400">management</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Suspend or reactivate any tenant. When a company is suspended,
              its campaign apply links return a “company suspended” notice.
            </p>
          </div>
          <Badge variant="outline" className="self-start rounded-full border-violet-400/40 bg-violet-500/10 px-3 py-1 text-violet-700 dark:text-violet-300 sm:self-end">
            {companies.length} tenants
          </Badge>
        </motion.header>

        {/* Quick stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Active companies"
            value={activeCount}
            hint="Tenant logins enabled"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="emerald"
          />
          <StatCard
            label="Suspended"
            value={suspendedCount}
            hint="Awaiting reactivation"
            icon={<PauseCircle className="h-4 w-4" />}
            tone="rose"
          />
          <StatCard
            label="Total candidates"
            value={totalCandidates.toLocaleString()}
            hint="Across all tenants"
            icon={<TrendingUp className="h-4 w-4" />}
            tone="sky"
          />
        </div>

        {/* Companies table */}
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
                eyebrow="Tenants"
                title="All registered companies"
                description="Searchable directory of every company on the platform."
              />
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-5">Company</TableHead>
                    <TableHead>Admin Email</TableHead>
                    <TableHead className="text-right">Campaigns</TableHead>
                    <TableHead className="text-right">Candidates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-white/5 hover:bg-white/[0.03]"
                    >
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/10 text-sm font-semibold text-violet-700 dark:text-violet-300 ring-1 ring-inset ring-black/10 dark:ring-white/10">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {c.plan} · joined {c.joined}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.adminEmail}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c.campaigns}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c.candidates}
                      </TableCell>
                      <TableCell>
                        {c.status === "active" ? (
                          <Badge variant="outline" className="rounded-full border-emerald-400/40 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full border-rose-400/40 bg-rose-500/10 px-2.5 py-0.5 text-rose-700 dark:text-rose-300">Suspended</Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "h-8 border-white/10 bg-white/5 text-xs",
                              c.status === "active"
                                ? "text-rose-200 hover:bg-rose-500/10 hover:text-rose-100"
                                : "text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100",
                            )}
                            onClick={() => setPendingAction(c)}
                          >
                            {c.status === "active" ? (
                              <>
                                <PauseCircle className="mr-1 h-3.5 w-3.5" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <PlayCircle className="mr-1 h-3.5 w-3.5" />
                                Reactivate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-muted-foreground hover:bg-white/5 hover:text-white"
                            onClick={() => set("admin-dashboard")}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <GlowCard className="p-6">
            <SectionHeading
              align="left"
              eyebrow="Live"
              title="Recent tenant activity"
              description="Last actions performed by company admins."
            />
            <ul className="mt-5 space-y-3">
              {ACTIVITY.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="mt-0.5 font-mono text-xs text-violet-300">
                    {a.ts}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.who}</span>
                      <span className="text-muted-foreground"> · {a.what}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </GlowCard>

          <GlowCard className="p-6">
            <SectionHeading
              align="left"
              eyebrow="Policy"
              title="What suspension does"
              description="A safe-by-default circuit breaker for any tenant."
            />
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {[
                "Disables the company admin's login immediately.",
                "All campaign apply links return a “company suspended” page.",
                "In-flight candidate sessions are allowed to finish.",
                "Existing data is preserved. Reactivation is one click.",
                "Logged in the audit trail as COMPANY_SUSPENDED.",
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 text-violet-300/70" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </GlowCard>
        </motion.div>

      </PageWrap>

      {/* Suspend / Reactivate confirmation */}
      <Dialog
        open={!!pendingAction}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.status === "active" ? "Suspend" : "Reactivate"}{" "}
              {pendingAction?.name}?
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.status === "active"
                ? "The company admin will be signed out and all campaign apply links will display a “company suspended” notice. Existing candidate sessions will continue. You can reactivate at any time."
                : "Restores full access. The admin can log in again and new candidates can apply to active campaigns."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setPendingAction(null)}
            >
              Cancel
            </Button>
            <Button
              className={
                pendingAction?.status === "active"
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }
              onClick={confirmToggle}
            >
              {pendingAction?.status === "active" ? "Suspend now" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
