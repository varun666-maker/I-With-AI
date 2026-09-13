"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Save,
  Settings2,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  PageWrap,
  PulseBadge,
  SectionHeading,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FlowNav } from "@/components/shared/flow-nav";

const FEATURE_ROWS = [
  {
    id: "feature-resume",
    label: "Feature: Resume Analyzer",
    desc: "AI resume scoring + ATS check",
    defaultOn: true,
  },
  {
    id: "feature-aptitude",
    label: "Feature: Aptitude Test",
    desc: "5-category question bank",
    defaultOn: true,
  },
  {
    id: "feature-coding",
    label: "Feature: Coding Arena",
    desc: "DSA + SQL with Piston",
    defaultOn: true,
  },
  {
    id: "feature-interview",
    label: "Feature: AI Interview",
    desc: "Live avatar with follow-ups",
    defaultOn: true,
  },
  {
    id: "feature-hiring",
    label: "Feature: Hiring Mode",
    desc: "Campaigns, candidates, bulk upload",
    defaultOn: true,
  },
];

function MaskedKeyField({ prefix }: { prefix: string }) {
  const [editing, setEditing] = useState(false);
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const masked = show
    ? `${prefix}${saved ?? value}${suffix(prefix)}`
    : `${prefix}${"•".repeat(6)}…${"•".repeat(4)}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 truncate rounded-md border border-white/10 bg-background/40 px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
        {masked}
      </code>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:bg-white/5"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide key" : "Reveal key"}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
        {!editing ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-white/10 bg-white/5 text-xs"
            onClick={() => setEditing(true)}
          >
            <KeyRound className="mr-1 h-3.5 w-3.5" />
            Update
          </Button>
        ) : (
          <>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste new key…"
              className="h-8 w-44 border-white/10 bg-background/40 font-mono text-xs"
              type="password"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => {
                setEditing(false);
                setValue("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-xs text-white"
              onClick={() => {
                setSaved(value);
                setValue("");
                setEditing(false);
              }}
            >
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function suffix(prefix: string) {
  return prefix.length > 4 ? "…" : "";
}

export function SystemConfig() {
  const [maintenance, setMaintenance] = useState(false);
  const [proctoring, setProctoring] = useState("standard");
  const [emailProvider, setEmailProvider] = useState("resend");
  const [fromEmail, setFromEmail] = useState("noreply@yourplatform.com");
  const [features, setFeatures] = useState<Record<string, boolean>>(
    Object.fromEntries(FEATURE_ROWS.map((f) => [f.id, f.defaultOn])),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const onToggleFeature = (id: string, on: boolean) =>
    setFeatures((s) => ({ ...s, [id]: on }));

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
              <Settings2 className="h-4 w-4 text-violet-300" />
              <p className="text-xs uppercase tracking-widest text-violet-300/80">
                Super Admin · System Config
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Platform <span className="gradient-text">configuration</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              One console for every platform-wide switch. Maintenance mode,
              proctoring strictness, email provider, masked API keys and
              feature toggles — all here.
            </p>
          </div>
          {maintenance ? (
            <PulseBadge color="rose" className="self-start sm:self-end">
              Maintenance ON
            </PulseBadge>
          ) : (
            <PulseBadge color="emerald" className="self-start sm:self-end">
              All systems live
            </PulseBadge>
          )}
        </motion.header>

        {/* Core settings table */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlowCard className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
              <SectionHeading
                align="left"
                eyebrow="Core settings"
                title="Platform-wide configuration"
                description="Affects every tenant on the platform."
              />
              <Sparkles className="h-5 w-5 text-violet-300/60" />
            </div>
            <div className="overflow-x-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-5">Setting</TableHead>
                    <TableHead>Current value</TableHead>
                    <TableHead className="pr-5">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Maintenance Mode */}
                  <TableRow className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-amber-300" />
                        <div>
                          <p className="font-medium">Maintenance Mode</p>
                          <p className="text-[11px] text-muted-foreground">
                            Blocks all non-super-admin logins
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {maintenance ? (
                        <PulseBadge color="rose">ON</PulseBadge>
                      ) : (
                        <PulseBadge color="slate">OFF</PulseBadge>
                      )}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={maintenance}
                          onCheckedChange={setMaintenance}
                          aria-label="Toggle maintenance mode"
                        />
                        <span className="text-xs text-muted-foreground">
                          {maintenance ? "On" : "Off"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Default Proctoring Strictness */}
                  <TableRow className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="pl-5">
                      <div>
                        <p className="font-medium">Default Proctoring Strictness</p>
                        <p className="text-[11px] text-muted-foreground">
                          Per-campaign override possible
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PulseBadge color="violet" className="capitalize">
                        {proctoring}
                      </PulseBadge>
                    </TableCell>
                    <TableCell className="pr-5">
                      <Select value={proctoring} onValueChange={setProctoring}>
                        <SelectTrigger className="w-40 border-white/10 bg-background/40 text-sm">
                          <SelectValue placeholder="Strictness" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-card/95">
                          <SelectItem value="lenient">Lenient</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="strict">Strict</SelectItem>
                          <SelectItem value="paranoid">Paranoid</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  {/* Email Provider */}
                  <TableRow className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="pl-5">
                      <div>
                        <p className="font-medium">Email Provider</p>
                        <p className="text-[11px] text-muted-foreground">
                          Used for invites, OTPs and reports
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PulseBadge color="sky" className="uppercase">
                        {emailProvider}
                      </PulseBadge>
                    </TableCell>
                    <TableCell className="pr-5">
                      <Select value={emailProvider} onValueChange={setEmailProvider}>
                        <SelectTrigger className="w-40 border-white/10 bg-background/40 text-sm">
                          <SelectValue placeholder="Provider" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-card/95">
                          <SelectItem value="resend">Resend</SelectItem>
                          <SelectItem value="ses">AWS SES</SelectItem>
                          <SelectItem value="postmark">Postmark</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  {/* Resend API Key */}
                  <TableRow className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="pl-5">
                      <div>
                        <p className="font-medium">Resend API Key</p>
                        <p className="text-[11px] text-muted-foreground">
                          Masked. Update reveals an input.
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MaskedKeyField prefix="rsk_" />
                    </TableCell>
                    <TableCell className="pr-5 text-xs text-muted-foreground">
                      Stored encrypted at rest
                    </TableCell>
                  </TableRow>

                  {/* From Email */}
                  <TableRow className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="pl-5">
                      <div>
                        <p className="font-medium">From Email</p>
                        <p className="text-[11px] text-muted-foreground">
                          Sender address for all outbound mail
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="h-9 w-56 border-white/10 bg-background/40 font-mono text-xs"
                      />
                    </TableCell>
                    <TableCell className="pr-5 text-xs text-muted-foreground">
                      Editable inline
                    </TableCell>
                  </TableRow>

                  {/* Gemini API Key */}
                  <TableRow className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="pl-5">
                      <div>
                        <p className="font-medium">Gemini API Key</p>
                        <p className="text-[11px] text-muted-foreground">
                          Powers resume, interview, code & report AI
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MaskedKeyField prefix="AIza" />
                    </TableCell>
                    <TableCell className="pr-5 text-xs text-muted-foreground">
                      15 RPM quota enforced
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </motion.div>

        {/* Feature toggles */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-6"
        >
          <GlowCard className="p-6">
            <SectionHeading
              align="left"
              eyebrow="Feature flags"
              title="Toggle any product surface"
              description="When a feature is OFF, its nav card and routes disappear for non-super-admins. Existing data is preserved."
            />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_ROWS.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border bg-white/[0.02] px-4 py-3 transition-colors",
                    features[f.id]
                      ? "border-emerald-400/30"
                      : "border-white/5",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                  </div>
                  <Switch
                    checked={features[f.id]}
                    onCheckedChange={(on) => onToggleFeature(f.id, on)}
                    aria-label={f.label}
                  />
                </div>
              ))}
            </div>
          </GlowCard>
        </motion.div>

        {/* Save bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
            <p>
              Changes apply instantly across all tenants. Toggling Hiring Mode
              off will hide every company & campaign route — but in-flight
              candidate sessions continue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && (
              <span className="text-xs text-emerald-300">
                ✅ Saved at {savedAt}
              </span>
            )}
            <Button
              className="border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400"
              onClick={() => {
                const now = new Date();
                setSavedAt(
                  `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
                );
              }}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save changes
            </Button>
          </div>
        </motion.div>

        <FlowNav flowId="superadmin" />
      </PageWrap>
    </AuroraBackground>
  );
}
