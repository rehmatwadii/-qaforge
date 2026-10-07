<div align="center">
  <img src="src/app/icon.svg" alt="QAForge logo" width="76" />
  <h1>QAForge</h1>
  <p><strong>SQA Career Simulator</strong></p>
  <p>Your first day in QA. Your first reproducible bug. Your first release decision.</p>

<a href="https://github.com/rehmatwadii/-qaforge/actions/workflows/ci.yml"><img src="https://github.com/rehmatwadii/-qaforge/actions/workflows/ci.yml/badge.svg" alt="Build and test status" /></a>
  <p><strong>Next.js 16 &middot; React 19 &middot; TypeScript &middot; Monaco &middot; SQLite &middot; Node 24</strong></p>
  <p><a href="#quick-start">Quick start</a> &middot; <a href="#a-look-inside">Visual tour</a> &middot; <a href="#feature-guide">Features</a> &middot; <a href="#independent-assessments">Assessments</a> &middot; <a href="docs/SCREENSHOTS.md">All screenshots</a></p>
</div>

![QAForge career workstation](docs/screenshots/01-home.png)

QAForge puts you inside **Nexora Technologies**, a fictional software company in Karachi. Start as a QA Trainee and build a career by reviewing requirements, exploring staging apps, investigating APIs and data, reporting defects, repairing tests, and deciding whether a release is safe.

The game rewards work you can explain and reproduce. Team feedback, deadlines, quality gates, and production consequences give that work context.

|  Career campaign   | Skill tracks  | Staging products |       Practice catalog        |
| :----------------: | :-----------: | :--------------: | :---------------------------: |
| **17 assignments** | **13 skills** |  **3 products**  | **905 parameterized entries** |

> Practice entries reuse implemented scenario families. The catalog count does not mean 905 independently authored investigations. See [current scope](#current-scope).

## Quick start

Use **Node.js 24 and npm**. No API keys, environment variables, external database, or game account are required.

```sh
git clone https://github.com/rehmatwadii/-qaforge.git qaforge
cd qaforge
npm ci
npm run dev
```

Open **[127.0.0.1:3000](http://127.0.0.1:3000)**, choose **Start your first mission**, and clock in. Installation prepares local Monaco and SQLite assets; the labs do not depend on a CDN at runtime.

For a production build:

```sh
npm run build
npm start
```

Node 22.12 or newer on the Node 22 release line also satisfies the installed test toolchain. Node 20 is not supported for full development. `.nvmrc` selects Node 24.

| Need help with?                                                  | Read                                           |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| Installation, hosting commands, missing assets, or browser setup | [Setup & troubleshooting](docs/SETUP.md)       |
| First-day work, evidence, assessments, and saving progress       | [Player guide](docs/GAMEPLAY.md)               |
| Changing the game and validating your work                       | [Development instructions](CONTRIBUTING.md)    |
| Personal saves, fictional credentials, and safe publication      | [Privacy guide](docs/PRIVACY.md)               |
| Every workspace and the screenshot capture process               | [Full screenshot gallery](docs/SCREENSHOTS.md) |

## A look inside

These are **actual screenshots of the running application**, captured in a separate fictional demo career. The complete gallery covers every navigation destination, product workflows, technical results, framework exercises, assessments, and mobile layouts.

<table>
  <tr>
    <td width="50%"><strong>Explore a staging product</strong><br /><a href="docs/screenshots/05-shopsphere.png"><img src="docs/screenshots/05-shopsphere.png" alt="ShopSphere cart investigation with recorded coupon evidence" /></a><br />Interact with the cart and compare its behavior with the contract.</td>
    <td width="50%"><strong>Follow the data</strong><br /><a href="docs/screenshots/12-sql.png"><img src="docs/screenshots/12-sql.png" alt="SQLite query returning the duplicate-payment investigation result" /></a><br />Run a real SQL query and verify the investigation target.</td>
  </tr>
  <tr>
    <td><strong>Repair the delivery gate</strong><br /><a href="docs/screenshots/18-pipeline.png"><img src="docs/screenshots/18-pipeline.png" alt="Passing simulated pipeline with repair and Git command history" /></a><br />Replace a fixed wait, commit the repair, and rerun the pipeline.</td>
    <td><strong>Own an unfamiliar product</strong><br /><a href="docs/screenshots/44-relaydesk-fixed.png"><img src="docs/screenshots/44-relaydesk-fixed.png" alt="RelayDesk fix candidate displaying ledger-consistent pending totals" /></a><br />Investigate RelayDesk, request a fix candidate, and retest its controls.</td>
  </tr>
</table>

**[Browse all 46 screenshots](docs/SCREENSHOTS.md)**

## The career loop

**Accept an assignment &rarr; understand the contract &rarr; investigate &rarr; collect evidence &rarr; submit work &rarr; act on feedback &rarr; make the delivery decision.**

Actions consume simulated work time. Accepted work earns XP and skill growth; reporting accuracy, evidence, and release judgment affect your progression. Repeating a completed mission does not award its XP again.

## Feature guide

### The company and your career

| Feature                         | What you can do                                                                                                                                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **First-day onboarding**        | Clock in at 09:00, receive your simulated employee identity and workstation, meet Maya, and open your first assignment.                                                                                                            |
| **Campaign & practice library** | Follow 17 career assignments or search and filter 905 parameterized practice entries across the implemented QA categories.                                                                                                         |
| **NPC team & work schedule**    | Work with fictional QA, engineering, product, and operations teammates; receive assignment feedback, standup reminders, and schedule events.                                                                                       |
| **Slack & email workspaces**    | Send contextual team updates and receive simulated replies. Clear updates contribute to communication progress; no real messages are sent.                                                                                         |
| **Career progression**          | Grow through seven roles from QA Trainee to QA Lead. Track XP, reputation, reporting accuracy, achievements, job readiness, and fictional salary progression. Promotions require evidence of competence as well as completed work. |
| **Skill map**                   | Develop Manual QA, Test design, Requirements, API, SQL, DevTools, Automation, Mobile, Performance, Security, CI/CD, Release judgment, and Communication.                                                                           |
| **Mentor assistance**           | Request progressively more specific guidance during career work. Additional hints cost mission points; independent assessments disable hints.                                                                                      |
| **Responsive workstation**      | Use desktop and mobile layouts, collapsed navigation, and keyboard shortcuts: `/` for mission search, `?` for mentor assistance, and `Esc` to close dialogs.                                                                       |

### Three products to investigate

| Product        | Working scenarios                                                                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ShopSphere** | Storefront, cart quantities, coupons, checkout, login, signup, password validation, profile persistence, and device/network observations. Different build profiles include faulty behavior and a clean build.       |
| **FinEdge**    | Transfers with amount and balance constraints, beneficiary selection, a changing account balance, and a transaction ledger shared with API/SQL investigations.                                                      |
| **RelayDesk**  | Employee expense claims, amount boundaries, approval authorization, and pending totals backed by a shared UI/API/SQL ledger. The capstone adds an engineering fix candidate and product-specific regression checks. |

### Manual testing and investigation

| Workspace                     | What makes the work count                                                                                                                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirements**              | Flag acceptance criteria that need clarification and ask measurable questions. Submit the review for rubric-based feedback.                                                                                                                                          |
| **Test Cases**                | Build acceptance/rejection cases at each boundary, including preconditions and executable steps. Submit the suite for coverage evaluation.                                                                                                                           |
| **Test Lab**                  | Explore real clickable product interfaces, compare before/after states, and capture observations in the evidence notebook. Defects emerge through behavior.                                                                                                          |
| **Jira**                      | Write reports with environment, build, preconditions, reproduction steps, expected/actual behavior, severity, priority, and supporting evidence. Reports are checked for completeness, reproducibility, duplicates, and severity; revise and resubmit rejected work. |
| **Device & network controls** | Select device sizes, rotate the sandbox, change browser environment labels, and model online/offline conditions. These controls support selected responsive and failure scenarios.                                                                                   |
| **DevTools**                  | Inspect captured network traces, responses, console observations, and storage information. Submit a request-level finding with the relevant endpoint, status, and investigation step.                                                                                |

### APIs, data, automation, and delivery

| Workspace                                | Working behavior                                                                                                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postman Lab**                          | Send simulated HTTP requests with methods, endpoints, bearer authorization, JSON bodies, and headers. Inspect status codes, response bodies, duration, history, persistence failures, cross-account authorization, and payment retries. |
| **SQL Lab**                              | Execute real SQLite queries in a read-only browser worker. Use joins, aggregates, subqueries, and CTEs against the current ledger. Results are compared with the mission target; queries have a five-second limit.                      |
| **Automation Lab**                       | Write supported Playwright-style commands in a local Monaco editor. Run an ordered login smoke scenario or RelayDesk visibility/ledger regression. Automation unlocks after manual reporting and test-design work.                      |
| **Selenium, Cypress & Appium exercises** | Repair example synchronization/selector code and submit a concrete rationale. These are limited syntax-and-concept exercises, not installed driver executions.                                                                          |
| **Git & CI/CD simulator**                | Inspect failed job logs, repair the readiness assertion, create a branch, stage, commit, push, and rerun the simulated quality gate. The gate requires a committed and pushed repair.                                                   |
| **Performance Lab**                      | Run a deterministic capacity model at the requested load. Inspect P95/P99, error rate, throughput, CPU, and memory, then approve or block against the acceptance thresholds.                                                            |
| **Release Center**                       | Review evidence packets and submit a release, conditional-release, or block recommendation with impact and next steps. A risky payment release can trigger a next-day production incident.                                              |
| **Incident command**                     | Correlate the payment alert with API/SQL evidence, investigate duplicate charges, and choose containment such as rollback or disabling the payment feature.                                                                             |
| **Sprint Room**                          | Work through ten simulated days with artifact gates, team updates, changing scope, and a final quality summary. Restart a sprint while keeping existing career artifacts.                                                               |

The **in-game Git/HTTP/automation/load tools are constrained simulations**. SQL is executed by a general-purpose SQLite engine. Separately, this repository's **GitHub Actions workflow runs real build, typecheck, unit, and Chromium browser checks**.

### Job preparation and saved work

- **Interview Arena:** six practical rounds covering communication, prioritization, API investigation, SQL, release judgment, and automation. Write free-form answers, respond to follow-up prompts, and review local rubric feedback and the final breakdown.
- **Job Board:** review fictional roles, paste a job description, extract skill/experience requirements locally, compare your readiness, and jump into training for a missing skill.
- **Persistent work:** main requirements, test-case, Jira, API, SQL, automation, pipeline, release, and capstone drafts survive tool changes and reload.
- **Career backups:** save automatically in the current browser, export a JSON career, and import a validated save from player settings. Some secondary controls and storefront cart state reset on navigation.

## Independent assessments

### Junior SQA hiring test

**ShopSphere &middot; 60 simulated minutes &middot; seven work areas**

Produce fresh requirements, test design, exploration, bug reporting, API, SQL, and release artifacts. Assessment action times are compressed. Previous career results cannot satisfy a new attempt.

Pass with **75/100 overall**, **at least 70 in every required area**, a complete final report, and an on-time submission. Retry attempts are archived, and **Export work report** downloads the current attempt's work summary as Markdown.

![Independent hiring assessment work packet](docs/screenshots/35-hiring-assessment.png)

### First week of ownership: RelayDesk

**Unfamiliar expense product &middot; five simulated workdays &middot; twelve work areas**

Pass the hiring test to unlock the capstone. Define a risk strategy, understand the contract, investigate the product, design cases, report reproducible defects, communicate with the team, inspect DevTools, test APIs, validate SQL, retest engineering's fix candidate, execute regression, repair the pipeline, and give a final QA recommendation.

The capstone requires fresh work across the twelve assessed areas and an accepted report covering its critical authorization risk. Its automation checks use the current expense ledger.

<table>
  <tr>
    <td width="50%"><a href="docs/screenshots/41-capstone-api.png"><img src="docs/screenshots/41-capstone-api.png" alt="RelayDesk API retest rejecting an invalid claim after the engineering fix" /></a><br /><strong>Retest the reported risks</strong></td>
    <td width="50%"><a href="docs/screenshots/43-capstone-regression.png"><img src="docs/screenshots/43-capstone-regression.png" alt="Passing RelayDesk regression comparing pending total with the current ledger" /></a><br /><strong>Prove the regression outcome</strong></td>
  </tr>
</table>

## Verify and develop

```sh
npm run build
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

The functional suite covers **31 unit tests and 17 browser tests**, including complete hiring and capstone submissions, save/reload, requirements, Jira acceptance, SQL, APIs, release consequences, incident recovery, automation, pipeline repair, and responsive layout.

Regenerate the documentation screenshots separately:

```sh
npm run screenshots
```

This runs a dedicated demo capture scenario and writes PNGs to `docs/screenshots/`. It does not use your personal browser profile or exported career. See [capture details](docs/SCREENSHOTS.md#regenerate-the-gallery).

## Project map

| Location                                            | Responsibility                                                                    |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/lib/content.ts`                                | Campaign, practice families, team, specifications, interview rubrics              |
| `src/lib/engine.ts`                                 | Career state, clock, rewards, evidence, Jira grading, promotions, save validation |
| `src/lib/assessments.ts`                            | Independent attempts, grading, RelayDesk ledger, engineering fix candidate        |
| `src/lib/simulations.ts`                            | HTTP state machine, constrained automation runner, SQL targets                    |
| `src/components/Workstation.tsx`                    | Navigation, home, persistence, onboarding, team, career                           |
| `src/components/manual-labs.tsx`                    | Requirements, test design, interactive products, Jira                             |
| `src/components/technical-labs.tsx`                 | API, SQL, DevTools, automation, Git/CI, load testing                              |
| `src/components/career-labs.tsx`                    | Release, incidents, sprint, interviews, job matching                              |
| `src/components/assessments.tsx` / `relay-desk.tsx` | Assessment desk and unfamiliar expense product                                    |
| `public/sql-worker.js`                              | Isolated, read-only SQLite execution                                              |
| `scripts/capture-screenshots.spec.ts`               | Reproducible documentation capture with fictional demo data                       |
| `docs/screenshots/`                                 | Committed screenshots of the working application                                  |

## Current scope

QAForge is a **working local version** of an ambitious career simulator. Its limits are part of the documentation:

- Local, single-player saves; no application login, PostgreSQL/Prisma backend, cloud synchronization, or multiplayer.
- HTTP services, Git, Playwright commands, device conditions, and load metrics are simulated. Automation does not execute arbitrary JavaScript or launch browsers inside the game.
- Browser labels record an environment; they do not emulate separate rendering engines. Device/network controls model selected behaviors.
- NPC replies, bug grading, interview feedback, and job parsing use deterministic rules, not an LLM. Free-form scores are approximate.
- The **905 practice entries** reuse a limited number of scenario families. The **150 interview entries** reuse six core questions with scenario contexts. Each independent assessment currently has one authored scenario.
- Deep KYC, OTP, refunds, admin/card controls, full permissions/lifecycle simulation, accessibility-specific missions, advanced specializations, and a larger independently authored scenario bank remain expansion work.

## Privacy

All included people, products, customer data, balances, and test credentials are fictional. `.test` addresses and `nexora-test-token` are simulation fixtures. User-entered names, drafts, answers, and job descriptions can appear in personal career exports; review those files before sharing.

Secrets, machine diagnostics, internal project notes, generated assets, test artifacts, and personal exports are excluded from Git. The screenshots use dedicated demo data. Read the [privacy guide](docs/PRIVACY.md) for storage and publication details.
