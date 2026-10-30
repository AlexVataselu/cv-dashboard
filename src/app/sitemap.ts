import type { MetadataRoute } from "next";
import { SECTIONS } from "@/lib/sections";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return SECTIONS.map((s) => ({
    url: `${SITE_URL}${s.href === "/" ? "" : s.href}`,
    changeFrequency: "monthly",
    priority: s.href === "/" ? 1 : 0.7,
  }));
}
