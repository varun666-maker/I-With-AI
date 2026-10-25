"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  GlowCard,
  revealItem,
  StaggeredReveal,
} from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CandidateLogin() {
  const { set } = useNav();
  const [candidateId, setCandidateId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!candidateId.trim() || !password.trim()) {
      setError("Please enter both your Candidate ID and password.");
      return;
    }
    setLoading(true);
    // Mock auth. Backend verifies credentials + checks requirePasswordChange.
    setTimeout(() => {
      setLoading(false);
      // Simulate first-login flow → force password change screen.
      set("candidate-change-password");
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Badge variant="outline" className="rounded-full border-amber-400/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
            Invited Candidate Login
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-5 text-center text-3xl font-semibold tracking-tight text-balance"
        >
          Welcome back to your <span className="text-violet-500 dark:text-violet-400">assessment</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-3 text-center text-sm text-muted-foreground"
        >
          Enter the credentials shared in your invitation email to continue.
        </motion.p>

        <StaggeredReveal className="mt-8 w-full" delay={0.05}>
          <motion.div variants={revealItem}>
            <GlowCard className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-1 ring-inset ring-black/10 dark:ring-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Candidate Sign-in
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Acme Corp · Backend Developer Campaign
                  </p>
                </div>

                <div>
                  <Label htmlFor="candidateId" className="mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-violet-300" />
                    Candidate ID
                  </Label>
                  <Input
                    id="candidateId"
                    placeholder="BACKEN-3FA82C"
                    autoComplete="username"
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    className="font-mono tracking-wide"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    The 8-character ID from your invitation email.
                  </p>
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-violet-300" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      placeholder="Temporary password from email"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-white"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-full bg-violet-500 px-7 text-white hover:bg-violet-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying credentials…
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>

                <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-100/90">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-300" />
                  <p>
                    Use the credentials emailed to you for this campaign. They
                    are separate from your InterviewAI prep-mode account.
                  </p>
                </div>
              </form>

              <Separator className="my-5 bg-white/5" />

              <div className="flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => set("apply")}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  Apply to a campaign
                </button>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => alert("Contact Acme Corp HR for help.")}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Trouble logging in?
                </button>
              </div>
            </GlowCard>
          </motion.div>
        </StaggeredReveal>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          On first login you&apos;ll be asked to set a new password.
        </motion.p>

      </section>
    </div>
  );
}
