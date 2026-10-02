"use client";

import { useNav, type ScreenId } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * SaaS Footer Strategy:
 *
 * - Public pages (landing, company-landing): Full grid footer with nav, legal links
 * - App/dashboard screens: Micro-footer (single thin line: copyright + Terms + Privacy + Support)
 * - Test/fullscreen/settings screens: No footer
 */

const PUBLIC_PAGES: ScreenId[] = ["landing", "company-landing"];
const NO_FOOTER_PAGES: ScreenId[] = [
  "aptitude", "coding", "interview",
  "candidate-aptitude", "candidate-coding", "candidate-interview",
  "candidate-system-check", "candidate-aptitude-result",
  "candidate-coding-result", "candidate-results",
  "apply", "candidate-login", "candidate-change-password",
  "profile", "superadmin-system",
];

export function SmartFooter() {
  const current = useNav((s) => s.current);

  if (NO_FOOTER_PAGES.includes(current)) return null;
  if (PUBLIC_PAGES.includes(current)) return <FullFooter />;
  return <MicroFooter />;
}

/** Micro-footer for app/dashboard screens — single thin line */
function MicroFooter({ className }: { className?: string }) {
  const set = useNav((s) => s.set);
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-black/10 py-3 dark:border-white/10", className)}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <span>© {year} InterviewAI</span>
        <span className="hidden sm:inline">·</span>
        <button onClick={() => set("landing")} className="transition-colors hover:text-foreground">Home</button>
        <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-foreground">Terms</a>
        <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-foreground">Privacy</a>
        <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-foreground">Support</a>
      </div>
    </footer>
  );
}

/** Full footer for public-facing pages only */
function FullFooter({ className }: { className?: string }) {
  const set = useNav((s) => s.set);
  const year = new Date().getFullYear();

  const sections: { title: string; links: { label: string; onClick?: () => void; href?: string }[] }[] = [
    {
      title: "Product",
      links: [
        { label: "Features", onClick: () => set("landing") },
        { label: "For Companies", onClick: () => set("company-landing") },
        { label: "For Candidates", onClick: () => set("apply") },
      ],
    },
    // F-33: "Modes" column replaces "Resources" per spec.
    {
      title: "Modes",
      links: [
        { label: "Prep Mode", onClick: () => set("dashboard") },
        { label: "Hiring Mode", onClick: () => set("admin-dashboard") },
        { label: "Super Admin", onClick: () => set("superadmin-dashboard") },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "GDPR Compliance", href: "#" },
      ],
    },
  ];

  return (
    <footer className={cn("border-t border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]", className)}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500 text-white">
                <span className="text-xs font-bold">AI</span>
              </div>
              <span className="font-semibold tracking-tight">InterviewAI</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              The complete AI interview assistant for candidates and companies.
            </p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button onClick={link.onClick} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </button>
                    ) : (
                      <a href={link.href} onClick={(e) => e.preventDefault()} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-black/10 pt-6 sm:flex-row dark:border-white/10">
          <p className="text-xs text-muted-foreground">© {year} InterviewAI. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Last updated Sep 2025</p>
        </div>
      </div>
    </footer>
  );
}
