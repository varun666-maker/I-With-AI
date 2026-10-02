"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Bot,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clipboard,
  Code2,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Lock,
  Mic,
  MonitorSmartphone,
  Pencil,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
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

type Rounds = { aptitude: boolean; coding: boolean; interview: boolean };

type InterviewType =
  | "full"
  | "role-specific"
  | "technical"
  | "behavioral"
  | "system-design"
  | "quick-screen";

const INTERVIEW_TYPES: {
  id: InterviewType;
  label: string;
  desc: string;
  duration: string;
  questions: string;
}[] = [
  {
    id: "full",
    label: "Full Interview",
    desc: "Technical + behavioral + role-specific. Most thorough.",
    duration: "30 min",
    questions: "12 questions",
  },
  {
    id: "role-specific",
    label: "Role Specific",
    desc: "Questions tailored to the job role's must-have skills.",
    duration: "25 min",
    questions: "10 questions",
  },
  {
    id: "technical",
    label: "Technical",
    desc: "Deep-dive on DSA, system design, and coding concepts.",
    duration: "20 min",
    questions: "8 questions",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    desc: "Soft skills, culture fit, and past-experience probes.",
    duration: "15 min",
    questions: "6 questions",
  },
  {
    id: "system-design",
    label: "System Design",
    desc: "Architecture + scalability for senior engineering roles.",
    duration: "30 min",
    questions: "4 questions",
  },
  {
    id: "quick-screen",
    label: "Quick Screen",
    desc: "Short filter round for early-stage high-volume pipelines.",
    duration: "10 min",
    questions: "5 questions",
  },
];

export function CampaignCreate() {
  const { set } = useNav();
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  // Wizard step state — 1-based index into activeSteps.
  const [step, setStep] = useState(1);

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState("Backend SDE-1 · Campus Drive 2025");
  const [role, setRole] = useState("Backend Developer");
  const [experience, setExperience] = useState<"0-1" | "1-3" | "3-5" | "5+">("0-1");
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
  const [minCodingSolved, setMinCodingSolved] = useState("2");
  const [minCodingAttempted, setMinCodingAttempted] = useState("2");
  // Customizable round sizes — admin can set how many questions/problems
  // each round should have. Not fixed at 25 aptitude / 3 coding anymore.
  const [aptitudeCount, setAptitudeCount] = useState("25");
  const [codingCount, setCodingCount] = useState("3");
  const [interviewType, setInterviewType] = useState<InterviewType>("full");

  // ── Proctoring state ──────────────────────────────────────────────────────
  const [strictness, setStrictness] = useState<"relaxed" | "standard" | "strict">(
    "standard",
  );
  const [autoDq, setAutoDq] = useState({
    tab: true,
    phone: true,
    person: false,
    copyPaste: true,
    rightClick: true,
    devtools: true,
  });
  // D4: Global "Disqualify on 3rd strike" toggle. When checked, the 3rd-strike
  // auto-submit ALSO disqualifies (overall = 0) instead of submitting with score.
  const [disqualifyOn3rdStrike, setDisqualifyOn3rdStrike] = useState(false);
  const [antiAi, setAntiAi] = useState({
    voiceDetect: true,
    eyeTracking: true,
    screenShareDetect: true,
    secondDeviceDetect: true,
    browserExtensionScan: true,
    keystrokeDynamics: true,
    clipboardLock: true,
    aiResponseLatency: true,
  });

  const totalWeight = weights.aptitude + weights.coding + weights.interview;
  const weightInvalid = rounds.aptitude && rounds.coding && rounds.interview
    ? totalWeight !== 100
    : false;

  const activeDqCount = Object.values(autoDq).filter(Boolean).length;
  const activeAntiAiCount = Object.values(antiAi).filter(Boolean).length;

  // ── Wizard steps (dynamic based on selected rounds) ───────────────────────
  const activeSteps = useMemo(() => {
    const multipleRounds = [rounds.aptitude, rounds.coding, rounds.interview].filter(Boolean).length > 1;
    const hasAptOrCoding = rounds.aptitude || rounds.coding;
    return [
      { n: 1, label: "Campaign Details", show: true },
      { n: 2, label: "Rounds & Config", show: true },
      { n: 3, label: "Score Weights", show: multipleRounds },
      { n: 4, label: "Qualification Cutoffs", show: hasAptOrCoding },
      { n: 5, label: "Interview Type", show: rounds.interview },
      { n: 6, label: "Proctoring & Integrity", show: true },
      { n: 7, label: "Review & Create", show: true },
    ].filter((s) => s.show);
  }, [rounds.aptitude, rounds.coding, rounds.interview]);

  const currentStep = activeSteps[step - 1];
  const isLastStep = step === activeSteps.length;
  const isReviewStep = currentStep?.label === "Review & Create";

  // Clamp step if rounds change and current step disappears.
  useEffect(() => {
    if (step > activeSteps.length) {
      queueMicrotask(() => setStep(activeSteps.length));
    }
  }, [activeSteps.length, step]);

  const goNext = () => setStep((s) => Math.min(s + 1, activeSteps.length));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));
  const goToStep = (n: number) => setStep(n);

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (weightInvalid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhase("success");
    }, 900);
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

        <AnimatePresence mode="wait">
          {phase === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* ── Header ── */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                    Step {step} of {activeSteps.length}
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                    Create a new hiring campaign
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {currentStep?.label} — follow the steps to configure your campaign.
                  </p>
                </div>
              </div>

              {/* ── Step indicator ── */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {activeSteps.map((s, i) => {
                  const stepNum = i + 1;
                  const isActive = stepNum === step;
                  const isDone = stepNum < step;
                  return (
                    <div key={s.label} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => goToStep(stepNum)}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          isActive
                            ? "border-violet-500 bg-violet-500 text-white"
                            : isDone
                              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-black/10 bg-background text-muted-foreground hover:bg-muted/30 dark:border-white/10",
                        )}
                      >
                        <span className={cn(
                          "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                          isActive ? "bg-white/20" : isDone ? "bg-emerald-500/20" : "bg-black/5 dark:bg-white/10",
                        )}>
                          {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : stepNum}
                        </span>
                        {s.label}
                      </button>
                      {i < activeSteps.length - 1 && (
                        <div className="h-px w-4 bg-black/10 dark:bg-white/10" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Step content ── */}
              <form onSubmit={submit} className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep?.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* ═══ STEP 1: Campaign Details ═══ */}
                    {currentStep?.n === 1 && (
                      <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                          <h3 className="text-sm font-medium">Campaign details</h3>
                        </div>
                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Campaign Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" placeholder="Campus Drive 2025 - Backend" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Job Role *</Label>
                            <Input value={role} onChange={(e) => setRole(e.target.value)} className="h-10" placeholder="Backend Developer" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Experience Band</Label>
                            <Select value={experience} onValueChange={(v) => setExperience(v as typeof experience)}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0-1">0-1 years (Fresher)</SelectItem>
                                <SelectItem value="1-3">1-3 years (Junior)</SelectItem>
                                <SelectItem value="3-5">3-5 years (Mid)</SelectItem>
                                <SelectItem value="5+">5+ years (Senior)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Deadline *</Label>
                            <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-10" />
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Candidates can&apos;t submit past this deadline. All times are in IST (11:59 PM IST).
                        </p>
                      </div>
                    )}

                    {/* ═══ STEP 2: Rounds & Configuration ═══ */}
                    {currentStep?.n === 2 && (
                      <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Rounds</p>
                        <p className="mt-1 text-xs text-muted-foreground">Toggle the rounds you want included in this campaign.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <RoundToggle
                            icon={<Brain className="h-4 w-4" />}
                            label="Aptitude"
                            desc={`${aptitudeCount} MCQs · 30 min`}
                            checked={rounds.aptitude}
                            onToggle={() => setRounds({ ...rounds, aptitude: !rounds.aptitude })}
                          />
                          <RoundToggle
                            icon={<Code2 className="h-4 w-4" />}
                            label="Coding"
                            desc={`${codingCount} problems · 60 min`}
                            checked={rounds.coding}
                            onToggle={() => setRounds({ ...rounds, coding: !rounds.coding })}
                          />
                          <RoundToggle
                            icon={<Mic className="h-4 w-4" />}
                            label="Interview"
                            desc="Live AI · variable"
                            checked={rounds.interview}
                            onToggle={() => setRounds({ ...rounds, interview: !rounds.interview })}
                          />
                        </div>
                        {(rounds.aptitude || rounds.coding) && (
                          <div className="mt-6 border-t border-black/5 pt-5 dark:border-white/5">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Round Configuration</p>
                            <p className="mt-1 text-xs text-muted-foreground">Set how many questions each round should have. Not fixed — customize per campaign.</p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              {rounds.aptitude && (
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground">Aptitude Question Count</Label>
                                  <Input type="number" min={5} max={100} value={aptitudeCount} onChange={(e) => setAptitudeCount(e.target.value)} className="h-10" />
                                  <p className="text-xs text-muted-foreground">Total MCQs in the aptitude round (5–100).</p>
                                </div>
                              )}
                              {rounds.coding && (
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground">Coding Problem Count</Label>
                                  <Input type="number" min={1} max={10} value={codingCount} onChange={(e) => setCodingCount(e.target.value)} className="h-10" />
                                  <p className="text-xs text-muted-foreground">Total problems in the coding round (1–10).</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═══ STEP 3: Score Weights ═══ */}
                    {currentStep?.n === 3 && (
                      <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Score Weights</p>
                          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", weightInvalid ? "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>
                            Σ {totalWeight}%
                          </span>
                        </div>
                        <div className="mt-4 space-y-5">
                          {rounds.aptitude && <WeightSlider label="Aptitude" icon={<Brain className="h-3.5 w-3.5" />} value={weights.aptitude} onChange={(v) => setWeights({ ...weights, aptitude: v[0] })} />}
                          {rounds.coding && <WeightSlider label="Coding" icon={<Code2 className="h-3.5 w-3.5" />} value={weights.coding} onChange={(v) => setWeights({ ...weights, coding: v[0] })} />}
                          {rounds.interview && <WeightSlider label="Interview" icon={<Mic className="h-3.5 w-3.5" />} value={weights.interview} onChange={(v) => setWeights({ ...weights, interview: v[0] })} />}
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <Button type="button" variant="outline" size="sm"
                            onClick={() => {
                              const activeCount = [rounds.aptitude, rounds.coding, rounds.interview].filter(Boolean).length;
                              if (activeCount === 0) return;
                              const each = Math.floor(100 / activeCount);
                              const remainder = 100 - each * activeCount;
                              setWeights({
                                aptitude: rounds.aptitude ? each : 0,
                                coding: rounds.coding ? each : 0,
                                interview: rounds.interview ? each + remainder : 0,
                              });
                            }}
                            className="h-8 rounded-full text-xs"
                          >
                            Auto-balance
                          </Button>
                          <span className="text-xs text-muted-foreground">Redistribute weights evenly across active rounds to sum to 100%.</span>
                        </div>
                        {weightInvalid && (
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-300">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Weights must sum to 100% before you can create the campaign.
                          </p>
                        )}
                      </div>
                    )}

                    {/* ═══ STEP 4: Qualification Cutoffs ═══ */}
                    {currentStep?.n === 4 && (
                      <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Qualification Cutoffs</p>
                        <p className="mt-1 text-xs text-muted-foreground">Candidates who fall below these thresholds cannot proceed to the next round.</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {rounds.aptitude && (
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Min Aptitude Score to Qualify (%)</Label>
                              <Input type="number" min={0} max={100} value={minAptitude} onChange={(e) => setMinAptitude(e.target.value)} className="h-10" />
                              <p className="text-xs text-muted-foreground">Below this, the Coding round stays locked.</p>
                            </div>
                          )}
                          {rounds.coding && (
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Min Coding Questions to Solve Correctly</Label>
                              <Input type="number" min={0} max={Number(codingCount) || 3} value={minCodingSolved} onChange={(e) => setMinCodingSolved(e.target.value)} className="h-10" />
                              <p className="text-xs text-muted-foreground">Candidate must solve at least this many correctly. Attempts alone do not qualify.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ═══ STEP 5: Interview Type ═══ */}
                    {currentStep?.n === 5 && (
                      <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Interview Type</p>
                            <p className="mt-1 text-xs text-muted-foreground">Choose the AI interview format. Each type pulls questions from a different bank.</p>
                          </div>
                          <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {INTERVIEW_TYPES.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setInterviewType(t.id)}
                              className={cn(
                                "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                                interviewType === t.id ? "border-violet-400/60 bg-violet-500/10" : "border-black/10 bg-background hover:border-violet-400/40 hover:bg-muted/30 dark:border-white/10",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{t.label}</p>
                                {interviewType === t.id && <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{t.desc}</p>
                              <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                                <span className="rounded-full border border-black/10 bg-muted/40 px-1.5 py-0.5 dark:border-white/10">{t.duration}</span>
                                <span className="rounded-full border border-black/10 bg-muted/40 px-1.5 py-0.5 dark:border-white/10">{t.questions}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ═══ STEP 6: Proctoring & Integrity ═══ */}
                    {currentStep?.n === 6 && (
                      <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Proctoring &amp; Integrity</p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                            <ShieldAlert className="h-3 w-3" />
                            {activeDqCount + activeAntiAiCount} rules active
                          </span>
                        </div>
                        <div className="mt-4 space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Strictness</Label>
                          <Select value={strictness} onValueChange={(v) => setStrictness(v as typeof strictness)}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="relaxed">Relaxed · Warnings only</SelectItem>
                              <SelectItem value="standard">Standard · Auto-submit on 3rd strike</SelectItem>
                              <SelectItem value="strict">Strict · Auto-submit + disqualify on 3rd strike</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-rose-400/20 bg-rose-500/[0.04] p-3">
                          <div>
                            <p className="text-sm font-medium text-rose-700 dark:text-rose-200">Disqualify on 3rd strike</p>
                            <p className="text-xs text-muted-foreground">When checked, the 3rd-strike auto-submit also disqualifies (overall = 0) instead of submitting with score.</p>
                          </div>
                          <Checkbox checked={disqualifyOn3rdStrike} onCheckedChange={(v) => setDisqualifyOn3rdStrike(!!v)} />
                        </div>
                        <div className="mt-5">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Auto-disqualify on</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <DQToggle icon={<MonitorSmartphone className="h-3.5 w-3.5" />} label="3+ tab switches" desc="Auto-submit + 20% penalty" checked={autoDq.tab} onToggle={() => setAutoDq({ ...autoDq, tab: !autoDq.tab })} />
                            <DQToggle icon={<Smartphone className="h-3.5 w-3.5" />} label="Phone detected in frame" desc="Capture frame + flag for review" checked={autoDq.phone} onToggle={() => setAutoDq({ ...autoDq, phone: !autoDq.phone })} />
                            <DQToggle icon={<Users className="h-3.5 w-3.5" />} label="Extra person in frame" desc="Capture frame + flag for review" checked={autoDq.person} onToggle={() => setAutoDq({ ...autoDq, person: !autoDq.person })} />
                            <DQToggle icon={<Clipboard className="h-3.5 w-3.5" />} label="Copy / paste detected" desc="Block clipboard + log attempt" checked={autoDq.copyPaste} onToggle={() => setAutoDq({ ...autoDq, copyPaste: !autoDq.copyPaste })} />
                            <DQToggle icon={<EyeOff className="h-3.5 w-3.5" />} label="Right-click / context menu" desc="Block + log attempt" checked={autoDq.rightClick} onToggle={() => setAutoDq({ ...autoDq, rightClick: !autoDq.rightClick })} />
                            <DQToggle icon={<Code2 className="h-3.5 w-3.5" />} label="DevTools open" desc="Auto-DQ + flag for manual review" checked={autoDq.devtools} onToggle={() => setAutoDq({ ...autoDq, devtools: !autoDq.devtools })} />
                          </div>
                        </div>
                        <div className="mt-6 rounded-lg border border-rose-400/30 bg-rose-500/[0.04] p-4">
                          <div className="flex items-start gap-2">
                            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-300" />
                            <div>
                              <p className="text-sm font-medium text-rose-700 dark:text-rose-200">Anti-AI / Anti-Parakeet Detection</p>
                              <p className="mt-0.5 text-xs text-rose-700/80 dark:text-rose-200/70">Detects candidates using AI assistants (Parakeet, ChatGPT, Whisper, etc.) for live answer generation. All detections are flagged for human review.</p>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <DQToggle icon={<Volume2 className="h-3.5 w-3.5" />} label="Secondary voice detection" desc="Detects whispered AI prompts via mic" checked={antiAi.voiceDetect} onToggle={() => setAntiAi({ ...antiAi, voiceDetect: !antiAi.voiceDetect })} tone="rose" />
                            <DQToggle icon={<Eye className="h-3.5 w-3.5" />} label="Gaze tracking" desc="Off-screen glances pattern-matched to AI use" checked={antiAi.eyeTracking} onToggle={() => setAntiAi({ ...antiAi, eyeTracking: !antiAi.eyeTracking })} tone="rose" />
                            <DQToggle icon={<MonitorSmartphone className="h-3.5 w-3.5" />} label="Screen-share / second monitor" desc="Detects mirroring to a 2nd device" checked={antiAi.screenShareDetect} onToggle={() => setAntiAi({ ...antiAi, screenShareDetect: !antiAi.screenShareDetect })} tone="rose" />
                            <DQToggle icon={<Smartphone className="h-3.5 w-3.5" />} label="Second device detection" desc="Audio fingerprint for nearby phones" checked={antiAi.secondDeviceDetect} onToggle={() => setAntiAi({ ...antiAi, secondDeviceDetect: !antiAi.secondDeviceDetect })} tone="rose" />
                            <DQToggle icon={<Lock className="h-3.5 w-3.5" />} label="Browser extension scan" desc="Block known AI-helper extensions (Parakeet)" checked={antiAi.browserExtensionScan} onToggle={() => setAntiAi({ ...antiAi, browserExtensionScan: !antiAi.browserExtensionScan })} tone="rose" />
                            <DQToggle icon={<Code2 className="h-3.5 w-3.5" />} label="Keystroke dynamics" desc="Flag paste-from-AI typing patterns" checked={antiAi.keystrokeDynamics} onToggle={() => setAntiAi({ ...antiAi, keystrokeDynamics: !antiAi.keystrokeDynamics })} tone="rose" />
                            <DQToggle icon={<Clipboard className="h-3.5 w-3.5" />} label="Clipboard lock" desc="Disable clipboard + log every paste attempt" checked={antiAi.clipboardLock} onToggle={() => setAntiAi({ ...antiAi, clipboardLock: !antiAi.clipboardLock })} tone="rose" />
                            <DQToggle icon={<Sparkles className="h-3.5 w-3.5" />} label="AI-response latency analysis" desc="Flag answers with LLM-typical cadence" checked={antiAi.aiResponseLatency} onToggle={() => setAntiAi({ ...antiAi, aiResponseLatency: !antiAi.aiResponseLatency })} tone="rose" />
                          </div>
                          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-500/5 p-3 text-xs text-rose-700/90 dark:text-rose-100/80">
                            <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>When AI-use is detected, a high-res webcam snapshot + audio recording is captured and queued for human review. The candidate sees no warning until the admin confirms.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ═══ STEP 7: Review & Create ═══ */}
                    {isReviewStep && (
                      <div className="space-y-4">
                        {/* Review: Campaign Details */}
                        <ReviewCard
                          stepLabel="Campaign Details"
                          onEdit={() => goToStep(1)}
                          rows={[
                            { label: "Campaign Name", value: name },
                            { label: "Job Role", value: role },
                            { label: "Experience", value: experience === "0-1" ? "0-1 years (Fresher)" : experience === "1-3" ? "1-3 years (Junior)" : experience === "3-5" ? "3-5 years (Mid)" : "5+ years (Senior)" },
                            { label: "Deadline", value: `${deadline.replace("T", " · ")} IST` },
                          ]}
                        />
                        {/* Review: Rounds & Config */}
                        <ReviewCard
                          stepLabel="Rounds & Config"
                          onEdit={() => goToStep(activeSteps.findIndex((s) => s.n === 2) + 1)}
                          rows={[
                            { label: "Aptitude", value: rounds.aptitude ? `${aptitudeCount} MCQs · 30 min` : "Not included" },
                            { label: "Coding", value: rounds.coding ? `${codingCount} problems · 60 min` : "Not included" },
                            { label: "Interview", value: rounds.interview ? "Live AI · variable" : "Not included" },
                          ]}
                        />
                        {/* Review: Score Weights (if applicable) */}
                        {activeSteps.some((s) => s.n === 3) && (
                          <ReviewCard
                            stepLabel="Score Weights"
                            onEdit={() => goToStep(activeSteps.findIndex((s) => s.n === 3) + 1)}
                            rows={[
                              ...(rounds.aptitude ? [{ label: "Aptitude weight", value: `${weights.aptitude}%` }] : []),
                              ...(rounds.coding ? [{ label: "Coding weight", value: `${weights.coding}%` }] : []),
                              ...(rounds.interview ? [{ label: "Interview weight", value: `${weights.interview}%` }] : []),
                              { label: "Total", value: `${totalWeight}%`, ok: totalWeight === 100 },
                            ]}
                          />
                        )}
                        {/* Review: Qualification Cutoffs (if applicable) */}
                        {activeSteps.some((s) => s.n === 4) && (
                          <ReviewCard
                            stepLabel="Qualification Cutoffs"
                            onEdit={() => goToStep(activeSteps.findIndex((s) => s.n === 4) + 1)}
                            rows={[
                              ...(rounds.aptitude ? [{ label: "Min Aptitude Score", value: `${minAptitude}%` }] : []),
                              ...(rounds.coding ? [{ label: "Min Coding Solved", value: `${minCodingSolved} of ${codingCount}` }] : []),
                            ]}
                          />
                        )}
                        {/* Review: Interview Type (if applicable) */}
                        {activeSteps.some((s) => s.n === 5) && (
                          <ReviewCard
                            stepLabel="Interview Type"
                            onEdit={() => goToStep(activeSteps.findIndex((s) => s.n === 5) + 1)}
                            rows={[
                              { label: "Type", value: INTERVIEW_TYPES.find((t) => t.id === interviewType)?.label ?? "—" },
                              { label: "Duration", value: INTERVIEW_TYPES.find((t) => t.id === interviewType)?.duration ?? "—" },
                              { label: "Questions", value: INTERVIEW_TYPES.find((t) => t.id === interviewType)?.questions ?? "—" },
                            ]}
                          />
                        )}
                        {/* Review: Proctoring & Integrity */}
                        <ReviewCard
                          stepLabel="Proctoring & Integrity"
                          onEdit={() => goToStep(activeSteps.findIndex((s) => s.n === 6) + 1)}
                          rows={[
                            { label: "Strictness", value: strictness },
                            { label: "Disqualify on 3rd strike", value: disqualifyOn3rdStrike ? "Yes" : "No" },
                            { label: "Auto-DQ rules", value: `${activeDqCount} enabled` },
                            { label: "Anti-AI rules", value: `${activeAntiAiCount} enabled` },
                          ]}
                        />

                        {/* Create button */}
                        <div className="rounded-lg border border-violet-400/30 bg-violet-500/5 p-6">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                            <p className="text-sm font-medium">Ready to create</p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Review the details above. Click any section&apos;s Edit button to go back and make changes.
                            When you&apos;re ready, click Create Campaign to generate the public apply link.
                          </p>
                          {weightInvalid && (
                            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-300">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Weights must sum to 100% before you can create the campaign.
                            </p>
                          )}
                          <Button
                            type="submit"
                            disabled={weightInvalid || loading}
                            className="mt-4 h-11 w-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Campaign &amp; Generate Link
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* ── Navigation buttons (hidden on review step — it has its own Create button) ── */}
                {!isReviewStep && (
                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      disabled={step === 1}
                      className="rounded-full disabled:opacity-50"
                    >
                      <ChevronLeft className="mr-1.5 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={goNext}
                      className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                    >
                      Next
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                )}
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
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-sm"
                >
                  <Check className="h-9 w-9" strokeWidth={3} />
                </motion.div>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                  Campaign created successfully.
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share the public apply link. Resumes will appear here
                  automatically as candidates apply.
                </p>
              </div>

              {/* Campaign details */}
              <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Detail label="Campaign" value={name} />
                  <Detail label="Job role" value={role} />
                  <Detail
                    label="Deadline"
                    value={`${deadline.replace("T", " · ")} IST`}
                  />
                </div>
                <div className="mt-4 grid gap-4 border-t border-black/5 pt-4 sm:grid-cols-3 dark:border-white/5">
                  <Detail
                    label="Interview"
                    value={
                      INTERVIEW_TYPES.find((t) => t.id === interviewType)
                        ?.label ?? "—"
                    }
                  />
                  <Detail
                    label="Aptitude questions"
                    value={aptitudeCount}
                  />
                  <Detail
                    label="Coding problems"
                    value={codingCount}
                  />
                  <Detail
                    label="Min coding attempted"
                    value={`${minCodingAttempted} of ${codingCount}`}
                  />
                  <Detail
                    label="Min coding solved"
                    value={`${minCodingSolved} of ${codingCount}`}
                  />
                  <Detail label="Strictness" value={strictness} />
                </div>
              </div>

              {/* Apply link box */}
              <ApplyLinkBox url="https://interviewai.com/apply/backend-sde-1-a3f2" />

              {/* Actions */}
              <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => set("question-manager")}
                  className="h-11 rounded-full bg-violet-500 px-6 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Questions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => set("candidate-leaderboard")}
                  className="h-11 rounded-full px-6"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Applicants
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </PageWrap>
    </div>
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
      <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Your Public Apply Link
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <code className="block select-all break-all rounded-lg border border-black/10 bg-muted/30 p-3 font-mono text-sm text-violet-700 dark:border-white/10 dark:text-violet-300">
              {url}
            </code>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={copy}
                className="h-9 rounded-full bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
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
                className="h-9 rounded-full"
              >
                <Clipboard className="mr-1.5 h-3.5 w-3.5" />
                Copy with caption
              </Button>
            </div>
          </div>

          {/* QR placeholder */}
          <div className="shrink-0">
            <div className="rounded-lg border border-black/10 bg-white p-3 dark:border-white/10">
              <QRPlaceholder />
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Scan to apply
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-black/5 bg-muted/30 p-3 text-xs text-muted-foreground dark:border-white/5">
          <QrCode className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-300" />
          <span>
            Share this link on LinkedIn, Naukri, or send directly to
            candidates. Resumes will appear here automatically as they apply.
          </span>
        </div>
      </div>
    </div>
  );
}

function QRPlaceholder() {
  // Deterministic pseudo-QR grid. 21x21 modules
  const cells = useMemo(() => {
    const N = 21;
    const grid: boolean[][] = Array.from({ length: N }, () =>
      Array.from({ length: N }, () => false),
    );
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
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
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
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors",
        checked
          ? "border-violet-400/40 bg-violet-500/10"
          : "border-black/10 bg-background hover:bg-muted/30 dark:border-white/10",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg",
          checked
            ? "bg-violet-500/20 text-violet-700 dark:text-violet-200"
            : "bg-muted/40 text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {/* Visual checkmark indicator instead of Checkbox (avoids button-in-button hydration error) */}
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border-2 transition-colors",
          checked
            ? "border-violet-500 bg-violet-500 text-white"
            : "border-black/20 dark:border-white/20",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </div>
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
        <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">{value}%</span>
      </div>
      <Slider
        value={[value]}
        max={100}
        step={5}
        onValueChange={onChange}
        className="[&_[data-slot=slider-range]]:bg-violet-500"
      />
    </div>
  );
}

function DQToggle({
  icon,
  label,
  desc,
  checked,
  onToggle,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
  tone?: "default" | "rose";
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        tone === "rose"
          ? "border-rose-400/20 bg-rose-500/[0.04] hover:bg-rose-500/10"
          : "border-black/5 bg-muted/30 hover:bg-muted/50 dark:border-white/5",
        checked && tone === "rose" && "border-rose-400/50 bg-rose-500/10",
        checked && tone !== "rose" && "border-violet-400/40 bg-violet-500/10",
      )}
    >
      {/* Visual checkmark instead of Checkbox (avoids button-in-button) */}
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border-2 transition-colors",
          checked
            ? tone === "rose"
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-violet-500 bg-violet-500 text-white"
            : "border-black/20 dark:border-white/20",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{icon}</span>
          <p className="text-sm font-medium">{label}</p>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      {checked && tone === "rose" && (
        <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-300" />
      )}
      {checked && tone !== "rose" && (
        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-300" />
      )}
    </div>
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
          "font-medium capitalize",
          ok === undefined && "text-foreground/90",
          ok === true && "text-emerald-600 dark:text-emerald-300",
          ok === false && "text-rose-600 dark:text-rose-300",
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

/* ---------- Review card (used in the Review & Create step) ---------- */

function ReviewCard({
  stepLabel,
  rows,
  onEdit,
}: {
  stepLabel: string;
  rows: { label: string; value: string; ok?: boolean }[];
  onEdit: () => void;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-background p-5 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{stepLabel}</p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-500/15 dark:text-violet-300"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-2 text-sm">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className={cn(
              "font-medium",
              r.ok === true && "text-emerald-600 dark:text-emerald-300",
              r.ok === false && "text-rose-600 dark:text-rose-300",
              r.ok === undefined && "text-foreground/90",
            )}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
