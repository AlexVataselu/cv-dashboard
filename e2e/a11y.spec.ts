import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "phone", width: 412, height: 823 },
];

for (const colorScheme of ["light", "dark"] as const) {
  for (const vp of VIEWPORTS) {
    for (const path of ["/", "/experience", "/skills", "/projects", "/education"]) {
      test(`axe: no WCAG 2.1 AA violations on ${path} (${colorScheme} theme, ${vp.name})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        // Dark is the default; the light theme is the visitor's saved choice.
        await page.addInitScript((t) => localStorage.setItem("theme", t), colorScheme);
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        // Contrast is measured on the settled page: wait for the entrance animations (finite ones) to end.
        await page.waitForFunction(() =>
          document.getAnimations().every((a) => a.effect?.getTiming().iterations === Infinity || a.playState !== "running"),
        );
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
}
