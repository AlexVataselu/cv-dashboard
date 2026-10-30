import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ProfileRail } from "@/components/ProfileRail";
import { StatusBar } from "@/components/StatusBar";
import { SkillParamSync } from "@/components/SkillParamSync";
import { SITE_URL, pageMetadata, personJsonLd } from "@/lib/site";
import "./globals.css";

// `subsets` only decides which files get a preload. The latin-ext faces are still
// declared (with unicode-range) and load on demand for the few glyphs that need
// them (the "ș" in the location line), so they stay off the critical path.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    description:
      "Senior Frontend Engineer in Brașov, Romania, working remotely across the EU. 9 years building for the web with React, Next.js, TypeScript and React Native.",
    path: "/",
  }),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-screen bg-bg text-text">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        {/*
          Yield point. Next.js runs inline beforeInteractive scripts before it starts
          the app, and resumes in a new task (setTimeout) after each one. That splits
          "evaluate the framework chunks" from "instantiate React + router and hydrate",
          so neither blocks the main thread long enough to count as a long task on a
          throttled phone.
        */}
        <Script id="yield-before-hydration" strategy="beforeInteractive">
          {"void 0"}
        </Script>
        <SkillParamSync />
        <div className="flex min-h-screen flex-col md:flex-row">
          <ProfileRail />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1">{children}</div>
            <StatusBar />
          </div>
        </div>
      </body>
    </html>
  );
}
