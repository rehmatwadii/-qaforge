import { describe, it, expect } from "vitest";
import { campaign, missions, practice } from "../src/lib/content";
import {
  initialState,
  advance,
  reward,
  addEvidence,
  gradeTicket,
  applyTicket,
  promotionRequirements,
  restoreSave,
  absoluteTime,
  performance,
} from "../src/lib/engine";
import {
  simulateApi,
  runAutomation,
  automationSolution,
} from "../src/lib/simulations";
describe("career progression", () => {
  it("has a uniquely identified catalog and all required practice categories", () => {
    expect(new Set(missions.map((m) => m.id)).size).toBe(missions.length);
    expect(practice.filter((m) => m.kind === "bughunt")).toHaveLength(100);
    expect(practice.filter((m) => m.kind === "sql")).toHaveLength(75);
    expect(practice.filter((m) => m.kind === "interview")).toHaveLength(150);
  });
  it("awards a mission once and applies hint and deadline penalties", () => {
    const s = initialState();
    s.startedAt = absoluteTime(s);
    const first = reward(s, campaign[0], 100);
    expect(first.xp).toBe(150);
    expect(reward(first, campaign[0], 100).xp).toBe(150);
    const hinted = reward({ ...s, hintCount: 2 }, campaign[0], 100);
    expect(hinted.completed["QA-001"]).toBe(90);
    const late = reward(advance(s, 151), campaign[0], 100);
    expect(late.completed["QA-001"]).toBe(90);
  });
  it("compresses overnight time and carries over remaining work minutes", () => {
    const s = advance({ ...initialState(), minute: 1010 }, 30);
    expect(s.day).toBe(2);
    expect(s.minute).toBe(560);
  });
  it("does not grant promotions from XP alone", () => {
    expect(
      promotionRequirements({ ...initialState(), xp: 100000 }).every(
        (c) => c.ok,
      ),
    ).toBe(false);
  });
  it("restores valid saves and rejects corrupt state", () => {
    expect(restoreSave(JSON.stringify(initialState())).active).toBe("QA-001");
    expect(() => restoreSave("{")).toThrow();
    expect(() =>
      restoreSave(JSON.stringify({ ...initialState(), roleIndex: 99 })),
    ).toThrow();
    expect(() =>
      restoreSave(JSON.stringify({ ...initialState(), skills: {} })),
    ).toThrow();
  });
  it("rejects malformed nested saves instead of crashing a workspace", () => {
    expect(() =>
      restoreSave(JSON.stringify({ ...initialState(), messages: [null] })),
    ).toThrow();
    expect(() =>
      restoreSave(
        JSON.stringify({ ...initialState(), transactions: [{ id: "bad" }] }),
      ),
    ).toThrow();
    expect(() =>
      restoreSave(JSON.stringify({ ...initialState(), cases: [{}] })),
    ).toThrow();
    expect(() =>
      restoreSave(JSON.stringify({ ...initialState(), performance: {} })),
    ).toThrow();
  });
  it("sends a schedule event once when work crosses midday", () => {
    const s = advance({ ...initialState(), minute: 710 }, 20);
    expect(s.messages[0].id).toBe("event-1-noon");
    expect(
      advance(s, 5).messages.filter((m) => m.id === "event-1-noon"),
    ).toHaveLength(1);
  });
});
const report = {
  summary: "Coupon discount fails to update after quantity change",
  environment: "Chrome / Windows 11 / Staging",
  build: "3.2.1",
  preconditions: "Cart contains one Studio One headphone.",
  steps:
    "1. Apply SAVE20 coupon. 2. Change quantity from 1 to 2. 3. Observe cart total.",
  expected: "20% discount should apply to the current subtotal of 5000.",
  actual: "Discount remains 500 and total is 4500 instead of 4000.",
  severity: "Major",
  priority: "P2",
  evidence: "SAVE20 at quantity 1 then changed to 2; total 4500.",
};
describe("bug report evaluation", () => {
  it("rejects an unobserved report, accepts a witnessed one, and detects duplicates", () => {
    const s = initialState();
    expect(gradeTicket(s, report).status).toBe("Cannot Reproduce");
    const witnessed = addEvidence(
      s,
      "coupon",
      "SAVE20 changed quantity 1 to 2; total 4500 · build 3.2.1",
    );
    const accepted = gradeTicket(witnessed, report);
    expect(accepted.status).toBe("Accepted");
    expect(gradeTicket(applyTicket(witnessed, accepted), report).status).toBe(
      "Duplicate",
    );
  });
  it("requires complete reproduction and matching build evidence", () => {
    const s = addEvidence(
      initialState(),
      "coupon",
      "Observed coupon mismatch · build 3.2.1",
    );
    expect(
      gradeTicket(s, { ...report, steps: "bad", evidence: "" }).status,
    ).toBe("Needs More Information");
    expect(gradeTicket(s, { ...report, build: "3.9.9" }).status).toBe(
      "Cannot Reproduce",
    );
  });
});
const request = {
  method: "GET",
  endpoint: "/api/profile",
  token: "nexora-test-token",
  body: "",
  headers: '{"Content-Type":"application/json"}',
};
describe("connected API world", () => {
  it("allocates unique transaction IDs after transfers and API calls mix", () => {
    const s = initialState();
    s.transactions.push({
      id: 1007,
      order_id: "ORD-TRANSFER",
      customer_id: 123,
      amount: 500,
      status: "success",
    });
    const result = simulateApi(s, {
      ...request,
      endpoint: "/api/payments",
      method: "POST",
      body: '{"order_id":"ORD-MIXED","amount":1000}',
    });
    expect(new Set(result.state.transactions.map((t) => t.id)).size).toBe(
      result.state.transactions.length,
    );
  });
  it("enforces authorization and validates JSON", () => {
    expect(simulateApi(initialState(), { ...request, token: "" }).status).toBe(
      401,
    );
    expect(
      simulateApi(initialState(), { ...request, method: "PUT", body: "{bad" })
        .status,
    ).toBe(400);
  });
  it("reproduces lost writes and records evidence only after an observed mismatch", () => {
    let s = simulateApi(initialState(), {
      ...request,
      method: "PUT",
      body: '{"name":"Updated"}',
    }).state;
    const read = simulateApi(s, request);
    expect((read.data as { name: string }).name).toBe("Alex Morgan");
    expect(read.state.evidence.some((e) => e.kind === "profile")).toBe(true);
  });
  it("does not award defect evidence when the written name did not change", () => {
    const write = simulateApi(initialState(), {
      ...request,
      method: "PUT",
      body: '{"name":"Alex Morgan"}',
    });
    expect(
      simulateApi(write.state, request).state.evidence.some(
        (e) => e.kind === "profile",
      ),
    ).toBe(false);
  });
  it("keeps the clean build persistent and authorization-safe", () => {
    let s = { ...initialState(), active: "API-005" };
    s = simulateApi(s, {
      ...request,
      method: "PUT",
      body: '{"name":"Updated"}',
    }).state;
    expect((simulateApi(s, request).data as { name: string }).name).toBe(
      "Updated",
    );
    expect(
      simulateApi(s, { ...request, endpoint: "/api/profile/124" }).status,
    ).toBe(403);
  });
  it("shares posted payments with the ledger and exposes duplicate retries", () => {
    const first = simulateApi(initialState(), {
      ...request,
      endpoint: "/api/payments",
      method: "POST",
      body: '{"order_id":"ORD-NEW","amount":1000}',
    });
    const next = simulateApi(first.state, {
      ...request,
      endpoint: "/api/payments",
      method: "POST",
      body: '{"order_id":"ORD-NEW","amount":1000}',
    });
    expect(
      next.state.transactions.filter((t) => t.order_id === "ORD-NEW"),
    ).toHaveLength(2);
    expect(next.state.evidence.some((e) => e.kind === "duplicate")).toBe(true);
  });
  it("does not duplicate a payment on the clean build", () => {
    const s = { ...initialState(), active: "API-005" };
    const req = {
      ...request,
      endpoint: "/api/payments",
      method: "POST",
      body: '{"order_id":"ORD-NEW","amount":1000}',
    };
    const first = simulateApi(s, req);
    const next = simulateApi(first.state, req);
    expect(
      next.state.transactions.filter((t) => t.order_id === "ORD-NEW"),
    ).toHaveLength(1);
  });
});
describe("automation and load simulations", () => {
  it("executes supported actions in order and requires a real assertion", () => {
    expect(runAutomation(automationSolution).passed).toBe(true);
    expect(
      runAutomation(automationSolution.replace("Nexora123!", "wrong")).passed,
    ).toBe(false);
    expect(
      runAutomation("// Dashboard toBeVisible Sign in\nalert('PASS')").passed,
    ).toBe(false);
    expect(
      runAutomation(
        automationSolution.replace("await page.goto('/login');", ""),
      ).passed,
    ).toBe(false);
  });
  it("makes capacity failures depend on workload", () => {
    expect(performance(500).errors).toBe(0);
    expect(performance(15000).errors).toBeGreaterThan(1);
    expect(performance(15000).p95).toBeGreaterThan(2000);
  });
});
