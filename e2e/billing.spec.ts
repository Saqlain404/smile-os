import { test, expect } from "@playwright/test";

test.describe("Billing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@smileos.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  });

  test("should navigate to billing page", async ({ page }) => {
    await page.click('a[href="/billing"]');
    await expect(page).toHaveURL(/billing/);
  });

  test("should navigate to invoices page", async ({ page }) => {
    await page.goto("/billing/invoices");
    await expect(page).toHaveURL(/invoices/);
  });
});
