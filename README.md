# CV Dashboard

Static Next.js (App Router, TypeScript, Tailwind) CV site for Alex Vataselu, exported to `out/`.

## Run

Needs Node 22 and pnpm 11.8 (pinned in `packageManager`).

```
pnpm install
pnpm dev        # dev server on http://localhost:3000
```

## Scripts

- `pnpm dev` - dev server
- `pnpm build` - static export to `out/`; the post-build step measures first-load JS into `data/build-stats.json` and fails above the 150 KB gzipped budget
- `pnpm test` - Vitest unit tests
- `pnpm e2e` - builds, then runs Playwright against `out/` (served on port 4317). First time: `pnpm exec playwright install chromium`
- `pnpm lint` - ESLint
- `pnpm typecheck` - `tsc --noEmit`

## Lighthouse locally

```
pnpm build
pnpm exec serve out -l 4318
# in another shell; LH_PRESET=desktop for the desktop run
pnpm dlx @lhci/cli@0.15.1 autorun
```

`lighthouserc.cjs` holds the assertions: 100 in performance, accessibility, best practices and SEO,
LCP at most 1200 ms, CLS 0, and Total Blocking Time at most 100 ms (the lab proxy for INP, which
needs real interaction). Set `CHROME_PATH` if Chrome is not found. `LH_BASE_URL` points the audit at a deployed URL.

## Deploy

Hosting is Vercel through its Git integration: import the GitHub repo (framework Next.js, static
export). Pushes to `main` deploy production; other branches and PRs get preview deployments.

Set `NEXT_PUBLIC_SITE_URL` (for example `https://your-project.vercel.app`) in the Production
environment. It feeds canonical URLs, Open Graph and the sitemap. A production build
(`VERCEL_ENV=production`) fails if it is missing; local and preview builds fall back to `http://localhost:3000`.

## What CI checks

`.github/workflows/ci.yml` runs on every push and PR: install with a frozen lockfile, typecheck,
lint, unit tests, e2e (including the build) and the first-load JS budget.

`.github/workflows/lighthouse.yml` runs when Vercel reports a successful Preview or Production
deployment. It audits the five routes on mobile and desktop against `lighthouserc.cjs` and fails on
any miss. On Production it also writes the date and worst scores to `data/last-audit.json`, refreshes
`data/build-stats.json`, and commits both to `main` with `[skip ci]`. The status bar therefore shows
the previous deploy's values.
