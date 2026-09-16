"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PageWrap,
  PulseBadge,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const TRUST_ITEMS = [
  "1,500+ aptitude bank",
  "AI resume + ATS extraction",
  "Live proctoring + integrity scores",
  "Per-candidate PDF reports",
];

export function CompanyRegister() {
  const { set } = useNav();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "",
    admin: "",
    email: "",
    password: "",
    confirm: "",
  });

  const pwTooShort = form.password.length > 0 && form.password.length < 8;
  const pwMismatch =
    form.confirm.length > 0 && form.password !== form.confirm;
  const emailInvalid =
    form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canSubmit =
    form.company.trim() &&
    form.admin.trim() &&
    form.email.trim() &&
    !emailInvalid &&
    form.password.length >= 8 &&
    form.password === form.confirm;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    // mock — simulate API + redirect
    setTimeout(() => {
      setLoading(false);
      set("admin-dashboard");
    }, 900);
  };

  return (
    <AuroraBackground>
      <PageWrap className="pt-10 sm:pt-16">
        <button
          onClick={() => set("landing")}
          className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to home
        </button>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_1fr]">
          {/* LEFT — pitch */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block"
          >
            <PulseBadge color="sky">For Companies · Hiring Mode</PulseBadge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
              Hire 100 candidates in a week —{" "}
              <span className="gradient-text text-glow">not a quarter.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground md:text-lg">
              Share one apply link, and our pipeline auto-collects resumes,
              extracts emails, ranks candidates by job-fit, runs proctored
              aptitude + coding + AI interview rounds, and ships per-candidate
              PDF reports. You shortlist in one click.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {TRUST_ITEMS.map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-500/10 text-emerald-300">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-foreground/90">{t}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  One-time setup · 2 minutes
                </p>
                <p className="text-xs text-muted-foreground">
                  No credit card. Free for 14 days.
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlowCard className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Register your company
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Create the admin account for your hiring team
                  </p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <Field
                  label="Company Name"
                  icon={<Building2 className="h-4 w-4" />}
                  placeholder="e.g. Acme Labs Pvt Ltd"
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                  required
                />
                <Field
                  label="Admin Name"
                  icon={<User className="h-4 w-4" />}
                  placeholder="e.g. Priya Sharma (HR Lead)"
                  value={form.admin}
                  onChange={(v) => setForm({ ...form, admin: v })}
                  required
                />
                <Field
                  label="Admin Email"
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  placeholder="priya@acme.com"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  error={
                    emailInvalid ? "Enter a valid email address" : undefined
                  }
                  required
                />

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Admin Password
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className={cn(
                        "h-11 pl-9 pr-10",
                        pwTooShort && "border-rose-400/60 focus-visible:ring-rose-400/30",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-white"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {pwTooShort && (
                    <p className="text-xs text-rose-300">
                      Password must be at least 8 characters
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirm}
                      onChange={(e) =>
                        setForm({ ...form, confirm: e.target.value })
                      }
                      className={cn(
                        "h-11 pl-9 pr-10",
                        pwMismatch &&
                          "border-rose-400/60 focus-visible:ring-rose-400/30",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-white"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {pwMismatch && (
                    <p className="text-xs text-rose-300">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>
                    By registering you agree to the{" "}
                    <span className="text-foreground/80">Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-foreground/80">Privacy Policy</span>.
                    We use end-to-end encryption for all candidate data.
                  </span>
                </div>

                <MagneticButton
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={cn(
                    "h-11 w-full rounded-lg border-0 text-white",
                    "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Register &amp; Open Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </MagneticButton>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => set("landing")}
                    className="font-medium text-violet-300 hover:text-violet-200"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </GlowCard>
          </motion.div>
        </div>

      </PageWrap>
    </AuroraBackground>
  );
}

/* ---- helpers ---- */

function Field({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label} {required && <span className="text-rose-300">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11 pl-9",
            error && "border-rose-400/60 focus-visible:ring-rose-400/30",
          )}
        />
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
