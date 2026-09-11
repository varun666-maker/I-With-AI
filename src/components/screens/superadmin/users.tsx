"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  KeyRound,
  PauseCircle,
  Search,
  ShieldAlert,
  Trash2,
  UserX,
  Users,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  PageWrap,
  PulseBadge,
  SectionHeading,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

type Role = "candidate" | "company_admin" | "student" | "super_admin";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  company: string;
  created: string;
}

const USERS: UserRow[] = [
  {
    id: "u1",
    email: "priya@gmail.com",
    name: "Priya Sharma",
    role: "candidate",
    company: "Acme Corp",
    created: "Jan 15",
  },
  {
    id: "u2",
    email: "vikram@acme.com",
    name: "Vikram Rao",
    role: "company_admin",
    company: "Acme Corp",
    created: "Dec 1",
  },
  {
    id: "u3",
    email: "rahul@student.com",
    name: "Rahul Kumar",
    role: "student",
    company: "—",
    created: "Nov 20",
  },
  {
    id: "u4",
    email: "ananya@techstart.io",
    name: "Ananya Iyer",
    role: "company_admin",
    company: "TechStart",
    created: "Oct 28",
  },
  {
    id: "u5",
    email: "meera@prepmail.com",
    name: "Meera Krishnan",
    role: "student",
    company: "—",
    created: "Jan 4",
  },
  {
    id: "u6",
    email: "admin@platform.com",
    name: "Platform Owner",
    role: "super_admin",
    company: "Platform",
    created: "Seed",
  },
];

const ROLE_BADGE: Record<Role, { color: "violet" | "sky" | "amber" | "emerald" | "rose" | "slate"; label: string }> = {
  candidate: { color: "amber", label: "candidate" },
  company_admin: { color: "sky", label: "company_admin" },
  student: { color: "violet", label: "student" },
  super_admin: { color: "emerald", label: "super_admin" },
};

export function UserManagement() {
  const { set } = useNav();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
  const [pendingSuspend, setPendingSuspend] = useState<UserRow | null>(null);
  const [resetPwFor, setResetPwFor] = useState<UserRow | null>(null);

  // Mock debounce — 300ms after typing stops
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.company.toLowerCase().includes(q),
    );
  }, [debounced]);

  return (
    <AuroraBackground>
      <PageWrap>
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-300" />
              <p className="text-xs uppercase tracking-widest text-violet-300/80">
                Super Admin · Users
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              User <span className="gradient-text">management</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Search 12,450 accounts across every role. Reset passwords, suspend
              admins, or trigger a full GDPR deletion across PostgreSQL,
              MongoDB, Cloudinary and Redis.
            </p>
          </div>
          <PulseBadge color="violet" className="self-start sm:self-end">
            {USERS.length} shown · 12,450 total
          </PulseBadge>
        </motion.header>

        {/* Debounced search */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlowCard className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by email, name, role or company… (debounced 300ms)"
                  className="h-11 border-white/10 bg-background/40 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-violet-400/50"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                    query !== debounced
                      ? "border-violet-400/40 bg-violet-500/10 text-violet-200"
                      : "border-white/10 bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      query !== debounced
                        ? "animate-ping bg-violet-300"
                        : "bg-emerald-300",
                    )}
                  />
                  {query !== debounced ? "Searching…" : "Synced"}
                </span>
                <span className="hidden sm:inline">
                  {filtered.length} matches
                </span>
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Users table */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-6"
        >
          <GlowCard className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
              <SectionHeading
                align="left"
                eyebrow="Directory"
                title="All users"
                description="Cross-tenant. Every row is a real account."
              />
              <ShieldAlert className="h-5 w-5 text-rose-300/70" />
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-5">Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="pr-5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => {
                    const badge = ROLE_BADGE[u.role];
                    return (
                      <TableRow
                        key={u.id}
                        className="border-white/5 hover:bg-white/[0.03]"
                      >
                        <TableCell className="pl-5 font-mono text-xs">
                          {u.email}
                        </TableCell>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>
                          <PulseBadge color={badge.color}>{badge.label}</PulseBadge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.company}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.created}
                        </TableCell>
                        <TableCell className="pr-5">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-muted-foreground hover:bg-white/5 hover:text-white"
                              onClick={() => set("superadmin-audit")}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-sky-200 hover:bg-sky-500/10"
                              onClick={() => setResetPwFor(u)}
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              <span className="hidden md:inline">Reset PW</span>
                            </Button>
                            {u.role === "company_admin" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs text-amber-200 hover:bg-amber-500/10"
                                onClick={() => setPendingSuspend(u)}
                              >
                                <PauseCircle className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Suspend</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs text-rose-200 hover:bg-rose-500/10"
                                onClick={() => setPendingDelete(u)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        No users match “{debounced}”.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </motion.div>

        {/* Legend */}
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: company admins can be <span className="text-amber-200">suspended</span> (login
          blocked) or <span className="text-sky-200">password-reset</span> (a
          temporary password is emailed). All other roles expose a{" "}
          <span className="text-rose-200">Delete</span> action that fires a
          Celery GDPR job.
        </p>
      </PageWrap>

      {/* Delete confirmation */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent className="border-rose-400/30 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-200">
              <Trash2 className="h-5 w-5" />
              Permanently delete {pendingDelete?.name}?
            </DialogTitle>
            <DialogDescription className="text-rose-200/80">
              This will permanently delete all user data across all databases
              (PostgreSQL, MongoDB, Cloudinary, Redis). This action cannot be
              undone. Continue?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 rounded-lg border border-rose-400/20 bg-rose-500/5 p-3 text-xs text-rose-200/80">
            <p className="font-mono">{pendingDelete?.email}</p>
            <p className="mt-1 text-muted-foreground">
              A Celery GDPR deletion job will be queued. Estimated duration: 90 seconds.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-400 hover:to-pink-400"
              onClick={() => setPendingDelete(null)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend confirmation */}
      <Dialog
        open={!!pendingSuspend}
        onOpenChange={(o) => !o && setPendingSuspend(null)}
      >
        <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-200">
              <UserX className="h-5 w-5" />
              Suspend {pendingSuspend?.name}?
            </DialogTitle>
            <DialogDescription>
              Their login will be blocked immediately. Existing candidate
              sessions continue. Reactivate anytime from this same table.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setPendingSuspend(null)}
            >
              Cancel
            </Button>
            <Button
              className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400"
              onClick={() => setPendingSuspend(null)}
            >
              <PauseCircle className="mr-1.5 h-4 w-4" />
              Suspend admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password confirmation */}
      <Dialog
        open={!!resetPwFor}
        onOpenChange={(o) => !o && setResetPwFor(null)}
      >
        <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sky-200">
              <KeyRound className="h-5 w-5" />
              Reset password for {resetPwFor?.name}?
            </DialogTitle>
            <DialogDescription>
              A new temporary password will be generated and emailed to{" "}
              <span className="font-mono text-sky-200">{resetPwFor?.email}</span>.
              The user will be forced to change it on next login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setResetPwFor(null)}
            >
              Cancel
            </Button>
            <Button
              className="border-0 bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-400 hover:to-cyan-400"
              onClick={() => setResetPwFor(null)}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Email temporary password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuroraBackground>
  );
}
