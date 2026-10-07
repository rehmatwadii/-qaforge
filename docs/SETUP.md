# Setup and troubleshooting

Use Node.js 24 and npm. The development toolchain requires at least Node.js 22.12 on the Node 22 release line; Node 20 does not satisfy the installed Vitest version. `.nvmrc` selects Node 24 for version managers that support it.

## Install and start

```sh
git clone https://github.com/rehmatwadii/-qaforge.git qaforge
cd qaforge
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). These commands work from PowerShell, Command Prompt, macOS, and Linux terminals. The explicit `qaforge` destination keeps the local folder name convenient even though the GitHub repository is named `-qaforge`.

No environment variables, API keys, external database, or account inside the game are required. `npm ci` installs the versions in `package-lock.json` and runs the asset preparation script. Installation needs network access to npm; the running labs use local Monaco and SQLite assets.

## Production

```sh
npm ci
npm run build
npm start
```

The default server binds to `127.0.0.1:3000`. A Node hosting platform should install dependencies, run `npm run build`, and start Next.js with the host and port that platform requires. This repository does not deploy itself. Player saves stay in the browser even when the application is hosted.

## Common problems

| Symptom                                               | Recovery                                                                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unsupported Node engine                               | Check `node --version`, select Node 24, and run `npm ci` again.                                                                                               |
| Monaco or SQLite asset is missing                     | Run `node scripts/prepare-assets.mjs`, then reload. Installation with `--ignore-scripts` skips this step.                                                     |
| Port 3000 is occupied                                 | Stop the previous QAForge server or use `npm run dev -- --port 3001`; open the matching URL. Browser tests expect port 3000.                                  |
| Playwright browser is missing                         | Run `npx playwright install chromium`. On Linux CI, use `npx playwright install --with-deps chromium`.                                                        |
| Career appears empty                                  | Use the same browser profile and origin. Changing from `localhost` to `127.0.0.1`, changing port, or using a private window creates a separate save location. |
| Typecheck references missing generated Next.js types  | Run `npm run build` first. Next.js generates the route type declarations.                                                                                     |
| npm cannot authenticate with a private package mirror | Use your machine's npm configuration. Never commit a token-bearing `.npmrc` file.                                                                             |

## Back up progress

Open the player settings using the top-right initial or the gear next to your name. Export your career before clearing browser data. Import restores a validated JSON save. Keep exports outside the repository; they can contain player names, free-form answers, and pasted job descriptions.
