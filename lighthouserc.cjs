// Lighthouse CI config. One file for both presets and both deployment targets:
//   LH_PRESET=mobile (default) | desktop
//   LH_TARGET=production (default) | preview
//   LH_BASE_URL=http://localhost:4318   (the deployed URL in CI; a trailing slash is ignored)
const preset = process.env.LH_PRESET === "desktop" ? "desktop" : "mobile";
const target = process.env.LH_TARGET === "preview" ? "preview" : "production";
const base = (process.env.LH_BASE_URL || "http://localhost:4318").replace(/\/+$/, "");
// Optional: lets LHCI through Vercel Deployment Protection on previews.
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const routes = ["/", "/experience", "/skills", "/projects", "/education"];

// Vercel serves preview deployments with `X-Robots-Tag: noindex`, so "is-crawlable" can only
// fail there. It is skipped (not just unasserted) on previews so the SEO category score
// leaves it out and every other SEO audit still has to reach 100.
const previewOnly = target === "preview" ? { skipAudits: ["is-crawlable"] } : {};

module.exports = {
  ci: {
    collect: {
      url: routes.map((r) => base + r),
      // LHCI asserts on the median of the runs.
      numberOfRuns: 3,
      settings: {
        // "mobile" is Lighthouse's default emulation, so only desktop needs a preset.
        ...(preset === "desktop" ? { preset: "desktop" } : {}),
        ...(bypass ? { extraHeaders: { "x-vercel-protection-bypass": bypass } } : {}),
        ...previewOnly,
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      // Desktop holds the full bar. Mobile performance and LCP are relaxed as an accepted
      // trade-off: on the simulated 4x-CPU / slow-4G profile the React and Next.js bootstrap
      // and the two latin web fonts keep LCP around 2.5 s and TBT around 130 ms.
      assertions: {
        "categories:performance": ["error", { minScore: preset === "desktop" ? 1 : 0.95 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
        ...(target === "preview" ? { "is-crawlable": "off" } : {}),
        // Mobile: still reported, but a warning, not a failure.
        "largest-contentful-paint": [preset === "desktop" ? "error" : "warn", { maxNumericValue: 1200 }],
        // 0 exactly: Lighthouse reports CLS as an unrounded float, and a static page should have none.
        "cumulative-layout-shift": ["error", { maxNumericValue: 0 }],
        // INP needs real interaction and is not measurable in a lab run.
        // Total Blocking Time is the lab proxy for responsiveness.
        // Mobile 150 ms is also the regression guard for the hydration yield script in
        // src/app/layout.tsx: about 128 ms with it, about 165 ms without.
        "total-blocking-time": ["error", { maxNumericValue: preset === "desktop" ? 100 : 150 }],
      },
    },
  },
};
