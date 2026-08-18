import { test, expect } from "@playwright/test";

test.describe("Signin Page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/signin");
    await expect(page).toHaveTitle(/Sign In/i);
  });

  test("displays all form fields", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });

  test("displays Sign In button", async ({ page }) => {
    await page.goto("/signin");
    const button = page.getByRole("button", { name: /^sign in$/i });
    await expect(button).toBeVisible();
  });

  test("has Sign up link to navigate to signup", async ({ page }) => {
    await page.goto("/signin");
    const link = page.getByRole("button", { name: /sign up/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("has Forgot password link", async ({ page }) => {
    await page.goto("/signin");
    const link = page.getByRole("button", { name: /forgot password/i });
    await expect(link).toBeVisible();
  });

  test("has back to home link", async ({ page }) => {
    await page.goto("/signin");
    const link = page.getByRole("link", { name: /back to home/i });
    await expect(link).toBeVisible();
  });
});
