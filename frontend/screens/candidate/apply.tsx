"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mail,
  Phone,
  UploadCloud,
  User,
  X,
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
import { cn } from "@/lib/utils";

import { HoneypotField, isHumanSubmission } from "@/components/shared/honeypot";
import { useNav } from "@/lib/store";

// Mock campaign data. In production this comes from /api/campaigns/:slug
const CAMPAIGN = {
  company: "Acme Corp",
  role: "Backend Developer",
  deadline: "January 30, 2025, 11:59 PM IST",
  slug: "acme-backend-2025",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ".pdf,.doc,.docx";

export function ApplyPage() {
  const setScreen = useNav((s) => s.set);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [resume, setResume] = useState<{ name: string; size: number } | null>(
    null,
  );
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!resume) next.resume = "Please upload your resume (PDF or DOCX).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Honeypot spam protection (Item 10)
    if (!isHumanSubmission(honeypot)) {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    // Mock processing. Cloudinary upload + Gemini resume analysis happen here.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const pickFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors((p) => ({ ...p, resume: "Max file size is 5 MB." }));
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setErrors((p) => ({
        ...p,
        resume: "Only PDF or DOCX files are accepted.",
      }));
      return;
    }
    setErrors((p) => ({ ...p, resume: "" }));
    setResume({ name: file.name, size: file.size });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const fmtSize = (bytes: number) =>
    bytes < 1024
      ? `${bytes} B`
      : bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Badge variant="outline" className="rounded-full border-amber-400/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
            Public Application · No login required
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-5 text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Apply for: <span className="text-violet-500 dark:text-violet-400">{CAMPAIGN.role}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-3 text-center text-sm text-muted-foreground sm:text-base"
        >
          Submit your application in under two minutes. We&apos;ll analyze your
          resume instantly and reach out if you&apos;re shortlisted.
        </motion.p>

        <StaggeredReveal className="mt-8 w-full" delay={0.05}>
          <motion.div variants={revealItem}>
            <GlowCard className="relative overflow-hidden p-6 sm:p-8">
              {/* Company header */}
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-1 ring-inset ring-black/10 dark:ring-white/10">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Hiring at
                  </p>
                  <p className="text-lg font-semibold tracking-tight">
                    {CAMPAIGN.company}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-amber-200">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    Deadline · {CAMPAIGN.deadline}
                  </span>
                </div>
              </div>

              <Separator className="my-6 bg-white/5" />

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Anti-spam honeypot field (hidden from real users) */}
                    <HoneypotField
                      name="website_candidate_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />

                    {/* Full Name */}
                    <Field
                      id="fullName"
                      label="Full Name"
                      required
                      icon={<User className="h-4 w-4" />}
                      error={errors.fullName}
                    >
                      <Input
                        id="fullName"
                        placeholder="Priya Sharma"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        aria-invalid={!!errors.fullName}
                      />
                    </Field>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        id="email"
                        label="Email Address"
                        required
                        icon={<Mail className="h-4 w-4" />}
                        error={errors.email}
                      >
                        <Input
                          id="email"
                          type="email"
                          placeholder="priya@gmail.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={!!errors.email}
                        />
                      </Field>
                      <Field
                        id="phone"
                        label="Phone Number"
                        hint="Optional"
                        icon={<Phone className="h-4 w-4" />}
                      >
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </Field>
                    </div>

                    {/* Resume upload */}
                    <div>
                      <Label className="mb-2 flex items-center gap-2">
                        Resume Upload
                        <span className="text-rose-400">*</span>
                        <span className="ml-auto text-[11px] font-normal text-muted-foreground">
                          PDF or DOCX · max 5 MB
                        </span>
                      </Label>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            inputRef.current?.click();
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        className={cn(
                          "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
                          dragOver
                            ? "border-violet-400/60 bg-violet-500/10"
                            : "border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
                          errors.resume && "border-rose-400/60 bg-rose-500/5",
                        )}
                      >
                        <div className="grid h-11 w-11 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-1 ring-inset ring-black/10 dark:ring-white/10">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="text-violet-500 dark:text-violet-400">Click to upload</span>{" "}
                            or drag &amp; drop
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Your resume is used for AI job-fit analysis only.
                          </p>
                        </div>
                        <input
                          ref={inputRef}
                          type="file"
                          accept={ACCEPTED}
                          className="sr-only"
                          onChange={(e) =>
                            pickFile(e.target.files?.[0] ?? undefined)
                          }
                        />
                      </div>

                      {resume && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {resume.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {fmtSize(resume.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setResume(null)}
                            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-white"
                            aria-label="Remove resume"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      )}
                      {errors.resume && (
                        <p className="mt-2 text-xs text-rose-300">
                          {errors.resume}
                        </p>
                      )}
                    </div>

                    <Separator className="bg-white/5" />

                    {/* Submit */}
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        By submitting, you agree to be contacted about this role
                        at the email above.
                      </p>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="h-11 w-full rounded-full bg-violet-500 px-7 text-white hover:bg-violet-600 sm:w-auto"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            Submit Application
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center gap-4 py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 18,
                        delay: 0.1,
                      }}
                      className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30"
                    >
                      <CheckCircle2 className="h-10 w-10" />
                    </motion.div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-emerald-300">
                        Application Submitted
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Application Submitted
                      </h2>
                      <p className="mt-2 text-lg text-foreground">
                        Thank you, {fullName.split(" ")[0] || "Priya"}!
                      </p>
                      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                        If shortlisted, you&apos;ll receive login credentials at{" "}
                        <span className="font-medium text-violet-200">
                          {email || "priya@gmail.com"}
                        </span>{" "}
                        before {CAMPAIGN.deadline}.
                      </p>
                    </div>
                    <div className="mt-2 w-full max-w-sm rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                        Resume uploaded &amp; analyzed by AI
                      </p>
                      <p className="mt-1.5 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                        Acknowledgement email sent
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => setScreen("thank-you")}
                        className="rounded-full bg-primary text-xs"
                      >
                        View Full Confirmation &amp; Instructions →
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSubmitted(false);
                          setFullName("");
                          setEmail("");
                          setPhone("");
                          setResume(null);
                        }}
                        className="text-xs"
                      >
                        Submit Another
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlowCard>
          </motion.div>
        </StaggeredReveal>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          Powered by InterviewAI · Your data is processed securely and never
          shared outside {CAMPAIGN.company}.
        </motion.p>

      </section>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  hint,
  icon,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 flex items-center gap-2">
        {icon && <span className="text-violet-300">{icon}</span>}
        {label}
        {required && <span className="text-rose-400">*</span>}
        {hint && (
          <span className="ml-auto text-[11px] font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
