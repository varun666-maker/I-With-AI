"use client";

import { useNav } from "@/lib/store";
import { CheckCircle2, ArrowRight, Mail, Calendar, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThankYouScreen() {
  const setScreen = useNav((s) => s.set);

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        {/* Animated Success Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="h-10 w-10 animate-in zoom-in-75 duration-300" />
        </div>

        {/* Headings */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Submission Received!
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Thank you for getting in touch with InterviewAI. We have received your submission
          and our team is reviewing your application details.
        </p>

        {/* Confirmation Details Card */}
        <div className="mt-8 rounded-2xl border border-border/80 bg-card p-6 text-left shadow-lg">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            What Happens Next?
          </h3>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Confirmation Email Dispatched</p>
                <p className="text-xs text-muted-foreground">
                  A verification link and receipt has been sent to your registered email address.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Next Step Assessment</p>
                <p className="text-xs text-muted-foreground">
                  Candidates receive their scheduled mock test link, while hiring teams get an onboarding call invite within 24 hours.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">System Check Preparation</p>
                <p className="text-xs text-muted-foreground">
                  Make sure your webcam and microphone are enabled before starting your first live round.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => setScreen("landing")}
            className="w-full sm:w-auto gap-2 rounded-xl"
          >
            Return to Homepage
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setScreen("dashboard")}
            className="w-full sm:w-auto rounded-xl"
          >
            Explore Prep Dashboard
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Need immediate assistance? Reach out to{" "}
          <a href="mailto:support@interviewai.io" className="underline hover:text-foreground">
            support@interviewai.io
          </a>
        </p>
      </div>
    </div>
  );
}
