import { test, expect } from "@playwright/test";

test.describe("Patient Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@smileos.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  });

  test("should navigate to patients page", async ({ page }) => {
    await page.click('a[href="/patients"]');
    await expect(page).toHaveURL(/patients/);
    await expect(page.getByText(/patients/i)).toBeVisible();
  });

  test("should display patient list", async ({ page }) => {
    await page.goto("/patients");
    await expect(page.locator("table, [role='table']")).toBeVisible({ timeout: 10000 });
  });

  test("should open add patient dialog", async ({ page }) => {
    await page.goto("/patients");
    await page.click('button:has-text("Add Patient"), button:has-text("New Patient")');
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
  });
});
