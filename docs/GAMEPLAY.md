# Playing QAForge

QAForge simulates QA work at a fictional company. You earn progress by investigating behavior and producing usable work artifacts. The team, products, money, credentials, and job listings are fictional.

## First day

1. Choose **Start your first mission**, enter a player name, and clock in.
2. Review the active assignment and its product contract.
3. Use the appropriate workspace to investigate. Sandbox interactions create observations in the evidence notebook.
4. Submit the work: a clarification, test suite, defect report, technical finding, or delivery recommendation.
5. Read team feedback, revise rejected work, and move to the next assignment.

The workstation contains Requirements, Test Cases, Test Lab, Jira, Postman Lab, SQL Lab, DevTools, Automation Lab, CI/CD, and delivery/career workspaces. Actions consume simulated work time. The mission strip shows remaining time and the active build.

## Evidence and reports

Compare the product contract with what you actually observe. Include preconditions, steps, the expected and actual result, environment, build, customer impact, and appropriate severity in Jira. A plausible report without matching reproduction evidence may be rejected.

API responses and the shared ledgers can be compared with SQLite query results. SQL executes in a read-only browser worker. Other technical tools use documented, constrained simulations.

## Independent hiring assessment

Open **Assessments** and start the hiring test. Deliver fresh work in seven areas within 60 simulated minutes: requirements, test design, exploration, bug reporting, API, SQL, and release judgment. Assessment actions use compressed time.

Write a final quality summary and recommendation, then submit. Passing requires at least 75 overall, at least 70 in every area, a complete report, and an on-time submission. Existing career completions do not satisfy the new attempt. Mentor hints are unavailable during independent attempts.

## Career capstone

Passing the hiring test unlocks **RelayDesk**. You receive five simulated workdays to investigate an unfamiliar employee expense product. Create a risk strategy and submit work across twelve areas, including communication, DevTools, retesting, regression automation, and CI/CD.

Use the product contract and your observations to identify risks. Engineering provides a fix candidate after an accepted qualifying report. Validate the candidate independently, assess remaining risk, and submit a final QA recommendation. **Export work report** downloads your current attempt's work summary as Markdown.

## Saving and retrying

Career progress, main tool drafts, and assessment attempts save automatically in the current browser. You can leave a tool and return without losing its main draft. Storefront cart state and some secondary controls reset on navigation.

Use player settings to export or import a career. Abandon an assessment to return to career work; a new attempt needs fresh evidence. Previous attempts appear on the assessment desk. Completing the same mission again does not award its XP twice.

The [README](../README.md#current-scope) explains the implemented scenario families and remaining scope.
