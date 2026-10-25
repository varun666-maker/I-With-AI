"use client";

import { useNav } from "@/lib/store";
import { getFlowForScreen } from "@/lib/flows";

export function FlowNav() {
  const current = useNav((s) => s.current);
  const navigationLocked = useNav((s) => s.navigationLocked);

  if (navigationLocked) return null;

  const flow = getFlowForScreen(current);
  if (!flow || !current.startsWith("candidate") || current === "candidate-leaderboard") return null;

  const currentIdx = flow.findIndex((step) => step.id === current);
  if (currentIdx === -1) return null;

  const progress = ((currentIdx + 1) / flow.length) * 100;
  const currentStep = flow[currentIdx];

  return (
    <nav
      aria-label="Candidate journey progress"
      className="sticky top-14 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-center gap-2 text-xs sm:text-sm">
            <span className="shrink-0 text-muted-foreground">
              Step {currentIdx + 1} of {flow.length}
            </span>
            <span aria-live="polite" className="truncate font-medium text-foreground">
              {currentStep.label}
            </span>
          </div>
          <div
            className="mx-auto mt-2 h-1 max-w-xl overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Candidate journey progress"
            aria-valuemin={1}
            aria-valuemax={flow.length}
            aria-valuenow={currentIdx + 1}
            aria-valuetext={`${currentStep.label}, step ${currentIdx + 1} of ${flow.length}`}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
