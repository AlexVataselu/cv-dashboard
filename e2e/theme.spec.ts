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

test("the light switch says what it does, flips the theme and is remembered across pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Turn light on" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(ground)).toBe(LIGHT);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  await expect(page.getByRole("button", { name: "Turn light off" })).toBeVisible();

  // The saved choice holds from the first paint of the next page and after a reload.
  await page.goto("/experience");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // Keyboard: Enter on the focused switch turns the light off again.
  await page.getByRole("button", { name: "Turn light off" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
});

test("the desk lamp tilts down and lights the button only when the light is on", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const beam = page.locator(".theme-toggle .lamp-beam");
  await expect(beam).toHaveCSS("opacity", "0");
  await page.getByRole("button", { name: "Turn light on" }).click();
  await expect(beam).toHaveCSS("opacity", "1");
  // rotate(0): the head points down at the label (it is lifted, rotated, while the light is off).
  await page.mouse.move(0, 0);
  await expect(page.locator(".theme-toggle .lamp-head")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
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

  test("the light switch, which needs JS, is hidden and keeps its space", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".theme-toggle");
    await expect(toggle).toBeHidden();
    const box = await toggle.evaluate((el) => el.getBoundingClientRect().width);
    expect(box).toBeGreaterThan(0);
  });
});
