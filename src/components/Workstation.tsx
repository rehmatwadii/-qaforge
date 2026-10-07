"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Activity,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Bug,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Code2,
  Database,
  Download,
  FlaskConical,
  GitBranch,
  Home,
  Layers,
  LifeBuoy,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Workflow,
  X,
  Zap,
  PanelLeftClose,
  FileCheck,
  Globe,
} from "lucide-react";
import { campaign, kindInfo, missions, skills, team } from "@/lib/content";
import {
  absoluteTime,
  activeMission,
  addMessage,
  advance,
  initialState,
  promotionRequirements,
  readiness,
  restoreSave,
  roles,
  time,
  type GameState,
} from "@/lib/engine";
import { Badge, GameContext, SectionHead, useGame } from "./game-context";
import Assessments from "./assessments";
import { recordWork } from "@/lib/assessments";
import { Requirements, TestCases, Jira, TestLab } from "./manual-labs";
import {
  ApiLab,
  SqlLab,
  DevTools,
  AutomationLab,
  Pipeline,
  PerformanceLab,
} from "./technical-labs";
import {
  ReleaseCenter,
  SprintRoom,
  InterviewArena,
  JobBoard,
} from "./career-labs";
const groups = [
  {
    label: "WORKSPACE",
    items: [
      ["Home", Home],
      ["Missions", Target],
      ["Company", Users],
    ],
  },
  {
    label: "YOUR TOOLKIT",
    items: [
      ["Jira", Bug],
      ["Test Lab", FlaskConical],
      ["Requirements", BookOpen],
      ["Test Cases", FileCheck],
      ["Postman Lab", Globe],
      ["SQL Lab", Database],
      ["Automation Lab", Code2],
      ["DevTools", Terminal],
      ["CI/CD", GitBranch],
      ["Performance Lab", Activity],
    ],
  },
  {
    label: "TEAM & DELIVERY",
    items: [
      ["Slack", MessageSquare],
      ["Email", Mail],
      ["Sprint Room", Layers],
      ["Release Center", ShieldCheck],
    ],
  },
  {
    label: "YOUR CAREER",
    items: [
      ["Career", BriefcaseBusiness],
      ["Skills", Workflow],
      ["Job Board", Search],
      ["Interview Arena", Trophy],
      ["Assessments", FileCheck],
    ],
  },
] as const;
export default function Workstation() {
  const [state, setRawState] = useState<GameState>(initialState);
  const setState: React.Dispatch<React.SetStateAction<GameState>> = (update) =>
    setRawState((previous) => {
      const next = typeof update === "function" ? update(previous) : update;
      if (
        previous.assessment &&
        ["running", "expired"].includes(previous.assessment.status) &&
        next.assessment?.id === previous.assessment.id &&
        ["running", "expired"].includes(next.assessment.status)
      )
        return {
          ...next,
          active: previous.assessment.missionId,
          startedAt: previous.startedAt,
        };
      return next;
    });
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("Home");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [name, setName] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("qaforge-career-v1");
      if (raw) setState(restoreSave(raw));
    } catch {
      setNotice(
        "Your saved career could not be loaded. Export or start a new career.",
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      try {
        localStorage.setItem("qaforge-career-v1", JSON.stringify(state));
      } catch {
        setNotice(
          "Browser storage is full. Export your career to preserve progress.",
        );
      }
  }, [state, loaded]);
  useEffect(() => {
    const shortcuts = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, select") || target.isContentEditable)
        return;
      if (event.key === "?") {
        event.preventDefault();
        setModal("mentor");
      }
      if (event.key === "/") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('[aria-label="Search missions"]')
          ?.focus();
      }
      if (event.key === "Escape") {
        setModal("");
        setSearch("");
      }
    };
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, []);
  function toast(message: string) {
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 6500);
  }
  function navigate(next: string) {
    setView(next);
    setSearch("");
  }
  function exportSave() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "qaforge-career.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Career exported. Keep this file to restore your progress.");
  }
  const active = activeMission(state);
  const unread = state.messages.filter((m) => !m.read).length;
  if (!loaded)
    return (
      <div className="boot">
        <span className="brand-mark">Q</span>
        <p>Connecting to your workstation…</p>
      </div>
    );
  const pages: Record<string, React.ReactNode> = {
    Home: <HomePage start={() => setModal("welcome")} />,
    Missions: <MissionBoard />,
    Requirements: <Requirements />,
    "Test Cases": <TestCases />,
    Jira: <Jira />,
    "Test Lab": <TestLab />,
    "Postman Lab": <ApiLab />,
    "SQL Lab": <SqlLab />,
    DevTools: <DevTools />,
    "Automation Lab": <AutomationLab />,
    "CI/CD": <Pipeline />,
    "Performance Lab": <PerformanceLab />,
    "Release Center": <ReleaseCenter />,
    "Sprint Room": <SprintRoom />,
    "Interview Arena": <InterviewArena />,
    Assessments: <Assessments />,
    "Job Board": <JobBoard />,
    Slack: <Inbox />,
    Email: <Inbox email />,
    Company: <Company />,
    Career: <Career />,
    Skills: <Career tree />,
  };
  return (
    <GameContext.Provider value={{ state, setState, navigate, toast }}>
      <div className={`workstation ${collapsed ? "collapsed" : ""}`}>
        <aside className="sidebar">
          <button
            className="brand"
            onClick={() => navigate("Home")}
            aria-label="QAForge home"
          >
            <span className="brand-mark">
              Q<span />
            </span>
            <span>
              QAForge<small>CAREER SIMULATOR</small>
            </span>
          </button>
          <div className="company-switch">
            <span className="company-logo">N</span>
            <div>
              Nexora Technologies
              <small>
                Career workspace <span className="online-dot" />
              </small>
            </div>
            <MoreHorizontal size={16} />
          </div>
          <nav>
            {groups.map((group) => (
              <div className="nav-group" key={group.label}>
                <div className="nav-label">{group.label}</div>
                {group.items.map(([label, Icon]) => (
                  <button
                    key={label}
                    aria-label={label}
                    onClick={() => navigate(label)}
                    className={`nav-item ${view === label ? "active" : ""}`}
                    title={label}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                    {label === "Missions" && (
                      <b>
                        {campaign.filter((m) => !state.completed[m.id]).length}
                      </b>
                    )}
                    {label === "Slack" && unread > 0 && (
                      <i className="unread-dot" />
                    )}
                    {label === "Automation Lab" && state.valid === 0 && (
                      <span className="tiny-lock">↗</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <button
              className="mentor-link"
              onClick={() => setModal("mentor")}
              disabled={
                !!state.assessment &&
                ["running", "expired"].includes(state.assessment.status)
              }
              title={
                state.assessment &&
                ["running", "expired"].includes(state.assessment.status)
                  ? "Independent assessments do not provide mentor hints"
                  : undefined
              }
            >
              <LifeBuoy size={17} />
              <span>Ask your mentor</span>
              <kbd>?</kbd>
            </button>
            <button className="player" onClick={() => navigate("Career")}>
              <span className="avatar player-avatar">
                {state.name.slice(0, 2).toUpperCase()}
              </span>
              <span>
                {state.name}
                <small>{roles[state.roleIndex]}</small>
              </span>
              <Settings
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  setModal("settings");
                }}
              />
            </button>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="icon-button"
                aria-label="Toggle sidebar"
                onClick={() => setCollapsed(!collapsed)}
              >
                <PanelLeftClose size={17} />
              </button>
              <span>Workspace</span>
              <ChevronRight size={13} />
              <strong>{view}</strong>
            </div>
            <div className="top-actions">
              <div className="global-search">
                <Search size={14} />
                <input
                  aria-label="Search missions"
                  placeholder="Search missions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd>/</kbd>
                {search && (
                  <div className="search-results">
                    {missions
                      .filter((m) =>
                        `${m.id} ${m.title}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .slice(0, 7)
                      .map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setState((s) => ({
                              ...s,
                              active: m.id,
                              startedAt: absoluteTime(s),
                              hintCount: 0,
                            }));
                            navigate(kindInfo[m.kind].view);
                          }}
                        >
                          {m.id}
                          <span>{m.title}</span>
                        </button>
                      ))}
                    {!missions.some((m) =>
                      `${m.id} ${m.title}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    ) && <p>No matching missions.</p>}
                  </div>
                )}
              </div>
              <div className="game-clock">
                <span className="online-dot" /> DAY {state.day}
                <i /> <Clock size={13} />
                {time(state.minute)}
              </div>
              <button
                className="icon-button notification-bell"
                aria-label="Open notifications"
                onClick={() => navigate("Slack")}
              >
                <Bell size={18} />
                {unread > 0 && <span />}
              </button>
              <button
                className="top-avatar"
                aria-label="Open career settings"
                onClick={() => setModal("settings")}
              >
                {state.name.slice(0, 1).toUpperCase()}
              </button>
            </div>
          </header>
          <main key={view}>
            {pages[view] || <HomePage start={() => setModal("welcome")} />}
          </main>
          <footer className="statusbar">
            <span>
              <span className="online-dot" /> All systems operational <i>·</i>{" "}
              Staging environment
            </span>
            <span>
              <CheckCheck size={12} /> Progress saved locally <i>·</i> v0.1.0
            </span>
          </footer>
        </div>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="modal-close icon-button"
              onClick={() => setModal("")}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
            {modal === "welcome" ? (
              <>
                <span className="eyebrow">DAY 01 / KARACHI, PAKISTAN</span>
                <h1>
                  Your first day.
                  <br />A real beginning.
                </h1>
                <p>
                  Welcome to Nexora Technologies. Your team is expecting you.
                </p>
                <div className="mentor-note">
                  <span className="avatar purple">MK</span>
                  <div>
                    <strong>
                      Maya <small>Senior QA Engineer</small>
                    </strong>
                    <p>
                      “You don’t need to know everything today. Be curious, ask
                      good questions, and always follow the evidence.”
                    </p>
                  </div>
                </div>
                <label className="field">
                  <span>What should your team call you?</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={32}
                    placeholder="Your name"
                  />
                </label>
                <div className="onboarding-checks">
                  {[
                    "Employee ID · NX-0248",
                    "Company laptop & staging access",
                    "Jira, Slack & Postman workspace",
                    "Payment database · read only",
                  ].map((t) => (
                    <span key={t}>
                      <Check size={14} />
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  className="button primary full"
                  onClick={() => {
                    setState((s) => ({
                      ...s,
                      name: name.trim() || "Alex",
                      started: true,
                      startedAt: absoluteTime(s),
                    }));
                    setModal("");
                    navigate("Requirements");
                  }}
                >
                  Clock in & open your first mission <ArrowRight size={16} />
                </button>
              </>
            ) : modal === "mentor" &&
              state.assessment &&
              ["running", "expired"].includes(state.assessment.status) ? (
              <>
                <span className="eyebrow">INDEPENDENT ASSIGNMENT</span>
                <h2>Your judgment, your evidence.</h2>
                <p>
                  Mentor hints are unavailable during this assessment. Use the
                  assignment brief, product contracts, and your observations to
                  build a recommendation.
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setModal("");
                    navigate("Assessments");
                  }}
                >
                  Return to assignment
                </button>
              </>
            ) : modal === "mentor" ? (
              <>
                <span className="eyebrow">YOUR MENTOR</span>
                <h2>A little direction from Maya</h2>
                <p>Active assignment: {active.title}</p>
                <div className="mentor-note">
                  <span className="avatar purple">MK</span>
                  <p>
                    {state.hintCount === 0
                      ? "Before you reach for a tool, ask: what does the contract promise, and what evidence would prove or disprove it?"
                      : state.hintCount === 1
                        ? "Compare at least two states: before and after an action, accepted and rejected inputs, or UI and persisted data. Record the exact build."
                        : `For ${kindInfo[active.kind].label.toLowerCase()}, make your result independently reproducible. ${active.kind === "requirement" ? "Look for words such as quickly, too many, and a while." : active.kind === "sql" ? "Group successful transactions by order and filter groups with a count greater than one." : "Inspect the mission contract and your evidence notebook before submitting."}`}
                  </p>
                </div>
                <p className="muted">
                  Each additional hint costs 5 mission points. Hints used:{" "}
                  {state.hintCount}
                </p>
                <button
                  className="button primary"
                  onClick={() =>
                    setState((s) => ({ ...s, hintCount: s.hintCount + 1 }))
                  }
                >
                  Request{" "}
                  {state.hintCount === 0
                    ? "a hint"
                    : state.hintCount === 1
                      ? "another hint"
                      : "an example"}
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">WORKSPACE SETTINGS</span>
                <h2>Your career, saved.</h2>
                <p>
                  Progress is stored in this browser. Export a backup to move to
                  another device.
                </p>
                <label className="field">
                  <span>Guidance level</span>
                  <select
                    value={state.difficulty}
                    onChange={(e) =>
                      setState((s) => ({ ...s, difficulty: e.target.value }))
                    }
                  >
                    {[
                      "Trainee",
                      "Junior",
                      "Professional",
                      "Senior",
                      "Nightmare",
                    ].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <div className="button-row">
                  <button className="button" onClick={exportSave}>
                    <Download size={16} />
                    Export career
                  </button>
                  <button
                    className="button"
                    onClick={() => importRef.current?.click()}
                  >
                    <Upload size={16} />
                    Import career
                  </button>
                </div>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const next = restoreSave(await file.text());
                      setState(next);
                      toast("Career restored. Welcome back.");
                      setModal("");
                    } catch (error) {
                      toast(
                        error instanceof Error
                          ? error.message
                          : "Unable to import save.",
                      );
                    }
                    e.target.value = "";
                  }}
                />
                <p className="muted">
                  Guidance level adjusts mission deadlines: Trainee 100%, Junior
                  90%, Professional 75%, Senior 60%, Nightmare 45%. All work
                  takes place in local simulations.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </GameContext.Provider>
  );
}
function HomePage({ start }: { start: () => void }) {
  const { state, navigate, setState } = useGame();
  const active = activeMission(state);
  const completed = Object.keys(state.completed).length;
  return (
    <>
      <SectionHead
        eyebrow="YOUR CAREER. BUILT THROUGH EXPERIENCE."
        title={`Good ${state.minute < 720 ? "morning" : "afternoon"}, ${state.name}.`}
        description="A new day. Real challenges. Your next step in QA."
      >
        <button className="button" onClick={() => navigate("Career")}>
          <TrendingUp size={15} /> Career overview <ArrowUpRight size={15} />
        </button>
      </SectionHead>
      <div className="day-strip">
        <div>
          <span className="live-tag">LIVE SESSION</span>
          <span>Day {state.day}</span>
          <i>/</i>
          <span>
            {state.day <= 5 ? "Your first week" : "The career continues"}
          </span>
          <i>/</i>
          <strong>
            {state.day <= 10 ? "Probation period" : "Sprint delivery"}
          </strong>
        </div>
        <span>
          <MapPinIcon /> Karachi, Pakistan <i>·</i> Nexora Technologies
        </span>
      </div>
      <div className="home-grid">
        <div className="home-primary">
          <section className="mission-hero">
            <div className="hero-content">
              <div className="hero-kicker">
                <span className="pulse-dot" />{" "}
                {state.completed[active.id]
                  ? "MISSION COMPLETED"
                  : "YOUR NEXT MOVE"}
                <span>{active.id}</span>
              </div>
              <h2>{active.title}</h2>
              <p>{active.description}</p>
              <div className="hero-meta">
                <span>
                  <Layers size={14} />
                  {active.project}
                </span>
                <span>
                  <Clock size={14} /> {active.minutes} min window
                </span>
                <span className="reward">
                  <Zap size={14} />
                  {active.xp} XP
                </span>
              </div>
              <button
                className="button primary"
                onClick={() =>
                  state.started ? navigate(kindInfo[active.kind].view) : start()
                }
              >
                {state.started
                  ? "Continue mission"
                  : "Start your first mission"}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbital orbital-one" />
              <div className="orbital orbital-two" />
              <div className="code-sheet back-sheet">
                <span />
                <span />
                <span />
              </div>
              <div className="code-sheet main-sheet">
                <div className="sheet-top">
                  <i />
                  <i />
                  <i />
                  <span>login.spec.ts</span>
                </div>
                <div className="code-lines">
                  <p>
                    <em>01</em>
                    <b>describe</b> <span>(&apos;your next chapter&apos;,</span>
                  </p>
                  <p>
                    <em>02</em>
                    <span> &nbsp; it(</span>
                    <strong>&apos;starts here&apos;</strong>
                    <span>, () =&gt; &#123;</span>
                  </p>
                  <p>
                    <em>03</em>
                    <span> &nbsp; &nbsp; expect(</span>
                    <b>curiosity</b>
                    <span>)</span>
                  </p>
                  <p>
                    <em>04</em>
                    <span> &nbsp; &nbsp; &nbsp; .toBe(</span>
                    <strong>true</strong>
                    <span>);</span>
                  </p>
                  <p>
                    <em>05</em>
                    <span> &nbsp; &#125;);</span>
                  </p>
                </div>
              </div>
              <div className="art-check">
                <Check size={26} />
              </div>
              <span className="art-caption">
                BUILD SKILLS. SHIP CONFIDENCE.
              </span>
            </div>
          </section>
          <div className="stats-row">
            {[
              {
                label: "Total experience",
                value: state.xp.toLocaleString(),
                unit: "XP",
                icon: Zap,
                sub: `Level ${1 + Math.floor(state.xp / 500)} · ${500 - (state.xp % 500)} XP to next level`,
                tone: "lime",
              },
              {
                label: "Team reputation",
                value: state.reputation,
                unit: "/ 100",
                icon: ShieldCheck,
                sub:
                  state.reputation >= 70
                    ? "Trusted by your team"
                    : "Room to rebuild trust",
                tone: "purple",
              },
              {
                label: "Missions complete",
                value: String(completed).padStart(2, "0"),
                unit: "",
                icon: CheckCheck,
                sub: `${campaign.filter((m) => state.completed[m.id]).length} of ${campaign.length} campaign assignments`,
                tone: "blue",
              },
              {
                label: "Job readiness",
                value: readiness(state),
                unit: "%",
                icon: BriefcaseBusiness,
                sub:
                  readiness(state) < 20
                    ? "Every investigation counts"
                    : "Growing professional confidence",
                tone: "orange",
              },
            ].map((stat) => (
              <div className="stat" key={stat.label}>
                <div className="stat-label">
                  {stat.label}
                  <stat.icon size={15} className={stat.tone} />
                </div>
                <strong>
                  {stat.value}
                  <small>{stat.unit}</small>
                </strong>
                <p>{stat.sub}</p>
                <div className={`stat-line ${stat.tone}`}>
                  <span
                    style={{
                      width: `${stat.label === "Team reputation" ? state.reputation : stat.label === "Job readiness" ? Math.max(3, readiness(state)) : stat.label === "Missions complete" ? (completed / campaign.length) * 100 : Math.max(3, (state.xp % 500) / 5)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <section className="panel priorities">
            <div className="panel-heading">
              <h3>
                Your mission queue{" "}
                <Badge>
                  {campaign.filter((m) => !state.completed[m.id]).length}
                </Badge>
              </h3>
              <button
                className="text-button"
                onClick={() => navigate("Missions")}
              >
                View all missions <ArrowRight size={14} />
              </button>
            </div>
            <div className="table-header mission-columns">
              <span>MISSION</span>
              <span>PROJECT</span>
              <span>REWARD</span>
              <span>STATUS</span>
            </div>
            {campaign
              .filter((m) => !state.completed[m.id])
              .slice(0, 4)
              .map((m, i) => (
                <button
                  className="mission-row mission-columns"
                  key={m.id}
                  onClick={() => {
                    setState((s) => ({
                      ...s,
                      active: m.id,
                      startedAt: absoluteTime(s),
                      hintCount: 0,
                    }));
                    navigate(kindInfo[m.kind].view);
                  }}
                >
                  <span className="mission-name">
                    <span className={`mission-icon mi-${i}`}>
                      <span>
                        {i === 0 ? (
                          <BookOpen size={17} />
                        ) : i === 1 ? (
                          <FileCheck size={17} />
                        ) : i === 2 ? (
                          <Bug size={17} />
                        ) : (
                          <Globe size={17} />
                        )}
                      </span>
                    </span>
                    <span>
                      <small>
                        {m.id} <i>·</i> {kindInfo[m.kind].label}
                      </small>
                      <strong>{m.title}</strong>
                    </span>
                  </span>
                  <span className="project-cell">
                    <span
                      className={`project-dot ${m.project === "FinEdge" ? "purple" : "blue"}`}
                    />
                    {m.project}
                  </span>
                  <span className="xp-cell">+{m.xp} XP</span>
                  <span>
                    <Badge tone={i === 0 ? "lime" : "neutral"}>
                      {i === 0 ? "In progress" : "Available"}
                    </Badge>
                  </span>
                </button>
              ))}
          </section>
          <section className="workspace-section">
            <div className="panel-heading">
              <h3>Built for hands-on work</h3>
              <span className="muted small">
                Your tools, ready when you are
              </span>
            </div>
            <div className="quick-tools">
              {[
                {
                  label: "Test Lab",
                  desc: "Break things. Find the why.",
                  icon: FlaskConical,
                  tone: "blue",
                },
                {
                  label: "Postman Lab",
                  desc: "Follow the request.",
                  icon: Globe,
                  tone: "orange",
                },
                {
                  label: "SQL Lab",
                  desc: "Let the data tell you.",
                  icon: Database,
                  tone: "purple",
                },
              ].map((t) => (
                <button key={t.label} onClick={() => navigate(t.label)}>
                  <span className={`tool-icon ${t.tone}`}>
                    <t.icon size={21} />
                  </span>
                  <h4>
                    {t.label}
                    <ArrowUpRight size={15} />
                  </h4>
                  <p>{t.desc}</p>
                  <span className="tool-ready">
                    <span className="online-dot" /> Workspace ready
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
        <aside className="home-secondary">
          <section className="panel mentor-card">
            <div className="panel-heading">
              <h3>A note from your mentor</h3>
              <MoreHorizontal size={17} />
            </div>
            <div className="person-line">
              <span className="avatar purple">MK</span>
              <div>
                <strong>Maya Khan</strong>
                <small>Senior QA Engineer</small>
              </div>
              <span className="online-dot" />
            </div>
            <p>
              “Great QA starts with good questions. Don’t rush to find bugs.
              First, understand what the product is supposed to do.”
            </p>
            <button className="text-button" onClick={() => navigate("Slack")}>
              Say hello to Maya <ArrowRight size={14} />
            </button>
          </section>
          <section className="panel inbox-preview">
            <div className="panel-heading">
              <h3>
                Team activity <span className="unread-dot" />
              </h3>
              <button className="text-button" onClick={() => navigate("Slack")}>
                <ArrowUpRight size={16} />
              </button>
            </div>
            {state.messages.slice(0, 3).map((msg) => (
              <button
                className="activity-item"
                key={msg.id}
                onClick={() => navigate("Slack")}
              >
                <span
                  className={`avatar small-avatar ${team.find((t) => t.name === msg.from)?.color || "blue"}`}
                >
                  {msg.from.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong>
                    {msg.from}
                    <small>{msg.time}</small>
                  </strong>
                  <p>{msg.text}</p>
                </span>
              </button>
            ))}
            <button className="inbox-link" onClick={() => navigate("Slack")}>
              Open team inbox <ArrowRight size={14} />
            </button>
          </section>
          <section className="panel agenda">
            <div className="panel-heading">
              <h3>Today’s rhythm</h3>
              <span className="muted small">DAY {state.day}</span>
            </div>
            {[
              ["09:00", "Team standup", "10 min · Team sync"],
              ["09:30", "Requirements review", "Focus time"],
              ["11:30", "Exploratory testing", "ShopSphere · Staging"],
              ["16:00", "End-of-day check-in", "Reflect & plan"],
            ].map(([hour, label, sub], i) => (
              <button
                key={hour}
                className={`agenda-item ${i === 1 ? "current" : ""}`}
                onClick={() =>
                  navigate(
                    i === 0 || i === 3
                      ? "Slack"
                      : i === 1
                        ? "Requirements"
                        : "Test Lab",
                  )
                }
              >
                <span className="timeline-dot" />
                <span className="agenda-time">{hour}</span>
                <span>
                  <strong>{label}</strong>
                  <small>{sub}</small>
                </span>
              </button>
            ))}
          </section>
          <div className="home-footnote">
            <ShieldCheck size={15} />
            <span>
              Real practice. No real-world risk.
              <br />
              <small>Everything here is a safe simulation.</small>
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
function MapPinIcon() {
  return <span className="location-symbol">⌖</span>;
}
function MissionBoard() {
  const { state, setState, navigate } = useGame();
  const [tab, setTab] = useState("Campaign");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const list = (
    tab === "Campaign"
      ? campaign
      : missions.filter((m) => !m.id.startsWith("QA-"))
  ).filter(
    (m) =>
      (filter === "All" || kindInfo[m.kind].label === filter) &&
      `${m.id} ${m.title}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <SectionHead
        eyebrow="THE WORK THAT BUILDS YOUR CAREER"
        title="Mission control"
        description="Pick an assignment. Follow the evidence. Make your work count."
      />
      <div className="toolbar">
        <div className="tabs">
          {["Campaign", "Practice library"].map((t) => (
            <button
              className={tab === t ? "selected" : ""}
              key={t}
              onClick={() => {
                setTab(t);
                setPage(0);
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          placeholder="Find a mission…"
          aria-label="Filter missions"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
        <select
          aria-label="Mission category"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
        >
          <option>All</option>
          {Object.values(kindInfo).map((k) => (
            <option key={k.label}>{k.label}</option>
          ))}
        </select>
      </div>
      {tab === "Practice library" && (
        <p className="muted small">
          {missions.length - campaign.length} parameterized practice assignments
          across 16 work areas. Scenario families share simulation mechanics;
          parameters and build behavior vary.
        </p>
      )}
      <div className="panel">
        <div className="table-header mission-list">
          <span>ASSIGNMENT</span>
          <span>PROJECT</span>
          <span>DIFFICULTY</span>
          <span>REWARD</span>
          <span />
        </div>
        {list.slice(page * 15, page * 15 + 15).map((m) => (
          <div className="mission-row mission-list" key={m.id}>
            <div>
              <small className="muted">
                {m.id} · {kindInfo[m.kind].label}
              </small>
              <h4>{m.title}</h4>
            </div>
            <span className="muted">{m.project}</span>
            <span className="stars">
              {"●".repeat(m.difficulty)}
              <span>{"●".repeat(5 - m.difficulty)}</span>
            </span>
            <span className="xp-cell">{m.xp} XP</span>
            <button
              className={`button ${state.completed[m.id] ? "" : "primary"}`}
              onClick={() => {
                setState((s) => ({
                  ...s,
                  active: m.id,
                  startedAt: absoluteTime(s),
                  hintCount: 0,
                }));
                navigate(kindInfo[m.kind].view);
              }}
            >
              {state.completed[m.id]
                ? `${state.completed[m.id]} / 100`
                : "Open mission"}
              <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <div className="empty-state">No missions match this search.</div>
        )}
      </div>
      <div className="pagination">
        <span>
          {list.length} assignments · Page {page + 1} of{" "}
          {Math.max(1, Math.ceil(list.length / 15))}
        </span>
        <button
          className="button"
          disabled={!page}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <button
          className="button"
          disabled={(page + 1) * 15 >= list.length}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
function Inbox({ email = false }: { email?: boolean }) {
  const { state, setState, toast } = useGame();
  const [draft, setDraft] = useState("");
  const [recipient, setRecipient] = useState("Maya");
  function send() {
    if (draft.trim().length < 15) {
      toast("Add enough context for your teammate to act on.");
      return;
    }
    const good =
      /build|test|block|today|yesterday|evidence|repro|requirement|risk/i.test(
        draft,
      );
    setState((s) => {
      let n = addMessage(advance(s, 5), s.name, draft);
      n = addMessage(
        n,
        recipient,
        good
          ? "Thanks for the clear update. Share your next finding and flag any blocker early."
          : "Could you be more specific about the build, task, evidence, and next step?",
      );
      if (good && s.standupDay !== s.day)
        n = {
          ...n,
          standupDay: s.day,
          skills: {
            ...n.skills,
            Communication: Math.min(100, n.skills.Communication + 8),
          },
          xp: n.xp + 20,
        };
      return recordWork(n, "Communication", good ? 90 : 0, draft);
    });
    setDraft("");
  }
  return (
    <>
      <SectionHead
        eyebrow={email ? "NEXORA MAIL" : "NEXORA / TEAM CHANNELS"}
        title={email ? "Work inbox" : "The team is here"}
        description="Keep people informed. Clear communication is part of the job."
      >
        <button
          className="button"
          onClick={() =>
            setState((s) => ({
              ...s,
              messages: s.messages.map((m) => ({ ...m, read: true })),
            }))
          }
        >
          <CheckCheck size={15} />
          Mark all read
        </button>
      </SectionHead>
      <div className="split-layout">
        <section className="panel chat-panel">
          <div className="panel-heading">
            <h3>{email ? "Inbox" : "# qa-team"}</h3>
            <Badge tone="green">7 teammates</Badge>
          </div>
          <div className="chat-messages">
            {state.messages.map((m) => (
              <div
                className={`chat-message ${m.read ? "" : "unread"}`}
                key={m.id}
              >
                <span
                  className={`avatar ${team.find((t) => t.name === m.from)?.color || "green"}`}
                >
                  {m.from.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <strong>
                    {m.from} <small>{m.time}</small>
                  </strong>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-compose">
            <label className="field">
              <span>Reply to</span>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                {team.map((t) => (
                  <option key={t.name}>{t.name}</option>
                ))}
              </select>
            </label>
            <textarea
              aria-label="Team message"
              placeholder="Yesterday / today / blockers — give your team a useful update…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="button primary" onClick={send}>
              Send update <ArrowRight size={15} />
            </button>
          </div>
        </section>
        <aside className="panel padded">
          <span className="eyebrow">DAILY STANDUP</span>
          <h3>Your work, in three sentences.</h3>
          <p>
            What did you complete? What will you test today? What is blocking
            progress?
          </p>
          <p className="muted">
            A substantive daily update earns communication experience once per
            simulated day.
          </p>
          <Badge tone={state.standupDay === state.day ? "green" : "orange"}>
            {state.standupDay === state.day
              ? "Today’s update received"
              : "Your team is waiting"}
          </Badge>
        </aside>
      </div>
    </>
  );
}
function Company() {
  return (
    <>
      <SectionHead
        eyebrow="KARACHI, PAKISTAN"
        title="Meet Nexora Technologies"
        description="One team. Two products. A lot of things worth getting right."
      />
      <div className="team-grid">
        {team.map((t) => (
          <section className="panel team-card" key={t.name}>
            <span className={`avatar large-avatar ${t.color}`}>
              {t.initials}
            </span>
            <h3>{t.name}</h3>
            <p>{t.role}</p>
            <span className="small muted">
              <span className="online-dot" /> Available in the team inbox
            </span>
          </section>
        ))}
      </div>
      <div className="panel padded">
        <h3>Our product teams</h3>
        <p>
          <strong>ShopSphere</strong> — commerce, identity, checkout, payments,
          and mobile shopping.
        </p>
        <p>
          <strong>FinEdge</strong> — transfers, account ownership, payment
          integrity, and transaction investigations.
        </p>
        <p className="muted">
          Your simulated employee ID: NX-0248 · All customer data is fictional.
        </p>
      </div>
    </>
  );
}
function Career({ tree = false }: { tree?: boolean }) {
  const { state, setState, toast } = useGame();
  const checks = promotionRequirements(state);
  return (
    <>
      <SectionHead
        eyebrow="PROGRESS THAT YOU EARN"
        title={tree ? "Your skill map" : "Your career at Nexora"}
        description={
          tree
            ? "Skills grow from accepted work, not from opening a lesson."
            : "Every clear report, thoughtful test, and sound release decision matters."
        }
      />
      <div className="career-banner">
        <span className="avatar large-avatar player-avatar">
          {state.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h2>{state.name}</h2>
          <p>
            {roles[state.roleIndex]} · Level {1 + Math.floor(state.xp / 500)} ·
            Day {state.day}
          </p>
        </div>
        <div>
          <small>SIMULATED MONTHLY SALARY</small>
          <h2>PKR {((state.roleIndex + 1) * 35000).toLocaleString()}</h2>
        </div>
        <div>
          <small>JOB READINESS</small>
          <h2>
            {readiness(state)}
            <span className="muted"> / 100</span>
          </h2>
        </div>
      </div>
      <div className="split-layout">
        <section className="panel padded">
          <h3>Skills earned in the field</h3>
          {skills.map((skill) => (
            <div className="skill-row" key={skill}>
              <span>{skill}</span>
              <div className="progress">
                <span style={{ width: `${state.skills[skill]}%` }} />
              </div>
              <strong>{state.skills[skill]}</strong>
            </div>
          ))}
        </section>
        <aside>
          <section className="panel padded">
            <span className="eyebrow">NEXT CHAPTER</span>
            <h3>{roles[Math.min(6, state.roleIndex + 1)]}</h3>
            <p className="muted">
              Promotion is a performance review, not an XP threshold.
            </p>
            {checks.map((c) => (
              <p className="check-line" key={c.label}>
                <Check size={15} className={c.ok ? "lime" : "muted"} />
                {c.label}
              </p>
            ))}
            <button
              className="button primary full"
              disabled={!checks.every((c) => c.ok) || state.roleIndex >= 6}
              onClick={() => {
                setState((s) => ({ ...s, roleIndex: s.roleIndex + 1 }));
                toast(
                  "Promotion approved. Your responsibility and simulated salary have increased.",
                );
              }}
            >
              Request performance review <ArrowRight size={15} />
            </button>
          </section>
          <section className="panel padded">
            <h3>Career record</h3>
            <div className="record-grid">
              {[
                ["Valid defects", state.valid],
                ["False reports", state.falseBugs],
                ["Duplicates", state.duplicates],
                ["Test cases", state.cases.length],
                ["API requests", state.apiCount],
                ["SQL queries", state.sqlCount],
                ["Release blocks", state.blocked],
                ["Production incidents", state.incidents],
              ].map(([k, v]) => (
                <div key={k}>
                  <small>{k}</small>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="panel padded">
            <h3>Achievements</h3>
            {state.achievements.length ? (
              state.achievements.map((a) => (
                <p className="achievement" key={a}>
                  <Trophy size={16} />
                  {a}
                </p>
              ))
            ) : (
              <p className="muted">
                Your first accepted assignment is the beginning.
              </p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
