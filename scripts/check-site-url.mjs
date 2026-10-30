import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/**
 * A production build must know its public URL, otherwise canonical, OG and sitemap
 * would ship as localhost. Local and preview builds keep the localhost fallback.
 */
export function siteUrlViolation(env) {
  if (env.VERCEL_ENV === "production" && !env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return "NEXT_PUBLIC_SITE_URL is required for production builds (set it in Vercel project settings, Production environment).";
  }
  return null;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const violation = siteUrlViolation(process.env);
  if (violation) {
    console.error(violation);
    process.exit(1);
  }
}
