"use client";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  GitBranch,
  MessageSquare,
  Play,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  campaign,
  interviewTopics,
  kindInfo,
  missions,
  skills,
  type Skill,
} from "@/lib/content";
import {
  absoluteTime,
  activeMission,
  addEvidence,
  addMessage,
  advance,
  assessText,
  buildProfile,
  readiness,
  reward,
  time,
} from "@/lib/engine";
import {
  Badge,
  Feedback,
  Field,
  SectionHead,
  useGame,
  useWorkDraft,
} from "./game-context";
import { recordWork } from "@/lib/assessments";
import { MissionContext } from "./manual-labs";
export function ReleaseCenter() {
  const { state, setState, navigate } = useGame();
  const m = activeMission(state);
  const [decision, setDecision] = useWorkDraft("release-decision", "");
  const [reason, setReason] = useWorkDraft("release-reason", "");
  const [feedback, setFeedback] = useState("");
  const incident =
    m.kind !== "capstone" &&
    (state.incidentActive || (m.kind === "incident" && !state.completed[m.id]));
  const clean = buildProfile(m) === 4;
  const decisionKey =
    (state.assessment?.status === "running" ? state.assessment.id + ":" : "") +
    (incident ? m.id + "-containment" : m.id);
  const already = state.releaseHistory.includes(decisionKey);
  const gates =
    m.kind === "capstone"
      ? [
          [
            "Execution evidence",
            `${state.evidence.filter((e) => e.assessmentId === state.assessment?.id).length} observations captured`,
            "warn",
          ],
          [
            "Issue tracker",
            `${state.tickets.filter((t) => t.assessmentId === state.assessment?.id && t.status === "Accepted").length} accepted reports`,
            "warn",
          ],
          [
            "Retest candidate",
            state.expenseFixed
              ? "RD-1.0.1 available"
              : "RD-1.0.0 staging build",
            "warn",
          ],
          [
            "Automation gate",
            state.assessment?.artifacts.some((a) => a.area === "Automation")
              ? "Smoke evidence recorded"
              : "No current smoke evidence",
            "warn",
          ],
        ]
      : clean
        ? [
            ["Functional checks", "128 / 128 passed", "pass"],
            ["Open critical defects", "0 outstanding", "pass"],
            ["API & data integrity", "Payment retry contract verified", "pass"],
            ["Performance gate", "P95 940 ms · errors 0.2%", "pass"],
            ["Automation", "24 / 24 passed", "pass"],
          ]
        : [
            ["Functional checks", "124 / 128 passed", "warn"],
            [
              "Open critical defects",
              "Payment retries may create duplicate charges",
              "fail",
            ],
            ["API & data integrity", "Idempotency check failed", "fail"],
            [
              "Performance gate",
              state.performance
                ? `P95 ${state.performance.p95} ms · errors ${state.performance.errors}%`
                : "Target load evidence missing",
              "warn",
            ],
            [
              "Automation",
              state.pipelineFixed
                ? "UI repair available; review pipeline trace"
                : "3 UI checks failed",
              "warn",
            ],
          ];
  function submit() {
    if (already) {
      setFeedback(
        "This release decision is already recorded. Open another release assignment to practice.",
      );
      return;
    }
    if (
      !decision ||
      reason.trim().length < 60 ||
      !/risk|customer|payment|evidence|retest|rollback|monitor|impact|gate/i.test(
        reason,
      )
    ) {
      setFeedback(
        "Fahad: Explain the evidence, customer impact, and the next action in at least 60 characters.",
      );
      return;
    }
    const correct =
      m.kind === "capstone"
        ? decision === "Block release" ||
          (decision === "Conditional release" &&
            state.expenseFixed &&
            !!state.assessment?.artifacts.some(
              (a) => a.area === "Retesting" && a.score >= 70,
            ))
        : incident
          ? ["Rollback", "Disable payment feature"].includes(decision)
          : clean
            ? ["Release", "Conditional release"].includes(decision)
            : decision === "Block release";
    if (incident && correct && !state.incidentInvestigated) {
      setFeedback(
        "Fahad: Correlate the duplicate-charge report with SQL evidence before closing the incident. You can inspect the ledger in SQL Lab.",
      );
      return;
    }
    setState((s) => {
      let n = advance(
        {
          ...s,
          releaseHistory:
            incident && !correct
              ? s.releaseHistory
              : [...s.releaseHistory, decisionKey],
        },
        20,
      );
      if (incident) {
        n = { ...n, incidentActive: !correct };
        if (correct)
          n = {
            ...n,
            achievements: [...new Set([...n.achievements, "Production Saver"])],
          };
      } else if (decision === "Block release") {
        n = { ...n, blocked: n.blocked + 1 };
        if (correct)
          n = {
            ...n,
            achievements: [...new Set([...n.achievements, "Release Guardian"])],
          };
      } else {
        n = { ...n, releases: n.releases + 1 };
        if (m.kind === "capstone" && !correct) {
          n = { ...n, reputation: Math.max(0, n.reputation - 15) };
          n = addMessage(
            n,
            "Fahad",
            "RelayDesk was released without validated controls. Finance has halted claim approval pending your investigation and a retest recommendation.",
          );
        } else if (m.kind !== "capstone" && !clean) {
          n = {
            ...n,
            day: n.day + 1,
            minute: 540,
            incidents: n.incidents + 1,
            incidentActive: true,
            reputation: Math.max(0, n.reputation - 15),
          };
          n = addMessage(
            n,
            "Ahmed",
            "PRODUCTION ALERT: 87 duplicate payments reported after release. Failure rate is 24.7%. Join the release room now.",
          );
        }
      }
      if (correct && (incident ? m.kind === "incident" : m.kind === "release"))
        n = reward(n, m, 95);
      else if (!correct)
        n = { ...n, reputation: Math.max(0, n.reputation - 5) };
      n = recordWork(
        n,
        "Release judgment",
        correct ? 95 : 0,
        `${decision}: ${reason}`,
      );
      return addMessage(
        n,
        "Fahad",
        correct
          ? "Your recommendation follows the evidence. Document the decision and communicate the next gate."
          : "Your decision leaves material risk unresolved. Review the customer impact and plan containment.",
      );
    });
    setFeedback(
      correct
        ? "Decision recorded. Your recommendation is supported by the evidence."
        : m.kind === "capstone"
          ? "Finance halted approvals. The current evidence does not support this release decision."
          : !incident && !clean
            ? "The build shipped. Next morning: 87 duplicate payments. Production incident opened; investigate and contain it."
            : "The decision did not address the primary risk. The team needs a more defensible recommendation.",
    );
  }
  return (
    <>
      <SectionHead
        eyebrow={
          incident ? "ON CALL / INCIDENT COMMAND" : "DELIVERY / RELEASE ROOM"
        }
        title={incident ? "When production needs you" : "Would you ship it?"}
        description={
          incident
            ? "Correlate the signals. Contain customer impact. Make the next decision count."
            : "Your signature means you understand the remaining risk."
        }
      />
      <MissionContext />
      {incident && (
        <div className="incident-banner">
          <AlertTriangle size={23} />
          <div>
            <strong>SEV-1 · Payment integrity incident</strong>
            <p>Failure rate 24.7% · baseline 1.2% · 87 customers affected</p>
          </div>
          <Badge tone="red">ACTIVE INCIDENT</Badge>
        </div>
      )}
      <div className="split-layout">
        <section>
          <div className="panel">
            <div className="panel-heading">
              <h3>
                {incident
                  ? "Incident timeline"
                  : "Release candidate · evidence packet"}
              </h3>
              <Badge>
                {incident
                  ? "INC-0087"
                  : m.kind === "capstone"
                    ? state.expenseFixed
                      ? "RD-1.0.1"
                      : "RD-1.0.0"
                    : "RC 3.2.1"}
              </Badge>
            </div>
            {incident ? (
              <div className="padded">
                <pre className="terminal-output">
                  {
                    "08:42  Deploy payments-service 3.2.1\n08:46  WARN POST /payments timed out after upstream commit\n08:46  INFO client retry order=ORD-1042 attempt=2\n08:47  INFO payment inserted order=ORD-1042 transaction=1003\n08:51  ALERT duplicate charge reports increasing\n09:00  Support: 87 customers affected"
                  }
                </pre>
                <div className="button-row">
                  <button
                    className="button"
                    onClick={() => navigate("SQL Lab")}
                  >
                    Inspect transaction ledger <ArrowUpRight size={14} />
                  </button>
                  <button
                    className="button"
                    onClick={() => navigate("Postman Lab")}
                  >
                    Reproduce retry <ArrowUpRight size={14} />
                  </button>
                </div>
                <p className="small muted">
                  Containment should reduce customer impact while engineering
                  investigates. SQL evidence is required to close this incident.
                </p>
              </div>
            ) : (
              gates.map(([label, result, status]) => (
                <div className="gate-row" key={label}>
                  <span
                    className={
                      status === "pass"
                        ? "green"
                        : status === "fail"
                          ? "red"
                          : "orange"
                    }
                  >
                    {status === "pass" ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </span>
                  <strong>{label}</strong>
                  <span>{result}</span>
                </div>
              ))
            )}
          </div>
          <div className="panel padded">
            <h3>The room is waiting</h3>
            <div className="mentor-note">
              <span className="avatar green">AR</span>
              <div>
                <strong>Ali · Product Manager</strong>
                <p>
                  {incident
                    ? "Customer support needs an update. What can we tell them right now?"
                    : "The campaign launches today. Can we go live, and what risk remains?"}
                </p>
              </div>
            </div>
            <div className="mentor-note">
              <span className="avatar purple">FK</span>
              <div>
                <strong>Fahad · QA Lead</strong>
                <p>
                  Bring a recommendation with evidence, customer impact, and a
                  concrete next action.
                </p>
              </div>
            </div>
          </div>
        </section>
        <aside className="panel padded">
          <span className="eyebrow">YOUR RECOMMENDATION</span>
          <h3>{incident ? "Contain the incident" : "Make the release call"}</h3>
          <Field label="Decision">
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="">Choose a recommendation</option>
              {(incident
                ? [
                    "Monitor",
                    "Hotfix without validation",
                    "Rollback",
                    "Disable payment feature",
                    "Escalate only",
                  ]
                : ["Release", "Conditional release", "Block release"]
              ).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Evidence, impact, and next steps">
            <textarea
              rows={8}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What evidence drives your decision? Who is affected? What must happen next?"
            />
          </Field>
          <button
            className="button primary full"
            onClick={submit}
            disabled={already && !incident}
          >
            {already && !incident
              ? "Decision recorded"
              : "Submit recommendation"}
            <ArrowRight size={15} />
          </button>
          <Feedback text={feedback} />
          <p className="small muted">
            {m.kind === "capstone"
              ? "Include remaining finance risk and the next validation gate in your recommendation."
              : "Shipping a build with a critical payment defect advances to the next workday and opens a production incident."}
          </p>
        </aside>
      </div>
    </>
  );
}
const sprintStages = [
  ["Planning", "Review the scope and publish a standup update."],
  ["Requirements", "Complete a requirements review."],
  ["Test design", "Build at least six test cases."],
  ["Build arrives", "Capture at least four sandbox observations."],
  ["Functional testing", "Get a defect report accepted."],
  ["Bug fixes", "Send a clear developer update."],
  ["Retesting", "Execute API requests to verify persisted behavior."],
  ["Regression", "Run a passing automated smoke test."],
  ["Release candidate", "Make an evidence-based release decision."],
  ["Production", "Publish your final quality summary."],
];
export function SprintRoom() {
  const { state, setState, navigate } = useGame();
  const [summary, setSummary] = useState("");
  const [feedback, setFeedback] = useState("");
  const step = state.sprintStep;
  const gates = [
    state.standupDay > 0,
    Object.keys(state.completed).some(
      (id) => missions.find((m) => m.id === id)?.kind === "requirement",
    ),
    state.cases.length >= 6,
    state.evidence.length >= 4,
    state.valid > 0,
    state.skills.Communication >= 8,
    state.apiCount >= 3,
    state.evidence.some(
      (e) => e.kind === "automation" && e.detail.startsWith("PASS"),
    ),
    state.releaseHistory.length > 0,
    summary.length >= 100 && /risk|evidence|release/i.test(summary),
  ];
  const destinations = [
    "Slack",
    "Requirements",
    "Test Cases",
    "Test Lab",
    "Jira",
    "Slack",
    "Postman Lab",
    "Automation Lab",
    "Release Center",
    "Slack",
  ];
  return (
    <>
      <SectionHead
        eyebrow="AGILE / DELIVERY SIMULATION"
        title="Own the sprint"
        description="Ten workdays. One team. Every quality gate needs real work behind it."
      />
      <MissionContext />
      <div className="sprint-timeline">
        {sprintStages.map(([title], i) => (
          <div
            className={i < step ? "done" : i === step ? "current" : ""}
            key={title}
          >
            <span>{i < step ? <Check size={16} /> : i + 1}</span>
            <small>DAY {i + 1}</small>
            <strong>{title}</strong>
          </div>
        ))}
      </div>
      <div className="split-layout">
        <section className="panel padded">
          <span className="eyebrow">
            {step >= 10 ? "SPRINT COMPLETE" : `SPRINT DAY ${step + 1}`}
          </span>
          <h2>{sprintStages[Math.min(step, 9)][0]}</h2>
          <p>{sprintStages[Math.min(step, 9)][1]}</p>
          <div className="mentor-note">
            <span className="avatar purple">MK</span>
            <p>
              “The work you have already completed stays part of your evidence
              trail. A sprint is how all those individual decisions come
              together.”
            </p>
          </div>
          {step < 10 && (
            <>
              <button
                className="button"
                onClick={() => navigate(destinations[step])}
              >
                Open workspace <ArrowUpRight size={15} />
              </button>
              {step === 9 && (
                <Field label="Final quality summary">
                  <textarea
                    rows={5}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Summarize scope, execution, defects, remaining risk, release recommendation, and follow-up."
                  />
                </Field>
              )}
              <div className="divider" />
              <Badge tone={gates[step] ? "green" : "orange"}>
                {gates[step] ? "Evidence available" : "Quality gate pending"}
              </Badge>
              <button
                className="button primary"
                onClick={() => {
                  if (!gates[step]) {
                    setFeedback(
                      "Complete the required work in the linked workspace before advancing this quality gate.",
                    );
                    return;
                  }
                  setState((s) => {
                    let n = {
                      ...s,
                      sprintStep: s.sprintStep + 1,
                      day: s.day + 1,
                      minute: 540,
                    };
                    n = addMessage(
                      n,
                      "Ali",
                      step === 3
                        ? "Mid-sprint update: mobile checkout is now in scope. Include responsive coverage before release."
                        : `Sprint day ${step + 1} gate accepted. Next: ${sprintStages[Math.min(step + 1, 9)][0]}.`,
                    );
                    if (step === 9 && activeMission(s).kind === "sprint")
                      n = reward(n, activeMission(s), 95);
                    return n;
                  });
                  setFeedback(
                    "Day closed. Work artifacts recorded and the next quality gate is open.",
                  );
                }}
              >
                Close day & advance <ArrowRight size={15} />
              </button>
            </>
          )}
          {step >= 10 && (
            <button
              className="button"
              onClick={() => {
                setState((s) => ({
                  ...s,
                  sprintStep: 0,
                  startedAt: absoluteTime(s),
                  hintCount: 0,
                }));
                setSummary("");
                setFeedback(
                  "A new sprint is open. Existing career artifacts remain available for review.",
                );
              }}
            >
              Start another sprint <ArrowRight size={15} />
            </button>
          )}
          <Feedback text={feedback} />
        </section>
        <aside className="panel padded">
          <h3>Sprint evidence</h3>
          {sprintStages.map(([title], i) => (
            <p className="check-line" key={title}>
              <Check size={15} className={gates[i] ? "green" : "muted"} />
              {title}
              <span className="muted small">
                {gates[i] ? "Ready" : "Pending"}
              </span>
            </p>
          ))}
        </aside>
      </div>
    </>
  );
}
export function InterviewArena() {
  const { state, setState } = useGame();
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState<number[]>([]);
  const [followup, setFollowup] = useState(false);
  const m = activeMission(state);
  const index = m.seed ? (m.seed - 1 + round) % interviewTopics.length : round;
  const topic = interviewTopics[Math.min(index, 5)];
  const roles = [
    "HR & communication",
    "Risk prioritization",
    "API investigation",
    "SQL round",
    "Release judgment",
    "Practical automation",
  ];
  const context = m.seed
    ? `Scenario ${m.seed}: ${["a mobile commerce launch", "a banking release", "an identity migration", "a flash sale", "a new checkout integration"][m.seed % 5]} at ${["a startup", "a regulated product team", "an enterprise vendor"][Math.floor(m.seed / 5) % 3]}.`
    : "";
  function submit() {
    if (answer.trim().length < 40) {
      setFeedback(
        "Please give a concrete answer of at least 40 characters. This is a working scenario, not a definition check.",
      );
      return;
    }
    const result = assessText(answer, topic[1] as string[]);
    if (result.score < 60 && !followup) {
      setFeedback(
        `Follow-up: Your answer needs more detail about ${result.missing.slice(0, 2).join(" and ")}. Explain the specific evidence or action you would use.`,
      );
      setFollowup(true);
      return;
    }
    const next = [...scores, result.score];
    setScores(next);
    setFeedback(
      `${result.score}/100 — ${topic[2]} ${result.missing.length ? `Consider: ${result.missing.join(", ")}.` : "You covered the main decision points."}`,
    );
    setState((s) => ({
      ...advance(s, 10),
      interviewScores: [...s.interviewScores, result.score],
    }));
    if (round === 5) {
      const average = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
      if (average >= 65 && m.kind === "interview")
        setState((s) => reward(s, m, average));
    }
    setRound(round + 1);
    setAnswer("");
    setFollowup(false);
  }
  return (
    <>
      <SectionHead
        eyebrow="INTERVIEW ARENA / CAREER BOSS BATTLE"
        title="You’ve done the work. Tell the story."
        description="Six practical rounds. Evidence-driven answers. A chance to show your judgment."
      />
      <MissionContext />
      <div className="interview-progress">
        {roles.map((r, i) => (
          <div
            key={r}
            className={i === round ? "current" : i < round ? "done" : ""}
          >
            <span>{i < round ? <Check size={14} /> : i + 1}</span>
            {r}
          </div>
        ))}
      </div>
      {round < 6 ? (
        <div className="split-layout">
          <section className="panel padded interview-question">
            <span className="eyebrow">
              ROUND {round + 1} / {roles[round].toUpperCase()}
            </span>
            <div className="person-line">
              <span className="avatar purple">FK</span>
              <div>
                <strong>Fahad Khan</strong>
                <small>QA Lead · Interviewer</small>
              </div>
            </div>
            {context && <p className="muted">{context}</p>}
            <h2>{String(topic[0])}</h2>
            <Field label="Your answer">
              <textarea
                rows={9}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Explain your reasoning, the evidence you would gather, and the action you would take."
              />
            </Field>
            <button className="button primary" onClick={submit}>
              {followup ? "Answer follow-up" : "Submit answer"}
              <ArrowRight size={15} />
            </button>
            <Feedback text={feedback} />
          </section>
          <aside className="panel padded">
            <h3>Show how you think.</h3>
            <p>
              Use the work you have done in this simulator. Describe a concrete
              condition, the risk, and what you would do next.
            </p>
            <div className="interview-score">
              <span>
                {scores.length
                  ? Math.round(
                      scores.reduce((a, b) => a + b, 0) / scores.length,
                    )
                  : "—"}
              </span>
              <small>RUNNING SCORE</small>
            </div>
            <p className="small muted">
              Feedback uses a local keyword-and-detail rubric, not an AI
              interviewer or a hiring prediction.
            </p>
          </aside>
        </div>
      ) : (
        <section className="panel assessment-result">
          <Trophy size={42} />
          <span className="eyebrow">ASSESSMENT COMPLETE</span>
          <h2>{Math.round(scores.reduce((a, b) => a + b, 0) / 6)} / 100</h2>
          <p>
            {scores.reduce((a, b) => a + b, 0) / 6 >= 65
              ? "You explained the main risks and decisions. Keep strengthening your weaker rounds."
              : "Keep practicing concrete investigation steps and evidence before your next assessment."}
          </p>
          <div className="score-breakdown">
            {roles.map((r, i) => (
              <span key={r}>
                {r}
                <strong>{scores[i]}</strong>
              </span>
            ))}
          </div>
          <Feedback text={feedback} />
          <button
            className="button"
            onClick={() => {
              setRound(0);
              setScores([]);
              setFeedback("");
            }}
          >
            Practice another interview
          </button>
        </section>
      )}
    </>
  );
}
const skillKeywords: Record<string, Skill> = {
  manual: "Manual QA",
  regression: "Manual QA",
  "test case": "Test design",
  boundary: "Test design",
  requirement: "Requirements",
  postman: "API",
  rest: "API",
  api: "API",
  sql: "SQL",
  database: "SQL",
  devtools: "DevTools",
  playwright: "Automation",
  selenium: "Automation",
  cypress: "Automation",
  appium: "Mobile",
  mobile: "Mobile",
  jmeter: "Performance",
  k6: "Performance",
  performance: "Performance",
  security: "Security",
  git: "CI/CD",
  jenkins: "CI/CD",
  pipeline: "CI/CD",
  "ci/cd": "CI/CD",
  release: "Release judgment",
  communication: "Communication",
  agile: "Communication",
};
export function JobBoard() {
  const { state, setState, navigate } = useGame();
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<{
    required: Skill[];
    preferred: Skill[];
    tools: string[];
    experience: string;
  } | null>(null);
  const jobs = [
    {
      title: "Junior SQA Engineer",
      company: "Vertex Labs · Karachi",
      salary: "PKR 60k–90k",
      skills: [
        "Manual QA",
        "Test design",
        "API",
        "SQL",
        "Communication",
      ] as Skill[],
    },
    {
      title: "QA Automation Engineer",
      company: "Cloudline Systems · Hybrid",
      salary: "PKR 120k–180k",
      skills: ["Automation", "API", "CI/CD", "SQL"] as Skill[],
    },
    {
      title: "FinTech Quality Engineer",
      company: "Aster Digital · Karachi",
      salary: "PKR 100k–160k",
      skills: ["Security", "SQL", "API", "Release judgment"] as Skill[],
    },
  ];
  function analyze() {
    const lines = description.toLowerCase().split(/[\n.!;]/);
    const required = new Set<Skill>(),
      preferred = new Set<Skill>(),
      tools = new Set<string>();
    for (const line of lines)
      for (const [word, skill] of Object.entries(skillKeywords))
        if (
          new RegExp(
            `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i",
          ).test(line)
        ) {
          (/preferred|nice to have|bonus|plus/.test(line)
            ? preferred
            : required
          ).add(skill);
          tools.add(word);
        }
    setAnalysis({
      required: [...required],
      preferred: [...preferred].filter((s) => !required.has(s)),
      tools: [...tools],
      experience:
        description.match(/\d+\s*(?:[-–]\s*\d+|\+)?\s*years?/i)?.[0] ||
        "Not specified",
    });
  }
  function train(skill: Skill) {
    const mission =
      missions.find((m) => m.skill === skill && !state.completed[m.id]) ||
      missions.find((m) => m.skill === skill)!;
    setState((s) => ({
      ...s,
      active: mission.id,
      startedAt: absoluteTime(s),
      hintCount: 0,
    }));
    navigate(kindInfo[mission.kind].view);
  }
  return (
    <>
      <SectionHead
        eyebrow="CAREER / OPPORTUNITIES"
        title="See where your skills can take you"
        description="Compare a role with evidence from your career. Then close the gaps."
      />
      <div className="job-grid">
        {jobs.map((job) => {
          const match = Math.round(
            job.skills.reduce((a, b) => a + state.skills[b], 0) /
              job.skills.length,
          );
          return (
            <section className="panel job-card" key={job.title}>
              <span className="job-company">
                <BriefcaseBusiness size={22} />
                <Badge>Fictional role</Badge>
              </span>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <p className="small muted">
                {job.salary} · simulated salary range
              </p>
              <div className="job-match">
                <strong>{match}%</strong>
                <span>skill match</span>
              </div>
              <div className="skill-tags">
                {job.skills.map((s) => (
                  <Badge
                    key={s}
                    tone={state.skills[s] >= 60 ? "green" : "neutral"}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
              <button
                className="button full"
                onClick={() =>
                  train(
                    job.skills.find((s) => state.skills[s] < 60) ||
                      job.skills[0],
                  )
                }
              >
                Train missing skills <ArrowRight size={14} />
              </button>
              <button
                className="text-button"
                onClick={() => navigate("Interview Arena")}
              >
                Start mock interview <ArrowUpRight size={14} />
              </button>
            </section>
          );
        })}
      </div>
      <div className="split-layout">
        <section className="panel padded">
          <span className="eyebrow">BRING YOUR OWN OPPORTUNITY</span>
          <h3>Job description analyzer</h3>
          <p>
            Paste an SQA job description to map its requirements to your earned
            skills.
          </p>
          <Field label="Job description">
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the responsibilities, requirements, and preferred skills here…"
            />
          </Field>
          <button
            className="button primary"
            onClick={analyze}
            disabled={description.trim().length < 20}
          >
            Analyze skill match <ArrowRight size={15} />
          </button>
          <p className="small muted">
            Local keyword extraction. No text leaves your browser. Salary
            examples are fictional, not market estimates.
          </p>
        </section>
        <aside className="panel padded">
          <h3>Your match report</h3>
          {analysis ? (
            <>
              <p>Experience: {analysis.experience}</p>
              <h4>Required skills</h4>
              {analysis.required.length ? (
                analysis.required.map((s) => (
                  <div className="match-row" key={s}>
                    <span>{s}</span>
                    <strong>{state.skills[s]}%</strong>
                    <button className="text-button" onClick={() => train(s)}>
                      Train <ArrowUpRight size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted">
                  No recognized required skills. Try a more detailed
                  description.
                </p>
              )}
              <h4>Preferred skills</h4>
              <p>{analysis.preferred.join(", ") || "None identified"}</p>
              <h4>Recognized terms</h4>
              <p className="muted">
                {analysis.tools.join(", ") || "No recognized terms"}
              </p>
              <h4>Likely interview focus</h4>
              <p>
                Be ready to describe a concrete investigation using{" "}
                {analysis.required.slice(0, 3).join(", ") || "the listed tools"}
                , including evidence, customer risk, and the resulting decision.
              </p>
            </>
          ) : (
            <div className="empty-state">
              <FileText size={28} />
              <p>Your analysis appears here.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
