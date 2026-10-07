"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  FlaskConical,
  Globe,
  Info,
  Minus,
  Monitor,
  Plus,
  RotateCw,
  ShoppingBag,
  Smartphone,
  Terminal,
  Wifi,
  X,
} from "lucide-react";
import { campaign, kindInfo, requirements } from "@/lib/content";
import {
  absoluteTime,
  activeMission,
  deadlineMinutes,
  addEvidence,
  addMessage,
  advance,
  applyTicket,
  buildName,
  buildProfile,
  gradeTicket,
  reward,
  type Ticket,
} from "@/lib/engine";
import {
  Badge,
  Feedback,
  Field,
  SectionHead,
  useGame,
  useWorkDraft,
} from "./game-context";
import {
  recordWork,
  recordExploration,
  approveExpense,
  createExpense,
  expenseBuild,
} from "@/lib/assessments";
import RelayDesk from "./relay-desk";
export function MissionContext() {
  const { state, setState, navigate } = useGame();
  const m = activeMission(state);
  const next = campaign.find((c) => !state.completed[c.id]);
  const remaining = Math.max(
    0,
    deadlineMinutes(state, m) - (absoluteTime(state) - state.startedAt),
  );
  if (
    state.assessment &&
    state.active === state.assessment.missionId &&
    ["running", "expired"].includes(state.assessment.status)
  )
    return (
      <div className="mission-context">
        <span>
          <strong>{m.id}</strong>
          {state.assessment.mode === "capstone"
            ? "RelayDesk ownership assignment"
            : "Practical hiring assessment"}
        </span>
        <span>
          <Clock size={13} />
          {Math.max(0, state.assessment.budget - state.assessment.elapsed)} min
          remaining{" "}
          <button
            className="text-button"
            onClick={() => navigate("Assessments")}
          >
            Return to assignment <ArrowRight size={13} />
          </button>
        </span>
      </div>
    );
  return (
    <div className="mission-context">
      <span>
        <span className="online-dot" />
        <strong>{m.id}</strong> {m.title}
      </span>
      <span>
        {state.completed[m.id] ? (
          <>
            <Badge tone="green">Completed · {state.completed[m.id]}/100</Badge>
            {next && (
              <button
                className="text-button"
                onClick={() => {
                  setState((s) => ({
                    ...s,
                    active: next.id,
                    startedAt: absoluteTime(s),
                    hintCount: 0,
                  }));
                  navigate(kindInfo[next.kind].view);
                }}
              >
                Next assignment <ArrowRight size={13} />
              </button>
            )}
          </>
        ) : (
          <>
            <Clock size={13} />
            {remaining} min remaining <Badge tone="lime">+{m.xp} XP</Badge>
          </>
        )}
      </span>
    </div>
  );
}
export function Requirements() {
  const { state, setState, toast } = useGame();
  const [selected, setSelected] = useWorkDraft<number[]>(
    "requirement-flags",
    [],
  );
  const [question, setQuestion] = useWorkDraft("requirement-question", "");
  const [feedback, setFeedback] = useState("");
  const m = activeMission(state);
  const seed = m.kind === "requirement" ? m.seed : 0;
  const specs =
    m.kind === "capstone"
      ? [
          {
            text: "Claims accept amounts from PKR 500 to PKR 50,000 inclusive.",
            ambiguous: false,
          },
          {
            text: "Submit claims quickly, including on unreliable networks.",
            ambiguous: true,
          },
          {
            text: "Employees may submit claims; approval requires a separate finance approver.",
            ambiguous: false,
          },
          { text: "Refresh dashboard totals regularly.", ambiguous: true },
          {
            text: "Show appropriate feedback when an expense request fails.",
            ambiguous: true,
          },
          {
            text: "Notify the requester soon after a claim is reviewed.",
            ambiguous: true,
          },
        ]
      : seed === 0
        ? requirements
        : requirements.map((r, i) =>
            i === 1
              ? {
                  ...r,
                  text: [
                    "The profile update should be fast.",
                    "The transaction list should load quickly.",
                    "The transfer confirmation should be responsive.",
                    "The error message should appear promptly.",
                    "The account screen should load without delay.",
                  ][seed % 5],
                }
              : r,
          );
  function submit() {
    const valid = selected.filter((i) => specs[i]?.ambiguous).length;
    const falseFlags = selected.length - valid;
    const useful =
      question.trim().length >= 35 &&
      /how|what|when|which|maximum|minimum|limit|time|attempt|expire|error/i.test(
        question,
      );
    const score = Math.max(
      0,
      Math.round((valid / 4) * 80 - falseFlags * 20 + (useful ? 20 : 0)),
    );
    const text =
      score >= 70
        ? m.kind === "capstone"
          ? "Ayesha: These are actionable questions. I will define submission timing, refresh intervals, recovery behavior, and notification criteria before release."
          : "Ayesha: These are actionable questions. I will define measurable timing, lockout, error, and session criteria before engineering starts."
        : "Ayesha: Identify at least three ambiguous criteria and ask for a measurable acceptance condition. Concrete behavior already specified does not need flagging.";
    setFeedback(`${score}/100 — ${text}`);
    setState((s) => {
      let n = advance(s, 20);
      n = recordWork(
        n,
        "Requirements",
        score,
        `${selected.map((i) => `AC-${i + 1}`).join(", ")}: ${question}`,
      );
      if (score >= 70 && m.kind === "requirement") n = reward(n, m, score);
      return addMessage(n, "Ayesha", text);
    });
    if (score >= 70)
      toast(
        "Requirements review accepted. Your clarification is now in the team inbox.",
      );
  }
  return (
    <>
      <SectionHead
        eyebrow="REQUIREMENT DETECTIVE"
        title="Read between the lines"
        description="A defect prevented is a defect your customers never experience."
      />
      <MissionContext />
      <div className="split-layout">
        <section className="panel document-panel">
          <div className="document-toolbar">
            <span>
              <FileText size={17} />{" "}
              {m.kind === "capstone"
                ? "RelayDesk / Expense requirements"
                : "ShopSphere / Authentication requirements"}
            </span>
            <Badge>Draft v0.3</Badge>
          </div>
          <div className="document-body">
            <span className="eyebrow">
              PRODUCT SPECIFICATION /{" "}
              {m.kind === "capstone" ? "EXP-001" : "AUTH-001"}
            </span>
            <h2>
              {m.kind === "capstone"
                ? "Expense submission & approval"
                : "Login & session management"}
            </h2>
            <p className="muted">
              Owner: Ayesha Shah · Product & Business Analysis
            </p>
            <h4>Business objective</h4>
            <p>
              {m.kind === "capstone"
                ? "Allow employees to submit expense claims while finance controls approvals and totals remain consistent with the ledger."
                : "Allow returning customers to securely access their accounts and continue shopping."}
            </p>
            <h4>Acceptance criteria</h4>
            <p className="small muted">
              Select wording that cannot be tested consistently without
              clarification.
            </p>
            <div className="requirements-list">
              {specs.map((r, i) => (
                <button
                  key={i}
                  className={selected.includes(i) ? "flagged" : ""}
                  onClick={() =>
                    setSelected(
                      selected.includes(i)
                        ? selected.filter((n) => n !== i)
                        : [...selected, i],
                    )
                  }
                >
                  <span>AC-{String(i + 1).padStart(2, "0")}</span>
                  <p>{r.text}</p>
                  <span className="select-check">
                    {selected.includes(i) ? (
                      <Check size={14} />
                    ) : (
                      <Plus size={14} />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
        <aside className="panel padded">
          <span className="eyebrow">YOUR INVESTIGATION</span>
          <h3>Make it testable.</h3>
          <p>
            Flag ambiguous criteria, then send the product team a precise
            clarification.
          </p>
          <div className="selected-count">
            {selected.length}
            <span>criteria flagged</span>
          </div>
          <Field label="Clarification for Ayesha">
            <textarea
              rows={7}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What measurable conditions would make these requirements unambiguous?"
            />
          </Field>
          <button
            className="button primary full"
            onClick={submit}
            disabled={!selected.length}
          >
            Submit review <ArrowRight size={16} />
          </button>
          <Feedback text={feedback} />
          <p className="small muted">
            Review consumes 20 simulated minutes. Expected behavior is not an
            ambiguity.
          </p>
        </aside>
      </div>
    </>
  );
}
export function TestCases() {
  const { state, setState } = useGame();
  const m = activeMission(state);
  const low = 500 + (m.seed ? m.seed - 1 : 0) * 100,
    high =
      m.kind === "capstone" ? 50000 : 250000 + (m.seed ? m.seed - 1 : 0) * 1000;
  const [input, setInput] = useWorkDraft("test-input", "");
  const [expected, setExpected] = useWorkDraft<"Accept" | "Reject">(
    "test-expected",
    "Accept",
  );
  const [steps, setSteps] = useWorkDraft(
    "test-steps",
    m.kind === "capstone"
      ? "Enter the expense amount and submit the claim."
      : "Enter the transfer amount and submit.",
  );
  const [precondition, setPrecondition] = useWorkDraft(
    "test-precondition",
    m.kind === "capstone"
      ? "Authenticated employee 123 on RelayDesk staging."
      : "Authenticated customer with sufficient balance.",
  );
  const [feedback, setFeedback] = useState("");
  const boundaries = [low - 1, low, low + 1, high - 1, high, high + 1];
  function add() {
    const value = Number(input);
    if (
      !input ||
      !Number.isFinite(value) ||
      steps.length < 15 ||
      precondition.length < 10
    ) {
      setFeedback(
        "Include a numeric input, a precondition, and executable steps.",
      );
      return;
    }
    const attemptId =
      state.assessment?.status === "running" ? state.assessment.id : undefined;
    if (
      state.cases.some(
        (c) =>
          c.input === value &&
          c.expected === expected &&
          c.assessmentId === attemptId,
      )
    ) {
      setFeedback("Duplicate test data. Add another boundary or risk.");
      return;
    }
    setState((s) => ({
      ...advance(s, 5),
      cases: [
        ...s.cases,
        {
          id: crypto.randomUUID(),
          input: value,
          expected,
          steps,
          precondition,
          assessmentId: attemptId,
        },
      ],
    }));
    setInput("");
    setFeedback("Test case added to the suite.");
  }
  function submit() {
    const cases =
      state.assessment?.status === "running"
        ? state.cases.filter((c) => c.assessmentId === state.assessment!.id)
        : state.cases;
    const correct = boundaries.filter((v) =>
      cases.some(
        (c) =>
          c.input === v &&
          c.expected === (v >= low && v <= high ? "Accept" : "Reject"),
      ),
    );
    const wrong = cases.filter(
      (c) =>
        boundaries.includes(c.input) &&
        c.expected !==
          (c.input >= low && c.input <= high ? "Accept" : "Reject"),
    ).length;
    const score = Math.max(
      0,
      Math.round((correct.length / 6) * 100 - wrong * 10),
    );
    setFeedback(
      `${score}/100 — ${correct.length}/6 boundary conditions covered correctly. ${score >= 83 ? "Maya: Clear acceptance and rejection coverage. Suite approved." : "Maya: Include each limit, its nearest valid neighbor, and its nearest invalid neighbor."}`,
    );
    if (score >= 83 && m.kind === "testcase")
      setState((s) => reward(s, m, score));
    else
      setState((s) =>
        recordWork(
          s,
          "Test design",
          score,
          `Boundary suite covers ${correct.length}/6 inputs for PKR ${low}–${high}.`,
        ),
      );
  }
  return (
    <>
      <SectionHead
        eyebrow="TEST DESIGN WORKBENCH"
        title="Turn risk into test cases"
        description="Build a suite that earns confidence, one useful assertion at a time."
      />
      <MissionContext />
      <div className="info-banner">
        <Info size={18} />
        <span>
          <strong>
            {m.kind === "capstone"
              ? "RelayDesk claim contract:"
              : "FinEdge transfer contract:"}
          </strong>{" "}
          Amount must be between PKR {low.toLocaleString()} and{" "}
          {high.toLocaleString()}, inclusive. Use boundary value analysis.
        </span>
      </div>
      <div className="split-layout">
        <section className="panel padded">
          <h3>
            Your test suite <Badge>{state.cases.length} cases</Badge>
          </h3>
          <div className="data-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>INPUT (PKR)</th>
                  <th>EXPECTED</th>
                  <th>STEPS</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.cases.map((c) => (
                  <tr key={c.id}>
                    <td>{c.input.toLocaleString()}</td>
                    <td>
                      <Badge
                        tone={c.expected === "Accept" ? "green" : "orange"}
                      >
                        {c.expected}
                      </Badge>
                    </td>
                    <td>{c.steps}</td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Delete test for ${c.input}`}
                        onClick={() =>
                          setState((s) => ({
                            ...s,
                            cases: s.cases.filter((x) => x.id !== c.id),
                          }))
                        }
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!state.cases.length && (
            <div className="empty-state">
              <FileText size={30} />
              <h3>A blank suite. An important contract.</h3>
              <p>Begin with the highest-risk inputs.</p>
            </div>
          )}
          <button className="button primary" onClick={submit}>
            Submit test suite <ArrowRight size={15} />
          </button>
          <Feedback text={feedback} />
        </section>
        <aside className="panel padded">
          <h3>Create a test case</h3>
          <Field label="Precondition">
            <textarea
              rows={2}
              value={precondition}
              onChange={(e) => setPrecondition(e.target.value)}
            />
          </Field>
          <Field
            label={
              m.kind === "capstone"
                ? "Claim amount (PKR)"
                : "Transfer amount (PKR)"
            }
          >
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter test data"
            />
          </Field>
          <Field label="Expected outcome">
            <select
              value={expected}
              onChange={(e) =>
                setExpected(e.target.value as "Accept" | "Reject")
              }
            >
              <option>Accept</option>
              <option>Reject</option>
            </select>
          </Field>
          <Field label="Steps">
            <textarea
              rows={3}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </Field>
          <button className="button full" onClick={add}>
            <Plus size={15} />
            Add test case
          </button>
        </aside>
      </div>
    </>
  );
}
export function TestLab() {
  const { state, setState, navigate, toast } = useGame();
  const m = activeMission(state);
  const profile = buildProfile(m),
    build = buildName(m);
  const [app, setApp] = useState("ShopSphere");
  const [tab, setTab] = useState("Storefront");
  const [device, setDevice] = useState("Desktop");
  const [browser, setBrowser] = useState("Chrome");
  const [landscape, setLandscape] = useState(false);
  const [network, setNetwork] = useState("Online");
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [amount, setAmount] = useState("5000");
  const [balance, setBalance] = useState(45000);
  const [coverage, setCoverage] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const price = 2500;
  const total =
    quantity * price -
    (applied ? (profile === 0 ? discount : quantity * price * 0.2) : 0);
  function record(kind: string, detail: string) {
    setState((s) =>
      recordExploration(
        addEvidence(
          advance(s, 3),
          kind,
          `${detail} · build ${build} · ${device}/${browser}/${network}`,
        ),
      ),
    );
    setCoverage((c) => [...new Set([...c, kind])]);
  }
  function changeQuantity(q: number) {
    const next = Math.max(1, Math.min(10, q));
    setQuantity(next);
    if (applied && profile === 0 && next !== quantity)
      record(
        "coupon",
        `SAVE20 applied at quantity ${quantity}; quantity changed to ${next}. Subtotal PKR ${next * price}, discount PKR ${discount}, displayed total PKR ${next * price - discount}.`,
      );
    else
      record(
        "cart",
        `Cart quantity ${next}; total ${next * price * (applied ? 0.8 : 1)}.`,
      );
  }
  function checkout() {
    if (network === "Offline") {
      setResult("Something went wrong. Please try again.");
      record(
        "network",
        "POST /api/checkout → 503 Service Unavailable. Console: Unhandled Promise Rejection.",
      );
      return;
    }
    if (device === "iPhone" && !landscape && (profile === 0 || profile === 3)) {
      setResult("The order summary extends beyond the viewport.");
      record(
        "mobile",
        "iPhone portrait 390×844: checkout action clipped outside viewport. Landscape restores it.",
      );
      return;
    }
    setResult(
      `Order confirmed. Reference ORD-${1045 + state.transactions.length}.`,
    );
    record("checkout", `Checkout completed. Total PKR ${total}.`);
  }
  function auth() {
    if (tab === "Login") {
      if (email === "alex@nexora.test" && password === "Nexora123!") {
        setResult("Signed in. Welcome to your dashboard.");
        record("login", "Valid credentials lead to the account dashboard.");
      } else {
        setResult("Invalid email or password.");
        record("login", "Invalid credentials rejected.");
      }
    } else {
      if (!email.includes("@")) {
        setResult("Enter a valid email address.");
        return;
      }
      if (password.length < 8 && profile !== 1 && profile !== 0) {
        setResult("Password must contain at least 8 characters.");
        record("signup", "Short password rejected.");
      } else {
        setResult("Account created successfully.");
        record(
          password.length < 8 ? "password" : "signup",
          `Signup accepted password with ${password.length} characters. Contract requires at least 8.`,
        );
      }
    }
  }
  function transfer() {
    const value = Number(amount);
    if (
      !Number.isFinite(value) ||
      value < 500 ||
      value > 250000 ||
      value > balance
    ) {
      setResult(
        "Transfer declined: amount outside permitted range or insufficient balance.",
      );
      record("transfer", "Invalid transfer rejected.");
      return;
    }
    setBalance(balance - value);
    const order = `ORD-${1045 + state.transactions.length}`;
    setState((s) => ({
      ...s,
      transactions: [
        ...s.transactions,
        {
          id: Math.max(1000, ...s.transactions.map((t) => t.id)) + 1,
          order_id: order,
          customer_id: 123,
          amount: value,
          status: "success",
        },
      ],
    }));
    setResult(`Transferred PKR ${value.toLocaleString()}. Reference ${order}.`);
    record(
      "transfer",
      `Transfer ${order}: PKR ${value}; remaining balance ${balance - value}.`,
    );
  }
  if (m.kind === "capstone") return <RelayDesk />;
  return (
    <>
      <SectionHead
        eyebrow="STAGING / INTERACTIVE SANDBOX"
        title="Your testing ground"
        description="Real interactions. Hidden defects. Follow the behavior, not a checklist."
      >
        <button className="button" onClick={() => navigate("Jira")}>
          <Plus size={15} />
          Report a defect
        </button>
      </SectionHead>
      <MissionContext />
      <div className="lab-toolbar">
        <select
          aria-label="Test application"
          value={app}
          onChange={(e) => {
            setApp(e.target.value);
            setResult("");
          }}
        >
          <option>ShopSphere</option>
          <option>FinEdge</option>
        </select>
        <select
          aria-label="Device"
          value={device}
          onChange={(e) => {
            setDevice(e.target.value);
            record("device", `Switched device to ${e.target.value}.`);
          }}
        >
          {["Desktop", "Pixel 7", "Samsung S24", "iPhone", "Tablet"].map(
            (d) => (
              <option key={d}>{d}</option>
            ),
          )}
        </select>
        <select
          aria-label="Browser"
          value={browser}
          onChange={(e) => setBrowser(e.target.value)}
        >
          {["Chrome", "Firefox", "Safari", "Edge"].map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <select
          aria-label="Network"
          value={network}
          onChange={(e) => {
            setNetwork(e.target.value);
            record("network-mode", `Network changed to ${e.target.value}.`);
          }}
        >
          <option>Online</option>
          <option>Slow 3G</option>
          <option>Offline</option>
        </select>
        <button
          className="button"
          onClick={() => {
            setLandscape(!landscape);
            record(
              "orientation",
              `Changed to ${!landscape ? "landscape" : "portrait"}.`,
            );
          }}
        >
          <RotateCw size={14} />
          Rotate
        </button>
        <Badge tone="green">Build {build}</Badge>
      </div>
      <div className="split-layout lab-split">
        <section className="browser-frame">
          <div className="browser-chrome">
            <span className="window-dots">
              <i />
              <i />
              <i />
            </span>
            <span>
              <ShieldCheckIcon />{" "}
              {app === "ShopSphere"
                ? "staging.shopsphere.test"
                : "staging.finedge.test"}
              /{tab.toLowerCase()}
            </span>
            <ExternalLink size={13} />
          </div>
          <div
            className={`sandbox ${device !== "Desktop" && !landscape ? "mobile-viewport" : ""}`}
          >
            <div className="shop-header">
              <strong>
                <ShoppingBag size={20} />
                {app === "ShopSphere" ? "shopsphere" : "FinEdge"}
                <span>®</span>
              </strong>
              <span>TEST ENVIRONMENT</span>
            </div>
            {app === "ShopSphere" ? (
              <>
                <div className="shop-nav">
                  {["Storefront", "Login", "Signup"].map((t) => (
                    <button
                      className={tab === t ? "selected" : ""}
                      key={t}
                      onClick={() => {
                        setTab(t);
                        setResult("");
                      }}
                    >
                      {t}
                    </button>
                  ))}
                  <span>
                    <ShoppingBag size={14} /> {quantity}
                  </span>
                </div>
                {tab === "Storefront" ? (
                  <div className="store-content">
                    <span className="shop-eyebrow">EVERYDAY, CONSIDERED.</span>
                    <h2>
                      A little less noise.
                      <br />A little more focus.
                    </h2>
                    <div className="product-row">
                      <div className="product-art">
                        <div className="headphones">
                          <div className="headband" />
                          <div className="ear ear-left" />
                          <div className="ear ear-right" />
                        </div>
                        <span>NEXORA AUDIO / 01</span>
                      </div>
                      <div className="product-info">
                        <Badge>THE ESSENTIALS COLLECTION</Badge>
                        <h3>Studio One</h3>
                        <p>
                          Wireless over-ear headphones.
                          <br />
                          Made for your working rhythm.
                        </p>
                        <strong>PKR 2,500</strong>
                        <div className="quantity">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => changeQuantity(quantity - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => changeQuantity(quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="cart-summary">
                      <div className="coupon-field">
                        <input
                          aria-label="Coupon code"
                          placeholder="Promo code"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (coupon.toUpperCase() === "SAVE20") {
                              setApplied(true);
                              setDiscount(quantity * price * 0.2);
                              setResult("SAVE20 applied — 20% off your cart.");
                              record(
                                "coupon-applied",
                                `SAVE20 applied to ${quantity} items.`,
                              );
                            } else setResult("This coupon is not valid.");
                          }}
                        >
                          Apply
                        </button>
                      </div>
                      <div className="cart-line">
                        <span>Subtotal</span>
                        <span>PKR {(quantity * price).toLocaleString()}</span>
                      </div>
                      <div className="cart-line">
                        <span>Discount</span>
                        <span>
                          − PKR {(quantity * price - total).toLocaleString()}
                        </span>
                      </div>
                      <div className="cart-total">
                        <span>Total</span>
                        <strong data-testid="cart-total">
                          PKR {total.toLocaleString()}
                        </strong>
                      </div>
                      <button className="shop-button" onClick={checkout}>
                        Continue to checkout <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="shop-auth">
                    <h2>
                      {tab === "Login"
                        ? "Welcome back."
                        : "Make yourself at home."}
                    </h2>
                    <p>
                      {tab === "Login"
                        ? "Sign in to your ShopSphere account."
                        : "Create a ShopSphere account."}
                    </p>
                    <Field label="Email address">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>
                    <Field label="Password">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Field>
                    <button className="shop-button" onClick={auth}>
                      {tab === "Login" ? "Sign in" : "Create account"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bank-content">
                <span className="shop-eyebrow">YOUR EVERYDAY ACCOUNT</span>
                <p>Available balance</p>
                <h2>PKR {balance.toLocaleString()}</h2>
                <div className="bank-card">
                  <span>FinEdge · Debit</span>
                  <strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4821</strong>
                  <small>ALEX MORGAN</small>
                </div>
                <h3>Send a transfer</h3>
                <Field label="Beneficiary">
                  <select>
                    <option>Sam Khan · FE-9821</option>
                    <option>Ayesha Shah · FE-7210</option>
                  </select>
                </Field>
                <Field label="Amount (PKR)">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Field>
                <button className="shop-button" onClick={transfer}>
                  Confirm transfer <ArrowRight size={16} />
                </button>
              </div>
            )}
            {result && (
              <div className="shop-result" role="status">
                {result}
              </div>
            )}
          </div>
        </section>
        <aside>
          <section className="panel padded">
            <span className="eyebrow">PRODUCT CONTRACT</span>
            <h3>What should happen</h3>
            <ul className="contract-list">
              <li>SAVE20 discounts the current cart subtotal by 20%.</li>
              <li>Changing quantity recalculates the total.</li>
              <li>Passwords require at least 8 characters.</li>
              <li>Checkout remains usable on supported mobile viewports.</li>
              <li>Invalid requests show an actionable error.</li>
              <li>Transfers: PKR 500–250,000; sufficient balance required.</li>
            </ul>
            <p className="small muted">
              Test account: alex@nexora.test
              <br />
              Password: Nexora123!
            </p>
          </section>
          <section className="panel padded evidence-panel">
            <h3>
              Evidence notebook <Badge>{state.evidence.length}</Badge>
            </h3>
            <p className="small muted">
              Observed interactions are captured automatically. Interpret them
              before reporting.
            </p>
            {state.evidence.slice(0, 4).map((e) => (
              <div className="evidence-entry" key={e.id}>
                <small>{e.time} · OBSERVATION</small>
                <p>{e.detail}</p>
              </div>
            ))}
            <button
              className="button full"
              onClick={() => navigate("DevTools")}
            >
              <Terminal size={14} />
              Inspect traces
            </button>
          </section>
          <section className="panel padded">
            <h3>Session conclusion</h3>
            <Field label="Coverage and result">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record what you tested and the evidence supporting your conclusion."
              />
            </Field>
            <button
              className="button full"
              onClick={() => {
                if (
                  ["manual", "bughunt"].includes(m.kind) &&
                  profile === 4 &&
                  coverage.includes("cart") &&
                  coverage.includes("checkout") &&
                  coverage.includes("login") &&
                  coverage.includes("signup") &&
                  notes.length >= 60
                ) {
                  setState((s) => reward(s, m, 95));
                  toast(
                    "Clean-build verification accepted. Good restraint: no invented bugs.",
                  );
                } else
                  toast(
                    "Maya: More evidence needed. Cover cart, checkout, login, and signup; investigate any mismatch before declaring the build clean.",
                  );
              }}
            >
              Submit clean-build verification
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
function ShieldCheckIcon() {
  return <span>◇</span>;
}
const emptyTicket = {
  summary: "",
  environment: "Chrome / Windows 11 / Staging",
  build: "",
  preconditions: "",
  steps: "",
  expected: "",
  actual: "",
  severity: "Major",
  priority: "P2",
  evidence: "",
};
export function Jira() {
  const { state, setState, toast } = useGame();
  const [form, setForm] = useWorkDraft("jira-report", {
    ...emptyTicket,
    build: buildName(activeMission(state)),
  });
  const [tab, setTab] = useState("New report");
  const [feedback, setFeedback] = useState("");
  const [detail, setDetail] = useState<Ticket | null>(null);
  function submit() {
    const ticket = gradeTicket(state, form);
    setState((s) =>
      recordWork(
        applyTicket(s, ticket),
        "Bug reporting",
        ticket.status === "Accepted" ? ticket.quality : 0,
        `${ticket.id}: ${ticket.status}. ${ticket.summary}`,
      ),
    );
    setFeedback(`${ticket.status} — ${ticket.feedback}`);
    toast(`${ticket.id}: ${ticket.status}`);
    if (ticket.status === "Accepted")
      setForm({ ...emptyTicket, build: form.build });
  }
  return (
    <>
      <SectionHead
        eyebrow="NEXORA / ISSUE TRACKER"
        title="Make it reproducible"
        description="A useful defect report gives the developer everything they need to act."
      />
      <div className="toolbar">
        <div className="tabs">
          {["New report", "Issue board"].map((t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Issue board" ? ` (${state.tickets.length})` : ""}
            </button>
          ))}
        </div>
        <Badge>SHOP / FIN · Staging</Badge>
      </div>
      {tab === "New report" ? (
        <div className="split-layout">
          <section className="panel padded">
            <h3>Create an issue</h3>
            <Field label="Summary">
              <input
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="[Feature] Observed behavior under a specific condition"
              />
            </Field>
            <div className="form-grid">
              <Field label="Environment">
                <input
                  value={form.environment}
                  onChange={(e) =>
                    setForm({ ...form, environment: e.target.value })
                  }
                />
              </Field>
              <Field label="Build">
                <input
                  value={form.build}
                  onChange={(e) => setForm({ ...form, build: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Preconditions">
              <textarea
                rows={2}
                value={form.preconditions}
                onChange={(e) =>
                  setForm({ ...form, preconditions: e.target.value })
                }
                placeholder="Account, initial state, and test data"
              />
            </Field>
            <Field label="Steps to reproduce">
              <textarea
                rows={4}
                value={form.steps}
                onChange={(e) => setForm({ ...form, steps: e.target.value })}
                placeholder={"1. Open…\n2. Enter…\n3. Observe…"}
              />
            </Field>
            <div className="form-grid">
              <Field label="Expected result">
                <textarea
                  rows={3}
                  value={form.expected}
                  onChange={(e) =>
                    setForm({ ...form, expected: e.target.value })
                  }
                />
              </Field>
              <Field label="Actual result">
                <textarea
                  rows={3}
                  value={form.actual}
                  onChange={(e) => setForm({ ...form, actual: e.target.value })}
                />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Severity">
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value })
                  }
                >
                  {["Minor", "Major", "Critical"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {["P1", "P2", "P3", "P4"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Evidence / logs">
              <textarea
                rows={3}
                value={form.evidence}
                onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                placeholder="Attach an observation from your notebook, then add interpretation."
              />
            </Field>
            <button className="button primary" onClick={submit}>
              Submit to engineering <ArrowRight size={16} />
            </button>
            <Feedback text={feedback} />
          </section>
          <aside className="panel padded">
            <span className="eyebrow">CAPTURED IN YOUR SESSION</span>
            <h3>Evidence notebook</h3>
            <p className="muted">
              Choose an observation to attach to the report.
            </p>
            {state.evidence.length ? (
              state.evidence.map((e) => (
                <button
                  className="evidence-attach"
                  key={e.id}
                  onClick={() =>
                    setForm({
                      ...form,
                      evidence: form.evidence
                        ? `${form.evidence}\n${e.detail}`
                        : e.detail,
                    })
                  }
                >
                  <span>
                    {e.time}
                    <Plus size={14} />
                  </span>
                  <p>{e.detail}</p>
                </button>
              ))
            ) : (
              <div className="empty-state">
                Explore the application to capture evidence first.
              </div>
            )}
          </aside>
        </div>
      ) : (
        <section className="panel">
          <div className="table-header issue-grid">
            <span>ISSUE</span>
            <span>SEVERITY</span>
            <span>STATUS</span>
            <span>QUALITY</span>
          </div>
          {state.tickets.map((t) => (
            <button
              className="mission-row issue-grid"
              key={t.id}
              onClick={() => setDetail(t)}
            >
              <span>
                <small className="muted">
                  {t.id} · {t.build}
                </small>
                <h4>{t.summary}</h4>
              </span>
              <Badge tone={t.severity === "Critical" ? "red" : "orange"}>
                {t.severity}
              </Badge>
              <Badge tone={t.status === "Accepted" ? "green" : "neutral"}>
                {t.status}
              </Badge>
              <span>{t.quality}/100</span>
            </button>
          ))}
          {!state.tickets.length && (
            <div className="empty-state">
              <h3>No reports yet.</h3>
              <p>Your first finding starts in the Test Lab.</p>
            </div>
          )}
        </section>
      )}
      {detail && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="modal-close icon-button"
              onClick={() => setDetail(null)}
              aria-label="Close issue"
            >
              <X size={18} />
            </button>
            <Badge>{detail.id}</Badge>
            <h2>{detail.summary}</h2>
            <Badge tone={detail.status === "Accepted" ? "green" : "orange"}>
              {detail.status}
            </Badge>
            <p>{detail.feedback}</p>
            <h4>Steps</h4>
            <pre>{detail.steps}</pre>
            <h4>Evidence</h4>
            <p>{detail.evidence}</p>
            {detail.status !== "Accepted" && (
              <button
                className="button primary"
                onClick={() => {
                  setForm(detail);
                  setTab("New report");
                  setDetail(null);
                }}
              >
                Revise and resubmit
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
