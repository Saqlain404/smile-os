import { test, expect } from "@playwright/test";

test.describe("Appointments", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@smileos.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  });

  test("should navigate to appointments page", async ({ page }) => {
    await page.click('a[href="/appointments"]');
    await expect(page).toHaveURL(/appointments/);
  });

  test("should navigate to calendar page", async ({ page }) => {
    await page.click('a[href="/calendar"]');
    await expect(page).toHaveURL(/calendar/);
    await expect(page.locator(".fc")).toBeVisible({ timeout: 10000 });
  });
});
