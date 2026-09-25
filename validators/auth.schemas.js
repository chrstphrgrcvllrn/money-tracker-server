const { z } = require("zod");

// Keep these rules identical to the frontend schema (src/schemas/auth.schema.ts).
const username = z
  .string({ error: "Username is required" })
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Use only letters, numbers, underscores and dots")
  .transform((value) => value.toLowerCase());

const newPassword = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const registerSchema = z.object({ username, password: newPassword });

// Login deliberately doesn't apply the registration rules, so the migrated
// owner account (which may predate them) can still sign in.
const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(30).transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password is required").max(72),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(72),
  newPassword,
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
