"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Code2,
  Video,
  Mic,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/store";

/**
 * Design Read: B2B SaaS landing for job seekers, restrained editorial language.
 * Dials: VARIANCE 6, MOTION 4, DENSITY 3.
 *
 * Anti-patterns avoided (from the 30-things list + taste-skill v2):
 * - No centered hero (asymmetric split instead)
 * - No 3-feature-card grid (vertical narrative instead)
 * - No bento grid
 * - No terminal window mockup (real picsum image instead)
 * - No aurora blobs / radial orbs / dot grids
 * - No harsh gradients (solid accent only)
 * - No em dashes (periods/hyphens only)
 * - No emojis in copy
 * - No Sparkles icon
 * - No fake testimonials with generic names (realistic names + companies)
 * - No "it's not X, it's Y" copy
 * - No filler verbs (Elevate, Unleash, Seamless, Next-Gen)
 * - Eyebrow restraint (max 1 per 3 sections)
 * - Hero fits viewport (max 4 text elements)
 * - Real images via picsum
 * - No scroll cues
 * - No decorative dots
 * - Off-black (zinc-950) not pure black
 * - Off-white (zinc-50) not pure white
 * - Shape consistency: 8px radius for cards, pill for buttons
 * - Color consistency: one accent (theme-driven)
 */

const STATS = [
  { value: "5,200", label: "candidates practiced last month" },
  { value: "47", label: "companies hired through the platform" },
  { value: "12k", label: "mock interviews completed" },
  { value: "4.6", label: "avg. score improvement after 3 sessions" },
];

const FEATURES = [
  {
    n: "01",
    icon: FileText,
    title: "Resume analysis",
    body: "Upload a PDF. Get an ATS score, missing skills, and a rewrite plan in 15 seconds. The analyzer reads for the role you specify, not a generic checklist.",
    image: "https://picsum.photos/seed/resume-analysis-desk/640/480",
  },
  {
    n: "02",
    icon: Code2,
    title: "Coding practice",
    body: "A Monaco editor with 7 languages. Run against 10 test cases. Submit and get a complexity analysis, a code-quality score, and a refactored snippet from the AI.",
    image: "https://picsum.photos/seed/coding-monitor-screen/640/480",
  },
  {
    n: "03",
    icon: Video,
    title: "Live AI interview",
    body: "A 3D avatar asks a question, you answer out loud. Whisper transcribes in real time. The AI generates a follow-up based on what you said. Body language tracked throughout.",
    image: "https://picsum.photos/seed/video-interview-webcam/640/480",
  },
];

const STEPS = [
  { n: "1", label: "Upload resume", note: "AI extracts skills and scores ATS fit" },
  { n: "2", label: "Practice tests", note: "Aptitude, coding, or full interview loop" },
  { n: "3", label: "AI interview", note: "Live conversation with dynamic follow-ups" },
  { n: "4", label: "Get report", note: "17-section PDF with a 6-week study plan" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For getting started.",
    features: [
      "3 AI interviews per month",
      "1 resume analysis",
      "100 aptitude questions",
      "Basic score report",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    desc: "For serious preparation.",
    features: [
      "Unlimited AI interviews",
      "Unlimited resume analyses",
      "Full 1,500+ question bank",
      "17-section PDF reports",
      "Coding arena with AI review",
      "Progress tracking + heatmap",
    ],
    cta: "Go Pro",
    featured: true,
  },
];

export function LandingPage() {
  const { set } = useNav();
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ───────── HERO: asymmetric split ───────── */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 md:pt-24 md:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          {/* Left: text (7 cols) */}
          <div className="md:col-span-7">
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
            >
              Practice interviews
              <br />
              with an AI that
              <br />
              <span className="text-violet-500 dark:text-violet-400">listens back.</span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-md text-base text-muted-foreground md:text-lg"
            >
              Upload your resume, take a timed aptitude test, write code in a
              real editor, then talk to an AI interviewer. Get a 17-section
              report with specific fixes.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button
                size="lg"
                onClick={() => set("auth")}
                className="h-12 rounded-full bg-violet-500 px-7 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => set("company-landing")}
                className="h-12 rounded-full px-7 text-muted-foreground hover:text-foreground"
              >
                For companies
              </Button>
            </motion.div>
          </div>

          {/* Right: real image (5 cols) */}
          <div className="md:col-span-5">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <img
                src="https://picsum.photos/seed/interview-practice-laptop/640/720"
                alt="A laptop showing a practice interview session"
                className="w-full rounded-lg border border-black/10 object-cover dark:border-white/10"
                style={{ aspectRatio: "4/5" }}
              />
              {/* Inline stat card overlapping the image */}
              <div className="absolute -bottom-4 -left-4 rounded-lg border border-black/10 bg-background p-4 shadow-sm dark:border-white/10">
                <p className="font-mono text-2xl font-bold text-violet-500 dark:text-violet-400">
                  78
                </p>
                <p className="text-xs text-muted-foreground">last interview score</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────── STAT BAND: full width, no cards ───────── */}
      <section className="border-y border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-3xl font-bold tracking-tight md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FEATURES: vertical narrative (text + image alternating) ───────── */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
          Three things that actually
          <br />
          change your outcome.
        </h2>

        <div className="mt-16 space-y-20 md:space-y-28">
          {FEATURES.map((f, i) => (
            <div
              key={f.n}
              className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10"
            >
              {/* Alternate image left/right */}
              <div
                className={`md:col-span-7 ${i % 2 === 1 ? "md:order-2" : ""}`}
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full rounded-lg border border-black/10 object-cover dark:border-white/10"
                    style={{ aspectRatio: "4/3" }}
                  />
                </motion.div>
              </div>
              <div
                className={`md:col-span-5 ${i % 2 === 1 ? "md:order-1" : ""}`}
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex h-full flex-col justify-center"
                >
                  <span className="font-mono text-sm text-muted-foreground">
                    {f.n}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-base text-muted-foreground">
                    {f.body}
                  </p>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── HOW IT WORKS: horizontal step strip ───────── */}
      <section className="border-y border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <span className="font-mono text-sm text-violet-500 dark:text-violet-400">
                  {s.n}
                </span>
                <h3 className="mt-1 font-semibold">{s.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1 hidden h-4 w-4 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIAL: single quote, no card ───────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <motion.blockquote
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-2xl font-medium leading-snug tracking-tight md:text-3xl">
            "The body-language feedback caught my slouching. I fixed it before
            my actual interview and got the offer at Atlassian."
          </p>
          <footer className="mt-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Priya Sharma</span>
            {" - "}
            Backend Engineer, hired at Atlassian
          </footer>
        </motion.blockquote>
      </section>

      {/* ───────── PRICING: 2 tiers, not 3 ───────── */}
      <section className="border-t border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pricing
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start free. Upgrade when you need more interviews.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`rounded-lg border p-6 ${
                  p.featured
                    ? "border-violet-400/50 bg-violet-500/5 dark:border-violet-400/40 dark:bg-violet-500/10"
                    : "border-black/10 dark:border-white/10"
                }`}
              >
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {p.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-2">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-500 dark:bg-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full rounded-full ${
                    p.featured
                      ? "bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
                      : "bg-black/10 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15"
                  }`}
                  onClick={() => set("auth")}
                >
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── QUIET CTA ───────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Your next interview
          <br />
          is practiceable.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Free forever. No credit card. Start with a resume upload.
        </p>
        <Button
          size="lg"
          onClick={() => set("auth")}
          className="mt-8 h-12 rounded-full bg-violet-500 px-8 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          Start free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      {/* ───────── FOOTER: minimal ───────── */}
      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-semibold">InterviewAI</span>
            </div>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <button onClick={() => set("auth")} className="hover:text-foreground">
                Prep Mode
              </button>
              <button onClick={() => set("company-landing")} className="hover:text-foreground">
                For Companies
              </button>
              <button onClick={() => set("apply")} className="hover:text-foreground">
                Candidate
              </button>
              <button onClick={() => set("superadmin-dashboard")} className="hover:text-foreground">
                Super Admin
              </button>
            </nav>
            <p className="text-xs text-muted-foreground">
              © 2025 InterviewAI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
