import Link from "next/link";
import { Compass, Home, BookOpen, Building2, UserCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | InterviewAI",
  description: "The page you are looking for does not exist. Explore our mock interview and hiring portals.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Compass className="h-12 w-12 animate-spin-slow text-primary" />
          <span className="absolute -bottom-2 -right-2 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            404
          </span>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          The requested page could not be located on the server. Return home or jump straight to a core module.
        </p>

        <div className="mt-8 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
            Helpful Portals & Destinations
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Homepage</p>
                <p className="text-xs text-muted-foreground truncate">Return to main landing</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Student Practice</p>
                <p className="text-xs text-muted-foreground truncate">Aptitude, coding & interviews</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">For Companies</p>
                <p className="text-xs text-muted-foreground truncate">Hiring drives & proctoring</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-500">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Candidate Portal</p>
                <p className="text-xs text-muted-foreground truncate">Take scheduled test</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Take Me Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
