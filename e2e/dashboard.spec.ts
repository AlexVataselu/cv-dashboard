import { expect, test } from "@playwright/test";

const ROUTES = [
  { path: "/", label: "Overview", h1: "Overview" },
  { path: "/experience", label: "Experience", h1: "Experience" },
  { path: "/skills", label: "Skills", h1: "Skills" },
  { path: "/projects", label: "Projects", h1: "Projects" },
  { path: "/education", label: "Education", h1: "Education" },
];

test("first screen at 1280x800 shows name, title, availability and Email without scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const rail = page.locator("aside");
  await expect(rail.getByText("Alex Vataselu", { exact: true })).toBeInViewport();
  await expect(rail.getByText("Senior Frontend Engineer")).toBeInViewport();
  await expect(rail.getByText(/open to work/i)).toBeInViewport();
  await expect(rail.getByRole("link", { name: "Email me" })).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("nav links load their section and Back returns to the previous one", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.getByRole("link", { name: "Skills" }).click();
  await expect(page).toHaveURL(/\/skills$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skills");
  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skills");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all 5 sections render through the nav links", async ({ page }) => {
    await page.goto("/");
    for (const r of ROUTES) {
      await page
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", { name: r.label })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(r.h1);
      await expect(page.locator("main")).not.toBeEmpty();
    }
  });

  test("every role opens via its summary and shows its bullets; newest renders open", async ({
    page,
  }) => {
    await page.goto("/experience");
    const roles = page.locator("details");
    const count = await roles.count();
    expect(count).toBeGreaterThan(1);
    await expect(roles.first()).toHaveJSProperty("open", true);
    await expect(roles.nth(1)).toHaveJSProperty("open", false);
    for (let i = 0; i < count; i++) {
      const role = roles.nth(i);
      if (i > 0) await role.locator("summary").click();
      await expect(role).toHaveJSProperty("open", true);
      const bullets = role.locator("li");
      expect(await bullets.count()).toBeGreaterThan(0);
      await expect(bullets.first()).toBeVisible();
    }
  });
});

test("320x640 has no horizontal overflow on any route", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const r of ROUTES) {
    await page.goto(r.path);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(w, `${r.path} scrollWidth`).toBeLessThanOrEqual(320);
  }
});

test("/projects?skill=expo highlights Powderino without layout shift", async ({ page }) => {
  await page.goto("/projects?skill=expo");
  const card = page.locator("article", { hasText: "Powderino" });
  await expect(card).toHaveAttribute("data-highlight", "true");
  const before = await card.boundingBox();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(after).toEqual(before);
});

test("?skill stays in step with the highlight across navigation and Back/Forward", async ({
  page,
}) => {
  const nav = page.getByRole("navigation", { name: "Sections" });
  const expoChip = page.getByRole("button", { name: /^Expo\b/ });
  const reactChip = page.getByRole("button", { name: /^React ·/ });
  const powderino = page.locator("article", { hasText: "Powderino" });
  const reamp = page.locator("article", { hasText: "ReAMP" });

  await page.goto("/projects");
  await nav.getByRole("link", { name: "Skills" }).click();
  await expect(page).toHaveURL(/\/skills$/);
  await expoChip.click();
  await expect(page).toHaveURL(/\/skills\?skill=expo$/);

  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects\?skill=expo$/);
  await expect(powderino).toHaveAttribute("data-highlight", "true");
  await expect(reamp).not.toHaveAttribute("data-highlight", "true");

  // Back to /skills?skill=expo: the chip is still pressed.
  await page.goBack();
  await expect(page).toHaveURL(/\/skills\?skill=expo$/);
  await expect(expoChip).toHaveAttribute("aria-pressed", "true");
  await reactChip.click();
  await expect(page).toHaveURL(/\/skills\?skill=react$/);

  // Back to the first /projects entry, which had no ?skill: nothing is highlighted.
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('[data-highlight="true"]')).toHaveCount(0);

  // Forward again: the URL says react, so the highlight follows the URL.
  await page.goForward();
  await expect(page).toHaveURL(/\/skills\?skill=react$/);
  await expect(reactChip).toHaveAttribute("aria-pressed", "true");
});

test("page source has no +40 and no telephone", async ({ request }) => {
  for (const r of ROUTES) {
    const html = await (await request.get(r.path)).text();
    expect(html, r.path).not.toContain("+40");
    expect(html, r.path).not.toContain("telephone");
  }
});

// Mobile performance guard. Lighthouse's simulated LCP counts every
// request that finishes before the first paint, so the critical path must stay lean.
test("critical path: only latin fonts preloaded, yield script present, content not hidden", async ({
  request,
}) => {
  const attrs = (tag: string) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  for (const r of ROUTES) {
    const html = await (await request.get(r.path)).text();
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0]));
    const fontPreloads = links.filter((l) => l.rel === "preload" && l.as === "font");
    expect(fontPreloads.length, `${r.path} font preloads`).toBe(2);
    // Each preloaded file must be a latin subset: its @font-face covers U+0000-00FF
    // (the minifier writes that as the wildcard U+??).
    const css = (
      await Promise.all(
        links
          .filter((l) => l.rel === "stylesheet")
          .map(async (l) => (await request.get(l.href)).text()),
      )
    ).join("");
    for (const font of fontPreloads) {
      const file = font.href.split("/").pop()!;
      const face = css.match(new RegExp(`@font-face\\{[^}]*${file.replace(/[.]/g, "\\.")}[^}]*\\}`));
      expect(face?.[0], `${r.path} ${file} @font-face`).toBeTruthy();
      expect(face![0], `${r.path} ${file} is latin`).toMatch(/unicode-range:\s*U\+(?:0{0,4}-0{0,2}FF|\?\?)[,;}]/i);
    }
    // Presence only. Whether Next.js still yields a task after it is not testable
    // here; Lighthouse mobile TBT in CI is the real guard.
    expect(html, `${r.path} yield script present`).toContain('"id":"yield-before-hydration"');
    // The main content is plain server HTML: no Suspense template, no hidden attribute.
    const start = html.indexOf('<main id="main"');
    expect(start, `${r.path} main`).toBeGreaterThan(-1);
    const main = html.slice(start, html.indexOf("</main>", start));
    expect(main, r.path).not.toContain("<template");
    expect(main, r.path).not.toMatch(/<[a-z][a-z0-9]*(?:\s+[\w:-]+(?:="[^"]*")?)*\s+hidden(?:=""|\s|\/?>)/);
  }
});

test("metadata: title, description, canonical, OG, Twitter and JSON-LD", async ({ page }) => {
  await page.goto("/projects");
  await expect(page).toHaveTitle("Projects · Alex Vataselu");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/projects$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await page.goto("/");
  await expect(page).toHaveTitle("Alex Vataselu · Senior Frontend Engineer");
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld["@type"]).toBe("Person");
  expect(ld.name).toBe("Alex Vataselu");
  expect(ld.jobTitle).toBe("Senior Frontend Engineer");
  expect(ld.email).toBe("mailto:vataselu.alex@gmail.com");
  expect(ld.sameAs).toEqual([
    "https://linkedin.com/in/alex-vataselu",
    "https://github.com/AlexVataselu",
  ]);
  expect(ld.image).toMatch(/\/photo\.webp$/);
});

test("robots.txt and sitemap.xml are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  for (const p of ["/experience", "/skills", "/projects", "/education"]) expect(xml).toContain(p);
});

test("no console errors, page errors or HTTP >= 400 across all routes and nav clicks", async ({
  page,
}) => {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  for (const r of ROUTES) {
    await page.goto(r.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(r.h1);
  }
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Sections" });
  for (const r of ROUTES.slice(1)) {
    await nav.getByRole("link", { name: r.label }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(r.h1);
  }
  await nav.getByRole("link", { name: "Overview" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
  await page.waitForLoadState("networkidle");
  expect(problems).toEqual([]);
});
