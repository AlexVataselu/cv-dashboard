import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import Script from "next/script";
import { ProfileRail } from "@/components/ProfileRail";
import { StatusBar } from "@/components/StatusBar";
import { SkillParamSync } from "@/components/SkillParamSync";
import { Credits } from "@/components/Credits";
import { HOME_DESCRIPTION, SITE_URL, pageMetadata, personJsonLd } from "@/lib/site";
import "./globals.css";

// `subsets` only decides which files get a preload. The latin-ext faces are still
// declared (with unicode-range) and load on demand for the few glyphs that need
// them (the "ș" in the location line), so they stay off the critical path.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ description: HOME_DESCRIPTION, path: "/" }),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} antialiased`}>
      <body className="min-h-svh bg-ground text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:font-semibold focus:text-ink"
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
          This relies on undocumented Next.js internals (appBootstrap /
          loadScriptsInSequence), verified against next 16.4.3 only. An upgrade can
          turn it into a silent no-op: the e2e test only checks that the script is
          present. The real guard is the Lighthouse mobile Total Blocking Time
          assertion in lighthouserc.cjs, which also documents the thresholds.
          Inline script: it needs a nonce if a Content-Security-Policy is added.
        */}
        <Script id="yield-before-hydration" strategy="beforeInteractive">
          {"void 0"}
        </Script>
        <SkillParamSync />
        <div className="grid min-h-svh gap-(--margin) p-(--margin) lg:grid-cols-[minmax(340px,31vw)_minmax(0,1fr)]">
          <ProfileRail />
          <div className="flex min-w-0 flex-col">
            {children}
            <StatusBar />
            <Credits />
          </div>
        </div>
      </body>
    </html>
  );
}
