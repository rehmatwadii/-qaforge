import {
  addEvidence,
  advance,
  buildName,
  buildProfile,
  activeMission,
  type GameState,
} from "./engine";
import { approveExpense, createExpense, expenseBuild } from "./assessments";
export type ApiRequest = {
  method: string;
  endpoint: string;
  token: string;
  body: string;
  headers: string;
};
export function simulateApi(state: GameState, request: ApiRequest) {
  const m = activeMission(state),
    profile = buildProfile(m),
    build = buildName(m);
  let s = advance({ ...state, apiCount: state.apiCount + 1 }, 4);
  let status = 200;
  let data: unknown = {};
  const path = request.endpoint.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
  let body: Record<string, unknown> = {};
  let headers: Record<string, string> = {};
  let kind = "api";
  try {
    headers = JSON.parse(request.headers || "{}");
    if (!headers || Array.isArray(headers) || typeof headers !== "object")
      throw new Error();
  } catch {
    return {
      state: s,
      status: 400,
      data: { error: "Headers must be a JSON object." },
      duration: 12,
    };
  }
  if (request.token !== "nexora-test-token") {
    status = 401;
    data = { error: "Valid bearer authorization is required." };
  } else if (
    ["POST", "PUT", "PATCH"].includes(request.method) &&
    headers["Content-Type"] !== "application/json"
  ) {
    status = 415;
    data = { error: "Set Content-Type to application/json." };
  } else {
    try {
      if (request.body.trim()) {
        const parsed = JSON.parse(request.body);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object")
          throw new Error();
        body = parsed;
      }
    } catch {
      return {
        state: s,
        status: 400,
        data: { error: "Request body must be a valid JSON object." },
        duration: 15,
      };
    }
    if (m.kind === "capstone" && path.startsWith("/api/expenses")) {
      const approve = path.match(/^\/api\/expenses\/(\d+)\/approve$/);
      if (approve && request.method === "POST") {
        const result = approveExpense(s, Number(approve[1]));
        s = result.state;
        status = result.status;
        data = result.data;
      } else if (path === "/api/expenses" && request.method === "GET")
        data = s.expenses.filter((e) => e.requester_id === 123);
      else if (path === "/api/expenses" && request.method === "POST") {
        const amount = Number(body.amount);
        if (!Number.isFinite(amount) || typeof body.category !== "string") {
          status = 422;
          data = { error: "Provide a numeric amount and a category." };
        } else {
          const result = createExpense(s, amount, body.category);
          s = result.state;
          status = result.message.startsWith("Claim rejected") ? 422 : 201;
          data = { message: result.message };
        }
      } else {
        status = 405;
        data = {
          error:
            "Use GET/POST /api/expenses or POST /api/expenses/:id/approve.",
        };
      }
    } else if (path === "/api/profile" || path === "/api/profile/123") {
      if (request.method === "GET") data = { id: 123, ...s.profile };
      else if (["PUT", "PATCH"].includes(request.method)) {
        if (typeof body.name !== "string" || !body.name.trim()) {
          status = 422;
          data = { error: "name is required and must be a nonempty string." };
        } else {
          data = { id: 123, name: body.name, email: s.profile.email };
          if (profile !== 0 && profile !== 2)
            s = { ...s, profile: { ...s.profile, name: body.name } };
        }
      } else {
        status = 405;
        data = { error: "Allowed methods: GET, PUT, PATCH" };
      }
    } else if (path === "/api/profile/124") {
      if (profile === 0 || profile === 3) {
        data = {
          id: 124,
          name: "Sam Khan",
          email: "sam@example.test",
          balance: 72000,
        };
        kind = "idor";
      } else {
        status = 403;
        data = { error: "This profile belongs to another account." };
      }
    } else if (path === "/api/payments") {
      if (request.method === "GET") data = s.transactions;
      else if (request.method === "POST") {
        const amount = Number(body.amount);
        if (
          !Number.isFinite(amount) ||
          amount <= 0 ||
          typeof body.order_id !== "string" ||
          !body.order_id.trim()
        ) {
          status = 422;
          data = { error: "Provide a positive amount and an order_id string." };
        } else {
          const existing = s.transactions.find(
            (t) => t.order_id === body.order_id && t.status === "success",
          );
          if (existing && profile !== 0 && profile !== 2) {
            data = { ...existing, reused: true };
          } else {
            const transaction = {
              id: Math.max(1000, ...s.transactions.map((t) => t.id)) + 1,
              order_id: String(body.order_id),
              customer_id: 123,
              amount,
              status: "success",
            };
            s = { ...s, transactions: [...s.transactions, transaction] };
            status = 201;
            data = transaction;
            if (existing) kind = "duplicate";
          }
        }
      } else {
        status = 405;
        data = { error: "Allowed methods: GET, POST" };
      }
    } else if (path === "/api/health") {
      data = {
        status: "ok",
        build: m.kind === "capstone" ? expenseBuild(s) : build,
      };
    } else {
      status = 404;
      data = { error: "Resource not found." };
    }
  }
  const detail = `${request.method} ${path} → ${status}\n${JSON.stringify(data)} · build ${m.kind === "capstone" ? expenseBuild(s) : build}`;
  if (
    request.method === "GET" &&
    path === "/api/profile" &&
    (profile === 0 || profile === 2)
  ) {
    const write = s.apiHistory.find(
      (h) =>
        (h.startsWith("PUT /api/profile → 200") ||
          h.startsWith("PATCH /api/profile → 200")) &&
        h.includes(`build ${build}`),
    );
    if (write) {
      try {
        const written = JSON.parse(write.split("\n")[1].split(" · build ")[0]);
        if (written.name !== s.profile.name) kind = "profile";
      } catch {
        /* An incomplete historical response is not evidence of a mismatch. */
      }
    }
  }
  s = addEvidence(
    { ...s, apiHistory: [detail, ...s.apiHistory].slice(0, 50) },
    kind,
    detail,
  );
  return {
    state: s,
    status,
    data,
    duration: status >= 500 ? 2100 : 76 + (s.apiCount % 7) * 19,
  };
}
export const automationStarter = `test('login smoke', async ({ page }) => {\n  await page.goto('/login');\n  // Enter credentials, submit, and assert the dashboard.\n});`;
export const automationSolution = `test('login smoke', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByLabel('Email').fill('alex@nexora.test');\n  await page.getByLabel('Password').fill('Nexora123!');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();\n});`;
export function runAutomation(code: string, expenseState?: GameState) {
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));
  const logs: string[] = [];
  let url = "",
    email = "",
    password = "",
    signedIn = false,
    asserted = false;
  let errors = 0;
  let totalAsserted = false;
  for (const line of lines) {
    if (
      /^test\(['"].*async\s*\(\{\s*page\s*\}\)\s*=>\s*\{$/.test(line) ||
      /^\}\);?$/.test(line)
    )
      continue;
    let match = line.match(/^await page\.goto\(['"]([^'"]+)['"]\);?$/);
    if (match) {
      url = match[1];
      logs.push(`NAVIGATE ${url}`);
      continue;
    }
    if (expenseState) {
      const mounted = url === "/expenses";
      if (
        /^await expect\(page\.getByRole\(['"]heading['"],\s*\{\s*name:\s*['"]My expenses['"]\s*\}\)\)\.toBeVisible\(\);?$/.test(
          line,
        )
      ) {
        asserted = true;
        logs.push(
          mounted
            ? "PASS My expenses is visible"
            : "FAIL Expense page is not mounted",
        );
        if (!mounted) errors++;
        continue;
      }
      match = line.match(
        /^await expect\(page\.getByTestId\(['"]expense-total['"]\)\)\.toHaveText\(['"]([^'"]+)['"]\);?$/,
      );
      if (match) {
        totalAsserted = true;
        const ledgerTotal = expenseState.expenses
          .filter((e) => e.requester_id === 123 && e.status === "pending")
          .reduce((sum, e) => sum + e.amount, 0);
        const actual = `PKR ${(expenseState.expenseFixed ? ledgerTotal : 19300).toLocaleString("en-US")}`;
        const expected = `PKR ${ledgerTotal.toLocaleString("en-US")}`;
        const ok = mounted && match[1] === actual && match[1] === expected;
        logs.push(
          ok
            ? "PASS Pending total matches current ledger"
            : `FAIL Pending total: rendered ${actual}; ledger ${expected}; assertion ${match[1]}`,
        );
        if (!ok) errors++;
        continue;
      }
      logs.push(`UNSUPPORTED: ${line}`);
      errors++;
      continue;
    }
    match = line.match(
      /^await page\.getByLabel\(['"](Email|Password)['"]\)\.fill\(['"]([^'"]*)['"]\);?$/i,
    );
    if (match) {
      if (url !== "/login") {
        logs.push("FAIL: login form is not mounted; navigate to /login first.");
        errors++;
      } else if (match[1].toLowerCase() === "email") email = match[2];
      else password = match[2];
      logs.push(
        `FILL ${match[1]} ${match[1].toLowerCase() === "password" ? "••••••••" : match[2]}`,
      );
      continue;
    }
    if (
      /^await page\.getByRole\(['"]button['"],\s*\{\s*name:\s*['"]Sign in['"]\s*\}\)\.click\(\);?$/.test(
        line,
      )
    ) {
      signedIn =
        url === "/login" &&
        email === "alex@nexora.test" &&
        password === "Nexora123!";
      logs.push(
        signedIn
          ? "CLICK Sign in → dashboard mounted"
          : "CLICK Sign in → authentication rejected",
      );
      continue;
    }
    if (
      /^await expect\(page\.getByRole\(['"]heading['"],\s*\{\s*name:\s*['"]Dashboard['"]\s*\}\)\)\.toBeVisible\(\);?$/.test(
        line,
      )
    ) {
      asserted = true;
      logs.push(
        signedIn
          ? "PASS Dashboard is visible"
          : "FAIL Expected Dashboard to be visible",
      );
      if (!signedIn) errors++;
      continue;
    }
    if (line.includes("waitForTimeout")) {
      logs.push(
        "FAIL Hardcoded wait is not an observable readiness condition.",
      );
      errors++;
      continue;
    }
    logs.push(`UNSUPPORTED: ${line}`);
    errors++;
  }
  if (!asserted) {
    logs.push(
      expenseState
        ? "FAIL No expense heading assertion was executed."
        : "FAIL No supported dashboard visibility assertion was executed.",
    );
    errors++;
  }
  if (expenseState && !totalAsserted) {
    logs.push("FAIL No pending total assertion was executed.");
    errors++;
  }
  return {
    passed:
      errors === 0 && asserted && (expenseState ? totalAsserted : signedIn),
    logs,
  };
}
export const sqlTargets = [
  {
    title: "Find orders with more than one successful payment.",
    hint: "Return order_id and the payment count. Exclude failed payments.",
    query:
      "SELECT order_id, COUNT(*) AS charges FROM transactions WHERE status = 'success' GROUP BY order_id HAVING COUNT(*) > 1",
  },
  {
    title: "Calculate successful payment totals for each customer.",
    hint: "Return customer_id and total amount, one row per customer.",
    query:
      "SELECT customer_id, SUM(amount) AS total FROM transactions WHERE status = 'success' GROUP BY customer_id",
  },
  {
    title: "Find orders without any successful payment.",
    hint: "Return order IDs from orders using a LEFT JOIN or NOT EXISTS.",
    query:
      "SELECT o.order_id FROM orders o WHERE NOT EXISTS (SELECT 1 FROM transactions t WHERE t.order_id = o.order_id AND t.status = 'success')",
  },
  {
    title: "Find the three largest successful transactions.",
    hint: "Return id and amount, sorted by amount descending, then id ascending.",
    query:
      "SELECT id, amount FROM transactions WHERE status = 'success' ORDER BY amount DESC, id ASC LIMIT 3",
  },
  {
    title: "Calculate the number and total amount of failed payments.",
    hint: "Return a single row with count and total amount.",
    query:
      "SELECT COUNT(*) AS failed_count, SUM(amount) AS failed_total FROM transactions WHERE status = 'failed'",
  },
];
