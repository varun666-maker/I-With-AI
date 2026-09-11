"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  Cloud,
  FileText,
  Info,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PageWrap,
  PulseBadge,
  SectionHeading,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

type Phase = "upload" | "processing" | "results";

type NeedsInput = {
  id: string;
  filename: string;
  extractedName: string | null;
  extractedEmail: string | null;
  extractedPhone?: string | null;
  jobFit: number;
  ats: number;
  // editable form state
  nameInput: string;
  emailInput: string;
  saved: boolean;
};

type ExtractedOK = {
  id: string;
  name: string;
  email: string;
  jobFit: number;
};

const NEEDS_INPUT: NeedsInput[] = [
  {
    id: "u1",
    filename: "resume_john.pdf",
    extractedName: "John Doe",
    extractedEmail: null,
    extractedPhone: "+91-9876543210",
    jobFit: 87,
    ats: 82,
    nameInput: "John Doe",
    emailInput: "",
    saved: false,
  },
  {
    id: "u2",
    filename: "resume_001.pdf",
    extractedName: null,
    extractedEmail: null,
    jobFit: 84,
    ats: 79,
    nameInput: "",
    emailInput: "",
    saved: false,
  },
  {
    id: "u3",
    filename: "resume_kumar.docx",
    extractedName: "Kumar S",
    extractedEmail: null,
    extractedPhone: "+91-9988776655",
    jobFit: 71,
    ats: 66,
    nameInput: "Kumar S",
    emailInput: "",
    saved: false,
  },
];

const EXTRACTED_OK: ExtractedOK[] = [
  { id: "e1", name: "Priya Sharma", email: "priya@gmail.com", jobFit: 91 },
  { id: "e2", name: "Amit Patel", email: "amit@company.com", jobFit: 87 },
  { id: "e3", name: "Sneha Iyer", email: "sneha.iyer@outlook.com", jobFit: 79 },
  { id: "e4", name: "Meera Krishnan", email: "meera.k@gmail.com", jobFit: 76 },
  { id: "e5", name: "Arjun Reddy", email: "arjun.r@gmail.com", jobFit: 83 },
  { id: "e6", name: "Kavya Nair", email: "kavya.nair@gmail.com", jobFit: 72 },
  { id: "e7", name: "Rahul Kumar", email: "rahul.k@gmail.com", jobFit: 88 },
  { id: "e8", name: "Divya Menon", email: "divya.m@gmail.com", jobFit: 81 },
  { id: "e9", name: "Vikram Singh", email: "vikram.s@gmail.com", jobFit: 75 },
];

const PROCESS_FILES = [
  "resume_priya.pdf",
  "resume_amit.docx",
  "resume_sneha.pdf",
  "resume_rahul.pdf",
  "resume_meera.pdf",
  "resume_john.pdf",
  "resume_001.pdf",
  "resume_kumar.docx",
  "resume_divya.pdf",
  "resume_vikram.pdf",
  "resume_arjun.pdf",
  "resume_kavya.pdf",
];

export function BulkUpload() {
  const { set } = useNav();
  const [phase, setPhase] = useState<Phase>("upload");
  const [files, setFiles] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [procStep, setProcStep] = useState(0);

  // auto-advance processing
  useEffect(() => {
    if (phase !== "processing") return;
    if (procStep >= PROCESS_FILES.length) {
      const t = setTimeout(() => setPhase("results"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setProcStep((s) => s + 1), 280);
    return () => clearTimeout(t);
  }, [phase, procStep]);

  const startProcessing = () => {
    setFiles(files.length ? files : PROCESS_FILES);
    setProcStep(0);
    setPhase("processing");
  };

  const [needs, setNeeds] = useState<NeedsInput[]>(NEEDS_INPUT);

  const setField = (
    id: string,
    field: "nameInput" | "emailInput",
    val: string,
  ) => setNeeds((arr) => arr.map((n) => (n.id === id ? { ...n, [field]: val } : n)));

  const save = (id: string) =>
    setNeeds((arr) =>
      arr.map((n) => (n.id === id ? { ...n, saved: true } : n)),
    );

  const allFixed = needs.every((n) => n.saved);

  return (
    <AuroraBackground>
      <PageWrap className="pt-8">
        <button
          onClick={() => set("candidate-leaderboard")}
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to candidates
        </button>

        <SectionHeading
          align="left"
          eyebrow="Campaign · backend-sde-1"
          title="Bulk resume upload"
          description="Upload resumes you already have. AI extracts names &amp; emails automatically — you confirm the tricky ones."
        />

        <AnimatePresence mode="wait">
          {phase === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlowCard className="mt-5 p-5">
                <div className="flex items-start gap-3 rounded-lg border border-sky-400/20 bg-sky-500/5 p-4">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                  <p className="text-sm text-muted-foreground">
                    Use this if you already have candidate resumes (from a
                    campus drive, agency, or internal database) and don&apos;t
                    want them to apply through the public link. The system will
                    try to extract name and email from each resume using AI.
                    You may need to manually fill in missing details.{" "}
                    <span className="text-foreground/80">
                      For guaranteed email collection, use the public apply
                      link instead.
                    </span>
                  </p>
                </div>
              </GlowCard>

              {/* dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const names = Array.from(e.dataTransfer.files).map(
                    (f) => f.name,
                  );
                  setFiles(names.length ? names : PROCESS_FILES);
                }}
                onClick={() => setFiles(PROCESS_FILES)}
                className={cn(
                  "mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all",
                  dragging
                    ? "border-violet-400/60 bg-violet-500/10"
                    : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]",
                )}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300"
                >
                  <UploadCloud className="h-7 w-7" />
                </motion.div>
                <p className="mt-4 text-sm font-medium">
                  Drag &amp; drop resumes here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse · PDF, DOCX, or ZIP · max 50MB total ·
                  max 100 files
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <PulseBadge color="violet">PDF</PulseBadge>
                  <PulseBadge color="sky">DOCX</PulseBadge>
                  <PulseBadge color="amber">ZIP archive</PulseBadge>
                </div>
              </div>

              {/* Selected files list */}
              {files.length > 0 && (
                <GlowCard className="mt-4 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Selected files ({files.length})
                    </p>
                    <button
                      onClick={() => setFiles([])}
                      className="text-xs text-muted-foreground hover:text-rose-300"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto scrollbar-custom">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/[0.03]"
                      >
                        <FileText className="h-3.5 w-3.5 text-violet-300" />
                        <span className="flex-1 truncate">{f}</span>
                        <button
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-rose-300"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {files.length} files ready · AI extraction will run on upload
                </p>
                <MagneticButton
                  disabled={files.length === 0}
                  onClick={startProcessing}
                  className="h-11 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-white hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload &amp; Analyze
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlowCard className="mt-5 p-6">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Processing {procStep} / {PROCESS_FILES.length} resumes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please don&apos;t close this page · server keeps
                      processing even if you navigate away
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Progress
                    value={(procStep / PROCESS_FILES.length) * 100}
                    className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    ~{Math.max(0, Math.ceil((PROCESS_FILES.length - procStep) * 0.28))}s
                    remaining
                  </p>
                </div>

                <div className="mt-5 grid gap-1.5">
                  {PROCESS_FILES.map((f, i) => {
                    const status =
                      i < procStep
                        ? "done"
                        : i === procStep
                          ? "active"
                          : "wait";
                    return (
                      <div
                        key={f}
                        className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
                      >
                        <span className="grid h-5 w-5 place-items-center">
                          {status === "done" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                          ) : status === "active" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
                          ) : (
                            <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </span>
                        <span className="flex-1 truncate text-foreground/90">
                          {f}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            status === "done" && "text-emerald-300",
                            status === "active" && "text-violet-200",
                            status === "wait" && "text-muted-foreground",
                          )}
                        >
                          {status === "done"
                            ? "✓ Analyzed"
                            : status === "active"
                              ? `Extracting… (${i + 1}/${PROCESS_FILES.length})`
                              : "Waiting…"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlowCard>
            </motion.div>
          )}

          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Summary */}
              <GlowCard className="mt-5 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-200">
                        {EXTRACTED_OK.length} resumes fully extracted
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Name + email found automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-300" />
                    <div>
                      <p className="text-sm font-semibold text-amber-200">
                        {needs.length} resumes need manual input
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fix missing fields below to enable Add-all
                      </p>
                    </div>
                  </div>
                </div>
              </GlowCard>

              {/* Needs-input section */}
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-medium">
                    Needs your input ({needs.filter((n) => !n.saved).length}{" "}
                    remaining)
                  </h3>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {needs.map((n) => (
                    <NeedsCard key={n.id} item={n} onField={setField} onSave={save} />
                  ))}
                </div>
              </div>

              {/* Fully extracted section */}
              <div className="mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <h3 className="text-sm font-medium">
                    Fully extracted ({EXTRACTED_OK.length})
                  </h3>
                </div>
                <GlowCard className="mt-3 p-0">
                  <div className="max-h-72 overflow-y-auto scrollbar-custom">
                    {EXTRACTED_OK.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-3 border-b border-white/5 px-4 py-2.5 text-sm hover:bg-white/[0.02]"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span className="flex-1 font-medium">{e.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {e.email}
                        </span>
                        <PulseBadge color="violet">Fit {e.jobFit}%</PulseBadge>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </div>

              {/* Bottom actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    setPhase("upload");
                    setFiles([]);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Discard all
                </Button>
                <MagneticButton
                  disabled={!allFixed}
                  onClick={() => set("candidate-leaderboard")}
                  className="h-11 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-white hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add all {needs.length + EXTRACTED_OK.length} to leaderboard
                </MagneticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageWrap>
    </AuroraBackground>
  );
}

function NeedsCard({
  item,
  onField,
  onSave,
}: {
  item: NeedsInput;
  onField: (id: string, f: "nameInput" | "emailInput", v: string) => void;
  onSave: (id: string) => void;
}) {
  return (
    <GlowCard
      className={cn(
        "p-5 transition-colors",
        item.saved ? "border-emerald-400/30" : "border-amber-400/30",
      )}
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-violet-300" />
        <p className="truncate text-sm font-medium">{item.filename}</p>
        {item.saved && (
          <PulseBadge color="emerald" className="ml-auto">
            Saved
          </PulseBadge>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          AI Extracted
        </p>
        <div className="mt-2 space-y-1 text-sm">
          <ExtractRow label="Name" value={item.extractedName} />
          <ExtractRow label="Email" value={item.extractedEmail} />
          {item.extractedPhone && (
            <ExtractRow label="Phone" value={item.extractedPhone} ok />
          )}
        </div>
        <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3 text-xs">
          <span className="text-muted-foreground">
            Job Fit{" "}
            <span className="font-semibold text-violet-200">
              {item.jobFit}%
            </span>
          </span>
          <span className="text-muted-foreground">
            ATS <span className="font-semibold text-violet-200">{item.ats}</span>
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="mt-4 space-y-3">
        {!item.extractedName && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Candidate Name *
            </Label>
            <Input
              value={item.nameInput}
              onChange={(e) => onField(item.id, "nameInput", e.target.value)}
              disabled={item.saved}
              placeholder="Enter candidate name"
              className="h-9"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Email Address *
          </Label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={item.emailInput}
              onChange={(e) => onField(item.id, "emailInput", e.target.value)}
              disabled={item.saved}
              placeholder="candidate@email.com"
              className="h-9 flex-1"
            />
            <Button
              size="sm"
              onClick={() => onSave(item.id)}
              disabled={
                item.saved ||
                !item.emailInput.trim() ||
                (!!item.extractedName ? false : !item.nameInput.trim())
              }
              className="h-9 rounded-md border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50"
            >
              {item.saved ? <Check className="h-3.5 w-3.5" /> : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Required — admin types email here. This is how the candidate will
            receive their invite.
          </p>
        </div>
      </div>
    </GlowCard>
  );
}

function ExtractRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string | null;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}:</span>
      {value ? (
        <span className="inline-flex items-center gap-1.5 text-foreground/90">
          <Check className="h-3 w-3 text-emerald-300" />
          {value}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-rose-300">
          <X className="h-3 w-3" /> Not found
        </span>
      )}
      {ok && value && (
        <span className="text-xs text-emerald-300">verified</span>
      )}
    </div>
  );
}
