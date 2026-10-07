importScripts("/sql-wasm.js");
const ready = initSqlJs({ locateFile: (file) => "/" + file });
self.onmessage = async ({ data }) => {
  let db;
  try {
    const SQL = await ready;
    db = new SQL.Database();
    db.run(
      "CREATE TABLE transactions (id INTEGER PRIMARY KEY, order_id TEXT, customer_id INTEGER, amount REAL, status TEXT); CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, balance REAL); CREATE TABLE orders (order_id TEXT PRIMARY KEY, customer_id INTEGER, total REAL);",
    );
    db.run(
      "INSERT INTO customers VALUES (123, 'Alex Morgan', 42500), (124, 'Sam Khan', 72000); INSERT INTO orders VALUES ('ORD-1041',123,2500),('ORD-1042',123,5000),('ORD-1043',124,1200),('ORD-1044',124,7500),('ORD-1045',123,8000)",
    );
    const insert = db.prepare(
      "INSERT INTO transactions VALUES (?, ?, ?, ?, ?)",
    );
    data.transactions.forEach((t) =>
      insert.run([t.id, t.order_id, t.customer_id, t.amount, t.status]),
    );
    insert.free();
    db.run(
      "CREATE TABLE expenses (id INTEGER PRIMARY KEY, requester_id INTEGER, amount REAL, category TEXT, status TEXT)",
    );
    const insertExpense = db.prepare(
      "INSERT INTO expenses VALUES (?, ?, ?, ?, ?)",
    );
    (data.expenses || []).forEach((e) =>
      insertExpense.run([e.id, e.requester_id, e.amount, e.category, e.status]),
    );
    insertExpense.free();
    db.run("PRAGMA query_only=ON");
    if (!/^\s*(SELECT|WITH)\b/i.test(data.query))
      throw Error("This workspace is read only. Start with SELECT or WITH.");
    const results = db.exec(data.query);
    const expected = db.exec(data.target);
    const normalize = (r) =>
      JSON.stringify(
        (r[0]?.values || []).map((row) => JSON.stringify(row)).sort(),
      );
    self.postMessage({
      results,
      correct:
        results.length === 1 && normalize(results) === normalize(expected),
    });
  } catch (e) {
    self.postMessage({ error: e.message });
  } finally {
    if (db) db.close();
  }
};
