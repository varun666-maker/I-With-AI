"use client";

import { useNav } from "@/lib/store";
import { Shield, Lock, Eye, FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrivacyPolicyScreen() {
  const setScreen = useNav((s) => s.set);
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScreen("landing")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Legal & Compliance
          </span>
        </div>

        {/* Notice alert */}
        <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400">
          <strong>Review Notice:</strong> This privacy policy is tailored specifically to the exact
          data collection points implemented in InterviewAI (Auth forms, Resume PDFs, Video/Audio AI streams, Google Analytics 4, and SQLite storage). Review and finalize with your legal counsel prior to production launch.
        </div>

        {/* Title */}
        <div className="border-b border-border pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective Date: {lastUpdated} · InterviewAI SaaS Platform
          </p>
        </div>

        {/* Content sections */}
        <div className="mt-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Eye className="h-5 w-5 text-primary" />
              1. Information We Collect
            </h2>
            <p>
              We collect information that you directly provide when using the platform, as well as automated diagnostic data to maintain service integrity and test proctoring:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account & Profile Information:</strong> Name, email address, password hash, role (Student, Candidate, Company Admin, Super Admin), and college/organization details.
              </li>
              <li>
                <strong>Resume & Assessment Data:</strong> Uploaded resumes (PDF/DOCX), extracted skill sets, aptitude answers, coding challenge submissions, and benchmark scores.
              </li>
              <li>
                <strong>Interview Media & Audio Streams:</strong> Audio speech recordings and webcam video frames during active AI Mock Interviews and proctored hiring sessions, processed exclusively for speech-to-text transcription, sentiment analysis, and cheating detection.
              </li>
              <li>
                <strong>Proctoring Telemetry:</strong> Fullscreen escape events, tab switch counters, and multi-face detection alerts strictly during authorized assessment rounds.
              </li>
              <li>
                <strong>Cookies & Local Storage:</strong> Dark/light mode theme selection, active accent palette, active user session tokens, and coding arena draft progress.
              </li>
              <li>
                <strong>Web Analytics (GA4):</strong> Anonymized usage events and page views via Google Analytics 4 (Measurement ID: <code>G-XXXXXXXXXX</code>) only with explicit consent from EU/UK/Swiss visitors.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Lock className="h-5 w-5 text-primary" />
              2. How We Use Your Data
            </h2>
            <p>Your information is used strictly to deliver and improve InterviewAI services:</p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-lg border border-border/60 bg-card p-4">
                <h4 className="font-semibold text-foreground">For Candidates & Students</h4>
                <p className="mt-1 text-xs">
                  Generate instant 17-section performance feedback reports, benchmark coding skills, and provide personalized interview coaching.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-4">
                <h4 className="font-semibold text-foreground">For Enterprise Recruiters</h4>
                <p className="mt-1 text-xs">
                  Provide fair candidate leaderboards, anti-cheating verification logs, and streamline recruitment campaigns without bias.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              3. Data Protection & Security
            </h2>
            <p>
              All communications are enforced over secure HTTPS / TLS encryption. Video and audio recordings captured during assessments are processed in memory and encrypted at rest. We do not sell, rent, or monetize your resume or interview data to third parties.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              4. GDPR & User Rights
            </h2>
            <p>
              Under GDPR, CCPA, and applicable privacy laws, you possess full control over your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right of Access:</strong> Request a full copy of your interview recordings and scores.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Permanently delete your candidate records and uploaded resumes through the Super Admin or by contacting support.</li>
              <li><strong>Consent Revocation:</strong> Update your cookie preferences at any time through our interactive privacy controls.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground">5. Contact Information</h2>
            <p>
              If you have any questions, inquiries, or privacy deletion requests regarding this policy, please reach out to:
            </p>
            <p className="font-mono text-xs text-primary">
              privacy@interviewai.io · Security & Compliance Office
            </p>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex justify-center border-t border-border pt-8">
          <Button onClick={() => setScreen("landing")} className="rounded-lg px-6">
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
