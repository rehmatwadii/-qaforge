# Development instructions

Start with [setup](docs/SETUP.md), [gameplay](docs/GAMEPLAY.md), and the [project structure](README.md#project-structure). Use Node 24 and install dependencies with `npm ci`.

## Verify a change

```sh
npm run build
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

The build generates Next.js route types needed by a clean checkout. Playwright starts a development server on port 3000 automatically, or reuses a running server. Stop any stale server before testing a different checkout. Screenshots and browser reports are local artifacts excluded from Git.

The GitHub Actions workflow runs installation, build, type checking, unit tests, and Chromium browser tests on pushes to `main` and pull requests. It uses the standard GitHub Actions documented by [checkout](https://github.com/actions/checkout) and [setup-node](https://github.com/actions/setup-node).

## Add gameplay

Add authored mission data in `src/lib/content.ts`, state transitions or grading in `src/lib/engine.ts` / `src/lib/assessments.ts`, and observable behavior in the relevant workspace. Technical simulations live in `src/lib/simulations.ts`.

Assess work against observable evidence and the active build. During independent attempts, evidence and artifacts must belong to that attempt. Cover valid submissions and plausible incorrect work, including clock expiry or reward duplication when relevant. Increasing a catalog count alone does not create a new scenario.

Use the installed Next.js guides under `node_modules/next/dist/docs/` before changing framework APIs or conventions, as required by `AGENTS.md`. `npm ci` reconstructs generated SQL and Monaco assets; do not commit copies from dependencies.

## Submit work

Create a feature branch, make a focused change, run the relevant checks, and open a pull request describing the resulting behavior and validation. Keep actual secrets, local paths, browser saves, customer material, and personal exports out of code, logs, screenshots, and issues. Use fictional `.test` addresses in fixtures. See [privacy and repository hygiene](docs/PRIVACY.md).
