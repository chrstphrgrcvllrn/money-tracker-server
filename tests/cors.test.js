const request = require("supertest");
const createApp = require("../app");

const app = createApp();
const ORIGIN = "http://localhost:5174"; // CLIENT_ORIGIN in tests/setup.env.js

describe("CORS", () => {
  test("preflight from the allowed origin permits credentials and the auth headers", async () => {
    const res = await request(app)
      .options("/api/expenses")
      .set("Origin", ORIGIN)
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "authorization,x-requested-with");

    expect(res.status).toBeLessThan(300);
    expect(res.headers["access-control-allow-origin"]).toBe(ORIGIN);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.headers["access-control-allow-headers"]).toMatch(/authorization/i);
    expect(res.headers["access-control-allow-headers"]).toMatch(/x-requested-with/i);
  });

  test("a different origin gets no CORS permission", async () => {
    const res = await request(app)
      .options("/api/expenses")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    expect(res.headers["access-control-allow-credentials"]).toBeUndefined();
  });

  test("the refresh endpoint is unusable cross-origin without the custom header (CSRF defence)", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Origin", "https://evil.example")
      .set("Cookie", "refreshToken=whatever");

    expect(res.status).toBe(400);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("refresh cookie settings by environment (config/env.js)", () => {
  // env.js reads process.env once at import, so load a fresh copy per case.
  const loadEnv = (overrides) => {
    const saved = { ...process.env };
    Object.assign(process.env, overrides);
    for (const [key, value] of Object.entries(overrides)) if (value === undefined) delete process.env[key];
    let loaded;
    jest.isolateModules(() => {
      loaded = require("../config/env");
    });
    process.env = saved;
    return loaded;
  };

  test("production defaults to Secure + SameSite=None (site and API on different domains)", () => {
    const env = loadEnv({ NODE_ENV: "production", COOKIE_SAME_SITE: undefined });
    expect(env.refreshCookie).toEqual({ sameSite: "none", secure: true });
  });

  test("development defaults to SameSite=Lax without Secure (plain http://localhost)", () => {
    const env = loadEnv({ NODE_ENV: "development", COOKIE_SAME_SITE: undefined });
    expect(env.refreshCookie).toEqual({ sameSite: "lax", secure: false });
  });

  test("COOKIE_SAME_SITE=strict can be forced when site and API share a domain", () => {
    const env = loadEnv({ NODE_ENV: "production", COOKIE_SAME_SITE: "strict" });
    expect(env.refreshCookie).toEqual({ sameSite: "strict", secure: true });
  });

  test("falls back to PROD_FRONTEND_URL in production when CLIENT_ORIGIN isn't set (existing deployments)", () => {
    const env = loadEnv({ NODE_ENV: "production", CLIENT_ORIGIN: undefined, PROD_FRONTEND_URL: "https://my-site.example" });
    expect(env.clientOrigins).toEqual(["https://my-site.example"]);
  });

  test("boot fails loudly (naming the variable, not its value) when a secret is missing or too short", () => {
    expect(() => loadEnv({ JWT_ACCESS_SECRET: "too-short" })).toThrow(/JWT_ACCESS_SECRET/);
    expect(() => loadEnv({ JWT_ACCESS_SECRET: "too-short" })).not.toThrow(/too-short/);
  });
});
