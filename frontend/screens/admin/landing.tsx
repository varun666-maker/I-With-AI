"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileSearch,
  FileText,
  Filter,
  Gauge,
  LineChart,
  Link2,
  ListChecks,
  Mail,
  Mailbox,
  Megaphone,
  Quote,
  ScanFace,
  Send,
  Shield,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import {
  GlowCard,
  Marquee,
  SectionHeading,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const COMPANY_LOGOS = [
  "Acme Corp", "TechStart", "InnovateCo", "Razorpay", "Cred", "Zomato",
  "Postman", "Freshworks", "Atlassian", "Stripe", "Linear", "Notion",
];

const ROI_STATS = [
  { value: "87%", label: "Less screening time", sub: "vs. manual resume review", icon: Clock, tone: "violet" },
  { value: "10×", label: "Faster shortlisting", sub: "500 candidates → top 10 in 1 click", icon: Zap, tone: "amber" },
  { value: "0", label: "Scheduling conflicts", sub: "AI runs interviews 24/7 async", icon: Calendar, tone: "emerald" },
  { value: "20%", label: "Higher offer-accept", sub: "better role-fit from AI scoring", icon: TrendingUp, tone: "sky" },
];

const PAIN_POINTS = [
  {
    icon: FileSearch,
    title: "Drowning in resumes",
    desc: "Recruiters spend ~23 seconds per resume. 500 applicants = 3 hours of pure screening before a single call.",
  },
  {
    icon: Calendar,
    title: "Phone-screen scheduling hell",
    desc: "Timezone back-and-forth, no-shows, reschedules. 30% of screening slots get wasted.",
  },
  {
    icon: Shield,
    title: "No integrity signal",
    desc: "Tab-switching, off-screen help, proxy candidates. You hire the resume, not the person.",
  },
  {
    icon: BarChart3,
    title: "Gut-feel first rounds",
    desc: "Different interviewers ask different questions. No apples-to-apples comparison across candidates.",
  },
];

const FEATURES = [
  {
    icon: Link2,
    title: "One public apply link per campaign",
    desc: "Share on LinkedIn, Naukri, or email. Resumes flow in automatically. No manual data entry, no spreadsheet tracking.",
    span: "lg:col-span-2",
  },
  {
    icon: Bot,
    title: "AI resume ranking",
    desc: "Gemini scores each resume for job-fit % + ATS score. Candidates land in your leaderboard pre-sorted.",
    span: "",
  },
  {
    icon: Send,
    title: "One-click shortlist + invites",
    desc: "Pick top 10 → system auto-generates Candidate IDs + temp passwords → emails all 10 in 2 seconds.",
    span: "",
  },
  {
    icon: ShieldCheck,
    title: "Strict 3-strike proctoring",
    desc: "Mandatory fullscreen + camera. Tab switches, phones, extra persons detected. Webcam frames stored for review.",
    span: "lg:col-span-2",
  },
  {
    icon: Video,
    title: "Live AI interviews",
    desc: "3D avatar asks dynamic follow-ups. No human interviewer needed for first rounds.",
    span: "",
  },
  {
    icon: LineChart,
    title: "Real-time leaderboard",
    desc: "WebSocket-pushed scores per round. Integrity column flags violations before you waste time on a candidate.",
    span: "",
  },
];

const PIPELINE_STEPS = [
  { icon: Building2, label: "Register company", note: "1-minute setup" },
  { icon: Target, label: "Create campaign", note: "Pick role, deadline, rounds, weights" },
  { icon: Link2, label: "Share apply link", note: "Auto-generated + QR code" },
  { icon: Bot, label: "Resumes auto-analyzed", note: "Job-fit %, ATS score, skills" },
  { icon: Send, label: "One-click shortlist", note: "Top N candidates → invite emails sent" },
  { icon: Video, label: "Candidates take assessments", note: "Aptitude → Coding → Interview (proctored)" },
  { icon: ListChecks, label: "Final selection", note: "Decision dropdown + CSV/PDF export" },
];

const COMPARISON = [
  { label: "Time per 500 applicants (first round)", manual: "~40 hours", automated: "1 hour", winner: "automated" },
  { label: "Scheduling conflicts", manual: "30% no-show rate", automated: "Zero (async AI)", winner: "automated" },
  { label: "Interviewer bias", manual: "High. Gut feel", automated: "Standardized AI scoring", winner: "automated" },
  { label: "Proctoring integrity", manual: "None", automated: "3-strike + webcam frames", winner: "automated" },
  { label: "Cross-candidate comparison", manual: "Spreadsheet + notes", automated: "Ranked leaderboard + scores", winner: "automated" },
  { label: "Cost per hire (first round)", manual: "$2,400+ (eng hours)", automated: "$180 (platform fee)", winner: "automated" },
];

const TESTIMONIALS = [
  {
    name: "Vikram Rao",
    role: "Head of Talent · Acme Corp",
    quote:
      "We ran a 500-applicant campus drive in a single afternoon. The AI shortlist was tighter than our senior engineers' manual filter, and we saved 38 engineering hours that week.",
    metric: "38 eng hours saved",
  },
  {
    name: "Anjali Mehta",
    role: "Talent Acquisition Lead · TechStart",
    quote:
      "The proctoring caught 3 candidates using phones off-screen. That alone paid for the platform. We would have hired one of them otherwise.",
    metric: "3 integrity flags caught",
  },
  {
    name: "Rohit Sharma",
    role: "Recruiter · InnovateCo",
    quote:
      "One-click shortlist + auto invite emails is the killer feature. I used to spend 2 hours per drive copy-pasting credentials. Now it's one button.",
    metric: "2 hrs → 1 click",
  },
  {
    name: "Sneha Krishnan",
    role: "HR Director · Razorpay",
    quote:
      "The 17-section report gives us a defensible audit trail for every hire. Legal loves it. Candidates who didn't make it get concrete feedback instead of silence.",
    metric: "100% auditable",
  },
  {
    name: "Karthik Iyer",
    role: "Campus Hiring Manager · Cred",
    quote:
      "Went from 12% offer-accept to 21% after switching. The AI scores role-fit way better than our 30-min phone screens ever did.",
    metric: "+9% accept rate",
  },
];

const PRICING = [
  {
    name: "Starter",
    monthly: 0,
    desc: "For a single hiring drive.",
    features: [
      "1 active campaign",
      "Up to 50 candidates",
      "Public apply link + QR",
      "AI resume ranking",
      "1-click shortlist + invites",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Growth",
    monthly: 299,
    desc: "For ongoing hiring at scale.",
    features: [
      "Unlimited campaigns",
      "Up to 500 candidates / mo",
      "Strict proctoring + webcam frames",
      "Live AI interviews",
      "Real-time leaderboard",
      "CSV / PDF export",
      "Priority support",
    ],
    cta: "Start Free",
    popular: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    desc: "For high-volume & campus drives.",
    features: [
      "Unlimited candidates",
      "Bulk resume upload (100s)",
      "Custom question banks",
      "Dedicated success manager",
      "SSO + audit logs API",
      "On-prem deployment option",
      "SLA + custom integrations",
    ],
    cta: "Book a Demo",
    popular: false,
  },
];

const FAQ = [
  {
    q: "How does the AI rank candidates without bias?",
    a: "Our AI engine evaluates each resume against the job description you provide. Scores are based on skill-match, experience relevance, and project depth. Never name, gender, photo, or college. The 17-section report is fully auditable, so you can defend every hire.",
  },
  {
    q: "What happens if a candidate's internet drops mid-interview?",
    a: "Answers auto-save to localStorage every 30 seconds. If the browser crashes, the candidate resumes from their last saved answer. The interview recording is uploaded in chunks, so even a hard disconnect preserves what was captured.",
  },
  {
    q: "Can candidates cheat the proctoring?",
    a: "The 3-strike system is strict: fullscreen + camera are mandatory, COCO-SSD runs object detection throughout, and every flagged frame is stored to Cloudinary for your review. A 20% score penalty applies on the 3rd strike. Serious violations (phone detected, extra person) can auto-disqualify.",
  },
  {
    q: "Do candidates need to install anything?",
    a: "No. Everything runs in Chrome 120+. We use Web Speech API for TTS, MediaRecorder for capture, face-api.js + MediaPipe in-browser. Zero downloads, zero plugins.",
  },
  {
    q: "Can we use our own question bank?",
    a: "Yes. Each campaign has its own Question Set Manager. Add aptitude questions one-by-one or bulk-upload CSV. Coding problems support DSA + SQL with per-language function signatures and 10 test cases (3 visible + 7 hidden).",
  },
  {
    q: "How does pricing scale?",
    a: "Starter is free forever for a single drive. Growth is $299/mo for up to 500 candidates. Enterprise is custom. Talk to us for high-volume campus drives, on-prem, or SSO.",
  },
];

export function CompanyLanding() {
  const { set } = useNav();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ───────── HERO ───────── */}
      <section className="relative px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <Building2 className="h-3 w-3" /> For Companies · Hiring Mode
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Run your next campus drive
            <br className="hidden sm:block" />{" "}
            <span className="text-violet-500 dark:text-violet-400">in an afternoon.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg"
          >
            One public apply link. AI ranks every resume. One click shortlists
            the top 10 and sends invite emails. Candidates take proctored
            aptitude, coding, and AI interview rounds async. You pick from a
            ranked leaderboard. No scheduling, no phone screens, no gut-feel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="h-12 rounded-full bg-violet-500 px-7 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
              onClick={() => set("company-register")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Start Hiring Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7"
              onClick={() => {
                document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Video className="mr-2 h-4 w-4" />
              See How It Works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free for 1 campaign
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> GDPR-ready
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Audit-trail reports
            </span>
          </motion.div>
        </div>

        {/* ROI dashboard mockup */}
        <CompanyMockup />
      </section>

      {/* ───────── ROI STATS ───────── */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 border-y border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
            What companies actually get
          </p>
          <StaggeredReveal className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {ROI_STATS.map((s) => (
              <motion.div key={s.label} variants={revealItem}>
                <GlowCard className="h-full p-5 text-center">
                  <s.icon
                    className={cn(
                      "mx-auto h-6 w-6",
                      s.tone === "violet" && "text-violet-500 dark:text-violet-300",
                      s.tone === "amber" && "text-amber-500 dark:text-amber-300",
                      s.tone === "emerald" && "text-emerald-500 dark:text-emerald-300",
                      s.tone === "sky" && "text-sky-500 dark:text-sky-300",
                    )}
                  />
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-violet-500 dark:text-violet-400">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm font-medium">{s.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                </GlowCard>
              </motion.div>
            ))}
          </StaggeredReveal>
        </div>
      </section>

      {/* ───────── PAIN POINTS ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="The problem"
            title={<>First-round screening is <span className="text-violet-500 dark:text-violet-400">broken</span></>}
            description="Recruiters and engineering managers waste dozens of hours per drive on work the AI can do better, faster, and with audit trail."
          />
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PAIN_POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <GlowCard className="h-full p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-500/10 text-rose-500 ring-1 ring-inset ring-rose-400/20 dark:text-rose-300">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── BENTO FEATURES ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="The platform"
            title={<>Built for <span className="text-violet-500 dark:text-violet-400">high-volume hiring</span></>}
            description="Six pillars that take you from a job description to a final shortlist. Without scheduling a single phone screen."
          />
          <StaggeredReveal className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={revealItem} className={cn("relative", f.span)}>
                <GlowCard className="h-full p-6">
                  <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-violet-500/10 text-violet-500 ring-1 ring-inset ring-black/10 dark:text-violet-300 dark:ring-white/10">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </GlowCard>
              </motion.div>
            ))}
          </StaggeredReveal>
        </div>
      </section>

      {/* ───────── AUTOMATION PIPELINE ───────── */}
      <section id="pipeline" className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How it works"
            title={<>From job description to <span className="text-violet-500 dark:text-violet-400">final shortlist</span> in 7 steps</>}
            description="One recruiter. One afternoon. Zero engineering interviews scheduled."
          />
          <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {PIPELINE_STEPS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <GlowCard className="h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      STEP 0{i + 1}
                    </span>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/15 text-violet-500 ring-1 ring-inset ring-black/10 dark:text-violet-300 dark:ring-white/10">
                      <s.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug">{s.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>

          {/* Highlighted automation callout */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-10"
          >
            <GlowCard className="relative overflow-hidden p-8 md:p-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
                <div className="md:col-span-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <Zap className="h-3 w-3" /> The killer automation
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    Admin shares link →{" "}
                    <span className="text-violet-500 dark:text-violet-400">candidates auto-appear</span> →{" "}
                    one click shortlists 10 →{" "}
                    <span className="text-violet-500 dark:text-violet-400">emails auto-sent.</span>
                  </h3>
                  <p className="mt-4 text-sm text-muted-foreground md:text-base">
                    No CSV exports. No copy-pasting credentials. No scheduling
                    individual invite emails. The system generates unique
                    Candidate IDs (e.g. <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">BACKEN-3FA82C</code>),
                    temporary passwords, and sends branded invite emails with
                    the login URL + deadline. All in 2 seconds.
                  </p>
                </div>
                <div className="md:justify-self-end">
                  <Button
                    size="lg"
                    onClick={() => set("candidate-leaderboard")}
                    className="rounded-full bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
                  >
                    See the leaderboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </section>

      {/* ───────── COMPARISON TABLE ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Manual vs InterviewAI"
            title={<>The math is <span className="text-violet-500 dark:text-violet-400">uncomfortable</span></>}
            description="Run the numbers on your last hiring drive. Then run them with InterviewAI."
          />
          <GlowCard className="mt-12 overflow-hidden p-0">
            <div className="grid grid-cols-3 border-b border-black/10 bg-black/[0.03] text-xs uppercase tracking-wider text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
              <div className="p-4">Metric</div>
              <div className="p-4 text-rose-500 dark:text-rose-300">Manual process</div>
              <div className="p-4 text-emerald-500 dark:text-emerald-300">With InterviewAI</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "grid grid-cols-3 items-start gap-2 p-4 text-sm",
                  i % 2 === 1 && "bg-black/[0.015] dark:bg-white/[0.015]",
                )}
              >
                <div className="font-medium">{row.label}</div>
                <div className="flex items-start gap-1.5 text-rose-500/80 dark:text-rose-300/80">
                  <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{row.manual}</span>
                </div>
                <div className="flex items-start gap-1.5 text-emerald-500 dark:text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{row.automated}</span>
                </div>
              </div>
            ))}
          </GlowCard>
        </div>
      </section>

      {/* ───────── PROCTORING SPOTLIGHT ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                <Shield className="h-3 w-3" /> Proctoring &amp; integrity
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Catch the cheaters. <span className="text-violet-500 dark:text-violet-400">Defend every hire.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every candidate round runs in fullscreen with mandatory camera.
                Three strikes: tab switch, fullscreen exit, or detected
                anomaly, and the test auto-submits with a 20% score penalty.
                Every flagged webcam frame is stored to Cloudinary for your
                post-hire audit.
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  { icon: ScanFace, label: "COCO-SSD detects phones & extra persons in frame" },
                  { icon: ShieldCheck, label: "3-strike auto-submit + integrity flag" },
                  { icon: FileText, label: "Every flag stored with webcam frame for review" },
                  { icon: Gauge, label: "Integrity column on leaderboard. Clean / Flags / Penalty" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-2.5 text-sm">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
                    <span className="text-foreground/80">{item.label}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-6 rounded-full"
                onClick={() => set("proctoring-review")}
              >
                See the proctoring review screen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <GlowCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Candidate: Priya Sharma</p>
                  <p className="font-mono text-[10px] text-muted-foreground">BACKEN-3FA82C</p>
                </div>
                <Badge className="border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200">
                  <Shield className="mr-1 h-3 w-3" /> 2 flags
                </Badge>
              </div>
              <div className="space-y-2">
                {[
                  { time: "10:23", event: "Tab switch (1/3)", sev: "warn" },
                  { time: "10:45", event: "Tab switch (2/3)", sev: "warn" },
                  { time: "11:02", event: "Tab switch (3/3) → Auto-submitted", sev: "danger" },
                  { time: "14:30", event: "Phone detected in frame", sev: "danger" },
                ].map((e) => (
                  <div
                    key={e.time + e.event}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-2.5 text-xs",
                      e.sev === "warn"
                        ? "border-amber-400/20 bg-amber-500/5"
                        : "border-rose-400/20 bg-rose-500/5",
                    )}
                  >
                    <span className="font-mono text-muted-foreground">{e.time}</span>
                    <span
                      className={cn(
                        "flex-1",
                        e.sev === "warn" ? "text-amber-700 dark:text-amber-200" : "text-rose-700 dark:text-rose-200",
                      )}
                    >
                      {e.event}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase",
                        e.sev === "warn"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-200"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-200",
                      )}
                    >
                      {e.sev === "warn" ? "Warning" : "Critical"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-black/10 bg-black/[0.02] p-3 text-xs dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Integrity score</span>
                  <span className="font-mono text-rose-500 dark:text-rose-300">20% penalty applied</span>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* ───────── LOGO CLOUD ───────── */}
      <section className="relative py-12 border-y border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Hiring teams who switched to InterviewAI
          </p>
          <Marquee>
            {COMPANY_LOGOS.map((logo) => (
              <span
                key={logo}
                className="text-xl font-semibold tracking-tight text-foreground/40 transition-colors hover:text-foreground/80"
              >
                {logo}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ───────── TESTIMONIALS ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="From the recruiters using it"
            title={<>They're not going back to <span className="text-violet-500 dark:text-violet-400">spreadsheets</span></>}
            description="Real stories from talent teams who ran their last drive on InterviewAI."
          />
          <Marquee className="mt-14" pauseOnHover>
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className="w-[340px] shrink-0">
                <GlowCard className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <Quote className="h-6 w-6 text-foreground/30" />
                    <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {t.metric}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-pretty text-foreground/90">{t.quote}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-500 text-xs font-semibold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </GlowCard>
              </article>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ───────── PRICING ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Pricing"
            title="Pay per drive. Scale when you hire."
            description="Starter is free forever for a single campaign. Upgrade when you're running multiple drives a month."
          />
          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-full border border-black/10 bg-black/[0.03] p-1 dark:border-white/10 dark:bg-white/[0.03]">
              {(["monthly", "yearly"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                    billing === b ? "text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {b}
                  {billing === b && (
                    <motion.span
                      layoutId="billing-pill-co"
                      className="absolute inset-0 -z-10 rounded-full bg-violet-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PRICING.map((p) => (
              <div key={p.name} className={cn(p.popular && "md:-mt-3")}>
                <GlowCard
                  className={cn(
                    "relative h-full overflow-hidden p-6",
                    p.popular && "border-violet-400/40 bg-violet-500/[0.06]",
                  )}
                >
                  {p.popular && (
                    <Badge className="mb-4 w-fit border-violet-400/30 bg-violet-500/15 text-violet-700 dark:text-violet-200">
                      Most popular
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    {p.monthly === null ? (
                      <span className="text-3xl font-semibold tracking-tight">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-semibold tracking-tight">
                          ${billing === "monthly" ? p.monthly : Math.round(p.monthly * 0.8)}
                        </span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </>
                    )}
                  </div>
                  {billing === "yearly" && p.monthly !== null && (
                    <p className="mt-1 text-[11px] text-emerald-500 dark:text-emerald-300">
                      Billed annually · 20% off
                    </p>
                  )}
                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      "mt-7 w-full rounded-full",
                      p.popular
                        ? "bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
                        : "bg-black/10 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15",
                    )}
                    onClick={() => set(p.monthly === null ? "company-landing" : "company-register")}
                  >
                    {p.cta}
                  </Button>
                </GlowCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="What talent teams ask before switching"
            description="Still have a question? Hit us up. We'll get back within a working day."
          />
          <div className="mt-12 space-y-3">
            {FAQ.map((item, i) => (
              <GlowCard key={i} className="overflow-hidden p-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-sm font-semibold md:text-base">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      openFaq === i && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <GlowCard className="relative overflow-hidden p-10 text-center md:p-16">
            <Megaphone className="mx-auto h-10 w-10 text-violet-500 dark:text-violet-300" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance md:text-5xl">
              Your next drive could be{" "}
              <span className="text-violet-500 dark:text-violet-400">next Tuesday.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Create a free company account, generate your apply link, and
              start collecting ranked resumes in under 5 minutes. No credit
              card, no sales call, no commitment.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="h-12 rounded-full bg-violet-500 px-7 text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
                onClick={() => set("company-register")}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Create Company Account
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-12 rounded-full px-7 text-muted-foreground"
                onClick={() => set("admin-dashboard")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Tour the admin dashboard
              </Button>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* Footer is handled globally by SmartFooter in page.tsx */}
    </div>
  );
}

function FooterCol({
  title,
  links,
  onClick,
}: {
  title: string;
  links: string[];
  onClick: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <button
              onClick={onClick}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {l}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A floating animated dashboard mockup showing what the recruiter sees.
 * Leaderboard with ranked candidates, integrity column, and a
 * "Shortlist & Send Invites" CTA.
 */
function CompanyMockup() {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <GlowCard className="relative overflow-hidden p-2 md:p-3">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-black/10 px-4 py-2.5 dark:border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <div className="ml-3 flex-1">
            <div className="h-5 max-w-xs rounded-md bg-black/5 dark:bg-white/5" />
          </div>
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
            <Bell className="mr-1 h-3 w-3" /> 3 new applicants
          </Badge>
        </div>

        {/* Dashboard mockup */}
        <div className="grid grid-cols-12 gap-3 p-3 md:p-5">
          {/* Stats row */}
          <div className="col-span-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Total", value: "47", tone: "text-violet-500 dark:text-violet-300", icon: Users },
              { label: "Shortlisted", value: "10", tone: "text-emerald-500 dark:text-emerald-300", icon: ListChecks },
              { label: "Invited", value: "10", tone: "text-sky-500 dark:text-sky-300", icon: Mail },
              { label: "Completed", value: "6", tone: "text-amber-500 dark:text-amber-300", icon: CheckCircle2 },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-black/[0.02] p-3 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px]">{s.label}</span>
                  <s.icon className={cn("h-3.5 w-3.5", s.tone)} />
                </div>
                <p className={cn("mt-1 text-lg font-semibold", s.tone)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Leaderboard table preview */}
          <div className="col-span-12">
            <div className="rounded-xl bg-black/[0.02] p-3 dark:bg-white/[0.02]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold">Backend SDE-1 · Candidate leaderboard</p>
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Sorted by Job Fit</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { rank: 1, name: "Priya Sharma", src: "Apply Link", fit: 91, ats: 88, integrity: "clean", status: "Invited" },
                  { rank: 2, name: "Amit Patel", src: "Apply Link", fit: 87, ats: 82, integrity: "clean", status: "Invited" },
                  { rank: 3, name: "Sneha Iyer", src: "Apply Link", fit: 84, ats: 79, integrity: "clean", status: "Invited" },
                  { rank: 4, name: "Rahul Kumar", src: "Bulk Upload", fit: 81, ats: 76, integrity: "flags", status: "Invited" },
                  { rank: 5, name: "Meera Krishnan", src: "Apply Link", fit: 78, ats: 73, integrity: "clean", status: "Invited" },
                ].map((c) => (
                  <div
                    key={c.rank}
                    className="grid grid-cols-12 items-center gap-2 rounded-md border border-black/5 bg-black/[0.02] px-2.5 py-2 text-[11px] dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <span className="col-span-1 font-mono text-muted-foreground">
                      #{c.rank}
                    </span>
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">
                        {c.name.charAt(0)}
                      </div>
                      <span className="truncate font-medium">{c.name}</span>
                    </div>
                    <span className="col-span-2 hidden md:block">
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                          c.src === "Apply Link"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200"
                            : "bg-sky-500/15 text-sky-700 dark:text-sky-200",
                        )}
                      >
                        {c.src}
                      </span>
                    </span>
                    <div className="col-span-3 flex items-center gap-1.5 md:col-span-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${c.fit}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px]">{c.fit}%</span>
                    </div>
                    <span className="col-span-2 hidden md:block font-mono text-[10px] text-muted-foreground">
                      ATS {c.ats}
                    </span>
                    <span className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                      {c.integrity === "clean" ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  + 42 more candidates
                </span>
                <div className="flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1.5 text-[10px] font-medium text-white">
                  <Send className="h-3 w-3" />
                  Shortlist &amp; Send Invites · 10
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating UI elements */}
        <FloatingChip
          className="left-2 top-1/3"
          icon={<Link2 className="h-3 w-3 text-violet-500 dark:text-violet-300" />}
          label="Apply link live · 23 clicks"
        />
        <FloatingChip
          className="right-2 top-1/4"
          icon={<Bot className="h-3 w-3 text-emerald-500 dark:text-emerald-300" />}
          label="47 resumes auto-analyzed"
          delay={0.8}
        />
        <FloatingChip
          className="right-1/4 bottom-2"
          icon={<Mail className="h-3 w-3 text-amber-500 dark:text-amber-300" />}
          label="10 invite emails sent"
          delay={1.4}
        />
      </GlowCard>
    </motion.div>
  );
}

function FloatingChip({
  className,
  icon,
  label,
  delay = 0,
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  delay?: number;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: shouldReduce ? 0 : [0, -8, 0],
      }}
      transition={{
        opacity: { delay: delay + 1, duration: 0.4 },
        scale: { delay: delay + 1, duration: 0.4 },
        y: shouldReduce
          ? undefined
          : { repeat: Infinity, duration: 4, ease: "easeInOut", delay: delay + 1 },
      }}
      className={cn(
        "absolute hidden md:flex items-center gap-1.5 rounded-full border border-black/10 bg-card/90 px-2.5 py-1.5 text-[11px] backdrop-blur-xl shadow-sm dark:border-white/15",
        className,
      )}
    >
      {icon}
      {label}
    </motion.div>
  );
}
