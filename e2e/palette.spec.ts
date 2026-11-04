import { expect, test } from "@playwright/test";

test("the search palette sits above the sheet's cards, not under them", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/experience");
  const trigger = page.getByRole("button", { name: /Open command palette/ });
  // A magnifying glass, not a keyboard shortcut, says what the button does.
  await expect(trigger.locator("svg")).toBeVisible();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // The point near each corner of the dialog belongs to the dialog: nothing paints over it.
  const covered = await dialog.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const points = [
      [r.left + 12, r.top + 12],
      [r.right - 12, r.top + 12],
      [r.left + 12, r.bottom - 12],
      [r.right - 12, r.bottom - 12],
    ];
    return points.filter(([x, y]) => !el.contains(document.elementFromPoint(x, y))).length;
  });
  expect(covered).toBe(0);
});
