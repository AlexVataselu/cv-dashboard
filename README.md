# CV Dashboard

Alex Vataselu's CV as a fast, accessible dashboard: experience, skills with where each was used, projects and education.
Live site: _link to be added after the first production deploy_.

Static Next.js (App Router, TypeScript, Tailwind) site, exported to `out/`.

## Run

Needs Node 22 and pnpm 11.8 (pinned in `packageManager`).

```
pnpm install
pnpm dev        # dev server on http://localhost:3000
```

## Scripts

- `pnpm dev` - dev server
- `pnpm build` - static export to `out/`; the post-build step measures first-load JS into `data/build-stats.json`
  and fails above the 150 KB gzipped budget. The home route is at about 147 KB, so there is little headroom.
  Because the step runs on every build, a change over budget also fails the Vercel build.
- `pnpm start` - serves `out/`
- `pnpm test` - Vitest unit tests
- `pnpm e2e` - builds, then runs Playwright against `out/` (served on port 4317). The build refreshes
  `data/build-stats.json`, so commit it when the size changes. First time: `pnpm exec playwright install chromium`
- `pnpm lint` - ESLint
- `pnpm typecheck` - `tsc --noEmit`

## Lighthouse locally

```
pnpm build
pnpm exec serve out -l 4318
# in another shell; LH_PRESET=desktop for the desktop run
pnpm dlx @lhci/cli@0.15.1 autorun
```

`lighthouserc.cjs` holds the assertions, which depend on `LH_PRESET`. Every URL runs three times
and the median is asserted.

- Desktop: 100 in performance, accessibility, best practices and SEO, LCP at most 1200 ms, CLS 0,
  and Total Blocking Time at most 100 ms. TBT is the lab proxy for INP, which needs real interaction.
- Mobile:
  - performance at least 95
  - accessibility, best practices and SEO at 100
  - CLS 0
  - TBT at most 150 ms
  - LCP above 1200 ms is a warning only

  The mobile performance and LCP thresholds are an accepted trade-off: on the simulated slow-4G,
  4x-CPU profile, the React and Next.js bootstrap and the web fonts keep LCP around 2.5 s. Mobile TBT
  at most 150 ms is also the regression guard for the hydration yield script in `src/app/layout.tsx`.
  It measures about 128 ms with the script and about 165 ms without.

Set `CHROME_PATH` if Chrome is not found. `LH_BASE_URL` points the audit at a deployed URL, and
`LH_TARGET=preview` audits it as a preview (see below).

## Deploy

Hosting is Vercel through its Git integration: import the GitHub repo (framework Next.js, static
export). Pushes to `main` deploy production; other branches and PRs get preview deployments.

Set `NEXT_PUBLIC_SITE_URL` (for example `https://your-project.vercel.app`) in the Production
environment. It feeds canonical URLs, Open Graph and the sitemap. A production build
(`VERCEL_ENV=production`) fails if it is missing. Local and preview builds fall back to
`http://localhost:3000`, so previews ship localhost canonical URLs; that is accepted, since previews
are not meant to be indexed.

Also set the same URL as the GitHub repo variable `SITE_URL`, which the Lighthouse workflow audits.

`vercel.json` sets an `ignoreCommand` (`scripts/vercel-ignore-build.mjs`) that skips the build when
the commit author is `github-actions[bot]` or when only `data/` changed.

## What CI checks

`.github/workflows/ci.yml` runs on pull requests and on pushes to `main`: install with a frozen
lockfile, typecheck, lint, unit tests, and e2e (whose build also enforces the first-load JS budget).

`.github/workflows/lighthouse.yml` runs when Vercel reports a successful Preview or Production
deployment. It audits the five routes on mobile and desktop against `lighthouserc.cjs` and fails on
any miss.

- Production is audited at the public URL from the `SITE_URL` repo variable. If the variable is not
  set, it falls back to the deployment URL and audits it as a preview.
- Previews are audited at their deployment URL with `LH_TARGET=preview`. Vercel sends
  `X-Robots-Tag: noindex` there, so the `is-crawlable` audit is skipped; every other SEO audit
  must still reach 100.

On Production a separate job, the only one with write access, writes the date and worst scores to
`data/last-audit.json`, refreshes `data/build-stats.json`, and commits both to `main` as
`github-actions[bot]`. The status bar therefore shows the previous deploy's values. That commit does
not start another round: `vercel.json` skips deploying it, and the workflow skips auditing a
bot commit. The `[skip ci]` in its message only affects GitHub Actions, not Vercel.

### Preview protection

Vercel Deployment Protection answers 401 to the audit. Either turn protection off for previews, or
enable Protection Bypass for Automation in the Vercel project and add its value as the GitHub repo
secret `VERCEL_AUTOMATION_BYPASS_SECRET`; the workflow then sends it as `x-vercel-protection-bypass`.
A preflight step requests every route first and fails with a clear message on a timeout or any HTTP
error.
