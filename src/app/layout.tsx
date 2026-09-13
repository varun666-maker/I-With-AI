import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/theme-provider";

const inter = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviewAI — Master Every Interview with AI",
  description:
    "Dual-mode AI SaaS for interview preparation and hiring. Practice with AI interviewer, get instant feedback, run proctored campus drives, and hire at scale.",
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
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "InterviewAI",
    description: "Master Every Interview with AI",
    siteName: "InterviewAI",
    type: "website",
  },
};

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
        <ThemeProvider>{children}<Toaster /></ThemeProvider>
      </body>
    </html>
  );
}
