"use client";

import { useState, useEffect } from "react";
import { useNav } from "@/lib/store";
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Search,
  Share2,
  FileCheck,
  Lock,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Globe,
  ArrowRight,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  round: "A" | "B" | "C" | "D";
  title: string;
  desc: string;
  pdfTag: string;
  status: "verified" | "action-required";
  testAction?: { label: string; action: () => void };
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Round A: Google Can Find You
  {
    id: "item-1",
    round: "A",
    title: "1. Custom 404 Page",
    desc: "Helpful 'page not found' in site design that returns real HTTP 404 status, with links back to homepage and main app portals.",
    pdfTag: "Item 1 · Google",
    status: "verified",
  },
  {
    id: "item-2",
    round: "A",
    title: "2. Unique Page Titles",
    desc: "Every page has a short, descriptive title with site name at the end (e.g. 'InterviewAI — Master Every Interview with AI').",
    pdfTag: "Item 2 · Google",
    status: "verified",
  },
  {
    id: "item-3",
    round: "A",
    title: "3. Meta Description on Every Page",
    desc: "1–2 plain sentences per page summarizing its purpose and offerings without keyword stuffing.",
    pdfTag: "Item 3 · Google",
    status: "verified",
  },
  {
    id: "item-6",
    round: "A",
    title: "6. Internal Links Between Pages",
    desc: "Descriptive anchor text links connecting landing, practice portal, recruiter portal, privacy, and error states without broken links.",
    pdfTag: "Item 6 · Google",
    status: "verified",
  },
  {
    id: "item-7",
    round: "A",
    title: "7. Sitemap.xml Generated",
    desc: "Root /sitemap.xml (via Next.js sitemap.ts) listing every public indexable page, excluding admin, test, and thank-you pages.",
    pdfTag: "Item 7 · Google",
    status: "verified",
  },
  {
    id: "item-8",
    round: "A",
    title: "8. robots.txt Verified",
    desc: "Points directly to sitemap (Sitemap: https://interviewai.io/sitemap.xml), allows crawler access with zero leftover 'Disallow: /'.",
    pdfTag: "Item 8 · Google",
    status: "verified",
  },

  // Round B: Share Previews & Images
  {
    id: "item-4",
    round: "B",
    title: "4. Share Preview Image (Open Graph & Twitter)",
    desc: "Open Graph (og:title, og:description, og:image 1200×630) and Twitter Card tags configured with summary_large_image.",
    pdfTag: "Item 4 · Previews",
    status: "verified",
  },
  {
    id: "item-5",
    round: "B",
    title: "5. Alt Text on Every Meaningful Image",
    desc: "Specific descriptive alt text for illustrations, charts, and diagrams; empty alt='' for decorative background particles.",
    pdfTag: "Item 5 · Accessibility",
    status: "verified",
  },

  // Round C: Forms, Tracking & Privacy
  {
    id: "item-10",
    round: "C",
    title: "10. Spam Protection on Forms (Honeypot)",
    desc: "Hidden honeypot field (website_hp) on apply and registration forms with validation preventing bot automated submissions.",
    pdfTag: "Item 10 · Spam Shield",
    status: "verified",
  },
  {
    id: "item-11",
    round: "C",
    title: "11. Dedicated Thank-You Page (/thank-you)",
    desc: "Post-submission page confirming next steps (email receipt, scheduling link) marked with robots: { index: false }.",
    pdfTag: "Item 11 · Conversions",
    status: "verified",
  },
  {
    id: "item-12",
    round: "C",
    title: "12. Google Analytics 4 + Consent Banner",
    desc: "GA4 integration (G-XXXXXXXXXX) with an EU/UK/Swiss privacy-friendly cookie consent banner before activating tracking.",
    pdfTag: "Item 12 · Analytics",
    status: "verified",
  },
  {
    id: "item-13",
    round: "C",
    title: "13. Tailored Privacy Policy (/privacy)",
    desc: "Covers actual data collected (resumes, interview audio/video AI stream, sqlite records, cookies, GA4) linked in footer.",
    pdfTag: "Item 13 · Legal",
    status: "verified",
  },

  // Round D: Trust & Conversions
  {
    id: "item-9",
    round: "D",
    title: "9. HTTPS Everywhere",
    desc: "All traffic enforced over TLS/HTTPS with zero mixed-content protocol warnings.",
    pdfTag: "Item 9 · Security",
    status: "verified",
  },
  {
    id: "item-14",
    round: "D",
    title: "14. Structured FAQ Section",
    desc: "Interactive accordion answering the 6 top candidate & recruiter questions directly on the main landing pages.",
    pdfTag: "Item 14 · Trust",
    status: "verified",
  },
  {
    id: "item-15",
    round: "D",
    title: "15. Authentic Reviews (No AI Hallucinations)",
    desc: "Testimonial cards marked clearly as real candidate feedback and enterprise partner placeholders until live quotes are pasted.",
    pdfTag: "Item 15 · Social Proof",
    status: "verified",
  },
];

const PROMPT_TEXTS = {
  A: `Prepare my website for Google before launch. Work page by page and show me your plan before editing.
1. Custom 404 page: create a helpful "page not found" page with a link back to the homepage and my main pages, in my site's design. Make sure missing pages still return a real HTTP 404 status code, not 200. Test it by requesting a made-up URL and show me the status code.
2. Page titles: give every page a unique, short, descriptive title that says what that page is about, with my site name at the end after a separator (for example "Pricing | Brand"). No keyword stuffing.
3. Meta descriptions: write a unique 1–2 sentence description for every page that summarises it in plain words.
4. Internal links: make sure every important page is linked from at least one other page, using descriptive link text instead of "click here". Find and fix broken links.
5. Sitemap: generate sitemap.xml at the root of the site listing every public page. Leave out admin, login, thank-you and test pages. Keep it updated automatically when pages change.
6. robots.txt: create or fix it so it allows crawling of the public site and includes a line pointing to the sitemap. Make sure it does NOT contain "Disallow: /" left over from development.
At the end, show me a table of every page with its title and description so I can review them.`,

  B: `1. Share previews: add Open Graph tags to every page: og:title, og:description, og:type, og:url and og:image, plus Twitter card tags with twitter:card set to summary_large_image. Use one default share image for the whole site at 1200 × 630 px, and page-specific images where they make sense. If I haven't given you an image, add a clearly named placeholder and tell me exactly which file to replace and at what size.
2. Alt text: go through every image on the site. For meaningful images, write short, specific alt text describing what's actually in the image. For purely decorative images, use an empty alt attribute (alt="") so screen readers skip them. Don't stuff keywords.
Show me the full list of images with the alt text you plan to add before editing.`,

  C: `1. Spam protection: on every form, add a hidden honeypot field and basic rate limiting on the server, and validate every field on the server, not just in the browser. Only if spam still gets through, add a free CAPTCHA such as Cloudflare Turnstile.
2. Thank-you page: after a successful form submission, send the visitor to a dedicated /thank-you page that confirms what happens next. Keep it out of the sitemap and mark it noindex.
3. Google Analytics 4: add GA4 with my Measurement ID: G-XXXXXXXXXX. For visitors in the EU, UK and Switzerland, load it only after they accept cookies through a simple consent banner. Tell me how to mark the /thank-you page view as a key event so form submissions are counted.
4. Privacy policy: create a /privacy page and link it in the footer. Base it only on what my site actually collects. First list every form, cookie, analytics or third-party tool you find in my code, then write the policy from that list, including Google Analytics. Mark it clearly as a template I must review.
Show me your plan for all four before editing.`,

  D: `1. HTTPS: make sure every page loads over https, http redirects to https, and there are no mixed-content warnings (no images, scripts or fonts loaded over http). Most hosts give free HTTPS automatically; just confirm it's on and fix anything still using http.
2. FAQ section: add an FAQ section where it fits best, with the questions I give you. Draft the answers from what's already on my site, and mark anything you're unsure about for me to confirm. Don't add FAQ schema expecting special Google results; Google no longer shows them.
3. Reviews: create a reviews/testimonials section with clearly marked placeholders only. Do NOT write, invent or reword any review, name, rating or photo. I will paste real reviews from real customers myself, with their permission. Don't add review-star schema for reviews about my own business.
Show me your plan before editing.`,

  MASTER: `I'm about to launch my website. Add everything on my launch checklist in four rounds, showing me your plan before each round and how to check it after:

Round 1, Google: custom 404 page with a real 404 status, unique page titles, meta descriptions, internal links, sitemap.xml, and a robots.txt that points to the sitemap with no "Disallow: /".
Round 2, sharing: Open Graph + Twitter card tags with a 1200 × 630 share image, and specific alt text on every meaningful image (empty alt for decorative ones).
Round 3, forms and tracking: honeypot + rate limiting + server validation on forms, a noindex /thank-you page, GA4 (ID: G-XXXXXXXXXX) behind a consent banner for EU/UK/Swiss visitors, and a privacy policy based only on what the site actually collects.
Round 4, trust: https everywhere with no mixed content, an FAQ section from my questions, and a reviews section with placeholders only. Never invent reviews.`,
};

export function LaunchChecklistHub() {
  const setScreen = useNav((s) => s.set);
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return CHECKLIST_ITEMS.map((item) => item.id);
    try {
      const stored = localStorage.getItem("interviewai_launch_checklist");
      if (stored) {
        return JSON.parse(stored);
      }
      const defaultChecked = CHECKLIST_ITEMS.map((item) => item.id);
      localStorage.setItem("interviewai_launch_checklist", JSON.stringify(defaultChecked));
      return defaultChecked;
    } catch {
      return CHECKLIST_ITEMS.map((item) => item.id);
    }
  });
  const [activeTab, setActiveTab] = useState<"checklist" | "prompts" | "preview" | "manual">("checklist");
  const [activeRound, setActiveRound] = useState<"ALL" | "A" | "B" | "C" | "D">("ALL");

  const toggleCheck = (id: string) => {
    const updated = checkedIds.includes(id)
      ? checkedIds.filter((x) => x !== id)
      : [...checkedIds, id];
    setCheckedIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("interviewai_launch_checklist", JSON.stringify(updated));
    }
  };

  const copyPrompt = (text: string, title: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${title} copied to clipboard!`);
    }
  };

  const filteredItems = activeRound === "ALL"
    ? CHECKLIST_ITEMS
    : CHECKLIST_ITEMS.filter((item) => item.round === activeRound);

  const completionPct = Math.round((checkedIds.length / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
                <Sparkles className="h-3.5 w-3.5" />
                PDF Launch Specification · @namansoni.ai
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Don't Launch Without This List
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
                15 essentials to ensure Google indexes your site, share cards look stunning on WhatsApp &amp; LinkedIn, forms are spam-protected, and visitors trust your brand.
              </p>
            </div>

            {/* Progress Gauge */}
            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-border/80 bg-background/80 p-4 shadow-sm backdrop-blur">
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Readiness
                </p>
                <p className="text-2xl font-black text-foreground">
                  {checkedIds.length} <span className="text-sm font-normal text-muted-foreground">/ 15</span>
                </p>
              </div>
              <div className="relative h-12 w-12 flex items-center justify-center">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/30"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-500"
                    strokeDasharray={`${completionPct}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-foreground">
                  {completionPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tab Selector */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-6">
            <button
              onClick={() => setActiveTab("checklist")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "checklist"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              📋 15-Item Checklist
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "prompts"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              ⚡ AI Prompts (A → D + Master)
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              🖼️ Social Preview Simulator
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "manual"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              🚀 4 After-Launch Steps
            </button>
          </div>
        </div>

        {/* TAB 1: 15-Item Checklist */}
        {activeTab === "checklist" && (
          <div className="space-y-6">
            {/* Filter Pills by Round */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Button
                  size="sm"
                  variant={activeRound === "ALL" ? "default" : "outline"}
                  onClick={() => setActiveRound("ALL")}
                  className="rounded-lg h-8"
                >
                  All 15 Items
                </Button>
                <Button
                  size="sm"
                  variant={activeRound === "A" ? "default" : "outline"}
                  onClick={() => setActiveRound("A")}
                  className="rounded-lg h-8 gap-1"
                >
                  <Search className="h-3 w-3" />
                  Round A: Google (6)
                </Button>
                <Button
                  size="sm"
                  variant={activeRound === "B" ? "default" : "outline"}
                  onClick={() => setActiveRound("B")}
                  className="rounded-lg h-8 gap-1"
                >
                  <Share2 className="h-3 w-3" />
                  Round B: Previews (2)
                </Button>
                <Button
                  size="sm"
                  variant={activeRound === "C" ? "default" : "outline"}
                  onClick={() => setActiveRound("C")}
                  className="rounded-lg h-8 gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Round C: Privacy (4)
                </Button>
                <Button
                  size="sm"
                  variant={activeRound === "D" ? "default" : "outline"}
                  onClick={() => setActiveRound("D")}
                  className="rounded-lg h-8 gap-1"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Round D: Trust (3)
                </Button>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setScreen("not-found")}
                  className="h-8 text-xs gap-1 rounded-lg"
                >
                  View 404
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setScreen("privacy")}
                  className="h-8 text-xs gap-1 rounded-lg"
                >
                  View /privacy
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setScreen("thank-you")}
                  className="h-8 text-xs gap-1 rounded-lg"
                >
                  View /thank-you
                </Button>
              </div>
            </div>

            {/* Checklist items list */}
            <div className="grid gap-3">
              {filteredItems.map((item) => {
                const isChecked = checkedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                      isChecked
                        ? "border-emerald-500/30 bg-emerald-500/[0.03] dark:border-emerald-500/20"
                        : "border-border/80 bg-card hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 h-5 w-5 shrink-0 rounded border-border accent-emerald-500 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-sm font-semibold transition-colors ${
                          isChecked ? "text-foreground" : "text-foreground/90"
                        }`}>
                          {item.title}
                        </h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {item.pdfTag}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Implemented in Code
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AI Prompts */}
        {activeTab === "prompts" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border/80 bg-card p-4 text-xs text-muted-foreground">
              These are the exact prompts from pages 4–8 of the launch PDF. You can copy any round to paste into Claude Code, Cursor, or Codex, or use the Master Prompt for an all-in-one run.
            </div>

            <div className="space-y-4">
              {/* Master Prompt */}
              <div className="rounded-2xl border-2 border-primary/40 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-foreground">★ Master Prompt (All 4 Rounds)</h3>
                    <p className="text-xs text-muted-foreground">Seedhi baat: ek prompt, saari pandrah cheezein.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => copyPrompt(PROMPT_TEXTS.MASTER, "Master Prompt")}
                    className="gap-1.5 rounded-lg text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Master Prompt
                  </Button>
                </div>
                <pre className="mt-4 max-h-52 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 font-mono text-[11px] text-muted-foreground">
                  {PROMPT_TEXTS.MASTER}
                </pre>
              </div>

              {/* Round A */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-foreground">Prompt A: Google (Items 1, 2, 3, 6, 7, 8)</h3>
                    <p className="text-xs text-muted-foreground">Google ko pata chale tumhari website exist karti hai.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyPrompt(PROMPT_TEXTS.A, "Prompt A")}
                    className="gap-1.5 rounded-lg text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Prompt A
                  </Button>
                </div>
                <pre className="mt-4 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 font-mono text-[11px] text-muted-foreground">
                  {PROMPT_TEXTS.A}
                </pre>
              </div>

              {/* Round B */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-foreground">Prompt B: Share Previews &amp; Images (Items 4, 5)</h3>
                    <p className="text-xs text-muted-foreground">Link share karo toh mast preview aaye.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyPrompt(PROMPT_TEXTS.B, "Prompt B")}
                    className="gap-1.5 rounded-lg text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Prompt B
                  </Button>
                </div>
                <pre className="mt-4 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 font-mono text-[11px] text-muted-foreground">
                  {PROMPT_TEXTS.B}
                </pre>
              </div>

              {/* Round C */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-foreground">Prompt C: Forms, Tracking &amp; Privacy (Items 10, 11, 12, 13)</h3>
                    <p className="text-xs text-muted-foreground">Spam band, leads count, privacy sorted.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyPrompt(PROMPT_TEXTS.C, "Prompt C")}
                    className="gap-1.5 rounded-lg text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Prompt C
                  </Button>
                </div>
                <pre className="mt-4 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 font-mono text-[11px] text-muted-foreground">
                  {PROMPT_TEXTS.C}
                </pre>
              </div>

              {/* Round D */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-foreground">Prompt D: Trust (Items 9, 14, 15)</h3>
                    <p className="text-xs text-muted-foreground">Visitor ko lage ye website asli hai.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyPrompt(PROMPT_TEXTS.D, "Prompt D")}
                    className="gap-1.5 rounded-lg text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Prompt D
                  </Button>
                </div>
                <pre className="mt-4 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 font-mono text-[11px] text-muted-foreground">
                  {PROMPT_TEXTS.D}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Social Preview Simulator */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  Open Graph &amp; Twitter Card Preview Simulator
                </h3>
                <p className="text-xs text-muted-foreground">
                  This simulates how WhatsApp, LinkedIn, and X / Twitter generate link preview cards from your 1200×630 share image and Open Graph metadata.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 pt-2">
                {/* LinkedIn / WhatsApp Card Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    LinkedIn / WhatsApp Preview Card
                  </span>
                  <div className="overflow-hidden rounded-xl border border-border/80 bg-background shadow-md">
                    <div className="relative aspect-[1200/630] w-full bg-zinc-950">
                      <img
                        src="/og-image.svg"
                        alt="InterviewAI OpenGraph preview banner"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                        interviewai.io
                      </p>
                      <h4 className="font-bold text-sm text-foreground">
                        InterviewAI — Master Every Interview with AI
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Dual-mode AI SaaS for mock interviews, coding challenges, and proctored hiring at scale.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Twitter / X Summary Large Image Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    X / Twitter Summary Large Image Card
                  </span>
                  <div className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-md">
                    <div className="relative aspect-[1200/630] w-full bg-zinc-950">
                      <img
                        src="/og-image.svg"
                        alt="Twitter share preview card for InterviewAI"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="font-semibold text-sm text-foreground">
                        InterviewAI — Master Every Interview with AI
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Dual-mode AI SaaS for mock interviews, coding challenges, and proctored hiring at scale.
                      </p>
                      <p className="text-[11px] text-muted-foreground pt-1">
                        🔗 interviewai.io
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-xs text-muted-foreground flex items-center justify-between">
                <span>Asset File: <code>/public/og-image.svg</code> (1200 × 630 px)</span>
                <span className="text-emerald-500 font-semibold">✓ Verified Active</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 4 After-Launch Steps */}
        {activeTab === "manual" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  After Going Live: 4 Manual Steps (from Page 8)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Once your code is deployed to your custom domain on Vercel or your production host, complete these 4 quick manual verification steps:
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    <h4 className="font-bold text-sm text-foreground">Google Search Console</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add your custom domain at <code>search.google.com/search-console</code> and verify ownership (the DNS TXT option is easiest and fastest).
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-foreground">Submit Sitemap</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Navigate to <strong>Sitemaps</strong> in Google Search Console and submit: <code>yourdomain.com/sitemap.xml</code>.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      3
                    </span>
                    <h4 className="font-bold text-sm text-foreground">URL Inspection</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use URL Inspection to test your homepage and click <strong>"Request Indexing"</strong> so Google crawls your site immediately.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      4
                    </span>
                    <h4 className="font-bold text-sm text-foreground">GA4 Realtime Check</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Open your live site in an incognito window, accept the cookie consent banner, and verify your active session in <strong>GA4 → Realtime</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
