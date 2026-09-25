const mongoose = require("mongoose");
const request = require("supertest");
const db = require("./helpers/db");
const { registerUser, authed } = require("./helpers/auth");
const createApp = require("../app");
const { migrate } = require("../scripts/migrate-to-multi-user");
const User = require("../models/User");

const app = createApp();
const OWNER = "chrstphrvllrn";
const OWNER_PASSWORD = "owner-pass-not-8chars-rule-exempt";

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

const quiet = () => {};
const col = (name) => mongoose.connection.collection(name);
const OLD_TIME = new Date("2025-01-01T00:00:00Z");

// Legacy data: documents with NO userId, exactly as they exist today.
const LEGACY = {
  bills: [{ month: "2026-09", bills: [] }, { month: "2026-08", bills: [] }],
  calendars: [{ date: "2026-09-24", type: "event", title: "e" }],
  expenses: [{ text: "coffee", amount: 5, category: "food", done: false }],
  houseexpenses: [{ text: "rice", amount: 50, category: "food", borrowedBy: "mokz" }],
  loans: [{ name: "V4", initialAmount: 1000, transactions: [] }],
  notes: [{ text: "n", category: "work", done: false }],
  notebooknotes: [{ title: "T", content: "c", status: "open" }],
  salaries: [{ date: "2026-09", salary: 100, expenses: [] }],
  savings: [{ name: "S", initialAmount: 1, transactions: [] }],
  subscriptions: [{ name: "Sub", amount: 1, payments: [] }],
  thoughts: [{ text: "hi" }, { text: "there" }],
  trackers: [{ category: "medical", name: "x", date: "2026-09-24" }],
  watches: [{ title: "Show" }],
  waters: [{ date: "2026-09-24", glasses: 4 }],
};

const seedLegacy = async () => {
  for (const [name, docs] of Object.entries(LEGACY)) {
    await col(name).insertMany(docs.map((d) => ({ ...d, createdAt: OLD_TIME, updatedAt: OLD_TIME })));
  }
  // The old single-field unique index on Water.date
  await col("waters").createIndex({ date: 1 }, { unique: true, name: "date_1" });
};

const totalDocs = async () => {
  const counts = {};
  for (const name of Object.keys(LEGACY)) counts[name] = await col(name).countDocuments({});
  return counts;
};

test("--dry-run reports what would change and changes nothing (not even the owner account)", async () => {
  await seedLegacy();
  const before = await totalDocs();
  const lines = [];

  const result = await migrate({ dryRun: true, ownerUsername: OWNER, ownerPassword: OWNER_PASSWORD, log: (l) => lines.push(l) });

  expect(await User.countDocuments()).toBe(0);
  for (const name of Object.keys(LEGACY)) {
    expect(await col(name).countDocuments({ userId: { $exists: true } })).toBe(0);
  }
  expect(await totalDocs()).toEqual(before);
  expect((await col("waters").indexes()).some((i) => i.name === "date_1")).toBe(true); // index untouched

  expect(result.collections.find((c) => c.collection === "Thought")).toMatchObject({ ownerless: 2, updated: 0 });
  expect(lines.join("\n")).toMatch(/DRY RUN/);
  expect(lines.join("\n")).not.toContain(OWNER_PASSWORD);
});

test("assigns every existing document to the owner without deleting or reordering anything", async () => {
  await seedLegacy();
  const before = await totalDocs();

  const result = await migrate({ dryRun: false, ownerUsername: OWNER, ownerPassword: OWNER_PASSWORD, log: quiet });

  const owner = await User.findOne({ username: OWNER });
  expect(owner).not.toBeNull();
  expect(result.ownerCreated).toBe(true);

  for (const name of Object.keys(LEGACY)) {
    // every doc now belongs to the owner, none lost
    expect(await col(name).countDocuments({ userId: owner._id })).toBe(before[name]);
    expect(await col(name).countDocuments({ userId: { $exists: false } })).toBe(0);
    // updatedAt untouched (screens sort by it)
    const docs = await col(name).find({}).toArray();
    docs.forEach((d) => expect(d.updatedAt).toEqual(OLD_TIME));
  }
  expect(await totalDocs()).toEqual(before);
  expect(result.collections.reduce((n, c) => n + c.stillOwnerless, 0)).toBe(0);
});

test("fixes Water's index: old unique(date) is dropped, unique(userId, date) exists", async () => {
  await seedLegacy();
  await migrate({ dryRun: false, ownerUsername: OWNER, ownerPassword: OWNER_PASSWORD, log: quiet });

  const indexes = await col("waters").indexes();
  expect(indexes.some((i) => i.name === "date_1")).toBe(false);
  expect(indexes.find((i) => i.key.userId === 1 && i.key.date === 1)).toMatchObject({ unique: true });
});

test("is idempotent: a second run updates nothing and doesn't touch the owner's password", async () => {
  await seedLegacy();
  await migrate({ dryRun: false, ownerUsername: OWNER, ownerPassword: OWNER_PASSWORD, log: quiet });
  const owner = await User.findOne({ username: OWNER }).select("+passwordHash");

  const second = await migrate({ dryRun: false, ownerUsername: OWNER, ownerPassword: "a-different-password", log: quiet });

  expect(second.ownerCreated).toBe(false);
  expect(second.collections.every((c) => c.updated === 0 && c.ownerless === 0)).toBe(true);
  const after = await User.findOne({ username: OWNER }).select("+passwordHash");
  expect(after.passwordHash).toBe(owner.passwordHash);
  expect(await User.countDocuments()).toBe(1);
});

test("never reassigns documents that already have an owner", async () => {
  const other = await registerUser(app, "someone_else");
  await col("expenses").insertOne({ text: "theirs", amount: 1, userId: new mongoose.Types.ObjectId(other.user.id) });
  await seedLegacy();

  await migrate({ dryRun: false, ownerUsername: OWNER, ownerPassword: OWNER_PASSWORD, log: quiet });

  const theirs = await col("expenses").findOne({ text: "theirs" });
  expect(String(theirs.userId)).toBe(other.user.id);
});

test("needs a password only when the owner account must be created", async () => {
  await expect(migrate({ dryRun: false, ownerUsername: OWNER, log: quiet })).rejects.toThrow(/MIGRATION_OWNER_PASSWORD/);
  expect(await User.countDocuments()).toBe(0);
});

test("end to end: the owner logs in and sees the legacy data; a new user starts empty", async () => {
  await seedLegacy();
  await migrate({ dryRun: false, ownerUsername: OWNER, ownerPassword: OWNER_PASSWORD, log: quiet });

  const login = await request(app).post("/api/auth/login").send({ username: OWNER, password: OWNER_PASSWORD });
  expect(login.status).toBe(200); // password rules don't apply to the migrated account

  const mine = await request(app).get("/api/thoughts").set(authed(login.body.accessToken));
  expect(mine.body.map((t) => t.text).sort()).toEqual(["hi", "there"]);
  expect((await request(app).get("/api/loans").set(authed(login.body.accessToken))).body[0].name).toBe("V4");

  const fresh = await registerUser(app, "brand_new");
  for (const path of ["thoughts", "loans", "expenses", "house-expenses", "notes", "salary", "water"]) {
    expect((await request(app).get(`/api/${path}`).set(authed(fresh.token))).body).toEqual([]);
  }

  // and both can now log water for the same day (the old unique-on-date index is gone)
  await request(app).patch("/api/water/2026-09-24").set(authed(fresh.token)).send({ delta: 1 });
  expect((await request(app).get("/api/water").set(authed(fresh.token))).body[0].glasses).toBe(1);
  expect((await request(app).get("/api/water").set(authed(login.body.accessToken))).body[0].glasses).toBe(4);
});
