"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
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

export function CompanyLogin() {
  const { set } = useNav();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emailInvalid =
    email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = email.trim() && !emailInvalid && password.length >= 1;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      set("admin-dashboard");
    }, 900);
  };

  const sendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInvalid || !email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap className="pt-10 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ── LEFT: pitch panel (hidden on mobile) ── */}
          <div className="hidden lg:flex lg:flex-col lg:justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
              For Companies · Hiring Mode
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back to your hiring dashboard.
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Log in to manage campaigns, review candidates, and send offers.
              New here? Create a company account in 2 minutes.
            </p>
            <ul className="mt-6 space-y-2.5">
              {TRUST_ITEMS.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-foreground/80">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-3 rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Secured access</p>
                <p className="text-xs text-muted-foreground">
                  Your admin credentials are separate from candidate accounts.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: login form ── */}
          <div className="flex flex-col justify-center">
            <button
              onClick={() => set("company-landing")}
              className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to home
            </button>

            <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm sm:p-8 dark:border-white/10">
              {!forgot ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Company Admin Login</h3>
                      <p className="text-xs text-muted-foreground">
                        Sign in to manage your hiring campaigns.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="admin-email" className="text-xs text-muted-foreground">Admin Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="admin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hr@company.com"
                          className={cn(
                            "h-10 rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10",
                            emailInvalid && "border-rose-400/60 focus-visible:ring-rose-400/30",
                          )}
                        />
                      </div>
                      {emailInvalid && (
                        <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                          Enter a valid email address.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="admin-password" className="text-xs text-muted-foreground">Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="admin-password"
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-10 rounded-lg bg-black/[0.02] pl-9 pr-9 border-black/10 dark:bg-white/5 dark:border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-rose-400/30 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-300">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => { setForgot(true); setResetSent(false); }}
                        className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className="h-11 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Login to Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="mt-5 text-center text-xs text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => set("company-register")}
                      className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      Register your company
                    </button>
                  </p>
                </>
              ) : !resetSent ? (
                /* ── Forgot password form ── */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold">Reset your password</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter your admin email and we&apos;ll send a reset link.
                  </p>
                  <form onSubmit={sendReset} className="mt-6 space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Admin Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hr@company.com"
                          className={cn(
                            "h-10 rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10",
                            emailInvalid && "border-rose-400/60 focus-visible:ring-rose-400/30",
                          )}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={!email.trim() || emailInvalid || loading}
                      className="h-11 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setForgot(false)}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                    >
                      Back to login
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* ── Reset sent confirmation ── */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Check your email</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="font-medium text-foreground/80">{email}</span>.
                    It expires in 30 minutes.
                  </p>
                  <Button
                    onClick={() => { setForgot(false); setResetSent(false); }}
                    className="mt-6 h-11 w-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
                  >
                    Back to login
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </PageWrap>
    </div>
  );
}
