import { test, expect } from "@playwright/test";

test.describe("Signup Page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveTitle(/Sign Up/i);
  });

  test("displays all form fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test("displays Create Account button", async ({ page }) => {
    await page.goto("/signup");
    const button = page.getByRole("button", { name: /create account/i });
    await expect(button).toBeVisible();
  });

  test("has Sign in link to navigate to signin", async ({ page }) => {
    await page.goto("/signup");
    const link = page.getByRole("button", { name: /sign in/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("has back to home link", async ({ page }) => {
    await page.goto("/signup");
    const link = page.getByRole("link", { name: /back to home/i });
    await expect(link).toBeVisible();
  });
});
