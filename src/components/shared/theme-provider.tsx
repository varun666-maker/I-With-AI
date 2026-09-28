"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useNav, applyCustomColor, type AccentTheme } from "@/lib/store";
import { captureUtm } from "@/lib/utm";

/**
 * Syncs the Zustand theme + accent state to <html> on mount.
 * The initial paint is handled by the inline script in layout.tsx to avoid FOUC.
 * Also captures UTM params from the URL on first visit.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useNav((s) => s.theme);
  const accent = useNav((s) => s.accent);
  const customColor = useNav((s) => s.customColor);
  const setTheme = useNav((s) => s.setTheme);
  const setAccent = useNav((s) => s.setAccent);
  const setCustomColor = useNav((s) => s.setCustomColor);

  // On first mount, hydrate Zustand from localStorage (set by the inline script)
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      const storedAccent = localStorage.getItem("accent") as AccentTheme | null;
      const storedCustomColor = localStorage.getItem("customColor");

      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      } else {
        // Detect system preference on first visit, default to dark
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "dark");
      }
      if (storedAccent) setAccent(storedAccent);
      if (storedCustomColor) setCustomColor(storedCustomColor);
    } catch {
      // ignore
    }

    // Capture UTM params from URL on first visit (for attribution tracking)
    captureUtm();
  }, [setTheme, setAccent, setCustomColor]);

  // Keep DOM in sync whenever theme or accent changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute("data-accent", accent);

    // If accent is custom, apply the custom color CSS variables.
    // Otherwise, clear any previously-set inline custom variables so the
    // [data-accent="..."] CSS block takes over.
    if (accent === "custom") {
      applyCustomColor(customColor);
    } else {
      // Clear all custom-color inline styles
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      for (const s of shades) {
        root.style.removeProperty(`--color-violet-${s}`);
        root.style.removeProperty(`--color-fuchsia-${s}`);
      }
      root.style.removeProperty("--gradient-text-1");
      root.style.removeProperty("--gradient-text-2");
      root.style.removeProperty("--gradient-text-3");
      root.style.removeProperty("--accent-swatch");
    }
  }, [theme, accent, customColor]);

  return <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>{children}</NextThemesProvider>;
}
