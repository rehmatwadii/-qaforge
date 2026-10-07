"use client";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Download,
  FileText,
  ShieldCheck,
  Square,
  Users,
  X,
} from "lucide-react";
import {
  abandonAssessment,
  assessmentAreas,
  capstoneAreas,
  finishAssessment,
  requestExpenseFix,
  startAssessment,
} from "@/lib/assessments";
import { type WorkArea } from "@/lib/engine";
import { Badge, Field, SectionHead, useGame } from "./game-context";
const workspaces: Record<WorkArea, string> = {
  Requirements: "Requirements",
  "Test design": "Test Cases",
  Exploration: "Test Lab",
  "Bug reporting": "Jira",
  API: "Postman Lab",
  SQL: "SQL Lab",
  DevTools: "DevTools",
  Communication: "Slack",
  Retesting: "Postman Lab",
  Automation: "Automation Lab",
  "CI/CD": "CI/CD",
  "Release judgment": "Release Center",
};
const objectives: Record<WorkArea, string> = {
  Requirements: "Review ambiguity and send a testable clarification.",
  "Test design": "Design and submit a boundary suite against the contract.",
  Exploration: "Exercise distinct paths and capture observed behavior.",
  "Bug reporting":
    "Submit an evidence-backed, reproducible report with appropriate severity.",
  API: "Exercise a request sequence and submit an investigation conclusion.",
  SQL: "Validate the investigation target against the current ledger.",
  DevTools: "Correlate an observed failure with its request and status.",
  Communication: "Send a concrete team update with evidence and next steps.",
  Retesting:
    "Verify the fix candidate against reported risks and rejected invalid input.",
  Automation: "Execute a passing smoke check against the assigned product.",
  "CI/CD": "Repair the failed job, branch, commit, push, and rerun.",
  "Release judgment":
    "Submit a reasoned decision supported by current evidence.",
};
export default function Assessments() {
  const { state, setState, navigate, toast } = useGame();
  const run = state.assessment;
  const ongoing = !!run && ["running", "expired"].includes(run.status);
  const areas = run?.mode === "capstone" ? capstoneAreas : assessmentAreas;
  function start(mode: "assessment" | "capstone") {
    setState((s) => startAssessment(s, mode));
  }
  function report() {
    if (!run) return;
    const body = `# QAForge ${run.mode === "capstone" ? "Career capstone" : "Practical assessment"}\n\nPlayer: ${state.name}\nAttempt: ${run.id}\nStatus: ${run.status}\nTime: ${run.elapsed}/${run.budget} simulated minutes\nScore: ${run.score ?? "Pending"}/100\n\n## Strategy\n${run.strategy || "Not supplied"}\n\n## Work artifacts\n${run.artifacts.map((a) => `- ${a.area}: ${a.score}/100 at ${a.elapsed}m\n  ${a.detail}`).join("\n")}\n\n## Final QA report\n${run.summary || "Not supplied"}\n\n## Reviewer feedback\n${run.feedback || "Not submitted"}\n\nEvaluated by a deterministic simulator rubric.\n`;
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `qaforge-${run.mode}-report.md`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <SectionHead
        title="Practical assessment desk"
        description="Prove your judgment with work produced across the QA workstation."
      >
        {run && (
          <button className="button" onClick={report}>
            <Download size={15} />
            Export work report
          </button>
        )}
      </SectionHead>
      {!ongoing && (
        <section className="panel assessment-options">
          <div>
            <div>
              <h2>Junior SQA hiring test</h2>
              <p>ShopSphere · 60 simulated minutes · seven work areas</p>
              <p>
                Complete requirements, test design, exploration, reporting, API,
                SQL, and release work in a fresh attempt. Action times are
                compressed for the assessment.
              </p>
            </div>
            <button
              className="button primary"
              onClick={() => start("assessment")}
            >
              Start hiring assessment <ArrowRight size={15} />
            </button>
          </div>
          <div>
            <div>
              <h2>Your first week of ownership</h2>
              <p>RelayDesk · five workdays · twelve work areas</p>
              <p>
                Take an unfamiliar expense platform from risk analysis to a
                defensible QA recommendation. Verify the fix candidate,
                regression, and delivery pipeline.
              </p>
              {!state.completed["QA-016"] && (
                <p className="assessment-unlock">
                  Pass the practical hiring assessment to unlock this
                  assignment.
                </p>
              )}
            </div>
            <button
              className="button"
              disabled={!state.completed["QA-016"]}
              onClick={() => start("capstone")}
            >
              Start career capstone <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}
      {run && (
        <>
          <div
            className={`assessment-clock ${run.status === "expired" ? "expired" : ""}`}
          >
            <div>
              <Clock size={18} />
              <strong>
                {run.mode === "capstone"
                  ? "RelayDesk · first week of ownership"
                  : "ShopSphere · junior hiring test"}
              </strong>
              <Badge
                tone={
                  run.status === "running"
                    ? "lime"
                    : run.status === "submitted"
                      ? "blue"
                      : "orange"
                }
              >
                {run.status}
              </Badge>
            </div>
            <span>
              {Math.max(0, run.budget - run.elapsed)} min remaining{" "}
              <small>of {run.budget} simulated minutes</small>
            </span>
          </div>
          <div className="assessment-layout">
            <section className="panel assessment-checklist">
              <div className="panel-heading">
                <h3>Work packet</h3>
                <span className="small muted">
                  Fresh artifacts from this attempt
                </span>
              </div>
              {areas.map((area) => {
                const artifact = run.artifacts.find((a) => a.area === area);
                return (
                  <div className="assessment-work-row" key={area}>
                    <span
                      className={
                        artifact && artifact.score >= 70 ? "green" : "muted"
                      }
                    >
                      {artifact && artifact.score >= 70 ? (
                        <Check size={16} />
                      ) : (
                        <Square size={15} />
                      )}
                    </span>
                    <div>
                      <strong>{area}</strong>
                      <p>{objectives[area]}</p>
                      {artifact && (
                        <small>
                          {artifact.score}/100 · recorded at {artifact.elapsed}{" "}
                          min
                        </small>
                      )}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate(workspaces[area])}
                    >
                      Open <ArrowUpRight size={14} />
                    </button>
                  </div>
                );
              })}
              {run.feedback && (
                <div className="assessment-result-feedback" role="status">
                  <h3>
                    {state.completed[run.missionId] && run.score !== null
                      ? "Work reviewed"
                      : "Reviewer feedback"}
                    {run.score !== null && <span>{run.score}/100</span>}
                  </h3>
                  <p>{run.feedback}</p>
                </div>
              )}
            </section>
            <aside>
              <section className="panel padded">
                <h3>Assignment brief</h3>
                <p>
                  {run.mode === "capstone"
                    ? "An employee expense system is ready for its first release. Test identity 123 submits claims; a separate finance approver must approve them. Claims accept PKR 500–50,000. Dashboard totals must match pending ledger rows."
                    : "Investigate the staging commerce product. Use its contract to design tests, prove a finding, validate persisted state, and advise the release team."}
                </p>
                <p className="small muted">
                  Only work captured after this attempt began counts. Drafts and
                  progress survive navigation and reload. The clock advances
                  when you perform work.
                </p>
                {run.status === "expired" && (
                  <p className="assessment-unlock">
                    Time expired. Further work cannot add assessment credit.
                    Submit the report for feedback or abandon this attempt.
                  </p>
                )}
              </section>
              {run.mode === "capstone" && (
                <section className="panel padded">
                  <h3>Risk strategy</h3>
                  <Field label="Testing strategy">
                    <textarea
                      rows={5}
                      value={run.strategy}
                      disabled={!ongoing}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          assessment: s.assessment
                            ? { ...s.assessment, strategy: e.target.value }
                            : null,
                        }))
                      }
                      placeholder="Identify customer risks, prioritize coverage, and explain your approach to cross-tool validation."
                    />
                  </Field>
                  <h3>Engineering handoff</h3>
                  <p className="small muted">
                    After a critical defect is accepted, request the fix
                    candidate. Then reproduce the original paths on the updated
                    build before giving your final recommendation.
                  </p>
                  <button
                    className="button full"
                    disabled={run.status !== "running" || state.expenseFixed}
                    onClick={() => {
                      const next = requestExpenseFix(state);
                      setState(next);
                      toast(
                        next.expenseFixed
                          ? "Engineering update received in Slack."
                          : next.lastFeedback,
                      );
                    }}
                  >
                    {state.expenseFixed
                      ? "RD-1.0.1 available"
                      : "Request fix candidate"}
                  </button>
                </section>
              )}
              <section className="panel padded">
                <h3>Final QA report</h3>
                <Field label="Quality summary and recommendation">
                  <textarea
                    rows={8}
                    value={run.summary}
                    disabled={!ongoing}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        assessment: s.assessment
                          ? { ...s.assessment, summary: e.target.value }
                          : null,
                      }))
                    }
                    placeholder="Summarize scope, evidence, customer impact, remaining risks, release recommendation, and follow-up work."
                  />
                </Field>
                <p className="small muted">
                  Pass threshold: 75/100, at least 70 in every required work
                  area, a complete report, and submission within the time
                  budget.
                </p>
                <button
                  className="button primary full"
                  disabled={!ongoing}
                  onClick={() => setState(finishAssessment)}
                >
                  Submit assessment <ArrowRight size={15} />
                </button>
                {ongoing && (
                  <button
                    className="text-button assessment-abandon"
                    onClick={() => setState(abandonAssessment)}
                  >
                    Abandon attempt
                  </button>
                )}
              </section>
            </aside>
          </div>
        </>
      )}
      {!run && (
        <div className="assessment-empty">
          <FileText size={20} />
          <p>
            Your reviewed artifacts and final report will appear here after an
            attempt begins.
          </p>
        </div>
      )}
      {state.assessmentHistory.length > 0 && (
        <section className="panel padded">
          <h3>Previous attempts</h3>
          <table>
            <thead>
              <tr>
                <th>ASSIGNMENT</th>
                <th>STATUS</th>
                <th>SCORE</th>
                <th>TIME USED</th>
              </tr>
            </thead>
            <tbody>
              {state.assessmentHistory.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.mode === "capstone"
                      ? "RelayDesk ownership"
                      : "Junior hiring test"}
                  </td>
                  <td>{r.status}</td>
                  <td>{r.score ?? "—"}</td>
                  <td>
                    {r.elapsed} / {r.budget} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
