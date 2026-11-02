import { test, expect } from "@playwright/test";
test("home routes every role to Careers and has no viewport overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Make things.",
  );
  await expect(page.locator("[data-job-card]")).toHaveCount(10);
  const links = await page
    .locator("[data-job-card] a")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
  expect(links.every((link) => link?.startsWith("/careers?job="))).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/home-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("job prefill, filters and language preserve form input", async ({
  page,
}) => {
  await page.goto("/careers?job=cnc-machine-operator");
  await expect(page.locator('script[src*="cloudflare"]')).toHaveCount(0);
  await expect(page.locator("#job")).toHaveValue("cnc-machine-operator");
  await page.getByRole("button", { name: "Office", exact: true }).click();
  await expect(page.locator("[data-job-card]")).toHaveCount(2);
  await page.getByRole("button", { name: "Select role" }).first().click();
  await expect(page.locator("#job")).toHaveValue("accounts");
  await page.locator("#full_name").fill("Test Applicant");
  await page.locator("#phone").fill("9876543210");
  await page.getByRole("button", { name: "Switch to Tamil" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ta");
  await expect(page.locator("#full_name")).toHaveValue("Test Applicant");
  await expect(page.locator("#job")).toHaveValue("accounts");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "Send my application" }).click();
  await expect(page.locator("form [role='alert']")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "You’re registered!" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("application success uses the server reference (mocked API)", async ({ page }) => {
  await page.route("**/api/applications", route => route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ reference: "SVG-ABC123" }) }));
  await page.goto("/careers?job=cnc-machine-operator");
  await page.locator("#full_name").fill("Test Applicant");
  await page.locator("#phone").fill("9876543210");
  await page.locator("#preferred_location").fill("Test location");
  await page.locator("#qualification").selectOption("ITI");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Send my application" }).click();
  await expect(page.getByRole("heading", { name: "You’re registered!" })).toBeVisible();
  await expect(page.locator('[aria-label="SVG-ABC123"]')).toBeVisible();
});
test("reduced motion keeps content usable and admin remains protected", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  const response = await request.get("/api/admin/applications");
  expect(response.status()).toBe(401);
  const exportResponse = await request.get("/api/admin/export");
  expect(exportResponse.status()).toBe(401);
  const submit = await request.post("/api/applications", {
    data: {},
    headers: { Origin: "https://invalid.example" },
  });
  expect(submit.status()).toBe(403);
});
