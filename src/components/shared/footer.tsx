"use client";

import { useNav, type ScreenId } from "@/lib/store";
import { cn } from "@/lib/utils";

const FOOTER_LINKS: { label: string; target: ScreenId }[] = [
  { label: "Prep Mode", target: "landing" },
  { label: "For Companies", target: "company-landing" },
  { label: "Candidate", target: "apply" },
  { label: "Super Admin", target: "superadmin-dashboard" },
];

/**
 * Footer — global footer used on every screen.
 * Minimal: brand left, nav center, copyright right.
 * No newsletter input, no social icons, no fluff.
 */
export function Footer({ className }: { className?: string }) {
  const set = useNav((s) => s.set);
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight">InterviewAI</span>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <button
                key={link.target}
                onClick={() => set(link.target)}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
            <a
              href="#"
              className="transition-colors hover:text-foreground"
              onClick={(e) => e.preventDefault()}
            >
              Terms
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {year} InterviewAI
          </p>
        </div>
      </div>
    </footer>
  );
}
