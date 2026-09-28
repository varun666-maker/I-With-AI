"use client";

import { useState } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACCENT_THEMES, useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, accent, customColor, setTheme, setAccent, setCustomColor } = useNav();
  const [open, setOpen] = useState(false);

  // The swatch for the current accent (custom uses the customColor)
  const currentSwatch =
    accent === "custom"
      ? `linear-gradient(135deg, ${customColor}, ${shiftHue(customColor, 30)})`
      : ACCENT_THEMES.find((t) => t.id === accent)?.swatch;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3 hover:bg-black/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/5"
        >
          <span
            className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/20 dark:ring-white/20"
            style={{ background: currentSwatch }}
          />
          <Palette className="h-3.5 w-3.5" />
          <span className="hidden capitalize sm:inline">
            {accent === "custom" ? "Custom" : ACCENT_THEMES.find((t) => t.id === accent)?.label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[300px] border-black/10 bg-popover/95 p-3 backdrop-blur-2xl dark:border-white/10"
      >
        {/* Light / Dark toggle */}
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.03] p-1 dark:border-white/10 dark:bg-white/[0.03]">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTheme(m)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
                theme === m
                  ? "bg-violet-500 text-white"
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
          Accent theme · 16 options
        </p>
        <div className="grid max-h-[280px] grid-cols-3 gap-1.5 overflow-y-auto pr-1">
          {ACCENT_THEMES.map((t) => {
            const isActive = accent === t.id;
            const swatch =
              t.id === "custom"
                ? `linear-gradient(135deg, ${customColor}, ${shiftHue(customColor, 30)})`
                : t.swatch;
            return (
              <button
                key={t.id}
                onClick={() => setAccent(t.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-all",
                  isActive
                    ? "border-violet-400/60 bg-violet-500/10 dark:border-violet-400/40"
                    : "border-black/10 hover:border-black/20 hover:bg-black/[0.03] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5",
                )}
              >
                <span
                  className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/15 transition-transform group-hover:scale-110 dark:ring-white/20"
                  style={{ background: swatch }}
                />
                <span className="text-[10px] font-medium text-foreground/80">
                  {t.id === "custom" ? "Custom" : t.label}
                </span>
                {isActive && (
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-violet-500 text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom color picker — only visible when "custom" is selected */}
        {accent === "custom" && (
          <div className="mt-3 rounded-lg border border-violet-400/30 bg-violet-500/5 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Pick a custom color
            </p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-8 w-12 cursor-pointer rounded border border-black/10 bg-transparent dark:border-white/10"
                aria-label="Custom accent color"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setCustomColor(v);
                }}
                className="h-8 flex-1 rounded border border-black/10 bg-background px-2 font-mono text-xs uppercase outline-none focus:border-violet-400/50 dark:border-white/10"
                placeholder="#a855f7"
                maxLength={7}
              />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Works in both light and dark mode. Shades are generated automatically.
            </p>
          </div>
        )}

        <p className="mt-3 px-1 text-[10px] text-muted-foreground">
          The entire app re-skins live. Both light and dark mode supported.
        </p>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Shift the hue of a hex color by `degrees` and return a new hex string.
 * Used to generate the second stop of the custom-accent gradient swatch.
 */
function shiftHue(hex: string, degrees: number): string {
  // Hex -> RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // RGB -> HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }

  // Shift hue
  h = (h + degrees) % 360;

  // HSL -> RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r2 = 0, g2 = 0, b2 = 0;
  if (h < 60) { r2 = c; g2 = x; }
  else if (h < 120) { r2 = x; g2 = c; }
  else if (h < 180) { g2 = c; b2 = x; }
  else if (h < 240) { g2 = x; b2 = c; }
  else if (h < 300) { r2 = x; b2 = c; }
  else { r2 = c; b2 = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}
