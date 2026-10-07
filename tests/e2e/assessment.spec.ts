import { test, expect, type Page } from "@playwright/test";
import { initialState } from "../../src/lib/engine";
import { startAssessment } from "../../src/lib/assessments";
const report =
  "Block release because the evidence shows customer impact from inconsistent cart pricing and profile persistence. Ask engineering for fixes, retest the original cases and regression paths, and communicate the remaining risk.";
async function nav(page: Page, view: string) {
  await page.getByRole("button", { name: view, exact: true }).click();
}
async function edit(page: Page, value: string) {
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(value);
}
test("complete the independent hiring assessment using fresh work across all seven labs", async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.goto("/");
  await nav(page, "Assessments");
  await page.getByRole("button", { name: "Start hiring assessment" }).click();
  await nav(page, "Requirements");
  for (const id of ["02", "03", "04", "06"])
    await page.getByRole("button", { name: new RegExp(`AC-${id}`) }).click();
  await page
    .getByLabel("Clarification for Ayesha")
    .fill(
      "What maximum response time, failed attempt count, lockout duration, exact error response, and session expiry time must we validate?",
    );
  await page.getByRole("button", { name: "Submit review" }).click();
  await nav(page, "Test Cases");
  for (const value of [499, 500, 501, 249999, 250000, 250001]) {
    await page.getByLabel("Transfer amount (PKR)").fill(String(value));
    await page
      .getByRole("combobox", { name: "Expected outcome" })
      .selectOption(value < 500 || value > 250000 ? "Reject" : "Accept");
    await page.getByRole("button", { name: "Add test case" }).click();
  }
  await page.getByRole("button", { name: "Submit test suite" }).click();
  await nav(page, "Test Lab");
  await page.getByLabel("Coupon code").fill("SAVE20");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByLabel("Increase quantity").click();
  await page.getByRole("button", { name: "Continue to checkout" }).click();
  await page.getByLabel("Device", { exact: true }).selectOption("Pixel 7");
  await nav(page, "Jira");
  await page
    .getByLabel("Summary", { exact: true })
    .fill("Cart coupon discount stays stale when quantity increases");
  await page
    .getByLabel("Preconditions")
    .fill("One Studio One headphone in cart, valid SAVE20 coupon.");
  await page
    .getByLabel("Steps to reproduce")
    .fill(
      "1. Apply SAVE20 at quantity 1. 2. Increase quantity to 2. 3. Observe the total.",
    );
  await page
    .getByLabel("Expected result")
    .fill(
      "Discount should be 1000 and total should be 4000 for two headphones.",
    );
  await page
    .getByLabel("Actual result")
    .fill(
      "Discount remains 500 and total becomes 4500 after quantity changes.",
    );
  await page
    .getByRole("button", {
      name: /SAVE20 applied at quantity 1; quantity changed to 2/,
    })
    .click();
  await page.getByRole("button", { name: "Submit to engineering" }).click();
  await expect(page.getByText(/^Accepted — Hamza/)).toBeVisible();
  await nav(page, "Postman Lab");
  await page
    .getByRole("button", { name: "PUT /api/profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page
    .getByRole("button", { name: "GET /api/profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page
    .getByLabel("Investigation conclusion")
    .fill(
      "Expected PUT to persist the updated profile, but the GET response returns the old name with status 200. The contract is violated and customers lose saved changes.",
    );
  await page.getByRole("button", { name: "Submit API investigation" }).click();
  await nav(page, "SQL Lab");
  await edit(
    page,
    "SELECT order_id, COUNT(*) FROM transactions WHERE status='success' GROUP BY order_id HAVING COUNT(*)>1",
  );
  await page.getByRole("button", { name: "Run query" }).click();
  await expect(
    page.getByText(
      "Result verified against the investigation target. SQL evidence accepted.",
    ),
  ).toBeVisible();
  await nav(page, "Release Center");
  await page
    .getByRole("combobox", { name: "Decision", exact: true })
    .selectOption("Block release");
  await page.getByLabel("Evidence, impact, and next steps").fill(report);
  await page.getByRole("button", { name: "Submit recommendation" }).click();
  await nav(page, "Assessments");
  await page.getByLabel("Quality summary and recommendation").fill(report);
  await page
    .getByRole("button", { name: "Submit assessment", exact: true })
    .click();
  await expect(page.getByText(/Fahad: Assessment passed/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start career capstone" }),
  ).toBeEnabled();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(saved.completed["QA-016"]).toBeGreaterThanOrEqual(75);
  expect(saved.assessment.elapsed).toBeLessThanOrEqual(60);
  await page.screenshot({
    path: "test-results/assessment-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/assessment-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("complete the RelayDesk capstone with shared UI API SQL state and a verified fix", async ({
  page,
}) => {
  test.setTimeout(100000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const state = startAssessment(
    { ...initialState(), started: true, completed: { "QA-016": 95 } },
    "capstone",
  );
  await page.addInitScript(
    (s) => localStorage.setItem("qaforge-career-v1", JSON.stringify(s)),
    state,
  );
  await page.goto("/");
  await nav(page, "Test Lab");
  await page.getByLabel("Expense amount (PKR)").fill("50001");
  await page
    .getByRole("button", { name: "Submit expense", exact: true })
    .click();
  await expect(page.getByRole("cell", { name: "PKR 50,001" })).toBeVisible();
  await page.getByLabel("Refresh expense totals").click();
  await page
    .getByRole("row")
    .filter({ hasText: "EXP-701" })
    .getByRole("button", { name: "Approve" })
    .click();
  await nav(page, "Jira");
  await page
    .getByLabel("Summary", { exact: true })
    .fill("Employee can self approve their own expense claim");
  await page
    .getByLabel("Preconditions")
    .fill("Employee 123 owns pending expense claim 701.");
  await page
    .getByLabel("Steps to reproduce")
    .fill(
      "1. Sign in to RelayDesk as employee 123. 2. Click Approve on owned claim EXP-701. 3. Observe status.",
    );
  await page
    .getByLabel("Expected result")
    .fill(
      "A separate finance approver must approve claims; self approval is forbidden.",
    );
  await page
    .getByLabel("Actual result")
    .fill(
      "Employee 123 self approves expense 701 and status changes to approved.",
    );
  await page
    .getByRole("combobox", { name: "Severity", exact: true })
    .selectOption("Critical");
  await page
    .getByRole("button", { name: /POST \/api\/expenses\/701\/approve → 200/ })
    .click();
  await page.getByRole("button", { name: "Submit to engineering" }).click();
  await expect(page.getByText(/^Accepted — Hamza/)).toBeVisible();
  await nav(page, "Assessments");
  await page.getByRole("button", { name: "Request fix candidate" }).click();
  await expect(
    page.getByRole("button", { name: "RD-1.0.1 available" }),
  ).toBeVisible();
  await nav(page, "Postman Lab");
  await page
    .getByRole("button", {
      name: "POST /api/expenses/701/approve",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".response-body")).toContainText(
    "separate finance approver",
  );
  await page
    .getByRole("button", { name: "POST /api/expenses", exact: true })
    .click();
  await edit(page, '{"amount":50001,"category":"Travel"}');
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".response-body")).toContainText("Claim rejected");
  await page
    .getByLabel("Investigation conclusion")
    .fill(
      "Expected employee approval to return 403, the fixed candidate rejects it. Actual amount 50001 is now rejected, confirming the authorization and amount contracts after retest.",
    );
  await page.getByRole("button", { name: "Submit API investigation" }).click();
  await nav(page, "SQL Lab");
  await edit(
    page,
    "SELECT requester_id, SUM(amount) FROM expenses WHERE status='pending' GROUP BY requester_id",
  );
  await page.getByRole("button", { name: "Run query" }).click();
  await expect(
    page.getByText(
      "Result verified against the investigation target. SQL evidence accepted.",
    ),
  ).toBeVisible();
  await nav(page, "Test Lab");
  await page.getByLabel("Refresh expense totals").click();
  await expect(page.getByTestId("expense-total")).toHaveText("PKR 56,801");
  await page.screenshot({
    path: "test-results/relaydesk-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/relaydesk-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(
    saved.assessment.artifacts.some(
      (a: { area: string }) => a.area === "Retesting",
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await nav(page, "Requirements");
  for (const id of ["02", "04", "05", "06"])
    await page.getByRole("button", { name: new RegExp(`AC-${id}`) }).click();
  await page
    .getByLabel("Clarification for Ayesha")
    .fill(
      "What maximum submission time, dashboard refresh interval, exact error recovery, and notification deadline should be validated?",
    );
  await page.getByRole("button", { name: "Submit review" }).click();
  await nav(page, "Test Cases");
  for (const value of [499, 500, 501, 49999, 50000, 50001]) {
    await page.getByLabel("Claim amount (PKR)").fill(String(value));
    await page
      .getByRole("combobox", { name: "Expected outcome" })
      .selectOption(value < 500 || value > 50000 ? "Reject" : "Accept");
    await page.getByRole("button", { name: "Add test case" }).click();
  }
  await page.getByRole("button", { name: "Submit test suite" }).click();
  await nav(page, "Test Lab");
  await page.getByLabel("RelayDesk network").selectOption("Offline");
  await page
    .getByRole("button", { name: "Submit expense", exact: true })
    .click();
  await nav(page, "DevTools");
  await page
    .getByLabel("Technical finding")
    .fill(
      "POST /api/expenses returns 503 while offline. Console shows an unhandled promise rejection; no recovery guidance is displayed. Inspect the request error handler and retest reconnect behavior.",
    );
  await page.getByRole("button", { name: "Submit finding" }).click();
  await nav(page, "Slack");
  await page
    .getByLabel("Team message")
    .fill(
      "Today I verified RD-1.0.1 rejects requester approval and invalid claims. SQL evidence confirms the pending total. Offline recovery remains a risk; next I will run expense regression and validate the pipeline gate.",
    );
  await page.getByRole("button", { name: "Send update" }).click();
  await nav(page, "Automation Lab");
  await edit(
    page,
    "test('expense regression', async ({ page }) => {\n  await page.goto('/expenses');\n  await expect(page.getByRole('heading', { name: 'My expenses' })).toBeVisible();\n  await expect(page.getByTestId('expense-total')).toHaveText('PKR 56,801');\n});",
  );
  await page.getByRole("button", { name: "Run test", exact: true }).click();
  await expect(page.locator(".terminal-output")).toContainText(
    "PASS Pending total matches current ledger",
  );
  await nav(page, "CI/CD");
  await page
    .getByLabel("Replace the hardcoded wait with an observable assertion")
    .fill(
      "await expect(page.getByRole('heading', { name: 'My expenses' })).toBeVisible();",
    );
  await page.getByRole("button", { name: "Save repair" }).click();
  for (const command of [
    "git switch -c fix/expense-readiness",
    "git add .",
    'git commit -m "Wait for expenses"',
    "git push",
  ]) {
    await page.getByLabel("Git command").fill(command);
    await page.getByRole("button", { name: "Run", exact: true }).click();
  }
  await page.getByRole("button", { name: "Rerun pipeline" }).click();
  await nav(page, "Release Center");
  await page
    .getByRole("combobox", { name: "Decision", exact: true })
    .selectOption("Conditional release");
  await page
    .getByLabel("Evidence, impact, and next steps")
    .fill(
      "Conditional release of RD-1.0.1: evidence verifies the approval and limit fixes, SQL totals, regression, and the pipeline gate. Monitor finance impact and keep rollback ready; offline recovery remains a documented customer risk.",
    );
  await page.getByRole("button", { name: "Submit recommendation" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Decision recorded" }),
  ).toBeVisible();
  await nav(page, "Assessments");
  await page
    .getByLabel("Testing strategy")
    .fill(
      "Prioritize critical authorization and money integrity, then inclusive amount boundaries, dashboard persistence, offline errors, API behavior, and smoke regression. Validate the fix candidate before considering any release.",
    );
  await page
    .getByLabel("Quality summary and recommendation")
    .fill(
      "Conditional release after RD-1.0.1 retest: the critical self-approval and amount defects are repaired; SQL totals agree with the dashboard and regression and pipeline gates pass. Customer risk remains in offline recovery. Monitor finance, document the limitation, and keep rollback ready.",
    );
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByText(/Assessment passed/)).toBeVisible();
  const completed = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(completed.completed["QA-017"]).toBeGreaterThanOrEqual(75);
  expect(completed.incidents).toBe(0);
  expect(completed.incidentActive).toBe(false);
  expect(errors).toEqual([]);
});
test("drafts and active attempt survive switching tools and reload", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Assessments");
  await page.getByRole("button", { name: "Start hiring assessment" }).click();
  await nav(page, "Jira");
  await page
    .getByLabel("Summary", { exact: true })
    .fill("My unfinished investigation report");
  await nav(page, "SQL Lab");
  await edit(page, "SELECT * FROM transactions WHERE amount > 4000;");
  await nav(page, "Jira");
  await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
    "My unfinished investigation report",
  );
  await page.reload();
  await nav(page, "Jira");
  await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
    "My unfinished investigation report",
  );
  await nav(page, "SQL Lab");
  await expect(page.locator(".monaco-editor")).toContainText("4000");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  expect(saved.assessment.status).toBe("running");
  expect(saved.active).toBe("QA-016");
});
