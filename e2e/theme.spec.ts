import { expect, test } from "@playwright/test";

const ground = () => getComputedStyle(document.body).backgroundColor;

test("the theme follows the system setting before any choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(ground)).toBe("rgb(11, 11, 11)");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/skills");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(ground)).toBe("rgb(225, 172, 16)");
});

test("the toggle switches the theme, says so, and remembers it across pages and reloads", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Dark theme" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

  // The saved choice beats the system setting, from the first paint of the next page.
  await page.goto("/experience");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Dark theme" })).toHaveAttribute("aria-pressed", "true");

  // Keyboard: Enter on the focused toggle switches back.
  await page.getByRole("button", { name: "Dark theme" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
});

test("the theme is applied in <head> before the first paint (no flash)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  const script = head.indexOf("localStorage.getItem(\"theme\")");
  // A parser-blocking inline script in <head> runs before the body is parsed, so before any paint.
  expect(script, "theme script in <head>").toBeGreaterThan(-1);
  expect(head.slice(0, script)).not.toMatch(/<script[^>]*(?:async|defer)[^>]*>[^<]*$/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, colorScheme: "dark" });

  test("the dark theme still comes from the system setting", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(ground)).toBe("rgb(11, 11, 11)");
  });
});
