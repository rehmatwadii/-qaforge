"use client";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Database,
  GitBranch,
  Play,
  Plus,
  Terminal,
  X,
} from "lucide-react";
import {
  activeMission,
  addEvidence,
  addMessage,
  advance,
  buildName,
  performance,
  reward,
} from "@/lib/engine";
import {
  automationStarter,
  runAutomation,
  simulateApi,
  sqlTargets,
} from "@/lib/simulations";
import {
  Badge,
  Feedback,
  Field,
  SectionHead,
  useGame,
  useWorkDraft,
} from "./game-context";
import { recordWork, expenseBuild } from "@/lib/assessments";
import { MissionContext } from "./manual-labs";
import CodeEditor from "./CodeEditor";
export function ApiLab() {
  const { state, setState, toast } = useGame();
  const [method, setMethod] = useWorkDraft("api-method", "GET");
  const [endpoint, setEndpoint] = useWorkDraft(
    "api-endpoint",
    activeMission(state).kind === "capstone" ? "/api/expenses" : "/api/profile",
  );
  const [token, setToken] = useWorkDraft("api-token", "nexora-test-token");
  const [body, setBody] = useWorkDraft(
    "api-body",
    activeMission(state).kind === "capstone"
      ? '{"amount":12500,"category":"Travel"}'
      : '{\n  "name": "Alex Morgan"\n}',
  );
  const [headers, setHeaders] = useWorkDraft(
    "api-headers",
    '{\n  "Content-Type": "application/json"\n}',
  );
  const [tab, setTab] = useState("Body");
  const [response, setResponse] = useState<{
    status: number;
    data: unknown;
    duration: number;
  } | null>(null);
  const [observation, setObservation] = useWorkDraft("api-conclusion", "");
  const [feedback, setFeedback] = useState("");
  const m = activeMission(state);
  function send() {
    const result = simulateApi(state, {
      method,
      endpoint,
      token,
      body,
      headers,
    });
    setState(result.state);
    setResponse(result);
  }
  function submit() {
    const relevant = state.evidence.filter(
      (e) =>
        e.detail.includes(`build ${buildName(m)}`) &&
        (!state.assessment ||
          state.assessment.status !== "running" ||
          e.assessmentId === state.assessment.id),
    );
    const variant = m.seed ? (m.seed - 1) % 5 : 0;
    const hasStatus = (code: number) =>
      relevant.some((e) => e.detail.includes(`→ ${code}`));
    let found = false;
    if (m.kind === "security")
      found =
        m.seed === 0 || variant === 0 || variant === 3
          ? relevant.some((e) => e.kind === "idor")
          : variant === 4
            ? hasStatus(403)
            : hasStatus(401);
    else
      found =
        variant === 0
          ? relevant.some((e) => e.kind === "profile")
          : variant === 1
            ? hasStatus(401)
            : variant === 2
              ? relevant.some((e) => e.kind === "duplicate")
              : variant === 3
                ? hasStatus(404)
                : hasStatus(422) && hasStatus(200);
    if (m.kind === "capstone")
      found = state.evidence.some(
        (e) =>
          e.assessmentId === state.assessment?.id &&
          e.detail.includes("/api/expenses/") &&
          e.detail.includes("→ 200"),
      );
    const good =
      observation.length >= 50 &&
      /expected|actual|persist|unauthor|other|124|retri|duplicate|contract|forbid|200|403|401|404|422/i.test(
        observation,
      );
    if (found && good) {
      setFeedback(
        "Maya: Your request sequence and observation support the finding. Record customer impact in your report.",
      );
      if (["api", "security"].includes(m.kind))
        setState((s) => reward(s, m, 95));
      else
        setState((s) => {
          let n = recordWork(s, "API", 95, observation);
          if (
            m.kind === "capstone" &&
            s.expenseFixed &&
            s.evidence.some(
              (e) =>
                e.assessmentId === s.assessment?.id &&
                e.kind === "expense-authorization" &&
                e.detail.includes("→ 403"),
            ) &&
            s.evidence.some(
              (e) =>
                e.assessmentId === s.assessment?.id &&
                e.kind === "expense-validation" &&
                e.detail.includes("RD-1.0.1"),
            )
          )
            n = recordWork(n, "Retesting", 95, observation);
          return n;
        });
    } else
      setFeedback(
        "Maya: Capture a request sequence for this assignment and describe the expected contract, actual response, and customer risk. Check the active mission objective.",
      );
  }
  return (
    <>
      <SectionHead
        eyebrow="POSTMAN LAB / LOCAL API SIMULATOR"
        title="Follow the request"
        description="Send a request. Inspect the response. Verify the state behind it."
      />
      <MissionContext />
      <div className="api-layout">
        <aside className="panel collection">
          <div className="panel-heading">
            <h3>Collections</h3>
            <Badge>2</Badge>
          </div>
          <p className="collection-title">
            {m.kind === "capstone" ? "RelayDesk API" : "ShopSphere API"}{" "}
            <Badge>
              {m.kind === "capstone" ? expenseBuild(state) : "v3.2"}
            </Badge>
          </p>
          {(m.kind === "capstone"
            ? [
                ["GET", "/api/expenses"],
                ["POST", "/api/expenses"],
                ["POST", "/api/expenses/701/approve"],
                ["GET", "/api/health"],
              ]
            : [
                ["GET", "/api/profile"],
                ["PUT", "/api/profile"],
                ["PATCH", "/api/profile"],
                ["GET", "/api/profile/124"],
                ["POST", "/api/payments"],
                ["GET", "/api/payments"],
                ["GET", "/api/health"],
              ]
          ).map(([verb, path], i) => (
            <button
              key={i}
              className={endpoint === path && method === verb ? "selected" : ""}
              onClick={() => {
                setEndpoint(path);
                setMethod(verb);
                if (path.startsWith("/api/expenses"))
                  setBody('{"amount":12500,"category":"Travel"}');
                else if (path === "/api/payments")
                  setBody('{\n  "order_id": "ORD-1046",\n  "amount": 5000\n}');
                else setBody('{\n  "name": "Alex Updated"\n}');
              }}
            >
              <b className={verb === "GET" ? "green" : "orange"}>{verb}</b>
              <span>{path}</span>
            </button>
          ))}
          <div className="padded">
            <h4>API contract</h4>
            <p className="small muted">
              {m.kind === "capstone"
                ? "Bearer token identifies employee 123. Claims must stay within the amount range and require a separate approver."
                : "Bearer token identifies user 123. Profile writes persist."}
              {m.kind !== "capstone" &&
                "Cross-account reads return 403. Repeated payments for the same order must not charge again."}
            </p>
          </div>
        </aside>
        <section>
          <div className="panel api-workspace">
            <div className="request-bar">
              <select
                aria-label="HTTP method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <input
                aria-label="API endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
              <button className="button primary" onClick={send}>
                Send <ArrowRight size={15} />
              </button>
            </div>
            <div className="tabs underlined">
              {["Body", "Authorization", "Headers"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "selected" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="padded">
              {tab === "Body" ? (
                <CodeEditor
                  language="json"
                  height={180}
                  value={body}
                  onChange={setBody}
                />
              ) : tab === "Headers" ? (
                <CodeEditor
                  language="json"
                  height={180}
                  value={headers}
                  onChange={setHeaders}
                />
              ) : (
                <Field label="Bearer token">
                  <input
                    aria-label="Bearer token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </Field>
              )}
            </div>
            <div className="response-head">
              <h4>Response</h4>
              {response && (
                <span>
                  <Badge tone={response.status < 300 ? "green" : "orange"}>
                    {response.status}
                  </Badge>
                  <span>{response.duration} ms</span>
                  <span>{JSON.stringify(response.data).length} B</span>
                </span>
              )}
            </div>
            <pre className="response-body">
              {response
                ? JSON.stringify(response.data, null, 2)
                : "Send a request to see the response."}
            </pre>
          </div>
          <section className="panel padded">
            <Field label="Investigation conclusion">
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="What did your request sequence prove? Compare the expected contract with the actual response."
              />
            </Field>
            <button className="button" onClick={submit}>
              Submit API investigation
            </button>
            <Feedback text={feedback} />
          </section>
        </section>
      </div>
      <section className="panel padded">
        <h3>
          Request history <Badge>{state.apiCount}</Badge>
        </h3>
        {state.apiHistory.slice(0, 5).map((h, i) => (
          <pre className="history-line" key={i}>
            {h}
          </pre>
        ))}
      </section>
    </>
  );
}
type SqlResult = { columns: string[]; values: (string | number | null)[][] };
export function SqlLab() {
  const { state, setState } = useGame();
  const m = activeMission(state);
  const target =
    m.kind === "capstone"
      ? {
          title: "Validate pending expense totals for each requester.",
          hint: "Return requester_id and total pending amount grouped by requester.",
          query:
            "SELECT requester_id, SUM(amount) FROM expenses WHERE status = 'pending' GROUP BY requester_id",
        }
      : sqlTargets[m.seed ? (m.seed - 1) % 5 : 0];
  const [query, setQuery] = useWorkDraft(
    "sql-query",
    m.kind === "capstone"
      ? "SELECT * FROM expenses;"
      : "SELECT *\nFROM transactions;",
  );
  const [results, setResults] = useState<SqlResult[]>([]);
  const [feedback, setFeedback] = useState("");
  const [running, setRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      workerRef.current?.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );
  function run() {
    setRunning(true);
    setFeedback("");
    const worker = new Worker("/sql-worker.js");
    workerRef.current = worker;
    timeoutRef.current = setTimeout(() => {
      worker.terminate();
      setRunning(false);
      setFeedback(
        "Query exceeded the 5-second sandbox limit. Narrow the dataset or simplify the query.",
      );
    }, 5000);
    worker.onmessage = (e) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      worker.terminate();
      setRunning(false);
      if (e.data.error) {
        setFeedback(e.data.error);
        return;
      }
      setResults(e.data.results);
      setFeedback(
        e.data.correct
          ? "Result verified against the investigation target. SQL evidence accepted."
          : "Query executed. Compare the result with the investigation target.",
      );
      setState((s) => {
        let n = addEvidence(
          { ...advance(s, 8), sqlCount: s.sqlCount + 1 },
          "sql",
          `${query}\n${JSON.stringify(e.data.results)} · build ${m.kind === "capstone" ? expenseBuild(s) : buildName(m)}`,
        );
        if (e.data.correct) {
          n = recordWork(n, "SQL", 100, query);
          n = {
            ...n,
            sqlSolved: [...new Set([...n.sqlSolved, m.id])],
            incidentInvestigated:
              target === sqlTargets[0] || n.incidentInvestigated,
          };
          if (m.kind === "sql") n = reward(n, m, 100);
        }
        return n;
      });
    };
    worker.onerror = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      worker.terminate();
      setRunning(false);
      setFeedback(
        "The SQL engine could not start. Reload the workspace and try again.",
      );
    };
    worker.postMessage({
      query,
      target: target.query,
      transactions: state.transactions,
      expenses: state.expenses,
    });
  }
  return (
    <>
      <SectionHead
        eyebrow="SQL LAB / READ-ONLY INVESTIGATION"
        title="The data tells a story"
        description="Query a real SQLite engine, safely isolated inside your browser."
      />
      <MissionContext />
      <div className="info-banner">
        <Database size={18} />
        <span>
          <strong>{target.title}</strong> {target.hint}
        </span>
      </div>
      <div className="api-layout">
        <aside className="panel collection">
          <div className="panel-heading">
            <h3>nexora_staging</h3>
          </div>
          {[
            ...(m.kind === "capstone"
              ? [
                  {
                    table: "expenses",
                    columns: [
                      "id INTEGER",
                      "requester_id INTEGER",
                      "amount REAL",
                      "category TEXT",
                      "status TEXT",
                    ],
                  },
                ]
              : []),
            {
              table: "transactions",
              columns: [
                "id INTEGER",
                "order_id TEXT",
                "customer_id INTEGER",
                "amount REAL",
                "status TEXT",
              ],
            },
            {
              table: "customers",
              columns: ["id INTEGER", "name TEXT", "balance REAL"],
            },
            {
              table: "orders",
              columns: ["order_id TEXT", "customer_id INTEGER", "total REAL"],
            },
          ].map((t) => (
            <div className="schema" key={t.table}>
              <button onClick={() => setQuery(`SELECT * FROM ${t.table};`)}>
                <Database size={14} />
                {t.table}
              </button>
              {t.columns.map((c) => (
                <small key={c}>{c}</small>
              ))}
            </div>
          ))}
          <p className="padded small muted">
            SELECT, joins, aggregates, subqueries, and CTEs are supported.
            Tables include current API payment activity.
          </p>
        </aside>
        <section className="panel">
          <div className="editor-tab">
            <span>
              <Code2 size={14} />
              investigation.sql
            </span>
            <Badge tone="green">Connected</Badge>
          </div>
          <CodeEditor
            language="sql"
            height={260}
            value={query}
            onChange={setQuery}
          />
          <div className="editor-actions">
            <span className="muted small">
              SQLite · isolated worker · 5s timeout
            </span>
            <button className="button primary" onClick={run} disabled={running}>
              <Play size={14} />
              {running ? "Running…" : "Run query"}
            </button>
          </div>
          <div className="results-heading">
            <h4>Query results</h4>
            <Badge>{results[0]?.values.length || 0} rows</Badge>
          </div>
          <div className="data-table-wrap">
            {results.map((r, i) => (
              <table key={i}>
                <thead>
                  <tr>
                    {r.columns.map((c, j) => (
                      <th key={j}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.values.slice(0, 100).map((row, j) => (
                    <tr key={j}>
                      {row.map((value, k) => (
                        <td key={k}>
                          {value === null ? <em>NULL</em> : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
          <div className="padded">
            <Feedback text={feedback} />
          </div>
        </section>
      </div>
    </>
  );
}
export function DevTools() {
  const { state, setState, navigate } = useGame();
  const [tab, setTab] = useState("Network");
  const [selected, setSelected] = useState("");
  const [note, setNote] = useWorkDraft("devtools-finding", "");
  const [feedback, setFeedback] = useState("");
  const traces = state.evidence.filter(
    (e) =>
      ["network", "api", "profile", "idor", "duplicate"].includes(e.kind) &&
      (state.assessment?.status !== "running" ||
        e.assessmentId === state.assessment.id),
  );
  return (
    <>
      <SectionHead
        eyebrow="DEVTOOLS / OBSERVED SESSION"
        title="Look under the surface"
        description="Inspect requests, errors, and state captured in your test session."
      />
      <MissionContext />
      <div className="panel">
        <div className="tabs underlined">
          {["Elements", "Console", "Network", "Application", "Storage"].map(
            (t) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ),
          )}
        </div>
        <div className="devtools-content">
          {tab === "Network" ? (
            <>
              <div className="network-table">
                {traces.length ? (
                  traces.map((e) => (
                    <button key={e.id} onClick={() => setSelected(e.detail)}>
                      <span
                        className={e.detail.includes("503") ? "red" : "green"}
                      >
                        {e.detail.includes("503") ? "503" : "HTTP"}
                      </span>
                      <span>{e.detail.split("\n")[0]}</span>
                      <small>{e.time}</small>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">
                    <Terminal size={30} />
                    <h3>Waiting for network activity</h3>
                    <p>
                      Send an API request or reproduce checkout in the Test Lab.
                    </p>
                    <button
                      className="button"
                      onClick={() => navigate("Test Lab")}
                    >
                      Open Test Lab
                    </button>
                  </div>
                )}
              </div>
              {selected && <pre>{selected}</pre>}
            </>
          ) : tab === "Console" ? (
            <pre>
              {traces
                .filter((e) => e.kind === "network")
                .map((e) => `[error] ${e.detail}`)
                .join("\n") || "No console errors captured."}
            </pre>
          ) : tab === "Elements" ? (
            <pre>
              {
                '<main id="shopsphere">\n  <form aria-label="Checkout">\n    <button type="submit">Continue to checkout</button>\n  </form>\n</main>'
              }
            </pre>
          ) : (
            <pre>
              {JSON.stringify(
                tab === "Storage"
                  ? {
                      sessionStorage: { userId: 123, environment: "staging" },
                      localStorage: {
                        build:
                          activeMission(state).kind === "capstone"
                            ? expenseBuild(state)
                            : buildName(activeMission(state)),
                      },
                    }
                  : {
                      profile: state.profile,
                      requests: state.apiCount,
                      capturedTraces: traces.length,
                    },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      </div>
      <section className="panel padded">
        <Field label="Technical finding">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Identify the failing request, status code, observed error, and next investigation step."
          />
        </Field>
        <button
          className="button primary"
          onClick={() => {
            if (
              traces.some((e) => e.kind === "network") &&
              /503/.test(note) &&
              (activeMission(state).kind === "capstone"
                ? /expense/i.test(note)
                : /checkout/i.test(note)) &&
              note.length >= 50
            ) {
              setFeedback(
                "Sarah: Clear request-level evidence. I can investigate the missing error handling.",
              );
              if (activeMission(state).kind === "devtools")
                setState((s) => reward(s, activeMission(s), 95));
              else setState((s) => recordWork(s, "DevTools", 95, note));
            } else
              setFeedback(
                "Sarah: Reproduce the failure first, then include its endpoint, exact status, and the observed behavior.",
              );
          }}
        >
          Submit finding <ArrowRight size={15} />
        </button>
        <Feedback text={feedback} />
      </section>
    </>
  );
}
export function AutomationLab() {
  const { state, setState } = useGame();
  const capstone = activeMission(state).kind === "capstone";
  const [code, setCode] = useWorkDraft(
    "automation-code",
    capstone
      ? "test('expense regression', async ({ page }) => {\n  await page.goto('/expenses');\n});"
      : automationStarter,
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [framework, setFramework] = useState("Playwright");
  const unlocked = state.valid >= 1 && state.cases.length >= 3;
  function run() {
    const result = runAutomation(code, capstone ? state : undefined);
    setLogs(result.logs);
    setState((s) => {
      let n = addEvidence(
        { ...advance(s, 15), automationCount: s.automationCount + 1 },
        "automation",
        `${result.passed ? "PASS" : "FAIL"} ${capstone ? "expense regression" : "login smoke"} · ${result.logs.join("; ")}`,
      );
      if (result.passed && activeMission(s).kind === "automation")
        n = reward(n, activeMission(s), 100);
      if (result.passed)
        n = recordWork(n, "Automation", 100, result.logs.join("; "));
      return n;
    });
  }
  return (
    <>
      <SectionHead
        eyebrow="AUTOMATION LAB / TYPESCRIPT"
        title="Turn confidence into code"
        description="Automate an observable user outcome. Make the assertion earn its place."
      />
      <MissionContext />
      {!unlocked ? (
        <section className="panel empty-state">
          <Code2 size={40} />
          <h2>Build your manual foundation first.</h2>
          <p>
            Automation unlocks after one accepted defect report and three test
            cases.
          </p>
          <p className="muted">
            Your progress: {state.valid} accepted defects · {state.cases.length}{" "}
            test cases
          </p>
        </section>
      ) : (
        <>
          <div className="toolbar">
            <div className="tabs">
              {["Playwright", "Selenium", "Cypress", "Appium"].map((f) => (
                <button
                  key={f}
                  className={framework === f ? "selected" : ""}
                  onClick={() => setFramework(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <Badge>Constrained local simulator</Badge>
          </div>
          {framework === "Playwright" ? (
            <div className="split-layout">
              <section className="panel">
                <div className="editor-tab">
                  <span>tests / {capstone ? "expenses" : "login"}.spec.ts</span>
                  <Badge>TypeScript</Badge>
                </div>
                <CodeEditor value={code} onChange={setCode} height={370} />
                <div className="editor-actions">
                  <span className="small muted">
                    Supported commands run against{" "}
                    {capstone
                      ? "the current expense ledger"
                      : "a deterministic login model"}
                    .
                  </span>
                  <button className="button primary" onClick={run}>
                    <Play size={14} />
                    Run test
                  </button>
                </div>
                <pre className="terminal-output">
                  {logs.length
                    ? logs.join("\n")
                    : "Waiting for test execution…"}
                </pre>
              </section>
              <aside className="panel padded">
                <h3>Sandbox contract</h3>
                <p>
                  {capstone ? (
                    <>
                      Check <code>/expenses</code> and its pending total against
                      the current ledger. Both visibility and data assertions
                      are required.
                    </>
                  ) : (
                    <>
                      Open <code>/login</code>. Sign in with the staging
                      account, then assert the Dashboard heading is visible.
                    </>
                  )}
                </p>
                {!capstone && (
                  <p className="small muted">
                    Email: alex@nexora.test
                    <br />
                    Password: Nexora123!
                  </p>
                )}
                <h4>Supported API</h4>
                <pre className="reference-code">
                  {capstone
                    ? `page.goto('/expenses')\nexpect(page.getByRole('heading',\n  { name: 'My expenses' }))\n  .toBeVisible()\nexpect(page.getByTestId('expense-total'))\n  .toHaveText('PKR …')`
                    : `page.goto('/login')\npage.getByLabel('Email').fill('…')\npage.getByLabel('Password').fill('…')\npage.getByRole('button',\n  { name: 'Sign in' }).click()\nexpect(page.getByRole('heading',\n  { name: 'Dashboard' }))\n  .toBeVisible()`}
                </pre>
                <p className="small muted">
                  This lab interprets the commands above in order. It does not
                  execute arbitrary JavaScript or launch a real browser.
                </p>
              </aside>
            </div>
          ) : (
            <FrameworkExercise framework={framework} />
          )}
        </>
      )}
    </>
  );
}
function FrameworkExercise({ framework }: { framework: string }) {
  const { setState } = useGame();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const snippets: Record<string, [string, string, string]> = {
    Selenium: [
      'driver.findElement(By.id("submit")).click();\nThread.sleep(5000);\nassertTrue(driver.findElement(By.id("dashboard")).isDisplayed());',
      "Replace the fixed wait with an explicit wait for the dashboard element.",
      "visibilityOfElementLocated",
    ],
    Cypress: [
      'cy.get("#submit").click();\ncy.wait(5000);',
      "Assert that #dashboard becomes visible using Cypress retryable assertions.",
      "should",
    ],
    Appium: [
      'driver.findElement(AppiumBy.accessibilityId("Sign in")).click();',
      "Propose an explicit wait for the Dashboard accessibility identifier after app resume.",
      "Dashboard",
    ],
  };
  return (
    <section className="panel padded">
      <h3>{framework} repair exercise</h3>
      <pre>{snippets[framework][0]}</pre>
      <p>{snippets[framework][1]}</p>
      <textarea
        rows={5}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        aria-label="Framework repair"
      />
      <button
        className="button"
        onClick={() => {
          const ok =
            answer.includes(snippets[framework][2]) && answer.length > 40;
          setFeedback(
            ok
              ? "Repair rationale accepted. Prefer an observable state over elapsed time."
              : "Include the requested readiness condition and a concrete repair.",
          );
          if (ok)
            setState((s) =>
              addEvidence(
                advance(s, 10),
                "framework",
                `${framework}: ${answer}`,
              ),
            );
        }}
      >
        Review repair
      </button>
      <Feedback text={feedback} />
      <p className="small muted">
        Syntax-and-concept exercise; no external driver is executed.
      </p>
    </section>
  );
}
export function Pipeline() {
  const { state, setState } = useGame();
  const capstone = activeMission(state).kind === "capstone";
  const file = capstone ? "expenses.spec.ts" : "login.spec.ts";
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState([
    "Nexora automation repository · local Git simulator",
    "Type git status to inspect the working tree.",
  ]);
  const [fix, setFix] = useWorkDraft("pipeline-fix", "");
  const [selected, setSelected] = useState("UI automation");
  const [feedback, setFeedback] = useState("");
  function command() {
    let message =
      "Unsupported command. Available: git clone, status, pull, branch, switch -c, add, commit -m, push.";
    const git = { ...state.git };
    if (cmd === "git status")
      message = `On branch ${git.branch}\n${git.committed ? "Working tree clean" : git.staged ? "Changes staged for commit" : `Modified: ${file}`}`;
    else if (cmd.startsWith("git clone "))
      message = "Cloned nexora/qa-automation into the simulation workspace.";
    else if (cmd === "git pull") message = "Already up to date.";
    else if (cmd === "git branch") message = `* ${git.branch}\n  main`;
    else if (/^git switch -c [\w/-]+$/.test(cmd)) {
      git.branch = cmd.split(" ").at(-1)!;
      message = `Switched to new branch ${git.branch}`;
    } else if (cmd === "git add ." || cmd === `git add ${file}`) {
      if (!state.pipelineFixed) message = "Repair the test before staging it.";
      else {
        git.staged = true;
        message = `Staged ${file}`;
      }
    } else if (/^git commit -m ["'].+["']$/.test(cmd)) {
      if (!git.staged) message = "Nothing staged. Use git add.";
      else if (git.branch === "main")
        message = "main is protected. Create a feature branch.";
      else {
        git.committed = true;
        git.staged = false;
        message = "Committed test repair.";
      }
    } else if (cmd.startsWith("git push")) {
      if (!git.committed) message = "Commit your changes first.";
      else {
        git.pushed = true;
        message = `Branch ${git.branch} pushed to the simulated remote.`;
      }
    }
    setState((s) => ({ ...advance(s, 2), git }));
    setOutput((o) => [...o, `$ ${cmd}`, message]);
    setCmd("");
  }
  return (
    <>
      <SectionHead
        eyebrow="DELIVERY / QUALITY GATES"
        title="Keep the pipeline honest"
        description="Inspect the failed job, fix the cause, and prove the build is ready."
      />
      <MissionContext />
      <div className="pipeline-track">
        {[
          "Build",
          "Unit tests",
          "API tests",
          "UI automation",
          "Deploy gate",
        ].map((stage, i) => (
          <button
            className={`pipeline-stage ${i < 3 || state.pipelineFixed ? "passed" : "failed"}`}
            key={stage}
            onClick={() => setSelected(stage)}
          >
            <span>
              {i < 3 || state.pipelineFixed ? (
                <Check size={17} />
              ) : (
                <X size={17} />
              )}
            </span>
            <strong>{stage}</strong>
            <small>
              {i < 3
                ? "Passed"
                : state.pipelineFixed
                  ? "Ready to rerun"
                  : i === 3
                    ? "Failed"
                    : "Blocked"}
            </small>
          </button>
        ))}
      </div>
      <div className="split-layout">
        <section className="panel padded">
          <h3>{selected} / Job logs</h3>
          <pre className="terminal-output">
            {selected === "UI automation"
              ? capstone
                ? "[12:04:21] expenses.spec.ts\n[12:04:22] goto /expenses\n[12:04:23] waitForTimeout(1000) complete\n[12:04:23] FAIL: My expenses not visible\n[12:04:24] Network: expense list resolved (2200ms)"
                : "[12:04:21] login.spec.ts\n[12:04:22] click Sign in\n[12:04:23] waitForTimeout(1000) complete\n[12:04:23] FAIL: Dashboard not visible\n[12:04:24] Network: authentication request resolved (2200ms)"
              : "[pipeline] " +
                selected +
                "\n" +
                (selected === "Deploy gate"
                  ? "Deployment requires a passing UI quality gate."
                  : "Job complete. Artifacts available in this simulated workspace.")}
          </pre>
          <Field label="Replace the hardcoded wait with an observable assertion">
            <textarea
              rows={3}
              value={fix}
              onChange={(e) => setFix(e.target.value)}
              placeholder="await expect(…).toBeVisible();"
            />
          </Field>
          <button
            className="button"
            onClick={() => {
              if (
                /expect\(/.test(fix) &&
                (capstone ? /My expenses/ : /Dashboard/).test(fix) &&
                /toBeVisible\(\)/.test(fix) &&
                !fix.includes("waitForTimeout")
              ) {
                setState((s) => ({
                  ...s,
                  pipelineFixed: true,
                  git: {
                    ...s.git,
                    committed: false,
                    pushed: false,
                    staged: false,
                  },
                }));
                setFeedback(
                  "Repair saved. Create a branch, stage, commit, and push before rerunning.",
                );
              } else
                setFeedback(
                  `Assert the ${capstone ? "My expenses" : "Dashboard"} heading is visible. Waiting a fixed duration does not establish readiness.`,
                );
            }}
          >
            Save repair
          </button>
          <Feedback text={feedback} />
          <button
            className="button primary"
            onClick={() => {
              if (!state.pipelineFixed || !state.git.pushed) {
                setFeedback(
                  "The repaired test must be committed and pushed before the pipeline can run.",
                );
                return;
              }
              setFeedback(
                `All quality gates passed. UI test waited for the ${capstone ? "expense list" : "dashboard"} to become visible.`,
              );
              setState((s) => {
                const n = addEvidence(
                  advance(s, 20),
                  "pipeline",
                  "PASS all jobs after replacing fixed timeout with observable assertion.",
                );
                return activeMission(s).kind === "cicd"
                  ? reward(n, activeMission(s), 100)
                  : recordWork(
                      n,
                      "CI/CD",
                      100,
                      "Repaired readiness assertion; feature branch committed and pushed; all quality gates passed.",
                    );
              });
            }}
          >
            <Play size={14} />
            Rerun pipeline
          </button>
        </section>
        <section className="panel terminal-panel">
          <div className="editor-tab">
            <span>
              <Terminal size={14} />
              Terminal
            </span>
            <Badge>{state.git.branch}</Badge>
          </div>
          <pre className="terminal-output">{output.join("\n")}</pre>
          <form
            className="terminal-input"
            onSubmit={(e) => {
              e.preventDefault();
              command();
            }}
          >
            <span>❯</span>
            <input
              aria-label="Git command"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              placeholder="git status"
            />
            <button className="button" type="submit">
              Run
            </button>
          </form>
          <p className="small muted padded">
            Commands affect this simulation only. No repository or remote is
            modified.
          </p>
        </section>
      </div>
    </>
  );
}
export function PerformanceLab() {
  const { state, setState } = useGame();
  const m = activeMission(state);
  const required = m.seed ? 5000 + (m.seed - 1) * 1000 : 15000;
  const [users, setUsers] = useState(required);
  const [decision, setDecision] = useState("");
  const [feedback, setFeedback] = useState("");
  const result = state.performance;
  return (
    <>
      <SectionHead
        eyebrow="PERFORMANCE / CAPACITY SIMULATION"
        title="Find the breaking point"
        description="A fast page for one user is only the beginning."
      />
      <MissionContext />
      <div className="split-layout">
        <section className="panel padded">
          <h3>Load scenario</h3>
          <p>
            Target: {required.toLocaleString()} concurrent users. Acceptance:
            P95 &lt; 2,000 ms and error rate &lt; 1%.
          </p>
          <Field label={`Concurrent users · ${users.toLocaleString()}`}>
            <input
              type="range"
              min="500"
              max="40000"
              step="500"
              value={users}
              onChange={(e) => setUsers(Number(e.target.value))}
            />
          </Field>
          <button
            className="button primary"
            onClick={() =>
              setState((s) => ({
                ...advance(s, 25),
                performance: performance(users),
              }))
            }
          >
            <Play size={15} />
            Run load simulation
          </button>
          {result && (
            <>
              <div className="load-chart">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${20 + (Math.min(80, result.p95 / 65) * (i + 1)) / 20}%`,
                    }}
                  >
                    <span>{Math.round((result.p95 * (i + 1)) / 20)}ms</span>
                  </div>
                ))}
              </div>
              <div className="metric-grid">
                {[
                  ["P95", `${result.p95} ms`],
                  ["P99", `${Math.round(result.p95 * 1.35)} ms`],
                  ["Error rate", `${result.errors}%`],
                  [
                    "Throughput",
                    `${Math.round(result.users / Math.max(1, result.p95 / 1000))} req/s`,
                  ],
                  ["CPU", `${Math.min(99, Math.round(result.users / 180))}%`],
                  [
                    "Memory",
                    `${Math.min(95, 30 + Math.round(result.users / 700))}%`,
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <small>{k}</small>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        <aside className="panel padded">
          <h3>Make the call</h3>
          <p>Does the evidence support the planned release?</p>
          <Field label="Recommendation">
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="">Select a decision</option>
              <option>Approve performance gate</option>
              <option>Block and investigate capacity</option>
            </select>
          </Field>
          <button
            className="button full"
            onClick={() => {
              if (!result || result.users < required) {
                setFeedback(
                  "Run at least the target load before making this decision.",
                );
                return;
              }
              const failed = result.p95 >= 2000 || result.errors >= 1;
              const correct = failed
                ? decision === "Block and investigate capacity"
                : decision === "Approve performance gate";
              setFeedback(
                correct
                  ? "Ahmed: Your recommendation matches the measured acceptance criteria."
                  : "Ahmed: Compare both P95 and error rate with the release thresholds.",
              );
              if (correct && m.kind === "performance")
                setState((s) => reward(s, m, 100));
            }}
          >
            Submit assessment
          </button>
          <Feedback text={feedback} />
          <p className="small muted">
            Metrics come from a deterministic capacity model. This is not a
            benchmark of your machine or a real service.
          </p>
        </aside>
      </div>
    </>
  );
}
