# QAForge — SQA Career Simulator

A playable local QA career game set at Nexora Technologies in Karachi. Built with Next.js, React, TypeScript, Monaco, and a real SQLite engine running in a browser worker.

## Run

Use **Node.js 24 and npm**. The test toolchain requires Node 22.12 or newer on the Node 22 release line; Node 20 is not supported for full development. `.nvmrc` selects Node 24.

```sh
git clone https://github.com/rehmatwadii/-qaforge.git qaforge
cd qaforge
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. Choose **Start your first mission** to clock in. Installation copies the SQL and Monaco runtime assets into `public/`; neither lab requires a CDN.

No environment variables, API keys, or external database are needed.

- [Setup, production commands, and troubleshooting](docs/SETUP.md)
- [Player guide and independent assessments](docs/GAMEPLAY.md)
- [Development and contribution instructions](CONTRIBUTING.md)
- [Privacy, saves, and repository hygiene](docs/PRIVACY.md)

For an optimized build:

```sh
npm run build
npm start
```

## Playable in this version

- Onboarding, a 17-assignment career campaign, compressed workdays, deadlines, NPC messages, standups, and schedule events.
- Clickable ShopSphere storefront, cart, coupons, login, and signup; FinEdge transfers with a working balance and shared transaction ledger.
- Five build profiles, including a clean build. Sandbox interactions generate observations rather than announcing defects.
- Requirements investigation with clarification feedback; boundary test design with coverage evaluation.
- Jira reports evaluated for completeness, reproduction evidence, build, duplicate status, and severity. Reports can be revised and resubmitted.
- Postman-style requests with methods, JSON headers/body, bearer authorization, responses, history, persistence defects, object authorization, and payment retry behavior.
- Actual SQLite queries, including joins, aggregates, subqueries, and CTEs. Queries run in a read-only worker with a five-second limit. API payments become queryable rows.
- DevTools evidence inspection, desktop/mobile viewport controls, orientation, network conditions, and browser environment selection.
- Local Monaco editor and an ordered Playwright-command interpreter for a login smoke test. Manual work unlocks automation. Selenium, Cypress, and Appium repair exercises provide limited syntax/rationale feedback.
- Git command simulation, pipeline logs, a repair/branch/commit/push workflow, and a passing quality gate.
- Deterministic load simulation with measured thresholds and an evaluated release recommendation.
- Release evidence packets, release/block decisions, next-day production consequences, SQL-backed incident containment, and a ten-day sprint with artifact gates.
- A six-round interview with free-form answers, follow-up prompts, and explicitly labeled local rubric feedback; fictional jobs and local job-description skill extraction.
- XP, individual skills, achievements, reporting accuracy, reputation, performance-based promotion requirements, and fictional salary progression.
- Independent hiring assessment: seven freshly evaluated work areas, a 60-minute simulated budget, final QA report, retries, and downloadable Markdown evidence summary. Previous career results do not satisfy a new attempt.
- RelayDesk career capstone: an unfamiliar expense app with a shared UI/API/SQL ledger, risk strategy, twelve work areas, engineering fix candidate, retesting, expense regression, pipeline repair, and release recommendation. Passing the hiring test unlocks it.
- Persistent requirements, test-case, Jira, API, SQL, automation, pipeline, release, and capstone drafts across tool changes and reload. Active attempts also resume from a save.
- Automatic local saves, validated JSON import, and export. Open the profile settings using the top-right initial or the gear next to your name.

## Content and scope

This is a substantial **working local version**, not the entire finished master-prompt product. The catalog has **17 campaign assignments plus 905 parameterized practice entries** matching the requested category counts. Practice entries share a limited set of implemented scenario families, build behaviors, SQL targets, and assessment rubrics. They are **not 905 independently authored investigations**. The 150 interview entries use six core questions with scenario contexts.

The implemented career loop is: accept a mission → investigate in a working lab → gather evidence → submit → receive NPC feedback → earn skills → make delivery decisions. Repeating a completed mission does not award its XP again. Promotions require actual reporting accuracy and API/SQL evidence in addition to completed work.

Current boundaries:

- Local, single-player saves; no PostgreSQL/Prisma backend, login, cloud synchronization, or multiplayer.
- Playwright, Git, HTTP services, device conditions, and load metrics are simulations. Only SQL is executed by a general-purpose query engine. The automation interpreter supports the documented login and expense visibility/ledger assertions; it does not execute arbitrary JavaScript or real browsers.
- Browser selection records an environment; it does not emulate independent browser rendering engines. Device/network controls model selected behaviors rather than a complete mobile OS.
- NPCs, bug grading, interviews, and job parsing use deterministic rules, not an LLM. Free-form evaluation is approximate and displayed as such.
- The main products cover selected workflows, not every commerce/banking feature in the brief. Deep KYC, OTP, refunds, admin, card controls, permissions/lifecycle simulation, and accessibility-specific missions remain expansion work.
- The hiring test and capstone each use one authored scenario. Additional assessment variants, advanced career specializations, and a genuinely authored 150-question interview bank remain expansion work.
- Sprints can be restarted with your existing career artifacts. Catalog sprint entries reuse the same ten-day scenario structure.
- Storefront cart state and some secondary workspace controls reset when leaving their workspace. The main work drafts, career artifacts, evidence, API history, shared ledgers, and completed results persist.

## Verification

```sh
npm run build
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

The browser tests cover onboarding and save/reload, requirements scoring, hidden-cart reproduction and Jira acceptance, real SQL, API persistence, release consequences and recovery, automation, the Git/pipeline workflow, test design, complete hiring and capstone submissions, draft recovery, navigation, and responsive layout. Unit tests also verify assessment deadlines, fresh evidence, save migration, reward idempotence, fix behavior, and expense regression failures. Screenshots are produced under `test-results/`.

The included GitHub Actions workflow runs these checks on `main` pushes and pull requests. The current local version passed **31 unit tests, 17 browser tests, and a production build**.

## Project structure

| File                                | Responsibility                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `src/lib/content.ts`                | Campaign, scenario families, practice catalog, team, specifications, interview rubrics  |
| `src/lib/engine.ts`                 | Career state, clock, rewards, evidence, Jira grading, promotions, save validation       |
| `src/lib/simulations.ts`            | HTTP state machine, constrained automation runner, SQL investigation targets            |
| `src/lib/assessments.ts`            | Independent attempts, assessment rubric, RelayDesk ledger and fix candidate             |
| `src/components/assessments.tsx`    | Assignment brief, work packet, risk strategy, final report, retries, report export      |
| `src/components/relay-desk.tsx`     | Unfamiliar expense application with observable submission, approval, and total behavior |
| `src/components/Workstation.tsx`    | Navigation, home, persistence, onboarding, team, career                                 |
| `src/components/manual-labs.tsx`    | Requirements, test design, interactive test apps, Jira                                  |
| `src/components/technical-labs.tsx` | API, SQL, DevTools, automation, Git/CI, load testing                                    |
| `src/components/career-labs.tsx`    | Release, incidents, sprint, interview, job matching                                     |
| `public/sql-worker.js`              | Isolated, read-only SQLite execution                                                    |

To add a genuinely new mission, add its scenario data and expected behavior, implement its evaluation against observed evidence, then add tests for the valid path and plausible incorrect submissions. Raising the catalog count alone does not add new gameplay.
