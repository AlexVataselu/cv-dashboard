// Lighthouse CI config. One file for both presets:
//   LH_PRESET=mobile (default) | desktop
//   LH_BASE_URL=http://localhost:4318   (the deployed URL in CI; no trailing slash)
const preset = process.env.LH_PRESET === "desktop" ? "desktop" : "mobile";
const base = (process.env.LH_BASE_URL || "http://localhost:4318").replace(/\/+$/, "");
// Optional: lets LHCI through Vercel Deployment Protection on previews.
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const routes = ["/", "/experience", "/skills", "/projects", "/education"];

module.exports = {
  ci: {
    collect: {
      url: routes.map((r) => base + r),
      numberOfRuns: 1,
      settings: {
        // "mobile" is Lighthouse's default emulation, so only desktop needs a preset.
        ...(preset === "desktop" ? { preset: "desktop" } : {}),
        ...(bypass ? { extraHeaders: { "x-vercel-protection-bypass": bypass } } : {}),
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 1 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 1200 }],
        // 0 exactly: Lighthouse reports CLS as an unrounded float, and a static page should have none.
        "cumulative-layout-shift": ["error", { maxNumericValue: 0 }],
        // INP needs real interaction and is not measurable in a lab run.
        // Total Blocking Time is the lab proxy for responsiveness.
        "total-blocking-time": ["error", { maxNumericValue: 100 }],
      },
    },
  },
};
