// The only file that reads process.env. Validates everything up front so a
// missing secret fails loudly at boot instead of at first login.
require("dotenv").config({ quiet: true });
const { z } = require("zod");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32, "must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "must be at least 32 characters"),
  JWT_ACCESS_TTL: z.string().regex(/^\d+[smhd]$/).default("15m"),
  JWT_REFRESH_TTL: z.string().regex(/^\d+[smhd]$/).default("7d"),

  // Comma-separated list of allowed browser origins. Falls back to the
  // pre-existing PROD_FRONTEND_URL / DEV_FRONTEND_URL pair so current
  // deployments keep working.
  CLIENT_ORIGIN: z.string().optional(),
  PROD_FRONTEND_URL: z.string().optional(),
  DEV_FRONTEND_URL: z.string().optional(),

  // "none" is required when the site and the API are on different domains.
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).optional(),

  // One-time migration run at server start (see scripts/run-boot-migration.js).
  // Leave unset in normal operation. "dry-run" only reports; "run" assigns.
  MIGRATE_ON_BOOT: z.enum(["dry-run", "run"]).optional(),
  MIGRATION_OWNER_USERNAME: z.string().optional(),
  MIGRATION_OWNER_PASSWORD: z.string().optional(),

  BCRYPT_COST: z.coerce.number().int().min(4).max(15).default(12),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Names and reasons only, never values.
  const problems = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

const raw = parsed.data;
const isProduction = raw.NODE_ENV === "production";

const durationToMs = (value) => {
  const n = parseInt(value, 10);
  const unit = value.slice(-1);
  return n * { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
};

const clientOrigins = raw.CLIENT_ORIGIN
  ? raw.CLIENT_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : [isProduction ? raw.PROD_FRONTEND_URL : raw.DEV_FRONTEND_URL].filter(Boolean);

const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction,
  port: raw.PORT,
  mongoUri: raw.MONGO_URI,
  jwt: {
    accessSecret: raw.JWT_ACCESS_SECRET,
    refreshSecret: raw.JWT_REFRESH_SECRET,
    accessTtl: raw.JWT_ACCESS_TTL,
    refreshTtl: raw.JWT_REFRESH_TTL,
    refreshTtlMs: durationToMs(raw.JWT_REFRESH_TTL),
  },
  clientOrigins,
  refreshCookie: {
    sameSite: raw.COOKIE_SAME_SITE ?? (isProduction ? "none" : "lax"),
    secure: isProduction,
  },
  migration: {
    mode: raw.MIGRATE_ON_BOOT,
    ownerUsername: raw.MIGRATION_OWNER_USERNAME,
    ownerPassword: raw.MIGRATION_OWNER_PASSWORD,
  },
  bcryptCost: raw.BCRYPT_COST,
  authRateLimitMax: raw.AUTH_RATE_LIMIT_MAX,
};

module.exports = env;
