import { expect, test, type Page } from "@playwright/test";
import { cv } from "../src/content/cv";
import { sites } from "../src/content/sites";

const ROUTES = ["/", "/experience", "/skills", "/projects", "/education"];

/** Waits until the client has hydrated (the skill-mark live region is a client island). */
const hydrated = (page: Page) => expect(page.locator("#skill-live")).toHaveCount(1);

for (const [width, height] of [
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
  test("the page scrolls and every block is open: all previews, all results, About", async ({ page }) => {
    await page.goto("/projects");
    for (const p of cv.projects) await expect(page.locator(`#preview-${p.id}`)).toBeVisible();
    for (const s of sites) await expect(page.locator(`#preview-${s.id}`)).toBeVisible();
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(900);
    await expect(page.getByText(cv.about)).toBeVisible();
    for (const i of cv.impact) await expect(page.getByText(i.label)).toBeVisible();
  });
});

test.describe("every CV fact is reachable by keyboard", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("Overview: each headline figure opens its breakdown; results, skills and About behind the switch", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    const figures = page.locator(".kpi-btn");
    await expect(figures).toHaveCount(cv.glance.length);
    for (let i = 0; i < cv.glance.length; i++) {
      await figures.nth(i).focus();
      await page.keyboard.press("Enter");
      const pop = page.locator(`#kpi-${i}`);
      await expect(pop).toBeVisible();
      await expect(pop).toBeInViewport();
      await page.keyboard.press("Escape");
      await expect(pop).toBeHidden();
    }
    // The 14-year breakdown lists every dated role and the undated earlier one.
    await figures.nth(0).focus();
    await page.keyboard.press("Enter");
    for (const r of cv.roles) await expect(page.locator("#kpi-0")).toContainText(r.title);
    await expect(page.locator("#kpi-0")).toContainText(cv.earlier);
    await page.keyboard.press("Escape");

    // A short screen shares one slot: arrow keys move the switch from Results to Skills to About.
    const results = page.getByRole("radio", { name: "Results" });
    await results.focus();
    for (const i of cv.impact) await expect(page.getByText(i.label)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Skills" })).toBeChecked();
    await expect(page.getByRole("region", { name: "Skills, by first dated use" })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    const about = page.getByRole("region", { name: "About, scrollable" });
    await expect(about).toBeVisible();
    // The About card scrolls inside itself and takes focus, so the keyboard can scroll it.
    await about.focus();
    await page.keyboard.press("End");
    await expect(page.getByText(cv.education[1].degree, { exact: false })).toBeInViewport();
  });

  test("Experience: each timeline row opens its role in the side card, with its bullets in view", async ({ page }) => {
    await page.goto("/experience");
    await hydrated(page);
    for (const r of cv.roles) {
      const row = page.locator(`a[data-open-role="${r.id}"]`);
      await row.focus();
      await page.keyboard.press("Enter");
      await expect(row).toHaveAttribute("aria-expanded", "true");
      const details = page.locator(`#role-${r.id}`);
      await expect(details).toHaveJSProperty("open", true);
      await expect(details.locator("li").first()).toBeInViewport();
      for (const b of r.bullets) await expect(details.getByText(b)).toBeAttached();
      // one open at a time
      await expect(page.locator("details[open]")).toHaveCount(1);
    }
  });

  test("Projects: arrow keys walk the list and each preview shows its own item", async ({ page }) => {
    await page.goto("/projects");
    await hydrated(page);
    const ids = [...cv.projects.map((p) => p.id), ...sites.map((s) => s.id)];
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

  test("Skills: the group filter is a radio group; each group shows alone", async ({ page }) => {
    await page.goto("/skills");
    await hydrated(page);
    const card = page.getByRole("region", { name: "Skills by group" });
    await card.getByRole("radio", { name: /^All/ }).focus();
    for (const g of ["Frontend", "State & data", "Backend", "Testing & quality", "Tooling"]) {
      await page.keyboard.press("ArrowRight");
      await expect(card.getByRole("heading", { level: 2, name: g })).toBeVisible();
      await expect(card.getByRole("heading", { level: 2 })).toHaveCount(1);
      for (const s of cv.skills.filter((s) => s.group === g)) {
        await expect(card.getByRole("button", { name: new RegExp(`^${s.name.replace(/[.()+]/g, "\\$&")}( ·|$)`) })).toBeVisible();
      }
    }
  });
});

test("linked views: a hovered or focused role lights its results and skills; a chosen skill marks the timeline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await hydrated(page);
  const bg = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).backgroundColor);
  const plain = await bg('.result[data-roles="pentalog"]');
  await page.locator('.tl-row[data-link="pentalog"]').hover();
  await expect.poll(() => bg('.result[data-roles="pentalog"]')).not.toBe(plain);
  // React was used at Pentalog: its chip lights too; Jest (no Pentalog) does not.
  await expect.poll(() => page.locator('[data-skill="react"]').evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
  expect(await page.locator('[data-skill="jest"]').evaluate((el) => getComputedStyle(el).boxShadow)).toBe("none");
  // Keyboard focus lights the same way.
  await page.mouse.move(0, 0);
  await page.locator('.tl-row[data-link="tryangle"]').focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect.poll(() => bg('.result[data-roles="tryangle"]')).not.toBe(plain);

  // Choosing a skill marks the roles and projects that used it, keeps ?skill=, and says so.
  await page.getByRole("button", { name: /^Expo\b/ }).click();
  await expect(page).toHaveURL(/\?skill=expo$/);
  await expect(page.locator('.tl-row[data-link="tryangle"]')).toHaveAttribute("data-highlight", "true");
  await expect(page.locator('.tl-row[data-link="pentalog"]')).not.toHaveAttribute("data-highlight", "true");
  await expect(page.locator('.tl-proj[data-name="Powderino"]')).toHaveAttribute("data-highlight", "true");
  await expect(page.locator("#skill-live")).toHaveText(/Expo: marked on 1 role and 1 project/);
});

test("prefers-reduced-motion: no motion layer, no bar growth, instant section switches", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await hydrated(page);
  expect(await page.locator(".tl-bar").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
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
  expect(await page.locator(".tl-bar").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("grow-x");
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
