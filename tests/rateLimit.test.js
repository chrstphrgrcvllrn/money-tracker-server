const express = require("express");
const request = require("supertest");
const { createAuthLimiter } = require("../middleware/rateLimit");

test("returns 429 in the standard error shape once the limit is exceeded", async () => {
  const app = express();
  app.post("/login", createAuthLimiter({ max: 3 }), (_req, res) => res.json({ ok: true }));

  for (let i = 0; i < 3; i++) expect((await request(app).post("/login")).status).toBe(200);

  const blocked = await request(app).post("/login");
  expect(blocked.status).toBe(429);
  expect(blocked.body.error.code).toBe("RATE_LIMITED");
});

test("the real auth routes are wired to the limiter", () => {
  const source = require("fs").readFileSync(require("path").join(__dirname, "../routes/authRoutes.js"), "utf8");
  expect(source).toMatch(/router\.post\("\/register", limiter/);
  expect(source).toMatch(/router\.post\("\/login", limiter/);
});
