"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACCENT_THEMES, useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, accent, setTheme, setAccent } = useNav();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 hover:bg-white/10"
        >
          <span
            className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-white/20"
            style={{ background: ACCENT_THEMES.find((t) => t.id === accent)?.swatch }}
          />
          <Palette className="h-3.5 w-3.5" />
          <span className="hidden sm:inline capitalize">{accent}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[280px] border-white/10 bg-popover/95 p-3 backdrop-blur-2xl"
      >
        {/* Light / Dark toggle */}
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTheme(m)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
                theme === m
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="capitalize">{m}</span>
            </button>
          ))}
        </div>

        {/* Accent grid */}
        <p className="mb-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Accent theme — 12 palettes
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {ACCENT_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setAccent(t.id)}
              className={cn(
                "group flex flex-col items-center gap-1 rounded-lg border p-2 transition-all",
                accent === t.id
                  ? "border-white/30 bg-white/10"
                  : "border-white/5 hover:border-white/15 hover:bg-white/5",
              )}
            >
              <span
                className="h-6 w-6 rounded-full ring-1 ring-inset ring-white/15 transition-transform group-hover:scale-110"
                style={{ background: t.swatch }}
              />
              <span className="text-[10px] font-medium text-foreground/80">{t.label}</span>
              {accent === t.id && (
                <Check className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500 p-0.5 text-white" />
              )}
            </button>
          ))}
        </div>

        <p className="mt-3 px-1 text-[10px] text-muted-foreground">
          Tip: the entire app — buttons, gradients, auroras, accents — re-skins live.
        </p>
      </PopoverContent>
    </Popover>
  );
}

/** Compact icon-only variant for mobile */
export function ThemeSwitcherIcon() {
  const { theme, setTheme } = useNav();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full border border-white/10 bg-white/5"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.span key="moon" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
            <Moon className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span key="sun" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
            <Sun className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
