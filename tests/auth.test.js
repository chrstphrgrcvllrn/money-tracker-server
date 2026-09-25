const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const db = require("./helpers/db");
const { registerUser, authed, XHR } = require("./helpers/auth");
const createApp = require("../app");
const User = require("../models/User");

const app = createApp();

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

const cookieHeader = (setCookie) => setCookie.map((c) => c.split(";")[0]).join("; ");
const refreshCookieOf = (res) => res.headers["set-cookie"].find((c) => c.startsWith("refreshToken="));

describe("POST /api/auth/register", () => {
  test("creates the user, returns access token + user, sets an httpOnly refresh cookie", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "Alice_1", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ username: "alice_1", role: "user" });

    // refresh token: cookie only, never in the body
    expect(JSON.stringify(res.body)).not.toMatch(/refresh/i);
    const cookie = refreshCookieOf(res);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\/api\/auth/);
    expect(cookie).toMatch(/SameSite=Lax/i); // test env; production defaults to None+Secure

    // stored hashed, never plain
    const stored = await User.findOne({ username: "alice_1" }).select("+passwordHash");
    expect(stored.passwordHash).not.toBe("password123");
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  test("username uniqueness is case-insensitive (409)", async () => {
    await registerUser(app, "alice");
    const res = await request(app).post("/api/auth/register").send({ username: "ALICE", password: "password123" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("USERNAME_TAKEN");
  });

  test.each([
    ["too short", { username: "ab", password: "password123" }, "username"],
    ["too long", { username: "a".repeat(31), password: "password123" }, "username"],
    ["bad characters", { username: "bad name!", password: "password123" }, "username"],
    ["short password", { username: "alice", password: "1234567" }, "password"],
    ["password over bcrypt's 72 limit", { username: "alice", password: "x".repeat(73) }, "password"],
    ["missing fields", {}, "username"],
  ])("rejects %s (400 with field details)", async (_label, body, field) => {
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[field]).toEqual(expect.any(String));
  });

  test("accepts dots and underscores, min/max lengths", async () => {
    expect((await request(app).post("/api/auth/register").send({ username: "a.b_c", password: "12345678" })).status).toBe(201);
    expect((await request(app).post("/api/auth/register").send({ username: "x".repeat(30), password: "y".repeat(72) })).status).toBe(201);
  });
});

describe("POST /api/auth/login", () => {
  test("succeeds and is case-insensitive on username", async () => {
    await registerUser(app, "alice", "password123");
    const res = await request(app).post("/api/auth/login").send({ username: "ALICE", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("alice");
    expect(refreshCookieOf(res)).toBeDefined();
  });

  test("wrong password and unknown user give the same 401 message (no enumeration)", async () => {
    await registerUser(app, "alice", "password123");

    const wrongPassword = await request(app).post("/api/auth/login").send({ username: "alice", password: "nope-nope" });
    const unknownUser = await request(app).post("/api/auth/login").send({ username: "ghost", password: "password123" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownUser.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownUser.body);
    expect(wrongPassword.body.error.message).toBe("Invalid username or password");
    expect(unknownUser.headers["set-cookie"]).toBeUndefined();
  });

  test("a legacy short password can still log in (rules apply only at register/change)", async () => {
    const { hashPassword } = require("../utils/password");
    await User.create({ username: "legacy", passwordHash: await hashPassword("abc") });

    const res = await request(app).post("/api/auth/login").send({ username: "legacy", password: "abc" });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/auth/refresh", () => {
  test("rotates the cookie and returns a fresh access token + user", async () => {
    const { cookies, user } = await registerUser(app, "alice");

    const res = await request(app).post("/api/auth/refresh").set(XHR).set("Cookie", cookieHeader(cookies));

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(refreshCookieOf(res)).toBeDefined();
  });

  test("401 without a cookie; 400 without the CSRF header", async () => {
    const { cookies } = await registerUser(app, "alice");

    expect((await request(app).post("/api/auth/refresh").set(XHR)).status).toBe(401);
    expect((await request(app).post("/api/auth/refresh").set("Cookie", cookieHeader(cookies))).status).toBe(400);
  });

  test("401 for a tampered cookie and clears it", async () => {
    const res = await request(app).post("/api/auth/refresh").set(XHR).set("Cookie", "refreshToken=not-a-jwt");

    expect(res.status).toBe(401);
    expect(refreshCookieOf(res)).toMatch(/Expires=Thu, 01 Jan 1970/);
  });

  test("an access token is not accepted as a refresh token", async () => {
    const { token } = await registerUser(app, "alice");

    const res = await request(app).post("/api/auth/refresh").set(XHR).set("Cookie", `refreshToken=${token}`);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  test("clears the cookie with the same attributes it was set with", async () => {
    const res = await request(app).post("/api/auth/logout").set(XHR);

    expect(res.status).toBe(204);
    const cleared = refreshCookieOf(res);
    expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(cleared).toMatch(/Path=\/api\/auth/);
    expect(cleared).toMatch(/HttpOnly/i);
  });
});

describe("GET /api/auth/me", () => {
  test("returns the current user without the hash", async () => {
    const { token } = await registerUser(app, "alice");
    const res = await request(app).get("/api/auth/me").set(authed(token));

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("alice");
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });

  test("401 with no token, a malformed token, or an expired token", async () => {
    const { user } = await registerUser(app, "alice");
    const expired = jwt.sign({ role: "user" }, process.env.JWT_ACCESS_SECRET, { subject: user.id, expiresIn: -10 });

    expect((await request(app).get("/api/auth/me")).status).toBe(401);
    expect((await request(app).get("/api/auth/me").set(authed("garbage"))).status).toBe(401);
    expect((await request(app).get("/api/auth/me").set(authed(expired))).status).toBe(401);
  });
});

describe("PATCH /api/auth/me/password", () => {
  test("wrong current password is a 400 field error (not a 401 that would look like an expired session)", async () => {
    const { token } = await registerUser(app, "alice", "password123");
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set(authed(token))
      .send({ currentPassword: "wrong-one", newPassword: "brand-new-pass" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.currentPassword).toBeDefined();
  });

  test("new password must meet the registration rules", async () => {
    const { token } = await registerUser(app, "alice", "password123");
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set(authed(token))
      .send({ currentPassword: "password123", newPassword: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.newPassword).toBeDefined();
  });

  test("changes the password and invalidates OTHER sessions' refresh tokens, but keeps this one", async () => {
    const first = await registerUser(app, "alice", "password123");
    // a second session (another browser) logs in
    const other = await request(app).post("/api/auth/login").send({ username: "alice", password: "password123" });

    const change = await request(app)
      .patch("/api/auth/me/password")
      .set(authed(first.token))
      .send({ currentPassword: "password123", newPassword: "brand-new-pass" });

    expect(change.status).toBe(200);

    // the session that changed it gets a fresh, working cookie
    const mine = await request(app).post("/api/auth/refresh").set(XHR).set("Cookie", cookieHeader(change.headers["set-cookie"]));
    expect(mine.status).toBe(200);

    // the old cookies (both browsers) are dead
    expect((await request(app).post("/api/auth/refresh").set(XHR).set("Cookie", cookieHeader(first.cookies))).status).toBe(401);
    expect((await request(app).post("/api/auth/refresh").set(XHR).set("Cookie", cookieHeader(other.headers["set-cookie"]))).status).toBe(401);

    // old password no longer works, new one does
    expect((await request(app).post("/api/auth/login").send({ username: "alice", password: "password123" })).status).toBe(401);
    expect((await request(app).post("/api/auth/login").send({ username: "alice", password: "brand-new-pass" })).status).toBe(200);
  });
});

describe("secrets never leak", () => {
  test("no response body or log line contains the password hash, the password, or a token", async () => {
    const logs = [];
    const spies = ["log", "error", "warn", "info"].map((m) =>
      jest.spyOn(console, m).mockImplementation((...args) => logs.push(args.map(String).join(" ")))
    );

    const { token, cookies } = await registerUser(app, "alice", "s3cret-password");
    const bodies = [
      (await request(app).post("/api/auth/login").send({ username: "alice", password: "s3cret-password" })).body,
      (await request(app).post("/api/auth/login").send({ username: "alice", password: "wrong-password" })).body,
      (await request(app).get("/api/auth/me").set(authed(token))).body,
      (await request(app).post("/api/auth/refresh").set(XHR).set("Cookie", cookieHeader(cookies))).body,
    ];

    spies.forEach((s) => s.mockRestore());

    const stored = await User.findOne({ username: "alice" }).select("+passwordHash");
    const everything = JSON.stringify(bodies) + logs.join("\n");
    expect(everything).not.toContain(stored.passwordHash);
    expect(everything).not.toContain("s3cret-password");
    expect(everything).not.toContain("wrong-password");
    expect(logs.join("\n")).not.toContain(token);
    expect(mongoose.models.User.schema.path("passwordHash").options.select).toBe(false);
  });
});
