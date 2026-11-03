import type { Metadata } from "next";
import { cv } from "@/content/cv";

// No trailing slash, so `${SITE_URL}/path` never doubles it.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = cv.name;

export const HOME_DESCRIPTION =
  "Senior Frontend Engineer in Brașov, Romania, working remotely across the EU. 14 years building software, the last five on React, Next.js, TypeScript and React Native.";

// Pages that set their own openGraph/twitter do not inherit the file-convention image, so name it.
const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: `${cv.name}, ${cv.title}`,
};

// Next merges `openGraph` and `twitter` shallowly, so each page repeats them via this helper.
export function pageMetadata(opts: { title?: string; description: string; path: string }): Metadata {
  const title = opts.title ? `${opts.title} · ${cv.name}` : `${cv.name} · ${cv.title}`;
  return {
    title: { absolute: title },
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      title,
      description: opts.description,
      url: opts.path,
      locale: "en",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: opts.description,
      images: [OG_IMAGE],
    },
  };
}

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: cv.name,
  jobTitle: cv.title,
  email: `mailto:${cv.email}`,
  url: SITE_URL,
  image: `${SITE_URL}/photo.webp`,
  sameAs: [cv.links.linkedin, cv.links.github],
};
