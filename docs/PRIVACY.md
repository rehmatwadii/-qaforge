# Privacy and repository hygiene

## Game data

QAForge has no application login, cloud save service, analytics integration, or external LLM integration. Career data is stored under `qaforge-career-v1` in the browser's local storage. The SQL worker constructs an in-memory database from simulation data.

Names entered into the game, work drafts, interview answers, and pasted job descriptions can be stored in a career save. Exported career files and work reports contain user-entered content. Treat those exports as personal files and review them before sharing. Clearing this site's browser storage removes the local career; export a backup first if needed.

The displayed company, products, bank balances, team members, test accounts, and bearer token are simulation fixtures. Addresses ending in `.test` are fictional. The token `nexora-test-token` and staging password in the game are not credentials for a real service. Do not replace them with real credentials.

## Files excluded from Git

`.gitignore` excludes dependency and build directories, generated Monaco/SQLite assets, test results, logs, local tool diagnostics, environment files, token-bearing npm configuration, private key formats, career exports, and backup directories. The original local game-master prompt is retained in the workspace but excluded from publication.

Installed dependencies can contain their own example strings or paths; they are recreated by `npm ci` and are not uploaded. Player browser storage is separate from the source checkout and is never part of the Git push.

## Before publishing changes

Review the staged files and search them for actual credentials, private keys, personal email addresses, absolute machine paths, and confidential documents. `.gitignore` helps keep local files out of a new commit; it cannot remove information already committed to history.

Use GitHub's no-reply email for commits if you do not want your personal email in commit metadata. Report an actual credential exposure privately to the affected service/account owner and revoke it; do not paste the credential into a public issue.

## Documentation screenshots

The committed gallery uses fictional demo data in a separate Playwright browser context. It does not read personal browser profiles or player exports. Review replacement screenshots before committing them; regular test reports and failure screenshots remain ignored. See the [capture process](SCREENSHOTS.md#regenerate-the-gallery).
