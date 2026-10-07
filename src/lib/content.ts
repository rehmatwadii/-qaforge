export const skills = [
  "Manual QA",
  "Test design",
  "Requirements",
  "API",
  "SQL",
  "DevTools",
  "Automation",
  "Mobile",
  "Performance",
  "Security",
  "CI/CD",
  "Release judgment",
  "Communication",
] as const;
export type Skill = (typeof skills)[number];
export type MissionKind =
  | "requirement"
  | "manual"
  | "bughunt"
  | "testcase"
  | "sql"
  | "api"
  | "devtools"
  | "automation"
  | "mobile"
  | "performance"
  | "security"
  | "cicd"
  | "release"
  | "sprint"
  | "incident"
  | "interview"
  | "assessment"
  | "capstone";
export type Mission = {
  id: string;
  title: string;
  kind: MissionKind;
  project: string;
  description: string;
  xp: number;
  minutes: number;
  difficulty: number;
  skill: Skill;
  seed: number;
  prerequisite?: string;
};
export const kindInfo: Record<
  MissionKind,
  { label: string; view: string; skill: Skill }
> = {
  requirement: {
    label: "Requirements",
    view: "Requirements",
    skill: "Requirements",
  },
  manual: { label: "Manual QA", view: "Test Lab", skill: "Manual QA" },
  bughunt: { label: "Bug hunt", view: "Test Lab", skill: "Manual QA" },
  testcase: { label: "Test design", view: "Test Cases", skill: "Test design" },
  sql: { label: "SQL investigation", view: "SQL Lab", skill: "SQL" },
  api: { label: "API testing", view: "Postman Lab", skill: "API" },
  devtools: { label: "DevTools", view: "DevTools", skill: "DevTools" },
  automation: {
    label: "Automation",
    view: "Automation Lab",
    skill: "Automation",
  },
  mobile: { label: "Mobile testing", view: "Test Lab", skill: "Mobile" },
  performance: {
    label: "Performance",
    view: "Performance Lab",
    skill: "Performance",
  },
  security: { label: "Security QA", view: "Postman Lab", skill: "Security" },
  cicd: { label: "CI/CD", view: "CI/CD", skill: "CI/CD" },
  release: {
    label: "Release decision",
    view: "Release Center",
    skill: "Release judgment",
  },
  sprint: {
    label: "Sprint simulation",
    view: "Sprint Room",
    skill: "Release judgment",
  },
  incident: {
    label: "Production incident",
    view: "Release Center",
    skill: "Release judgment",
  },
  interview: {
    label: "Interview",
    view: "Interview Arena",
    skill: "Communication",
  },
  assessment: {
    label: "Hiring assessment",
    view: "Assessments",
    skill: "Manual QA",
  },
  capstone: {
    label: "Career capstone",
    view: "Assessments",
    skill: "Release judgment",
  },
};
const first: Array<[MissionKind, string, string, string]> = [
  [
    "requirement",
    "Review login requirements",
    "ShopSphere",
    "Ayesha has shared the login specification. Review the acceptance criteria, flag ambiguity, and send a precise clarification before engineering starts.",
  ],
  [
    "testcase",
    "Design the transfer boundaries",
    "FinEdge",
    "Transfers accept PKR 500–250,000 inclusive. Design the six boundary checks, including expected outcomes.",
  ],
  [
    "bughunt",
    "Your first exploratory session",
    "ShopSphere",
    "Explore the cart and checkout on build 3.2.1. Compare observed behavior with the product contract. Submit a reproducible defect through Jira.",
  ],
  [
    "api",
    "The disappearing profile",
    "ShopSphere",
    "Support says saved profile changes disappear. Use the API workspace to compare the write response with a subsequent read, then submit your evidence.",
  ],
  [
    "sql",
    "Follow the payment trail",
    "FinEdge",
    "Support has a complaint about order ORD-1042. Investigate the transactions table and return only orders with multiple successful charges.",
  ],
  [
    "devtools",
    "A checkout that goes nowhere",
    "ShopSphere",
    "Reproduce checkout with the network set to offline. Inspect the trace and identify the failing request and status.",
  ],
  [
    "mobile",
    "Take checkout off the desk",
    "ShopSphere",
    "Verify checkout on the iPhone in portrait and landscape. Compare the application with its responsive acceptance criteria.",
  ],
  [
    "security",
    "Who owns this profile?",
    "FinEdge",
    "Authenticated user 123 should only read their own profile. Investigate object-level authorization using the API workspace.",
  ],
  [
    "performance",
    "Prepare for the flash sale",
    "ShopSphere",
    "The release target is 15,000 concurrent users, P95 under 2,000 ms, and errors below 1%. Run a load simulation and evaluate the result.",
  ],
  [
    "automation",
    "Automate the login smoke test",
    "ShopSphere",
    "Build a Playwright-style login check against the sandbox. Navigate, fill both fields, click Sign in, and assert the dashboard is visible.",
  ],
  [
    "cicd",
    "Unblock the release pipeline",
    "Nexora Platform",
    "Inspect the failing UI job, fix the underlying wait, commit the correction, and rerun the pipeline.",
  ],
  [
    "release",
    "Your first release meeting",
    "ShopSphere",
    "Review the evidence for release candidate 3.2.1. Make a release decision and explain customer impact and next steps.",
  ],
  [
    "incident",
    "The duplicate-charge incident",
    "FinEdge",
    "Payment failures spiked after deployment. Correlate retry logs with the database, then contain the incident.",
  ],
  [
    "sprint",
    "Own a complete sprint",
    "ShopSphere",
    "Take ten simulated days from planning through production. Each quality gate requires a work artifact.",
  ],
  [
    "interview",
    "The junior SQA interview",
    "Nexora Technologies",
    "Complete six interview rounds. Ground your answers in concrete testing decisions and evidence.",
  ],
  [
    "assessment",
    "Prove your junior QA readiness",
    "ShopSphere",
    "Complete an independent 60-minute practical assessment: review requirements, design tests, explore the app, report a defect, investigate API and SQL, and make a release recommendation.",
  ],
  [
    "capstone",
    "Your first week of ownership",
    "RelayDesk",
    "Own QA for an unfamiliar expense platform through a five-day release window. Build a risk strategy, gather evidence across UI, API, SQL and DevTools, validate fixes and automation, repair the pipeline, and give a final recommendation.",
  ],
];
export const campaign: Mission[] = first.map((m, i) => ({
  id: `QA-${String(i + 1).padStart(3, "0")}`,
  kind: m[0],
  title: m[1],
  project: m[2],
  description: m[3],
  xp: 150 + i * 25,
  minutes:
    m[0] === "assessment"
      ? 60
      : m[0] === "capstone"
        ? 2400
        : i === 0
          ? 150
          : 180 + i * 10,
  difficulty: Math.min(5, 1 + Math.floor(i / 3)),
  skill: kindInfo[m[0]].skill,
  seed: 0,
  prerequisite: i > 0 ? `QA-${String(i).padStart(3, "0")}` : undefined,
}));
type PracticeKind = Exclude<MissionKind, "assessment" | "capstone">;
const counts: Record<PracticeKind, number> = {
  manual: 100,
  bughunt: 100,
  testcase: 100,
  requirement: 50,
  sql: 75,
  api: 60,
  devtools: 50,
  automation: 50,
  mobile: 30,
  performance: 25,
  security: 25,
  cicd: 30,
  release: 30,
  sprint: 20,
  incident: 10,
  interview: 150,
};
const variants: Record<PracticeKind, string[]> = {
  manual: [
    "Cart regression",
    "Coupon sanity pass",
    "Checkout smoke test",
    "Payment integration",
    "Clean-build verification",
  ],
  bughunt: [
    "Explore cart state",
    "Investigate account validation",
    "Follow a stale response",
    "Investigate mobile layout",
    "Verify the release candidate",
  ],
  testcase: [
    "Transfer boundaries",
    "Withdrawal boundaries",
    "Bill payment boundaries",
    "Top-up boundaries",
    "Refund boundaries",
  ],
  requirement: [
    "Response-time contract",
    "Session policy",
    "Transfer limits",
    "Error behavior",
    "Account permissions",
  ],
  sql: [
    "Duplicate settled payments",
    "Payment totals by customer",
    "Orders without payments",
    "Largest settled transfers",
    "Failed payment analysis",
  ],
  api: [
    "Profile persistence",
    "Missing authorization",
    "Payment retry behavior",
    "Unknown endpoints",
    "Profile field validation",
  ],
  devtools: [
    "Offline checkout",
    "Slow checkout trace",
    "Session storage audit",
    "Console exception",
    "Request correlation",
  ],
  automation: [
    "Login smoke coverage",
    "Missing assertion",
    "Brittle selector",
    "Hardcoded wait",
    "Dashboard regression",
  ],
  mobile: [
    "Portrait checkout",
    "Landscape checkout",
    "Offline experience",
    "Tablet smoke check",
    "Background and resume",
  ],
  performance: [
    "Flash-sale capacity",
    "Steady-state load",
    "Stress threshold",
    "Recovery workload",
    "Release performance gate",
  ],
  security: [
    "Object authorization",
    "Anonymous profile access",
    "Token validation",
    "Cross-account update",
    "Sensitive response data",
  ],
  cicd: [
    "UI job timeout",
    "Missing wait condition",
    "Regression quality gate",
    "Branch workflow",
    "Failed assertion",
  ],
  release: [
    "Payment release gate",
    "Profile release gate",
    "Mobile release gate",
    "Capacity release gate",
    "Clean-build sign-off",
  ],
  sprint: [
    "Checkout sprint",
    "Identity sprint",
    "Payments sprint",
    "Mobile sprint",
    "Release hardening sprint",
  ],
  incident: [
    "Duplicate payment response",
    "Retry storm containment",
    "Failed checkout triage",
    "Payment recovery",
    "Release rollback",
  ],
  interview: [
    "Risk and prioritization",
    "Evidence and reproduction",
    "API and contract",
    "Database validation",
    "Release ownership",
  ],
};
export const practice: Mission[] = Object.entries(counts).flatMap(
  ([key, count]) =>
    Array.from({ length: count }, (_, i) => {
      const kind = key as PracticeKind;
      const project =
        kind === "sql" || kind === "testcase" || kind === "security"
          ? "FinEdge"
          : "ShopSphere";
      return {
        id: `${key.toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
        title: `${variants[kind][i % 5]} · ${String(Math.floor(i / 5) + 1).padStart(2, "0")}`,
        kind,
        project,
        description: practiceBrief(kind, i),
        xp: 100 + Math.floor(i / 5) * 10,
        minutes: 60 + (i % 5) * 30,
        difficulty: 1 + Math.min(4, Math.floor(i / (count / 5))),
        skill: kindInfo[kind].skill,
        seed: i + 1,
      };
    }),
);
function practiceBrief(kind: PracticeKind, i: number) {
  const briefs: Record<PracticeKind, string> = {
    manual:
      "Verify the current sandbox build against its contract. Record a valid defect or provide a clean-build test record.",
    bughunt:
      "Explore the sandbox without a defect count. Reproduce a finding and send evidence to the developer.",
    testcase: `Design boundary tests for an inclusive range of PKR ${500 + i * 100}–${250000 + i * 1000}. Include each nearest invalid and valid value.`,
    requirement:
      "Identify the ambiguity in the selected specification and ask a measurable, actionable clarification.",
    sql: "Investigate the seeded payment ledger. The SQL workspace contains the exact requested result and live schema.",
    api: "Exercise the request contract, inspect responses, and submit an observation supported by request history.",
    devtools:
      "Reproduce an environment failure, inspect captured traces, and submit the request and status as evidence.",
    automation:
      "Repair and run the login smoke check in the constrained automation simulator.",
    mobile:
      "Exercise device, orientation, and network conditions in the interactive checkout sandbox.",
    performance: `Assess ${5000 + i * 1000} concurrent users against P95 < 2,000 ms and error rate < 1%.`,
    security:
      "Test whether the authenticated user can read or update another account. Preserve response evidence.",
    cicd: "Use the simulated repository and pipeline to repair an unstable UI test and verify the quality gate.",
    release:
      "Inspect this build’s quality gates, choose a release decision, and justify it using customer risk.",
    sprint:
      "Complete ten workdays with requirements, cases, execution, retesting, regression, and release gates.",
    incident:
      "Correlate retry logs and duplicate transactions before recommending containment.",
    interview:
      "Answer a scenario-based interview question. Local rubric feedback identifies missing evidence and next steps.",
  };
  return briefs[kind];
}
export const missions = [...campaign, ...practice];
export const team = [
  { name: "Maya", role: "Senior QA Engineer", initials: "MK", color: "purple" },
  { name: "Hamza", role: "Backend Developer", initials: "HA", color: "blue" },
  { name: "Ayesha", role: "Business Analyst", initials: "AS", color: "orange" },
  { name: "Ali", role: "Product Manager", initials: "AR", color: "green" },
  { name: "Sarah", role: "Frontend Developer", initials: "SK", color: "pink" },
  { name: "Ahmed", role: "DevOps Engineer", initials: "AH", color: "blue" },
  { name: "Fahad", role: "QA Lead", initials: "FK", color: "purple" },
];
export const requirements = [
  {
    text: "A registered user can sign in using a valid email and password.",
    ambiguous: false,
    question: "What is the success path?",
  },
  {
    text: "The login page should load quickly.",
    ambiguous: true,
    question:
      "What maximum response time and network conditions define acceptable performance?",
  },
  {
    text: "Lock the account after too many failed attempts.",
    ambiguous: true,
    question:
      "How many attempts trigger a lock, for how long, and how can the user recover?",
  },
  {
    text: "Show an appropriate error when authentication fails.",
    ambiguous: true,
    question:
      "What exact error should appear, and must it avoid revealing whether an account exists?",
  },
  {
    text: "The password field must mask entered characters.",
    ambiguous: false,
    question: "What does masking mean?",
  },
  {
    text: "Keep the user logged in for a while.",
    ambiguous: true,
    question:
      "What are the idle and absolute session expiry times, and does Remember me change them?",
  },
];
export const interviewTopics = [
  [
    "A developer cannot reproduce your checkout defect. How do you respond?",
    ["environment", "steps", "expected", "actual"],
    "Give a reproducible build, environment, numbered steps, expected and actual behavior.",
  ],
  [
    "You have 30 minutes before release. How do you prioritize testing?",
    ["risk", "critical", "smoke", "release"],
    "Prioritize customer risk, critical paths and smoke tests, then communicate remaining release risk.",
  ],
  [
    "An API returns 200 but the change disappears. What do you investigate?",
    ["get", "persist", "database", "response"],
    "Read the resource again, compare the response and database, and check persistence and caching.",
  ],
  [
    "A customer reports two charges for one order. How do you prove it?",
    ["order", "transaction", "group", "count"],
    "Correlate order IDs and transactions; group and count successful charges before investigating retries.",
  ],
  [
    "Would you release with an unresolved payment defect? Explain your decision.",
    ["block", "impact", "retest", "rollback"],
    "Block on material customer impact; agree a fix, retest, regression scope and rollback plan.",
  ],
  [
    "Your UI check passes locally but flakes in CI. What would you do?",
    ["wait", "trace", "state", "selector"],
    "Inspect traces, wait on observable state, isolate shared state and use stable selectors.",
  ],
];
