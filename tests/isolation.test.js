const request = require("supertest");
const db = require("./helpers/db");
const { registerUser, authed } = require("./helpers/auth");
const createApp = require("../app");

const app = createApp();

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

const send = (method, url, token, body) => {
  const req = request(app)[method](url).set(authed(token));
  return body === undefined ? req : req.send(body);
};

// Each resource: how to create a record, which list to read, and every
// operation that targets a record by id (which must 404 for a non-owner).
// `ctx` holds ids captured from A's create response.
const RESOURCES = [
  {
    name: "notes",
    base: "/api/notes",
    create: { text: "secret note", category: "work" },
    ops: [
      { method: "patch", path: (c) => `/api/notes/${c.id}`, ok: 200 }, // toggle
      { method: "delete", path: (c) => `/api/notes/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "loans",
    base: "/api/loans",
    create: { name: "Secret Loan", initialAmount: 500 },
    ops: [
      { method: "put", path: (c) => `/api/loans/${c.id}`, body: { name: "hacked" }, ok: 200 },
      { method: "post", path: (c) => `/api/loans/${c.id}/transactions`, body: { amount: -50 }, ok: 201 },
    ],
  },
  {
    name: "salary",
    base: "/api/salary",
    create: { date: "2026-09", salary: 1000, expenses: [{ name: "rent", amount: 300 }] },
    child: (created) => ({ expenseId: created.expenses[0]._id }),
    ops: [
      { method: "put", path: (c) => `/api/salary/${c.id}`, body: { salary: 1 }, ok: 200 },
      { method: "post", path: (c) => `/api/salary/${c.id}/expense`, body: { name: "x", amount: 1 }, ok: 200 },
      { method: "put", path: (c) => `/api/salary/${c.id}/expense/${c.expenseId}`, body: { name: "y", amount: 2 }, ok: 200 },
      { method: "delete", path: (c) => `/api/salary/${c.id}/expense/${c.expenseId}`, ok: 200 },
      { method: "delete", path: (c) => `/api/salary/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "bills",
    base: "/api/bills",
    create: { month: "2026-09", bills: [{ name: "power", amount: 10, dueDate: "2026-09-30" }] },
    ops: [
      { method: "put", path: (c) => `/api/bills/${c.id}`, body: { month: "hacked" }, ok: 200 },
      { method: "delete", path: (c) => `/api/bills/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "savings",
    base: "/api/savings",
    create: { name: "Secret Savings", initialAmount: 100 },
    ops: [
      { method: "post", path: (c) => `/api/savings/${c.id}/transactions`, body: { date: "2026-09-24", amount: 5 }, ok: 200 },
      { method: "delete", path: (c) => `/api/savings/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "expenses",
    base: "/api/expenses",
    create: { text: "secret expense", amount: 12 },
    ops: [
      { method: "put", path: (c) => `/api/expenses/${c.id}`, body: { text: "hacked" }, ok: 200 },
      { method: "patch", path: (c) => `/api/expenses/${c.id}/toggle`, ok: 200 },
      { method: "delete", path: (c) => `/api/expenses/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "house-expenses",
    base: "/api/house-expenses",
    create: { text: "secret house", amount: 12, borrowedBy: "mokz" },
    ops: [
      { method: "put", path: (c) => `/api/house-expenses/${c.id}`, body: { text: "hacked" }, ok: 200 },
      { method: "patch", path: (c) => `/api/house-expenses/${c.id}/toggle`, ok: 200 },
      { method: "delete", path: (c) => `/api/house-expenses/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "calendar-events",
    base: "/api/calendar-events",
    create: { date: "2026-09-24", type: "event", title: "secret event" },
    ops: [],
  },
  {
    name: "thoughts",
    base: "/api/thoughts",
    create: { text: "secret thought" },
    ops: [],
  },
  {
    name: "watchlist",
    base: "/api/watchlist",
    create: { title: "Secret Show" },
    ops: [
      { method: "patch", path: (c) => `/api/watchlist/${c.id}`, body: { title: "hacked" }, ok: 200 },
      { method: "delete", path: (c) => `/api/watchlist/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "subscription",
    base: "/api/subscription",
    create: { name: "Secret Sub", amount: 9, billing: "monthly" },
    ops: [
      { method: "put", path: (c) => `/api/subscription/${c.id}`, body: { name: "hacked" }, ok: 200 },
      { method: "post", path: (c) => `/api/subscription/${c.id}/payment`, body: { date: "2026-09-24", amount: 9 }, ok: 201 },
      { method: "delete", path: (c) => `/api/subscription/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "notebook",
    base: "/api/notebook",
    create: { title: "Secret Notebook", content: "shh" },
    ops: [
      { method: "get", path: (c) => `/api/notebook/${c.id}`, ok: 200 },
      { method: "patch", path: (c) => `/api/notebook/${c.id}`, body: { title: "hacked" }, ok: 200 },
      { method: "patch", path: (c) => `/api/notebook/${c.id}/toggle`, ok: 200 },
      { method: "delete", path: (c) => `/api/notebook/${c.id}`, ok: 200 },
    ],
  },
  {
    name: "tracker",
    base: "/api/tracker",
    create: { category: "medical", name: "Secret Checkup", date: "2026-09-24" },
    ops: [
      { method: "put", path: (c) => `/api/tracker/${c.id}`, body: { name: "hacked" }, ok: 200 },
      { method: "delete", path: (c) => `/api/tracker/${c.id}`, ok: 200 },
    ],
  },
];

const setup = async (resource) => {
  const a = await registerUser(app, "user_a");
  const b = await registerUser(app, "user_b");

  const created = await send("post", resource.base, a.token, resource.create);
  expect([200, 201]).toContain(created.status);
  const ctx = { id: created.body._id, ...(resource.child ? resource.child(created.body) : {}) };
  expect(ctx.id).toBeDefined();

  return { a, b, ctx };
};

describe.each(RESOURCES)("$name is private to its owner", (resource) => {
  test("owner sees it; another user's list is empty and never contains it", async () => {
    const { a, b, ctx } = await setup(resource);

    const own = await send("get", resource.base, a.token);
    expect(own.status).toBe(200);
    expect(own.body.map((d) => d._id)).toContain(ctx.id);

    const theirs = await send("get", resource.base, b.token);
    expect(theirs.status).toBe(200);
    expect(theirs.body).toEqual([]);
    expect(JSON.stringify(theirs.body)).not.toContain(ctx.id);
  });

  test("another user gets 404 (not 403, not 200) for every id-based operation, and nothing changes", async () => {
    const { a, b, ctx } = await setup(resource);
    const before = await send("get", resource.base, a.token);

    for (const op of resource.ops) {
      const res = await send(op.method, op.path(ctx), b.token, op.body);
      expect({ op: `${op.method} ${op.path(ctx)}`, status: res.status }).toEqual({
        op: `${op.method} ${op.path(ctx)}`,
        status: 404,
      });
    }

    // the owner's data is exactly as it was
    const after = await send("get", resource.base, a.token);
    expect(after.body).toEqual(before.body);
  });

  test("the owner's own operations do work (so the 404s above aren't vacuous)", async () => {
    const { a, ctx } = await setup(resource);

    for (const op of resource.ops) {
      const res = await send(op.method, op.path(ctx), a.token, op.body);
      expect({ op: `${op.method} ${op.path(ctx)}`, status: res.status }).toEqual({
        op: `${op.method} ${op.path(ctx)}`,
        status: op.ok,
      });
    }
  });

  test("a body can't choose its owner: userId in create/update is ignored", async () => {
    const a = await registerUser(app, "user_a");
    const b = await registerUser(app, "user_b");

    // B tries to create a record owned by A
    const forged = await send("post", resource.base, b.token, { ...resource.create, userId: a.user.id });
    expect([200, 201]).toContain(forged.status);
    expect(String(forged.body.userId)).toBe(b.user.id);

    expect((await send("get", resource.base, a.token)).body).toEqual([]);
    expect((await send("get", resource.base, b.token)).body).toHaveLength(1);

    // and can't reassign an existing record by sending userId in an update
    const update = resource.ops.find((op) => ["put", "patch"].includes(op.method) && op.body);
    if (update) {
      const ctx = { id: forged.body._id, ...(resource.child ? resource.child(forged.body) : {}) };
      await send(update.method, update.path(ctx), b.token, { ...update.body, userId: a.user.id });
      expect((await send("get", resource.base, a.token)).body).toEqual([]);
    }
  });
});

describe("malformed ids", () => {
  test("a non-ObjectId id is a 404 for everyone", async () => {
    const a = await registerUser(app, "user_a");
    for (const [method, url] of [
      ["put", "/api/loans/not-an-id"],
      ["delete", "/api/notes/123"],
      ["get", "/api/notebook/xyz"],
      ["patch", "/api/expenses/nope/toggle"],
    ]) {
      expect((await send(method, url, a.token, {})).status).toBe(404);
    }
  });
});

describe("water (keyed by date, unique per user + date)", () => {
  test("two users can log the same day independently; counts and history don't mix", async () => {
    const a = await registerUser(app, "user_a");
    const b = await registerUser(app, "user_b");

    for (let i = 0; i < 3; i++) await send("patch", "/api/water/2026-09-24", a.token, { delta: 1 });
    await send("patch", "/api/water/2026-09-24", b.token, { delta: 1 });

    expect((await send("get", "/api/water", a.token)).body).toMatchObject([{ date: "2026-09-24", glasses: 3 }]);
    expect((await send("get", "/api/water", b.token)).body).toMatchObject([{ date: "2026-09-24", glasses: 1 }]);

    // decrementing never goes below zero and never touches the other user
    for (let i = 0; i < 5; i++) await send("patch", "/api/water/2026-09-24", b.token, { delta: -1 });
    expect((await send("get", "/api/water", b.token)).body[0].glasses).toBe(0);
    expect((await send("get", "/api/water", a.token)).body[0].glasses).toBe(3);
  });

  test("a user with no logs gets an empty history", async () => {
    const a = await registerUser(app, "user_a");
    const b = await registerUser(app, "user_b");
    await send("patch", "/api/water/2026-09-24", a.token, { delta: 1 });

    expect((await send("get", "/api/water", b.token)).body).toEqual([]);
  });
});

describe("subscription payment route with subId in the body", () => {
  test("PATCH /payment can't reach another user's subscription", async () => {
    const a = await registerUser(app, "user_a");
    const b = await registerUser(app, "user_b");

    const sub = (await send("post", "/api/subscription", a.token, { name: "S", amount: 5, billing: "monthly" })).body;
    const withPayment = (await send("post", `/api/subscription/${sub._id}/payment`, a.token, { date: "2026-09-24", amount: 5 })).body;
    const paymentId = withPayment.payments[0]._id;

    const attack = await send("patch", "/api/subscription/payment", b.token, { subId: sub._id, paymentId, status: "paid" });
    expect(attack.status).toBe(404);

    const mine = await send("patch", "/api/subscription/payment", a.token, { subId: sub._id, paymentId, status: "paid" });
    expect(mine.status).toBe(200);
    expect(mine.body.payments[0].status).toBe("paid");

    expect((await send("patch", "/api/subscription/payment", b.token, { subId: "nope", paymentId })).status).toBe(404);
  });
});

describe("counts and totals only reflect the user's own records", () => {
  test("a user's list length is their own even when others have many records", async () => {
    const a = await registerUser(app, "user_a");
    const b = await registerUser(app, "user_b");

    for (let i = 0; i < 5; i++) await send("post", "/api/expenses", a.token, { text: `e${i}`, amount: i + 1 });
    await send("post", "/api/expenses", b.token, { text: "only", amount: 7 });

    expect((await send("get", "/api/expenses", a.token)).body).toHaveLength(5);
    const bList = (await send("get", "/api/expenses", b.token)).body;
    expect(bList).toHaveLength(1);
    expect(bList.reduce((sum, e) => sum + e.amount, 0)).toBe(7);
  });
});
