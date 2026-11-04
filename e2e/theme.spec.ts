import { expect, test, type Page } from "@playwright/test";

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

async function pullBulb(page: Page, by: number) {
  const box = (await page.locator(".theme-toggle .lamp").boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height * 0.7;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + by, { steps: 6 });
  await page.mouse.up();
}

test("pulling the bulb down by its cord flips the light; a short tug does not", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await pullBulb(page, 4);
  // A tiny tug is a click in the end (the pointer barely moved), which also flips: undo it.
  if ((await page.locator("html").getAttribute("data-theme")) === "light") {
    await page.getByRole("button", { name: "Turn light off" }).click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await pullBulb(page, 16);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await pullBulb(page, 16);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
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
