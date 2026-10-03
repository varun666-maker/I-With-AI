"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SuperAdminLogin() {
  const { set } = useNav();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [show2fa, setShow2fa] = useState(false);
  const [otp, setOtp] = useState("");
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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
      setShow2fa(true); // Step 2: 2FA
    }, 900);
  };

  const verify2fa = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      set("superadmin-dashboard");
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
        <div className="mx-auto max-w-md">
          <button
            onClick={() => set("landing")}
            className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to home
          </button>

          <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm sm:p-8 dark:border-white/10">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Super Admin Login</h3>
                <p className="text-xs text-muted-foreground">
                  Platform operator access only.
                </p>
              </div>
            </div>

            {/* Security notice */}
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-200/90">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                This portal is restricted to authorized platform operators.
                All access attempts are logged in the audit trail. Unauthorized
                access is prohibited.
              </span>
            </div>

            {!forgot && !show2fa && (
              /* ── Login form ── */
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Admin Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@interviewai.com"
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
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
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
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="h-11 w-full rounded-full bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {show2fa && !forgot && (
              /* ── 2FA step ── */
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                      ✓
                    </span>
                    <p className="text-xs text-muted-foreground">Password verified</p>
                  </div>
                  <h4 className="text-sm font-medium">Enter the 6-digit code</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    We sent a verification code to your registered device. Enter
                    it below to complete sign-in.
                  </p>
                  <form onSubmit={verify2fa} className="mt-4 space-y-4">
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="h-12 rounded-lg bg-black/[0.02] text-center font-mono text-lg tracking-[0.5em] border-black/10 dark:bg-white/5 dark:border-white/10"
                    />
                    <Button
                      type="submit"
                      disabled={otp.length < 6 || loading}
                      className="h-11 w-full rounded-full bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShow2fa(false)}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                    >
                      Back to login
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {forgot && !resetSent && (
              /* ── Forgot password ── */
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="mt-6 text-lg font-semibold">Reset your password</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter your super admin email and we&apos;ll send a reset link.
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
                        placeholder="admin@interviewai.com"
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
                    className="h-11 w-full rounded-full bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
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
            )}

            {forgot && resetSent && (
              /* ── Reset sent ── */
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
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
                  className="mt-6 h-11 w-full rounded-full bg-rose-500 text-white hover:bg-rose-600"
                >
                  Back to login
                </Button>
              </motion.div>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Need access? Contact your platform administrator.
          </p>
        </div>
      </PageWrap>
    </div>
  );
}
