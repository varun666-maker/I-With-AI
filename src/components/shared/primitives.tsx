"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

/**
 * Aurora background — animated mesh-gradient blobs on top of a dark surface.
 * Used as the global page backdrop.
 */
export function AuroraBackground({
  children,
  className,
  showGrid = true,
}: {
  children: ReactNode;
  className?: string;
  showGrid?: boolean;
}) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-x-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[55vh] w-[55vh] rounded-full bg-violet-500/20 blur-[120px] animate-aurora" />
        <div
          className="absolute top-[40%] -right-[10%] h-[55vh] w-[55vh] rounded-full bg-fuchsia-500/15 blur-[120px] animate-aurora"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="absolute -bottom-[20%] left-[30%] h-[55vh] w-[55vh] rounded-full bg-sky-500/15 blur-[120px] animate-aurora"
          style={{ animationDelay: "-6s" }}
        />
      </div>
      {showGrid && (
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial-faded" />
      )}
      <div className="pointer-events-none absolute inset-0 -z-10 noise opacity-[0.025]" />
      {children}
    </div>
  );
}

/**
 * BorderBeam — animated beam of light traveling around the perimeter of a card.
 * Place this absolutely inside a `relative` parent with `overflow-hidden` + rounded + border.
 */
export function BorderBeam({
  size = 220,
  duration = 8,
  delay = 0,
  className,
  colorFrom = "#a855f7",
  colorTo = "#06b6d4",
}: {
  size?: number;
  duration?: number;
  delay?: number;
  className?: string;
  colorFrom?: string;
  colorTo?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute aspect-square"
        style={{
          width: size,
          height: size,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent 0 0deg, ${colorFrom} 90deg, ${colorTo} 180deg, transparent 270deg 360deg)`,
          maskImage:
            "linear-gradient(transparent, transparent), linear-gradient(white, white)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(transparent, transparent), linear-gradient(white, white)",
          WebkitMaskComposite: "source-over",
          animation: `borderbeam ${duration}s linear ${delay}s infinite`,
        }}
      />
      <style jsx>{`
        @keyframes borderbeam {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * GlowCard — a card with a subtle radial gradient that follows the mouse cursor.
 */
export function GlowCard({
  children,
  className,
  glowColor = "rgba(168, 85, 247, 0.18)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      onMouseMove={(e) => {
        if (shouldReduce) return;
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
      className={cn(
        "group relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm",
        "transition-colors duration-300 hover:border-white/20",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(220px circle at var(--x, 50%) var(--y, 50%), ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

/**
 * MagneticButton — wraps a shadcn Button and applies a subtle "magnetic" pull
 * toward the cursor while hovering.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  ...props
}: React.ComponentProps<typeof Button> & { strength?: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      style={{ display: "inline-block" }}
      onMouseMove={(e) => {
        if (shouldReduce || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "translate(0px, 0px)";
      }}
    >
      <Button
        ref={ref}
        className={cn("transition-transform duration-200 ease-out", className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

/**
 * Marquee — infinite horizontal scroller.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex w-full overflow-hidden mask-radial-faded",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-8 [animation:marquee_40s_linear_infinite]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

/**
 * TypingDots — three pulsing dots to indicate "AI is thinking".
 */
export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

/**
 * Shimmer — pulsing skeleton placeholder.
 */
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/5",
        className,
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent [animation:shimmer_1.8s_ease_in_out_infinite]" />
    </div>
  );
}

/**
 * PulseBadge — small pill label with optional pulse glow.
 */
export function PulseBadge({
  children,
  className,
  color = "violet",
}: {
  children: ReactNode;
  className?: string;
  color?: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";
}) {
  const colors: Record<string, string> = {
    violet: "border-violet-400/30 bg-violet-500/10 text-violet-200",
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
    sky: "border-sky-400/30 bg-sky-500/10 text-sky-200",
    slate: "border-white/15 bg-white/5 text-white/80",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        colors[color],
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {children}
    </span>
  );
}

/**
 * SectionHeading — consistent section title block.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      {eyebrow && (
        <PulseBadge color="violet" className="text-[11px] uppercase tracking-widest">
          {eyebrow}
        </PulseBadge>
      )}
      <h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-pretty text-base text-muted-foreground md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * StaggeredReveal — wrap a list of items; each child fades in sequentially
 * as the parent scrolls into view.
 */
export function StaggeredReveal({
  children,
  className,
  delay = 0.06,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * PageWrap — wraps a screen with consistent max width, padding, and entrance fade.
 */
export function PageWrap({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "mx-auto w-full px-4 pb-24 pt-6 sm:px-6 lg:px-8",
        wide ? "max-w-[1600px]" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </motion.main>
  );
}

/**
 * StatCard — small KPI card with animated number.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "violet",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";
}) {
  const tones: Record<string, string> = {
    violet: "text-violet-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    sky: "text-sky-300",
    slate: "text-white/80",
  };
  return (
    <GlowCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-2 text-2xl font-semibold tracking-tight", tones[tone])}>
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && (
          <div className={cn("rounded-lg border border-white/10 bg-white/5 p-2", tones[tone])}>
            {icon}
          </div>
        )}
      </div>
    </GlowCard>
  );
}
