"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Download,
  Eye,
  FastForward,
  Heart,
  Info,
  Maximize2,
  Mic,
  Pause,
  Play,
  Rewind,
  Video,
  Volume2,
} from "lucide-react";
import {
  PageWrap,
  SectionHeading,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

interface TranscriptItem {
  time: string;
  seconds: number;
  role: "ai" | "user";
  text: string;
  note?: string;
}

const TRANSCRIPT: TranscriptItem[] = [
  { time: "0:00", seconds: 0, role: "ai", text: "Hi Priya, I'm your AI interviewer today. We'll spend 30 minutes on a backend technical interview. Ready?" },
  { time: "0:18", seconds: 18, role: "user", text: "Yes, ready. Excited to be here.", note: "Good tone, slight nervous laugh. Normal." },
  { time: "0:24", seconds: 24, role: "ai", text: "Let's start with your background. Tell me about a recent backend system you designed end-to-end." },
  { time: "0:54", seconds: 54, role: "user", text: "Sure. Last quarter we built a FastAPI service that ingests 2M events/day from mobile SDKs. I owned the schema, the queue layer (Kafka), and the API surface.", note: "Concrete metrics. Strong opening." },
  { time: "1:42", seconds: 102, role: "ai", text: "Walk me through how you'd handle a sudden 10× traffic spike on that ingestion service." },
  { time: "1:58", seconds: 118, role: "user", text: "First I'd check the consumer lag. If Kafka is backing up, scale consumers horizontally. Then I'd add a queue depth alert at 80%.", note: "Best answer of the session. Clear sequence." },
  { time: "3:30", seconds: 210, role: "ai", text: "Tell me about a time you had a conflict with a teammate on a technical decision." },
  { time: "3:48", seconds: 228, role: "user", text: "Hmm, there was this one time… we disagreed on Postgres vs Mongo for a new service. I argued Postgres because ACID mattered for billing.", note: "Lost structure. Should use STAR-L." },
  { time: "5:12", seconds: 312, role: "ai", text: "Good. Let's switch gears. Design a rate limiter that supports 1M QPS with token bucket semantics." },
  { time: "5:30", seconds: 330, role: "user", text: "I'd use a Redis-backed token bucket per user ID. Hot keys sharded by user hash. Read-and-decrement via Lua script for atomicity." },
  { time: "8:00", seconds: 480, role: "ai", text: "Excellent. Two more questions. Any questions for me before we close?" },
  { time: "8:20", seconds: 500, role: "user", text: "Yes. What does the team's on-call rotation look like, and is there a defined staff-engineer track?" },
];

const EMOTION_STRIP = [
  { q: 1, label: "Neutral", tone: "bg-slate-400/30 text-slate-600 dark:text-slate-200", time: "0:18" },
  { q: 2, label: "Happy", tone: "bg-emerald-400/30 text-emerald-600 dark:text-emerald-200", time: "0:54" },
  { q: 3, label: "Neutral", tone: "bg-slate-400/30 text-slate-600 dark:text-slate-200", time: "1:58" },
  { q: 4, label: "Happy", tone: "bg-emerald-400/30 text-emerald-600 dark:text-emerald-200", time: "3:48" },
  { q: 5, label: "Thinking", tone: "bg-amber-400/30 text-amber-600 dark:text-amber-200", time: "5:30" },
  { q: 6, label: "Neutral", tone: "bg-slate-400/30 text-slate-600 dark:text-slate-200", time: "8:20" },
];

export function InterviewReplay() {
  const { set } = useNav();
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(102); // current play time in seconds
  const [activeIdx, setActiveIdx] = useState(2);

  const duration = 600; // 10:00 mock
  const mm = (t: number) => String(Math.floor(t / 60)).padStart(1, "0");
  const ss = (t: number) => String(t % 60).padStart(2, "0");

  const jumpTo = (s: number, idx: number) => {
    setTime(s);
    setActiveIdx(idx);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap wide>
        <BackToHome />
        <SectionHeading
          eyebrow="Interview Replay"
          title={<>Re-watch your <span className="text-violet-500 dark:text-violet-400">interview</span></>}
          description="The video recording is synced to the transcript and AI annotations. Click any transcript line to jump to that moment, or scrub the player to navigate."
          align="left"
        />

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Player + transcript */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video player mock */}
            <div className="overflow-hidden rounded-lg border border-black/10 bg-card shadow-sm dark:border-white/10">
              <div className="relative aspect-video bg-zinc-900">
                {/* Avatar */}
                <div className="absolute inset-0 grid place-items-center">
                  <motion.div
                    animate={playing ? { y: [0, -8, 0], scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative grid h-40 w-40 place-items-center rounded-full bg-violet-500 shadow-sm ring-1 ring-white/10 sm:h-48 sm:w-48"
                  >
                    <Video className="h-12 w-12 text-white" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-zinc-900 px-3 py-0.5 text-[11px] text-white">
                      AI Interviewer
                    </div>
                  </motion.div>
                </div>

                {/* Center play button */}
                {!playing && (
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 grid place-items-center"
                    aria-label="Play"
                  >
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="grid h-16 w-16 place-items-center rounded-full bg-violet-500 text-white shadow-sm ring-1 ring-white/10"
                    >
                      <Play className="h-7 w-7 fill-current" />
                    </motion.span>
                  </button>
                )}

                {/* Top overlay */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-xs">
                  <div className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/80 px-3 py-1 text-white">
                    <Video className="h-3 w-3 text-violet-400" /> Interview · Jan 15, 2025
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/80 px-3 py-1 font-mono text-white">
                    {mm(time)}:{ss(time)} / 10:00
                  </div>
                </div>

                {/* Bottom controls */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-900/90 to-transparent p-4">
                  {/* Progress bar */}
                  <div
                    className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/20"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      setTime(Math.round(pct * duration));
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-violet-500"
                      style={{ width: `${(time / duration) * 100}%` }}
                    />
                    {/* Chapter markers */}
                    {TRANSCRIPT.map((t, i) => (
                      <span
                        key={i}
                        className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 ring-1 ring-black/40"
                        style={{ left: `${(t.seconds / duration) * 100}%` }}
                        title={t.text}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTime((t) => Math.max(0, t - 10))}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                        aria-label="Rewind 10s"
                      >
                        <Rewind className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPlaying((p) => !p)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-violet-500 text-white hover:bg-violet-600"
                        aria-label={playing ? "Pause" : "Play"}
                      >
                        {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                      </button>
                      <button
                        onClick={() => setTime((t) => Math.min(duration, t + 10))}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                        aria-label="Forward 10s"
                      >
                        <FastForward className="h-4 w-4" />
                      </button>
                      <div className="ml-2 flex items-center gap-1.5 text-xs text-white/70">
                        <Volume2 className="h-3.5 w-3.5" />
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/20">
                          <div className="h-full w-3/4 rounded-full bg-white/70" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-white/70 hover:bg-white/20" aria-label="Captions">
                        <Mic className="h-3.5 w-3.5" />
                      </button>
                      <button className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-white/70 hover:bg-white/20" aria-label="Fullscreen">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Transcript</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Click any line to jump the video.</p>
                </div>
                <Badge className="border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200">{TRANSCRIPT.length} messages</Badge>
              </div>

              <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto scrollbar-custom pr-1">
                {TRANSCRIPT.map((t, i) => {
                  const active = i === activeIdx;
                  return (
                    <li key={i}>
                      <button
                        onClick={() => jumpTo(t.seconds, i)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                          active
                            ? "border-violet-400/40 bg-violet-500/10"
                            : "border-black/5 bg-black/[0.02] hover:border-black/15 dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/15",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                              t.role === "ai"
                                ? "bg-violet-500 text-white"
                                : "bg-black/[0.1] text-foreground/80 dark:bg-white/10",
                            )}>
                              {t.role === "ai" ? "AI" : "You"}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">{t.time}</span>
                          </div>
                          {active && (
                            <Badge className="border-violet-400/30 bg-violet-500/15 text-violet-700 dark:text-violet-200">
                              <Play className="h-2.5 w-2.5 fill-current" /> Now
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          "mt-1.5 text-sm",
                          t.role === "ai" ? "text-violet-700 dark:text-violet-100" : "text-foreground/90",
                        )}>{t.text}</p>
                        {t.note && (
                          <p className="mt-1.5 rounded-md border border-amber-400/20 bg-amber-500/[0.05] px-2 py-1 text-[11px] text-amber-700 dark:text-amber-200">
                            <Info className="mr-1 inline h-3 w-3" /> AI note: {t.note}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Side: emotion strip + summary */}
          <div className="space-y-4">
            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Emotion Timeline</p>
                <Heart className="h-4 w-4 text-rose-500 dark:text-rose-300" />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Per-question emotion detected by face-api.js</p>

              <div className="mt-4 flex items-stretch gap-1">
                {EMOTION_STRIP.map((e, i) => {
                  const active = i === Math.min(EMOTION_STRIP.length - 1, Math.floor((time / duration) * EMOTION_STRIP.length));
                  return (
                    <div key={e.q} className="flex-1">
                      <button
                        onClick={() => {
                          const t = TRANSCRIPT.find((x) => x.time === e.time);
                          if (t) jumpTo(t.seconds, TRANSCRIPT.indexOf(t));
                        }}
                        className={cn(
                          "flex w-full flex-col items-center gap-1 rounded-md border px-1.5 py-2 text-center transition-colors",
                          active ? cn(e.tone, "ring-1 ring-inset ring-current") : "border-black/10 bg-black/[0.02] hover:border-black/20 dark:border-white/10 dark:bg-white/[0.02]",
                        )}
                      >
                        <span className={cn("h-2.5 w-2.5 rounded-full", e.tone.split(" ")[0])} />
                        <span className="text-[9px] uppercase tracking-wider opacity-80">{e.label}</span>
                        <span className="font-mono text-[9px] opacity-60">{e.time}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Dominant: <span className="text-emerald-600 dark:text-emerald-300">Happy (45%)</span></span>
                <span>Range: Neutral - Happy</span>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Session Summary</p>
              <div className="mt-3 space-y-2 text-sm">
                {[
                  { l: "Score", v: "78 / 100", t: "text-violet-500 dark:text-violet-300" },
                  { l: "Recommendation", v: "Recommend", t: "text-sky-600 dark:text-sky-300" },
                  { l: "Duration", v: "8m 40s", t: "text-foreground" },
                  { l: "Questions", v: "6 of 10", t: "text-foreground" },
                  { l: "Filler words", v: "23", t: "text-rose-600 dark:text-rose-300" },
                ].map((s) => (
                  <div key={s.l} className="flex items-center justify-between rounded-md border border-black/5 bg-black/[0.02] px-3 py-1.5 dark:border-white/5 dark:bg-white/[0.02]">
                    <span className="text-muted-foreground">{s.l}</span>
                    <span className={cn("font-mono font-semibold", s.t)}>{s.v}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => set("report")}
                className="mt-4 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
              >
                <Download className="mr-2 h-4 w-4" /> Full Report
              </Button>
            </div>

            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Body Language Highlights</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center justify-between"><span>Eye contact</span><span className="font-mono text-emerald-600 dark:text-emerald-300">78%</span></li>
                <li className="flex items-center justify-between"><span>Posture warnings</span><span className="font-mono text-amber-600 dark:text-amber-300">4</span></li>
                <li className="flex items-center justify-between"><span>Hand gestures</span><span className="font-mono text-violet-500 dark:text-violet-300">18</span></li>
                <li className="flex items-center justify-between"><span>Smiles</span><span className="font-mono text-emerald-600 dark:text-emerald-300">9</span></li>
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground">
                <Info className="mr-1 inline h-3 w-3" />
                Body language analyzed locally via MediaPipe. No video leaves your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
            <Brain className="h-5 w-5 text-violet-500 dark:text-violet-400" />
            <p className="mt-2 text-sm font-medium">Want a deeper breakdown?</p>
            <p className="mt-1 text-xs text-muted-foreground">Open the full 17-section report for strengths, improvements, and a 6-week roadmap.</p>
            <Button onClick={() => set("report")} variant="ghost" className="mt-3 rounded-full px-0 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
              Open Report <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="rounded-lg border border-black/10 bg-card p-5 shadow-sm dark:border-white/10">
            <Video className="h-5 w-5 text-violet-500 dark:text-violet-400" />
            <p className="mt-2 text-sm font-medium">Take another interview</p>
            <p className="mt-1 text-xs text-muted-foreground">Apply the feedback. Your score is trending up. Aim for 85 next.</p>
            <Button onClick={() => set("interview")} variant="ghost" className="mt-3 rounded-full px-0 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
              Start New <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

      </PageWrap>
    </div>
  );
}

/* keep imports referenced */
export const __icons = {};
