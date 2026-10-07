import { test, expect } from "@playwright/test";
import { initialState } from "../../src/lib/engine";
import { automationSolution } from "../../src/lib/simulations";
test("interactive workspaces fit mobile and desktop layouts", async ({
  page,
}) => {
  await page.goto("/");
  for (const view of [
    "Test Lab",
    "SQL Lab",
    "Postman Lab",
    "Release Center",
    "Career",
    "Missions",
  ]) {
    await page.getByRole("button", { name: view, exact: true }).click();
    await expect(page.locator("main h1")).toBeVisible();
    if (view === "Test Lab")
      await page.screenshot({
        path: "test-results/test-lab-desktop.png",
        fullPage: true,
      });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      view + " should not overflow",
    ).toBe(true);
    await page.setViewportSize({ width: 1440, height: 1080 });
  }
});
test("job matching recognizes experience and opens the missing-skill workspace", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Job Board", exact: true }).click();
  await page
    .getByLabel("Job description")
    .fill(
      "Required: 2+ years experience in SQL, Postman API testing and manual regression. Preferred: Playwright automation.",
    );
  await page.getByRole("button", { name: "Analyze skill match" }).click();
  await expect(page.getByText("Experience: 2+ years")).toBeVisible();
  await expect(
    page.locator(".match-row").filter({ hasText: "SQL" }),
  ).toBeVisible();
  await page
    .locator(".match-row")
    .filter({ hasText: "SQL" })
    .getByRole("button", { name: "Train" })
    .click();
  await expect(
    page.getByRole("heading", { name: "The data tells a story" }),
  ).toBeVisible();
});
test("completed sprints can be restarted and settings are reachable on mobile", async ({
  page,
}) => {
  const save = { ...initialState(), started: true, sprintStep: 10 };
  await page.addInitScript(
    (value) => localStorage.setItem("qaforge-career-v1", JSON.stringify(value)),
    save,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Sprint Room", exact: true }).click();
  await page.getByRole("button", { name: "Start another sprint" }).click();
  await expect(page.getByText("SPRINT DAY 1", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open career settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Your career, saved." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("first day: requirement investigation earns XP and persists", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good morning, Alex." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start your first mission" }).click();
  await page.getByPlaceholder("Your name").fill("Haroon");
  await page
    .getByRole("button", { name: "Clock in & open your first mission" })
    .click();
  await page.getByRole("button", { name: /AC-02/ }).click();
  await page.getByRole("button", { name: /AC-03/ }).click();
  await page.getByRole("button", { name: /AC-04/ }).click();
  await page.getByRole("button", { name: /AC-06/ }).click();
  await page
    .getByLabel("Clarification for Ayesha")
    .fill(
      "What maximum response time defines quickly, how many failed attempts cause a lock, what error appears, and when does the session expire?",
    );
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText(/100\/100 — Ayesha/)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Good morning, Haroon." }),
  ).toBeVisible();
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(save.completed["QA-001"]).toBe(100);
  expect(save.xp).toBe(150);
});
test("exploration produces evidence and an accepted Jira report", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Test Lab", exact: true }).click();
  await page.getByLabel("Coupon code").fill("SAVE20");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByLabel("Increase quantity").click();
  await expect(page.getByTestId("cart-total")).toHaveText("PKR 4,500");
  await page.getByRole("button", { name: "Report a defect" }).click();
  await page
    .getByLabel("Summary", { exact: true })
    .fill("Coupon discount does not update when cart quantity changes");
  await page
    .getByLabel("Preconditions", { exact: true })
    .fill("One Studio One headphone in cart, valid SAVE20 coupon.");
  await page
    .getByLabel("Steps to reproduce", { exact: true })
    .fill(
      "1. Apply SAVE20 at quantity 1. 2. Increase quantity to 2. 3. Observe cart total.",
    );
  await page
    .getByLabel("Expected result", { exact: true })
    .fill(
      "Discount should be 1000 and total should be 4000 for two headphones.",
    );
  await page
    .getByLabel("Actual result", { exact: true })
    .fill("Discount stays at 500 and total is 4500 after quantity changes.");
  await page
    .getByRole("button", {
      name: /SAVE20 applied at quantity 1; quantity changed to 2/,
    })
    .click();
  await page.getByRole("button", { name: "Submit to engineering" }).click();
  await expect(page.getByText(/^Accepted — Hamza/)).toBeVisible();
});
test("real SQLite worker validates duplicate charge investigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "SQL Lab", exact: true }).click();
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(
    "SELECT order_id, COUNT(*) FROM transactions WHERE status = 'success' GROUP BY order_id HAVING COUNT(*) > 1",
  );
  await page.getByRole("button", { name: "Run query" }).click();
  await expect(
    page.getByText(
      "Result verified against the investigation target. SQL evidence accepted.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "ORD-1042" })).toBeVisible();
});
test("API history and responses survive a save reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Postman Lab", exact: true }).click();
  await page
    .getByRole("button", { name: "PUT /api/profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".response-body")).toContainText("Alex Updated");
  await page
    .getByRole("button", { name: "GET /api/profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".response-body")).toContainText("Alex Morgan");
  await page.reload();
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(save.apiCount).toBe(2);
  expect(
    save.evidence.some((e: { kind: string }) => e.kind === "profile"),
  ).toBe(true);
});
test("shipping known critical risk creates a next-day incident", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Release Center", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Decision", exact: true })
    .selectOption("Release");
  await page
    .getByLabel("Evidence, impact, and next steps")
    .fill(
      "I accept the customer payment risk and will monitor production, although the idempotency evidence is failing.",
    );
  await page.getByRole("button", { name: "Submit recommendation" }).click();
  await expect(
    page.getByRole("heading", { name: "When production needs you" }),
  ).toBeVisible();
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(save.incidentActive).toBe(true);
  expect(save.day).toBe(2);
});
test("all navigation destinations render without console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const label of [
    "Missions",
    "Company",
    "Jira",
    "Test Lab",
    "Requirements",
    "Test Cases",
    "Postman Lab",
    "SQL Lab",
    "Automation Lab",
    "DevTools",
    "CI/CD",
    "Performance Lab",
    "Slack",
    "Email",
    "Sprint Room",
    "Release Center",
    "Career",
    "Skills",
    "Job Board",
    "Interview Arena",
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator("main h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("desktop and mobile home stay within the viewport", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good morning, Alex." }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("incident can be contained after the failed release and SQL investigation", async ({
  page,
}) => {
  const save = {
    ...initialState(),
    started: true,
    active: "QA-012",
    incidentActive: true,
    incidents: 1,
    releaseHistory: ["QA-012"],
    incidentInvestigated: true,
  };
  await page.addInitScript(
    (value) => localStorage.setItem("qaforge-career-v1", JSON.stringify(value)),
    save,
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Release Center", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Decision", exact: true })
    .selectOption("Rollback");
  await page
    .getByLabel("Evidence, impact, and next steps")
    .fill(
      "Rollback the payment deployment to stop customer impact. SQL evidence shows duplicate successful transactions for one order; retest idempotency before releasing.",
    );
  await page.getByRole("button", { name: "Submit recommendation" }).click();
  await expect(
    page.getByRole("heading", { name: "Would you ship it?" }),
  ).toBeVisible();
  const result = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(result.incidentActive).toBe(false);
  expect(result.achievements).toContain("Production Saver");
});
test("automation executes only after earned unlock and passes the smoke scenario", async ({
  page,
}) => {
  const save = {
    ...initialState(),
    started: true,
    active: "QA-010",
    valid: 1,
    cases: [499, 500, 501].map((input) => ({
      id: String(input),
      input,
      expected: "Accept" as const,
      steps: "Enter the amount and submit.",
      precondition: "Authenticated customer with balance.",
    })),
  };
  await page.addInitScript(
    (value) => localStorage.setItem("qaforge-career-v1", JSON.stringify(value)),
    save,
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Automation Lab", exact: true })
    .click();
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(automationSolution);
  await page.getByRole("button", { name: "Run test", exact: true }).click();
  await expect(page.locator(".terminal-output")).toContainText(
    "PASS Dashboard is visible",
  );
  const result = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(result.completed["QA-010"]).toBeGreaterThanOrEqual(90);
});
test("pipeline repair requires a feature branch, commit, and push", async ({
  page,
}) => {
  const save = { ...initialState(), started: true, active: "QA-011" };
  await page.addInitScript(
    (value) => localStorage.setItem("qaforge-career-v1", JSON.stringify(value)),
    save,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "CI/CD", exact: true }).click();
  await page
    .getByLabel("Replace the hardcoded wait with an observable assertion")
    .fill(
      "await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();",
    );
  await page.getByRole("button", { name: "Save repair" }).click();
  for (const command of [
    "git switch -c fix/login",
    "git add .",
    'git commit -m "Wait for dashboard"',
    "git push",
  ]) {
    await page.getByLabel("Git command").fill(command);
    await page.getByRole("button", { name: "Run", exact: true }).click();
  }
  await page.getByRole("button", { name: "Rerun pipeline" }).click();
  await expect(
    page.getByText(
      "All quality gates passed. UI test waited for the dashboard to become visible.",
    ),
  ).toBeVisible();
});
test("boundary test suite is evaluated against all six limits", async ({
  page,
}) => {
  const save = { ...initialState(), started: true, active: "QA-002" };
  await page.addInitScript(
    (value) => localStorage.setItem("qaforge-career-v1", JSON.stringify(value)),
    save,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Test Cases", exact: true }).click();
  for (const value of [499, 500, 501, 249999, 250000, 250001]) {
    await page.getByLabel("Transfer amount (PKR)").fill(String(value));
    await page
      .getByRole("combobox", { name: "Expected outcome" })
      .selectOption(value < 500 || value > 250000 ? "Reject" : "Accept");
    await page.getByRole("button", { name: "Add test case" }).click();
  }
  await page.getByRole("button", { name: "Submit test suite" }).click();
  await expect(
    page.getByText(/100\/100 — 6\/6 boundary conditions covered correctly/),
  ).toBeVisible();
});
