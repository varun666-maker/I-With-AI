"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useNav } from "@/lib/store";

/**
 * Syncs the Zustand theme + accent state to <html> on mount.
 * The initial paint is handled by the inline script in layout.tsx to avoid FOUC.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useNav((s) => s.theme);
  const accent = useNav((s) => s.accent);
  const setTheme = useNav((s) => s.setTheme);
  const setAccent = useNav((s) => s.setAccent);

  // On first mount, hydrate Zustand from localStorage (set by the inline script)
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      const storedAccent = localStorage.getItem("accent") as
        | "violet"
        | "ocean"
        | "forest"
        | "sunset"
        | "coral"
        | "lavender"
        | "mint"
        | "sunrise"
        | "berry"
        | "sage"
        | "ember"
        | "mono"
        | null;

      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      } else {
        // Detect system preference on first visit
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "dark"); // default dark
      }
      if (storedAccent) setAccent(storedAccent);
    } catch {
      // ignore
    }
  }, [setTheme, setAccent]);

  // Keep DOM in sync whenever state changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute("data-accent", accent);
  }, [theme, accent]);

  return <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>{children}</NextThemesProvider>;
}
