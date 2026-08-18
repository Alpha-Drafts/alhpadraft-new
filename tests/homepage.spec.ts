import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DocAuditor|AlphaDrafts/i);
  });

  test("displays hero heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("displays Get Started CTA", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("button", { name: /get started/i }).first();
    await expect(cta).toBeVisible();
  });

  test("displays navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /features/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /how it works/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /pricing/i }).first()).toBeVisible();
  });
});
