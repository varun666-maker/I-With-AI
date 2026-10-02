"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Camera,
  CheckCircle2,
  Loader2,
  Mic,
  MonitorPlay,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
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
import { requestFullscreen, exitFullscreen } from "@/lib/fullscreen";
import { useProctoring } from "@/lib/proctoring";
import { ProctoringWarning } from "@/components/shared/proctoring-warning";

type SubScreen = "confirm" | "live" | "processing" | "done";

const INTERVIEW_TYPE = "Technical - General";
// F-23: Added "Uploading recording" as the first step (before Transcribing).
const PROCESSING_STEPS = [
  { label: "Uploading recording", dur: "8s" },
  { label: "Transcribing audio", dur: "12s" },
  { label: "Evaluating answers", dur: "18s" },
  { label: "Generating report", dur: "20s" },
  { label: "Calculating scores", dur: "8s" },
];

export function CandidateInterviewTest() {
  const reduce = useReducedMotion();
  const set = useNav((s) => s.set);
  const setNavigationLocked = useNav((s) => s.setNavigationLocked);

  const proctor = useProctoring({ mode: "strict" });
  const proctorRef = useRef(proctor);
  useEffect(() => {
    proctorRef.current = proctor;
  });

  const [sub, setSub] = useState<SubScreen>("confirm");
  const [endOpen, setEndOpen] = useState(false);
  // F-22: Early-end reason picker. When the candidate ends early, they must
  // pick one of 3 reasons before submitting. Normal completion does NOT prompt.
  const [endReason, setEndReason] = useState<"finished" | "too-long" | "technical" | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // CRITICAL: proctor is in ref, never in deps.
  // Processing entry: unlock + exit fullscreen
  useEffect(() => {
    if (sub === "processing") {
      exitFullscreen();
      setNavigationLocked(false);
      // Auto-advance to done after 3 seconds
      const t = setTimeout(() => {
        queueMicrotask(() => setSub("done"));
      }, 3000);
      return () => clearTimeout(t);
    }
     
  }, [sub]);

  // Auto-submit via proctor
  useEffect(() => {
    if (proctor.isAutoSubmitted && sub === "live") {
      queueMicrotask(() => setAutoSubmitted(true));
    }
  }, [proctor.isAutoSubmitted, sub]);

  // Strike 3 during live -> end interview
  useEffect(() => {
    if (sub === "live" && proctor.strikes >= 3) {
      const t = setTimeout(() => {
        exitFullscreen();
        setNavigationLocked(false);
        proctorRef.current.stopMonitoring();
        queueMicrotask(() => setSub("processing"));
      }, 1200);
      return () => clearTimeout(t);
    }
     
  }, [proctor.strikes, sub]);

  // Auto-submit overlay -> advance to processing
  useEffect(() => {
    if (autoSubmitted && sub === "live") {
      const t = setTimeout(() => {
        exitFullscreen();
        setNavigationLocked(false);
        proctorRef.current.stopMonitoring();
        queueMicrotask(() => setSub("processing"));
      }, 1200);
      return () => clearTimeout(t);
    }
     
  }, [autoSubmitted, sub]);

  const beginInterview = () => {
    requestFullscreen();
    setNavigationLocked(true);
    proctorRef.current.startMonitoring();
    setSub("live");
  };

  const endEarly = () => {
    setEndOpen(false);
    setEndReason(null);
    exitFullscreen();
    setNavigationLocked(false);
    proctorRef.current.stopMonitoring();
    setSub("processing");
  };

  const viewSummary = () => {
    set("candidate-results");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* ---------------- CONFIRM ---------------- */}
          {sub === "confirm" && (
            <motion.div
              key="confirm"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? false : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-2xl"
            >
              <Badge variant="outline" className="mb-3 rounded-full border-amber-400/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
                Round 3 · Final
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready for your <span className="text-violet-500 dark:text-violet-400">AI Interview</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You're about to start the AI interview. Mic + camera are already verified.
                Strict proctoring will be enforced throughout.
              </p>

              <div className="mt-6 rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                {/* Interview type */}
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Interview type</p>
                <div className="mt-2 flex items-center gap-3 rounded-md border border-violet-400/30 bg-violet-500/5 px-4 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/15 text-violet-600 ring-1 ring-inset ring-violet-400/30 dark:text-violet-300">
                    <Brain className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{INTERVIEW_TYPE}</p>
                    <p className="text-[11px] text-muted-foreground">
                      DSA + system design basics. 10-15 questions, approximately 35 minutes.
                    </p>
                  </div>
                </div>

                {/* Pre-verified checks */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-md border border-emerald-400/30 bg-emerald-500/5 px-3 py-2.5">
                    <Mic className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <div className="flex-1">
                      <p className="text-xs font-medium">Microphone verified</p>
                      <p className="text-[10px] text-muted-foreground">Clear input detected in system check</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-emerald-400/30 bg-emerald-500/5 px-3 py-2.5">
                    <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <div className="flex-1">
                      <p className="text-xs font-medium">Camera verified</p>
                      <p className="text-[10px] text-muted-foreground">Frontal lighting, single face detected</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  </div>
                </div>

                {/* Proctoring notice */}
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-100/90">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p>
                    <span className="font-medium">Strict proctoring on.</span> Tab switches,
                    fullscreen exits, and face-absence are monitored. Three strikes will end
                    the interview automatically.
                  </p>
                </div>

                <Button
                  onClick={beginInterview}
                  className="mt-5 h-11 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Begin Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ---------------- LIVE ---------------- */}
          {sub === "live" && (
            <motion.div
              key="live"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? false : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between rounded-lg border border-black/10 bg-card p-3 shadow-sm sm:p-4 dark:border-white/10">
                <div className="flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 font-mono text-base font-semibold text-amber-600 dark:text-amber-300 sm:text-lg">
                  <span className="text-[10px] uppercase tracking-widest text-amber-500/70">Live</span>
                  08:42
                </div>
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Progress</p>
                  <p className="font-mono text-sm font-semibold">
                    Q <span className="text-violet-500 dark:text-violet-400">3</span> of 12
                  </p>
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
                {/* Left: avatar + waveform + indicators + webcam preview */}
                <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <AvatarBlock reduce={reduce} />
                  <Waveform reduce={reduce} />
                  <AnalysisIndicators />
                  <WebcamPreview />
                </div>

                {/* Right: question + transcript */}
                <div className="flex h-full flex-col rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Question</p>
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 rounded-lg border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-700 dark:text-violet-50"
                  >
                    Tell me about a recent bug you debugged. Walk me through your process.
                    What tools did you use, and how did you isolate the root cause?
                  </motion.div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Live Transcript</p>
                    <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-custom">
                      <ChatBubble role="ai" time="0:12">Great. Let's dive into a technical scenario. Tell me about a recent bug you debugged.</ChatBubble>
                      <ChatBubble role="user" time="0:24">Sure. Last month we had a memory leak in our FastAPI service. The container kept getting OOM-killed every 4 hours.</ChatBubble>
                      <ChatBubble role="ai" time="0:38">Interesting. What tools did you reach for first?</ChatBubble>
                      <ChatBubble role="user" time="0:52">I started with tracemalloc to snapshot allocations, then moved to py-spy for live profiling.</ChatBubble>
                      <div className="flex items-center gap-1.5 text-xs text-violet-500 dark:text-violet-400">
                        <TypingDots /> AI is thinking...
                      </div>
                    </div>
                  </div>

                  {/* Proctoring footer */}
                  <div className="mt-auto pt-4 text-[11px] text-muted-foreground">
                    Tab switches: <span className="text-foreground">{proctor.events.length}</span> · Strikes: <span className="text-foreground">{proctor.strikes}/3</span>. Logged for integrity review.
                  </div>
                </div>
              </div>

              {/* End-early confirmation + F-22 reason picker */}
              <Dialog open={endOpen} onOpenChange={(o) => { setEndOpen(o); if (!o) setEndReason(null); }}>
                <DialogContent className="border-black/10 bg-card dark:border-white/10">
                  <DialogHeader>
                    <DialogTitle>End interview early?</DialogTitle>
                    <DialogDescription>
                      You won't be able to resume this interview. Your partial transcript
                      will still be processed into a report.
                    </DialogDescription>
                  </DialogHeader>
                  {/* F-22: 3-option reason picker */}
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Why are you ending early?
                    </p>
                    {([
                      { v: "finished", label: "Finished", desc: "I've said everything I need to." },
                      { v: "too-long", label: "Too long", desc: "The interview is taking too much time." },
                      { v: "technical", label: "Technical issue", desc: "Connectivity, audio, or video problem." },
                    ] as const).map((r) => (
                      <button
                        key={r.v}
                        type="button"
                        onClick={() => setEndReason(r.v)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                          endReason === r.v
                            ? "border-violet-400/60 bg-violet-500/10"
                            : "border-black/10 hover:bg-muted/30 dark:border-white/10",
                        )}
                      >
                        <div className={cn(
                          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                          endReason === r.v ? "border-violet-500 bg-violet-500" : "border-black/20 dark:border-white/20",
                        )}>
                          {endReason === r.v && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <DialogFooter className="mt-4 flex gap-2">
                    <Button variant="ghost" onClick={() => { setEndOpen(false); setEndReason(null); }} className="rounded-full">
                      Keep Going
                    </Button>
                    <Button
                      onClick={endEarly}
                      disabled={!endReason}
                      className="rounded-full bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
                    >
                      End Interview
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Strike warning */}
              <ProctoringWarning
                open={proctor.strikes > 0 && proctor.strikes < 3}
                strikeNumber={proctor.strikes}
                violationType={proctor.events[proctor.events.length - 1]?.type ?? "tab-switch"}
                onAcknowledge={() => proctor.reset()}
                onAutoSubmit={() => setAutoSubmitted(true)}
              />
            </motion.div>
          )}

          {/* ---------------- PROCESSING ---------------- */}
          {sub === "processing" && (
            <motion.div
              key="processing"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? false : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-lg border border-black/10 bg-card p-10 text-center shadow-sm sm:p-16 dark:border-white/10">
                <ConicSpinner />
                <h2 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Processing your interview...
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We're transcribing your audio, scoring your answers, and generating your report.
                  This takes approximately 60 seconds.
                </p>

                <div className="mx-auto mt-8 max-w-md space-y-2 text-left">
                  {PROCESSING_STEPS.map((s, i) => {
                    const state = i < 2 ? "done" : i === 2 ? "active" : "pending";
                    return (
                      <motion.div
                        key={s.label}
                        initial={reduce ? false : { opacity: 0, x: -8 }}
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
                  You will be moved to your final summary automatically.
                </p>
              </div>
            </motion.div>
          )}

          {/* ---------------- DONE ---------------- */}
          {sub === "done" && (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? false : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-lg border border-black/10 bg-card p-10 text-center shadow-sm sm:p-16 dark:border-white/10">
                <motion.div
                  initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-violet-500 shadow-sm"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Interview complete.
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your responses have been submitted to the hiring team. Your final
                  summary is ready to view.
                </p>
                <Button
                  onClick={viewSummary}
                  className="mt-6 h-11 rounded-full bg-violet-500 px-7 text-white hover:bg-violet-600"
                >
                  View Final Summary
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="mt-8 grid grid-cols-3 gap-3 text-left">
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-lg font-semibold tracking-tight text-violet-500 dark:text-violet-400">12</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Questions Asked</p>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-lg font-semibold tracking-tight text-violet-500 dark:text-violet-400">1m 12s</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Avg Answer</p>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-lg font-semibold tracking-tight text-emerald-600 dark:text-emerald-300">Clean</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Integrity</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Auto-submit overlay during live */}
      <AnimatePresence>
        {autoSubmitted && sub === "live" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={reduce ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-4 max-w-sm rounded-lg border border-black/10 bg-card p-6 text-center shadow-lg dark:border-white/10"
            >
              <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
              <h3 className="mt-3 text-lg font-semibold tracking-tight">Auto-ended</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Three proctoring strikes. Your interview has been ended automatically.
                Processing your responses now.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AvatarBlock({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="relative grid place-items-center">
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid h-44 w-44 place-items-center rounded-full bg-violet-500 shadow-sm ring-1 ring-black/10 dark:ring-white/10"
      >
        <Video className="h-14 w-14 text-white" />
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

function Waveform({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="mt-6 flex items-end justify-center gap-0.5">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-violet-400"
          animate={reduce ? undefined : { height: [4, 6 + ((i * 7) % 14), 4] }}
          transition={{
            duration: 0.6 + (i % 5) * 0.08,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
          style={{ height: 6 }}
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

function WebcamPreview() {
  return (
    <div className="mt-5 flex items-center gap-3 rounded-md border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-zinc-900 ring-1 ring-inset ring-white/10">
        <Camera className="h-4 w-4 text-white/60" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium">Webcam preview</p>
        <p className="text-[10px] text-muted-foreground">
          Single face detected. Frame grab in progress for integrity review.
        </p>
      </div>
      <span className="flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
        REC
      </span>
    </div>
  );
}

function ChatBubble({
  role,
  time,
  children,
}: {
  role: "ai" | "user";
  time: string;
  children: React.ReactNode;
}) {
  const isAI = role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-end gap-2", isAI ? "justify-start" : "justify-end")}
    >
      {isAI && (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">
          AI
        </span>
      )}
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

function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
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
