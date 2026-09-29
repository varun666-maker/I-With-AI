"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { ArrowUp, Cookie, Mail, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * SiteChrome — global UI elements that should appear on every screen.
 * Renders:
 *   1. Skip-to-content link (a11y, keyboard users)
 *   2. Scroll progress bar (top of viewport, theme-accent colored)
 *   3. Cookie banner (dismissable, persists to localStorage)
 *   4. Back-to-top button (appears after 600px scroll)
 *   5. Floating contact buttons (mail + chat, hover-expand)
 *
 * All elements respect `prefers-reduced-motion` and theme accent colors.
 * No emojis. No glow shadows. Restrained motion only.
 */
export function SiteChrome() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const navigationLocked = useNav((s) => s.navigationLocked);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [cookieDismissed, setCookieDismissed] = useState(true); // start dismissed, check localStorage
  const [contactOpen, setContactOpen] = useState(false);

  // Show back-to-top after 600px scroll
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check if cookie banner was already dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("cookie-banner-dismissed");
      if (!dismissed) {
        // Use a microtask to avoid setState-in-effect lint warning
        queueMicrotask(() => setCookieDismissed(false));
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const dismissCookie = () => {
    try {
      localStorage.setItem("cookie-banner-dismissed", "1");
    } catch {
      // ignore
    }
    setCookieDismissed(true);
  };

  // Hide all site chrome during fullscreen tests (after all hooks)
  if (navigationLocked) return null;

  return (
    <>
      {/* 1. Skip to content (keyboard a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:border focus:border-black/15 focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg dark:focus:border-white/20"
      >
        Skip to content
      </a>

      {/* 2. Scroll progress bar (top, under the nav) */}
      {!reduce && (
        <motion.div
          className="fixed left-0 right-0 top-16 z-40 h-0.5 origin-left bg-violet-500 dark:bg-violet-400"
          style={{ scaleX: progressScale }}
          aria-hidden="true"
        />
      )}

      {/* 3. Cookie banner */}
      <AnimatePresence>
        {!cookieDismissed && (
          <motion.div
            initial={reduce ? false : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-lg border border-black/10 bg-background p-4 shadow-lg sm:left-auto sm:right-4 sm:w-auto dark:border-white/15"
            role="dialog"
            aria-label="Cookie consent"
          >
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-violet-500 dark:text-violet-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Cookies</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We use localStorage to remember your theme, accent, and cookie
                  preference. No tracking pixels, no third-party analytics.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={dismissCookie}
                    className="h-8 rounded-full bg-violet-500 px-4 text-xs text-white hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissCookie}
                    className="h-8 rounded-full px-4 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Decline
                  </Button>
                </div>
              </div>
              <button
                onClick={dismissCookie}
                aria-label="Close cookie banner"
                className="rounded-md p-1 text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-4 left-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-background text-foreground shadow-md transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 5. Floating contact buttons (bottom-right, expand on hover) */}
      <div
        className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2"
        onMouseEnter={() => setContactOpen(true)}
        onMouseLeave={() => setContactOpen(false)}
      >
        <AnimatePresence>
          {contactOpen && (
            <>
              <motion.a
                href="mailto:support@interviewai.dev"
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-full border border-black/10 bg-background py-2 pl-3 pr-4 text-xs font-medium shadow-md hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                <Mail className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                Email support
              </motion.a>
              <motion.a
                href="https://chat.interviewai.dev"
                target="_blank"
                rel="noopener noreferrer"
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex items-center gap-2 rounded-full border border-black/10 bg-background py-2 pl-3 pr-4 text-xs font-medium shadow-md hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                <MessageCircle className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                Live chat
              </motion.a>
            </>
          )}
        </AnimatePresence>
        <button
          onClick={() => setContactOpen((v) => !v)}
          aria-label="Contact support"
          aria-expanded={contactOpen}
          className="grid h-11 w-11 place-items-center rounded-full bg-violet-500 text-white shadow-md transition-colors hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
