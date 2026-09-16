"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PulseBadge,
  revealItem,
  StaggeredReveal,
} from "@/components/shared/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const PW_RULES = [
  { id: "len", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  {
    id: "upper",
    label: "One uppercase letter (A–Z)",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    id: "lower",
    label: "One lowercase letter (a–z)",
    test: (v: string) => /[a-z]/.test(v),
  },
  { id: "num", label: "One number (0–9)", test: (v: string) => /\d/.test(v) },
  {
    id: "sym",
    label: "One symbol (!@#$…)",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

export function ForcePasswordChange() {
  const { set } = useNav();
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passed = PW_RULES.filter((r) => r.test(newPw));
  const strengthPct = (passed.length / PW_RULES.length) * 100;
  const strengthTone =
    strengthPct <= 40
      ? "rose"
      : strengthPct <= 70
        ? "amber"
        : "emerald";

  const strengthColor = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  }[strengthTone];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPw.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    // Mock backend — hashes & stores new password, clears requirePasswordChange.
    setTimeout(() => {
      setLoading(false);
      set("candidate-system-check");
    }, 1100);
  };

  return (
    <AuroraBackground>
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <PulseBadge color="amber">First Login · Mandatory</PulseBadge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-5 text-center text-3xl font-semibold tracking-tight text-balance"
        >
          Set Your <span className="gradient-text text-glow">New Password</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-3 text-center text-sm text-muted-foreground"
        >
          This is your first login. You must set a new password before
          proceeding.
        </motion.p>

        <StaggeredReveal className="mt-8 w-full" delay={0.05}>
          <motion.div variants={revealItem}>
            <GlowCard className="relative overflow-hidden p-6 sm:p-8">
              {/* Lock icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 16,
                    delay: 0.1,
                  }}
                  className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-violet-100 ring-1 ring-inset ring-white/10"
                >
                  <Lock className="h-7 w-7" />
                </motion.div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <Label htmlFor="newPw" className="mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-violet-300" />
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPw"
                      type={showNew ? "text" : "password"}
                      placeholder="Enter a strong password"
                      autoComplete="new-password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-white"
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Strength meter */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strengthPct}%` }}
                        transition={{ duration: 0.25 }}
                        className={cn("h-full rounded-full", strengthColor)}
                      />
                    </div>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {passed.length}/{PW_RULES.length}
                    </span>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="confirmPw"
                    className="mb-2 flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4 text-violet-300" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPw"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter the new password"
                      autoComplete="new-password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-white"
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPw && newPw !== confirmPw && (
                    <p className="mt-1.5 text-xs text-rose-300">
                      Passwords don&apos;t match yet.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Password requirements · Min 8 characters
                  </p>
                  <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {PW_RULES.map((r) => {
                      const ok = r.test(newPw);
                      return (
                        <li
                          key={r.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className={cn(
                              "grid h-4 w-4 place-items-center rounded-full ring-1 ring-inset transition-colors",
                              ok
                                ? "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30"
                                : "bg-white/5 text-muted-foreground ring-white/10",
                            )}
                          >
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <span
                            className={
                              ok ? "text-emerald-200" : "text-muted-foreground"
                            }
                          >
                            {r.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <MagneticButton
                  type="submit"
                  disabled={
                    loading ||
                    newPw.length < 8 ||
                    newPw !== confirmPw
                  }
                  className="h-11 w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 text-white border-0 hover:from-violet-400 hover:to-fuchsia-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </MagneticButton>
              </form>

              <Separator className="my-5 bg-white/5" />

              <p className="text-center text-xs text-muted-foreground">
                Pick a password you don&apos;t use elsewhere. You won&apos;t be
                able to change it again from this screen.
              </p>
            </GlowCard>
          </motion.div>
        </StaggeredReveal>

      </section>
    </AuroraBackground>
  );
}
