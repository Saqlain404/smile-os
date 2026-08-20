import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/SmileOS/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@smileos.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
  });
});
