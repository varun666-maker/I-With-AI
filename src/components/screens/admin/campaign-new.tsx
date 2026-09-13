"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clipboard,
  Code2,
  Copy,
  Eye,
  Link2,
  Mic,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PageWrap,
  PulseBadge,
  revealItem,
  StaggeredReveal,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FlowNav } from "@/components/shared/flow-nav";

type Rounds = { aptitude: boolean; coding: boolean; interview: boolean };

export function CampaignCreate() {
  const { set } = useNav();
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("Backend SDE-1 · Campus Drive 2025");
  const [role, setRole] = useState("Backend Developer");
  const [deadline, setDeadline] = useState("2025-01-30T23:59");
  const [rounds, setRounds] = useState<Rounds>({
    aptitude: true,
    coding: true,
    interview: true,
  });
  const [weights, setWeights] = useState({
    aptitude: 30,
    coding: 30,
    interview: 40,
  });
  const [minAptitude, setMinAptitude] = useState("50");
  const [minCoding, setMinCoding] = useState("2");
  const [strictness, setStrictness] = useState<"relaxed" | "standard" | "strict">(
    "standard",
  );
  const [autoDq, setAutoDq] = useState({
    tab: true,
    phone: true,
    person: false,
  });

  const totalWeight = weights.aptitude + weights.coding + weights.interview;
  const weightInvalid = rounds.aptitude && rounds.coding && rounds.interview
    ? totalWeight !== 100
    : false;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightInvalid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhase("success");
    }, 900);
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

        <AnimatePresence mode="wait">
          {phase === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <PulseBadge color="violet">Step 1 · Configure</PulseBadge>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                    Create a new hiring campaign
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure rounds, weights and proctoring. We&apos;ll
                    generate a public apply link as soon as you save.
                  </p>
                </div>
              </div>

              <form
                onSubmit={submit}
                className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]"
              >
                {/* LEFT — main form */}
                <GlowCard className="p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Campaign Name *
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10"
                        placeholder="Campus Drive 2025 - Backend"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Job Role *
                      </Label>
                      <Input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="h-10"
                        placeholder="Backend Developer"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Deadline *
                      </Label>
                      <Input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Candidates can&apos;t submit past this date.
                      </p>
                    </div>
                  </div>

                  {/* Active rounds */}
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Active Rounds
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <RoundToggle
                        icon={<Brain className="h-4 w-4" />}
                        label="Aptitude"
                        desc="25 MCQs · 30 min"
                        checked={rounds.aptitude}
                        onToggle={() =>
                          setRounds({ ...rounds, aptitude: !rounds.aptitude })
                        }
                      />
                      <RoundToggle
                        icon={<Code2 className="h-4 w-4" />}
                        label="Coding"
                        desc="3 problems · 60 min"
                        checked={rounds.coding}
                        onToggle={() =>
                          setRounds({ ...rounds, coding: !rounds.coding })
                        }
                      />
                      <RoundToggle
                        icon={<Mic className="h-4 w-4" />}
                        label="Interview"
                        desc="Live AI · 20 min"
                        checked={rounds.interview}
                        onToggle={() =>
                          setRounds({ ...rounds, interview: !rounds.interview })
                        }
                      />
                    </div>
                  </div>

                  {/* Score weights */}
                  {(
                    [rounds.aptitude, rounds.coding, rounds.interview].filter(
                      Boolean,
                    ).length > 1
                  ) && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Score Weights
                        </p>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            weightInvalid
                              ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
                              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
                          )}
                        >
                          Σ {totalWeight}%
                        </span>
                      </div>
                      <div className="mt-4 space-y-5">
                        {rounds.aptitude && (
                          <WeightSlider
                            label="Aptitude"
                            icon={<Brain className="h-3.5 w-3.5" />}
                            value={weights.aptitude}
                            onChange={(v) =>
                              setWeights({ ...weights, aptitude: v[0] })
                            }
                          />
                        )}
                        {rounds.coding && (
                          <WeightSlider
                            label="Coding"
                            icon={<Code2 className="h-3.5 w-3.5" />}
                            value={weights.coding}
                            onChange={(v) =>
                              setWeights({ ...weights, coding: v[0] })
                            }
                          />
                        )}
                        {rounds.interview && (
                          <WeightSlider
                            label="Interview"
                            icon={<Mic className="h-3.5 w-3.5" />}
                            value={weights.interview}
                            onChange={(v) =>
                              setWeights({ ...weights, interview: v[0] })
                            }
                          />
                        )}
                      </div>
                      {weightInvalid && (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Weights must sum to 100% before you can create the
                          campaign.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Qualification cutoffs */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Min Aptitude Score to Qualify (%)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={minAptitude}
                        onChange={(e) => setMinAptitude(e.target.value)}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Below this, Coding round stays locked. Leave blank for
                        no cutoff.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Min Coding Questions to Attempt
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={minCoding}
                        onChange={(e) => setMinCoding(e.target.value)}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Fewer attempts lock the Interview round.
                      </p>
                    </div>
                  </div>
                </GlowCard>

                {/* RIGHT — proctoring + summary */}
                <div className="space-y-5">
                  <GlowCard className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Proctoring
                    </p>
                    <div className="mt-3 space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Strictness
                      </Label>
                      <Select
                        value={strictness}
                        onValueChange={(v) =>
                          setStrictness(v as typeof strictness)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relaxed">
                            Relaxed — warnings only
                          </SelectItem>
                          <SelectItem value="standard">
                            Standard — auto-submit on 3rd strike
                          </SelectItem>
                          <SelectItem value="strict">
                            Strict — auto-disqualify on 2nd strike
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Auto-disqualify on
                      </p>
                      <div className="mt-3 space-y-3">
                        <DQToggle
                          label="3+ tab switches"
                          desc="Auto-submit + 20% penalty"
                          checked={autoDq.tab}
                          onToggle={() =>
                            setAutoDq({ ...autoDq, tab: !autoDq.tab })
                          }
                        />
                        <DQToggle
                          label="Phone detected in frame"
                          desc="Capture frame + flag for review"
                          checked={autoDq.phone}
                          onToggle={() =>
                            setAutoDq({ ...autoDq, phone: !autoDq.phone })
                          }
                        />
                        <DQToggle
                          label="Extra person in frame"
                          desc="Capture frame + flag for review"
                          checked={autoDq.person}
                          onToggle={() =>
                            setAutoDq({ ...autoDq, person: !autoDq.person })
                          }
                        />
                      </div>
                    </div>
                  </GlowCard>

                  <GlowCard className="p-6">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-violet-300" />
                      <p className="text-sm font-medium">Live summary</p>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm">
                      <SummaryRow label="Rounds active" value={Object.values(rounds).filter(Boolean).length + " / 3"} />
                      <SummaryRow label="Weight total" value={`${totalWeight}%`} ok={totalWeight === 100} />
                      <SummaryRow label="Proctoring" value={strictness} />
                      <SummaryRow
                        label="Auto-DQ rules"
                        value={Object.values(autoDq).filter(Boolean).length + " enabled"}
                      />
                    </ul>
                    <MagneticButton
                      type="submit"
                      disabled={weightInvalid || loading}
                      onClick={() => {}}
                      className="mt-5 h-11 w-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Campaign &amp; Generate Link
                        </>
                      )}
                    </MagneticButton>
                  </GlowCard>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mx-auto max-w-3xl text-center">
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                  }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_0_40px_-4px_rgba(16,185,129,0.5)]"
                >
                  <Check className="h-9 w-9" strokeWidth={3} />
                </motion.div>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                  Campaign created successfully!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share the public apply link — resumes will appear here
                  automatically as candidates apply.
                </p>
              </div>

              {/* Campaign details */}
              <GlowCard className="mx-auto mt-8 max-w-3xl p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Detail label="Campaign" value={name} />
                  <Detail label="Job role" value={role} />
                  <Detail label="Deadline" value={deadline.replace("T", " · ")} />
                </div>
              </GlowCard>

              {/* Apply link box */}
              <ApplyLinkBox
                url="https://interviewai.com/apply/backend-sde-1-a3f2"
              />

              {/* Actions */}
              <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
                <MagneticButton
                  onClick={() => set("question-manager")}
                  className="h-11 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-white hover:from-violet-400 hover:to-fuchsia-400"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Questions
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  onClick={() => set("candidate-leaderboard")}
                  className="h-11 rounded-full border-white/15 bg-white/5 px-6 hover:bg-white/10"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Applicants
                </MagneticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FlowNav flowId="admin" />
      </PageWrap>
    </AuroraBackground>
  );
}

/* ---------- Apply Link Box (with QR) ---------- */

function ApplyLinkBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="relative rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-[1.5px]">
        <div className="rounded-2xl bg-background/95 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-violet-300" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Your Public Apply Link
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <code className="block select-all break-all rounded-lg border border-white/10 bg-white/[0.03] p-3 font-mono text-sm text-violet-200">
                {url}
              </code>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={copy}
                  className="h-9 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400"
                >
                  {copied ? (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
                >
                  <Clipboard className="mr-1.5 h-3.5 w-3.5" />
                  Copy with caption
                </Button>
              </div>
            </div>

            {/* QR placeholder */}
            <div className="shrink-0">
              <div className="rounded-xl border border-white/10 bg-white p-3">
                <QRPlaceholder />
                <p className="mt-2 text-center text-[10px] text-slate-500">
                  Scan to apply
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
            <span className="text-amber-300">💡</span>
            <span>
              Share this link on LinkedIn, Naukri, or send directly to
              candidates. Resumes will appear here automatically as they apply.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QRPlaceholder() {
  // Deterministic pseudo-QR grid — 21x21 modules
  const cells = useMemo(() => {
    const N = 21;
    const grid: boolean[][] = Array.from({ length: N }, () =>
      Array.from({ length: N }, () => false),
    );
    // Finder patterns (top-left, top-right, bottom-left)
    const stamp = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const onOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const onInner =
            r >= 2 && r <= 4 && c >= 2 && c <= 4 && (r === 2 || r === 4 || c === 2 || c === 4 || (r === 3 && c === 3));
          grid[r0 + r][c0 + c] = onOuter || (r >= 2 && r <= 4 && c >= 2 && c <= 4 && r === 3 && c === 3) || onInner;
        }
      }
    };
    stamp(0, 0);
    stamp(0, N - 7);
    stamp(N - 7, 0);
    // Pseudo-random fill
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Skip finder zones
        const inFinder =
          (r < 8 && c < 8) ||
          (r < 8 && c > N - 9) ||
          (r > N - 9 && c < 8);
        if (inFinder) continue;
        grid[r][c] = rand() > 0.55;
      }
    }
    return grid;
  }, []);

  return (
    <div className="grid h-36 w-36 grid-cols-[repeat(21,1fr)] gap-0 overflow-hidden rounded-md">
      {cells.flatMap((row, ri) =>
        row.map((on, ci) => (
          <div
            key={`${ri}-${ci}`}
            className={on ? "bg-slate-900" : "bg-white"}
            style={{ aspectRatio: "1 / 1" }}
          />
        )),
      )}
    </div>
  );
}

/* ---------- small form sub-components ---------- */

function RoundToggle({
  icon,
  label,
  desc,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
        checked
          ? "border-violet-400/40 bg-violet-500/10"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg",
          checked
            ? "bg-violet-500/20 text-violet-200"
            : "bg-white/5 text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Checkbox checked={checked} />
    </button>
  );
}

function WeightSlider({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number[]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </span>
        <span className="text-sm font-semibold text-violet-200">{value}%</span>
      </div>
      <Slider
        value={[value]}
        max={100}
        step={5}
        onValueChange={onChange}
        className="[&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-violet-500 [&_[data-slot=slider-range]]:to-fuchsia-500"
      />
    </div>
  );
}

function DQToggle({
  label,
  desc,
  checked,
  onToggle,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.04]"
    >
      <Checkbox checked={checked} className="mt-0.5" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {checked && (
        <ShieldAlert className="ml-auto h-4 w-4 text-amber-300" />
      )}
    </button>
  );
}

function SummaryRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium",
          ok === undefined && "text-foreground/90",
          ok === true && "text-emerald-300",
          ok === false && "text-rose-300",
        )}
      >
        {value}
      </span>
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground/90">{value}</p>
    </div>
  );
}
