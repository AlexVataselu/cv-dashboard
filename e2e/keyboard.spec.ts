import { expect, test, type Page } from "@playwright/test";

/** Presses Tab until `match` holds for the focused element; returns the labels passed on the way. */
async function tabUntil(page: Page, match: (el: Element) => boolean, max = 45) {
  const seen: string[] = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const hit = await page.evaluate(
      (src) => new Function("el", `return (${src})(el)`)(document.activeElement) as boolean,
      match.toString(),
    );
    seen.push(await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""));
    if (hit) return seen;
  }
  throw new Error(`focus never matched; saw: ${seen.join(" | ")}`);
}

test("keyboard only: skip link, nav, the role picker and the command palette", async ({ page }) => {
  await page.goto("/");

  // The first Tab reaches the skip link; Enter moves focus into <main>.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();

  // From the top, Tab walks the section nav in order; Enter follows the focused link.
  await page.goto("/");
  const seen = await tabUntil(
    page,
    (el) => el.closest('nav[aria-label="Sections"]') !== null && el.textContent?.trim() === "Projects",
  );
  const navOrder = seen.filter((t) => ["Overview", "Experience", "Skills", "Projects"].includes(t));
  expect(navOrder).toEqual(["Overview", "Experience", "Skills", "Projects"]);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");

  // The roles are one radio group: Tab reaches the chosen role, arrows choose another.
  await page.goto("/experience");
  await tabUntil(page, (el) => el instanceof HTMLInputElement && el.type === "radio", 60);
  await expect(page.getByRole("radio", { checked: true })).toHaveValue("freelance-2025");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { checked: true })).toHaveValue("pentalog");
  await expect(page.locator("#role-pentalog")).toBeVisible();

  // Ctrl+K loads and opens the palette; Esc closes it and focus returns to the trigger.
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: /Open command palette/ })).toBeFocused();
});
