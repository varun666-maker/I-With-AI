"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Download,
  Info,
  Loader2,
  Mic,
  MicOff,
  MonitorPlay,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Square,
  Video,
  X,
  Zap,
} from "lucide-react";
import {
  PageWrap,
  SectionHeading,
  TypingDots,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

type SubScreen = "setup" | "live" | "processing" | "done";

const INTERVIEW_TYPES = [
  { id: "hr", icon: Brain, title: "HR / Behavioral", desc: "Classic HR screen. Tell me about yourself, strengths, weaknesses, motivation.", duration: "20-30 min", qCount: "8-12 Qs", tone: "violet" },
  { id: "tech-general", icon: Code2, title: "Technical - General", desc: "DSA + system design basics. Languages and Big-O analysis.", duration: "30-45 min", qCount: "10-15 Qs", tone: "sky" },
  { id: "tech-role", icon: Briefcase, title: "Technical - Role-Specific", desc: "Deep dive into your stack (e.g. backend: APIs, DB, queues).", duration: "30-45 min", qCount: "10-15 Qs", tone: "emerald" },
  { id: "managerial", icon: ShieldCheck, title: "Managerial", desc: "Project leadership, conflict resolution, stakeholder mgmt.", duration: "25-35 min", qCount: "8-10 Qs", tone: "amber" },
  { id: "company", icon: MonitorPlay, title: "Company-Specific", desc: "Mock for a specific company. Culture-fit and known formats.", duration: "25-35 min", qCount: "8-12 Qs", tone: "fuchsia" },
  { id: "full", icon: Zap, title: "Full End-to-End", desc: "Complete interview loop. HR + technical + behavioral + coding.", duration: "55-75 min", qCount: "25-40 Qs", tone: "rose" },
];

const TONE_MAP: Record<string, string> = {
  violet: "border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  sky: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200",
  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  fuchsia: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
};

const PROCESSING_STEPS = [
  { label: "Transcribing audio", dur: "12s" },
  { label: "Evaluating answers", dur: "18s" },
  { label: "Generating report", dur: "20s" },
  { label: "Calculating scores", dur: "8s" },
];

export function InterviewStudio() {
  const { set } = useNav();
  const [sub, setSub] = useState<SubScreen>("setup");
  const [selectedType, setSelectedType] = useState("hr");
  const [micStatus, setMicStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [camStatus, setCamStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [endOpen, setEndOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap wide>
        <BackToHome />

        {/* Demo controls */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Demo controls:</span>
          {([
            ["setup", "Setup"],
            ["live", "Live"],
            ["processing", "Processing"],
            ["done", "Done"],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setSub(k)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                sub === k
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-100"
                  : "border-black/10 bg-black/[0.02] text-muted-foreground hover:text-foreground dark:border-white/10 dark:bg-white/[0.03]",
              )}
            >
              {l}
            </button>
          ))}
        </div>

        <SectionHeading
          eyebrow="AI Interview"
          title={<>Live <span className="text-violet-500 dark:text-violet-400">AI Interviewer</span></>}
          description="A real-time conversation with a 3D avatar that asks questions, listens, generates follow-ups, and analyses your body language, emotion, and eye contact in real time."
          align="left"
        />

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {sub === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Step 1</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">Choose Interview Type</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Each type generates questions tailored to your resume + profile. You can switch types anytime before the interview starts.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {INTERVIEW_TYPES.map((t) => {
                    const sel = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={cn(
                          "group relative flex h-full flex-col rounded-lg border p-5 text-left transition-colors",
                          sel
                            ? "border-violet-400/40 bg-violet-500/[0.06]"
                            : "border-black/10 bg-card shadow-sm hover:border-black/20 dark:border-white/10 dark:hover:border-white/20",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "grid h-10 w-10 place-items-center rounded-lg ring-1 ring-inset transition-colors",
                            sel ? cn(TONE_MAP[t.tone], "ring-current") : "bg-black/[0.02] text-muted-foreground ring-black/10 dark:bg-white/5 dark:ring-white/10",
                          )}>
                            <t.icon className="h-5 w-5" />
                          </span>
                          {sel && (
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500 text-white">
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <h4 className="mt-4 text-base font-semibold">{t.title}</h4>
                        <p className="mt-1 flex-1 text-xs text-muted-foreground">{t.desc}</p>
                        <div className="mt-4 flex items-center gap-3 text-[11px]">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" /> {t.duration}
                          </span>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Brain className="h-3 w-3" /> {t.qCount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* System check */}
                <div className="mt-6 rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Step 2</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">System Check</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We need your microphone and camera for the live interview. Video is processed locally for emotion detection. Only audio is sent for transcription.
                  </p>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SystemCheckCard
                      icon={Mic}
                      label="Microphone"
                      status={micStatus}
                      onTest={() => setTimeout(() => setMicStatus("ok"), 800)}
                    />
                    <SystemCheckCard
                      icon={Camera}
                      label="Camera"
                      status={camStatus}
                      onTest={() => setTimeout(() => setCamStatus("ok"), 800)}
                    />
                  </div>

                  <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-[11px] text-muted-foreground">
                      <Info className="mr-1 inline h-3 w-3" />
                      Tip: Use a quiet room with frontal lighting for best body-language analysis.
                    </p>
                    <Button
                      onClick={() => setSub("live")}
                      disabled={!(micStatus === "ok" && camStatus === "ok")}
                      className="rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
                    >
                      <Video className="mr-2 h-4 w-4" /> Begin Interview
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {sub === "live" && (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between rounded-lg border border-black/10 bg-card p-3 shadow-sm sm:p-4 dark:border-white/10">
                  <div className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-base font-semibold sm:text-lg",
                    "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
                  )}>
                    <Clock className="h-4 w-4" />
                    08:42
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Progress</p>
                    <p className="font-mono text-sm font-semibold">Q <span className="text-violet-500 dark:text-violet-400">3</span> of 10</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEndOpen(true)}
                    className="rounded-full text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                  >
                    <X className="h-4 w-4" /> End Early
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Left: avatar + analysis */}
                  <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                    <AvatarBlock />
                    <Waveform />
                    <AnalysisIndicators />
                  </div>

                  {/* Right: question + transcript */}
                  <div className="flex h-full flex-col rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Question</p>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 rounded-lg border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-700 dark:text-violet-50"
                    >
                      Tell me about a recent bug you debugged. Walk me through your process. What tools did you use, and how did you isolate the root cause?
                    </motion.div>

                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Live Transcript</p>
                      <div className="mt-2 max-h-64 space-y-2 overflow-y-auto scrollbar-custom pr-1">
                        <ChatBubble role="ai" time="0:12">Great. Let&apos;s dive into a technical scenario. Tell me about a recent bug you debugged.</ChatBubble>
                        <ChatBubble role="user" time="0:24">Sure! Last month we had a memory leak in our FastAPI service. The container kept getting OOM-killed every 4 hours.</ChatBubble>
                        <ChatBubble role="ai" time="0:38">Interesting. What tools did you reach for first?</ChatBubble>
                        <ChatBubble role="user" time="0:52">I started with <code className="font-mono text-violet-700 dark:text-violet-200">tracemalloc</code> to snapshot allocations, then moved to <code className="font-mono text-violet-700 dark:text-violet-200">py-spy</code> for live profiling…</ChatBubble>
                        <div className="flex items-center gap-1.5 text-xs text-violet-500 dark:text-violet-400">
                          <TypingDots /> AI is thinking…
                        </div>
                      </div>
                    </div>

                    {/* Mic controls */}
                    <div className="mt-4 flex items-center gap-3">
                      <MicToggle />
                      <div className="flex-1 rounded-full border border-black/10 bg-black/[0.02] px-3 py-2 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5">
                        Click the mic button to start/stop recording, or just start speaking. Auto-detect handles it.
                      </div>
                    </div>

                    {/* Proctoring footer */}
                    <div className="mt-auto pt-4 text-[11px] text-muted-foreground">
                      <Info className="mr-1 inline h-3 w-3" />
                      Tab switches: <span className="text-foreground">1</span> · Fullscreen exits: <span className="text-foreground">0</span>. Logged for awareness only.
                    </div>
                  </div>
                </div>

                <Dialog open={endOpen} onOpenChange={setEndOpen}>
                  <DialogContent className="border-black/10 bg-card dark:border-white/10">
                    <DialogHeader>
                      <DialogTitle>End interview early?</DialogTitle>
                      <DialogDescription>
                        You won&apos;t be able to resume this interview. Your partial transcript will still be processed into a report.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2">
                      <Button variant="ghost" onClick={() => setEndOpen(false)} className="rounded-full">
                        Keep Going
                      </Button>
                      <Button
                        onClick={() => { setEndOpen(false); setSub("processing"); }}
                        className="rounded-full bg-rose-500 text-white hover:bg-rose-600"
                      >
                        End Interview
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}

            {sub === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-lg border border-black/10 bg-card p-10 text-center shadow-sm sm:p-16 dark:border-white/10">
                  <ConicSpinner />
                  <h2 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Processing your interview…
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;re transcribing your audio, scoring your answers, and generating your 17-section report. This takes approximately 60 seconds.
                  </p>

                  <div className="mx-auto mt-8 max-w-md space-y-2 text-left">
                    {PROCESSING_STEPS.map((s, i) => {
                      const state = i < 2 ? "done" : i === 2 ? "active" : "pending";
                      return (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className={cn(
                            "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                            state === "active"
                              ? "border-violet-400/40 bg-violet-500/10"
                              : state === "done"
                                ? "border-emerald-400/30 bg-emerald-500/10"
                                : "border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {state === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            {state === "active" && <Loader2 className="h-4 w-4 animate-spin text-violet-500 dark:text-violet-400" />}
                            {state === "pending" && <div className="h-4 w-4 rounded-full border border-black/15 dark:border-white/15" />}
                            <span className={state === "pending" ? "text-muted-foreground" : "text-foreground"}>{s.label}</span>
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">{s.dur}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  <p className="mt-8 text-xs text-muted-foreground">
                    Taking longer than expected? You can go to your dashboard. We&apos;ll notify you when the report is ready.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => set("dashboard")}
                    className="mt-4 rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    Go to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {sub === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-lg border border-black/10 bg-card p-10 text-center shadow-sm sm:p-16 dark:border-white/10">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-violet-500 shadow-sm"
                  >
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Interview Complete
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your 17-section report is being generated and will appear on your dashboard shortly. About 60 seconds from now you&apos;ll see a <span className="text-violet-500 dark:text-violet-400">Download Report</span> button light up.
                  </p>
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      onClick={() => set("report")}
                      className="rounded-full bg-violet-500 text-white hover:bg-violet-600"
                    >
                      <Download className="mr-2 h-4 w-4" /> View Report
                    </Button>
                    <Button
                      onClick={() => set("dashboard")}
                      variant="outline"
                      className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      Go to Dashboard
                    </Button>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 text-left">
                    {[
                      { label: "Questions Asked", value: "10" },
                      { label: "Avg Answer Length", value: "1m 12s" },
                      { label: "Filler Words", value: "23" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="text-lg font-semibold tracking-tight text-violet-500 dark:text-violet-400">{s.value}</p>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </PageWrap>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SystemCheckCard({
  icon: Icon,
  label,
  status,
  onTest,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: "idle" | "ok" | "fail";
  onTest: () => void;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-black/[0.02] text-muted-foreground ring-1 ring-inset ring-black/10 dark:bg-white/5 dark:ring-white/10">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-[11px] text-muted-foreground">
              {status === "idle" && "Not tested yet"}
              {status === "ok" && "Working"}
              {status === "fail" && "Not detected"}
            </p>
          </div>
        </div>
        {status === "ok" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : status === "fail" ? (
          <AlertTriangle className="h-5 w-5 text-rose-500" />
        ) : null}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onTest}
        className="mt-3 w-full rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
      >
        Test {label}
      </Button>
    </div>
  );
}

function AvatarBlock() {
  return (
    <div className="relative grid place-items-center">
      <motion.div
        animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid h-44 w-44 place-items-center rounded-full bg-violet-500 shadow-sm ring-1 ring-black/10 dark:ring-white/10"
      >
        <Video className="h-14 w-14 text-white" />
        {/* Typing dots overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-black/10 bg-card px-3 py-1 text-[11px] dark:border-white/15"
        >
          <TypingDots className="text-violet-500 dark:text-violet-400" /> thinking
        </motion.div>
      </motion.div>
    </div>
  );
}

function Waveform() {
  return (
    <div className="mt-6 flex items-end justify-center gap-0.5">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-violet-400"
          animate={{ height: [4, 6 + Math.random() * 14, 4] }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function AnalysisIndicators() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {[
        { label: "Emotion", value: "Neutral", tone: "text-sky-600 dark:text-sky-300", icon: Brain },
        { label: "Eye Contact", value: "78%", tone: "text-emerald-600 dark:text-emerald-300", icon: MonitorPlay },
        { label: "Posture", value: "Good", tone: "text-emerald-600 dark:text-emerald-300", icon: ShieldCheck },
      ].map((s) => (
        <div key={s.label} className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <s.icon className={cn("mx-auto h-3.5 w-3.5", s.tone)} />
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
          <p className={cn("mt-0.5 text-sm font-semibold", s.tone)}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function ChatBubble({ role, time, children }: { role: "ai" | "user"; time: string; children: React.ReactNode }) {
  const isAI = role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-end gap-2",
        isAI ? "justify-start" : "justify-end",
      )}
    >
      {isAI && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">AI</span>}
      <div className={cn(
        "max-w-[85%] rounded-lg px-3 py-2 text-xs",
        isAI
          ? "border border-violet-400/20 bg-violet-500/10 text-violet-700 dark:text-violet-50"
          : "bg-black/[0.05] text-foreground/90 dark:bg-white/10",
      )}>
        <p className="leading-relaxed">{children}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{time}</p>
      </div>
    </motion.div>
  );
}

function MicToggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn((s) => !s)}
      className={cn(
        "grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors",
        on
          ? "bg-violet-500 text-white hover:bg-violet-600"
          : "bg-black/[0.05] text-muted-foreground ring-1 ring-inset ring-black/10 dark:bg-white/5 dark:ring-white/10",
      )}
    >
      {on ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
    </button>
  );
}

function ConicSpinner() {
  return (
    <div className="relative mx-auto h-24 w-24">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #8b5cf6, #a78bfa, #8b5cf6)",
          animation: "spin 1.4s linear infinite",
          maskImage: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)",
          WebkitMaskImage: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500 dark:text-violet-400" />
      </div>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* keep imports referenced */
export const __icons = { Pause, Play, RefreshCw, Square };
