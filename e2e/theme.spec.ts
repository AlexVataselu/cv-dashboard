import { expect, test } from "@playwright/test";

const ground = () => getComputedStyle(document.body).backgroundColor;
const DARK = "rgb(14, 15, 17)";
const LIGHT = "rgb(237, 241, 247)";

test("the dark theme is the default, whatever the system setting", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(ground)).toBe(DARK);
});

test("the backlight switch says what it does, flips the theme and is remembered across pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Backlight on" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(ground)).toBe(LIGHT);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  await expect(page.getByRole("button", { name: "Backlight off" })).toBeVisible();

  // The saved choice holds from the first paint of the next page and after a reload.
  await page.goto("/experience");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // Keyboard: Enter on the focused switch turns the backlight off again.
  await page.getByRole("button", { name: "Backlight off" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
});

test("switching the backlight on lights the panel from its middle, then leaves it glowing", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const sheet = page.locator(".sheet");
  const glowOf = () => sheet.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(await glowOf()).not.toContain("150, 185, 255");

  await page.getByRole("button", { name: "Backlight on" }).click();
  // During the sweep the page is marked, and the light starts from the middle of the panel.
  const mid = await page.evaluate(() => {
    const r = document.querySelector(".sheet")!.getBoundingClientRect();
    return Math.round(r.left + r.width / 2);
  });
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--bl-x"))).toBe(`${mid}px`);
  await expect(page.locator("html")).not.toHaveAttribute("data-backlight", /.+/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await glowOf()).toContain("150, 185, 255");

  await page.getByRole("button", { name: "Backlight off" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveAttribute("data-backlight", /.+/);
});

test("no backlight animation outlives its transition, so on after off never starts from a blank screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const leftovers = () =>
    page.evaluate(() => document.getAnimations().filter((a) => a.effect && "pseudoElement" in a.effect && a.effect.pseudoElement).length);
  const done = () => expect(page.locator("html")).not.toHaveAttribute("data-backlight", /.+/, { timeout: 5000 });

  for (const name of ["Backlight on", "Backlight off", "Backlight on"]) {
    await page.getByRole("button", { name }).click();
    await done();
    // A finished transition leaves nothing behind on its pseudo-elements: a leftover from "off"
    // (opacity 0) would hide the dark page at the start of the next "on" and flash white.
    await expect.poll(leftovers).toBe(0);
  }
});

test("the theme is applied in <head> before the first paint (no flash)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  const script = head.indexOf("localStorage.getItem(\"theme\")");
  // A parser-blocking inline script in <head> runs before the body is parsed, so before any paint.
  expect(script, "theme script in <head>").toBeGreaterThan(-1);
  expect(head.slice(0, script)).not.toMatch(/<script[^>]*\b(?:async|defer)\b[^>]*>[^<]*$/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, colorScheme: "light" });

  test("the page is still dark", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(ground)).toBe(DARK);
  });

  test("the backlight switch, which needs JS, is hidden and keeps its space", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".theme-toggle");
    await expect(toggle).toBeHidden();
    const box = await toggle.evaluate((el) => el.getBoundingClientRect().width);
    expect(box).toBeGreaterThan(0);
  });
});
