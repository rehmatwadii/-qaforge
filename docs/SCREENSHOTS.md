# QAForge screenshot gallery

**46 actual screenshots** of the running application, organized by the work you can do. Open any image at full size to read the interface. See the [feature guide](../README.md#feature-guide) for behavior and limitations.

## How these images were captured

A dedicated Playwright Chromium session uses fictional demo data and a fresh browser context. It performs UI interactions, verifies expected outcomes, and checks that no uncaught page errors occur. Desktop captures use a 1600 x 1000 viewport; mobile captures use 390 x 844. Images include the full page.

Most results are earned through the captured interactions, including accepted reports, SQL queries, framework repairs, a passing pipeline, and the RelayDesk fix/retest sequence. Two shortcuts make the tour reproducible: the incident screenshot starts from a seeded active incident, and the capstone starts with a seeded passing hiring result to unlock it. The gallery does not claim that this demo completed either assessment. The separate functional tests cover complete assessment submissions.

Names, accounts, messages, balances, and tokens shown here are fictional game fixtures. Capture never reads your personal browser profile, saved career, or exported reports.

## Start your career

<details>
<summary>View 2 screenshots</summary>

### Career workstation

![Career workstation](screenshots/01-home.png)

### First-day onboarding

![First-day onboarding](screenshots/02-onboarding.png)

</details>

## Manual QA and product exploration

<details>
<summary>View 8 screenshots</summary>

### Accepted requirements review

![Accepted requirements review](screenshots/03-requirements.png)

### Boundary test suite

![Boundary test suite](screenshots/04-test-cases.png)

### Cart and coupon evidence

![Cart and coupon evidence](screenshots/05-shopsphere.png)

### Completed reproducible defect report

![Completed reproducible defect report](screenshots/06-jira-report.png)

### Accepted defect on the board

![Accepted defect on the board](screenshots/07-jira-board.png)

### Successful staging login

![Successful staging login](screenshots/08-login.png)

### Weak-password investigation

![Weak-password investigation](screenshots/09-signup.png)

### Transfer and transaction ledger

![Transfer and transaction ledger](screenshots/10-finedge.png)

</details>

## Technical investigations

<details>
<summary>View 11 screenshots</summary>

### API persistence investigation

![API persistence investigation](screenshots/11-api.png)

### Real SQLite duplicate-payment query

![Real SQLite duplicate-payment query](screenshots/12-sql.png)

### Offline checkout trace

![Offline checkout trace](screenshots/13-devtools.png)

### Device sandbox

![Device sandbox](screenshots/14-device-lab.png)

### Cross-account authorization investigation

![Cross-account authorization investigation](screenshots/15-security.png)

### Passing login smoke scenario

![Passing login smoke scenario](screenshots/16-automation.png)

### Accepted Selenium repair

![Accepted Selenium repair](screenshots/17-selenium.png)

### Accepted Cypress repair

![Accepted Cypress repair](screenshots/17-cypress.png)

### Accepted Appium repair

![Accepted Appium repair](screenshots/17-appium.png)

### Committed repair and passing simulated pipeline

![Committed repair and passing simulated pipeline](screenshots/18-pipeline.png)

### Capacity thresholds and release risk

![Capacity thresholds and release risk](screenshots/19-performance.png)

</details>

## Delivery and teamwork

<details>
<summary>View 6 screenshots</summary>

### Recorded release recommendation

![Recorded release recommendation](screenshots/20-release.png)

### Production incident workspace

![Production incident workspace](screenshots/21-incident.png)

### Sprint quality gates

![Sprint quality gates](screenshots/22-sprint.png)

### Team update and simulated reply

![Team update and simulated reply](screenshots/23-slack.png)

### Fictional company inbox

![Fictional company inbox](screenshots/24-email.png)

### Meet the team

![Meet the team](screenshots/25-company.png)

</details>

## Progression and job preparation

<details>
<summary>View 8 screenshots</summary>

### Campaign assignments

![Campaign assignments](screenshots/26-campaign.png)

### Searchable practice library

![Searchable practice library](screenshots/27-practice.png)

### Career progression and promotion requirements

![Career progression and promotion requirements](screenshots/28-career.png)

### Thirteen skill tracks

![Thirteen skill tracks](screenshots/29-skills.png)

### Local job-description matching

![Local job-description matching](screenshots/30-job-board.png)

### Practical interview answer

![Practical interview answer](screenshots/31-interview.png)

### Completed interview feedback

![Completed interview feedback](screenshots/32-interview-result.png)

### Save export and import controls

![Save export and import controls](screenshots/33-settings.png)

</details>

## Independent assessments and RelayDesk

<details>
<summary>View 9 screenshots</summary>

### Independent assessment desk

![Independent assessment desk](screenshots/34-assessment-desk.png)

### Fresh hiring-test work packet

![Fresh hiring-test work packet](screenshots/35-hiring-assessment.png)

### RelayDesk strategy and work packet

![RelayDesk strategy and work packet](screenshots/36-capstone.png)

### Faulty expense build

![Faulty expense build](screenshots/37-relaydesk.png)

### Accepted critical report and engineering fix candidate

![Accepted critical report and engineering fix candidate](screenshots/40-fix-candidate.png)

### Fix retest: authorization and amount rejection

![Fix retest: authorization and amount rejection](screenshots/41-capstone-api.png)

### Pending total computed from the shared ledger

![Pending total computed from the shared ledger](screenshots/42-capstone-sql.png)

### Passing product-specific regression

![Passing product-specific regression](screenshots/43-capstone-regression.png)

### Fixed build with ledger-consistent totals

![Fixed build with ledger-consistent totals](screenshots/44-relaydesk-fixed.png)

</details>

## Mobile layouts

<details>
<summary>View 2 screenshots</summary>

### RelayDesk on a mobile viewport

![RelayDesk on a mobile viewport](screenshots/38-relaydesk-mobile.png)

### Career home on a mobile viewport

![Career home on a mobile viewport](screenshots/39-home-mobile.png)

</details>

## Regenerate the gallery

From the repository root, use Node 24:

```sh
npm ci
npx playwright install chromium
npm run screenshots
```

The capture configuration starts a development server on port 3000 or reuses one already running. Use a server from this checkout. The dedicated capture script writes the documented PNGs to `docs/screenshots/`; browser traces and failure artifacts stay in ignored `test-results/`.

Review regenerated images before committing them, particularly if you change the demo fixtures or capture script. Keep personal names, customer material, credentials, machine paths, and exported saves out of screenshots. This capture uses existing project dependencies and is separate from the regular browser test suite.

[Back to the README](../README.md)
