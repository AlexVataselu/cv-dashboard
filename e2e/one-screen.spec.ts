import { expect, test, type Page } from "@playwright/test";
import { cv } from "../src/content/cv";
import { sites } from "../src/content/sites";

const ROUTES = ["/", "/experience", "/skills", "/projects", "/education"];

/** Waits until the client has hydrated (the skill-mark live region is a client island). */
const hydrated = (page: Page) => expect(page.locator("#skill-live")).toHaveCount(1);

for (const [width, height] of [
  [2560, 1440], // zoomed to lay out as 1920x1080 (the big-screen rule)
  [1440, 900],
  [1366, 768],
  [1280, 720],
]) {
  test(`one screen at ${width}x${height}: no document scroll, and no section outgrows its panel`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const path of ROUTES) {
      await page.goto(path);
      const m = await page.evaluate(() => {
        const main = document.getElementById("main")!;
        return {
          doc: document.documentElement.scrollHeight - innerHeight,
          docX: document.documentElement.scrollWidth - innerWidth,
          main: main.scrollHeight - main.clientHeight,
          status: document.querySelector('footer[aria-label="Site performance"]')!.getBoundingClientRect().bottom,
        };
      });
      expect(m.doc, `${path} document scroll`).toBeLessThanOrEqual(0);
      expect(m.docX, `${path} horizontal scroll`).toBeLessThanOrEqual(0);
      expect(m.main, `${path} panel overflow`).toBeLessThanOrEqual(1);
      expect(m.status, `${path} status bar on screen`).toBeLessThanOrEqual(height);
    }
  });
}

test("below 1024px wide the page scrolls as a page (no fixed height)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(844 * 2);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  test("the page scrolls and every block is open: all previews, every role, the results", async ({ page }) => {
    await page.goto("/projects");
    for (const p of cv.projects) await expect(page.locator(`#preview-${p.id}`)).toBeVisible();
    for (const s of sites) await expect(page.locator(`#preview-${s.id}`)).toBeVisible();
    await page.goto("/experience");
    for (const r of cv.roles) await expect(page.locator(`#role-${r.id}`)).toBeVisible();
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(900);
    for (const i of cv.impact.slice(0, 4)) await expect(page.getByText(i.label)).toBeVisible();
  });
});

test.describe("every CV fact is reachable by keyboard", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("Overview: every card is in view at once; the roles card lists every role", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await hydrated(page);
    for (const g of cv.glance) await expect(page.locator(".kpi-label", { hasText: g.label })).toBeInViewport();
    for (const sel of [".rc-ov-roles", ".rc-ov-res", ".rc-ov-stack"]) await expect(page.locator(sel)).toBeInViewport({ ratio: 0.99 });
    for (const r of cv.roles) await expect(page.locator(".rc-ov-roles")).toContainText(r.title);
    for (const i of cv.impact.slice(0, 4)) await expect(page.getByText(i.label)).toBeInViewport();
  });

  test("Experience: the roles are a radio group; arrow keys choose a role and its page shows alone", async ({ page }) => {
    await page.goto("/experience");
    await hydrated(page);
    const first = page.getByRole("radio").first();
    await first.focus();
    for (const [i, r] of cv.roles.entries()) {
      if (i > 0) await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("radio", { checked: true })).toHaveValue(r.id);
      const role = page.locator(`#role-${r.id}`);
      await expect(role).toBeVisible();
      await expect(page.locator(".rc-ex-role:visible")).toHaveCount(1);
      await expect(role.getByRole("heading", { level: 2 })).toHaveText(r.title);
      for (const b of r.bullets) await expect(role.getByText(b)).toBeAttached();
    }
  });

  test("Skills: every skill is listed with its years, the long lists scroll inside their cards", async ({ page }) => {
    await page.goto("/skills");
    await hydrated(page);
    await expect(page.locator(".rc-skill")).toHaveCount(cv.skills.length);
    const backend = page.getByRole("region", { name: "Backend, scrollable" });
    await backend.focus();
    await page.keyboard.press("End");
    await expect(backend.locator(".rc-skill").last()).toBeInViewport();
  });

  test("Projects: arrow keys walk the list and each preview shows its own item", async ({ page }) => {
    await page.goto("/projects");
    await hydrated(page);
    const ids = [...cv.projects.map((p) => p.id), ...cv.workProjects.map((p) => p.id), ...sites.map((s) => s.id)];
    await page.locator(`#pick-${ids[0]}`).focus();
    for (const [i, id] of ids.entries()) {
      if (i > 0) await page.keyboard.press("ArrowDown");
      await expect(page.locator(`#pick-${id}`)).toBeChecked();
      await expect(page.locator(`#preview-${id}`)).toBeVisible();
      await expect(page.locator(".preview:visible")).toHaveCount(1);
    }
    for (const p of cv.projects) {
      await page.locator(`#pick-${p.id}`).focus();
      await page.keyboard.press("Space");
      await expect(page.locator(`#preview-${p.id}`).getByText(p.description)).toBeVisible();
    }
  });


  test("Projects: the Stremio gallery switches by arrow keys; each shot is captioned and loads only when chosen", async ({ page }) => {
    await page.goto("/projects");
    await hydrated(page);
    const gallery = page.locator("#preview-stremio .gallery");
    const loaded = (i: number) =>
      gallery.locator(`.shot[data-shot="${i}"] img`).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(await loaded(1)).toBe(false);
    await gallery.getByRole("radio", { name: "Filters" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(gallery.getByRole("radio", { name: "Site dropdown" })).toBeChecked();
    await expect(gallery.locator('.shot[data-shot="1"]')).toBeVisible();
    await expect(gallery.locator('.shot[data-shot="0"]')).toBeHidden();
    await expect(gallery.locator('.shot[data-shot="1"] figcaption')).toContainText("torrent site dropdown");
    await expect.poll(() => loaded(1)).toBe(true);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(gallery.getByRole("img", { name: /stremio-web fork on GitHub/ })).toBeVisible();
    // Powderino keeps its facts until Alex's screenshots are in.
    await page.locator("#pick-powderino").check({ force: true });
    await expect(page.locator("#preview-powderino")).toContainText("3,000+");
  });
});

test("a role on the Overview opens its own page in Experience", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await hydrated(page);
  await page.locator('.rc-role[href="/experience#role-zega"]').click();
  await expect(page).toHaveURL(/\/experience#role-zega$/);
  await expect(page.getByRole("radio", { checked: true })).toHaveValue("zega");
  await expect(page.locator("#role-zega")).toBeVisible();
  for (const b of cv.roles.find((r) => r.id === "zega")!.bullets) await expect(page.locator("#role-zega")).toContainText(b);
});

test("prefers-reduced-motion: no motion layer, instant section switches", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await hydrated(page);
  await page.waitForTimeout(3000);
  await expect(page.locator("html")).not.toHaveAttribute("data-motion");
  // Figures are the real values, never counted.
  await expect(page.locator(".kpi-value").first()).toHaveText(cv.glance[0].value);
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Skills" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skills");
  // Nothing moves: no keyframe animation (view transition, stagger, bar growth) and no transform
  // transition is running. Colour fades on hover are not motion and may run.
  const moving = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .filter((a) => !(a instanceof CSSTransition) || a.transitionProperty.includes("transform"))
      .map((a) => (a instanceof CSSAnimation ? a.animationName : (a as CSSTransition).transitionProperty)),
  );
  expect(moving).toEqual([]);
});

test("with motion allowed: the motion layer loads after idle, outside the first-load HTML", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const lazy: string[] = [];
  page.on("response", async (r) => {
    if (r.url().endsWith(".js") && (await r.text()).includes("translate(0px, 0px)")) lazy.push(r.url());
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "", { timeout: 6000 });
  await expect.poll(() => lazy.length, { message: "the motion layer arrived as its own chunk" }).toBe(1);
  // The figures end on their real values.
  await expect(page.locator(".kpi-value").first()).toHaveText(cv.glance[0].value);
  const html = await (await request.get("/")).text();
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of scripts) {
    const js = await (await request.get(src)).text();
    // "translate(0px, 0px)" is a literal of the motion layer (src/motion/enhance.ts) only.
    expect(js, `${src} must not carry the motion layer`).not.toContain("translate(0px, 0px)");
  }
});

test.describe("the Overview's interactions", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("number keys switch sections, but not while typing in the palette", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-interact", "");
    await page.keyboard.press("3");
    await expect(page).toHaveURL(/\/skills\/?$/);
    await page.keyboard.press("1");
    await expect(page).toHaveURL(/\/$/);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("2");
    await expect(page).toHaveURL(/\/$/);
  });
});
