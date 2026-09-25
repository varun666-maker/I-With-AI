/**
 * UTM tracking utility.
 *
 * Reads UTM params from the current URL on first visit, persists them to
 * localStorage, and exposes a helper to attach them to outbound links
 * (e.g. the "Continue with Google" button, email links, etc.) so the
 * acquisition source is preserved across the funnel.
 *
 * Usage:
 *   import { captureUtm, withUtm } from "@/lib/utm";
 *   captureUtm();                     // call once on app load
 *   const href = withUtm("https://app.example.com/signup");
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "interviewai_utm";

type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** Read UTM params from the current URL. */
function readFromUrl(): UtmParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

/** Read persisted UTM params from localStorage. */
function readFromStorage(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Persist UTM params to localStorage. */
function writeToStorage(params: UtmParams) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore
  }
}

/**
 * Capture UTM params from the URL on first visit. If the URL has UTM params,
 * they override any previously stored values. If not, the stored values are
 * preserved (so we don't lose attribution on a return visit).
 *
 * Call this once on app load (e.g. in the root layout or ThemeProvider).
 */
export function captureUtm() {
  if (typeof window === "undefined") return;
  const fromUrl = readFromUrl();
  const hasUrlParams = Object.keys(fromUrl).length > 0;
  if (hasUrlParams) {
    // URL has fresh UTM params — override stored
    const merged = { ...readFromStorage(), ...fromUrl };
    writeToStorage(merged);
  } else {
    // No URL params — make sure storage is at least initialized
    if (!localStorage.getItem(STORAGE_KEY)) writeToStorage({});
  }
}

/** Get the currently stored UTM params. */
export function getUtm(): UtmParams {
  return readFromStorage();
}

/**
 * Attach stored UTM params to an outbound URL.
 * Existing query params on the URL are preserved; stored UTM params are
 * only added if not already present on the URL.
 */
export function withUtm(url: string): string {
  if (typeof window === "undefined") return url;
  try {
    const u = new URL(url, window.location.origin);
    const stored = getUtm();
    for (const [key, value] of Object.entries(stored)) {
      if (!u.searchParams.has(key) && value) {
        u.searchParams.set(key, value);
      }
    }
    // If the URL was relative, return relative; otherwise return absolute
    if (url.startsWith("/")) return u.pathname + u.search + u.hash;
    return u.toString();
  } catch {
    return url;
  }
}
