import { campaign } from "./content";
import {
  absoluteTime,
  addEvidence,
  addMessage,
  advance,
  initialState,
  reward,
  type AssessmentRun,
  type GameState,
  type WorkArea,
} from "./engine";

export const assessmentAreas: WorkArea[] = [
  "Requirements",
  "Test design",
  "Exploration",
  "Bug reporting",
  "API",
  "SQL",
  "Release judgment",
];
export const capstoneAreas: WorkArea[] = [
  ...assessmentAreas,
  "DevTools",
  "Communication",
  "Retesting",
  "Automation",
  "CI/CD",
];
export function recordWork(
  s: GameState,
  area: WorkArea,
  score: number,
  detail: string,
): GameState {
  const run = s.assessment;
  if (
    !run ||
    run.status !== "running" ||
    run.elapsed > run.budget ||
    s.active !== run.missionId
  )
    return s;
  const artifact = {
    area,
    score: Math.max(0, Math.min(100, Math.round(score))),
    detail,
    elapsed: run.elapsed,
  };
  if (run.artifacts.some((a) => a.area === area && a.score > artifact.score))
    return s;
  return {
    ...s,
    assessment: {
      ...run,
      artifacts: [...run.artifacts.filter((a) => a.area !== area), artifact],
    },
  };
}
export function recordExploration(s: GameState) {
  if (!s.assessment) return s;
  const kinds = new Set(
    s.evidence
      .filter(
        (e) =>
          e.assessmentId === s.assessment!.id &&
          [
            "cart",
            "coupon",
            "coupon-applied",
            "checkout",
            "login",
            "signup",
            "password",
            "device",
            "orientation",
            "mobile",
            "network",
            "expense",
            "expense-limit",
            "self-approval",
            "expense-total",
            "expense-summary",
            "expense-authorization",
          ].includes(e.kind),
      )
      .map((e) => e.kind),
  );
  return recordWork(
    s,
    "Exploration",
    Math.min(100, kinds.size * 25),
    `${kinds.size} distinct observed interaction paths.`,
  );
}
export function startAssessment(
  s: GameState,
  mode: "assessment" | "capstone",
): GameState {
  if (s.assessment && ["running", "expired"].includes(s.assessment.status))
    return {
      ...s,
      lastFeedback:
        "Finish or abandon your current attempt before starting another.",
    };
  const m = campaign.find((m) => m.kind === mode)!;
  const run: AssessmentRun = {
    id: crypto.randomUUID(),
    mode,
    missionId: m.id,
    status: "running",
    elapsed: 0,
    budget: mode === "assessment" ? 60 : 2400,
    startedDay: s.day,
    artifacts: [],
    strategy: "",
    summary: "",
    score: null,
    feedback: "",
    previousMission: s.active,
  };
  const previous = s.assessment;
  return addMessage(
    {
      ...s,
      active: m.id,
      startedAt: absoluteTime(s),
      hintCount: 0,
      assessment: run,
      assessmentHistory: previous
        ? [previous, ...s.assessmentHistory].slice(0, 20)
        : s.assessmentHistory,
      expenseFixed: false,
      expenses: mode === "capstone" ? initialState().expenses : s.expenses,
      git: mode === "capstone" ? initialState().git : s.git,
      pipelineFixed: mode === "capstone" ? false : s.pipelineFixed,
    },
    "Fahad",
    mode === "assessment"
      ? "Your practical assessment is open. Deliver fresh evidence in all seven work areas within 60 simulated minutes."
      : "RelayDesk is assigned to you. Engineering expects a defensible QA recommendation in five simulated workdays. Document a risk strategy, test the contract, and verify the fix candidate independently.",
  );
}
export function assessmentEvaluation(s: GameState) {
  const run = s.assessment;
  if (!run)
    return {
      score: 0,
      passed: false,
      missing: [] as WorkArea[],
      feedback: "No active assessment.",
    };
  const areas = run.mode === "capstone" ? capstoneAreas : assessmentAreas;
  const missing = areas.filter(
    (area) => !run.artifacts.some((a) => a.area === area && a.score >= 70),
  );
  const strategy =
    run.mode === "capstone"
      ? /risk|priorit|critical/i.test(run.strategy) && run.strategy.length >= 80
        ? 100
        : 0
      : 100;
  const summaryScore =
    run.summary.length >= 100 &&
    /risk|customer|impact/i.test(run.summary) &&
    /block|release|hold|rollback/i.test(run.summary)
      ? 100
      : 0;
  const raw =
    (areas.reduce(
      (sum, area) =>
        sum + (run.artifacts.find((a) => a.area === area)?.score || 0),
      0,
    ) +
      summaryScore +
      (run.mode === "capstone" ? strategy : 0)) /
    (areas.length + 1 + (run.mode === "capstone" ? 1 : 0));
  const rejected = s.tickets.filter(
    (t) =>
      t.assessmentId === run.id &&
      ["Cannot Reproduce", "Duplicate", "Wrong Severity"].includes(t.status),
  ).length;
  const late = run.elapsed > run.budget;
  const score = Math.max(0, Math.round(raw) - rejected * 5 - (late ? 10 : 0));
  const criticalReported =
    run.mode !== "capstone" ||
    s.tickets.some(
      (t) =>
        t.assessmentId === run.id &&
        t.defect === "self-approval" &&
        t.status === "Accepted",
    );
  const passed =
    score >= 75 &&
    missing.length === 0 &&
    summaryScore > 0 &&
    strategy > 0 &&
    !late &&
    criticalReported;
  const feedback = passed
    ? "Fahad: Assessment passed. Your artifacts support a reproducible investigation and a defensible release decision."
    : `Fahad: ${late ? "The time budget expired. " : ""}${missing.length ? `Evidence still needed: ${missing.join(", ")}. ` : ""}${!criticalReported ? "A critical authorization risk was missed. " : ""}${!strategy ? "Add a concrete risk strategy. " : ""}${!summaryScore ? "Your final report needs customer impact and a release recommendation. " : ""}${rejected ? `${rejected} incorrect report(s) reduced your score. ` : ""}Practice these gaps before your next attempt.`;
  return { score, passed, missing, feedback };
}
export function finishAssessment(s: GameState): GameState {
  const run = s.assessment;
  if (!run || !["running", "expired"].includes(run.status)) return s;
  const result = assessmentEvaluation(s);
  let next: GameState = {
    ...s,
    assessment: {
      ...run,
      status: "submitted" as const,
      score: result.score,
      feedback: result.feedback,
    },
  };
  if (result.passed) {
    const newCompletion = !s.completed[run.missionId];
    next = reward(
      next,
      campaign.find((m) => m.id === run.missionId)!,
      result.score,
    );
    if (newCompletion)
      for (const artifact of run.artifacts) {
        if (artifact.area in next.skills)
          next.skills = {
            ...next.skills,
            [artifact.area]: Math.min(
              100,
              next.skills[artifact.area as keyof typeof next.skills] +
                Math.round(artifact.score / 10),
            ),
          };
      }
    next = {
      ...next,
      achievements: [
        ...new Set([
          ...next.achievements,
          run.mode === "capstone"
            ? "First Week of Ownership"
            : "Practical Assessment Passed",
        ]),
      ],
    };
  }
  return addMessage(next, "Fahad", result.feedback);
}
export function abandonAssessment(s: GameState): GameState {
  const run = s.assessment;
  if (!run || !["running", "expired"].includes(run.status)) return s;
  return {
    ...s,
    assessment: {
      ...run,
      status: "abandoned",
      feedback:
        "Attempt abandoned. Your work is saved; a new attempt needs fresh evidence.",
    },
    active: run.previousMission,
  };
}
export function requestExpenseFix(s: GameState): GameState {
  if (s.assessment?.mode !== "capstone" || s.assessment.status !== "running")
    return s;
  const accepted = s.tickets.filter(
    (t) => t.assessmentId === s.assessment!.id && t.status === "Accepted",
  );
  if (!accepted.some((t) => t.defect === "self-approval"))
    return {
      ...s,
      lastFeedback:
        "Hamza: Report a reproducible authorization failure before requesting this fix candidate.",
    };
  return addMessage(
    { ...advance(s, 25), expenseFixed: true },
    "Hamza",
    "RelayDesk fix candidate RD-1.0.1 is available. It enforces claim limits, calculates totals from the current ledger, and rejects requester approval. Retest the reported behavior and send a regression conclusion.",
  );
}
export function expenseBuild(s: GameState) {
  return s.expenseFixed ? "RD-1.0.1" : "RD-1.0.0";
}
export function createExpense(s: GameState, amount: number, category: string) {
  let n = advance(s, 3);
  if (
    !Number.isFinite(amount) ||
    amount < 500 ||
    (s.expenseFixed && amount > 50000)
  )
    return {
      state: addEvidence(
        n,
        "expense-validation",
        `Expense PKR ${amount} rejected · build ${expenseBuild(s)}`,
      ),
      message: "Claim rejected. Allowed amount: PKR 500–50,000.",
    };
  const expense = {
    id: Math.max(700, ...s.expenses.map((e) => e.id)) + 1,
    requester_id: 123,
    amount,
    category,
    status: "pending",
  };
  n = addEvidence(
    { ...n, expenses: [...s.expenses, expense] },
    amount > 50000 ? "expense-limit" : "expense",
    `POST /api/expenses → 201 · claim ${expense.id}, amount PKR ${amount}, status pending · build ${expenseBuild(s)}`,
  );
  return {
    state: n,
    message: `Claim ${expense.id} submitted for PKR ${amount.toLocaleString()}.`,
  };
}
export function approveExpense(s: GameState, id: number) {
  let n = advance(s, 3);
  const expense = s.expenses.find((e) => e.id === id);
  if (!expense)
    return { state: n, status: 404, data: { error: "Expense not found." } };
  if (s.expenseFixed) {
    n = addEvidence(
      n,
      "expense-authorization",
      `POST /api/expenses/${id}/approve → 403 · employee 123 cannot approve claims · build ${expenseBuild(s)}`,
    );
    return {
      state: n,
      status: 403,
      data: { error: "A separate finance approver must approve this claim." },
    };
  }
  n = addEvidence(
    {
      ...n,
      expenses: s.expenses.map((e) =>
        e.id === id ? { ...e, status: "approved" } : e,
      ),
    },
    expense.requester_id === 123 ? "self-approval" : "expense",
    `POST /api/expenses/${id}/approve → 200 · requester ${expense.requester_id}, actor 123, status approved · build ${expenseBuild(s)}`,
  );
  return {
    state: n,
    status: 200,
    data: { id, status: "approved", approved_by: 123 },
  };
}
