"use client";
import { useState } from "react";
import {
  ArrowRight,
  FileText,
  RefreshCw,
  Plus,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { addEvidence, advance } from "@/lib/engine";
import {
  approveExpense,
  createExpense,
  expenseBuild,
  recordExploration,
} from "@/lib/assessments";
import {
  Badge,
  Field,
  SectionHead,
  useGame,
  useWorkDraft,
} from "./game-context";
import { MissionContext } from "./manual-labs";
export default function RelayDesk() {
  const { state, setState, navigate } = useGame();
  const [amount, setAmount] = useWorkDraft("expense-amount", "12500");
  const [category, setCategory] = useWorkDraft("expense-category", "Travel");
  const [network, setNetwork] = useWorkDraft("expense-network", "Online");
  const [notice, setNotice] = useState("");
  const own = state.expenses.filter((e) => e.requester_id === 123);
  const actual = own
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);
  const total = state.expenseFixed ? actual : 19300;
  function submit() {
    if (network === "Offline") {
      setState((s) =>
        recordExploration(
          addEvidence(
            advance(s, 3),
            "network",
            `POST /api/expenses → 503 Service Unavailable. Console: Unhandled Promise Rejection. No recovery guidance displayed · build ${expenseBuild(s)}`,
          ),
        ),
      );
      setNotice("Something went wrong.");
      return;
    }
    const result = createExpense(state, Number(amount), category);
    setState(recordExploration(result.state));
    setNotice(result.message);
  }
  return (
    <>
      <SectionHead
        title="RelayDesk staging"
        description="An expense platform for employee claims and finance approval."
      >
        <button className="button" onClick={() => navigate("Jira")}>
          <Plus size={15} />
          Report a defect
        </button>
      </SectionHead>
      <MissionContext />
      <div className="lab-toolbar">
        <Badge tone="blue">Employee 123 · Alex Morgan</Badge>
        <select
          aria-label="RelayDesk network"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
        >
          <option>Online</option>
          <option>Offline</option>
        </select>
        <Badge tone="green">Build {expenseBuild(state)}</Badge>
        <button className="button" onClick={() => navigate("DevTools")}>
          Inspect session
        </button>
      </div>
      <div className="split-layout">
        <section className="relay-app">
          <header>
            <span className="relay-logo">
              <FileText size={22} />
              relaydesk
            </span>
            <span>Expense operations</span>
          </header>
          <div className="relay-body">
            <div className="relay-summary">
              <div>
                <small>YOUR PENDING CLAIMS</small>
                <strong data-testid="expense-total">
                  PKR {total.toLocaleString()}
                </strong>
              </div>
              <button
                aria-label="Refresh expense totals"
                onClick={() => {
                  setState((s) =>
                    recordExploration(
                      addEvidence(
                        advance(s, 2),
                        total !== actual ? "expense-total" : "expense-summary",
                        `Dashboard pending total PKR ${total}; current expense rows sum to PKR ${actual} for employee 123 · build ${expenseBuild(s)}`,
                      ),
                    ),
                  );
                  setNotice("Expense overview refreshed.");
                }}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            </div>
            <h2>My expenses</h2>
            <p>Review your claims or submit a new expense.</p>
            <div className="data-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>CLAIM</th>
                    <th>CATEGORY</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {own.map((e) => (
                    <tr key={e.id}>
                      <td>EXP-{e.id}</td>
                      <td>{e.category}</td>
                      <td>PKR {e.amount.toLocaleString()}</td>
                      <td>
                        <Badge
                          tone={e.status === "approved" ? "green" : "orange"}
                        >
                          {e.status}
                        </Badge>
                      </td>
                      <td>
                        {e.status === "pending" && (
                          <button
                            className="button"
                            onClick={() => {
                              const result = approveExpense(state, e.id);
                              setState(recordExploration(result.state));
                              setNotice(
                                result.status === 200
                                  ? `Claim ${e.id} approved.`
                                  : result.data.error || "Approval rejected.",
                              );
                            }}
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="relay-form">
              <h3>New claim</h3>
              <div className="form-grid">
                <Field label="Expense amount (PKR)">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Field>
                <Field label="Expense category">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Travel</option>
                    <option>Meals</option>
                    <option>Equipment</option>
                  </select>
                </Field>
              </div>
              <button className="button primary" onClick={submit}>
                Submit expense <ArrowRight size={15} />
              </button>
            </div>
            {notice && (
              <p className="relay-notice" role="status">
                {notice}
              </p>
            )}
          </div>
        </section>
        <aside>
          <section className="panel padded">
            <h3>Product contract</h3>
            <p>
              Employees can submit claims for PKR 500–50,000 inclusive.
              Employees cannot approve their own claims; a separate finance
              approver is required.
            </p>
            <p>
              The pending total must equal the current ledger. Submissions must
              not create duplicate claims after retries. Network failures must
              show recovery guidance.
            </p>
            <p className="small muted">
              Test identity: alex@nexora.test
              <br />
              Password: Nexora123!
              <br />
              API bearer token: nexora-test-token
            </p>
            <button
              className="button full"
              onClick={() => navigate("Requirements")}
            >
              Review draft specification
            </button>
          </section>
          <section className="panel padded">
            <h3>Evidence notebook</h3>
            {state.evidence
              .filter((e) => e.assessmentId === state.assessment?.id)
              .slice(0, 4)
              .map((e) => (
                <div key={e.id} className="evidence-entry">
                  <small>{e.time} · OBSERVATION</small>
                  <p>{e.detail}</p>
                </div>
              ))}
            <button
              className="button full"
              onClick={() => navigate("Postman Lab")}
            >
              Open API workspace <ArrowRight size={14} />
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
