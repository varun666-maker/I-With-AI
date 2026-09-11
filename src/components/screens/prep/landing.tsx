"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Code2,
  FileText,
  Mic,
  PlayCircle,
  Quote,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Upload,
  UserCheck,
  Video,
  Zap,
} from "lucide-react";
import {
  AuroraBackground,
  BorderBeam,
  GlowCard,
  MagneticButton,
  Marquee,
  PulseBadge,
  SectionHeading,
  Shimmer,
  StaggeredReveal,
  revealItem,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const LOGOS = [
  "Google", "Amazon", "Microsoft", "Meta", "Netflix", "Adobe",
  "Stripe", "Linear", "Vercel", "Notion", "Figma", "Airbnb",
];

const FEATURES = [
  {
    icon: FileText,
    title: "AI Resume Analyzer",
    desc: "ATS score, missing skills, and a free improvement plan in 15 seconds.",
    span: "lg:col-span-2",
  },
  {
    icon: Brain,
    title: "1,500+ Aptitude Questions",
    desc: "Quant, Logical, Verbal, Analytical & DI banks, retake unlimited.",
    span: "",
  },
  {
    icon: Code2,
    title: "Coding Arena",
    desc: "Monaco editor + AI review with complexity & refactor suggestions.",
    span: "",
  },
  {
    icon: Video,
    title: "Live AI Interview",
    desc: "3D avatar asks dynamic follow-ups. Body language & emotion analysis.",
    span: "lg:col-span-2",
  },
  {
    icon: FileText,
    title: "17-Section Report",
    desc: "Strengths, gaps, 6-week roadmap — exported as PDF.",
    span: "",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    desc: "Heatmaps, score trends, and skill radar across sessions.",
    span: "",
  },
];

const STEPS = [
  { icon: Upload, label: "Upload Resume", note: "AI extracts skills" },
  { icon: Brain, label: "Practice Tests", note: "Aptitude + Coding" },
  { icon: Video, label: "AI Interview", note: "Live, adaptive" },
  { icon: FileText, label: "Get Report", note: "17-section PDF" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Backend Engineer @ Atlassian",
    quote:
      "The AI interview felt real. Body language feedback caught my slouching — fixed it before my actual interview.",
    rating: 5,
    accent: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    name: "Amit Patel",
    role: "Full-stack @ Razorpay",
    quote:
      "Coding Arena's AI refactor suggestions are sharper than my senior dev's reviews. Cracked two hard loops in 3 days.",
    rating: 5,
    accent: "from-sky-500/20 to-emerald-500/20",
  },
  {
    name: "Sneha Iyer",
    role: "Data Analyst @ Cred",
    quote:
      "The 17-section report literally handed me a 6-week study plan. Went from 62 → 88 in interview score.",
    rating: 5,
    accent: "from-amber-500/20 to-rose-500/20",
  },
  {
    name: "Rahul Kumar",
    role: "SDE-1 @ Zomato",
    quote:
      "Used the platform for 3 weeks before campus placements. Got placed at 4 companies. Worth every minute.",
    rating: 5,
    accent: "from-emerald-500/20 to-violet-500/20",
  },
  {
    name: "Meera Krishnan",
    role: "Frontend @ Postman",
    quote:
      "Resume analyzer told me exactly which keywords I was missing. ATS score jumped from 67 to 91 in one edit.",
    rating: 5,
    accent: "from-fuchsia-500/20 to-sky-500/20",
  },
];

const PRICING = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    desc: "Perfect for getting started.",
    features: ["3 AI interviews / month", "1 resume analysis", "100 aptitude questions", "Basic reports"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    monthly: 19,
    yearly: 15,
    desc: "For serious job seekers.",
    features: [
      "Unlimited AI interviews",
      "Unlimited resume analyses",
      "Full 1,500+ aptitude bank",
      "17-section PDF reports",
      "Coding Arena with AI review",
      "Priority email support",
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    name: "Teams",
    monthly: 49,
    yearly: 39,
    desc: "For cohorts & campus drives.",
    features: [
      "Everything in Pro",
      "Up to 50 seats",
      "Admin dashboard",
      "Bulk candidate upload",
      "Proctoring & integrity scores",
      "Dedicated success manager",
    ],
    cta: "Talk to Sales",
    popular: false,
  },
];

export function LandingPage() {
  const { set } = useNav();
  const shouldReduce = useReducedMotion();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <AuroraBackground>
      {/* HERO */}
      <section className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <PulseBadge>AI-powered · Gemini 1.5 Flash · Whisper · MediaPipe</PulseBadge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Master every interview
            <br className="hidden sm:block" />
            <span className="gradient-text text-glow"> with AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg"
          >
            A complete AI interview assistant — resume analyzer, aptitude
            practice, coding arena, and a live AI interviewer that gives you
            real-time body-language feedback. Plus a full hiring pipeline for
            companies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <MagneticButton
              size="lg"
              className="h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
              onClick={() => set("auth")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Preparing Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButton>
            <MagneticButton
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 border-white/15 bg-white/5 backdrop-blur hover:bg-white/10"
              onClick={() => set("company-register")}
            >
              For Companies
              <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <div className="flex -space-x-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-violet-500 to-fuchsia-500"
                  style={{ opacity: 1 - i * 0.12 }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-white">5,000+</span> students
              preparing right now
            </p>
          </motion.div>
        </div>

        {/* Product mockup */}
        <ProductMockup />
      </section>

      {/* SOCIAL PROOF / LOGO CLOUD */}
      <section className="relative py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by alumni at
          </p>
          <Marquee>
            {LOGOS.map((logo) => (
              <span
                key={logo}
                className="text-xl font-semibold tracking-tight text-white/40 transition-colors hover:text-white/80"
              >
                {logo}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Everything in one place"
            title={<>One platform for the entire <span className="gradient-text">interview lifecycle</span></>}
            description="From the first resume upload to the final report — six pillars that take you from unsure to unstoppable."
          />

          <StaggeredReveal className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={revealItem} className={cn("relative", f.span)}>
                <GlowCard className="h-full p-6">
                  <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300 ring-1 ring-inset ring-white/10">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {f.desc}
                  </p>
                  {i === 3 && <BorderBeam size={160} duration={10} />}
                </GlowCard>
              </motion.div>
            ))}
          </StaggeredReveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How it works"
            title="From upload to report in four steps"
            description="No setup. No fluff. Upload once, and the platform handles the rest — even generating your personalised 6-week learning roadmap."
          />
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative"
              >
                <GlowCard className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      Step 0{i + 1}
                    </span>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-white/10">
                      <s.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-4 font-semibold">{s.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
                </GlowCard>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE SHOWCASE / STICKY-SCROLL DEMO */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="See it in action"
            title={<>The live AI interview — <span className="gradient-text">like the real thing</span></>}
            description="A 3D avatar asks dynamic questions, listens to your answers, generates follow-ups, and analyses your eye contact, posture and emotion in real time."
          />
          <StickyWalkthrough />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Loved by 5,000+ candidates"
            title="From rejected to rounds cleared"
            description="Real stories from candidates who used the platform and cracked interviews at top companies."
          />
          <Marquee className="mt-14" pauseOnHover>
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name}
                className="w-[340px] shrink-0"
              >
                <GlowCard className={cn("h-full p-6 bg-gradient-to-br", t.accent)}>
                  <div className="flex items-center gap-1 text-amber-300">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="mt-4 h-6 w-6 text-white/30" />
                  <p className="mt-2 text-sm text-pretty text-foreground/90">
                    {t.quote}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
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

      {/* PRICING */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Upgrade when you're ready."
            description="No credit card to start. Cancel anytime. Yearly saves you 20%."
          />

          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
              {(["monthly", "yearly"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                    billing === b ? "text-white" : "text-muted-foreground hover:text-white",
                  )}
                >
                  {b}
                  {billing === b && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
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
                  {p.popular && <BorderBeam size={220} duration={12} />}
                  {p.popular && (
                    <Badge className="mb-4 w-fit border-violet-400/30 bg-violet-500/15 text-violet-200">
                      <Sparkles className="mr-1 h-3 w-3" /> Popular
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      ${billing === "monthly" ? p.monthly : p.yearly}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      "mt-7 w-full rounded-full",
                      p.popular
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
                        : "bg-white/10 hover:bg-white/15 border border-white/10",
                    )}
                    onClick={() => set("auth")}
                  >
                    {p.cta}
                  </Button>
                </GlowCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <GlowCard className="relative overflow-hidden p-10 text-center md:p-16">
            <BorderBeam size={260} duration={14} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/20" />
            <Trophy className="mx-auto h-10 w-10 text-amber-300" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance md:text-5xl">
              Ready to ace your <span className="gradient-text">next interview?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Join 5,000+ students who cracked interviews at top companies with
              AI-guided practice. Free forever — no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <MagneticButton
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
                onClick={() => set("auth")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Free Today
              </MagneticButton>
              <Button
                size="lg"
                variant="ghost"
                className="h-12 rounded-full px-7 text-muted-foreground"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-semibold">
                  Interview<span className="gradient-text">AI</span>
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                The complete AI interview assistant — for both candidates and
                companies.
              </p>
            </div>
            <FooterCol
              title="Prep Mode"
              links={["Resume Analyzer", "Aptitude", "Coding Arena", "AI Interview", "Reports"]}
              onClick={() => set("auth")}
            />
            <FooterCol
              title="Hiring Mode"
              links={["For Companies", "Pricing", "Proctoring", "Bulk Upload", "Leaderboard"]}
              onClick={() => set("company-register")}
            />
            <FooterCol
              title="Company"
              links={["About", "Blog", "Careers", "Privacy", "Terms"]}
              onClick={() => set("landing")}
            />
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2025 InterviewAI. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                className="h-9 w-full max-w-xs rounded-full border border-white/10 bg-white/5 px-4 text-xs outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/20"
              />
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0"
              >
                <Zap className="mr-1 h-3 w-3" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </AuroraBackground>
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
              className="text-sm text-foreground/70 transition-colors hover:text-white"
            >
              {l}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-20 max-w-5xl"
    >
      <GlowCard className="relative overflow-hidden p-2 md:p-3">
        <BorderBeam size={280} duration={14} />
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <div className="ml-3 flex-1">
            <div className="h-5 w-40 rounded-md bg-white/5" />
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="grid grid-cols-12 gap-3 p-3 md:p-5">
          {/* Sidebar */}
          <div className="col-span-3 hidden md:block">
            <div className="space-y-2 rounded-xl bg-white/[0.02] p-3">
              {["Dashboard", "Resume", "Aptitude", "Coding", "Interview", "Reports"].map((l, i) => (
                <div
                  key={l}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                    i === 0 ? "bg-violet-500/15 text-violet-200" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-violet-400" : "bg-white/20")} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-12 md:col-span-9 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Welcome back, Priya 👋</p>
                <p className="text-[11px] text-muted-foreground">Last interview: Jan 15 · Score 78%</p>
              </div>
              <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                <TrendingUp className="mr-1 h-3 w-3" /> +12 this week
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MockStat label="Overall" value="78%" tone="violet" icon={<BarChart3 className="h-3.5 w-3.5" />} />
              <MockStat label="Resume ATS" value="87" tone="emerald" icon={<FileText className="h-3.5 w-3.5" />} />
              <MockStat label="Coding" value="7/10" tone="amber" icon={<Code2 className="h-3.5 w-3.5" />} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.02] p-3">
                <p className="text-xs text-muted-foreground">Score trend</p>
                <div className="mt-3 h-12 w-full">
                  <svg viewBox="0 0 200 50" className="h-12 w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,35 L25,30 L50,32 L75,22 L100,25 L125,15 L150,18 L175,8 L200,12"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0,35 L25,30 L50,32 L75,22 L100,25 L125,15 L150,18 L175,8 L200,12 L200,50 L0,50 Z"
                      fill="url(#trend)"
                    />
                  </svg>
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-3">
                <p className="text-xs text-muted-foreground">Recent interviews</p>
                <div className="mt-2 space-y-1.5">
                  {[
                    ["HR / Behavioral", "82%"],
                    ["Technical", "75%"],
                    ["Coding", "91%"],
                  ].map(([t, s]) => (
                    <div key={t} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{t}</span>
                      <span className="font-mono text-white">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating UI elements */}
        <FloatingChip
          className="left-2 top-1/3"
          icon={<Mic className="h-3 w-3 text-violet-300" />}
          label="Listening…"
        />
        <FloatingChip
          className="right-2 top-1/4"
          icon={<UserCheck className="h-3 w-3 text-emerald-300" />}
          label="Eye contact 78%"
          delay={0.8}
        />
        <FloatingChip
          className="right-1/4 bottom-2"
          icon={<Sparkles className="h-3 w-3 text-amber-300" />}
          label="AI feedback ready"
          delay={1.4}
        />
      </GlowCard>
    </motion.div>
  );
}

function MockStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "violet" | "emerald" | "amber";
  icon: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    violet: "text-violet-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
  };
  return (
    <div className="rounded-xl bg-white/[0.02] p-3">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px]">{label}</span>
        <span className={tones[tone]}>{icon}</span>
      </div>
      <p className={cn("mt-1 text-lg font-semibold", tones[tone])}>{value}</p>
    </div>
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { delay: delay + 1, duration: 0.4 },
        scale: { delay: delay + 1, duration: 0.4 },
        y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: delay + 1 },
      }}
      className={cn(
        "absolute hidden md:flex items-center gap-1.5 rounded-full border border-white/15 bg-card/90 px-2.5 py-1.5 text-[11px] backdrop-blur-xl shadow-2xl",
        className,
      )}
    >
      {icon}
      {label}
    </motion.div>
  );
}

function StickyWalkthrough() {
  const [active, setActive] = useState(0);
  const steps = [
    {
      title: "AI avatar greets you",
      desc: "A 3D interviewer speaks your first question aloud with realistic lip-sync. Mic activates automatically when the avatar stops.",
      icon: Video,
      mock: (
        <div className="relative grid h-44 w-44 place-items-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 blur-2xl" />
          <motion.div
            animate={{ y: [0, -8, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-2xl"
          >
            <Sparkles className="h-12 w-12 text-white" />
            {/* Waveform */}
            <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-0.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-violet-300"
                  animate={{ height: [4, 14, 4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.06,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      title: "You answer — transcript builds live",
      desc: "Whisper transcribes your speech on the fly. Your answer appears in real time so you always know what was captured.",
      icon: Mic,
      mock: (
        <div className="space-y-2.5 w-full">
          <div className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-100 border border-violet-400/20 w-fit">
            AI · Tell me about a tough bug you solved recently.
          </div>
          <div className="ml-auto max-w-[80%] rounded-lg bg-white/10 px-3 py-2 text-xs">
            Sure! Last month I was debugging a memory leak in our FastAPI
            service. Turns out a Redis connection wasn&rsquo;t being released
            back to the pool…
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-violet-400"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </span>
            AI is thinking…
          </div>
        </div>
      ),
    },
    {
      title: "Real-time body-language analysis",
      desc: "MediaPipe tracks eye contact & posture. face-api.js detects emotion every 5 seconds. The indicators update live.",
      icon: UserCheck,
      mock: (
        <div className="grid w-full grid-cols-3 gap-2">
          {[
            { label: "Emotion", value: "Neutral", tone: "text-sky-300" },
            { label: "Eye Contact", value: "78%", tone: "text-emerald-300" },
            { label: "Posture", value: "Good", tone: "text-emerald-300" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className={cn("mt-1 text-sm font-semibold", s.tone)}>{s.value}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Personalised 17-section report",
      desc: "After the interview, you get strengths, gaps, an emotion timeline chart, top 7 improvements and a 6-week learning roadmap.",
      icon: FileText,
      mock: (
        <div className="w-full space-y-2">
          {[
            "Overall Score: 82 / 100",
            "Recommendation: Recommend",
            "Top Strength: Strong conceptual clarity",
            "Improvement: Reduce filler words (23)",
            "6-Week Roadmap: Ready",
          ].map((l, i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {l}
            </motion.div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left sticky */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-2">
          {steps.map((s, i) => (
            <button
              key={s.title}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                active === i
                  ? "border-violet-400/40 bg-violet-500/[0.07]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20",
              )}
            >
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset transition-colors",
                  active === i
                    ? "bg-violet-500/15 text-violet-300 ring-violet-400/30"
                    : "bg-white/5 text-muted-foreground ring-white/10",
                )}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p
                  className={cn(
                    "mt-0.5 text-xs transition-all",
                    active === i
                      ? "text-muted-foreground max-h-24 opacity-100"
                      : "max-h-0 overflow-hidden opacity-0 lg:max-h-24 lg:opacity-60",
                  )}
                >
                  {s.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right animated mockup */}
      <GlowCard className="min-h-[320px] overflow-hidden p-6">
        <div className="grid min-h-[280px] place-items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-4"
            >
              {steps[active].mock}
              <p className="text-xs font-medium text-muted-foreground">
                {steps[active].title}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </GlowCard>
    </div>
  );
}

