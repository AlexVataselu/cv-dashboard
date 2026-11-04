import type { Metadata } from "next";
import { ViewTransition } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import { ProfileRail } from "@/components/ProfileRail";
import { SkillParamSync } from "@/components/SkillParamSync";
import { StatusBar } from "@/components/StatusBar";
import { MotionBoot } from "@/components/MotionBoot";
import { SkillLinks } from "@/components/SkillLinks";
import { cv } from "@/content/cv";
import { HOME_DESCRIPTION, SITE_URL, pageMetadata, personJsonLd } from "@/lib/site";
import "./globals.css";

// `subsets` only decides which files get a preload. The latin-ext faces are still
// declared (with unicode-range) and load on demand for the few glyphs that need
// them (the "ș" in the location line), so they stay off the critical path; keep "ș"
// out of text a phone shows, or it pulls a latin-ext file into the first load.
// IBM Plex Sans is variable (one file for every weight); Plex Mono has one job:
// machine names (domains, repository paths) and the status bar's measurements.
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Runs in <head> before the first paint: the saved choice wins, otherwise the dark theme (the
// default). Storage can throw (private windows, blocked site data), so dark is set first.
// It also marks the page as scripted (data-js): the one-screen layout, whose cards scroll inside
// themselves, applies only then. Without JS the page keeps every block open and scrolls as a page.
const THEME_SCRIPT =
  'var d=document.documentElement;d.dataset.js="";d.dataset.theme="dark";try{if(localStorage.getItem("theme")==="light")d.dataset.theme="light"}catch(e){}';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ description: HOME_DESCRIPTION, path: "/" }),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plex.variable} ${plexMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Inline, so it needs a nonce if a Content-Security-Policy is added. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-ground text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:text-ink"
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
        <SkillParamSync skills={cv.skills.map((s) => [s.id, s.name])} />
        {/* The frame: the profile rail (with the section tabs) on one tint; the sheet beside it.
            The rail, the sheet and the status bar stay mounted across tab switches; only <main> changes.
            From 1024x640 up (with JS) the frame is exactly one screen tall: the page never scrolls, and
            a card whose content is longer than its slot scrolls inside itself. */}
        <div className="shell">
          <ProfileRail />
          <div className="workspace">
            <div className="sheet">
              {/* Section switches cross-fade and slide through the View Transitions API (no JS of our own). */}
              <ViewTransition default="panel">{children}</ViewTransition>
              <StatusBar />
            </div>
          </div>
        </div>
        <SkillLinks />
        <MotionBoot />
      </body>
    </html>
  );
}
