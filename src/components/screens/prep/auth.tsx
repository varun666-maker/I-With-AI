"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  EyeOff,
  Github,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Video,
  X,
} from "lucide-react";
import { Shimmer } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Developer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "Mobile Developer",
  "QA Engineer",
  "ML Engineer",
  "Product Manager",
];

const SKILL_SUGGESTIONS = [
  "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI",
  "Django", "Flask", "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker",
  "Kubernetes", "AWS", "GCP", "Azure", "GraphQL", "REST", "Kafka",
  "TensorFlow", "PyTorch", "Pandas", "NumPy", "Spark", "Git", "CI/CD",
  "System Design", "Microservices",
];

const DEGREE_OPTIONS = [
  "B.Tech",
  "B.E.",
  "B.Sc",
  "B.A.",
  "B.Com",
  "M.Tech",
  "M.E.",
  "M.Sc",
  "MCA",
  "MBA",
  "Ph.D.",
];

type TabKey = "signup" | "login";

export function AuthScreen() {
  const { set } = useNav();
  const [tab, setTab] = useState<TabKey>("signup");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-1 gap-0 px-0 lg:grid-cols-2 lg:gap-0">
        {/* Left: marketing panel */}
        <aside className="relative hidden overflow-hidden border-r border-black/10 lg:block dark:border-white/10">
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <div>
              <Badge variant="outline" className="border-black/10 bg-black/[0.02] text-[11px] uppercase tracking-widest text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]">
                InterviewAI · Prep Mode
              </Badge>
              <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-balance xl:text-5xl">
                Land your <span className="text-violet-500 dark:text-violet-400">dream role</span><br /> with AI on your side.
              </h2>
              <p className="mt-4 max-w-md text-base text-pretty text-muted-foreground">
                Resume analysis, 1,500+ aptitude questions, a coding arena with AI
                review, and live AI interviews with body-language feedback. Free
                forever for students.
              </p>
            </div>

            <AvatarMock />

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Students" value="5,000+" />
              <Stat label="Mock Qs" value="1.5k+" />
              <Stat label="Reports" value="17-sec" />
            </div>
          </div>
        </aside>

        {/* Right: form panel */}
        <section className="relative flex items-start justify-center px-4 py-8 sm:px-10 sm:py-12">
          <div className="w-full max-w-md">
            <button
              onClick={() => set("landing")}
              className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </button>

            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm sm:p-8 dark:border-white/10">
              {/* Tabs */}
              <div className="inline-flex w-full rounded-full border border-black/10 bg-black/[0.02] p-1 dark:border-white/10 dark:bg-white/[0.02]">
                {(["signup", "login"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setStep(1);
                    }}
                    className={cn(
                      "relative isolate flex-1 rounded-full py-1.5 text-xs font-medium capitalize transition-colors",
                      tab === t
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t === "signup" ? "Sign Up" : "Login"}
                    {tab === t && (
                      <motion.span
                        layoutId="auth-tab-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-violet-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === "signup" ? (
                  <motion.div
                    key={`signup-${step}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="mt-6"
                  >
                    <StepIndicator step={step} />
                    {step === 1 && <SignUpStep1 onNext={() => setStep(2)} />}
                    {step === 2 && <SignUpStep2 onBack={() => setStep(1)} onNext={() => setStep(3)} />}
                    {step === 3 && <SignUpStep3 onBack={() => setStep(2)} onDone={() => set("dashboard")} />}
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="mt-6"
                  >
                    <LoginPanel onLogin={(role) => set(role === "admin" ? "admin-dashboard" : "dashboard")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              By continuing you agree to our{" "}
              <a href="#" className="text-foreground/80 underline-offset-2 hover:underline">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-foreground/80 underline-offset-2 hover:underline">Privacy</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-lg font-semibold tracking-tight text-violet-500 dark:text-violet-400">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function AvatarMock() {
  return (
    <div className="relative my-12 grid place-items-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid h-44 w-44 place-items-center rounded-full bg-violet-500 shadow-sm ring-1 ring-black/10 dark:ring-white/10"
      >
        <Video className="h-14 w-14 text-white" />
      </motion.div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        Your AI interviewer · asks · listens · adapts.
      </p>
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Account", "Verify OTP", "Profile"];
  return (
    <div className="mb-6 flex items-center gap-2">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = step === n;
        const done = step > n;
        return (
          <div key={l} className="flex flex-1 items-center gap-2">
            <div className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ring-1 ring-inset transition-colors",
              active
                ? "bg-violet-500/15 text-violet-700 ring-violet-400/40 dark:text-violet-300"
                : done
                  ? "bg-emerald-500/15 text-emerald-700 ring-emerald-400/40 dark:text-emerald-300"
                  : "bg-black/[0.02] text-muted-foreground ring-black/10 dark:bg-white/5 dark:ring-white/10",
            )}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
            </div>
            <span className={cn("text-[11px]", active ? "text-foreground" : "text-muted-foreground")}>{l}</span>
            {i < labels.length - 1 && (
              <div className="ml-1 h-px flex-1 bg-black/10 dark:bg-white/10" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
      <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      OR
      <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
    </div>
  );
}

function GoogleButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-full bg-black/[0.02] border-black/10 hover:bg-black/[0.05] dark:bg-white/5 dark:border-white/15 dark:hover:bg-white/10"
    >
      <GoogleGlyph />
      {label}
    </Button>
  );
}

function GoogleGlyph() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.9 2.5 2.8 6.6 2.8 11.7S6.9 21 12 21c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

/* --------------------------- Sign-up step 1 ------------------------------ */

function SignUpStep1({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = name.trim().length > 1 && /@/.test(email) && pwd.length >= 8;

  const submit = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 1100);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Create your free account</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Takes 2 minutes. No credit card. Free forever for students.
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Full Name</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Sharma"
              className="rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email Address</Label>
          <div className="relative mt-1">
            <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg bg-black/[0.02] pl-9 pr-9 border-black/10 dark:bg-white/5 dark:border-white/10"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Toggle password visibility"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Min 8 characters · include a number & symbol for strength.</p>
        </div>
      </div>

      <Divider />
      <GoogleButton label="Continue with Google" />

      <Button
        onClick={submit}
        disabled={!valid || loading}
        className="mt-5 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP…
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

/* --------------------------- Sign-up step 2 ------------------------------ */

function SignUpStep2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [otp, setOtp] = useState("");
  // F-27: Fixed 5:00 (300s) OTP resend cooldown per spec. Was 272 (non-round).
  const [resendIn, setResendIn] = useState(300);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setResendIn((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const verify = () => {
    if (otp.length < 6) return;
    if (otp === "000000") {
      onNext();
    } else {
      const left = attempts - 1;
      setAttempts(left);
      setError(left > 0 ? `Invalid code. ${left} attempt${left > 1 ? "s" : ""} remaining.` : "Too many attempts. Please request a new OTP.");
      setOtp("");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Verify your email</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        We sent a 6-digit code to <span className="font-mono text-foreground">you@email.com</span>. Enter it below.
      </p>

      <div className="mt-6 flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(v) => { setOtp(v); setError(null); }}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-11 w-11 border-black/10 bg-black/[0.02] first:rounded-l-lg last:rounded-r-lg text-base dark:border-white/15 dark:bg-white/5"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="mt-3 flex justify-center">
        {resendIn > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Resend in {Math.floor(resendIn / 60)}:{String(resendIn % 60).padStart(2, "0")}
          </span>
        ) : (
          <button
            onClick={() => setResendIn(300)}
            className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            Resend OTP
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-600 dark:text-rose-300"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <Button
        onClick={verify}
        disabled={otp.length < 6 || attempts <= 0}
        className="mt-5 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
      >
        <ShieldCheck className="mr-2 h-4 w-4" /> Verify & Continue
      </Button>
      <button
        onClick={onBack}
        className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to account details
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Tip: use <span className="font-mono text-foreground">000000</span> as the demo OTP.
      </p>
    </div>
  );
}

/* --------------------------- Sign-up step 3 ------------------------------ */

function SignUpStep3({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [role, setRole] = useState<string>("");
  const [skills, setSkills] = useState<string[]>(["Python", "FastAPI"]);
  const [skillInput, setSkillInput] = useState("");
  const [education, setEducation] = useState([
    { degree: "B.Tech", institution: "IIT Bombay", year: "2022" },
  ]);
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(
    () =>
      SKILL_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(skillInput.toLowerCase()) &&
          !skills.some((x) => x.toLowerCase() === s.toLowerCase()),
      ).slice(0, 6),
    [skillInput, skills],
  );

  const addSkill = (s: string) => {
    if (!s.trim()) return;
    if (!skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const addEdu = () =>
    setEducation([...education, { degree: "B.Tech", institution: "", year: "" }]);
  const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, key: "degree" | "institution" | "year", val: string) =>
    setEducation(education.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)));

  const valid = !!role && skills.length > 0 && education.every((e) => e.institution && e.year);

  const submit = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onDone();
    }, 900);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Set up your profile</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        This data personalises your AI interview questions and roadmap.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Target Job Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10">
              <SelectValue placeholder="Choose role…" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Skills</Label>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-black/10 bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/5">
            {skills.map((s) => (
              <Badge key={s} className="border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200">
                {s}
                <button onClick={() => removeSkill(s)} className="ml-1" aria-label={`Remove ${s}`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
              placeholder="Type a skill…"
              className="min-w-[120px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 flex flex-wrap gap-1.5"
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="rounded-full border border-black/10 bg-black/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground hover:border-violet-400/30 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:hover:text-violet-300"
                  >
                    + {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Education</Label>
            <button
              onClick={addEdu}
              className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              + Add row
            </button>
          </div>
          <div className="mt-1 space-y-2">
            {education.map((e, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[7rem_1fr_5rem]">
                <Select
                  value={e.degree}
                  onValueChange={(v) => updateEdu(i, "degree", v)}
                >
                  <SelectTrigger className="rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={e.institution}
                  onChange={(ev) => updateEdu(i, "institution", ev.target.value)}
                  placeholder="Institution"
                  className="rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10"
                />
                <div className="flex items-center gap-1">
                  <Input
                    value={e.year}
                    onChange={(ev) => updateEdu(i, "year", ev.target.value)}
                    placeholder="Year"
                    className="rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10"
                  />
                  {education.length > 1 && (
                    <button
                      onClick={() => removeEdu(i)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-rose-500"
                      aria-label="Remove education row"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">LinkedIn URL (optional)</Label>
            <div className="relative mt-1">
              <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/you"
                className="rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">GitHub URL (optional)</Label>
            <div className="relative mt-1">
              <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="github.com/you"
                className="rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={submit}
        disabled={!valid || loading}
        className="mt-6 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up…
          </>
        ) : (
          <>
            <GraduationCap className="mr-2 h-4 w-4" /> Complete Setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <button
        onClick={onBack}
        className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to OTP verification
      </button>
    </div>
  );
}

/* --------------------------- Login + forgot ------------------------------ */

function LoginPanel({ onLogin }: { onLogin: (role: "student" | "admin") => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pwd?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; pwd?: boolean }>({});
  // F-01: Role toggle — Student vs Company Admin. Determines where the user
  // lands after login. Admins go to admin-dashboard; students go to dashboard.
  const [role, setRole] = useState<"student" | "admin">("student");

  const validateEmail = (v: string) => {
    if (!v) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
    return undefined;
  };
  const validatePwd = (v: string) => {
    if (!v) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    return undefined;
  };

  const valid = !validateEmail(email) && !validatePwd(pwd);

  const login = () => {
    const newErrors = { email: validateEmail(email), pwd: validatePwd(pwd) };
    setErrors(newErrors);
    setTouched({ email: true, pwd: true });
    if (newErrors.email || newErrors.pwd) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(role);
    }, 900);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Welcome back</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {role === "admin"
          ? "Log in to your company admin dashboard."
          : "Log in to continue your prep journey."}
      </p>

      {/* F-01: Role toggle — Student vs Company Admin */}
      <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-lg border border-black/10 bg-black/[0.02] p-1 dark:border-white/10 dark:bg-white/5">
        {(["student", "admin"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md py-1.5 text-xs font-medium transition-colors",
              role === r
                ? "bg-violet-500 text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r === "student" ? "Student" : "Company Admin"}
          </button>
        ))}
      </div>

      {!forgot ? (
        <>
          <div className="mt-5 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) setErrors((p) => ({ ...p, email: validateEmail(e.target.value) }));
                  }}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, email: true }));
                    setErrors((p) => ({ ...p, email: validateEmail(email) }));
                  }}
                  placeholder="you@email.com"
                  aria-invalid={!!errors.email && touched.email}
                  aria-describedby={errors.email && touched.email ? "login-email-error" : undefined}
                  className={cn(
                    "rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10",
                    errors.email && touched.email && "border-rose-400/60 focus-visible:ring-rose-400/30"
                  )}
                />
              </div>
              {errors.email && touched.email && (
                <p id="login-email-error" className="mt-1 text-xs text-rose-500 dark:text-rose-400" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => {
                    setPwd(e.target.value);
                    if (touched.pwd) setErrors((p) => ({ ...p, pwd: validatePwd(e.target.value) }));
                  }}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, pwd: true }));
                    setErrors((p) => ({ ...p, pwd: validatePwd(pwd) }));
                  }}
                  placeholder="••••••••"
                  aria-invalid={!!errors.pwd && touched.pwd}
                  aria-describedby={errors.pwd && touched.pwd ? "login-pwd-error" : undefined}
                  className={cn(
                    "rounded-lg bg-black/[0.02] pl-9 pr-9 border-black/10 dark:bg-white/5 dark:border-white/10",
                    errors.pwd && touched.pwd && "border-rose-400/60 focus-visible:ring-rose-400/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.pwd && touched.pwd && (
                <p id="login-pwd-error" className="mt-1 text-xs text-rose-500 dark:text-rose-400" role="alert">
                  {errors.pwd}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" className="accent-violet-500" /> Remember me
              </label>
              <button
                onClick={() => setForgot(true)}
                className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Divider />
          <GoogleButton label="Continue with Google" />

          <Button
            onClick={login}
            disabled={!valid || loading}
            className="mt-5 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </>
      ) : (
        <AnimatePresence mode="wait">
          {!resetSent ? (
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-5 space-y-3"
            >
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <div>
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10"
                  />
                </div>
              </div>
              <Button
                onClick={() => setResetSent(true)}
                disabled={!/@/.test(email)}
                className="w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
              >
                Send Reset Link
              </Button>
              <button
                onClick={() => setForgot(false)}
                className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="forgot-sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col items-center text-center"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 ring-1 ring-inset ring-emerald-400/30 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium">Reset link sent to your email</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click the link in your inbox to set a new password, then come back here to log in.
              </p>
              <Button
                onClick={() => { setResetSent(false); setForgot(false); }}
                className="mt-5 w-full rounded-full bg-black/[0.05] border border-black/10 hover:bg-black/[0.08] dark:bg-white/10 dark:border-white/10 dark:hover:bg-white/15"
              >
                Back to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* Unused import markers to keep tree-shaking honest */
export const __icons = { Code2, Video, Shimmer };
