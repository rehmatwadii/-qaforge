import { type Mission, type Skill, skills, missions } from "./content";
export type Evidence = {
  id: string;
  kind: string;
  detail: string;
  time: string;
  assessmentId?: string;
};
export type Ticket = {
  id: string;
  summary: string;
  environment: string;
  build: string;
  steps: string;
  expected: string;
  actual: string;
  severity: string;
  priority: string;
  preconditions: string;
  evidence: string;
  status: string;
  feedback: string;
  defect?: string;
  quality: number;
  assessmentId?: string;
};
export type Message = {
  id: string;
  from: string;
  text: string;
  time: string;
  read: boolean;
};
export type TestCase = {
  id: string;
  input: number;
  expected: "Accept" | "Reject";
  steps: string;
  precondition: string;
  assessmentId?: string;
};
export const workAreas = [
  "Requirements",
  "Test design",
  "Exploration",
  "Bug reporting",
  "API",
  "SQL",
  "DevTools",
  "Communication",
  "Retesting",
  "Automation",
  "CI/CD",
  "Release judgment",
] as const;
export type WorkArea = (typeof workAreas)[number];
export type AssessmentArtifact = {
  area: WorkArea;
  score: number;
  detail: string;
  elapsed: number;
};
export type AssessmentRun = {
  id: string;
  mode: "assessment" | "capstone";
  missionId: string;
  status: "running" | "expired" | "submitted" | "abandoned";
  elapsed: number;
  budget: number;
  startedDay: number;
  artifacts: AssessmentArtifact[];
  strategy: string;
  summary: string;
  score: number | null;
  feedback: string;
  previousMission: string;
};
export type Expense = {
  id: number;
  requester_id: number;
  amount: number;
  category: string;
  status: string;
};
export type GameState = {
  version: 1;
  name: string;
  started: boolean;
  day: number;
  minute: number;
  xp: number;
  reputation: number;
  active: string;
  startedAt: number;
  completed: Record<string, number>;
  skills: Record<Skill, number>;
  tickets: Ticket[];
  evidence: Evidence[];
  messages: Message[];
  cases: TestCase[];
  achievements: string[];
  hintCount: number;
  attempts: number;
  valid: number;
  falseBugs: number;
  duplicates: number;
  apiCount: number;
  sqlCount: number;
  automationCount: number;
  releases: number;
  blocked: number;
  incidents: number;
  incidentActive: boolean;
  incidentInvestigated: boolean;
  releaseHistory: string[];
  profile: { name: string; email: string };
  transactions: {
    id: number;
    order_id: string;
    customer_id: number;
    amount: number;
    status: string;
  }[];
  apiHistory: string[];
  sqlSolved: string[];
  standupDay: number;
  interviewScores: number[];
  sprintStep: number;
  git: { branch: string; staged: boolean; committed: boolean; pushed: boolean };
  pipelineFixed: boolean;
  performance: { users: number; p95: number; errors: number } | null;
  roleIndex: number;
  difficulty: string;
  sound: boolean;
  lastFeedback: string;
  drafts: Record<string, string>;
  assessment: AssessmentRun | null;
  assessmentHistory: AssessmentRun[];
  expenses: Expense[];
  expenseFixed: boolean;
};
export const roles = [
  "QA Trainee",
  "Associate SQA Engineer",
  "Junior SQA Engineer",
  "SQA Engineer",
  "QA Automation Engineer",
  "Senior SQA Engineer",
  "QA Lead",
];
export function initialState(): GameState {
  return {
    version: 1,
    name: "Alex",
    started: false,
    day: 1,
    minute: 540,
    xp: 0,
    reputation: 70,
    active: "QA-001",
    startedAt: 1980,
    completed: {},
    skills: Object.fromEntries(skills.map((s) => [s, 0])) as Record<
      Skill,
      number
    >,
    tickets: [],
    evidence: [],
    messages: [
      {
        id: "welcome",
        from: "Maya",
        text: "Welcome to Nexora! Your workstation is ready. Start with the login requirements. Ask questions now; they are much cheaper than production bugs.",
        time: "09:00",
        read: false,
      },
      {
        id: "spec",
        from: "Ayesha",
        text: "I shared the ShopSphere login spec. Please flag anything engineering could interpret in more than one way.",
        time: "09:02",
        read: false,
      },
      {
        id: "build",
        from: "Ahmed",
        text: "ShopSphere 3.2.1 is deployed to staging. Test accounts and the payment ledger are available in your labs.",
        time: "09:05",
        read: false,
      },
    ],
    cases: [],
    achievements: [],
    hintCount: 0,
    attempts: 0,
    valid: 0,
    falseBugs: 0,
    duplicates: 0,
    apiCount: 0,
    sqlCount: 0,
    automationCount: 0,
    releases: 0,
    blocked: 0,
    incidents: 0,
    incidentActive: false,
    incidentInvestigated: false,
    releaseHistory: [],
    profile: { name: "Alex Morgan", email: "alex@nexora.test" },
    transactions: [
      {
        id: 1001,
        order_id: "ORD-1041",
        customer_id: 123,
        amount: 2500,
        status: "success",
      },
      {
        id: 1002,
        order_id: "ORD-1042",
        customer_id: 123,
        amount: 5000,
        status: "success",
      },
      {
        id: 1003,
        order_id: "ORD-1042",
        customer_id: 123,
        amount: 5000,
        status: "success",
      },
      {
        id: 1004,
        order_id: "ORD-1043",
        customer_id: 124,
        amount: 1200,
        status: "failed",
      },
      {
        id: 1005,
        order_id: "ORD-1044",
        customer_id: 124,
        amount: 7500,
        status: "success",
      },
    ],
    apiHistory: [],
    sqlSolved: [],
    standupDay: 0,
    interviewScores: [],
    sprintStep: 0,
    git: { branch: "main", staged: false, committed: false, pushed: false },
    pipelineFixed: false,
    performance: null,
    roleIndex: 0,
    difficulty: "Trainee",
    sound: false,
    lastFeedback: "",
    drafts: {},
    assessment: null,
    assessmentHistory: [],
    expenses: [
      {
        id: 701,
        requester_id: 123,
        amount: 12500,
        category: "Travel",
        status: "pending",
      },
      {
        id: 702,
        requester_id: 124,
        amount: 3400,
        category: "Meals",
        status: "approved",
      },
      {
        id: 703,
        requester_id: 123,
        amount: 6800,
        category: "Equipment",
        status: "pending",
      },
    ],
    expenseFixed: false,
  };
}
export const time = (minute: number) =>
  `${String(Math.floor(minute / 60) % 24).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
export const absoluteTime = (s: GameState) => s.day * 1440 + s.minute;
export function deadlineMinutes(s: GameState, m: Mission) {
  return (
    (m.kind === "sprint" ? 14400 : 0) +
    Math.round(
      m.minutes *
        ({
          Trainee: 1,
          Junior: 0.9,
          Professional: 0.75,
          Senior: 0.6,
          Nightmare: 0.45,
        }[s.difficulty] ?? 1),
    )
  );
}
export function advance(s: GameState, minutes: number): GameState {
  if (s.assessment?.status === "running")
    minutes = Math.max(
      1,
      Math.round(minutes * (s.assessment.mode === "assessment" ? 0.35 : 1)),
    );
  let day = s.day,
    minute = s.minute + minutes;
  while (minute >= 1020) {
    day++;
    minute = 540 + (minute - 1020);
  }
  let next = { ...s, day, minute };
  if (s.assessment?.status === "running") {
    const elapsed = s.assessment.elapsed + minutes;
    next = {
      ...next,
      assessment: {
        ...s.assessment,
        elapsed,
        status: elapsed > s.assessment.budget ? "expired" : "running",
      },
    };
  }
  if (s.minute < 720 && minute >= 720) {
    const id = `event-${day}-noon`;
    if (!s.messages.some((m) => m.id === id)) {
      const events = [
        {
          from: "Ali",
          text: "Schedule change: the release meeting moved 15 minutes earlier. Reprioritize around customer risk.",
        },
        {
          from: "Hamza",
          text: "I cannot reproduce the latest staging report. Please share the build, environment, and exact reproduction steps.",
        },
        {
          from: "Ahmed",
          text: "A dependency is intermittently timing out. Include the offline and retry paths in today’s smoke coverage.",
        },
      ];
      const event = events[(day - 1) % events.length];
      next = {
        ...next,
        startedAt: day % 3 === 1 ? next.startedAt - 15 : next.startedAt,
        messages: [
          { id, ...event, time: time(minute), read: false },
          ...next.messages,
        ],
      };
    }
  }
  return next;
}
export function addMessage(
  s: GameState,
  from: string,
  text: string,
): GameState {
  return {
    ...s,
    messages: [
      {
        id: crypto.randomUUID(),
        from,
        text,
        time: time(s.minute),
        read: false,
      },
      ...s.messages,
    ].slice(0, 80),
  };
}
export function addEvidence(
  s: GameState,
  kind: string,
  detail: string,
): GameState {
  const assessmentId =
    s.assessment?.status === "running" ? s.assessment.id : undefined;
  if (
    s.evidence.some(
      (e) =>
        e.kind === kind &&
        e.detail === detail &&
        e.assessmentId === assessmentId,
    )
  )
    return s;
  return {
    ...s,
    evidence: [
      {
        id: crypto.randomUUID(),
        kind,
        detail,
        time: time(s.minute),
        assessmentId,
      },
      ...s.evidence,
    ].slice(0, 100),
  };
}
export function reward(s: GameState, m: Mission, score: number): GameState {
  if (s.completed[m.id])
    return {
      ...s,
      lastFeedback:
        "This mission is already complete. Practice again without duplicate rewards.",
    };
  const late =
    s.assessment?.missionId === m.id
      ? s.assessment.elapsed > s.assessment.budget
      : absoluteTime(s) - (s.startedAt || absoluteTime(s)) >
        deadlineMinutes(s, m);
  const grade = Math.max(
    30,
    Math.min(100, score - s.hintCount * 5 - (late ? 10 : 0)),
  );
  const earned = Math.round((m.xp * grade) / 100);
  const updated = {
    ...advance(s, 10),
    completed: { ...s.completed, [m.id]: grade },
    xp: s.xp + earned,
    reputation: Math.min(100, s.reputation + (grade >= 75 ? 3 : 1)),
    skills: {
      ...s.skills,
      [m.skill]: Math.min(100, s.skills[m.skill] + Math.round(grade / 8)),
    },
    lastFeedback: `Mission complete · ${grade}/100 · +${earned} XP${late ? " · deadline penalty applied" : ""}`,
  };
  if (Object.keys(updated.completed).length === 1)
    updated.achievements = [...updated.achievements, "First day, first win"];
  if (m.kind === "sql" && !updated.achievements.includes("SQL Investigator"))
    updated.achievements = [...updated.achievements, "SQL Investigator"];
  if (m.kind === "api" && !updated.achievements.includes("API Detective"))
    updated.achievements = [...updated.achievements, "API Detective"];
  return addMessage(
    updated,
    "Maya",
    `${m.id}: ${updated.lastFeedback}. ${grade >= 80 ? "Good evidence. You are building trust with the team." : "Review your feedback before the next assignment."}`,
  );
}
export function activeMission(s: GameState) {
  return missions.find((m) => m.id === s.active) || missions[0];
}
export function buildProfile(m: Mission) {
  return m.seed === 0 ? 0 : (m.seed - 1) % 5;
}
export function buildName(m: Mission) {
  if (m.kind === "capstone") return "RD-1.0.0";
  return m.seed === 0
    ? "3.2.1"
    : `3.${3 + Math.floor(m.seed / 5)}.${m.seed % 5}`;
}
export function gradeTicket(
  s: GameState,
  t: Omit<Ticket, "id" | "status" | "feedback" | "quality">,
): Ticket {
  const text = [t.summary, t.steps, t.expected, t.actual]
    .join(" ")
    .toLowerCase();
  const quality = Math.round(
    ([
      t.summary.length >= 12,
      t.environment.length >= 5,
      t.build.length >= 3,
      t.preconditions.length >= 8,
      t.steps.length >= 30,
      t.expected.length >= 12,
      t.actual.length >= 12,
      t.evidence.length >= 12,
    ].filter(Boolean).length /
      8) *
      100,
  );
  let defect: string | undefined;
  if (/expense|claim/.test(text) && /limit|50000|50,000|above/.test(text))
    defect = "expense-limit";
  else if (/expense|claim/.test(text) && /self|own|approv/.test(text))
    defect = "self-approval";
  else if (/expense|claim/.test(text) && /total|sum|double|count/.test(text))
    defect = "expense-total";
  else if (
    /coupon|discount|save20/.test(text) &&
    /quantity|total|cart/.test(text)
  )
    defect = "coupon";
  else if (
    /password|signup/.test(text) &&
    /short|weak|character|length/.test(text)
  )
    defect = "password";
  else if (
    /profile|name/.test(text) &&
    /persist|save|old|revert|disappear/.test(text)
  )
    defect = "profile";
  else if (
    /other|another|124|unauthori|idor/.test(text) &&
    /profile|account|access/.test(text)
  )
    defect = "idor";
  else if (
    /duplicate|twice|double/.test(text) &&
    /payment|charge|transfer/.test(text)
  )
    defect = "duplicate";
  else if (
    /iphone|mobile|portrait/.test(text) &&
    /checkout|button|hidden|clip/.test(text)
  )
    defect = "mobile";
  const witnessed =
    defect &&
    s.evidence.some(
      (e) =>
        e.kind === defect &&
        e.detail.includes(`build ${t.build}`) &&
        (!s.assessment ||
          s.assessment.status !== "running" ||
          e.assessmentId === s.assessment.id),
    );
  let status = "Accepted",
    feedback =
      "Hamza: Reproduced in staging. Clear steps and evidence; I have added this to the fix queue.";
  if (quality < 88) {
    status = "Needs More Information";
    feedback =
      "Hamza: Include the build, environment, preconditions, numbered reproduction steps, expected and actual results, and captured evidence.";
  } else if (!witnessed) {
    status = "Cannot Reproduce";
    feedback =
      "Hamza: I cannot correlate this report with evidence from that build. Reproduce it in the sandbox and attach the relevant trace.";
  } else if (
    s.tickets.some(
      (x) =>
        x.defect === defect &&
        x.build === t.build &&
        x.status === "Accepted" &&
        x.assessmentId ===
          (s.assessment?.status === "running" ? s.assessment.id : undefined),
    )
  ) {
    status = "Duplicate";
    feedback =
      "Hamza: This defect is already tracked for this build. Link to the existing ticket instead.";
  } else if (
    (defect === "duplicate" ||
      defect === "idor" ||
      defect === "self-approval") &&
    t.severity !== "Critical"
  ) {
    status = "Wrong Severity";
    feedback =
      "Fahad: Financial integrity and cross-account access are critical risks. Reassess severity and resubmit.";
  } else if (
    (defect === "coupon" ||
      defect === "profile" ||
      defect === "password" ||
      defect === "mobile") &&
    t.severity === "Critical"
  ) {
    status = "Wrong Severity";
    feedback =
      "Fahad: The supplied impact supports a Major defect. Reserve Critical for security exposure or financial integrity incidents.";
  }
  return {
    ...t,
    id: `BUG-${231 + s.tickets.length}`,
    assessmentId:
      s.assessment?.status === "running" ? s.assessment.id : undefined,
    defect,
    quality,
    status,
    feedback,
  };
}
export function applyTicket(s: GameState, t: Ticket): GameState {
  let n = {
    ...advance(s, 15),
    tickets: [t, ...s.tickets],
    attempts: s.attempts + 1,
    valid: s.valid + (t.status === "Accepted" ? 1 : 0),
    falseBugs: s.falseBugs + (t.status === "Cannot Reproduce" ? 1 : 0),
    duplicates: s.duplicates + (t.status === "Duplicate" ? 1 : 0),
    reputation: Math.max(
      0,
      Math.min(100, s.reputation + (t.status === "Accepted" ? 5 : -3)),
    ),
    lastFeedback: t.feedback,
  };
  if (t.status === "Accepted" && !s.achievements.includes("First Bug"))
    n = { ...n, achievements: [...n.achievements, "First Bug"] };
  if (
    t.status === "Accepted" &&
    ["manual", "bughunt", "mobile"].includes(activeMission(s).kind)
  )
    n = reward(n, activeMission(s), t.quality);
  return addMessage(n, "Hamza", `${t.id} — ${t.feedback}`);
}
export function performance(users: number) {
  return {
    users,
    p95: Math.round(240 + users * 0.06 + Math.max(0, users - 7000) * 0.38),
    errors: Math.round(Math.max(0, (users - 8500) / 1600) * 100) / 100,
  };
}
export function readiness(s: GameState) {
  return Math.round(
    Object.values(s.skills).reduce((a, b) => a + b, 0) / skills.length,
  );
}
export function promotionRequirements(s: GameState) {
  const tier = s.roleIndex + 1;
  return [
    {
      label: `${tier * 4} completed missions`,
      ok: Object.keys(s.completed).length >= tier * 4,
    },
    { label: `${tier * 2} accepted defects`, ok: s.valid >= tier * 2 },
    {
      label: "At least 75% reporting accuracy",
      ok: s.attempts > 0 && s.valid / s.attempts >= 0.75,
    },
    {
      label: `${Math.min(90, 65 + tier * 3)} team reputation`,
      ok: s.reputation >= Math.min(90, 65 + tier * 3),
    },
    {
      label:
        tier > 2 ? "API, SQL and automation evidence" : "API and SQL evidence",
      ok:
        s.skills.API > 0 &&
        s.skills.SQL > 0 &&
        (tier <= 2 || s.skills.Automation > 0),
    },
  ];
}
export function assessText(answer: string, terms: string[]) {
  const lower = answer.toLowerCase();
  const matched = terms.filter((t) => lower.includes(t));
  return {
    score: Math.round(
      (matched.length / terms.length) * 80 +
        Math.min(20, answer.trim().split(/\s+/).length),
    ),
    missing: terms.filter((t) => !matched.includes(t)),
  };
}
export function restoreSave(raw: string): GameState {
  const value = JSON.parse(raw);
  const base = initialState();
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.tickets) ||
    !Array.isArray(value.evidence) ||
    !Array.isArray(value.messages) ||
    !Array.isArray(value.transactions) ||
    typeof value.completed !== "object" ||
    !value.skills ||
    !missions.some((m) => m.id === value.active)
  )
    throw new Error("This is not a compatible QAForge career save.");
  for (const key of [
    "day",
    "minute",
    "xp",
    "reputation",
    "valid",
    "attempts",
    "roleIndex",
  ])
    if (
      typeof value[key] !== "number" ||
      !Number.isFinite(value[key]) ||
      value[key] < 0
    )
      throw new Error("Invalid career statistics.");
  if (
    value.roleIndex >= roles.length ||
    value.minute > 1020 ||
    value.reputation > 100
  )
    throw new Error("Career values are out of range.");
  for (const skill of skills)
    if (
      typeof value.skills[skill] !== "number" ||
      value.skills[skill] < 0 ||
      value.skills[skill] > 100
    )
      throw new Error("Invalid skill scores.");
  const candidate = {
    ...base,
    ...value,
    skills: { ...base.skills, ...value.skills },
  };
  const record = (item: unknown): item is Record<string, unknown> =>
    !!item && typeof item === "object" && !Array.isArray(item);
  const hasStrings = (item: unknown, keys: string[]) =>
    record(item) && keys.every((k) => typeof item[k] === "string");
  for (const [key, defaultValue] of Object.entries(base)) {
    if (
      typeof defaultValue === "number" &&
      (typeof candidate[key] !== "number" ||
        !Number.isFinite(candidate[key]) ||
        Math.abs(candidate[key]) > 1e9)
    )
      throw new Error("Invalid numeric save data.");
    if (
      typeof defaultValue === "boolean" &&
      typeof candidate[key] !== "boolean"
    )
      throw new Error("Invalid save flags.");
    if (typeof defaultValue === "string" && typeof candidate[key] !== "string")
      throw new Error("Invalid save text.");
    if (
      Array.isArray(defaultValue) &&
      (!Array.isArray(candidate[key]) || candidate[key].length > 20000)
    )
      throw new Error("Invalid save collection.");
  }
  if (
    !candidate.evidence.every((e: unknown) =>
      hasStrings(e, ["id", "kind", "detail", "time"]),
    ) ||
    !candidate.messages.every(
      (e: unknown) =>
        hasStrings(e, ["id", "from", "text", "time"]) &&
        record(e) &&
        typeof e.read === "boolean",
    )
  )
    throw new Error("Invalid evidence or message data.");
  if (
    !candidate.tickets.every(
      (t: unknown) =>
        hasStrings(t, [
          "id",
          "summary",
          "environment",
          "build",
          "steps",
          "expected",
          "actual",
          "severity",
          "priority",
          "preconditions",
          "evidence",
          "status",
          "feedback",
        ]) &&
        record(t) &&
        typeof t.quality === "number",
    )
  )
    throw new Error("Invalid defect report data.");
  if (
    !candidate.transactions.every(
      (t: unknown) =>
        record(t) &&
        hasStrings(t, ["order_id", "status"]) &&
        ["id", "customer_id", "amount"].every(
          (k) => typeof t[k] === "number" && Number.isFinite(t[k]),
        ),
    )
  )
    throw new Error("Invalid transaction ledger.");
  if (
    !candidate.cases.every(
      (c: unknown) =>
        record(c) &&
        hasStrings(c, ["id", "steps", "precondition"]) &&
        typeof c.input === "number" &&
        Number.isFinite(c.input) &&
        ["Accept", "Reject"].includes(String(c.expected)),
    )
  )
    throw new Error("Invalid test suite.");
  if (
    !hasStrings(candidate.profile, ["name", "email"]) ||
    !hasStrings(candidate.git, ["branch"]) ||
    !["staged", "committed", "pushed"].every(
      (k) => typeof candidate.git[k] === "boolean",
    )
  )
    throw new Error("Invalid project data.");
  if (
    !record(candidate.completed) ||
    Object.entries(candidate.completed).some(
      ([id, score]) =>
        !missions.some((m) => m.id === id) ||
        typeof score !== "number" ||
        score < 0 ||
        score > 100,
    )
  )
    throw new Error("Invalid mission results.");
  for (const key of [
    "achievements",
    "releaseHistory",
    "apiHistory",
    "sqlSolved",
  ])
    if (!candidate[key].every((v: unknown) => typeof v === "string"))
      throw new Error("Invalid career history.");
  if (
    !candidate.interviewScores.every(
      (v: unknown) => typeof v === "number" && v >= 0 && v <= 100,
    ) ||
    candidate.sprintStep > 10
  )
    throw new Error("Invalid assessment results.");
  if (
    candidate.performance !== null &&
    (!record(candidate.performance) ||
      !["users", "p95", "errors"].every(
        (k) =>
          typeof candidate.performance[k] === "number" &&
          Number.isFinite(candidate.performance[k]),
      ))
  )
    throw new Error("Invalid performance results.");
  if (
    !record(candidate.drafts) ||
    Object.values(candidate.drafts).some(
      (v) => typeof v !== "string" || v.length > 200000,
    )
  )
    throw new Error("Invalid workspace drafts.");
  if (
    !candidate.expenses.every(
      (e: unknown) =>
        record(e) &&
        hasStrings(e, ["category", "status"]) &&
        ["id", "requester_id", "amount"].every(
          (k) => typeof e[k] === "number" && Number.isFinite(e[k]),
        ),
    )
  )
    throw new Error("Invalid expense ledger.");
  const validRun = (r: unknown) =>
    record(r) &&
    hasStrings(r, [
      "id",
      "mode",
      "missionId",
      "status",
      "strategy",
      "summary",
      "feedback",
      "previousMission",
    ]) &&
    ["assessment", "capstone"].includes(String(r.mode)) &&
    ["running", "expired", "submitted", "abandoned"].includes(
      String(r.status),
    ) &&
    missions.some((m) => m.id === r.missionId && m.kind === r.mode) &&
    missions.some((m) => m.id === r.previousMission) &&
    ["elapsed", "budget", "startedDay"].every(
      (k) => typeof r[k] === "number" && Number.isFinite(r[k]) && r[k] >= 0,
    ) &&
    r.budget === (r.mode === "assessment" ? 60 : 2400) &&
    (r.score === null ||
      (typeof r.score === "number" &&
        Number.isFinite(r.score) &&
        r.score >= 0 &&
        r.score <= 100)) &&
    Array.isArray(r.artifacts) &&
    r.artifacts.length <= workAreas.length &&
    r.artifacts.every(
      (a) =>
        record(a) &&
        typeof a.area === "string" &&
        workAreas.includes(a.area as WorkArea) &&
        typeof a.detail === "string" &&
        typeof a.score === "number" &&
        Number.isFinite(a.score) &&
        a.score >= 0 &&
        a.score <= 100 &&
        typeof a.elapsed === "number" &&
        Number.isFinite(a.elapsed) &&
        a.elapsed >= 0,
    );
  if (
    (candidate.assessment !== null && !validRun(candidate.assessment)) ||
    !candidate.assessmentHistory.every(validRun)
  )
    throw new Error("Invalid assessment attempt.");
  return candidate;
}
