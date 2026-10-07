import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { initialState, absoluteTime, type GameState } from "../src/lib/engine";
import { automationSolution } from "../src/lib/simulations";
import { startAssessment } from "../src/lib/assessments";

const directory = path.join(process.cwd(), "docs", "screenshots");
async function nav(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator("main h1")).toBeVisible();
}
async function capture(page: Page, name: string) {
  const dismiss = page.getByRole("button", { name: "Dismiss notification" });
  if (await dismiss.isVisible()) await dismiss.click();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(directory, `${name}.png`),
    fullPage: true,
    animations: "disabled",
  });
}
async function edit(page: Page, value: string) {
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(value);
}
async function install(page: Page, state: GameState) {
  await page.evaluate(
    (save) => localStorage.setItem("qaforge-career-v1", JSON.stringify(save)),
    state,
  );
  await page.reload();
  await expect(page.locator("main h1")).toBeVisible();
}
async function activate(page: Page, id: string) {
  const state: GameState = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  await install(page, { ...state, active: id, startedAt: absoluteTime(state) });
}

test("capture the documented workspaces using fictional demo data", async ({
  page,
}) => {
  await mkdir(directory, { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await capture(page, "01-home");
  await page.getByRole("button", { name: "Start your first mission" }).click();
  await capture(page, "02-onboarding");
  await page
    .getByRole("button", { name: "Clock in & open your first mission" })
    .click();
  for (const id of ["02", "03", "04", "06"])
    await page.getByRole("button", { name: new RegExp(`AC-${id}`) }).click();
  await page
    .getByLabel("Clarification for Ayesha")
    .fill(
      "What maximum response time, failed-attempt limit, lockout duration, exact error response, and session expiry must we validate?",
    );
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText(/100\/100 — Ayesha/)).toBeVisible();
  await capture(page, "03-requirements");
  await activate(page, "QA-002");
  await nav(page, "Test Cases");
  for (const value of [499, 500, 501, 249999, 250000, 250001]) {
    await page.getByLabel("Transfer amount (PKR)").fill(String(value));
    await page
      .getByRole("combobox", { name: "Expected outcome" })
      .selectOption(value < 500 || value > 250000 ? "Reject" : "Accept");
    await page.getByRole("button", { name: "Add test case" }).click();
  }
  await page.getByRole("button", { name: "Submit test suite" }).click();
  await capture(page, "04-test-cases");
  await activate(page, "QA-003");
  await nav(page, "Test Lab");
  await page.getByLabel("Coupon code").fill("SAVE20");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByLabel("Increase quantity").click();
  await expect(page.getByTestId("cart-total")).toHaveText("PKR 4,500");
  await capture(page, "05-shopsphere");
  await page.getByRole("button", { name: "Report a defect" }).click();
  for (const [label, value] of Object.entries({
    Summary: "Coupon discount does not update when cart quantity changes",
    Preconditions: "One Studio One headphone in cart and valid SAVE20 coupon.",
    "Steps to reproduce":
      "1. Apply SAVE20 at quantity 1. 2. Increase quantity to 2. 3. Observe the total.",
    "Expected result":
      "Discount should be 1000 and total should be 4000 for two headphones.",
    "Actual result":
      "Discount stays at 500 and total is 4500 after quantity changes.",
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page
    .getByRole("button", {
      name: /SAVE20 applied at quantity 1; quantity changed to 2/,
    })
    .click();
  await capture(page, "06-jira-report");
  await page.getByRole("button", { name: "Submit to engineering" }).click();
  await expect(page.getByText(/^Accepted — Hamza/)).toBeVisible();
  await page.getByRole("button", { name: /Issue board/ }).click();
  await capture(page, "07-jira-board");
  await nav(page, "Test Lab");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByLabel("Email address").fill("alex@nexora.test");
  await page.getByLabel("Password", { exact: true }).fill("Nexora123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await capture(page, "08-login");
  await page.getByRole("button", { name: "Signup", exact: true }).click();
  await page.getByLabel("Email address").fill("demo@shopsphere.test");
  await page.getByLabel("Password", { exact: true }).fill("abc123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await capture(page, "09-signup");
  await page.getByLabel("Test application").selectOption("FinEdge");
  await page.getByLabel("Amount (PKR)").fill("5000");
  await page.getByRole("button", { name: /Confirm transfer/ }).click();
  await capture(page, "10-finedge");
  await activate(page, "QA-004");
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
      "Expected PUT to persist the profile name. Actual GET response returns the original name with status 200. This violates the persistence contract and loses the customer's update.",
    );
  await page.getByRole("button", { name: "Submit API investigation" }).click();
  await expect(page.locator(".response-body")).toContainText("Alex Morgan");
  await capture(page, "11-api");
  await activate(page, "QA-005");
  await nav(page, "SQL Lab");
  await edit(
    page,
    "SELECT order_id, COUNT(*) AS charges FROM transactions WHERE status='success' GROUP BY order_id HAVING COUNT(*) > 1;",
  );
  await page.getByRole("button", { name: "Run query" }).click();
  await expect(
    page.getByText(
      "Result verified against the investigation target. SQL evidence accepted.",
    ),
  ).toBeVisible();
  await capture(page, "12-sql");
  await activate(page, "QA-006");
  await nav(page, "Test Lab");
  await page.getByLabel("Network").selectOption("Offline");
  await page.getByRole("button", { name: /Continue to checkout/ }).click();
  await nav(page, "DevTools");
  await page
    .getByLabel("Technical finding")
    .fill(
      "POST /api/checkout returns 503 Service Unavailable while offline. Console shows an unhandled promise rejection. Inspect the error handler and verify reconnect recovery.",
    );
  await page.getByRole("button", { name: "Submit finding" }).click();
  await capture(page, "13-devtools");
  await activate(page, "QA-007");
  await nav(page, "Test Lab");
  await page.getByLabel("Device").selectOption("iPhone");
  await capture(page, "14-device-lab");
  await activate(page, "QA-009");
  await nav(page, "Postman Lab");
  await page
    .getByRole("button", { name: "GET /api/profile/124", exact: true })
    .click();
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await capture(page, "15-security");
  await activate(page, "QA-010");
  await nav(page, "Automation Lab");
  await edit(page, automationSolution);
  await page.getByRole("button", { name: "Run test", exact: true }).click();
  await expect(page.locator(".terminal-output")).toContainText(
    "PASS Dashboard is visible",
  );
  await capture(page, "16-automation");
  for (const framework of ["Selenium", "Cypress", "Appium"]) {
    await page.getByRole("button", { name: framework, exact: true }).click();
    const repairs: Record<string, string> = {
      Selenium:
        'new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.visibilityOfElementLocated(By.id("dashboard")));',
      Cypress:
        "cy.get('#dashboard').should('be.visible'); // Retry observable readiness rather than a fixed wait.",
      Appium:
        'wait.until(ExpectedConditions.visibilityOfElementLocated(AppiumBy.accessibilityId("Dashboard")));',
    };
    await page.getByLabel("Framework repair").fill(repairs[framework]);
    await page.getByRole("button", { name: "Review repair" }).click();
    await expect(
      page.getByText(
        "Repair rationale accepted. Prefer an observable state over elapsed time.",
      ),
    ).toBeVisible();
    await capture(page, `17-${framework.toLowerCase()}`);
  }
  await activate(page, "QA-011");
  await nav(page, "CI/CD");
  await page
    .getByLabel("Replace the hardcoded wait with an observable assertion")
    .fill(
      "await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();",
    );
  await page.getByRole("button", { name: "Save repair" }).click();
  for (const command of [
    "git switch -c fix/readiness",
    "git add .",
    'git commit -m "Wait for observable readiness"',
    "git push",
  ]) {
    await page.getByLabel("Git command").fill(command);
    await page.getByRole("button", { name: "Run", exact: true }).click();
  }
  await page.getByRole("button", { name: "Rerun pipeline" }).click();
  await capture(page, "18-pipeline");
  await activate(page, "QA-008");
  await nav(page, "Performance Lab");
  await page.getByRole("button", { name: "Run load simulation" }).click();
  await page
    .getByLabel("Recommendation", { exact: true })
    .selectOption("Block and investigate capacity");
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await capture(page, "19-performance");
  await activate(page, "QA-012");
  await nav(page, "Release Center");
  await page
    .getByLabel("Decision", { exact: true })
    .selectOption("Block release");
  await page
    .getByLabel("Evidence, impact, and next steps")
    .fill(
      "Block release: SQL evidence shows duplicate successful payments for ORD-1042. Customer payment integrity is at risk. Retest idempotency and regression, validate capacity, and agree a rollback plan.",
    );
  await page.getByRole("button", { name: "Submit recommendation" }).click();
  await capture(page, "20-release");
  const earned: GameState = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("qaforge-career-v1")!),
  );
  await install(page, {
    ...earned,
    active: "QA-012",
    incidentActive: true,
    incidents: 1,
  });
  await nav(page, "Release Center");
  await capture(page, "21-incident");
  await install(page, { ...earned, active: "QA-014" });
  await nav(page, "Sprint Room");
  await capture(page, "22-sprint");
  await nav(page, "Slack");
  await page
    .getByLabel("Team message")
    .fill(
      "Today I reproduced pricing and profile defects, verified SQL evidence, and repaired the pipeline. Release is blocked pending payment and capacity fixes. Next I will retest the candidate and update regression coverage.",
    );
  await page.getByRole("button", { name: "Send update" }).click();
  await capture(page, "23-slack");
  await nav(page, "Email");
  await capture(page, "24-email");
  await nav(page, "Company");
  await capture(page, "25-company");
  await nav(page, "Missions");
  await capture(page, "26-campaign");
  await page
    .getByRole("button", { name: "Practice library", exact: true })
    .click();
  await capture(page, "27-practice");
  await nav(page, "Career");
  await capture(page, "28-career");
  await nav(page, "Skills");
  await capture(page, "29-skills");
  await nav(page, "Job Board");
  await page
    .getByLabel("Job description")
    .fill(
      "Required: 2+ years in manual regression, SQL, and Postman API testing. Preferred: Playwright automation, Git pipelines, and clear team communication.",
    );
  await page.getByRole("button", { name: "Analyze skill match" }).click();
  await capture(page, "30-job-board");
  await activate(page, "QA-015");
  await nav(page, "Interview Arena");
  await page
    .getByLabel("Your answer")
    .fill(
      "I share the exact build and environment, numbered steps, expected and actual results, then reproduce the failure with the developer using captured evidence.",
    );
  await capture(page, "31-interview");
  for (const answer of [
    "I share the exact build and environment, numbered steps, expected and actual results, then reproduce the failure with the developer using captured evidence.",
    "Prioritize customer risk, critical payment paths and smoke coverage. Communicate unresolved release risk and agree the decision with the lead.",
    "Compare the write response with a subsequent GET, inspect database persistence, and rule out cached responses before reporting the contract failure.",
    "Correlate the order and transaction identifiers. Group successful transactions by order and count charges to prove duplicate billing.",
    "Block on material customer impact. Request the fix, retest the reported path and regression coverage, and prepare a rollback plan.",
    "Inspect the failing trace, wait on observable state, use a stable selector, and isolate shared state across parallel runs.",
  ]) {
    await page.getByLabel("Your answer").fill(answer);
    await page
      .getByRole("button", { name: "Submit answer", exact: true })
      .click();
  }
  await expect(
    page.getByText("ASSESSMENT COMPLETE", { exact: true }),
  ).toBeVisible();
  await capture(page, "32-interview-result");
  await page.getByRole("button", { name: "Open career settings" }).click();
  await capture(page, "33-settings");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await nav(page, "Assessments");
  await capture(page, "34-assessment-desk");
  await page.getByRole("button", { name: "Start hiring assessment" }).click();
  await capture(page, "35-hiring-assessment");
  await page.getByRole("button", { name: "Abandon attempt" }).click();
  const capstone = startAssessment(
    { ...initialState(), started: true, completed: { "QA-016": 95 } },
    "capstone",
  );
  await install(page, capstone);
  await nav(page, "Assessments");
  await page
    .getByLabel("Testing strategy")
    .fill(
      "Prioritize critical authorization and money integrity, inclusive claim boundaries, dashboard consistency, offline recovery, API and SQL verification, regression, and the delivery gate.",
    );
  await capture(page, "36-capstone");
  await nav(page, "Test Lab");
  await page.getByLabel("Expense amount (PKR)").fill("50001");
  await page
    .getByRole("button", { name: "Submit expense", exact: true })
    .click();
  await page.getByLabel("Refresh expense totals").click();
  await capture(page, "37-relaydesk");
  await page
    .getByRole("row")
    .filter({ hasText: "EXP-701" })
    .getByRole("button", { name: "Approve" })
    .click();
  await nav(page, "Jira");
  for (const [label, value] of Object.entries({
    Summary: "Employee can self approve their own expense claim",
    Preconditions: "Employee 123 owns pending expense claim 701.",
    "Steps to reproduce":
      "1. Sign in to RelayDesk as employee 123. 2. Approve owned expense claim 701. 3. Observe status.",
    "Expected result":
      "A separate finance approver must approve claims; self approval is forbidden.",
    "Actual result":
      "Employee 123 self approves expense 701 and status changes to approved.",
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel("Severity", { exact: true }).selectOption("Critical");
  await page
    .getByRole("button", { name: /POST \/api\/expenses\/701\/approve → 200/ })
    .click();
  await page.getByRole("button", { name: "Submit to engineering" }).click();
  await expect(page.getByText(/^Accepted — Hamza/)).toBeVisible();
  await nav(page, "Assessments");
  await page.getByRole("button", { name: "Request fix candidate" }).click();
  await capture(page, "40-fix-candidate");
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
      "Expected employee approval to return 403; the fixed candidate rejects it. Actual amount 50001 is now rejected, verifying both authorization and amount contracts after retest.",
    );
  await page.getByRole("button", { name: "Submit API investigation" }).click();
  await capture(page, "41-capstone-api");
  await nav(page, "SQL Lab");
  await edit(
    page,
    "SELECT requester_id, SUM(amount) AS pending_total FROM expenses WHERE status='pending' GROUP BY requester_id;",
  );
  await page.getByRole("button", { name: "Run query" }).click();
  await expect(
    page.getByText(
      "Result verified against the investigation target. SQL evidence accepted.",
    ),
  ).toBeVisible();
  await capture(page, "42-capstone-sql");
  await nav(page, "Test Cases");
  for (const value of [499, 500, 501, 49999, 50000, 50001]) {
    await page.getByLabel("Claim amount (PKR)").fill(String(value));
    await page
      .getByLabel("Expected outcome")
      .selectOption(value < 500 || value > 50000 ? "Reject" : "Accept");
    await page.getByRole("button", { name: "Add test case" }).click();
  }
  await page.getByRole("button", { name: "Submit test suite" }).click();
  await nav(page, "Automation Lab");
  await edit(
    page,
    "test('expense regression', async ({ page }) => {\n  await page.goto('/expenses');\n  await expect(page.getByRole('heading', { name: 'My expenses' })).toBeVisible();\n  await expect(page.getByTestId('expense-total')).toHaveText('PKR 56,801');\n});",
  );
  await page.getByRole("button", { name: "Run test", exact: true }).click();
  await expect(page.locator(".terminal-output")).toContainText(
    "PASS Pending total matches current ledger",
  );
  await capture(page, "43-capstone-regression");
  await nav(page, "Test Lab");
  await page.getByLabel("Refresh expense totals").click();
  await expect(page.getByTestId("expense-total")).toHaveText("PKR 56,801");
  await capture(page, "44-relaydesk-fixed");
  await page.setViewportSize({ width: 390, height: 844 });
  await capture(page, "38-relaydesk-mobile");
  await install(page, { ...earned, started: true });
  await nav(page, "Home");
  await capture(page, "39-home-mobile");
  await page.setViewportSize({ width: 1600, height: 1000 });
  expect(errors).toEqual([]);
});
