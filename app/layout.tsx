import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/theme-provider";

const inter = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "InterviewAI — Master Every Interview with AI",
  description:
    "Dual-mode AI SaaS for interview preparation and hiring. Practice with AI interviewer, get instant feedback, run proctored campus drives, and hire at scale.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://interviewai.io"),
  keywords: [
    "AI Interview",
    "Mock Interview",
    "Hiring Platform",
    "SaaS",
    "Resume Analyzer",
    "Coding Arena",
  ],
  authors: [{ name: "InterviewAI" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "InterviewAI — Master Every Interview with AI",
    description: "Dual-mode AI SaaS for mock interviews, coding challenges, and proctored hiring at scale.",
    url: "https://interviewai.io",
    siteName: "InterviewAI",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "InterviewAI — Dual-Mode AI SaaS Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAI — Master Every Interview with AI",
    description: "Dual-mode AI SaaS for mock interviews, coding challenges, and proctored hiring at scale.",
    images: ["/og-image.svg"],
    creator: "@interviewai",
  },
};

import { CookieConsentBanner } from "@/components/shared/cookie-consent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply stored theme + accent before paint to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  var a = localStorage.getItem('accent');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.classList.add(t);
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                  document.documentElement.setAttribute('data-accent', a || 'violet');
                  // If custom accent, apply the custom color CSS variables before paint
                  if (a === 'custom') {
                    var hex = localStorage.getItem('customColor') || '#a855f7';
                    var shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
                    var mixPct = {50:95,100:90,200:80,300:70,400:60,500:50,600:40,700:30,800:20,900:10,950:5};
                    for (var i = 0; i < shades.length; i++) {
                      var shade = shades[i];
                      var pct = mixPct[shade];
                      var isLight = pct > 50;
                      var mixWith = isLight ? 'white' : 'black';
                      var mixAmount = isLight ? (100 - pct) * 2 : pct * 2;
                      if (mixAmount > 100) mixAmount = 100;
                      var fuchsiaAmount = mixAmount * 0.8;
                      if (fuchsiaAmount > 100) fuchsiaAmount = 100;
                      document.documentElement.style.setProperty(
                        '--color-violet-' + shade,
                        'color-mix(in oklab, ' + hex + ' ' + mixAmount + '%, ' + mixWith + ')'
                      );
                      document.documentElement.style.setProperty(
                        '--color-fuchsia-' + shade,
                        'color-mix(in oklab, ' + hex + ' ' + fuchsiaAmount + '%, ' + mixWith + ')'
                      );
                    }
                    document.documentElement.style.setProperty('--gradient-text-1', 'color-mix(in oklab, ' + hex + ' 30%, white)');
                    document.documentElement.style.setProperty('--gradient-text-2', hex);
                    document.documentElement.style.setProperty('--gradient-text-3', 'color-mix(in oklab, ' + hex + ' 70%, black)');
                    document.documentElement.style.setProperty('--accent-swatch', hex);
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-accent', 'violet');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider>
          {children}
          <CookieConsentBanner />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
