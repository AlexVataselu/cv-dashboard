import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ProfileRail } from "@/components/ProfileRail";
import { SkillParamSync } from "@/components/SkillParamSync";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alex Vataselu · Senior Frontend Engineer",
  description: "Senior Frontend Engineer based in Brașov, Romania, working remotely across the EU.",
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
        <SkillParamSync />
        <div className="flex min-h-screen flex-col md:flex-row">
          <ProfileRail />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
