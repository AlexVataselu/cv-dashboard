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

  test("Overview: every card is in view at once, no tabs; a year in focus reads what it held", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await hydrated(page);
    // Nothing waits behind a switch or a tab: the figures, the timeline, results, both charts,
    // skills, About and the industries all show on one screen.
    for (const g of cv.glance) await expect(page.locator(".kpi-label", { hasText: g.label })).toBeInViewport();
    for (const sel of [".ov-tl", ".ov-res", ".ov-stack", ".ov-kinds", ".ov-skills", ".ov-about", ".ov-ind"])
      await expect(page.locator(sel)).toBeInViewport({ ratio: 0.99 });
    for (const r of cv.roles) await expect(page.locator(".ov-tl")).toContainText(r.company.split(/,| · /)[0].trim());
    for (const i of cv.impact) await expect(page.getByText(i.label)).toBeInViewport();
    // The skills-by-year chart: a year in focus reads what it held and what was new.
    await page.locator('.st-col[data-y="2021"]').focus();
    await expect(page.locator('.st-read[data-y="2021"]')).toBeVisible();
    await expect(page.locator('.st-read[data-y="2021"]')).toContainText("React");
    // The industries card links each live site.
    for (const s of sites) await expect(page.locator(`.ov-ind a[href="${s.url}"]`)).toBeAttached();
    // The About card scrolls inside itself and takes focus, so the keyboard can scroll it.
    const about = page.getByRole("region", { name: "About, scrollable" });
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

  test("Skills: the group filter is a radio group; each group shows alone, every skill in it reachable", async ({ page }) => {
    await page.goto("/skills");
    await hydrated(page);
    const card = page.getByRole("region", { name: "Where each skill was used" });
    await card.getByRole("radio", { name: /^All/ }).focus();
    for (const g of ["Frontend", "State & data", "Backend", "Testing & quality", "Tooling"]) {
      await page.keyboard.press("ArrowRight");
      await expect(card.getByRole("heading", { level: 3, name: g })).toBeVisible();
      await expect(card.getByRole("heading", { level: 3 })).toHaveCount(1);
      for (const s of cv.skills.filter((s) => s.group === g)) {
        const row = card.getByRole("button", { name: new RegExp(`^${s.name.replace(/[.()+]/g, "\\$&")}( ·|$)`) });
        await row.scrollIntoViewIfNeeded();
        await expect(row).toBeVisible();
      }
    }
  });

  test("Skills: the rows are one tab stop; arrows move, focus opens the skill's card, Enter marks it", async ({ page }) => {
    await page.goto("/skills");
    await hydrated(page);
    const rows = page.locator(".sm-row");
    await expect(page.locator(".sm-row[tabindex='0']")).toHaveCount(1);
    // rows run longest-used first: JavaScript, HTML, CSS, TypeScript, React ...
    await rows.first().focus();
    await expect(page.locator('[data-detail="javascript"]')).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(rows.nth(1)).toBeFocused();
    await expect(page.locator('[data-detail="html"]')).toBeVisible();
    await expect(page.locator('[data-detail="javascript"]')).toBeHidden();
    await page.keyboard.press("End");
    await expect(rows.last()).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(rows.nth(3)).toBeFocused();
    // TypeScript is dated from L.H.EL (Superland): that role lights in the header; Kemblimed does not.
    await expect(page.locator('[data-detail="typescript"]')).toContainText("since 2017");
    const lit = (name: string) =>
      page.locator(".cs-lane", { hasText: name }).first().evaluate((el) => Number(getComputedStyle(el).opacity));
    await expect.poll(() => lit("L.H.EL")).toBe(1);
    await expect.poll(() => lit("Kemblimed")).toBeLessThan(0.5);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/skills\?skill=typescript$/);
    await expect(rows.nth(3)).toHaveAttribute("aria-pressed", "true");
    // One tab stop: Tab leaves the rows for the card of the skill in focus (its first link), even
    // when that skill is not the selected one; the card stays while focus travels into it.
    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[data-detail="react"]')).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-detail="react"] a').first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\?skill=react#/);
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

test("linked views: a hovered or focused role lights its results and skills; a chosen skill marks the timeline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await hydrated(page);
  const bg = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).backgroundColor);
  const plain = await bg('.result[data-roles="pentalog"]');
  await page.locator('.tl-row[data-link="pentalog"]').hover();
  await expect.poll(() => bg('.result[data-roles="pentalog"]')).not.toBe(plain);
  // React was used at Pentalog: its chip lights too; Jest (no Pentalog) does not.
  await expect.poll(() => page.locator('.cloud [data-skill="react"]').evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
  expect(await page.locator('.cloud [data-skill="jest"]').evaluate((el) => getComputedStyle(el).boxShadow)).toBe("none");
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

test("L.H.EL (Superland): hovering its row lights Magento, PrestaShop, JavaScript, TypeScript, HTML and CSS; Experience lists them", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await hydrated(page);
  const ring = (id: string) => page.locator(`.cloud [data-skill="${id}"]`).evaluate((el) => getComputedStyle(el).boxShadow);
  expect(await ring("magento")).toBe("none");
  await page.locator('.tl-row[data-link="lhel"]').hover();
  for (const id of ["magento", "prestashop", "javascript", "typescript", "html", "css"]) {
    await expect.poll(() => ring(id), id).not.toBe("none");
  }
  expect(await ring("react")).toBe("none");

  await page.goto("/experience");
  await hydrated(page);
  await page.locator('a[data-open-role="lhel"]').click();
  const panel = page.locator('.cl-ch[data-ch="lhel"] .cl-skills');
  await expect(panel).toBeVisible();
  await expect(panel.locator(".skill-name")).toHaveText(["Magento", "PrestaShop", "JavaScript", "TypeScript", "HTML", "CSS"]);
  for (const b of cv.roles.find((r) => r.id === "lhel")!.bullets) await expect(page.locator("#role-lhel")).toContainText(b);

  // A link straight to the role opens it, marks its row and shows its skills.
  await page.goto("/");
  await page.goto("/experience#role-zega");
  await hydrated(page);
  await expect(page.locator("#role-zega")).toHaveJSProperty("open", true);
  await expect(page.locator('a[data-open-role="zega"]')).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator('.cl-ch[data-ch="zega"] .tl-row')).toHaveAttribute("aria-expanded", "true");
});

test("prefers-reduced-motion: no motion layer, no bar growth, instant section switches", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await hydrated(page);
  expect(await page.locator(".cl-span").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
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
  expect(await page.locator(".cl-span").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("grow-y");
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
