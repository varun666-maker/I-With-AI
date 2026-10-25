"use client";

import { useNav } from "@/lib/store";
import { Compass, Home, BookOpen, Building2, UserCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundScreen() {
  const setScreen = useNav((s) => s.set);

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        {/* Visual 404 Header */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Compass className="h-12 w-12 animate-spin-slow text-primary" />
          <span className="absolute -bottom-2 -right-2 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            404
          </span>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          The page or route you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
        </p>

        {/* Helpful navigation portals in site design */}
        <div className="mt-8 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
            Helpful Portals & Destinations
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setScreen("landing")}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Homepage</p>
                <p className="text-xs text-muted-foreground truncate">Return to main landing</p>
              </div>
            </button>

            <button
              onClick={() => setScreen("dashboard")}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Student Practice</p>
                <p className="text-xs text-muted-foreground truncate">Aptitude, coding & interviews</p>
              </div>
            </button>

            <button
              onClick={() => setScreen("company-landing")}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">For Companies</p>
                <p className="text-xs text-muted-foreground truncate">Hiring drives & proctoring</p>
              </div>
            </button>

            <button
              onClick={() => setScreen("apply")}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-500">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Candidate Portal</p>
                <p className="text-xs text-muted-foreground truncate">Take scheduled test</p>
              </div>
            </button>
          </div>
        </div>

        {/* Home Button */}
        <div className="mt-8">
          <Button
            size="lg"
            onClick={() => setScreen("landing")}
            className="gap-2 rounded-xl px-8"
          >
            Take Me Home
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
