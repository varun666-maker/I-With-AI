"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Code2,
  Video,
  BarChart3,
  ClipboardList,
  FileBarChart,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/store";
import { Footer } from "@/components/shared/footer";

/**
 * Prep Mode landing page.
 *
 * Sections:
 *   1. Hero (asymmetric split, single CTA)
 *   2. Stat band (4 stats)
 *   3. Six features (vertical narrative, alternating image/text)
 *   4. How it works (4 steps)
 *   5. Testimonials marquee (scrolls right to left slowly)
 *   6. Quiet CTA
 *   7. Global Footer (shared across all screens)
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
    image:
      "https://picsum.photos/seed/resume-paper-desk-pen/640/480",
  },
  {
    n: "02",
    icon: ClipboardList,
    title: "Aptitude practice",
    body: "1,500+ timed questions across quantitative, logical, verbal, analytical, and data interpretation. Take a 25-question mock in 30 minutes. Get per-category breakdowns and explanations for every wrong answer.",
    image:
      "https://picsum.photos/seed/aptitude-test-notebook-pencil/640/480",
  },
  {
    n: "03",
    icon: Code2,
    title: "Coding practice",
    body: "A Monaco editor with 7 languages. Run against 10 test cases. Submit and get a complexity analysis, a code-quality score, and a refactored snippet from the AI.",
    image:
      "https://picsum.photos/seed/coding-editor-monitor-keyboard/640/480",
  },
  {
    n: "04",
    icon: Video,
    title: "Live AI interview",
    body: "A 3D avatar asks a question, you answer out loud. Whisper transcribes in real time. The AI generates a follow-up based on what you said. Body language tracked throughout.",
    image:
      "https://picsum.photos/seed/video-interview-webcam-headset/640/480",
  },
  {
    n: "05",
    icon: FileBarChart,
    title: "Complete 17-section report",
    body: "Every interview produces a full report: executive summary, overall score across 6 dimensions, hiring recommendation, resume analysis, aptitude analysis, coding analysis, technical and HR evaluation, communication and emotion analysis, emotion timeline chart, session highlights, top 7 strengths, top 7 improvements, a 6-week learning roadmap, and a final recommendation. Download as PDF.",
    image:
      "https://picsum.photos/seed/report-document-charts-graph/640/480",
  },
  {
    n: "06",
    icon: PlayCircle,
    title: "Interview video replay",
    body: "Re-watch any past interview with the video recording synced to the transcript and AI annotations. Click any line in the transcript to jump to that moment. An emotion timeline strip shows how your expressions changed throughout. If the recording failed, the transcript and scores are still accessible.",
    image:
      "https://picsum.photos/seed/video-replay-playback-screen/640/480",
  },
];

const STEPS = [
  { n: "1", label: "Upload resume", note: "AI extracts skills and scores ATS fit" },
  { n: "2", label: "Practice tests", note: "Aptitude, coding, or full interview loop" },
  { n: "3", label: "AI interview", note: "Live conversation with dynamic follow-ups" },
  { n: "4", label: "Get report", note: "17-section PDF with a 6-week study plan" },
];

const TESTIMONIALS = [
  {
    quote:
      "The body-language feedback caught my slouching. I fixed it before my actual interview and got the offer at Atlassian.",
    name: "Priya Sharma",
    role: "Backend Engineer, hired at Atlassian",
  },
  {
    quote:
      "I bombed my first mock. The 17-section report told me exactly which filler words I overused. Three sessions later I cracked Razorpay.",
    name: "Amit Patel",
    role: "Full-stack Developer, hired at Razorpay",
  },
  {
    quote:
      "The AI follow-up questions were sharper than my real interviewer. I walked into the actual loop already knowing the answers.",
    name: "Sneha Iyer",
    role: "Data Analyst, hired at Cred",
  },
  {
    quote:
      "The video replay feature let me rewatch my own awkward pauses. Fixed them before the real thing. Worth every minute.",
    name: "Rahul Kumar",
    role: "SDE-1, hired at Zomato",
  },
  {
    quote:
      "Resume analyzer told me my ATS score was 67. Two edits based on the missing-skills list and it jumped to 91.",
    name: "Meera Krishnan",
    role: "Frontend Engineer, hired at Postman",
  },
  {
    quote:
      "The aptitude category breakdown showed I was weak at data interpretation. I drilled just that section for a week. Cleared every aptitude round after.",
    name: "Karthik Reddy",
    role: "Backend Developer, hired at Swiggy",
  },
];

export function LandingPage() {
  const { set } = useNav();
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ───────── HERO: asymmetric split, single CTA ───────── */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-12 sm:px-6 md:pt-24 md:pb-20 lg:px-8">
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
                src="https://picsum.photos/seed/person-practicing-interview-laptop/640/720"
                alt="A person practicing an interview on their laptop"
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

      {/* ───────── SIX FEATURES: vertical narrative (text + image alternating) ───────── */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
          Six things that actually
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
                    loading="lazy"
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

      {/* ───────── TESTIMONIALS MARQUEE: scrolls right to left slowly ───────── */}
      <section className="overflow-hidden py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Candidates who got hired.
          </h2>
        </div>
        <div className="relative mt-12">
          {/* Edge fade masks */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32"
            aria-hidden="true"
          />
          {/* Marquee track — scrolls right to left slowly */}
          {reduce ? (
            <div className="flex gap-6 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
              {TESTIMONIALS.map((t) => (
                <TestimonialCard key={t.name} t={t} />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex w-max gap-6"
              animate={{ x: [0, -1600] }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <TestimonialCard key={`${t.name}-${i}`} t={t} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ───────── QUIET CTA ───────── */}
      <section className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
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

      {/* ───────── GLOBAL FOOTER (shared across all screens) ───────── */}
      <Footer className="mt-auto" />
    </div>
  );
}

/** Single testimonial card used in the marquee. */
function TestimonialCard({
  t,
}: {
  t: { quote: string; name: string; role: string };
}) {
  return (
    <figure className="w-[320px] shrink-0 rounded-lg border border-black/10 bg-background p-6 dark:border-white/10 sm:w-[380px]">
      <blockquote className="text-base font-medium leading-snug tracking-tight text-foreground">
        {t.quote}
      </blockquote>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{t.name}</span>
        {" - "}
        {t.role}
      </figcaption>
    </figure>
  );
}
