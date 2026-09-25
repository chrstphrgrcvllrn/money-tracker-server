const fs = require("fs");
const path = require("path");
const request = require("supertest");
const createApp = require("../app");

const app = createApp();

// Build the list of data routes by reading the source, so a route added later
// is covered automatically instead of relying on someone remembering to add it here.
const readRoutes = () => {
  const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");

  const fileByVar = {};
  for (const [, variable, file] of appSource.matchAll(/const (\w+) = require\("\.\/routes\/(\w+)"\)/g)) {
    fileByVar[variable] = file;
  }

  const routes = [];
  for (const [, base, variable] of appSource.matchAll(/\["(\/api\/[^"]+)", (\w+)\]/g)) {
    const source = fs.readFileSync(path.join(__dirname, "../routes", `${fileByVar[variable]}.js`), "utf8");
    for (const [, method, sub] of source.matchAll(/router\.(get|post|put|patch|delete)\("([^"]*)"/g)) {
      const url = (base + (sub === "/" ? "" : sub))
        .replace(":expenseId", "64b7f0f0f0f0f0f0f0f0f0f1")
        .replace(":id", "64b7f0f0f0f0f0f0f0f0f0f0")
        .replace(":date", "2026-09-24");
      routes.push({ method, url });
    }
  }
  return routes;
};

const routes = readRoutes();

test("discovers every data route (sanity check on the discovery itself)", () => {
  expect(routes.length).toBeGreaterThanOrEqual(55);
  const bases = new Set(routes.map((r) => r.url.split("/").slice(0, 3).join("/")));
  expect([...bases].sort()).toEqual(
    [
      "/api/bills", "/api/calendar-events", "/api/expenses", "/api/house-expenses", "/api/loans",
      "/api/notebook", "/api/notes", "/api/salary", "/api/savings", "/api/subscription",
      "/api/thoughts", "/api/tracker", "/api/water", "/api/watchlist",
    ].sort()
  );
});

describe.each(routes)("$method $url", ({ method, url }) => {
  test("401 without a token", async () => {
    const res = await request(app)[method](url).send({});
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("401 with an invalid token", async () => {
    const res = await request(app)[method](url).set("Authorization", "Bearer not.a.token").send({});
    expect(res.status).toBe(401);
  });
});

test("only /health and the four public auth endpoints work without a token", async () => {
  expect((await request(app).get("/health")).status).toBe(200);
  // these reach their handlers (validation error / missing cookie), not the auth wall
  expect((await request(app).post("/api/auth/register").send({})).status).toBe(400);
  expect((await request(app).post("/api/auth/login").send({})).status).toBe(400);
  expect((await request(app).post("/api/auth/refresh").set("X-Requested-With", "XMLHttpRequest")).status).toBe(401);
  expect((await request(app).post("/api/auth/logout").set("X-Requested-With", "XMLHttpRequest")).status).toBe(204);
});
