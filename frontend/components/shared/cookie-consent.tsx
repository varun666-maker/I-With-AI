"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Cookie, X, Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/store";

const CONSENT_STORAGE_KEY = "interviewai_cookie_consent";

function initGA4() {
  if (typeof window === "undefined") return;
  // Measurement ID placeholder from PDF Prompt C
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";
  // Check if gtag script already present
  if (!document.getElementById("ga4-script")) {
    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    const inlineScript = document.createElement("script");
    inlineScript.id = "ga4-inline";
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { page_path: window.location.pathname });
    `;
    document.head.appendChild(inlineScript);
  }
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const setScreen = useNav((s) => s.set);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      // If accepted, initialize GA4
      if (stored === "all" || stored === "analytics") {
        initGA4();
      }
    }
  }, []);

  const handleAcceptAll = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONSENT_STORAGE_KEY, "all");
    }
    initGA4();
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONSENT_STORAGE_KEY, "essential");
    }
    setVisible(false);
  };

  const handleSaveCustom = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        analyticsEnabled ? "analytics" : "essential"
      );
    }
    if (analyticsEnabled) initGA4();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-[999] mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-300 md:left-6 md:right-6"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Your Privacy & Cookie Choices
                </h4>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  GDPR & ePrivacy
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                We use privacy-friendly cookies and analytics to evaluate candidate test integrity,
                power AI interview telemetry, and improve platform speed. We never sell personal data.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setScreen("privacy")}
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Read our Privacy Policy
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  {showDetails ? "Hide options" : "Customize choices"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 md:pt-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEssentialOnly}
              className="rounded-lg text-xs font-medium"
            >
              Essential Only
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="gap-1.5 rounded-lg bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              Accept All
            </Button>
          </div>
        </div>

        {/* Detailed Preferences Drawer */}
        {showDetails && (
          <div className="mt-4 border-t border-border/60 pt-4 text-xs dark:border-white/10">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start justify-between rounded-xl border border-border/50 bg-muted/40 p-3">
                <div>
                  <p className="font-semibold text-foreground">Essential Storage</p>
                  <p className="text-muted-foreground">
                    Required for authentication, security session tokens, and theme settings.
                  </p>
                </div>
                <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Always Active
                </span>
              </div>
              <div className="flex items-start justify-between rounded-xl border border-border/50 bg-muted/40 p-3">
                <div>
                  <p className="font-semibold text-foreground">Performance & GA4</p>
                  <p className="text-muted-foreground">
                    Anonymized telemetry to count page views, form submissions, and interview load times.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border accent-primary"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="secondary" onClick={handleSaveCustom} className="text-xs">
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
