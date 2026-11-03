import { test, expect } from "@playwright/test";

test("language persists across public routes and protected pages remain protected", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error" && /hydration|hydrated|server rendered/i.test(message.text())) hydrationErrors.push(message.text());
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("svg-language", "ta"));
  for (const path of ["/", "/jobs", "/privacy", "/terms"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "ta");
    await expect(page.getByRole("button", {name: "Switch to English"})).toBeVisible();
  }
  await page.getByRole("button", {name: "Switch to English"}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  for (const path of ["/admin", "/admin/applications", "/admin/jobs", "/admin/logs", "/admin/supervisors"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
  expect(hydrationErrors).toEqual([]);
});
