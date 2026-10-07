import { describe, it, expect } from "vitest";
import {
  initialState,
  advance,
  addEvidence,
  applyTicket,
  gradeTicket,
  restoreSave,
} from "../src/lib/engine";
import {
  startAssessment,
  recordWork,
  finishAssessment,
  assessmentEvaluation,
  abandonAssessment,
  assessmentAreas,
  capstoneAreas,
  createExpense,
  approveExpense,
  requestExpenseFix,
  recordExploration,
} from "../src/lib/assessments";
import {
  simulateApi,
  runAutomation,
  automationSolution,
} from "../src/lib/simulations";
const conclusion =
  "Block release because customer payment and authorization risk remains. Evidence identifies the failed contract; request a fix, retest invalid inputs, verify persistence, and communicate a recovery plan.";
describe("independent assessment attempts", () => {
  it("requires fresh artifacts rather than previously completed career work", () => {
    const s = startAssessment(
      {
        ...initialState(),
        completed: { "QA-001": 100, "QA-005": 100 },
        valid: 40,
      },
      "assessment",
    );
    const result = finishAssessment(s);
    expect(result.completed["QA-016"]).toBeUndefined();
    expect(result.assessment?.score).toBe(0);
    expect(result.assessment?.feedback).toContain("Evidence still needed");
  });
  it("compresses assessment action time, expires, and refuses late credit", () => {
    const s = startAssessment(initialState(), "assessment");
    expect(advance(s, 20).assessment?.elapsed).toBe(7);
    const expired = advance(s, 200);
    expect(expired.assessment?.status).toBe("expired");
    expect(
      recordWork(expired, "SQL", 100, "query").assessment?.artifacts,
    ).toHaveLength(0);
    expect(finishAssessment(expired).assessment?.feedback).toContain(
      "time budget expired",
    );
  });
  it("passes only when every area and the report are complete, awards once", () => {
    let s = startAssessment(initialState(), "assessment");
    for (const area of assessmentAreas)
      s = recordWork(s, area, 100, "Current attempt evidence");
    s.assessment!.summary = conclusion;
    expect(assessmentEvaluation(s).passed).toBe(true);
    const result = finishAssessment(s);
    expect(result.completed["QA-016"]).toBe(100);
    expect(result.skills.SQL).toBeGreaterThan(0);
    expect(finishAssessment(result).xp).toBe(result.xp);
    let repeat = startAssessment(result, "assessment");
    for (const area of assessmentAreas)
      repeat = recordWork(repeat, area, 100, "New evidence");
    repeat.assessment!.summary = conclusion;
    expect(finishAssessment(repeat).xp).toBe(result.xp);
  });
  it("archives retries, preserves existing artifacts, and resumes from a save", () => {
    const original = startAssessment(initialState(), "assessment");
    const first = recordWork(original, "SQL", 100, "Valid query");
    expect(
      recordWork(first, "SQL", 0, "Invalid query").assessment?.artifacts[0]
        .score,
    ).toBe(100);
    const resumed = restoreSave(JSON.stringify(first));
    expect(resumed.assessment?.id).toBe(first.assessment?.id);
    expect(resumed.assessment?.artifacts).toHaveLength(1);
    const abandoned = abandonAssessment(resumed);
    expect(abandoned.active).toBe("QA-001");
    const retry = startAssessment(abandoned, "assessment");
    expect(retry.assessmentHistory).toHaveLength(1);
    expect(retry.assessment?.artifacts).toHaveLength(0);
    expect(retry.assessment?.id).not.toBe(original.assessment?.id);
  });
  it("tags fresh evidence and prevents an old build observation from proving a new report", () => {
    const old = addEvidence(
      initialState(),
      "coupon",
      "SAVE20 quantity mismatch · build 3.2.1",
    );
    const s = startAssessment(old, "assessment");
    const report = {
      summary: "Coupon fails after changing quantity",
      environment: "Chrome staging",
      build: "3.2.1",
      steps:
        "1. Apply SAVE20 coupon. 2. Change quantity to 2. 3. Observe total.",
      preconditions: "One item in the current cart.",
      expected: "The current subtotal must get a 20% discount.",
      actual: "The discount stays at the old amount after changing quantity.",
      severity: "Major",
      priority: "P2",
      evidence: "Attached coupon state observation.",
    };
    expect(gradeTicket(s, report).status).toBe("Cannot Reproduce");
    const fresh = addEvidence(
      s,
      "coupon",
      "SAVE20 quantity mismatch · build 3.2.1",
    );
    expect(gradeTicket(fresh, report).status).toBe("Accepted");
  });
  it("rejects malformed assessment saves and migrates previous save versions", () => {
    const old = initialState() as unknown as Record<string, unknown>;
    for (const key of [
      "assessment",
      "assessmentHistory",
      "drafts",
      "expenses",
      "expenseFixed",
    ])
      delete old[key];
    expect(restoreSave(JSON.stringify(old)).assessment).toBeNull();
    const s = startAssessment(initialState(), "assessment");
    s.assessment!.budget = 1;
    expect(() => restoreSave(JSON.stringify(s))).toThrow("Invalid assessment");
  });
});
describe("RelayDesk independent investigation", () => {
  const expenseSmoke = (total: string) =>
    `test('expense regression', async ({ page }) => {\n  await page.goto('/expenses');\n  await expect(page.getByRole('heading', { name: 'My expenses' })).toBeVisible();\n  await expect(page.getByTestId('expense-total')).toHaveText('${total}');\n});`;
  it("fails an expense regression when the rendered total disagrees with the ledger", () => {
    const s = createExpense(
      startAssessment(initialState(), "capstone"),
      50001,
      "Travel",
    ).state;
    expect(runAutomation(expenseSmoke("PKR 19,300"), s).passed).toBe(false);
    expect(runAutomation(expenseSmoke("PKR 69,301"), s).passed).toBe(false);
    expect(
      runAutomation(expenseSmoke("PKR 69,301"), { ...s, expenseFixed: true })
        .passed,
    ).toBe(true);
  });
  it("requires current product and ledger assertions rather than an unrelated login smoke", () => {
    const s = startAssessment(initialState(), "capstone");
    expect(runAutomation(automationSolution, s).passed).toBe(false);
    const headingOnly =
      "await page.goto('/expenses');\nawait expect(page.getByRole('heading', { name: 'My expenses' })).toBeVisible();";
    expect(runAutomation(headingOnly, s).passed).toBe(false);
    expect(runAutomation(expenseSmoke("PKR 19,300")).passed).toBe(false);
  });
  it("reports the fix build in API health responses", () => {
    const s = {
      ...startAssessment(initialState(), "capstone"),
      expenseFixed: true,
    };
    const api = simulateApi(s, {
      method: "GET",
      endpoint: "/api/health",
      token: "nexora-test-token",
      headers: "{}",
      body: "",
    });
    expect(api.data).toEqual({ status: "ok", build: "RD-1.0.1" });
  });
  it("exposes a claim limit defect and shares approvals between UI and API", () => {
    const s = startAssessment(initialState(), "capstone");
    const claim = createExpense(s, 50001, "Travel");
    expect(claim.state.expenses.at(-1)?.amount).toBe(50001);
    expect(claim.state.evidence[0].kind).toBe("expense-limit");
    const api = simulateApi(claim.state, {
      method: "POST",
      endpoint: "/api/expenses/701/approve",
      token: "nexora-test-token",
      headers: '{"Content-Type":"application/json"}',
      body: "{}",
    });
    expect(api.status).toBe(200);
    expect(api.state.expenses.find((e) => e.id === 701)?.status).toBe(
      "approved",
    );
    expect(api.state.evidence.some((e) => e.kind === "self-approval")).toBe(
      true,
    );
  });
  it("requires an accepted critical report for the fix candidate and blocks self approval after repair", () => {
    let s = startAssessment(initialState(), "capstone");
    expect(requestExpenseFix(s).expenseFixed).toBe(false);
    s = approveExpense(s, 701).state;
    const report = {
      summary: "Employee can self approve their own expense claim",
      environment: "Chrome staging",
      build: "RD-1.0.0",
      preconditions: "Employee 123 owns claim 701 in pending status.",
      steps:
        "1. Open RelayDesk as employee 123. 2. Approve claim 701 owned by the employee. 3. Observe the status.",
      expected:
        "Separate finance approver required; requester approval should be rejected.",
      actual:
        "Employee 123 can self approve expense 701; status changes to approved.",
      severity: "Critical",
      priority: "P1",
      evidence: s.evidence[0].detail,
    };
    const ticket = gradeTicket(s, report);
    expect(ticket.status).toBe("Accepted");
    s = applyTicket(s, ticket);
    const fixed = requestExpenseFix(s);
    expect(fixed.expenseFixed).toBe(true);
    expect(approveExpense(fixed, 703).status).toBe(403);
    expect(createExpense(fixed, 50001, "Travel").message).toContain("rejected");
    expect(createExpense(fixed, 50000, "Travel").message).toContain(
      "submitted",
    );
  });
  it("does not pass the capstone if its critical authorization risk was missed", () => {
    let s = startAssessment(initialState(), "capstone");
    for (const area of capstoneAreas) s = recordWork(s, area, 100, "Evidence");
    s.assessment!.strategy = conclusion;
    s.assessment!.summary = conclusion;
    expect(assessmentEvaluation(s).passed).toBe(false);
    expect(assessmentEvaluation(s).feedback).toContain(
      "critical authorization risk was missed",
    );
  });
  it("does not count repeated clicks or SQL results as broad UI exploration", () => {
    let s = startAssessment(initialState(), "assessment");
    s = recordExploration(addEvidence(s, "cart", "same cart observation"));
    s = recordExploration(addEvidence(s, "cart", "same cart observation"));
    s = recordExploration(addEvidence(s, "sql", "query results"));
    expect(
      s.assessment?.artifacts.find((a) => a.area === "Exploration")?.score,
    ).toBe(25);
  });
});
